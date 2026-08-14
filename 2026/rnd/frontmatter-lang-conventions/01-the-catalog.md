# The catalog

Every frontmatter convention in common use, with its exact delimiters. The delimiter is
the important part: it is how a tool decides which language it is about to parse.

## The fenced languages

These put a metadata block at the top of the file between two marker lines.

### YAML, fenced by `---`

The original and the default nearly everywhere.

```markdown
---
title: My page
tags: [a, b]
---

Body starts here.
```

Jekyll introduced it in 2008 and requires it: "The front matter must be the first thing
in the file and must take the form of valid YAML set between triple-dashed lines."
Jekyll supports no other language.

### TOML, fenced by `+++`

```markdown
+++
title = "My page"
tags = ["a", "b"]
+++
```

Hugo supports it. Zola prefers it: "The TOML front matter is a set of metadata embedded
in a file at the beginning of the file enclosed by triple pluses (`+++`)." Zola accepts
YAML only "to ease porting legacy content".

### JSON, fenced by braces

Hugo takes a bare JSON object with no separate fence. The braces are the delimiter:

```markdown
{
  "title": "My page",
  "tags": ["a", "b"]
}
```

### Labelled fences: `---toml`, `---json`, `---js`

A different approach: keep the `---` fence and name the language on the opening line.
This comes from `gray-matter`, the JavaScript library most static site tools use, and it
propagates to everything built on it.

```markdown
---toml
title = "My page"
---
```

`gray-matter` handles YAML, JSON, and JavaScript out of the box, detects the language
"defined after the first delimiter", and accepts custom engines for anything else.

Eleventy inherits exactly this, supporting `yaml`, `json`, and `js`:

```markdown
---js
const title = "My page title";
---
```

JavaScript frontmatter is worth pausing on. It is executable code, not data. That buys
computed values and costs you the ability to read the metadata without running it.

## The unfenced conventions

These have no delimiters at all. The block ends at the first blank line.

### MultiMarkdown metadata

```markdown
Title: A New MultiMarkdown Document
Author: Fletcher T. Penney
Date: July 25, 2005

The body starts after the blank line.
```

There must be no whitespace above the block, and it ends at the first blank line. Keys
start at the beginning of the line.

### Python-Markdown Meta-Data

Nearly the same shape, and it accepts an optional `---` fence too. Two details matter:
the block "ends at the first blank line or a closing delimiter (`---` or `...`)", and
**every value is a list of strings**:

```markdown
Title:   My Document
Authors: Waylan Limberg
         John Doe
```

parses to `{'title': ['My Document'], 'authors': ['Waylan Limberg', 'John Doe']}`.

No type inference happens at all. A value is text, always. Section
[02](02-what-the-parser-does.md) shows why that is a feature.

### Org-mode keywords

Emacs org files use keyword lines rather than a block. Hugo reads these for org content.

```
#+TITLE: My page
#+DATE: 2026-09-23
#+TAGS: a b
```

### reStructuredText field lists

Sphinx and reStructuredText use a docinfo field list:

```rst
:Author: Jane Doe
:Version: 1.10
```

## The near-misses

Two conventions that look like frontmatter and are not.

### Pandoc YAML metadata blocks

Fenced by `---`, so it looks identical. Two differences bite:

- It may be closed by `...` instead of `---`.
- It does **not** have to be the first thing in the file.

```markdown
Some prose can come first.

---
title: My document
...

More prose.
```

A strict frontmatter reader that requires the block at line 1 and a `---` terminator
sees no metadata here. Quarto and R Markdown build on this.

### Astro's component script

The sharpest trap in this report, because Astro says so itself:

> "Astro uses a code fence (`---`) to identify the component script in your Astro
> component. If you've ever written Markdown before, you may already be familiar with a
> similar concept called *frontmatter*. Astro's idea of a component script was directly
> inspired by this concept."

The block contains TypeScript, not YAML:

```astro
---
import Layout from "../layouts/Base.astro";
const posts = await getCollection("blog");
---
<Layout>...</Layout>
```

Meanwhile Astro *content collections* use real YAML frontmatter in `.md` files. So in
one framework the same three characters open a YAML block in one file type and a
TypeScript block in another.

### MDX and ESM exports

MDX files can export metadata as a JavaScript binding instead of a frontmatter block:

```mdx
export const meta = { title: "My page" }
```

Same idea as `---js`: executable, not readable without running it.

## At a glance

| Format | Delimiters | Typed values | Comments |
|---|---|---|---|
| YAML | `---` … `---` | Inferred, aggressively | Yes |
| TOML | `+++` … `+++` | Declared by syntax | Yes |
| JSON | `{` … `}` | Declared by syntax | **No** |
| Labelled fence | `---toml`, `---json`, `---js` … `---` | Per language | Per language |
| JavaScript | `---js` … `---` | Executable | Yes |
| MultiMarkdown | none, ends at first blank line | No, text only | No |
| Python-Markdown Meta | none or `---`, ends at blank line, `---`, or `...` | No, lists of strings | No |
| Org keywords | `#+KEY:` lines | No, text only | Yes |
| rST field list | `:field:` lines | No, text only | Yes |
| Pandoc YAML block | `---` … `---` or `...`, anywhere in file | Inferred | Yes |
| Astro component script | `---` … `---` | **It is TypeScript** | Yes |

## Sources

- [Jekyll front matter](https://jekyllrb.com/docs/front-matter/)
- [Hugo front matter](https://gohugo.io/content-management/front-matter/)
- [Zola pages](https://www.getzola.org/documentation/content/page/)
- [Eleventy front matter](https://www.11ty.dev/docs/data-frontmatter/)
- [gray-matter](https://github.com/jonschlinkert/gray-matter)
- [MultiMarkdown metadata](https://fletcher.github.io/MultiMarkdown-6/syntax/metadata.html)
- [Python-Markdown Meta-Data](https://python-markdown.github.io/extensions/meta_data/)
- [Pandoc YAML metadata block](https://pandoc.org/MANUAL.html#extension-yaml_metadata_block)
- [Astro components](https://docs.astro.build/en/basics/astro-components/)
