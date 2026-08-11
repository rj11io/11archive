# Artificial Analysis visualization and control audit

**Observed:** 2026-08-11  
**Method:** direct browser inspection of public desktop pages plus official page text and methodology. Dynamic content is a point-in-time observation and may change. Premium-only and authenticated surfaces were excluded.

## 1. Result

Artificial Analysis uses a highly reusable visualization system rather than a collection of unrelated charts. Across audited pages, the stable chart shell is:

```text
section navigation
  → metric/view tabs
    → chart title + definition + directionality
      → copy link | image export | data export
      → entity selector + coverage count
      → semantic filters
      → chart display settings
      → chart-specific controls and legend toggles
      → interactive SVG/application
      → expandable definitions, methodology, caveats
```

The product's strongest design decision is separation of concerns:

- **View tabs** change the analytical question.
- **Entity selectors** change which models/providers/categories are compared.
- **Filters** change eligibility by semantic attributes.
- **Legends** toggle series/components.
- **Display settings** change labels, ticks, and analytical overlays.
- **Prompt or pricing presets** change measurement assumptions.
- **Share/download actions** turn the view into a portable artifact.

This enables one chart location to support ranking, decomposition, trade-off, trend, variance, and provider-specific questions without duplicating the page.

## 2. Audited surface coverage

| Surface | Public URL inspected | Distinct evidence collected |
|---|---|---|
| Home analytics | [artificialanalysis.ai](https://artificialanalysis.ai/) | Cross-domain chart shell; ranking, stacked cost, scatter/Pareto, trends, filters, display settings |
| AI Trends | [trends](https://artificialanalysis.ai/trends) | 6 sections; 18 visible entity selectors; time series, bands, rankings, scatter, size/architecture analysis |
| LLM leaderboard | [leaderboards/models](https://artificialanalysis.ai/leaderboards/models) | 252-row dense table; search, facet filters, column groups, expandable columns |
| Model detail | [Claude Opus 5 example](https://artificialanalysis.ai/models/claude-opus-5) | 10 major sections; 50 view tabs; compare control; breakdown, variance, time, price, latency |
| Coding agents | [agents/coding-agents](https://artificialanalysis.ai/agents/coding-agents) | Index, benchmark breakdown, token/cost distributions, time/turns; `Color by` radio |
| Image leaderboard | [image/leaderboard/text-to-image](https://artificialanalysis.ai/image/leaderboard/text-to-image) | 144-row Elo table; CI, samples, category/status/openness/ranking filters |
| Video comparison | [video/models](https://artificialanalysis.ai/video/models) | Quality, price, generation time, trade-offs, boxplot, time series; modality/audio tabs |
| Image arena | [embedded image arena](https://artificialanalysis.ai/embed/text-to-image-leaderboard/arena) | Blind pairwise vote workflow; prompt submission; generation/editing modes |
| Video arena | [embedded video arena](https://artificialanalysis.ai/embed/text-to-video-leaderboard/arena) | Audio/no-audio and modality modes; voting and player keyboard shortcuts |
| Text-to-speech leaderboard | [text-to-speech/leaderboard](https://artificialanalysis.ai/text-to-speech/leaderboard) | 92-row Elo table; category, accent, openness, global/personal, creator filters |
| Speech-to-speech | [speech-to-speech](https://artificialanalysis.ai/speech-to-speech/) | Index, dataset/domain/category breakdown, cost/speed trade-offs, 36-row metric table |
| Provider detail | [CoreWeave example](https://artificialanalysis.ai/providers/coreweave) | Prompt options, blended-price presets, intelligence/price/speed/latency/time tabs, 23-row table |

Coverage is representative of every major public visualization product family found in the main navigation. It is not an exhaustive crawl of every entity detail page or every provider because those pages reuse the same chart system with different data.

## 3. Visualization types observed

| Observed form | Artificial Analysis use | Supporting controls | Design lesson |
|---|---|---|---|
| Ranked horizontal bar | Intelligence, output speed, cost, evaluation scores, Elo | Entity picker, filters, label/tick settings, link/export | Long model labels and clear higher/lower direction fit horizontal ranking |
| Grouped bar | Multiple metrics or datasets per model | Metric tabs, model/agent color switch, legend buttons | Group only a few series; let tabs carry alternate questions |
| Stacked bar | Cost/token components, openness components | Component legend toggles | Components remain reversible and definitions sit below |
| 100%/normalized comparison | Dataset/category contribution and index components | Dataset/category tabs, legend | Make denominator and inclusion rule explicit |
| Scatter/trade-off plot | Intelligence vs cost/time/tokens/speed; quality vs price/time; provider performance | Entity picker, filters, creator/provider legend, desired region, Pareto line, labels | Encode desirability spatially and explain the efficient frontier |
| Time-series line | Frontier intelligence, capex, speed/latency/generation time over time | Creator/range picker, legend toggles, display settings | Use selectors to control line count and definitions to explain aggregation window |
| Band/range chart | Prompt-type or performance variation over time | Prompt options, metric tabs | Pair distributions/ranges with median definition and measurement window |
| Boxplot | Video API generation-time variance | Entity picker, provider add, explanatory `Boxplot` note | Strong complement to median rankings |
| Confidence interval/range | Elo leaderboards and endpoint accuracy | Table CI column, reference classification | Uncertainty remains visible beside rank |
| Reference/threshold overlay | Human baseline, reference endpoint 100%, target/attractive region | Display/legend switches | Explain whether the line is target, baseline, or statistical reference |
| Pareto frontier | Cost/quality, price/speed, time/quality trade-offs | Display switch plus `Most attractive quadrant/region` | A calculated overlay can turn scatter exploration into decision support |
| Dense comparison table | Model/provider leaderboards and metric summaries | Text search, facet buttons, grouped columns, column expansion | Exact values remain available beside charts |
| KPI/highlight cards | Home intelligence/speed/cost summary | Linked to deeper sections | Provide fast orientation before exploration |
| Arena pairwise comparison | Image/video/speech preference evaluation | Prompt, mode, vote, keyboard shortcuts, reveal | Interaction is the data-collection method, not only presentation |

No Sankey, chord, geographic map, tree, or network visualization was observed in the audited public surfaces. Country analysis used categorical comparison/time views, not a geographic map.

## 4. Common chart toolbar

### 4.1 Share and export

Observed beside most charts:

- `Copy link to this section`
- `Download chart as image`
- `Download data`

Some provider-accuracy charts omitted data download in the inspected state. The placement is effective because exports are tied to the chart they describe. A robust implementation should include active filters, selected entities, units, metric version, and data-as-of metadata in both image and data exports.

### 4.2 Entity selector

Observed label pattern: `27 of 597 models`, `14 of 57 model creators`, `7 of 7 ranges`, `15 of 15 providers`.

The inspected model selector provided:

- Search input.
- Curated default selection.
- Long virtualized/listbox-style inventory.
- `Clear`.
- `Select all`.
- `Reset (to default)`.

This is a particularly good pattern. `Clear` and `Reset` are not synonyms. Reset restores the editorially useful view; clear supports deliberate empty/zero-state exploration.

### 4.3 Semantic filters

The home Intelligence chart exposed a dedicated `Filters` panel:

| Group | Values observed |
|---|---|
| Open Weights | Open Source; Proprietary |
| Size Class | Tiny; Small; Medium; Large |
| Reasoning | Reasoning; Non Reasoning |
| Input Modality | Image; Speech; Video |

The LLM leaderboard used compact facet buttons:

| Filter | Values observed |
|---|---|
| Weights | Open; Proprietary |
| Size | Tiny `<4B`; Small `4B–40B`; Medium `40B–150B`; Large `>150B`; Unknown |
| Price | Low `<$0.15/1M tokens`; Medium `$0.15–$1/1M`; High `>$1/1M` |
| Reasoning | Reasoning; Non-Reasoning |
| Status | Current |

The filter values include definitions, not only labels. That reduces interpretation errors. The implementation should preserve the distinction between `open weights`, `open source`, and license restrictions throughout the interface.

### 4.4 Add provider-specific comparison

Charts exposed `Add model from specific provider`. Activating it added a second selector whose observed state read `0 of 862 model & provider combinations`.

This solves an important data-model distinction:

- **Model-level point:** model identity and aggregated/first-party performance.
- **Endpoint-level point:** a specific model served by a specific provider and configuration.

The distinction should stay visible in label, tooltip, export, and URL state. Otherwise users may compare model capability with endpoint performance as if they were the same entity.

### 4.5 Display settings

The inspected `Display` panel contained:

| Setting | Observed control/state |
|---|---|
| Label size | Slider, 9–13 px, current 11 px |
| Bar ticks | Switch, on |
| Scatter labels | Switch, on |
| Pareto line | Switch, on |

The panel is global enough to expose settings that may not affect the current mark type. This simplifies consistency but can create irrelevant controls. Recommended fix: disable or hide inapplicable options while keeping the panel order stable, and explain whether a setting is per chart, per page, or global.

### 4.6 Legend as filter

Legends were rendered as buttons for:

- Creators/providers, such as Anthropic, OpenAI, Google, Meta, Kimi, DeepSeek.
- Cost/token components: Answer, Reasoning, Cache Write, Cache Hit/Read, Input, Output.
- License categories: Proprietary, Open Weights, Commercial Use Restricted.
- Reference classes: Reference 100%, Within reference, Below reference.
- Countries, architecture types, index bands, and other groups.

Interactive legends reduce control duplication. Requirements:

- Show pressed/selected state programmatically.
- Do not rely on opacity alone.
- Prevent an unexplained blank plot when all series are off.
- Keep color assignment stable across charts and tabs.

## 5. Page-specific controls

### 5.1 AI Trends

The Trends page used section navigation for `AI Progress`, `Efficiency`, `Country Analysis`, `Open Source Models`, `Model Architecture`, and `Training Analysis`. Observed view families included:

- Frontier Intelligence over time.
- Capital expenditure by company over time.
- Intelligence versus release date.
- Leading models by lab/country.
- Price and output speed by Intelligence Index band over time.
- Open-weights versus proprietary progress.
- Dense versus mixture-of-experts architecture.
- Total versus active parameters.
- Context length by quarter.
- Training tokens and intelligence relationships.

The strong pattern is progressive thematic navigation with a stable chart toolbar. Risk: the page is very long and contains many selectors. Recommended fix: retain sticky section navigation, deep links, and active-filter summaries; lazy-load charts without shifting the page.

### 5.2 LLM leaderboard

Observed controls:

- Text search: `Filter, e.g. GPT, Meta`.
- `Expand columns`.
- Weights, size, price, reasoning, and status filters.
- Grouped column buttons: Features, Intelligence, Price, Speed, Latency, End-to-End Response Time.
- Sortable-looking header controls for Model, Context Window, Creator, Intelligence Index, Cost per Task, Tokens/s, First Chunk, and Total Response.
- Expandable method notes.

The table preserves a full exact-value surface. Recommended improvements:

- Make sort state explicit through `aria-sort`.
- Keep the Model identity column sticky during horizontal scroll.
- Announce filter result count.
- Define whether `Expand columns` changes only visibility or also downloads.

### 5.3 Model and provider detail pages

These pages are small dashboards generated from the same system. Observed view tabs included:

- Intelligence Index and benchmark/evaluation breakdowns.
- Intelligence versus cost, time, output tokens, output speed, response time, context window, parameters, or training tokens.
- Cost per task, total evaluation cost, cache/input/output pricing, blended price, stacked price, cache discount, log/inverted price.
- Output speed, speed by prompt type, variance, over time, and speed versus price/latency.
- Time to first answer token versus time to first token.
- Latency by prompt type, variance, and over time.
- End-to-end response time, prompt-type breakdown, price trade-off, and over time.

Provider pages added a global `Prompt Options` panel:

| Group | Options observed |
|---|---|
| Parallel Queries | Single; Multiple (1k tokens only) |
| Prompt Length | 1k tokens; 10k tokens; 100k |
| Action | Apply |

Blended price had presets:

| Ratio | Label |
|---|---|
| 7:2:1 | General agentic (recommended) |
| 3:1 | General chat |
| 0:1:1 | General translation |
| 100:1:1 | Long-context Q&A |
| 0:100:1 | Long-context summarization |

This is excellent domain-specific interaction: assumptions are visible and named by use case. The chart must repeat the selected ratio in title/subtitle/export so it cannot be separated from its calculation.

### 5.4 Coding agents

Observed:

- Product tabs: Coding Agents, General Work, Chatbots, Presentations, OCR, Data Analysis, Customer Support.
- Analysis tabs: Index, Score by Benchmark, individual benchmarks.
- Token tabs: usage, distribution, cache-hit rate, input/output, by benchmark.
- Cost tabs: Cost to Run, Cost Distribution, Total Cost.
- Execution tabs: Execution Time, Turns.
- Repeated `Color by` radio group: Model or Agent.
- Model selector/coverage count.
- Trade-off scatters with attractive quadrant and Pareto line.

The `Color by` control is clearer than a generic legend because it changes the grouping dimension. Preserve that semantic distinction in state and telemetry.

### 5.5 Image, video, and speech leaderboards

Common leaderboard columns:

- Rank and rank range.
- Creator.
- Model.
- Elo.
- 95% confidence interval.
- Sample/comparison count.
- Release date.
- API price.

Image-specific controls observed:

- Category.
- Current models versus all models.
- All, open weights, first-party foundation models.
- Ranked models versus include unranked.
- Global versus personal leaderboard.

Text-to-speech controls observed:

- Category: All, with documented Knowledge Sharing, Assistants, Entertainment, Customer Service categories.
- Accent: All, with US and UK documented.
- All versus open weights.
- Global versus personal leaderboard.
- All models versus top models by creator.
- Per-model voice-count buttons.

Video comparison controls observed:

- Modality: Text to Video, Image to Video, Video Editing.
- Audio state: with audio or no audio variants.
- Model-level versus provider/API-level sections.
- Quality, generation time, and price views.
- Quality versus price/time and time versus price trade-offs.
- Generation-time variance boxplot and over-time view.

Artificial Analysis' video methodology states that modalities have separate Elo pools and that generation-time results use trailing measurements with median and percentile summaries: [video methodology](https://artificialanalysis.ai/video/methodology).

### 5.6 Speech-to-speech

Observed view controls:

- Index versus Index by Dataset.
- Speech Reasoning versus relationship/size views.
- Open-source/proprietary/all buttons.
- Agentic domains: All, Airline, Retail, Telecom.
- Conversational categories: Interruption Handling, Backchannel Handling, Pause Handling, Turn Taking.
- Cost trade-offs for index, reasoning, conversational dynamics, and agentic performance.
- Speed trade-offs.
- Cost measures: per hour, per task, input price, output price.
- Timing measures: time to first audio and conversation audio duration.

The summary table joined quality, cost, and speed measures. This is the exact-value complement to the charts and should remain filtered in sync.

### 5.7 Arenas

Image Arena controls observed:

- Image Arena / Text to Image Leaderboard / Image Editing Leaderboard tabs.
- Submit a prompt.
- Text to Image versus Image Editing.
- Blind preference vote to reveal identities.

Video Arena controls observed:

- Video Arena / Text to Video / Image to Video / Video Editing leaderboards.
- Submit a prompt.
- With Audio versus No Audio.
- Text to Video, Image to Video, Video Editing.
- Keyboard shortcuts for preference, play/pause, player toggle, and restart.

The prompt dialog required text input, displayed `Min: 0/50`, and offered Submit/Close. A robust design should associate the minimum with the textarea, announce remaining characters, preserve draft on accidental close, and never activate character shortcuts while the user is typing.

## 6. What Artificial Analysis does especially well

1. **Metric direction is explicit.** `Higher is better` and `Lower is better` appear near titles.
2. **Coverage is visible.** Selectors show selected and eligible counts.
3. **One shell supports many domains.** Users learn the control grammar once.
4. **Trade-offs are spatially interpreted.** Attractive regions and Pareto frontiers aid decisions.
5. **Exact data is nearby.** Tables and downloads support auditability.
6. **Definitions follow the chart.** Expandable notes explain metrics and methods.
7. **Domain assumptions become presets.** Prompt length and pricing blends are named by use case.
8. **Uncertainty accompanies rankings.** Media/speech leaderboards expose confidence intervals and sample counts.
9. **Model versus endpoint is modeled separately.** Provider-specific additions prevent false equivalence.
10. **Tabs change analytical questions without losing page context.** This supports deep exploration.

## 7. Risks and concrete fixes

| Risk observed or inferred | Why it matters | Suggested fix |
|---|---|---|
| Very dense control bars | New users may not know which control changes data versus appearance | Visually group `Entities`, `Filters`, `View`, `Display`, `Export`; add short labels/tooltips |
| Display panel exposes inapplicable settings | Irrelevant switches reduce trust | Hide/disable by chart type and explain scope |
| Icon-only toolbar actions | Meaning can be hard to discover | Keep accessible names and add persistent text on wide layouts |
| Interactive legend buttons | Selection state may be unclear | Use `aria-pressed`, check marks, and text count; include reset |
| Very long entity lists | Search and keyboard traversal can become expensive | Virtualize carefully, retain accessible count/position, add creator grouping |
| Many tabs on detail pages | Horizontal overflow and discoverability risk | Use scroll buttons, overflow menu, and deep-linkable selected state |
| Attractive quadrant/frontier could appear normative | desirability depends on use case and axis direction | Label assumptions and let users switch metric/weights |
| Curated default subset can appear complete | Readers may not notice hidden models | Keep coverage count adjacent, explain default rule, preserve counterexamples |
| Downloaded image can lose interactive context | Screenshot may omit filters and method notes | Render active filters, timestamp, units, method version, and source into export |
| Shortcuts in arena | Keys can conflict with text input or assistive tech | Scope shortcuts outside fields, offer disable/remap, list them, respect WCAG 2.1.4 |
| Chart applications may expose many graphic elements | Screen-reader experience can become verbose or opaque | Provide concise chart summary plus synchronized semantic table and focused mark navigation only when useful |
| Personal/global leaderboard switch | Personal state can be misread as global evidence | Label population and sample count prominently |

## 8. Reusable product specification

Adopt this order for an Artificial Analysis-inspired chart module:

```text
Title                              [copy] [image] [data]
Metric definition · unit · period · higher/lower is better

[view tabs]
[entities: 12 of 250] [filters: 2 active] [assumption preset] [display]
[active-filter chips]                                      [reset]

chart
legend buttons / direct labels

status: 12 selected · 238 excluded · data as of …
definitions and methodology disclosures
exact-data table
```

Required state schema:

```json
{
  "section": "performance",
  "view": "quality-vs-price",
  "entityType": "model-provider-endpoint",
  "selectedIds": [],
  "filters": {},
  "assumptions": { "promptTokens": 10000, "priceBlend": "7:2:1" },
  "display": { "labelPx": 11, "barTicks": true, "scatterLabels": true, "pareto": true },
  "sort": { "field": "quality", "direction": "descending" },
  "meta": { "metricVersion": "…", "dataAsOf": "…" }
}
```

This schema is inferred from the observed interface. It is not an Artificial Analysis internal implementation claim.

