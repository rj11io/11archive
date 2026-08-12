#!/usr/bin/env node
// Checks that report.html, the markdown chapters, and data.json agree.
//
// Run:  node verify.mjs
// Exit: 0 when every check passes, 1 otherwise.
//
// Checks performed:
//   1. Every figure display string in data.json appears in report.html.
//   2. Every figure has period, source, url, confidence, and a chapter number.
//   3. Every chapter referenced by a figure exists as a markdown file.
//   4. Every markdown file listed in README.md exists.
//   5. Every internal markdown link resolves to a file that exists.
//   6. No em dashes anywhere (house style).
//   7. report.html has no external resource references (must stay self-contained).

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const read = (name) => readFileSync(resolve(here, name), 'utf8');

const failures = [];
const passes = [];
const fail = (msg) => failures.push(msg);
const pass = (msg) => passes.push(msg);

const data = JSON.parse(read('data.json'));
const html = read('report.html');

const chapterFiles = readdirSync(here).filter((f) => /^\d\d-.*\.md$/.test(f)).sort();
const markdownFiles = ['README.md', 'GLOSSARY.md', 'SOURCES.md', ...chapterFiles];

// 1 and 2. Figures.
let figureMisses = 0;
for (const fig of data.figures) {
  for (const field of ['id', 'label', 'display', 'period', 'source', 'url', 'confidence', 'sourceClass', 'chapter']) {
    if (fig[field] === undefined || fig[field] === null || fig[field] === '') {
      fail(`${fig.id || '(no id)'}: missing required field "${field}"`);
    }
  }
  if (!data.confidenceScale[fig.confidence]) {
    fail(`${fig.id}: confidence "${fig.confidence}" is not in confidenceScale`);
  }
  if (!data.sourceClasses[fig.sourceClass]) {
    fail(`${fig.id}: sourceClass "${fig.sourceClass}" is not in sourceClasses`);
  }
  // Normalise the entity-escaped ampersand before matching.
  const haystack = html.replace(/&amp;/g, '&');
  if (fig.display && !haystack.includes(fig.display)) {
    fail(`${fig.id}: display value "${fig.display}" is not present in report.html`);
    figureMisses += 1;
  }
}
if (figureMisses === 0) pass(`all ${data.figures.length} figure display values appear in report.html`);

// 3. Chapters referenced by figures exist.
for (const fig of data.figures) {
  const prefix = String(fig.chapter).padStart(2, '0');
  if (!chapterFiles.some((f) => f.startsWith(`${prefix}-`))) {
    fail(`${fig.id}: references chapter ${fig.chapter}, but no ${prefix}-*.md file exists`);
  }
}
pass(`${chapterFiles.length} chapter files found: ${chapterFiles.join(', ')}`);

// 4. Files listed in README exist.
const readme = read('README.md');
for (const name of markdownFiles.concat(['report.html', 'data.json', 'verify.mjs'])) {
  if (name !== 'README.md' && !readme.includes(name)) fail(`README.md does not link to ${name}`);
  if (!existsSync(resolve(here, name))) fail(`missing file: ${name}`);
}
pass('README.md links every artifact, and every artifact exists');

// 5. Internal markdown links resolve.
let brokenLinks = 0;
for (const file of markdownFiles) {
  const text = read(file);
  const links = [...text.matchAll(/\]\(([^)#\s]+\.(?:md|html|json|mjs))(?:#[^)]*)?\)/g)].map((m) => m[1]);
  for (const link of links) {
    if (/^https?:/.test(link)) continue;
    if (!existsSync(resolve(here, link))) {
      fail(`${file}: broken internal link to ${link}`);
      brokenLinks += 1;
    }
  }
}
if (brokenLinks === 0) pass('every internal markdown link resolves');

// 6. House style: no em dashes.
let emDashes = 0;
for (const file of markdownFiles.concat(['report.html', 'data.json'])) {
  const text = read(file);
  const count = (text.match(/—/g) || []).length;
  if (count > 0) {
    fail(`${file}: contains ${count} em dash(es)`);
    emDashes += count;
  }
}
if (emDashes === 0) pass('no em dashes in any artifact');

// 7. report.html must be self-contained.
const externalRefs = [
  ...html.matchAll(/<(?:script|link|img|iframe|source)\b[^>]*\b(?:src|href)=["'](https?:\/\/[^"']+)["']/gi),
];
if (externalRefs.length > 0) {
  for (const ref of externalRefs) fail(`report.html loads an external resource: ${ref[1]}`);
} else {
  pass('report.html loads no external resources');
}

// Report.
for (const p of passes) console.log(`  ok   ${p}`);
if (failures.length === 0) {
  console.log(`\nPASS  ${data.figures.length} figures, ${data.dates.length} dated events, ${markdownFiles.length} markdown files.`);
  process.exit(0);
}
for (const f of failures) console.error(`  FAIL ${f}`);
console.error(`\nFAIL  ${failures.length} problem(s).`);
process.exit(1);
