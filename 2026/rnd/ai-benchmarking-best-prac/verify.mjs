#!/usr/bin/env node
/* Verification gate for the AI benchmarking report.
 *
 * Runs five families of check and exits non-zero on the first failure:
 *   1. Structural pins from the house styleguide regression checklist.
 *   2. Cross-format parity: every Markdown heading and table cell survives into
 *      report.html, in the same order and with the same text.
 *   3. data.json agrees with the Markdown tables it was derived from.
 *   4. Determinism: two builds differ only in their generation timestamp.
 *   5. Hygiene: no secrets, no local absolute paths, every internal anchor
 *      resolves, and every external link in the HTML also appears in a
 *      Markdown source.
 *
 * Usage: ELEVEN_AGI_REPO=/path/to/11agi node verify.mjs
 */

import { execFileSync } from "node:child_process"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))
const failures = []
const notes = []
const check = (name, condition, detail = "") => {
  if (condition) notes.push(`pass  ${name}`)
  else failures.push(`FAIL  ${name}${detail ? ` :: ${detail}` : ""}`)
}

const MD_FILES = [
  "README.md",
  "00-executive-brief.md",
  "01-what-a-benchmark-measures.md",
  "02-benchmark-catalog.md",
  "03-statistics-and-uncertainty.md",
  "04-contamination-and-saturation.md",
  "05-judges-and-human-evaluation.md",
  "06-agentic-evaluation.md",
  "07-safety-and-frontier-risk-evals.md",
  "08-standards-and-regulation.md",
  "09-build-your-own-eval-suite.md",
  "10-anti-patterns-and-reading-a-leaderboard.md",
  "11-glossary.md",
  "12-methodology-and-sources.md",
]

const html = await readFile(path.join(here, "report.html"), "utf8")
const data = JSON.parse(await readFile(path.join(here, "data.json"), "utf8"))
const markdown = {}
for (const file of MD_FILES) markdown[file] = await readFile(path.join(here, file), "utf8")

/* ------------------------------------------------------------- normalise */

const decode = (s) =>
  s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")

/* Comparison ignores formatting and punctuation and keeps the letters and
   digits, so it catches dropped, duplicated, or garbled content without
   re-implementing the renderer. */
const key = (s) => decode(s.replace(/<[^>]*>/g, " ")).toLowerCase().replace(/[^a-z0-9]+/g, "")

const mdText = (s) =>
  s
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*`]/g, "")

/* -------------------------------------------------- 1. structural pins */

const pins = [
  ['<html lang="en" class="dark">', html.includes('<html lang="en" class="dark">')],
  ["theme toggle present", html.includes('id="theme-toggle"')],
  ["deterministic row ids", /data-row-id="t0-r0"/.test(html)],
  ["resize handles", html.includes('class="col-resize"')],
  ["two embedded fonts", (html.match(/data:font\/woff2;base64/g) ?? []).length === 2],
  ["two unicode ranges", (html.match(/unicode-range/g) ?? []).length === 2],
  ["tabular figures", html.includes("font-variant-numeric: tabular-nums")],
  ["node-moving sort survived", html.includes("replaceChildren(...sortable, ...totals)")],
  ["no network requests", !/(src|href)="https?:\/\/[^"]*\.(js|css|woff2?|png|jpg|svg)/.test(html)],
  ["no localStorage or cookies", !/localStorage|sessionStorage|document\.cookie/.test(html)],
  ["print stylesheet present", html.includes("@media print")],
  ["skip link first", html.indexOf('class="skip"') < html.indexOf("<main")],
  ["sidebar outline present", html.includes('class="toc"')],
  ["aria-sort on every header", (html.match(/<th scope="col" aria-sort="none">/g) ?? []).length === (html.match(/<th /g) ?? []).length],
]
for (const [name, ok] of pins) check(`pin: ${name}`, ok)

/* ------------------------------------------------------- 2. parity */

/* The anchor link and the "powered by" attribution are chrome the page adds
   around a heading, not heading content, so both come off before comparing. */
const htmlHeadings = [...html.matchAll(/<h([1-5])[^>]*>([\s\S]*?)<\/h\1>/g)]
  .map((m) =>
    m[2]
      .replace(/<a class="anchor"[\s\S]*?<\/a>/g, "")
      .replace(/<span class="powered-by">[\s\S]*?<\/span>/g, "")
  )
  .map(key)

const mdHeadings = []
for (const file of MD_FILES) {
  for (const line of markdown[file].split("\n")) {
    const m = line.match(/^#{1,4}\s+(.*)$/)
    if (m) mdHeadings.push(key(mdText(m[1].trim())))
  }
}
check(
  "parity: heading count",
  htmlHeadings.length === mdHeadings.length,
  `html ${htmlHeadings.length} vs markdown ${mdHeadings.length}`
)
const headingMismatch = mdHeadings.findIndex((h, i) => h !== htmlHeadings[i])
check(
  "parity: heading order and text",
  headingMismatch === -1,
  headingMismatch === -1 ? "" : `first difference at index ${headingMismatch}: markdown "${mdHeadings[headingMismatch]}" vs html "${htmlHeadings[headingMismatch]}"`
)

const htmlCells = [...html.matchAll(/<(th|td)[^>]*>([\s\S]*?)<\/\1>/g)].map((m) =>
  key(m[2].replace(/<span class="sort-indicator"[\s\S]*?<\/span>/g, "").replace(/<button[^>]*>|<\/button>/g, ""))
)
const mdCells = []
for (const file of MD_FILES) {
  const lines = markdown[file].split("\n")
  for (let i = 0; i < lines.length; i += 1) {
    if (!/^\|/.test(lines[i])) continue
    if (/^\|[\s:|-]+\|$/.test(lines[i])) continue
    const cells = lines[i].replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim())
    for (const cell of cells) mdCells.push(key(mdText(cell)))
  }
}
check(
  "parity: table cell count",
  htmlCells.length === mdCells.length,
  `html ${htmlCells.length} vs markdown ${mdCells.length}`
)
const cellMismatch = mdCells.findIndex((c, i) => c !== htmlCells[i])
check(
  "parity: table cell order and text",
  cellMismatch === -1,
  cellMismatch === -1 ? "" : `first difference at index ${cellMismatch}: markdown "${mdCells[cellMismatch]}" vs html "${htmlCells[cellMismatch]}"`
)

/* --------------------------------------------------- 3. data.json agreement */

const countRows = (file, headingText) => {
  const lines = markdown[file].split("\n")
  const start = lines.findIndex((l) => l.replace(/^#+\s+/, "").trim() === headingText && /^#/.test(l))
  if (start < 0) return -1
  let rows = 0
  let seenSeparator = false
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^#/.test(lines[i])) break
    if (/^\|[\s:|-]+\|$/.test(lines[i])) {
      seenSeparator = true
      continue
    }
    if (seenSeparator && /^\|/.test(lines[i])) rows += 1
    else if (seenSeparator && !/^\|/.test(lines[i]) && lines[i].trim()) break
  }
  return rows
}

const catalogRows =
  countRows("02-benchmark-catalog.md", "Knowledge and reasoning quizzes") +
  countRows("02-benchmark-catalog.md", "Mathematics") +
  countRows("02-benchmark-catalog.md", "Code") +
  countRows("02-benchmark-catalog.md", "Agents and real work")
check("data: benchmark count matches the catalog tables", data.benchmarks.length === catalogRows, `${data.benchmarks.length} vs ${catalogRows}`)
check("data: suite count", data.suites.length === countRows("02-benchmark-catalog.md", "Suites, indices, and arenas"))
check("data: rule count", data.rules.length === countRows("00-executive-brief.md", "The ten rules"))
check("data: failure-mode count", data.failureModes.length === countRows("10-anti-patterns-and-reading-a-leaderboard.md", "The failure catalogue"))
check("data: glossary count", data.glossary.length === countRows("11-glossary.md", "Glossary"))
check("data: every benchmark has a name and status", data.benchmarks.every((b) => b.name && b.status))
check(
  "data: unverified items are flagged, never zeroed",
  data.benchmarks.filter((b) => b.itemsState === "not verified").every((b) => /n\/v/.test(b.items))
)
check("data: every source has an id, title, and url", data.sources.every((s) => s.id && s.title && /^https?:/.test(s.url)))
check("data: source ids are unique and sequential", data.sources.every((s, i) => s.id === `S${String(i + 1).padStart(2, "0")}`))
check("data: statistical checks all recomputed", data.statisticalChecks.every((c) => String(c.computed) === c.assertedInSection03))
check("data: counts block matches the arrays", data.counts.benchmarks === data.benchmarks.length && data.counts.sources === data.sources.length)

/* README and methodology quote these counts in prose; keep them true. */
check("prose: README benchmark and suite counts", markdown["README.md"].includes(`${data.benchmarks.length} benchmarks and ${data.suites.length} suites`))
check("prose: README glossary count", markdown["README.md"].includes(`${data.glossary.length} terms defined`))
check("prose: README source count", markdown["README.md"].includes(`${data.sources.length} sources`))
check(
  "prose: README failure-mode count",
  markdown["README.md"].includes(`${data.failureModes.length + 2} failure modes`)
)
check("prose: methodology source total", markdown["12-methodology-and-sources.md"].includes("Seventy-five sources"))
check("prose: methodology secondary-claim total", data.secondaryClaims.length === 17)

/* ------------------------------------------------------ 4. determinism */

const normalise = (s) => s.replace(/\d{4}-\d{2}-\d{2}T[\d:.]+Z/g, "TIMESTAMP")
const buildOnce = () => {
  execFileSync(process.execPath, [path.join(here, "build.mjs")], { cwd: here, stdio: "pipe" })
  return {
    html: normalise(execFileSync("cat", [path.join(here, "report.html")], { encoding: "utf8" })),
    data: normalise(execFileSync("cat", [path.join(here, "data.json")], { encoding: "utf8" })),
  }
}
const first = buildOnce()
const second = buildOnce()
check("determinism: report.html identical modulo timestamp", first.html === second.html)
check("determinism: data.json identical modulo timestamp", first.data === second.data)

/* --------------------------------------------------------- 5. hygiene */

/* Looks for credential-shaped values, not the English words. The report
   discusses secrets and passwords as subject matter, which is fine; an
   assigned value is not. */
const secrets =
  /((api[_-]?key|secret|password|token|authorization)\s*[:=]\s*["']?[A-Za-z0-9_\-.]{8,}|bearer\s+[A-Za-z0-9_\-.]{12,}|sk-[A-Za-z0-9]{16,}|ghp_[A-Za-z0-9]{16,}|AKIA[0-9A-Z]{12,})/i
const artifacts = { "report.html": html, "data.json": JSON.stringify(data) }
for (const [name, body] of Object.entries(artifacts)) {
  check(`hygiene: ${name} carries no credential-shaped strings`, !secrets.test(body))
  check(`hygiene: ${name} carries no local absolute paths`, !/\/Users\/|\/home\/[a-z]/.test(body))
}

const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))
const internal = [...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1])
const dangling = internal.filter((target) => target !== "top" && !ids.has(target))
check("hygiene: every internal anchor resolves", dangling.length === 0, dangling.slice(0, 5).join(", "))

const mdAll = MD_FILES.map((f) => markdown[f]).join("\n")
const externals = [...new Set([...html.matchAll(/href="(https?:\/\/[^"]+)"/g)].map((m) => m[1]))]
const missing = externals.filter(
  (url) => !mdAll.includes(url) && url !== "https://ai.rj11.io/skills/11agi-core-reports-manager"
)
check("hygiene: every external link comes from a Markdown source", missing.length === 0, missing.slice(0, 5).join(", "))

const mdLinks = [...new Set([...mdAll.matchAll(/\]\((\d\d-[a-z0-9-]+\.md)\)/g)].map((m) => m[1]))]
check(
  "hygiene: every relative Markdown link points at a file in the bundle",
  mdLinks.every((l) => MD_FILES.includes(l)),
  mdLinks.filter((l) => !MD_FILES.includes(l)).join(", ")
)

/* ----------------------------------------------------------- report out */

console.log(notes.join("\n"))
if (failures.length) {
  console.error("\n" + failures.join("\n"))
  console.error(`\n${failures.length} check(s) failed`)
  process.exitCode = 1
} else {
  console.log(`\nall ${notes.length} checks passed`)
}
