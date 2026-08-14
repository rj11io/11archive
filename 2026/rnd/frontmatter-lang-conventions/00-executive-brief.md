# Executive brief

## The short answer

**Yes, there are several. YAML is the default, not the rule.** Markdown frontmatter has
no standard, so each tool picked its own language and its own delimiter.

| Language | Delimiters |
|---|---|
| YAML | `---` … `---` |
| TOML | `+++` … `+++` |
| JSON | `{` … `}`, or `---json` … `---` |
| JavaScript | `---js` … `---` |
| MultiMarkdown key-value | none, ends at the first blank line |
| Org keywords | `#+TITLE:` lines |
| reStructuredText fields | `:field: value` lines |

## The five findings

1. **YAML is the only portable choice.** Ten of the twelve tools checked read it; the
   two that do not use their own key-value convention rather than another language. Only
   Hugo and Zola read TOML. The documentation and note tools, Jekyll, Docusaurus,
   Obsidian, and Quarto, accept YAML and nothing else. If a file must work across tools,
   the decision is already made for you.

2. **TOML turns silent wrong answers into loud errors.** Measured on the same eleven
   values: YAML returns something other than the literal text in ten of them. `NO`
   becomes `False`, `02134` becomes `1116`, `22:53` becomes `1373`, `1.10` becomes
   `1.1`. TOML rejects the ambiguous forms at parse time instead of guessing, and
   rejects duplicate keys, which YAML and JSON both accept silently.
   ([02](02-what-the-parser-does.md))

3. **`---` is the least self-describing delimiter and the most popular.** In an `.astro`
   file it opens a block of TypeScript, by Astro's own account "directly inspired by"
   frontmatter. In a Markdown body it is a horizontal rule. In Pandoc it may appear
   anywhere in the document and close with `...`. `+++` and labelled fences like
   `---toml` say what they are; `---` does not. ([03](03-delimiter-collisions.md))

4. **Some conventions do no typing at all, and that is a feature.** MultiMarkdown and
   the Python-Markdown extension hand you text and nothing but text. Python-Markdown
   goes further and returns every value as a list of strings. Nothing can silently
   become a boolean, because nothing is ever converted. ([01](01-the-catalog.md))

5. **JavaScript frontmatter trades readability for computation.** Eleventy's `---js` and
   MDX's `export const meta` let you compute metadata at build time. The cost is that
   reading the metadata now means executing the file.

## What to do

**Publishing through an existing tool:** check the table in
[04](04-tool-support-and-choosing.md) first. Most tools give you no choice.

**You control the toolchain and the metadata is machine-consumed:** prefer TOML. Every
failure mode in this report becomes a parse error rather than a wrong value.

**You are stuck with YAML, which you probably are:** quoting is the entire discipline.
Quote anything that is not obviously a word, quote every date, use only `true` and
`false`, and write lists as lists. That removes almost all of it.

**You are designing a format others will implement:** name the language *and its
version*. "YAML frontmatter" does not specify a format, because YAML 1.1 and 1.2
disagree about booleans and octal numbers, and which one a reader gets depends on the
library it installed. Also say where the block ends: whether `...` closes it, whether an
indented `---` closes it, and whether it must start at line 1.

## Confidence

The typing comparison in [02](02-what-the-parser-does.md) was measured directly and is
reproducible from [05](05-methodology-and-sources.md). Every delimiter and support claim
comes from the tool's own documentation, cited per row. The tools were not installed and
exercised, so the support matrix reflects what they document rather than what they do.
