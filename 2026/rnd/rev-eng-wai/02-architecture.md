# Architecture

## The problem this solves

Take 325 landing pages written by 25 different models. Each arrived as its own complete Next.js
project, with its own global stylesheet that sets the page background, its own `@keyframes`
animations, its own fonts, and its own floating switcher pinned to the top right of the screen.

Now put all 325 inside one website, on one server, with one shared navigation bar, and make
sure that clicking from one to the next never leaves a stray rule behind.

That is the whole engineering problem, and the answer is worth stealing. Think of it as
mounting 325 paintings in one hall: every painting keeps its own frame and lighting, but none
of them may repaint the walls.

## The chain from data to pixels

Five links, each with one job.

```
gallery-manifest.ts   -->  gallery-registry.ts  -->  src/variants/{group}/{model}/index.tsx
   (the list)                (the lookup)                    (the adapter)
                                                                  |
                                                                  v
                                            the model's own page components, imported directly
                                                                  |
                                                                  v
                                       src/generated/scoped-variant-css/... (rewritten CSS)
```

**1. The manifest is the single source of truth.** `src/lib/gallery-manifest.ts` is a
hand-maintained array of 65 entries. Every route, every thumbnail path, every dropdown option,
every test case and every guessing-game round is derived from it. Nothing else holds a list of
models.

**2. The registry maps a string key to code.** `src/lib/gallery-registry.ts` holds a flat
object keyed `"{group}:{model}"`, for example `"with-design-skill:opus-5"`, with 65 static
imports at the top. It exists because the manifest is data and cannot import components.

**3. The variant module adapts a whole app down to one function.** Each
`src/variants/{group}/{model}/index.tsx` exports an object with a single `render` method:

```ts
interface VariantModule {
  render(props: { entry: GalleryEntry; iteration: IterationId; preview: boolean }): ReactNode;
}
```

This is where the messy part is absorbed. Every model laid its five designs out differently, so
each adapter is written by hand. Two real examples:

- **Opus 5** produced five App Router routes each with its own `layout.tsx`, so the adapter
  imports both the page and the layout and nests them: `<Layout><Page /></Layout>`.
- **Kimi K3** produced five named components under `app/designs/d1..d5` (`Archive`,
  `Observatory`, `Garden`, `Instrument`, `Blueprint`) plus one CSS file each, so the adapter
  imports five components and six stylesheets.

**4. The view renders inside a scoping wrapper.**
`src/components/gallery/gallery-iteration-view.tsx` wraps every generation in one div that
carries the identity of the run:

```tsx
<div className="gallery-generation"
     data-gallery-generation
     data-gallery-group={entry.group}
     data-gallery-model={entry.model}
     data-gallery-iteration={iteration}>
  {variantModule.render({ entry, iteration, preview })}
</div>
```

Those data attributes are the hook the CSS rewriter targets.

**5. The shell defends itself.** `src/app/globals.css` sets the page background and text colour
with `!important` on `html` and `body`, with a comment saying exactly why: "Variant bundles can
bring their own global body rules. Keep the gallery shell stable."

## The two-stage CSS isolation

This is the reusable idea in the project.

### Stage one: rewrite every selector at build time

`scripts/scope-variant-css.mjs` (220 lines, PostCSS plus `postcss-selector-parser`) runs on
`predev` and `prebuild`. It walks every `.css` file under `src/variants`, rewrites it, and
writes the result to `src/generated/scoped-variant-css/` mirroring the input path. Four
transformations:

**Prefix every selector with the run's identity.** A rule written as `.hero { ... }` in the
Opus 5 design-skill run becomes:

```css
:where(.gallery-generation[data-gallery-group="with-design-skill"][data-gallery-model="opus-5"]) .hero { ... }
```

The `:where()` wrapper is the clever part: it adds zero specificity, so the model's own
specificity ordering survives untouched. Without it, every rule would get heavier by three
selectors and the original cascade would scramble.

**Turn page-level selectors into scope selectors.** `html`, `body` and `:root` are replaced by
the scope itself rather than prefixed. So a model's `body { background: #0a0a0a }` styles only
its own container, not the whole site. A duplicate-root cleanup pass removes the redundant
descendant that this replacement can leave behind.

**Namespace animations.** Every `@keyframes fadeIn` becomes
`@keyframes gallery-with-design-skill-opus-5-source-src-app-globals-fadeIn`, and every
`animation` and `animation-name` declaration is rewritten to match. Without this, two models
that both named an animation `float` would silently overwrite each other.

**Strip the global Tailwind entry.** `@import "tailwindcss"` and every `@theme` block is
deleted from the variant copy, because Tailwind is set up once by the shell.

### Stage two: give each run its own Tailwind bundle

Rewriting hand-written CSS is not enough, because most generated pages use Tailwind utility
classes, which do not exist until Tailwind scans the source and generates them.

The answer is a route group, `src/app/(generated-variant-routes)/`, which holds a literal
folder path per run rather than a dynamic one. Each contains a four-line CSS entry:

```css
@layer theme, utilities;
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/utilities.css" layer(utilities) source(none);
@source "../../../../../variants/with-design-skill/sonnet-5";
```

`source(none)` switches off Tailwind's automatic file scanning and `@source` points it at
exactly one variant folder. The page then imports that file, so Next.js code-splits it and a
visitor to one run downloads only that run's utilities.

The route file itself is a thin repeat of the dynamic route with the group and model hardcoded
and the variant module passed in directly.

### Where stage two is incomplete

The literal routes are generated per run and three runs are missing theirs:

| Coverage | Count |
| --- | --- |
| Runs in the manifest | 65 |
| Literal non-preview routes | 56 |
| Literal preview routes | 59 |

Missing non-preview routes: `kimi-k3`, `muse-spark-1.2` and `opus-5`, in all three of their
groups. Missing preview routes: `kimi-k3` and `opus-5`, in all three groups.

Those runs fall through to the shared dynamic route and depend on the shell's stylesheet for
their utilities. It works today only because the shell's stylesheet is unrestricted and
therefore contains every utility used anywhere in the repository. See
[05-engineering-findings.md](05-engineering-findings.md), findings 1 and 4: the same missing
restriction that makes those three runs work is what makes every page carry 643 KB of CSS.

## Routing

Four route shapes:

| Route | Purpose | Rendering |
| --- | --- | --- |
| `/{group}/{model}/{iteration}` | a generation with the gallery switcher | prerendered, `dynamicParams = false` |
| `/preview/{group}/{model}/{iteration}` | the same generation with no switcher | prerendered, used inside compare iframes |
| `/(generated-variant-routes)/{group}/{model}/{iteration}` | same URL as row one, but with a per-run CSS bundle | literal path wins over the dynamic one |
| `/compare`, `/rankings`, `/lab-guess`, `/experiments` | the four visitor surfaces | static plus client state |

`dynamicParams = false` with `generateStaticParams()` derived from the manifest means the whole
site is built ahead of time: 325 generation pages plus 325 preview pages, all static files on
Vercel. Response headers on the live site confirm it (`x-nextjs-prerender: 1`).

`/compare` keeps its full state in six query parameters (`leftGroup`, `leftModel`,
`leftIteration` and the three right-hand equivalents), which is what makes a comparison
shareable as a link. `src/lib/compare.ts` validates all six against the manifest and returns
one of three outcomes: a valid state, `"default"` when no parameters are present, or
`"invalid"`. Nothing half-valid gets rendered.

## Preview capture

`scripts/capture-previews.mjs` produces the thumbnails:

1. Start the dev server on port 3000 unless `CAPTURE_BASE_URL` is set.
2. Launch headless Chromium at 1440 by 960.
3. For each run and each of its five iterations, visit the page, check that it is not the 404
   page, wait 5 seconds for animations to settle, screenshot, convert to WebP at quality 85,
   write to `public/gallery-previews/{group}/{model}/{n}.webp` with up to six write retries.
4. `TARGET_GROUP` and `TARGET_MODEL` environment variables narrow the run.

The 5-second settle and the retrying writer are both signs of a script hardened by real
failures. Two problems remain, covered in [05-engineering-findings.md](05-engineering-findings.md):
it visits the switcher-bearing route with a `?preview=1` parameter nothing reads, and it runs
against the dev server, so the Next.js development badge lands in every image.

## Testing

Playwright against a production build on port 3100, from `playwright.config.ts`, with three
specs:

- `tests/gallery-routes.spec.ts` (235 lines) is the real one. It asserts the archive rules,
  same-family ordering, the rankings count, that the dark theme survives navigating into a
  generation and back, and, best of all, that the switcher's own text colours are exactly
  `rgb(250,250,250)`, `rgb(82,82,82)` and `rgb(82,82,82)` while the generation's `--background`
  variable is `#fff` and the document root's is empty. That last test is a direct regression
  guard on the CSS isolation.
- `tests/compare-routes.spec.ts` covers the compare page's parameter handling.
- `tests/gallery-visual-smoke.spec.ts` is a 19-line smoke check.

Route coverage is sampled, not exhaustive: the last five manifest entries plus 24 hand-picked
routes. With 325 pages, sampling is the right call, but the hand-picked list has to be edited
by hand each time a model is added.

## Dependencies worth noting

From `package.json`, package name `composer-bench-gallery` version `0.1.0`:

- `next@16.2.0`, `react@19.2.4`, `tailwindcss@4`
- Four animation libraries at once: `framer-motion@12.23.24`, `motion@12.38.0`, `gsap@3.15.0`.
  `framer-motion` and `motion` are the same library under two names, both installed.
- Two icon libraries: `lucide-react` and `@phosphor-icons/react`
- `html-to-image` for the guessing game's shareable score card
- `sharp` and `@playwright/test` for the capture script

The duplicate animation and icon libraries are almost certainly inherited from generated code
rather than chosen.
