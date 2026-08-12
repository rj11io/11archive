# 05. Interaction and motion

This section covers the parts of an interface a person touches: targets, focus, overlays, and
movement. It is also where the platform changed most between 2023 and 2026, and where the most custom
code is now unnecessary.

## Target size: three numbers and which one binds

| Source | Minimum | Nature |
| --- | --- | --- |
| WCAG 2.2 rule 2.5.8, Level AA | 24 by 24 CSS pixels | Standard, legally referenced |
| WCAG 2.2 rule 2.5.5, Level AAA | 44 by 44 CSS pixels | Standard, aspirational level |
| Apple's guidelines | 44 by 44 points | Platform guidance |
| Android's Material guidance | 48 by 48 density-independent pixels | Platform guidance |

The 24 px rule has a spacing exception: a smaller target passes if it sits inside a 24 px circle that
does not overlap another target's circle. That is what makes a dense toolbar of small icons legal, as
long as there is breathing room. Other exceptions cover targets in a sentence of text, targets whose
size is determined by the browser, and cases where the same action is available at full size elsewhere.

Practical guidance: design to 44 px for anything a person taps often, use 24 px as the hard floor, and
remember the measurement is of the clickable area. A 16 px icon inside a 44 px button passes.

The most common real failures: close buttons on toasts and modals, table row action icons, pagination
numbers, checkbox and radio hit areas that exclude the label, and social icons in a footer.

## Dragging must always have a non-drag alternative

WCAG 2.2 rule 2.5.7 (Level AA) requires that anything achievable by dragging is also achievable with a
single pointer action, unless dragging is essential to the task.

What this covers, and the usual fix:

| Pattern | Non-drag alternative |
| --- | --- |
| Slider | Arrow keys plus a number input |
| Reorderable list | "Move up" and "move down" buttons, or a position field |
| Kanban board | A "move to" menu on each card |
| Map pan | Directional buttons, or a search field |
| Drag-and-drop upload | A file picker button (which you almost certainly already have) |
| Range picker on a chart | Two date inputs |

This is one of the cheapest new rules to satisfy and one of the most often missed, because the drag
version is the one that gets demoed.

## Focus: the state everyone deletes

Keyboard users navigate by focus. Removing the outline without replacing it makes a product unusable
for them. About 67% of sites in the July 2025 crawl removed the browser's default outline, and only
about 25% used `:focus-visible`.

```css
:focus-visible {
  outline: 2px solid var(--focus);
  outline-offset: 2px;
}
```

`:focus-visible` is the right selector because it applies when the browser judges an indicator useful,
which means keyboard users get a ring and mouse users do not get one on click. Do not use
`:focus { outline: none }` and then style only `:focus-visible`, because that removes the fallback in
older engines; style `:focus-visible` and leave `:focus` alone.

WCAG 2.2 added two rules about focus beyond visibility:

- **2.4.11 Focus Not Obscured (Minimum), Level AA:** when a component receives keyboard focus, it must
  not be entirely hidden by content the author added. Sticky headers, cookie bars, and chat widgets are
  the usual culprits, because they cover the element that just received focus. Use `scroll-margin` on
  focusable elements to keep them clear of a sticky header.
- **2.4.13 Focus Appearance, Level AAA:** the indicator area must be at least 2 CSS pixels thick around
  the component, with 3:1 contrast against adjacent colours.

Also required by older rules and frequently broken:

- **Focus order** follows the visual order. Positive `tabindex` values break this; only 3% to 4% of
  sites use them, and none of those should.
- **Focus is trapped inside a modal** while it is open, and returns to the trigger when it closes. If
  you use the native `<dialog>` element with `showModal()`, you get most of this for free.
- **Skip link** to the main content. Only 24% of pages in the 2025 crawl had a detectable one.

## Overlays: stop building these

Every overlay pattern below now exists as a platform feature with correct keyboard and screen-reader
behaviour. Prefer them.

| Need | Platform feature | Notes |
| --- | --- | --- |
| Modal dialog | `<dialog>` with `showModal()` | Focus trapping, top-layer stacking, `::backdrop`, Escape to close |
| Dismiss a dialog by clicking outside | `closedby` attribute on `<dialog>` | Chrome 134 and later |
| Menu, dropdown, disclosure panel | `popover` attribute | Correct stacking and light dismissal, no z-index war |
| Tooltip or hover preview | `popover=hint` | Does not close other open popovers, which is the behaviour a tooltip needs |
| Show UI on hover or keyboard focus | `interestfor` attribute, with `interest-delay` | Keyboard-accessible by design, unlike a hover-only tooltip |
| Trigger a dialog or popover from a button without JavaScript | `command` and `commandfor` attributes | Chrome 135 and later |
| Styled select menu | `appearance: base-select` | Lets you style the options list, which was previously impossible |
| Carousel controls and dots | `::scroll-button()` and `::scroll-marker()` | The browser generates them; they are keyboard-accessible and stylable |
| Scroll-spy navigation | `scroll-target-group` with `:target-current` | Replaces a scroll listener |

Two caveats. Dialogs and popovers are an Interop 2026 focus area, so behaviour still varies between
engines in details; test in more than one. And the newest items on that list (`interestfor`,
`base-select`, scroll markers) are not yet everywhere, so check current support before shipping without
a fallback.

The general principle: an element you build from a `<div>` starts with no role, no keyboard handling,
and no focus management. The platform element starts with all three.

## Motion: purpose, duration, and the off switch

Motion earns its place when it explains something: where a thing came from, that a list reordered, that
two screens are related. Motion that only decorates costs performance and excludes people.

**Durations that read as intentional:**

| Movement | Duration |
| --- | --- |
| Small state change (hover, toggle, checkbox) | 100 to 150 ms |
| Element entering or leaving (dropdown, tooltip) | 150 to 250 ms |
| Larger transition (panel, sheet, page) | 250 to 400 ms |
| Anything above | Almost always too slow; the user is waiting for the interface |

**Easing:** things entering the screen should decelerate (`ease-out`), things leaving should
accelerate (`ease-in`), and things moving between two on-screen positions should ease both ways.
Linear motion looks mechanical, and should be reserved for progress indicators and spinners where
constant speed is the point.

**Respect reduced motion.** Some people get nausea, dizziness, headaches, or migraine from large
motion, particularly parallax, full-viewport video, and sweeping page transitions. The operating system
preference arrives as a media query. Only about half of pages in the July 2025 crawl responded to it.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

That blanket rule is a floor, not a design. Better is to replace motion with a cross-fade, which keeps
the relationship visible without the movement. Note that WCAG rule 2.3.3 (Level AAA) requires
interaction-triggered motion to be disableable, and rule 2.2.2 (Level A) requires a pause control for
anything moving or auto-updating for more than five seconds. A carousel that advances on its own needs
a pause button at Level A.

## Modern animation features

| Feature | What it does | Status as of 2026-08 |
| --- | --- | --- |
| Same-document view transitions | Animate between two states of one page, including list reorders, without writing keyframes | Baseline newly available; Firefox 144 shipped in October 2025 |
| Cross-document view transitions | The same, between two page navigations in a multi-page site | Interop 2026 focus area |
| Element-scoped view transitions | Transition one component instead of the whole page | Chrome 147 and later |
| Scroll-driven animations | Tie animation progress to scroll position, off the main thread | Interop 2026 focus area; broadly supported |
| Scroll-triggered animations | Start a normal timed animation when a scroll boundary is crossed | Chrome 146 and later |
| `sibling-index()` and `sibling-count()` | Stagger animations without writing a delay per child | Newer; check support |
| `moveBefore()` | Move an element in the document without resetting it, so video keeps playing and iframes stay loaded | Chrome 133 and later |
| `@starting-style` | Define the state an element animates from when it first appears, which makes popovers and dialogs animate in | Widely supported |

View transitions deserve one warning: they animate everything by default, which produces a
distracting result on a content-heavy page. Name the elements you actually want to animate with
`view-transition-name`, and wrap the whole thing in a reduced-motion check.

## Gestures, hover, and pointer types

- **Never make hover the only way to reach something.** Touch devices have no hover, and keyboard
  users have no pointer. Use `interestfor` or a click-to-open pattern.
- **Do not rely on multi-finger or path-based gestures alone.** WCAG rule 2.5.1 requires a
  single-pointer alternative to anything needing a path or multiple contacts.
- **Query the input type rather than the screen size.** `@media (hover: hover)` and
  `(pointer: coarse)` tell you what the device can do. Screen width does not: a touchscreen laptop is
  wide and coarse.
- **Give feedback within 100 ms of touch.** On touch there is no cursor to confirm the press landed.

## The interaction checklist

1. Targets at least 24 px, 44 px for frequent actions, spacing respected.
2. Every drag interaction has a single-tap alternative.
3. `:focus-visible` styled, at least 2 px thick, 3:1 contrast.
4. Focus never hidden behind a sticky element; `scroll-margin` applied.
5. Modals use `<dialog>`; menus and tooltips use `popover`.
6. Focus returns to the trigger when an overlay closes.
7. Nothing important is hover-only.
8. Durations under 400 ms; entering eases out, leaving eases in.
9. Reduced motion honoured, with a cross-fade rather than nothing where possible.
10. Anything auto-moving for over five seconds has a pause control.
