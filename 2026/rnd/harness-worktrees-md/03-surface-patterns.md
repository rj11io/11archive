# Surface patterns: what the tools converged on

Nine tools built worktree support independently within about a year. They landed on seven of the same patterns. Each pattern below is worth copying if you build a harness, and worth recognising if you use one, because the pattern tells you where the responsibility sits.

## Pattern 1: three entry points, not one

Every harness offers at least one of these, and the mature ones offer two or three.

| Entry point | Example | When it fits |
|---|---|---|
| Flag at launch | `claude --worktree feature-auth`, `gemini -w` | You already know this session is a parallel one |
| Mode at session creation | Codex app "Worktree" thread, VS Code "New Worktree" checkbox, Antigravity "New Worktree Mode" | A graphical surface where the choice belongs next to the other session settings |
| Tool or command mid-session | Claude Code's `EnterWorktree`, Cursor's `/worktree` | You discover halfway through that this needs isolating |

The mid-session entry point is the one to get right, because it is the one an agent triggers. Two safeguards seen in practice:

- **Approve moves outside the sanctioned directory.** Claude Code prompts before `EnterWorktree` targets a path outside `.claude/worktrees/`, because entering moves the session's working directory, its write access, and its project configuration. A permission rule cannot suppress that prompt; only `bypassPermissions` mode skips it.
- **Restrict the tool once isolated.** From inside a worktree session, or from a subagent with a pinned working directory, only the "switch to an existing path" form is available, and the target must be under the repository's own worktree directory.

## Pattern 2: pick the base commit deliberately

The default matters more than it looks. Three choices exist and each has a failure mode.

| Base | Who uses it | What it gets right | What it breaks |
|---|---|---|---|
| Remote default branch, freshly fetched | Claude Code default (`worktree.baseRef: "fresh"`) | The agent starts from clean, shared reality; the branch merges without carrying your local mess | An agent asked to build on your uncommitted work starts from the wrong place and quietly redoes it |
| Local `HEAD` | Claude Code `"head"`, VS Code's selected base branch (committed state) | Carries unpushed commits and feature-branch state | Inherits any local breakage, and the branch is harder to land |
| Detached commit | Zed on every create, Codex app by default | Sidesteps git's one-branch rule completely, so several agents can sit on the same work | Nothing to push until someone names a branch, so the work is easy to lose track of |

Two implementation details worth stealing:

- **Keep the fetch bounded.** Claude Code fetches the default branch only when the repository has not been fetched in 24 hours, caps the fetch at five seconds, and uses the cached ref if that fails. A worktree creation that hangs on a slow network is a worktree creation nobody uses.
- **Promote a detached worktree explicitly.** The Codex app's "Create branch here" turns detached work into a branch you can commit and open a pull request from. Without a promote action, detached HEAD is a trap.

## Pattern 3: close the gitignored gap, one of four ways

A worktree contains committed files only. Every harness needs an answer for `.env` and `node_modules`, and there are exactly four in the field.

| Approach | Mechanism | Cost | Best for |
|---|---|---|---|
| Declarative copy list | Claude Code `.worktreeinclude`, VS Code `git.worktreeIncludeFiles` | Milliseconds | Secrets and local config |
| Setup script | Cursor `.cursor/worktrees.json`, Zed `create_worktree` hook, Claude Code `WorktreeCreate` hook | Whatever your install takes | Dependencies, migrations, code generation |
| Copy-on-write copy | `cp -Rc` on APFS, reflink on btrfs or XFS with `reflink=1` | Roughly one syscall per file, no extra disk | Large dependency trees on a supporting filesystem |
| Pre-warmed pool | Custom tooling; recycle a fixed set of worktrees | Built once, then near zero | Monorepos where installs run in minutes |

Two design notes:

- **The copy list should only copy ignored files.** Claude Code copies a match only when the file is also gitignored, so tracked files are never duplicated into a divergent second copy. That single rule prevents a nasty class of bug where a worktree carries a stale copy of a tracked file.
- **The setup script needs a pointer home.** Every implementation passes the main checkout's path in an environment variable: `$ROOT_WORKTREE_PATH` in Cursor, `ZED_MAIN_GIT_WORKTREE` in Zed. Without it, `cp` from the main checkout is guesswork.

An anti-pattern with a documented reason: symlinking one `node_modules` across worktrees. Node's module resolution follows real paths and gets confused, so tests pass in one worktree and fail in another. Cursor's documentation warns against it directly.

## Pattern 4: separate the organisation boundary from the security boundary

This is where harnesses differ most, and where the words used in documentation matter.

Three levels exist in the wild:

1. **Convention only.** The worktree is a different folder and nothing stops the agent leaving it. Warp, JetBrains, and any manual `git worktree add` workflow.
2. **Harness-enforced writes.** The harness inspects each tool call and blocks the ones that reach the main checkout. Claude Code is the reference implementation, with three checks: file edits by path, command working directory, and git redirects through `git -C`, `--git-dir`, `GIT_DIR`, `GIT_WORK_TREE`, or a `cd`. Commands it cannot verify are blocked rather than allowed.
3. **Operating-system enforced.** Seatbelt on macOS, bubblewrap with Landlock and seccomp on Linux, a container, or a virtual machine. This is the only level that stops arbitrary child processes.

VS Code states the boundary plainly: worktree isolation does not restrict commands, network access, or access outside the worktree, and you should configure agent sandboxing for those protections. Take that as the general rule, and treat level 2 as a correctness feature rather than a security one.

One clean example of the two layers cooperating: Claude Code's Bash sandbox lets a command in a linked worktree write the shared `.git` directory so `git commit` works, while still denying writes to `hooks/` and `config/` inside it. Files needed for the job are writable; the two files that would affect the whole clone are not.

A tradeoff to notice: VS Code sets worktree sessions to Bypass Approvals and does not let you change it, on the grounds that the agent cannot touch your working copy. Isolation buys autonomy. That is reasonable at level 2 for file safety and unreasonable for anything else, which is why the same page points at sandboxing.

## Pattern 5: landing the work, five ways

Nobody auto-merges. Five distinct landing models are in use, and the choice reveals what the tool thinks the worktree is for.

| Model | Example | The worktree is treated as |
|---|---|---|
| Apply to the main workspace | Cursor `/apply-worktree` | A scratch area whose diff you want locally |
| Hand the session back | Codex app "Hand off" to Local | A place the thread visited, not where it lives |
| Commit and open a pull request | Claude Code background sessions, Copilot coding agent | A branch factory |
| Review and merge in place | Zed, VS Code, Warp | An ordinary git branch |
| Pick a winner from several | Cursor `/best-of-n`, Superset | One candidate among many |

Two details worth copying:

- **Say what the tool will never do.** Claude Code documents that background sessions never push to `main` or `master`, never force-push, and never merge. A written negative list is what makes automatic commits acceptable.
- **Gitignored files do not travel.** The Codex app documents that files matching `.gitignore` do not transfer during a handoff. Any apply or handoff step needs this stated, or people lose local config and blame the tool.

The best-of-N model deserves its own note. It answers a real property of language models: the same prompt run twice gives different results. Running three models on one flaky test in three worktrees and keeping the best is a legitimate use of parallelism that has no merge problem at all, because you throw two away. It is the cheapest form of parallel agent work and the most underused.

## Pattern 6: lifecycle, quota, and the refusal to delete work

Worktrees accumulate. Every tool that creates them automatically also caps them, and the caps are all count-based or age-based.

| Control | Implementation |
|---|---|
| Lock while running | Claude Code runs `git worktree lock` on an agent's worktree so a concurrent sweep cannot remove it, and releases it when the agent finishes |
| Release a stale lock | Claude Code's sweep releases a lock left by a session whose process exited, and never releases a lock you set yourself |
| Cap by count | Cursor keeps 25 per machine by default, shared across workspaces, and cleans up immediately rather than waiting when a new one would exceed the cap. The Codex app keeps about 15 |
| Cap by age | Claude Code's sweep removes subagent and background-session worktrees older than `cleanupPeriodDays`, default 30 |
| Exempt the ones you asked for | Claude Code's sweep never removes worktrees created with `--worktree`. The Codex app never auto-deletes one attached to a pinned conversation or active thread |
| Snapshot before delete | The Codex app snapshots a worktree before deletion so removal can be restored |
| Tie lifetime to the human action | Zed saves the git state and removes the worktree when you move the thread to history, and restores it when you restore the thread |

The rule that matters more than all of them: **never remove a worktree that holds work.** Every mature implementation now checks for changed files, untracked files, and unpushed commits before removing, and Gemini CLI's implementation was written this way from the start. The reason this became a design rule is [failure mode 3](04-failure-modes-and-fixes.md#3-automatic-cleanup-deletes-the-work): a commit that fails on a lock, followed by an agent exit, followed by a sweep, equals lost work.

## Pattern 7: re-binding a session to its worktree

A session that lives in a worktree has to find it again after a restart, and the worktree might have been moved, deleted, or replaced with something that only looks like a worktree. This is the least visible pattern and the one with the most edge cases.

Claude Code is the only surveyed harness with this specified in public, and the specification is instructive:

- **Resume returns the session to its worktree**, in interactive mode, in `-p` mode with `--continue` or `--resume`, and through the Agent SDK.
- **The identity of the folder is checked first.** If the folder's `.git` file resolves into the main checkout, or git resolves its working tree back to the main checkout through a `core.worktree` redirect, the harness refuses it. The reason given is concrete: from such a folder, `git reset --hard` would act on the main checkout instead.
- **A refused folder is left in place**, because it may hold work.
- **Where you launched from changes the answer.** A worktree created under the sanctioned directory is re-entered even when you launch from inside it. Launching from inside some other worktree only works when the harness can vouch for it from there.
- **A network path is never resumed into.**
- **Refusal downgrades rather than crashes** in interactive mode: the session continues without isolation and says so. In `-p` mode and the SDK it stops with an error instead, because a script silently losing isolation is worse than a script failing.

The transferable lesson: **verify the folder's git identity before adopting it as an isolation boundary, and treat "cannot verify" as "refuse".** A folder that is not really a separate checkout, but is treated as one, turns every enforcement check in [pattern 4](#pattern-4-separate-the-organisation-boundary-from-the-security-boundary) into a no-op.

## What no pattern covers

Three gaps are shared by every tool surveyed.

1. **Runtime isolation.** No first-party harness allocates ports, names Docker Compose projects, or provisions a database per worktree. Third-party tools do it by generating Compose override files. If your agent runs the app, this is your problem.
2. **Semantic coordination.** No tool prevents two agents from making incompatible but individually correct decisions. The only working answers are human: partition ownership, fix shared interfaces before fanning out, or sequence the work.
3. **Concurrency sized by review capacity.** Caps are set by disk and count. The real constraint is how many diffs a person will read. Nothing in any tool measures that.

Continue to [failure modes and fixes](04-failure-modes-and-fixes.md).
