# The format

## What OKF is

The Open Knowledge Format (OKF) is a way to write down what an organisation knows,
in files that both people and software can read. Google Cloud published it. The whole
format is one idea: **a folder of Markdown files, each with a small block of
structured labels at the top.**

That label block is called YAML frontmatter. Section [05](05-yaml-frontmatter-best-practices.md)
covers it on its own, because it is where most of the practical difficulty lives.

Here is a complete, valid OKF file. Nothing is omitted:

```markdown
---
type: Metric
---

Gross margin is revenue minus the full cost of goods sold.
```

One label, `type`, is required. Everything else is optional. That is the entire
mandatory surface of the format.

## The problem it is meant to solve

An AI agent asked "how do we compute weekly active users?" has to assemble the answer
from a metadata catalog, a wiki, a dashboard description, some SQL comments, and a
person on Slack. Each of those systems stores its knowledge in its own shape, behind
its own API. Nothing moves between them.

OKF's bet is that the shared shape should be the most boring one available: text files
in a directory. The spec puts it plainly in its opening section:

> "If you can `cat` a file, you can read OKF; if you can `git clone` a repo, you can
> ship it."

`cat` is the standard command for printing a file to the screen. The point is that no
software needs to be installed to read the format.

## Four properties the spec is optimising for

Section 1 of the spec lists what it wants knowledge to be. Each one is a design
constraint, not a slogan:

| Property | What it rules out |
|---|---|
| **Readable** by people without tooling | Binary formats, database-only storage |
| **Parseable** by agents without a vendor SDK | Proprietary APIs, custom clients |
| **Diffable** in version control | Anything where a one-word edit rewrites the file |
| **Portable** across tools, organisations, and time | Formats tied to one product's lifetime |

"Diffable" means you can see, line by line, what changed between two versions. Git
does this for text and cannot do it for a database row. Section
[06](06-conformance-audit.md) shows a case where OKF's own tooling breaks this
property.

## The five questions v0.2 added

Version 0.1 stopped at "markdown plus labels". Version 0.2 argues that once agents,
not people, are writing most of the corpus, a reader needs five more answers. The
spec lists them:

1. What was this created from, and how was it verified? (**provenance**)
2. How much should I trust it? (**trust**)
3. Is it still true? (**freshness**)
4. Is it the current version? (**lifecycle**)
5. Was this number produced the way we said it must be? (**attestation**)

Each got its own frontmatter fields. Section
[03](03-the-trust-model.md) covers the first four. Section
[04](04-attested-computations.md) covers attestation, which is the largest and most
novel addition.

## Vocabulary

The spec defines these terms in section 2. They are used throughout this report.

| Term | What it means |
|---|---|
| **Bundle** | A directory of knowledge files. The unit you ship. |
| **Concept** | One unit of knowledge, stored as one Markdown file. |
| **Concept ID** | The file's path inside the bundle, minus the `.md` ending. |
| **Frontmatter** | The YAML label block at the top of the file, fenced by `---`. |
| **Body** | Everything after the frontmatter. |
| **Link** | An ordinary Markdown link from one concept to another. |
| **Source** | Material a concept was derived from, recorded in `sources`. |
| **Actor** | Who or what did something, written as `human:alice`, `process:nightly`, or `agent_name/version`. |
| **Trust tier** | A level a reader works out from the `verified` field. Not stored. |
| **Attested Computation** | A concept holding the one blessed way to calculate a number. |
| **Receipt** | Evidence returned by running a computation. Never stored in the bundle. |
| **Attester** | Plain code, no AI model, that checks a receipt and returns pass or fail. |

## What a bundle looks like

The directory layout is entirely up to the producer. The spec fixes only two
filenames:

```
bundle/
  index.md          # optional. Lists what is in this directory.
  log.md            # optional. History of changes.
  tables/
    index.md
    orders.md       # a concept
  metrics/
    revenue.md      # a concept
```

`index.md` and `log.md` are reserved. Every other `.md` file is a concept.

`index.md` exists for what the spec calls **progressive disclosure**: letting a reader
see what is available before opening anything. This matters for AI agents, which have
a limited amount of text they can hold at once. An agent reads the index, then opens
only the two files it needs, instead of loading all 400.

## Concepts link to each other

Relationships are plain Markdown links:

```markdown
Joined with [customers](/tables/customers.md) on `customer_id`.
```

A link means "these two things are related". The format deliberately does not record
*how* they are related. That is left to the surrounding sentence. A tool drawing a
picture of the bundle treats every link as a plain arrow.

Two link styles are allowed. A path starting with `/` is measured from the bundle
root, and the spec recommends it because the link survives a file being moved. A path
like `./other.md` is measured from the current file.

Broken links are explicitly fine. The spec says a link to a file that does not exist
"may simply represent not-yet-written knowledge". A reader must not reject the bundle
over it.

## What the format refuses to do

The spec's non-goals are as informative as its goals:

- It will not define a fixed list of concept types. You invent your own `type` values.
- It will not tell you where to store or how to serve bundles.
- It will not replace schema formats like Avro, Protobuf, or OpenAPI. It points at
  them.
- It will not say how the code behind a computation is packaged. It fixes the
  interface only.

The consistent theme: OKF standardises the smallest thing that makes a pile of files
self-describing, and stops.

## Sources

- OKF v0.2 specification, sections 1 to 3, 6:
  [okf/SPEC.md](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md)
- Repository README:
  [okf/README.md](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/README.md)
