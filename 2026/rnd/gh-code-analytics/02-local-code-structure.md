# The working tree as a dataset

History tells you what moved. The current tree tells you what exists. This
chapter covers the measurements you take from the files themselves.

Same test repository as [01-local-git-history.md](01-local-git-history.md):
1,390 tracked files, measured 2026-08-11.

## Count only what Git tracks

Every measurement here starts from `git ls-files`, never from `find`. `find`
picks up `node_modules`, build output, editor backups and anything else your
`.gitignore` excludes, and the numbers become meaningless.

```bash
git ls-files                       # tracked paths at the current commit
git ls-files -z | xargs -0 wc -l   # naive line count, breaks on binaries
```

## Size by language

```bash
git ls-files | while IFS= read -r f; do
  case "$f" in *.png|*.jpg|*.ico|*.woff2|*.pdf|*.svg) continue;; esac
  [ -f "$f" ] || continue
  printf '%s %s\n' "${f##*.}" "$(wc -l < "$f" | tr -d ' ')"
done | awk '{c[$1]+=$2; n[$1]++} END {for (e in c) printf "%-8s %5d files %8d lines\n", e, n[e], c[e]}'
```

Result:

| Extension | Files | Lines | Share of lines |
| --- | --- | --- | --- |
| md | 665 | 53,276 | 55.6% |
| json | 107 | 17,427 | 18.2% |
| mjs | 27 | 11,171 | 11.7% |
| tsx | 78 | 8,781 | 9.2% |
| yaml | 465 | 1,860 | 1.9% |
| py | 3 | 933 | 1.0% |
| ts | 5 | 675 | 0.7% |
| css | 4 | 436 | 0.5% |
| sh | 5 | 431 | 0.4% |
| html | 1 | 224 | 0.2% |
| other (9 extensions) | 16 | 556 | 0.6% |
| Total | 1,376 | 95,770 | 100.0% |

The total excludes 14 binary files (images, fonts, archives) skipped by the
filter. That exclusion is why the file count here is 1,376 and not 1,390. The
"other" row covers `js`, `cjs`, `yml`, `conf`, dotfiles and four empty
placeholder files; it is a display grouping, and the underlying counts are kept
in [data.json](data.json).

Two lessons visible in that table. First, this is a documentation repository
that happens to contain code: markdown is 56% of it. A "lines of code" headline
would have said 95,696 and meant almost nothing. Second, extension is a poor
proxy for language. `.mjs` and `.ts` and `.tsx` are all JavaScript-family, `.yaml`
here is configuration, and `.json` is mostly generated. Real language detection
needs a classifier, which is what the tools in
[07-tooling-catalog.md](07-tooling-catalog.md) provide.

### Code, comments and blanks

`wc -l` counts every line. Separating the three categories needs a per-language
rule. A crude version for C-family syntax:

```bash
git ls-files '*.mjs' | xargs awk '
  { t++
    if ($0 ~ /^[ \t]*$/) b++
    else if ($0 ~ /^[ \t]*(\/\/|\/\*|\*)/) c++ }
  END { printf "total=%d code=%d comment=%d blank=%d\n", t, t-c-b, c, b }'
```

Result for the `.mjs` files: 11,171 total, 10,472 code (93.7%), 137 comment
(1.2%), 562 blank (5.0%).

This undercounts. It misses trailing comments after code and it cannot see
inside multi-line strings. Treat it as a floor. If the comment ratio matters to
you, use a real counter such as `scc`, `tokei` or `cloc`, which carry per-language
lexers.

## File length distribution

```bash
git ls-files '*.mjs' '*.ts' '*.tsx' | while read -r f; do wc -l < "$f"; done |
  sort -n | awk '{a[NR]=$1} END {print "n="NR, "p50="a[int(NR*0.5)], "p90="a[int(NR*0.9)], "max="a[NR]}'
```

Result: n=110, median 84 lines, 90th percentile 392, maximum 1,388.

Report percentiles, never the mean. File length is heavily skewed: here the
longest file is 16 times the median, so the mean sits above two thirds of the
files and describes none of them.

## Complexity without a parser

Real cyclomatic complexity (the number of independent paths through a function)
needs a language parser. Two useful approximations need none.

**Branch counting.** Count keywords that create a branch: `if`, `for`, `while`,
`case`, `catch`, `&&`, `||`, `?`. This is what `scc` does, and it is accurate
enough to rank files inside one language. It cannot compare across languages,
because keyword density differs.

**Indentation.** Deeply indented code is nested code, and nesting is the part of
complexity that hurts readers.

```bash
awk '!/^[ \t]*$/ { match($0, /^[ \t]*/); ind = RLENGTH
                   sum += ind; n++; sq += ind*ind
                   if (ind > max) max = ind }
     END { m = sum/n
           printf "lines=%d mean=%.2f stdev=%.2f max=%d\n", n, m, sqrt(sq/n - m*m), max }' FILE
```

On the largest file in the test repository: 1,308 non-blank lines, mean indent
3.42, standard deviation 2.25, maximum 12. Adam Tornhill's work on behavioural
code analysis uses exactly this signal, on the grounds that it survives tab and
space differences and needs no language support.

Caveats: it is sensitive to the indent unit, so normalise tabs to spaces first,
and it rewards code that hides complexity in long flat expressions.

## Duplication, for free

Git already content-addresses every file. Identical files share a blob hash, so
exact duplication needs no tool:

```bash
git ls-files -s | awk '{print $2}' | sort | uniq -c | sort -rn | head
```

Result: **14 groups of identical files covering 37 files**. The largest real
group is three copies of a 1,388-line script, all with blob hash `555674e9`,
sitting in three sibling directories. That is the single most actionable
structural finding available from this repository, and it took one command.

This finds only byte-identical files. Near-duplicates (copy, paste, rename a
variable) need a token-level tool such as `jscpd` or `PMD CPD`. Note also that
empty files all share the well-known hash `e69de29b`, so filter zero-length
blobs out before you read the ranking.

## Dependencies

The declared list and the installed list are different sizes, and the gap is the
part that matters for risk.

```bash
jq '(.dependencies//{}) | length' package.json           # declared runtime
jq '(.devDependencies//{}) | length' package.json        # declared build-time
jq '[.packages | keys[] | select(. != "")] | length' package-lock.json
```

Result for the web application in the test repository: **33 declared** (23
runtime, 10 development) resolving to **753 installed packages**. An amplification
factor of 22.8. Every one of those 753 is a party you trust with code execution
at install time.

Equivalents in other ecosystems:

| Ecosystem | Declared | Resolved |
| --- | --- | --- |
| npm | `package.json` | `package-lock.json`, `npm ls --all --json` |
| Python | `pyproject.toml`, `requirements.txt` | `uv.lock`, `poetry.lock`, `pip freeze` |
| Go | `go.mod` | `go.sum`, `go list -m all` |
| Rust | `Cargo.toml` | `Cargo.lock`, `cargo tree` |
| Java | `pom.xml` | `mvn dependency:tree` |
| Ruby | `Gemfile` | `Gemfile.lock` |

## Tests and markers

```bash
git ls-files | grep -cE '\.(test|spec)\.[a-z]+$'          # 5 test files
git ls-files '*.mjs' '*.ts' '*.tsx' | wc -l               # 110 source files
git grep -nE '\b(TODO|FIXME|HACK|XXX)\b' | wc -l          # 0 markers
```

A test-to-source file ratio of 5 to 110 is a coverage question, not a coverage
answer. File counts say nothing about which lines run. For real coverage you
need the language's own tooling (`c8`, `coverage.py`, `go test -cover`,
`cargo-llvm-cov`) and a stored report; there is no way to derive it from the
repository contents.

The marker count of zero is a real observed zero here, not a missing value. In
most codebases this query is a useful backlog: markers cluster in the same files
as hotspots.

## Structural metrics that need a parser

These cannot be approximated well and need a real tool. Listed here so you know
what you are giving up by staying with shell commands.

| Metric | What it tells you | Tool |
| --- | --- | --- |
| Cyclomatic complexity per function | which functions are hard to test | `lizard`, `scc` (estimate) |
| Function length and parameter count | interface smells | `lizard` |
| Import and call graph | what depends on what | language-specific, `madge`, `pydeps`, `go mod graph` |
| Dead code | what can be deleted | `knip`, `vulture`, `staticcheck` |
| Type coverage | how much is actually typed | `tsc --noEmit`, `mypy --html-report` |
| Near-duplicate blocks | copy-paste debt | `jscpd`, `PMD CPD` |

## What the tree cannot tell you

- Whether a file is important. Size and complexity are not importance.
- Whether code runs. Only coverage and runtime telemetry answer that.
- Whether the design is good. Every metric here is a smell detector, and smells
  are hypotheses to check, not verdicts.
