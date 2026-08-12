# Executive brief

## What it is

WhichAI.dev is a picture gallery, not a scoreboard. One person, Dara Adedeji, gave the same
short brief to 25 AI models: design the landing page for a note-taking app that works like a
second brain, five different attempts, each on its own page. He then rebuilt every one of
those generated apps inside a single website so a visitor can look at them side by side.

The site's own words: "A comparison of how different AI models approach UI design, with and
without Anthropic's frontend design skill enabled."

A **skill** here means a text file of design instructions that you install into a coding
agent, which the agent then reads before writing code. Two skills carry most of the weight in
this project: Anthropic's `frontend-design` and a community one called `design-taste-frontend`.

## What is actually in it

| Count | Thing |
| --- | --- |
| 1 | prompt, reused for every run |
| 25 | models |
| 5 | treatments (design skill, taste skill, UI SH skill, no skill, Uncodexify skill) |
| 65 | runs (one model under one treatment) |
| 325 | generated landing pages, all preserved as running code |
| 321 | thumbnail images |
| 4 | visitor surfaces (gallery, compare, rankings, guessing game) |
| 0 | numeric scores anywhere in the project |

Every generated page is live code, not a screenshot. Click a card and you are running that
model's actual Next.js output inside the gallery shell.

## The single most important finding

**The design-skill group is not one treatment.** Eighteen of the 65 runs carry a lockfile
that records the exact skill file installed for that run. Those eighteen lockfiles point at
**four different versions** of Anthropic's `frontend-design` skill and **two different
versions** of the taste skill. Content hashes, taken from `skills-lock.json` inside each
run's source:

| Skill | Distinct versions found | Runs recording it |
| --- | --- | --- |
| `frontend-design` (anthropics/skills) | 4 | 11 |
| `design-taste-frontend` (Leonxlnx/taste-skill) | 2 | 7 |

So when the gallery puts Composer 2.5 next to Opus 5 in the "With Design Skill" section, the
two runs read different instruction files. The remaining 47 runs record nothing at all, so
their treatment is asserted by folder name only.

This does not make the gallery useless. It makes it a **catalogue of what happened**, not a
controlled comparison. Read on that basis and it is genuinely valuable.

## Eleven things worth knowing

1. **Skill version drift confounds every cross-model comparison.** Four skill versions inside
   one group, and no version recorded for two thirds of the runs. See
   [04-methodology-audit.md](04-methodology-audit.md).

2. **One run got 13 skills, not 1.** The GLM 5.2 taste run has `brandkit`, `gpt-taste`,
   `minimalist-ui`, `industrial-brutalist-ui`, `image-to-code` and eight more installed
   alongside the taste skill. Its output cannot be attributed to the taste skill alone.

3. **Nothing about the run is recorded.** The data model has no field for date, agent, model
   version string, reasoning effort, retries, or token spend. Folder names carry hints
   (`opus-cc-test`, `gpt-5-6-test/sol`) and nothing else does.

4. **Every thumbnail has the site's own furniture in it.** The capture script screenshots the
   normal gallery route, so the floating switcher and the Next.js development badge are baked
   into all 320 auto-generated thumbnails. A clean route exists and is not used.

5. **The rankings page ranks 8 models, and the home page hides all 8.** Every model on the
   ranked list is either force-archived or superseded, so none of them appears in the gallery
   unless the visitor presses "Show Archived". Seventeen of 25 models are unranked, and the
   rank-8 note is still a placeholder that says to update it later.

6. **Every page downloads a 643 KB stylesheet.** The shell's stylesheet asks Tailwind to scan
   the whole repository, so it contains utility classes from all 65 generated apps. The home
   page HTML is another 235 KB.

7. **Dark mode is half-wired.** The theme tokens, the toggle and a passing test are all
   there, but `:root { color-scheme: light !important }` overrides both the dark rule and the
   inline style the theme script sets, so native controls stay light.

8. **The design document contradicts the code.** `DESIGN.md` says "Light mode only" and "do
   not branch the design around it yet". Dark mode shipped in May.

9. **There is no license.** The repository redistributes 325 generated applications and eight
   companies' brand logos with no license file and no notice.

10. **The prompt asks for something the gallery then deletes.** The brief says "add a little
    button that lets me switch between them easily". Ingestion strips exactly that button from
    every run so the gallery's own switcher can take over. Whether a model built a working
    switcher is part of the brief and is no longer visible.

11. **The guessing game's "Coin Flipper" tier is chance.** You get three guesses out of eight
    labs, which is a 37.5% hit rate from pure luck. The tier that begins at 34% is therefore
    the random-play band.

## Who should care, and why

- **Someone choosing a model for frontend work.** Use the gallery and the compare view. They
  do the job the project set out to do: you look, you decide. Ignore the rankings page.
- **Someone building an AI evaluation.** This is the clearest worked example available of the
  hard part, which is not scoring but **preserving and re-serving hundreds of generated apps
  as live code**. The two-stage CSS isolation in
  [02-architecture.md](02-architecture.md) is the reusable idea.
- **Someone who wants to reproduce or extend it.** The repository ships its own ingestion
  recipe as an agent skill. [03-ingestion-pipeline.md](03-ingestion-pipeline.md) walks it.

## Project shape in one paragraph

101 commits from 2026-03-21 to 2026-08-09, essentially one author, 77 stars, 8 forks, no
license, 179 MB on disk. Next.js 16.2.0 and React 19.2.4 on Vercel, fully prerendered.
Eighteen pull requests, of which fourteen merged; four still open, two of them analytics bots.
Greptile provides code review and OpenAI's Codex for Open Source provides credits; the author
takes coffee money to fund new model runs. Growth has slowed from 25 commits in March to 10
in August, and each new model now arrives as a single agent-authored pull request.
