# Delivery and collaboration measurements

Git records what changed. It does not record what happened *around* the change:
how long it waited for review, who reviewed it, whether the build passed. That
information exists only on GitHub, and it is the strongest argument for calling
the API at all.

All measurements below come from `cli/cli`, chosen because it has enough volume
to produce meaningful percentiles. Collected 2026-08-11.

## Pull request cycle time

One GraphQL query returns 100 merged pull requests with reviews and commit
counts for 3 rate-limit points. The query is in
[04-github-api-surface.md](04-github-api-surface.md).

Sample: 100 most recently updated merged pull requests. 93 of them were created
in the 35 days to 2026-08-10.

| Measurement | n | Median | 75th | 90th | Max |
| --- | --- | --- | --- | --- | --- |
| Open to merge, hours | 100 | 20.09 | 101.58 | 191.15 | 1,247.38 |
| Open to first review, hours | 98 | 2.07 | n/a | 132.31 | 262.51 |
| Changed lines (added + deleted) | 100 | 18 | 154.75 | 501.30 | 13,075 |
| Changed files | 100 | 2 | 4 | 7.10 | 86 |
| Review submissions per pull request | 100 | 1.5 | 3 | 5 | 65 |

Percentiles are linear-interpolated. The 75th percentile is not shown for first
review because that column is reported after the correction described below and
the interpolated value adds nothing.

One pull request in the sample had zero reviews.

### The correction that matters

GitHub lets anyone submit a review on a pull request that merged years ago. The
naive query "earliest review timestamp minus creation timestamp" therefore
includes reviews that arrived after the merge.

Measured effect on the same 100 pull requests:

| Definition | n | Median hours | 90th percentile | Max |
| --- | --- | --- | --- | --- |
| First review, unfiltered | 99 | 2.75 | 143.73 | 56,035.49 |
| First review, submitted at or before merge | 98 | 2.07 | 132.31 | 262.51 |

The 56,035-hour maximum is six and a half years: pull request #521, opened and
merged in February 2020, received a review comment in July 2026. That single row
moved the median by 25%.

**Rule: bound every review timestamp by `mergedAt`.** Then report how many pull
requests lost their first review to the filter, which was 1 here.

### The window trap

`orderBy: {field: UPDATED_AT}` sounds like a time window and is not. Any old
pull request re-enters the list the moment someone comments on it. In this
sample **7 of 100** were created before the apparent window, including that 2020
one.

Filter on `mergedAt` in your own code, or use the search interface with an
explicit `merged:>=2026-07-01` qualifier and accept its 1,000-result cap.

### Reading these numbers

Report the median and the 90th percentile. Never the mean. The mean of the
open-to-merge column is dragged upward by the 1,247-hour maximum and describes no
real pull request.

The gap between the median (20 hours) and the 90th percentile (191 hours) is the
finding. Half of the changes land within a day; one in ten takes over a week. The
interesting question is what those slow ones have in common, and the size
columns answer it: the median pull request changes 18 lines across 2 files, while
the 90th percentile changes 501 lines across 7. Size predicts wait.

## Review load

Reviews per pull request has a median of 1.5 and a maximum of 65. That maximum
is one long argument, and the distribution's shape means an average would hide
it.

Per-reviewer aggregation comes from the same query by grouping
`reviews.nodes[].author.login`. Two warnings before you build that view:

- `reviews(first: 20)` truncates. One pull request here had 65 review
  submissions, so 45 were missing from the response. Compare
  `reviews.totalCount` with the number of nodes returned and paginate when they
  differ.
- A "review submission" is not a review. Approving, requesting changes and
  leaving a comment all count. Group by the `state` field
  (`APPROVED`, `CHANGES_REQUESTED`, `COMMENTED`, `DISMISSED`) or the numbers
  will not mean what the label says.

## Build telemetry

```bash
gh api "repos/{owner}/{repo}/actions/runs?per_page=100"
```

The 100 most recent runs on `cli/cli`, covering roughly 24 hours out of 31,382
total runs:

| Conclusion | Runs |
| --- | --- |
| success | 88 |
| action_required | 9 |
| skipped | 3 |
| failure | 0 |
| Total | 100 |

Triggering events in that same sample: `schedule` 54, `pull_request` 15,
`issue_comment` 7, `pull_request_target` 7, `dynamic` 7, `issues` 6, `push` 4.

**Over half of it is cron.** A build health number computed from unfiltered runs
is mostly measuring scheduled housekeeping jobs. Filter by event.

The same query restricted to completed pull request runs
(`?event=pull_request&status=completed`, 5,085 matching runs, 100 sampled):

| Measurement | Unfiltered sample | `event=pull_request` |
| --- | --- | --- |
| Failure rate | 0.0% of 100 | 1.1% of 88 concluded |
| Wall clock, median | 18 s | 170 s |
| Wall clock, 90th percentile | 245 s | 584 s |
| Wall clock, max | 573 s | 788 s |
| Window covered | 24 hours | 4 days |

The median run time is nine times longer once the cron jobs are removed. Both
numbers are true; only one answers "how long do contributors wait for CI".

Note `action_required` in both samples (9 and 12). Those are runs waiting for a
maintainer to approve a workflow from a fork. They are neither successes nor
failures, and folding them into either direction is wrong. Report them as their
own state.

### Per-run detail

| Endpoint | Adds |
| --- | --- |
| `GET /actions/runs/{id}/timing` | `run_duration_ms`, plus billable milliseconds per runner operating system |
| `GET /actions/runs/{id}/jobs` | per-job start and end time, runner name and labels, step count |

Observed timing response: `{"billable": {"UBUNTU": {"total_ms": 0, "jobs": 1}},
"run_duration_ms": 11000}`. Billable time reads 0 on public repositories because
they do not consume minutes. Compute cost only from private repositories or
from the organisation billing endpoint.

Job-level data is where the actionable information is. A run that takes 584
seconds usually contains one job that takes 550 and several that take 20. You
cannot see that from the run object.

Cost: one request per run for timing, one per run for jobs. For a repository with
31,382 runs this is the most expensive collection in this report. Collect
incrementally with `?created=>=YYYY-MM-DD` and keep only what you have not seen.

## DORA metrics

DORA (DevOps Research and Assessment) publishes the standard delivery measures.
As of the current guidance there are **five**, not the four people usually quote,
and "mean time to restore" has been renamed.

| Metric | Definition | Where the data comes from |
| --- | --- | --- |
| Deployment frequency | how many deployments in a period, or the time between them | `GET /deployments`, or release tags, or a workflow with a `production` environment |
| Change lead time | time from a change being committed to version control until it is deployed to production | local `git log` for the commit time, joined to the deployment record |
| Change fail rate | share of deployments needing immediate remediation | your incident record joined to deployments. **Not derivable from GitHub alone** |
| Failed deployment recovery time | how long to recover after a deployment breaks production | same |
| Deployment rework rate | share of unplanned deployments caused by production incidents | same |

Two of the five are cheap and three are not. Deployment frequency and change
lead time can be computed today from `GET /repos/{o}/{r}/deployments` (status
200, confirmed) plus the commit history. The three stability metrics all require
you to record what a production incident is, and no API knows that. Teams that
claim full DORA coverage from GitHub data alone are approximating the failure
metrics with "did the deploy workflow fail", which is a different and much
weaker thing.

If you have no incident record, say so and publish the two throughput metrics
only. Two honest metrics beat five invented ones.

## Issue flow

`GET /issues/events` (status 200) returns labelled, assigned, closed, reopened
and referenced events with timestamps. From those you can build:

- **Time to triage.** Created until the first label or assignment.
- **Time to close**, split by label.
- **Reopen rate.** Reopened events divided by closed events. A quality signal
  that costs nothing.
- **Backlog age.** Distribution of open-issue ages, which is more useful than the
  count.

Watch the definitions: pull requests are issues in the GitHub data model. `GET
/issues` returns both unless you filter on the absence of the `pull_request`
field, so an unfiltered "open issues" count includes open pull requests. The
repository object's `open_issues_count` has the same problem.

## What a weekly delivery report should contain

| Row | Source | Cost per repository |
| --- | --- | --- |
| Merged pull requests this week | GraphQL, filtered by `mergedAt` | 1-3 points |
| Open to merge, median and 90th percentile | same call | 0 |
| Open to first review, median and 90th percentile, bounded by merge | same call | 0 |
| Median changed lines per pull request | same call | 0 |
| Pull requests merged with zero reviews | same call | 0 |
| CI failure rate on pull request runs | 1 REST call | 1 request |
| CI wall clock, median and 90th percentile | same call | 0 |
| Deployment count and lead time | 1-2 REST calls | 2 requests |

Roughly five requests and three GraphQL points per repository per week. At that
cost, the 5,000-per-hour limit stops being a design constraint and the real
constraint becomes storing the results so you can see trends.
