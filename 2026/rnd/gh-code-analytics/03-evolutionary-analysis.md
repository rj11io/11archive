# History crossed with structure

The measurements in this chapter come from combining the commit log with the
files. They are the ones that change decisions, because they answer "where
should I spend my next week" rather than "how big is this".

The field has a name, behavioural code analysis, and a canonical source: Adam
Tornhill's *Your Code as a Crime Scene* and the `code-maat` tool that accompanies
it. Everything below can be reproduced with plain `git` and `awk`.

## Hotspots

A hotspot is a file that is both **changed often** and **hard to change**. Either
signal alone is weak. Together they identify the code where your effort earns
the most.

```bash
# 1. churn per file, rename-aware, merges excluded
git log --no-merges -M -C --pretty=tformat: --numstat |
  awk 'NF==3 && $1 != "-" { churn[$3] += $1 + $2; touches[$3]++ }
       END { for (f in churn) print churn[f] "\t" touches[f] "\t" f }' |
  sort -rn > /tmp/churn.tsv

# 2. keep only files that still exist
git ls-files > /tmp/alive.txt
awk -F'\t' 'NR==FNR { alive[$0]=1; next } alive[$3]' /tmp/alive.txt /tmp/churn.tsv | head -20
```

**Step 2 is not optional.** In the test repository, **40 of the 50
highest-churn files no longer exist at the current commit.** Skipping the filter
produces a refactoring list made mostly of deleted code.

Top hotspots after filtering, test repository, 2026-08-11:

| Churn (lines) | Commits touching it | File | Note |
| --- | --- | --- | --- |
| 1,448 | 10 | `variant-a/scripts/benchmarks-core.mjs` | one of three identical copies |
| 1,448 | 10 | `variant-b/scripts/benchmarks-core.mjs` | identical copy |
| 1,448 | 10 | `variant-c/scripts/benchmarks-core.mjs` | identical copy |
| 1,394 | 10 | `variant-a/scripts/analyze-cost-global.mjs` | near-identical sibling |
| 1,366 | 10 | `variant-b/scripts/analyze-cost-project.mjs` | near-identical sibling |
| 1,344 | 10 | `variant-c/scripts/analyze-cost-single.mjs` | near-identical sibling |
| 943 | 57 | `README.md` | documentation, not code |
| 667 | 6 | `generated/marketplace.json` | generated manifest |

The table diagnoses itself. Six of the top eight files are copies of two
scripts, they all change on the same commits, and the duplication check in
[02-local-code-structure.md](02-local-code-structure.md) confirms three of them
are byte-identical. The fix is to extract one shared module, and this ranking is
how you would find that without already knowing it.

### Ranking hotspots properly

Churn alone over-ranks documentation and manifests. Multiply it by a complexity
proxy:

```
hotspot score = commits_touching_file x mean_indentation_depth
```

Use the commit count rather than the line count, because line counts are
dominated by whole-file rewrites and generated content. Compute
`mean_indentation_depth` with the `awk` snippet in
[02-local-code-structure.md](02-local-code-structure.md), or take `scc`'s
complexity estimate.

Restricting to source extensions before ranking is usually a bigger improvement
than any weighting scheme.

## Temporal coupling

Two files are temporally coupled when they keep changing in the same commit.
High coupling between files that live far apart is the signal: it means a
dependency exists that the directory structure does not express.

```bash
git log --no-merges --pretty=format:'C%H' --name-only | awk '
  /^C/ { for (i = 1; i <= n; i++)
           for (j = i+1; j <= n; j++) {
             a = f[i]; b = f[j]; if (a > b) { t = a; a = b; b = t }
             pair[a "\t" b]++ }
         for (i = 1; i <= n; i++) delete f[i]; n = 0; next }
  NF { f[++n] = $0 }
  END { for (p in pair) if (pair[p] >= 6) print pair[p] "\t" p }' | sort -rn | head
```

Runtime 0.13 s on 287 commits. Top pairs in the test repository:

| Co-changes | File A | File B |
| --- | --- | --- |
| 30 | `plugin-a/.claude-plugin/plugin.json` | `plugin-a/.codex-plugin/plugin.json` |
| 27 | `plugin-b/.claude-plugin/plugin.json` | `plugin-b/.codex-plugin/plugin.json` |
| 27 | `plugin-c/.claude-plugin/plugin.json` | `plugin-d/.claude-plugin/plugin.json` |
| 27 | `plugin-e/.claude-plugin/plugin.json` | `plugin-d/.claude-plugin/plugin.json` |

The first two rows are a real finding: each plugin keeps two manifests in sync
by hand, so every change costs two edits and can drift. The third and fourth
rows are an artefact: a release bot bumps every manifest version in one commit,
which makes all of them look coupled to all of the others.

**Filter bot commits before computing coupling.** Any automated commit that
touches many files creates a fully connected block of false pairs. Exclude by
author:

```bash
git log --no-merges --perl-regexp --author='^(?!.*bot).*$' --pretty=format:'C%H' --name-only
```

Two more corrections worth applying:

- **Normalise by frequency.** Raw co-change counts favour files that change
  often for unrelated reasons. Report `co_changes / min(revisions_a,
  revisions_b)` as a percentage and require a floor (six co-changes here) so
  that a two-out-of-two pair does not score 100%.
- **Cap commit width.** Drop commits touching more than, say, 30 files. A
  commit touching 200 files creates 19,900 pairs and swamps everything.

The cost is quadratic in files per commit, which is why the cap matters more for
speed than the history length does.

## Ownership and the bus factor

`git blame` attributes every surviving line to the commit that last changed it.

```bash
git blame --line-porcelain -w -M -C -- FILE |
  awk '/^author /{c[substr($0,8)]++}
       END {t=0; for (x in c) t += c[x]
            for (x in c) printf "%-20s %5d %5.1f%%\n", x, c[x], 100*c[x]/t}'
```

Flags that change the answer:

| Flag | Effect |
| --- | --- |
| `-w` | ignore whitespace-only changes, so a reformat does not steal authorship |
| `-M` | follow lines moved within the file |
| `-C` | follow lines copied from other files in the same commit |
| `-C -C -C` | search the whole history for the origin, slow but most accurate |

Test repository result: on all 110 source files, **one author owns more than 80%
of the lines, in 110 of 110 files**. The bus factor is 1. That is expected for a
single-maintainer project and it is exactly the number a growing team should
watch: the fraction of files with a single dominant author, tracked over time,
is the clearest early warning of key-person risk.

Cost: 2.19 s for 110 files. Blame is the most expensive local query in this
report; budget roughly 20 ms per file and cache the result by commit hash.

### Reading ownership honestly

- Blame credits the **last** person to touch a line. A formatting sweep with
  `-w` disabled reassigns an entire file to whoever ran the formatter. Always
  pass `-w`.
- Deleted code has no owner. Blame describes the surviving tree only.
- One dominant author can mean deep expertise or an abandoned corner. The metric
  raises the question; it does not answer it.

## Code age

Age is the time since a surviving line was last changed. Stable old code is
usually fine. Old code inside a hotspot is where defects concentrate.

```bash
git blame --line-porcelain -w -- FILE |
  awk '/^author-time /{print $2}' |
  while read -r t; do date -r "$t" +%Y-%m; done | sort | uniq -c
```

Use `date -d @"$t"` on GNU systems. Do not try to do this inside macOS `awk`:
its `awk` has no `strftime` and fails with "calling undefined function".

Repository-wide age, cheaply, without blame:

```bash
git ls-files | while read -r f; do echo "$(git log -1 --format=%at -- "$f") $f"; done | sort -n
```

That gives the last-touch date per file rather than per line. It is one `git log`
per file, so it is slower than it looks on large trees; for those, one pass of
`git log --name-only --format='%at'` and a first-seen map is far faster.

The deeper version of this measurement is **code survival**: of the lines added
in a given month, what fraction is still present today. `git-of-theseus` computes
it with a Kaplan-Meier estimator (the standard method for "how long do things
survive when some are still alive"), and `hercules` computes the same thing
faster. Both are described in [07-tooling-catalog.md](07-tooling-catalog.md).

## Change frequency by directory

Aggregating churn one level up finds the subsystem that is absorbing effort.

```bash
git log --no-merges --pretty=tformat: --name-only |
  awk 'NF { split($0, p, "/"); print p[1] "/" p[2] }' |
  sort | uniq -c | sort -rn | head
```

This is the cheapest way to answer "where is the team actually working", and it
is the right granularity for a monthly review. File-level churn is too noisy for
that conversation.

## What to record over time

Single snapshots of these metrics are weak. Trends are strong. Store, per week:

| Metric | Why the trend matters |
| --- | --- |
| Number of files with a single owner above 80% | rising means concentrating risk |
| Top-10 hotspot set | churn in the set means the refactor is not landing |
| Median and 90th-percentile file length | rising means files are not being split |
| Coupling pairs above the threshold | rising means the architecture is eroding |
| Share of commits typed `fix` | rising means quality is drifting |

Each row is one command from this chapter. A weekly append to a file is enough;
you do not need a database until you have years of it.
