# Modern UI/UX: A Working Reference

**Created:** 2026-08-11
**Audience:** people who design, build, or sign off on screen interfaces. Product designers, front-end
and design engineers, and the person who has to decide whether a release is good enough to ship.
**Objective:** describe what "modern" means in interface work right now, separate the parts backed by
measurement or law from the parts that are taste, and give checks you can run on a real product.
**Scope:** interface design and front-end interface behaviour for web and mobile, roughly 2023 to
August 2026. Covers principles, design systems and tokens, layout, colour and type, interaction and
motion, accessibility and the laws behind it, performance felt as experience, forms and sign-in,
AI-era patterns, deceptive design, and how to measure any of it.
**Not in scope:** brand identity, marketing copy, print, game UI, 3D and spatial interfaces beyond one
note, and any ranking of design tools. Tool leaderboards move monthly, so this report describes
mechanisms and thresholds instead.
**Evidence boundary:** public specifications, standards bodies, regulator text, browser vendor
documentation, large-sample crawls of real websites, and named academic work. All retrieved on
2026-08-11. Every material number has a source in
[14-methodology-and-sources.md](14-methodology-and-sources.md), with a note on how strongly it is
supported.

## Modern UI/UX in one paragraph

"Modern" is not a look. It is a set of constraints that got sharper: the interface must work on any
viewport without a fixed set of breakpoints, must stay usable for people who cannot see it or cannot
use a mouse, must respond inside a few hundred milliseconds on a mid-range phone, must not trick
anyone into a purchase, and must now also explain what an AI feature did and let a person undo it.
Most of those constraints are measurable, and several are legally enforceable in the EU as of
28 June 2025.

## The two words this report uses constantly

- **Design token:** a named design decision stored as data, for example `color.action.background`
  holding a specific green. Tokens let one decision update everywhere. See
  [02](02-design-systems-and-tokens.md).
- **Baseline:** a shared label the browser makers use for how safe a web feature is. "Newly
  available" means it just landed in every major engine. "Widely available" means it has been in all
  of them for about two and a half years. See [03](03-layout-and-responsive.md).

## How to read this bundle

Start with the brief. Then jump to the section that matches the decision in front of you.

| File | What it covers | Read it if |
| --- | --- | --- |
| [00-executive-brief.md](00-executive-brief.md) | The main result, twelve rules, a 30-minute audit | You have ten minutes |
| [01-principles-and-laws.md](01-principles-and-laws.md) | Heuristics, Fitts, Hick, the 0.1/1/10 second limits, cognitive load | You are arguing about a design and want the older, sturdier ground |
| [02-design-systems-and-tokens.md](02-design-systems-and-tokens.md) | The token spec, token layers, headless components, who owns the code | You are building or buying a design system |
| [03-layout-and-responsive.md](03-layout-and-responsive.md) | Intrinsic layout, container queries, viewport units, safe areas | You are laying out a page or a component |
| [04-color-typography-and-theming.md](04-color-typography-and-theming.md) | Contrast maths, oklch, `light-dark()`, type scales, line length | You are picking colours or type |
| [05-interaction-and-motion.md](05-interaction-and-motion.md) | Target sizes, focus, dialogs and popovers, view transitions, reduced motion | You are building a control or an animation |
| [06-accessibility-and-law.md](06-accessibility-and-law.md) | WCAG 2.2's nine new rules, WCAG 3 status, EAA and EN 301 549, the ARIA trap | You need to pass an audit or a legal review |
| [07-performance-as-ux.md](07-performance-as-ux.md) | Core Web Vitals, real-world pass rates, page weight, perceived speed | Your product feels slow |
| [08-forms-and-authentication.md](08-forms-and-authentication.md) | Autofill tokens, input types, validation, passkeys | You own a form, a checkout, or a login |
| [09-ai-native-ux.md](09-ai-native-ux.md) | The 18 human-AI guidelines, streaming, agent transparency, generative UI | You are putting a model in front of users |
| [10-anti-patterns-and-regulation.md](10-anti-patterns-and-regulation.md) | Deceptive design, cookie banners, accessibility overlays, zoom blocking | You want to know what now carries a fine |
| [11-measurement-and-research.md](11-measurement-and-research.md) | HEART, SUS, how many testers, field versus lab data | You have to prove the design worked |
| [12-implementation-checklist.md](12-implementation-checklist.md) | A ship gate you can paste into a pull request template | You are about to release |
| [13-glossary.md](13-glossary.md) | 86 terms defined | A word is unfamiliar |
| [14-methodology-and-sources.md](14-methodology-and-sources.md) | How this was built, 55 sources, confidence, gaps | You want to check the work |

## Artifacts

| Artifact | Purpose |
| --- | --- |
| `00` to `14` Markdown files | The portable, readable report |
| `data.json` | The machine-readable evidence model: rules, thresholds, features, laws, failure modes, sources |
| `report.html` | One self-contained page with navigation, sortable tables, and a print layout |

`report.html` carries the same facts, order, and wording as the Markdown. It adds sorting,
highlighting, and column resizing. It never adds information the Markdown lacks.

## What this report will not tell you

- Which framework to use. None of the constraints here depend on one.
- Whether a specific design is good. Taste is real, and this report only covers the parts that can
  be checked.
- Anything about a private product. Every number comes from a public source.
