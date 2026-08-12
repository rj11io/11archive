# Glossary

Every term this report uses that is not everyday English, in the order you are likely to meet it.

**Agent skill, or skill.** A text file of instructions you install into a coding agent. The agent
reads it before writing code. In this project a skill carries design rules, for example "commit to
an aesthetic direction before you build" or "never use these overused fonts". Installing one is the
whole treatment being tested.

**Treatment.** The condition a run was carried out under. This project has five: the Anthropic
design skill, the community taste skill, a skill it labels UI SH, the Uncodexify skill, and no skill
at all. The project's own word for a treatment is *group*.

**Run.** One model working under one treatment, producing five landing pages. There are 65 runs.

**Iteration.** One of the five landing pages inside a run. Important: the five are five *different
designs the model was asked to produce in one sitting*, not five repeats of the same design. They
measure range, not consistency.

**Generation.** One iteration, considered as an artifact. 65 runs times 5 iterations is 325
generations.

**Manifest.** `src/lib/gallery-manifest.ts`, a hand-maintained array of 65 entries. Every route,
thumbnail, dropdown option, test case and game round is derived from it. If you change the project,
you almost always change this file.

**Registry.** `src/lib/gallery-registry.ts`, an object that maps a string like
`"with-design-skill:opus-5"` to the code that renders that run. It exists because the manifest is
plain data and cannot import React components.

**Variant.** The project's word for one run's code as it lives inside the gallery, at
`src/variants/{group}/{model}/`. It holds the model's original app under `source/` plus a small
adapter, `index.tsx`.

**Adapter, or variant module.** The hand-written `index.tsx` that reduces a whole generated Next.js
app to one function: given an iteration number, return React elements. Every one is different because
every model organised its five designs differently.

**Scoping, or CSS scoping.** Rewriting a stylesheet so its rules can only affect one part of the
page. Here it means prefixing every selector with the run's identity so that a model's `body`
background styles only its own container instead of the whole site.

**`:where()`.** A CSS function that wraps selectors and contributes zero specificity. Wrapping the
scope prefix in `:where()` is what lets the project add three selectors to every rule without
disturbing the original ordering. It is the single most important line in the CSS pipeline.

**Specificity.** How CSS decides which rule wins when two rules target the same element. More
specific selectors beat less specific ones. Adding selectors normally raises specificity, which is
why `:where()` matters.

**`!important`.** A CSS marker that makes a declaration beat almost everything else, including
values set directly on an element by JavaScript. The project uses it to defend the shell's
background, and one misplaced use is why dark mode never reaches native browser controls.

**`@keyframes`.** A CSS block that defines an animation by name. Names are global, so two models that
both named an animation `float` would collide. The build step renames every one to include the run it
came from.

**Tailwind, and utility classes.** Tailwind CSS is a system where you style elements by composing
small single-purpose class names such as `px-4` or `text-xl`. Those classes do not exist as CSS until
Tailwind scans your source files and generates the ones you used. That scanning step is the cause of
the project's 643 KB stylesheet.

**`@source` and `source(none)`.** Tailwind v4 directives that control which files Tailwind scans.
`source(none)` switches off automatic scanning; `@source "path"` adds one folder back. The project
uses both to give each run its own small stylesheet, and forgets to use them on the shell's.

**Shell, or chrome.** The site's own interface: the floating navigation, the variant switcher, the
cards. Everything that is not a model's generated page. Keeping the shell and the generations from
styling each other is the project's central engineering problem.

**Variant switcher.** The vertical floating panel down the right edge of every generation page, with
a home link, a compare link, the model logo, and iteration chips 1 to 5. It replaces the switchers
the models were asked to build.

**Preview route.** `/preview/{group}/{model}/{iteration}`, the same generation rendered without the
variant switcher. Built for the compare page's iframes. Also the route the thumbnail capture script
should be using and is not.

**Prerendered, or static.** Built into plain HTML files at deploy time rather than assembled per
request. This site prerenders all 650 gallery pages, which is why it is fast and why every model
addition needs a rebuild.

**`generateStaticParams` and `dynamicParams = false`.** The Next.js pair that says "here is the
complete list of pages to build, and refuse anything not on the list". Together they turn the
manifest into the site's full route table.

**Route group.** A Next.js folder whose name is in parentheses, such as
`(generated-variant-routes)`. The parentheses keep the folder out of the URL, so it organises code
without changing addresses.

**Iframe.** An embedded browser window inside a page, loading a completely separate document. The
compare page uses two, which is the only way two generated apps with conflicting global styles can
appear on screen together.

**`skills-lock.json`.** A file written by the skill installer recording which skills were installed,
where they came from, and a content hash of each. Eighteen of the 65 runs carry one, and they are the
only hard evidence in the project of what treatment a run actually received.

**Content hash.** A short fingerprint computed from a file's exact contents. Two files with the same
hash are identical; different hashes mean the file changed. Four different hashes for the design skill
across eleven runs is how this report established skill version drift.

**Confound.** Something that varies alongside the thing you meant to test, so you cannot tell which
one caused the difference. Skill version is a confound here: it changed between runs that the site
presents as comparable.

**Archived, in this project's sense.** Hidden from the home page by default. A model is archived when
another model in the same family has a higher tier number, or when it appears on a manual
force-archive list. It does not mean removed; a "Show Archived" button reveals them.

**Force-archived.** On the manual hide list, `FORCE_ARCHIVED_MODELS`, regardless of the family rule.
Seven models are on it, including the one the rankings page places first.

**Lab.** The company that made a model: Anthropic, GPT, Google, Meta, X AI, Moonshot, Z.ai, Cursor.
The guessing game asks you to name the lab, not the model.

**Chance baseline.** The score you would get by guessing at random. With three guesses out of eight
labs, it is 37.5% per round, which lands inside the game's "Coin Flipper" band.

**Provenance.** The record of where something came from and how it was made. This project keeps
almost none: no date, no agent, no model build string, no reasoning setting, no retry count.
