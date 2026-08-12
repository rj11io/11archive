# Glossary

- **Created:** 2026-08-11

Terms as used in this report. Where a vendor defines a term differently, the vendor's meaning is noted.

## Scopes and files

**Global scope.** Instructions attached to a person or a machine, applied to every project. Example: `~/.claude/CLAUDE.md`.

**Project scope.** Instructions stored in a repository and shared through version control. Example: `AGENTS.md` at the repo root.

**Thread scope.** State that exists only inside one conversation: what you said, what the agent read, what it decided. It has no file, which is why it is the layer that gets lost.

**Managed policy.** An instruction layer set by an administrator that an individual user cannot switch off. Claude Code reads one from a system path; Cursor calls its version Team Rules.

**Memory file.** Any markdown file a harness loads as standing instructions. `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `.cursor/rules/*.mdc`, `.kiro/steering/*.md` are all memory files.

**Auto memory.** Notes the agent writes for itself, unprompted, and reads back in later sessions. Claude Code's term. Windsurf calls its version Memories.

**Memory bank.** A named set of files holding project state, read at the start of every task. Cline's term, also used by Amazon Q and by community setups for Roo Code.

**Steering file.** Kiro's term for a project instruction file with an `inclusion` mode.

**Microagent.** OpenHands' term for an instruction unit. A repository microagent (`repo.md`) always applies; a knowledge microagent triggers on keywords.

**Knowledge item.** Devin's term for a stored fact, made of content plus a trigger description that says when to recall it.

## Loading and resolution

**Eager loading.** The file enters context at session start, every session, whatever the task.

**Conditional loading.** The file enters context only when the agent touches a file matching a glob pattern. Configured with `paths:` in Claude Code, `applyTo:` in Copilot, `globs:` in Cursor.

**Deferred loading.** Only a name and description sit in context; the body loads if the model decides it is relevant. Skills work this way, as do Cursor's "Apply Intelligently" rules and Windsurf's `model_decision` mode.

**Progressive disclosure.** The general pattern behind deferred loading: keep a cheap pointer in context and fetch the expensive content on demand. Anthropic's framing is that the context window is a public good.

**Just-in-time retrieval.** Same idea, seen from the agent's side: hold lightweight identifiers such as file paths and load details at the moment they are needed.

**Concatenate-all.** A merge rule where every discovered file is placed in context in order and nothing is removed. Claude Code and Gemini CLI work this way. Conflicts are handed to the model.

**Nearest-wins.** A merge rule where the file closest to the work overrides files further up. The `AGENTS.md` specification and Codex work this way.

**Import.** A directive inside a memory file that pulls another file in. `@path/to/file` in Claude Code and Gemini CLI. Imports load at launch, so they organise content without reducing its cost.

## Thread mechanics

**Context window.** The total token budget for one model request, holding the system prompt, instructions, conversation, and tool results.

**Compaction.** Summarising a conversation that is nearly full and restarting with the summary in place of the history. Automatic in Claude Code and Codex CLI, manual with `/compact`.

**Microcompaction.** Trimming parts of the context rather than summarising all of it, for example dropping old tool outputs. OpenCode's pruning is this shape.

**Context editing.** Client-side removal of specific tool results from the request. Distinct from compaction, which is server-side summarisation of the whole conversation.

**Handoff.** Ending a thread deliberately and seeding a new one with extracted context plus a stated goal. Amp's `/handoff` replaced compaction there.

**Checkpoint.** A saved snapshot of conversation and file state that you can return to. Claude Code writes one before every file edit and on every prompt.

**Rewind.** Rolling back to a checkpoint, undoing both conversation and file changes.

**Fork.** Branching a session or a subagent so it inherits the parent's conversation rather than starting fresh.

**Subagent.** A delegated agent with its own context window. It returns a summary, keeping its file reads out of the parent's context. In Claude Code it receives the `CLAUDE.md` hierarchy but not the parent's auto memory.

**Context rot.** The measured decline in model accuracy as input length grows, even well inside the stated window. Named by Chroma's 2025 study of 18 frontier models.

**Recursive summary.** A summary produced from context that already contained a summary. Amp's stated reason for removing compaction: repeated compression distorts earlier reasoning.

## Memory system terms

**Semantic memory.** Facts. "The team uses pnpm."

**Episodic memory.** Events. "Last Tuesday the deploy failed because of a stale lockfile."

**Procedural memory.** How to do something. In agent harnesses this is usually a skill rather than a memory entry.

**Checkpointer.** LangGraph's term for thread-scoped short-term persistence.

**Store.** LangGraph's term for cross-thread long-term persistence, addressed by namespace.

**Memory tool.** Anthropic's API tool (`memory_20250818`) that lets a model request file operations against a `/memories` directory the developer hosts.

## Security terms

**Memory poisoning.** Getting false or malicious content into an agent's persistent memory so it influences later sessions.

**MINJA.** A memory injection attack that poisons an agent's memory through ordinary queries alone, with no elevated access.

**Path traversal.** Using a path such as `../../` to reach files outside an intended directory. The main implementation risk when hosting the memory tool.

**Instruction source boundary.** The rule that instructions come from the user, and everything read through a tool, including memory files written by an agent, is data rather than a command.

## Filenames seen in the wild

| File | Tool |
|---|---|
| `AGENTS.md` | The cross-tool standard, 25+ tools |
| `AGENTS.override.md` | Codex, wins at its level |
| `CLAUDE.md`, `CLAUDE.local.md` | Claude Code |
| `MEMORY.md` | Claude Code auto-memory index |
| `GEMINI.md` | Gemini CLI |
| `.cursorrules`, `.cursor/rules/*.mdc` | Cursor, the first legacy |
| `.github/copilot-instructions.md` | GitHub Copilot |
| `*.instructions.md` | Copilot path-scoped |
| `global_rules.md`, `.windsurf/rules/` | Windsurf Cascade |
| `.clinerules/`, `activeContext.md`, `progress.md` | Cline |
| `.kiro/steering/*.md` | Kiro |
| `.amazonq/rules/` | Amazon Q Developer |
| `.openhands/microagents/repo.md` | OpenHands |
| `CONVENTIONS.md` | Aider |
| `.junie/guidelines.md` | Junie, legacy |
| `SKILL.md` | Agent Skills, cross-tool |
