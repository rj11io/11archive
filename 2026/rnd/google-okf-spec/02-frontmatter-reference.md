# Frontmatter field reference

Every field OKF v0.2 defines, what it holds, and what a reader is supposed to do with
it. Field names are exactly as the spec writes them. "Reader" here means any program
consuming a bundle: an agent, a search index, a viewer.

## The complete field list

| Field | Section | Status | Value |
|---|---|---|---|
| `type` | 4.1 | **Required** | Short string naming the kind of concept |
| `title` | 4.1 | Recommended | Display name for people |
| `description` | 4.1 | Recommended | One sentence |
| `resource` | 4.1 | Recommended | Address of the real thing being described |
| `tags` | 4.1 | Recommended | **List** of short strings |
| `sources` | 5.1 | Optional | List of materials this was derived from |
| `usage_window` | 5.1 | Optional | `{ from, to }` dates framing every `usage_count` |
| `generated` | 5.2 | Optional | `{ by, at }`. Who wrote the current content |
| `verified` | 5.2 | Optional | List of `{ by, at }`. Who confirmed it |
| `status` | 5.4 | Optional | `draft`, `stable`, or `deprecated` |
| `stale_after` | 5.5 | Optional | Date after which the content is stale |
| `runtime` | 10.2 | **Required** for `Attested Computation` | How to run the computation |
| `parameters` | 10.2 | Optional | List of `{ name, type, required }` |
| `computation` | 10.2 | Optional | Path to a file holding the computation |
| `executor` | 10.2 | Optional | `{ resource, receipt }`. How to run it |
| `attester` | 10.2 | Optional | `{ resource }`. Code that checks the run |
| `okf_version` | 12 | Optional | Only in a bundle-root `index.md` |
| `timestamp` | 13.1 | **Retired** | v0.1 field, replaced by `generated.at` |

Producers may add any other key they like. Readers must not reject a file for a key
they do not recognise, and should keep unknown keys when they rewrite a file.

## `type`, the only required field

```yaml
type: BigQuery Table
```

There is no central register of type names. You pick your own. The spec's examples
are `BigQuery Table`, `BigQuery Dataset`, `API Endpoint`, `Metric`, `Playbook`,
`Reference`, and `Attested Computation`.

Readers **must** cope with a type they have never seen, normally by treating it as a
generic concept. This is what keeps two organisations' bundles mutually readable when
their vocabularies differ.

The four bundles Google ships use seven type values between them, across 53 concepts:

| Type | Count |
|---|---|
| `BigQuery Table` | 22 |
| `Reference` | 20 |
| `Metric` | 3 |
| `BigQuery Dataset` | 3 |
| `Attested Computation` | 2 |
| `Policy` | 2 |
| `Skill` | 1 |

## `resource`, the pointer to the real thing

```yaml
resource: https://bigquery.googleapis.com/v2/projects/acme/datasets/sales/tables/orders
```

`resource` identifies the actual asset the file talks about. A concept describing an
abstract idea, say a business definition of "active user", has no `resource` and
leaves it out.

## `tags` is a list, and this trips people up

The spec says `tags` is "a YAML list of short strings". Both of these are lists:

```yaml
tags: [finance, revenue, attested]     # inline
```

```yaml
tags:                                   # one per line
  - finance
  - revenue
```

This is **not** a list, though it looks like one:

```yaml
tags: finance, revenue, attested        # one 39-character string
```

Eight files in Google's own Stack Overflow bundle make this mistake. Section
[06](06-conformance-audit.md) has the details and the consequence.

## `sources`, where the content came from

```yaml
sources:
  - id: rev-policy
    resource: https://wiki.acme/finance/revenue-recognition
    title: Revenue recognition policy
    author: team:finance-fpa
    usage_count: 5000
    last_modified: 2026-06-18
usage_window: { from: 2026-06-01, to: 2026-06-30 }
```

Inside each entry:

| Key | Status | Meaning |
|---|---|---|
| `resource` | **Required** | The source, or a description of a group of sources |
| `id` | Optional | Stable key used to cite this source from the body |
| `title` | Optional | Human-readable label |
| `author` | Optional | Who produced the source. An authority signal |
| `usage_count` | Optional | How often the source was used. A liveness signal |
| `last_modified` | Optional | When the source last changed. A recency signal |

`resource` does not have to be a followable link. It may also name a population, for
example `all queries in BigQuery project X`.

### Citing one specific claim

Attribution to a single sentence uses a Markdown footnote whose label matches a
source's `id`:

```markdown
The `events_` table is sharded daily as `events_YYYYMMDD`.[^ga4-schema]

[^ga4-schema]: GA4 BigQuery Export schema
```

The label is the join key. A reader resolves the citation by matching `ga4-schema`
against `sources[].id`, not by reading the footnote text.

The spec explains why labels are names and not positions like `sources[0]`: agents
constantly rewrite these files, and "a positional index misattributes silently the
moment the list is reordered".

### The three credibility signals

OKF records facts about a source and refuses to record a verdict. The spec's reasoning
is that a credibility score "is subjective, unportable across consumers, and goes
stale". A reader works out trust for itself from `author`, `usage_count`, and
`last_modified`.

The spec then undercuts one of its own signals. On `usage_count`:

> "Consumers SHOULD read it as liveness and trend, not as a score."

A scheduled query firing every hour and a person deliberately opening a dashboard both
increment it, and they do not mean the same thing. Treat it as alive-or-dead and
order-of-magnitude only.

## `generated` and `verified`, kept deliberately apart

```yaml
generated: { by: reference_agent/gemini-2.5-pro, at: 2026-06-20T22:53:05Z }
verified:
  - { by: human:ahormati, at: 2026-06-25T09:00:00Z }
  - { by: process:finance-nightly, at: 2026-06-26T02:00:00Z }
```

`generated` says who wrote the current text. `by` is required inside it. `at` marks
the last real change.

`verified` says who checked the text against its sources. It is a list, so a human
sign-off and a nightly automated check can both be recorded. "How recently was this
verified" is the latest `at`.

The two are independent on purpose. Content can change without anyone re-checking it,
and a fact can be re-checked without the text changing.

A single verifier may skip the list dash. Readers **must** treat this as a
one-item list:

```yaml
verified: { by: human:ahormati, at: 2026-06-25T09:00:00Z }
```

### Actor names

Three shapes, from section 7:

| Shape | Example | Use |
|---|---|---|
| `<producer>/<version>` | `reference_agent/gemini-2.5-pro` | Agents and tools |
| `human:<id>` | `human:ahormati` | People |
| `process:<id>` | `process:finance-nightly` | Automated jobs |

The `human:` prefix is load-bearing. Trust tiers key off it, so producers **must** use
it for anything a person wrote or confirmed.

## Trust tiers are calculated, never stored

A reader derives one of three levels from `verified`:

| `verified` contains | Tier |
|---|---|
| Nothing (key absent) | **unverified** |
| Only non-`human:` actors | **machine-confirmed** |
| At least one `human:` actor | **human-reviewed** |

Two constraints matter. A file with no trust information at all is still perfectly
readable and **must not** be rejected. And tiers are advice, not permission: the spec
states they "are not access control".

## `status` and `stale_after`

```yaml
status: stable        # draft | stable | deprecated
stale_after: 2026-09-23
```

`status` missing means `stable`. `deprecated` means the file is kept so old links and
old reports still work, but it is no longer current.

`stale_after` is an absolute date, never a duration like "90 days". The spec explains
why: an absolute date "keeps the staleness decision a plain date comparison with no
reference to when the concept was read". A concept is stale when today's date is on or
after it.

## Fields for Attested Computation

Only for files with `type: Attested Computation`. Section
[04](04-attested-computations.md) explains how they fit together.

| Field | Status | Meaning |
|---|---|---|
| `runtime` | **Required** | `bigquery`, `dbt`, `python`, `postgres`, `Looker`, and so on |
| `parameters` | Optional | The typed holes an agent may fill: `{ name, type, required }` |
| `computation` | Optional | Path to the computation, instead of writing it in the body |
| `executor.resource` | Optional | Instructions or code that runs it |
| `executor.receipt` | Optional | Which fields a run must return as evidence |
| `attester.resource` | Optional | Plain code that inspects the receipt and returns a verdict |

`runtime` does more work than it appears to. It decides what `parameters` mean: a
parameter is a SQL bind variable under `bigquery`, a variable under `dbt`, and a
function argument under `python`.

## Conformance, stated exactly

A bundle conforms to v0.2 when three things hold, per section 11:

1. Every non-reserved `.md` file has a YAML frontmatter block that parses.
2. Every one of those blocks has a non-empty `type`.
3. Any `index.md` and `log.md` present follow sections 8 and 9.

That is all. A reader **must not** reject a bundle for:

- missing optional fields
- a `type` value it does not recognise
- extra frontmatter keys it does not recognise
- broken cross-links
- missing `index.md` files

The format is deliberately hard to fail.

## Sources

- OKF v0.2 specification, sections 4, 5, 7, 10, 11, 12, 13:
  [okf/SPEC.md](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md)
- Type counts measured across the four bundles in
  [okf/bundles/](https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf/bundles).
  Method in [11](11-methodology-and-sources.md).
