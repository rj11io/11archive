# The commit history as a dataset

Git stores a complete event log. Every measurement in this chapter reads that
log and needs no network and no permission.

Test subject unless stated otherwise: a repository with 287 commits, 1,390
tracked files, four raw author identities, first commit 2026-03-31. Measured
2026-08-11. Author names and email addresses are redacted in this report; the
label "author A" means the same person throughout.

## The one command that produces most of it

`git log` can print any field you want in any format. The two flags that matter:

- `--pretty=` picks the commit fields.
- `--numstat` adds one line per changed file: lines added, lines deleted, path.

```bash
git log --no-merges -M -C --pretty=tformat:'@%H%x09%aN%x09%aI%x09%s' --numstat
```

Read that as: skip merge commits, detect renames and copies, print a marker line
per commit with hash, author name, ISO date and subject, then the per-file
numbers. Everything below is a different way of grouping those two record types.

### Field reference for `--pretty`

| Token | Meaning | Note |
| --- | --- | --- |
| `%H` | full commit hash | stable identity |
| `%aN` | author name | respects `.mailmap` |
| `%aE` | author email | respects `.mailmap` |
| `%aI` | author date, ISO 8601 strict | when the change was written |
| `%cI` | committer date, ISO 8601 strict | when it landed here |
| `%s` | subject line | first line of the message |
| `%b` | body | everything after the blank line |
| `%P` | parent hashes | two or more means a merge |
| `%G?` | signature status | `G` good, `N` none, `B` bad |
| `%D` | ref names | tags and branches pointing here |

Use the capital-`N` and capital-`E` forms. The lowercase `%an` and `%ae` skip the
`.mailmap` and will split one person into several.

**Author date is not commit date.** A rebase, a cherry-pick, or a patch applied
by email keeps the author date and rewrites the committer date. Pick one and say
which. For "when was this written" use `%aI`. For "when did this reach the
branch" use `%cI`.

## Repository scale in one call

```bash
git rev-list --count HEAD          # 287
git count-objects -vH              # size-pack: 3.04 MiB, in-pack: 10452
git ls-files | wc -l               # 1390
```

`count-objects -vH` reports the packed size on disk. It is the honest answer to
"how big is this repository", and it is unrelated to how many lines of code
exist, because it includes every version of every file ever committed.

## Churn: how much code moved

Churn is added lines plus deleted lines. It measures activity, not quality.

```bash
git log --pretty=tformat: --numstat |
  awk '{a+=$1; d+=$2; n++} END {print "added="a" deleted="d" touches="n}'
```

Result on the test repository: **136,813 added, 41,041 deleted, 6,286 file
touches**. Runtime 0.61 s including rename detection.

Three things to know before you use that number.

**Binary files print `-` instead of a count.** Guard with `$1 != "-"` or your
totals silently skip images, fonts and compiled assets. This is correct
behaviour, not an error: Git has no line concept for those files.

**Generated files dominate.** The two largest churn entries in the test
repository are `package-lock.json` (12,340 lines over 2 commits) and
`www/package-lock.json` (10,929 over 3). Neither was written by a human. Exclude
lock files, minified bundles, vendored directories and snapshots before
comparing anything.

**A `.gitattributes` marking files as generated does not change `--numstat`.**
`linguist-generated` affects GitHub's diff display and language bar only. Your
own exclusion list is the only thing that filters churn.

## Identities: fix this before you count anything

```bash
git log --format='%aN <%aE>' | sort -u
```

The test repository returns four identities:

| Identity | Commits | Kind |
| --- | --- | --- |
| author A, display name 1 | 187 | human |
| author A, display name 2 | 26 | human, same email address |
| release bot | 59 | automation |
| author A, GitHub noreply address | 1 | human, web edit |

Two rows are the same person with the same email and a different display name.
Counting by name gives 187. Counting by email gives 213. Counting by the pair
gives two people who are one.

Fix with a `.mailmap` file at the repository root:

```
Canonical Name <canonical@example.com> Other Name <canonical@example.com>
Canonical Name <canonical@example.com> <old-address@example.com>
```

Verify without committing anything:

```bash
git -c mailmap.file=/tmp/mm shortlog -sn --no-merges HEAD
```

Applied to the test repository this merged 187 + 26 into a single **213** and
left the bot and the web-edit identity separate, which is what you want: the bot
should stay visible so you can exclude it deliberately.

### The `shortlog` trap

`git shortlog` reads from standard input when no revision is given. In a script,
where standard input is not a terminal, it reads nothing and prints nothing,
with exit status 0. Observed today: `git shortlog -sne --no-merges` produced zero
lines; `git shortlog -sne --no-merges HEAD` produced four. **Always pass an
explicit revision.**

## Merges

```bash
git rev-list --count HEAD            # 287
git rev-list --count --merges HEAD   # 14  (4.87%)
```

Merge commits contain no original work in a standard squash or merge workflow,
but `--numstat` on a merge prints the combined diff against the first parent,
which double-counts. Every query in this report uses `--no-merges`. If you need
merges (to count integration events, for example) count them separately and do
not add them to churn.

This also explains a GitHub discrepancy documented in
[04-github-api-surface.md](04-github-api-surface.md): a repository with 25
commits and 2 merges reports 23 in `stats/contributors`, because that endpoint
excludes merges.

## Renames and copies

Git does not record renames. It infers them by comparing content at query time.

| Flag | Meaning |
| --- | --- |
| `-M` | detect renames (default similarity 50%) |
| `-M90%` | require 90% similarity |
| `-C` | also detect copies from files changed in the same commit |
| `-C -C` | detect copies from anywhere in the tree, slower |
| `--find-copies-harder` | same as `-C -C`, older spelling |

Measured effect on the test repository:

| Query | File-touch rows |
| --- | --- |
| no rename detection | 5,074 |
| `-M -C -C` | 4,988 |
| rename events detected (`--diff-filter=R`) | 1,212 |

Without detection, a rename appears as one file deleted and one added. That
inflates churn and breaks per-file history.

### `--follow` recovers history across renames

```bash
git log --oneline -- path/to/file            # 1 commit
git log --oneline --follow -- path/to/file   # 7 commits
```

Measured on a real renamed file in the test repository. `--follow` only accepts
one path and it works by re-running rename detection at each step, so it is slow
on long histories. It is the right tool for "show me this file's real history"
and the wrong tool for a repository-wide sweep.

## Commit messages as structured data

If the project uses Conventional Commits (a convention where the subject starts
with a type such as `feat:` or `fix:`) the subject line becomes a labelled event
stream.

```bash
git log --no-merges --pretty=%s |
  awk '{ if (match($0, /^[a-z]+(\([^)]*\))?!?: /)) ok++; else bad++ }
       END { print "conforming="ok" nonconforming="bad }'
```

Test repository result: **265 conforming, 8 nonconforming**, which sums to 273,
the exact number of non-merge commits. The breakdown:

| Type | Commits | Share of conforming |
| --- | --- | --- |
| feat | 88 | 33.2% |
| chore | 76 | 28.7% |
| fix | 73 | 27.5% |
| refactor | 16 | 6.0% |
| docs | 10 | 3.8% |
| style | 2 | 0.8% |
| Total | 265 | 100.0% |

The `fix` share is the cheapest defect proxy that exists. It is a proxy, not a
count: it measures how often someone chose to type `fix`, and teams that squash
aggressively will show fewer. Track its direction over quarters, not its level.

## Cadence

```bash
git log --no-merges --date=format:'%u %H' --pretty=%ad | sort | uniq -c
```

`%u` is the ISO weekday, 1 for Monday. This gives the same grid as GitHub's
punch card, computed offline, using the author's local timezone as recorded in
the commit. Watch the timezone: each commit stores its own offset, so a
distributed team's punch card mixes wall clocks. Normalise with
`--date=format-local:'%u %H'` and `TZ=UTC` if you want one clock.

## Signatures and provenance

```bash
git log --pretty='%H %G? %GS' | awk '{c[$2]++} END {for (k in c) print k, c[k]}'
```

`%G?` returns `G` for a good signature, `B` for bad, `U` for good but untrusted,
`N` for none, `E` for an error. This is the only local answer to "which commits
are cryptographically attributable". GitHub's `verified` flag on the commits API
is the same idea computed against keys GitHub knows about, and the two disagree
whenever a key is registered on GitHub but not in your local keyring.

## Portability notes measured today

- **macOS `awk` has no `strftime`.** The system `awk` is the original BWK awk.
  Any epoch-to-date conversion inside `awk` fails with "calling undefined
  function strftime". Either install `gawk`, or convert outside: `date -r <epoch>`
  on BSD and macOS, `date -d @<epoch>` on GNU.
- **`git log --date=format:` handles most of it anyway.** Prefer letting Git
  format the date.

## Cost summary

| Query | Runtime, 287 commits, 1,390 files |
| --- | --- |
| churn with rename detection | 0.61 s |
| file co-change pass (`--name-only`) | 0.13 s |
| blame across 110 source files | 2.19 s |

All measured with `time` on a warm cache. Local history analytics is effectively
free at this size and stays linear in commits times files touched.
