# 03. Layout and responsive behaviour

Responsive design started in 2010 as "change the layout at certain window widths." That model is now
the slow path. The modern model is: describe the constraints, let the browser solve the layout, and
let each component respond to the space it was actually given.

## Baseline, and how to read it

**Baseline** is the shared label the browser makers use to say how safe a web feature is.

| Label | Meaning | How to treat it |
| --- | --- | --- |
| Limited availability | Not in every major engine yet | Behind a feature check, or not at all |
| Newly available | Just became supported in all major engines | Usable with a fallback for older installed versions |
| Widely available | Supported in all major engines for about 30 months | Use it without a fallback |

Interop is the related programme: Apple, Google, Igalia, Microsoft, and Mozilla agree each year on a
set of features to make behave identically, measured by a public test suite. The 20 focus areas for
2026 tell you where the rough edges still are:

anchor positioning, container style queries, dialogs and popovers, scroll-driven animations, view
transitions, the `attr()` function, the `contrast-color()` function, custom highlights, fetch uploads
and ranges, IndexedDB, JSPI for WebAssembly, media pseudo-classes, the Navigation API, scoped custom
element registries, scroll snap, the `shape()` function, web compatibility, WebRTC, WebTransport, and
the `zoom` property.

Read that list as a warning label: anything on it works, but may still differ between browsers in
2026. Test those features in more than one engine.

## Container queries replace most breakpoints

A **media query** asks about the window. A **container query** asks about the element's own parent.
Container queries are Baseline widely available, supported in every major browser released since
2023.

Why this changes the model: a card in a sidebar and the same card in a full-width grid have the same
window width and completely different available space. With media queries you either write
sidebar-specific rules or accept a bad layout. With container queries the card carries its own rules
and works anywhere.

```css
.card-area { container-type: inline-size; }

@container (min-width: 30rem) {
  .card { grid-template-columns: 8rem 1fr; }
}
```

Practical rules:

- Query in `rem` or `em`, not pixels, so the layout responds to text size too.
- Keep the container declaration on a wrapper, not on the component itself. An element cannot query
  itself.
- Use `cqi` units (a percentage of the container's inline size) for type or spacing that should scale
  with the component.
- Media queries still own page-level decisions: how many columns the whole page has, whether the
  navigation is a bar or a drawer, and print.

**Style queries** are the sibling feature: styling descendants based on a custom property value on an
ancestor, which is how you build variants such as a "compact" or "inverted" region without extra
classes. Style queries are still an Interop 2026 focus area, so verify across engines.

**Scroll-state queries** let you style based on whether an element is scrollable, stuck to an edge, or
snapped. That solves the classic sticky-header shadow problem without a scroll listener. Shipped in
Chrome 133; check other engines before relying on it.

## Intrinsic layout: describe intent, not sizes

The set of techniques that let content determine layout:

| Tool | Use it for | Note |
| --- | --- | --- |
| `grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr))` | A card grid that reflows with no breakpoints | The single highest-value line of modern CSS layout |
| `flex-wrap` with `min-width` on items | Toolbars and tag lists that wrap gracefully | Wrapping is the fallback, not a failure |
| `min()`, `max()`, `clamp()` | Fluid sizes with hard limits | `width: min(100%, 65ch)` is a whole readable-column rule |
| `subgrid` | Aligning nested content across sibling cards | Removes most fixed-height hacks |
| `aspect-ratio` | Reserving space for media before it loads | Prevents layout shift, which is a Core Web Vital |
| Logical properties | Layout that flips for right-to-left languages | See below |
| `stretch` keyword | Filling the containing block while keeping margins | Newer; check support |

Two habits worth deleting: fixed heights on anything containing text, and `100vh` for full-screen
sections on mobile. Both break the moment text grows or a browser toolbar appears.

## Viewport units on mobile

The classic problem: on a phone, `100vh` refers to the viewport as if the browser's toolbars were
hidden, so a full-height section is taller than the visible area and the page scrolls unexpectedly.

The fix is the dynamic viewport units:

| Unit | Meaning |
| --- | --- |
| `svh` | Small viewport height, toolbars visible |
| `lvh` | Large viewport height, toolbars hidden |
| `dvh` | Dynamic, changes as the toolbars appear and disappear |

Use `dvh` for full-height layouts and `svh` when you need a value that never causes overflow. Note
that `dvh` changing during a scroll can cause layout shifts, so avoid it on elements whose size
affects the flow of the whole page.

## Safe areas and device shapes

Phones have rounded corners, notches, camera cutouts, and a home indicator. The
`env(safe-area-inset-*)` values expose those insets:

```css
.bottom-bar {
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
}
```

Two requirements: add `viewport-fit=cover` to the viewport meta tag or the insets stay zero, and use
`max()` so you never end up with less padding than your design calls for.

## Thumb reach and the bottom of the screen

Phones are held one-handed most of the time, and the reachable arc for a thumb covers the lower
middle of the screen. That is why primary navigation moved to the bottom on mobile, and why the
top-right corner is the worst place for a frequent action on a large phone. It also interacts with
Fitts's law: the bottom edge is a boundary, so a bar anchored to it is easy to hit.

Two caveats worth stating: reach data varies by hand size and by whether the phone is held in the
dominant hand, and bottom bars compete with the operating system's own gesture areas. Always test
with the safe-area insets applied.

## Right-to-left and internationalisation

Use **logical properties**, which name box edges by the flow of text rather than the physical screen.
`margin-inline-start` is the left margin in English and the right margin in Arabic, with no extra
stylesheet.

| Physical | Logical |
| --- | --- |
| `margin-left` | `margin-inline-start` |
| `padding-top` | `padding-block-start` |
| `border-right` | `border-inline-end` |
| `text-align: left` | `text-align: start` |
| `top` / `left` in positioning | `inset-block-start` / `inset-inline-start` |

Grid and flexbox already work this way, which is why they handle right-to-left better than float
layouts ever did.

Other things that break in translation:

- **Text expands.** German and Finnish commonly run 30% longer than English. Never size a button to
  its English label.
- **Line breaking differs.** Chinese, Japanese, Thai, and Khmer do not use spaces the same way. Do
  not build word-count logic.
- **Names, addresses, and phone numbers have no universal shape.** One "full name" field and a
  free-text address block cause fewer failures than a first/middle/last plus state/ZIP form.
- **Dates and numbers.** Use the platform's formatting, and never abbreviate a date to digits alone in
  a multi-locale product.
- **Icons carry culture.** Arrows flip with direction; mailboxes, thumbs, and hand gestures do not
  travel.

## The layout checklist

1. No fixed heights on text containers.
2. No `100vh`; use `dvh` or `svh`.
3. Card grids use `auto-fit` with `minmax`, not breakpoints.
4. Component-level responsiveness uses container queries, in `rem`.
5. Reading columns are capped near 65 to 75 characters using `ch` or `max-width`.
6. Media has `aspect-ratio` or explicit dimensions so nothing shifts on load.
7. Spacing in `rem`, so it scales with user text size.
8. Logical properties throughout.
9. Safe-area insets applied to anything anchored to an edge.
10. The page never scrolls sideways at 400% zoom in a 1280 px window. Wide tables scroll inside their
    own container instead.
