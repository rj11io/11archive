# Operator playbook

Everything actionable, in one place. Run the audit first so you know your own
numbers before changing anything.

---

## Step 1: audit what you have

Read-only. Nothing here changes a file.

```bash
#!/usr/bin/env bash
# harness-audit.sh: read-only inspection of both agent home directories

echo "=== totals ==="
du -sh ~/.claude ~/.codex 2>/dev/null

echo; echo "=== biggest items ==="
du -sh ~/.claude/* ~/.codex/* 2>/dev/null | sort -rh | head -12

echo; echo "=== transcripts ==="
printf 'claude: %s files, %s\n' \
  "$(find ~/.claude/projects -name '*.jsonl' 2>/dev/null | wc -l | tr -d ' ')" \
  "$(du -sh ~/.claude/projects 2>/dev/null | cut -f1)"
printf 'codex:  %s files, %s\n' \
  "$(find ~/.codex/sessions -name '*.jsonl' 2>/dev/null | wc -l | tr -d ' ')" \
  "$(du -sh ~/.codex/sessions 2>/dev/null | cut -f1)"

echo; echo "=== oldest transcript kept ==="
find ~/.codex/sessions -name '*.jsonl' 2>/dev/null \
  | sed 's|.*/rollout-\([0-9-]*\)T.*|\1|' | sort | head -1

echo; echo "=== reclaimable in log database ==="
if [ -f ~/.codex/logs_2.sqlite ]; then
  sqlite3 ~/.codex/logs_2.sqlite \
    "SELECT (SELECT * FROM pragma_freelist_count()) *
            (SELECT * FROM pragma_page_size()) / 1048576 || ' MB';"
fi

echo; echo "=== empty session dirs ==="
find ~/.claude/session-env -mindepth 1 -maxdepth 1 -type d -empty 2>/dev/null | wc -l

echo; echo "=== worktrees (check each for an orphan) ==="
du -sh ~/.codex/worktrees/*/* 2>/dev/null

echo; echo "=== credential exposure in transcripts ==="
rg -l 'sk-ant-|sk-proj-|AKIA[0-9A-Z]{16}|ghp_|-----BEGIN.*PRIVATE KEY' \
   ~/.claude/projects ~/.codex/sessions 2>/dev/null | head
echo "(no output above = nothing matched those patterns)"

echo; echo "=== project dirs you have trusted ==="
grep -c '^\[projects' ~/.codex/config.toml 2>/dev/null
```

If the credential search returns anything, stop and go to Step 2 before doing
anything else.

---

## Step 2: if the audit found credentials

In this order.

1. **Rotate the credential.** Assume it is compromised. A transcript is plain
   text, it may be in a backup, and Time Machine or any cloud sync will have
   copied it.
2. **Delete the transcripts containing it.**

```bash
rg -l 'sk-ant-|sk-proj-|AKIA[0-9A-Z]{16}|ghp_' \
   ~/.claude/projects ~/.codex/sessions | tee /tmp/hits.txt
# review /tmp/hits.txt, then:
xargs rm < /tmp/hits.txt
```

3. **Check your backups.** Deleting the file locally does not remove it from a
   Time Machine snapshot or an iCloud or Dropbox copy of your home directory.
4. **Stop it happening again**, using Step 3.

---

## Step 3: settings worth changing

### Claude Code, `~/.claude/settings.json`

```json
{
  "cleanupPeriodDays": 14,
  "permissions": {
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./**/.env)",
      "Read(./**/*.pem)",
      "Read(./**/credentials*)",
      "Read(./**/id_rsa*)"
    ]
  }
}
```

Three things to be honest about with those deny rules:

- They cover the **Read** tool. A `grep` or `cat` run through Bash goes around
  them. Add matching Bash deny rules if that matters to you.
- `cleanupPeriodDays: 14` shortens your exposure window. Set it to `3650` instead
  if you want long history and accept the trade. Never set it to `0` unless you
  want transcripts switched off entirely.
- A `CLAUDE.md` instruction is **not** equivalent. Permissions are enforced by
  the harness. `CLAUDE.md` is a request to the model.

### Codex, `~/.codex/config.toml`

```toml
# cap prompt history growth
[history]
persistence = "save-all"
max_bytes = 10485760          # 10 MB

# keep telemetry local
[otel]
exporter = "none"
metrics_exporter = "none"
log_user_prompt = false
```

Set `persistence = "none"` if you never want rollouts written. You lose the
ability to resume a session, which is a real cost.

Note the limit: `history.max_bytes` caps the prompt history file only. It does
**not** cap `sessions/`, which is where the 1.37 GB actually was.

### Both: keep agent state out of git

```bash
git config --global core.excludesfile ~/.gitignore_global
cat >> ~/.gitignore_global <<'EOF'
.claude/settings.local.json
.claude/session-env/
.codex/config.toml
EOF
```

Leave `CLAUDE.md`, `AGENTS.md`, `.claude/skills/`, and `.claude/rules/`
committed. Those are meant to be shared.

---

## Step 4: before opening an unfamiliar repository

Thirty seconds, and it is the check that stops the ChainDrop class of attack.

```bash
#!/usr/bin/env bash
# run inside a repo you did not write, before starting an agent in it
echo "=== agent config present? ==="
ls -la .claude/ .codex/ .vscode/ .agents/ 2>/dev/null

echo; echo "=== hooks (any output here needs your attention) ==="
grep -rn -A3 '"hooks"\|"command"\|SessionStart\|PreToolUse' \
  .claude/ .codex/ 2>/dev/null | head -30

echo; echo "=== npm lifecycle scripts ==="
[ -f package.json ] && \
  python3 -c "import json;s=json.load(open('package.json')).get('scripts',{});\
print({k:v for k,v in s.items() if k.startswith(('pre','post'))} or 'none')"
```

Any `command` you did not expect means: do not start a session there. Read the
script first.

---

## Step 5: routine cleanup

Monthly is plenty. The script is in
[05-disk-growth-and-retention.md](05-disk-growth-and-retention.md#a-cleanup-script).
The four safe operations:

```bash
sqlite3 ~/.codex/logs_2.sqlite 'VACUUM;'
find ~/.codex -maxdepth 1 -name '..codex-global-state.json.tmp-*' -delete
rm -rf ~/.codex/.tmp/plugins-backup-* ~/.codex/.tmp/plugins-clone-*
find ~/.claude/session-env -mindepth 1 -maxdepth 1 -type d -empty -delete
```

Quit both tools first. Handle worktrees by hand:

```bash
for w in ~/.codex/worktrees/*/*; do
  printf '%s  ' "$(du -sh "$w" | cut -f1)"
  git -C "$w" status --porcelain >/dev/null 2>&1 \
    && echo "LIVE  $w" || echo "ORPHAN $w"
done
```

`ORPHAN` means git cannot reach the parent. Check for uncommitted work, then
delete.

---

## Step 6: decide your privacy posture

Three positions. Pick one on purpose rather than by default.

### Default: leave everything as shipped

Telemetry on, transcripts kept, flags fetched. You get remote kill switches and
working feature gates. Fine for open source and personal projects.

### Middle: reduce retention, keep the safety channel

```json
{ "cleanupPeriodDays": 7 }
```

```toml
[otel]
log_user_prompt = false
```

Shortens the window in which a leaked secret sits on disk, without cutting off
the channel that delivers fixes. **This is the recommended default for
client work.**

### Strict: cut outbound traffic

```json
{ "env": {
    "DISABLE_TELEMETRY": "1",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": "1"
} }
```

```toml
[history]
persistence = "none"

[otel]
exporter = "none"
metrics_exporter = "none"
```

Know what this costs, because it is not free. DOCUMENTED: turning off telemetry
also turns off feature flag fetching, so you lose remote kill switches and fall
back to built-in defaults ([claude-code issue
#58383](https://github.com/anthropics/claude-code/issues/58383)). Turning off
history means no session resume.

Only worth it under a real requirement, such as a regulated environment or a
client contract that forbids third-party processing.

---

## Quick reference

| Question | Answer |
| --- | --- |
| Where are my conversations? | `~/.claude/projects/<slug>/*.jsonl`, `~/.codex/sessions/YYYY/MM/DD/*.jsonl` |
| How long are they kept? | Claude Code 30 days by default. Codex forever. |
| How do I keep them longer? | `cleanupPeriodDays: 3650`. Never `0`. |
| Does `.gitignore` protect secrets? | No. It stops commits, not reads. |
| Where are my credentials? | Claude Code: macOS Keychain. Codex: `~/.codex/auth.json`, plain JSON, `0600`. |
| Can a cloned repo run code? | Yes, through a hook in `.claude/settings.json`. Check before opening. |
| Biggest safe win on disk? | `VACUUM` the Codex log database. 326 MB on the sampled machine. |
| What must I never delete? | `~/.claude.json`, `~/.claude/settings.json`, `~/.codex/config.toml`, `~/.codex/auth.json` |
| What surprises people most? | Deleting `~/.claude/projects/<slug>/` also deletes that project's agent memory. |

Next: [07-glossary.md](07-glossary.md).
