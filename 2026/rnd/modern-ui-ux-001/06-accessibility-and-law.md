# 06. Accessibility, and the law behind it

Accessibility stopped being a values argument and became a compliance one. Since 28 June 2025 in the
EU, and on a schedule in the United States, an inaccessible interface is a legal exposure. This
section covers what the standard actually says, what the law points at, and what real sites get wrong.

## WCAG, in one page

**WCAG** stands for Web Content Accessibility Guidelines, published by the World Wide Web Consortium
(W3C). It is the standard nearly every law points at. The current version is 2.2, whose latest
revision is dated 12 December 2024.

Structure:

- **Four principles.** Content must be **perceivable**, **operable**, **understandable**, and
  **robust**. That is the whole standard in four words.
- **Guidelines** under each principle, and **success criteria** under those. A success criterion is a
  testable statement.
- **Three levels.** A is the floor, AA is what laws reference, AAA is aspirational and not expected
  across a whole product.

**Target AA.** Every regulation covered below points at AA, and AAA contains criteria that are
impossible for some content types.

One removal worth knowing: rule 4.1.1 Parsing was dropped in 2.2, because browsers now recover from
malformed markup consistently. If your organisation still reports against WCAG 2.0 or 2.1, you may
still be asked for it.

## The nine rules WCAG 2.2 added

These are the ones a product built to WCAG 2.1 will fail.

| Rule | Name | Level | What it requires, plainly |
| --- | --- | --- | --- |
| 2.4.11 | Focus Not Obscured (Minimum) | AA | When something receives keyboard focus, author content must not hide it entirely. Sticky headers and cookie bars are the usual cause |
| 2.4.12 | Focus Not Obscured (Enhanced) | AAA | No part of the focused component is hidden |
| 2.4.13 | Focus Appearance | AAA | The focus indicator is at least 2 CSS pixels thick around the component and has 3:1 contrast |
| 2.5.7 | Dragging Movements | AA | Anything done by dragging can also be done with a single pointer action |
| 2.5.8 | Target Size (Minimum) | AA | Targets are at least 24 by 24 CSS pixels, or spaced so a 24 px circle around each does not overlap another |
| 3.2.6 | Consistent Help | A | If you offer help (contact details, a chat widget, a help link), it appears in the same relative place on every page that has it |
| 3.3.7 | Redundant Entry | A | Do not ask for the same information twice in one process. Auto-populate it or let the user pick it |
| 3.3.8 | Accessible Authentication (Minimum) | AA | No step of signing in may require a memory or puzzle test, unless an alternative exists. Copy and paste into password fields must work |
| 3.3.9 | Accessible Authentication (Enhanced) | AAA | The same, without the object-recognition exception |

Two of these have unusual reach. 3.3.8 effectively bans blocking paste in password fields and bans
"solve this puzzle to log in" as the only route, which is why passkeys and password managers matter for
compliance and not only for security (see [08](08-forms-and-authentication.md)). And 3.2.6 is a rule
about information architecture, which is unusual for WCAG: it constrains where you may put your help
link.

## WCAG 3.0: real, but not yet

WCAG 3.0 is still a Working Draft, most recently updated in March 2026. Reported plan: a Candidate
Recommendation around late 2027 and a final Recommendation no earlier than 2028.

What is changing, so you are not surprised:

- **Outcomes instead of pass/fail criteria**, reported at roughly 174 outcomes in the March 2026 draft.
- **A scored, tiered conformance model.** Bronze is broadly the current AA level, Silver is genuinely
  good, Gold is thorough including cognitive and low-vision needs.
- **Wider scope**, covering apps and other digital products rather than web pages alone.
- **New contrast approaches under exploration**, including APCA, which is not normative today.

Practical advice: build to WCAG 2.2 AA. Nothing in the 3.0 draft is enforceable, and the drafts have
changed direction more than once.

## What the laws actually require

| Regulation | Who it binds | Standard referenced | Key dates |
| --- | --- | --- | --- |
| European Accessibility Act (EAA) | Businesses selling covered products and services to EU consumers, regardless of where the business is based | EN 301 549, which for web points at WCAG 2.1 AA | Applied from 28 June 2025 for new products and newly published content |
| EN 301 549 | The harmonised European standard used to demonstrate compliance | Contains WCAG 2.1 AA in its web chapter | Current |
| ADA Title II (United States) | State and local government bodies, including public universities | WCAG 2.1 AA | Final rule 24 April 2024. Compliance dates extended by one year in April 2026: 26 April 2027 for entities serving 50,000 or more people, 26 April 2028 for smaller entities and special districts |
| ADA Title III (United States) | Places of public accommodation, applied to websites through case law rather than a technical rule | Courts commonly reference WCAG 2.1 AA | Ongoing litigation, no fixed deadline |
| Section 508 (United States) | Federal agencies and their suppliers | WCAG 2.0 AA through the Section 508 refresh | In force |

Two notes on the EAA. First, it reaches non-EU companies: if you sell to EU consumers you are in
scope. Second, enforcement began immediately. Within days of the June 2025 date, French disability
organisations issued formal legal notices to several large retailers.

On US litigation, the counts published by different trackers disagree substantially for 2025: one
tracker reports over 5,000 digital accessibility suits, another 3,117 federal website cases (up 27%),
another 8,667 across all courts. The disagreement is methodological, since some count federal filings
only and others include state courts and demand letters. The direction is consistent, the level is not.
Treat any single figure with suspicion, including these.

## What real sites actually fail

Two independent large-scale measurements, both automated. Automated tools detect roughly a third of
accessibility problems, so these are floors, not ceilings.

**WebAIM Million, February 2026.** One million home pages from the Tranco ranking.

| Failure | Share of pages | 2025 | Direction |
| --- | --- | --- | --- |
| Low contrast text | 83.9% | 79.1% | Worse |
| Missing alternative text on images | 53.1% | 55.5% | Better |
| Missing form input labels | 51.0% | 48.2% | Worse |
| Empty links | 46.3% | n/a | n/a |
| Empty buttons | 30.6% | n/a | n/a |
| Missing document language | 13.5% | n/a | n/a |
| **Any detected WCAG 2 failure** | **95.9%** | **94.8%** | **Worse** |
| Average detected failures per page | 56.1 | 51.0 | Worse (up 10.1%) |

**The ARIA finding, which deserves its own paragraph.** ARIA (Accessible Rich Internet Applications) is
a set of attributes that tell assistive technology what a custom control is and what state it is in.
Pages using ARIA averaged 59.1 detected failures; pages without it averaged 42. ARIA attribute use rose
27% in one year, to over 133 attributes per page on average, more than six times the 2019 level.

The correct reading is not "ARIA is bad." It is that ARIA describes without implementing: adding
`role="button"` to a `<div>` announces a button and gives you none of a button's keyboard handling,
focus behaviour, or default styling. The first rule of ARIA, from the specification itself, is that no
ARIA is better than bad ARIA, and that you should not use ARIA if a native HTML element will do.

**HTTP Archive Web Almanac 2025**, July 2025 crawl, 16.2 million sites. Different method, same story.

| Measure | Figure |
| --- | --- |
| Sites passing colour contrast checks | 30% (31% on mobile) |
| Sites removing the default focus outline | About 67% |
| Sites using `:focus-visible` | About 25% |
| Inputs whose only label is placeholder text | 53% desktop, 55% mobile |
| Inputs with no accessible name at all | 24% to 25% |
| Mobile inputs labelled with a real `<label>` | 35% |
| Pages responding to `prefers-reduced-motion` | About 50% |
| Pages responding to `forced-colors` | 16% to 19% |
| Pages responding to `prefers-color-scheme` | About 13% |
| Pages that disable pinch zoom | 19% mobile, 21% desktop |
| Sites setting font sizes in pixels | 67% |
| Pages with a detectable skip link | 24% |
| Pages with a valid `lang` attribute | About 86% |
| Sites using a third-party accessibility overlay | About 2%, and 0.2% of the top 1,000 |
| Median Lighthouse accessibility score | 85% |

The pinch-zoom figure is worth pausing on: blocking zoom with `maximum-scale=1` is a direct failure of
WCAG rule 1.4.4 Resize Text, and it is usually done to work around a mobile form layout problem that
16 px inputs would solve.

## How to test, in the order that finds the most

1. **Automated scan in continuous integration.** Free, fast, catches contrast, labels, alt text, and
   landmarks. Catches roughly a third of issues. Run it on every pull request, not quarterly.
2. **Keyboard-only pass.** Ten minutes per flow. Finds focus, order, trap, and drag failures that no
   scanner sees.
3. **Screen reader pass.** One combination is enough to start: VoiceOver with Safari on Mac or iOS, or
   NVDA with Firefox or Chrome on Windows. You are checking that names, roles, and state changes are
   announced.
4. **Zoom and reflow.** 200% for clipping, 400% at 1280 px for reflow to one column.
5. **Preferences.** Reduced motion, dark mode, forced colours, larger system text.
6. **Testing with disabled users.** The only method that finds problems the others cannot, especially
   for cognitive load, comprehension, and task strategy. Budget for it on anything important.

## The three things that make accessibility cheap

- **Use native elements.** `<button>`, `<a href>`, `<input>` with a `<label>`, `<dialog>`, `<select>`,
  `<details>`. Each arrives with keyboard behaviour, focus behaviour, and a role.
- **Put it in the design system once.** A compliant button, field, and modal in the system means product
  teams cannot get those wrong. This is the single strongest argument for a design system.
- **Test on every commit.** Retrofitting accessibility costs several times what building it in costs,
  and the crawl data above is what retrofitting-later looks like at scale.
