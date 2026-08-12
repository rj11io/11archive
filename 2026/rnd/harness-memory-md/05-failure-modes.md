# Seven ways memory files fail

- **Created:** 2026-08-11

Each failure below is stated as the symptom you will actually see, then the cause, then the fix.

## 1. The rule is there and the agent ignores it

**Symptom.** `CLAUDE.md` says "run `npm test` before committing." The agent commits without testing. `/context` confirms the file loaded.

**Cause.** Memory files are context, not configuration. Claude Code says so: instructions are "delivered as a user message after the system prompt," Claude "tries to follow it, but there's no guarantee of strict compliance" ([docs](https://code.claude.com/docs/en/memory)).

The ceiling is measurable. IFScale tested 20 models across seven providers on instruction density and found the best frontier models reached 68% adherence at 500 instructions, with a documented bias toward instructions that appeared earlier in the prompt ([arXiv 2507.11538](https://arxiv.org/pdf/2507.11538)).

**Fix.** Split by category:

- Must always happen: a hook. Claude Code's `PreToolUse` hook blocks an action "regardless of what Claude decides." Or CI, or a pre-commit hook.
- Must usually happen: a specific, verifiable line near the top of the file. "Run `npm test` before committing" beats "test your changes."
- Nice to have: accept the 68%.

Vague instructions fail more than specific ones. Anthropic's example pair: "Use 2-space indentation" over "Format code properly."

## 2. Two files disagree and the behaviour is random

**Symptom.** The agent uses tabs on Tuesday and spaces on Thursday. Nothing changed.

**Cause.** Under a concatenate-all harness, both rules are in context and nothing decides between them. Claude Code documents the outcome: "If two files give different guidance for the same behavior, Claude may pick one arbitrarily."

**Fix.**

- Audit for contradictions across your `CLAUDE.md` files, nested files, and `.claude/rules/`. Do it on a schedule, since files accumulate.
- Write child files that add, never that contradict.
- In a monorepo, exclude other teams' files. Claude Code's `claudeMdExcludes` takes glob patterns against absolute paths and merges arrays across settings layers.
- If you need real overrides, use a harness that has them. Codex's `AGENTS.override.md` wins at its level by design.

## 3. The file grew and adherence got worse

**Symptom.** You added twenty rules. The agent now follows fewer of them than when there were five.

**Cause.** Two effects compound. Instruction adherence falls with density (finding 1). And retrieval accuracy falls with input length: Chroma found all 18 frontier models tested showed monotonically decreasing F1 as input grew, with degradation possible at 50,000 tokens inside a 200,000-token window ([Context Rot](https://www.trychroma.com/research/context-rot)). The specific finding that applies here is that performance collapses fastest when the target is hard to distinguish from the surrounding text. Padding a file with generic advice hides the specific rules inside it.

**Fix.**

- Keep the always-on file under 200 lines, the documented Claude Code target. Windsurf enforces 6,000 characters globally and 12,000 per workspace rule, which is a useful lower bound to aim at.
- Move path-specific rules behind globs so they cost nothing until relevant.
- Move procedures into skills, which cost roughly 30 to 80 tokens at rest ([progressive disclosure](https://www.newsletter.swirlai.com/p/agent-skills-progressive-disclosure)).
- Drop what the model can derive. `/doctor` in Claude Code proposes exactly this trim: cut directory layouts, dependency lists, and architecture overviews; keep pitfalls, rationale, and conventions that differ from tool defaults.
- Stop shouting. Practitioner guidance is blunt about all-caps directives, IMPORTANT, YOU MUST, and emoji markers: "emphasis is a finite resource and if everything is critical, nothing is" ([Delete your CLAUDE.md](https://charliehills.substack.com/p/delete-your-claudemd)).

The strongest version of this advice comes from Anthropic's own practice. The same source reports the shipped Claude Code prompt was cut by four fifths for Opus 5 and Fable 5, with the recommendation that users delete their instruction files, skills, and hooks every six months and see what the model does without them.

## 4. The instruction vanished after compaction

**Symptom.** Ninety minutes in, the agent violates something you established at minute ten.

**Cause.** It was thread scope and compaction dropped it. In Claude Code, project-root `CLAUDE.md` is re-read and re-injected after compaction, but nested `CLAUDE.md` files, `paths:`-scoped rules, and the skills listing are not. Only skills you actually invoked survive ([memory docs](https://code.claude.com/docs/en/memory), [context window](https://code.claude.com/docs/en/context-window)).

**Fix.**

- Write it to the project-root file, which is the only instruction layer documented to survive.
- Compact at task boundaries with `/compact` rather than letting it fire at 95%.
- After a compaction, check `/context`.
- For work spanning sessions, keep a progress file. See [03-thread-continuity.md](03-thread-continuity.md).

## 5. Memory says something that is no longer true

**Symptom.** The agent insists the build command is `yarn build`. You moved to pnpm four months ago.

**Cause.** Nothing expires. Anthropic's memory tool documentation lists expiry as an implementer responsibility: "Periodically delete memory files that haven't been accessed in a long time." Claude Code writes a `modified` timestamp into frontmatter (v2.1.214 or later) but takes no action on age.

Auto-memory rots faster than hand-authored files because nobody reads it. Claude Code's memory lives in `~/.claude/projects/<project>/memory/`, outside the repository, so it never appears in a diff or a code review.

**Fix.**

- Put a memory review in an existing routine. Weekly, or at each release.
- On any migration, grep the memory directory for the old tool name and delete the hits.
- Prefer facts that stay true. "Build commands are in `package.json` scripts" survives a migration; "run `yarn build`" does not.
- Promote durable, team-wide facts into the repository, where review catches them.

## 6. A memory file becomes an injection vector

**Symptom.** The agent does something nobody asked for, repeatedly, across sessions, with no bad instruction visible in the conversation.

**Cause.** Memory is read back into context as trusted text. Two concrete routes:

**Poisoning through ordinary use.** The MINJA attack injects malicious records into an agent's memory bank using only normal queries and observed outputs, with no elevated privileges, and reports over 95% injection success in its setting ([arXiv 2503.03704](https://arxiv.org/abs/2503.03704)). Follow-on work studies defences and finds the deployment picture understudied ([arXiv 2601.05504](https://arxiv.org/abs/2601.05504)).

**Committed instruction files.** A project instruction file is code you execute. Anthropic guards one path here: an import in a project memory file whose path resolves outside the working directory triggers a one-time approval dialog, because "the dialog protects you from files other people commit to a shared project" ([memory docs](https://code.claude.com/docs/en/memory)).

**Path traversal.** For anyone implementing the memory tool, the docs warn that `/memories/../../secrets.env` reaches outside the memory directory, and require validating the prefix, resolving to canonical form, and rejecting traversal sequences including URL-encoded ones ([memory tool docs](https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool)).

**Fix.**

- Review `AGENTS.md` and `CLAUDE.md` changes in pull requests the way you review source. They are executable.
- Read agent-written memory periodically. It is plain markdown.
- Never let memory be the only record of a security decision.
- If you host the memory tool, validate every path, cap file sizes, and strip sensitive data before writing. The docs note Claude usually refuses to write secrets but recommend validation for stronger guarantees.
- Treat memory content as data, not instructions, when it arrives from any source you did not write.

## 7. The rule never loads at all

**Symptom.** A rule exists, is well written, and has visibly never applied.

**Causes and fixes, by harness:**

| Cause | Where it happens | Fix |
|---|---|---|
| Rule sits below the working directory | Codex stops walking at cwd | Launch from the directory whose rules you want |
| Global steering ignored when project steering exists | Kiro CLI ([issue #3719](https://github.com/aws/amazon-q-developer-cli/issues/3719)) | Duplicate the rule into project steering |
| Glob never matches | Any `paths:`, `applyTo:`, `globs:` rule | Test the pattern. In Claude Code, a `[` that is not a valid bracket expression matches nothing |
| Description too vague for a model-decided rule | Cursor "Apply Intelligently", Windsurf `model_decision`, Kiro `auto` | Describe the situation, not the topic |
| Instruction blob hit the size cap | Codex, 32 KiB `project_doc_max_bytes` | Shrink, or move detail into scoped files |
| Subagent never saw it | Claude Code Explore and Plan skip `CLAUDE.md`; no subagent gets the parent's auto memory | Restate the constraint in the delegation prompt |
| Wrong filename for this tool | Claude Code reads `CLAUDE.md`, not `AGENTS.md` | Bridge with `@AGENTS.md` or a symlink |
| Nested file not reloaded after compaction | Claude Code | Move it to the project root, or accept lazy reload |

**The universal diagnostic:** print what the model actually receives. Gemini CLI's `/memory show` outputs the full concatenated context. Claude Code's `/context` lists loaded memory files, and the `InstructionsLoaded` hook logs which files load, when, and why. Check the tool before debugging the prompt.

## Failure summary

| # | Failure | Root cause | Primary fix |
|---|---|---|---|
| 1 | Rule ignored | Context, not configuration | Hooks for hard rules |
| 2 | Random behaviour | Contradiction under concatenation | Audit and delete conflicts |
| 3 | Worse with more rules | Instruction density and context rot | Cap size, scope by path, defer procedures |
| 4 | Lost mid-session | Compaction drops thread scope | Persist to project-root file |
| 5 | Stale facts | Nothing expires | Scheduled review, prefer durable facts |
| 6 | Poisoned memory | Memory is trusted on read | Review as code, validate paths |
| 7 | Never loads | Discovery, glob, cap, or scope | Print what the model receives |
