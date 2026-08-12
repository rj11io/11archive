# Glossary

Terms as used in this report. Where a term has a formal source, the source is
named.

## Measurement terms

**Behavioural code analysis.** Studying a codebase through its change history
rather than its current text. The name comes from Adam Tornhill's *Your Code as
a Crime Scene*.

**Blame.** Attributing each surviving line of a file to the commit that last
changed it. `git blame`. It describes the current file only; deleted code has no
owner.

**Bus factor.** How many people would have to leave before knowledge of a piece
of code is lost. Approximated here as the number of files where one author owns
more than 80% of the surviving lines. Also called truck factor.

**Churn.** Lines added plus lines deleted over a period. A measure of activity,
not of quality or value.

**Code age.** Time since a surviving line was last changed. Old and stable is
usually healthy; old inside a hotspot is a warning.

**Code survival.** The share of lines added in a given period that still exist
today. Computed with a Kaplan-Meier estimator, the standard statistical method
for lifetimes when some subjects are still alive. Implemented by
`git-of-theseus` and `hercules`.

**Cohort.** A group of lines defined by when they were added, tracked forward
through time.

**Complexity, cyclomatic.** The number of independent paths through a function.
Roughly one plus the number of branch points. Written CCN in `lizard` output.
Needs a language parser to compute correctly.

**Complexity estimate.** An approximation of the above obtained by counting
branch and loop keywords without parsing. What `scc` reports. Comparable within
one language only.

**COCOMO.** Constructive Cost Model. A formula converting lines of code into an
estimate of person-months. Reported by `scc`. Treat as a curiosity.

**Hotspot.** A file that changes often and is structurally complicated. The
intersection is the point; either signal alone is weak.

**Indentation complexity.** Mean and maximum leading whitespace depth per line,
used as a language-independent proxy for nesting.

**NLOC.** Lines of code excluding comments and blanks.

**Temporal coupling.** Two files repeatedly changing in the same commit.
Suggests a dependency the directory structure does not express. Also called
change coupling or logical coupling.

**ULOC.** Unique lines of code across a project. A whole-repository duplication
signal reported by `scc`.

## Git terms

**Author date and committer date.** The author date is when a change was
written; the committer date is when it landed on this branch. A rebase or
cherry-pick keeps the first and rewrites the second. `%aI` and `%cI` in
`git log --pretty`.

**Blob.** Git's storage object for file contents, identified by a hash of the
content. Two files with the same blob hash are byte-identical.

**Conventional Commits.** A convention where the commit subject starts with a
type, such as `feat:`, `fix:` or `chore:`, optionally with a scope in
parentheses. Turns the log into a labelled event stream.

**mailmap.** A `.mailmap` file at the repository root mapping alternative names
and email addresses onto one canonical identity. Respected by `%aN` and `%aE`,
ignored by `%an` and `%ae`.

**Merge commit.** A commit with two or more parents. Contains no original work in
a standard workflow, and `--numstat` on one double-counts. Excluded throughout
this report with `--no-merges`.

**numstat.** `git log --numstat` output: one line per changed file with lines
added, lines deleted and the path. Binary files print `-` for both counts.

**Rename detection.** Git does not record renames; it infers them by comparing
content at query time. `-M` for renames, `-C` for copies, `--follow` to trace
one file's history across them.

**Shortlog.** `git shortlog` groups commits by author. Reads from standard input
unless given an explicit revision, which makes it silently return nothing in
scripts.

## GitHub terms

**Anonymous contributor.** A commit author whose email matches no GitHub
account. Excluded from `GET /contributors` unless `anon=1` is passed. Observed
here as 304 of 686 contributors on one repository.

**Attestation.** A signed statement that a specific artefact was produced by a
specific workflow from specific source. GitHub's implementation of build
provenance.

**Code scanning.** Static analysis results stored on GitHub, usually produced by
CodeQL. Reading the alerts needs the `security_events` scope.

**Dependabot.** GitHub's dependency alerting and update service. Its alert
endpoint returns an explicit "disabled" message when the feature is off.

**Dependency graph.** GitHub's resolved package list for a repository, built
from manifests and lock files. Its SBOM endpoint returns 404 when the graph is
switched off.

**GHSA and CVE.** GitHub Security Advisory identifier and Common Vulnerabilities
and Exposures identifier. Both appear in the advisory database; an advisory may
have a GHSA without a CVE.

**GraphQL point.** The cost unit for GitHub's GraphQL API. Computed from the
requests the server would have made internally, divided by 100 and rounded.
Budget 5,000 per hour for a user token.

**Linguist.** GitHub's language classifier. Drives the language bar and the
`languages` endpoint, which reports **bytes**, not lines. Controlled per path
with `.gitattributes`.

**Punch card.** A 168-cell grid of commits by weekday and hour. GitHub's version
uses each commit's own recorded timezone.

**Ruleset.** The current mechanism for branch and tag rules on GitHub,
succeeding branch protection. An empty array means none are configured.

**SARIF.** Static Analysis Results Interchange Format. The standard JSON format
GitHub accepts for uploading third-party scanner results into code scanning.

**SBOM.** Software Bill of Materials. A machine-readable list of every package a
project depends on. GitHub emits SPDX 2.3, generated at request time.

**Secondary rate limit.** Limits that apply on top of the hourly request limit:
100 concurrent requests, 900 points per minute on REST, 90 seconds of processing
per 60 seconds of wall clock. Usually the limit a collector hits first.

**202 Accepted.** The status returned by GitHub's statistics endpoints while the
result is being computed in the background. The body is empty. Retry.

## Delivery terms

**Change fail rate.** The share of deployments that need immediate remediation.
One of DORA's five metrics. Not derivable from GitHub data alone; it needs an
incident record.

**Change lead time.** Time from a change being committed to version control
until it is running in production. DORA's definition.

**Cycle time.** Used loosely across the industry. In this report, always stated
explicitly as a pair of endpoints, for example "open to merge" or "open to first
review".

**Deployment frequency.** How many deployments in a period, or the time between
them. DORA.

**DORA.** DevOps Research and Assessment. Publishes the standard delivery
metrics. Current guidance lists five, with "failed deployment recovery time"
replacing the older "mean time to restore".

**Failed deployment recovery time.** How long it takes to recover after a
deployment breaks production. DORA. Replaced MTTR in the current model.

**Deployment rework rate.** The share of deployments that were unplanned
responses to production problems. DORA's fifth metric.

**SPACE.** A framework from GitHub and Microsoft researchers arguing that
developer productivity has five dimensions: satisfaction, performance, activity,
communication and efficiency. Its core claim is that no single metric captures
productivity, and that activity metrics are the weakest while being the easiest
to collect.

**Time to triage.** From issue creation to its first label or assignment.

## Statistical terms as used here

**Coverage.** What share of the intended population a number actually describes.
Always reported beside the number.

**Median, and 90th percentile.** The middle value, and the value below which 90%
of observations fall. Used throughout instead of the mean, because every
distribution measured here is heavily skewed.

**Percentile, linear-interpolated.** When a percentile falls between two
observations, the value is interpolated between them. The method used for every
percentile in this report.

**Proxy.** A measurable stand-in for something you cannot measure directly. The
share of commits typed `fix` is a proxy for defect rate: correlated, not equal,
and gameable.

## Evidence states

Used to label every value in [data.json](data.json).

| State | Meaning |
| --- | --- |
| `observed` | directly measured by running the command shown |
| `source-reported` | stated by documentation, not independently measured |
| `calculated` | derived from observed values by a disclosed formula |
| `unavailable` | expected but not obtainable, with the reason recorded |
| `not applicable` | not meaningful for this row |
