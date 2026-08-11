# Interactive data visualization: executive playbook

**Created:** 2026-08-11  
**Audience:** product designers, analysts, engineers, researchers, and reviewers  
**Scope:** practical chart selection, visualization anatomy, interaction, accessibility, and a dated audit of Artificial Analysis  
**Evidence boundary:** primary research, standards, official visualization documentation, and direct inspection of public Artificial Analysis pages. No private or premium-only surfaces were audited.

## Result

An effective interactive visualization is a decision interface, not a decorated chart. It should help a defined reader answer a defined question, preserve truthful relationships, make the default view useful, and permit deeper exploration without hiding scope, units, provenance, uncertainty, or exclusions.

The strongest reusable pattern found on Artificial Analysis is a layered chart shell:

1. State the metric, unit, direction of desirability, and methodology.
2. Show a curated default subset and its coverage, such as `27 of 597 models`.
3. Keep entity selection separate from semantic filters.
4. Offer view changes as tabs when the analytical question changes.
5. Use legends as reversible series controls.
6. Add chart-specific analytical aids such as a reference line, target quadrant, confidence interval, component stack, or Pareto frontier.
7. Put appearance controls in a secondary display-settings panel.
8. Provide share and export actions beside the chart.
9. Put definitions and caveats immediately below the visualization.
10. Retain an exact table or download path for verification.

This pattern is worth adopting. Its main risk is control density. Controls must be grouped by effect, have visible state, support keyboard use, expose a reset, and distinguish filtering data from changing only its presentation.

## The seven-question design sequence

| Order | Question | Deliverable | Failure prevented |
|---:|---|---|---|
| 1 | Who decides, and what decision follows? | Audience and decision statement | Attractive but irrelevant chart |
| 2 | What comparison or lookup must be made? | Task: lookup, rank, change, distribution, relationship, composition, geography, flow, hierarchy, process | Wrong chart family |
| 3 | What is each field? | Typed dimensions, measures, units, periods, status, provenance, coverage | Invalid aggregation or scale |
| 4 | Which visual channel carries the main fact? | Primary encoding, usually common-position or length | Imprecise angle, area, or color comparison |
| 5 | What must the default view reveal? | Useful initial subset, sort, domain, annotation, and baseline | Empty canvas or filter-first burden |
| 6 | Which interactions answer a real follow-up? | Filter, select, compare, brush, zoom, drill, export, or explain | Feature accumulation |
| 7 | How will it be verified? | Data table, source note, accessibility test, interaction-state tests, and screenshots | Silent distortion or broken controls |

The task framing follows Brehmer and Munzner's distinction between why a visualization is used, how the user acts, and what data is involved. The interaction model also aligns with Heer and Shneiderman's categories of data and view specification, view manipulation, and process/provenance. See [methodology and sources](05-methodology-and-sources.md).

## Non-negotiable defaults

- Use a chart only when it reveals a relationship faster than prose or a compact table.
- Prefer position on a shared scale, then length, before angle, area, volume, or color intensity for precise quantitative comparison. This is consistent with Cleveland and McGill's graphical-perception experiments.
- Use zero baselines for ordinary bars because bar length encodes magnitude. If a non-zero baseline is essential, expose and explain it.
- Sort categorical comparisons meaningfully. Default to descending rank, natural sequence, or domain order.
- Show units in the title, axis, header, or metric label. Never make readers infer them.
- State whether higher or lower is better when the direction is not universal.
- Preserve missing, unavailable, and not-applicable states. Never render them as zero.
- Show uncertainty when it can change a conclusion. Use intervals, bands, distributions, samples, or scenario views appropriate to the evidence.
- Do not use color alone. Pair it with labels, shapes, line styles, position, or icons.
- Give every interaction a visible state and a predictable way to clear or reset it.
- Keep tooltips supplemental. Material facts must survive keyboard-only use, touch, export, and static capture.
- Provide a text summary and an exact-data alternative for complex charts.
- Test the empty, loading, partial, no-result, error, and stale-data states, not only the ideal state.

## Chart-choice shortcut

| If the reader needs to… | Start with… | Consider when needed | Usually avoid |
|---|---|---|---|
| Look up exact values | Table | KPI card, heatmap, sparkline column | Dense labels inside a chart |
| Rank categories | Sorted horizontal bar | Dot plot, lollipop, bullet | Pie with many slices |
| Compare two points in time | Slope or dumbbell | Grouped bar | Two unrelated dashboards |
| Follow change over time | Line | Step, area, small multiples, horizon | Category-colored spaghetti |
| Understand a distribution | Histogram plus ECDF or boxplot | Violin, strip, beeswarm, ridgeline | Mean-only bar |
| Relate two measures | Scatter | Bubble, hexbin, 2D density, regression | Dual-axis line without a shared causal story |
| Show part-to-whole | Stacked bar or 100% stacked bar | Treemap, waffle, pie for few stable parts | Many-slice donut |
| Find efficient trade-offs | Scatter with desired region and Pareto frontier | Labeled shortlist, filters | Composite score without components |
| Show flow | Sankey/alluvial | Chord, flow map, parallel sets | Flow width without totals or direction |
| Show hierarchy | Tree or treemap | Icicle, sunburst, dendrogram | Unlabeled radial hierarchy |
| Show geography | Choropleth for rates, proportional symbols for totals | Dot density, contours, flow map | Raw totals in choropleth regions |
| Show uncertainty | Interval/error bar, band, boxplot | Fan chart, quantile dotplot, hypothetical outcomes | Invisible error or decorative transparency |

## Interaction budget

Every control should answer a named question.

| Control | User question | Required behavior |
|---|---|---|
| Entity selector | Which items are in the comparison? | Search, selected count, clear, select all where safe, restore default |
| Semantic filter | Which data qualifies? | Group by dimension, show active values, announce result count |
| Tab/view switch | Which analytical question am I asking? | Preserve compatible selection, change title and explanation |
| Legend toggle | Which series or component matters? | Toggle visibly, retain at least one series or explain empty view |
| Sort | What is highest, lowest, newest, or closest? | Visible direction, deterministic ties, unavailable values last |
| Brush/range | Which interval or region matters? | Keyboard alternative, clear action, linked-view feedback |
| Zoom/pan | Where is local detail? | Bounded domain, reset/overview, readable axes after transform |
| Display setting | How should the same data be drawn? | Separate from data filters, safe defaults, reset |
| Compare/add provider | What alternate implementation should join? | Distinguish model from model-provider endpoint |
| Share/export | How do I reproduce or reuse this view? | Encode state or state limitations; export title, units, legend, and source |

## Definition of done

A visualization is ready when:

- Its question can be stated in one sentence.
- The default view answers that question without interaction.
- The chart family matches the analytical task and data type.
- Baseline, scale, aggregation, sorting, missingness, and uncertainty are honest.
- Title, subtitle, units, period, source, coverage, and limitations are present where material.
- Controls are minimal, grouped, labeled, keyboard operable, and resettable.
- Selection and filter changes update both the chart and a programmatically available status.
- Hover content also works on focus and satisfies dismissible, hoverable, persistent behavior.
- A table or structured alternative exposes exact values and chart meaning.
- The chart works at narrow width, 200% zoom, dark/light themes, and without color perception.
- Static image/data exports preserve enough context to stand alone.
- Automated tests cover default, changed, empty, and reset states; direct review covers legibility and interpretation.

## Report map

- [Chart taxonomy and selection](01-chart-taxonomy-and-selection.md)
- [Anatomy, controls, interaction, and accessibility](02-anatomy-controls-interaction-accessibility.md)
- [Artificial Analysis visualization and control audit](03-artificial-analysis-audit.md)
- [Glossary](04-glossary.md)
- [Methodology, coverage, limitations, and sources](05-methodology-and-sources.md)

