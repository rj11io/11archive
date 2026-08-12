# A collector you can actually run

A design for gathering everything in this report on a schedule, sized for one
person and a few dozen repositories. It assumes no database, no service and no
budget.

## The four rules

**1. Local first.** If `git` can answer it, never call the API. Local queries
are free, offline, unlimited and faster. The API is for review timing, build
telemetry and security state, and nothing else.

**2. Snapshot what expires.** Most GitHub data is permanent and can be fetched
whenever. Traffic is not: views, clones, popular paths and referrers keep
**14 days** and are then gone forever. If you build only one scheduled job,
build the traffic snapshot.

**3. Record the status code, never the absence.** Every stored metric carries how
it was obtained. A 403 stores as `unavailable`, not `0`. This one rule prevents
the most damaging class of error in the whole exercise, which is a security
dashboard reporting an unmonitored repository as clean.

**4. Append, never overwrite.** One line of JSON per observation per day. Trends
are the product; a current-state snapshot is nearly worthless on its own.

## Storage

One JSON Lines file per source. No schema migration, no server, greppable, and
`jq` reads it.

```
data/
  git-daily.jsonl          # one line per repo per day, local metrics
  gh-repo.jsonl            # repository facts, stars, size, language
  gh-traffic.jsonl         # the perishable one
  gh-prs.jsonl             # one line per pull request, keyed by number
  gh-runs.jsonl            # one line per workflow run
  gh-security.jsonl        # alert counts plus enablement flags plus status codes
  cache/blame/<sha>.json   # blame results, keyed by commit
```

Every record carries the same envelope:

```json
{"observedAt": "2026-08-11T22:00:00Z",
 "repo": "owner/name",
 "source": "git|rest|graphql",
 "status": "ok|unavailable|error",
 "httpStatus": 200,
 "metric": "pr_merge_hours_p50",
 "value": 20.09,
 "unit": "hours",
 "coverage": {"n": 100, "window": "mergedAt>=2026-07-06"}}
```

`coverage` is not optional. A percentile over 100 pull requests and a percentile
over 4 are different facts, and six months later nothing else will tell you
which one you are looking at.

## Cadence and cost

Per repository. Costs are measured, not estimated: see
[04-github-api-surface.md](04-github-api-surface.md).

| Job | Frequency | Cost |
| --- | --- | --- |
| Traffic snapshot (4 endpoints) | **daily, non-negotiable** | 4 requests |
| Repository facts and languages | daily | 2 requests |
| Security enablement flags and alert counts | daily | 4-6 requests |
| Pull requests merged since last run | daily | 1-3 GraphQL points |
| Workflow runs since last run, filtered by event | daily | 1-2 requests |
| Local git metrics: churn, hotspots, coupling, conventional commit split | daily | 0, about 1 s |
| Blame ownership and bus factor | weekly | 0, about 2 s per 110 files |
| SBOM | weekly | 1 request |
| Scorecard | weekly | 1 job |
| Code survival curve | yearly | minutes |

Daily total: roughly **12 to 15 REST requests and 3 GraphQL points per
repository**. Against a 5,000/hour limit that is 300 repositories per hour with
room to spare. **The rate limit is not your constraint. Your patience for
writing the collector is.**

## Incremental collection

Full re-fetching is what makes collectors slow and expensive. Three keys make
everything incremental:

| Source | Watermark | How |
| --- | --- | --- |
| Pull requests | last `mergedAt` seen | filter client-side, or `search` with `merged:>=DATE` |
| Workflow runs | last `created_at` seen | `?created=>=YYYY-MM-DD` |
| Commits and local metrics | last commit hash processed | `git log <last>..HEAD` |
| Blame | the commit hash of the file | skip when unchanged: `git log -1 --format=%H -- FILE` |

The blame cache matters most. Blame is the only local query with a real cost
(2.19 s for 110 files), and a file's blame result cannot change unless the file
changes. Key the cache by the file's last-commit hash and the recomputation
drops to only the files touched since yesterday.

## Handling the 202

Two of the five statistics endpoints return `HTTP 202` with an empty body while
GitHub computes them in the background. A collector must distinguish "computing"
from "zero".

```bash
fetch_stats() {                       # $1 = path
  for attempt in 1 2 3 4 5; do
    code=$(gh api "$1" -i 2>/dev/null | head -1 | grep -o '[0-9]\{3\}')
    case "$code" in
      200) gh api "$1"; return 0 ;;
      202) sleep $((attempt * 3)) ;;  # computing, back off
      422) echo '{"status":"unavailable","reason":"repository too large"}'; return 0 ;;
      *)   echo "{\"status\":\"error\",\"httpStatus\":$code}"; return 0 ;;
    esac
  done
  echo '{"status":"unavailable","reason":"still computing after 5 attempts"}'
}
```

Observed today: one endpoint warmed after a single retry, two were still
returning 202 after three attempts across ten seconds. The ceiling and the
explicit "unavailable" outcome are both required; without them the collector
silently records zero.

## Rate limit discipline

```bash
gh api rate_limit --jq '.resources.core.remaining'    # free, does not consume
```

Check before a batch, not after a failure. Three rules that keep a collector
inside the secondary limits, which are the ones that actually stop you:

- **Serial, or at most a handful of parallel requests.** The hard ceiling is 100
  concurrent across REST and GraphQL, but 900 points per minute is reached much
  sooner. A read costs 1 point, a write costs 5.
- **Respect `Retry-After` and `x-ratelimit-reset`.** Both are returned as
  headers. Sleeping until reset is correct behaviour; retrying immediately is
  how an integration gets throttled harder.
- **Ask GraphQL what it cost.** Include `rateLimit { cost remaining }` in every
  query. It is free and it is the only accurate number.

## Secrets and privacy

- Read the token from the environment or from `gh auth token`. Never from a file
  in the repository. The research checkout here keeps its paths in a `.env` that
  `.gitignore` excludes, which is the right pattern.
- **Do not store email addresses in the output.** Hash them, or map them to a
  stable pseudonym through your `.mailmap`. Author emails are personal data, and
  an analytics file is the wrong place for them.
- Do not write absolute local paths into anything you might publish. Store
  repository-relative paths.
- Give the collector the narrowest token that works. Note that the security
  endpoints in [05-github-security-supply-chain.md](05-github-security-supply-chain.md)
  need `security_events`, which is a real escalation. Consider a second,
  separate token for that job rather than widening the main one.

## Reporting on top

Once the JSON Lines files exist, reporting is a `jq` query away.

```bash
# 90th percentile merge time, last 8 weeks, one repo
jq -r 'select(.repo=="owner/name" and .metric=="pr_merge_hours_p90")
       | [.observedAt, .value] | @tsv' data/gh-prs.jsonl | tail -56
```

Publish the trend, not the value. Every metric in this report is weak as a level
and strong as a direction. "The 90th percentile merge time went from 190 hours to
95" is a result. "The 90th percentile merge time is 95 hours" is trivia.

## Build order

Each step is useful on its own, so stop whenever the next one stops paying.

1. **Traffic snapshot, daily.** Fifteen lines of shell. Starts a clock you can
   never restart later.
2. **Local git metrics, daily.** Churn, hotspots, coupling, ownership. No
   network, no permission, no rate limit.
3. **Pull request percentiles, daily.** One GraphQL call, with the merge-bound
   review filter from [06-delivery-and-collaboration.md](06-delivery-and-collaboration.md).
4. **Security enablement and alert counts, daily.** Cheap, and the first run will
   probably tell you a feature is switched off.
5. **Workflow runs, daily, filtered by event.**
6. **Everything else, weekly or on demand.**

Steps 1 and 2 cover most of the value and take an afternoon.
