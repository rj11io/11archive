# AI Benchmarking: A Working Reference

- **Created:** 2026-08-11
- **Audience:** anyone who publishes, buys, or argues about AI model scores. Engineers building an
  evaluation suite for their own product, analysts reading a leaderboard, and reviewers checking
  someone else's claim.
- **Objective:** explain what an AI benchmark can and cannot tell you, and set out the practices
  that make a score trustworthy.
- **Scope:** benchmarking of AI models and AI agents, mostly language and multimodal models from
  2018 to August 2026. Covers benchmark design, statistics, contamination, judging, agent
  evaluation, safety testing, standards, and how to build an in-house suite.
- **Not in scope:** hardware and systems benchmarking beyond one comparison with MLPerf, training
  methods, and any ranking of current models. Model scores move every few weeks, so this report
  describes structure rather than standings.
- **Evidence boundary:** public papers, benchmark documentation, standards, regulator text, and
  vendor methodology pages, all read on 2026-08-11. Every material claim has a source in
  [12-methodology-and-sources.md](12-methodology-and-sources.md).

## A benchmark, in one sentence

A **benchmark** is a fixed set of tasks plus a fixed way of scoring them, used to compare
systems. An **eval** (short for evaluation) is a single run of such a set against one system.

## How to read this bundle

Start with the brief. Then jump to whichever section matches your job.

| File | What it covers | Read it if |
| --- | --- | --- |
| [00-executive-brief.md](00-executive-brief.md) | The main result, the ten rules, a 60-second score check | You have five minutes |
| [01-what-a-benchmark-measures.md](01-what-a-benchmark-measures.md) | The measurement chain, construct validity, the eval taxonomy | You are designing or reviewing a benchmark |
| [02-benchmark-catalog.md](02-benchmark-catalog.md) | 37 benchmarks and 10 suites, with format, size, grader, and status | You need to pick or interpret a specific benchmark |
| [03-statistics-and-uncertainty.md](03-statistics-and-uncertainty.md) | Error bars, clustering, resampling, pass@k, power | You report or compare numbers |
| [04-contamination-and-saturation.md](04-contamination-and-saturation.md) | Test data leaking into training, and benchmarks running out of headroom | You wonder whether a score is real |
| [05-judges-and-human-evaluation.md](05-judges-and-human-evaluation.md) | Model graders, human raters, preference arenas | Your task has no single right answer |
| [06-agentic-evaluation.md](06-agentic-evaluation.md) | Multi-step tasks, tool use, cost control, reliability | You evaluate agents |
| [07-safety-and-frontier-risk-evals.md](07-safety-and-frontier-risk-evals.md) | Dangerous-capability testing, red-teaming, evaluation awareness | You work on safety or compliance |
| [08-standards-and-regulation.md](08-standards-and-regulation.md) | EU AI Act, NIST, ISO, frontier safety policies, MLPerf governance | You need to satisfy an external requirement |
| [09-build-your-own-eval-suite.md](09-build-your-own-eval-suite.md) | A ten-step build, graders, CI, error analysis | You are starting from nothing |
| [10-anti-patterns-and-reading-a-leaderboard.md](10-anti-patterns-and-reading-a-leaderboard.md) | 28 failure modes with symptoms and fixes | You are auditing a claim |
| [11-glossary.md](11-glossary.md) | 84 terms defined | A word is unfamiliar |
| [12-methodology-and-sources.md](12-methodology-and-sources.md) | How this report was built, 75 sources, limitations | You want to check the work |

## Artifacts

| Artifact | Purpose |
| --- | --- |
| `00` to `12` Markdown files | The portable, readable report |
| `data.json` | The machine-readable evidence model: benchmarks, metrics, practices, failure modes, standards, sources |
| `report.html` | One self-contained page with navigation, sortable tables, diagrams, and a print layout |
| `build.mjs` | Deterministic generator: Markdown in, `report.html` and `data.json` out. It also recomputes the worked arithmetic in section 03 and fails the build if a number in the prose is wrong |
| `verify.mjs` | The verification gate: 44 checks across structural pins, cross-format parity, data agreement, determinism, and hygiene |

`report.html` is generated from the same Markdown files you can read directly, so the two never
disagree on facts. The HTML adds navigation and interaction, never extra content.

## Rebuilding the HTML

The generator needs the house report styleguide for its embedded fonts and design tokens. Point
`ELEVEN_AGI_REPO` at a local 11agi checkout, then:

```bash
node 2026/rnd/ai-benchmarking-best-prac/build.mjs
```

The build prints a JSON summary of what it emitted. Running it twice on unchanged input produces
a byte-identical file apart from the generation timestamp. Then run the gate:

```bash
node 2026/rnd/ai-benchmarking-best-prac/verify.mjs
```

Publishing note: `build.mjs` and `verify.mjs` are development tools, not report artifacts. The
11reports publisher accepts only Markdown, one HTML file, and `data.json`, so publish from a staged
copy that leaves the two scripts behind.
