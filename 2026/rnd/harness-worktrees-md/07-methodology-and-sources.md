# Methodology, coverage, limitations, and sources

## Objective and audience

This research answers one question: **how do today's AI agent tools handle git worktrees, and what does that solve?**

It is written for two readers:

- Engineers running more than one coding agent on one repository, who need to know what to configure and what will break.
- People building a harness or a surface, who need to know what the field has already converged on.

## Reporting period and freshness

- Research date: 2026-08-11.
- Working session timezone: Europe/Lisbon.
- All documentation was retrieved on 2026-08-11.
- Product documentation for agent tools changes weekly. Every version number, default value, and cap in this report is a point-in-time reading. Treat the mechanics as durable and the numbers as perishable.

## Evidence method

Sources were selected in this order:

1. **Official product documentation** for each harness, and the git manual for the underlying primitive.
2. **Public issue trackers and pull requests** for failure modes, because bug reports describe behaviour that documentation does not.
3. **Peer-reviewable preprints** for anything quantitative about conflict rates.
4. **Repository status pages**, read directly, for whether a project is alive.
5. **Practitioner writing and public discussion** for field experience, marked as secondary throughout.

Claims were paraphrased. No long passages were copied from any source.

### Evidence states used

| State | Meaning | Where it appears |
|---|---|---|
| `documented` | Stated in a product manual or the git manual | Most of [worktree mechanics](01-worktree-mechanics.md) and [harness survey](02-harness-survey.md) |
| `source-reported` | A source stated it; this report did not measure it | All failure-rate numbers, all practitioner experience |
| `inferred` | Follows from documented mechanics but is not stated | Marked inline, for example that `refs/stash` is shared because it sits under `refs/` |
| `unavailable` | Expected but not published | Empty cells in the comparison matrix, for example Antigravity's worktree paths |
| `not verified` | Reported by a secondary source and not checked against a primary one | Marked inline, for example the VS Code version range and the Gemini CLI release version |

Empty matrix cells read "not documented" rather than "no". Absence of documentation is not absence of a feature.

### What was measured versus read

**Nothing in this report was benchmarked.** No agents were run, no worktrees were timed, no conflict rates were reproduced. Every number is source-reported. The two categories most worth treating with caution:

- **Lock contention numbers** (3 agents with 2 failures; 13 agents with 8 failures) come from individual bug reports. They are single observations by single reporters on unknown hardware with unknown git versions, not measurements. They establish that the failure mode is real and gets worse with count. They do not establish a rate.
- **Concurrency ceilings** (two to five local agents) come from practitioner blog posts surfaced in search, several of which are search-optimised content rather than first-hand engineering write-ups. They are included because the range is consistent across independent sources, and excluded from any calculation.

The two conflict-rate studies are the strongest quantitative evidence here, and they measure textual merge conflicts in agent pull requests, which is adjacent to but not the same as "parallel agents on one machine".

## Artifacts

The report ships in two formats, rendered from the same eight Markdown files:

| Artifact | What it is | What it adds |
|---|---|---|
| `00-` to `07-*.md` | The source set, eight files, portable and readable anywhere | The canonical text. Every fact lives here first |
| `report.html` | One self-contained page, no network requests, fonts and styles inline | Navigation (a contents list and in-page anchors) and table interaction (sort, row highlight, column resize). No information the Markdown does not have |

The HTML is generated from the Markdown, not written by hand, so the two cannot drift: the same headings, the same 20 tables, the same 118 table rows, the same numbers. Rendering is deterministic, meaning two runs from the same input produce byte-identical files apart from the generation timestamp. Interactive state (theme, highlights, column widths) is never saved, so reloading always gives the same pristine page.

One deliberate departure from the house table defaults: cells in the wide comparison tables wrap instead of staying on one line. The rule applies only to tables whose longest cell exceeds 40 characters, so short data tables keep single-line cells and aligned digits. Without it, an eight-column prose matrix becomes several thousand pixels wide.

## Coverage

Ten harnesses and surfaces were examined against primary documentation:

Claude Code (CLI, desktop, agent view, subagents, Agent SDK paths), Cursor, OpenAI Codex (app and CLI sandbox model), VS Code agent sessions (covering the Copilot, Claude, and Codex harnesses it hosts), Google Antigravity, Gemini CLI, Zed, Warp, JetBrains IntelliJ IDEA, and the git primitive itself.

Five cloud harnesses were examined for contrast: Claude Code on the web, GitHub Copilot coding agent, Codex cloud, Cursor cloud agents, Devin.

Nine third-party tools were catalogued: Superset, container-use, Sculptor, Conductor, treehouse-worktree, Docktree, worktree-compose, git-cow-worktree, opencode-worktree. Two deprecated ones were verified directly: Crystal and Vibe Kanban.

## Exclusions

Stated so the gaps are visible:

- **No private betas or waitlisted features.** Only publicly documented behaviour.
- **No paid tool trials.** Third-party orchestrator capabilities come from their own public descriptions and were not tested.
- **No source-code reading.** Claude Code, Cursor, and the Codex app are closed source; the Gemini CLI entry is the one exception, drawn from its implementing pull request.
- **No benchmarking.** See above.
- **Aider, Cline, Goose, Amp, and OpenCode** were not given individual sections. Search results indicated they rely on external worktree management (a wrapper, a plugin, or the terminal surface) rather than shipping it, but that could not be confirmed against primary documentation within scope. Treat their absence as unmeasured, not as a finding.
- **Windows-specific behaviour** is covered only where documentation raised it, mostly Claude Code's notes on links and NTFS junctions.
- **No security assessment.** The report repeats each vendor's own claim about what their isolation does and does not stop, and does not test any of it.

## Limitations

1. **Version drift.** Claude Code's documentation names behaviour changes at v2.1.198 through v2.1.213. Anything read today may already be a version behind.
2. **One mirrored source.** The Codex app worktrees page was reached through a third-party mirror of `developers.openai.com` because the canonical path redirected and a direct fetch of the GitHub-archived copy returned 404. Its content is consistent with the OpenAI sandboxing page read directly, but it is a mirror, and a mirror can be stale. Treat the Codex worktree specifics (the `$CODEX_HOME/worktrees` path, the roughly 15 managed worktrees, the snapshot-before-delete behaviour) as the least certain product facts in this report.
3. **Asymmetric documentation depth.** Claude Code publishes far more about worktrees than anyone else, so it dominates the detail in the survey and the failure-mode section. That reflects what is published, not that it handles worktrees worse or better. The failure modes drawn from its issue tracker exist in other tools too, and are simply not visible.
4. **Failure modes are drawn from one issue tracker.** Four of the sixteen come from `anthropics/claude-code` because it is public, active, and searchable. Cursor, Codex, and Antigravity do not expose comparable public trackers for these products, so equivalent bugs in them are invisible here rather than absent.
5. **The semantic-conflict finding is qualitative.** The strongest field observation in the report, that architectural incoherence matters more than file conflicts, comes from a public discussion thread. It is consistent with the measured textual conflict rates and with the design of `/batch`, but it is not measured.
6. **No machine-readable dataset was produced.** The comparison matrix is the dataset, and it is small enough to read and short-lived enough that a versioned JSON file would add maintenance without adding validation. Noted here as a deliberate choice rather than an omission.
7. **The HTML renderer covers only the Markdown this report uses.** It handles headings, paragraphs, lists (including code blocks nested inside list items), tables, fenced code, inline code, bold, and links. It has no support for images, block quotes, nested lists, or footnotes, because the source uses none of them. Adding such a construct to the Markdown without extending the renderer would render it as literal text, which the parity checks below would catch.

## Sources

### Git primitive

| Source | Supports |
|---|---|
| [git-worktree manual](https://git-scm.com/docs/git-worktree) | All of [worktree mechanics](01-worktree-mechanics.md): shared versus private state, subcommands and flags, admin file layout, `extensions.worktreeConfig`, locking, pruning, repair, sparse checkout, submodule limits, the one-branch rule |

### Claude Code

| Source | Supports |
|---|---|
| [Run parallel sessions with worktrees](https://code.claude.com/docs/en/worktrees) | `--worktree` and `-w`, default paths and branch names, pull-request worktrees, `.worktreeinclude`, `worktree.baseRef`, name reuse rules, the three enforcement checks, subagent isolation, cleanup and sweep rules, `WorktreeCreate` for non-git VCS, resume and refusal behaviour, symlink and Windows notes, what worktrees share with the main checkout |
| [Hooks](https://code.claude.com/docs/en/hooks) | `WorktreeCreate` and `WorktreeRemove` input schemas, exit-code semantics, the Subversion example |
| [Create custom subagents](https://code.claude.com/docs/en/sub-agents) | `isolation: worktree` frontmatter, base-branch behaviour, working-directory and git-redirect checks for subagents, version history |
| [Manage agents with agent view](https://code.claude.com/docs/en/agent-view) | Background-session isolation, `worktree.bgIsolation`, commit and pull-request behaviour, cleanup |
| [Run agents in parallel](https://code.claude.com/docs/en/agents) | Comparison of subagents, agent view, agent teams, and workflows; the `/batch` description |
| [Tools reference](https://code.claude.com/docs/en/tools-reference) | `EnterWorktree` and `ExitWorktree` behaviour and approval rules |
| [Desktop application](https://code.claude.com/docs/en/desktop) | Worktree per session, configurable location and branch prefix, archive and auto-archive |
| [Configure the sandboxed Bash tool](https://code.claude.com/docs/en/sandboxing) | Writes allowed to the shared `.git` from a worktree, with `hooks/` and `config` still denied; blocked-git-operation recovery through a worktree |
| [Choose a sandbox environment](https://code.claude.com/docs/en/sandbox-environments) | The isolation-layer comparison, and Claude Code on the web's VM and proxy model |
| [Issue 66993](https://github.com/anthropics/claude-code/issues/66993) | Failure mode 1: `core.hooksPath` written to shared config |
| [Issue 55724](https://github.com/anthropics/claude-code/issues/55724) | Failure mode 2 and 3: `index.lock` contention, the 13-agent report, cleanup destroying work |
| [Issue 47266](https://github.com/anthropics/claude-code/issues/47266) | Failure mode 2: `config.lock` race on concurrent `git worktree add` |
| [Issue 62372](https://github.com/anthropics/claude-code/issues/62372) | Failure mode 16: a guard naming a tool the agent could not load |

### Other harnesses

| Source | Supports |
|---|---|
| [Worktrees, Cursor docs](https://cursor.com/docs/configuration/worktrees) | `/worktree`, `/best-of-n`, `/apply-worktree`, `/delete-worktree`, `.cursor/worktrees.json` schema, `$ROOT_WORKTREE_PATH`, `cursor.worktreeMaxCount` and cleanup interval, the symlink warning |
| [Codex app worktrees](https://doc.jarvisuni.com/openai/codex/app/worktrees.html) (mirror) | Local, Worktree, and Cloud thread modes; detached HEAD default; `$CODEX_HOME/worktrees`; managed worktree count; snapshots; Handoff; gitignored files not transferring; automations on dedicated worktrees |
| [Codex sandboxing](https://learn.chatgpt.com/docs/sandboxing) | Seatbelt, bubblewrap, Windows sandbox; `sandbox_mode`, `approval_policy`, `writable_roots`; the recommendation to use separate projects or worktrees rather than widening access |
| [Copilot CLI sessions in VS Code](https://code.visualstudio.com/docs/copilot/agents/background-agents) | Folder versus New Worktree isolation, `git.worktreeIncludeFiles`, forced Bypass Approvals, the "not a security boundary" statement, the one-commit requirement |
| [Agent harnesses, VS Code](https://code.visualstudio.com/docs/agents/concepts/agent-harnesses) | The harness definition, the four supported harnesses, folder versus worktree isolation |
| [Workspace vs Worktree Isolation in Copilot CLI](https://www.kenmuse.com/blog/workspace-vs-worktree-isolation-in-copilot-cli/) | Field detail: isolation is a VS Code feature not a CLI one, auto-commit per turn, dev-container failures, manual cleanup. Secondary |
| [Antigravity projects](https://antigravity.google/docs/projects) | Project model, Local versus New Worktree Mode, a worktree per active git checkout, Agent Manager guidance |
| [Gemini CLI pull request 22973](https://github.com/google-gemini/gemini-cli/pull/22973) | `WorktreeService`, `--worktree` and `-w`, the `experimental.worktrees` gate, cleanup that preserves work |
| [Parallel Agents, Zed docs](https://zed.dev/docs/ai/parallel-agents) | Worktree picker, detached HEAD on create, `create_worktree` hook, `ZED_WORKTREE_ROOT` and `ZED_MAIN_GIT_WORKTREE`, threads sidebar, lifecycle tied to thread history |
| [Git worktrees, Warp docs](https://docs.warp.dev/code/git-worktrees/) | Detection via the `.git` file, per-worktree status chip and review panel, independent indexing for codebase context, no creation or cleanup tooling |
| [What's new in IntelliJ IDEA 2026.1](https://www.jetbrains.com/idea/whatsnew/2026-1/) | First-class worktree support and its stated motivation in parallel agent work |

### Quantitative studies

| Source | Supports |
|---|---|
| [AI Agent Pull Requests on GitHub, arXiv 2607.04697](https://arxiv.org/abs/2607.04697) | 33,596 pull requests across 2,807 repositories; 40.2% of repositories with concurrent agent pull requests; 79.4% of agent pull requests overlapping, rising to 53.4% and 95.0% over a one-week window; 747 pairs merged giving 41.7% cross-agent and 19.8% same-agent conflict rates; 84.4% of conflicts in source files; nearly 42% structural |
| [AgenticFlict, arXiv 2604.03551](https://arxiv.org/abs/2604.03551) | 142,000 agent pull requests across 59,000 repositories; 107,000 merge simulations; 29,000 conflicting pull requests; 336,000 conflict regions; 27.67% overall conflict rate |

### Practitioner writing and discussion

All secondary. Included for field experience that documentation does not cover.

| Source | Supports |
|---|---|
| [Parallel agents in Zed, Hacker News](https://news.ycombinator.com/item?id=47866750) | Semantic collision as the hardest problem; a team abandoning per-branch database schemas; review consuming the gains; language-server multiplication |
| [Use git worktrees, they said](https://daveschumaker.net/use-git-worktrees-they-said-itll-be-fun-they-said/) | 750,000-file dependency tree; symlink, hardlink, and copy-on-write all failing; the pre-warmed pool with lockfile-gated installs |
| [Copy-on-write git worktrees](https://commaok.xyz/post/git-cow-worktrees/) | The `--no-checkout` plus reflink plus checkout seeding technique |
| [Using Git Worktrees with Many Untracked Files](https://spin.atomicobject.com/git-worktrees-untracked-files/) | `cp -Rc` on APFS for gitignored directories, and bundling setup into a script |
| [Agent harness, Wikipedia](https://en.wikipedia.org/wiki/Agent_harness) | Terminology: `agent = model + harness`, inner versus outer harness |

### Tools and repository status

Repository status for the two deprecated projects was read directly from their pages on 2026-08-11. Every other description comes from the project's own public summary and was not independently tested.

| Source | Supports |
|---|---|
| [Crystal](https://github.com/stravu/crystal) | Verified deprecated; README states it has been replaced by Nimbalyst |
| [Vibe Kanban](https://github.com/BloopAI/vibe-kanban) | Verified sunsetting; banner in README, code remains under Apache-2.0 |
| [container-use](https://github.com/dagger/container-use) | Worktree plus Dagger container per agent, `container-use/<env>` branches, automatic commits |
| [Superset](https://github.com/superset-sh/superset) | Many agents, each with worktree, branch, terminal, and environment; compare and merge the winner |
| [treehouse-worktree](https://github.com/mark-hingston/treehouse-worktree) | Worktree manager with CLI and MCP interfaces, including worktree locking for agent coordination |
| [Docktree](https://docktree.dev/) and [worktree-compose](https://github.com/mostafasudo/worktree-compose) | Per-worktree Compose project names, container names, volumes, and auto-allocated ports |
| [git-cow-worktree](https://github.com/josharian/git-cow-worktree) | Packaged reflink seeding |
| [opencode-worktree](https://github.com/kdcokenny/opencode-worktree) | Worktree tools for OpenCode with terminal spawning and cleanup on exit |

## Verification performed

### Content

- Every claim in the harness survey traces to a named source in the tables above.
- All eight Markdown files were checked for internal link targets; each cross-reference resolves to an existing file and heading.
- Numbers from the two preprints were transcribed from their abstracts and cross-checked between the two papers for consistency of definition (both measure textual merge conflicts in agent-authored pull requests, so their different rates reflect different populations and pairing methods, not a contradiction).
- No total or percentage in this report was computed by aggregating source figures. The two studies' rates are reported separately and not combined, because their populations overlap in unknown ways and their denominators differ.
- The two deprecated-project claims were verified against the repositories themselves rather than the aggregator blogs that surfaced them, because naming a live project as dead is a factual error worth spending a fetch to avoid.
- Report files were searched for secrets, credentials, and machine-specific absolute paths before handoff. None are present; the only absolute paths shown are illustrative (`/work/app`).
- Every cited link was checked for a live response, including the eight that were catalogued from their own project summaries rather than fetched during research.

### Cross-format parity

- Heading counts and text match between the Markdown and the HTML: all 99 source headings appear in the page, with only the page title and the contents list added.
- Table counts match exactly: 20 tables, 118 body rows in both.
- List items match exactly: 229 in the Markdown, 229 in the page body once the 79 contents entries are excluded.
- All 103 in-page links in the HTML resolve to an existing anchor, and no link still points at a `.md` file.
- All 42 external links appear in both formats.
- The page carries no leftover Markdown syntax: no stray bold markers, backticks, or pipe-table rows.

### Rendering

Verified in Chrome, both in a live browser and in headless renders at 1440 by 1000:

- The page renders in the house dark theme by default, and the theme toggle switches to light and back, updating the icon and its `aria-pressed` state.
- Sorting works in both directions on every column, sets `aria-sort`, and reorders the existing row elements rather than rebuilding them, so a highlighted row keeps its highlight through a sort.
- Row highlighting toggles on click and correctly ignores clicks on links and on header cells.
- Column resizing writes explicit widths for every column on the first drag, freezes the table width, keeps the column and table widths in sync, allows a column to be dragged to zero, and releases its listeners on pointer release.
- Wide tables scroll inside their own container; the page body never scrolls sideways.
- Reloading returns a pristine dark page with no highlights, no fixed column widths, no stored theme, and no cookies.
- Rendering twice from the same input produced byte-identical files; changing only the timestamp changed only that one line.

Two verification notes. Headless Chrome captures only the top of a document, so scrolled sections were checked by rendering variants that isolate one section at a time; a plain control page confirmed the behaviour is the screenshot tool's, not the report's. And no table in this report contains an unavailable value, so the sort rule that pushes `n/a` to the bottom was not exercised by this data.

## Attribution

Research and authoring: Claude Opus 5 via Claude Code, session dated 2026-08-11, working in `11archive`. No source content was reproduced at length; all findings are paraphrased with links to the original.
