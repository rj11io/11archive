#!/usr/bin/env node
/* Deterministic renderer: the Markdown chapters in this directory -> report.html
 *
 * The HTML adds navigation and table interaction. It adds no information the
 * Markdown does not carry: every heading, paragraph, list item, table cell and
 * code block comes from the source files, in source order.
 *
 * House contract followed: 11agi-core-reports-styleguide. Tokens, embedded
 * fonts and the table interaction script are copied verbatim from that skill's
 * references, so this file never reimplements them.
 *
 * Requires ELEVEN_AGI_REPO to point at the local 11agi checkout.
 *
 *   node build.mjs
 *
 * Output is byte-identical across runs except the generation timestamp line.
 */

import { readFileSync, writeFileSync, readdirSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))

/* --- house assets ------------------------------------------------------ */

const agiRepo = process.env.ELEVEN_AGI_REPO
if (!agiRepo) {
  console.error("ELEVEN_AGI_REPO is not set. It must contain the absolute path to the 11agi checkout.")
  process.exit(1)
}
const styleguide = path.join(agiRepo, "v0/plugins/11agi-core/skills/11agi-core-reports-styleguide/references")
const tokensCss = readFileSync(path.join(styleguide, "tokens.css"), "utf8")
const fontsCss = readFileSync(path.join(styleguide, "fonts.css"), "utf8")
const templateHtml = readFileSync(path.join(styleguide, "report-template.html"), "utf8")

const scriptMatch = /<script>[\s\S]*?<\/script>/.exec(templateHtml)
if (!scriptMatch) {
  console.error("Could not find the interaction script in the house report template.")
  process.exit(1)
}
const interactionScript = scriptMatch[0]

/* --- source chapters --------------------------------------------------- */

const REPORT_TITLE = "Code analytics: what you can measure locally and from GitHub"
const chapterFiles = readdirSync(here)
  .filter((f) => /^\d{2}-.*\.md$/.test(f))
  .sort()

if (chapterFiles.length === 0) {
  console.error("No numbered chapter files found.")
  process.exit(1)
}

/* --- markdown -> html -------------------------------------------------- */

const escapeHtml = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

/* Section ids are prefixed. A bare "04-github-api-surface" is a legal HTML id
   and a working fragment link, but it is not a valid CSS selector, so
   document.querySelector("#04-...") throws and no :target rule can be written. */
const chapterAnchor = (file) => "sec-" + file.replace(/\.md$/, "")

/* Inline formatting. Code spans are extracted first and restored last so that
   nothing inside them is treated as markup. */
function inline(text) {
  const spans = []
  let out = text.replace(/`([^`]+)`/g, (_m, code) => {
    spans.push(code)
    return `\u0001${spans.length - 1}\u0001`
  })
  out = escapeHtml(out)
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label, href) => {
    const target = /^(\d{2}-[a-z0-9-]+)\.md$/.test(href) ? `#sec-${href.replace(/\.md$/, "")}` : href
    const external = /^https?:/.test(target)
    const rel = external ? ' target="_blank" rel="noopener noreferrer"' : ""
    return `<a href="${target}"${rel}>${label}</a>`
  })
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  out = out.replace(/\u0001(\d+)\u0001/g, (_m, i) => `<code>${escapeHtml(spans[Number(i)])}</code>`)
  return out
}

const slugCounts = new Map()
function slug(raw) {
  let base =
    raw
      .toLowerCase()
      .replace(/`/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "section"
  if (/^\d/.test(base)) base = `sec-${base}`
  const seen = slugCounts.get(base) ?? 0
  slugCounts.set(base, seen + 1)
  return seen ? `${base}-${seen + 1}` : base
}

let tableIndex = 0

function renderTable(lines) {
  tableIndex += 1
  const cells = (line) =>
    line
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((c) => c.trim())
  const header = cells(lines[0])
  const bodyRows = lines.slice(2).map(cells)
  const th = header
    .map(
      (h) =>
        `<th scope="col" aria-sort="none"><button type="button" class="sort-button">${inline(
          h,
        )}<span class="sort-indicator" aria-hidden="true"></span></button><span class="col-resize" aria-hidden="true"></span></th>`,
    )
    .join("")
  const tr = bodyRows
    .map(
      (row, r) =>
        `<tr data-row-id="t${tableIndex}-r${r}">${row.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`,
    )
    .join("\n")
  return `<div class="table-wrap"><table>\n<thead><tr>${th}</tr></thead>\n<tbody>\n${tr}\n</tbody>\n</table></div>`
}

/* Renders one chapter body. `demote` shifts heading levels so the combined
   document keeps a single h1. */
function renderMarkdown(src, demote) {
  const lines = src.split("\n")
  const out = []
  const headings = []
  let i = 0

  const flushList = (items, ordered) => {
    const tag = ordered ? "ol" : "ul"
    out.push(`<${tag}>${items.map((it) => `<li>${inline(it)}</li>`).join("")}</${tag}>`)
  }

  while (i < lines.length) {
    const line = lines[i]

    if (!line.trim()) {
      i += 1
      continue
    }

    /* fenced code */
    if (/^```/.test(line)) {
      const fence = []
      i += 1
      while (i < lines.length && !/^```/.test(lines[i])) {
        fence.push(lines[i])
        i += 1
      }
      i += 1
      out.push(`<pre><code>${escapeHtml(fence.join("\n"))}</code></pre>`)
      continue
    }

    /* heading */
    const h = /^(#{1,6})\s+(.*)$/.exec(line)
    if (h) {
      const level = Math.min(6, h[1].length + demote)
      const text = h[2].trim()
      const id = slug(text)
      headings.push({ level, text, id })
      out.push(`<h${level} id="${id}">${inline(text)}</h${level}>`)
      i += 1
      continue
    }

    /* table */
    if (/^\|/.test(line) && i + 1 < lines.length && /^\|[\s:|-]+\|?\s*$/.test(lines[i + 1])) {
      const block = []
      while (i < lines.length && /^\|/.test(lines[i])) {
        block.push(lines[i])
        i += 1
      }
      out.push(renderTable(block))
      continue
    }

    /* lists */
    if (/^\s*[-*]\s+/.test(line)) {
      const items = []
      while (i < lines.length && (/^\s*[-*]\s+/.test(lines[i]) || (items.length && /^\s{2,}\S/.test(lines[i])))) {
        if (/^\s*[-*]\s+/.test(lines[i])) items.push(lines[i].replace(/^\s*[-*]\s+/, ""))
        else items[items.length - 1] += " " + lines[i].trim()
        i += 1
      }
      flushList(items, false)
      continue
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const items = []
      while (i < lines.length && (/^\s*\d+\.\s+/.test(lines[i]) || (items.length && /^\s{2,}\S/.test(lines[i])))) {
        if (/^\s*\d+\.\s+/.test(lines[i])) items.push(lines[i].replace(/^\s*\d+\.\s+/, ""))
        else items[items.length - 1] += " " + lines[i].trim()
        i += 1
      }
      flushList(items, true)
      continue
    }

    /* blockquote */
    if (/^>\s?/.test(line)) {
      const quote = []
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quote.push(lines[i].replace(/^>\s?/, ""))
        i += 1
      }
      out.push(`<blockquote>${inline(quote.join(" "))}</blockquote>`)
      continue
    }

    /* paragraph */
    const para = []
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,6})\s/.test(lines[i]) &&
      !/^```/.test(lines[i]) &&
      !/^\|/.test(lines[i]) &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !/^>\s?/.test(lines[i])
    ) {
      para.push(lines[i].trim())
      i += 1
    }
    out.push(`<p>${inline(para.join(" "))}</p>`)
  }

  return { html: out.join("\n"), headings }
}

/* --- assemble ---------------------------------------------------------- */

const sections = []
const toc = []

for (const file of chapterFiles) {
  const src = readFileSync(path.join(here, file), "utf8")
  const anchor = chapterAnchor(file)
  const titleMatch = /^#\s+(.*)$/m.exec(src)
  const title = titleMatch ? titleMatch[1].trim() : anchor
  const body = src.replace(/^#\s+.*$/m, "").trimStart()
  const { html, headings } = renderMarkdown(body, 2)
  slugCounts.set(anchor, 1)
  sections.push(`<section id="${anchor}">\n<h2>${inline(title)}</h2>\n${html}\n</section>`)
  toc.push({ anchor, title, subs: headings.filter((h) => h.level === 3) })
}

const tocHtml = `<nav class="toc" aria-label="Contents">
<ol>
${toc
  .map(
    (t) =>
      `<li><a href="#${t.anchor}">${inline(t.title)}</a>${
        t.subs.length
          ? `<ul>${t.subs.map((s) => `<li><a href="#${s.id}">${inline(s.text)}</a></li>`).join("")}</ul>`
          : ""
      }</li>`,
  )
  .join("\n")}
</ol>
</nav>`

const extraCss = `
h4 { margin: .7rem 0 .4rem; font-size: .9rem; font-weight: 750; }
pre { margin: .55rem 0 .9rem; padding: .6rem .7rem; overflow-x: auto; border: 1px solid var(--border); background: var(--muted); }
pre code { padding: 0; background: transparent; font-size: .8rem; line-height: 1.5; }
section { margin: 0 0 1.6rem; padding-top: .4rem; border-top: 1px solid var(--border); }
section:first-of-type { border-top: 0; }
.toc { margin: 0 0 1.2rem; padding: .7rem .8rem; border: 1px solid var(--border); background: var(--card); font-size: .82rem; }
.toc ol { margin: 0; padding-left: 1.1rem; }
.toc ul { margin: .15rem 0 .35rem; padding-left: 1rem; list-style: none; }
.toc li { margin: .15rem 0; color: var(--muted-foreground); }
.toc a { text-decoration: none; }
.toc a:hover, .toc a:focus-visible { text-decoration: underline; }
.dts { margin: 0 0 .8rem; color: var(--muted-foreground); font-size: .82rem; }
.skip { position: absolute; left: -9999px; top: 0; padding: .5rem .75rem; border: 1px solid var(--primary); background: var(--card); color: var(--foreground); }
.skip:focus { left: .5rem; top: .5rem; }
.sort-button:focus-visible { outline: 2px solid var(--primary); outline-offset: -2px; }
#theme-toggle:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
`

const generatedAt = new Date().toISOString().replace(/\.\d{3}Z$/, "Z")

const html = `<html lang="en" class="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(REPORT_TITLE)}</title>
<style>
${fontsCss}
${tokensCss}
${extraCss}
</style>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<main id="main">
<div class="report-header"><h1>${escapeHtml(REPORT_TITLE)}</h1><button type="button" id="theme-toggle" aria-pressed="true" aria-label="Toggle color theme" title="Toggle color theme">☀</button></div>
<p class="dts">Research report. Observations dated 2026-08-11. Every number was produced by running the command shown, on the repository named. Machine-readable companion: <a href="data.json">data.json</a>.</p>
${tocHtml}
${sections.join("\n")}
<p class="generation-message">Generated ${generatedAt} from the Markdown chapters in this report directory.</p>
</main>
${interactionScript}
</body>
</html>
`

writeFileSync(path.join(here, "report.html"), html)
console.log(
  `report.html written: ${chapterFiles.length} chapters, ${tableIndex} tables, ${html.length} bytes`,
)
