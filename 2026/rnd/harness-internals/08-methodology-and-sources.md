# Methodology and sources

## What was done

Two strands, kept separate on purpose.

**Strand 1: direct measurement.** Read the actual files on one working machine.
This produced every number in this report.

**Strand 2: documentation review.** Read what the vendors publish, plus issue
trackers and security research. This established what is intended, what is
documented, and what others have found.

Where the two disagree, the report says so. Measurement beats documentation for
"what is on disk". Documentation beats measurement for "what is meant to happen".

## The measured system

| | |
| --- | --- |
| Date | 2026-08-11 |
| Operating system | macOS, Darwin 24.3.0, Apple silicon |
| Machines | one |
| Claude Code use | heavy daily, 40 project directories, 207 transcripts |
| Codex CLI use | heavy daily, 455 threads, 453 rollouts, back to 2026-02-19 |

## How each number was produced

Every figure is reproducible. The commands:

```bash
# totals and breakdown
du -sh ~/.claude ~/.codex
du -sk ~/.claude/* ~/.codex/* | sort -rn

# transcript counts and sizes
find ~/.claude/projects -name '*.jsonl' | wc -l
find ~/.codex/sessions  -name '*.jsonl' | wc -l
find ~/.codex/sessions -name '*.jsonl' -exec ls -la {} + | sort -k5 -rn | head

# retention span
find ~/.codex/sessions -name '*.jsonl' \
  | sed 's|.*/rollout-\([0-9-]*\)T.*|\1|' | sort | head -1

# database schemas and row counts
sqlite3 ~/.codex/state_5.sqlite    '.schema'
sqlite3 ~/.codex/logs_2.sqlite     'SELECT COUNT(*) FROM logs;'
sqlite3 ~/.codex/logs_2.sqlite     'PRAGMA page_count; PRAGMA freelist_count; PRAGMA page_size;'

# transcript record structure (types and field names only, never contents)
python3 -c "import json,collections; ..."

# empty directory count
find ~/.claude/session-env -mindepth 1 -maxdepth 1 -type d -empty | wc -l

# orphaned worktree check
git -C ~/.codex/worktrees/<hash>/<project> status
```

## Handling of personal data

The measured machine belongs to the report's commissioner, who asked for this
inspection. Even so, the report was written to be publishable:

- **Structure was recorded, contents were not.** Schemas, field names, record
  type counts, file sizes, and permissions. No message text, no file contents, no
  command output from any transcript.
- **Credential files were never printed.** `auth.json` was examined by replacing
  every value with its type and length. No token, no fragment of a token, and no
  account identifier appears anywhere.
- **Paths are generalised.** Real paths became `~`, `<project>`, or `<slug>`.
- **A keychain dump was attempted and correctly refused** by a safety check. The
  report cites documentation for credential storage instead, plus a narrow
  existence check that confirmed the item is present without reading it.

## Limits, stated plainly

Read these before quoting any number.

**One machine.** Every measurement is a single sample. It proves a file class
exists and shows one plausible size. It does not establish a typical size. Your
`~/.codex` will not be 3.68 GB.

**One operating system.** macOS only. Linux and Windows differ in at least one
known way: credential storage. On macOS, Claude Code uses the Keychain. On Linux
it uses a file. That difference alone changes the risk picture in
[04-privacy-and-security.md](04-privacy-and-security.md).

**One point in time.** Both tools ship frequently. Codex's `state_5.sqlite`
carries 46 schema migrations, and the `5` in the filename is itself a version
number, so earlier `state_1` through `state_4` layouts existed. Directory
contents will drift.

**Heavy usage skews the sizes.** These directories are large partly because the
tools were used hard. A casual user's numbers will be much smaller. The
*proportions* are likely more transferable than the absolutes.

**Undocumented does not mean secret.** The report counts entries the
documentation does not mention. That is a claim about documentation coverage, not
about intent. Every file examined had an obvious engineering purpose.

**No network capture was done.** Claims about what is transmitted come from
documentation and from the shape of locally queued telemetry, not from watching
traffic. A packet capture would strengthen chapter 4 and is the obvious next step.

**Codex is closed at the edges.** Some directories were identified only by name
and size, such as `pets/` and `visualizations/`. They were empty or nearly empty
on the sampled machine, and no documentation describes them.

## What would improve this

In order of value:

1. Sample 20 to 50 machines to turn single measurements into distributions.
2. Capture network traffic to verify what actually leaves the machine.
3. Repeat on Linux and Windows.
4. Track the same machine over 90 days to measure real growth rather than
   inferring a daily rate.
5. Extend to Cursor, Gemini CLI, and Amp, where partial evidence exists but no
   measurement was taken.

---

## Sources

### Official documentation

- [Explore the .claude directory](https://code.claude.com/docs/en/claude-directory). Anthropic. The documented file tree used as the baseline for coverage counts.
- [Claude Code environment variables](https://code.claude.com/docs/en/env-vars). Anthropic. `DISABLE_TELEMETRY`, `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC`.
- [Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference). OpenAI. `CODEX_HOME`, `history.persistence`, `sqlite_home`, `[otel]`, sandbox modes, project config restrictions.
- [Codex advanced configuration](https://learn.chatgpt.com/docs/config-file/config-advanced). OpenAI.
- [Codex CLI reference](https://developers.openai.com/codex/cli/reference). OpenAI.

### Issue trackers

- [cleanupPeriodDays: 0 silently disables all transcript persistence](https://github.com/anthropics/claude-code/issues/23710). The `0` trap.
- [DISABLE_TELEMETRY silently disables GrowthBook, which also gates remote killswitches](https://github.com/anthropics/claude-code/issues/58383). The telemetry trade-off.
- [DISABLE_TELEMETRY should document experiment-gate side effects](https://github.com/anthropics/claude-code/issues/47558). Same, from the documentation angle.
- [Claude Code exposes secrets from .env despite CLAUDE.md prohibitions](https://github.com/anthropics/claude-code/issues/44868). Evidence that `CLAUDE.md` is not a control.
- [Prevent .env / API-key leakage into Claude Code session transcripts](https://github.com/frederick-douglas-pearce/agentfluent/issues/72). Live keys found in `~/.claude/projects/`.
- [codex exec emits no OTel metrics](https://github.com/openai/codex/issues/12913). Telemetry coverage gaps.
- [Keeping Codex conversation history within the project directory](https://github.com/openai/codex/discussions/23680). Session storage discussion.

### Security research

- [ChainDrop: When Opening a Repository Becomes Execution](https://www.pillar.security/blog/chaindrop-when-opening-a-repository-becomes-execution). Pillar Security. The `SessionStart` hook attack.
- [Shai-Hulud strikes again: CHAINDROP worm hits 400+ npm packages](https://www.elastic.co/security-labs/shai-hulud-chaindrop-npm-supply-chain). Elastic Security Labs. Credential targeting, including agent tooling.
- [ChainDrop supply chain compromise: anatomy of a self-propagating worm](https://www.microsoft.com/en-us/security/blog/2026/08/04/chaindrop-supply-chain-compromise-anatomy-self-propagating-worm/). Microsoft.
- [ChainDrop: Inside a Self-Propagating npm Worm](https://unit42.paloaltonetworks.com/chaindrop-npm-worm-analysis/). Palo Alto Unit 42.
- [ChainDrop npm Worm: Bun-loaded CI/CD credential harvester](https://www.stepsecurity.io/blog/chaindrop-npm-worm). StepSecurity, first report.
- [Claude Code and Gemini CLI Flaws Let a GitHub Issue Reach CI Workflow Secrets](https://thehackernews.com/2026/08/claude-code-and-gemini-cli-flaws-let.html). The Hacker News.
- [Anthropic confirms it leaked 512,000 lines of Claude Code source code](https://www.techradar.com/pro/security/anthropic-confirms-it-leaked-512-000-lines-of-claude-code-source-code-spilling-some-of-its-biggest-secrets). TechRadar. Also covered by [InfoQ](https://infoq.com/news/2026/04/claude-code-source-leak) and [Layer5](https://layer5.io/blog/engineering/the-claude-code-source-leak-512000-lines-a-missing-npmignore-and-the-fastest-growing-repo-in-github-history/).

### Observability and operations

- [OpenAI Codex Observability & Monitoring with OpenTelemetry](https://signoz.io/docs/codex-monitoring/). SigNoz. Note that tool results are exported even when prompt logging is off.
- [Codex CLI Observability: OpenTelemetry Traces, Metrics, and Production Monitoring](https://codex.danielvaughan.com/2026/04/20/codex-cli-observability-opentelemetry-traces-metrics-production-monitoring/)
- [Where the Codex CLI stores its cache, and how to clear it safely](https://tokki.sh/clean/codex-cli-cache)
- [Codex CLI Config Location: ~/.codex Paths](https://inventivehq.com/knowledge-base/openai/where-configuration-files-are-stored). Inventive HQ.

### Community analysis

- [How Claude Code Manages Local Storage for AI Agents](https://milvus.io/blog/why-claude-code-feels-so-stable-a-developers-deep-dive-into-its-local-storage-design.md). Milvus.
- [Claude Code is quietly eating your disk](https://bestagent.dev/claude-code-disk-usage-cleanup/). bestagent.dev.
- [Claude Code deletes your old session logs after 30 days by default](https://brycewatson.com/blog/28-claude-code-deletes-old-logs/). Bryce Watson.
- [Storage location and retention period of Claude Code conversation history](https://dev.classmethod.jp/en/articles/claude-code-conversation-history-retention/). DevelopersIO.
- [The Claude Code folder that keeps everything you type, in plain text](https://wmedia.es/en/tips/claude-code-conversations-plaintext-on-disk). wmedia.es.
- [Configuring Claude Code for Privacy and Noise Control](https://www.vincentschmalbach.com/configuring-claude-code-for-privacy-and-noise-control/). Vincent Schmalbach.
- [Claude Code environment variables full list](https://gist.github.com/jedisct1/9627644cda1c3929affe9b1ce8eaf714). Community gist. Unofficial, treated as weakest.

Every claim marked REPORTED rests on a source above. Every claim marked MEASURED
rests on a command in this chapter. Claims marked DOCUMENTED cite a vendor page.
