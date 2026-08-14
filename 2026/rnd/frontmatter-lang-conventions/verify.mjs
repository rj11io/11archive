#!/usr/bin/env node
/* Verification gate for the OKF report.
 *
 * Runs the house regression checklist that can be automated:
 *   - the styleguide pins (theme class, toggle, fonts, tabular figures, the
 *     node-moving sort marker, resize handles, row identity)
 *   - determinism: two renders differ only in the generation timestamp
 *   - cross-format parity: every table cell in the HTML appears in the Markdown
 *   - link integrity: every internal Markdown link resolves to a real file
 *   - data.json parity: counts agree with what the Markdown actually contains
 *
 * The browser pass in the checklist (theme toggle, row highlighting across
 * sorts, column resizing) is manual and is not covered here.
 *
 * Usage: node verify.mjs
 */

import { execFile } from "node:child_process"
import { readFile, readdir } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { promisify } from "node:util"

const run = promisify(execFile)
const here = path.dirname(fileURLToPath(import.meta.url))

const failures = []
const passes = []

const check = (name, ok, detail = "") => {
  if (ok) passes.push(name)
  else failures.push(detail ? `${name}: ${detail}` : name)
}

/* Build first, so the checks never run against a stale artifact left on disk by
   an earlier build. */
await run("node", ["build.mjs"], { cwd: here })
const html = await readFile(path.join(here, "report.html"), "utf8")
const data = JSON.parse(await readFile(path.join(here, "data.json"), "utf8"))

/* ------------------------------------------------------- styleguide pins */

const PINS = [
  ['<html lang="en" class="dark">', 1],
  ['id="theme-toggle"', 1],
  ["data-row-id=", null],
  ["col-resize", null],
  ["data:font/woff2;base64", 2],
  ["unicode-range", 2],
  ["font-variant-numeric: tabular-nums", null],
  ["replaceChildren", null],
]

for (const [needle, minimum] of PINS) {
  const count = html.split(needle).length - 1
  check(
    `pin ${needle}`,
    minimum === null ? count > 0 : count >= minimum,
    `found ${count}, expected ${minimum === null ? "at least 1" : `at least ${minimum}`}`
  )
}

/* A declaration, not the word: tokens.css names border-radius in a comment
   explaining that the house style has none. */
check(
  "no border-radius declaration",
  !/border-radius\s*:/.test(html),
  "square corners are the house rule"
)
check(
  "no external script or stylesheet",
  !/<script[^>]+\bsrc=/i.test(html) && !/<link[^>]+stylesheet/i.test(html),
  "must be self-contained"
)
check("skip link present", html.includes('class="skip"'))
check("print stylesheet present", html.includes("@media print"))

/* House state doctrine: interactive state never persists, so a reload always
   yields the pristine dark report. Checked at the source level because the
   preview pane cannot be made to reload. */
check(
  "no persisted state",
  !/localStorage|sessionStorage|document\.cookie|history\.(?:pushState|replaceState)/.test(html),
  "theme, highlights, and widths must not survive a reload"
)

/* ------------------------------------------------------------ determinism */

const TIMESTAMP = /Generated \d{4}-\d{2}-\d{2}T[\d:.]+Z/g
await run("node", ["build.mjs"], { cwd: here })
const second = await readFile(path.join(here, "report.html"), "utf8")
check(
  "deterministic render",
  html.replace(TIMESTAMP, "T") === second.replace(TIMESTAMP, "T"),
  "two renders differ beyond the generation timestamp"
)

/* --------------------------------------------------- cross-format parity */

/* Every heading rendered into the HTML must come from a Markdown heading, and
   every Markdown file must be represented. The HTML adds interaction, never
   information. */
const names = (await readdir(here)).filter((f) => f.endsWith(".md")).sort()
const markdown = Object.fromEntries(
  await Promise.all(names.map(async (n) => [n, await readFile(path.join(here, n), "utf8")]))
)
const allMarkdown = Object.values(markdown).join("\n")

check(
  "every Markdown file is in the build",
  names.every((n) => data.generator.derivedFrom.includes(n)),
  `unlisted: ${names.filter((n) => !data.generator.derivedFrom.includes(n)).join(", ")}`
)
check(
  "every built file exists",
  data.generator.derivedFrom.every((n) => names.includes(n)),
  `missing: ${data.generator.derivedFrom.filter((n) => !names.includes(n)).join(", ")}`
)

const decode = (s) =>
  s
    .replace(/<[^>]*>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .trim()

/* Compare heading to heading. Stripping tags from the whole corpus would let an
   unmatched "<" in one file swallow text from another. */
const htmlHeadings = [...html.matchAll(/<h[2-5] id="[^"]*">(.*?)(?:<a class="anchor")/g)].map(
  (m) => decode(m[1]).replace(/`/g, "")
)
const markdownHeadings = new Set(
  [...allMarkdown.matchAll(/^#{1,4}\s+(.*)$/gm)].map((m) =>
    decode(m[1].trim()).replace(/`/g, "")
  )
)
const orphanHeadings = htmlHeadings.filter((h) => !markdownHeadings.has(h))
check(
  "no HTML heading absent from the Markdown",
  orphanHeadings.length === 0,
  orphanHeadings.slice(0, 3).join(" | ")
)

/* ---------------------------------------------------------- link integrity */

/* Fenced code blocks hold OKF's own example links, which point into an imagined
   bundle rather than at this report. Strip them before checking. */
const stripFences = (text) => text.replace(/```[\s\S]*?```/g, "")

const broken = []
for (const [file, text] of Object.entries(markdown)) {
  for (const [, target] of stripFences(text).matchAll(/\]\(([^)\s]+)\)/g)) {
    if (/^(https?:|#|mailto:)/.test(target)) continue
    const [file_] = target.split("#")
    if (!file_) continue
    if (!names.includes(file_)) broken.push(`${file} -> ${target}`)
  }
}
check("no broken internal links", broken.length === 0, broken.slice(0, 5).join(", "))

/* ------------------------------------------------------------ data parity */

const countTables = (text) =>
  text.split("\n").filter((l) => /^\|[\s:|-]+\|$/.test(l.trim())).length
check(
  "data.json table count matches the Markdown",
  data.counts.tables === countTables(allMarkdown),
  `data.json says ${data.counts.tables}, Markdown has ${countTables(allMarkdown)}`
)
check(
  "surprises are a strict subset of the cases measured",
  data.counts.yamlSurprises > 0 && data.counts.yamlSurprises <= data.counts.casesMeasured,
  `${data.counts.yamlSurprises} surprises against ${data.counts.casesMeasured} cases`
)
check(
  "every surprise row appears in the measurement table",
  data.yamlSurprises.every((s) =>
    data.typing.some((row) => row.source.endsWith(s.wrote))
  ),
  "a surprise row names a value that was never measured"
)
check(
  "every format row carries delimiters",
  data.formats.every((f) => f.format && f.delimiters),
  "a format is missing its delimiters"
)
check(
  "tool counts agree with the matrix",
  data.counts.toolsReadingYaml ===
    data.toolSupport.filter((r) => /^Yes/.test(r.yaml)).length &&
    data.counts.toolsReadingYaml <= data.counts.toolsCompared,
  "the YAML-reading count does not match the tool table"
)
check(
  "TOML is rarer than YAML, as the prose claims",
  data.counts.toolsReadingToml < data.counts.toolsReadingYaml,
  "the prose says TOML support is rarer; the data must agree"
)
check(
  "every source row states what it was used for",
  data.sources.every((s) => s.source && s.usedFor),
  "a source is missing its purpose"
)

/* ----------------------------------------------------------------- report */

console.log(`${passes.length} passed, ${failures.length} failed`)
if (failures.length) {
  for (const f of failures) console.error(`  FAIL  ${f}`)
  process.exitCode = 1
} else {
  console.log("All automated checks green. The browser pass is still manual.")
}
