# Where these numbers lie

Every measurement in this report is real. Several of them are also easy to
misread, and a few are dangerous when pointed at people. This chapter is the
list of ways the work goes wrong.

## Measurement errors, ranked by how often they happen

**Splitting one person into several.** Observed: four Git identities in a
287-commit repository, two of which shared an email address and differed only by
display name. Every by-author number was wrong by 26 commits until a `.mailmap`
merged them. Fix before anything else.

**Ranking dead code.** Observed: 40 of the 50 highest-churn files no longer
exist. Always intersect churn with `git ls-files`.

**Counting reviews that arrived after the merge.** Observed: median time to
first review moved 2.75 to 2.07 hours and the maximum moved 56,035 to 262 hours
once reviews after `mergedAt` were excluded. Bound every review timestamp.

**Treating a permission error as zero.** Observed: `403` from code scanning,
`404` from dependency graph, and the message "Dependabot alerts are disabled".
None of these mean zero alerts. Store the status code.

**Treating a 202 as an empty result.** Observed: `gh api ... --jq length`
returned `0` on a cold statistics cache. Check status, never body length.

**Letting a bot dominate.** Observed: a release bot with 59 commits touching
every plugin manifest at once, creating a fully connected block of false
temporal coupling. Filter bot authors before any co-change analysis.

**Including merges in churn.** A merge's `--numstat` prints the combined diff and
double-counts. Also the source of a real discrepancy: 25 commits locally, 23 in
GitHub's `stats/contributors`, because that endpoint excludes the 2 merges.

**Counting generated files.** The largest churn entry in the test repository is a
`package-lock.json` at 12,340 lines over 2 commits. Nobody wrote it. Exclude
lock files, bundles, snapshots and vendored directories, and note that
`linguist-generated` in `.gitattributes` changes GitHub's display only, never
`git log --numstat`.

**Reporting a mean.** Observed distributions in this report: file length median
84 and max 1,388; merge time median 20 hours and max 1,247; reviews per pull
request median 1.5 and max 65. Every one is heavily skewed. Report the median
and the 90th percentile.

**Mixing clocks.** Author date is not committer date. GitHub's `punch_card` uses
each commit's own timezone; `participation` uses UTC weeks; other weekly buckets
start Monday. State which one you used.

**Silent truncation.** `reviews(first: 20)` returned 20 nodes for a pull request
whose `totalCount` was 65. `search` caps at 1,000 results whatever `total_count`
says. `stats/contributors` returned exactly 500 rows for a repository with 686
contributors. Compare the count you got against the count the API claims, every
time.

## What these metrics genuinely cannot tell you

- **Whether the code is good.** Every metric here detects smells. A smell is a
  hypothesis to check by reading the code.
- **Whether a file matters.** Size, churn and complexity are not importance. The
  most important file in most systems is small and stable.
- **Whether code runs.** Only coverage and runtime telemetry answer that.
- **Whether a change was worth making.** No repository metric encodes value.
- **Why something is slow.** A 90th-percentile merge time of 191 hours is a
  question, not a diagnosis. The answer is usually a conversation.

## Goodhart's law, concretely

Once a measure becomes a target it stops being a good measure. This is not a
philosophical aside; each of these is a documented, easy, undetectable response
to a metric being watched.

| Metric watched | How it gets gamed | What actually degrades |
| --- | --- | --- |
| Commits per week | split work into tiny commits | history becomes unreadable |
| Lines added | copy instead of extract, verbose style | duplication rises |
| Pull request merge time | approve without reading | defect rate rises |
| Review count | rubber-stamp approvals | review becomes ceremony |
| Test count | many trivial assertions | coverage stays flat, suite slows |
| Issue close time | close and reopen elsewhere | tracking becomes fiction |
| Code coverage percent | tests that execute without asserting | false confidence |

The general defence: use these numbers to find **places to look**, never as
targets, and never in a comparison between individuals. A metric used to decide
where to spend an afternoon survives contact with humans. The same metric on a
leaderboard does not.

## Measuring people

This is the part with legal weight, not only ethical weight.

**Git and GitHub data about individuals is personal data.** Names, email
addresses, timestamps of activity and productivity indicators are identifiable
information about identifiable people. Under the EU and UK General Data
Protection Regulation, processing it needs a lawful basis, a stated purpose,
retention limits and transparency to the people concerned. "It was already in
the commit log" is not a lawful basis for a new purpose such as performance
assessment.

Practical consequences:

- **Say what you are collecting and why, before you collect it.** Retrofitting
  consent does not work.
- **In Germany, Austria, the Netherlands and several other jurisdictions, works
  council co-determination applies** to systems capable of monitoring employee
  performance. A dashboard with per-developer output is such a system, whatever
  you intended.
- **Aggregate by default.** Team-level and repository-level numbers answer almost
  every legitimate question. Per-person numbers answer very few, and those few
  are usually better answered by talking to the person.
- **Never store raw email addresses** in analytics output. Hash them, or map them
  through the `.mailmap` to a stable pseudonym.
- **Cadence is surveillance too.** The commit-hour histogram in
  [01-local-git-history.md](01-local-git-history.md) reveals working patterns,
  including evening and weekend work and, over time, illness and holidays. It is
  a useful signal about **process** ("the team is compensating for something") and
  an inappropriate one about a person.

The one framing that consistently holds up: **these metrics diagnose the system,
not the people in it.** A file with a bus factor of 1 is an organisational risk
to fix by pairing and documentation. It is not a fact about the person who wrote
it.

The SPACE framework, developed by researchers at GitHub and Microsoft, makes the
same argument from the research side: developer productivity is multi-dimensional
(satisfaction, performance, activity, communication, efficiency), no single
metric captures it, and activity metrics such as commit counts are the weakest
dimension while being the easiest to collect. That combination is precisely why
they get misused.

## Coverage and honesty in reporting

Whatever you publish, publish beside it:

- **The population.** Which repositories, which branch, which period.
- **The n.** A percentile over 100 pull requests and over 4 are different facts.
- **The exclusions.** Merges, bots, generated files, and how you identified each.
- **The unavailable ones.** Repositories where the call returned 403 or 404
  belong in the report as unavailable rows, not as absences.
- **The clock.** Author or committer time, and which timezone.

The failure mode this prevents: a report covering 12 of 40 repositories, showing
excellent security posture, because the other 28 returned 403 and were quietly
dropped.
