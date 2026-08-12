# Disk growth and retention

## Where 4.0 GB went

MEASURED, 2026-08-11, one macOS machine.

| Location | Size | Share of total |
| --- | --- | --- |
| `~/.codex/sessions/` | 1.37 GB | 34% |
| `~/.codex/worktrees/` | 839 MB | 21% |
| `~/.codex/logs_2.sqlite` | 395 MB | 10% |
| `~/.codex/plugins/` | 308 MB | 7.6% |
| `~/.codex/packages/` | 307 MB | 7.6% |
| `~/.claude/projects/` | 325 MB | 8.1% |
| `~/.codex/.tmp/` | 241 MB | 6.0% |
| `~/.codex/generated_images/` | 121 MB | 3.0% |
| `~/.codex/computer-use/` | 63 MB | 1.6% |
| everything else | ~65 MB | 1.6% |
| **total** | **4.03 GB** | |

Two lines carry the story. Conversation transcripts are 1.70 GB across both
tools, 42% of everything. And 1.08 GB, 27%, is pure waste: an unvacuumed
database, an orphaned worktree, and plugin sync scratch.

## The four ways this grows

### 1. Transcripts grow with the work, and never shrink

Every tool result is appended in full. Read a 2 MB log file to find one line and
all 2 MB goes into the transcript.

MEASURED: the largest Codex rollout had reached **131 MB** for a single session.
Second and third largest were 52 MB and 47 MB. The largest Claude Code transcript
was 15.1 MB.

The gap between 131 MB and 15.1 MB is mostly retention policy, not a difference
in how verbose the tools are.

### 2. Retention defaults differ by a lot

DOCUMENTED:

| | Claude Code | Codex CLI |
| --- | --- | --- |
| Setting | `cleanupPeriodDays` in `settings.json` | `history.persistence` in `config.toml` |
| Default | `30` | `"save-all"` |
| Effect | deletes transcripts older than 30 days at startup | keeps everything |
| Size cap | none | `history.max_bytes` caps the prompt history file only, not rollouts |

MEASURED: the sampled machine held Codex rollouts from 2026-02-19, six months
back. Claude Code's oldest was 30 days, exactly as documented.

**The `cleanupPeriodDays: 0` trap.** Reading the name, `0` should mean "no
cleanup, keep forever". It does the opposite: it stops transcripts being written
at all ([claude-code issue
#23710](https://github.com/anthropics/claude-code/issues/23710)). To keep
everything, set a large number:

```json
{ "cleanupPeriodDays": 3650 }
```

### 3. SQLite files grow to a high-water mark and stay there

This is the most reclaimable waste, and it is invisible without asking.

MEASURED, `~/.codex/logs_2.sqlite`:

```
file size            395.4 MB
page size            4,096 bytes
total pages          101,213
free pages            83,412      <- 82% of the file
reclaimable          326.0 MB
rows                  43,830
live content         ~47 MB
date range           2026-08-02 to 2026-08-11
```

SQLite marks deleted pages free and reuses them later rather than shrinking the
file. So nine days of debug logs, worth 47 MB, sit inside a 395 MB container that
grew during some earlier burst and never came back down.

```bash
# reclaims 326 MB on the sampled machine, takes seconds
sqlite3 ~/.codex/logs_2.sqlite 'VACUUM;'
```

Safe to run when Codex is not running. It rebuilds the file and keeps every row.

Retention on that table is loose rather than strict: 14,450 of the 43,830 rows
were older than 7 days, so it is not a hard weekly window.

### 4. Scratch space is not cleaned after success

MEASURED, `~/.codex/.tmp/`, 241 MB:

```
plugins/
plugins-backup-GtQloD/      <- kept after a successful sync
plugins-clone-p7Asu7/       <- kept after a successful sync
plugins.sha
plugins.sync.lock
bundled-marketplaces/
legacy-primary-runtime-skills/
marketplaces/
```

The backup-and-clone pattern is right: clone the new version, back up the old,
swap, then delete both. The last step does not happen.

Same story at the top of `~/.codex`: 11 abandoned
`..codex-global-state.json.tmp-<epoch>-<uuid>` files, up to 512 KB each, dated
across three weeks.

## The orphaned worktree

Worth its own section, because normal cleanup cannot fix it.

MEASURED: `~/.codex/worktrees/c16a/<project>` was 839 MB. One complete checkout,
`.git` included.

A **git worktree** is a second checkout of the same repository in a different
folder. Background agents get one so they can work without disturbing your files.
Git tracks the link from both ends: the worktree has a `.git` file pointing at
the parent, and the parent has an entry under `.git/worktrees/`.

Here the parent repository had been moved to a new path. So:

```
worktree points to:   ~/Desktop/.../2026/repos/<project>/.git/worktrees/<project>
that path now:        does not exist
git status there:     fatal: not a git repository
git worktree prune:   nothing to prune, there is no parent to prune from
```

Both ends of the link are broken. Git cannot help. 839 MB stays until you delete
the folder by hand.

```bash
# inspect first
du -sh ~/.codex/worktrees/*/*
# for each, check whether its parent still exists
git -C ~/.codex/worktrees/<hash>/<project> status 2>&1 | head -1
# "fatal: not a git repository" means orphaned and safe to remove
```

Do check for uncommitted work before deleting. An agent's worktree can contain
changes that were never pushed anywhere.

## Empty directories

MEASURED: `~/.claude/session-env/` contained **851 directories. Every one was
empty.** Zero files in total.

Each was created for a session that has long ended. They cost almost no space,
but they slow down directory listings and make `~/.claude` unreadable.

```bash
find ~/.claude/session-env -mindepth 1 -maxdepth 1 -type d -empty -delete
```

## What is safe to delete

| Target | Safe? | You lose |
| --- | --- | --- |
| `sqlite3 ~/.codex/logs_2.sqlite 'VACUUM;'` | yes | nothing |
| Empty `session-env/` dirs | yes | nothing |
| `..codex-global-state.json.tmp-*` | yes | nothing |
| `~/.codex/.tmp/plugins-backup-*`, `plugins-clone-*` | yes, when idle | nothing |
| Orphaned worktrees | yes, after checking | uncommitted work in them |
| `~/.codex/generated_images/` | yes | images the agent made |
| Old transcripts | your call | the ability to `--resume` those sessions, and their history |
| `~/.claude/file-history/` | mostly | undo for those sessions |
| `~/.claude/projects/<slug>/` | careful | transcripts **and** that project's agent memory |
| `~/.codex/auth.json`, `config.toml` | **no** | login and all settings |
| `~/.claude.json` | **no** | all settings, trust decisions, project state |
| `~/.claude/settings.json` | **no** | all settings |

The one to be careful with is `~/.claude/projects/<slug>/`. Agent memory lives
inside it at `memory/MEMORY.md`. Deleting the folder to reclaim transcript space
also deletes everything the agent learned about that project.

## A cleanup script

Reclaims about 1.1 GB on the sampled machine. Read it before running it.

```bash
#!/usr/bin/env bash
set -euo pipefail

# stop both tools first
pgrep -f 'codex|claude' && { echo "quit codex and claude first"; exit 1; }

echo "before: $(du -sh ~/.claude ~/.codex | tr '\n' ' ')"

# 1. reclaim free pages in the log database
sqlite3 ~/.codex/logs_2.sqlite 'VACUUM;'

# 2. abandoned atomic-write temp files
find ~/.codex -maxdepth 1 -name '..codex-global-state.json.tmp-*' -delete

# 3. plugin sync scratch
rm -rf ~/.codex/.tmp/plugins-backup-* ~/.codex/.tmp/plugins-clone-*

# 4. empty session dirs
find ~/.claude/session-env -mindepth 1 -maxdepth 1 -type d -empty -delete

echo "after:  $(du -sh ~/.claude ~/.codex | tr '\n' ' ')"
echo
echo "not automated, check these by hand:"
du -sh ~/.codex/worktrees/*/* 2>/dev/null
echo "  ^ for each, run: git -C <path> status"
echo "    'fatal: not a git repository' means orphaned"
```

Worktrees are left out on purpose. They can hold work that exists nowhere else.

## Rough projection

MEASURED growth on the sampled machine works out to roughly **20 to 25 MB per
active day per tool**, from transcripts alone, before plugins and caches.

Treat that as one data point, not a rule. It scales with how much file content
your tasks pull into context. A day of reading large logs costs far more than a
day of small edits.

At that rate, with Codex's indefinite retention, a year of daily use lands around
7 to 9 GB. That is a laptop annoyance, not a crisis. The reason to care is
[04-privacy-and-security.md](04-privacy-and-security.md): the size is a proxy for
how much of your work is sitting in plain text.

Next: [06-operator-playbook.md](06-operator-playbook.md).
