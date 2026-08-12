# Executive brief

## The result that changes what you do next

Almost everything worth knowing about a codebase is already on your disk. The
Git history is a complete, free, offline event log: every change, who made it,
when, and which lines moved. GitHub adds three things the history cannot hold,
and only three that matter:

1. **Review and merge timing.** Who reviewed what, how long it waited.
2. **Build and job telemetry.** What ran, how long, what failed.
3. **Security findings and dependency data.** Alerts, scans, the package list.

Everything else GitHub shows you (contributor charts, commit activity, punch
cards, language bars) is a slower, capped, cached rendering of data you can
compute locally in under a second and with more control.

**Build local first. Call GitHub only for the three things above.**

## What it costs

| Source | Setup | Runtime on a 287-commit repo | Rate limit |
| --- | --- | --- | --- |
| Git history, plain commands | none | under 1 s per query | none |
| Git blame across a tree | none | ~2 s for 110 files | none |
| GitHub REST, repository facts | token | 1 request | 5,000 requests/hour |
| GitHub REST, statistics | token | 1 request plus a retry | 5,000 requests/hour |
| GitHub GraphQL, 100 pull requests with reviews | token | 1 request, 3 points | 5,000 points/hour |
| GitHub REST, same 100 pull requests | token | 201 requests | 5,000 requests/hour |

The last two rows are the single biggest cost decision in this report. Pulling
100 merged pull requests with their reviews and commit counts costs **3 points
in GraphQL and 201 requests in REST**, both measured today. Use GraphQL for
anything that walks a list and needs its children.

## The seven measurements worth having

Ranked by value per unit of effort.

1. **Hotspots.** Files that change often and are structurally complicated. This
   is the shortlist of what to refactor. Cost: one `git log` and one pass over
   the files.
2. **Pull request cycle time, at the 50th and 90th percentile.** How long a
   change waits. Cost: one GraphQL call per 100 pull requests.
3. **Ownership concentration.** How much of a file one person wrote. Tells you
   what breaks when someone leaves. Cost: `git blame` per file.
4. **Temporal coupling.** Files that keep changing together despite living apart.
   Points at hidden dependencies. Cost: one `git log --name-only` pass.
5. **Code age.** When each surviving line was last touched. Old and stable is
   good. Old and hot is a warning. Cost: `git blame` per file.
6. **Security alert counts by state and age.** Cost: one REST call per category.
7. **Build failure rate and job duration.** Cost: one REST call per workflow run,
   or one list call plus filters.

## What to skip

- **Lines of code as a productivity measure.** In the test repository one author
  shows 125,138 added lines. Most of that is a package lock file and generated
  content. The number measures typing, not work.
- **`stats/code_frequency` on anything large.** GitHub returns HTTP 422 with
  "repository must have fewer than 10000 commits". Confirmed today against
  `cli/cli`.
- **Per-person dashboards.** See [09-limits-and-pitfalls.md](09-limits-and-pitfalls.md).
  These numbers are diagnostic for code, not for people, and in several
  jurisdictions using them for people is a legal matter, not a taste question.

## The three traps that will bite you first

**Identity splitting.** The test repository has four Git identities. Two of them
share one email address and differ only by display name, so every by-author
count was wrong by 26 commits until a `.mailmap` merged them. Fix: write a
`.mailmap` before you count anything.

**Dead hotspots.** Of the 50 highest-churn files in the test repository, **40 no
longer exist** at the current commit. Ranking churn without checking which files
still exist produces a refactoring list of deleted code. Fix: filter against
`git ls-files`.

**Reviews submitted after merge.** GitHub lets someone review a merged pull
request years later. In a real 100-pull-request sample the unfiltered median
time to first review was 2.75 hours and the maximum was 56,035 hours, six and a
half years, because one 2020 pull request got a comment in 2026. Filtering
reviews to those submitted at or before the merge moved the median to 2.07
hours and the maximum to 262 hours. Fix: bound every review timestamp by the
merge timestamp.

## Where to start on Monday

1. Add a `.mailmap`.
2. Run the hotspot query in [03-evolutionary-analysis.md](03-evolutionary-analysis.md).
   Look at the top ten files. That is your refactoring backlog.
3. Run the pull request percentile script in
   [06-delivery-and-collaboration.md](06-delivery-and-collaboration.md) once a
   week. Track the 90th percentile, not the average.
4. Turn on the dependency graph and code scanning if they are off. Today three
   of the four test repositories returned "Dependabot alerts are disabled" and
   "no analysis found", which means the data does not exist to be collected.
