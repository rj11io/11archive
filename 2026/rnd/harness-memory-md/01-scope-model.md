# The scope model: global, project, thread

- **Created:** 2026-08-11

Start with a concrete case. You prefer tabs. Your team uses spaces. Today you are debugging one flaky test and you told the agent to skip the linter this once. Three facts, three lifetimes:

- Tabs follow you between jobs. That is **global scope**.
- Spaces belong to the repository and every teammate. That is **project scope**.
- Skip the linter dies when the conversation ends. That is **thread scope**.

Every harness in this report implements those three lifetimes. What they disagree on is how the layers combine, who may write to each, and what happens to the third one when the conversation gets long.

## The three scopes, defined

### Global scope

Instructions attached to the person or the machine, applied to every project.

- Claude Code: `~/.claude/CLAUDE.md` and `~/.claude/rules/*.md`
- Codex: `~/.codex/AGENTS.md` (or `AGENTS.override.md`, which wins)
- Gemini CLI: `~/.gemini/GEMINI.md`
- Junie: `~/.junie/AGENTS.md`
- Cursor: User Rules, stored in settings rather than a file
- Windsurf: `global_rules.md`, capped at 6,000 characters

Above global there is sometimes a fourth layer nobody chose: **managed policy**. Claude Code reads an organisation-wide file from a system path, for example `/Library/Application Support/ClaudeCode/CLAUDE.md` on macOS, and that file "cannot be excluded by individual settings" ([docs](https://code.claude.com/docs/en/memory)). Cursor's Team Rules play the same role from a dashboard and take precedence over both project and user rules ([docs](https://cursor.com/docs/context/rules)). If you are writing policy for a company, this layer is the only one an engineer cannot switch off.

### Project scope

Instructions that live in the repository and travel with it through version control. This is the layer `AGENTS.md` standardised.

Two sub-layers matter:

1. **Repository root.** One file, everyone gets it, always loaded.
2. **Subdirectory.** A file deeper in the tree that applies to part of the codebase. The OpenAI monorepo runs 88 of them ([agents.md](https://agents.md/)).

Project scope also has a private twin: a personal file inside the project that you do not commit. Claude Code uses `CLAUDE.local.md` and tells you to gitignore it. Windsurf's Cascade memories are per-workspace but stored in your home directory and never committed ([docs](https://docs.devin.ai/desktop/cascade/memories)).

### Thread scope

State that exists only inside the current conversation: what you said, what the agent read, what it decided. Nothing here is a file, which is exactly why it is fragile. [03-thread-continuity.md](03-thread-continuity.md) covers it in full.

A useful analogy: global and project scope are the notice board, thread scope is the conversation happening in front of it. Compaction is someone erasing most of the conversation and leaving a sticky note that says "we discussed the API, it went fine."

## The two rival resolution rules

This is the single most consequential difference between harnesses.

### Rule A: concatenate everything

The harness collects every file it finds along the path and puts all of them in context, in order. Nothing is removed. Conflicts are handed to the model.

Claude Code, in its own words: "All discovered files are concatenated into context rather than overriding each other. Across the directory tree, content is ordered from the filesystem root down to your working directory" ([docs](https://code.claude.com/docs/en/memory)). Within one directory, `CLAUDE.local.md` is appended after `CLAUDE.md`, so the personal note is the last thing read at that level.

Gemini CLI does the same across three tiers: global home file, then workspace files and their parents, then a just-in-time scan when a tool touches a directory ([docs](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/gemini-md.md)).

Junie combines global and project guidelines, "marks them clearly," removes duplicates automatically, and resolves conflicts in favour of project level ([docs](https://junie.jetbrains.com/docs/guidelines-and-memory.html)). That is concatenation with an explicit tie-break, which is the better version of this design.

### Rule B: nearest file wins

The harness picks one file per level and lets the closest one override what came before.

The `AGENTS.md` specification says it plainly: "the closest AGENTS.md to the edited file wins; explicit user chat prompts override everything" ([agents.md](https://agents.md/)).

Codex implements a strict version. At each directory it checks `AGENTS.override.md`, then `AGENTS.md`, then any configured fallback filename, and "includes at most one file per directory." It concatenates root-down, and later files override earlier guidance. The walk stops at your current working directory, so files deeper in the tree are never read ([docs](https://learn.chatgpt.com/docs/agent-configuration/agents-md)).

Cursor states an explicit precedence chain: Team Rules, then Project Rules, then User Rules, with earlier sources winning conflicts ([docs](https://cursor.com/docs/context/rules)).

### Why the difference bites

Under Rule A, a contradiction is not resolved, it is deferred. Both statements sit in the prompt, and which one the model follows depends on wording, position, and luck. Claude's documentation admits this: "If two files give different guidance for the same behavior, Claude may pick one arbitrarily."

Under Rule B, a contradiction is resolved, but silently, and possibly not the way you meant. A root rule you consider non-negotiable disappears the moment a subdirectory file mentions the same topic.

Neither is wrong. The mistake is writing files as if your harness used the other rule.

**Practical test:** put a deliberately absurd rule in the parent file ("always name test files `zzz_*.ts`") and a contradicting one in the child. Ask the agent which applies. You will learn your harness's real behaviour in one minute.

## Three loading strategies, not two

Scope answers "whose rule is it." Loading answers "when does it cost tokens." Harnesses now use three strategies, and the newer ones matter more than the scope debate.

### Eager: always in context

The file loads at session start, every session, whatever the task. Claude Code loads ancestor `CLAUDE.md` files "in full at launch." Codex builds its instruction blob before the first turn. This is simple and it is the only strategy where you can be confident the text was seen.

Cost: constant. A 200-line file is roughly 2,000 tokens on every single request for the life of the session.

### Conditional: loads when a matching file is touched

The rule carries a glob pattern and enters context only when the agent reads a file that matches.

- Claude Code `.claude/rules/*.md` with `paths:` frontmatter. Rules without `paths` load unconditionally. Path-scoped rules "trigger when Claude reads files matching the pattern, not on every tool use" ([docs](https://code.claude.com/docs/en/memory)).
- Copilot `*.instructions.md` with `applyTo:` glob frontmatter ([GitHub docs](https://docs.github.com/copilot/customizing-copilot/adding-custom-instructions-for-github-copilot)).
- Cursor `.mdc` rules with `globs:` frontmatter.
- Windsurf rules in `glob` activation mode.
- Kiro steering files with `inclusion: fileMatch`.

Cost: zero until it fires. This is the highest-leverage change most teams can make to a bloated instruction file.

### Deferred: loads when the model decides it is relevant

Only a name and a one-line description sit in context. The body loads if the agent judges it useful.

- Claude Code skills, and rules that live in skills rather than `.claude/rules/`
- Cursor "Apply Intelligently" rules, selected on the `description` field
- Windsurf `model_decision` rules
- Kiro `inclusion: auto` steering
- OpenHands knowledge microagents, triggered by keywords in the conversation ([docs](https://docs.openhands.dev/overview/skills))
- Devin knowledge items, each with a "trigger description" used as a semantic cue, not a keyword match ([docs](https://docs.devin.ai/onboard-devin/knowledge-onboarding))

Cost: about 30 to 80 tokens per item at rest ([progressive disclosure analysis](https://www.newsletter.swirlai.com/p/agent-skills-progressive-disclosure)). Anthropic frames this as treating the context window as a public good.

Risk: the agent has to choose correctly. A deferred rule that never triggers is a rule that does not exist. Write descriptions that name the situation, not the topic. "Use when editing database migrations" beats "database conventions."

## Where each scope is allowed to be written

| Scope | Human writes | Agent writes | Committed to git | Survives machine change |
|---|---|---|---|---|
| Managed policy | Admin, via MDM or dashboard | No | Usually not | Yes, via device management |
| Global | Yes | Sometimes (Gemini CLI `/memory add`) | No | Only if you sync dotfiles |
| Project, shared | Yes | Yes, on request | Yes | Yes |
| Project, private | Yes | Yes | No, gitignored | No |
| Agent auto-memory | Yes, by editing | Yes, unprompted | No, outside the repo | No |
| Thread | Yes, by talking | Yes | No | No |

Two rows deserve attention.

**Agent auto-memory is not in your repository.** Claude Code stores it under `~/.claude/projects/<project>/memory/`, keyed on the git repository so every worktree shares one directory, and states plainly that files "are not shared across machines or cloud environments" ([docs](https://code.claude.com/docs/en/memory)). Windsurf memories live in `~/.codeium/windsurf/memories/` and are "not committed to your repository." A teammate gets none of it. A fresh CI container gets none of it.

**Thread state is the only scope with no file**, which is why every harness eventually grew a way to dump it to one: `/handoff` in Amp, progress files in the Anthropic long-running-agent pattern, `activeContext.md` in Cline.

## A note on subagents

Delegating to a subagent creates a new thread with a new context window, so the scope question repeats one level down. Claude Code documents the answer precisely: a subagent receives the full `CLAUDE.md` hierarchy including user, project, local, and managed files, but it does **not** receive the main conversation's auto memory. Built-in Explore and Plan agents skip `CLAUDE.md` entirely to stay cheap. A subagent can be given its own persistent memory with a `memory: user | project | local` field, stored at `~/.claude/agent-memory/<name>/`, `.claude/agent-memory/<name>/`, or `.claude/agent-memory-local/<name>/` ([subagent docs](https://code.claude.com/docs/en/sub-agents)).

The practical consequence: a rule you rely on may not reach the worker that does the job. Anthropic's own guidance is to restate it in the delegation prompt, giving the example "ignore the `vendor/` directory."
