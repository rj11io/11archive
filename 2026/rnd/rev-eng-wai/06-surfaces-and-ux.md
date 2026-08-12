# The four surfaces, and the design system behind them

## The shell, which is the argument

The site makes a claim by existing. `PRODUCT.md` states it as a design principle:

> **Practice what you preach.** This site argues, by existing, that AI can produce good frontend
> design *when paired with taste*. The shell itself has to be evidence of that pairing.

And then, at the bottom of the home page, in small italics: "This site was designed by Composer
2.0 LOL."

So the chrome around the gallery is itself an entry in the gallery. That is why the shell gets a
324-line design document while the rankings are eight hand-written paragraphs.

One element carries the whole shell: a floating glass navigation bar, fixed top right, on every
page. `src/components/gallery/gallery-rankings-nav.tsx` builds it as four links (Gallery, Compare,
Rankings, Lab guess) plus a theme toggle, separated by hairline dividers, on a translucent white
panel with a 12px backdrop blur.

Its one distinctive move: **the active item collapses to its icon and the inactive ones show
words.** The home link renders a house icon when you are on the home page and the word "Gallery"
when you are anywhere else. `DESIGN.md` calls this out as the thing to protect: labels crossfade
through a 4px blur over 220ms with an ease-out-quart curve, "the single most distinctive motion in
the whole shell".

## Surface 1: the gallery

`src/app/page.tsx`. Five sections, one per treatment, each a grid of cards that goes one column on
mobile, two on small screens and four on extra-large.

Each card, from `gallery-card.tsx`, shows a 16-by-10 thumbnail, the treatment label, the model name
with its lab's logo, five numbered chips linking to the five iterations, and a compare button. The
whole card lifts 6px on hover with a shadow. The chips use `tabular-nums`, which is a small,
correct detail: numerals stay the same width so the chips do not twitch.

Above the grid sits the header: the title "Which AI Made This?", one sentence of explanation, the
prompt in a blockquote with a copy button that flashes and shows "Prompt copied", three credit
links (GitHub, X, Buy Me a Coffee), and the Composer 2.0 joke.

**The archive control** is the interesting piece. Each section shows a "Show Archived" button only
when it actually has hidden cards, computed by comparing the filtered list against the full one.
Pressing it reveals superseded models. The rule behind it, in
`src/lib/gallery-archived.ts`, is that a model is archived when another model in the same family
has a higher tier number, plus a manual override list of seven. See A8 in
[04-methodology-audit.md](04-methodology-audit.md) for why this produces odd results.

## Surface 2: compare

`/compare` plus six query parameters. Two panels, each one an `<iframe>` pointing at a
`/preview/...` route, each with its own five iteration chips floating over the top-right corner of
the frame, and a control strip for choosing treatment and model.

Three design choices worth naming:

**State lives entirely in the URL.** `buildCompareHref` writes all six parameters and
`parseCompareSearchParams` validates all six against the manifest, returning `"default"` when none
are present and `"invalid"` when any is missing, duplicated, or unknown. A comparison is therefore
a link you can paste into Slack, which is the point of the whole feature.

**Iframes, not client-side rendering.** Each panel loads a fully separate document. That is the
only way two generated apps with conflicting global CSS can appear on screen at once, and it is
worth the cost.

**The default comparison is the thesis.** `DEFAULT_COMPARE_STATE` opens GPT-5.4 with the design
skill next to GPT-5.4 without it. And `getCounterpartSelection` means that when you press compare
on any card, the site automatically fills the other side with the same model under the opposite
treatment. The one-click path is with-skill versus without-skill, which is exactly the comparison
the project is about.

## Surface 3: rankings

`/rankings`, from `src/lib/model-rankings.ts`. A single ordered list, eight items, each with a
rank number, the model name and logo, one large screenshot of the iteration the author considers
that model's best, and a paragraph of prose. The page's whole subtitle is: "This is a ranking
based off my taste."

The prose is the best writing in the project. Rank 1 (Opus 4.7) on why it beats 4.6:

> Page three on iteration three is the one that got me: a full mushroom illustration, and card
> icons that look like proper SVG marks instead of the random emoji some Opus runs lean on.

Rank 4 (Composer 2.0):

> It still has Composer sickness: it does the bare minimum. Landings here tend to be one screen
> tall (nothing to scroll), because it rarely goes past what you literally asked.

One neat piece of engineering supports it. `src/components/ranking-notes.tsx` scans each note for
the phrase "iteration one" through "iteration five", in words or digits, and turns every match into
an inline chip that links straight to that generation. So the sentence above becomes clickable at
the exact page it describes, with no markup in the note text. The regex is
`/\biteration\s+(one|two|three|four|five|[1-5])\b/gi` and it is the kind of small idea worth
copying: let the prose stay prose, and derive the links.

The problem is not the writing, it is the currency. See A7.

## Surface 4: Lab Guess

`/lab-guess`, from `src/components/game/model-lab-wordle.tsx`, 1,007 lines and the largest
component in the project. It came in as pull request #6, "Add Wordle-style AI lab guessing game".

Rules:

| Setting | Value |
| --- | --- |
| Rounds | 5 |
| Guesses per round | 3 |
| Options | 8 labs (GPT, Claude, Gemini, Meta, X AI, Kimi, GLM, Composer) |
| Board | one random generation from all 325, shown in an iframe |
| What you name | the lab, not the model |

Each round shows a preview and a floating picker at the bottom. The picker composites three states
into one button, which `DESIGN.md` calls the system's most elaborate component:

- **Wrong guesses accumulate visibly.** A rose-tinted bar grows behind the picker label,
  proportional to wrong guesses out of three, and the border turns rose.
- **A wrong submit shakes.** A 420ms four-step lateral shake, plus or minus 7px then plus or minus
  5px. No fade, no scale.
- **A correct submit pops.** A 620ms scale to 1.045 and back with a green ring and a single
  diagonal white sheen sweeping across at an 18-degree skew. `DESIGN.md` defends this as "the one
  piece of decorative motion in the system", earned because it happens once, at a payoff.

Progress shows as five dots rather than a bar, one per round, filled green for solved, red for
missed, outlined for the current one.

At the end you get a rank title from a seven-step table (Model Whisperer at 5 of 5, then Signal
Reader, Pattern Matcher, Getting Warmer, Coin Flipper, Rookie Eye, Back to the Lab at zero), plus
accuracy, best streak, average guesses per solved round, and a per-round breakdown. Sharing works
two ways: emoji tiles in text, green for first or second try and yellow for third, and a rendered
score card produced client-side with `html-to-image`, copied to the clipboard or downloaded.

The game is the project's best answer to its own thesis. You cannot describe a model's visual tics
in a table. You can teach someone to recognise them by making them guess.

## The unshipped fifth surface

`/experiments` is live, unlinked, and honest about itself: "Exploration, not implemented yet". It
holds five low-fidelity concepts for growing the bench past one prompt and one skill axis:

1. **Scenario tabs with shared filters.** Each real-world test gets a tab; filters apply within the
   active scenario. Noted tradeoff: tabs overflow once you have dozens of runs.
2. **A matrix board, harness by model.** Rows are agents or tool stacks, columns are models, each
   cell a generation. Filled and hollow dots mark which cells exist. Noted tradeoff: dense on small
   screens, needs careful empty states.
3. **Saved views and compare baskets.** Named filter presets in a sidebar; pick two and diff them.
   Noted tradeoff: presets rot without disciplined naming.
4. **A split workspace.** Two independent gallery panes, each with its own controls.
5. **A query-string experiment lab.** Every axis (prompt, harness, skill, date) encoded in the URL,
   so a link reproduces an exact slice. The mockup shows
   `/gallery?prompt=second-brain&harness=cursor&skill=design&iteration=3&models=opus,gemini`.

That fifth concept is the answer to almost every methodology finding in this teardown. It names
`harness`, `skill` and a date stamp as first-class axes, which is exactly what the current data
model lacks. The project worked out what it needs in April and has not built it.

## The design system, in short

`DESIGN.md` plus `.impeccable/design.json` define the shell. The document is 324 lines and reads
like a real design system rather than a colour dump.

| Dimension | Rule |
| --- | --- |
| Canvas | `#fafafa`, never pure white; ink `#171717`, never pure black |
| Accent | one colour, Signal Pink `#b84a8c`, for active state, focus, and the single primary action per surface |
| Typeface | Geist Sans alone; hierarchy from scale, weight and tracking only |
| Elevation | flat at rest; every shadow is earned by hover, focus, or a payoff moment |
| Glass | backdrop blur on exactly four components: the nav, the variant switcher, the compare selects, the game picker |
| Motion | ease-out curves only, never bounce or elastic; animate transform and opacity, not layout |
| Game colours | emerald, rose and amber exist only inside Lab Guess, never in the shell |

Three of its rules are named and enforced by prose: **The Signal Rule** (if the pink covers more
than about 10% of a screen, the design has failed), **The One-Face Rule** (no second typeface, ever)
and **The Game-Color Quarantine**.

Its anti-references are as useful as its rules. The site must not become an AI evaluation
leaderboard (dense tables, logo walls, accuracy bars), a generic SaaS landing page (gradient hero,
identical feature-card grid, glass everywhere), a command-terminal interface (monospace body,
dark by default, dense controls), or a wall of data. `PRODUCT.md` adds the reason: three audiences
land on the same page, a researcher, a builder and someone who heard about vibe coding yesterday,
and none of them should have to translate.

The document has one flaw, which is that it describes a light-only site and the site has had dark
mode since May. See E6 in [05-engineering-findings.md](05-engineering-findings.md).
