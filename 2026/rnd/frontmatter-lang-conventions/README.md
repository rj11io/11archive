# Frontmatter Beyond YAML: The Language Conventions

Markdown frontmatter has no standard. No RFC, no W3C note, nothing. Every tool
implements its own reader, so the metadata block at the top of a Markdown file might be
YAML, TOML, JSON, JavaScript, a bare list of key-value lines, or in one common case
TypeScript.

This report catalogues the conventions actually in use, measures what each language does
to your values, and says which one to pick.

## Read this first

**YAML is the default, not the rule, and it is the only one that guesses.** Written the
natural way, ten of eleven test values come back as something other than the text typed:
`NO` becomes `False`, the postcode `02134` becomes `1116`, `22:53` becomes `1373`. TOML
rejects those inputs at parse time instead. JSON has no comments. Two older conventions
do no type conversion at all.

## Contents

| If you want | Read |
|---|---|
| The short version | [00 Executive brief](00-executive-brief.md) |
| Every convention and its delimiters | [01 The catalog](01-the-catalog.md) |
| **What each language does to your values** | [02 What the parser does](02-what-the-parser-does.md) |
| Why `---` is ambiguous | [03 Delimiter collisions](03-delimiter-collisions.md) |
| Which tools accept what, and how to choose | [04 Tool support and choosing](04-tool-support-and-choosing.md) |
| How this was checked | [05 Methodology and sources](05-methodology-and-sources.md) |

## What is original here

**A measured comparison of the three data languages on identical metadata.** The same
eleven values through PyYAML, Python's `tomllib`, and `json`, with the resulting types
recorded. This includes the parse-time rejection tests, which are the real difference
between YAML and TOML: TOML refuses `country = NO`, `draft = yes`, and duplicate keys,
where YAML accepts all three and silently returns the wrong thing. Full script in
[05](05-methodology-and-sources.md).

## Scope

**Covered:** the frontmatter conventions in common use, their exact delimiters, how each
language types values, where delimiters collide, which tools accept which formats, and
how to choose.

**Not covered:** an exhaustive survey of every project that invented its own convention.
Usage share, because no reliable figure exists. Tool behaviour beyond what each tool
documents, since none were installed and exercised.

Evidence boundary: tool documentation and language specifications read on 2026-08-14,
plus parser measurements run the same day on Python 3.13.5.

## Related

The YAML-specific failure modes here are covered in depth, applied to a real
specification built on them, in the companion report
[Google's Open Knowledge Format: A Working Reference](https://01kzxzhgv0h542j4y6jhdzt8kk.reports.rj11.io).
