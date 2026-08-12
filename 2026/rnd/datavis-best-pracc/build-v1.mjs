#!/usr/bin/env node
/* Deterministic transformer: report-v0.html -> report-v1.html
 *
 * v1 is a presentation pass. It changes structure, layout, navigation and
 * visuals. It does not change the report's prose, table values, ordering,
 * terminology, provenance or limitations. The verifier in verify-v1.mjs proves
 * that: every v0 heading and every v0 table cell must survive into v1 in the
 * same order, and anything v1 adds is listed explicitly.
 *
 * What is kept verbatim from v0:
 *   - the embedded font faces
 *   - the canonical token block from the house styleguide
 *   - the table interaction code: type-aware sorting with the node-identity
 *     rule, data-row-id row highlighting, and lazy fixed-layout column resize
 *
 * Deliberate departures from the house styleguide, each with its reason:
 *   1. td no longer carries white-space: nowrap. The house datavis reference
 *      requires wrapping for explanatory text; the blanket rule hid content in
 *      31 of 41 tables at desktop width and 37 of 41 on a phone.
 *   2. Sort buttons and the theme toggle get a visible focus ring. The house
 *      rule sets outline: none; the house datavis reference requires visible
 *      keyboard focus, and it wins for a control that appears 121 times.
 *   3. A sidebar outline is added. It adds navigation over the existing
 *      document flow; it does not replace section markup.
 *
 * The state doctrine is respected in full: no localStorage, no cookies, no URL
 * state, no prefers-color-scheme seeding. A reload yields the pristine dark
 * report. Theme persistence was in the review plan and is dropped here because
 * the house contract forbids it by design.
 */

import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { glyphFor, glyphCss, glyphCount } from "./glyphs.mjs"
import { layeredChartShell, controlFamilies, viewState, diagramCss } from "./diagrams.mjs"

const here = path.dirname(fileURLToPath(import.meta.url))
const SRC = path.join(here, "report-v0.html")
const OUT = path.join(here, "report-v1.html")

const stats = {
  glyphsInjected: 0,
  headingsSlugged: 0,
  tablesNamed: 0,
  tablesTall: 0,
  nowrapColumns: 0,
  diagrams: 0,
  addedHeadings: [],
}

/* --- helpers ---------------------------------------------------------- */

const stripTags = (s) => s.replace(/<[^>]*>/g, "")
const decode = (s) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")

const usedSlugs = new Map()
function slugify(raw) {
  let base =
    decode(stripTags(raw))
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "section"
  /* 41 of this report's sub-headings begin with a number, so the plain slug
     would begin with a digit. That is legal HTML and works for a fragment
     link, but it is not a valid CSS selector, so document.querySelector("#4-…")
     throws and a :target rule cannot be written. Prefix it instead. */
  if (/^\d/.test(base)) base = `sec-${base}`
  const seen = usedSlugs.get(base) ?? 0
  usedSlugs.set(base, seen + 1)
  return seen ? `${base}-${seen + 1}` : base
}

/* --- v1 stylesheet ---------------------------------------------------- */

const V1_CSS = `

/* ---- v1 additions --------------------------------------------------- */
/* A solid hairline for diagram strokes and table chrome. The canonical
   --border is white at 10% in dark mode, which disappears inside an SVG. */
:root { --border-solid: oklch(0.86 0 0); }
.dark { --border-solid: oklch(0.42 0 0); }

/* The reading measure. Set in ch and then tuned against a real count of
   characters per rendered line: 1ch is the advance of "0", which in Inter is
   wider than the average lowercase letter, so 78ch measured 88 characters.
   65ch lands at roughly 73, inside the comfortable 45-75 band. */
:root { --measure: 65ch; --measure-tight: 58ch; }

/* Reading layout. v0 left main unbounded, which produced roughly 200
   characters per line on a 1080p display. Prose is capped; tables, figures,
   and code break out to the full column. */
main { padding: 16px 24px 40px; }
.skip { position: absolute; left: -9999px; top: 0; z-index: 20; padding: .5rem .75rem; border: 1px solid var(--primary); background: var(--card); color: var(--foreground); }
.skip:focus { left: .5rem; top: .5rem; }

.shell { display: grid; grid-template-columns: 15.5rem minmax(0, 1fr); gap: 1.75rem; align-items: start; }
.doc { min-width: 0; }
.doc p, .doc li, .doc blockquote { max-width: var(--measure); }
.lede { max-width: var(--measure); }

/* Contrast hierarchy. v0 put every paragraph at --muted-foreground and every
   table cell at --foreground, so the argument read dimmer than the reference
   data. Body prose is foreground; only genuine metadata stays muted. */
.doc p, .doc li { color: var(--foreground); }
.doc blockquote { color: var(--muted-foreground); }
.lede, .dts, .meta dd, .note, .status, figcaption { color: var(--muted-foreground); }

/* ---- sidebar outline ------------------------------------------------ */
.toc { position: sticky; top: 0; align-self: start; max-height: 100vh; overflow-y: auto; overscroll-behavior: contain; padding: .1rem .75rem .75rem 0; border-right: 1px solid var(--border); font-size: .8rem; }
/* The outline's own label is not a document heading: the nav carries an
   accessible name already, and an extra h2 would sit in the report's outline
   as if it were content. */
.toc-title { margin: 0 0 .5rem; padding-bottom: .4rem; border-bottom: 1px solid var(--border); font-size: .74rem; font-weight: 750; letter-spacing: .06em; text-transform: uppercase; color: var(--muted-foreground); }
.toc ol { margin: 0; padding: 0; list-style: none; }
.toc li { margin: 0; color: inherit; }
.toc a { display: grid; grid-template-columns: 2.1rem 1fr; gap: .25rem; padding: .18rem .35rem; color: var(--muted-foreground); text-decoration: none; border-left: 2px solid transparent; }
.toc a:hover { color: var(--foreground); background: color-mix(in oklab, var(--primary) 10%, transparent); }
.toc a:focus-visible { outline: 2px solid var(--primary); outline-offset: -2px; }
.toc .num { color: var(--muted-foreground); font-variant-numeric: tabular-nums; }
.toc .toc-2 > a { color: var(--foreground); font-weight: 700; margin-top: .45rem; }
.toc .toc-3 > a { padding-left: .35rem; }
.toc a[aria-current="true"] { border-left-color: var(--primary); color: var(--primary); background: color-mix(in oklab, var(--primary) 12%, transparent); }
.toc a[aria-current="true"] .num { color: var(--primary); }
.toc-toggle { display: none; }

/* ---- headings, numbering, anchors ---------------------------------- */
.doc { counter-reset: sec; }
.report-section { counter-increment: sec; }
.report-section > h2::before { content: counter(sec) "  "; color: var(--muted-foreground); font-variant-numeric: tabular-nums; }
.report-section > h2 { margin-top: 2rem; padding-top: .9rem; border-top: 1px solid var(--border); font-size: 1.3rem; }
.report-section:first-of-type > h2 { margin-top: .4rem; border-top: 0; padding-top: 0; }
h2, h3, h4, h5 { scroll-margin-top: .5rem; position: relative; }
.anchor { position: absolute; left: -1.15rem; width: 1.1rem; text-align: left; color: var(--muted-foreground); text-decoration: none; opacity: 0; font-weight: 400; }
.anchor::before { content: "#"; }
h2:hover > .anchor, h3:hover > .anchor, h4:hover > .anchor, h5:hover > .anchor, .anchor:focus-visible { opacity: 1; }
.anchor:hover, .anchor:focus-visible { color: var(--primary); }
.anchor:focus-visible { outline: 2px solid var(--primary); outline-offset: 1px; opacity: 1; }

/* ---- front-matter metadata grid ------------------------------------ */
.meta { display: grid; grid-template-columns: max-content minmax(0, 1fr); gap: .18rem .8rem; margin: .6rem 0 1rem; padding: .65rem .8rem; border: 1px solid var(--border); background: var(--card); }
.meta dt { color: var(--muted-foreground); font-weight: 700; font-size: .8rem; }
.meta dd { margin: 0; max-width: var(--measure); font-size: .84rem; }

/* ---- tables -------------------------------------------------------- */
/* Wrapping is the fix for the hidden-content defect. Identity columns keep
   nowrap so short labels stay on one line. */
th, td { white-space: normal; }
td { padding: .45rem .6rem; line-height: 1.4; }
.sort-button { white-space: nowrap; }
td.nw { white-space: nowrap; }
td.prose { min-width: 16rem; }
.table-wrap { position: relative; margin: .6rem 0 1rem; overflow: auto; }
.table-wrap.tall { max-height: 78vh; }
.table-wrap.tall thead th { position: sticky; top: 0; z-index: 2; }
.table-wrap.tall thead th::after { content: ""; position: absolute; left: 0; right: 0; bottom: -1px; height: 1px; background: var(--border-solid); }
.table-wrap:focus-visible { outline: 2px solid var(--primary); outline-offset: -2px; }
/* Scroll affordance: a gradient edge, not a shadow, plus a visible hint. The
   house rule forbids shadows. */
.table-wrap[data-overflow="true"]::after { content: ""; position: sticky; float: right; right: 0; top: 0; display: block; width: 2.5rem; height: 100%; margin-left: -2.5rem; background: linear-gradient(to right, transparent, var(--background)); pointer-events: none; }
.scroll-hint { display: none; margin: -.4rem 0 .8rem; color: var(--muted-foreground); font-size: .76rem; }
.table-wrap[data-overflow="true"] + .scroll-hint { display: block; }
tbody tr { cursor: pointer; }
tbody tr:hover td { background: color-mix(in oklab, var(--primary) 8%, transparent); }
tbody tr.highlighted:hover td { background: var(--accent-surface); }
.marks { position: sticky; bottom: .5rem; z-index: 5; display: none; align-items: center; gap: .6rem; width: max-content; margin: .5rem 0 0; padding: .35rem .6rem; border: 1px solid var(--primary); background: var(--card); font-size: .78rem; }
.marks[data-active="true"] { display: flex; }
.marks button { padding: .2rem .5rem; border: 1px solid var(--border); background: transparent; color: var(--foreground); font: inherit; font-size: .78rem; cursor: pointer; }
.marks button:hover, .marks button:focus-visible { border-color: var(--primary); color: var(--primary); outline: none; }
.marks button:focus-visible { outline: 2px solid var(--primary); outline-offset: 1px; }

/* Visible keyboard focus, restoring what the house token block removes. */
.sort-button:focus-visible { outline: 2px solid var(--primary); outline-offset: -2px; }
#theme-toggle:focus-visible { outline: 2px solid var(--primary); outline-offset: 1px; }

/* ---- form glyphs in the taxonomy ----------------------------------- */
td.form { white-space: nowrap; }
.form-cell { display: flex; align-items: center; gap: .55rem; }
.form-cell .label { font-weight: 600; }

/* ---- chart picker -------------------------------------------------- */
.picker { margin: .9rem 0 1.2rem; padding: .8rem .9rem; border: 1px solid var(--border); border-left: 3px solid var(--primary); background: var(--card); }
.picker h3 { margin: 0 0 .3rem; }
.picker > p { margin: 0 0 .6rem; max-width: var(--measure); font-size: .84rem; color: var(--muted-foreground); }
.picker-tools { display: flex; flex-wrap: wrap; gap: .6rem; align-items: end; }
.field { display: grid; gap: .22rem; color: var(--muted-foreground); font-size: .8rem; font-weight: 700; }
input, select, button.action { min-height: 2.3rem; border: 1px solid var(--border); background: var(--background); color: var(--foreground); padding: .4rem .55rem; font: inherit; }
select { min-width: 12rem; }
button.action { cursor: pointer; font-weight: 700; }
button.action:hover, button.action:focus-visible { border-color: var(--primary); color: var(--primary); }
input:focus-visible, select:focus-visible, button.action:focus-visible { outline: 2px solid var(--primary); outline-offset: 1px; }
.recommendation { margin-top: .7rem; padding: .6rem .75rem; border-left: 3px solid var(--primary); background: color-mix(in oklab, var(--primary) 8%, transparent); }
.recommendation p { margin: .2rem 0; max-width: var(--measure); font-size: .86rem; }
.recommendation strong { color: var(--foreground); }
.recommendation .warn { color: var(--muted-foreground); }
.recommendation a { font-size: .82rem; }

/* ---- sections and misc -------------------------------------------- */
.report-section { margin-top: 0; }
.subsection { margin: 1rem 0 1.4rem; }
h4 { margin: .9rem 0 .4rem; font-size: .92rem; font-weight: 750; }
h5 { margin: .75rem 0 .35rem; font-size: .86rem; font-weight: 750; }
pre { overflow: auto; max-width: 100%; padding: .7rem; border: 1px solid var(--border); background: var(--muted); font-size: .8rem; line-height: 1.4; }
pre code { padding: 0; background: transparent; }
.section-nav { display: flex; justify-content: space-between; gap: 1rem; margin: 1.4rem 0 0; padding-top: .7rem; border-top: 1px solid var(--border); font-size: .8rem; }
.section-nav a { text-decoration: none; }
.section-nav a:hover { text-decoration: underline; }

/* ---- narrow screens ------------------------------------------------ */
@media (max-width: 1000px) {
  .shell { display: block; }
  .toc { position: static; max-height: none; overflow: visible; margin: 0 0 1.2rem; padding: 0; border-right: 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
  .toc-toggle { display: block; width: 100%; padding: .6rem .2rem; border: 0; background: transparent; color: var(--foreground); font: inherit; font-weight: 750; text-align: left; cursor: pointer; }
  .toc-toggle:focus-visible { outline: 2px solid var(--primary); outline-offset: -2px; }
  .toc-toggle::after { content: "  +"; color: var(--muted-foreground); }
  .toc[data-open="true"] .toc-toggle::after { content: "  \\2212"; }
  .toc > .toc-title { display: none; }
  .toc > ol { display: none; padding-bottom: .6rem; }
  .toc[data-open="true"] > ol { display: block; }
  .anchor { position: static; opacity: 1; margin-left: .35rem; font-size: .8em; }
}
@media (max-width: 700px) {
  main { padding: 10px; }
  .doc p, .doc li, .lede, .meta dd, .recommendation p { max-width: none; }
  .meta { grid-template-columns: 1fr; gap: 0 0; }
  .meta dt { margin-top: .5rem; }
  /* Two-column term/definition tables read as a list rather than a sideways
     scroll on a phone. */
  table.stack, table.stack thead, table.stack tbody, table.stack tr, table.stack td { display: block; }
  table.stack thead { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
  table.stack tr { padding: .5rem .6rem; border-bottom: 1px solid var(--border); }
  table.stack tr:last-child { border-bottom: 0; }
  table.stack td { padding: 0; border: 0; white-space: normal; }
  table.stack td.nw { margin-bottom: .15rem; font-weight: 700; }
  .table-wrap.tall { max-height: none; }
}

/* ---- print --------------------------------------------------------- */
@media print {
  :root, .dark { color-scheme: light; --background: #fff; --foreground: #111; --card: #fff; --muted: #f2f2f2; --muted-foreground: #444; --primary: #0b6b4f; --primary-foreground: #fff; --border: #ccc; --border-solid: #999; --accent-surface: #e8f3ee; }
  body { font-size: 10.5pt; }
  .toc, .toc-toggle, #theme-toggle, .picker, .marks, .scroll-hint, .anchor, .section-nav, .powered-by { display: none !important; }
  .shell { display: block; }
  main { padding: 0; }
  .doc p, .doc li, .lede { max-width: none; }
  /* Expand every table that scrolls on screen so nothing is cut off on paper. */
  .table-wrap, .table-wrap.tall { overflow: visible !important; max-height: none !important; border: 1px solid var(--border-solid); }
  .table-wrap.tall thead th { position: static; }
  table { font-size: 8.5pt; }
  .col-resize { display: none; }
  .sort-button { padding: .3rem .4rem; }
  .sort-indicator { display: none; }
  tr, tbody tr, .figure, .meta, pre { break-inside: avoid; }
  thead { display: table-header-group; }
  .report-section { break-before: page; }
  .report-section:first-of-type { break-before: avoid; }
  h2, h3, h4 { break-after: avoid; }
  /* Print the destination of every external link. */
  .doc a[href^="http"]::after { content: " (" attr(href) ")"; font-size: 7.5pt; color: #555; word-break: break-all; }
  .diagram { max-width: 100%; }
}
`

/* --- transform -------------------------------------------------------- */

const html = await readFile(SRC, "utf8")

/* 1. split off the report-specific stylesheet, keeping fonts + tokens intact */
const TOKENS_END = "@media (max-width: 700px) { main { padding: 10px; } }"
const tokensEnd = html.indexOf(TOKENS_END)
const styleEnd = html.indexOf("</style>", tokensEnd)
if (tokensEnd < 0 || styleEnd < 0) throw new Error("could not locate the token block")

const head = html.slice(0, tokensEnd + TOKENS_END.length)
const tail = html.slice(styleEnd)

/* 2. isolate body content and the inline script */
const bodyStart = tail.indexOf("<main>") + "<main>".length
const bodyEnd = tail.indexOf("</main>")
const scriptStart = tail.indexOf("<script>")
const scriptEnd = tail.indexOf("</script>") + "</script>".length
let content = tail.slice(bodyStart, bodyEnd)
let script = tail.slice(scriptStart, scriptEnd)
const closing = tail.slice(scriptEnd)
const headTail = tail.slice("</style>".length, tail.indexOf("<main>"))

/* 3. lift the header and lede out of the scrolling column */
const headerMatch = content.match(/<div class="report-header">[\s\S]*?<\/div>/)
const ledeMatch = content.match(/<p class="lede">[\s\S]*?<\/p>/)
if (!headerMatch || !ledeMatch) throw new Error("could not locate header or lede")
const header = headerMatch[0]
const lede = ledeMatch[0]
content = content.replace(header, "").replace(lede, "")

/* 4. drop the explorer block; its search filtered six huge sections and was a
      no-op for its own placeholder examples, and the picker moves into the
      taxonomy section where the forms it names actually live. */
const explorerMatch = content.match(/<section class="report-explorer"[\s\S]*?<\/section>/)
if (!explorerMatch) throw new Error("could not locate the explorer section")
const taskSelect = explorerMatch[0].match(/<select id="task-picker">[\s\S]*?<\/select>/)[0]
content = content.replace(explorerMatch[0], "")

/* 5. front matter becomes a description list instead of one run-on paragraph */
content = content.replace(
  /<p>(<strong>Created:<\/strong>[\s\S]*?)<\/p>/,
  (match, inner) => {
    const parts = inner.split(/<strong>/).filter(Boolean)
    const rows = parts
      .map((part) => {
        const m = part.match(/^([\s\S]*?)<\/strong>([\s\S]*)$/)
        if (!m) return ""
        return `<dt>${m[1].trim()}</dt><dd>${m[2].trim()}</dd>`
      })
      .join("")
    return `<dl class="meta">${rows}</dl>`
  }
)

/* 6. move each section's id onto its own h2.
      v0 put the id on the section element and left the h2 anonymous, so no
      heading could be linked. Moving it keeps the report's seven existing
      cross-references working, because the h2 opens the section it named. */
const sectionIds = [...content.matchAll(/<section class="report-section"[^>]*id="([^"]+)"/g)].map(
  (m) => m[1]
)
for (const id of sectionIds) {
  content = content.replace(
    new RegExp(`(<section class="report-section" data-report-section) id="${id}">\\s*<h2>`),
    `$1>\n<h2 id="${id}">`
  )
}

/* 7. slugs and anchor links on every heading.
      The anchor renders its "#" from CSS content, so heading text is
      untouched and the parity gate still compares like with like.
      Section numbers come from a CSS counter for the same reason. */
const headings = []
content = content.replace(
  /<(h[2-5])(\s[^>]*)?>([\s\S]*?)<\/\1>/g,
  (match, tag, attrs = "", inner) => {
    const level = Number(tag[1])
    const existingId = (attrs || "").match(/id="([^"]+)"/)?.[1]
    let target = existingId
    if (!target) {
      target = slugify(inner)
      attrs = `${attrs || ""} id="${target}"`
    }
    stats.headingsSlugged += 1
    headings.push({ level, id: target, text: decode(stripTags(inner)).trim() })
    return `<${tag}${attrs}>${inner}<a class="anchor" href="#${target}" aria-label="Link to this heading"></a></${tag}>`
  }
)

/* --- tables --------------------------------------------------------- */

/* Give each table an accessible name by pointing at its nearest preceding
   heading. This adds no visible text, so the parity gate is unaffected. */
{
  let cursor = 0
  let lastHeadingId = null
  const out = []
  const tokenRe = /<(h[2-5])[^>]*id="([^"]+)"|<div class="table-wrap">/g
  let m
  while ((m = tokenRe.exec(content))) {
    out.push(content.slice(cursor, m.index))
    cursor = m.index + m[0].length
    if (m[1]) {
      lastHeadingId = m[2]
      out.push(m[0])
    } else {
      out.push(`<div class="table-wrap" data-name="${lastHeadingId ?? ""}">`)
    }
  }
  out.push(content.slice(cursor))
  content = out.join("")
}

/* Per-table decisions: wrap classes, identity columns, tall tables, glyphs. */
content = content.replace(/<div class="table-wrap"([^>]*)>([\s\S]*?)<\/div>/g, (match, wrapAttrs, tableHtml) => {
  const name = wrapAttrs.match(/data-name="([^"]*)"/)?.[1] ?? ""
  const headers = [...tableHtml.matchAll(/<button type="button" class="sort-button">([\s\S]*?)<span/g)].map(
    (m) => decode(stripTags(m[1])).trim()
  )
  const rowMatches = [...tableHtml.matchAll(/<tr data-row-id="[^"]*">[\s\S]*?<\/tr>/g)]
  const rows = rowMatches.map((m) => m[0])
  const firstCells = rows.map(
    (row) => decode(stripTags(row.match(/<td[^>]*>([\s\S]*?)<\/td>/)?.[1] ?? "")).trim()
  )
  const longestFirst = Math.max(0, ...firstCells.map((v) => v.length))
  const isTaxonomy = headers[0] === "Form"
  const isTwoCol = headers.length === 2
  const identityColumn = longestFirst <= 34

  let table = tableHtml

  /* the form glyph goes inside the existing Form cell, before its name, so no
     column and no cell text is added */
  if (isTaxonomy) {
    table = table.replace(/(<tr data-row-id="[^"]*">)<td>([\s\S]*?)<\/td>/g, (rowMatch, open, cell) => {
      const label = decode(stripTags(cell)).trim()
      const glyph = glyphFor(label)
      if (!glyph) throw new Error(`no glyph for form: ${label}`)
      stats.glyphsInjected += 1
      return `${open}<td class="form"><span class="form-cell">${glyph}<span class="label">${cell}</span></span></td>`
    })
  } else if (identityColumn) {
    table = table.replace(
      /(<tr data-row-id="[^"]*">)<td>/g,
      (rowMatch, open) => `${open}<td class="nw">`
    )
    stats.nowrapColumns += 1
  }

  /* the widest explanatory column gets a minimum width so it wraps into a
     readable measure instead of collapsing */
  if (headers.length >= 3) {
    table = table.replace(
      /<td>([\s\S]*?)<\/td>(\s*<td>[\s\S]*?<\/td>\s*<\/tr>)/g,
      (cellMatch, cell, rest) => `<td class="prose">${cell}</td>${rest}`
    )
  }

  const classes = []
  if (isTwoCol) classes.push("stack")
  if (classes.length) {
    table = table.replace("<table>", `<table class="${classes.join(" ")}">`)
  }
  if (name) {
    table = table.replace(/<table( class="[^"]*")?>/, (t, cls) =>
      `<table${cls ?? ""} aria-labelledby="${name}">`
    )
    stats.tablesNamed += 1
  }

  const tall = rows.length > 18
  if (tall) stats.tablesTall += 1
  const wrapClass = tall ? "table-wrap tall" : "table-wrap"
  const hint = `<p class="scroll-hint" aria-hidden="true">This table is wider than the column. Scroll it sideways, or focus it and use the arrow keys.</p>`
  return `<div class="${wrapClass}"${wrapAttrs.replace(/ data-name="[^"]*"/, "")} role="group" aria-labelledby="${name}" tabindex="-1">${table}</div>${hint}`
})

/* --- the chart picker, moved into the taxonomy section ---------------- */

const taxonomyGroupIds = new Map()
for (const h of headings) {
  const m = h.text.match(/^(\d+)\.\s/)
  if (m && /lookup|Comparison|Time and change|Distribution|Relationship|Composition|Hierarchy, network|Geography|Process, architecture|Specialized/.test(h.text)) {
    taxonomyGroupIds.set(m[1], { id: h.id, text: h.text })
  }
}
const TASK_GROUP = {
  lookup: "1",
  rank: "2",
  change: "3",
  distribution: "4",
  relationship: "5",
  tradeoff: "5",
  composition: "6",
  flow: "7",
  geography: "8",
  uncertainty: "4",
}
const taskGroupJson = JSON.stringify(
  Object.fromEntries(
    Object.entries(TASK_GROUP).map(([task, group]) => [
      task,
      taxonomyGroupIds.get(group) ?? null,
    ])
  )
)

const PICKER = `<aside class="picker" aria-labelledby="picker-title" data-v1-added="tool">
<h3 id="picker-title">Pick a chart by analytical task<a class="anchor" href="#picker-title" aria-label="Link to this heading"></a></h3>
<p>Choose the question the reader has to answer. The suggested form and its warning are read from this report's own dataset, and the link goes to the taxonomy group below that defines the named forms. The ten tasks here cover the eleven chart families; the fuller mapping, including hierarchy and process, is the chart-choice shortcut table in <a href="#${sectionIds[0]}">section 1</a>.</p>
<div class="picker-tools">
<label class="field">Analytical task${taskSelect}</label>
<button type="button" class="action" id="download-data">Download this report's dataset (JSON)</button>
</div>
<div id="recommendation" class="recommendation" aria-live="polite"></div>
</aside>`
stats.addedHeadings.push("Pick a chart by analytical task")

/* --- diagrams -------------------------------------------------------- */

const figure = (svgMarkup, caption) => {
  stats.diagrams += 1
  return `<figure class="figure" data-v1-added="diagram">${svgMarkup}<figcaption>${caption}</figcaption></figure>`
}

/* insert helper: place markup immediately after the given marker */
function insertAfter(marker, markup, label) {
  const at = content.indexOf(marker)
  if (at < 0) throw new Error(`insertion point not found: ${label}`)
  const cut = at + marker.length
  content = content.slice(0, cut) + markup + content.slice(cut)
}

/* diagram 1 sits with the ten-step pattern it draws */
insertAfter(
  "<li>Retain an exact table or download path for verification.</li>\n</ol>",
  figure(
    layeredChartShell(),
    "The ten-step layered chart shell, drawn. Numbered markers on the right match the list above. Note the two separations the pattern depends on: entity selection sits apart from the semantic filters that move the denominator, and display settings sit apart from anything that changes the data."
  ),
  "layered chart shell"
)

/* diagram 2 sits at the head of the control taxonomy */
insertAfter(
  '<section class="subsection"><h3 id="sec-4-control-taxonomy">4. Control taxonomy<a class="anchor" href="#sec-4-control-taxonomy" aria-label="Link to this heading"></a></h3>',
  figure(
    controlFamilies(),
    "The seven control families grouped by what a click actually changes. The first group moves the denominator, so coverage has to be restated; the second changes only the view of the same rows; the third changes appearance alone. Every family needs a reset."
  ),
  "control families"
)

/* diagram 3 sits with the reusable product specification */
insertAfter(
  '<section class="subsection"><h3 id="sec-8-reusable-product-specification">8. Reusable product specification<a class="anchor" href="#sec-8-reusable-product-specification" aria-label="Link to this heading"></a></h3>',
  figure(
    viewState(),
    "The view state a shareable chart has to capture, and what each output path must carry. The last three fields are provenance rather than reader preference: without units, metric version and a data-as-of stamp, an exported image or dataset cannot be checked later."
  ),
  "view state"
)

/* the picker goes after the taxonomy section's opening paragraph */
{
  const secStart = content.indexOf(`id="${sectionIds[1]}"`)
  const paraEnd = content.indexOf("</p>", secStart) + "</p>".length
  content = content.slice(0, paraEnd) + PICKER + content.slice(paraEnd)
}

/* --- per-section prev/next and the mark-clearing chip ----------------- */

const sectionTitles = headings.filter((h) => h.level === 2 && sectionIds.includes(h.id))
sectionIds.forEach((id, i) => {
  const prev = i > 0 ? sectionIds[i - 1] : null
  const next = i < sectionIds.length - 1 ? sectionIds[i + 1] : null
  const prevTitle = i > 0 ? sectionTitles[i - 1]?.text : null
  const nextTitle = next ? sectionTitles[i + 1]?.text : null
  const nav = `<nav class="section-nav" aria-label="Section navigation" data-v1-added="nav">${
    prev ? `<a href="#${prev}">Previous: ${prevTitle}</a>` : `<span></span>`
  }${next ? `<a href="#${next}">Next: ${nextTitle}</a>` : `<a href="#top">Back to top</a>`}</nav>`
  const marker = `id="${id}"`
  const at = content.indexOf(marker)
  const close = content.indexOf("</section>", content.indexOf("</section>", at) === at ? at : at)
  /* place the nav just before the section's own closing tag by counting depth */
  let depth = 0
  let scan = content.indexOf(">", at) + 1
  while (scan < content.length) {
    const open = content.indexOf("<section", scan)
    const shut = content.indexOf("</section>", scan)
    if (shut < 0) break
    if (open >= 0 && open < shut) {
      depth += 1
      scan = open + 8
    } else if (depth > 0) {
      depth -= 1
      scan = shut + 10
    } else {
      content = content.slice(0, shut) + nav + content.slice(shut)
      break
    }
  }
})

/* --- the sidebar outline -------------------------------------------- */

let secNo = 0
let subNo = 0
const tocItems = []
for (const h of headings) {
  if (h.level === 2 && sectionIds.includes(h.id)) {
    secNo += 1
    subNo = 0
    tocItems.push({ cls: "toc-2", num: String(secNo), id: h.id, text: h.text })
  } else if (h.level === 3 && secNo > 0 && h.id !== "picker-title") {
    subNo += 1
    tocItems.push({ cls: "toc-3", num: `${secNo}.${subNo}`, id: h.id, text: h.text })
  }
}
const toc = `<nav class="toc" aria-label="Report contents" data-open="false">
<button type="button" class="toc-toggle" aria-expanded="false">Contents</button>
<p class="toc-title">Contents</p>
<ol>${tocItems
  .map(
    (t) =>
      `<li class="${t.cls}"><a href="#${t.id}"><span class="num">${t.num}</span><span>${t.text}</span></a></li>`
  )
  .join("")}</ol>
</nav>`

/* --- assemble the body ---------------------------------------------- */

const marks = `<div class="marks" id="marks" data-active="false" role="status" aria-live="polite"><span id="marks-count"></span><button type="button" id="marks-clear">Clear marks</button></div>`

const body = `
<a class="skip" href="#doc">Skip to the report</a>
<main id="top">
  ${header}
  ${lede}
  <div class="shell">
${toc}
    <div class="doc" id="doc" tabindex="-1">${content}</div>
  </div>
  ${marks}
</main>
`

/* --- the inline script ---------------------------------------------- */

/* drop the search handler; everything else in the house interaction code is
   kept exactly as it was */
const SEARCH_BLOCK_START = "    const query = document.getElementById(\"report-search\")"
const searchAt = script.indexOf(SEARCH_BLOCK_START)
const searchEnd = script.indexOf("applySearch()", searchAt) + "applySearch()".length
if (searchAt < 0 || searchEnd < 0) throw new Error("could not locate the search block")
script = script.slice(0, searchAt) + script.slice(searchEnd)

/* the recommender now links into the taxonomy */
script = script.replace(
  /    const updateRecommendation = \(\) => \{[\s\S]*?\n    \}\n/,
  `    const taskGroups = ${taskGroupJson}
    const updateRecommendation = () => {
      const rules = reportData.recommendationRules.filter((rule) => rule.task === task.value)
      const nodes = rules.map((rule) => {
        const paragraph = document.createElement("p")
        const strong = document.createElement("strong")
        strong.textContent = rule.recommend
        const warn = document.createElement("span")
        warn.className = "warn"
        warn.textContent = rule.warning
        paragraph.append(strong, " · " + rule.data, document.createElement("br"), warn)
        return paragraph
      })
      const group = taskGroups[task.value]
      if (group) {
        const link = document.createElement("p")
        const anchor = document.createElement("a")
        anchor.href = "#" + group.id
        anchor.textContent = "Definitions for these forms: " + group.text
        link.append(anchor)
        nodes.push(link)
      }
      recommendation.replaceChildren(...nodes)
    }
`
)

const V1_SCRIPT = `
    /* ---- v1 behaviour ------------------------------------------------ */

    /* Dataset download. The report already carries this object; v0 embedded it
       and read one key from it, with no way for a reader to get at it. */
    const downloadButton = document.getElementById("download-data")
    downloadButton?.addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "datavis-best-practices.json"
      document.body.append(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    })

    /* Sideways-scroll affordance. Wraps that actually overflow get the edge
       fade, the written hint, and a tab stop so a keyboard can scroll them.
       Wraps that fit get none of it, and no stray tab stop. */
    const wraps = [...document.querySelectorAll(".table-wrap")]
    const measureWraps = () => {
      for (const wrap of wraps) {
        const overflowing = wrap.scrollWidth - wrap.clientWidth > 1
        wrap.dataset.overflow = String(overflowing)
        wrap.tabIndex = overflowing ? 0 : -1
      }
    }
    measureWraps()
    addEventListener("resize", measureWraps)

    /* Mark counter for row highlighting. v0 made all 542 rows clickable with
       no cursor, no hover state and no way to clear. Behaviour is unchanged;
       it is now visible and reversible. Nothing is stored. */
    const marksBar = document.getElementById("marks")
    const marksCount = document.getElementById("marks-count")
    const updateMarks = () => {
      const marked = document.querySelectorAll("tbody tr.highlighted").length
      marksBar.dataset.active = String(marked > 0)
      marksCount.textContent = marked === 1 ? "1 row marked" : marked + " rows marked"
    }
    document.addEventListener("click", updateMarks)
    document.getElementById("marks-clear")?.addEventListener("click", () => {
      for (const row of document.querySelectorAll("tbody tr.highlighted")) {
        row.classList.remove("highlighted")
      }
      updateMarks()
    })

    /* Sidebar outline: highlight the section being read. */
    const tocLinks = new Map(
      [...document.querySelectorAll(".toc a[href^='#']")].map((a) => [a.getAttribute("href").slice(1), a])
    )
    const targets = [...tocLinks.keys()]
      .map((id) => document.getElementById(id))
      .filter(Boolean)
    let current = null
    const setCurrent = (id) => {
      if (id === current) return
      if (current) tocLinks.get(current)?.removeAttribute("aria-current")
      current = id
      const link = tocLinks.get(id)
      if (!link) return
      link.setAttribute("aria-current", "true")
      const rail = document.querySelector(".toc")
      if (rail && rail.scrollHeight > rail.clientHeight) {
        const top = link.offsetTop - rail.clientHeight / 2
        rail.scrollTo({ top: Math.max(0, top) })
      }
    }
    if ("IntersectionObserver" in window) {
      const seen = new Set()
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) seen.add(entry.target.id)
            else seen.delete(entry.target.id)
          }
          const first = targets.find((el) => seen.has(el.id))
          if (first) setCurrent(first.id)
        },
        { rootMargin: "0px 0px -70% 0px" }
      )
      for (const el of targets) observer.observe(el)
    }

    /* Contents disclosure on narrow screens. */
    const rail = document.querySelector(".toc")
    document.querySelector(".toc-toggle")?.addEventListener("click", (event) => {
      const open = rail.dataset.open !== "true"
      rail.dataset.open = String(open)
      event.currentTarget.setAttribute("aria-expanded", String(open))
    })
`
script = script.replace(/\n  \}\)\(\)\n<\/script>$/, `\n${V1_SCRIPT}\n  })()\n</script>`)

/* --- write ----------------------------------------------------------- */

const out =
  head +
  V1_CSS +
  glyphCss +
  diagramCss +
  "\n" +
  "</style>" +
  headTail +
  body +
  script +
  closing

await writeFile(OUT, out, "utf8")

console.log(
  JSON.stringify(
    {
      output: path.relative(process.cwd(), OUT),
      bytes: Buffer.byteLength(out, "utf8"),
      glyphsAvailable: glyphCount,
      ...stats,
      tocEntries: tocItems.length,
    },
    null,
    2
  )
)
