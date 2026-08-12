# 13. Glossary

Terms used in this report, defined for the audience it is written for. Where a term has a formal
definition in a specification, that definition governs.

**Accessible name.** The text assistive technology announces for an element. It comes from a `<label>`,
the element's own text, an `aria-label`, or an `alt` attribute. An element with no accessible name is
announced as just its type, for example "button".

**Anchor positioning.** A CSS feature for tethering one element to another, so a menu stays attached to
its button during scrolling without JavaScript measuring positions.

**Anti-pattern.** A common solution that reliably causes harm. Distinct from a deceptive pattern, which
harms the user on purpose.

**APCA (Advanced Perceptual Contrast Algorithm).** A newer way of calculating text contrast that models
human lightness perception more closely than the current ratio. Explored for future versions of WCAG, not
normative today.

**ARIA (Accessible Rich Internet Applications).** A set of HTML attributes that describe roles, states,
and properties to assistive technology. It adds description, never behaviour.

**ARIA Authoring Practices Guide (APG).** The W3C resource showing how to apply ARIA to common widget
patterns, with keyboard behaviour and working examples.

**`aspect-ratio`.** A CSS property that reserves the right shape for an element before its content loads,
which prevents layout shift.

**Assistive technology.** Software or hardware a person uses to operate a computer, including screen
readers, magnifiers, switch devices, and voice control.

**Baseline.** The shared label browser makers use for how safe a web feature is: limited availability,
newly available (just in all major engines), or widely available (in all of them for about 30 months).

**Breakpoint.** A viewport width at which layout rules change. Largely superseded by container queries and
intrinsic layout for component-level decisions.

**Cascade layers.** A CSS feature (`@layer`) for declaring the order in which groups of styles win, which
removes most specificity fights.

**`ch` unit.** The width of the "0" character in the current font, useful for setting a readable column
width that tracks the typeface.

**Chunking.** Grouping information so a person holds one item in mind instead of several. A card number in
groups of four is chunked.

**`clamp()`.** A CSS function taking a minimum, a preferred value, and a maximum, used for fluid sizes
with hard limits.

**CLS (Cumulative Layout Shift).** A Core Web Vital measuring how much visible content moves unexpectedly.
0.1 or less is good.

**`color-mix()`.** A CSS function that blends two colours in a chosen colour space, used to derive tinted
surfaces from one theme colour.

**Colour vision deficiency.** Reduced ability to distinguish certain colours, most commonly red and green.
Affects around 8% of men of northern European descent.

**Container query.** A CSS rule that responds to the size of an element's own container rather than the
window, so a component adapts wherever it is placed.

**`contrast-color()`.** A CSS function returning black or white, whichever contrasts more with a given
colour. Removes the manual choice of label colour on a themed button.

**Contrast ratio.** The measured difference in relative luminance between two colours, written as a ratio
such as 4.5:1.

**Core Web Vitals.** Google's three field-measured user experience metrics: LCP, INP, and CLS, each judged
at the 75th percentile of real page views.

**CrUX (Chrome User Experience Report).** The public dataset of real-visit performance measurements used
to judge Core Web Vitals.

**Deceptive pattern (dark pattern).** An interface choice that steers a user into a decision they would
not otherwise make. Now an enforcement priority for consumer regulators.

**Design system.** Named design decisions, reusable components, and the documented rules for using them.

**Design token.** A named design decision stored as data, for example a colour or a spacing step, so one
change propagates everywhere.

**DTCG (Design Tokens Community Group).** The W3C community group whose token file format reached its
first stable version, 2025.10, in October 2025.

**`dvh`, `svh`, `lvh`.** Viewport height units accounting for mobile browser toolbars: dynamic, small
(toolbars visible), and large (toolbars hidden).

**EAA (European Accessibility Act).** EU law making accessibility a requirement for covered products and
services sold to EU consumers, applied from 28 June 2025.

**EN 301 549.** The harmonised European accessibility standard used to demonstrate EAA compliance. Its web
chapter points at WCAG 2.1 Level AA.

**Field data.** Measurements from real users on real devices, as opposed to a synthetic test run.

**Fitts's law.** The time to hit a target grows with distance and shrinks with target size. Published by
Paul Fitts in 1954.

**Fluid typography.** Type sizes that scale continuously with the viewport or container instead of jumping
at breakpoints, usually via `clamp()`.

**Focus indicator.** The visible mark showing which element has keyboard focus. Must be at least 2 CSS
pixels thick with 3:1 contrast to meet WCAG 2.2 rule 2.4.13.

**`:focus-visible`.** A CSS selector that matches when the browser judges a focus indicator useful,
typically for keyboard rather than mouse interaction.

**`forced-colors`.** A media feature indicating the operating system has replaced the page's palette, as in
Windows High Contrast Mode.

**Generative UI.** An interface assembled by a model at runtime, choosing or producing components rather
than only text.

**Headless component.** A component shipping behaviour, keyboard handling, and accessibility semantics with
no visual styling. Also called an unstyled primitive.

**HEART.** A framework from Google for choosing user-centred metrics: Happiness, Engagement, Adoption,
Retention, Task success.

**Hick's law.** Decision time rises with the logarithm of the number of choices. From Hick (1952) and
Hyman (1953).

**INP (Interaction to Next Paint).** The Core Web Vital for responsiveness, covering all clicks, taps, and
key presses in a visit. 200 ms or less is good. Replaced First Input Delay in March 2024.

**Interop.** The annual programme in which Apple, Google, Igalia, Microsoft, and Mozilla agree a set of
web features to make behave identically, measured by a public test suite.

**Intrinsic layout.** Layout that lets content and available space determine the result, using tools such as
`auto-fit`, `minmax()`, and `clamp()` instead of fixed sizes.

**`inputmode`.** An HTML attribute selecting which on-screen keyboard appears, independent of the input's
validation type.

**Lab data.** Measurements from a synthetic test with a fixed device and network profile. Good for
diagnosis, not for judging real experience.

**Landmark.** A region of a page identified for navigation by assistive technology, for example the main
content, navigation, or a search area.

**LCP (Largest Contentful Paint).** The Core Web Vital for loading, marking when the largest visible element
finished rendering. 2.5 s or less is good.

**`light-dark()`.** A CSS function holding a light-mode and a dark-mode value in one declaration, resolved
by the active colour scheme.

**`llms.txt`.** A proposed file at a site's root describing its content for large language models. Present
on about 2% of sites in the July 2025 crawl.

**Logical properties.** CSS properties named by the flow of text rather than the physical screen, for
example `margin-inline-start`, so layouts work in right-to-left languages unchanged.

**Main thread.** The single thread where a browser runs JavaScript, style, layout, and paint. Work queued
here is what makes interactions feel slow.

**Media query.** A CSS rule responding to the window or device, for example its width or the user's colour
scheme preference.

**Mental model.** The user's internal theory of how a system works. Interfaces feel intuitive when they
match it and confusing when they do not.

**Modal.** An overlay that blocks interaction with the rest of the page until dismissed. Built correctly
with `<dialog>` and `showModal()`.

**`oklch()`.** A CSS colour notation using perceptual lightness, chroma, and hue, which makes even colour
ramps and predictable contrast far easier than hex or `rgb()`.

**Optimistic update.** Showing the result of an action immediately and reconciling with the server
afterwards. Suitable only where failure is rare and cheap.

**Passkey.** A sign-in credential held as a private key on the user's device and unlocked by biometrics or
a device PIN. Nothing to remember, nothing to phish.

**Popover.** An HTML attribute giving an element correct top-layer stacking and light dismissal, used for
menus, dropdowns, and (with `popover=hint`) tooltips.

**`prefers-color-scheme`.** A media feature reporting whether the user's system is set to light or dark.

**`prefers-reduced-motion`.** A media feature reporting that the user has asked for less animation, often
because motion causes nausea, dizziness, or migraine.

**Primitive token.** A raw value in a token system, for example `green.600`. Never referenced directly by
product code.

**Progressive disclosure.** Showing the common path first and putting the rest one deliberate, visible step
away. Different from hiding.

**Provenance.** The record of where a piece of information came from. In AI interfaces, the sources behind
an answer.

**`rem`.** A CSS unit equal to the root font size, so sizes expressed in it scale with the user's browser
text setting.

**Response-time limits.** Nielsen's three thresholds: 0.1 s feels instant, 1 s keeps a train of thought,
10 s is the limit of held attention.

**Safe area inset.** The `env(safe-area-inset-*)` values describing space taken by notches, rounded
corners, and home indicators.

**Screen reader.** Software that announces interface content as speech or braille and provides navigation by
heading, landmark, link, or form control.

**Scroll-driven animation.** An animation whose progress is tied to scroll position rather than time,
running off the main thread.

**Scroll-state query.** A CSS rule responding to whether an element is scrollable, stuck to an edge, or
snapped, which replaces a scroll event listener.

**Semantic token.** A token named for its role, for example `color.action.background`, which references a
primitive. The only layer a theme needs to rebind.

**Skeleton screen.** A placeholder showing the shape of content that is loading, appropriate when the
layout is known and the wait is roughly one to ten seconds.

**Skip link.** A link at the top of a page that jumps past navigation to the main content. Detectable on
about 24% of pages in the July 2025 crawl.

**`@starting-style`.** A CSS rule defining the state an element animates from the first time it appears,
which is what makes dialogs and popovers animate in.

**Streaming.** Rendering model output as it is generated instead of waiting for the whole response.

**Style query.** A CSS rule that styles descendants based on a custom property's value on an ancestor,
enabling variants without extra classes.

**Subgrid.** A CSS Grid feature letting a nested grid use its parent's tracks, so content aligns across
sibling components.

**Success criterion.** A single testable requirement in WCAG, assigned Level A, AA, or AAA.

**SUS (System Usability Scale).** A ten-item questionnaire producing a 0 to 100 score. The average is 68,
which is the 50th percentile and not a percentage.

**Target size.** The clickable or tappable area of a control. WCAG 2.2 requires at least 24 by 24 CSS pixels
at Level AA, with a spacing exception.

**`text-wrap: balance` and `pretty`.** CSS values that even out line lengths in headings and improve the
last lines of paragraphs respectively.

**Third-party script.** Code loaded from another organisation's domain. The most common cause of
unbudgeted page weight and main-thread blocking.

**Top layer.** The browser-managed stacking context above the whole page, used by `<dialog>` and popovers,
which is why they need no `z-index`.

**View transition.** A platform feature that animates between two states of a page, or between two page
navigations, without hand-written keyframes.

**WCAG (Web Content Accessibility Guidelines).** The W3C accessibility standard that nearly every
accessibility law references. Current version 2.2, with the latest revision dated 12 December 2024.

**Web Almanac.** The HTTP Archive's annual report analysing millions of real websites. The 2025 edition
covers a July 2025 crawl of about 16.2 million sites.

**WebAIM Million.** WebAIM's annual automated accessibility analysis of the top one million home pages.
The February 2026 edition found detected failures on 95.9% of pages.

**Widely available.** The Baseline label meaning a feature has been in all major browser engines for about
30 months, so it needs no fallback.

Terms defined: 86.
