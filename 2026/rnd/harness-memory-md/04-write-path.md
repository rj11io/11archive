# The write path: who fills the file, and when

- **Created:** 2026-08-11

Two files sit in the same directory. One says "use pnpm, never npm" because a human typed it. The other says "the test suite needs a local Redis instance" because the agent hit the failure twice and wrote itself a note. They load into the same context and the model treats them the same way. They should not be trusted the same way.

This section is about the second kind.

## Four write paths, ranked by how much a human saw

| Path | Who initiates | Human reviews | Example |
|---|---|---|---|
| Hand-authored | Human | By definition | You edit `AGENTS.md` |
| Human-directed | Human asks, agent writes | Usually, in the diff | "add this to CLAUDE.md" |
| Agent-initiated, visible | Agent decides, you are told | Only if you look | Claude Code "Saved 2 memories" |
| Agent-initiated, background | Agent decides, no session signal | Rarely | ChatGPT dreaming |

The trend across 2025 and 2026 is downward through that table. What used to be a file you edited is now, in several products, a file written on your behalf by default.

## Agent-initiated memory, product by product

### Claude Code auto memory

On by default. Claude "saves notes for itself as it works: build commands, debugging insights, architecture notes, code style preferences, and workflow habits," and decides what is worth keeping based on whether it would help a future conversation ([docs](https://code.claude.com/docs/en/memory)).

Mechanics that matter for review:

- Location: `~/.claude/projects/<project>/memory/`, keyed on the git repository, outside the repo.
- `MEMORY.md` is an index; the first 200 lines or 25KB load every session. Topic files load on demand.
- The harness pushes back on bloat. Near a limit, Claude Code reminds Claude to shorten: one line per entry, detail into topic files, merge or drop stale entries. Over a limit, the write succeeds but returns an error telling Claude to rewrite the index, because everything past the limit is silently dropped on the next load.
- Writes stamp a `modified` ISO 8601 timestamp into frontmatter when frontmatter already exists (v2.1.214 or later). This is the only automatic staleness signal found in any harness surveyed.
- Session UI says "Saved 2 memories" or "Recalled 2 memories".
- Everything is plain markdown you can edit or delete. `/memory` opens the folder.

Subagents can have their own, with `memory: user | project | local` selecting `~/.claude/agent-memory/<name>/`, `.claude/agent-memory/<name>/`, or `.claude/agent-memory-local/<name>/`. The `project` scope is the one that reaches version control, so a subagent's accumulated notes can become team knowledge on purpose ([subagent docs](https://code.claude.com/docs/en/sub-agents)).

### Windsurf Cascade memories

Cascade creates memories automatically "when it encounters useful context," and you can ask for one directly. They land in `~/.codeium/windsurf/memories/`, are scoped to a single workspace, are not available in another workspace, and are never committed ([docs](https://docs.devin.ai/desktop/cascade/memories)).

The vendor draws the line explicitly: Rules for conventions and constraints, Memories for one-off facts, `AGENTS.md` or Rules for anything the team needs. That is the clearest statement of the boundary in any documentation reviewed.

### ChatGPT dreaming

Memory curation runs in the background. OpenAI describes dreaming as a method for ChatGPT to automatically curate memories by referencing chat history, and Dreaming V3, rolling out from 4 June 2026, "replaces the saved-memories list as ChatGPT's standalone foundation," with existing memories updating themselves over time ([OpenAI](https://openai.com/index/chatgpt-memory-dreaming/)).

The control that matters is containment: a project set to project-only draws context solely from conversations inside that project and ignores global saved memories and other projects ([OpenAI help](https://help.openai.com/en/articles/10169521-projects-in-chatgpt)).

### Claude.ai memory

Memory entries are built in real time during chats and rolled into a summary you can view and edit in settings. Each project keeps separate memory. Incognito chats are excluded from both memory and chat search ([Claude help](https://support.claude.com/en/articles/11817273-use-claude-s-chat-search-and-memory-to-build-on-previous-context)).

A single editable summary is the best affordance in this category. It is one artefact to read, not a folder to audit.

### Devin knowledge

Devin auto-generates knowledge and auto-imports from `.rules`, `.mdc`, `.cursorrules`, `.windsurf`, `CLAUDE.md`, and `AGENTS.md`. Each item pairs content with a trigger description used as a semantic cue. The documented advice on setup is to "review any auto-generated Knowledge and verify for completeness and accuracy" ([docs](https://docs.devin.ai/onboard-devin/knowledge-onboarding)).

That review step is the correct default and almost nobody does it.

### Command-driven memory

Some harnesses only write when told, which makes them easier to trust:

- Gemini CLI: `/memory add <text>` appends to the global `~/.gemini/GEMINI.md` ([docs](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/gemini-md.md)).
- Cline: "update memory bank" triggers a full documentation review across the six memory bank files ([docs](https://docs.cline.bot/best-practices/memory-bank)).
- Amazon Q: generates `product.md`, `structure.md`, `tech.md`, and `guidelines.md` into `.amazonq/rules/` on request ([AWS docs](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/context-memory-bank.html)).

### Neutral or absent

Codex, Aider, and OpenHands repository instructions have no agent write path found in their documentation. Aider goes further and loads its conventions file read-only, so the agent cannot edit its own rules ([docs](https://aider.chat/docs/usage/conventions.html)).

## What good agent-written memory looks like

The best-documented shape is an index plus topic files:

```
~/.claude/projects/<project>/memory/
├── MEMORY.md          # one line per entry, loaded every session
├── debugging.md       # detail, read on demand
├── api-conventions.md
└── ...
```

Three properties make this work, and they generalise to any harness you build:

1. **The always-loaded part is bounded.** 200 lines or 25KB. A bound the agent is told about and reminded of.
2. **Detail is one hop away, not in context.** Topic files are read when needed. This is the same progressive disclosure that skills use.
3. **The index is a map, not a summary.** Its job is to tell the agent what exists and where, so retrieval is cheap.

Cline's memory bank reaches the same conclusion by a different route: split fast-changing state (`activeContext.md`, `progress.md`) from slow-changing state (`projectbrief.md`, `techContext.md`), so churn is contained to two files instead of smeared across one.

## Prompting the write path

Anthropic's memory tool documentation gives the two prompts that shape what gets written, and both are worth copying into any harness:

Keep it tidy:

> Note: when editing your memory folder, always try to keep its content up-to-date, coherent and organized. You can rename or delete files that are no longer relevant. Do not create new files unless necessary.

Keep it narrow:

> Only write down information relevant to \<topic> in your memory system.

The second is the underused one. An unbounded memory brief produces a memory directory about everything, which is a memory directory about nothing.

## Review, decay, and deletion

No harness surveyed expires memories on its own. Claude Code's `modified` timestamp tells you a fact's age but does not act on it. Anthropic's memory tool documentation lists expiry as the developer's job: "Periodically delete memory files that haven't been accessed in a long time."

So decay is a human practice. A workable minimum:

1. **Weekly, skim the index.** `/memory` in Claude Code, `~/.codeium/windsurf/memories/` in Windsurf, settings summary in Claude.ai and ChatGPT.
2. **Delete anything about a system that changed.** Memory does not know you migrated off Redis.
3. **Promote anything a teammate would need.** If the agent learned it and it is true for everyone, it belongs in `AGENTS.md`, in the repository, in git. Agent memory is machine-local and dies with the laptop.
4. **Delete anything you cannot verify.** An unverifiable claim in memory is worse than an absent one, because it will be repeated with confidence.

## The trust question

The four write paths carry different risk, and the products do not distinguish them in context. A line the agent inferred from one flaky test run and a line your staff engineer wrote arrive in the same prompt with the same weight.

That asymmetry is the root of the security problem covered in [05-failure-modes.md](05-failure-modes.md). The mitigation is structural, not clever: keep agent-written memory in a separate file from hand-authored rules, so you can read it as a category. Every harness surveyed already does this by putting auto-memory outside the repository. Do not undo it by asking the agent to write into `AGENTS.md` directly.
