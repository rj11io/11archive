# Tool support, and choosing

## Who supports what

Every row checked against the tool's own documentation on 2026-08-14. "Own" means the
tool uses its own key-value convention rather than a general-purpose data language.

| Tool | YAML | TOML | JSON | JavaScript | Notes |
|---|---|---|---|---|---|
| Jekyll | Yes, only | No | No | No | Must be the first thing in the file |
| Hugo | Yes, `---` | Yes, `+++` | Yes, `{ }` | No | Picks the format from the delimiter |
| Zola | Yes, legacy only | Yes, `+++`, preferred | No | No | YAML accepted "to ease porting" |
| Eleventy | Yes, default | Via a custom engine | Yes, `---json` | Yes, `---js` | Built on gray-matter |
| gray-matter | Yes, default | Via a custom engine | Yes | Yes | Detects the label after the fence |
| Docusaurus | Yes, only | No | No | No | "The content is parsed as YAML" |
| Obsidian | Yes | No | Input only | No | JSON is "read, interpreted, and saved as YAML" |
| Quarto, R Markdown | Yes | No | No | No | Pandoc lineage |
| Pandoc | Yes | No | No | No | Block may sit anywhere and close with `...` |
| MultiMarkdown | Own | No | No | No | No delimiters, ends at first blank line |
| Python-Markdown | Own, `---` optional | No | No | No | Every value is a list of strings |
| Astro | Yes, in content files | No | No | Component script | `---` in `.astro` is TypeScript |

Two patterns stand out.

**YAML is near-universal and everything else is not.** Ten of the twelve tools read YAML.
The two that do not, MultiMarkdown and Python-Markdown, use their own key-value
convention rather than a different data language. Only Hugo and Zola take TOML, and JSON
support is mostly a side effect of using gray-matter. If you need one file to work across
many tools, YAML is the only answer.

**The tools that offer a choice are the static site generators.** Documentation and
note-taking tools all picked YAML and stopped. That is worth knowing before designing a
format: your users will expect YAML because it is all they have seen.

## Choosing a format

The decision turns on who reads the file and how much you control the toolchain.

| Situation | Use | Why |
|---|---|---|
| Publishing through Jekyll, Docusaurus, Obsidian, Quarto | **YAML** | It is the only format they accept |
| Hugo or Zola, and metadata is machine-consumed | **TOML** | Failures become parse errors, not wrong values |
| Metadata is generated and consumed by programs, never hand-edited | **JSON** | No ambiguity at all, at the cost of comments |
| You need computed values at build time | **JavaScript** | Only if you accept that reading it means running it |
| Titles, authors, and tags for a document pipeline | **MultiMarkdown style** | No typing means no type surprises |
| Defining a format others will implement | **YAML**, and specify it precisely | Anything else limits adoption. Name the version and the schema |

## If you pick YAML, pick the discipline too

YAML wins on availability, not on safety. Section
[02](02-what-the-parser-does.md) shows ten of eleven natural values coming back as
something other than the text typed. Four habits remove nearly all of it:

1. **Quote anything that is not obviously a word.** Country codes, versions, identifiers
   with leading zeros, anything containing a colon.
2. **Quote dates and timestamps**, then parse them in your own code, so the type does not
   depend on whose library read the file.
3. **Use only `true` and `false`.** Never `yes`, `no`, `on`, `off`.
4. **Write lists as lists.** `tags: [a, b, c]`, never `tags: a, b, c`.

## If you are designing a format

Three lessons from the tools that already did it.

**Name the language and its version.** "YAML frontmatter" does not specify a format.
YAML 1.1 and 1.2 disagree about booleans, octal numbers, and sexagesimal numbers, and
which one you get depends on the library your reader happened to install. Google's Open
Knowledge Format says "a parseable YAML frontmatter block" and stops there, and its own
two implementations disagree as a result.

**Prefer a self-describing delimiter if you support more than one language.** `+++` and
`---toml` say what they are. A bare `---` does not, and it already means TypeScript in
Astro files and a horizontal rule in a Markdown body.

**Say where the block ends.** Whether `...` closes it, whether an indented `---` closes
it, and whether the block must start at line 1 are all real decisions that readers will
otherwise make differently.

## Sources

- [Jekyll](https://jekyllrb.com/docs/front-matter/),
  [Hugo](https://gohugo.io/content-management/front-matter/),
  [Zola](https://www.getzola.org/documentation/content/page/),
  [Eleventy](https://www.11ty.dev/docs/data-frontmatter/),
  [gray-matter](https://github.com/jonschlinkert/gray-matter)
- [Docusaurus](https://docusaurus.io/docs/markdown-features),
  [Obsidian properties](https://obsidian.md/help/properties),
  [Quarto](https://quarto.org/docs/authoring/front-matter.html)
- [Pandoc](https://pandoc.org/MANUAL.html#extension-yaml_metadata_block),
  [MultiMarkdown](https://fletcher.github.io/MultiMarkdown-6/syntax/metadata.html),
  [Python-Markdown](https://python-markdown.github.io/extensions/meta_data/),
  [Astro](https://docs.astro.build/en/basics/astro-components/)
