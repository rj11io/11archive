# Conformance audit of Google's own bundles

Original measurement for this report. Google ships four example bundles with the spec.
This section parses every file in them using the same code Google's reference
implementation uses, and reports what is actually in there.

The point is not to embarrass the examples. It is that **the defects found are exactly
the ones the format's design invites**, so they predict what your bundles will look
like too.

## Method in one paragraph

Cloned `GoogleCloudPlatform/knowledge-catalog` at commit `374e0bc`. Parsed all 78
Markdown files under `okf/bundles/` with PyYAML's `safe_load`, matching the parsing in
`okf/src/reference_agent/bundle/document.py`. Checked each file against the
conformance rules in spec section 11, the field types in section 4.1, and the path
rules in section 6.2. Full method and the script in
[11-methodology-and-sources.md](11-methodology-and-sources.md).

## What is in the bundles

| Bundle | Files | Concepts | Authored by |
|---|---|---|---|
| `acme_retail` | 17 | 9 | By hand, to demonstrate v0.2 |
| `crypto_bitcoin` | 15 | 9 | Reference agent |
| `ga4` | 14 | 9 | Reference agent |
| `stackoverflow` | 32 | 26 | Reference agent |
| **Total** | **78** | **53** | |

All 53 concepts pass the section 11 conformance test: every one parses, and every one
has a non-empty `type`. **Strict conformance is 100%.** Everything below sits in the
gap between "conformant" and "usable".

## Finding 0: half of v0.2 is never produced

Before the defects, the largest result. Version 0.2's whole contribution was provenance,
trust, freshness, lifecycle, and attestation. Here is where those fields actually appear:

| Bundle | Concepts | `sources` | `generated` | `verified` | `status` | `stale_after` | Attested Computation |
|---|---|---|---|---|---|---|---|
| `acme_retail` (hand-written) | 9 | 5 | 9 | **8** | 9 | **7** | **2** |
| `crypto_bitcoin` (agent) | 9 | 9 | 9 | 0 | 0 | 0 | 0 |
| `ga4` (agent) | 9 | 9 | 9 | 0 | 0 | 0 | 0 |
| `stackoverflow` (agent) | 26 | 26 | 26 | 0 | 1 | 0 | 0 |

`verified`, `stale_after`, and `Attested Computation` exist only in the bundle a person
wrote to illustrate the specification. Google's reference agent, across 44 generated
concepts, emits `sources` and `generated` and nothing else.

The consumer side is emptier still. Searching every Python file in the reference
implementation for the five computation fields returns nothing:

| Field | References in `okf/src/` |
|---|---|
| `runtime` | **0** |
| `parameters` | **0** |
| `computation` | **0** |
| `executor` | **0** |
| `attester` | **0** |

Specification section 10 is roughly 180 lines. No shipped code reads any of it. Section
11 tells consumers they SHOULD "surface, not silently drop, a failing attestation";
nothing shipped can produce an attestation to surface.

This is not a defect. It is the honest state of a young specification, and it is the
single most important thing to know before adopting v0.2.

## Finding 1: `tags` is a plain string in 8 of 26 files

Spec section 4.1 says `tags` is "a YAML list of short strings". Eight files in the
Stack Overflow bundle write it as a bare comma-separated line, which YAML reads as one
string:

| File | Parsed value | Type |
|---|---|---|
| `datasets/stackoverflow.md` | `Stack Overflow, Q&A, developer, programming, public dataset` | `str` |
| `tables/posts_answers.md` | `stackoverflow, answers, posts, Q&A` | `str` |
| `tables/posts_moderator_nomination.md` | `stackoverflow, posts, moderator, nomination` | `str` |
| `tables/posts_questions.md` | `stackoverflow, posts, questions` | `str` |
| `tables/posts_wiki_placeholder.md` | `stackoverflow, posts, wiki, placeholder, community` | `str` |
| `tables/stackoverflow_posts.md` | `stackoverflow, posts, deprecated` | `str` |
| `tables/users.md` | `stackoverflow, users, community, reputation` | `str` |
| `tables/votes.md` | `Stack Overflow, votes, posts, community` | `str` |

The other 18 concepts in the same bundle use a proper list. One agent run produced
both shapes.

### Why it matters

A reader that loops over `tags` expecting strings gets **characters**:

```python
>>> fm = yaml.safe_load("tags: stackoverflow, posts, questions")
>>> list(fm["tags"])[:8]
['s', 't', 'a', 'c', 'k', 'o', 'v', 'e']
>>> len(fm["tags"])
31                    # 31 "tags", not 3
```

### Google's tooling contains the damage, it does not fix it

The bundled viewer coerces the value before use, at
`okf/src/reference_agent/viewer/generator.py:101`:

```python
tags = fm.get("tags") or []
if not isinstance(tags, list):
    tags = [str(tags)]
```

Without those two lines, the JavaScript at `viewer/static/viz.js:188` would iterate a
string and render 31 single-letter chips. With them, the shipped
`bundles/stackoverflow/viz.html` renders **one** tag reading
`stackoverflow, posts, deprecated` where three were meant. So the workaround turns a
loud failure into a quiet one; the tag split is still lost, and the defect is visible in
a published artifact.

Note what this is not. Section 11 requires only that `type` be present, and says nothing
about the type of `tags`. These files are **fully conformant**. They break the shape the
specification describes in section 4.1 and lose the tag split, and they pass every test
the specification defines.

**Fix:** always write `tags: [a, b, c]` or a block list. Validate that `tags` is a
list before publishing.

## Finding 2: the same file uses two different path rules

Spec section 6.2 lists three allowed forms for a path: an absolute URL, a path
starting with `/` measured from the bundle root, or "a relative path". It never says
what a relative path is measured from.

In `acme_retail/metrics/gross-margin.md`, both readings appear at once:

| Location | Value | Resolves from document | Resolves from bundle root |
|---|---|---|---|
| `sources[].resource` | `policies/margin-standard.md` | no | **yes** |
| `sources[].resource` | `policies/revenue-recognition.md` | no | **yes** |
| body link | `./revenue.md` | **yes** | no |
| body link | `./gross-margin-legacy.md` | **yes** | no |

Frontmatter paths are measured from the bundle root. Body links are measured from the
file. Neither carries the leading `/` that section 6.2 says marks the bundle-root
form.

Across the `acme_retail` bundle this affects **12 path values** in `executor.resource`,
`attester.resource`, and `sources[].resource`. All 12 resolve if you assume bundle
root. All 12 fail if you assume the file's own directory, which is the normal
convention for Markdown and for filesystems.

**This is the specification's ambiguity, not the samples' mistake.** The bundles are
copying the specification's own examples. Section 10.2's worked example, section 6.3, and
Appendix A all use the same slash-less root-anchored form, and section 5.1 explicitly
names a third option beyond the two in section 6.2: "an absolute URL, a bundle-relative
path, or a path into a `references/` subdirectory". One missing sentence in section 6.2
causes all twelve.

**And nothing currently breaks.** No shipped tool resolves frontmatter path values at
all. The viewer builds its graph only from body links; `executor.resource` and friends
are copied through untouched. So this failure is latent, waiting for the first consumer
that tries to follow one of these paths.

### The reference agent contradicts the spec outright

Section 6.1 recommends the leading-slash form for links between concepts:

> "This is the **recommended** form because it is stable when documents are moved
> within their subdirectory."

Google's own reference agent forbids it. From its prompt at
`okf/src/reference_agent/prompts/reference_instruction.md`:

> "Use file-relative paths only. Never start a link with `/` (that breaks GitHub
> rendering)"

Both positions are defensible, and the agent's is the more practical one. A browser or
GitHub resolves a leading `/` against the site or repository root, not the bundle root.
Section 3 explicitly allows a bundle to live as "a subdirectory within a larger
repository", and in that case every leading-slash link points at the wrong place. Since
"it renders on GitHub" is one of the format's selling points, the spec's recommendation
undercuts it.

The reference **viewer** takes the same side, silently. At
`viewer/generator.py:74` it skips any link starting with `/` when building the graph:

```python
if "://" in target or target.startswith("/"):
    continue
```

So a bundle that follows the specification's recommendation renders in Google's own
viewer as a set of concepts with **no connections between them**. The graph, which is
the viewer's entire purpose, comes out empty.

Three parts of one project hold three positions: the specification recommends the
leading slash, the agent's prompt forbids it, and the viewer discards it. An external
contributor filed
[PR #165](https://github.com/GoogleCloudPlatform/knowledge-catalog/pull/165) making this
argument on 2026-07-01. It is still open.

**Fix for producers, split by field:**

- **Body links:** use file-relative paths (`./x.md`, `../y/z.md`). They render correctly
  everywhere, and they match what the reference agent produces.
- **Frontmatter path fields:** use a leading `/`. These are never rendered as links by
  GitHub, so the rendering objection does not apply, and the leading slash removes the
  ambiguity entirely.

**Fix for readers:** try the document-relative path, then fall back to bundle-root.
**Fix for the spec:** say what a bare relative path means, and reconcile section 6.1
with the reference agent.

## Finding 3: the same field is a date in one bundle and text in another

`generated.at` holds a timestamp. Because YAML converts unquoted dates automatically,
what a program receives depends on how the file was written.

| Bundle | `generated.at` written as | Python type after parsing |
|---|---|---|
| `acme_retail` | `at: 2026-06-30T14:00:00Z` | `datetime` (9 of 9) |
| `crypto_bitcoin` | `at: '2026-07-10T21:15:20+00:00'` | `str` (9 of 9) |
| `ga4` | `at: '2026-07-10T21:15:20+00:00'` | `str` (9 of 9) |
| `stackoverflow` | `at: '2026-07-10T22:49:19+00:00'` | `str` (26 of 26) |

The hand-written bundle follows the spec's examples, which are unquoted, and yields
`datetime` objects. The three agent-written bundles quote the value and yield strings.
`stale_after: 2026-12-31` is unquoted throughout `acme_retail` and comes back as a
`date` object.

The split is wider than `generated.at`. Across the four bundles, 35 frontmatter values
become `date` or `datetime` objects rather than text, covering `stale_after`,
`sources[].last_modified`, and both ends of `usage_window`.

A reader must handle both forms. Calling a string method on a `datetime`, or comparing a
`str` to a `date`, raises in Python and misbehaves quietly in JavaScript.

To be fair to the specification: no rule fixes the quoting, so neither form is a
violation. This is an interoperability trap, not a defect. The reference implementation
already defends against both forms in `is_stale`, which is evidence the authors expected
it. Finding 4 shows that defence failing.

**Fix:** quote every timestamp, and parse it yourself. Section
[05](05-yaml-frontmatter-best-practices.md) covers the general rule.

## Finding 4: one conformant file crashes the reference viewer

`is_stale()` in `document.py` is written to fail softly. Its docstring promises it
"Returns False when `stale_after` is absent or unparseable", and it has a `try/except`
for exactly that. The fallback is unreachable.

```python
if isinstance(raw, date):
    stale_after = raw          # a datetime lands here, never in the try/except
else:
    try:
        stale_after = date.fromisoformat(str(raw)[:10])
    except ValueError:
        return False
return (today or date.today()) >= stale_after
```

In Python, `datetime` is a subclass of `date`, so a timestamp passes the
`isinstance(raw, date)` test, skips the guard, and reaches a comparison that is not
allowed:

| `stale_after` written as | Parses to | `is_stale()` |
|---|---|---|
| `2026-09-23` | `date` | `False` |
| `'2026-09-23'` | `str` | `False` |
| `2026-09-23T00:00:00Z` | `datetime` | **`TypeError`** |

The error: `'>=' not supported between instances of 'datetime.date' and
'datetime.datetime'`.

`viewer/generator.py:124` calls `is_stale(fm)` with no guard, so this is not contained.
A single file anywhere in a bundle takes down the whole viewer build. Verified end to
end against a one-file bundle.

Section 5.5 does ask for a plain `YYYY-MM-DD` date, so a timestamp is off-form. But the
file remains conformant under section 11, which section 11 says consumers MUST NOT
reject, and YAML makes the mistake easy: `generated.at` is a timestamp, `stale_after` is
a date, and the specification writes both unquoted in adjacent lines of the same example.

**Fix for producers:** write `stale_after` as a quoted plain date.
**Fix for the implementation:** test `isinstance(raw, datetime)` before `date`, or call
`.date()` on the value.

## Finding 5: the reference parser rewrites files it round-trips

This is the most consequential finding, because it undercuts a property the spec
names as a goal.

Section 1 lists **diffable in version control** as one of four reasons to choose this
format. Section 1 also says a knowledge corpus "is continuously written and maintained
by agents".

Put those together and files get read and rewritten constantly. So: what happens when
Google's reference implementation reads one of Google's hand-written files and writes
it back unchanged?

Running `OKFDocument.parse()` then `.serialize()` on
`acme_retail/computations/revenue-ytd.md`, with no edit in between, produces a
**52-line diff**:

```diff
-tags: [finance, revenue, attested]
+tags:
+- finance
+- revenue
+- attested

-  - { name: year, type: integer, required: true }
+- name: year
+  type: integer
+  required: true

-generated: { by: reference_agent/gemini-2.5-pro, at: 2026-06-30T14:00:00Z }
+generated:
+  by: reference_agent/gemini-2.5-pro
+  at: 2026-06-30 14:00:00+00:00
```

Three things happen, none of them intended:

1. **Compact style is destroyed.** Every `{ ... }` and `[ ... ]` becomes a block. The
   spec uses compact style throughout its own examples, including the recommended
   `generated: { by: ..., at: ... }`.
2. **Timestamps are rewritten.** `2026-06-30T14:00:00Z` becomes
   `2026-06-30 14:00:00+00:00`. The `T` separator and the `Z` suffix are gone. Spec
   section 5.2 asks for "an ISO 8601 datetime"; the space-separated form is not one in
   the strict reading.
3. **Long lines are re-wrapped**, so a one-line `description` becomes two.

The cause is `yaml.safe_dump` in `document.py:52`, which always emits block style and
re-serialises the `datetime` object YAML created on the way in.

### What this costs

An agent that touches one field in a file rewrites the whole frontmatter. Code review
of a knowledge bundle then means reading a 52-line diff to find a one-word change. The
version-control benefit the format is built on degrades every time a file is edited by
the tool the spec ships.

**Fix for producers:** use a round-trip-preserving YAML library. In Python that is
`ruamel.yaml` in `rt` mode, which keeps style, quoting, and key order. Do not use
`safe_dump` for files a human will also edit.

## Finding 6: two parser edge cases that fail silently

Both verified against `document.py`.

### A `---` inside the frontmatter truncates it, without error

The parser scans for the next line that is exactly `---` after trimming whitespace
(`document.py:31-33`). A `---` inside a multi-line text block matches:

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

The parser stops at the indented `---`. The frontmatter parses **successfully** as
`{'type': 'Metric', 'description': 'a horizontal rule:'}`. The `title` is silently
lost. The rest becomes body text. Nothing raises.

**Fix:** never let a bare `---` appear inside frontmatter. Quote the value, or use a
different marker in prose.

### A byte order mark disables frontmatter entirely

The parser requires the very first line to be `---` (`document.py:27`). A file saved
with a byte order mark, which some Windows editors add invisibly, begins with
`﻿---`. That comparison fails, so the whole file is treated as having no
frontmatter at all.

**Fix:** save as UTF-8 without a byte order mark. Strip it when reading.

## Finding 7: `log.md` carries frontmatter, and nothing says whether it may

`acme_retail/log.md` starts with:

```yaml
---
type: Log
title: Acme Retail bundle history
---
```

Spec section 8 says index files carry no frontmatter, and section 12 calls a
bundle-root `index.md` "the only place frontmatter is permitted in an `index.md`".
Section 9, which defines `log.md`, says nothing about frontmatter either way.

So this is not a violation. It is an unspecified case that Google's own example
resolves one way while the spec stays quiet. A reader collecting concepts by type
would need to know to skip `log.md`, because `type: Log` looks exactly like a concept.

This one was found independently by an external contributor two days before this report
was written, in
[issue #286](https://github.com/GoogleCloudPlatform/knowledge-catalog/issues/286),
titled "OKF log.md file can have a frontmatter ?". It has no reply.

**Fix for the spec:** state whether `log.md` may carry frontmatter.

## Summary

| Finding | Scope | Severity | Whose problem |
|---|---|---|---|
| 0. Half of v0.2 has no producer or consumer | 44 concepts, all of section 10 | **High** | Implementation |
| 4. Timestamped `stale_after` crashes the viewer | Latent, any one file | **High** | Reference implementation |
| 5. Lossy round-trip rewriting | Every file an agent touches | **High** | Reference implementation |
| 6. `---` inside frontmatter truncates silently | Latent | **High** | Reference implementation |
| 2. Recommended links produce no graph edges | Every `/`-prefixed link | Medium | Spec and implementation disagree |
| 1. `tags` parsed as a string | 8 files | Medium | Producer |
| 3. Date and time types vary | 35 values | Medium | Spec and producer |
| 2. Ambiguous relative paths | 12 values | Medium | Spec |
| 6. Byte order mark breaks parsing | Latent | Medium | Reference implementation |
| 7. `log.md` frontmatter undefined | 1 file | Low | Spec |

**Not one of these makes a bundle non-conformant.** That is the real result. Section
11's test has three rules, and then explicitly forbids a consumer from rejecting a
bundle for missing fields, unknown types, unknown keys, broken links, or missing index
files. It is a producer-side checklist that consumers are told not to enforce.

So a validator that checks only conformance reports all four bundles clean, including
the one file that would crash the reference viewer. Section
[09](09-adoption-playbook.md) lists what a useful validator should check instead.

## Sources

- Measured against `GoogleCloudPlatform/knowledge-catalog` at commit `374e0bc`,
  [okf/bundles/](https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf/bundles)
- Parsing behaviour from
  [okf/src/reference_agent/bundle/document.py](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/src/reference_agent/bundle/document.py)
- Viewer coercion from
  [okf/src/reference_agent/viewer/generator.py](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/src/reference_agent/viewer/generator.py)
- Audit script and raw output: [11-methodology-and-sources.md](11-methodology-and-sources.md)
