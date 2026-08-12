# The invisible files, by what they contain

Chapter 2 sorted files by where they live. This chapter sorts them by what is
actually inside, because that is what decides how much you should care.

Eight classes, ordered by how much damage the contents could do.

---

## Class A: the complete record of your work

**Files:** `~/.claude/projects/<slug>/<uuid>.jsonl`,
`~/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl`

**Size on the sampled machine:** 325 MB and 1.37 GB.

This is the whole conversation, written to plain text as it happens. Not a
summary. Every prompt, every model reply, every tool call, and every tool result.

### What a Claude Code transcript line looks like

MEASURED, the fields present across a 15 MB transcript:

```
type            assistant | user | attachment | mode | last-prompt |
                custom-title | queue-operation
message         the actual content
toolUseResult   full output of the tool that ran
cwd             working directory
gitBranch       branch at the time
sessionId       session identifier
uuid            this record
parentUuid      the record before it, so the thread can be rebuilt
isSidechain     true when a sub-agent produced it
promptSource    how the prompt arrived
requestId       server-side request identifier
version         harness version
timestamp       when
```

`toolUseResult` is the field that matters. When the agent ran `cat config/prod.env`,
the output of that command is in this file. When it read your database migration,
the migration is in this file.

### What a Codex rollout looks like

MEASURED, record counts from one ordinary session:

```
event_msg/token_count                  754
turn_context                           378
response_item/reasoning                321
event_msg/agent_reasoning              299
response_item/function_call            273
response_item/function_call_output     273
response_item/custom_tool_call         178
response_item/custom_tool_call_output  178
response_item/message                  131
event_msg/agent_message                 93
event_msg/user_message                  21
session_meta                             1
```

Two things stand out.

First, `response_item/reasoning` appears 321 times. The model's internal reasoning
is written to disk, not only its visible replies.

Second, the single `session_meta` record at the top of the file carries a
`base_instructions` field. That is the full system prompt. Every rollout file on
disk contains a copy of it.

### How long they stay

DOCUMENTED: Claude Code deletes transcripts older than `cleanupPeriodDays`, which
defaults to 30. Codex defaults to `history.persistence = "save-all"` with no
age limit.

MEASURED consequence: the sampled machine held Codex rollouts back to 2026-02-19,
six months, and the largest single file had reached 131 MB.

### Why this is class A

Any secret the agent ever read is in here, in plain text, indefinitely. See
[04-privacy-and-security.md](04-privacy-and-security.md).

---

## Class B: shadow copies of your source code

**Files:** `~/.claude/file-history/`, `~/.claude/projects/<slug>/<session>/tool-results/`,
`~/.codex/worktrees/`, `~/.codex/attachments/`

Your code, copied outside your repository.

- **`file-history/`** holds the version of each file from *before* an edit, so
  changes can be undone. Named `<content-hash>@v<n>`.
- **`tool-results/`** holds tool output too large for the conversation. The
  preview goes in context, the full text goes here.
- **`worktrees/`** holds entire additional checkouts. Background agents get their
  own copy of the repository so parallel work does not collide.
- **`attachments/`** holds files you dragged in.

MEASURED: `~/.codex/worktrees/` was 839 MB and contained exactly one project
checkout, complete with `.git`, `README.md`, and all source.

That checkout was **orphaned**. Its parent repository had been moved to a
different path, so the `.git/worktrees/` link on the parent side no longer
existed. Running `git worktree prune` in the parent does nothing, because there is
no parent at the recorded path any more. The only way to reclaim the space is to
delete the folder yourself.

**Why this matters beyond disk:** a repository you deleted is not gone if a
worktree copy survives here.

---

## Class C: fingerprints of you and your machine

**Files:** `~/.claude/shell-snapshots/`, `~/.claude.json`, `~/.codex/config.toml`,
`~/.codex/state_5.sqlite`, `~/.codex/installation_id`, `~/.claude/history.jsonl`

Not your code. Facts about your setup.

| Where | What it reveals |
| --- | --- |
| `shell-snapshots/*.sh` | Your shell functions, aliases, options, `PATH`. MEASURED: 4,501 lines, 127 functions, 4 aliases, 1 export in one sample. |
| `~/.claude.json` → `projects` | Every project path you have opened, with cost and token history. 43 on the sampled machine. |
| `~/.claude.json` → `exampleFiles` | A sample of filenames from inside each repository. |
| `~/.claude.json` → `machineID` | Stable 64-character machine identifier. |
| `~/.codex/config.toml` → `[projects."<path>"]` | Every directory you ever trusted, by full absolute path, kept permanently. |
| `~/.codex/state_5.sqlite` → `threads` | `cwd`, `git_branch`, `git_sha`, and `git_origin_url` for all 455 threads. |
| `~/.claude/history.jsonl` | Every prompt string you typed, plus `pastedContents` for prompts built by pasting. |

The trust list is the most revealing single item. It is an ordered, dated list of
every directory you have worked in. For a consultant, that is a client list. For
anyone under a non-disclosure agreement, it is a list of things you were not
supposed to name.

`pastedContents` deserves a note. It was present on only 2 of 162 history entries
on the sampled machine, so it is not routine. But when you paste something into a
prompt, the pasted text can be written to disk separately from the transcript.

---

## Class D: credentials

**Files:** `~/.codex/auth.json`, macOS Keychain item `Claude Code-credentials`

MEASURED contrast:

```
Claude Code   macOS Keychain, item "Claude Code-credentials"
              no plaintext ~/.claude/.credentials.json on this machine
              encrypted at rest, gated by the OS

Codex CLI     ~/.codex/auth.json, mode 0600, plain JSON
              { auth_mode, OPENAI_API_KEY, tokens: {
                  id_token, access_token, refresh_token, account_id },
                last_refresh }
```

`0600` means only your user account can read the file. That defends against other
users on a shared machine. It does not defend against a malicious npm package,
because that runs as you.

REPORTED: the ChainDrop worm hunted for exactly this class of file across
Anthropic, Codex, Cursor, OpenAI, and Gemini tooling ([Elastic Security
Labs](https://www.elastic.co/security-labs/shai-hulud-chaindrop-npm-supply-chain)).

Note also that `refresh_token` is the valuable one. An access token expires in
hours. A refresh token mints new ones.

---

## Class E: state the vendor pushes to you

**Files:** `~/.claude.json` → `cachedGrowthBookFeatures`, `~/.claude/policy-limits.json`,
`~/.claude/remote-settings.json`, `~/.codex/models_cache.json`

This class runs the opposite direction: the server writing to your disk.

MEASURED: 487 cached feature flags in `~/.claude.json`. These decide which
behaviours are switched on for you. Two people on the same version can behave
differently because their cached flags differ.

`policy-limits.json` held keys named `restrictions`, `compliance_taints`,
`monitoring_notice`, and `defaults`. The names suggest organisation-level policy
enforcement delivered from the server.

There is a real trade-off here, and it cuts both ways. DOCUMENTED: setting
`DISABLE_TELEMETRY=1` also stops feature flags being fetched, which means you also
stop receiving remote kill switches for broken behaviour
([claude-code issue #58383](https://github.com/anthropics/claude-code/issues/58383)).
Turning off the reporting turns off the safety brake attached to it.

---

## Class F: telemetry waiting on disk

**Files:** `~/.claude/telemetry/1p_failed_events.*.json`

Usage events that failed to upload, kept for retry. Despite the `.json`
extension, the format is JSONL.

MEASURED, the shape of one queued event, with values replaced by their type:

```json
{ "event_type": "<str:23>",
  "event_data": {
    "event_name": "...", "client_timestamp": "...", "model": "...",
    "session_id": "...", "user_type": "...", "betas": "...",
    "entrypoint": "...", "agent_sdk_version": "...",
    "is_interactive": true, "client_type": "...",
    "process": "<str:336>",
    "env": { "platform": "...", "node_version": "...", "terminal": "...",
             "package_managers": "...", "runtimes": "...", "is_ci": "...",
             "is_github_action": "...", "version": "..." } } }
```

Four events were queued. The contents are operational metadata: platform, Node
version, terminal, model, session id. No prompt text was present in the sample.

The Codex equivalent is different. DOCUMENTED: `otel.metrics_exporter` defaults
to `statsig`, and `otel.log_user_prompt` defaults to off. But the same
documentation notes that tool results are exported even when prompt logging is
off, and tool results can contain file contents
([Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference),
[SigNoz](https://signoz.io/docs/codex-monitoring/)).

---

## Class G: leftovers

Files that serve no purpose and that nothing removes.

MEASURED:

| What | Count or size | Why it is there |
| --- | --- | --- |
| `~/.claude/session-env/` | 851 directories, **all empty** | Created per session, never removed |
| `~/.codex/..codex-global-state.json.tmp-*` | 11 files, up to 512 KB each | Interrupted write-then-rename, dated across three weeks |
| `~/.codex/.tmp/plugins-backup-*`, `plugins-clone-*` | part of 241 MB | Plugin sync scratch, kept after success |
| `~/.codex/logs_2.sqlite` free pages | **326 MB of 395 MB** | Rows deleted, space never returned |
| `~/.codex/thread-writer-locks/*.lock` | one per thread | Lock files outliving their process |
| `.personality_migration`, `.sandbox_migration`, `.app-server-state-reconciled-v1` | a few bytes each | One-time migration markers, permanent |

The log database is the clearest case. It holds 43,830 rows with about 47 MB of
content. The file is 395 MB. SQLite does not shrink a file when rows are deleted;
it marks pages free and reuses them later. So the file grew to its high-water
mark and stayed there. `VACUUM` rebuilds it and gives the space back.

---

## Class H: things that can execute

**Files:** `<project>/.claude/settings.json` hooks, `~/.claude/hooks/`,
`~/.claude/plugins/`, `~/.codex/plugins/`, `~/.codex/skills/`,
`~/.codex/computer-use/Codex Computer Use.app`

Everything above is data. This class is code.

- **Hooks** are shell commands the harness runs on its own, at events such as
  session start. They can be defined in a project's `.claude/settings.json`,
  which means they can arrive in a repository you clone.
- **Plugins and skills** are downloaded bundles. MEASURED: 308 MB of Codex
  plugins and 16 MB of Claude Code plugins.
- **`Codex Computer Use.app`** is a full 63 MB macOS application bundle sitting
  in your home directory.

MEASURED: none of the project-level `.claude/` directories across 12 repositories
on the sampled machine were listed in any `.gitignore`. Agent configuration
travels with the repository by default.

That is the shape of the attack that [04-privacy-and-security.md](04-privacy-and-security.md)
covers next.
