# Executive brief

## The finding

Two AI coding tools on one working laptop had written **4.0 GB** into their home
directories. Their documentation describes about a dozen files. Everything else
is state the program writes for itself.

That gap is the subject of this report.

MEASURED, 2026-08-11, one macOS machine:

| | Claude Code (`~/.claude`) | Codex CLI (`~/.codex`) |
| --- | --- | --- |
| Total on disk | 352 MB | 3.68 GB |
| Conversation transcripts | 325 MB across 207 files | 1.37 GB across 453 files |
| Largest single transcript | 15.1 MB | 131 MB |
| Oldest transcript kept | 30 days | since 2026-02-19 (6 months) |
| Documented entries | ~14 | ~4 |
| Entries actually present | 26 | 63 |

## Six things worth knowing

**1. Your conversations are plain text on disk, forever or nearly so.**
Every prompt you typed, every file the agent read, and every command it ran is
written line by line to a `.jsonl` file. Claude Code deletes these after 30 days
by default. Codex keeps them indefinitely: the sampled machine still held
transcripts from six months back. One Codex transcript had grown to 131 MB.

**2. `.gitignore` does not protect you.**
This is the single most misunderstood point. `.gitignore` stops a file from being
committed. It does nothing to stop the agent from *reading* that file and writing
its contents into the transcript. If the agent reads your `.env` once, your keys
are in plain text in your home directory. REPORTED: live API keys have been found
sitting in `~/.claude/projects/` this way ([agentfluent issue
#72](https://github.com/frederick-douglas-pearce/agentfluent/issues/72)).

**3. The two tools store credentials very differently.**
MEASURED: Claude Code keeps its login token in the macOS Keychain, which is
encrypted and needs your password to read. Codex writes an OAuth token set to
`~/.codex/auth.json` as readable JSON. File permissions are `0600`, so only your
user can open it. That protects against other users on the machine. It does not
protect against anything running *as you*, which is exactly what a bad npm
package does.

**4. Disk growth is mostly waste, not data.**
MEASURED: `~/.codex/logs_2.sqlite` is a 395 MB debug log database. 326 MB of that
(82%) is free space inside the file, left behind by deleted rows that SQLite
never gave back. The live content is about 47 MB. A single `VACUUM` reclaims it.

**5. Some files cannot be cleaned by normal means.**
MEASURED: `~/.codex/worktrees/` held 839 MB. It contained one checkout of one
project. That checkout was orphaned: the parent repository had been moved to a
new path, so git no longer recognised the worktree and `git worktree prune` could
not remove it. Separately, `~/.claude/session-env/` held 851 directories. All 851
were empty.

**6. A file in your repo can run code when you start a session.**
`.claude/settings.json` can define a `SessionStart` hook, which is a shell
command the harness runs automatically. REPORTED: the ChainDrop npm worm did
exactly this, planting a hook in compromised repositories so that opening the
project in Claude Code executed the attacker's code ([Pillar
Security](https://www.pillar.security/blog/chaindrop-when-opening-a-repository-becomes-execution),
[Microsoft Security
Blog](https://www.microsoft.com/en-us/security/blog/2026/08/04/chaindrop-supply-chain-compromise-anatomy-self-propagating-worm/)).
The same campaign specifically hunted for Anthropic, Codex, Cursor, and Gemini
credential files.

## What surprised us

The harness knows more about your machine than the transcript suggests.

MEASURED, from `~/.claude.json` (95.5 KB, one file):

- 43 projects tracked, each with its own cost, token counts, and timing history
- 487 cached feature flags, which are remote switches that change how the tool
  behaves without an update
- a stable 64-character machine identifier
- your account email, organisation name, role, and billing tier
- for each project, a sample of filenames taken from your repository

MEASURED, from `~/.codex/config.toml`: every directory you have ever marked as
trusted, listed by full path, kept permanently. That list is a readable map of
your filesystem and your client work.

MEASURED, from `~/.codex/memories_1.sqlite`: a background job queue that reads
your finished sessions and distils them into stored summaries. It runs on its own
schedule, in two stages, with retries. Nothing in the interface announces it.

## What to do

Ranked by benefit against effort. Full detail in
[06-operator-playbook.md](06-operator-playbook.md).

| Action | Why | Effort |
| --- | --- | --- |
| Never let the agent read a real secret file | It lands in the transcript permanently, and `.gitignore` will not stop it | free |
| Add `.claude/` and `.codex/` to your global gitignore | Stops local agent state reaching a shared repo | 1 min |
| Review any `.claude/settings.json` that arrives from outside | A hook in it runs on session start | per repo |
| `VACUUM` the Codex log database | Reclaimed 326 MB on the sampled machine | 1 min |
| Delete orphaned worktrees by hand | `git worktree prune` cannot see them | 5 min |
| Set `cleanupPeriodDays` deliberately | Default is 30. Codex has no equivalent default. | 1 min |

One trap worth stating plainly. In Claude Code, `cleanupPeriodDays: 0` reads like
"never clean up". It does the opposite: it stops transcripts being written at all
([claude-code issue
#23710](https://github.com/anthropics/claude-code/issues/23710)). If you want to
keep everything, set a large number, not zero.

## The one-line version

These tools are not doing anything sneaky. They are doing ordinary engineering
things, which happen to include writing your entire working life to plain text in
a folder you never open.
