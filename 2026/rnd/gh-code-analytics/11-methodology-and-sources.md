# Methodology and sources

## What was done

Every quantitative claim in this report was produced by running a command on
2026-08-11 and reading its output. No number is recalled from training data. Where
a claim comes from documentation rather than from a measurement, the chapter says
so and this file cites the page.

## Environment

| Item | Value |
| --- | --- |
| Operating system | macOS, Darwin 24.3.0, arm64 |
| `git` | 2.49.0 |
| `gh` | 2.89.0 |
| `node` | 24.16.0 |
| `jq` | 1.x, system |
| `awk` | BWK awk, the macOS system version, no `strftime` |
| Token scopes | `gist`, `read:org`, `repo`, `workflow` |
| Token scopes **not** held | `security_events`, `admin:org`, enterprise scopes |
| Rate limit at session start | core 5000/5000, graphql 5000/5000, search 30/30, code search 10/10 |

The missing `security_events` scope is why several security endpoints returned
403. That result is reported as a finding rather than worked around, because it
is the state most engineers are in.

## Subjects

| Role | Repository | Scale | Why |
| --- | --- | --- | --- |
| Primary local subject | a private working repository | 287 commits, 1,390 tracked files, 4 raw identities, first commit 2026-03-31 | large enough for real distributions, small enough to verify by hand |
| Local comparison | 17 further repositories in the same working directory | 2 to 287 commits | used only for the repository survey |
| Small GitHub subject | `rj11io/11reports` | 25 commits, public | owned, so traffic and other write-access endpoints could be tested |
| Large GitHub subject | `cli/cli` | over 10,000 commits, 3,132 merged pull requests, 31,382 workflow runs, 45,798 stars, 686 contributors | the only way to trigger the caps and the 422 that small repositories never reach |
| Advisory subjects | `adamtornhill/code-maat`, `electron/electron`, `sigstore/cosign` | n/a | endpoint shape checks only |

Repository and author identities from the private subject are redacted. "Author
A" refers to the same person throughout. No email addresses appear in this
report, deliberately: see [09-limits-and-pitfalls.md](09-limits-and-pitfalls.md).

Directory names from the private subject are also redacted. In the hotspot and
coupling tables, `variant-a` through `variant-c` and `plugin-a` through
`plugin-e` are stable pseudonyms: the same label always means the same real
directory. File names, counts and relationships are unchanged, so the findings
those tables support are intact.

## How each claim was verified

**Local git measurements.** Run directly against a checkout, output read in
full. Cross-checks applied:

- Conventional commit counts: 265 conforming plus 8 nonconforming equals 273,
  which equals 287 total minus 14 merges. Independent arithmetic agreement.
- Lines by extension: per-extension file counts sum to 1,376 and per-extension
  line counts sum to 95,770, both recomputed in a second pass. 14 binary files
  excluded by the filter account for the gap to 1,390 tracked files.
- Identity merge: `shortlog` before the `.mailmap` returned 187 and 26 as
  separate rows; after, 213 as one. 187 plus 26 equals 213.
- Duplicate detection cross-checked two ways: three files reported as identical
  by blob hash `555674e9` also reported identical 1,388-line lengths.

**GitHub measurements.** Called through `gh api`, with `-i` where the status code
was the finding. Cross-checks applied:

- Commit count parity: local `rev-list --count HEAD` 25, `origin/main` 25,
  `GET /commits` paginated 25, `stats/contributors` total 23. The gap of 2
  equals the merge count from `rev-list --count --merges`.
- GraphQL cost: taken from the `rateLimit` block inside each response, not
  estimated. Verified to scale as expected across n=5, 50 and 100.
- The 202 pattern: reproduced by requesting the same endpoint repeatedly and
  recording the status line each time.

**Percentiles.** Computed in Node with linear interpolation between adjacent
order statistics, on sorted arrays with nulls removed. The review-timestamp
correction was computed twice, once unfiltered and once bounded by `mergedAt`,
from the same response, so the two rows are directly comparable.

**Timings.** Measured with the shell's `time` builtin on a warm filesystem
cache, single run each. Treat as indicative to one significant figure.

## What was not verified

Stated plainly, because a report that omits this is less useful.

- **Enterprise features.** Audit log, API insights and Copilot metrics returned
  404 with the available token. Their described behaviour comes from
  documentation only.
- **Tools not installed.** `scc`, `tokei`, `cloc`, `lizard`, `hercules`,
  `code-maat`, `git-of-theseus`, `jscpd`, `gitleaks`, `trivy`, `osv-scanner` and
  OpenSSF Scorecard were **not run**. Everything said about them comes from their
  own documentation and is labelled as such. Nothing was installed on the
  research machine for this report.
- **The stargazers anomaly.** `GET /stargazers` and `GET /subscribers` returned
  200 on an owned repository and 404 on two third-party public repositories with
  the same token. The cause was not established. An unauthenticated control was
  attempted and returned 401 from this network, so no clean baseline exists. The
  finding is reported as observed with the cause unknown.
- **Code scanning alert contents.** Never seen, because no repository available
  to this token had both an analysis and readable alerts.
- **Statistical significance.** None of the distributions here are tested. They
  are descriptions of a specific sample on a specific day, not inferences about
  a population.
- **Cross-platform behaviour.** All commands were run on macOS. The `awk`
  `strftime` note is a real portability finding; other differences may exist on
  Linux and Windows.

## Known limitations

- **Single day.** Every observation is from 2026-08-11. Rate limits, endpoint
  behaviour and GitHub's cached statistics all change.
- **Small primary subject.** 287 commits is enough for the mechanics and too
  small for stable evolutionary statistics. The bus factor result of 110 out of
  110 files reflects a single-maintainer project and should not be read as
  typical.
- **One large subject.** All caps and limits were confirmed against `cli/cli`
  only. A different large repository might behave differently.
- **Percentiles from one 100-item sample.** The pull request numbers describe
  those 100 pull requests. They are an illustration of method, not a benchmark
  for `cli/cli` or anything else.
- **The `event=pull_request` build comparison uses two different windows** (24
  hours unfiltered, 4 days filtered) because the sample size is fixed at 100 in
  both. The point of that table is the difference in shape, not a like-for-like
  rate comparison.

## Sources

House contract for report structure and presentation, read before writing:

- 11agi core reports manager, reporting best practices, datavis best practices,
  and reports styleguide skills, from the configured 11agi checkout.

GitHub documentation, all fetched 2026-08-11:

- [REST API: repository statistics](https://docs.github.com/en/rest/metrics/statistics)
  for the five statistics endpoints, the 202 caching behaviour, the 10,000-commit
  limits and the week and timezone definitions.
- [REST API: rate limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api)
  for every primary and secondary limit quoted.
- [GraphQL: resource limitations](https://docs.github.com/en/graphql/overview/resource-limitations)
  for the point formula, the 1-to-100 page bound and the 500,000-node cap.
- [REST API: traffic](https://docs.github.com/en/rest/metrics/traffic)
  for the 14-day retention and the write-access requirement.
- [REST API: Copilot metrics](https://docs.github.com/en/rest/copilot/copilot-metrics)
  for scopes, permissions, the 2025-10-10 start date and the one-year retention.

Tools and methodology:

- [OpenSSF Scorecard](https://github.com/ossf/scorecard) for the check list, the
  risk weighting and the three ways to run it.
- [scc](https://github.com/boyter/scc) for its outputs, its complexity estimate
  method and its export formats.
- [lizard](https://github.com/terryyin/lizard) for its metrics, language list and
  default thresholds.
- [hercules](https://github.com/src-d/hercules) for its analyses, output formats
  and the memory limitations quoted.
- [git-of-theseus](https://github.com/erikbern/git-of-theseus) for code survival,
  the Kaplan-Meier method and its commands.
- [code-maat](https://github.com/adamtornhill/code-maat) and Adam Tornhill,
  *Your Code as a Crime Scene* (Pragmatic Bookshelf), for hotspots, temporal
  coupling and the behavioural analysis framing.
- [DORA: the software delivery metrics](https://dora.dev/guides/dora-metrics-four-keys/)
  for the current five-metric model and the rename of mean time to restore.

The SPACE framework is cited from its published description by researchers at
GitHub and Microsoft; the original paper was not fetched for this report and the
citation is second-hand.

## Reproducing this

Every command appears in the chapter that uses it. To repeat the local half on
your own repository, nothing beyond `git` and `awk` is needed. To repeat the
GitHub half, `gh auth login` and a token with `repo` is enough for everything
except the security endpoints, which additionally need `security_events`.

Expect different numbers. The method is the transferable part.

## Artifacts

| File | Contents |
| --- | --- |
| `README.md` and chapters `00` to `11` | the report |
| `data.json` | every measurement in machine-readable form, with its evidence state |
| `report.html` | all chapters rendered as one self-contained page |

`data.json` carries the same facts as the Markdown, with units, provenance and
evidence state attached to each. The HTML adds navigation and table interaction;
it adds no information the Markdown does not have.
