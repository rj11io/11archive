#!/usr/bin/env node

import { createHash } from "node:crypto"
import {
  copyFile,
  lstat,
  mkdir,
  readFile,
  readdir,
  realpath,
  writeFile,
} from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const MAX_BYTES = {
  data: 10 * 1024 * 1024,
  html: 5 * 1024 * 1024,
  markdown: 2 * 1024 * 1024,
}

function sha256(value) {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`
}

function isRelativeMarkdownTarget(value) {
  const target = value.trim().replace(/^<|>$/g, "")
  if (
    !target ||
    target.startsWith("#") ||
    target.startsWith("/") ||
    target.startsWith("//") ||
    /^[a-z][a-z0-9+.-]*:/i.test(target)
  ) {
    return false
  }
  return target.split(/[?#]/, 1)[0].toLowerCase().endsWith(".md")
}

export function normalizeHtmlLinks(html, hasMarkdown) {
  if (!hasMarkdown) return html
  return html.replace(
    /(\bhref\s*=\s*)(["'])([^"']+)\2/gi,
    (match, prefix, quote, target) =>
      isRelativeMarkdownTarget(target)
        ? `${prefix}${quote}/?view=markdown${quote}`
        : match
  )
}

export function normalizeMarkdownLinks(markdown) {
  return markdown.replace(
    /(?<!!)\[([^\]]+)\]\(([^)]+)\)/g,
    (match, label, target) =>
      isRelativeMarkdownTarget(target) ? label : match
  )
}

function markdownRank(name) {
  const upper = name.toUpperCase()
  if (upper === "README.MD") return [0, name]
  if (/^\d+[-_]/.test(name)) return [1, name]
  if (upper === "GLOSSARY.MD") return [2, name]
  if (upper === "SOURCES.MD") return [3, name]
  return [4, name]
}

export function orderMarkdown(names) {
  return [...names].sort((left, right) => {
    const [leftRank, leftName] = markdownRank(left)
    const [rightRank, rightName] = markdownRank(right)
    return leftRank - rightRank || leftName.localeCompare(rightName, "en")
  })
}

async function inspectRegularFile(filePath, label, limit) {
  const info = await lstat(filePath)
  if (!info.isFile() || info.isSymbolicLink()) {
    throw new Error(`${label} must be a regular file: ${filePath}`)
  }
  if (info.size > limit) {
    throw new Error(`${label} exceeds ${limit} bytes: ${filePath}`)
  }
  return info
}

export async function validateReportsRepo(environment = process.env) {
  const configured = environment.ELEVEN_REPORTS_REPO
  if (!configured) throw new Error("ELEVEN_REPORTS_REPO is required")
  if (!path.isAbsolute(configured)) {
    throw new Error("ELEVEN_REPORTS_REPO must be an absolute path")
  }
  const repo = await realpath(configured)
  const info = await lstat(repo)
  if (!info.isDirectory() || info.isSymbolicLink()) {
    throw new Error("ELEVEN_REPORTS_REPO must identify a directory")
  }
  await inspectRegularFile(
    path.join(repo, "v0", "www", "scripts", "11reports.mjs"),
    "11reports engine",
    2 * 1024 * 1024
  )
  return repo
}

async function inventorySource(source) {
  const sourceInfo = await lstat(source)
  if (!sourceInfo.isDirectory() || sourceInfo.isSymbolicLink()) {
    throw new Error(`Source must be a regular directory: ${source}`)
  }

  const entries = await readdir(source, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    if (entry.name === ".DS_Store") continue
    const filePath = path.join(source, entry.name)
    const info = await lstat(filePath)
    if (!entry.isFile() || info.isSymbolicLink()) {
      throw new Error(`Unsupported source entry: ${filePath}`)
    }
    files.push(entry.name)
  }

  const html = files.filter((name) => name.toLowerCase().endsWith(".html"))
  const markdown = files.filter((name) => name.toLowerCase().endsWith(".md"))
  const data = files.filter((name) => name === "data.json")
  const supported = new Set([...html, ...markdown, ...data])
  const unsupported = files.filter((name) => !supported.has(name))

  if (unsupported.length) {
    throw new Error(`Unsupported report files: ${unsupported.join(", ")}`)
  }
  if (html.length > 1) {
    throw new Error(`Source contains multiple HTML files: ${html.join(", ")}`)
  }
  if (data.length > 1) {
    throw new Error("Source contains multiple data.json files")
  }
  if (!html.length && !markdown.length && !data.length) {
    throw new Error("Source contains no report artifacts")
  }

  return { html: html[0], markdown: orderMarkdown(markdown), data: data[0] }
}

export async function prepareReport(sourceValue, outputValue) {
  const source = await realpath(path.resolve(sourceValue))
  const output = path.resolve(outputValue)
  const relativeOutput = path.relative(source, output)
  if (relativeOutput === "" || (!relativeOutput.startsWith("..") && !path.isAbsolute(relativeOutput))) {
    throw new Error("Output must be outside the source directory")
  }
  if (await lstat(output).catch(() => null)) {
    throw new Error(`Output already exists: ${output}`)
  }

  const inventory = await inventorySource(source)
  await mkdir(path.dirname(output), { recursive: true })
  await mkdir(output)

  const result = { source, output, artifacts: {}, sourceFiles: [] }

  if (inventory.html) {
    const sourceHtml = path.join(source, inventory.html)
    await inspectRegularFile(sourceHtml, "HTML", MAX_BYTES.html)
    const input = await readFile(sourceHtml)
    const normalized = normalizeHtmlLinks(
      input.toString("utf8"),
      inventory.markdown.length > 0
    )
    const value = Buffer.from(normalized, "utf8")
    if (value.byteLength > MAX_BYTES.html) {
      throw new Error(`Prepared HTML exceeds ${MAX_BYTES.html} bytes`)
    }
    await writeFile(path.join(output, "report.html"), value, { flag: "wx" })
    result.artifacts.html = {
      path: "report.html",
      bytes: value.byteLength,
      sha256: sha256(value),
      source: inventory.html,
      adapted: !input.equals(value),
    }
    result.sourceFiles.push({
      path: inventory.html,
      bytes: input.byteLength,
      sha256: sha256(input),
    })
  }

  if (inventory.markdown.length) {
    const sections = []
    for (const name of inventory.markdown) {
      const filePath = path.join(source, name)
      await inspectRegularFile(filePath, "Markdown", MAX_BYTES.markdown)
      const value = await readFile(filePath)
      result.sourceFiles.push({
        path: name,
        bytes: value.byteLength,
        sha256: sha256(value),
      })
      sections.push(
        `<!-- 11archive-source: ${name} -->\n\n${normalizeMarkdownLinks(value.toString("utf8")).trimEnd()}`
      )
    }
    const combined = Buffer.from(`${sections.join("\n\n---\n\n")}\n`, "utf8")
    if (combined.byteLength > MAX_BYTES.markdown) {
      throw new Error(`Prepared Markdown exceeds ${MAX_BYTES.markdown} bytes`)
    }
    await writeFile(path.join(output, "report.md"), combined, { flag: "wx" })
    result.artifacts.markdown = {
      path: "report.md",
      bytes: combined.byteLength,
      sha256: sha256(combined),
      sources: inventory.markdown,
      adapted: true,
    }
  }

  if (inventory.data) {
    const sourceData = path.join(source, inventory.data)
    const info = await inspectRegularFile(sourceData, "data.json", MAX_BYTES.data)
    const value = await readFile(sourceData)
    JSON.parse(value.toString("utf8"))
    await copyFile(sourceData, path.join(output, "data.json"))
    result.artifacts.data = {
      path: "data.json",
      bytes: info.size,
      sha256: sha256(value),
      source: inventory.data,
      adapted: false,
    }
    result.sourceFiles.push({
      path: inventory.data,
      bytes: value.byteLength,
      sha256: sha256(value),
    })
  }

  result.sourceFiles.sort((left, right) => left.path.localeCompare(right.path, "en"))
  return result
}

function usage() {
  return "Usage: prepare-report.mjs <source-directory> <new-output-directory> [--check-engine] [--json]"
}

async function main() {
  const args = process.argv.slice(2)
  const checkEngine = args.includes("--check-engine")
  const json = args.includes("--json")
  const positional = args.filter((value) => !value.startsWith("--"))
  if (positional.length !== 2) throw new Error(usage())
  const repo = checkEngine ? await validateReportsRepo() : undefined
  const result = await prepareReport(positional[0], positional[1])
  const payload = repo ? { ...result, reportsRepo: repo } : result
  if (json) console.log(JSON.stringify(payload, null, 2))
  else {
    console.log(`Prepared report: ${result.output}`)
    for (const artifact of Object.values(result.artifacts)) {
      console.log(`${artifact.path}: ${artifact.bytes} bytes`)
    }
  }
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))

if (isMain) {
  main().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
}
