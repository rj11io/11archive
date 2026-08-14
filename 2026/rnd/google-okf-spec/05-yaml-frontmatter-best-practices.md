# YAML frontmatter and its best practices

OKF's entire structured surface is YAML frontmatter. Get it wrong and the format's
promises fail quietly, without an error message. This section is the practical guide:
what frontmatter is, the ways YAML surprises people, and the rules that avoid all of
it.

Everything here is demonstrated with real output from real parsers. The commands are
in [11-methodology-and-sources.md](11-methodology-and-sources.md).

## What frontmatter is

A block of structured labels at the very top of a text file, fenced by three hyphens:

```markdown
---
type: Metric
title: Gross Margin
tags: [finance, margin]
---

The body starts here.
```

The convention comes from Jekyll, the static site generator Tom Preston-Werner released
in 2008, and spread from there to Hugo, Obsidian, Astro, MkDocs, Notion exports, and
now OKF.

**There is no standard for it.** No RFC, no W3C note, nothing. YAML has a formal
specification; the practice of putting YAML between two `---` lines at the top of a
Markdown file does not. Every tool implements its own reader, and they disagree at the
edges. That is the root cause of most of what follows.

## Who these bugs actually hurt

Worth settling before the details, because it changes how much you should care.

OKF's headline reader is a language model, and a language model receives the raw bytes.
It never sees `NO` turn into `false`, because nothing parses the YAML on its behalf. It
reads the word "NO".

Everything else in the chain does parse: validators, viewers, search indexes, graph
builders, servers, and any script that filters by `tags` or checks `stale_after`. So
every problem in this section is a **tooling** problem, not a comprehension problem. That
makes them less alarming than they first sound, and more insidious: they surface as a
viewer with no edges, an index missing a document, or a build that dies, rather than as a
wrong answer you can trace.

## Why YAML surprises people

YAML tries to guess what you meant. Write `count: 5` and you get the number 5, not the
text "5". That is convenient, and it is also the whole problem: the guessing rules are
larger and stranger than almost anyone expects, and **they differ between YAML version
1.1 and version 1.2.**

Version 1.1 is from 2005. Version 1.2 is from 2009. Seventeen years later, the most
widely used Python library still implements 1.1.

Here is the same input through PyYAML, which follows YAML 1.1, and ruamel.yaml, which
follows 1.2:

| Input | PyYAML (YAML 1.1) | ruamel.yaml (YAML 1.2) | Differs |
|---|---|---|---|
| `country: NO` | `False` (bool) | `'NO'` (str) | **yes** |
| `enabled: yes` | `True` (bool) | `'yes'` (str) | **yes** |
| `archived: off` | `False` (bool) | `'off'` (str) | **yes** |
| `build: 010` | `8` (int) | `10` (int) | **yes** |
| `zip: 02134` | `1116` (int) | `2134` (int) | **yes** |
| `duration: 22:53` | `1373` (int) | `'22:53'` (str) | **yes** |
| `version: 1.10` | `1.1` (float) | `1.1` (float) | no |
| `title: NULL` | `None` | `None` | no |
| `pi: .5` | `0.5` (float) | `0.5` (float) | no |
| `at: 2026-05-28T14:30:00Z` | `datetime` | `datetime` | no |
| `at: '2026-05-28T14:30:00Z'` | `'2026-05-28T14:30:00Z'` (str) | same | no |
| `tags: a, b, c` | `'a, b, c'` (str) | same | no |

Read that table twice. Every "yes" row is a bug waiting in a file that looks completely
reasonable.

### The Norway problem

The famous one. In YAML 1.1, `y`, `yes`, `on`, and `true` all mean true, and `n`, `no`,
`off`, and `false` all mean false. So:

```yaml
countries: [DK, NL, NO, SE]
```

parses in PyYAML as `['DK', 'NL', False, 'SE']`. Norway becomes the boolean false. It
is named after this exact failure, which has bitten real production systems.

YAML 1.2 removed all of it. Only `true` and `false` are booleans. But PyYAML has not
moved to 1.2, so in Python the problem is still live in 2026.

### Leading zeros are octal, and octal changed

`zip: 02134` is Boston's postcode. PyYAML reads the leading zero as "this is base 8"
and returns `1116`. ruamel.yaml, following YAML 1.2, requires `0o` for octal and returns
`2134`.

So the same file gives you two different wrong-or-right answers depending on the
library. Neither gives you the string you wanted.

### Colons make sexagesimal numbers

`duration: 22:53` is base-60 in YAML 1.1: 22 times 60, plus 53, equals `1373`. This
catches durations, times of day, and version strings with colons. YAML 1.2 dropped it
and returns the string.

### Version numbers lose their trailing zero

`version: 1.10` is a float in both versions, and floats do not keep trailing zeros, so
it becomes `1.1`. Version 1.10 and version 1.1 are different releases. This one is
silent in every YAML version.

### Keys are guessed too, not just values

This surprises people who have learned to quote values:

| Input | PyYAML key | ruamel key |
|---|---|---|
| `on: push` | `True` (bool) | `'on'` (str) |
| `no: value` | `False` (bool) | `'no'` (str) |
| `yes: value` | `True` (bool) | `'yes'` (str) |
| `null: v` | `None` | `None` |

This is why GitHub Actions workflow files are a known trap: the `on:` key that every
workflow starts with is the boolean true in a YAML 1.1 parser. Looking up
`config["on"]` returns nothing, because the key is `True`.

### Duplicate keys are silently accepted

```python
>>> yaml.safe_load("type: A\ntype: B")
{'type': 'B'}
```

No error, no warning. The last one wins. In a file an agent has edited several times,
this is a plausible accident and an invisible one.

### Tabs are illegal

YAML forbids tab characters for indentation. An editor configured to insert tabs
produces a file that fails to parse with a message about "scanning for the next token",
which does not obviously mean "you have a tab".

## Dates, and why OKF is affected

Unquoted dates and timestamps become date objects in **both** YAML versions:

```python
>>> yaml.safe_load("at: 2026-05-28T14:30:00Z")
{'at': datetime.datetime(2026, 5, 28, 14, 30, tzinfo=timezone.utc)}

>>> yaml.safe_load("at: '2026-05-28T14:30:00Z'")
{'at': '2026-05-28T14:30:00Z'}
```

One quote character changes the type your program receives.

OKF's specification writes timestamps unquoted in every example. Google's own reference
agent writes them quoted. The result, measured in
[06-conformance-audit.md](06-conformance-audit.md): `generated.at` arrives as a
`datetime` in one of Google's bundles and as a `str` in the other three. Any reader has
to handle both.

Worse, the conversion is not reversible. Round-tripping through PyYAML mangles the
format:

```
in:  at: 2026-05-28T14:30:00Z
out: at: 2026-05-28 14:30:00+00:00
```

The `T` separator and the `Z` suffix are gone. The spec asks for ISO 8601; the output is
not ISO 8601 in the strict reading.

**Rule: quote every timestamp and every date, and parse it in your own code.**

## The delimiter hazards

Four ways the `---` fence itself goes wrong.

### A `---` inside the block ends it early

Most readers, including OKF's, scan for the next line that is exactly `---`. A `---`
inside a multi-line string matches:

```markdown
---
type: Metric
description: |
  a horizontal rule:
  ---
  more text
title: X
---
```

OKF's Python parser stops at the indented `---`. The frontmatter **parses successfully**
as `{'type': 'Metric', 'description': 'a horizontal rule:'}`. The `title` is gone. No
error is raised. This is the most dangerous failure mode in this document, because
everything downstream looks fine.

### Two Google implementations disagree about this exact case

The strongest evidence that "it's just YAML frontmatter" specifies nothing sits inside
Google's own repository, which ships two implementations of the format.

| | Python reference agent | TypeScript tool in `toolbox/mdcode` |
|---|---|---|
| Opening fence | `lines[0].strip() != "---"` | `lines[0] !== '---'` |
| Closing fence | `lines[i].strip() == "---"` | `lines.indexOf('---', 1)` |
| YAML library | PyYAML, YAML 1.1 | `yaml` 2.x, YAML 1.2 core |
| Indented `---` inside a block | **Closes the frontmatter** | **Does not close it** |
| `at: 2026-06-30T14:00:00Z` | `datetime` object | plain string |

Feed both the example above. The Python one returns a two-field header and silently
drops `title`. The TypeScript one reads the block to the real end and returns everything.
Same bytes, same repository, two different documents.

The type divergence is the same story: YAML 1.2's core schema has no timestamp type, so
the JavaScript library returns a string where PyYAML returns a `datetime`. Any consumer
written against one and tested against the other will break.

This is not a criticism of either implementation. Both are reasonable readings of a
convention that no document defines. It is the argument for rule 1 below: **quote
everything, and never let a bare `---` near your frontmatter**, because the format cannot
protect you.

### A byte order mark disables frontmatter entirely

A byte order mark is an invisible marker some Windows editors put at the start of a
file. OKF's parser checks that the first line is exactly `---`; with the marker the line
is `﻿---` and the check fails. The file is treated as having no frontmatter at all.

### Frontmatter must be at line 1

A blank line, a comment, or a stray character before the opening `---` and most readers
stop looking. Nothing signals this.

### Windows line endings

Some readers match `---\n` literally and fail on `---\r\n`. Configure Git with
`core.autocrlf=input` and keep bundles in LF.

## Multi-line text

Two styles, and the difference matters:

```yaml
literal: |
  line one
  line two          # newlines kept

folded: >
  line one
  line two          # becomes "line one line two"
```

Use `|` for anything where line breaks matter: SQL, code, addresses. Use `>` for a long
paragraph you want wrapped in the source but joined on read.

Both keep a single trailing newline by default. Add `-` to strip it (`|-`) or `+` to
keep all of them (`|+`).

## Compact style and round-trip stability

YAML has two ways to write the same structure:

```yaml
generated: { by: agent/v1, at: '2026-06-20T22:53:05Z' }   # flow, compact
```

```yaml
generated:                                                 # block
  by: agent/v1
  at: '2026-06-20T22:53:05Z'
```

OKF's spec uses the compact form throughout. This is a real readability win in a
frontmatter block that would otherwise run twenty lines.

The catch: **most YAML writers destroy it.** Python's `yaml.safe_dump` always emits
block style. Any tool that reads a file and writes it back converts every compact
mapping to a block one, reorders nothing but reformats everything.

Measured on Google's own bundle in [06](06-conformance-audit.md): reading and writing
one unchanged file produced a 52-line diff.

**Rule: if files will be rewritten by tools and read by people, use a round-trip
library.** In Python that is `ruamel.yaml` in `rt` mode, which preserves style, quoting,
comments, and key order. `PyYAML` has no round-trip mode at all.

## The parser landscape

Which YAML version your data goes through depends entirely on which library reads it:

| Library | Language | YAML version | Notes |
|---|---|---|---|
| PyYAML | Python | 1.1 | The default. Norway problem live. No round-trip mode |
| ruamel.yaml | Python | 1.2 | Round-trip mode preserves formatting. Can opt into 1.1 |
| js-yaml | JavaScript | 1.2 | Powers most of the JS ecosystem |
| gray-matter | JavaScript | 1.2 via js-yaml | The common frontmatter reader |
| python-frontmatter | Python | 1.1 via PyYAML | Inherits every PyYAML behaviour |
| go-yaml v3 | Go | 1.2 mostly | Some 1.1 behaviour retained |
| serde_yaml | Rust | 1.2 | |

The practical consequence: a bundle written by a Python producer and read by a
JavaScript consumer has crossed a version boundary. Anything relying on implicit typing
can differ on the two sides. Explicit quoting is what makes the crossing safe.

## The rules

Twelve rules. The first four prevent almost everything above.

1. **Quote every string that is not obviously a word.** Dates, timestamps, version
   numbers, IDs with leading zeros, country codes, anything with a colon.
2. **Quote every date and timestamp**, and parse it in your own code.
3. **Write lists as lists.** `tags: [a, b, c]` or a block list. Never `tags: a, b, c`.
4. **Use only `true` and `false` for booleans.** Never `yes`, `no`, `on`, `off`, `y`,
   `n`.
5. **Never put a bare `---` inside frontmatter.**
6. **Save as UTF-8 with no byte order mark, with LF endings.**
7. **Put the opening `---` on line 1.** Nothing before it.
8. **Never use tabs.** Two spaces per level.
9. **Check for duplicate keys** in validation. No parser will tell you.
10. **Use a round-trip writer** for files that both tools and people edit.
11. **Keep frontmatter small.** It is labels for filtering and indexing. Prose belongs in
    the body.
12. **Validate before publishing.** Types, required fields, and shapes. Parsing
    successfully is not the same as being correct.

## A conforming OKF frontmatter block

Every rule applied:

```yaml
---
type: Attested Computation
title: Revenue for fiscal year
description: Recognized revenue for a fiscal year, per Finance's definition.
tags: [finance, revenue, attested]
status: stable
runtime: bigquery
parameters:
  - { name: year, type: integer, required: true }
executor:
  resource: /skills/run-on-bq.md
  receipt: [job_id, executed_sql, result]
attester:
  resource: /attesters/sql_equality.py
generated: { by: reference_agent/gemini-2.5-pro, at: '2026-06-20T22:53:05Z' }
verified:
  - { by: 'human:ahormati', at: '2026-06-25T09:00:00Z' }
stale_after: '2026-12-31'
sources:
  - id: rev-policy
    resource: https://wiki.acme/finance/revenue-recognition
    title: Revenue recognition policy
    author: 'team:finance-fpa'
    last_modified: '2026-04-02'
usage_window: { from: '2026-06-01', to: '2026-06-30' }
---
```

Four differences from how the spec writes its own examples, each deliberate:

- Timestamps and dates are **quoted**, so they arrive as strings, consistently.
- Actor values like `human:ahormati` are **quoted**, because they contain a colon.
- Path values carry a **leading `/`**, removing the ambiguity found in
  [06](06-conformance-audit.md).
- Compact style is kept where it aids reading, which requires a round-trip writer to
  survive.

## A validator worth running

Parsing is not validation. A checklist for a producer-side check:

- [ ] Frontmatter present, starts at line 1, terminates correctly
- [ ] `type` present and non-empty (this is the only conformance requirement)
- [ ] No duplicate keys
- [ ] `tags` is a list, not a string
- [ ] `status` is one of `draft`, `stable`, `deprecated`
- [ ] `stale_after` is a plain `YYYY-MM-DD` date and **not** a full timestamp. A
      timestamp here crashes the reference viewer outright; see
      [06](06-conformance-audit.md)
- [ ] Every `generated`/`verified` entry has `by`
- [ ] Every actor uses `human:`, `process:`, or `producer/version`
- [ ] Every `sources` entry has `resource`
- [ ] Every footnote label in the body matches a `sources[].id`
- [ ] `usage_window` present whenever any `usage_count` is
- [ ] Path values resolve, under a stated rule
- [ ] `Attested Computation` files have `runtime`
- [ ] Timestamps are quoted and parse as ISO 8601
- [ ] File is UTF-8, no byte order mark, LF endings

OKF ships no validator. `document.py`'s `validate()` checks one thing: that `type` is
present. Everything else on this list is yours to build.

## Sources

- [YAML 1.2.2 specification](https://yaml.org/spec/1.2.2/) and
  [YAML 1.1](https://yaml.org/spec/1.1/)
- [PyYAML documentation](https://pyyaml.org/wiki/PyYAMLDocumentation),
  [ruamel.yaml](https://yaml.readthedocs.io/), [js-yaml](https://github.com/nodeca/js-yaml),
  [gray-matter](https://github.com/jonschlinkert/gray-matter)
- [Jekyll front matter documentation](https://jekyllrb.com/docs/front-matter/)
- [noyaml.com](https://noyaml.com/) and the StrictYAML rationale on
  [implicit typing](https://hitchdev.com/strictyaml/why/implicit-typing-removed/)
- Parser behaviour measured directly. Script and output in
  [11-methodology-and-sources.md](11-methodology-and-sources.md)
