# 04. Colour, typography, and theming

Colour and type are where the largest measurable accessibility failures live, and also where the
newest platform features remove the most work. Low-contrast text is the single most common detected
failure on the web: 83.9% of the top million home pages in February 2026.

## Contrast: the exact numbers

The requirements come from WCAG, the web accessibility standard.

| Rule | Applies to | Ratio |
| --- | --- | --- |
| 1.4.3 Contrast (Minimum), Level AA | Normal text | 4.5:1 |
| 1.4.3 Contrast (Minimum), Level AA | Large text: 18 point, or 14 point bold, or the CJK equivalent | 3:1 |
| 1.4.6 Contrast (Enhanced), Level AAA | Normal text | 7:1 |
| 1.4.6 Contrast (Enhanced), Level AAA | Large text | 4.5:1 |
| 1.4.11 Non-text Contrast, Level AA | Component boundaries, icons, chart elements that carry meaning | 3:1 |

"18 point" is roughly 24 px and "14 point bold" is roughly 18.5 px in browser terms.

Exempt: text inside a logo or brand name, purely decorative text, invisible text, and text in an image
that is mostly other visual content. Text in a disabled control is also exempt, which is why disabled
states are the most abused loophole in interface design. If a control looks disabled but is actually
active, the exemption does not apply.

Where teams reliably fail:

- Secondary and muted text. Grey on white is the classic. Check it as carefully as body text.
- Placeholder text. It is text; it needs 4.5:1. Which is a second reason not to use it as a label.
- Input borders and focus rings. These are components, so 3:1 under rule 1.4.11.
- Text over images and gradients. Contrast must hold at the worst point, not the average.
- Charts. A legend that only differs by colour fails, and colour-only meaning fails regardless of
  ratio.
- Brand colours in buttons. A mid-tone brand colour usually fails with white text and passes with
  near-black. Test both before the brand guide is frozen.

**About APCA.** APCA is a newer contrast model that accounts for how human vision actually responds
to lightness, and it handles dark backgrounds better than the current ratio maths. It is being
explored for the next major version of the standard, but it is not part of the normative draft and has
no legal standing. Use it as a design aid if you like; conform to the 4.5:1 and 3:1 ratios.

## Colour spaces: why `oklch` is now the default choice

Hex and `rgb()` describe a colour by how much of each screen primary to emit. That has two problems:
equal numeric steps do not look like equal steps, and mixing or lightening produces muddy results.

`oklch()` describes a colour as lightness, chroma (colourfulness), and hue. Practical consequences:

- **Predictable scales.** Holding chroma and hue while stepping lightness produces a ramp that looks
  even. Building a 10-step palette becomes arithmetic instead of eyeballing.
- **Honest lightness.** Two colours with the same L in `oklch` look about equally bright, which makes
  contrast decisions far more predictable across hues. Yellow and blue at the same hex lightness do
  not match; at the same `oklch` lightness they roughly do.
- **Wide gamut.** It can express colours outside the old sRGB range, which modern displays can show.
- **Better mixing.** `color-mix(in oklab, ...)` interpolates without the grey dip you get in sRGB.

A useful pattern for tinted surfaces, which keeps one source of truth for a theme colour:

```css
--accent-surface: color-mix(in oklab, var(--primary) 18%, var(--background));
```

Keep hex values only where a system demands them, for example an email template or an app manifest.

## Theming without duplicating your stylesheet

Three mechanisms, in increasing order of how much they do for you.

**1. `prefers-color-scheme`.** The user's operating system preference arrives as a media query. Only
about 13% of pages in the July 2025 crawl responded to it, which is a large and cheap gap.

```css
:root { color-scheme: light dark; }
```

Declaring `color-scheme` is the step people skip. It makes the browser's own widgets, scrollbars, and
form controls match, and it costs one line.

**2. `light-dark()`.** One declaration holds both values, and the browser picks based on the active
colour scheme. Reported as newly stable in all engines as of May 2026, and extended in Chrome 150 to
accept images as well as colours.

```css
color: light-dark(oklch(0.145 0 0), oklch(0.985 0 0));
```

**3. `contrast-color()`.** Given a background colour, it returns black or white, whichever contrasts
more. This removes the most common manual calculation in theming: what colour the label on a
brand-coloured button should be. Safari shipped it first; it is an Interop 2026 focus area, so include
a fallback.

For an explicit toggle rather than a system preference, put a class or attribute on the root element
and rebind the semantic token layer. That is the whole reason the semantic layer exists. See
[02](02-design-systems-and-tokens.md).

**Two other preferences with real user impact:**

- `prefers-contrast: more` for users who want stronger separation.
- `forced-colors: active` for Windows High Contrast Mode, where the operating system replaces your
  palette entirely. About 16% to 19% of pages responded to it in the 2025 crawl. The main task is
  making sure things you drew with backgrounds and borders survive; use `forced-color-adjust` and
  `system-color` keywords rather than fighting it.

## Colour vision deficiency

Around 8% of men of northern European descent have some form of red-green colour vision deficiency.
The design rule is simple and absolute: **colour must never be the only carrier of meaning.** Add a
shape, an icon, a label, a pattern, or a position.

The specific things that break:

- Red and green as pass and fail with no icon.
- Multi-series charts distinguished only by hue. Use direct labels on the series, or vary shape and
  dash pattern.
- Required-field indicators that are only red.
- Status dots without text.

## Typography: the numbers that matter

| Decision | Value | Why |
| --- | --- | --- |
| Body text size | 16 px minimum on mobile | Below 16 px, mobile Safari zooms the page when an input is focused. Set it on the control, not just the label |
| Line length | 45 to 75 characters, about 66 as the target | Long-standing typographic guidance, supported by eye-movement studies from Tinker and Paterson onward. Long lines make the eye lose the start of the next line |
| Line height | About 1.4 to 1.6 for body text, tighter for headings | Longer lines need more leading |
| Paragraph width in CSS | `max-width: 65ch` | `ch` is the width of the "0" glyph, so this tracks the font |
| Sizing unit | `rem` for type and spacing | Respects the user's browser font size. 67% of sites in the 2025 crawl still set font sizes in pixels |
| Type scale | Fluid via `clamp()` | One declaration replaces breakpoint-stepped sizes |

A fluid heading, with a floor, a preferred value, and a ceiling:

```css
h1 { font-size: clamp(1.75rem, 1.2rem + 2.5vw, 3rem); }
```

Note the middle term includes a `rem` component. A pure `vw` preferred value stops the text from
scaling when the user zooms, which is an accessibility failure.

Two newer helpers:

- `text-wrap: balance` for headings, which evens out line lengths so you do not get one orphan word.
  `text-wrap: pretty` for body text, which improves the last lines. Adoption is still low: about 2.7%
  and 1.7% of sites respectively in the 2025 crawl.
- `text-box: trim-both cap alphabetic` removes the extra vertical space fonts carry above and below
  the letters, so a button label sits optically centred. Available in Chrome 150.

**Variable fonts** carry a range of weights and widths in one file, so you ship one request instead of
six. Keep the axes you actually use, subset the character range, and self-host with
`font-display: swap` and a preload for the one font that renders your first screen. Fonts were about
139 KB of the median desktop page in July 2025.

## Icons

- Never an icon alone for an important action, unless the icon is a genuine convention (a magnifier
  for search, an X for close). Everything else needs a visible label.
- Icons that carry meaning need an accessible name; decorative icons should be hidden from assistive
  technology.
- Icon-only buttons still need a 24 px target minimum, and 44 px is better. The drawing can stay small
  while the target is large.
- Keep line weight and corner treatment consistent, and align to the same optical size. Mixed icon
  sets are the fastest way to make a product look unfinished.

## Density and translucency

Two live debates worth stating with evidence.

**Expressive versus quiet.** Google's 2025 design update ran 46 studies with more than 18,000
participants over three years, using eye tracking, surveys, and usability tests. Reported results:
participants spotted key buttons up to four times faster in the expressive designs across 10 apps,
87% of 18-to-24-year-olds preferred that style, and brand perception rose across three measures.
Treat the direction as well supported and the exact percentages as vendor-reported. The mechanism
matters more than the styling: colour, shape, size, motion, and containment used deliberately to mark
what matters.

**Translucency.** Apple introduced a translucent, refracting material across its platforms in June
2025. The recurring criticism was legibility: blurred layers over moving content reduce effective
contrast, and the effect depends on what is behind it. The lesson generalises to any glass or blur
effect you build: contrast must be verified against the worst-case backdrop, not a marketing
screenshot, and the effect must respond to reduced-transparency and increased-contrast settings.

## The colour and type checklist

1. Body text 4.5:1, large text 3:1, control borders and meaningful icons 3:1.
2. Placeholder, muted, and secondary text checked explicitly.
3. Nothing depends on colour alone.
4. `color-scheme` declared; dark mode implemented through the semantic token layer.
5. Reduced-motion, increased-contrast, and forced-colours preferences handled.
6. Inputs at 16 px or larger on mobile.
7. Reading columns capped near 65 characters.
8. Type and spacing in `rem`; fluid sizes include a `rem` term inside `clamp()`.
9. Text still readable and unclipped at 200% zoom, reflowing at 400%.
10. Any blur or glass effect verified against its worst backdrop.
