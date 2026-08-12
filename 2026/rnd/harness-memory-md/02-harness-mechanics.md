# Harness mechanics, tool by tool

- **Created:** 2026-08-11
- **Confidence:** every path, cap, and command below comes from current vendor documentation or the vendor's public issue tracker. Items sourced only from secondary write-ups are marked `[secondary]`.

## Quick comparison

| Harness | Global file | Project file | Subdirectory files | Merge rule | Hard size cap | Agent writes memory |
|---|---|---|---|---|---|---|
| Claude Code | `~/.claude/CLAUDE.md`, `~/.claude/rules/` | `CLAUDE.md`, `.claude/CLAUDE.md`, `.claude/rules/` | Yes, on demand | Concatenate all | None on `CLAUDE.md`; 200 lines / 25KB on `MEMORY.md` | Yes, on by default |
| Codex | `~/.codex/AGENTS.md` | `AGENTS.md` from git root down | Only down to cwd | Nearest wins | 32 KiB combined | No |
| Gemini CLI | `~/.gemini/GEMINI.md` | `GEMINI.md` and parents | Yes, just-in-time | Concatenate all | Not documented | Yes, via `/memory add` |
| Cursor | User Rules (settings) | `.cursor/rules/*.mdc`, `AGENTS.md` | Yes, nested dirs | Team, then project, then user | 500 lines advised | Removed in 2.1.x `[secondary]` |
| GitHub Copilot | Personal instructions | `.github/copilot-instructions.md`, `AGENTS.md` | Yes, nested `AGENTS.md` | Additive | Not documented | No |
| Windsurf Cascade | `global_rules.md` | `.windsurf/rules/*.md`, `AGENTS.md` | Not documented | Additive | 6,000 / 12,000 chars | Yes, auto |
| Junie | `~/.junie/AGENTS.md` | `.junie/AGENTS.md`, `AGENTS.md` | Not documented | Both loaded, project wins | Not documented | Not documented |
| Amp | Not documented | `AGENTS.md` | Yes, hierarchical `[secondary]` | Nearest extends or overrides `[secondary]` | Not documented | No, uses threads |
| Cline | Not documented | `.clinerules/`, memory bank files | Not documented | All read at task start | Not documented | Yes, on command |
| OpenHands | Not documented | `.openhands/microagents/repo.md` | Not documented | Repo file plus triggered agents | Not documented | No |
| Devin | Knowledge base, pinned | Auto-imported from rule files | Not documented | Semantic trigger | Not documented | Yes, auto-suggested |
| Kiro | `~/.kiro/steering/` | `.kiro/steering/*.md` | Not documented | Project only, in CLI | Not documented | No |
| Amazon Q | Not documented | `.amazonq/rules/` | Not documented | Additive | Not documented | Yes, generated bank |
| Aider | Config file | `CONVENTIONS.md` | No | Loaded read-only | Not documented | No |
| Zed | `AGENTS.md` personal | `AGENTS.md` | Yes | Not documented | Not documented | No |

## Claude Code

Source: [How Claude remembers your project](https://code.claude.com/docs/en/memory), [Create custom subagents](https://code.claude.com/docs/en/sub-agents), [Explore the context window](https://code.claude.com/docs/en/context-window).

Claude Code runs two systems side by side. You write `CLAUDE.md`. Claude writes auto memory. Both load at the start of every conversation.

### File locations, broadest first

| Scope | Path | Shared with |
|---|---|---|
| Managed policy | macOS `/Library/Application Support/ClaudeCode/CLAUDE.md`, Linux and WSL `/etc/claude-code/CLAUDE.md`, Windows `C:\Program Files\ClaudeCode\CLAUDE.md` | Everyone on the machine |
| User | `~/.claude/CLAUDE.md`, `~/.claude/rules/*.md` | You, all projects |
| Project | `./CLAUDE.md` or `./.claude/CLAUDE.md`, `./.claude/rules/**/*.md` | Team, via git |
| Local | `./CLAUDE.local.md` | You, this project |

### Load order

1. Walk up from the working directory. Every `CLAUDE.md` and `CLAUDE.local.md` in an ancestor directory loads in full at launch.
2. Order is filesystem root down to the working directory, so the closest file is read last.
3. Within a directory, `CLAUDE.local.md` is appended after `CLAUDE.md`.
4. Files in subdirectories below the working directory are discovered but load on demand, when Claude reads a file in that directory.
5. Everything is concatenated. Nothing overrides anything.

Managed policy content can also be inlined in `managed-settings.json` under the `claudeMd` key. It loads before user and project files and is honoured only in managed or policy settings.

### Imports

`@path/to/file` pulls another file in at launch. Relative paths resolve against the file containing the import, not the working directory. Recursion is allowed up to four hops. Import parsing skips code spans and fenced blocks, so `` `@README` `` in backticks stays literal.

Imports that resolve outside the working directory trigger a one-time approval dialog, because a teammate could commit one. Imports in user-scope files load without a dialog.

Splitting a large file into imports helps organisation but not context cost: "imported files still load and enter the context window at launch."

### Rules directory

`.claude/rules/*.md`, discovered recursively, subdirectories allowed. YAML frontmatter with a `paths:` list scopes a rule to matching files:

```markdown
---
paths:
  - "src/api/**/*.ts"
  - "lib/**/*.{ts,tsx}"
---
# API rules
- All endpoints validate input.
```

Rules without `paths` load at launch with the same priority as `.claude/CLAUDE.md`. User rules in `~/.claude/rules/` load before project rules, giving project rules higher priority. Brace expansion in `paths` shares a budget of 1,000 expanded patterns and 4 MiB per rule. Symlinks are supported and circular symlinks are handled.

### Size and hygiene

- Target under 200 lines per `CLAUDE.md`. Files load in full regardless of length, "though shorter files produce better adherence."
- Block-level HTML comments are stripped before injection, so `<!-- notes for humans -->` costs no tokens.
- `claudeMdExcludes` takes glob patterns matched against absolute paths, configurable at any settings layer, arrays merge across layers. Managed policy files cannot be excluded.
- `/doctor` proposes trims for a checked-in `CLAUDE.md`, cutting what Claude can derive from the codebase and keeping pitfalls and rationale (v2.1.206 or later).

### Auto memory

- On by default. Toggle in `/memory`, or set `autoMemoryEnabled: false`, or `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1`.
- Directory: `~/.claude/projects/<project>/memory/`, keyed on the git repository, so all worktrees and subdirectories of one repo share it. Relocate with `autoMemoryDirectory`, which must be absolute or start with `~/`, and which requires the workspace trust dialog when set in project settings.
- `MEMORY.md` is an index. The first 200 lines or 25KB, whichever comes first, load at session start. Everything past that is dropped.
- Topic files such as `debugging.md` do not load at startup. Claude reads them on demand.
- Writing over the limit still succeeds but returns an error instructing Claude to rewrite the index. YAML frontmatter and block-level HTML comments are stripped before measuring (v2.1.211 or later).
- A `modified` ISO 8601 timestamp is written into frontmatter on each write, if the file already has frontmatter (v2.1.214 or later).
- Machine-local. Not shared across machines or cloud environments.

### Compatibility with other tools

Claude Code reads `CLAUDE.md`, not `AGENTS.md`. The documented bridge:

```markdown
@AGENTS.md

## Claude Code
Use plan mode for changes under `src/billing/`.
```

A symlink works when you need no Claude-specific content: `ln -s AGENTS.md CLAUDE.md`. On Windows, symlinks need Administrator or Developer Mode, so use the import.

`/init` reads Cursor rules (`.cursor/rules/`, `.cursorrules`) and Copilot rules (`.github/copilot-instructions.md`). With `CLAUDE_CODE_NEW_INIT=1` it also reads `AGENTS.md`, `.devin/rules/`, `.windsurf/rules/` or `.windsurfrules`, and `.clinerules`. `/import` copies another agent's configuration in, including MCP servers, commands, subagents, and skills (v2.1.213 or later).

### Diagnostics

- `/context` lists the memory files that actually loaded. This is the ground truth, not the docs.
- `/memory` lists file locations, toggles auto memory, opens the memory folder.
- The `InstructionsLoaded` hook logs which instruction files load, when, and why.

## OpenAI Codex

Source: [Custom instructions with AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md).

Discovery runs in two stages.

**Global.** Look in the Codex home directory, default `~/.codex`, overridable with `CODEX_HOME`. Read `AGENTS.override.md` if present, otherwise `AGENTS.md`. Only the first non-empty file at this level is used.

**Project.** Start at the git root and walk down to the current working directory. In each directory check `AGENTS.override.md`, then `AGENTS.md`, then any name in `project_doc_fallback_filenames`. At most one file per directory.

Merge: concatenate root-down, joined with blank lines. Later files, meaning those closer to the working directory, override earlier guidance.

Caps and behaviour:

- `project_doc_max_bytes`, default 32 KiB, stops the combined instruction blob from growing further.
- Empty files are skipped.
- The walk stops at the current directory. Files deeper in the tree are never read, so run Codex from the directory whose rules you want.
- `AGENTS.override.md` is the intended tool for a temporary change without editing the base file.

## Gemini CLI

Source: [Provide context with GEMINI.md files](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/gemini-md.md).

Three tiers, concatenated and sent with every prompt:

1. Global: `~/.gemini/GEMINI.md`.
2. Workspace: `GEMINI.md` in configured workspace directories and their parents.
3. Just-in-time: when a tool touches a file or directory, the CLI scans that location and its ancestors up to a trusted root.

The filename is configurable, which makes Gemini CLI the easiest harness to point at a shared file:

```json
{ "context": { "fileName": ["AGENTS.md", "CONTEXT.md", "GEMINI.md"] } }
```

Imports use `@file.md` with relative or absolute paths. Commands: `/memory show` prints the exact concatenated context, `/memory reload` re-scans, `/memory add <text>` appends to the global `~/.gemini/GEMINI.md`.

`/memory show` is the most useful debugging command in any harness surveyed, because it prints the literal text the model receives.

## Cursor

Source: [Rules](https://cursor.com/docs/context/rules).

Four activation modes, set in `.mdc` frontmatter:

| Mode | Frontmatter | Fires when |
|---|---|---|
| Always Apply | `alwaysApply: true` | Every chat |
| Apply Intelligently | `description: ...` | Agent judges it relevant |
| Apply to Specific Files | `globs: ...` | A matching file is in play |
| Apply Manually | neither | You type `@rule-name` |

Storage: `.cursor/rules/` in the project, version controlled, nested directories supported. User Rules are global and live in settings, chat only. Team Rules come from the dashboard on Team and Enterprise plans.

Precedence: Team Rules, then Project Rules, then User Rules. Earlier sources win conflicts.

`AGENTS.md` is supported as a plain-markdown alternative in the root or subdirectories, with no metadata required. Guidance is to keep a rule under 500 lines and split larger guidance into composable rules, and to reference files rather than copying code so rules do not go stale.

The Memories feature that stored conversation facts at project level was introduced in mid-2025 and removed from version 2.1.x, with users advised to export and convert to Rules `[secondary, see 08-methodology-and-sources.md]`.

## GitHub Copilot

Source: [Adding repository custom instructions](https://docs.github.com/copilot/customizing-copilot/adding-custom-instructions-for-github-copilot), [agent-specific instructions changelog](https://github.blog/changelog/2025-11-12-copilot-code-review-and-coding-agent-now-support-agent-specific-instructions/).

Three file types:

1. `.github/copilot-instructions.md`, repository-wide.
2. `.github/instructions/**.instructions.md`, path-scoped through `applyTo` frontmatter, for example `applyTo: "app/models/**/*.rb"`.
3. `AGENTS.md` at the root, plus nested `AGENTS.md` for parts of the project.

The coding agent also reads `CLAUDE.md` and `GEMINI.md`, which makes Copilot the most permissive reader in the set. On github.com, path-specific instructions currently apply only to the cloud agent and to code review.

## Windsurf Cascade

Source: [Cascade memories](https://docs.devin.ai/desktop/cascade/memories). Note that the Windsurf documentation domain now redirects to `docs.devin.ai`, following Cognition's acquisition.

Two mechanisms, deliberately separated:

**Rules.** Durable, explicit, version controlled, team-shareable. Four activation modes: `always_on`, `model_decision`, `glob`, `manual` (`@rule-name`). Files live in `.windsurf/rules/`. Global rules go in `global_rules.md`.

**Memories.** Auto-generated by Cascade when it encounters useful context, or created on request ("create a memory of..."). Stored in `~/.codeium/windsurf/memories/`. Scoped to one workspace: "Memories generated in one workspace are not available in another, and they are not committed to your repository." Cascade retrieves them when it judges them relevant.

Hard caps: 6,000 characters for the global rules file, 12,000 characters per workspace rule file. These are the tightest documented budgets in the survey and a good sanity check on how large an always-on instruction file should be.

The documented advice is to use Rules for conventions and constraints, Memories for one-off facts, and `AGENTS.md` for anything the team must share.

## JetBrains Junie

Source: [Guidelines and memory](https://junie.jetbrains.com/docs/guidelines-and-memory.html).

Lookup order at task start:

1. `.junie/AGENTS.md` in the project root
2. `AGENTS.md` in the project root
3. `.junie/guidelines.md` or the `.junie/guidelines/` folder (legacy)

Global guidelines come from `~/.junie/AGENTS.md`, or `%USERPROFILE%\.junie\AGENTS.md` on Windows.

When both global and project guidelines exist, Junie includes both and marks them clearly. Project guidelines win on conflict. Identical content is deduplicated automatically.

Marking the source of each block and deduplicating are both good ideas that most harnesses do not implement.

## Cline

Source: [Memory Bank](https://docs.cline.bot/best-practices/memory-bank).

Cline assumes total amnesia between sessions and compensates with a documented file set that it reads at the start of every task:

| File | Holds |
|---|---|
| `projectbrief.md` | Foundation, why this exists |
| `productContext.md` | Problem and user goals |
| `activeContext.md` | Current focus, changes most often |
| `systemPatterns.md` | Architecture and patterns |
| `techContext.md` | Stack and setup |
| `progress.md` | Status and milestones |

The instructions themselves live in `.clinerules/memory-bank.md`. Operating commands are phrases, not flags: "initialize memory bank", "update memory bank", "follow your custom instructions".

The design point worth stealing: separating slow-changing files from `activeContext.md`, which is expected to churn. Most single-file setups mix both and rot faster.

## OpenHands

Source: [Skills overview](https://docs.openhands.dev/overview/skills).

- Repository instructions: `.openhands/microagents/repo.md`, private to the repository, holding layout, build commands, test conventions, and known traps. YAML frontmatter is optional; without it the file loads with repository-agent defaults.
- Knowledge microagents: triggered by keywords in the conversation or in file content, so narrow domain knowledge stays out of every prompt.
- The newer structure splits a `knowledge/` directory for triggered expertise from a `tasks/` directory for interactive workflows, with `.openhands/microagents/` still supported.

## Devin

Source: [Knowledge onboarding](https://docs.devin.ai/onboard-devin/knowledge-onboarding).

Devin's knowledge base stores items with two parts: content, and a **trigger description** that says when to recall it. The trigger is a semantic cue, not a keyword search. Items can be pinned to all repositories so they always apply.

Devin also auto-imports and updates knowledge from `.rules`, `.mdc`, `.cursorrules`, `.windsurf`, `CLAUDE.md`, and `AGENTS.md`. The documented advice is to review auto-generated knowledge for accuracy before relying on it.

## Kiro and Amazon Q

Kiro steering files live in `.kiro/steering/*.md`, with an `inclusion` key set to always, fileMatch, or manual. Manual steering files appear as slash commands. Two limits are documented in the vendor's issue tracker rather than the product docs: the CLI does not support inclusion modes and loads every file in the directory, and global `~/.kiro/steering/` files are ignored when the project has its own steering folder ([aws/amazon-q-developer-cli#3719](https://github.com/aws/amazon-q-developer-cli/issues/3719)).

Amazon Q Developer stores rules in `.amazonq/rules/` and can generate a memory bank of `product.md`, `structure.md`, `tech.md`, and `guidelines.md` so it does not re-analyse the whole project each time ([AWS docs](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/context-memory-bank.html)).

## Aider, Zed, Amp

**Aider** loads a conventions file read-only, configured in `.aider.conf.yml`, pointing at one `CONVENTIONS.md` or several files ([docs](https://aider.chat/docs/usage/conventions.html)). Read-only loading is a small but real design choice: the agent cannot quietly edit its own rules.

**Zed** treats `AGENTS.md` as the primary instruction file for both personal and project guidance, and has moved reusable procedures into a skills system ([Zed instructions](https://zed.dev/docs/ai/instructions)).

**Amp** resolves `AGENTS.md` hierarchically, with subdirectory files extending or overriding the root `[secondary]`. Its distinctive choice is at thread level, covered in [03-thread-continuity.md](03-thread-continuity.md).

## The API layer: Claude's memory tool

Source: [Memory tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool).

If you are building your own harness rather than using one, this is the reference implementation.

- Tool entry: `{"type": "memory_20250818", "name": "memory"}`. Generally available on the Messages API, no beta header.
- Client-side. Claude requests operations; your application executes them against storage you control. `/memories` is a prefix you map onto real storage such as a per-user directory or database keys.
- Commands: `view`, `create`, `str_replace`, `insert`, `delete`, `rename`.
- The API injects a memory protocol into the system prompt automatically. Its core line is worth quoting because it explains the behaviour you will observe: "ASSUME INTERRUPTION: Your context window might be reset at any moment, so you risk losing any progress that is not recorded in your memory directory."
- Security is yours. The docs warn that `/memories/../../secrets.env` reaches outside the directory, and list the defences: validate the `/memories` prefix, resolve to canonical form, reject traversal sequences including URL-encoded ones, cap file sizes, expire old files.
- Pairs with two different context controls: context editing clears specific tool results on the client, compaction summarises the whole conversation server-side. The documented recommendation for long-running agents is to use both, with memory preserving what must survive summarisation.

## Chat surfaces, briefly

Chat products solve the same problem with no filesystem.

**ChatGPT** splits memory into saved memories (an explicit editable list) and referenced chat history. "Dreaming" curates memory in the background without being asked; Dreaming V3 began rolling out on 4 June 2026 ([OpenAI](https://openai.com/index/chatgpt-memory-dreaming/)). Projects can be set to project-only memory, which draws context only from conversations inside that project and ignores global saved memories and other projects ([OpenAI help](https://help.openai.com/en/articles/10169521-projects-in-chatgpt)).

**Claude.ai** builds memory entries as you chat and keeps a running summary you can view and edit in settings. Each project keeps its own separate memory. Incognito chats are excluded from memory and from chat search ([Claude help](https://support.claude.com/en/articles/11817273-use-claude-s-chat-search-and-memory-to-build-on-previous-context)).

The pattern both converge on is worth naming: **a single editable summary plus scoped containers**. Project-only mode in ChatGPT and per-project memory in Claude are the chat equivalent of `.claude/rules/` with a `paths:` filter. Same problem, same answer, no files.

**LangGraph**, for people wiring this themselves, draws the line at exactly the place this report does: checkpointers persist thread-scoped state for conversation continuity and time travel, stores persist cross-thread data such as user preferences and shared facts ([docs](https://docs.langchain.com/oss/python/langgraph/persistence)).
