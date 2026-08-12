# Report v1 — build plan

**Created:** 2026-08-11
**Input:** `report-v0.html` (279,849 bytes, 1,403 lines)
**Output:** `report-v1.html` (new file; v0 stays for comparison)

## Why a v1

v0 is well written and its design tokens are sound. It fails as a *document you can use*. Three things break it:

1. **No map.** 35,579px of continuous scroll at desktop width, 84 headings, one linkable `id`. You cannot see where you are, jump to a part, or send someone a link to a finding.
2. **Hidden table content.** `white-space: nowrap` on every cell means text cannot wrap. 31 of 41 tables run off the edge at 846px wide; 37 of 41 at phone width, hiding a median of 633px and up to 1,398px of content — with no fade, shadow, or hint that anything is cut off.
3. **A search box that does nothing.** It filters at the granularity of six enormous sections. Its own placeholder examples (`Pareto`, `uncertainty`, `keyboard`) match five or six of six sections, so nothing hides and nothing highlights.

And the framing problem underneath all three: the report argues that a good visualization keeps the default view useful and never hides scope. Its own default view hides most of its own tables and shows none of the 118 chart forms it names.

## Decisions taken

| Question | Decision |
|---|---|
| Navigation | Sticky sidebar outline, two levels, scroll-spy. Content stays expanded so find-in-page keeps working. |
| Chart visuals | All 118 form glyphs, plus 3 structural diagrams. |
| Search box | Cut. Keep and fix the task-to-chart recommender. |

The collapsible-section approach in `report-collapsed.html` (127 `<details>`) is rejected: closed sections defeat Cmd+F, which is the one navigation tool that works in v0 today.

---

## Workstream 1 — Navigation spine

- Sticky left rail listing sections and subsections. Highlight the current position as the reader scrolls.
- Below 900px it becomes a "Contents" sheet opened from a sticky top bar.
- Give all 84 headings a stable slug `id`, plus an anchor link that appears on hover, so any paragraph can be cited.
- One numbering scheme throughout: §1, §1.2, §1.2.3, set in the margin. This replaces today's mixed convention, where 41 of 76 sub-headings are numbered, the rest are not, and six different headings begin with "1.".
- Prev / next section links in each section footer.
- Skip-to-content link as the first focusable element.

## Workstream 2 — Table system

The single biggest readability win.

- **Remove `white-space: nowrap` from `td`.** Let prose wrap. Keep nowrap only on short label columns.
- Set column widths per table with `<colgroup>`: narrow for label columns, generous for definition columns.
- **Sticky `<thead>`** so column labels survive a 44-row scroll.
- Where a table still has to scroll sideways, give it a real affordance: edge fade, shadow, a "scroll →" chip, and keyboard scrolling.
- Add a `<caption>` to all 41 tables. Right now a screen reader announces "table" 41 times with no names.
- **Make sorting opt-in per table.** Today all 121 headers are sort buttons. Sorting an alphabetical glossary achieves nothing; sorting the "Order 1–7" design-sequence table destroys its meaning. Keep sorting on the audit and comparison tables.
- Drop the drag-to-resize handles. They are mouse-only, have no keyboard path, and solve the least important of these problems.
- Below 700px, turn the two-column term/definition tables into stacked definition lists rather than scrolling them sideways.

Keep the existing sort comparator as-is — it correctly handles dates, durations, currency, percentages, ratios, blanks-last, and pinned `Total` rows.

## Workstream 3 — Reading layout

- Cap the prose measure at roughly 72–78 characters. v0 sets `main { max-width: none }`, giving about 115 characters per line at 846px and over 200 on a 1080p monitor; comfortable reading is 45–75. Let tables, code, and diagrams break out to full width.
- **Flip the contrast hierarchy.** v0 puts all body prose at `--muted-foreground` (7.66:1 dark, 4.74:1 light) and table cells at `--foreground` (18.97:1, 19.8:1). The reasoning is greyed out and the reference data is bright. Body prose moves to `--foreground`; only genuine metadata stays muted.
- Convert the front-matter run-on paragraph (`Created: … Audience: … Scope: … Evidence boundary: …`) into a metadata grid.

## Workstream 4 — Recommender, minus the search

- Delete the search box, its status line, and the `applySearch` handler. Navigation is now the sidebar plus browser find-in-page.
- Move the task-to-chart recommender into §1, beside the taxonomy it describes.
- Wire in the two orphaned chart families. The embedded data defines eleven (`chartFamilies`) but the picker exposes ten — `hierarchy` and `process` are unreachable.
- Link each recommendation to the taxonomy row it names.
- Give the recommender a one-line explanation. In v0 it fires on load and shows a green box reading "**table** · categorical+multiple measures" before the reader has asked anything.
- Add a "Download JSON" button for the 8,093-byte payload already embedded in the page. v0 carries it and reads exactly one key from it, while §00 tells readers to "retain an exact table or download path for verification."

## Workstream 5 — Visuals

v0 contains zero `<svg>` and zero `<canvas>`. It names 118 chart forms and shows none of them.

### Glyph specification

- Size ~64×28px, inline SVG, sitting in a new first column of each taxonomy table.
- A **silhouette, not a miniature chart.** No axes, no labels, no gridlines, no legend.
- Two tones: `--muted-foreground` for structure, `--primary` for the one feature that distinguishes this form from its neighbours.
- Hairline strokes and square corners, matching the report's existing style.
- `aria-hidden="true"` — the Form column already names each one in text, so the glyph is decoration and should stay out of the accessibility tree.
- Budget roughly 200 bytes each, about 24KB total. Acceptable against a 280KB file of which 96KB is already embedded fonts.

### Glyph work-list — 118 forms in three drawing tiers

Tiering matters because these are not equal work. Tier A composes from shared primitives; Tier C needs bespoke geometry for each.

**Tier A — mark-based forms (~72).** Build eight primitive generators (frame, baseline, bar set, line path, dot set, area fill, interval whisker, density curve) and compose. Fast per glyph once the generators exist.

- §1 lookup: Sparkline, Bullet chart, Gauge, KPI card
- §2 ranking: Horizontal bar, Vertical bar/column, Grouped bar, Stacked bar, 100% stacked bar, Diverging bar, Dot plot, Lollipop, Cleveland dot plot, Dumbbell, Slopegraph, Bump chart, Pareto chart, Pictogram/isotype
- §3 time: Line, Multi-series line, Step, Area, Stacked area, Streamgraph, Horizon, Small-multiple line, Connected scatterplot, Timeline, Gantt, Candlestick/OHLC, Control chart, Fan chart
- §4 distribution: Histogram, Frequency polygon, KDE/density, ECDF, Boxplot, Violin, Strip/jitter, Beeswarm, Ridgeline, Raincloud, Q–Q, Error bar, Error band, Forest plot, Quantile dotplot, Hypothetical outcome plot, Gradient interval
- §5 relationship: Scatterplot, Bubble, Hexbin, 2D density/contour, Regression, Residual, Parallel coordinates, Radar/spider, Ternary, Bland–Altman
- §6 composition: Waterfall, Funnel, Population pyramid
- §10 specialized: ROC curve, Precision–recall curve, Calibration plot, Kaplan–Meier, Funnel plot, Volcano plot, Manhattan plot

**Tier B — partition and layout forms (~26).** Bespoke geometry each, but static and small.

- §1: Data table, Pivot table, Scorecard
- §5: Correlogram, Scatterplot matrix/SPLOM
- §6: Pie, Donut, Waffle, Treemap, Sunburst, Icicle, Mosaic, Marimekko
- §7: Adjacency matrix
- §8: Choropleth, Proportional-symbol map, Dot-density map, Cartogram, Hexbin/grid map, Contour/isoline map, Raster/heat map, Isochrone map, Bivariate choropleth
- §10: Heatmap, Cohort retention matrix, Confusion matrix, Nomogram

**Tier C — structural silhouettes (~20).** Reduce to a recognisable outline; a readable diagram is impossible at this size.

- §7 flow and network: Node-link graph, Force-directed graph, Arc diagram, Chord diagram, Sankey, Alluvial, Parallel sets, Tree, Dendrogram, Dependency graph
- §8: Flow map
- §9 process and architecture (all ten): Flowchart, Swimlane, BPMN, Sequence, State, Architecture, Entity-relationship, Decision tree, Causal diagram/DAG, Mind map

### Three full diagrams

Larger, labelled, in-flow figures with `<figcaption>`:

1. **The layered chart shell** — the ten-step pattern in §00, drawn as the nested shell it describes.
2. **The control-family taxonomy** — the seven families and what each one changes.
3. **The visualization-state schema** — what a shareable view has to capture.

## Workstream 6 — Accessibility

- **Restore visible focus.** v0 sets `outline: none` on all 121 sort buttons (replacing it with a 14%-opacity tint) and on the theme toggle. Use a 2px `--primary` outline with offset everywhere.
- **Fix or cut the row highlight.** v0 makes all 542 table rows click-to-highlight with `cursor: auto`, no hover style, no `aria-selected`, no keyboard path, and no way to clear. Either promote it to a real control — pointer cursor, hover state, `aria-pressed`, a "3 rows marked · clear" chip, keyboard reachable — or remove it.
- **Theme.** Seed from `prefers-color-scheme` instead of hardcoding `class="dark"`, and persist the choice in `localStorage` so it survives a reload.
- Keep what already works: no skipped heading levels, `scope` on every `th`, AA contrast throughout.

## Workstream 7 — Print stylesheet

v0 has no print rules at all, on a document people will try to save as PDF.

- Force the light palette.
- Expand every sideways-scrolling table to full content.
- `break-inside: avoid` on rows, tables, and figures.
- Print link URLs after their text.
- Hide the sidebar, theme toggle, sort buttons, and recommender.

---

## Build order

1. Workstream 2 (tables) and 3 (reading layout) — biggest readability gain, no new content needed.
2. Workstream 1 (navigation) — depends on heading ids from step 1's markup pass.
3. Workstream 6 (accessibility) and 4 (recommender) — small, independent.
4. Workstream 5 glyphs — Tier A generators first, then Tier A glyphs, then B, then C.
5. Workstream 5 diagrams.
6. Workstream 7 (print) last, once the layout is settled.

## Constraints

- Single self-contained HTML file. No network requests, no build step.
- Keep the existing OKLCH token system, the two embedded fonts, square corners, and hairline borders.
- Keep the sort comparator.
- Do not change the prose. This is a structure, design, and visuals pass.

## Measurements to check against when done

| Metric | v0 | v1 target |
|---|---|---|
| Tables overflowing at 846px | 31 of 41 | 0, or all with a visible scroll affordance |
| Tables overflowing at 375px | 37 of 41 | 0 |
| Headings with a linkable `id` | 1 of 84 | 84 of 84 |
| Tables with a `<caption>` | 0 of 41 | 41 of 41 |
| Prose measure at 1440px | ~200 characters | 72–78 characters |
| Body prose contrast (dark) | 7.66:1 muted | `--foreground`, 18.97:1 |
| Chart forms shown visually | 0 of 118 | 118 of 118 |
| Controls with a visible focus ring | inputs only | all |
| Print stylesheet | none | present |
