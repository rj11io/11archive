# 12. Implementation checklist

One gate, ordered by how much damage each item prevents. Paste it into a pull request template or a
release checklist. Every item traces to a section of this report.

## Tier 1: blocks release

These are failures against a standard that a law references, or defects that make the product unusable
for a group of people.

| # | Check | How to verify | Section |
| --- | --- | --- | --- |
| 1 | Body text at 4.5:1, large text and control borders at 3:1 | Automated scan plus manual check of muted, placeholder, and on-image text | [04](04-color-typography-and-theming.md) |
| 2 | Every input has a visible associated label | Scanner, then read the form with the stylesheet disabled | [08](08-forms-and-authentication.md) |
| 3 | Visible focus indicator on every interactive element, 2 px, 3:1 | Tab through with the mouse unplugged | [05](05-interaction-and-motion.md) |
| 4 | Every flow completable by keyboard alone | Manual pass per flow | [05](05-interaction-and-motion.md) |
| 5 | Focus never entirely hidden by sticky content | Tab into elements under a sticky header and a cookie bar | [06](06-accessibility-and-law.md) |
| 6 | Every drag interaction has a single-pointer alternative | Manual inspection of sliders, lists, maps, uploads | [05](05-interaction-and-motion.md) |
| 7 | Targets at least 24 by 24 CSS px, or spaced to the 24 px circle rule | Measure the smallest targets: toast close, table row icons, pagination | [05](05-interaction-and-motion.md) |
| 8 | Pinch zoom not blocked; text readable at 200%; reflows at 400% in 1280 px | Browser zoom, and check for `maximum-scale` | [04](04-color-typography-and-theming.md) |
| 9 | Nothing depends on colour alone | Greyscale the screenshot | [04](04-color-typography-and-theming.md) |
| 10 | Paste works in every authentication field | Try it | [08](08-forms-and-authentication.md) |
| 11 | Nothing asked twice in one process | Walk the flow end to end | [08](08-forms-and-authentication.md) |
| 12 | Cancelling, unsubscribing, or deleting is no harder than starting | Count clicks in each direction | [10](10-anti-patterns-and-regulation.md) |
| 13 | Accept and reject given equal treatment in any consent interface | Visual comparison, and click count | [10](10-anti-patterns-and-regulation.md) |
| 14 | Any action with a side effect confirms specifically, and states whether undo exists | Manual review of every destructive or outbound action | [09](09-ai-native-ux.md) |
| 15 | `lang` attribute set correctly on the document | View source | [06](06-accessibility-and-law.md) |

## Tier 2: fix before it becomes a habit

Quality failures that compound across a codebase.

| # | Check | Section |
| --- | --- | --- |
| 16 | Native elements used for buttons, links, dialogs, popovers, selects, and disclosures | [05](05-interaction-and-motion.md) |
| 17 | No ARIA attribute doing a job a native element already does | [06](06-accessibility-and-law.md) |
| 18 | Focus returns to the trigger when an overlay closes | [05](05-interaction-and-motion.md) |
| 19 | Skip link to main content present and working | [06](06-accessibility-and-law.md) |
| 20 | Heading levels sequential, one `h1` per page | [06](06-accessibility-and-law.md) |
| 21 | `prefers-reduced-motion` honoured, ideally with a cross-fade rather than nothing | [05](05-interaction-and-motion.md) |
| 22 | `color-scheme` declared, dark mode implemented through semantic tokens | [04](04-color-typography-and-theming.md) |
| 23 | `forced-colors` checked in Windows High Contrast Mode | [04](04-color-typography-and-theming.md) |
| 24 | Type and spacing in `rem`; fluid sizes include a `rem` term inside `clamp()` | [04](04-color-typography-and-theming.md) |
| 25 | Reading columns capped near 65 characters | [04](04-color-typography-and-theming.md) |
| 26 | Inputs at 16 px or larger on mobile | [08](08-forms-and-authentication.md) |
| 27 | Logical properties instead of physical left and right | [03](03-layout-and-responsive.md) |
| 28 | `dvh` or `svh` instead of `vh`; safe-area insets on edge-anchored elements | [03](03-layout-and-responsive.md) |
| 29 | All media has dimensions or `aspect-ratio` | [07](07-performance-as-ux.md) |
| 30 | Component-level responsiveness uses container queries, in `rem` | [03](03-layout-and-responsive.md) |
| 31 | Empty, loading, error, and stale states specified for every data component | [01](01-principles-and-laws.md) |
| 32 | Error messages name the problem, the field, and the fix | [08](08-forms-and-authentication.md) |
| 33 | Form data preserved through validation errors and back navigation | [08](08-forms-and-authentication.md) |
| 34 | Nothing important is hover-only | [05](05-interaction-and-motion.md) |
| 35 | Anything auto-moving for over five seconds has a pause control | [05](05-interaction-and-motion.md) |
| 36 | Motion durations under 400 ms; entering eases out, leaving eases in | [05](05-interaction-and-motion.md) |

## Tier 3: performance gate

| # | Check | Target | Section |
| --- | --- | --- | --- |
| 37 | LCP at the 75th percentile of real visits | 2.5 s or less | [07](07-performance-as-ux.md) |
| 38 | INP at the 75th percentile | 200 ms or less | [07](07-performance-as-ux.md) |
| 39 | CLS at the 75th percentile | 0.1 or less | [07](07-performance-as-ux.md) |
| 40 | LCP element identified and prioritised | `fetchpriority="high"` on an LCP image | [07](07-performance-as-ux.md) |
| 41 | Critical-path JavaScript, compressed | Under 200 KB | [07](07-performance-as-ux.md) |
| 42 | Unused JavaScript | Measured, trending down | [07](07-performance-as-ux.md) |
| 43 | Fonts | Two files or fewer, subset, metric-adjusted fallback | [04](04-color-typography-and-theming.md) |
| 44 | Third-party scripts | Inventoried, each with an owner and a review date | [07](07-performance-as-ux.md) |
| 45 | Tested on a mid-range Android phone on a throttled network | Manual | [07](07-performance-as-ux.md) |
| 46 | Every interaction over 100 ms acknowledges immediately | Manual | [01](01-principles-and-laws.md) |

## Tier 4: AI features

Only applies if a model is in the interface.

| # | Check | Section |
| --- | --- | --- |
| 47 | Capability and limits stated before first use | [09](09-ai-native-ux.md) |
| 48 | Uncertainty expressed in words when confidence is low | [09](09-ai-native-ux.md) |
| 49 | Provenance shown for factual claims | [09](09-ai-native-ux.md) |
| 50 | Edit, regenerate, and dismiss each one action away | [09](09-ai-native-ux.md) |
| 51 | Stop control visible during generation | [09](09-ai-native-ux.md) |
| 52 | Partial output never misleading; numbers and tables buffered | [09](09-ai-native-ux.md) |
| 53 | Streaming text does not shift the layout | [07](07-performance-as-ux.md) |
| 54 | A visible non-AI route to the same goal | [09](09-ai-native-ux.md) |
| 55 | Global off switch, and feedback attachable to a specific span | [09](09-ai-native-ux.md) |
| 56 | Generation constrained to a vetted component catalogue if the interface is generated | [09](09-ai-native-ux.md) |

## Tier 5: system health

Quarterly, not per release.

| # | Check | Section |
| --- | --- | --- |
| 57 | Token coverage rising; hard-coded colours trending to zero | [02](02-design-systems-and-tokens.md) |
| 58 | Forks of system components counted and triaged as feature requests | [02](02-design-systems-and-tokens.md) |
| 59 | Deprecations have dates, and old versions actually get removed | [02](02-design-systems-and-tokens.md) |
| 60 | One metric per relevant HEART category, each with a written definition | [11](11-measurement-and-research.md) |
| 61 | Engagement metrics paired with task success metrics | [11](11-measurement-and-research.md) |
| 62 | Usability testing running in rounds, with fixes between | [11](11-measurement-and-research.md) |
| 63 | At least some sessions with users who have disabilities | [06](06-accessibility-and-law.md) |
| 64 | Automated accessibility coverage reported with its known limit | [06](06-accessibility-and-law.md) |

## What to automate

Anything in the table below should run without a human, on every pull request. The rest needs eyes.

| Automatable | Not automatable |
| --- | --- |
| Contrast ratios | Whether the label makes sense |
| Missing labels, alt text, and accessible names | Whether the alt text is useful |
| Heading order | Whether the heading describes the section |
| Colour literals outside token files | Whether a token is the right token |
| Core Web Vitals, bundle size, unused code | Whether the interaction feels right |
| `maximum-scale`, positive `tabindex`, `lang` | Focus order making sense |
| Presence of a pause control | Whether the motion is necessary at all |
| Whether a stop control exists | Whether the AI's uncertainty is honest |

The rule of thumb: automation catches the presence or absence of things. Only a person catches whether
the thing is right.
