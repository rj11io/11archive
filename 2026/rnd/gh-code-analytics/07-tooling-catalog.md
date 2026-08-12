# Tooling catalog

Everything in the previous chapters was produced with `git`, `gh`, `jq`, `node`
and `awk`, all of which were already on the machine. This chapter covers what
you gain by installing something, and what each addition is actually for.

Availability checked on the research machine 2026-08-11 with `command -v`.
Nothing was installed for this report.

| Tool | Present |
| --- | --- |
| `git` 2.49.0, `gh` 2.89.0, `jq`, `node` 24.16.0, `python3`, `ruby`, `semgrep` | yes |
| `scc`, `tokei`, `cloc`, `lizard`, `gitleaks`, `trivy`, `osv-scanner`, `hyperfine`, `go`, `cargo` | no |

## Counting code properly

Shell plus `wc -l` gets you total lines. It cannot separate code from comments,
and it cannot classify languages. Three tools do.

**scc** (Go, single binary). Counts lines, code, comments and blanks per
language, plus two extras that no shell script gives you: a **complexity
estimate** from counting branch and loop keywords, and a **COCOMO** effort
estimate. Also computes ULOC, the count of unique lines across the project, which
is a fast whole-repository duplication signal. Output formats include tabular,
JSON, CSV, HTML, SQL and OpenMetrics, so it drops straight into a pipeline. The
complexity number is comparable **within** one language only, because keyword
density differs between languages.

**tokei** (Rust, single binary). Same core job, similar speed, JSON output. Pick
one of scc or tokei; the difference that matters is that scc carries the
complexity and COCOMO estimates.

**cloc** (Perl, everywhere). The oldest and the most widely trusted for
cross-project comparison. Slower. Its `--diff` mode counts added, modified and
removed lines **between two trees**, split by language, which neither of the
other two does and which `git diff --numstat` cannot do because it has no
language model.

Recommendation: `scc` for daily use, `cloc --diff` when you need
language-aware change counts for a migration or a release note.

## Complexity with a parser

**lizard** (Python, `pip install lizard`). Reports, per function: cyclomatic
complexity (CCN), lines of code excluding comments, token count and parameter
count. Supports 29 or more languages including C, C++, C#, Go, Java, JavaScript,
Kotlin, PHP, Python, Ruby, Rust, Scala, Swift, TypeScript and Vue.

Defaults: warns above CCN 15, warns above 1,000 lines per function, no default
parameter limit. Useful flags: `-C` sets the complexity threshold, `-L` the
length limit, `-a` the parameter limit, `-T` a limit on any measured field such
as `-Tnloc=25`, and `-w` prints warnings only.

This is the tool that turns "this file is complicated" into "these four
functions are complicated", which is the difference between a metric and a task.

## Behavioural code analysis

These read the Git log and produce the analyses in
[03-evolutionary-analysis.md](03-evolutionary-analysis.md) with more rigour than
the shell versions.

**code-maat** (Clojure, needs a Java runtime). Adam Tornhill's tool, the
reference implementation of the whole field, and the companion to *Your Code as
a Crime Scene*. Reads a Git log export and computes revisions per file, temporal
coupling (with proper normalisation, not raw counts), sum of coupling, code age,
author counts per module, entity ownership and main-developer attribution.
Output is CSV, meant to be joined against a line count from `cloc` or `scc`.

Use it when your shell coupling query starts producing results you cannot
defend. Its normalisation and its handling of large commits are the parts that
are genuinely hard to reimplement.

**hercules** (Go). Much faster, and does things code-maat does not: a burndown
analysis showing how many lines from each period survive over time, per project,
file or developer; a couples matrix for both files and developers; a devs
analysis of commit and line counts through time; and "shotness", which counts
modifications per **function** rather than per file using language parsing.
Output as YAML, Protocol Buffers or JSON.

Two warnings from its own documentation. Memory is the limit, not speed: a
couples analysis of the Linux kernel produced 1.5 GB of output and needed over
180 GB of RAM to parse. And it depends on the Babelfish parsing service, which
is no longer maintained, so the language-aware analyses may not work. Use
`--first-parent` if commit processing fails.

**git-of-theseus** (Python). One question, answered well: how long does code
survive? It produces cohort plots (lines grouped by the year they were added),
survival curves fitted with a Kaplan-Meier estimator, and the same breakdown by
author and by file extension. Three commands: `git-of-theseus-analyze` to scan,
then `stack-plot`, `line-plot` or `survival-plot`. The analysis pass is slow;
hercules reports being 20% to 6 times faster at the equivalent work.

The number it produces, the half-life of your code, is the most quotable
statistic in this whole report and the hardest to game.

**PyDriller** (Python library). Not a report generator: a clean API over the Git
history for writing your own analysis. Iterate commits, get modified files with
before-and-after source, and it computes complexity and lines per method for you.
The right choice when your question is specific enough that no tool answers it.

## Duplication

**jscpd** (Node). Token-level copy-paste detection across more than 150
languages, with a configurable minimum clone size and JSON, HTML or console
output. Finds near-duplicates, which the blob-hash trick in
[02-local-code-structure.md](02-local-code-structure.md) cannot.

**PMD CPD** (Java). The same idea, older, with mature language support and a
well-defined tokeniser. Ships inside PMD.

Both need tuning. Default thresholds report generated code, test fixtures and
import blocks as clones. Budget an afternoon on the ignore list before the output
is worth reading.

## Security scanning

| Tool | Scope | Note |
| --- | --- | --- |
| **Semgrep** | pattern-based static analysis, many languages | `semgrep --config=auto` pulls community rules. Fast enough for a pre-commit hook |
| **gitleaks** | secrets in the working tree **and the full history** | The one whose local version beats the platform version. A removed secret stays in the pack file |
| **trivy** | dependencies, container images, infrastructure config, licences | Broadest coverage in one binary |
| **osv-scanner** | lock file to advisory matching, Google's OSV database | Cross-ecosystem, and the database is public |
| **CodeQL CLI** | dataflow queries, the engine behind GitHub code scanning | Heaviest to set up. Only worth it if you write custom queries |
| **OpenSSF Scorecard** | 19 to 23 repository posture checks, scored 0 to 10 | See [05-github-security-supply-chain.md](05-github-security-supply-chain.md) |

Scorecard's weighting is worth repeating because it explains its scores:
critical-risk checks count 10, high 7.5, medium 5, low 2.5, and the total is the
weighted average. It also publishes pre-computed scores through an API and a
BigQuery dataset, which lets you score every dependency you have without cloning
any of them.

## Convenience layers

**git-quick-stats** (shell). An interactive menu over the same `git log` queries
used in this report: commits by author, by hour, by weekday, by month, plus
per-author churn. Nothing you cannot write, but it is already written and it is a
single file.

**gh extensions** (`gh extension install`). Worth checking before you build
anything, because the ergonomics of an extension beat a script: it inherits your
authentication, your rate limit handling and your pagination.

**GitHub's own web views.** Insights → Pulse, Contributors, Traffic, Network and
Forks render the statistics endpoints from
[04-github-api-surface.md](04-github-api-surface.md). Use them to sanity-check a
collector, never as a data source, because they carry the same caps (500
contributors, no code frequency above 10,000 commits) without telling you.

## Commercial, for completeness

**CodeScene** is the hosted commercial product built on the behavioural analysis
ideas above, by the author of code-maat. It adds change coupling across
repositories, a code health score, and knowledge-loss modelling. Mentioned so
the vocabulary in this report maps onto its interface, not as a recommendation;
it was not evaluated for this research.

## What to install, in order

1. **scc.** Immediate, no configuration, gives you the language and complexity
   picture in one command.
2. **gitleaks.** Run it once over full history today. This is the highest
   expected value of anything on the list.
3. **lizard.** When you need function-level complexity to make a refactoring
   argument.
4. **code-maat or hercules.** When coupling and ownership become a recurring
   conversation rather than a one-off.
5. **git-of-theseus.** Once, for the survival curve. Then once a year.

Everything before step 1 is already in this report and costs nothing.
