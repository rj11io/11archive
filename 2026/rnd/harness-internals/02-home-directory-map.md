# The home directory map

Complete inventory of both home directories, MEASURED on one macOS machine on
2026-08-11 after heavy daily use of both tools.

Read the **Told?** column first. It answers: does any official documentation, menu,
or command mention this file to a normal user?

- **yes** = documented and user-facing
- **partly** = documented, but not somewhere you would look
- **no** = you would only find it by running `ls`

## `~/.claude`, 352 MB, 26 entries

### Things you are meant to edit

| Entry | Type | What it is | Told? |
| --- | --- | --- | --- |
| `settings.json` | file, `0600` | Your config: model, hooks, permissions, environment variables. | yes |
| `CLAUDE.md` | file | Instructions loaded into every session, everywhere. | yes |
| `hooks/` | dir | Your own scripts, fired at session start, before tool use, and so on. | yes |
| `skills/`, `agents/`, `commands/`, `rules/`, `workflows/` | dirs | Reusable prompts and sub-agent definitions. | yes |
| `plugins/` | dir, 16 MB | Installed plugin bundles and their marketplace metadata. | yes |
| `keybindings.json`, `themes/` | file, dir | Appearance and key bindings. | yes |

These are the documented surface. The official page describing them is
[Explore the .claude directory](https://code.claude.com/docs/en/claude-directory).

### Things the program writes for itself

| Entry | Type | What it is | Told? |
| --- | --- | --- | --- |
| `projects/` | dir, `0700`, **325 MB** | Full conversation transcripts. One folder per project, one `.jsonl` per session. The biggest thing in the directory by far. | partly |
| `file-history/` | dir | Copies of your files taken **before** each edit. Path is `<session-id>/<content-hash>@v<n>`. | partly |
| `shell-snapshots/` | dir | Your shell captured as a script so tool commands behave like your terminal. | no |
| `history.jsonl` | file, `0600` | Every prompt you typed, with the project it belonged to. Has a `pastedContents` field, so text you pasted into the prompt is stored too. | no |
| `session-env/` | dir | Per-session scratch. **All 851 directories were empty.** | no |
| `sessions/` | dir | One small JSON per running process, keyed by process id. Live-session bookkeeping. | no |
| `tasks/` | dir | Background task and sub-agent state, keyed by task id. | no |
| `telemetry/` | dir | Usage events that **failed to upload**, queued on disk for retry. Named `1p_failed_events.*.json`, but the contents are JSONL. | no |
| `backups/` | dir | Rolling copies of `~/.claude.json`, named with a millisecond timestamp. | no |
| `daemon/` | dir, `0700` | `control.key` plus a `dispatch` folder. Local control channel for the background daemon. | no |
| `plans/` | dir | Plans written in plan mode, saved as Markdown with generated names. | no |
| `cache/` | dir | Fetched changelog, your closed GitHub issues. | no |
| `jobs/`, `scheduled-tasks/` | dirs | Recurring task definitions and pinned jobs. | partly |
| `paste-cache/`, `downloads/` | dirs | Empty on the sampled machine. | no |
| `mcp-needs-auth-cache.json` | file | Which connected tool servers still need you to log in. | no |
| `policy-limits.json` | file, `0600` | Server-pushed restrictions. Keys include `restrictions`, `compliance_taints`, and `monitoring_notice`. | no |
| `remote-settings.json` | file, `0600` | Settings pushed from the server side. | no |
| `.last-cleanup` | file | Timestamp of the last transcript cleanup run. | no |
| `.last-update-result.json` | file | Outcome of the last self-update. | no |

Note `projects/<slug>/memory/`. That is where per-project agent memory lives, as
Markdown with a `MEMORY.md` index. DOCUMENTED, but easy to miss: it sits inside
the transcript folder, not with your other configuration.

Also note `projects/<slug>/<session>/tool-results/`. When a tool returns more
output than fits in context, the harness spills the full result to a text file
there and keeps only a preview in the conversation. Those spill files hold
whatever the tool returned, at full length.

### One level up

| Entry | Type | What it is |
| --- | --- | --- |
| `~/.claude.json` | file, `0600`, 95.5 KB | The real state file. Details below. |
| `~/.claude.json.backup` | file, `0600` | Previous copy. |

`~/.claude.json` held, MEASURED:

- 43 projects, each with `lastCost`, token counts, timing, allowed tools, trust
  status, and `exampleFiles` (a sample of filenames read from your repository)
- 487 entries under `cachedGrowthBookFeatures`. These are remote feature switches
  that change behaviour without an update.
- `machineID`, a stable 64-character identifier for this computer
- `oauthAccount`: your email, display name, organisation name, organisation role,
  billing type, and rate limit tier
- `numStartups`, `skillUsage`, `pluginUsage`, and a set of counters for which
  tips and announcements you have already seen

The `exampleFiles` field deserves a second look. Filenames alone can carry real
information: client names, unreleased product names, acquisition code names.

## `~/.codex`, 3.68 GB, 63 entries

### Things you are meant to edit

| Entry | Type | What it is | Told? |
| --- | --- | --- | --- |
| `config.toml` | file, `0600` | All configuration. Also holds one `[projects."<path>"]` block per directory you have ever trusted. | yes |
| `AGENTS.md` | file | Global instructions, same role as `CLAUDE.md`. | yes |
| `skills/`, `rules/`, `plugins/` | dirs | Reusable prompts and extensions. `plugins/` was 308 MB. | partly |
| `automations/` | dir | Saved recurring jobs, one folder each. | partly |

### The four databases

Codex keeps structured state in SQLite rather than JSON. This is the biggest
difference from Claude Code.

| File | Size | Tables | What it holds |
| --- | --- | --- | --- |
| `state_5.sqlite` | 12 MB | `threads`, `thread_sections`, `thread_spawn_edges`, `thread_dynamic_tools`, `remote_control_enrollments`, `external_agent_config_imports` | The session index. **455 threads.** Each row carries `cwd`, `git_sha`, `git_branch`, `git_origin_url`, `sandbox_policy`, `approval_mode`, `tokens_used`, `first_user_message`, and `preview`. |
| `logs_2.sqlite` | 395 MB | `logs` | Debug logs. **43,830 rows** covering 2026-08-02 to 2026-08-11. The body column is named `feedback_log_body`. |
| `memories_1.sqlite` | 40 KB | `stage1_outputs`, `jobs` | A background pipeline that distils finished sessions into summaries. Has leases, retries, and watermarks. |
| `goals_1.sqlite` | 32 KB | `thread_goals`, `thread_goal_continuation_deferrals` | Long-running objectives with token budgets and status such as `usage_limited`. |

Each has `-wal` and `-shm` companion files, which are SQLite's write-ahead log.
Those can be large on their own: the log database's `-wal` was 6.1 MB.

Two details from `state_5.sqlite` worth naming. `git_origin_url` means the
database holds a list of every repository remote you have worked on. And the
`threads` table has grown by schema migration over time, with 46 migrations
recorded, so newer columns such as `agent_nickname`, `memory_mode`, and
`reasoning_effort` sit appended at the end of the table definition.

### Everything else

| Entry | Size | What it is | Told? |
| --- | --- | --- | --- |
| `sessions/` | **1.37 GB** | Transcripts, called rollouts. Tree is `sessions/YYYY/MM/DD/rollout-<iso>-<uuid>.jsonl`. **453 files**, oldest 2026-02-19. | partly |
| `worktrees/` | **839 MB** | Separate git checkouts made for background agents. One project. Orphaned. | no |
| `.tmp/` | **241 MB** | Plugin sync scratch: `plugins-backup-<random>`, `plugins-clone-<random>`, a lock file, a `.sha`. Not cleaned after a successful sync. | no |
| `packages/` | 307 MB | Downloaded runtime dependencies. | no |
| `generated_images/` | 121 MB | 98 images the agent produced. | no |
| `computer-use/` | 63 MB | A complete macOS application bundle, `Codex Computer Use.app`, plus its config. Downloaded into your home directory. | no |
| `cache/` | 16 MB | Assorted caches. | no |
| `vendor_imports/` | 8.6 MB | Curated skills pulled from vendors, plus a cache index. | no |
| `sqlite/` | 8.2 MB | Additional database files. | no |
| `archived_sessions/` | 1.3 MB | Threads you archived. Archived means hidden from the list, not deleted. | partly |
| `shell_snapshots/` | 968 KB | Same idea as Claude Code's. | no |
| `.codex-global-state.json` + `.bak` | 859 KB each | Large global state blob. | no |
| `attachments/` | | Files you attached, one folder per attachment id. | no |
| `browser/sessions/` | | One TOML file per browser session the agent drove. | no |
| `dictation-history/` | `0700` | Voice input history, keyed by SHA-256, with `metadata.json`. | no |
| `transcription-history.jsonl` | `0600` | Speech-to-text results. | no |
| `models_cache.json` | 197 KB | Cached model catalogue. | no |
| `session_index.jsonl` | 60 KB | Flat index of thread id, name, and update time. | no |
| `thread-writer-locks/` | | One `.lock` per thread, to stop two processes writing the same rollout. | no |
| `ipc/ipc.sock` | `0700` | Unix socket for talking to the background app server. | no |
| `process_manager/chat_processes.json` | | Long-running processes the agent started. | no |
| `node_repl/active_execs` | | Live Node evaluation state. | no |
| `auth.json` | `0600` | OAuth `id_token`, `access_token`, `refresh_token`, `account_id`. Plain JSON. | partly |
| `installation_id`, `version.json` | | Stable install identifier and version record. | no |
| `history.jsonl` | `0600` | Prompt history. | partly |
| `visualizations/`, `pets/`, `memories/`, `log/`, `tmp/`, `node_repl/` | | Present. Several empty. | no |

### The leftovers nobody cleans

MEASURED, at the top of `~/.codex`:

```
..codex-global-state.json.tmp-1784249643052-4eb359ed-...    0 bytes
..codex-global-state.json.tmp-1784279083024-9c6d4897-...    512 KB
... 9 more, dated July 17 to August 7
```

Eleven abandoned temporary files from an interrupted atomic-write pattern. The
pattern itself is correct: write to a temp file, then rename over the real one.
When the process dies between those two steps, the temp file stays. Nothing
sweeps them up.

Alongside them sit marker files that record one-time migrations:
`.personality_migration`, `.sandbox_migration`, `.app-server-state-reconciled-v1`.
Each holds a few bytes. Each is permanent.

## The gap, stated plainly

| | Documented entries | Entries present | Documented share |
| --- | --- | --- | --- |
| `~/.claude` | ~14 | 26 | 54% |
| `~/.codex` | ~4 | 63 | 6% |

And by size, the ratio is worse than the count suggests. In `~/.codex`, the four
documented entries account for well under 1% of the 3.68 GB. The undocumented
`sessions/`, `worktrees/`, `.tmp/`, `packages/`, and `logs_2.sqlite` account for
about 87%.

Next: [03-invisible-files-catalog.md](03-invisible-files-catalog.md) groups these
by what they actually contain.
