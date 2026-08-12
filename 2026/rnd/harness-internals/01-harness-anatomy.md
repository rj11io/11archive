# What a harness is, and why it writes to your disk

## Start with the problem

A language model has no memory and no hands. Ask it a question, it answers, and
it forgets. It cannot open a file or run a test.

A **harness** is the program that fixes both. It holds the conversation, gives
the model tools, and runs the tools when the model asks. Claude Code and Codex
CLI are harnesses. So are Cursor's agent and Gemini CLI.

Think of it like a chef and a kitchen porter. The model is the chef: it decides
what to do next. The harness is the porter: it fetches ingredients, carries
dishes, and keeps a written record of every order. The chef never touches the
storeroom directly.

Everything in this report follows from what the porter has to write down.

## The loop

Every harness runs the same loop:

1. **Assemble.** Build the message list to send: system instructions, your
   project's `CLAUDE.md` or `AGENTS.md`, the conversation so far, tool
   definitions.
2. **Call.** Send it to the model. Stream the reply back token by token.
3. **Act.** If the model asked for a tool, run it. Read the file, run the
   command, search the web.
4. **Feed back.** Put the tool's output into the conversation as a new message.
5. **Repeat** until the model stops asking for tools.

Steps 1 and 4 are where the disk usage comes from. To assemble step 1 next turn,
the harness must have kept everything from step 4 this turn.

## Five jobs that force a write

### Job 1: survive a crash

If your terminal dies mid-task, the work should not vanish. So the harness writes
the conversation to disk **as it happens**, not at the end.

MEASURED: both tools use JSONL, which is one JSON object per line. Appending a
line is a single atomic write, so a crash costs you at most the last line. This
is a good design choice. It is also why the file only ever grows.

Codex calls these files **rollouts**. Claude Code calls them **transcripts**.
Same idea.

### Job 2: know which conversation belongs to which folder

You run the agent in many projects. Resuming should give you the right history.

Both tools solve this by keying storage on the working directory.

Claude Code turns the path into a folder name by replacing every `/` with `-`:

```
~/Desktop/work/api   ->   ~/.claude/projects/-Users-you-Desktop-work-api/
```

Codex keeps a SQLite database (`state_5.sqlite`) with a `threads` table, and
stores `cwd` as a column.

MEASURED consequence: neither approach survives you moving a repository. The old
folder or row stays behind pointing at a path that no longer exists. On the
sampled machine both tools held entries for a directory that had been renamed
months earlier.

### Job 3: undo

If the agent edits a file badly, you want the old version back.

MEASURED: Claude Code writes a copy of each file *before* editing it into
`~/.claude/file-history/<session-id>/<content-hash>@v<n>`. The `@v3` suffix means
this is the third saved version of that file in that session.

This is a shadow copy of your source code, outside your repository, not covered
by your `.gitignore`.

### Job 4: run commands the way you would

When the agent runs `npm test`, that should work even though `npm` is only on
your `PATH` because of something in your `.zshrc`.

MEASURED: Claude Code solves this by capturing your shell once per session into
`~/.claude/shell-snapshots/snapshot-zsh-<timestamp>-<random>.sh`, then sourcing
that file before each command. A sampled snapshot was 4,501 lines and contained
127 shell functions, 4 aliases, and the `PATH` export.

Worth being precise, because this is often overstated: the snapshot captured
functions, aliases, shell options, and `PATH`. It did **not** dump the full
environment. Only one `export` line was present. So a snapshot is not
automatically a secret leak, though a function body could contain one if yours do.

### Job 5: do not ask the same question twice

Whether you trust a folder, which tools you allowed, which model you picked: all
of that should stick.

MEASURED: Claude Code puts this in `~/.claude.json`. Codex puts trust in
`~/.codex/config.toml` under `[projects."<path>"]`. Both accumulate one entry per
directory, permanently.

## Where the two tools diverge

Same five jobs, two very different engineering cultures.

| | Claude Code | Codex CLI |
| --- | --- | --- |
| Written in | TypeScript on Node | Rust |
| Conversation store | one JSONL per session in a per-project folder | one JSONL per session in a date tree, indexed by SQLite |
| Structured state | one large JSON file (`~/.claude.json`) | four SQLite databases |
| Debug logs | not kept by default | 395 MB SQLite database |
| Credentials | macOS Keychain | `auth.json`, plain JSON, `0600` |
| Transcript retention | 30 days by default | indefinite |
| Background work | none observed | job queue distilling sessions into memories |

The Rust side reaches for databases and background workers. The Node side reaches
for files and folders. Neither is wrong. They fail differently, which
[05-disk-growth-and-retention.md](05-disk-growth-and-retention.md) covers.

## The layering rule

Both tools read settings from several places and merge them. Closest to the code
wins.

Claude Code, weakest to strongest:

```
managed policy  <  ~/.claude/settings.json  <  <project>/.claude/settings.json
                <  <project>/.claude/settings.local.json  <  command-line flags
```

Codex, weakest to strongest:

```
~/.codex/config.toml  <  <project>/.codex/config.toml  <  --config flags
```

DOCUMENTED, and important: Codex only reads a project's `config.toml` if you have
marked that project as trusted, and some keys cannot be set from a project at all.
Provider, authentication, notification, and telemetry settings must live in your
user config ([Codex configuration
reference](https://learn.chatgpt.com/docs/config-file/config-reference)).

That restriction exists for a good reason. Without it, cloning a repository would
let its author redirect your telemetry or change your model provider. Claude
Code's equivalent protection is the trust dialog you see the first time you open
a folder, recorded as `hasTrustDialogAccepted` in `~/.claude.json`.

## The idea to carry forward

Nothing above is a hidden feature. Every write serves an obvious purpose: crash
recovery, resume, undo, correct command execution, remembered preferences.

The problem is not that these files exist. It is that they persist far longer
than the task that created them, they contain far more than the task needed, and
no part of the interface ever mentions them.

Next: [02-home-directory-map.md](02-home-directory-map.md) walks both directories
entry by entry.
