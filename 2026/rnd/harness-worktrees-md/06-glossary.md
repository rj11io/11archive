# Glossary

Terms used in this report, in plain words. Git terms come from the [git-worktree manual](https://git-scm.com/docs/git-worktree); product terms come from the documentation cited in [sources](07-methodology-and-sources.md).

## Agent and harness terms

**Agent harness.** The code around the model that runs the agent loop. VS Code's definition: the runtime that manages the session, calls tools, and applies changes to your code. The common shorthand is `agent = model + harness`.

**Inner harness.** The part shipped by the model's vendor: the loop, the built-in tools, the system prompt.

**Outer harness.** The part you add on top: instruction files, hooks, setup scripts, MCP servers. Most worktree seeding lives here.

**Surface.** Where you sit while the agent works: a terminal, an editor panel, a desktop app, a web page. One surface can host several harnesses. VS Code hosts four.

**Subagent.** A worker the main agent spawns inside one session. It has its own context window and returns a summary rather than its whole transcript.

**Background session.** A full agent session that runs without you watching it, reporting back when done.

**Best-of-N.** Running the same task several times, often under different models, then keeping one result and discarding the rest. Cursor's `/best-of-n` and Superset both do this.

**Fan-out.** Splitting one change into many independent units and giving each to its own agent.

**Semantic conflict.** Two changes that merge cleanly and are individually correct, but are incoherent together. One agent names a concept `Plan`, another names it `Subscription`. Git cannot detect it.

**Merge debt.** Work that is finished but not integrated, waiting in branches or pull requests. Grows with agent count.

## Git terms

**Worktree.** A folder holding a checked-out copy of a repository's files. Every repository has one main worktree; `git worktree add` creates additional **linked worktrees** that share the same repository.

**Main checkout.** The original working folder, the one whose `.git` is a real directory.

**Linked worktree.** An additional working folder. Its `.git` is a **file** containing two lines, `gitdir:` and `commondir:`, that point back at the repository.

**Object database.** Where git stores every commit, tree, and file version. Shared by all worktrees, which is why a second worktree costs only the checked-out files.

**`$GIT_DIR`.** Inside a linked worktree, the worktree's own private admin folder at `.git/worktrees/<id>/`. Holds that worktree's `HEAD`, `index`, and lock state.

**`$GIT_COMMON_DIR`.** The shared `.git` directory of the main checkout. Holds objects, refs, config, and hooks.

**`HEAD`.** Which commit this worktree is currently on. Private to each worktree.

**Index.** The staging area, the list of what would go into the next commit. Private to each worktree.

**Ref.** A name pointing at a commit: a branch (`refs/heads/main`), a tag, a remote-tracking branch, or the stash (`refs/stash`). All shared, except `refs/bisect/*`, `refs/worktree/*`, and `refs/rewritten/*`.

**Detached HEAD.** A worktree sitting on a specific commit with no branch attached. Used to sidestep git's rule that one branch cannot be checked out twice.

**One-branch rule.** Git refuses to check out the same branch in two worktrees at once, because both would try to advance it.

**Lock (worktree).** A marker file, written by `git worktree lock`, that stops git pruning, moving, or removing a worktree. Harnesses use it to protect a running agent's folder.

**Prune.** Removing stale bookkeeping for worktrees whose folders are gone. Never deletes a live folder.

**Repair.** Fixing the two pointers between a repository and a worktree after someone moved a folder by hand.

**`extensions.worktreeConfig`.** A repository setting that gives each worktree its own config file, so `git config --worktree <key> <value>` no longer changes the whole clone. Older git versions refuse to open a repository with it set.

**Sparse checkout.** Checking out only part of a repository, so a worktree contains a subset of the files.

**`.git/config.lock` and `.git/index.lock`.** Temporary files git creates while writing shared config or a worktree's index. Concurrent writes collide on them, which is the source of most parallel-agent failures.

**Superproject.** A repository containing submodules. The git manual does not recommend multiple checkouts of one.

**Jujutsu workspace.** Jujutsu's equivalent of a worktree, created with `jj workspace add`. Tied to a revision rather than a branch, so several workspaces can sit on the same work.

## Setup and isolation terms

**Gitignored file.** A file git deliberately does not track, listed in `.gitignore`. Examples: `.env`, `node_modules`, `dist`. A new worktree does not contain any of them.

**Seeding.** Putting the missing gitignored files and installed dependencies into a fresh worktree so the project can actually run there.

**`.worktreeinclude`.** Claude Code's copy list. Uses gitignore syntax, and copies a match only when the file is also gitignored, so tracked files are never duplicated.

**`git.worktreeIncludeFiles`.** VS Code's equivalent setting.

**`.cursor/worktrees.json`.** Cursor's setup script config, with `setup-worktree`, `setup-worktree-unix`, and `setup-worktree-windows` keys and a `$ROOT_WORKTREE_PATH` variable pointing at the main checkout.

**`WorktreeCreate` and `WorktreeRemove` hooks.** Claude Code hooks that replace worktree creation and removal entirely, used for non-git version control. Any non-zero exit code from `WorktreeCreate` fails creation.

**`create_worktree` hook.** Zed's hook, run after it creates a linked worktree, with `ZED_WORKTREE_ROOT` and `ZED_MAIN_GIT_WORKTREE` set.

**Copy-on-write clone, reflink.** A file copy that shares disk blocks with the original until one side changes. `cp -Rc` on APFS; `cp --reflink=auto` on btrfs and XFS with `reflink=1`. Fast per byte, still one operation per file.

**Pre-warmed pool.** A fixed set of worktrees kept ready and recycled, so activating one is a branch checkout rather than a full dependency install.

**Handoff.** Moving a session between the main checkout and a worktree. The Codex app's term; gitignored files do not travel with it.

**Folder isolation.** The agent works directly in your current folder and sees uncommitted changes. VS Code's name for the non-worktree mode.

**Worktree isolation.** The agent works in its own worktree, starting from committed state.

**Sandbox.** An operating-system boundary limiting what a process can read, write, and reach. Seatbelt on macOS; bubblewrap with Landlock and seccomp on Linux. Different from a worktree, which limits nothing at the OS level.

**Ephemeral environment.** A container or virtual machine created for one task and destroyed afterwards. How cloud harnesses get isolation without worktrees.
