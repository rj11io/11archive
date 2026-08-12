# Methodology audit

The project is honest about being subjective. `README.md` says "The rankings page is subjective,
because design is subjective." This audit is not an attack on that. It sorts out which claims
the evidence supports and which it does not, so a reader knows what they are looking at.

Each item states the claim at risk, the evidence, and how much it costs.

---

## A1. The design-skill group contains four different skill versions

**Claim at risk:** "These 25 cards all had the design skill enabled, so differences between them
come from the models."

**Evidence.** Eighteen of the 65 run sources contain a `skills-lock.json`, written by the skill
installer, which records the source repository, the skill path, and a content hash of the skill
file. Extracted from the checkout:

| Run | Skill | Content hash (first 12) |
| --- | --- | --- |
| with-design-skill/composer-2.5 | frontend-design | `063a0e644812` |
| with-design-skill/gemini-3.5-flash | frontend-design | `516bd2154eb8` |
| with-design-skill/gpt-5.5-high | frontend-design | `516bd2154eb8` |
| with-design-skill/gpt-5.5-low | frontend-design | `516bd2154eb8` |
| with-design-skill/fable | frontend-design | `4eabc6618376` |
| with-design-skill/grok-4.5 | frontend-design | `4eabc6618376` |
| with-design-skill/kimi-k3 | frontend-design | `4eabc6618376` |
| with-design-skill/glm-5.2 | frontend-design | `93f53fd1c035` |
| with-design-skill/muse-spark-1.2 | frontend-design | `93f53fd1c035` |
| with-design-skill/opus-5 | frontend-design | `93f53fd1c035` |
| with-design-skill/sonnet-5 | frontend-design | `93f53fd1c035` |
| with-taste-skill/fable | design-taste-frontend | `6d838b246d0e` |
| with-taste-skill/grok-4.5 | design-taste-frontend | `6d838b246d0e` |
| with-taste-skill/kimi-k3 | design-taste-frontend | `6d838b246d0e` |
| with-taste-skill/glm-5.2 | design-taste-frontend | `899b84384f74` |
| with-taste-skill/muse-spark-1.2 | design-taste-frontend | `899b84384f74` |
| with-taste-skill/opus-5 | design-taste-frontend | `899b84384f74` |
| with-taste-skill/sonnet-5 | design-taste-frontend | `899b84384f74` |

Four distinct `frontend-design` versions across 11 runs. Two distinct taste versions across 7.
The hashes group by time, which fits a maintainer who reinstalled the current skill whenever a
new model shipped. The skill itself changed under him: its published page says it went through
a "substantial 2026 rewrite" with a "much stricter ruleset" under the same install name.

**Cost.** High, and specific. Comparing Composer 2.5 to Opus 5 inside the "With Design Skill"
section compares two different instruction files as well as two models. The comparison the site
is built around, one model with the skill versus the same model without it, is **not** affected,
because both halves of that pair were almost certainly run together. That pairing is the site's
strongest claim and it survives.

**Fix.** Add a `skillVersion` field to `GalleryEntry`, backfill the 18 known hashes, mark the
other 47 `unknown`, and show the hash on the card. Then group the home page by skill version, or
at least warn when two cards in one row do not share one.

---

## A2. One taste run had thirteen skills installed

**Claim at risk:** "This card shows what the taste skill does."

**Evidence.** `src/variants/with-taste-skill/glm-5.2/source/skills-lock.json` records thirteen
skills, all from `Leonxlnx/taste-skill`:

`brandkit`, `design-taste-frontend`, `design-taste-frontend-v1`, `full-output-enforcement`,
`gpt-taste`, `high-end-visual-design`, `image-to-code`, `imagegen-frontend-mobile`,
`imagegen-frontend-web`, `industrial-brutalist-ui`, `minimalist-ui`,
`redesign-existing-projects`, `stitch-design-taste`.

Every other taste run records exactly one skill. This run therefore had access to an aesthetic
preset (`minimalist-ui`, `industrial-brutalist-ui`), an output-length enforcer
(`full-output-enforcement`), and a brand generator (`brandkit`) that none of its neighbours had.

**Cost.** Medium in scope, high in kind. It is one card out of 65, but it is a card the site
presents as directly comparable to the other nine taste cards. Whatever GLM 5.2 produced there
cannot be attributed to the taste skill alone.

**Fix.** Re-run GLM 5.2 with only `design-taste-frontend` installed, or label the card with its
full skill list.

---

## A3. Two thirds of runs have no treatment evidence at all

**Claim at risk:** the group label on every card.

**Evidence.** 18 of 65 runs carry a lockfile. The other 47 are placed in a group by folder name
and manifest entry only. Nothing inside those sources shows which skill, if any, was installed.

**Cost.** Medium. There is no reason to doubt the labels, and the folder naming is consistent
and careful (`with-frontend-design-skill/`, `ui-sh-test/`, `gpt-5-6-test/sol/no-skill`). But it
is testimony, not evidence, and it cannot be audited by a third party.

**Fix.** Copy the lockfile into every ingested source as a required ingestion step, even when
it means re-running the installer to reconstruct it.

---

## A4. The UI SH treatment is unidentified

**Claim at risk:** "With UI SH Skill" means something specific.

**Evidence.** Four runs sit in this group. The site labels it "With UI SH Skill" with no link, in
contrast to the design and Uncodexify groups, which both link to their exact skill page on
skills.sh via `src/lib/gallery-anthropic-skill.ts`. No lockfile exists for any of the four runs.
`PRODUCT.md` mentions "ui.sh" once in a list of skills under study. That is the whole record.

**Cost.** Low in scale, total in kind. Four cards carry a label a reader cannot resolve.

**Fix.** Link the skill and record its version, or fold the four runs into `miscellaneous` with
a prose note.

---

## A5. Nothing records when, how, or with what a run was made

**Claim at risk:** any statement of the form "model X is better than model Y at design".

**Evidence.** `GalleryEntry` has eight fields and none of them is a date, an agent name, a model
build string, a reasoning setting, a retry count, or a cost. See
[01-what-it-measures.md](01-what-it-measures.md) for the full type.

The gaps that matter most:

- **Time.** The gallery spans March to August 2026. During that window every lab shipped new
  models and the skills themselves were rewritten. Two cards in the same row can be five months
  apart and nothing says so.
- **Agent.** Folder names hint at it: `opus-cc-test` reads like Claude Code, `ui-sh-test` like a
  separate harness. A model driven by Cursor and the same model driven by a raw API call are
  different systems, and the gallery cannot tell you which one you are looking at.
- **Retries.** If a generation failed and was re-rolled, the survivor is shown with no mark. The
  git history contains a `kimi-k-2.6-backup-20260420-202852` folder, which shows at least one run
  was redone.

**Cost.** High. This is what separates a catalogue from a benchmark. The project is a good
catalogue.

**Fix.** Add five fields (`generatedAt`, `agent`, `modelBuild`, `reasoningEffort`,
`skillVersion`), backfill from git dates where possible, and mark the rest `unknown`. Showing
`unknown` is more honest than showing nothing.

---

## A6. Part of the brief is deleted before display

**Claim at risk:** "these pages show how the model answered the prompt".

**Evidence.** The prompt's third sentence asks for "a little button that lets me switch between
them easily". The ingestion skill instructs the opposite:

> If the source project contains a single `src/app/page.tsx` that switches internally between
> designs, split or import the actual iteration components instead of rendering the switcher
> page inside the gallery.

Thirty-two of the 65 manifest summaries say some version of "integrated without the source app's
local switcher".

**Cost.** Medium. It is the right product decision, since two floating switchers in the same
corner would be unusable. But instruction-following on an explicit deliverable is exactly the
kind of thing a benchmark should surface, and this one throws it away silently.

**Fix.** Record a boolean per run: did the model build a working switcher, yes or no. It costs
one field and one glance during ingestion, and it is the only part of the brief that can be
graded objectively.

---

## A7. The rankings are stale, partial, and partly invisible

**Claim at risk:** the entire `/rankings` page.

**Evidence.** `src/lib/model-rankings.ts` holds eight entries:

| Rank | Model | Hidden on the home page by default? |
| --- | --- | --- |
| 1 | Claude Opus 4.7 | yes, force-archived |
| 2 | Claude Opus 4.6 | yes, superseded by Opus 5 |
| 3 | Gemini 3.1 Pro | yes, superseded by Gemini 3.5 Flash |
| 4 | Composer 2.0 | yes, force-archived |
| 5 | GPT-5.4 | yes, superseded by the GPT-5.6 runs |
| 6 | Kimi K 2.5 | yes, superseded by Kimi K3 |
| 7 | Composer 1.5 | yes, superseded by Composer 2.5 |
| 8 | Kimi K 2.6 | yes, force-archived |

**Every one of the eight ranked models is hidden** from the home page unless the visitor presses
"Show Archived". Seventeen of the 25 models in the gallery are unranked, including every Anthropic
model newer than 4.7, every GPT-5.6 run, Sonnet 5, Fable 5, Grok 4.5, Muse Spark 1.2, GLM 5.2 and
Kimi K3. The rank-8 note still reads: "Bench slot for Kimi K 2.6; update notes after the gallery
run is reviewed."

The prose that is there is good, specific, and clearly written by someone who looked closely.
Rank 1's note describes custom SVG marks instead of "the random emoji some Opus runs lean on";
rank 4 names "Composer sickness: it does the bare minimum". This is the most opinionated and most
useful writing in the project, and it is about models the gallery now hides.

**Cost.** High for a first-time visitor, because "Rankings" is a top-level navigation item and it
reads as current. A Playwright test asserts the count is exactly 8, which locks the staleness in.

**Fix.** Two honest options. Either date-stamp the page as a snapshot ("Rankings as of April
2026") and leave it, or rank the current models and drop the rest. The worst option is the
current one, which is an undated list of superseded models under a present-tense heading.

---

## A8. The archive rule guesses at newness

**Claim at risk:** the default set of cards you see.

**Evidence.** `src/lib/gallery-archived.ts` decides visibility with a hand-maintained family and
tier table. A model is archived when a model in the same family has a strictly higher tier
number. Two quirks:

- Sol, Luna and Terra all sit at `{ family: "gpt", tier: 4 }`, tied, so none archives the others,
  while `gpt-5.5-high` at tier 3 is archived by all three.
- A separate `FORCE_ARCHIVED_MODELS` set overrides the rule for seven models: Composer 2.0,
  Composer 2.5, Kimi K 2.6, Luna, Opus 4.7, Opus 4.8 and Terra. Two of those, Luna and Terra, are
  GPT-5.6 runs that the sort-order table treats as the newest GPT entries in the project.

Meanwhile `gallery-model-order.ts` holds a **second, different** numbering for the same models
(`sol: tier 59, luna: 58, terra: 57`), used for sort order rather than archiving. So the project
carries two disagreeing opinions about model recency.

**Cost.** Low, and mostly a maintenance smell. But the effect is visible: the top-ranked model in
the project is hidden by default.

**Fix.** One table, with a real release date per model, feeding both sort order and archiving.
Drop `FORCE_ARCHIVED_MODELS` or rename it to what it is, a manual "hide this" list.

---

## A9. The thumbnails are not clean captures

**Claim at risk:** "each card shows five real rendered previews", from `README.md`.

**Evidence.** Two sample thumbnails inspected directly,
`public/gallery-previews/with-design-skill/opus-5/1.webp` and
`public/gallery-previews/without-design-skill/sonnet-5/3.webp`. Both contain:

- the gallery's own floating switcher down the right edge (home icon, "VS", skill icon, palette
  icon, iteration chips 1 to 5, with the current one highlighted in the site's pink)
- the circular Next.js development-mode badge in the bottom-left corner

Cause, from `scripts/capture-previews.mjs`: it visits
`${baseUrl}/${group}/${model}/${iteration}?preview=1`, and nothing in the application reads
`preview=1`. The switcher-free route is `/preview/{group}/{model}/{iteration}` and exists. The
script also starts `npm run dev`, which is what puts the development badge on screen.

**Cost.** Medium. The previews are the first thing every visitor sees, they are the guessing
game's board, and they are the rankings page's illustrations. In the guessing game the pink chip
is a mild tell about nothing, and the site's own chrome sits inside images meant to show only the
model's work.

**Fix.** Two lines. Point the capture script at `buildPreviewHref(...)` and run it against
`npm run build && npm run start` instead of `npm run dev`. Then re-capture all 320.

---

## A10. The guessing game's chance baseline is not marked

**Claim at risk:** the score tiers.

**Evidence.** From `src/components/game/model-lab-wordle.tsx`: 5 rounds, 3 guesses per round,
8 labs to choose from, and the answer is the lab, not the model. Three guesses without
replacement from eight options gives a 37.5% chance of hitting by luck alone. The tier table
places "Coin Flipper" at 34% and above and "Pattern Matcher" at 66% and above.

So "Coin Flipper" is literally the random band, which the copy half-acknowledges ("Lady luck
showed up today more than your eye did"), and anything below 34% is worse than guessing.

**Cost.** Low. It is a game, and the naming happens to be roughly right. Worth stating because a
reader might mistake a 40% score for skill.

**Fix.** Show the chance line, for example "random play scores about 2 of 5", on the results
card. It makes a 4 of 5 feel earned.

---

## A11. One model, one product, one page type

**Claim at risk:** generalising from this gallery to design ability at large.

**Evidence.** Every one of the 325 pages is a marketing landing page for a note-taking app.
There is no dashboard, no form, no data table, no mobile layout, no empty state, no dark variant,
no multi-page flow.

The project knows this. `src/app/experiments/page.tsx` is a live page of five low-fidelity
concepts for growing past one prompt, headed "Exploration, not implemented yet", proposing
scenario tabs, a harness-by-model matrix, saved comparison baskets, a split workspace, and a
query-string experiment lab. It has sat unimplemented since April.

**Cost.** Medium, and inherent to the design rather than a defect. Landing pages reward exactly
the skills a design skill teaches: a strong hero, typographic contrast, a colour direction. They
do not test information density, state handling, or accessibility, which is where most real
frontend work lives.

**Fix.** The project's own `experiments` page already names the answer. The cheapest second
scenario is a settings or data-table screen, because it inverts what landing pages reward.

---

## Summary table

| ID | Finding | Cost | Fix effort |
| --- | --- | --- | --- |
| A1 | Four skill versions inside one group | High | Medium |
| A2 | One taste run had 13 skills | Medium | Low |
| A3 | 47 of 65 runs have no treatment evidence | Medium | Medium |
| A4 | UI SH treatment unidentified | Low | Low |
| A5 | No date, agent, model build, retries or cost | High | Medium |
| A6 | Switcher deliverable deleted at ingestion | Medium | Low |
| A7 | Rankings stale, partial, mostly hidden | High | Low |
| A8 | Two disagreeing recency tables | Low | Low |
| A9 | Thumbnails contain site chrome and a dev badge | Medium | Low |
| A10 | Chance baseline unmarked in the game | Low | Low |
| A11 | One prompt, one product, one page type | Medium | High |

Three fixes carry most of the value: date-stamp and scope the rankings (A7), record skill
version and run metadata (A1 plus A5), and re-capture the thumbnails from the clean route (A9).
The first two are data-model changes of a few hours. The third is two lines and a rebuild.
