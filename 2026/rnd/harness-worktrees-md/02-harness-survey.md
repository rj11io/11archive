# Harness survey: tool by tool

## What counts as a harness

VS Code's own documentation gives the cleanest working definition: an agent harness is "the runtime that runs the agent loop. It manages the session, calls tools, and applies changes to your code" ([VS Code, agent harnesses](https://code.visualstudio.com/docs/agents/concepts/agent-harnesses)). The wider 2026 shorthand is `agent = model + harness`, where the harness is everything that is not the model: the loop, the tool interface, context management, and the controls ([Agent harness, Wikipedia](https://en.wikipedia.org/wiki/Agent_harness)).

Two distinctions used throughout this section:

- **Harness versus surface.** VS Code is one surface that can host four harnesses (its own, Copilot, Claude, Codex). Warp is a surface that hosts other people's command-line harnesses. Worktree handling can live in either layer, and where it lives changes who is responsible for it.
- **Inner versus outer harness.** The inner harness ships with the model vendor. The outer harness is what you add: instruction files, hooks, MCP servers, setup scripts. Most worktree seeding work happens in the outer harness.

## Comparison matrix

Evidence state for this table: **source-reported** from each product's documentation as retrieved on 2026-08-11, except the two rows marked otherwise. Version and default values drift; check before relying on a number.

| Harness | How a worktree starts | Default location | Base commit | Seeds gitignored files | Blocks writes to main checkout | Landing the work | Automatic cleanup |
|---|---|---|---|---|---|---|---|
| Claude Code CLI | `claude --worktree <name>` or `-w`; `EnterWorktree` tool mid-session | `.claude/worktrees/<name>/`, branch `worktree-<name>` | `worktree.baseRef`: `fresh` (remote default branch) or `head` | `.worktreeinclude` file, gitignore syntax | Yes, three enforced checks | Commit and push; draft pull request for background sessions | Yes, on exit and by periodic sweep, gated on the worktree being clean |
| Claude Code desktop | Every new session, automatically | `<project>/.claude/worktrees/`, configurable in Settings, plus a branch prefix | Same as CLI | Same `.worktreeinclude` | Yes, same enforcement | Visual diff review, pull request | Archive icon per session; optional auto-archive after the pull request merges or closes |
| Cursor | Agents Window control, or `/worktree`, or `/best-of-n` | Not documented as a fixed path; tracked per machine | Not documented | `.cursor/worktrees.json` setup commands | Not documented | `/apply-worktree` into the main workspace, or commit and open a pull request from the worktree | Yes, `cursor.worktreeMaxCount` default 25 per machine, plus an interval sweep |
| OpenAI Codex app | Choose "Worktree" when creating a thread | `$CODEX_HOME/worktrees` | Chosen branch, checked out detached by default | Setup scripts via a chosen local environment | Not documented | "Create branch here", or "Hand off" the thread back to Local | Yes, keeps about 15 managed worktrees; snapshots before deleting; skips pinned or active threads |
| VS Code agent sessions (Copilot, Claude, Codex harnesses) | "New Worktree" checkbox in the Agents window | Separate folder managed by VS Code | Selected base branch, committed state only | `git.worktreeIncludeFiles` setting | No. Documented as an organisation boundary, not a security boundary | Review, then merge into your primary worktree yourself | No. Manual `git worktree remove` |
| Google Antigravity | "New Worktree Mode" per conversation | Not documented | Not documented | Not documented | Not documented | Not documented | Not documented |
| Gemini CLI | `--worktree` or `-w`, behind `"experimental": { "worktrees": true }` | Not stated in the pull request | Not stated | Not stated | Not stated | Resume instructions printed at exit | Yes, removes only when there are no untracked files and no new commits |
| Zed | Worktree picker beside the project picker | Linked worktree, detached HEAD | Detached at current commit | `create_worktree` hook, with `ZED_WORKTREE_ROOT` and `ZED_MAIN_GIT_WORKTREE` | Not documented | Review the diff, merge through your normal git workflow | Yes, on moving the thread to history; restoring the thread restores the worktree |
| Warp | You run `git worktree add` yourself | Wherever you put it | Yours | Yours | No | Yours | No |
| JetBrains IDEs 2026.1 | Built-in worktree support in the IDE | Not covered in the release overview | Not covered | Not covered | No | Normal IDE git workflow | Not covered |

Two rows deserve a note. **Antigravity** publishes the mode but not its mechanics, so most cells read "not documented" rather than "absent". **Gemini CLI** cells are drawn from the implementing pull request rather than a shipped documentation page; a third-party guide describes the feature as arriving in v0.38, which this report treats as secondary and unverified.

## Claude Code

The most detailed public specification of worktree handling in any harness, and the one worth reading even if you use something else. Source: [Run parallel sessions with worktrees](https://code.claude.com/docs/en/worktrees), plus the [hooks](https://code.claude.com/docs/en/hooks), [subagents](https://code.claude.com/docs/en/sub-agents), [agent view](https://code.claude.com/docs/en/agent-view), [tools](https://code.claude.com/docs/en/tools-reference), [desktop](https://code.claude.com/docs/en/desktop), and [sandboxing](https://code.claude.com/docs/en/sandboxing) pages.

### Starting one

```bash
claude --worktree feature-auth      # or -w
claude --worktree                   # name generated, e.g. bright-running-fox
claude --worktree "#1234"           # branch from a pull request
```

The default landing spot is `.claude/worktrees/<name>/` at the repository root, on a new branch `worktree-<name>`. A pull request argument fetches `pull/<number>/head` from `origin` and lands at `.claude/worktrees/pr-<number>`. Quote the `#` so the shell does not read it as a comment. Add `.claude/worktrees/` to `.gitignore` so worktree contents do not show up as untracked files in the main checkout.

Interactive runs need workspace trust first: run `claude` once in the directory and accept the dialog, otherwise `--worktree` exits with an error. Non-interactive runs with `-p` skip the trust check.

Mid-session, asking Claude to "work in a worktree" makes it call the `EnterWorktree` tool. Entering a path **outside** `.claude/worktrees/` always prompts for approval, because it moves the session's working directory, write access, and project configuration such as `CLAUDE.md`. A permission rule or "don't ask again" does not suppress that prompt; only `bypassPermissions` mode skips it. `ExitWorktree` returns the session to where it started.

### Choosing the base commit

`worktree.baseRef` in settings takes two values, and only two:

```json
{ "worktree": { "baseRef": "head" } }
```

- `fresh` (default): the repository's default branch on the remote, usually `main`. If the repository has not been fetched in 24 hours, Claude Code fetches, capped at five seconds, and falls back to the cached ref on failure. With no remote, or no cached `origin/HEAD` and no successful fetch, it falls back to the local `HEAD`.
- `head`: your current local `HEAD`, so the worktree carries unpushed commits. Inside a worktree, `head` means that worktree's `HEAD`.

You cannot set it to a branch name. To start from a specific branch, run `git worktree add` yourself.

### Enforcement, which is the interesting part

While a session is isolated, Claude Code **blocks** three classes of tool call rather than warning about them:

1. **File edits.** An `Edit`, `Write`, or `NotebookEdit` targeting a path in the main checkout fails.
2. **Working directory.** A `Bash`, `PowerShell`, or `Monitor` command whose working directory resolves to the main checkout fails, and so does one whose working directory cannot be verified as outside it.
3. **Git redirects.** A `Bash` or `Monitor` command that points git back at the main checkout fails, whether through `git -C`, `--git-dir`, `GIT_DIR`, `GIT_WORK_TREE`, or a `cd` before the git call. Commands too complex to verify are also blocked. PowerShell gets only the working-directory check.

The checks cover every subagent spawned from an isolated session, apply in background sessions as well as interactive ones, and extend to the main checkout that a linked worktree is linked from. Claude sees each refusal as a tool error naming the worktree.

This is the difference between "the agent has its own folder" and "the agent cannot leave its folder". Most other harnesses give the first and say so; VS Code says so explicitly.

### Subagents

Add one line of frontmatter and a subagent always runs in a temporary worktree:

```markdown
---
name: refactorer
description: Applies mechanical refactors across many files
isolation: worktree
---
Apply the requested refactor across every affected file, then run the tests
and report the results.
```

Behaviour: the worktree is removed automatically when the subagent finishes with no changes; a worktree with changes stays on disk. Subagent worktrees use the same base branch rule as `--worktree`, so by default they branch from the default branch, **not** from the parent session's `HEAD`. Set `worktree.baseRef: "head"` when the subagent needs to build on in-progress work. While an agent runs, Claude Code holds `git worktree lock` on its worktree so a concurrent sweep cannot remove it.

### Background sessions

Background sessions (`/bg`, `claude --bg`, or dispatch from agent view) start in the working directory and then move into a worktree under `.claude/worktrees/` **before** the first file change. Isolation is skipped when the session already sits in a linked worktree, when the directory is not a git repository and no `WorktreeCreate` hook exists, or when the write lands outside the working directory.

Escape hatch for repositories where worktrees are impractical:

```json
{ "worktree": { "bgIsolation": "none" } }
```

Then background sessions edit the working copy directly, with `.env` and `node_modules` already in place. The documentation's own caution applies: do not dispatch parallel sessions at the same files with this set.

When a background session finishes with changes, Claude Code commits without asking and pushes when a remote exists, opens a draft pull request when the task calls for it, and never pushes to `main` or `master`, never force-pushes, and never merges. Agent view shows the pull request number with a colour for its state.

### Cleanup rules

On exiting an interactive worktree session, Claude Code checks for changed files, untracked files, and new commits.

- Clean and unnamed: removed automatically, branch included.
- Clean and named: you are asked first.
- Has work: you choose keep or remove, and removing deletes the work.
- Non-interactive `-p` runs have no exit prompt, so nothing is cleaned up. Remove those with `git worktree remove`.

A periodic sweep removes subagent and background-session worktrees older than `cleanupPeriodDays` (default 30). The sweep skips any worktree holding changed files, untracked files, or unpushed commits, and never touches worktrees you made with `--worktree`. It also releases a lock left behind by a session whose process died, but never a lock you set yourself with `git worktree lock`.

### Replacing worktree creation entirely

`WorktreeCreate` fires when a worktree is about to be created and **replaces** the built-in git logic. It is unusual among Claude Code hooks in that **any** non-zero exit code fails creation, not just exit 2. Input arrives as JSON on stdin:

```json
{
  "session_id": "...",
  "transcript_path": "...",
  "cwd": "...",
  "hook_event_name": "WorktreeCreate",
  "worktree_path": "/path/to/worktree",
  "isolation": "worktree",
  "source": "cli"
}
```

`source` is `cli` for the `--worktree` flag or `background_session` for a background session. The hook prints the directory it created on stdout so Claude Code adopts it as the session's working directory. `WorktreeRemove` mirrors it at teardown with `source` of `session_exit`, `subagent_finish`, or `background_session_delete`, and its exit code is ignored.

The documented use for this is non-git version control. A Subversion example checks out a fresh working copy and echoes the path. Because the hook replaces the default logic, `.worktreeinclude` is no longer applied, so copy local configuration inside the hook.

### Sandbox interaction

Worth calling out because it is the one place a harness gets the shared-config problem right by construction. When the working directory is a linked worktree, the Bash sandbox allows writes to the main repository's shared `.git` directory so `git commit` can update refs and the index, but **keeps denying writes to `hooks/` and `config/` inside it** ([sandboxing](https://code.claude.com/docs/en/sandboxing)). A sandboxed command therefore cannot do to the shared config what the harness itself was reported doing in [issue 66993](https://github.com/anthropics/claude-code/issues/66993).

### `/batch`

A packaged fan-out: `/batch` splits one large change into 5 to 30 worktree-isolated subagents, each of which implements its unit, runs the tests, and opens a pull request. The documentation frames it for mechanical work (renames, framework migrations, repository-wide type cleanup) and warns against vague features or architecture-heavy work unless the target design is fixed first. That distinction is the practical rule from [failure mode 7](04-failure-modes-and-fixes.md#7-semantic-conflicts-that-git-cannot-see).

## Cursor

Source: [Worktrees, Cursor docs](https://cursor.com/docs/configuration/worktrees).

Four slash commands carry the workflow:

- `/worktree <task>`: run the rest of this chat in an isolated checkout.
- `/best-of-n <models> <task>`: run the same task under several models, each in its own worktree, then pick a winner. Example: `/best-of-n sonnet,gpt,composer fix the flaky logout test`.
- `/apply-worktree`: bring the changes into the main workspace to test them.
- `/delete-worktree`: remove the isolated checkout.

The Agents Window has native worktree controls; the IDE chat uses the slash commands. Cursor discovers worktrees it made and ones you made with `git worktree add`, and both are eligible for its cleanup.

Setup is declarative in `.cursor/worktrees.json`, read from the worktree path or the project root:

```json
{
  "setup-worktree": [
    "npm ci",
    "cp $ROOT_WORKTREE_PATH/.env .env",
    "npm run db:migrate"
  ]
}
```

Three keys are supported: `setup-worktree-unix` and `setup-worktree-windows` take precedence on their platform, `setup-worktree` is the fallback. Each key takes an array of shell commands or a path to a script relative to the config file. `$ROOT_WORKTREE_PATH` (or `%ROOT_WORKTREE_PATH%` on Windows) points at the main checkout, which is how `.env` gets copied.

Two settings bound the mess: `cursor.worktreeMaxCount` keeps 25 worktrees per machine by default, shared across all workspaces on the device, and `cursor.worktreeCleanupIntervalHours` sets the sweep frequency. Creating a worktree that would exceed the cap triggers immediate cleanup rather than waiting for the interval; newer worktrees are kept.

Cursor's documentation is also the clearest on the dependency question: do not symlink dependencies into a worktree, because it causes problems in the main worktree; install fresh with a fast package manager instead.

Nothing merges automatically, including after `/best-of-n`. You pick, then commit from the worktree or apply.

Widely repeated third-party claims that Cursor caps parallel agents at eight, or that the config file is `worktree.json` in the project root, do not appear in the official page. Treat both as unverified.

## OpenAI Codex

Two separate axes, which are easy to confuse.

**Thread mode** decides where the files live. Creating a thread in the Codex app offers Local, Worktree, or Cloud. Worktree mode creates a git worktree from your local checkout, checked out **detached by default**, and its documentation states plainly that worktrees only work in git repositories. Worktrees live in `$CODEX_HOME/worktrees`; the app keeps about 15 managed worktrees by default, adjustable in settings, and will not auto-delete one attached to a pinned conversation or an active thread. It snapshots before deleting so a removal can be restored. Background automations run on dedicated worktrees so they do not collide with foreground work.

**Handoff** moves a thread between Local and Worktree in either direction, and Codex performs the git steps. Use it when you want to read the changes in your usual editor, run your existing dev server, or validate in the environment you already have. One documented limit: files matching `.gitignore` do not transfer during a handoff. From the worktree side, "Create branch here" turns detached work into a real branch so you can commit and open a pull request. The documentation names git's one-branch rule as the reason Handoff exists rather than dual checkout.

**Sandboxing** is the other axis and is not about worktrees at all. Codex enforces at the operating-system level: Seatbelt on macOS, bubblewrap on Linux and WSL2, and a native sandbox on Windows. Keys are `sandbox_mode` (`read-only`, `workspace-write`, `danger-full-access`), `approval_policy` (`untrusted`, `on-request`, `never`), and the `--sandbox` and `--ask-for-approval` flags; `sandbox_workspace_write.writable_roots` widens the write scope. The guidance is worth quoting for its architecture advice: keep the project boundary as the default and use separate projects or worktrees rather than broadening access across unrelated repositories ([Codex sandboxing](https://learn.chatgpt.com/docs/sandboxing)).

Sources: the Codex app worktrees page as mirrored at [doc.jarvisuni.com](https://doc.jarvisuni.com/openai/codex/app/worktrees.html), and the sandboxing page above. The worktrees page is reached here through a mirror of `developers.openai.com`, which is noted in [sources](07-methodology-and-sources.md).

## VS Code and GitHub Copilot

VS Code is the clearest example of worktree handling living in the **surface** rather than the harness. It runs four harnesses (its own local one, Copilot, Claude, Codex) and provides isolation for all of them ([background agents](https://code.visualstudio.com/docs/copilot/agents/background-agents)).

Two isolation modes, chosen when you create a session:

- **Folder**: the agent works in your current folder and sees uncommitted changes. All permission levels available. Good for small interactive tasks.
- **New Worktree**: a new branch and worktree, starting from the committed state of a base branch you choose. Requires a git repository with at least one commit.

Three details make this the most instructive entry in the survey:

1. **Worktree sessions are forced to Bypass Approvals** and the level cannot be changed, because the agent's changes are separate from your active workspace. Isolation is traded directly for autonomy.
2. **The documentation refuses to overclaim.** Worktree isolation "doesn't restrict commands, network access, or access outside the worktree"; it is a code organisation boundary, not a security one, and you should configure agent sandboxing for those protections. Every harness could say this and only this one does.
3. **`git.worktreeIncludeFiles`** is the declarative fix for the gitignored gap, and the docs name the problem exactly: gitignored files such as `.env` and installed dependencies are absent by default, and uncommitted tracked changes do not transfer either.

The Chat view always uses folder isolation. All chats in one agent host session share the same folder or worktree unless you deliberately start separate worktree sessions.

An independent write-up adds two field observations: the agent auto-commits after each turn, giving a clean history, and worktree creation can fail inside dev containers, with cleanup left to `git worktree remove` by hand ([Ken Muse](https://www.kenmuse.com/blog/workspace-vs-worktree-isolation-in-copilot-cli/)). A DEV Community article dates the Agents-window worktree work to VS Code 1.127 through 1.131; treat that version range as secondary and unverified.

## Google Antigravity

Antigravity replaced its earlier one-repository workspace model with **projects** that can span several folders, each project carrying its own agent settings and permissions ([Antigravity projects](https://antigravity.google/docs/projects)).

Conversations start in one of two modes. Local mode works directly in your existing folders. **New Worktree Mode** creates a fresh git worktree per conversation, and the documentation notes it "will spawn a new Git worktree for all active Git checkouts", so a multi-folder project gets a worktree per git checkout while non-git folders stay as they are. The stated purpose is to keep your active folder untouched and stop parallel agents conflicting.

The Agent Manager is the surface for watching several agents across workspaces, with the guidance being one agent per workspace to avoid conflicts. Mechanics (paths, base commits, seeding, cleanup) are not published, which is why the matrix rows are empty rather than negative.

## Gemini CLI

Worktree support arrived as a `WorktreeService` in the core package, with a `--worktree` / `-w` flag that accepts a name or generates one, gated behind `"experimental": { "worktrees": true }` ([pull request 22973](https://github.com/google-gemini/gemini-cli/pull/22973)).

The cleanup design is the notable part and matches the direction Claude Code took: on exit, the service checks for untracked files and new commits, removes the worktree only when there are none, preserves it otherwise, and prints instructions for resuming in a preserved worktree. That is the correct default, and it is the fix for [failure mode 3](04-failure-modes-and-fixes.md#3-automatic-cleanup-deletes-the-work).

## Zed

Zed treats worktrees as a first-class part of its threads model ([Parallel Agents, Zed docs](https://zed.dev/docs/ai/parallel-agents)).

- Creation is through a worktree picker to the right of the project picker in the title bar.
- **New worktrees start detached**, and the documentation gives the reason: so you do not accidentally share a branch between worktrees. This is git's one-branch rule handled by construction rather than by error message.
- The `create_worktree` hook runs automatically after Zed creates a linked worktree, with `ZED_WORKTREE_ROOT` pointing at the new worktree and `ZED_MAIN_GIT_WORKTREE` at the original repository. Those two variables are all a setup script needs to copy secrets and install dependencies.
- Threads in linked worktrees group under the same project as their main worktree in the Threads Sidebar. The guidance is direct: if two threads might edit the same files, start one in a new worktree.
- Lifecycle is tied to the thread, not the folder. Moving a thread to Thread History saves the git state and removes the worktree from disk when no other active thread uses it; restoring the thread restores the worktree. That is the tidiest cleanup model in the survey, because a human action drives it.
- Landing is deliberately plain: review the diff and merge through your normal git workflow.

A public discussion of Zed's parallel agents surfaces the strongest field criticism collected for this report, and it is not about worktrees. The hardest problem practitioners named was semantic collision: when one agent renames a type `X` and another independently names it `Y`, neither worktree is wrong and the combined code is incoherent, and no coordination layer exists for that. Two more themes: shared test data defeats folder isolation (one team abandoned per-branch Postgres schemas because reasoning about which agent broke a shared migration got tiring, and went back to sequential agents), and review of parallel output can consume the gains ([Hacker News discussion](https://news.ycombinator.com/item?id=47866750)).

## Warp

Warp is the clean example of a surface that adds no worktree creation and still adds value ([Warp git worktrees](https://docs.warp.dev/code/git-worktrees/)).

You create worktrees with plain git commands. Warp then detects them by reading the `.git` file that points back at the main repository, and treats each as a fully functional repository:

- The git status chip shows the branch and change counts for that worktree.
- The code review panel shows that worktree's own uncommitted changes, so you can review diffs, revert hunks, and discard changes independently.
- File watching covers both the worktree's files and the shared `.git` folder.
- **Each worktree is indexed independently for codebase context**, which is what makes an agent in a worktree get correct answers about its own files.

Because Warp hosts other harnesses in tabs, this is also the common way to run Claude Code, Codex CLI, Gemini CLI, Amp, and others side by side, each in its own worktree. No setup scripts, no cleanup tooling.

## JetBrains IDEs

IntelliJ IDEA 2026.1 added first-class git worktree support, and the release notes name the reason: with the growth of AI agents, running tasks in parallel became a major time-saver, which is where worktrees help. The framing is "create a worktree for an urgent hotfix, hand another to an agent, keep working on your main branch" ([What's new in IntelliJ IDEA 2026.1](https://www.jetbrains.com/idea/whatsnew/2026-1/)). The overview does not cover shared indexing, visual indicators, or limits, so those cells stay empty.

## Third-party orchestrators and helpers

These fill the gaps the first-party tools leave, mostly runtime isolation and multi-agent review.

Read this table as a catalogue, not an assessment. Capability descriptions come from each project's own public summary and none were tested here. The two status claims marked in bold were verified directly against the repositories on 2026-08-11, because calling a live project dead is a mistake worth a fetch to avoid.

| Tool | What it adds | Isolation model | Status |
|---|---|---|---|
| [Superset](https://github.com/superset-sh/superset) | Run many agents at once, each with its own worktree, branch, terminal, and environment; compare results and merge the winner | Worktree per agent | Active, open source; desktop app, CLI, and MCP server |
| [container-use](https://github.com/dagger/container-use) | Worktree **plus** a Dagger-managed container per agent, each agent committing to its own `container-use/<env>` branch, with all changes auto-committed for an audit trail | Worktree and container | Active, MCP server |
| Sculptor (Imbue) | A Docker container per agent, so agents can install packages and run services without touching the host | Container per agent | Source-reported as open source, macOS on Apple Silicon and Linux; not independently verified |
| Conductor | Mac desktop app running parallel Claude Code, Codex, and Cursor agents in isolated workspaces, with Linear integration | Worktree per agent | Source-reported: Mac-only, closed source; not independently verified |
| [treehouse-worktree](https://github.com/mark-hingston/treehouse-worktree) | Worktree manager for parallel agents with both CLI and MCP interfaces, including locking a worktree to stop two agents entering it | Worktree per agent | Active |
| [Docktree](https://docktree.dev/) and [worktree-compose](https://github.com/mostafasudo/worktree-compose) | Per-worktree Docker Compose isolation: unique project name, container names, volumes, and auto-allocated ports, generated as override files over your existing `docker-compose.yml` | Runtime isolation on top of worktrees | Active |
| [git-cow-worktree](https://github.com/josharian/git-cow-worktree) | Reflink-seeded worktrees: `--no-checkout`, copy-on-write copy from a similar worktree, then checkout | Seeding helper | Active |
| [opencode-worktree](https://github.com/kdcokenny/opencode-worktree) | Worktree tools for OpenCode: spawns a terminal per worktree, syncs files, commits and cleans up on exit | Worktree per agent | Active |
| [Crystal](https://github.com/stravu/crystal) | Was a desktop app for parallel Claude Code sessions, one worktree each | Worktree per agent | **Deprecated.** Its README says it has been replaced by Nimbalyst |
| [Vibe Kanban](https://github.com/BloopAI/vibe-kanban) | Was a Kanban board over parallel agents with visual review | Worktree per agent | **Sunsetting**, per the banner in its README. Code remains under Apache-2.0 |

The churn matters. Two of the best-known worktree orchestrators of the past year are gone, and both were replaced by paid successors. Build your worktree workflow on git commands and repository-committed setup scripts, not on a specific wrapper.

## Harnesses that skip worktrees entirely

When the agent gets its own machine, branch-per-task replaces worktree-per-task, and every problem in [failure modes](04-failure-modes-and-fixes.md) except the semantic ones goes away.

| Harness | Isolation | Consequence |
|---|---|---|
| Claude Code on the web | An Anthropic-managed virtual machine per session, a network proxy enforcing a default allowlist, and a separate proxy that keeps your GitHub token outside the sandbox while issuing scoped credentials inside it | Full operating-system isolation with no infrastructure to run. Organisations can route sessions to self-hosted environments, where isolation and egress control become theirs |
| GitHub Copilot coding agent | An ephemeral GitHub Actions container per session, destroyed afterwards | No state carries between sessions |
| Codex cloud | An ephemeral sandbox per cloud task | Fresh environment per task |
| Cursor cloud agents | Ephemeral remote machines | Local machine stays free |
| Devin | A cloud virtual machine per task, described as persistent rather than ephemeral | State survives across operations, at the cost of drift |

Claude Code's own comparison of isolation options ranks these by what they contain: the sandboxed Bash tool covers Bash commands and their children; the sandbox runtime covers the whole process including file tools, MCP servers, and hooks; dev containers and custom containers cover a full development environment; a virtual machine covers a full operating system ([sandbox environments](https://code.claude.com/docs/en/sandbox-environments)). Worktrees appear in none of those rows, which is the point: **a worktree is not a sandbox.** It is a naming and ownership boundary for files.

Continue to [surface patterns](03-surface-patterns.md).
