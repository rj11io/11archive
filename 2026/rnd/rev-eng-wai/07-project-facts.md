# Project facts

Everything here was read from the repository, the GitHub API, or the live site on 2026-08-11.

## Identity

| Field | Value |
| --- | --- |
| Repository | `SunkenInTime/ui-design-bench` |
| Site | <https://www.whichai.dev/> |
| Package name | `composer-bench-gallery` version `0.1.0`, private |
| Author | Dara Adedeji, GitHub `SunkenInTime`, X `@daradoescode` |
| Default branch | `master` |
| Created | 2026-03-21T19:51:17Z |
| Last push | 2026-08-09T21:27:51Z |
| License | none |
| Topics | `benchmark`, `design`, `ui` |
| Description on GitHub | empty |

The package name is a fossil. The project began as a Cursor Composer comparison and grew into a
25-model gallery; the name never changed, and the git history opens with "Add unified Next.js
gallery" on 2026-03-21.

## Size

| Measure | Value |
| --- | --- |
| GitHub disk usage | 179,385 KB |
| `src/` on disk | 78 MB |
| `public/` on disk | 93 MB |
| TypeScript | 4,527,932 bytes |
| CSS | 2,776,832 bytes |
| JavaScript | 177,222 bytes |
| HTML | 1,146 bytes |
| `.tsx` files under `src/variants` | 683 |
| `.css` files under `src/variants` | 122 |
| thumbnail images | 321 |

## Corpus

| Measure | Value |
| --- | --- |
| Runs (model plus treatment) | 65 |
| Distinct models | 25 |
| Labs represented | 8 |
| Generated pages | 325 |
| Source app types | 64 Next.js, 1 Vite |
| Prerendered pages on the live site | 650 gallery pages plus four surfaces |

Runs per treatment: design skill 25, no skill 25, taste skill 10, UI SH 4, Uncodexify 1.

The single Vite app is the Opus 4.6 design-skill run, `sourceDir`
`with-frontend-design-skill/opus-4.6/second-brain`, described in the manifest as "A Vite-based set
of five animated routes ported into the unified gallery runtime". Everything since has been
Next.js.

Source folder families, which are the closest thing to a run log the project has:

| Folder prefix | Runs | Reads as |
| --- | --- | --- |
| `with-frontend-design-skill/` | 12 | the original design-skill sweep |
| `without-frontend-design-skill/` | 12 | the original baseline sweep |
| `gpt-5-6-test/` | 9 | Sol, Luna and Terra, three treatments each |
| `ui-sh-test/` | 4 | the UI SH group |
| `kimi-k3/`, `glm5-2/`, `sonnet-bench/`, `muse-spark-test/`, `opus-cc-test/`, `grok-4-5-test/` | 3 each | later per-model sweeps, three treatments each |
| `composer-2.5-bench/`, `gemini-part-dou/`, `opus-4.8-test/` | 2 each | two-treatment sweeps |
| `fable-with-skill-run/`, `fable-test-taste-skill/`, `fable-test-run/` | 1 each | Fable 5, one folder per treatment |
| `with-uncodexify-skill/` | 1 | the Uncodexify run |

The shift from two-treatment to three-treatment sweeps marks when the taste skill entered the
project, around June.

## History

101 commits, 2026-03-21 to 2026-08-09.

| Month | Commits |
| --- | --- |
| 2026-03 | 25 |
| 2026-04 | 27 |
| 2026-05 | 14 |
| 2026-06 | 11 |
| 2026-07 | 14 |
| 2026-08 | 10 |

Authorship, counting all branches:

| Author | Commits |
| --- | --- |
| Dara Adedeji (`SunkenInTime` noreply address) | 77 |
| Dara Adedeji (personal address) | 28 |
| `vercel[bot]` | 1 |
| `posthog[bot]` | 1 |

One human, two git identities, two bots. There is no second contributor in the commit history.

Eighteen pull requests, fourteen merged and four open.

| # | Title | State | Author |
| --- | --- | --- | --- |
| 18 | Complete Muse Spark 1.2 gallery | merged | SunkenInTime |
| 17 | Add project support and sponsor links | merged | SunkenInTime |
| 16 | Add complete Muse Spark 1.2 generations | merged | SunkenInTime |
| 15 | Install and configure Vercel Web Analytics | open | `vercel` bot |
| 14 | Add PostHog analytics integration | open | `posthog` bot |
| 13 | Add Kimi K3 gallery generations | merged | SunkenInTime |
| 12 | Optimize compare page and site-wide performance | open | SunkenInTime |
| 11 | Add gallery preview assets for variant showcases | merged | SunkenInTime |
| 10 | Add keyboard navigation | open | `jadefw` (Jonas) |
| 9 | Add Fable 5 gallery entries and keep Opus 4.8 visible | merged | SunkenInTime |
| 8 | Add Gemini 3.5 Flash gallery editions and dark mode | merged | SunkenInTime |
| 7 | Codex/hero title treatments | merged | SunkenInTime |
| 6 | Add Wordle-style AI lab guessing game and top-level "Lab guess" tab | merged | SunkenInTime |
| 5 | Uncodixify Bench and site cleanup | merged | SunkenInTime |
| 4 | Cursor/gallery previews and config | merged | SunkenInTime |
| 3 | Gallery: WebP brand assets, variant switcher, and design-skill UI | merged | SunkenInTime |
| 2 | Small UX Changes | merged | SunkenInTime |
| 1 | Replace variant switchers with shared gallery navigation | merged | SunkenInTime |

Three things stand out.

**The branch names are an agent log.** Twelve remote branches survive, prefixed by the tool that
opened them: `cursor/gallery-previews-and-config`, `cursor/rankings-page`,
`cursor/gallery-brand-webp-assets`, `cursor/gallery-card-hover-animation`,
`codex/fable-generation-upstream`, `agent/add-muse-spark-1-2-generations`,
`posthog/instrumentation-1808cc`, `vercel/install-and-configure-vercel-w-47ff2h`, plus
`feature/`, `uncodixify-` and `master`. Merged branches such as `codex/hero-title-treatments` and
`agent/add-kimi-k3-generations` appear in the pull request record. The project is built by agents
and the prefixes record which one.

**Recent model additions are single agent pull requests.** #13 opened and merged within five
minutes; #16 within six. That is the `add-generation-to-gallery` skill paying off.

**The only outside contribution is still open.** Pull request #10, "Add keyboard navigation" from
Jonas, opened 2026-06-10, unmerged two months later. `PRODUCT.md` says keyboard navigation "should
work where it would naturally work" but "does not need formal audit", which explains the low
priority.

The first pull request is the origin of the whole architecture: "Replace variant switchers with
shared gallery navigation". Before it, each generated app kept its own switcher. That change is
what created the ingestion rule that deletes them, which is also A6 in
[04-methodology-audit.md](04-methodology-audit.md).

## Hosting and delivery

| Field | Value |
| --- | --- |
| Host | Vercel |
| Framework | Next.js 16.2.0, React 19.2.4, Tailwind CSS 4 |
| Rendering | fully prerendered (`x-nextjs-prerender: 1`) |
| Cache | `public, max-age=0, must-revalidate`, `x-nextjs-stale-time: 300` |
| Edge at time of check | `cdg1`, cache HIT, age 170,465 seconds |
| Transport security | `Strict-Transport-Security: max-age=63072000` |
| Analytics | none live; two bot pull requests propose Vercel Analytics and PostHog, both unmerged |
| `robots.txt` | 404 |
| `sitemap.xml` | 404 |
| Page title | "Which AI Made This?" |
| Meta description | "Compare AI-generated UIs from the same prompt across models, with and without a frontend design skill." |
| Open Graph tags | none |

The cache age of roughly 47 hours at check time matches the last deployment, which fits a site
that changes only when a model is added.

No analytics is worth noting alongside the sponsorship pitch: the project asks for money to fund
runs and has no measurement of its own reach.

## Money and support

Three funding lines, all disclosed on the site and in the README:

- **Buy Me a Coffee**, <https://www.buymeacoffee.com/daradoescode>. The README is direct about
  what it pays for: "Running fresh model generations is the main cost behind WhichAI.dev."
- **Greptile Open Source Program**, providing AI code review, credited with an animated badge on
  the home page and in the README.
- **OpenAI Codex for Open Source**, providing "tooling and credits that support open-source
  maintenance and benchmark development".

The OpenAI sponsorship is worth stating plainly, without implying anything about the content: a
benchmark that compares OpenAI models against competitors receives credits from OpenAI. Nothing in
the code or the rankings suggests it changed any judgement, and the rankings that exist put two
Anthropic models first and GPT-5.4 fifth with a sharp note about card overuse. But the relationship
is a fact a reader should know, and the site does disclose it.

## Neighbours

Similar projects found while researching, for orientation rather than comparison:

- **Design Arena** (Y Combinator S25), a crowdsourced head-to-head benchmark for AI-generated
  design across frontend, image, audio and video. Human pairwise voting produces a leaderboard.
  <https://news.ycombinator.com/item?id=44878257>
- **DesignArena**, an earlier crowdsourced benchmark for AI-generated interface work.
  <https://news.ycombinator.com/item?id=44542578>
- **UI-Bench**, an academic benchmark for the design capability of text-to-app tools.
  <https://arxiv.org/abs/2508.20410>
- **Graphic-Design-Bench**, an academic benchmark for graphic design tasks.
  <https://arxiv.org/html/2604.04192v1>

WhichAI.dev occupies a different position from all four. Those produce scores through crowd votes
or automated rubrics. This one produces no score at all and hands you the artifacts. That is a
deliberate choice, stated in the README's opening: other leaderboards prove "Model A is 2.3% better
than Model B", and "none of those spreadsheets tell you what you actually want to know: if I ask
this thing to build a landing page, will it look good?"

Its distinctive asset is the corpus. 325 preserved, running, side-by-side generated applications
from 25 models under labelled conditions is, as far as this search found, unique. No leaderboard
lets you open the code.

## Reception

Direct search for coverage of "whichai.dev" or "Which AI Made This" returned nothing: no Hacker
News thread, no blog posts, no aggregator entries. With 77 stars and 8 forks, the project has real
but small reach, and it appears to travel by direct link rather than through indexed writing. The
missing `sitemap.xml`, absent Open Graph tags and lack of analytics all point the same way. See E8
in [05-engineering-findings.md](05-engineering-findings.md).
