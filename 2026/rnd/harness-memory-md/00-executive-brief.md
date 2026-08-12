# Executive brief

- **Created:** 2026-08-11
- **Scope:** memory files at global, project, and thread scope across 15 agent harnesses, the Claude memory tool API, and 2 chat surfaces
- **Evidence:** vendor docs, published specs, vendor engineering posts, research preprints, public issue trackers

## Result

The memory file won. The semantics did not.

Every agent harness examined loads a markdown file of standing instructions before work starts. Most now read the same filename, `AGENTS.md`, which is stewarded by the Agentic AI Foundation under the Linux Foundation and used by more than 60,000 open-source projects ([agents.md](https://agents.md/)). But behind the shared filename sit two incompatible rules for combining files, three different write paths, and size budgets that differ by a factor of ten. A team that standardises on the filename and assumes the behaviour follows will get silent, intermittent rule loss.

Four findings change what you should do next.

### 1. There are two rival merge rules, and they look the same until they don't

Given a rule in `/AGENTS.md` and a contradicting rule in `/packages/api/AGENTS.md`:

- **Concatenate-all harnesses** put both in context and let the model decide. Claude Code says so plainly: "All discovered files are concatenated into context rather than overriding each other" ([Claude Code memory docs](https://code.claude.com/docs/en/memory)). Gemini CLI does the same, layering global, then workspace, then just-in-time directory files ([Gemini CLI docs](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/gemini-md.md)).
- **Nearest-wins harnesses** treat the closer file as an override. The `AGENTS.md` spec is explicit: "the closest AGENTS.md to the edited file wins" ([agents.md](https://agents.md/)). Codex concatenates root-down and says later files override earlier guidance ([Codex AGENTS.md guide](https://learn.chatgpt.com/docs/agent-configuration/agents-md)).

The failure this produces is nasty because it is probabilistic, not deterministic. Under concatenation, two contradicting rules both sit in context and the model picks one. Claude's own docs warn: "if two rules contradict each other, Claude may pick one arbitrarily."

**Do this:** never write contradicting rules across levels. Write child files that add, not files that overrule. If you need an override, use a harness that has one (`AGENTS.override.md` in Codex) or delete the parent rule.

### 2. The file is context, not configuration

No harness enforces its memory file. Claude Code states it directly: memory is treated "as context, not enforced configuration," it is "delivered as a user message after the system prompt," and "there's no guarantee of strict compliance" ([Claude Code memory docs](https://code.claude.com/docs/en/memory)).

Research puts a number on the ceiling. IFScale tested 20 models from seven providers on packing many instructions into one prompt. The best frontier models reached 68% adherence at 500 instructions, with a measured bias toward instructions that appeared earlier ([arXiv 2507.11538](https://arxiv.org/pdf/2507.11538)). Separately, Chroma tested 18 frontier models and found accuracy falls as input grows, well before any documented context limit ([Chroma, Context Rot](https://www.trychroma.com/research/context-rot)).

**Do this:** put anything that must always happen into a hook, a permission rule, or CI. Claude Code's own guidance says to use a `PreToolUse` hook "to block an action regardless of what Claude decides." Keep the memory file for guidance the model can reasonably weigh.

### 3. Thread scope is where knowledge actually dies, and vendors now disagree publicly

Global and project files reload every session. The thread is the lossy layer, and 2026 saw the field split.

- **Summarise:** Claude Code replaces the conversation with a structured summary at roughly 95% of the window. Codex CLI compacts on a token limit, keeps about 20,000 tokens of recent user messages, discards the rest, then re-reads up to five recently edited files ([compaction comparison](https://gist.github.com/badlogic/cd2ef65b0697c4dbe2d13fbecb0a0a5f)).
- **Re-seed:** Amp removed compaction entirely and shipped `/handoff`, which starts a fresh thread seeded with extracted context and a stated goal. The reasoning given was that repeated summarisation produces summaries of summaries that distort earlier reasoning ([Tessl on Amp handoff](https://tessl.io/blog/amp-retires-compaction-for-a-cleaner-handoff-in-the-coding-agent-context-race/)).

What survives compaction is harness-specific and rarely documented. Claude Code re-injects project-root `CLAUDE.md`, but nested `CLAUDE.md` files and path-scoped rules are not re-injected, and the skills listing is dropped entirely ([Claude Code memory docs](https://code.claude.com/docs/en/memory)).

**Do this:** assume anything said only in chat is gone after compaction. If a decision matters past the next hour, write it to a file. Test what your harness re-injects: in Claude Code, `/context` lists the memory files actually loaded.

### 4. Agents now write their own memory by default, and that is a new supply chain

Claude Code's auto memory is on by default, writes to `~/.claude/projects/<project>/memory/`, and loads the first 200 lines or 25KB of `MEMORY.md` into every session ([Claude Code memory docs](https://code.claude.com/docs/en/memory)). ChatGPT's "dreaming" curates memory in the background with no user prompt, and Dreaming V3 began rolling out on 4 June 2026 ([OpenAI](https://openai.com/index/chatgpt-memory-dreaming/)). Windsurf's Cascade writes memories on its own into `~/.codeium/windsurf/memories/` ([Cascade memories docs](https://docs.devin.ai/desktop/cascade/memories)).

This is useful and it is also an attack surface. The MINJA attack poisons an agent's long-term memory using nothing but ordinary queries, no elevated access, and reports over 95% injection success in its setting ([arXiv 2503.03704](https://arxiv.org/abs/2503.03704)). Anthropic's own memory-tool documentation makes path-traversal protection the developer's responsibility and warns that a path like `/memories/../../secrets.env` reaches outside the memory directory ([memory tool docs](https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool)).

**Do this:** read what your agent wrote. `/memory` in Claude Code opens the folder. Treat agent-written memory as untrusted input on read, not just on write. Never let a memory file be the only record of a security-relevant decision.

## The numbers that constrain design

| Constraint | Value | Harness | Source |
|---|---|---|---|
| Recommended file size | under 200 lines | Claude Code `CLAUDE.md` | [docs](https://code.claude.com/docs/en/memory) |
| Hard cap on combined instructions | 32 KiB (`project_doc_max_bytes`) | Codex | [docs](https://learn.chatgpt.com/docs/agent-configuration/agents-md) |
| Auto-memory index loaded per session | first 200 lines or 25KB | Claude Code `MEMORY.md` | [docs](https://code.claude.com/docs/en/memory) |
| Global rules file cap | 6,000 characters | Windsurf Cascade | [docs](https://docs.devin.ai/desktop/cascade/memories) |
| Per-workspace rule file cap | 12,000 characters | Windsurf Cascade | [docs](https://docs.devin.ai/desktop/cascade/memories) |
| Recommended rule size | under 500 lines | Cursor | [docs](https://cursor.com/docs/context/rules) |
| Import recursion depth | 4 hops | Claude Code `@path` | [docs](https://code.claude.com/docs/en/memory) |

The smallest hard cap in the set is 32 KiB. If you want one instruction file to work across tools, design to that, not to the largest window you can find.

## What to do on Monday

1. **Write one `AGENTS.md` at the repo root.** Keep it under 200 lines. It is the only file with near-universal support.
2. **Bridge, do not duplicate.** For Claude Code, create a `CLAUDE.md` whose first line is `@AGENTS.md`, then add Claude-specific lines below it. Anthropic documents this exact pattern, along with a symlink alternative.
3. **Scope the rest by path, not by prose.** Use `paths:` frontmatter in `.claude/rules/`, `applyTo:` in Copilot instruction files, `globs:` in Cursor `.mdc` rules. A rule that loads only when a matching file is opened costs nothing the rest of the time.
4. **Move procedures out of the always-on file.** Multi-step workflows belong in skills, which load name and description only until invoked, roughly 30 to 80 tokens each ([progressive disclosure](https://www.newsletter.swirlai.com/p/agent-skills-progressive-disclosure)).
5. **Enforce with hooks, not with capital letters.** All-caps insistence is not a control.
6. **Put a review of agent-written memory in your routine.** Weekly is enough. Delete stale entries; they do not expire on their own.
7. **Delete aggressively.** Anthropic's own advice, from the person who built Claude Code, is to delete your instruction files every six months and see what the model does without them ([Delete your CLAUDE.md](https://charliehills.substack.com/p/delete-your-claudemd)).

## Confidence and limits

- **High confidence:** file paths, load order, size caps, and command names taken from current vendor documentation. Each is cited at the point of use in [02-harness-mechanics.md](02-harness-mechanics.md).
- **Medium confidence:** compaction thresholds and internals for products that do not document them. Sourced from vendor issue trackers and one detailed public comparison. Marked as such in [03-thread-continuity.md](03-thread-continuity.md).
- **Low confidence:** memory-benchmark scores such as LOCOMO. Vendors tune against their own harnesses and independent reproductions differ widely. Reported as a range with the caveat attached, never as a ranking.
- **Not covered:** performance measurement of our own. Nothing here was benchmarked first-hand. See [08-methodology-and-sources.md](08-methodology-and-sources.md).
