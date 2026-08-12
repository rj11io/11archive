# Methodology and sources

## What was examined

Three sources, all on 2026-08-11.

**The local checkout.** A full clone of the repository at commit `3bdd0cb` ("Merge pull request #18 from SunkenInTime/agent/add-muse-spark-1-2-generations",
2026-08-09). The working tree was clean and `HEAD` matched `origin/master` exactly, so the checkout
is the current published state, not a fork or a stale copy.

**The public repository.** `https://github.com/SunkenInTime/ui-design-bench`, read through the GitHub
CLI for metadata and the pull request list, and through a page fetch for the README rendering.

**The live site.** `https://www.whichai.dev/`, read through response headers, direct route probes, and
a page fetch of the home page.

## How the work was done

**Read the whole surface, sample the corpus.** Every file outside `src/variants` and
`src/app/(generated-variant-routes)` was read in full: 13 library files, 10 page components, 14
gallery components, three build scripts, three test specs, all configuration, `README.md`,
`PRODUCT.md`, `DESIGN.md` and the ingestion skill. The corpus itself, 683 component files and 122
stylesheets across 65 runs, was sampled rather than read: the adapters for the three newest models,
two full source trees, and two rendered thumbnails.

**Derive the numbers, do not trust the prose.** Every count in this report was computed from the
checkout rather than taken from the README. The manifest was parsed with a script to produce the
coverage grid and the run totals. Thumbnails, route folders, adapter files, nested lockfiles and
scaffolding files were counted with `find`.

**Extract skill provenance mechanically.** The central finding, four skill versions inside one
treatment, came from parsing all 18 `skills-lock.json` files under `src/variants` and comparing their
`computedHash` fields. That is a mechanical comparison of file fingerprints, not an interpretation.

**Verify live claims by probing.** Bundle sizes, HTML sizes, response headers, and the presence or
absence of `robots.txt` and `sitemap.xml` were measured with direct HTTP requests, not inferred from
the code.

**Look at the images.** Two thumbnails were opened and inspected visually. That is how the switcher
chrome and the Next.js development badge were found, and it is not something code reading would have
caught.

## What was not done, and why it matters

**The project was never built or run.** No `npm install`, no `npm run build`, no test execution. So
five kinds of claim in this report are code-reading conclusions rather than observations:

- The exact composition of the 643 KB stylesheet. The size is measured; the cause, unrestricted
  Tailwind source scanning, is inferred from `globals.css` having no `@source` directive.
- The `color-scheme` finding. The cascade rule that `!important` in a stylesheet beats a normal
  inline style is standard CSS behaviour, but the visible effect was not observed in a browser.
- Whether the three runs missing per-run CSS routes render correctly today. The reasoning is that the
  global bundle covers them; this was not confirmed by rendering.
- Whether the tests currently pass.
- Whether re-capturing thumbnails from the preview route produces clean images.

Each of those is marked at the point it is claimed.

**No generation was re-graded.** This report makes no judgement about which model designs better. It
does not check the rankings prose against the artifacts it describes.

**No model was re-run.** Every statement about how the generations were produced comes from
lockfiles, folder names, and the Next.js scaffold files inside each source. The reproduction recipe in
[03-ingestion-pipeline.md](03-ingestion-pipeline.md) is reconstructed and labelled as such.

**Git history was not archaeologically searched.** Commit messages and dates were read; diffs were
not. So the report can say when dark mode merged but not who wrote which line.

**Reception could not be established.** A direct search for coverage of the site returned nothing.
Absence of search results is weak evidence: it means no indexed writing was found, not that none
exists. The report states it that way.

## Confidence

| Claim type | Confidence | Basis |
| --- | --- | --- |
| Counts of runs, models, files, images | High | computed from the checkout |
| Skill version drift (four hashes) | High | mechanical hash comparison of 18 lockfiles |
| Architecture and data flow | High | full read of every non-corpus source file |
| Live site measurements | High | direct HTTP probes |
| Thumbnails contain shell chrome | High | two images inspected directly |
| Cause of the 643 KB bundle | Medium-high | one missing directive, standard Tailwind behaviour, not rebuilt |
| `color-scheme` never reaches dark | Medium-high | standard cascade rules, not observed in a browser |
| Reproduction recipe for a run | Low-medium | reconstructed from lockfiles and scaffold files |
| No external coverage exists | Low | absence of search results only |

## Sources

Primary:

- Local clone of the repository at commit `3bdd0cb`, all files outside the generated corpus
- <https://github.com/SunkenInTime/ui-design-bench>
- <https://www.whichai.dev/>

Skills named by the project, used to define the treatments:

- Anthropic `frontend-design`: <https://skills.sh/anthropics/skills/frontend-design>
- `uncodixfy` by cyxzdev: <https://skills.sh/cyxzdev/uncodixfy/uncodixfy>
- `design-taste-frontend` from `Leonxlnx/taste-skill`, identified from the run lockfiles, with
  published documentation at <https://www.tasteskill.dev/>

Comparable projects, for orientation only:

- Design Arena (YC S25): <https://news.ycombinator.com/item?id=44878257>
- DesignArena: <https://news.ycombinator.com/item?id=44542578>
- UI-Bench: <https://arxiv.org/abs/2508.20410>
- Graphic-Design-Bench: <https://arxiv.org/html/2604.04192v1>

## Note on tone

This report is critical in places about a personal project built by one person in five months, given
away for free, with its own methodology limits stated plainly in its README. That criticism is aimed
at how the artifact should be read, not at the work. The architecture is genuinely good, the
ingestion skill is genuinely reusable, and the decision not to invent a score is better judgement
than most benchmarks show.
