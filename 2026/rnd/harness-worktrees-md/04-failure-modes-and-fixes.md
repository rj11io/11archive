# Failure modes and fixes

Sixteen ways worktree-based agent isolation breaks, each with the cause and a fix. Ordered by how much damage they do, not how often they happen.

Evidence states are marked. **Source-reported** means a source stated it and this report did not measure it. **Documented** means it is in a product manual or the git manual. **Inferred** means it follows from documented mechanics.

## 1. Writing `.git/config` from a worktree changes the whole clone

**Severity:** high. Silent, and it can stay broken for days.

**Symptom.** A repository's committed git hooks stop running. Not just in the worktree: everywhere in the clone, including the main checkout and every other worktree.

**Cause.** Linked worktrees share one `.git/config`. A harness that runs `git config <key> <value>` with the worktree as the current directory believes it is configuring "this worktree" and is actually configuring the repository. One reported case: Claude Code's worktree setup ran the equivalent of `git config core.hooksPath <abs path to mainRepo/.git/hooks>`, which overrode a repository whose committed `core.hooksPath` pointed at a tracked `hooks/` directory. The reporter's pre-push quality gates stopped firing across the entire clone for several days, and they restored enforcement by adding forwarding shims in `.git/hooks` ([issue 66993](https://github.com/anthropics/claude-code/issues/66993)). Evidence: source-reported, with a reproduction in the issue.

**Fix, in order of preference.**

1. Turn on per-worktree config in the repository, once:

   ```bash
   git config extensions.worktreeConfig true
   ```

   Then every per-worktree setting is written with `--worktree` and lands in `.git/config.worktree` or `.git/worktrees/<id>/config.worktree`:

   ```bash
   git config --worktree core.hooksPath .git/hooks
   ```

   Cost: git versions older than the extension refuse to open the repository. Check what your team and your CI runners use first.

2. Have the harness respect an existing value. If `core.hooksPath` is already set to a repository-managed directory, leave it alone.

3. At minimum, surface the change. A silent global config write is the part that made this expensive.

**Detection.** After any worktree session, from the main checkout:

```bash
git config core.hooksPath
git config --list --show-origin | grep -i hookspath
```

If the value is an absolute path into `.git/hooks` and you committed something else, this happened to you.

## 2. Concurrent worktree creation and commits fight over git locks

**Severity:** high, because it usually pairs with failure mode 3 and turns into lost work.

**Symptom.** Two error shapes.

```text
error: could not lock config file .git/config: File exists
error: unable to write upstream branch configuration
```

```text
Unable to create '.git/index.lock': File exists
```

**Cause.** Git uses lock files for mutual exclusion on shared state. Worktrees have separate index files, but `git worktree add` writes the shared `.git/config` (for the upstream branch setting), and commits update shared refs and create objects. Fire several agents at once and the writes collide. Locks are held for milliseconds, so this is a race, not a queue.

**Reported scale**, both source-reported single reports rather than controlled measurements:

- 3 agents launched in one message with worktree isolation: typically 1 succeeded, 2 failed ([issue 47266](https://github.com/anthropics/claude-code/issues/47266)).
- 13 agents: 5 committed, 8 failed. The reporter described the failure rate as intermittent at 5 agents and near-certain at 10 or more ([issue 55724](https://github.com/anthropics/claude-code/issues/55724)).

**Fix.**

1. **Serialise creation.** Create worktrees one at a time, then run the agents in parallel. Creation is fast; only the write to shared config is contended.
2. **Retry with backoff** on any lock error, roughly 200ms, 400ms, 800ms, up to five attempts. Most retries succeed.
3. **Stagger startup** by a random 100ms to 500ms when creating several worktrees, which spreads the git calls without any coordination.
4. **Avoid the config write.** Creating with `--detach` or `--no-track` avoids setting an upstream branch, which is what touches `.git/config` during `git worktree add`. Evidence: inferred from the git manual's description of `--track` and `--no-track`; test it against your git version before relying on it.

A wrapper you can drop into a `WorktreeCreate` hook or a setup script:

```bash
#!/usr/bin/env bash
set -euo pipefail
path="$1"; branch="$2"
for attempt in 1 2 3 4 5; do
  if git worktree add --no-track -b "$branch" "$path" 2>/tmp/wt.err; then
    exit 0
  fi
  grep -q "File exists" /tmp/wt.err || { cat /tmp/wt.err >&2; exit 1; }
  sleep "0.$((attempt * 2))"
done
cat /tmp/wt.err >&2
exit 1
```

## 3. Automatic cleanup deletes the work

**Severity:** high. This is the only failure mode in the list that destroys data.

**Symptom.** An agent reports it finished, and its worktree and its changes are gone.

**Cause.** A chain, not a single bug. The commit fails on a lock (failure mode 2). The agent exits without committing. An automatic sweep sees a worktree it created for a finished agent and removes it, taking the uncommitted files with it ([issue 55724](https://github.com/anthropics/claude-code/issues/55724)). Evidence: source-reported.

**Fix.**

1. **Gate every automatic removal on the worktree being clean.** The check is one command:

   ```bash
   test -z "$(git -C "$worktree" status --porcelain)"
   ```

   Extend it to unpushed commits before you call a worktree disposable.

2. **Lock while running.** `git worktree lock --reason "agent running" <path>` makes a concurrent sweep refuse to remove it. Release on finish, and release stale locks for processes that died.
3. **Never auto-remove a worktree a human named.** An explicitly named worktree is a statement of intent.

Current implementations that already do this: Claude Code's sweep skips worktrees with changed files, untracked files, or unpushed commits and never touches `--worktree` ones; Gemini CLI's service preserves a worktree with untracked files or new commits and prints resume instructions; the Codex app snapshots before deleting so a removal can be restored.

**If it already happened**, before doing anything else: `git fsck --lost-found` finds committed-but-unreferenced objects, but nothing recovers files that were never committed. That is why the gate matters.

## 4. The worktree is missing the files the project needs to run

**Severity:** medium. Wastes agent turns rather than data.

**Symptom.** An agent in a fresh worktree cannot start the app, cannot connect to anything, and reports missing modules or missing configuration. It then tries to be helpful and writes a new `.env` with guessed values.

**Cause.** Documented behaviour, not a bug: `git worktree add` writes committed files for the chosen commit and nothing else. Gitignored files, installed dependencies, build caches, and local databases are all absent. VS Code's documentation names this directly; so does Claude Code's.

**Fix.** Declare both halves, in the repository, so every worktree gets them.

Secrets and local config, with a copy list:

```text
# .worktreeinclude
.env
.env.local
config/secrets.json
```

Dependencies and setup, with a script. Cursor's form:

```json
{
  "setup-worktree": [
    "npm ci",
    "cp $ROOT_WORKTREE_PATH/.env .env",
    "npm run db:migrate"
  ]
}
```

Zed's equivalent is a `create_worktree` hook with `ZED_WORKTREE_ROOT` and `ZED_MAIN_GIT_WORKTREE` set. Claude Code's is a `WorktreeCreate` hook, which replaces creation entirely and therefore has to copy the config itself, because `.worktreeinclude` is not applied when a hook takes over.

**Also add a fast failure.** Put a check at the top of the setup script that exits non-zero when a required file is missing. A worktree that fails to build is a five-second problem; a worktree that half-builds is an hour.

## 5. Dependency installation makes worktree creation useless

**Severity:** medium. The reason teams abandon worktrees.

**Symptom.** `git worktree add` takes 200ms and `yarn install` takes 10 minutes, so the cost of a parallel agent is ten minutes, and nobody starts one.

**Cause.** File count, not file size. A large JavaScript monorepo can carry 750,000 files in its dependency tree, and the bottleneck is creating that many directory entries. One practitioner tried symlinks (Node's module resolution broke during tests), hardlink installs (still 750,000 entries), and APFS copy-on-write cloning (still one clone syscall per file), and none of them solved it ([Dave Schumaker](https://daveschumaker.net/use-git-worktrees-they-said-itll-be-fun-they-said/)). Evidence: source-reported.

**Fix, cheapest first.**

1. **Use a fast installer.** `pnpm`, `bun`, and `uv` all install from a content-addressed store and are much faster than a cold `npm install`. This is Cursor's documented recommendation.
2. **Copy-on-write copy the dependency directory** on a supporting filesystem:

   ```bash
   cp -Rc /work/app/node_modules /work/app-feature/node_modules   # APFS
   cp -R --reflink=auto ...                                        # btrfs, XFS reflink=1
   ```

   A 1GB directory then costs no extra disk until something changes. Works well up to tens of thousands of files.
3. **Pool and recycle worktrees** when the tree is very large. Keep a fixed set (six worked for the practitioner above), activate a slot by checking out the branch, compare the lockfile against the previous checkout, and run the install only when the lockfile changed. Because most branches start from a recent default branch, the lockfile usually has not changed, so activation is seconds.
4. **Reflink-seed at creation time** with the `--no-checkout` trick: register the worktree with no files, copy-on-write copy from a similar existing worktree, then `git checkout` to reconcile the index. Packaged as [git-cow-worktree](https://commaok.xyz/post/git-cow-worktrees/).

**Anti-fix:** one shared `node_modules` symlinked into every worktree. It breaks module resolution and diverges the moment two branches need different dependency versions. Cursor's documentation warns against it explicitly.

## 6. Ports, databases, and Docker collide even though the folders do not

**Severity:** high when the agent runs the app. Invisible until then.

**Symptom.** Agent B's dev server fails to bind. Agent A's tests fail because Agent B ran a migration. Both agents share one Redis and neither knows it.

**Cause.** A worktree isolates files. Everything else on the machine is shared: there is one port 3000, one port 5432, one Docker daemon, one set of default Compose project and container names, one host filesystem for bind mounts, and one database server. Nothing in git addresses any of it. Evidence: documented in third-party tooling, and named in practitioner discussion as the reason one team abandoned per-branch database schemas and went back to sequential agents.

**Fix.** Pick a level and be consistent.

1. **Per-worktree Compose isolation.** Generate an override file per worktree with a unique project name, container names, volumes, and host ports. The pattern used in the field is an index-based offset, for example `20000 + default_port + index`, so worktree 0 gets 23000 and worktree 1 gets 23001. [Docktree](https://docktree.dev/) and [worktree-compose](https://github.com/mostafasudo/worktree-compose) generate these over an existing `docker-compose.yml`.
2. **Port allocation in the setup script.** If you do not use Compose, allocate the port in the worktree's `.env` at creation and read it everywhere:

   ```bash
   # in setup-worktree
   index=$(git worktree list --porcelain | grep -c '^worktree ')
   echo "PORT=$((3000 + index))" >> .env
   ```

3. **Database per worktree, not schema per worktree.** A separate database name is easier to reason about than a shared server with per-branch schemas, and it means a bad migration in one worktree cannot be seen from another. Name it after the worktree.
4. **Container per agent** when agents install packages or run services. [container-use](https://github.com/dagger/container-use) gives each agent a container plus a worktree plus its own branch; Sculptor gives each agent a Docker container.
5. **Set CPU and memory limits** on each agent's stack, so one agent's test suite cannot starve the others.

## 7. Semantic conflicts that git cannot see

**Severity:** high. The hardest problem in the list, and the one no tool solves.

**Symptom.** Two branches merge cleanly. The result does not make sense. One agent named the concept `Subscription`, the other named it `Plan`, and both wrote consistent code around their choice. Or two agents implemented the same interface differently, and each compiles alone.

**Cause.** Git compares text. Nothing in the toolchain compares meaning. Practitioners describing this said the hardest problem was not file conflicts but architectural consistency, and that neither worktree is wrong while the combined code is incoherent ([Hacker News discussion](https://news.ycombinator.com/item?id=47866750)).

**Scale.** Textual conflicts alone are common enough to plan for. Merging 747 pairs of agent pull requests gave a 41.7% conflict rate for pairs from different agents and 19.8% for pairs from the same agent, with 84.4% of conflicts in source files rather than dependency lists and nearly 42% structural (deletions against additions) ([arXiv 2607.04697](https://arxiv.org/abs/2607.04697)). A larger dataset found 27.67% of 107,000 simulated merges conflicted ([AgenticFlict, arXiv 2604.03551](https://arxiv.org/abs/2604.03551)). Semantic conflicts are, by definition, not in those numbers. They are the ones that got through.

**Fix.** All of these are process, not tooling.

1. **Fix the shared interface before you fan out.** Write the type, the schema, or the API signature, commit it, and have every agent branch from that commit. This is why Claude Code's `/batch` documentation says not to use it for architecture-heavy work "unless you first define the target design".
2. **Partition by file ownership, and write the partition into each task.** Give each agent the paths it owns and tell it the paths it must not touch. Claude Code's agent-teams guidance takes the same line for teammates that share a checkout.
3. **Fan out on mechanical work only.** Renames, framework migrations, repository-wide type cleanup, repetitive changes with clear rules. Reserve ambiguous design work for one agent at a time.
4. **Test the merge, not the branch.** A branch that passes alone proves nothing about the pair. Merge each candidate into an integration branch and run the suite there before landing.
5. **Merge in a fixed order and rebase the rest.** Rebasing keeps history linear, which also makes `git log` readable to the next agent.

## 8. Review capacity is the real ceiling

**Severity:** medium, and it compounds.

**Symptom.** Ten agents finish, ten pull requests wait, and the value of the parallelism is now sitting in a queue in front of one person.

**Cause.** Verification does not parallelise the way generation does. Review load grows roughly linearly with agent count while review capacity stays flat. Analyses of speculative parallelism in agent pipelines make the same point formally: adding candidates adds selection and merge overhead, and gated merge review is a serial bottleneck with finite capacity.

**Fix.**

1. **Set concurrency from review capacity.** Decide how many diffs you will read today and run that many agents. Practitioners writing publicly settle around two to five local agents; the tools will happily let you run fifty.
2. **Prefer many small independent units over a few large ones.** A 30-file rename split into 30 reviewable pull requests is easier than one 30-file pull request, and each one can be checked in seconds.
3. **Make agents produce reviewable diffs.** Require tests in the same branch, a plain description of what changed, and commits grouped by intent rather than by the order the agent happened to work.
4. **Kill work early.** A best-of-N run where you discard two of three candidates has no review cost for the discarded two. That is a feature.

## 9. Git refuses to check out the branch the agent wants

**Severity:** low. Noisy but harmless.

**Symptom.** `fatal: '<branch>' is already checked out at '<path>'`.

**Cause.** Documented and deliberate: git will not let two worktrees hold the same branch, because both would try to advance it.

**Fix.** Any of three.

- Create the worktree detached: `git worktree add --detach <path>`. Zed and the Codex app both default to this.
- Create a new branch per worktree: `git worktree add <path> -b <branch>`.
- Move the session rather than the branch. The Codex app's Handoff exists for exactly this, and its documentation names dual checkout as the thing to avoid.

## 10. Submodules

**Severity:** medium in repositories that use them, absent elsewhere.

**Symptom.** `git worktree move` fails. `git worktree remove` needs `--force`. Submodule contents are missing or stale in the new worktree.

**Cause.** Documented in the git manual: submodule support in worktrees is incomplete, moving a worktree containing submodules is not supported, and multiple checkouts of a superproject are explicitly not recommended.

**Fix.**

- Do not move worktrees in a superproject. Remove and recreate.
- Initialise submodules per worktree in your setup script: `git submodule update --init --recursive`.
- For heavy submodule use, prefer a full clone per agent over a worktree. A clone costs disk and a fetch; a half-initialised superproject costs debugging.

## 11. Symlinks and unusual paths

**Severity:** medium. Two of these have caused file loss.

**Symptom.** Worktree creation refuses to run, or removing a worktree deletes something outside it.

**Cause and fix**, all documented in Claude Code's worktrees page:

- **A symlink in the worktree path.** Claude Code refuses to create a worktree when `.claude`, `.claude/worktrees`, or the worktree directory itself is a symlink, and names the path. Before v2.1.212, a committed symlink at one of those paths was followed and could create files outside the repository. Fix: remove the symlink.
- **A link nested inside the worktree, on Windows.** Removing a worktree deletes only the link, keeping the folder it points at. Before v2.1.205, removal could delete the target folder. Fix: run a current version, and keep NTFS junctions and directory symlinks out of worktrees.
- **A network path.** Claude Code never resumes a session into a worktree recorded at a network path. Fix: keep worktrees on local disk.

## 12. Stale worktree bookkeeping after a move

**Severity:** low.

**Symptom.** `git worktree list` shows paths that do not exist, or a worktree cannot find its repository after someone moved a folder in Finder.

**Cause.** The link is two pointers: the `gitdir:` line in the worktree's `.git` file, and the `gitdir` file in `$GIT_DIR/worktrees/<id>/`. Moving a folder by hand updates neither.

**Fix.**

```bash
git worktree repair                     # from the main checkout, after moving it
git worktree repair /new/path/wt1 /new/path/wt2   # after moving linked worktrees
git worktree prune --dry-run            # see what bookkeeping would go
git worktree prune
```

To reduce the chance of it happening, `git config worktree.useRelativePaths true` makes the admin files relative, at the cost of setting `extensions.relativeWorktrees`, which older git versions refuse.

## 13. Editors and language servers multiply

**Severity:** medium on a laptop.

**Symptom.** Five worktrees open means five project indexes, five sets of language servers, and a machine that is slower than one agent working alone.

**Cause.** Editor tooling is per-folder by design. Practitioners in the Zed discussion reported five or six language servers spawning for a single TypeScript file, with memory growth to match.

**Fix.**

- Prefer surfaces that index per worktree deliberately: Warp indexes each worktree independently for codebase context, and JetBrains 2026.1 added first-class worktree support partly for this reason.
- Close worktrees you are not reviewing. The folder can stay; the editor window does not have to.
- Run agents in terminals rather than editor windows when you are not reading their output yet.
- Move to a remote machine when the local ceiling is CPU rather than review capacity.

## 14. Workspace trust and permission prompts get in the way

**Severity:** low, but it looks like a bug the first time.

**Symptom.** `claude --worktree` exits with an error before doing anything.

**Cause.** Documented: interactive runs require workspace trust, so a directory you have never run Claude in refuses. Non-interactive `-p` runs skip the trust check.

**Fix.** Run `claude` once in the directory and accept the dialog. Related and worth knowing: as of v2.1.211, a "Yes, don't ask again" approval granted inside a worktree is saved to the main checkout's `.claude/settings.local.json`, so it applies in every worktree and survives that worktree's removal. Before that version, the approval was saved inside the worktree and lost with it, which meant re-approving the same command in every new worktree.

## 15. Non-git version control has no worktrees

**Severity:** blocking, where it applies.

**Symptom.** Worktree isolation is unavailable in a Subversion, Perforce, or Mercurial repository.

**Cause.** Worktrees are a git feature.

**Fix.** Replace the creation logic with a hook. Claude Code's `WorktreeCreate` and `WorktreeRemove` hooks exist for this, and the documented Subversion example checks out a fresh working copy and prints its path on stdout so the harness adopts it as the session's working directory:

```json
{
  "hooks": {
    "WorktreeCreate": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash -c 'NAME=$(jq -r .name); DIR=\"$HOME/.claude/worktrees/$NAME\"; svn checkout https://svn.example.com/repo/trunk \"$DIR\" >&2 && echo \"$DIR\"'"
          }
        ]
      }
    ]
  }
}
```

Two things to get right. Any non-zero exit code fails creation, unlike most hooks where only exit 2 blocks. And because the hook replaces the built-in logic, `.worktreeinclude` is not processed, so copy local configuration inside the hook script.

For **Jujutsu**, use workspaces instead: `jj workspace add ../agent-auth`. A workspace is tied to a revision rather than a branch, so several can sit on the same work. Two documented limits: git worktree commands are not supported against a jj repository, and partial clones are unsupported.

## 16. The recovery instruction the agent cannot follow

**Severity:** low individually, instructive generally.

**Symptom.** A guard blocks a write and tells the agent to isolate itself first. The agent tries, cannot, gives up, and asks the human to run a command.

**Cause.** The guard's message named a tool whose schema was not loaded in that session, so calling it failed. The agent did not know it needed to load the schema first, retried the original write, hit the same guard, and stopped ([issue 62372](https://github.com/anthropics/claude-code/issues/62372)). Evidence: source-reported, no maintainer response at the time of the report.

**Fix.** Applies to any harness that writes guard messages for an agent to act on.

1. Name the exact prerequisite in the error text, not just the goal.
2. Preload the schema of any tool a guard tells the agent to call.
3. Better still, make the recovery automatic: isolate the session on the first write attempt rather than blocking and explaining.

The general lesson: **a guard message is an interface for a model, and needs the same care as a tool description.** "Call X first" is only useful if X is reachable from where the agent is standing.

Continue to the [decision guide](05-decision-guide.md).
