# Thread scope: what happens inside one long session

- **Created:** 2026-08-11

Here is the moment that matters. You are ninety minutes into a session. You told the agent, in chat, "the staging database is read-only, never run migrations against it." The context window fills. The harness compacts. Twenty minutes later the agent runs a migration against staging.

Nothing was misconfigured. The instruction was thread scope, and thread scope is the layer that gets thrown away.

## The three thread-level mechanisms

### Compaction: summarise and continue

The harness detects that the window is nearly full, asks a model to summarise the conversation, and restarts with the summary in place of the history.

Anthropic describes the technique as taking a conversation nearing the limit, summarising it, and reinitiating a new context window with the summary, calling it "the first lever in context engineering" for long-term coherence ([Effective context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)).

What each harness keeps and drops, from the most detailed public comparison available ([badlogic, compaction research](https://gist.github.com/badlogic/cd2ef65b0697c4dbe2d13fbecb0a0a5f)) plus vendor docs:

| Harness | Trigger | Kept | Dropped |
|---|---|---|---|
| Claude Code | About 95% of the window, or `/compact` | Structured summary covering accomplishments, work in progress, files involved, next steps, key requests | The conversation itself |
| Codex CLI | `model_auto_compact_token_limit`, 180k to 244k depending on model | Summary, plus about 20,000 tokens of recent user messages, plus a re-read of up to 5 recently edited files within a 50,000 token budget | Older assistant turns, tool results, file contents |
| OpenCode | Tokens above context limit minus output limit | Last 40,000 tokens of tool output protected | Tool outputs beyond that, pruned first |
| Amp | Never | Nothing, by design | Nothing, by design |

Codex's numbers come from its own configuration keys and issue tracker `[medium confidence]`. The re-read of recently edited files is a good idea other harnesses have not copied: it repairs the most common post-compaction failure, which is the agent forgetting what a file currently contains.

### Handoff: start a new thread on purpose

Amp removed compaction and shipped `/handoff` instead. The command builds a draft prompt from the current thread, identifies relevant files, lets you state a new goal, and opens a fresh thread seeded with that. The original thread is untouched ([Tessl](https://tessl.io/blog/amp-retires-compaction-for-a-cleaner-handoff-in-the-coding-agent-context-race/)).

The stated reason is worth taking seriously: repeated automatic summarisation produces summaries of summaries, and those "recursive summaries" distort earlier reasoning. Compaction meant to preserve continuity instead introduced drift.

Usage looks like this:

```
/handoff now implement this for teams as well
/handoff execute phase one of the created plan
/handoff check the rest of the codebase and find other places needing this fix
```

The difference from compaction is control. Compaction fires when the window fills and summarises whatever happened to be there. Handoff fires when you finish a phase and carries what you choose. One is triggered by resource pressure, the other by the shape of the work.

### Checkpoints and resume: rewind rather than continue

Claude Code writes a checkpoint before every file edit and on every prompt, keeps file snapshots for the 100 most recent checkpoints in a session, and persists them across sessions so you can rewind inside a resumed conversation. Sessions live in `~/.claude/projects/`, pre-edit file copies in `~/.claude/file-history/<session>/`, with a default 30-day retention that is configurable ([checkpointing docs](https://code.claude.com/docs/en/checkpointing)) `[retention and count from vendor docs and secondary write-ups]`.

Commands: `claude --continue` reopens the most recent session, `claude --resume` picks one from a list, `claude --continue --fork-session` branches so you can try a different approach without losing the original.

Checkpoints solve a different problem from compaction. Compaction is about fitting; checkpoints are about undoing. Both are thread-scope tools and neither replaces the other.

## What survives compaction, precisely

This is the question people get wrong, so here is the documented answer for Claude Code ([memory docs](https://code.claude.com/docs/en/memory), [context window](https://code.claude.com/docs/en/context-window)).

**Reloaded after compaction:**

- The system prompt
- Project-root `CLAUDE.md`, re-read from disk and re-injected
- Auto memory (`MEMORY.md`)
- MCP tool listings

**Not reloaded:**

- Nested `CLAUDE.md` files in subdirectories. They come back the next time Claude reads a file in that directory.
- Rules with `paths:` frontmatter. They come back the next time a matching file is read.
- The skills listing. Only skills you actually invoked are preserved.
- Anything you said only in conversation.

The docs state the diagnosis plainly: "If an instruction disappeared after compaction, it was given only in conversation, lives in a nested CLAUDE.md that hasn't reloaded yet, or is a path-scoped rule that hasn't matched a file since."

Applied to the opening scenario: "never run migrations against staging" was conversation-only. It did not survive. Written into `CLAUDE.md`, it would have.

## Why summarising repeatedly degrades

Two independent lines of evidence.

**Compression is lossy and compounds.** Each compaction is a summary of a context that already contained a summary. Amp's public reasoning names this directly, citing an OpenAI internal report showing accuracy declining as conversations accumulated compression cycles.

**Long contexts degrade before they are full.** Chroma tested 18 frontier models, including the Claude 4 family, GPT-4.1, Gemini 2.5, and Qwen3, on multi-hop tasks from 10,000 to 500,000 tokens. All 18 showed monotonically decreasing F1 as input grew. A 200,000-token window can degrade meaningfully at 50,000 ([Context Rot](https://www.trychroma.com/research/context-rot)). The finding that matters most for memory files: performance collapses faster when the answer is hard to distinguish from surrounding text. A memory file full of generic advice makes the specific rule harder to find, not easier.

Put together: filling the window is not free, and emptying it is not free either. The only cheap move is not putting low-value text there in the first place.

## The pattern that actually works: write it down mid-flight

Anthropic's documented approach for agents that outlive a context window is structured note-taking, meaning the agent writes notes to durable storage as it works and pulls them back later ([Effective context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)).

The concrete version, from the harness case study ([Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)):

**Initializer session, run once.** Create an `init.sh` that starts the development environment, a progress file that logs what has been done, a feature list in JSON with each item marked passing or failing, and an initial git commit.

**Every session after.** Read the progress file and git log. Pick the highest-priority incomplete feature. Run `init.sh` and do a basic end-to-end check before writing anything. Work on one feature. Commit with a descriptive message. Update the progress file before finishing.

The failure modes it was built to fix, and the fix for each:

| Failure | Fix |
|---|---|
| Agent declares victory early | A feature list with end-to-end descriptions, not code-level ones |
| Environment left broken | Progress notes plus git, and a validation test at session start |
| Features marked done without testing | Explicit prompting to self-verify, using browser automation |
| Time wasted rediscovering setup | `init.sh` handed over at session start |

One rule carries most of the value: mark a feature complete only after end-to-end verification, never when the code is written. Otherwise the progress file becomes confidently wrong, and every later session inherits the error.

The Claude memory tool encodes the same instinct in the system prompt it injects automatically: "ASSUME INTERRUPTION: Your context window might be reset at any moment, so you risk losing any progress that is not recorded in your memory directory" ([memory tool docs](https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool)).

## Subagents as a thread-scope tool

Delegation is context management. A subagent runs in its own window, does the expensive reading there, and returns only a summary. Claude Code's context walkthrough shows the arithmetic: a subagent reads 6,100 tokens of files and returns 420 tokens to the parent ([context window](https://code.claude.com/docs/en/context-window)).

The catch, documented in the subagent reference: a non-fork subagent starts fresh. It does not see your conversation history, the skills you invoked, or the files already read. It does get the full `CLAUDE.md` hierarchy. It does not get the main conversation's auto memory. A fork is the exception and inherits the parent conversation ([subagent docs](https://code.claude.com/docs/en/sub-agents)).

So delegation preserves the parent thread by discarding the child's. That is the right trade when the child's work is search and the parent's is decision. It is the wrong trade when the child needs a nuance that only ever existed in chat.

## Practical rules for thread scope

1. **Say it once in chat, write it once to a file.** If a correction is worth making, it is worth persisting. In Claude Code, "add this to CLAUDE.md" does it; unprompted, auto memory may catch it anyway.
2. **Compact on your terms.** Run `/compact` at a natural boundary, after finishing a unit of work, rather than letting it fire mid-task at 95%.
3. **Prefer a new thread to a third compaction.** Once a session has compacted twice, a handoff with an explicit goal beats another summary of a summary.
4. **Keep a progress file for anything that spans sessions.** One file, current state and next step, updated at the end of every session.
5. **Verify before you record.** A progress file that says "auth complete" when auth is untested is worse than no file, because the next session will believe it.
6. **Check what reloaded.** After a compaction, `/context` shows which memory files are actually present. Do not assume.
