# How OKF compares

OKF landed in a crowded space. This section places it against the formats and standards
it overlaps with, and says plainly where it is weaker.

## The one distinction that resolves most confusion

**OKF is a format. MCP is a protocol. They are not competitors.**

The Model Context Protocol, from Anthropic, defines how an agent talks to a tool or data
source at runtime: the messages, the handshake, the calls. OKF defines what knowledge
looks like when it is sitting still in a directory.

You can serve an OKF bundle over MCP. Several third-party OKF tools already do exactly
that. The natural pairing is OKF for storage and version control, MCP for delivery. Any
article positioning one as a rival to the other has misread at least one of them.

The same applies to retrieval systems. OKF says nothing about indexing, chunking, or
embeddings. It is what you point those at.

## The comparison

| Format | Owner | Shape | Prose | Executable | Provenance | Needs tooling |
|---|---|---|---|---|---|---|
| **OKF** | Google Cloud | Markdown files plus YAML | **First class** | Via attested computations | **Built in** | No |
| llms.txt | Community | One Markdown file | First class | No | No | No |
| AGENTS.md | Community | One Markdown file | First class | No | No | No |
| DCAT | W3C | RDF vocabulary | No | No | Partial | Yes |
| schema.org | Community, W3C | Vocabulary, JSON-LD | No | No | No | Yes |
| Data Package | Open Knowledge Foundation | JSON descriptor | No | No | Partial | Light |
| dbt semantic layer | dbt Labs | YAML in a project | Minimal | **Yes** | No | Yes |
| Catalog products | Various vendors | Product database | Varies | No | Varies | **Yes, theirs** |
| RDF, OWL, SKOS | W3C | Formal triples | No | No | Via PROV-O | Yes |

Two columns carry most of the weight.

**Prose.** Almost everything else in the table describes structure and stops. A DCAT
record tells you a dataset's title, publisher, and format. It has nowhere to put "this
column is unreliable before March 2024 because the upstream job double-counted
refunds". OKF puts that sentence in the body, which is exactly what a language model
needs and what a structured vocabulary was never built to hold.

**Needs tooling.** DCAT, schema.org, and RDF need a parser, a vocabulary, and often a
triple store. A catalog product needs the product. OKF needs `cat`. That is the entire
argument for it, and it is a good one.

## Where OKF is weaker

Being fair about this matters more than the table.

**Against DCAT and schema.org.** They are real standards with formal semantics,
registered vocabularies, years of tooling, and government mandates behind them. DCAT-AP
is required for public sector data catalogs across the EU. OKF has a `type` field
anyone can fill in with anything and an explicit non-goal of defining a taxonomy. If you
need interoperability that a machine can reason over, OKF gives you far less. Its
tolerance of unknown types is a feature for portability and a liability for precision.

**Against the dbt semantic layer, Cube, and MetricFlow.** These actually execute. A dbt
metric is compiled and run; the definition and the calculation are the same object. OKF's
Attested Computation describes a calculation and hands it to someone else to run. The
spec is candid that semantic-layer templates are deferred to a future version. If your
metrics already live in dbt, OKF duplicates rather than replaces them.

**Against catalog products.** OpenMetadata, DataHub, Collibra, Alation, and Unity
Catalog give you search, lineage, access control, column-level profiling, and a UI. OKF
gives you files. The README lists these as systems that could export OKF, which is the
honest positioning: an interchange format, not a replacement.

**Against RDF and PROV-O.** For provenance specifically, PROV-O is a formal model with
agents, activities, and entities, and reasoning over it works. OKF's `sources` list is
much simpler and cannot express derivation chains beyond one hop. The spec says so
outright: deeper lineage is "out of scope for v0.2".

## Where OKF is genuinely ahead

Three things it does that nothing above does as well.

**Prose and structure in one artifact, deliberately mixed.** The README calls this
"mixes structured and unstructured data deliberately": frontmatter for the few fields
you query on, body for what a model actually reads. Every alternative picks one side.

**Trust signals as a first-class part of the format.** `generated`, `verified`, trust
tiers derived rather than stored, `stale_after` as an absolute date. Catalog products
have ownership fields; almost none distinguish who wrote a description from who
confirmed it, and none of the file formats in the table carry the distinction at all.

**Attested computations.** The idea that a knowledge file can carry the one sanctioned
way to compute a number, plus deterministic no-model code to check that it was the thing
that ran, has no close equivalent. Semantic layers guarantee correctness by owning
execution. OKF tries to guarantee it without owning execution, which is a harder problem
and the right one for an interchange format. Section
[04](04-attested-computations.md) covers where the current version falls short of its
own description.

## The neighbours it is often confused with

**llms.txt** is a single Markdown file at a website's root, listing the pages an LLM
should read. It solves discovery for one website. OKF is a whole directory describing an
organisation's internal knowledge. They share a philosophy (plain Markdown beats an API)
and almost nothing else. One OKF publishing tool emits both.

**AGENTS.md and CLAUDE.md** tell a coding agent how to behave in a repository: build
commands, conventions, what not to touch. They are instructions. OKF is reference
material. A repository can sensibly have both.

**Obsidian, Hugo, Jekyll, MkDocs.** These are where the Markdown-plus-frontmatter
convention came from, and OKF's compatibility with them is a real advantage: an OKF
bundle opens in Obsidian and renders on GitHub with no conversion. The relationship is
inheritance, not competition.

## Choosing

| If you need | Use |
|---|---|
| Formal, machine-reasonable dataset description | DCAT or schema.org |
| Metrics that compile and run | dbt, Cube, or MetricFlow |
| Search, lineage, access control, a UI | A catalog product |
| Formal provenance you can reason over | PROV-O |
| To hand an agent your team's context, in files you can diff | **OKF** |
| To connect an agent to that context at runtime | MCP, over an OKF bundle |

The last two rows are the honest scope. OKF is good at being a portable, readable,
reviewable container for curated knowledge. It is not a catalog, not a query engine, and
not a semantic layer, and it does not claim to be any of them.

## Sources

- OKF non-goals and positioning: specification section 1 and
  [okf/README.md](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/README.md)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [llms.txt](https://llmstxt.org/)
- [W3C DCAT 3](https://www.w3.org/TR/vocab-dcat-3/), [schema.org](https://schema.org/),
  [W3C PROV-O](https://www.w3.org/TR/prov-o/)
- [Frictionless Data Package](https://datapackage.org/)
- [dbt semantic layer](https://docs.getdbt.com/docs/use-dbt-semantic-layer/dbt-sl),
  [MetricFlow](https://github.com/dbt-labs/metricflow), [Cube](https://cube.dev/)
- Third-party OKF tools emitting llms.txt and serving over MCP: see
  [08](08-adoption-and-reception.md)
