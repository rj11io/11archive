import assert from "node:assert/strict"
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import test from "node:test"

import {
  normalizeHtmlLinks,
  orderMarkdown,
  prepareReport,
  validateReportsRepo,
} from "./prepare-report.mjs"

async function fixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), "11archive-report-test-"))
  const source = path.join(root, "source")
  await mkdir(source)
  return { root, source, output: path.join(root, "prepared") }
}

test("orders report Markdown predictably", () => {
  assert.deepEqual(
    orderMarkdown(["SOURCES.md", "02-two.md", "README.md", "GLOSSARY.md", "01-one.md"]),
    ["README.md", "01-one.md", "02-two.md", "GLOSSARY.md", "SOURCES.md"]
  )
})

test("normalizes only relative Markdown links in HTML", () => {
  const html = '<a href="GLOSSARY.md">Glossary</a><a href="https://example.com/a.md">External</a>'
  assert.equal(
    normalizeHtmlLinks(html, true),
    '<a href="/?view=markdown">Glossary</a><a href="https://example.com/a.md">External</a>'
  )
})

test("packages multiple Markdown files without changing the source", async () => {
  const { root, source, output } = await fixture()
  try {
    const html = '<!doctype html><title>Report</title><a href="SOURCES.md">Sources</a>'
    const readme = "# Report\n\n- [Chapter](01-chapter.md)\n"
    const chapter = "# Chapter\n\nBody.\n"
    const sources = "# Sources\n\n- https://example.com\n"
    await writeFile(path.join(source, "report.html"), html)
    await writeFile(path.join(source, "README.md"), readme)
    await writeFile(path.join(source, "01-chapter.md"), chapter)
    await writeFile(path.join(source, "SOURCES.md"), sources)

    const result = await prepareReport(source, output)
    const preparedHtml = await readFile(path.join(output, "report.html"), "utf8")
    const preparedMarkdown = await readFile(path.join(output, "report.md"), "utf8")

    assert.match(preparedHtml, /href="\/\?view=markdown"/)
    assert.ok(preparedMarkdown.indexOf("README.md") < preparedMarkdown.indexOf("01-chapter.md"))
    assert.ok(preparedMarkdown.indexOf("01-chapter.md") < preparedMarkdown.indexOf("SOURCES.md"))
    assert.doesNotMatch(preparedMarkdown, /\]\(01-chapter\.md\)/)
    assert.equal(await readFile(path.join(source, "report.html"), "utf8"), html)
    assert.equal(await readFile(path.join(source, "README.md"), "utf8"), readme)
    assert.equal(result.artifacts.html.adapted, true)
    assert.deepEqual(result.artifacts.markdown.sources, [
      "README.md",
      "01-chapter.md",
      "SOURCES.md",
    ])
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test("rejects unsupported files", async () => {
  const { root, source, output } = await fixture()
  try {
    await writeFile(path.join(source, "report.md"), "# Report\n")
    await writeFile(path.join(source, "asset.png"), "not an image")
    await assert.rejects(prepareReport(source, output), /Unsupported report files: asset\.png/)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test("requires the reports checkout environment variable", async () => {
  await assert.rejects(validateReportsRepo({}), /ELEVEN_REPORTS_REPO is required/)
  await assert.rejects(
    validateReportsRepo({ ELEVEN_REPORTS_REPO: "relative/reports" }),
    /must be an absolute path/
  )
})
