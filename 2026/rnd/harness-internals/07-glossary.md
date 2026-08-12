# Glossary

Every term this report uses, in plain words. Alphabetical.

---

**Agent memory.** Notes the agent keeps about a project between sessions, so it
does not relearn the same facts. In Claude Code these are Markdown files at
`~/.claude/projects/<slug>/memory/`, indexed by `MEMORY.md`. Codex builds
something similar in the background using `memories_1.sqlite`. Worth knowing: the
Claude Code version lives inside the transcript folder, so deleting transcripts
to save space deletes the memory too.

**AGENTS.md / CLAUDE.md.** A plain Markdown file of project instructions that
gets loaded into every session. `AGENTS.md` is Codex's name for it, `CLAUDE.md`
is Claude Code's. Useful for conventions and commands. **Not a security
control**: it is a request to a model, which may or may not be followed.

**Approval mode.** How much the agent asks before acting. Codex offers
`untrusted`, `on-request`, and `never`. Recorded per session in
`state_5.sqlite`.

**Atomic write.** Writing to a temporary file, then renaming it over the real
one. The rename is instant, so a reader never sees a half-written file. Correct
practice. Its failure mode is the 11 abandoned `.tmp-` files in `~/.codex`: when
the process dies between write and rename, the temp file stays.

**Content hash.** A short string computed from a file's contents. Same content
always gives the same string. Claude Code uses one to name file backups, so
identical files are stored once. Appears in paths like
`file-history/<session>/096d54fae1279a92@v3`.

**Feature flag.** A remote switch that changes a program's behaviour without
updating it. MEASURED: 487 of them cached in `~/.claude.json` under
`cachedGrowthBookFeatures`. They also carry kill switches for broken behaviour,
which is why disabling telemetry has a real cost.

**Harness.** The program that wraps a language model and lets it act: keeping the
conversation, offering tools, running them when asked. Claude Code and Codex CLI
are harnesses. The subject of this report.

**Hook.** A shell command the harness runs by itself when something happens, such
as a session starting. Defined in `settings.json`. Because a project's
`.claude/settings.json` can define one, a repository you clone can cause code to
run on your machine. See [04-privacy-and-security.md](04-privacy-and-security.md).

**JSONL.** JSON Lines: one complete JSON object per line, no wrapping array.
Appending one line is a single write, so a crash costs at most the last line.
That property is why every harness uses it for transcripts.

**MCP.** Model Context Protocol. A standard way to connect external tool servers
to a harness. Relevant here because `~/.claude/mcp-needs-auth-cache.json` tracks
which servers still need you to log in.

**OTEL / OpenTelemetry.** An industry standard for emitting logs, metrics, and
traces. Codex uses it for telemetry, configured under `[otel]` in `config.toml`.
DOCUMENTED: Codex ignores `OTEL_*` environment variables, so `config.toml` is the
only way to set it.

**Rollout.** Codex's name for a session transcript. Stored at
`~/.codex/sessions/YYYY/MM/DD/rollout-<timestamp>-<uuid>.jsonl`.

**Sandbox.** Limits on what the agent can touch. Codex offers `read-only`,
`workspace-write`, and `danger-full-access`. Recorded per session so you can see
afterwards what a session was allowed to do.

**Session / thread.** One continuous conversation. Claude Code says session,
Codex says thread. Each gets a UUID, which becomes the transcript filename.

**Shell snapshot.** A capture of your shell's functions, aliases, options, and
`PATH`, saved as a script and sourced before each command so tools behave like
your terminal. MEASURED: 4,501 lines and 127 functions in one sample. It captures
shell *definitions*, not your environment variables.

**Sidechain.** A sub-agent's conversation, running inside the main one. Marked
`isSidechain: true` in Claude Code transcripts. It means one session file can
contain several parallel conversations.

**SQLite WAL.** Write-Ahead Log. SQLite writes changes to a `-wal` companion file
first, then folds them into the main database later. This is why you see
`logs_2.sqlite`, `logs_2.sqlite-wal`, and `logs_2.sqlite-shm` together. The
`-wal` file can be large on its own: 6.1 MB in one measurement.

**Statsig.** The service Claude Code uses for feature flags and usage metrics,
and Codex's default `metrics_exporter`.

**System prompt.** The instructions given to the model before your conversation
starts. Stored as `base_instructions` in the `session_meta` record at the top of
every Codex rollout, which means a copy sits in every one of those 453 files.

**Tool result.** What a tool returned, fed back into the conversation as a
message. Stored in full in the transcript as `toolUseResult`. **This is the field
that leaks secrets**: if the agent read your `.env`, its contents are here.

**Trust level.** Whether you have marked a directory as safe. Codex keeps this in
`config.toml` under `[projects."<path>"]`, permanently. Claude Code keeps it as
`hasTrustDialogAccepted` per project in `~/.claude.json`. Together these form a
complete, dated list of every directory you have worked in.

**VACUUM.** A SQLite command that rebuilds a database file to release space from
deleted rows. MEASURED: reclaims 326 MB from `~/.codex/logs_2.sqlite`. Keeps
every row.

**Worktree.** A second checkout of one git repository in a different folder,
letting two branches be open at once. Background agents get their own so they do
not disturb your files. **Orphaned worktree**: one whose parent repository has
moved or been deleted, breaking both ends of the link. `git worktree prune`
cannot remove it. MEASURED: 839 MB in one.
