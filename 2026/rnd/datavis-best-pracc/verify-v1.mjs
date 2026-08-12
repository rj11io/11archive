#!/usr/bin/env node
/* Regression gate for report-v1.html, following the house verification
 * checklist. Two halves: a structural comparison against the previous
 * generation, and the automated pins.
 *
 * The rule being enforced: the chrome may change, the content may not. Every
 * heading and every table cell in v0 must appear in v1, in the same order and
 * with the same text. Anything v1 adds is listed, not waved through.
 */

import { readFile } from "node:fs/promises"
import { execFile } from "node:child_process"
import { promisify } from "node:util"
import path from "node:path"
import { fileURLToPath } from "node:url"

const run = promisify(execFile)
const here = path.dirname(fileURLToPath(import.meta.url))

const decode = (s) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")

const norm = (s) => decode(s.replace(/<[^>]*>/g, "")).replace(/\s+/g, " ").trim()

const bodyOf = (html) => {
  const start = html.indexOf("<body>")
  const end = html.indexOf("<script>")
  return html.slice(start, end)
}

const headingsOf = (html) =>
  [...bodyOf(html).matchAll(/<(h[2-5])(?:\s[^>]*)?>([\s\S]*?)<\/\1>/g)].map((m) => ({
    level: Number(m[1][1]),
    text: norm(m[2]),
  }))

const cellsOf = (html) =>
  [...bodyOf(html).matchAll(/<td(?:\s[^>]*)?>([\s\S]*?)<\/td>/g)].map((m) => norm(m[1]))

const headersOf = (html) =>
  [...bodyOf(html).matchAll(/class="sort-button">([\s\S]*?)<span/g)].map((m) => norm(m[1]))

const v0 = await readFile(path.join(here, "report-v0.html"), "utf8")
const v1 = await readFile(path.join(here, "report-v1.html"), "utf8")

const report = { pass: true, checks: [] }
const check = (name, ok, detail) => {
  report.checks.push({ name, ok, detail })
  if (!ok) report.pass = false
}

/* --- 1. heading parity ------------------------------------------------ */

const h0 = headingsOf(v0)
const h1 = headingsOf(v1)

/* v0's only removed heading is the explorer title, whose section v1 drops.
   v1's only added heading is the chart picker. Both are named here. */
const REMOVED = ["Interactive report explorer"]
const ADDED = ["Pick a chart by analytical task"]

const h0kept = h0.filter((h) => !REMOVED.includes(h.text))
const h1kept = h1.filter((h) => !ADDED.includes(h.text))

const headingDiff = []
for (let i = 0; i < Math.max(h0kept.length, h1kept.length); i += 1) {
  const a = h0kept[i]
  const b = h1kept[i]
  if (!a || !b || a.text !== b.text || a.level !== b.level) {
    headingDiff.push({ index: i, v0: a ?? null, v1: b ?? null })
  }
}
check(
  "heading text and level identical in order",
  headingDiff.length === 0,
  headingDiff.length ? headingDiff.slice(0, 5) : `${h0kept.length} headings matched`
)
check(
  "removed headings are the declared ones only",
  h0.length - h0kept.length === REMOVED.length,
  { removed: REMOVED }
)
check("added headings are the declared ones only", h1.length - h1kept.length === ADDED.length, {
  added: ADDED,
})

/* --- 2. table cell parity -------------------------------------------- */

const c0 = cellsOf(v0)
const c1 = cellsOf(v1)
const cellDiff = []
for (let i = 0; i < Math.max(c0.length, c1.length); i += 1) {
  if (c0[i] !== c1[i]) cellDiff.push({ index: i, v0: c0[i] ?? null, v1: c1[i] ?? null })
}
check(
  "every table cell identical in order",
  cellDiff.length === 0,
  cellDiff.length ? cellDiff.slice(0, 5) : `${c0.length} cells matched`
)

const t0 = headersOf(v0)
const t1 = headersOf(v1)
check(
  "every table header identical in order",
  t0.length === t1.length && t0.every((v, i) => v === t1[i]),
  `${t0.length} headers`
)

/* --- 3. determinism --------------------------------------------------- */

const before = await readFile(path.join(here, "report-v1.html"))
await run("node", [path.join(here, "build-v1.mjs")], { cwd: here })
const after = await readFile(path.join(here, "report-v1.html"))
check("double render is byte-identical", before.equals(after), `${after.byteLength} bytes`)

/* --- 4. house automated pins ----------------------------------------- */

/* exact counts where the count is load-bearing, a floor where presence is */
const pins = [
  ['<html lang="en" class="dark">', 1, "exact"],
  ['id="theme-toggle"', 1, "exact"],
  ["data:font/woff2;base64", 2, "exact"],
  ["unicode-range", 2, "exact"],
  ["font-variant-numeric: tabular-nums", 1, "min"],
  ["replaceChildren", 2, "min"],
  ['class="col-resize"', 121, "exact"],
  ["data-row-id", 542, "exact"],
]
for (const [needle, expected, mode] of pins) {
  const count = v1.split(needle).length - 1
  const ok = mode === "exact" ? count === expected : count >= expected
  check(`pin: ${needle}`, ok, `${count} ${mode === "exact" ? "of" : ">="} ${expected}`)
}

/* --- 5. the state doctrine ------------------------------------------- */

for (const forbidden of ["localStorage", "sessionStorage", "document.cookie", "prefers-color-scheme"]) {
  check(`state doctrine: no ${forbidden}`, !v1.includes(forbidden), "absent")
}

/* --- 6. v1 targets ---------------------------------------------------- */

const count = (needle) => v1.split(needle).length - 1
check("glyph per taxonomy form", count('class="glyph"') === 118, `${count('class="glyph"')} of 118`)
check("three diagrams", count('class="figure"') === 3, `${count('class="figure"')} of 3`)
const tableCount = count("<table")
const namedTables = [...v1.matchAll(/<table[^>]*aria-labelledby="[^"]+"/g)].length
check(
  "every table has an accessible name",
  namedTables === tableCount && tableCount === 41,
  `${namedTables} of ${tableCount} tables named`
)
check("no search input survives", !v1.includes('id="report-search"'), "absent")
check("print stylesheet present", v1.includes("@media print"), "present")
check("skip link present", v1.includes('class="skip"'), "present")
check("sidebar outline present", v1.includes('class="toc"'), "present")
check(
  "sort button focus ring restored",
  v1.includes(".sort-button:focus-visible { outline: 2px solid var(--primary)"),
  "present"
)
check("td nowrap removed", v1.includes("th, td { white-space: normal; }"), "present")

/* --- output ---------------------------------------------------------- */

for (const c of report.checks) {
  const mark = c.ok ? "PASS" : "FAIL"
  console.log(`${mark}  ${c.name}${c.detail ? `  -> ${typeof c.detail === "string" ? c.detail : JSON.stringify(c.detail)}` : ""}`)
}
console.log(report.pass ? "\nALL CHECKS PASS" : "\nGATE FAILED")
process.exit(report.pass ? 0 : 1)
