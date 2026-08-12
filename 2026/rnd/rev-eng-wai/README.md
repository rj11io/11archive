# Reverse engineering WhichAI.dev (ui-design-bench)

What this folder holds: a full teardown of the WhichAI.dev design benchmark, built by
reading the source repository, the public site, and the GitHub project record.

Subject:

- Local checkout of the repository at commit `3bdd0cb`, identical to `origin/master`.
- Repository: <https://github.com/SunkenInTime/ui-design-bench>
- Live site: <https://www.whichai.dev/>

Read in this order:

| File | What it answers |
| --- | --- |
| [00-executive-brief.md](00-executive-brief.md) | What the project is, what it actually measures, and the eleven things worth knowing |
| [01-what-it-measures.md](01-what-it-measures.md) | The one prompt, the five treatments, the coverage grid, and what is never recorded |
| [02-architecture.md](02-architecture.md) | How 325 generated apps run inside one Next.js site without fighting each other |
| [03-ingestion-pipeline.md](03-ingestion-pipeline.md) | The repeatable recipe for adding a model, step by step |
| [04-methodology-audit.md](04-methodology-audit.md) | Where the comparison breaks down, with evidence |
| [05-engineering-findings.md](05-engineering-findings.md) | Eleven concrete defects, each with a fix |
| [06-surfaces-and-ux.md](06-surfaces-and-ux.md) | The four visitor surfaces, plus the unshipped design system |
| [07-project-facts.md](07-project-facts.md) | Repo numbers, history, contributors, money, neighbours |
| [08-rebuild-blueprint.md](08-rebuild-blueprint.md) | What to keep and what to change if you build this again |
| [09-glossary.md](09-glossary.md) | Every term used here, in plain words |
| [10-methodology-and-sources.md](10-methodology-and-sources.md) | How this teardown was done and what it could not check |
| [data.json](data.json) | The same facts in machine-readable form |
| [report-v0.html](report-v0.html) | Single-page visual view of the whole teardown |

Evidence boundary: everything here comes from the checkout at `3bdd0cb`, the live site as
served on 2026-08-11, and the GitHub API on the same day. No generated page was re-graded
and no model was re-run. Where a claim depends on running the project, this report says so.
