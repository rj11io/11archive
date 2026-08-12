# Rebuild blueprint

If you were building this again, here is what to keep unchanged, what to change, and what to add.
This is a design document, not a claim about what the original should have done. The original is a
personal project by one person and it works.

## Keep these five ideas exactly as they are

**1. No score.** The decision not to produce a number is the project's best judgement call. A
leaderboard would have invited argument about the rubric and hidden the artifacts. Handing someone
325 running pages and letting them look is a stronger product than any weighted average.

**2. One manifest as the single source of truth.** Routes, thumbnails, dropdowns, tests and game
rounds all derive from one array of 65 entries. Adding a model means editing one list and the rest
follows. Keep this and resist the urge to move it to a database before you have a reason.

**3. The `:where()` scoping trick.** Prefixing every variant selector with
`:where(.gallery-generation[data-gallery-group="..."][data-gallery-model="..."])` adds zero
specificity, so the model's own cascade survives untouched. Combined with rewriting `html`, `body`
and `:root` into that scope and namespacing every `@keyframes`, it is the cleanest solution to
running dozens of hostile stylesheets in one document. This is the most reusable single idea in the
project.

**4. Iframes for side-by-side.** Two generated apps cannot share a document. Accept the iframe.

**5. The ingestion recipe as a written skill.** Turning the chore into a 219-line instruction file
is why a new model now lands as one pull request. Write the recipe before you need it the third
time.

## Change these six things

### 1. Make the run the unit of record, not the card

Extend `GalleryEntry` from 8 fields to 13. Every one of these was cheap to capture at generation
time and is impossible to recover afterwards:

```ts
interface GalleryEntry {
  // existing
  group, groupLabel, model, modelLabel, sourceDir,
  sourceAppType, defaultIteration, summary, iterations,

  // added
  generatedAt: string;          // ISO date of the run
  agent: string;                // "claude-code@2.1.0", "cursor@1.8", "api"
  modelBuild: string;           // the exact model string sent to the API
  reasoningEffort: string;      // "max", "high", "default", "unknown"
  skill: { name: string; source: string; hash: string } | null;
  builtSwitcher: boolean;       // did it satisfy that part of the brief
}
```

`unknown` is a legitimate value for all of them. Showing `unknown` on a card is more honest than
showing nothing, and it creates pressure to fill it in next time.

The `skill.hash` field is the one that matters most. The current project already has this data for
18 of 65 runs, sitting unread in `skills-lock.json` files inside the copied sources. Reading it
during ingestion is a few lines of code and it converts an unfalsifiable label into evidence. See
A1 in [04-methodology-audit.md](04-methodology-audit.md).

### 2. Freeze the skill version per sweep

The root problem is not that the skill changed. It is that runs from different months share one
section heading. Two options, and the second is better:

- **Pin it.** Install one exact skill commit for a whole sweep and record the hash.
- **Version the group.** Make the treatment `design-skill@93f53fd`, not `design-skill`, and let the
  home page group cards by version. Then a visitor comparing two cards can see whether they read the
  same instructions, and you gain the ability to answer a genuinely interesting question: did the
  skill rewrite improve outputs for the same model?

### 3. Generate the routes, do not hand-write them

Three runs are missing their per-run CSS route because that step lives only in a maintainer's head.
Write `scripts/generate-variant-routes.mjs`, read the manifest, emit both the route folders and
their four-line Tailwind entries, and run it from `prebuild` next to `scope-variant-css.mjs`. Add a
test asserting the route count equals the manifest length times two.

Then restrict the shell stylesheet with `source(none)` plus explicit `@source` lines, which is what
turns the 643 KB shared bundle into a small one. Do these two in one change; either alone breaks
something.

### 4. Capture thumbnails from the clean route, in production mode

Point the capture script at `/preview/{group}/{model}/{iteration}` and run it against
`npm run start`, not `npm run dev`. Then assert, after every screenshot, that the page contains no
`nav[aria-label$="gallery navigation"]`. The current thumbnails carry the site's own switcher and the
Next.js dev badge, which means the images the whole site is built around show the site instead of
just the work.

### 5. Date the rankings or drop them

A present-tense page called "Rankings" that ranks eight superseded models, all of them hidden from
the gallery by default, misleads a first-time visitor. Pick one:

- **Snapshot.** Retitle to "Rankings, April 2026", keep the prose, add a line saying it is not
  maintained. The writing is good and worth keeping.
- **Current.** Rank today's models and let the old notes move to an archive page.

The prose format itself is right. Do not replace it with stars or scores.

### 6. Strip the scaffolding at ingestion

Keep the components, the CSS, the assets and `skills-lock.json`. Delete `package.json`,
`package-lock.json`, `tsconfig.json`, the ESLint and PostCSS configs, the README and the favicon.
None is read at runtime, and together with 33 committed lockfiles they are most of why the
repository is 179 MB. Move `public/gallery-previews` to an object store or Git LFS before the next
25 models double it again.

## Add these three things

### 1. A second scenario

Every one of the 325 pages is a marketing landing page. Landing pages reward exactly what a design
skill teaches: a strong hero, typographic contrast, a committed colour direction. They do not test
information density, state handling, empty states, or accessibility, which is where most real
frontend work lives.

The cheapest useful second scenario is a **settings screen or a data table**, because it inverts
what landing pages reward. The project's own `/experiments` page already worked this out in April
and proposed scenario tabs and a harness-by-model matrix to hold it.

Adding a second scenario also forces the URL scheme to grow the axis it needs, which the
`/experiments` mockup already spells out:

```
/gallery?prompt=second-brain&harness=cursor&skill=design&iteration=3&models=opus,gemini
```

### 2. One objective measure, kept small

The project is right that design quality resists scoring. But two things about these pages can be
measured without a rubric, and both are interesting:

- **Did it satisfy the brief?** Five routes present, and a working switcher. Boolean, checkable at
  ingestion, currently thrown away.
- **What does it weigh?** Page bytes, request count, largest contentful paint. A model that produces
  a beautiful page that takes four seconds to paint has told you something real about itself.

Two fields, both machine-collected, neither pretending to judge taste. Keep them off the cards and
put them on the model page, so the gallery stays a gallery.

### 3. Run-to-run variance, at least once

The five iterations measure range within one attempt. Nothing measures whether the same model, given
the same prompt twice, produces work of similar quality. Run one model three times under identical
conditions and publish the three sets side by side. It is a single sweep, and it answers the question
every reader of a five-page gallery quietly has: how much of this is the model and how much is luck?

## What good looks like

A visitor should be able to answer four questions from the site, in under a minute each:

1. What does this model produce from a blank brief? **The current site does this well.**
2. Does installing a design skill change that? **The current site does this well, for the paired
   comparison.**
3. When was this made, by what, with which skill version? **Not answerable today.**
4. Is this model consistent? **Not answerable today.**

Fixing three and four is a data-model change and one extra sweep. Neither requires a rubric, a
crowd, or a scoring model, which means the project can close both gaps without becoming the thing
its own `PRODUCT.md` says it must never become.
