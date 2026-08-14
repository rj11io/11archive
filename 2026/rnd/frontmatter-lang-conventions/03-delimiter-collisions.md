# Delimiter collisions

The delimiter is how a tool decides what language it is reading. Nobody standardised
it, so the same three characters mean different things in different places, and some
tools guess wrong.

## `---` means at least four things

| Context | What follows `---` |
|---|---|
| Jekyll, Hugo, Obsidian, Docusaurus, a `.md` file almost anywhere | YAML metadata |
| An `.astro` component file | **TypeScript** |
| gray-matter with a language label, `---toml` | TOML, JSON, JavaScript, or a custom engine |
| Anywhere in a Pandoc document | YAML metadata, possibly closed by `...` |
| Inside a Markdown body | A horizontal rule |

That last one is not a joke. `---` on its own line in the body is standard Markdown for
a horizontal rule, which is why frontmatter readers only look at the top of the file,
and why a `---` inside a metadata block is dangerous.

## The Astro trap

Astro's documentation is explicit that the resemblance is deliberate:

> "Astro uses a code fence (`---`) to identify the component script in your Astro
> component. If you've ever written Markdown before, you may already be familiar with a
> similar concept called *frontmatter*. Astro's idea of a component script was directly
> inspired by this concept."

So in one Astro project:

- `src/pages/index.astro` opens with `---` containing TypeScript.
- `src/content/blog/post.md` opens with `---` containing YAML.

Same characters, same repository, two languages. A script that walks the project
extracting "frontmatter" will happily hand you a block of TypeScript and call it
metadata.

## Pandoc breaks two assumptions at once

Most frontmatter readers assume the block starts at line 1 and ends at `---`. Pandoc
assumes neither:

```markdown
Some prose can come first.

---
title: My document
...

More prose.
```

Two failures follow for a strict reader. It finds no metadata, because line 1 is not
`---`. And if it did start scanning, `...` is not a closing marker it recognises, so it
would run to the end of the file or error.

The `...` terminator is legal YAML: it marks the end of a YAML document. Most frontmatter
readers simply do not implement it.

## The unfenced conventions have the opposite problem

MultiMarkdown metadata and Python-Markdown Meta-Data have no opening delimiter at all.
The block is "the lines before the first blank line", provided the file starts with
something shaped like `Key: value`.

That is ambiguous in a way fences are not. This file:

```markdown
Note: this document is a draft
And here is the first paragraph of the body.
```

is a document with one metadata key and no body under MultiMarkdown rules, and a
document with no metadata and a two-line paragraph under every fenced convention. The
text alone cannot tell you which was meant.

MultiMarkdown constrains this a little: the key must start at the beginning of the line,
begin with an ASCII letter or number, and contain only letters, numbers, spaces, hyphens,
or underscores. It narrows the ambiguity without removing it.

## What a reader can and cannot detect

Detection by delimiter works for the fenced formats and fails for the rest:

| Format | Detectable from the first line? |
|---|---|
| TOML | **Yes**, `+++` is unambiguous |
| JSON, Hugo style | **Yes**, `{` is unambiguous |
| Labelled fence | **Yes**, the label says so |
| YAML | Ambiguous, `---` is shared with Astro and Pandoc |
| MultiMarkdown, Python-Markdown | **No**, it is a heuristic on the text |
| Org keywords, rST fields | **Yes** in practice, `#+` and `:field:` are distinctive |

This is the strongest practical argument for `+++` and for labelled fences: they say what
they are. YAML's `---` is the most popular and the least self-describing.

## The three rules that follow

1. **Never let a bare `---` appear inside a metadata block.** Quote the value or use a
   different marker. Under most readers it silently ends the block early and the
   remaining keys vanish with no error.
2. **Put the block at line 1, with nothing above it.** No blank line, no comment, no
   byte order mark. An invisible byte order mark defeats a reader that compares the first
   line to `---` exactly.
3. **Do not write a tool that assumes `---` means YAML.** Check the file type first, and
   if you support more than one language, prefer a labelled fence so the file tells you
   rather than you guessing.

## Sources

- [Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Pandoc YAML metadata block](https://pandoc.org/MANUAL.html#extension-yaml_metadata_block)
- [MultiMarkdown metadata](https://fletcher.github.io/MultiMarkdown-6/syntax/metadata.html)
- [Python-Markdown Meta-Data](https://python-markdown.github.io/extensions/meta_data/)
- [gray-matter](https://github.com/jonschlinkert/gray-matter)
