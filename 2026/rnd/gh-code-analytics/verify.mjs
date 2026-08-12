#!/usr/bin/env node
/* Cross-format parity gate: report.html must carry every heading and every
 * table cell from the Markdown chapters, in source order, with nothing added.
 *
 *   node verify.mjs
 *
 * Exits non-zero on any mismatch.
 */

import { readFileSync, readdirSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))
const chapters = readdirSync(here).filter((f) => /^\d{2}-.*\.md$/.test(f)).sort()
const html = readFileSync(path.join(here, "report.html"), "utf8")

const decode = (s) =>
  s
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()

const stripMd = (s) =>
  s
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .trim()

/* --- expected from markdown ------------------------------------------- */

const expectedHeadings = []
const expectedCells = []

for (const file of chapters) {
  const src = readFileSync(path.join(here, file), "utf8")
  const lines = src.split("\n")
  let inFence = false
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]
    if (/^```/.test(line)) { inFence = !inFence; continue }
    if (inFence) continue
    const h = /^#{1,6}\s+(.*)$/.exec(line)
    if (h) { expectedHeadings.push(stripMd(h[1])); continue }
    if (/^\|/.test(line) && !/^\|[\s:|-]+\|?\s*$/.test(line)) {
      const cells = line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => stripMd(c))
      expectedCells.push(...cells)
    }
  }
}

/* --- actual from html --------------------------------------------------- */

const actualHeadings = [...html.matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/g)]
  .map((m) => decode(m[2]))
  .filter((t) => t !== "Code analytics: what you can measure locally and from GitHub")

const actualCells = [...html.matchAll(/<(th|td)\b[^>]*>([\s\S]*?)<\/\1>/g)].map((m) => decode(m[2]))

/* --- compare ------------------------------------------------------------ */

let failures = 0
const fail = (msg) => { console.error("FAIL: " + msg); failures += 1 }

if (actualHeadings.length !== expectedHeadings.length) {
  fail(`heading count ${actualHeadings.length} != markdown ${expectedHeadings.length}`)
}
for (let i = 0; i < Math.min(actualHeadings.length, expectedHeadings.length); i += 1) {
  if (actualHeadings[i] !== expectedHeadings[i]) {
    fail(`heading ${i}: html "${actualHeadings[i]}" != md "${expectedHeadings[i]}"`)
    break
  }
}

if (actualCells.length !== expectedCells.length) {
  fail(`table cell count ${actualCells.length} != markdown ${expectedCells.length}`)
}
for (let i = 0; i < Math.min(actualCells.length, expectedCells.length); i += 1) {
  if (actualCells[i] !== expectedCells[i]) {
    fail(`cell ${i}: html "${actualCells[i]}" != md "${expectedCells[i]}"`)
    break
  }
}

if (/\u0001/.test(html)) fail("code-span placeholder sentinel leaked into the output")
if (/&lt;(strong|code|a) /.test(html)) fail("inline markup was double-escaped")
if (!/id="sec-00-executive-brief"/.test(html)) fail("chapter anchors missing")
if ((html.match(/href="#sec-\d{2}-[a-z-]+"/g) || []).length < chapters.length) fail("cross-chapter links not rewritten to anchors")
if (/href="\d{2}-[a-z-]+\.md"/.test(html)) fail("a raw .md link survived into the html")

console.log(`headings: ${actualHeadings.length}, table cells: ${actualCells.length}, chapters: ${chapters.length}`)
console.log(failures === 0 ? "PARITY: PASS" : `PARITY: ${failures} failure(s)`)
process.exit(failures === 0 ? 0 : 1)
