# Adoption and reception

What can actually be established about who uses OKF, measured on 2026-08-13. Counts
come from the GitHub API against `GoogleCloudPlatform/knowledge-catalog`, not from
press coverage.

## The context the announcements leave out

OKF is described everywhere, including by Google, as a vendor-neutral format. That is
true of the format and incomplete about the project.

The specification lives in the `knowledge-catalog` repository. The repository's own
README opens: "Knowledge Catalog (formerly Dataplex), is an AI-powered data catalog and
metadata management platform." That is a paid Google Cloud service, and OKF is its
on-disk shape. The repository ships the round trip to prove it: `toolbox/mdcode/demo/okf/`
contains `push.ts`, `pull.ts`, and `okf-aspect.json`, a custom aspect type that moves
bundles between an OKF directory and Knowledge Catalog entries.

The type vocabulary tells the same story. Of 53 concepts in the sample bundles, 22 are
`BigQuery Table` and 3 are `BigQuery Dataset`.

None of this makes the format less portable. You genuinely can read a bundle with `cat`
and never touch Google Cloud. But "vendor-neutral open specification" and "interchange
format for a commercial catalog product" are both accurate, and only the first one
appears in the coverage. Weigh the second when you are estimating how the format will
evolve and whose needs will drive it.

## The timeline

| Date | Event |
|---|---|
| 2026-05-04 | Repository created |
| 2026-06-12 | OKF v0.1 published, with the reference agent |
| 2026-06-12 to 06-16 | Launch coverage: Google Cloud blog, Search Engine Journal, MarkTechPost, GitBook |
| 2026-07-24 | **OKF v0.2 replaces v0.1** via PR #227, announced the same day |
| 2026-07-26 to 07-29 | v0.2 coverage: Open Source For You, Search Engine Journal, others |
| 2026-08-13 | This report. Specification unchanged since 2026-07-24 |

Both versions were committed by `amir.hormati`. The v0.1 announcement is credited to
Sam McVeety and Amir Hormati of Google Cloud Data Analytics.

Two things follow that are easy to get wrong in opposite directions. The specification
moved fast: a substantial revision six weeks after launch, with two breaking changes.
And the record kept up: Google announced v0.2 the day it landed and the trade press
followed within a week. If you read a June article you are reading v0.1, because that is
all there was in June. Several third-party tools still implement v0.1, which is a real
lag; the published coverage is not.

## Repository signals

| Measure | Value |
|---|---|
| Stars | 8,569 |
| Forks | 734 |
| Open issues and PRs, all topics | 174 |
| Issues and PRs mentioning OKF | 145 |
| Open OKF issues | 78 |
| Open OKF pull requests | 45 |
| Merged OKF pull requests | 11 |

Two readings, both fair.

**Real engagement.** 145 OKF threads in two months is not an empty repository. The
issues are substantive: proposals for a media type, for conformance boundaries, for
profile declarations, for bitemporal corpora. People are reading the specification
closely enough to find its gaps.

**A maintainer bottleneck.** 45 open pull requests against 11 merged. External
contributors are writing spec fixes faster than Google is accepting them. Several of the
open PRs address defects this report found independently.

## The specification's real gaps, found by others

Three open threads corroborate findings in [06](06-conformance-audit.md), which is
useful because they were found independently.

| Thread | Raised | What it says |
|---|---|---|
| [#165](https://github.com/GoogleCloudPlatform/knowledge-catalog/pull/165) | 2026-07-01 | Section 6.1 recommends leading-slash links, but they break GitHub rendering once a bundle is a subdirectory. The reference agent already forbids them |
| [#286](https://github.com/GoogleCloudPlatform/knowledge-catalog/issues/286) | 2026-08-11 | `log.md` in the `acme_retail` sample carries frontmatter, which the spec never permits or forbids |
| [#232](https://github.com/GoogleCloudPlatform/knowledge-catalog/pull/232) | 2026-07-26 | The conformance boundary is undefined: which files in a repository are even in scope |

All three are open. Issue #286 has no reply.

Two more worth knowing about, because they mark real absences:

- [#111](https://github.com/GoogleCloudPlatform/knowledge-catalog/issues/111) proposes
  an IANA media type (`application/okf-bundle`). None exists, so a consumer can find a
  bundle but cannot recognise it as one without inspecting the contents.
- [#199](https://github.com/GoogleCloudPlatform/knowledge-catalog/issues/199) asks for
  the inline citation syntax to be clarified.

## Third-party tools exist, and they are small

This is the strongest adoption evidence and the most easily overstated. An open pull
request,
[#167](https://github.com/GoogleCloudPlatform/knowledge-catalog/pull/167), proposes
indexing community tools in the README. Every repository it lists was checked directly:

| Tool | Kind | Language | Stars | Last push |
|---|---|---|---|---|
| [okf-gem](https://github.com/serradura/okf-gem) | Skill, CLI, and server | Ruby | 120 | 2026-08-13 |
| [OWOX models](https://github.com/OWOX/owox-model-canvas) | Visual editor | TypeScript | 86 | 2026-08-13 |
| [OKFy](https://github.com/0dust/OKFy) | Docs-to-bundle converter | TypeScript | 65 | 2026-08-10 |
| [openknowledge](https://github.com/openknowledge-sh/openknowledge) | CLI | Go | 43 | 2026-08-11 |
| [kiso](https://github.com/oak-invest/kiso) | Static site publisher | Java | 26 | 2026-08-13 |
| [okf-conformance](https://github.com/Sudhakaran88/okf-conformance) | Validator | JavaScript | 16 | 2026-08-12 |
| [OnyxWriter](https://github.com/activetwist/OnyxWriter) | Desktop editor | TypeScript | 10 | 2026-07-02 |
| [okf-lint](https://github.com/thisismydesign/okf-lint) | Linter | TypeScript | 7 | 2026-06-23 |

Read that honestly in both directions.

**It is a real ecosystem.** Eight independent implementations in five languages, most
pushed within the last week. Producers, consumers, editors, validators, and publishers
are all represented. Two of them are validators, which is exactly what the specification
does not ship. That is what a format catching on looks like early.

**It is a small one.** The largest third-party tool has 120 stars against the Google
repository's 8,569. That ratio says people are watching the format far more than they
are building on it. Several tools state they implement v0.1, so the ecosystem is
already behind the specification.

Two caveats on the list itself. It comes from a pull request whose author discloses
they contribute to one of the listed tools, so it is self-nominated rather than vetted.
And the PR is still open, so Google has not endorsed it.

## What could not be established

Recorded because absence of evidence is a finding.

| Question | Status |
|---|---|
| Any organisation outside Google publishing a production OKF bundle | **Not found.** Every bundle located was a sample, a demo, or a test fixture |
| Whether OKF ingestion is generally available in a Google product | **Not confirmed.** The launch blog says Knowledge Catalog "now ingests OKF"; no public documentation of a generally available capability was found |
| A published roadmap for v0.3 | **Not found.** The only forward-looking statement is the deferred list in spec section 12 |
| Independent benchmarks of agent accuracy with and without an OKF bundle | **Not found.** The premise that curated context improves agent answers is asserted, not measured, in every source located |

That last one matters most. OKF's entire justification is that agents answer better with
curated context. No published evidence establishes by how much, for which tasks, or
whether OKF's particular shape beats simply putting good Markdown in a folder.

## An honest read

**What is genuine:** an active specification process with real external participation, a
working reference implementation, four complete sample bundles, eight independent tools,
and a specification that revised itself substantially within six weeks of shipping. The
attestation design in [04](04-attested-computations.md) is a real contribution with no
close equivalent.

**What is not yet demonstrated:** production use outside Google, any measured benefit,
a maintainer process that keeps up with its own contributors, and working code for
roughly half of what v0.2 specifies. See Finding 0 in
[06](06-conformance-audit.md): `verified`, `stale_after`, and `Attested Computation`
appear in no bundle Google's own agent produced, and no shipped code reads any of the
five attestation fields.

**The risk to weigh:** OKF is a file format, so the cost of adopting it and later
abandoning it is low. Your knowledge stays as Markdown in a directory either way. That
asymmetry is the strongest practical argument for trying it, and it is stronger than any
adoption number above.

## Sources

- Repository statistics, issue and pull request counts: GitHub API against
  [GoogleCloudPlatform/knowledge-catalog](https://github.com/GoogleCloudPlatform/knowledge-catalog),
  read 2026-08-13
- Third-party repository statistics: GitHub API, each repository read individually
- Launch announcement:
  [How the Open Knowledge Format can improve data sharing](https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing),
  Google Cloud, 2026-06-12
- Coverage:
  [Search Engine Journal](https://www.searchenginejournal.com/google-cloud-announces-the-open-knowledge-format/579253/),
  [MarkTechPost](https://www.marktechpost.com/2026/06/16/google-cloud-introduces-open-knowledge-format-okf-a-vendor-neutral-markdown-spec-for-giving-ai-agents-curated-context/),
  [GitBook](https://www.gitbook.com/blog/what-is-okf-open-knowledge-format)
