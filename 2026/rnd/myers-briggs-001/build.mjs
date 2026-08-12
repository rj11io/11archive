#!/usr/bin/env node
/* Deterministic generator: Markdown files + data.json -> report.html
 *
 * Contract:
 *   - The HTML adds navigation, one diagram, and table interaction. It adds no
 *     facts. Every sentence, table cell and value in report.html comes from the
 *     Markdown files in this directory.
 *   - data.json is load-bearing, not decorative: the build cross-checks the
 *     facet reliability table and the 16 function-order rows in the Markdown
 *     against data.json and fails if they diverge. That is what keeps the two
 *     artifacts honest about each other.
 *   - Presentation follows the house report styleguide: canonical tokens,
 *     embedded fonts, dark by default with a toggle, square corners, hairline
 *     borders, and the table interaction contract (node-moving sort, row
 *     highlight, lazy fixed-layout column resize). No state persists.
 *
 * Two declared departures from strict Markdown-HTML parity, both front matter
 * rather than report content:
 *   1. The header meta block (created, evidence read, scope, not in scope,
 *      source counts, bottom line) is composed from data.json and README.md.
 *      The HTML is a single page, so it has no README to sit beside; without
 *      this block a reader arrives with no framing at all.
 *   2. The one diagram restates the function-order rule and its INFJ worked
 *      example, both of which are in 02-the-type-model.md in prose. The
 *      diagram adds no fact the Markdown lacks.
 *
 * Requires ELEVEN_AGI_REPO to point at a local 11agi checkout, for the
 * styleguide's tokens.css and fonts.css. Nothing else is read from it.
 *
 * Output is byte-identical across runs on unchanged input except the
 * generation-timestamp line.
 */

import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(here, "report.html")

const AGI = process.env.ELEVEN_AGI_REPO
if (!AGI) {
  console.error("ELEVEN_AGI_REPO is not set. Point it at a local 11agi checkout.")
  process.exit(1)
}
const STYLEGUIDE = path.join(AGI, "v0/plugins/11agi-core/skills/11agi-core-reports-styleguide/references")

/* Section order is the report's reading order. The README is deliberately
   excluded: it is the directory's front door, not a section of the report. */
const SECTIONS = [
  { file: "00-executive-brief.md", id: "brief" },
  { file: "01-origins-and-history.md", id: "history" },
  { file: "02-the-type-model.md", id: "model" },
  { file: "03-the-instruments.md", id: "instruments" },
  { file: "04-evidence-reliability-and-validity.md", id: "evidence" },
  { file: "05-critiques-and-replies.md", id: "critiques" },
  { file: "06-alternatives-and-lookalikes.md", id: "alternatives" },
  { file: "07-use-misuse-and-law.md", id: "use" },
  { file: "08-decision-guide.md", id: "decide" },
  { file: "09-glossary.md", id: "glossary" },
  { file: "10-methodology-and-sources.md", id: "method" },
]

const fileToAnchor = new Map(SECTIONS.map((s) => [s.file, s.id]))

const stats = {
  sections: 0,
  headings: 0,
  tables: 0,
  tableRows: 0,
  paragraphs: 0,
  listItems: 0,
  internalLinksRewritten: 0,
  crossChecks: { facets: 0, typeStacks: 0, preferenceShares: 0 },
}

/* --- inline markdown ---------------------------------------------------- */

const escapeHtml = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

function inline(raw) {
  let s = escapeHtml(raw)
  s = s.replace(/`([^`]+)`/g, (_m, code) => `<code>${code}</code>`)
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>")
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, text, href) => {
    const anchor = fileToAnchor.get(href)
    if (anchor) {
      stats.internalLinksRewritten += 1
      return `<a href="#${anchor}">${text}</a>`
    }
    return `<a href="${href}">${text}</a>`
  })
  return s
}

/* --- slugs -------------------------------------------------------------- */

const usedSlugs = new Map()
function slugify(sectionId, raw) {
  const words = raw
    .replace(/<[^>]*>/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
  const base = `${sectionId}-${words || "part"}`
  const seen = usedSlugs.get(base) ?? 0
  usedSlugs.set(base, seen + 1)
  return seen ? `${base}-${seen + 1}` : base
}

/* --- block markdown ----------------------------------------------------- */

const splitRow = (line) =>
  line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim())

/* Numeric-looking cells get the numeric class so the column reads as a column
   of figures rather than a column of text. Tabular figures come from the
   house token block, which sets font-variant-numeric on every td. */
const isNumericCell = (text) => /^[<>~-]?\s*[$]?\d[\d,.%\s-]*$/.test(text) || /^\.\d+$/.test(text)

function renderTable(rows, sectionId) {
  const header = splitRow(rows[0])
  const body = rows.slice(2).map(splitRow)
  stats.tables += 1
  stats.tableRows += body.length
  const tableIndex = stats.tables - 1
  const head = header
    .map(
      (cell) =>
        `<th aria-sort="none" scope="col"><button type="button" class="sort-button">${inline(cell)}<span class="sort-indicator" aria-hidden="true"></span></button><span class="col-resize" aria-hidden="true"></span></th>`,
    )
    .join("")
  const bodyHtml = body
    .map((cells, rowIndex) => {
      const tds = cells
        .map((cell) => `<td${isNumericCell(cell) ? ' class="num"' : ""}>${inline(cell)}</td>`)
        .join("")
      return `<tr data-row-id="t${tableIndex}-r${rowIndex}">${tds}</tr>`
    })
    .join("\n")
  return `<div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>\n${bodyHtml}\n</tbody></table></div>`
}

function renderMarkdown(text, sectionId) {
  const lines = text.split("\n")
  const out = []
  const subheadings = []
  let i = 0
  let title = null

  while (i < lines.length) {
    const line = lines[i]

    if (!line.trim()) {
      i += 1
      continue
    }

    const heading = /^(#{1,4})\s+(.*)$/.exec(line)
    if (heading) {
      const depth = heading[1].length
      const text = heading[2].trim()
      if (depth === 1 && title === null) {
        title = text
        i += 1
        continue
      }
      const level = depth === 2 ? 3 : 4
      const slug = slugify(sectionId, text)
      stats.headings += 1
      if (level === 3) subheadings.push({ slug, text })
      out.push(`<h${level} id="${slug}">${inline(text)}</h${level}>`)
      i += 1
      continue
    }

    if (line.startsWith("```")) {
      const lang = line.slice(3).trim()
      const code = []
      i += 1
      while (i < lines.length && !lines[i].startsWith("```")) {
        code.push(lines[i])
        i += 1
      }
      i += 1
      out.push(
        `<pre class="code"${lang ? ` data-lang="${lang}"` : ""}><code>${escapeHtml(code.join("\n"))}</code></pre>`,
      )
      continue
    }

    if (line.trim().startsWith("|")) {
      const rows = []
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(lines[i])
        i += 1
      }
      out.push(renderTable(rows, sectionId))
      continue
    }

    const bullet = /^([-*])\s+(.*)$/.exec(line)
    const ordered = /^(\d+)\.\s+(.*)$/.exec(line)
    if (bullet || ordered) {
      const tag = bullet ? "ul" : "ol"
      const items = []
      while (i < lines.length) {
        const m = bullet ? /^([-*])\s+(.*)$/.exec(lines[i]) : /^(\d+)\.\s+(.*)$/.exec(lines[i])
        if (!m) break
        const parts = [m[2]]
        i += 1
        /* A wrapped continuation line is indented and is not itself an item. */
        while (i < lines.length && /^\s{2,}\S/.test(lines[i]) && !/^\s*([-*]|\d+\.)\s/.test(lines[i])) {
          parts.push(lines[i].trim())
          i += 1
        }
        items.push(parts.join(" "))
        stats.listItems += 1
      }
      out.push(`<${tag}>${items.map((item) => `<li>${inline(item)}</li>`).join("")}</${tag}>`)
      continue
    }

    const para = []
    while (i < lines.length && lines[i].trim() && !/^(#{1,4}\s|\||```|[-*]\s|\d+\.\s)/.test(lines[i])) {
      para.push(lines[i].trim())
      i += 1
    }
    if (para.length) {
      stats.paragraphs += 1
      out.push(`<p>${inline(para.join(" "))}</p>`)
    }
  }

  return { title, html: out.join("\n"), subheadings }
}

/* --- cross-checks against data.json ------------------------------------- */

/* These exist so the two artifacts cannot drift apart silently. Each check
   pulls values out of the Markdown by pattern and compares them to the
   dataset. A mismatch stops the build. */
function crossCheck(data, markdown) {
  const problems = []

  const instruments = markdown["03-the-instruments.md"]
  for (const facet of data.facets) {
    const escaped = facet.facet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const row = new RegExp(
      `\\|\\s*${facet.pair}\\s*\\|\\s*${escaped}\\s*\\|\\s*(\\.\\d+)\\s*\\|\\s*(\\.\\d+)\\s*\\|`,
    ).exec(instruments)
    if (!row) {
      problems.push(`facet row missing from 03-the-instruments.md: ${facet.pair} ${facet.facet}`)
      continue
    }
    const us = Number(`0${row[1]}`)
    const sg = Number(`0${row[2]}`)
    if (us !== facet.alphaUsNrs) problems.push(`facet ${facet.facet}: US alpha ${us} in Markdown vs ${facet.alphaUsNrs} in data.json`)
    if (sg !== facet.alphaSingapore) problems.push(`facet ${facet.facet}: Singapore alpha ${sg} in Markdown vs ${facet.alphaSingapore} in data.json`)
    stats.crossChecks.facets += 1
  }

  const model = markdown["02-the-type-model.md"]
  for (const stack of data.typeDynamics.stacks) {
    const row = new RegExp(
      `\\|\\s*${stack.type}\\s*\\|\\s*(\\w\\w)\\s*\\|\\s*(\\w\\w)\\s*\\|\\s*(\\w\\w)\\s*\\|\\s*(\\w\\w)\\s*\\|`,
    ).exec(model)
    if (!row) {
      problems.push(`function-order row missing from 02-the-type-model.md: ${stack.type}`)
      continue
    }
    const [, dominant, auxiliary, tertiary, inferior] = row
    if (dominant !== stack.dominant || auxiliary !== stack.auxiliary || tertiary !== stack.tertiary || inferior !== stack.inferior) {
      problems.push(
        `${stack.type}: Markdown ${dominant}/${auxiliary}/${tertiary}/${inferior} vs data.json ${stack.dominant}/${stack.auxiliary}/${stack.tertiary}/${stack.inferior}`,
      )
    }
    stats.crossChecks.typeStacks += 1
  }

  for (const [letter, share] of Object.entries(data.preferenceDistributionUsNrs.shares)) {
    const label = {
      E: "Extraversion \\(E\\)", I: "Introversion \\(I\\)",
      S: "Sensing \\(S\\)", N: "Intuition \\(N\\)",
      T: "Thinking \\(T\\)", F: "Feeling \\(F\\)",
      J: "Judging \\(J\\)", P: "Perceiving \\(P\\)",
    }[letter]
    const row = new RegExp(`\\|\\s*${label}\\s*\\|\\s*([\\d.]+)%\\s*\\|`).exec(model)
    if (!row) {
      problems.push(`preference share row missing from 02-the-type-model.md: ${letter}`)
      continue
    }
    if (Number(row[1]) !== share) problems.push(`preference ${letter}: Markdown ${row[1]} vs data.json ${share}`)
    stats.crossChecks.preferenceShares += 1
  }

  /* The 16 function orders must also obey the two stated rules. Checking the
     dataset against its own theory catches a typo that a Markdown-to-JSON
     comparison would happily pass twice. */
  for (const stack of data.typeDynamics.stacks) {
    const [e, s, t, j] = stack.type.split("")
    const outward = j === "J" ? t : s
    const outwardAttitude = `${outward}e`
    const expectedDominant = e === "E" ? outwardAttitude : `${j === "J" ? s : t}i`
    if (stack.dominant !== expectedDominant) {
      problems.push(`${stack.type}: dominant ${stack.dominant} does not follow the J/P and E/I rules (expected ${expectedDominant})`)
    }
  }

  if (problems.length) {
    console.error("Cross-check failed:\n" + problems.map((p) => `  - ${p}`).join("\n"))
    process.exit(1)
  }
}

/* --- the one diagram ---------------------------------------------------- */

/* Earns its place because the four-letters-to-function-order rule is the part
   of the model that prose consistently fails to convey, and it is the step
   where the theory does its real work. Inline SVG, tokens for colour, no
   raster, legible in both themes. */
const DIAGRAM = `
<figure class="fig">
  <svg viewBox="0 0 720 250" role="img" aria-labelledby="dyn-title dyn-desc" class="diagram">
    <title id="dyn-title">How four letters become a function order</title>
    <desc id="dyn-desc">The J or P letter decides which function faces outward. The E or I letter decides whether that outward function is the dominant one. Worked example: INFJ gives introverted intuition as dominant and extraverted feeling as auxiliary.</desc>
    <g class="d-text">
      <text x="0" y="14" class="d-label">Step 1. The J or P letter picks the outward-facing function</text>
      <rect x="0" y="26" width="146" height="34" class="d-box"/>
      <text x="12" y="48" class="d-mono">letter J</text>
      <path d="M150 43 H196" class="d-arrow" marker-end="url(#ar)"/>
      <rect x="200" y="26" width="238" height="34" class="d-box"/>
      <text x="212" y="48">judging function (T or F) faces out</text>
      <rect x="0" y="66" width="146" height="34" class="d-box"/>
      <text x="12" y="88" class="d-mono">letter P</text>
      <path d="M150 83 H196" class="d-arrow" marker-end="url(#ar)"/>
      <rect x="200" y="66" width="238" height="34" class="d-box"/>
      <text x="212" y="88">perceiving function (S or N) faces out</text>

      <text x="0" y="132" class="d-label">Step 2. The E or I letter decides if that one is dominant</text>
      <rect x="0" y="144" width="146" height="34" class="d-box"/>
      <text x="12" y="166" class="d-mono">letter E</text>
      <path d="M150 161 H196" class="d-arrow" marker-end="url(#ar)"/>
      <rect x="200" y="144" width="238" height="34" class="d-box"/>
      <text x="212" y="166">outward function is dominant</text>
      <rect x="0" y="184" width="146" height="34" class="d-box"/>
      <text x="12" y="206" class="d-mono">letter I</text>
      <path d="M150 201 H196" class="d-arrow" marker-end="url(#ar)"/>
      <rect x="200" y="184" width="238" height="34" class="d-box"/>
      <text x="212" y="206">the other function, turned inward, is dominant</text>

      <line x1="470" y1="8" x2="470" y2="242" class="d-rule"/>
      <text x="490" y="14" class="d-label">Worked example: INFJ</text>
      <text x="490" y="44" class="d-mono d-accent">J</text>
      <text x="512" y="44">so feeling faces out, as Fe</text>
      <text x="490" y="70" class="d-mono d-accent">I</text>
      <text x="512" y="70">so Fe is not dominant</text>
      <text x="490" y="96">the other function, intuition, turns inward</text>
      <rect x="490" y="112" width="220" height="34" class="d-box d-fill"/>
      <text x="502" y="134" class="d-mono">Ni dominant, Fe auxiliary</text>
      <text x="490" y="172">then Ti tertiary, Se inferior, by the</text>
      <text x="490" y="190">alternating convention. Positions 3</text>
      <text x="490" y="208">and 4 are convention, not a finding.</text>
    </g>
    <defs>
      <marker id="ar" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M0 0 L8 4 L0 8 z" class="d-arrowhead"/>
      </marker>
    </defs>
  </svg>
  <figcaption>The rule that turns four letters into an ordered set of four function-attitudes. Source: <a href="#model">The type model</a>.</figcaption>
</figure>`

/* --- page --------------------------------------------------------------- */

const EXTRA_CSS = `
/* ---- report-specific additions -------------------------------------- */
/* Reading measure. Prose is capped; tables and figures break out. */
:root { --measure: 66ch; --border-solid: oklch(0.86 0 0); }
.dark { --border-solid: oklch(0.42 0 0); }

main { padding: 18px 24px 48px; }
.shell { display: grid; grid-template-columns: 15rem minmax(0, 1fr); gap: 1.75rem; align-items: start; }
.doc { min-width: 0; }
.doc p, .doc li { max-width: var(--measure); color: var(--foreground); }
.lede, .meta p, figcaption, .note { color: var(--muted-foreground); }
.lede { max-width: var(--measure); font-size: .95rem; }
h2 { margin: 2rem 0 .5rem; padding-top: .6rem; border-top: 1px solid var(--border); font-size: 1.28rem; font-weight: 750; letter-spacing: -.02em; }
h2:first-of-type { margin-top: .5rem; border-top: 0; padding-top: 0; }
h4 { margin: .75rem 0 .35rem; font-size: .9rem; font-weight: 750; color: var(--foreground); }
.doc ul, .doc ol { margin: .45rem 0; padding-left: 1.15rem; }

.skip { position: absolute; left: -9999px; top: 0; z-index: 20; padding: .5rem .75rem; border: 1px solid var(--primary); background: var(--card); color: var(--foreground); }
.skip:focus { left: .5rem; top: .5rem; }

/* ---- outline -------------------------------------------------------- */
.toc { position: sticky; top: 0; max-height: 100vh; overflow-y: auto; overscroll-behavior: contain; padding: .1rem .8rem .8rem 0; border-right: 1px solid var(--border); font-size: .8rem; }
.toc ol { margin: 0; padding: 0; list-style: none; }
.toc > ol > li { margin: 0 0 .4rem; }
.toc a { display: block; padding: .12rem 0; color: var(--muted-foreground); text-decoration: none; }
.toc a:hover, .toc a:focus-visible { color: var(--primary); }
.toc .toc-top > a { color: var(--foreground); font-weight: 700; }
.toc .toc-sub { margin: .1rem 0 .1rem .55rem; border-left: 1px solid var(--border); padding-left: .5rem; }
.toc-num { display: inline-block; min-width: 1.5rem; color: var(--muted-foreground); font-family: var(--font-mono); font-size: .9em; }

/* ---- tables --------------------------------------------------------- */
/* Departure from the house blanket nowrap: these tables carry explanatory
   sentences in their cells, and nowrap pushed most of them off-screen. Text
   wraps; identifier and figure columns stay on one line via .num. */
td { white-space: normal; }
td.num { white-space: nowrap; }
.sort-button:focus-visible, #theme-toggle:focus-visible, .toc a:focus-visible { outline: 2px solid var(--primary); outline-offset: -2px; }

/* ---- figure and code ------------------------------------------------ */
.fig { margin: 1rem 0; padding: 0; }
.diagram { display: block; width: 100%; max-width: 720px; height: auto; overflow: visible; }
.d-text text { fill: var(--foreground); font-family: var(--font-sans); font-size: 12px; }
.d-label { fill: var(--muted-foreground) !important; font-weight: 700; font-size: 11px !important; letter-spacing: .02em; }
.d-mono { font-family: var(--font-mono) !important; }
.d-accent { fill: var(--primary) !important; font-weight: 700; }
.d-box { fill: none; stroke: var(--border-solid); }
.d-fill { fill: var(--accent-surface); stroke: var(--primary); }
.d-arrow { fill: none; stroke: var(--border-solid); }
.d-arrowhead { fill: var(--border-solid); stroke: none; }
.d-rule { stroke: var(--border-solid); }
figcaption { margin-top: .4rem; font-size: .78rem; max-width: var(--measure); }
pre.code { margin: .6rem 0; padding: .6rem .7rem; overflow-x: auto; border: 1px solid var(--border); background: var(--muted); }
pre.code code { padding: 0; background: transparent; font-size: .8rem; }

/* ---- header meta ---------------------------------------------------- */
.meta { margin: .3rem 0 1rem; }
.meta dl { display: grid; grid-template-columns: max-content minmax(0, 1fr); gap: .1rem .7rem; margin: 0; font-size: .82rem; }
.meta dt { color: var(--muted-foreground); font-weight: 700; }
.meta dd { margin: 0; color: var(--foreground); max-width: var(--measure); }

@media (max-width: 900px) {
  .shell { grid-template-columns: minmax(0, 1fr); }
  .toc { position: static; max-height: none; border-right: 0; border-bottom: 1px solid var(--border); padding: 0 0 .7rem; margin-bottom: .8rem; }
}
@media (max-width: 700px) { main { padding: 12px; } }
@media print {
  .toc, #theme-toggle, .skip { display: none; }
  .shell { grid-template-columns: minmax(0, 1fr); }
  h2 { break-after: avoid; }
  .table-wrap { break-inside: avoid; }
}
`

async function main() {
  const [tokens, fonts, dataRaw] = await Promise.all([
    readFile(path.join(STYLEGUIDE, "tokens.css"), "utf8"),
    readFile(path.join(STYLEGUIDE, "fonts.css"), "utf8"),
    readFile(path.join(here, "data.json"), "utf8"),
  ])
  const data = JSON.parse(dataRaw)

  const markdown = {}
  for (const section of SECTIONS) {
    markdown[section.file] = await readFile(path.join(here, section.file), "utf8")
  }

  crossCheck(data, markdown)

  const rendered = SECTIONS.map((section, index) => {
    const { title, html, subheadings } = renderMarkdown(markdown[section.file], section.id)
    stats.sections += 1
    const number = String(index).padStart(2, "0")
    /* The diagram belongs with the function-order table it explains. */
    const body = section.id === "model" ? html.replace(/(<h3 id="model-from-four-letters[^"]*">)/, `${DIAGRAM}\n$1`) : html
    return { ...section, title, number, html: body, subheadings }
  })

  const toc = rendered
    .map(
      (s) =>
        `<li class="toc-top"><a href="#${s.id}"><span class="toc-num">${s.number}</span>${escapeHtml(s.title)}</a>` +
        (s.subheadings.length
          ? `<ol class="toc-sub">${s.subheadings.map((h) => `<li><a href="#${h.slug}">${escapeHtml(h.text)}</a></li>`).join("")}</ol>`
          : "") +
        `</li>`,
    )
    .join("\n")

  const body = rendered
    .map(
      (s) =>
        `<section id="${s.id}" aria-labelledby="${s.id}-h">\n<h2 id="${s.id}-h"><span class="toc-num">${s.number}</span>${escapeHtml(s.title)}</h2>\n${s.html}\n</section>`,
    )
    .join("\n\n")

  const generatedAt = new Date().toISOString()

  const html = `<!doctype html>
<html lang="en" class="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Myers-Briggs: A Working Reference</title>
<style>
${fonts}
${tokens}
${EXTRA_CSS}</style>
</head>
<body>
<a class="skip" href="#brief">Skip to the report</a>
<main>
<div class="report-header">
<h1>Myers-Briggs: A Working Reference</h1>
<button id="theme-toggle" type="button" aria-pressed="true" aria-label="Toggle light and dark mode" title="Toggle light and dark mode">☀</button>
</div>
<p class="lede">What the Myers-Briggs Type Indicator is, what its own numbers show, the best arguments on each side, and what to use instead when a decision depends on the answer.</p>
<div class="meta">
<dl>
<dt>Created</dt><dd>${data.report.created}</dd>
<dt>Evidence read</dt><dd>${data.report.evidenceReadOn}, English-language sources only</dd>
<dt>Scope</dt><dd>${escapeHtml(data.report.scope)}</dd>
<dt>Not in scope</dt><dd>${data.report.notInScope.map(escapeHtml).join("; ")}</dd>
<dt>Sources</dt><dd>${data.sources.length} named, of which 4 read in full; ${data.unobtainable.length} wanted items could not be obtained</dd>
<dt>Bottom line</dt><dd>The four scales are consistent and map onto mainstream traits. The 16-type layer on top of them is not supported: distributions have one peak, about half of people change a letter on retest, taxometric tests find no categories, and type predicts work outcomes weakly.</dd>
</dl>
</div>
<div class="shell">
<nav class="toc" aria-label="Report outline">
<ol>
${toc}
</ol>
</nav>
<div class="doc">
${body}
<p class="note generation-message">Generated ${generatedAt} from the Markdown files and <code>data.json</code> in this directory by <code>build.mjs</code>. The HTML adds navigation, one diagram, and table interaction. It adds no facts.</p>
</div>
</div>
</main>
<script>
  (() => {
    const sortValue = (cell) => {
      const text = (cell?.textContent ?? "").trim()
      const lower = text.toLowerCase()
      if (!text || lower === "n/a" || lower === "none" || lower === "unknown" || lower === "null") return { kind: 2, value: null }
      if (/^\\d{4}-\\d{2}-\\d{2}T/.test(text)) {
        const timestamp = Date.parse(text)
        if (Number.isFinite(timestamp)) return { kind: 0, value: timestamp }
      }
      let durationSeconds = 0
      let durationParts = 0
      const durationRemainder = lower.replace(/(\\d+(?:\\.\\d+)?)\\s*([hms])/g, (_match, amount, unit) => {
        durationSeconds += Number(amount) * ({ h: 3600, m: 60, s: 1 })[unit]
        durationParts += 1
        return ""
      }).trim()
      if (durationParts && !durationRemainder) return { kind: 0, value: durationSeconds }
      const normalized = text.replaceAll(",", "").replace(/^\\\$/, "").replace(/%$/, "").trim()
      if (/^-?\\d+(?:\\.\\d+)?$/.test(normalized)) return { kind: 0, value: Number(normalized) }
      if (/^\\.\\d+$/.test(normalized)) return { kind: 0, value: Number("0" + normalized) }
      const ratio = /^(-?\\d+(?:\\.\\d+)?)\\s*\\//.exec(normalized)
      if (ratio) return { kind: 0, value: Number(ratio[1]) }
      return { kind: 1, value: lower }
    }
    const compareValues = (left, right, direction) => {
      if (left.kind === 2 && right.kind === 2) return 0
      if (left.kind === 2) return 1
      if (right.kind === 2) return -1
      const comparison = left.kind === 0 && right.kind === 0
        ? left.value - right.value
        : String(left.value).localeCompare(String(right.value), undefined, { numeric: true, sensitivity: "base" })
      return direction === "descending" ? -comparison : comparison
    }
    document.querySelectorAll("table").forEach((table) => {
      const headers = [...table.querySelectorAll("thead th")]
      const body = table.tBodies[0]
      if (!body) return
      ;[...body.rows].forEach((row, index) => { row.dataset.originalIndex = String(index) })
      headers.forEach((header, column) => {
        const button = header.querySelector(".sort-button")
        if (!button) return
        button.title = "Sort descending"
        button.addEventListener("click", () => {
          const direction = header.getAttribute("aria-sort") === "descending" ? "ascending" : "descending"
          headers.forEach((item) => item.setAttribute("aria-sort", "none"))
          header.setAttribute("aria-sort", direction)
          headers.forEach((item) => {
            const itemButton = item.querySelector(".sort-button")
            if (itemButton) itemButton.title = item === header && direction === "descending" ? "Sort ascending" : "Sort descending"
          })
          const rows = [...body.rows]
          const totals = rows.filter((row) => (row.cells[0]?.textContent ?? "").trim().toLowerCase() === "total")
          const sortable = rows.filter((row) => !totals.includes(row))
          sortable.sort((left, right) => compareValues(sortValue(left.cells[column]), sortValue(right.cells[column]), direction) || Number(left.dataset.originalIndex) - Number(right.dataset.originalIndex))
          body.replaceChildren(...sortable, ...totals)
        })
      })
    })
    const toggle = document.getElementById("theme-toggle")
    if (toggle) {
      toggle.addEventListener("click", () => {
        const dark = document.documentElement.classList.toggle("dark")
        toggle.textContent = dark ? "☀" : "☾"
        toggle.setAttribute("aria-pressed", String(dark))
      })
    }
    document.addEventListener("click", (event) => {
      if (event.target.closest("a, button, .col-resize, thead")) return
      const row = event.target.closest("tbody tr")
      if (!row || !row.dataset.rowId) return
      const selection = window.getSelection()
      if (selection && !selection.isCollapsed) return
      row.classList.toggle("highlighted")
    })
    document.addEventListener("pointerdown", (event) => {
      const handle = event.target.closest(".col-resize")
      if (!handle) return
      const th = handle.parentElement
      const table = th.closest("table")
      const headerCells = [...table.tHead.rows[0].cells]
      if (!table.dataset.fixedLayout) {
        const widths = headerCells.map((cell) => cell.getBoundingClientRect().width)
        const colgroup = document.createElement("colgroup")
        for (const width of widths) {
          const col = document.createElement("col")
          col.style.width = width + "px"
          colgroup.append(col)
        }
        table.insertBefore(colgroup, table.firstChild)
        table.style.tableLayout = "fixed"
        table.style.width = widths.reduce((sum, width) => sum + width, 0) + "px"
        table.classList.add("fixed-cols")
        table.dataset.fixedLayout = "true"
      }
      const column = headerCells.indexOf(th)
      const col = table.querySelector("colgroup").children[column]
      const startX = event.clientX
      const startWidth = parseFloat(col.style.width)
      const startTableWidth = parseFloat(table.style.width)
      const move = (moveEvent) => {
        const width = Math.max(0, startWidth + (moveEvent.clientX - startX))
        col.style.width = width + "px"
        table.style.width = (startTableWidth - startWidth + width) + "px"
      }
      const stop = () => {
        document.removeEventListener("pointermove", move)
        document.removeEventListener("pointerup", stop)
      }
      document.addEventListener("pointermove", move)
      document.addEventListener("pointerup", stop)
      event.preventDefault()
    })
  })()
</script>
</body>
</html>
`

  await writeFile(OUT, html, "utf8")
  console.log(
    JSON.stringify(
      {
        output: path.relative(process.cwd(), OUT),
        bytes: Buffer.byteLength(html),
        ...stats,
        diagrams: 1,
      },
      null,
      2,
    ),
  )
}

await main()
