# Methodology, coverage, limitations, and sources

## Objective and audience

The research supports people designing, building, reviewing, or purchasing interactive data-visualization systems. It aims to provide:

- A practical chart-selection taxonomy.
- Definitions for chart anatomy and interaction.
- Accessibility and verification requirements.
- A dedicated audit of Artificial Analysis' public visualization system.
- Reusable product specifications rather than visual imitation.

## Reporting period and timezone

- Research date: 2026-08-11.
- Browser observation window: 2026-08-11, Europe/Lisbon working session.
- Artifact timestamps: UTC.
- Artificial Analysis content is dynamic. Counts and labels are point-in-time observations.

## Evidence method

### General practice research

Sources were selected in this order:

1. Peer-reviewed primary research.
2. W3C accessibility standards and official guidance.
3. Official visualization-library documentation.
4. First-party product pages and methodology.

Claims were paraphrased. No long source passages were copied. The chart catalog combines primitive mark grammars with conventional statistical, cartographic, network, process, and domain-specific forms. The boundaries between named chart types are not universal.

### Artificial Analysis audit

The audit used direct browser inspection of public desktop pages. For each representative surface, it collected:

- Page title and major section headings.
- Tabs and view switches.
- Button and control labels.
- Entity-selector coverage text.
- Filter-dialog values.
- Table headers and observed row counts.
- Chart-specific explanatory labels such as Pareto line, attractive region, baseline, and boxplot.
- Selected control state semantics such as radio, switch, slider, and combobox.

The audit interacted only with reversible visualization controls and prompt dialogs. It did not submit prompts, votes, subscriptions, or other external writes. It did not download proprietary data. It did not inspect cookies, storage, accounts, private APIs, or internal source code.

## Coverage summary

| Surface | Coverage evidence | Evidence state |
|---|---|---|
| Home analytics | Public homepage, filters, display panel, entity picker | Observed |
| Trends | 6 section headings, 18 chart entity selectors found in DOM | Observed |
| LLM leaderboard | 252 table rows, grouped columns and 5 filter groups | Observed |
| Model detail | 10 major sections and 50 view tabs on one representative model | Observed |
| Coding agents | 8 sections; index, benchmark, token, cost, time views | Observed |
| Image leaderboard | 144 table rows and 8 chart/leaderboard filter controls | Observed |
| Video comparison | 4 sections; bar/scatter/boxplot/time-series families | Observed |
| Text-to-speech leaderboard | 92 table rows; category/accent/openness/personal filters | Observed |
| Speech-to-speech | 7 sections; 30 view tabs; 36-row summary table | Observed |
| Provider detail | Prompt and pricing assumptions; 23-row table | Observed |
| Image/video arenas | Mode, prompt, vote/player and keyboard controls | Observed |
| Every individual entity/provider route | Reused system inferred from representative pages; not crawled exhaustively | Inferred, partial coverage |
| Premium/authenticated visualizations | Not accessed | Unavailable, excluded |
| Mobile and tablet layouts | Not systematically tested | Unavailable, excluded |
| Internal implementation/library choices | Not inspected | Unavailable, excluded |

## Material limitations

- The phrase “all chart types” has no closed universal definition. The catalog covers a broad practical set of statistical, temporal, distributional, relational, compositional, hierarchical, network, flow, geographic, process, and specialized analytical forms.
- Artificial Analysis changes frequently. Metric versions, model counts, route structure, filters, and controls can change after 2026-08-11.
- The audit covers representative public pages, not every model, provider, evaluation, comparison route, or premium chart.
- DOM labels establish the presence and semantics of controls, but do not fully prove keyboard, screen-reader, touch, mobile, export-file, or cross-browser quality.
- No Artificial Analysis source code or internal state model was inspected. The proposed state schema is an inference from visible behavior.
- Chart recommendations are context-sensitive defaults. Domain standards, risk, audience, and evidence may justify another form.
- Accessibility conformance requires a formal evaluation of the implemented product. This report is a design and test contract, not a certification.

## Primary research and standards

| Source | Contribution |
|---|---|
| [Cleveland & McGill, Graphical Perception](https://doi.org/10.1080/01621459.1984.10478080) | Experimental basis for accuracy differences among elementary visual encodings |
| [Brehmer & Munzner, Multi-Level Typology of Abstract Visualization Tasks](https://www.cs.ubc.ca/labs/imager/tr/2013/MultiLevelTaskTypology/) | Why/how/what task framing and task sequences |
| [Heer & Shneiderman, Interactive Dynamics for Visual Analysis](https://idl.uw.edu/papers/interactive-dynamics) | Interaction taxonomy spanning data/view specification, view manipulation, and process/provenance |
| [Heer & Robertson, Animated Transitions](https://idl.uw.edu/papers/animated-transitions) | Evidence and design principles for staged transitions supporting object constancy |
| [Correll, Moritz & Heer, Value-Suppressing Uncertainty Palettes](https://idl.uw.edu/papers/uncertainty-palettes) | Limits of independent bivariate value/uncertainty color and an alternative design |
| [Hullman et al., In Pursuit of Error](https://idl.uw.edu/papers/uncertainty-eval-survey) | Survey of uncertainty-visualization evaluation practice |
| [ColorBrewer 2.0](https://colorbrewer2.org/) | Qualitative, sequential, and diverging cartographic palette guidance |
| [WCAG 2.2](https://www.w3.org/TR/WCAG22/) | Normative web accessibility requirements |
| [W3C Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color) | Redundant non-color cues |
| [W3C Content on Hover or Focus](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html) | Dismissible, hoverable, persistent transient content |
| [W3C Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value) | Programmatic semantics for controls |
| [W3C Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) | Announcing asynchronous results without moving focus |
| [W3C Complex Images](https://www.w3.org/WAI/tutorials/images/complex/) | Short and structured long descriptions for charts |
| [W3C Tables Tutorial](https://www.w3.org/WAI/tutorials/tables/) | Semantic table headers and associations |

## Official visualization documentation

| Source | Contribution |
|---|---|
| [Vega-Lite marks](https://vega.github.io/vega-lite/docs/mark.html) | Primitive and composite mark vocabulary |
| [Vega-Lite encodings](https://vega.github.io/vega-lite/docs/encoding.html) | Position, mark-property, text, tooltip, order, detail, and facet channels |
| [Vega-Lite scales](https://vega.github.io/vega-lite/docs/scale.html) | Continuous, discrete, discretizing, time, log, symlog, and color scales |
| [Vega-Lite axes](https://vega.github.io/vega-lite/docs/axis.html) | Axis anatomy and customization |
| [Vega-Lite legends](https://vega.github.io/vega-lite/docs/legend.html) | Legend interpretation for non-positional scales |
| [Vega-Lite selections](https://vega.github.io/vega-lite/docs/selection.html) | Point and interval selection semantics |
| [Vega-Lite parameter binding](https://vega.github.io/vega-lite/docs/bind.html) | Input-, legend-, and scale-bound interaction |
| [Vega-Lite tooltips](https://vega.github.io/vega-lite/docs/tooltip.html) | On-demand details and tooltip channels |
| [D3 zoom](https://d3js.org/d3-zoom) | Pan/zoom behavior and focus + context composition |
| [D3 axis](https://d3js.org/d3-axis) | Human-readable scale reference marks |

## Artificial Analysis sources

| Source | Audit use |
|---|---|
| [Artificial Analysis home](https://artificialanalysis.ai/) | Reusable chart shell, ranking, cost, trade-off, trend, provider visualizations |
| [AI Trends](https://artificialanalysis.ai/trends) | Progress, efficiency, country, openness, architecture, training chart inventory |
| [LLM Leaderboard](https://artificialanalysis.ai/leaderboards/models) | Dense table, search, facets, grouped columns |
| [Claude Opus 5 detail](https://artificialanalysis.ai/models/claude-opus-5) | Representative model dashboard and view-tab inventory |
| [Coding Agents](https://artificialanalysis.ai/agents/coding-agents) | Model/agent grouping, benchmark, token, cost, time controls |
| [Text-to-Image Leaderboard](https://artificialanalysis.ai/image/leaderboard/text-to-image) | Elo, confidence interval, sample count, media filters |
| [Video Model Comparisons](https://artificialanalysis.ai/video/models) | Quality/price/time trade-offs, boxplot, over-time views |
| [Video Methodology](https://artificialanalysis.ai/video/methodology) | Modality-specific Elo pools and performance measurement definitions |
| [Text-to-Speech Leaderboard](https://artificialanalysis.ai/text-to-speech/leaderboard) | Category, accent, openness, personal/global, voice controls |
| [Speech-to-Speech Analysis](https://artificialanalysis.ai/speech-to-speech/) | Index, dataset/domain/category, cost/speed, summary table |
| [CoreWeave provider detail](https://artificialanalysis.ai/providers/coreweave) | Prompt options and blended price presets |
| [Image Arena](https://artificialanalysis.ai/embed/text-to-image-leaderboard/arena) | Blind pairwise image workflow and modes |
| [Video Arena](https://artificialanalysis.ai/embed/text-to-video-leaderboard/arena) | Audio/modality/player/keyboard workflow |

## Reproducibility checklist

To repeat the audit:

1. Record date, timezone, viewport, logged-in/public state, and page URL.
2. Inspect one page from each surface in the coverage table.
3. Record headings, view tabs, coverage selectors, filters, display settings, legends, exports, tables, and method notes.
4. Exercise entity selection, one semantic filter, one view tab, legend toggle, display setting, and reset.
5. Verify chart title, units, direction, values, and table/download remain consistent after each change.
6. Repeat with keyboard only, at 200% zoom, narrow width, reduced motion, and a screen reader.
7. Capture differences from this 2026-08-11 baseline rather than treating them as defects automatically.

