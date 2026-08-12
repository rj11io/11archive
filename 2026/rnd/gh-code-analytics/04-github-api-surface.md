# The GitHub API surface

Every endpoint below was called on 2026-08-11 with the `gh` command line tool
version 2.89.0, using a personal access token with scopes `repo`, `read:org`,
`workflow`, `gist`. The "Observed" column is the actual HTTP status returned,
not what the documentation promises.

Two repositories are used as subjects: a small one owned by the token holder
(25 commits) and `cli/cli`, a large public repository (over 10,000 commits, 3,132
merged pull requests, 45,798 stars) which triggers the size limits the small one
never reaches.

## Rate limits, the budget you are spending

| Credential | Limit |
| --- | --- |
| No token | 60 requests/hour |
| Personal access token | 5,000 requests/hour |
| GitHub App installation | 5,000/hour, up to 12,500 with scale bonuses |
| GitHub App on Enterprise Cloud | 15,000/hour |
| `GITHUB_TOKEN` inside Actions | 1,000/hour per repository |
| GraphQL, user token | 5,000 points/hour |
| Search endpoints | 30 requests/minute |
| Code search | 10 requests/minute |

Secondary limits apply on top and are the ones that actually stop a collector:
at most **100 concurrent requests**, at most **900 points per minute** on REST
(a read costs 1 point, a write costs 5), and at most **90 seconds of processing
time per 60 seconds of wall clock**. Source: GitHub REST rate-limit
documentation.

Check your own state without spending anything, since `rate_limit` is free:

```bash
gh api rate_limit --jq '.resources | {core, graphql, search, code_search}'
```

Observed at the start of this session: core 5000/5000, graphql 5000/5000, search
30/30, code_search 10/10. A single code search dropped code_search to 9.

## REST versus GraphQL, measured

This is the most important cost decision in the whole report.

| Task | REST | GraphQL |
| --- | --- | --- |
| 5 merged pull requests with reviews and commit counts | 11 requests | 1 request, cost 1, 115 nodes |
| 50 merged pull requests, same fields | 101 requests | 1 request, cost 2, 1,150 nodes |
| 100 merged pull requests, same fields | 201 requests | 1 request, cost 3, 2,300 nodes |

The REST figures are the arithmetic: one list call, then one `/reviews` call and
one `/commits` call per pull request. The GraphQL figures are the `rateLimit`
block returned by the query itself.

GraphQL points are computed from the requests the server would have had to make
internally, divided by 100 and rounded. The hard caps: `first` and `last` must be
between 1 and 100, and no single call may touch more than 500,000 nodes.

**Rule: any question shaped as "a list, and for each item some children" belongs
in GraphQL.** Everything else is simpler in REST.

## Repository facts

| Endpoint | Returns | Observed | Notes |
| --- | --- | --- | --- |
| `GET /repos/{o}/{r}` | size in KB, primary language, stars, forks, watchers, open issues, default branch, visibility, created and pushed timestamps, topics, archived flag | 200 | one call, no caveats |
| `GET /repos/{o}/{r}/languages` | bytes per language | 200 | computed by Linguist, byte counts not lines |
| `GET /repos/{o}/{r}/topics` | topic list | 200 | also present in the repo object |
| `GET /repos/{o}/{r}/community/profile` | health percentage and which community files exist | 200 | returned 42% and only `readme` present for the test repo |
| `GET /repos/{o}/{r}/codeowners/errors` | syntax errors in CODEOWNERS | 200 | useful pre-merge check |
| `GET /repos/{o}/{r}/contributors` | contributors with commit counts | 200 | see the anonymous-author note below |
| `GET /repos/{o}/{r}/forks`, `/tags`, `/releases` | list views | 200 | ordinary pagination |
| `GET /repos/{o}/{r}/stargazers`, `/subscribers` | who starred or watches | 200 own repo, **404 on two third-party public repos** | cause not established with this token; use `stargazers_count` from the repo object instead |
| `GET /repos/{o}/{r}/collaborators` | collaborator list | **403** on a repo we do not administer | needs push access |

The `languages` endpoint reports **bytes**, not lines. For the test repository it
returned HTML 1,845,662, TypeScript 266,514, JavaScript 42,600, CSS 4,477. A
single generated HTML report can therefore make a TypeScript project display as
"HTML" on GitHub. Fix it with `.gitattributes` and `linguist-generated=true`, or
ignore the field and count locally.

### Anonymous contributors

`GET /contributors` matches commit email addresses to GitHub accounts. Commits
whose email matches no account are dropped unless you ask for them.

Measured on `cli/cli` with `per_page=1`, reading the `Link` header's last page:

| Query | Contributors |
| --- | --- |
| default | 382 |
| `?anon=1` | 686 |

Nearly half the contributors are invisible by default. If you are counting
people, pass `anon=1`, then deduplicate by email yourself, because anonymous
entries have no stable identity.

## The statistics endpoints

Five endpoints back GitHub's own Insights graphs. They are cached and computed
in the background, which produces behaviour that will break a naive collector.

| Endpoint | Returns | Observed |
| --- | --- | --- |
| `GET /stats/contributors` | per contributor: total commits, plus weekly additions, deletions and commits | 202 on first call, 200 with data on retry |
| `GET /stats/commit_activity` | 52 weeks, commits per day of week | 202, still 202 after three retries |
| `GET /stats/code_frequency` | weekly additions and deletions | 202 on a small repo; **422 on `cli/cli`** |
| `GET /stats/participation` | 52 weekly commit counts, owner and everyone | 200 |
| `GET /stats/punch_card` | 168 cells, one per weekday-hour | 200 |

### The 202 pattern

First request returns `HTTP 202 Accepted` with an empty body `{}` while GitHub
computes the statistics. The correct client behaviour is retry with backoff.

Observed sequence on the small repository:

```
attempt 1: HTTP 202  {}          # cold cache, empty body
attempt 2: HTTP 200  [ ... ]     # warm
```

`gh api ... --jq length` on the cold response returns `0`, not an error. **A
collector that does not check the status code will record zero contributors and
report it as a fact.** Always inspect the status, never the body length.

Two of the five endpoints were still returning 202 after three attempts spread
over ten seconds on a repository last pushed to that same day, so the retry loop
needs a real ceiling and a documented "unavailable" outcome rather than a zero.

### The hard limits

- `code_frequency` returns **HTTP 422, "repository must have fewer than 10000
  commits"**. Confirmed on `cli/cli`. There is no workaround through the API;
  compute it locally with `git log --numstat`, which takes 0.61 s.
- `stats/contributors` returns additions and deletions as **0** for repositories
  with 10,000 or more commits, per GitHub's documentation. The zeros look like
  data and are not.
- `stats/contributors` returned exactly **500 entries** for `cli/cli`, which has
  686 contributors counting anonymous ones. Treat 500 as a cap.

### Merge commits are excluded

The small test repository has 25 commits locally, 25 on the default branch
remotely, and 25 from `GET /commits`. `stats/contributors` reports **23**. The
difference is exactly the 2 merge commits. Any reconciliation between GitHub
statistics and local `git rev-list --count` must add `--no-merges` first.

### Week boundaries and clocks

- `participation` counts weeks as UTC midnight to UTC midnight, most recent week
  ending today.
- `punch_card` uses **the timezone recorded in each commit**, so a distributed
  team's punch card mixes local clocks.
- Weekly buckets elsewhere start on Monday.

Mixing these three without saying which is which is the most common way these
numbers get misreported.

## Traffic

| Endpoint | Returns | Retention | Observed |
| --- | --- | --- | --- |
| `GET /traffic/views` | daily and total page views, plus unique visitors | 14 days | 200: count 6, uniques 1, 14 daily buckets |
| `GET /traffic/clones` | clone counts and unique cloners | 14 days | 200: count 106, uniques 47 |
| `GET /traffic/popular/paths` | top 10 paths | 14 days | 200 |
| `GET /traffic/popular/referrers` | top 10 referring sites | 14 days | 200 |

All four need **write access**. All four keep only **14 days**. There is no
history endpoint and no export. If you want traffic trends you must snapshot
these daily, forever, starting now. This is the single strongest argument for
running a scheduled collector at all: it is the only data in this report that is
permanently destroyed if you do not capture it.

The clone count in the test repository (106 clones, 47 unique) against 6 page
views is a normal pattern for a repository consumed by automation rather than
read by people.

## Commits, pull requests, issues

| Endpoint | Useful fields |
| --- | --- |
| `GET /commits` | `sha`, `author.login` (resolved account), `commit.author.date`, `commit.verification.verified` and `reason`, `parents` |
| `GET /commits/{sha}` | adds `stats.additions/deletions/total` and a per-file list with additions, deletions and status |
| `GET /pulls` | state, timestamps, labels, draft flag, merge state |
| `GET /pulls/{n}/files` | per-file additions, deletions, patch |
| `GET /pulls/{n}/reviews` | review state and submission time |
| `GET /issues/events` | labelled, assigned, closed, referenced events with timestamps |

A single commit fetch on `cli/cli` returned `stats: {additions: 304, deletions:
254, total: 558}` and 86 files. Note that per-commit file lists are **capped at
300 files**; larger commits need the compare endpoint.

`GET /commits/{sha}` costs one request per commit. For anything more than a few
hundred commits, clone the repository and use `git log --numstat` instead. It is
free, faster, and gives you the same numbers.

## Actions

| Endpoint | Returns | Observed |
| --- | --- | --- |
| `GET /actions/workflows` | workflow definitions and state | 200 |
| `GET /actions/runs` | run list, filterable by `status`, `event`, `branch`, `actor`, `created` | 200, `total_count` 19 on the small repo |
| `GET /actions/runs/{id}` | conclusion, event, `run_started_at`, `updated_at`, attempt number, actor | 200 |
| `GET /actions/runs/{id}/timing` | `run_duration_ms` and billable milliseconds per runner operating system | 200 |
| `GET /actions/runs/{id}/jobs` | per job: status, conclusion, start and end time, runner name, labels, step count | 200 |
| `GET /actions/cache/usage` | active cache size in bytes and count | 200: 275,878,831 bytes across 2 caches |
| `GET /repos/{o}/{r}/commits/{ref}/check-runs` | check results for a commit | 200 |

Observed timing response shape:

```json
{"billable": {"UBUNTU": {"total_ms": 0, "jobs": 1, "job_runs": [...]}},
 "run_duration_ms": 11000}
```

`run_duration_ms` is wall clock for the whole run. `billable.total_ms` is what
you pay for and reads **0 for public repositories**, which get Actions minutes
free. Do not compute cost from a public repository and expect it to transfer.

The `created` filter accepts a date range, which is what makes run collection
incremental: `?created=>=2026-08-01`.

## Organisation and enterprise level

| Endpoint | Observed with this token | Meaning |
| --- | --- | --- |
| `GET /orgs/{org}/settings/billing/usage` | 200, 11 usage items | current billing platform, works |
| `GET /orgs/{org}/settings/billing/actions` | **410 Gone** | retired, do not build on it |
| `GET /orgs/{org}/audit-log` | **404** | needs GitHub Enterprise Cloud |
| `GET /orgs/{org}/insights/api/summary-stats` | **404** | needs Enterprise Cloud |
| `GET /orgs/{org}/copilot/metrics` | **404** | needs Copilot Business or Enterprise plus `read:org` and the metrics permission |

Copilot metrics, where available, return daily aggregates for an enterprise or
organisation, broken down by repository, user, and user-team pair. Historical
data starts 2025-10-10 and is retained for one year. There is no team-scoped
endpoint; you join the user report against the user-teams report yourself.

A 404 on these endpoints means "not available to you", not "no data". Record it
as unavailable, never as zero.

## Search

| Endpoint | Limit | Observed |
| --- | --- | --- |
| `GET /search/commits` | 30 requests/minute, 1,000 results per query | `repo:cli/cli fix` returned `total_count` 1,767 |
| `GET /search/code` | 10 requests/minute, 1,000 results per query | `repo:cli/cli extension` returned `total_count` 90 |

Both cap at 1,000 returned results regardless of `total_count`, so search is a
counting tool and a sampling tool, never an enumeration tool. The code index also
skips large files and some file types, which is why the code search count above
is far lower than a local `git grep` would report.

## A working GraphQL query

This is the query behind the pull request measurements in
[06-delivery-and-collaboration.md](06-delivery-and-collaboration.md). It costs 3
points for 100 pull requests.

```graphql
query($owner:String!, $name:String!, $n:Int!) {
  rateLimit { cost remaining nodeCount }
  repository(owner:$owner, name:$name) {
    pullRequests(states:MERGED, last:$n, orderBy:{field:UPDATED_AT, direction:ASC}) {
      totalCount
      nodes {
        number createdAt mergedAt additions deletions changedFiles
        author { login }
        reviews(first:20) { totalCount nodes { state submittedAt author { login } } }
        commits(first:1) { totalCount }
      }
    }
  }
}
```

```bash
gh api graphql -F owner=cli -F name=cli -F n=100 -f query="$(cat pr.graphql)"
```

Always request `rateLimit { cost remaining }` in the same query. It is free, it
returns the true cost of the call you just made, and it is the only reliable way
to size a collector before it hits the limit.

Two things to fix in this query before using it for real:

- `orderBy: UPDATED_AT` means a six-year-old pull request re-enters the window
  when somebody comments on it. In the 100-pull-request sample, **7 were created
  before the apparent window**. Filter by `mergedAt` in your own code.
- `reviews(first:20)` silently truncates. One pull request in the sample had 65
  review submissions. Check `reviews.totalCount` against the node count and
  paginate when they disagree.
