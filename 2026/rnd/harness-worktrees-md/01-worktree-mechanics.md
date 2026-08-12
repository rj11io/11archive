# Worktree mechanics: what git actually shares

Everything a harness can and cannot do with worktrees follows from one design choice git made: **a worktree gets its own files and its own place in history, but it borrows the repository.** Read this section once and most harness bugs become predictable.

Source for this section: the [git-worktree manual](https://git-scm.com/docs/git-worktree).

## The shape on disk

Start with a normal clone at `/work/app`. Its repository lives in `/work/app/.git`, a directory.

Run this:

```bash
git worktree add /work/app-feature -b feature-auth
```

You now have two working folders and still one repository.

- `/work/app-feature/.git` is a **file**, not a directory. It contains two lines:

```text
gitdir: /work/app/.git/worktrees/app-feature
commondir: /work/app/.git
```

- `/work/app/.git/worktrees/app-feature/` is the private admin folder for the new worktree. It holds that worktree's `HEAD`, its `index` (the staging area), a `gitdir` file pointing back at `/work/app-feature`, a `locked` file if you lock it, and a `config.worktree` file if per-worktree config is switched on.

Two environment concepts follow from this, and they explain most confusion:

- `$GIT_DIR` inside the worktree is `/work/app/.git/worktrees/app-feature`, the private part.
- `$GIT_COMMON_DIR` is `/work/app/.git`, the shared part.

Never read `$GIT_DIR` directly in a script. Ask git which one applies:

```bash
git rev-parse --git-path HEAD          # private: the worktree's own HEAD
git rev-parse --git-path refs/heads/main   # shared: the repository's branches
```

## Private versus shared

This table is the single most useful thing to know. Anything in the right column is a place where two agents can collide even though they have separate folders.

| Private to each worktree | Shared by every worktree |
|---|---|
| Working files on disk | The object database and pack files (all commits, trees, blobs) |
| `HEAD`, so each worktree points at its own commit | Every ref under `refs/`, except the three below |
| `index`, the staging area | `refs/heads/*` branches, `refs/tags/*`, `refs/remotes/*` |
| `refs/bisect/*`, bisect state | `refs/stash`, because it is an ordinary ref under `refs/` |
| `refs/worktree/*` | `.git/config`, the repository configuration |
| `refs/rewritten/*`, rebase state | `.git/hooks`, the hook scripts |
| Sparse-checkout selection (`core.sparseCheckout`) | Committed `.gitignore` and `.gitattributes` content |
| `config.worktree`, only if `extensions.worktreeConfig` is on | Reflogs for shared refs, and `git gc` behaviour |

Three consequences worth stating outright, because harnesses trip on all three:

1. **`git stash` is shared.** `refs/stash` sits under `refs/`, so it is not per-worktree. Two agents stashing in "their own" worktrees push onto one stack. Tell agents to commit, not stash.
2. **`.git/config` is shared.** A harness that runs `git config <key> <value>` while the current directory is a worktree writes to the whole clone. See [failure mode 1](04-failure-modes-and-fixes.md#1-writing-gitconfig-from-a-worktree-changes-the-whole-clone).
3. **Hooks are shared.** Every worktree runs the same hook scripts from `.git/hooks` unless `core.hooksPath` says otherwise, and `core.hooksPath` itself lives in the shared config.

## The one-branch rule

Git refuses to check out the same branch in two worktrees at once. This is deliberate: two folders advancing one branch would corrupt each other's idea of where it is.

For agents this rule shows up constantly, because a natural request is "put this agent on `main` too". Three ways around it, all in use today:

- **Detached HEAD.** `git worktree add --detach <path>` checks out a commit with no branch attached. Zed does this on every worktree it creates, and the Codex app creates worktrees detached by default. No branch, no conflict.
- **A new branch per worktree.** `git worktree add <path> -b <branch>`. Claude Code names it `worktree-<name>`; harnesses generally derive a name from the session.
- **Move the session instead of the branch.** The Codex app's "Handoff" moves a thread between the local checkout and a worktree, and its documentation names dual checkout as the thing Handoff exists to avoid.

## Commands worth knowing

```bash
# create
git worktree add <path>                    # branch guessed from the path basename
git worktree add <path> -b <new-branch>    # new branch; -B resets an existing one
git worktree add --detach <path>           # no branch attached
git worktree add --orphan <path>           # empty index, unborn branch
git worktree add --no-checkout <path>       # register it, write no files yet
git worktree add --lock <path>             # created already locked
git worktree add --relative-paths <path>   # portable admin files

# inspect
git worktree list
git worktree list --porcelain -z           # machine-readable, for tooling

# protect and release
git worktree lock --reason "agent running" <path>
git worktree unlock <path>

# move and remove
git worktree move <path> <new-path>
git worktree remove <path>                 # refuses if dirty
git worktree remove --force <path>         # removes anyway

# repair and reclaim
git worktree prune --dry-run
git worktree prune --expire 3.months.ago
git worktree repair [<path>...]
```

Notes that matter for automation:

- `list --porcelain` marks a worktree `locked` or `prunable`. That is the correct way for a tool to decide whether it may clean up.
- `lock` writes `$GIT_DIR/worktrees/<id>/locked` with your reason in plain text. It blocks pruning, moving, and removal. Claude Code locks a worktree while an agent runs there and releases it afterwards.
- `prune` only removes stale bookkeeping, never a live folder. Git also prunes automatically after `gc.worktreePruneExpire`.
- `repair` fixes the two pointers after someone moves a folder by hand. Run it from the main checkout after moving the main checkout, or from inside a moved worktree.
- `--no-checkout` is the hook for advanced seeding: register the worktree, copy files in cheaply, then run `git checkout` to fill the gaps and sync the index.

## Per-worktree configuration

By default there is one config file. Turn on the extension to get a second, private one:

```bash
git config extensions.worktreeConfig true
git config --worktree core.sparseCheckout true
```

After that, shared settings stay in `.git/config` and private ones go to `.git/config.worktree` for the main checkout, or `.git/worktrees/<id>/config.worktree` for a linked one.

Three settings should never be shared once the extension is on, and the git manual says so: `core.worktree`, `core.bare` when true, and `core.sparseCheckout` unless every worktree uses it. Move them out of `.git/config` by hand when you enable the extension.

One cost: older git versions refuse to open a repository with `extensions.worktreeConfig` set. The same applies to `worktree.useRelativePaths true`, which sets `extensions.relativeWorktrees` and makes the admin files portable across moved directories.

## Sparse checkout: give an agent less to see

A worktree does not have to contain the whole repository. In a large monorepo this cuts both disk use and the surface an agent can wander into:

```bash
git worktree add --no-checkout ../agent-billing -b agent-billing
cd ../agent-billing
git sparse-checkout init --cone
git sparse-checkout set services/billing packages/shared
git checkout
```

The tradeoff is real: an agent asked to fix a cross-cutting bug cannot see the file it needs, and the failure looks like "the file does not exist" rather than "you were not given it". Use sparse checkout when task boundaries are already firm.

## Documented limits

The git manual is unusually candid here, and these limits carry straight into agent tooling.

- Multiple checkout is described as still experimental.
- **Submodule support is incomplete.** `git worktree move` fails on a worktree containing submodules. `remove` needs `--force`. The manual explicitly does not recommend multiple checkouts of a superproject.
- Worktrees are identified by path, and an ambiguous final path component needs more of the path to disambiguate. `git worktree lock ghi` fails when both `/abc/def/ghi` and `/abc/def/ggg` exist; use `def/ghi`.

## What a worktree does not copy

This is the gap every harness has to paper over. `git worktree add` writes **committed files for the chosen commit and nothing else**. Missing on arrival:

- Files you deliberately ignore: `.env`, `.env.local`, local certificates, service-account keys.
- Installed dependencies: `node_modules`, `vendor`, `.venv`, `target`.
- Build output and caches: `dist`, `.next`, `.turbo`, `__pycache__`.
- Local databases, seeded fixtures, and anything else living outside the repository.

Four ways to close the gap, in rising order of engineering effort:

1. **Copy a declared list.** Cheap, exact, good for secrets. Claude Code reads `.worktreeinclude` (gitignore syntax, and it copies a match only when the file is also gitignored, so tracked files are never duplicated). VS Code has `git.worktreeIncludeFiles`.
2. **Run a setup script.** Slow but correct, and it documents the project's real setup. Cursor reads `.cursor/worktrees.json`; Zed runs a `create_worktree` hook with `ZED_WORKTREE_ROOT` and `ZED_MAIN_GIT_WORKTREE` set; Claude Code lets a `WorktreeCreate` hook replace worktree creation entirely.
3. **Copy-on-write clone the heavy directories.** On a filesystem that supports reflinks (APFS on macOS, btrfs, XFS built with `reflink=1`), a copy shares disk blocks until something changes:

   ```bash
   cp -Rc /work/app/node_modules /work/app-feature/node_modules
   ```

   A 1GB dependency directory then costs no extra disk and appears at once. The catch is file count, not file size: the copy still creates one directory entry per file. On a monorepo with 750,000 files in its dependencies, one practitioner found copy-on-write cloning, hardlink installs, and symlinks all too slow or too broken, and moved to a pool of pre-warmed worktrees instead, re-running the install only when the lockfile changed ([Dave Schumaker](https://daveschumaker.net/use-git-worktrees-they-said-itll-be-fun-they-said/)).

   The `--no-checkout` variant of this idea is packaged as [git-cow-worktree](https://commaok.xyz/post/git-cow-worktrees/): register the worktree without files, reflink-copy from a similar existing worktree, then `git checkout` to reconcile.

4. **Do not create worktrees on demand at all.** Keep a fixed pool and recycle slots. Slowest to build, fastest to use.

**Do not symlink `node_modules` between worktrees.** Node's module resolution follows the real path and gets confused, so tests pass in one worktree and fail in another for no visible reason. Cursor's own documentation warns against it and points at fast installers (`bun`, `pnpm`, `uv`) instead.

## Other version control systems

Worktrees are a git feature, and the pattern does not transfer for free.

- **Jujutsu (`jj`)** has workspaces: `jj workspace add ../agent-auth`. A workspace is tied to a revision rather than a branch, so jj has no equivalent of git's one-branch rule and several workspaces can sit on the same work. Every command snapshots the working copy automatically, so switching never needs a stash, and each workspace shows up in `jj log` with its own marker. Two limits reported in jj's own compatibility notes: git worktree commands are not supported against a jj repository, and partial clones are unsupported.
- **Everything else** needs the harness to delegate. Claude Code exposes `WorktreeCreate` and `WorktreeRemove` hooks precisely for this, with a documented Subversion example that checks out a fresh working copy and prints its path on stdout for the harness to adopt. Note the tradeoff: because the hook replaces the built-in git logic, the declarative `.worktreeinclude` copy list stops being applied, so the hook has to copy local configuration itself.

Continue to [the harness survey](02-harness-survey.md).
