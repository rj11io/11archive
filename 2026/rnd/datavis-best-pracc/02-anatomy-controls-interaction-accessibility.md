# Anatomy, controls, interaction, and accessibility

## 1. Visualization anatomy

A chart is a system of data, transformations, marks, encodings, scales, guides, annotations, controls, states, and provenance.

| Component | Definition | Required practice |
|---|---|---|
| Objective | The decision or question the view supports | Write it before choosing a chart |
| Audience | People expected to interpret or operate the view | Match terminology, density, and interaction to their expertise |
| Data model | Typed observations, dimensions, measures, units, time, status, and provenance | Preserve raw and derived values separately |
| Transform | Filter, calculate, aggregate, bin, normalize, rank, join, sample, or smooth | Disclose transformations that change interpretation |
| Mark | Primitive graphical object: point, line, bar, area, rect, rule, text, or geographic shape | Choose geometry that matches the task |
| Encoding channel | Visual property carrying a field: x/y position, length, color, size, shape, opacity, angle, text | Give the primary fact the most accurate channel |
| Scale | Function mapping a data domain to a visual range | Choose linear, log, time, band, ordinal, sequential, diverging, or threshold deliberately |
| Axis | Guide for a positional scale: domain line, ticks, labels, grid, title | Label unit and use readable, honest ticks |
| Legend | Guide for color, size, shape, opacity, or line style | Place near the plot; make interactive state visible if clickable |
| Plot area | Region in which data marks appear | Protect from label overlap and excessive decoration |
| Baseline | Reference from which magnitude is judged | Use zero for ordinary bars; label special baselines |
| Reference line/band | Target, threshold, benchmark, normal range, or event | Identify source and meaning; do not imply certainty |
| Annotation | Text or graphic directing attention to a material fact | Explain why it matters, not merely restate a value |
| Title | Concise statement of subject or finding | Include metric and scope; avoid unexplained acronyms |
| Subtitle/deck | Definition, unit, period, direction, or method under the title | Make the chart interpretable without hunting |
| Caption/source note | Provenance, freshness, method, exclusions, uncertainty | Keep it visible in screenshots and exports |
| Tooltip | On-demand detail tied to a mark | Supplemental, focusable, dismissible, hoverable, persistent |
| Control bar | Filters, selectors, view switches, and display settings | Group by effect and preserve a stable order |
| Status/coverage | Selected count, eligible count, loading/no-data/error state | Update visibly and programmatically after interaction |
| Exact-data view | Table or download of values behind the chart | Maintain parity with filters and units |

Vega-Lite defines position, geographic position, mark-property, text/tooltip, detail, order, and facet channels, and automatically derives many scales and guides. That grammar is a useful checklist even when another library is used: [encoding documentation](https://vega.github.io/vega-lite/docs/encoding.html), [axes](https://vega.github.io/vega-lite/docs/axis.html), [legends](https://vega.github.io/vega-lite/docs/legend.html), and [scales](https://vega.github.io/vega-lite/docs/scale.html).

## 2. Encoding hierarchy

For precise quantitative comparison, prefer:

1. Position on a common scale.
2. Position on non-aligned but comparable scales.
3. Length.
4. Angle or slope when the directional relationship is the question.
5. Area.
6. Volume.
7. Color luminance/saturation.

This is a pragmatic adaptation of Cleveland and McGill's experimental ordering. It is not a universal ban on lower-ranked channels. Area is appropriate for geographic proportional symbols; color is appropriate for dense matrices; angle is appropriate when direction is itself the phenomenon. The rule is to match perceptual precision to decision risk.

Use redundant encoding when failure to distinguish a series would change the conclusion. Examples:

- Color + direct label.
- Color + line dash.
- Color + point shape.
- Fill + outline + text status.
- Position + icon for a target or reasoning-model status.

## 3. Scale and baseline rules

| Decision | Use | Guardrail |
|---|---|---|
| Linear scale | Additive differences over a regular numeric domain | Inspect outliers and range compression |
| Log scale | Orders of magnitude, positive values, multiplicative change | Label base; never hide zero/negative exclusions |
| Symlog scale | Signed values spanning orders of magnitude | Explain the linear region near zero |
| Time scale | Continuous dates/times | State timezone, aggregation window, and missing intervals |
| Band/point scale | Discrete categories | Preserve semantic order or expose sort |
| Sequential color | Ordered low-to-high values | Maintain monotonic lightness and label endpoints |
| Diverging color | Deviation around a meaningful center | State center and balance both sides |
| Qualitative color | Unordered categories | Limit simultaneous colors and keep identity stable |
| Threshold/binned color | Named ranges or operational bands | Show cut points and avoid false precision |

ColorBrewer separates qualitative, sequential, and diverging schemes and provides color-vision-aware options: [ColorBrewer 2.0](https://colorbrewer2.org/). Do not adopt a palette only because it looks attractive; verify contrast, ordering, semantic associations, dark/light behavior, printing, and color-vision deficiency.

## 4. Control taxonomy

### Data-scope controls

| Control | Use | Design requirements |
|---|---|---|
| Search/filter field | Find entities or reduce a table | Debounce expensive updates; show result count and clear action |
| Multi-select entity picker | Choose exact items | Search, selected state, count, sensible default, reset; virtualize long lists |
| Checkbox/chip group | Apply categorical filters | Visible selected/unselected state; wrap accessibly; no color-only state |
| Radio group/segmented control | Choose one mutually exclusive option | One default; arrow-key behavior; short labels |
| Range slider | Restrict a numeric or temporal interval | Numeric inputs or keyboard adjustment; announce current bounds |
| Date range/preset | Select calendar or rolling window | State timezone and inclusive boundaries; show custom range |
| Hierarchical filter | Choose nested categories | Indeterminate parent state; clear scope; search for deep trees |
| Add comparison | Add entity/provider endpoint outside the default | Distinguish object type and prevent duplicates |

### View and encoding controls

| Control | Use | Design requirements |
|---|---|---|
| Tabs | Switch analytical question or metric family | Update title, unit, description, and URL/state where feasible |
| Metric selector | Rebind an axis or measure | Preserve compatible filters; avoid silently changing directionality |
| “Color by” radio | Change grouping/identity encoding | Rebuild legend and retain direct labels/accessible description |
| Legend toggle | Hide/show series or components | Make legend visibly interactive; preserve or explain empty state |
| Sort control | Reorder categories/table rows | State column and direction; deterministic ties; missing values last |
| Scale toggle | Linear/log, absolute/normalized | Treat as material state, not cosmetic; disclose in title/axis/export |
| Stack toggle | Grouped/stacked/100% | Update totals, denominators, tooltips, and accessible summary |
| Label-size slider | Change density/legibility | Bounded values; current value text; reset |
| Label/tick switch | Reduce clutter | Preserve focus/tooltip/exact-data access |
| Pareto/benchmark switch | Add analytical overlay | Explain calculation/source and desirability direction |
| Small-multiple/overlay switch | Separate or combine series | Keep scale policy explicit |

### Navigation and manipulation controls

| Control | Use | Design requirements |
|---|---|---|
| Tooltip/details on demand | Inspect one mark | Trigger on hover and focus; pin/dismiss when needed |
| Point selection | Identify or compare marks | Visible selection and clear action; multi-select modifier documented |
| Brush | Select a continuous region | Linked result count; handles; keyboard/numeric alternative |
| Cross-filter | A selection in one view filters others | Show cause and scope; avoid invisible persistent state |
| Cross-highlight | Selection emphasizes matching marks without removing others | Dim carefully; keep unselected context legible |
| Zoom/pan | Inspect dense local detail | Bound transforms; readable axes; reset/overview; touch support |
| Drill down/up | Move between aggregation levels | Breadcrumb; preserve parent context; prevent dead ends |
| Focus + context | Detailed view plus overview navigator | Synchronize domains and selection |
| Expand/collapse | Reveal detail progressively | Correct `aria-expanded`; preserve focus |

Vega-Lite distinguishes point and interval selections and supports bindings to inputs, legends, and scales. D3 provides zoom, pan, drag, and brush behaviors. Sources: [Vega-Lite selections](https://vega.github.io/vega-lite/docs/selection.html), [parameter binding](https://vega.github.io/vega-lite/docs/bind.html), and [D3 zoom](https://d3js.org/d3-zoom).

### Output and collaboration controls

| Control | Use | Design requirements |
|---|---|---|
| Copy deep link | Share a section or state | Encode compatible view state; warn if filters are not preserved |
| Download image | Reuse a static chart | Include title, unit, period, legend, source, and active-filter note |
| Download data | Verify or recompute | Export the filtered data by default and document schema/units |
| Copy table | Move exact values | Preserve headers and missing-value text |
| Fullscreen | Increase inspection area | Maintain keyboard escape and focus return |
| Save view/preset | Revisit a state | Name owner/scope, show changes, allow delete/reset |

## 5. Default-state design

The initial view is an editorial decision. Treat it as a first-class artifact.

- Select a curated set that answers the most common question.
- Show `selected of eligible` rather than implying complete coverage.
- Pick a meaningful sort and stable tie-break.
- Keep filters inactive unless the product promise is intentionally scoped.
- Use a default time range that reveals the phenomenon without overwhelming.
- Put essential context in the default rendering, not behind a tooltip.
- Preserve enough outliers and counterexamples to avoid a flattering shortlist.
- Provide `Reset to default`, not only `Clear all`. Clearing can produce an unusable blank view.

## 6. Feedback, latency, and state

| State | Visible behavior | Accessibility behavior |
|---|---|---|
| Loading | Preserve layout; show local progress; keep prior view if safe | Announce loading once, then completion/result count |
| Partial | Show available marks plus coverage/exclusion notice | Include partial status in summary |
| No results | Explain active filters and offer clear/reset | Focus stays on triggering control; announce `0 results` |
| No data | Distinguish absent evidence from zero | Use explicit `unavailable` text |
| Error | State what failed and what remains usable | Error role/message; retry is keyboard reachable |
| Stale | Timestamp and warning | Expose freshness in text, not icon alone |
| Selection | Highlight and count | State/checked value programmatically updated |
| Export ready | Confirmation with file/state description | Status message without stealing focus |

For result counts and asynchronous updates, use programmatically determinable status messages. W3C explains that messages such as “18 results returned” should be available to assistive technology without moving focus: [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html).

## 7. Accessibility contract

### Perceivable

- Meet WCAG text and non-text contrast requirements.
- Never use color as the only carrier of meaning. W3C specifically recommends text or other cues: [Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color).
- Support 200% text zoom and responsive reflow.
- Provide a short chart description, a visible takeaway, and a structured long description or data table for complex information. W3C's complex-image tutorial recommends descriptions that include scales, values, relationships, and trends: [Complex Images](https://www.w3.org/WAI/tutorials/images/complex/).
- Do not bake essential labels into raster images.

### Operable

- Make all non-path-dependent functions keyboard operable.
- Preserve logical focus order and visible focus.
- Provide alternatives for drag-only brush, resize, or zoom actions.
- Keep pointer targets at least WCAG 2.2's minimum where applicable; 44×44 CSS pixels is the enhanced target.
- Let users pause motion and respect `prefers-reduced-motion`.
- Avoid single-letter shortcuts unless scoped, remappable, or disableable.

### Understandable

- Give controls visible labels; icons may supplement but should not replace ambiguous text.
- Keep terminology, color identity, sort direction, and control placement consistent.
- Distinguish data filters from display settings.
- State active filters and changes.
- Give destructive or expensive operations confirmation/undo; ordinary visualization filters should remain reversible without confirmation.

### Robust

- Prefer native controls, tables, headings, details, and links.
- Custom controls require correct programmatic name, role, state, and value: [WCAG Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value).
- Tooltips and hover cards must also work on focus and be dismissible, hoverable, and persistent: [Content on Hover or Focus](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html).
- Use real table headers and header associations: [W3C tables tutorial](https://www.w3.org/WAI/tutorials/tables/).
- If an SVG chart is exposed, give it a meaningful accessible name/description and avoid announcing every decorative mark.

## 8. Responsive and performance practice

- Start with one dominant question per view; stack secondary charts vertically on narrow screens.
- Prefer responsive ranges and label strategies, not a uniformly scaled-down desktop chart.
- Move long legends below the plot or turn them into a scrollable/filterable list.
- Switch from direct labels to focus/tooltip plus selected labels as density increases.
- Preserve a minimum plot area; allow horizontal scrolling for wide exact tables.
- Virtualize very long pickers and tables while retaining screen-reader semantics or an accessible paged alternative.
- Aggregate or bin millions of points; disclose aggregation and retain access to outliers.
- Use Canvas/WebGL for very large mark counts only when accessible fallback and export semantics remain available.
- Debounce text/range filters and cancel stale requests.
- Avoid animations on first load. If animated transitions aid object constancy, keep them brief, interruptible, and reduced-motion aware. Heer and Robertson found staged animated transitions can improve graphical perception, but motion is a means, not a default flourish: [Animated Transitions in Statistical Data Graphics](https://idl.uw.edu/papers/animated-transitions).

## 9. Verification matrix

| Layer | Checks |
|---|---|
| Data | Types, units, timezone, denominators, duplicates, nulls, coverage, outliers |
| Transformation | Filter order, aggregation, binning, normalization, ranking, interpolation, sampling |
| Encoding | Baseline, scale type/domain, channel meaning, sort, color semantics, uncertainty |
| Content | Title, unit, period, source, directionality, definitions, caveats, active filters |
| Interaction | Default, select, multi-select, filter, sort, brush, zoom, drill, clear, reset, back/forward |
| State | Loading, slow, partial, zero, no data, error, stale, offline where relevant |
| Accessibility | Keyboard, focus, screen-reader labels/states, contrast, color deficiency, reduced motion, 200% zoom |
| Responsive | Narrow/mobile, long labels, dense data, localization, print/export |
| Parity | Chart, table, download, screenshot, and linked view agree |
| Performance | Time to first useful view, interaction latency, stale-request cancellation, memory |

## 10. Minimal control API example

```json
{
  "view": "quality-vs-cost",
  "entities": ["model-a", "model-b", "model-c"],
  "filters": {
    "license": ["open", "proprietary"],
    "reasoning": [true],
    "releaseDate": { "from": "2026-01-01", "to": "2026-08-11" }
  },
  "encoding": {
    "x": "qualityIndex",
    "y": "costPerTaskUsd",
    "colorBy": "creator",
    "scaleY": "log"
  },
  "overlays": {
    "desiredRegion": true,
    "paretoFrontier": true,
    "labels": "selected"
  },
  "meta": {
    "timezone": "UTC",
    "dataAsOf": "2026-08-11T00:00:00Z",
    "schemaVersion": 1
  }
}
```

Separate `filters` from `encoding` and `overlays`. This makes URLs, tests, reset behavior, analytics, and exports easier to reason about.

