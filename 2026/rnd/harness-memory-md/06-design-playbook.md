# Design playbook

- **Created:** 2026-08-11
- **For:** a team setting up agent instructions across more than one tool, and anyone building a harness of their own.

## Part 1: the layout to copy

```
repo/
├── AGENTS.md                      # the one file. under 200 lines. committed.
├── CLAUDE.md                      # 2 lines: @AGENTS.md, then Claude-only notes
├── .claude/
│   └── rules/
│       ├── api.md                 # paths: ["src/api/**/*.ts"]
│       ├── migrations.md          # paths: ["db/migrations/**"]
│       └── testing.md             # paths: ["**/*.test.ts"]
├── .github/
│   ├── copilot-instructions.md    # short, or a pointer
│   └── instructions/
│       └── api.instructions.md    # applyTo: "src/api/**/*.ts"
├── .cursor/rules/
│   └── api.mdc                    # globs: src/api/**/*.ts
└── .gitignore                     # includes CLAUDE.local.md
```

Outside the repo, per person, not committed:

```
~/.claude/CLAUDE.md                            # your global preferences
~/.claude/rules/*.md                           # your global rules
~/.claude/projects/<project>/memory/MEMORY.md  # agent-written, review weekly
~/.codex/AGENTS.md                             # your global preferences, Codex
~/.gemini/GEMINI.md                            # your global preferences, Gemini
```

### Why this shape

**One source of truth, many readers.** `AGENTS.md` is read natively by Codex, Cursor, Copilot, Gemini CLI (when configured), Zed, Amp, Junie, Aider, and Devin. Claude Code is the notable exception and needs a two-line bridge, which Anthropic documents:

```markdown
@AGENTS.md

## Claude Code
Use plan mode for changes under `src/billing/`.
```

Or, when you need nothing Claude-specific:

```bash
ln -s AGENTS.md CLAUDE.md
```

Gemini CLI can be pointed at the shared file directly, no bridge needed:

```json
{ "context": { "fileName": ["AGENTS.md", "GEMINI.md"] } }
```

**Path-scoped rules carry the volume.** Anything that applies to part of the tree goes behind a glob and costs zero tokens until a matching file is opened. This is the single change that lets a large codebase have a lot of rules and a small always-on file.

**Personal stays personal.** `CLAUDE.local.md` is gitignored. One caveat from the docs: a gitignored file exists only in the worktree where you made it. To share personal notes across worktrees, import from home instead:

```markdown
# Individual Preferences
- @~/.claude/my-project-instructions.md
```

## Part 2: what goes in `AGENTS.md`

Keep it to facts an agent needs in every session and cannot derive by reading the code.

**Include:**

- Build, test, and lint commands, with the exact invocation
- Package manager, if it is not obvious from lockfiles
- Where things live, only when it is surprising
- Conventions that differ from the language or framework default
- Traps: the flaky test, the service that must be running, the directory not to touch
- Things the agent got wrong twice

**Exclude:**

- Directory listings, dependency lists, architecture overviews. The agent can read those, and `/doctor` will propose cutting them.
- Multi-step procedures. Those are skills.
- Anything true of one subdirectory only. That is a path-scoped rule.
- Emphasis theatre. No all-caps, no IMPORTANT, no emoji section markers.
- Aspirations. "Write clean code" changes nothing.

The trigger for adding a line, from Anthropic's guidance: Claude made the same mistake twice; a code review caught something the agent should have known; you typed the same correction you typed last session; a new teammate would need the same context.

### A template that fits in 200 lines

```markdown
# <project>

## Commands
- Install: `pnpm install`
- Test: `pnpm test`, single file `pnpm test path/to/file.test.ts`
- Lint: `pnpm lint --fix`
- Dev server: `pnpm dev`, port 3000

## Conventions
- Package manager is pnpm. Never npm or yarn.
- TypeScript strict mode. No `any` without a comment saying why.
- API handlers live in `src/api/handlers/`, one file per route.
- Tests sit beside the code they test, named `*.test.ts`.

## Traps
- `src/legacy/` is frozen. Do not edit it; open an issue instead.
- Integration tests need Redis on 6379. Start it with `docker compose up -d redis`.
- `pnpm build` must run before `pnpm test:e2e`, or the e2e suite tests stale output.

## Before you finish
- Run `pnpm test` and `pnpm lint`.
- Do not commit unless asked.
```

Roughly 25 lines. Most projects do not need more in the always-on file.

## Part 3: the decision table

| The instruction is... | Put it in |
|---|---|
| Universal and must never be violated | A hook or CI check, not a file |
| Universal and should usually hold | `AGENTS.md` at the root |
| True for one directory or file type | A path-scoped rule with a glob |
| A multi-step procedure | A skill |
| Personal to you, all projects | `~/.claude/CLAUDE.md`, `~/.codex/AGENTS.md`, `~/.gemini/GEMINI.md` |
| Personal to you, one project | `CLAUDE.local.md`, gitignored |
| Company policy nobody may disable | Managed policy file or Team Rules |
| Something the agent worked out itself | Auto memory, reviewed weekly |
| Current state of a long task | A progress file the agent updates |
| True for this hour only | Say it in chat, and expect it to die at compaction |

## Part 4: if you are building the harness

Seven decisions, with the recommendation and the reason.

**1. Merge rule: concatenate, but mark the source.**
Junie's approach is the best in the survey: include both global and project guidelines, mark them clearly, deduplicate identical content, and state that project wins on conflict. Concatenation without marking hands the model an unlabelled pile. Marking costs a few tokens and makes conflicts legible.

**2. Give the always-loaded layer a hard cap and tell the model about it.**
Claude Code's auto memory is the reference: 200 lines or 25KB, a reminder as the file approaches it, and an error that instructs the model to rewrite the index when it goes over. A cap nobody enforces is a suggestion. Windsurf's 6,000 and 12,000 character limits work the same way.

**3. Make path scoping a first-class feature, not a convention.**
`paths:`, `applyTo:`, and `globs:` frontmatter all do the same job. Without it, every rule is an always-on rule and the file grows until adherence drops.

**4. Ship a command that prints exactly what the model receives.**
Gemini CLI's `/memory show` is the single most useful debugging tool found. Claude Code's `/context` plus the `InstructionsLoaded` hook is the other good pattern. Without this, users debug the model when the bug is in discovery.

**5. Decide what survives compaction, and document it.**
Claude Code documents it precisely: root file re-injected, nested files and path-scoped rules not, skills listing dropped. Most harnesses document nothing here, which is why users think memory is unreliable when it is behaving exactly as designed.

**6. Separate agent-written memory from human-written rules, physically.**
Different directory, ideally outside the repository. It preserves the trust distinction and makes review possible. Every harness that has both already does this. Do not invite the agent to edit the committed instruction file directly.

**7. Timestamp writes, and give users one place to read everything.**
Claude Code's `modified` frontmatter field is the only automatic staleness signal in the survey. Claude.ai's single editable memory summary is the best review affordance. Together they solve most of the rot problem: you can see what is old and read all of it in one place.

## Part 5: maintenance

**Weekly, five minutes.**
Open the agent memory index. Delete anything about a system that changed. Promote anything a teammate would need into `AGENTS.md`.

**At every release.**
Grep instruction files for tool and command names that changed this cycle.

**Quarterly.**
Read `AGENTS.md` end to end. Ask of each line: has the agent violated this? Would a new hire need it? Can the agent derive it from the code? Delete on any "no", "no", "yes".

**Every six months, the reset.**
Delete the instruction files, the skills, and the hooks. Work for a day without them. Add back only what you actually miss. This is Anthropic's own published advice for Claude Code users, and it is the only maintenance practice that reliably reverses accumulation ([Delete your CLAUDE.md](https://charliehills.substack.com/p/delete-your-claudemd)).

**The test that settles arguments.**
Put a deliberately absurd rule in your instruction file, for example "end every response with the word BANANA." Start a fresh session. If it does not appear, the file is not loading, or it is buried too deep to matter. Either way you have learned more than another round of rewording would teach you.
