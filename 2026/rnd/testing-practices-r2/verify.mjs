#!/usr/bin/env node
/* Verification gate for the testing practices report.
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

/* Fenced code blocks hold illustrative snippets, not links into this report.
   Strip them before checking. */
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
/* The six-part frame is the report's spine. If it stops having six parts, the
   thesis in the executive brief and the frame in section 01 have diverged. */
check(
  "the frame still has exactly six parts",
  data.counts.sixParts === 6,
  `section 01 lists ${data.counts.sixParts} parts; the report calls it six throughout`
)
check(
  "every part of the frame carries both a software and a non-software example",
  data.sixParts.every((p) => p.part && p.softwareExample && p.nonSoftwareExample),
  "a part is missing one of its two examples, which is the point of the table"
)

/* The diagnostic example is the one figure this report computes rather than
   quotes, so it is checked here as well as in the generator. */
const d = data.recomputed.diagnosticExample
check(
  "diagnostic matrix adds up",
  d.truePositives + d.falseNegatives === d.population * d.prevalence &&
    d.falsePositives + d.trueNegatives === d.population * (1 - d.prevalence),
  "the two columns do not sum to the diseased and healthy populations"
)
check(
  "sensitivity recomputes from the matrix",
  Math.abs(d.truePositives / (d.truePositives + d.falseNegatives) - d.sensitivity) < 0.005,
  `matrix implies ${(d.truePositives / (d.truePositives + d.falseNegatives)).toFixed(3)}, stated ${d.sensitivity}`
)
check(
  "specificity recomputes from the matrix",
  Math.abs(d.trueNegatives / (d.trueNegatives + d.falsePositives) - d.specificity) < 0.005,
  `matrix implies ${(d.trueNegatives / (d.trueNegatives + d.falsePositives)).toFixed(3)}, stated ${d.specificity}`
)
check(
  "the stated PPV appears in the prose",
  allMarkdown.includes(d.positivePredictiveValueText),
  `${d.positivePredictiveValueText} is not written anywhere in the Markdown`
)
check(
  "PPV is far below sensitivity, which is the point being made",
  d.positivePredictiveValue < d.sensitivity / 5,
  "the base-rate argument depends on the gap between the two"
)

/* The translation table is the central original contribution. */
check(
  "translation table is substantial",
  data.counts.translationRows >= 40,
  `${data.counts.translationRows} rows`
)

/* Revision 2 exists because revision 1 tested the source tree and never the
   shipped artifact. These guard the correction. */
check(
  "scope ladder covers the packaged artifact",
  data.scopeLadder.some((r) => /artifact/i.test(r.level)),
  "the level that catches packaging failures is missing"
)
check(
  "the three senses of smoke test are kept apart",
  data.counts.smokeSenses === 3 &&
    data.smokeSenses.every((s) => s.sense && s.subject && s.question),
  `${data.counts.smokeSenses} senses listed`
)
check(
  "build verification test is named as a synonym, not a separate stage",
  /build verification test/i.test(allMarkdown) &&
    /synonym/i.test(
      allMarkdown.slice(
        Math.max(0, allMarkdown.search(/build verification test/i) - 400),
        allMarkdown.search(/build verification test/i) + 400
      )
    ),
  "revision 1 listed them as two activities; the correction must survive"
)

/* The report demands that every test state what would falsify it. It must do
   the same, or section 16 is hypocritical. */
check(
  "the report states how it could be wrong",
  data.counts.falsifiers >= 4 &&
    data.falsifiers.every((f) => f.claim && f.falsifiedBy),
  `${data.counts.falsifiers} falsification tests stated`
)
check(
  "the report names where its own analogies flatten real differences",
  data.counts.flattenedPairings >= 3 &&
    data.flattenedPairings.every((p) => p.pairing && p.hidden),
  `${data.counts.flattenedPairings} pairings examined`
)

/* Gauge R&R is the revision-2 framing of flakiness. The bands must stay ordered
   and must stay attached to verdicts. */
check(
  "gauge R&R bands carry verdicts",
  data.gaugeBands.length === 3 && data.gaugeBands.every((b) => b.band && b.verdict),
  `${data.gaugeBands.length} bands`
)
check(
  "every translation row names a field",
  data.translation.every((r) => r.softwareTerm && r.equivalent && r.field),
  "a translation row is incomplete"
)

/* Flakiness rises with test size. The whole shapes argument in section 06 rests
   on this, so the data must still say it. */
const flakePct = (s) => Number(String(s).replace("%", ""))
check(
  "flakiness rises monotonically with test size",
  data.flakinessBySize.every(
    (row, i, all) => i === 0 || flakePct(row.flakyRate) > flakePct(all[i - 1].flakyRate)
  ),
  "the measured rates no longer increase from small to large"
)

check(
  "every failure mode carries a one-line check",
  data.failureModes.length >= 10 && data.failureModes.every((f) => f.failure && f.check),
  `${data.failureModes.length} failure modes, some without a check`
)
check(
  "sources were collected",
  data.counts.externalSources >= 40 && data.sources.length === data.counts.externalSources,
  `${data.counts.externalSources} external sources`
)
check(
  "limitations are stated",
  Array.isArray(data.limitations) && data.limitations.length >= 5,
  "a report with this scope must state its limits"
)

/* ----------------------------------------------------------------- report */

console.log(`${passes.length} passed, ${failures.length} failed`)
if (failures.length) {
  for (const f of failures) console.error(`  FAIL  ${f}`)
  process.exitCode = 1
} else {
  console.log("All automated checks green. The browser pass is still manual.")
}
