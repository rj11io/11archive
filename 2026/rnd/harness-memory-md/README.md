# How AI coding agents handle memory files

- **Created:** 2026-08-11
- **Subject:** the `memory.md` pattern (`CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, rules files, auto-memory directories) across modern agent harnesses and surfaces, at three scopes: global, project, and thread.
- **Audience:** people who build agent harnesses, or who set up agent instructions for a team.
- **Evidence boundary:** vendor documentation, published specifications, vendor engineering posts, peer-reviewed and preprint research, and public issue trackers. No private surfaces, no paid-tier features tested by hand, no code read from closed products.

A "harness" here means the program that wraps a model and feeds it context: Claude Code, Codex CLI, Cursor, and so on. A "surface" means the product a person actually talks to: a terminal, an IDE panel, a chat app.

## Read in this order

| File | What it answers |
|---|---|
| [00-executive-brief.md](00-executive-brief.md) | What the evidence says, and what to do about it |
| [01-scope-model.md](01-scope-model.md) | What global, project, and thread scope really mean, and the two rival resolution rules |
| [02-harness-mechanics.md](02-harness-mechanics.md) | Exact paths, load order, and size caps for 15 harnesses, plus the API layer and chat surfaces |
| [03-thread-continuity.md](03-thread-continuity.md) | What happens to memory inside one long session: compaction, handoff, checkpoints, resume |
| [04-write-path.md](04-write-path.md) | Who writes the memory file, when, and with whose approval |
| [05-failure-modes.md](05-failure-modes.md) | The seven ways memory files fail, with the fix for each |
| [06-design-playbook.md](06-design-playbook.md) | A concrete layout to copy, plus rules for keeping it alive |
| [07-glossary.md](07-glossary.md) | Terms used across this report |
| [08-methodology-and-sources.md](08-methodology-and-sources.md) | How the research was done, what it does not cover, full source list |

Two more artifacts sit beside these files:

- `data.json` holds the comparison matrix in machine-readable form, with a confidence rating and a source URL on every harness entry.
- `report.html` renders all nine documents as one self-contained page, with sortable tables and a light or dark theme. It is the better view for the comparison tables.

## One-paragraph summary

Every serious harness now ships the same three-layer idea: a file for you, a file for your team, and something that carries state inside a session. They disagree about almost everything else. Half of them concatenate every file they find, half of them let the nearest file win, and the two behaviours look identical until a rule silently stops applying. The file is context, never enforced configuration, so nothing in it is a guarantee. And the layer where knowledge actually gets lost is not the file at all, it is the thread: compaction throws away most of a session, and only some harnesses re-inject the project file afterwards.
