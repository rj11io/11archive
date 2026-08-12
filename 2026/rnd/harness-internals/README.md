# Harness Internals: the home directory you never look at

What a modern AI coding harness writes to your disk, where it puts it, and which
of those files you were never told about.

A "harness" is the program that wraps a language model and lets it act: it reads
your files, runs your commands, and keeps the conversation going. Claude Code and
OpenAI Codex CLI are both harnesses. This report opens them up.

## The short version

Two harnesses on one working laptop had written **4.0 GB** into their home
directories. The published documentation accounts for roughly a dozen of those
files. The rest is machine-written state that no menu shows you: full
conversation transcripts, copies of your files from before you edited them,
snapshots of your shell, a 395 MB debug database, cached experiment flags, and
839 MB of abandoned git worktrees that normal cleanup commands cannot reach.

None of it is hidden on purpose. All of it is invisible in practice.

## Read in this order

| File | What it covers |
| --- | --- |
| [00-executive-brief.md](00-executive-brief.md) | The findings, the numbers, and what to do. Start here. |
| [01-harness-anatomy.md](01-harness-anatomy.md) | What a harness actually is, and why it must write to disk at all. |
| [02-home-directory-map.md](02-home-directory-map.md) | Complete map of `~/.claude` and `~/.codex`, entry by entry. |
| [03-invisible-files-catalog.md](03-invisible-files-catalog.md) | The catalog: every file class, what it holds, who wrote it, how long it stays. |
| [04-privacy-and-security.md](04-privacy-and-security.md) | Secrets in transcripts, credential storage, hooks as an attack path, telemetry. |
| [05-disk-growth-and-retention.md](05-disk-growth-and-retention.md) | Measured growth, retention rules, and what is safe to delete. |
| [06-operator-playbook.md](06-operator-playbook.md) | Settings, commands, and checks. The actionable chapter. |
| [07-glossary.md](07-glossary.md) | Every term used here, in plain words. |
| [08-methodology-and-sources.md](08-methodology-and-sources.md) | How this was measured, what is uncertain, and every source. |

`data.json` holds the measurements in machine-readable form.
`report.html` is the self-contained interactive version.

## How to read the evidence labels

Every claim in this report carries one of three labels:

- **MEASURED** means it was read off a real machine on 2026-08-11. Numbers are
  from that one machine and will differ on yours.
- **DOCUMENTED** means a vendor's own documentation says so.
- **REPORTED** means a third party published it. Treated as weaker.

## Scope and honesty

One machine, macOS 24.3, heavy daily use of both tools. One sample is enough to
prove a file class exists. It is not enough to prove your machine looks the same.
Chapter 8 lists exactly what that limits.

Paths are shown as `~` or `<project>`. No credentials, tokens, account
identifiers, or file contents from the sampled machine appear anywhere in this
report.
