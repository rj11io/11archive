# Decision guide: choosing and sizing isolation

## Four layers, four different questions

Isolation is not one decision. It is four, and worktrees answer only the first.

| Layer | The question it answers | What it stops | What it costs | Typical mechanism |
|---|---|---|---|---|
| Files | Can two agents overwrite each other's edits? | Lost edits, mixed diffs, one branch carrying two changes | A folder per agent, plus the setup to make that folder usable | Git worktree, or a full clone |
| Repository plumbing | Can two agents corrupt each other's git operations? | Lock failures, config leaks, shared stash | A little serialisation and retry logic | Serialised creation, `extensions.worktreeConfig`, backoff |
| Runtime and state | Can two agents run the app at once? | Port clashes, one shared database, colliding container names | A container or a port and database allocation scheme | Container per agent, or per-worktree Compose override |
| Machine | Can the agent damage the host or reach what it should not? | Arbitrary child processes, network egress, host filesystem | A container, virtual machine, or a hosted sandbox | OS sandbox, container, VM, cloud session |

Read down the "what it costs" column. The layers get more expensive going down, and most teams stop after the first because it is the only one their tool sets up for them.

**A worktree is not a sandbox.** It is a naming and ownership boundary for files. VS Code's documentation says so in plain terms: worktree isolation does not restrict commands, network access, or access outside the worktree.

## Pick the file-isolation mechanism

| Situation | Use | Why |
|---|---|---|
| Two to five local agents on one repository | Git worktree per agent | Shares the object store, so a 10GB repository costs only the checked-out files per agent |
| Repository with submodules, especially a superproject | Full clone per agent | The git manual does not recommend multiple checkouts of a superproject, and `git worktree move` fails with submodules |
| Very large dependency tree, worktrees created often | Pooled worktrees, recycled | Install cost dominates creation cost; a pool amortises it |
| Agents that install packages or start services | Container per agent, worktree inside it | Runtime isolation is the actual requirement |
| Untrusted code, or unattended runs with permissions skipped | Virtual machine or hosted cloud session | Only kernel-level separation covers arbitrary child processes |
| Not a git repository | Harness hook that checks out your VCS, or a clone per agent | Worktrees are a git feature |
| Jujutsu repository | `jj workspace add` | Workspaces are tied to a revision, not a branch, so several can sit on the same work |
| One agent, interactive, small task | No isolation | Folder mode exists for a reason: the agent sees your uncommitted work, which is often what you want |

## When to skip worktrees

Worktrees are the right default, not a universal answer. Skip them when:

- **You want the agent to see your uncommitted changes.** A worktree starts from committed state. VS Code calls this out as the reason folder isolation exists, and Claude Code lets background sessions opt out with `worktree.bgIsolation: "none"` for repositories where worktrees are impractical.
- **The task is a conversation, not a change.** Reading code, explaining a system, planning. Isolation buys nothing and costs a setup script.
- **Setup cannot be automated.** If making a worktree usable needs manual steps nobody has written down, worktrees will be abandoned within a week. Write the setup script first, then adopt worktrees.
- **The agent already has its own machine.** Cloud harnesses get file isolation from the machine boundary, so a branch is enough.

## Size concurrency by review capacity

The binding constraint is not disk, CPU, or the tool's cap. It is how many diffs a person will read.

Reference points, all source-reported:

- Practitioners writing publicly settle on roughly **two to five** concurrent local agents before supervision becomes the problem.
- Local machine limits show up around **three to five** for typical web projects, when builds and test suites compete for RAM and CPU.
- Tool caps are much higher and are about disk hygiene, not attention: Cursor keeps 25 worktrees per machine by default, the Codex app about 15, Claude Code's `/batch` fans out to 5 to 30 subagents.
- Git lock contention gets worse with agent count: one report described failures as intermittent at 5 agents and near-certain at 10 or more.

A workable rule:

```text
concurrent agents = diffs you will review today / average diffs per agent per day
```

If that gives you three, run three. The remaining capacity is better spent on making each agent's output more reviewable than on starting a fourth.

Two exceptions where higher counts are genuinely fine:

- **Best-of-N.** Three models on one task in three worktrees produces one diff to review, because you throw two away. No merge problem at all.
- **Mechanical fan-out.** A 30-file rename split across 30 worktrees produces 30 diffs that each take seconds to check, and each one is verifiable by its tests. This is what `/batch` is for.

## Adoption checklist

Ten items, each verifiable by running a command. Work through them once per repository.

1. **Ignore the worktree directory.** Add your harness's worktree path (for example `.claude/worktrees/`) to `.gitignore`. Verify: `git status --porcelain` is clean after a worktree session.
2. **Turn on per-worktree config.** `git config extensions.worktreeConfig true`, and confirm your team's git version accepts it. Verify: `git config --worktree --list` works inside a worktree.
3. **Move worktree-specific settings out of shared config.** `core.worktree`, `core.bare` when true, and `core.sparseCheckout` unless every worktree uses it. Verify: `git config --list --show-origin` and check where each lands.
4. **Protect your hooks.** Verify: after a worktree session, `git config core.hooksPath` from the main checkout returns what you committed, not an absolute path into `.git/hooks`.
5. **Write the copy list.** Create `.worktreeinclude` or set `git.worktreeIncludeFiles` with every gitignored file the project needs. Verify: create a worktree and confirm the files are present.
6. **Write the setup script.** Install dependencies, run migrations, generate code, allocate a port. Make it exit non-zero on any missing prerequisite. Verify: run it in a fresh worktree and start the app.
7. **Decide the base commit.** Fresh from the remote default branch for independent work; local `HEAD` when agents must build on unpushed commits. Verify: `git log --oneline -1` in a new worktree is what you expected.
8. **Allocate runtime resources per worktree.** Ports, Compose project name, database name. Verify: start the app in two worktrees at once.
9. **Gate cleanup on cleanliness.** Whatever removes worktrees must check `git status --porcelain` first. Verify: leave an uncommitted change in a worktree, trigger cleanup, and confirm the change survives.
10. **Add retry to worktree creation.** Backoff on `File exists` lock errors. Verify: create four worktrees in parallel and confirm all four succeed.

## The working sequence

Seven steps, in this order. Skipping any of the first three costs you at step six.

1. **Partition.** Decide which files each agent owns, and write the boundaries into each task. This is the step that prevents the conflicts nothing else can fix.
2. **Freeze shared interfaces.** Types, schemas, API signatures. Commit them, and have every agent branch from that commit.
3. **Isolate.** One worktree per agent, from the chosen base.
4. **Seed.** Copy list plus setup script. Confirm the app runs before the agent starts.
5. **Run.** Cap concurrency at your review capacity. Lock each worktree while its agent works.
6. **Verify on the merge candidate, not the branch.** Merge into an integration branch and run the suite there. A branch that passes alone tells you nothing about the pair.
7. **Land in a fixed order and rebase the rest.** Then clean up: `git worktree list`, remove what is clean, keep what is not.

## What to watch for next

Three things are changing fast enough that this report will need revisiting.

- **Per-worktree config becoming the default.** The `core.hooksPath` failure exists because harnesses write shared config. The fix is one git setting, and once harnesses set it themselves the whole class of bug goes away.
- **Runtime isolation moving into the harness.** Third-party tools already generate per-worktree Compose overrides and allocate ports. There is no reason that stays outside the first-party tools.
- **The integration layer.** Every tool now creates worktrees and no tool helps you merge twenty of them. Measured conflict rates of 20% to 42% for pairs of agent pull requests say this is where the next round of tooling has to go.

See the [glossary](06-glossary.md) for terms, and [methodology and sources](07-methodology-and-sources.md) for how this was researched and what it does not cover.
