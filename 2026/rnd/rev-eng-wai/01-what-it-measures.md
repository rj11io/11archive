# What the benchmark measures

## The prompt

One prompt drives the whole project. It is stored as a plain string in the home page
component, `src/app/page.tsx:21`, and shown to visitors with a copy button:

> I want you to design the landing page for a note-taking application as essentially a second
> brain. You should design five iterations and each of them should be accessible within the
> slash one, slash two, slash three like pages directory. And then you should add a little
> button that lets me switch between them easily.

Three things follow from that text.

**It reads like dictation, not a spec.** "slash one, slash two, slash three like pages
directory" is spoken shorthand. That is deliberate on the project's part: it tests what models
do with a real, loose request rather than a tidied-up one.

**It asks for three separate deliverables.** A visual design, five distinct attempts, and a
working switcher between them. Only the first is on display.

**It sets no constraints at all.** No brand, no colour, no framework version, no length, no
accessibility bar, no content. Every model invents the product name, the copy, and the
sections. In the sample this teardown looked at, Opus 5 invented "CAIRN" as a wooden card
catalogue and Sonnet 5 invented "Cortex" with sticky notes. Both are answering the same
sentence.

That last point is the project's real subject. It measures **what a model reaches for when
nobody tells it anything**, which is close to how most people actually prompt.

## The five treatments

A **treatment** is the condition a run was carried out under. The project calls them groups
and puts each in its own section of the home page.

| Slug | Site label | Runs | What the model had installed |
| --- | --- | --- | --- |
| `with-design-skill` | With Design Skill | 25 | Anthropic's `frontend-design` skill |
| `without-design-skill` | Without Design Skill | 25 | nothing |
| `with-taste-skill` | With Taste Skill | 10 | `design-taste-frontend` from `Leonxlnx/taste-skill` |
| `with-ui-sh-skill` | With UI SH Skill | 4 | not stated anywhere in the repo or the site |
| `miscellaneous` | With Uncodexify skill | 1 | `uncodixfy` by `cyxzdev` |

Two of the five link out to the exact skill, from `src/lib/gallery-anthropic-skill.ts`:

- `frontend-design` at <https://skills.sh/anthropics/skills/frontend-design>. Its published
  purpose is to push models away from generic template looks by making them commit to an
  aesthetic direction before they build.
- `uncodixfy` at <https://skills.sh/cyxzdev/uncodixfy/uncodixfy>. Its purpose is to name and
  avoid the tells of AI-made interfaces, such as soft gradients and oversized rounded corners.

The taste skill is not linked from the site, but the lockfiles inside the runs identify it
exactly: `Leonxlnx/taste-skill`, skill path `skills/taste-skill/SKILL.md`, install name
`design-taste-frontend`. It is an "anti-slop" rule set with tunable dials and motion patterns.

The UI SH group has no link, no note, and no lockfile. `PRODUCT.md` mentions "ui.sh" in
passing as one of the skills under study. That is the only trace. Treat this group as
unidentified.

## The coverage grid

Twenty-five models, five treatments, one dot per run. `X` means the run exists.

| Model | Design | Taste | UI SH | No skill | Misc |
| --- | :-: | :-: | :-: | :-: | :-: |
| Fable 5 | X | X | | X | |
| Opus 5 | X | X | | X | |
| Opus 4.8 | X | | | X | |
| Opus 4.7 | X | | X | X | |
| Opus 4.6 | X | | | X | |
| Sonnet 5 | X | X | | X | |
| GPT-5.6 Sol | X | X | | X | |
| GPT-5.6 Luna | X | X | | X | |
| GPT-5.6 Terra | X | X | | X | |
| GPT 5.5 high | X | | X | X | |
| GPT 5.5 low | X | | X | X | |
| GPT-5.4 | X | | | X | X |
| Gemini 3.5 Flash | X | | | X | |
| Gemini 3.1 Pro | X | | | X | |
| Grok 4.5 | X | X | | X | |
| Muse Spark 1.2 | X | X | | X | |
| GLM 5.2 | X | X | | X | |
| GLM 5.1 | X | | | X | |
| GLM 5 Turbo | X | | | X | |
| Kimi K3 | X | X | | X | |
| Kimi K 2.6 | X | | | X | |
| Kimi K 2.5 | X | | | X | |
| Composer 2.5 | X | | | X | |
| Composer 2.0 | X | | X | X | |
| Composer 1.5 | X | | | X | |

The grid is **complete on the main axis and sparse everywhere else**. Every model has both a
design-skill run and a no-skill run, which is the comparison the site is built around. Only 10
of 25 have a taste run, and those 10 are all recent arrivals, so the taste axis is a snapshot
of mid-2026 models rather than a like-for-like sweep.

Model families and labs, from `src/lib/model-labs.ts`:

| Lab | Models |
| --- | --- |
| Anthropic | Opus 4.6, 4.7, 4.8, 5; Sonnet 5; Fable 5 |
| GPT | GPT-5.4, 5.5 low, 5.5 high; Sol, Luna, Terra (all labelled GPT-5.6) |
| Google | Gemini 3.1 Pro, Gemini 3.5 Flash |
| Moonshot | Kimi K 2.5, K 2.6, K3 |
| Z.ai | GLM 5 Turbo, 5.1, 5.2 |
| Cursor | Composer 1.5, 2.0, 2.5 |
| xAI | Grok 4.5 |
| Meta | Muse Spark 1.2 |

Sol, Luna and Terra are three separate runs the project labels "GPT-5.6 Sol", "GPT-5.6 Luna"
and "GPT-5.6 Terra", each described in the manifest as "max-reasoning generations". The
repository does not explain what distinguishes them from each other.

## What the project never records

This is the sharpest gap. The whole data model for a run is 8 fields, from
`src/lib/gallery-types.ts`:

```ts
interface GalleryEntry {
  group: GalleryGroupSlug;      // treatment
  groupLabel: string;           // display label
  model: ModelSlug;             // model slug
  modelLabel: string;           // display label
  sourceDir: string;            // where the run came from, as free text
  sourceAppType: "next" | "vite";
  defaultIteration: IterationId;
  summary: string;              // one sentence, hand written
  iterations: GalleryIteration[];
}
```

Absent, with no field to hold them:

- **When the run happened.** Nothing is date-stamped. The only clue is git history.
- **Which agent ran it.** Cursor, Claude Code, Codex and a plain API call would all look
  identical here. `sourceDir` hints at it (`opus-cc-test` reads like Claude Code) and hints are
  all you get.
- **The exact model build.** "Opus 5" is a label, not an API model string.
- **Reasoning effort or temperature.** The manifest text says "max-reasoning" for Sol, Luna and
  Terra in prose. Nothing else says anything.
- **Whether the run was retried.** If a generation failed and was re-rolled, the gallery shows
  the survivor with no mark.
- **Cost or token count.** The README asks for coffee money to fund runs; the runs carry no
  cost record.
- **Any score.** There is no rubric, no rater, no numeric field anywhere in the project. The
  rankings page holds prose only.

The five "iterations" are also worth naming precisely. They are **five designs the model was
asked to produce in a single run**, not five repeated samples of one design. So they measure
range within one attempt, not run-to-run variance. Nothing in the project measures variance.

## What the benchmark therefore supports, and what it does not

Supports:

- "Show me what this model produces from a blank brief." Yes, directly, five ways.
- "Does this model's output change when I install a design skill?" Yes, for any of the 25
  models, side by side, in one URL.
- "What tics does this model have?" Yes, and the guessing game turns that into practice.

Does not support:

- "Which model is best at design?" No score exists, and the one ranked list covers 8 older
  models.
- "Is the design skill worth installing?" The comparison is confounded by skill version drift.
  See [04-methodology-audit.md](04-methodology-audit.md).
- "How consistent is this model?" Nothing repeats a run.
- "Did the model follow the brief?" The switcher part of the brief is removed at ingestion.
