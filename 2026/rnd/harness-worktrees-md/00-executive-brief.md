# How AI agent harnesses handle git worktrees: executive brief

- **Created:** 2026-08-11
- **Audience:** engineers and tool builders who run more than one coding agent on one repository
- **Scope:** how today's agent tools create, seed, guard, hand off, and clean up git worktrees, what that fixes, what it does not, and what to do instead
- **Evidence boundary:** official product documentation, the git manual, public bug reports, two peer-reviewable preprints, and public repository status pages. No private betas. No benchmarks run by us.

A **worktree** is a second folder holding a full copy of a project's files, backed by the same repository history as the first folder. A **harness** is the code around the model that runs the agent loop: it manages the session, calls tools, and writes changes to disk. A **surface** is where you sit while the agent works: a terminal, an editor panel, a desktop app, or a web page.

## Result

Worktrees have become the standard way local agent tools stop parallel agents from overwriting each other. Nine of the ten tools surveyed now create worktrees themselves rather than asking you to run `git worktree add`. Anthropic, OpenAI, Cursor, Microsoft, Google, and Zed all ship the same core move: one agent, one folder, one branch.

The move works. It also solves only one of four problems, and it is the cheapest of the four to solve.

| Layer | What collides | Does a worktree fix it? | What actually fixes it |
|---|---|---|---|
| Files | Two agents write the same file | Yes | Worktree per agent |
| Repository plumbing | Two agents write `.git/config`, `.git/index`, or refs at the same time | No. Worktrees share one `.git` | Serialise creation, retry on lock, per-worktree config |
| Runtime and state | Two agents bind port 3000, or share one database, or start the same Docker stack | No | Container per agent, or per-worktree ports, project names, and schemas |
| Meaning | Two agents each rename the same idea differently, and both branches compile | No | Freeze the shared interface before you fan out, then test the merged result |

The third and fourth layers are where the cost sits. In one study of 33,596 pull requests written by coding agents across 2,807 repositories, 40.2% of repositories had agent pull requests open at the same time, and those overlapping pull requests were 79.4% of all agent pull requests. When the authors merged 747 pairs to see what happened, pairs from two different agents conflicted 41.7% of the time and pairs from the same agent conflicted 19.8% of the time, with 84.4% of conflicts landing in source files rather than dependency lists ([arXiv 2607.04697](https://arxiv.org/abs/2607.04697)). A larger dataset of 142,000 agent pull requests across 59,000 repositories found a 27.67% conflict rate over the 107,000 it could simulate a merge for ([AgenticFlict, arXiv 2604.03551](https://arxiv.org/abs/2604.03551)).

Read that as a budget. Isolation is free; integration is not.

## What every harness got right

1. **Isolate writes, not reads.** Every tool lets agents read the whole repository and confines only writes. That keeps the agent's context useful.
2. **Branch from a known point.** Fresh from the remote default branch, or the current local commit, or a detached commit with no branch attached. Never "whatever is lying around".
3. **Refuse to touch the main checkout.** The best implementations block the write, not just discourage it. Claude Code blocks edits into the main checkout, blocks commands whose working directory resolves there, and blocks commands that redirect git back into it with `git -C`, `--git-dir`, `GIT_DIR`, `GIT_WORK_TREE`, or a `cd` ([Claude Code worktrees](https://code.claude.com/docs/en/worktrees)).
4. **Close the gitignored gap.** A worktree contains only committed files, so `.env` and `node_modules` are missing. Every mature tool ships a way to put them back: a list of files to copy, or a setup script that runs on creation.
5. **Make landing the work explicit.** Nobody auto-merges. You get "apply to main", or "hand the thread back", or "open a pull request", and you choose.

## What every harness got wrong, or has not finished

1. **Shared `.git/config` is treated as private.** Git shares one config file across all worktrees. A harness that writes config "for this worktree" changes it for the whole clone. One reported case: Claude Code's worktree setup rewrote `core.hooksPath`, which silently switched off a repository's committed pre-push checks everywhere for several days ([issue 66993](https://github.com/anthropics/claude-code/issues/66993)). Fix: `git config extensions.worktreeConfig true`, then write with `git config --worktree`.
2. **Concurrent creation races.** Several agents running `git worktree add` at once fight over `.git/config.lock`; several agents committing at once fight over `.git/index.lock`. One report: 3 parallel agents, 2 failed ([issue 47266](https://github.com/anthropics/claude-code/issues/47266)). Another: 13 parallel agents, 5 committed and 8 failed ([issue 55724](https://github.com/anthropics/claude-code/issues/55724)). Fix: serialise creation, then retry with backoff at roughly 200ms, 400ms, 800ms.
3. **Cleanup can delete the work.** If a commit fails on a lock and the agent exits, an automatic sweep can then remove the worktree and the uncommitted work with it. Fix: gate every automatic removal on `git status --porcelain` being empty, and hold `git worktree lock` while an agent is running. Claude Code now does both.
4. **Runtime isolation is left to you.** No surveyed harness allocates ports, names Docker Compose projects, or gives each agent its own database. Third-party tools fill the gap ([Docktree](https://docktree.dev/), [worktree-compose](https://github.com/mostafasudo/worktree-compose)).
5. **Nobody sizes concurrency by review capacity.** Tools cap worktrees by count and age. Cursor keeps 25 per machine by default; the Codex app keeps about 15. Neither number is about how many diffs a person can read.

## Do this

- **Use worktree isolation for anything you would run two of.** It is the cheapest correct default for local parallel agents.
- **Turn on per-worktree config before you scale up.** `git config extensions.worktreeConfig true`. Then check that nothing writes to the shared file: run `git config core.hooksPath` from the main checkout after a session and confirm the value is what you committed.
- **Write the seeding step down, in the repository.** Use a copy list for secrets (`.worktreeinclude`, `git.worktreeIncludeFiles`) and a setup script for installs (`.cursor/worktrees.json`, Zed's `create_worktree` hook, Claude Code's `WorktreeCreate` hook). A worktree nobody can build in is worse than no worktree.
- **Seed heavy directories with a copy-on-write copy, not a symlink.** On macOS, `cp -Rc node_modules <worktree>/node_modules` shares the disk blocks until something changes. Symlinking one `node_modules` across worktrees breaks module resolution and is explicitly discouraged in Cursor's own documentation.
- **Add a container when the agent runs the app, not just when it edits code.** Ports, databases, and background services are not isolated by a worktree.
- **Fan out on mechanical work, sequence ambiguous work.** A 400-file rename across 20 worktrees is safe. Two agents both designing the same module is not, however clean the folders are.
- **Set concurrency from how many diffs you will actually read today.** Practitioners writing publicly settle around two to five local agents. Nothing in the tools stops you at fifty.
- **Test the merge, not the branch.** A branch that passes alone tells you nothing about the pair. Both papers above measure exactly this gap.

## Where to go next

- [Worktree mechanics](01-worktree-mechanics.md): what git shares, what it keeps separate, and the commands and settings that matter.
- [Harness survey](02-harness-survey.md): tool by tool, with exact flags, file names, defaults, and limits.
- [Surface patterns](03-surface-patterns.md): the seven design patterns the tools converged on.
- [Failure modes and fixes](04-failure-modes-and-fixes.md): sixteen ways this breaks, each with a fix.
- [Decision guide](05-decision-guide.md): choosing between worktree, sandbox, container, and cloud.
- [Glossary](06-glossary.md) and [methodology and sources](07-methodology-and-sources.md).
