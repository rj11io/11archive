# Privacy and security

Five risks, ordered by how likely you are to hit them. Each has the mechanism,
the evidence, and the fix.

---

## Risk 1: `.gitignore` does not stop secrets reaching disk

**Likelihood: near certain if you use these tools on a real project.**

### The mechanism

`.gitignore` controls one thing: what git commits. It has no effect on what the
agent reads, and no effect on what the harness writes.

So the chain is:

```
1. .env is in .gitignore                    (you are protected from committing it)
2. agent runs `grep -rn "API_KEY" .`        (a reasonable thing to do)
3. grep output includes the .env line       (grep does not read .gitignore)
4. output lands in the transcript           (toolUseResult field)
5. transcript is plain text in your home    (for 30 days, or forever on Codex)
```

Nothing in that chain is a bug. Each step does its job. The composition is what
fails.

### The evidence

REPORTED: two live Anthropic API keys were found in session JSONL files under
`~/.claude/projects/`
([agentfluent issue #72](https://github.com/frederick-douglas-pearce/agentfluent/issues/72)).

REPORTED: Claude Code has been observed reading and echoing `.env` and
`.dev.vars` contents into the transcript even when `CLAUDE.md` explicitly told it
not to ([claude-code issue
#44868](https://github.com/anthropics/claude-code/issues/44868)).

That second one is the important one. **Instructions in `CLAUDE.md` are not a
security control.** They are a request to a model that may or may not comply.
Treat them as a preference, never as a boundary.

### The fix

Order matters here. Do the first one.

1. **Do not keep real secrets in files the agent can reach.** Use a secret
   manager, or your shell environment, or a `direnv` setup that keeps values out
   of files under the repository root.
2. **Deny-list the paths** in `.claude/settings.json` permissions so the Read
   tool refuses them. This is a real control, unlike a `CLAUDE.md` note, but it
   only covers the tools it names. `grep` through Bash can still reach the file.
3. **Rotate anything the agent has already seen.** If a key was ever in a
   transcript, treat it as exposed.
4. **Search your own transcripts** for what is already there:

```bash
rg -l 'sk-ant-|sk-proj-|AKIA[0-9A-Z]{16}|ghp_' ~/.claude/projects ~/.codex/sessions
```

If that returns anything, rotate those credentials and delete those files.

---

## Risk 2: a cloned repository can run code when you start a session

**Likelihood: low per repository, severe when it happens.**

### The mechanism

A project's `.claude/settings.json` can define hooks. A hook is a shell command
the harness runs by itself at a given event. `SessionStart` fires when you open
the project.

So a file committed to a repository can cause command execution on your machine
at the moment you point an agent at it. You never typed anything.

### The evidence

REPORTED, and this is a real campaign, not a proof of concept. The ChainDrop
worm compromised over 400 npm packages and planted a `SessionStart` hook in
`.claude/settings.json` in repositories it reached, running `node .claude/setup.mjs`
on session start
([Pillar Security](https://www.pillar.security/blog/chaindrop-when-opening-a-repository-becomes-execution),
[Microsoft Security
Blog](https://www.microsoft.com/en-us/security/blog/2026/08/04/chaindrop-supply-chain-compromise-anatomy-self-propagating-worm/),
[Unit 42](https://unit42.paloaltonetworks.com/chaindrop-npm-worm-analysis/)).

It paired that with a VS Code `folderOpen` task, covering three moments: opening
the folder, starting the agent, and installing the package.

Its targets included credentials for Anthropic, Claude, Codex, Cursor, OpenAI,
and Gemini, alongside AWS, GCP, Azure, GitHub tokens, Vault tokens, SSH keys, and
Kubernetes service account tokens
([Elastic Security Labs](https://www.elastic.co/security-labs/shai-hulud-chaindrop-npm-supply-chain)).

### The fix

```bash
# before opening any unfamiliar repo with an agent
cat .claude/settings.json .claude/settings.local.json 2>/dev/null
ls -la .claude/ .codex/ .vscode/ 2>/dev/null
```

Look for `hooks`, and for any `command` value. If you find one you did not
expect, do not start a session in that directory.

Codex has a structural defence here that Claude Code does not: DOCUMENTED, it
only reads a project's `config.toml` once you trust the project, and it refuses
project-level overrides for provider, authentication, notification, and telemetry
settings entirely ([Codex configuration
reference](https://learn.chatgpt.com/docs/config-file/config-reference)). That is
a good design and worth knowing about.

---

## Risk 3: agent state gets committed to a shared repository

**Likelihood: moderate, and usually nobody notices.**

### The mechanism

Project-level `.claude/` holds both things you want to share (skills, project
instructions) and things you do not (`settings.local.json`, session scratch).
By default nothing separates them.

MEASURED: across 12 repositories on the sampled machine, **no `.gitignore`
mentioned `.claude` at all**.

### The fix

Add to your global gitignore, which covers every repository at once:

```bash
git config --global core.excludesfile ~/.gitignore_global
cat >> ~/.gitignore_global <<'EOF'
.claude/settings.local.json
.claude/session-env/
.codex/config.toml
EOF
```

Keep `.claude/skills/`, `.claude/rules/`, and `CLAUDE.md` committed. Those are
the parts your team should share.

Then check what you may already have pushed:

```bash
git log --all --oneline -- '.claude/**' '.codex/**' | head
```

---

## Risk 4: your directory layout is a permanent, readable list

**Likelihood: certain. Impact depends entirely on your work.**

### The mechanism

Both tools keep a permanent record of every directory you have worked in, because
both need it to resume sessions and remember trust decisions.

MEASURED:

- `~/.codex/config.toml` holds a `[projects."<absolute path>"]` block per trusted
  directory, in plain text
- `~/.claude.json` holds 43 project entries keyed by absolute path
- `~/.claude/projects/` encodes each path directly into a folder name
- `~/.codex/state_5.sqlite` stores `cwd` and `git_origin_url` for 455 threads

None of these are pruned when you finish a project or when the directory stops
existing. On the sampled machine, both tools still listed a repository that had
been moved months earlier.

### Why it matters

For most people this is harmless. For some it is not:

- A consultant's trust list is a client list.
- Directory names often carry unreleased product names or acquisition code names.
- `git_origin_url` exposes private repository URLs, including any host that
  identifies an employer.

### The fix

There is no supported prune command for either tool. Editing is manual:

```bash
# review before deciding anything
grep '^\[projects' ~/.codex/config.toml
ls ~/.claude/projects/
```

Remove stale blocks from `config.toml` with an editor. Delete stale folders under
`~/.claude/projects/`. Back both up first: deleting a project folder deletes its
transcripts and its agent memory with it.

---

## Risk 5: telemetry, and the trap in switching it off

**Likelihood: certain. Impact: mostly low.**

### What is actually collected

MEASURED, from the queued events on disk: platform, Node version, terminal,
package managers, runtimes, whether it is running in continuous integration,
model name, session id, entry point, and version. Operational metadata. No prompt
text in the sample.

DOCUMENTED, for Codex: `otel.log_user_prompt` defaults to off, so prompt text is
not exported by default. But tool results **are** exported, and tool results
contain file contents ([SigNoz](https://signoz.io/docs/codex-monitoring/)).
`otel.metrics_exporter` defaults to `statsig`.

### The trap

DOCUMENTED: `DISABLE_TELEMETRY=1` also stops Claude Code contacting the feature
flag service. Because remote kill switches ride on the same channel, you stop
receiving those too, and the tool falls back to built-in defaults
([claude-code issue #58383](https://github.com/anthropics/claude-code/issues/58383),
[claude-code issue #47558](https://github.com/anthropics/claude-code/issues/47558)).

`CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` goes further, disabling auto-updates,
error reporting, release notes, and availability checks as well.

So the honest framing is a trade, not a free win: less reporting out, less
protection in. Choose knowingly.

### The fix

```json
// ~/.claude/settings.json
{ "env": { "DISABLE_TELEMETRY": "1" } }
```

```toml
# ~/.codex/config.toml
[otel]
exporter = "none"
metrics_exporter = "none"
log_user_prompt = false
```

---

## What is not a risk

Worth saying, so the list above stays credible.

- **Shell snapshots are not an environment dump.** MEASURED: one 4,501-line
  snapshot contained 127 functions, 4 aliases, and exactly one `export`, for
  `PATH`. It captures shell definitions, not your environment variables. Unless
  your own shell functions contain secrets, this file is not the problem.
- **`0600` permissions are correctly applied.** Both tools set restrictive modes
  on their sensitive files. That part is done right.
- **Nothing observed was undisclosed data collection.** Every file examined had
  an obvious engineering purpose. The problem throughout is retention and
  visibility, not intent.

---

## For completeness: two published incidents

REPORTED, both from 2026, both since fixed. Included so the record is complete,
not because either is an ongoing risk.

- **CVE-2026-54316**: a Claude Code flaw that turned a public download counter
  into an exfiltration channel, leaking an API key one character at a time. Fixed
  in 2.1.163.
- **The npm source leak**: Claude Code 2.1.88 shipped with a source map,
  exposing roughly 512,000 lines of source
  ([InfoQ](https://infoq.com/news/2026/04/claude-code-source-leak)).

The lesson from both is the same as the lesson from this report. These are
ordinary programs with ordinary bugs. Give them the scrutiny you would give any
other program that reads all your files and runs commands as you.

Next: [05-disk-growth-and-retention.md](05-disk-growth-and-retention.md).
