# 00. Executive brief

## The main result

The gap between what the platform can do and what shipped sites actually do is now the single
largest source of bad user experience, and it is widening.

Two large crawls make the point. In February 2026 WebAIM tested the top million home pages and
found detectable failures against the accessibility standard on 95.9% of them, at an average of
56.1 failures per page. That is worse than 2025, when the same test found 94.8% of pages failing at
51 failures per page. Meanwhile the browser makers spent 2025 shipping features that remove the
usual excuses: one CSS function that picks a readable text colour for you, another that swaps light
and dark values in a single line, dialogs and tooltips that come with correct keyboard behaviour
built in, and container queries that let a component respond to its own width instead of the
window's.

So the bottleneck is not capability. It is that teams keep hand-building components that the
platform now provides correctly, and keep skipping four checks that would catch most of the damage:
text contrast, labels on inputs, a visible focus ring, and a target big enough to hit.

## Twelve rules that hold up

Each rule below is backed by a specification, a regulator, or a large measurement. The section link
gives the evidence.

1. **Contrast is the most-failed rule on the web, so check it first.** 4.5:1 for normal text, 3:1 for
   large text and for the visible edges of controls. Low-contrast text appears on 83.9% of the top
   million home pages. See [04](04-color-typography-and-theming.md), [06](06-accessibility-and-law.md).
2. **Every input gets a real label.** Half of the top million home pages have an unlabelled input.
   Placeholder text is not a label: 53% of desktop inputs in the 2025 crawl relied on it alone. See
   [08](08-forms-and-authentication.md).
3. **Never remove the focus ring without replacing it.** About 67% of sites in the 2025 crawl remove
   the browser default. Use `:focus-visible` and make the indicator at least 2 CSS pixels thick with
   3:1 contrast. See [05](05-interaction-and-motion.md).
4. **24 by 24 CSS pixels is the legal floor for a tap target; 44 is the comfortable one.** WCAG 2.2
   requires 24 with a spacing exception, Apple asks for 44 points, Android for 48 units. See
   [05](05-interaction-and-motion.md).
5. **Anything you can do by dragging must also work with a single tap or click.** This became a Level
   AA requirement in WCAG 2.2 (rule 2.5.7). Sliders, sortable lists, and map panning are the usual
   offenders. See [06](06-accessibility-and-law.md).
6. **Do not ask for the same information twice in one flow, and let people paste into password
   fields.** WCAG 2.2 rules 3.3.7 and 3.3.8. Blocking paste breaks password managers and passkeys,
   which now have measurably higher sign-in success than typed passwords. See
   [08](08-forms-and-authentication.md).
7. **Respond within 200 milliseconds or show that you heard.** The web's responsiveness metric,
   Interaction to Next Paint, calls 200 ms or less good and above 500 ms poor, at the 75th percentile
   of real visits. The older human limits still apply: 0.1 second feels instant, 1 second keeps a
   train of thought, 10 seconds is the edge of attention. See [07](07-performance-as-ux.md),
   [01](01-principles-and-laws.md).
8. **Budget the page, not the feature.** The median desktop page is now about 2.4 MB, with roughly
   1 MB of images and 0.7 MB of JavaScript, and about 280 KB of that JavaScript is never executed.
   Mobile page weight has tripled in ten years. See [07](07-performance-as-ux.md).
9. **Let the component decide its own layout.** Container queries are safe to use everywhere and
   replace most window-width breakpoints. A card that adapts to its container works in a sidebar, a
   grid, and a modal without new rules. See [03](03-layout-and-responsive.md).
10. **Use the native element before reaching for ARIA.** ARIA is a set of attributes that describe
    roles and states to screen readers; it adds description, never behaviour. Pages using ARIA
    average 59.1 detected failures against pages without it at 42. See
    [06](06-accessibility-and-law.md).
11. **Honour the operating system's preferences.** Reduced motion, dark mode, forced colours, and
    text zoom are user settings, not suggestions. Only about half of pages respond to reduced motion,
    about 13% to colour scheme, and roughly one page in five still blocks pinch zoom on mobile. See
    [04](04-color-typography-and-theming.md), [05](05-interaction-and-motion.md).
12. **Make the AI's limits, sources, and undo path visible before its output.** The most-validated
    guidance here is 18 guidelines from Microsoft Research, tested against 20 shipped AI products by
    49 practitioners. Rule one is "make clear what the system can do." See
    [09](09-ai-native-ux.md).

## What changed since 2023

| Change | What it means for your work | Date |
| --- | --- | --- |
| WCAG 2.2 became the current standard, adding nine rules | Drag alternatives, target size, focus not hidden, no repeated entry, accessible sign-in | Recommendation revised 2024-12-12 |
| The European Accessibility Act took effect | Selling to EU consumers now carries an accessibility obligation, tested against EN 301 549, which points at WCAG 2.1 AA | 2025-06-28 |
| Responsiveness metric changed from first input to every input | A page can no longer pass by being quick once; slow menus and filters now count | 2024-03 |
| Container queries and `:has()` became widely available | Component-level responsiveness and parent-aware styling without JavaScript | Since 2023 |
| The design token format reached its first stable version | Tokens can move between design tools and code without a custom converter | 2025-10-28 |
| Dialogs, popovers, tooltips, carousels, and selects became stylable native elements | Most custom overlay code is now a liability, not an asset | Through 2025 and 2026 |
| Deceptive design became an enforcement priority, not a talking point | A $2.5B settlement over subscription cancellation flows; an EU proposal on manipulative design due late 2026 | 2025 onward |
| AI features moved into mainstream interfaces | New obligations: state capability, show uncertainty, allow correction, keep a human undo | 2023 onward |

## The 30-minute audit

Run this on any screen. It catches most of what the large crawls find.

1. **Keyboard only.** Unplug the mouse. Tab through the whole flow. Can you reach every control,
   see where you are, and escape every overlay? Anything you can only reach by dragging is a
   Level AA failure.
2. **Zoom to 200%.** Text must not be cut off or overlap. Then zoom to 400% at a 1280 px wide
   window: content should reflow to one column, not scroll sideways.
3. **Contrast sample.** Check body text, muted or secondary text, placeholder text, disabled-looking
   text that is actually enabled, text on images, and the border of every input. Muted grey on white
   is the usual failure.
4. **Turn on reduced motion** in the operating system. Parallax, auto-playing carousels, and large
   sliding transitions should stop or shorten.
5. **One-handed phone check.** Are the primary actions reachable by a thumb? Is every input at least
   16 px, so the phone does not zoom when tapped? Are targets at least 24 px, with spacing?
6. **Throttle to a mid-range phone** and a slow network in the browser's developer tools. Then use
   the product's busiest interaction, for example a filter or a menu, and watch for a lag over
   200 ms.
7. **Read every error message aloud.** Does it say what happened, which field, and what to do?
8. **Try to cancel.** Count the clicks to undo, unsubscribe, or delete, then count the clicks to
   sign up. If cancelling is harder, that is now legal exposure, not just rudeness.
9. **If there is an AI feature:** can a first-time user tell what it can do, how often it is wrong,
   where its answer came from, and how to correct it? Can they turn it off?

## The one-sentence version

Modern interface work is mostly the discipline of using what the platform already does correctly,
respecting the settings the user already chose, and staying inside a few measured thresholds:
4.5:1 contrast, 24 px targets, 200 ms responses, 2.5 second loads, and no trick flows.
