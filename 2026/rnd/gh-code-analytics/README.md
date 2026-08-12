# Code analytics: what you can measure locally and from GitHub

Research report. Catalogues every measurement you can take from a Git checkout on
your own machine and from the GitHub API, with the cost, the permission, and the
trap attached to each one.

Written 2026-08-11. Every number in these files was produced by running the
command shown, on the date shown, against the repository named. Nothing is
recalled from memory.

## Read in this order

| File | What it covers |
| --- | --- |
| [00-executive-brief.md](00-executive-brief.md) | The short version. What to collect first, what it costs, what to ignore. |
| [01-local-git-history.md](01-local-git-history.md) | The commit history as a dataset. Log formats, churn, identities, renames. |
| [02-local-code-structure.md](02-local-code-structure.md) | The working tree as a dataset. Size, complexity, duplication, dependencies. |
| [03-evolutionary-analysis.md](03-evolutionary-analysis.md) | History crossed with structure. Hotspots, coupling, ownership, code age. |
| [04-github-api-surface.md](04-github-api-surface.md) | Every GitHub endpoint that returns analytics, tested, with its cost. |
| [05-github-security-supply-chain.md](05-github-security-supply-chain.md) | Code scanning, secret scanning, dependency data, provenance. |
| [06-delivery-and-collaboration.md](06-delivery-and-collaboration.md) | Pull request timing, review load, build telemetry, DORA. |
| [07-tooling-catalog.md](07-tooling-catalog.md) | The external tools worth installing, and what each one adds. |
| [08-collection-blueprint.md](08-collection-blueprint.md) | A working design for a collector you can run on a schedule. |
| [09-limits-and-pitfalls.md](09-limits-and-pitfalls.md) | Where these numbers lie, and the rules for using them on people. |
| [10-glossary.md](10-glossary.md) | Every term defined once. |
| [11-methodology-and-sources.md](11-methodology-and-sources.md) | How this was produced, what was checked, what was not. |

Machine-readable companion: [data.json](data.json). Rendered single file:
[report.html](report.html).

## Scope

- In scope: measurements available to one engineer with a local checkout, the
  `git` and `gh` command line tools, and a personal access token.
- Out of scope: paid analytics platforms, GitHub Enterprise Server differences,
  and anything requiring an enterprise account we could not test.
- Test subjects: four repositories owned by the token holder plus one large
  public repository (`cli/cli`) used to trigger the size limits that small
  repositories never reach.
