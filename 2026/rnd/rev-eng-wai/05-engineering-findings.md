# Engineering findings

Eleven defects found by reading the code and probing the live site. Each one names the evidence,
the cause, and a fix. Severity is about visitor impact, not about how hard the fix is.

Nothing here was reproduced by running the project. Claims that depend on a build are marked.

---

## E1. Every page downloads a 643 KB stylesheet

**Severity: high.**

**Evidence.** Measured against the live site on 2026-08-11:

| Asset | Bytes |
| --- | --- |
| shared CSS chunk `0iqd0d00u8-fe.css` | 643,192 |
| second CSS chunk `0nw9zuxb1hy6f.css` | 514 |
| home page HTML | 234,839 |
| `/rankings` HTML | 52,108 |
| `/lab-guess` HTML | 17,342 |

**Cause.** `src/app/globals.css` line 1 is a bare `@import "tailwindcss";` with no source
restriction. Tailwind v4's automatic file detection then scans the project from the repository
root and generates a utility class for every one it finds. The repository contains 65 generated
apps under `src/variants` (683 `.tsx` files) plus four more copies of the corpus in root folders
such as `with-frontend-design-skill/`. So the shell's stylesheet ends up containing the union of
every utility class any model ever wrote.

This also explains why the three runs missing their per-run CSS bundle still look right: the
global bundle already carries their utilities. The bug and the accidental safety net are the same
line.

**Fix.** Restrict the shell's stylesheet to the shell, and keep the per-run bundles for the
variants:

```css
/* src/app/globals.css */
@import "tailwindcss" source(none);
@source "./";                    /* src/app */
@source "../components";
@source "../lib";
```

Then complete the per-run route coverage (see E4) so no run depends on the global bundle. Measure
the shared chunk before and after; the expectation is a shell bundle in the tens of kilobytes.

**Risk.** Any run without its own bundle will lose its utility classes the moment this lands. Do
E4 first, or do both in one change.

---

## E2. Dark mode never reaches native controls

**Severity: medium.**

**Evidence.** `src/app/globals.css`:

```css
:root {
  color-scheme: light !important;
  ...
}
.dark {
  color-scheme: dark;
  ...
}
```

And the inline script in `src/lib/gallery-theme.ts`, which the root layout injects into `<head>`:

```js
document.documentElement.style.colorScheme = d ? "dark" : "light";
```

**Cause.** In CSS, an `!important` declaration in a stylesheet beats a normal declaration in an
inline `style` attribute, and it beats any non-important rule regardless of specificity. So
`color-scheme: light !important` on `:root` wins over both `.dark { color-scheme: dark }` and the
inline value the theme script sets. The document's effective `color-scheme` is always `light`.

`color-scheme` is what tells the browser to render its own widgets dark: default scrollbars,
checkboxes, radio buttons, date pickers, text-input carets and the default canvas colour. In dark
mode those stay light.

The site partly masks this by hiding all scrollbars globally (`*::-webkit-scrollbar { display:
none }`), which removes the most obvious symptom, and the gallery shell has few native controls.
Generated variants have more.

**Fix.** Drop one word:

```css
:root {
  color-scheme: light;   /* was: light !important */
  ...
}
```

The `!important` was almost certainly added to stop a generated variant's `:root` rule from
changing the shell. Stage-one CSS scoping already prevents that, because it rewrites every
variant `:root` into the variant's own scope.

---

## E3. All 320 auto-captured thumbnails contain site chrome and a dev badge

**Severity: medium.** Also recorded as A9 in [04-methodology-audit.md](04-methodology-audit.md),
because it is both a bug and a measurement problem.

**Evidence.** Two thumbnails opened directly:
`public/gallery-previews/with-design-skill/opus-5/1.webp` and
`public/gallery-previews/without-design-skill/sonnet-5/3.webp`. Both show the gallery's floating
switcher down the right edge and the round Next.js development badge bottom-left.

**Cause.** Two mistakes in `scripts/capture-previews.mjs`:

```js
const url = `${baseUrl}/${group}/${model}/${iteration}?preview=1`;
```

`?preview=1` is dead. A grep across `src` for `searchParams` finds it used only by the compare
page. The route that suppresses the switcher is `/preview/{group}/{model}/{iteration}`, built for
exactly this and used by the compare iframes.

```js
spawn(npmCommand, ["run", "dev", "--", "-p", capturePort], ...)
```

Capturing against the dev server puts the development badge in every frame.

**Fix.**

```js
// scripts/capture-previews.mjs
const url = `${baseUrl}/preview/${group}/${model}/${iteration}`;
```

and start the production server instead:

```js
spawn(npmCommand, ["run", "start", "--", "-p", capturePort], ...)
```

with a documented `npm run build` beforehand. Then re-capture everything:

```bash
npm run build
npm run capture-previews
```

Add a guard so this cannot regress: after each screenshot, assert that the page contains no
element matching `nav[aria-label$="gallery navigation"]`.

---

## E4. Three runs have no per-run CSS route

**Severity: medium, and rising the moment E1 lands.**

**Evidence.** Counted in the checkout:

| Item | Count |
| --- | --- |
| runs in the manifest | 65 |
| literal routes under `(generated-variant-routes)` | 56 |
| literal preview routes | 59 |

Missing non-preview routes: `kimi-k3`, `muse-spark-1.2`, `opus-5`, each in all three of their
groups. Missing preview routes: `kimi-k3` and `opus-5`, each in all three groups.

**Cause.** These route folders are generated by hand and
`skills/add-generation-to-gallery/SKILL.md` never mentions the step, so the three most recently
added models were ingested without them. They currently work only because of E1.

**Fix.** Write a generator script, `scripts/generate-variant-routes.mjs`, that reads the manifest
and emits both route folders and both CSS entries for every run, then wire it into `prebuild`
alongside `scope-variant-css.mjs`. Add the step to the ingestion skill. Add a test that asserts
the route count equals the manifest length times two.

---

## E5. There is no license

**Severity: high, and it is legal rather than technical.**

**Evidence.** GitHub reports `licenseInfo: null`. No `LICENSE`, `NOTICE` or `COPYING` file exists
in the checkout. The repository contains:

- 325 landing pages generated by 25 models from eight companies, redistributed as source
- brand logos for OpenAI, Anthropic, Google, xAI, Moonshot, Z.ai, Cursor and Meta, in
  `public/*.svg`, `public/*.webp` and `public/brand-raw/`
- two third-party skills' rule text, reachable through the copied source folders

**Cause.** Never added. The project is a personal weekend build that grew.

**Fix.** Three separate statements, because three different things are being distributed:

1. A license for the site's own code, for example MIT, covering `src/app`, `src/components`,
   `src/lib`, `scripts`, `tests`.
2. A statement about the corpus in `src/variants`: what it is, that it was produced by the named
   models from the stated prompt, and what a reader may do with it. This is the hard one and it
   deserves a sentence acknowledging that.
3. A trademark notice for the logos: used to identify the labs, no affiliation or endorsement
   implied, all marks belong to their owners.

---

## E6. The design document contradicts the shipped code

**Severity: low for visitors, high for anyone contributing.**

**Evidence.** `DESIGN.md`, 324 lines, states in section 1: "**Light-only canvas.** `#fafafa`,
locked. Dark mode is on the roadmap but not a current design constraint." Section 6 makes it a
rule: "**Don't** introduce **dark mode partially.** Light mode is locked until a full dark-mode
pass is designed; do not branch components defensively for a theme that doesn't exist yet."

The code disagrees. `globals.css` carries a complete `.dark` token set of 22 variables, there is a
`GalleryThemeProvider` and a `GalleryThemeToggle`, brand logos have light and dark variants via
`theme-aware-logo.tsx`, and a Playwright test asserts the dark theme survives navigating into a
generation and back. Dark mode arrived in pull request #8, "Add Gemini 3.5 Flash gallery editions
and dark mode", merged 2026-05-27.

`.impeccable/design.json` is stamped `"generatedAt": "2026-05-16T06:50:00Z"`, eleven days before
dark mode merged, which dates the drift precisely.

**Fix.** Update `DESIGN.md` sections 1, 2 and 6, and document the dark token set the same way the
light one is documented. Regenerate `.impeccable/design.json`.

The document is otherwise excellent and worth preserving: it names its rules ("The Signal Rule",
"The One-Face Rule", "The Game-Color Quarantine"), it explains why each exists, and it lists what
the site must not become. That is rarer than a colour table.

---

## E7. The repository is 179 MB, and most of it is scaffolding

**Severity: medium, mostly for contributors.**

**Evidence.**

| Measure | Value |
| --- | --- |
| GitHub disk usage | 179,385 KB |
| `src/` | 78 MB |
| `public/` | 93 MB |
| `package.json` files inside `src/variants` | 41 |
| `package-lock.json` files inside `src/variants` | 33 |
| `AGENTS.md` or `CLAUDE.md` files inside `src/variants` | 77 |
| tracked JPEGs under `.codex-remote-attachments/` | 3 |
| root folders holding a second copy of part of the corpus | 4 |

**Cause.** The ingestion recipe says "Keep the source app's internal directory shape intact where
possible", so each of the 65 ingested apps brings its whole Node project with it. None of it is
used at runtime: the adapter imports specific component files and nothing reads those lockfiles.
The root folders `with-frontend-design-skill/`, `without-frontend-design-skill/`,
`with-ui-sh-skill/` and `with-uncodexify-skill/` are excluded from `tsconfig.json` yet still
tracked, so 24 runs exist twice in git. The three `.codex-remote-attachments` JPEGs are cloud-agent
paste artifacts committed by accident in two separate commits.

**Fix.**

- Add an ingestion step that deletes `package.json`, `package-lock.json`, `tsconfig.json`,
  `eslint.config.mjs`, `next.config.ts`, `postcss.config.mjs`, `README.md` and `favicon.ico` from
  the copied source. Keep `skills-lock.json`, which is the only provenance evidence the project
  has (see A1).
- Add `.codex-remote-attachments/` to `.gitignore` and remove the three files.
- Decide whether the root corpus folders are the archive of record or dead weight, then keep one
  copy.
- Move `public/gallery-previews` (93 MB and growing by 5 images per run) to Git LFS or an object
  store with the manifest holding URLs.

None of this shrinks history without a rewrite. It stops the growth, which matters more: at
5 images plus one full Node project per run, the next 25 models add roughly the same weight again.

---

## E8. No robots.txt, no sitemap, and 325 duplicate pages are indexable

**Severity: medium if discovery matters to the project.**

**Evidence.** Live probes on 2026-08-11:

| Path | Status |
| --- | --- |
| `/` | 200 |
| `/rankings` | 200 |
| `/lab-guess` | 200 |
| `/experiments` | 200 |
| `/compare` | 307 |
| `/with-design-skill/opus-5/1` | 200 |
| `/preview/with-design-skill/opus-5/1` | 200 |
| `/robots.txt` | 404 |
| `/sitemap.xml` | 404 |

The root layout's metadata sets only a title, a description and an icon. No `robots` directive
exists, so every one of the 325 `/preview/...` pages is a fully indexable near-duplicate of its
`/{group}/{model}/{iteration}` twin.

**Cause.** Never added. Next.js will generate both files from `app/robots.ts` and
`app/sitemap.ts`, and neither exists.

**Fix.**

```ts
// src/app/robots.ts
import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: "/preview/" }],
    sitemap: "https://www.whichai.dev/sitemap.xml",
  };
}
```

```ts
// src/app/sitemap.ts
import { galleryManifest } from "@/lib/gallery-manifest";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.whichai.dev";
  const pages = ["", "/compare", "/rankings", "/lab-guess"];
  const variants = galleryManifest.flatMap((entry) =>
    entry.iterations.map((it) => `/${entry.group}/${entry.model}/${it.id}`),
  );
  return [...pages, ...variants].map((path) => ({ url: `${base}${path}` }));
}
```

Also add Open Graph and Twitter card metadata. This is a project people share on X and in Slack,
and it currently produces a bare link with no image.

---

## E9. An unfinished exploration page is live and theme-broken

**Severity: low.**

**Evidence.** `https://www.whichai.dev/experiments` returns 200 and 44,938 bytes. Its own heading
reads "Exploration, not implemented yet" and its subtitle says "None of these are wired to data
yet". `src/app/experiments/page.tsx` styles its mockups with hardcoded literals such as
`bg-white`, `text-neutral-900` and `border-neutral-200` rather than the `--gallery-*` tokens every
other surface uses, so it renders as a light page inside a dark shell.

It is not linked from the navigation, but it is crawlable, shareable and 239 lines long.

**Cause.** A design exploration from April that was never gated or removed.

**Fix.** Keep it, because the ideas in it are the project's roadmap, but move it behind a
`NEXT_PUBLIC_SHOW_EXPERIMENTS` flag or into a markdown document, and convert the mockup colours to
the theme tokens if it stays a page.

---

## E10. Duplicate libraries in the dependency list

**Severity: low.**

**Evidence.** `package.json` lists `framer-motion@^12.23.24` and `motion@^12.38.0`, which are the
same animation library under its old and new package names, plus `gsap@^3.15.0`. It also lists
both `lucide-react` and `@phosphor-icons/react`.

**Cause.** Almost certainly inherited: generated variants import whichever library their model
reached for, and the dependency was added to the root project to make the build pass.

**Fix.** Check which variants import which, then either pin the whole shell to `motion` and keep
`framer-motion` only if a variant needs it, or leave it and add a one-line comment saying why. Not
urgent; worth a note so a future contributor does not assume it is a mistake to clean up.

---

## E11. Route coverage in tests is a hand-maintained list

**Severity: low.**

**Evidence.** `tests/gallery-routes.spec.ts` smoke-tests the last five manifest entries
automatically plus 24 routes hardcoded in `sampleRouteSmokeCases`. It also hardcodes a
`forceArchivedModels` list of four models, while `src/lib/gallery-archived.ts` force-archives
seven, and it asserts the rankings list has exactly 8 items, which locks in the staleness
described in A7.

**Cause.** Reasonable pragmatism. Testing all 650 prerendered pages in Playwright would be slow.

**Fix.** Two cheap improvements. Derive the archived-model list from
`src/lib/gallery-archived.ts` instead of retyping it, so the two cannot drift. And replace the
hand-picked 24 with a deterministic sample, for example every run's default iteration, which is 65
page loads and covers every registry key. Keep the rankings count assertion but derive it from
`modelRankings.length`.

---

## Priority order

| Order | Finding | Why first |
| --- | --- | --- |
| 1 | E4 then E1 | E4 unblocks E1, and E1 is the biggest single win for every visitor |
| 2 | E3 | Two lines, and it fixes the first thing every visitor sees |
| 3 | E5 | Legal exposure does not improve with age |
| 4 | E2 | One word, visible to every dark-mode visitor |
| 5 | E8 | Cheap, and the project's growth depends on people finding it |
| 6 | E7 | Stops the repository doubling again |
| 7 | E6, E9, E10, E11 | Contributor-facing tidy-up |
