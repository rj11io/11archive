# Chart taxonomy and selection

This is a practical catalog, not a claim that every named chart is fundamentally unique. Many chart names are compositions of primitive **marks** such as points, bars, lines, areas, rectangles, rules, and text. Vega-Lite formalizes those primitives and adds composite boxplot, error-band, and error-bar marks. Selection should begin with the reader's task and the data's semantics, not the novelty of a form.

## 1. Exact lookup, status, and summary

| Form | Definition | Best for | Avoid or qualify when |
|---|---|---|---|
| Data table | Values arranged in rows and columns with semantic headers | Exact lookup; dense multi-metric comparison | A visual pattern matters more than individual cells |
| Pivot table | Table aggregating measures across row and column dimensions | Cross-tabulation and slice-and-dice | Aggregation hides material record-level variation |
| KPI card | One prominent value with label, unit, period, and optional delta | Monitoring a small set of decision metrics | Many metrics create a wall of unrelated numbers |
| Scorecard | Structured set of KPIs with targets and status | Balanced operational monitoring | Thresholds are arbitrary or status is color-only |
| Sparkline | Tiny axis-light line or bar embedded in text or a table | Compact trend context beside exact values | Exact scale, uncertainty, or event timing matters |
| Bullet chart | Measure against qualitative ranges and a target marker | Actual versus target with compact context | Ranges are not meaningful or comparable |
| Gauge | Value on a bounded radial or linear scale | Familiar single-value status with hard bounds | Precise comparison, many gauges, or changing domains |

## 2. Comparison and ranking

| Form | Definition | Best for | Avoid or qualify when |
|---|---|---|---|
| Horizontal bar | Category position plus bar length on a common scale | Ranked categories and long labels | Baseline cannot reasonably include zero |
| Vertical bar/column | Categories on x, magnitude as vertical length | Short labels, time buckets, few categories | Many categories or long names |
| Grouped bar | Side-by-side bars for categories and series | A few series compared within groups | More than roughly 3–4 series or tiny differences |
| Stacked bar | Components stacked to form totals | Total plus broad composition | Interior segments require precise comparison |
| 100% stacked bar | Components normalized to 100% | Composition across groups | Absolute totals also matter but are hidden |
| Diverging bar | Bars extend from a meaningful center, often zero | Positive/negative or agreement/disagreement | Center is arbitrary or scales are asymmetric without notice |
| Dot plot | Points on a common quantitative scale by category | Dense, precise ranking with less ink | Readers expect a zero-baseline magnitude metaphor |
| Lollipop chart | Dot plus stem from baseline | Sparse ranked comparison | Stems add decoration without improving reading |
| Cleveland dot plot | One or more aligned dots per category | Compact multi-series comparison | Too many series cause association errors |
| Dumbbell chart | Two dots connected per category | Before/after or two-condition difference | More than two states or connection implies continuity incorrectly |
| Slopegraph | Lines connect values at two ordered times/states | Direction and magnitude of change | Lines cross excessively or endpoints are crowded |
| Bump chart | Lines show rank changing over time | Rank trajectories | Absolute values matter more than rank |
| Pareto chart | Bars sorted descending plus cumulative-percentage line | Concentration and the “vital few” | Dual scales are not clearly separated and labeled |
| Pictogram/isotype | Repeated icons represent counts or proportions | Low-density public communication | Fractional icons or precision is important |

## 3. Time and change

| Form | Definition | Best for | Avoid or qualify when |
|---|---|---|---|
| Line chart | Ordered points connected to show continuous change | Time series and ordered sequences | Categories are unordered or missing intervals are bridged silently |
| Multi-series line | Several series on one shared time axis | Comparing a small number of trajectories | Too many lines produce spaghetti; use highlight or small multiples |
| Step chart | Values remain constant between change points | Inventory, rates, states, policy levels | Interpolation is actually continuous |
| Area chart | Line with filled area to a baseline | Single series where magnitude and accumulation matter | Truncated baseline exaggerates area |
| Stacked area | Multiple areas sum to a time-varying total | Composition and total over time | Interior series must be compared precisely |
| Streamgraph | Stacked areas around a shifting centerline | Broad composition patterns with many series | Exact values, baseline, or accessibility is important |
| Horizon chart | Folded and color-banded area chart | Many compact time series at equal scale | Readers lack training or color resolution is poor |
| Small-multiple line | Same chart repeated by group with aligned scales | Many trajectories without overlap | Panels use incompatible scales without clear notice |
| Connected scatterplot | A path connects bivariate points in order | Coupled evolution of two measures | Direction/order is not strongly annotated |
| Timeline | Events positioned along time | Sequence, milestones, releases | Dense simultaneous events need lanes or grouping |
| Gantt chart | Task intervals placed on a time axis | Schedules, dependencies, progress | Uncertainty and resource constraints are omitted |
| Calendar heatmap | Color cells arranged by calendar position | Daily seasonality and anomalies | Exact values or non-daily periods matter |
| Candlestick/OHLC | Open, high, low, close per interval | Financial range and direction | Non-specialist audience or volume is the main story |
| Control chart | Time series with process center and control limits | Detecting special-cause process variation | Limits are confused with targets or confidence intervals |
| Fan chart | Nested uncertainty bands widen through time | Forecast distributions | Bands are unlabeled or treated as deterministic boundaries |

## 4. Distribution and uncertainty

| Form | Definition | Best for | Avoid or qualify when |
|---|---|---|---|
| Histogram | Counts or density within numeric bins | Distribution shape | Bin width is arbitrary and sensitivity is hidden |
| Frequency polygon | Lines connect histogram-bin frequencies | Comparing several distributions | Sparse samples create misleading smoothness |
| KDE/density plot | Smoothed estimate of a continuous distribution | Shape comparison with adequate samples | Bandwidth choice is undisclosed or bounded data leaks outside range |
| ECDF | Cumulative share at or below each value | Full distribution and percentile lookup | Audience cannot interpret cumulative probability |
| Boxplot | Median, quartiles, whiskers, and possible outliers | Compact comparison of many distributions | Multimodality or sample size matters |
| Violin plot | Mirrored density by group | Distribution shape across groups | Small samples or bandwidth artifacts |
| Strip/jitter plot | Individual observations displaced to reduce overlap | Small-to-medium samples and raw variation | Very large samples overplot |
| Beeswarm | Individual points packed without overlap | Exact sample distribution at moderate size | Packing implies a density scale readers may overinterpret |
| Ridgeline | Multiple density curves vertically offset | Distribution change across ordered groups | Overlap conceals baselines or too many groups |
| Raincloud | Density, box summary, and raw points together | Rich distribution comparison | Space is limited or layers overwhelm |
| Q–Q plot | Observed quantiles against theoretical/reference quantiles | Distribution diagnostics | Non-technical readers need direct explanation |
| Error bar | Point estimate plus uncertainty interval | Estimate comparison | Interval type and confidence level are absent |
| Error band | Shaded interval around a line | Time-varying uncertainty | Opacity overlap and missing interval definition |
| Forest plot | Effect estimates and intervals aligned by study/group | Comparative uncertainty and meta-analysis | Heterogeneous measures share an axis without normalization |
| Quantile dotplot | Fixed number of dots represents probability mass | Discrete uncertainty and probability judgments | Too many dots or unexplained sampling metaphor |
| Hypothetical outcome plot | Animation cycles through plausible outcomes | Uncertainty as repeated possible worlds | Motion cannot be paused or compared; static alternative absent |
| Gradient interval | Fading density or confidence along an interval | Continuous uncertainty around an estimate | Gradient is not perceptually calibrated |

## 5. Relationship and correlation

| Form | Definition | Best for | Avoid or qualify when |
|---|---|---|---|
| Scatterplot | One point per observation on two quantitative axes | Correlation, clusters, outliers, trade-offs | Heavy overplotting; aggregate or sample carefully |
| Bubble chart | Scatterplot with area encoding a third measure | Three-variable overview | Area comparison must be precise or sizes dominate |
| Hexbin plot | Counts aggregated into hexagonal spatial bins | Dense bivariate distributions | Binning hides sparse outliers |
| 2D density/contour | Lines or color show density in two dimensions | Dense clusters and distribution shape | Contour thresholds are unexplained |
| Regression plot | Scatterplot plus fitted model and often interval | Trend estimation | Fit suggests causation or model assumptions are hidden |
| Residual plot | Residuals against fit or predictor | Model diagnostics | Readers cannot link residual definition to model |
| Correlogram | Matrix encodes pairwise correlations | Many-variable correlation overview | Correlation is treated as causation or nonlinear relations matter |
| Scatterplot matrix/SPLOM | Grid of pairwise scatterplots | Multivariate relationships | Variable count makes cells unreadable |
| Parallel coordinates | One polyline crosses multiple variable axes | Multivariate profiles and clusters | Axis ordering/scaling is arbitrary or lines overwhelm |
| Radar/spider chart | Radial axes connect a multivariate profile | Familiar profile shape across few normalized measures | Precise comparison, negative values, differing units, many profiles |
| Ternary plot | Position represents three parts summing to a constant | Three-component compositions | Values do not sum to a fixed total |
| Bland–Altman plot | Difference between two methods versus their mean | Agreement between measurement methods | Used as a generic correlation chart |

## 6. Composition and contribution

| Form | Definition | Best for | Avoid or qualify when |
|---|---|---|---|
| Pie chart | Angles/areas encode parts of one whole | Two to five clearly different, non-negative parts | Ranking, close values, many parts, or multiple pies |
| Donut chart | Pie chart with a center hole | Few parts plus a central total label | Hole reduces already imprecise area/angle reading |
| Waffle chart | Grid cells represent proportional units | Simple percentages in public communication | Precision exceeds cell resolution |
| Treemap | Nested rectangles encode hierarchy and magnitude by area | Part-to-whole hierarchy in compact space | Precise sibling comparison or negative values |
| Sunburst | Concentric arcs encode hierarchical levels and area/angle | Compact radial hierarchy | Labels and cross-branch comparison matter |
| Icicle chart | Stacked rectangles encode hierarchical depth and width | Hierarchy with more readable alignment than sunburst | Deep trees become too thin |
| Mosaic plot | Rectangle areas encode contingency-table proportions | Association between categorical variables | Audience is unfamiliar or labels are crowded |
| Marimekko | Variable-width stacked columns encode two dimensions | Market share across differently sized groups | Precise cross-column comparison |
| Waterfall | Sequential positive and negative contributions bridge totals | Explaining change from start to finish | Contributions overlap or order is arbitrary |
| Funnel chart | Stage widths encode remaining volume | Sequential conversion stages | Area exaggerates differences or cohorts are incomparable |
| Population pyramid | Back-to-back bars by ordered group | Two-sided age/demographic composition | Scales differ by side or totals are not comparable |

## 7. Hierarchy, network, and flow

| Form | Definition | Best for | Avoid or qualify when |
|---|---|---|---|
| Node-link graph | Nodes connected by edges | Paths and local topology | Dense graphs become hairballs; use matrix or filtering |
| Adjacency matrix | Rows and columns are nodes; cells encode edges | Dense networks, clusters, exact adjacency | Path tracing is the primary task |
| Force-directed graph | Simulation places connected nodes near each other | Exploratory topology and communities | Position is mistaken for a measured coordinate |
| Arc diagram | Nodes on a line with curved edges | Sequence plus connections | Many crossing arcs obscure counts |
| Chord diagram | Arc sectors are groups; ribbons encode bilateral flow | Compact symmetric relationships | Direction and exact comparison matter |
| Sankey diagram | Flow widths connect staged nodes | Directional magnitude through a process | Cycles, uncertainty, or totals do not conserve |
| Alluvial diagram | Ribbons connect categorical strata across stages | Membership changes and composition | Individual paths are implied from aggregate flows |
| Parallel sets | Categorical counterpart to parallel coordinates | Multistage categorical relationships | Many categories create crossings |
| Tree diagram | Parent-child nodes arranged by depth | Explicit hierarchy and path tracing | Breadth/depth exceeds viewport |
| Dendrogram | Branch lengths show hierarchical clustering | Cluster relationships and merge distances | Branch order is treated as rank |
| Dependency graph | Directed nodes and links show prerequisites | Software, task, or system dependencies | Cycles or edge semantics are unclear |

## 8. Geography and spatial data

| Form | Definition | Best for | Avoid or qualify when |
|---|---|---|---|
| Choropleth | Region fill encodes a normalized value | Rates or ratios by administrative area | Raw counts, unequal populations, or arbitrary class breaks |
| Proportional-symbol map | Symbol area encodes magnitude at locations | Totals and events | Symbols overlap or area is read as radius |
| Dot-density map | Dots represent a fixed quantity within regions | Spatial distribution of counts | Dots imply exact addresses or random placement is undisclosed |
| Cartogram | Region geometry is distorted by a measure | Emphasizing population/weight | Geographic recognition is essential |
| Flow map | Lines/arrows between locations encode movement | Origin-destination patterns | Dense routes and direction ambiguity |
| Hexbin/grid map | Space or regions mapped into equal cells | Reducing area-size bias and showing density | Geographic boundaries/adjacency must be exact |
| Contour/isoline map | Lines connect equal values | Continuous spatial fields and thresholds | Interpolation is unsupported by sampling density |
| Raster/heat map | Cell color encodes a continuous spatial surface | Temperature, elevation, probability | Resolution and interpolation are hidden |
| Isochrone map | Bands show equal travel time/distance | Accessibility and catchment analysis | Routing assumptions and time conditions are absent |
| Bivariate choropleth | Combined color encodes two regional measures | Joint spatial patterns | Legend is too complex or color classes are not separable |

## 9. Process, architecture, and explanatory diagrams

| Form | Definition | Best for | Avoid or qualify when |
|---|---|---|---|
| Flowchart | Directed steps and decisions | Process logic | Timing, responsibility, or data volume is the core story |
| Swimlane diagram | Flowchart partitioned by actor/system | Responsibility and handoffs | Lanes become long and cross excessively |
| BPMN diagram | Standardized process notation | Formal business processes | Audience does not know the notation |
| Sequence diagram | Lifelines and messages ordered through time | System interactions and protocols | Physical architecture is the main question |
| State diagram | States and transitions | Lifecycle and allowed changes | Concurrent states are not represented |
| Architecture diagram | Components and typed connections | System structure and boundaries | Visual layout implies undocumented execution order |
| Entity-relationship diagram | Entities, attributes, and relationships | Data-model structure | Runtime flow or operational dependency |
| Decision tree | Branches represent tests and outcomes | Rule logic and classification paths | Probabilities, pruning, or uncertainty are missing |
| Causal diagram/DAG | Directed edges encode asserted causal relations | Causal assumptions and adjustment logic | Mere correlations are presented as causes |
| Mind map | Radial associative hierarchy | Ideation and conceptual grouping | Evidence, order, or dependency must be precise |

## 10. Specialized analytical forms

| Form | Definition | Best for | Avoid or qualify when |
|---|---|---|---|
| Heatmap | Rectangular cells encode magnitude with color | Matrix patterns and dense repeated measures | Exact values or color discrimination is critical |
| Calendar/cohort retention matrix | Rows are cohorts; columns are elapsed periods | Retention and lifecycle patterns | Denominators vary without labels |
| Confusion matrix | Actual versus predicted classes with counts/rates | Classification error structure | Class imbalance and normalization are hidden |
| ROC curve | True-positive versus false-positive rate by threshold | Ranking classifiers across thresholds | Rare-positive decisions where precision matters more |
| Precision–recall curve | Precision versus recall by threshold | Imbalanced classification | Prevalence differs across compared datasets |
| Calibration plot | Predicted probability versus observed frequency | Probability reliability | Sample size per bin is hidden |
| Kaplan–Meier curve | Estimated survival probability over time | Time-to-event with censoring | Risk table and uncertainty are omitted |
| Funnel plot | Effect or rate versus precision/sample size | Publication bias or process outliers | Confused with conversion funnel |
| Volcano plot | Effect size versus statistical significance | High-throughput comparisons | Significance substitutes for practical importance |
| Manhattan plot | Genomic position versus association strength | Genome-wide association peaks | Multiple-testing threshold or locus context omitted |
| Nomogram | Scales convert predictor values into a score/probability | Manual clinical/statistical prediction | Model validity and uncertainty are absent |

## Selection rules by data shape

| Data shape | Strong default | Important question |
|---|---|---|
| One categorical + one quantitative field | Sorted bar or dot | Must magnitude start at zero? |
| One temporal + one quantitative field | Line | Are intervals regular and missing periods explicit? |
| One quantitative field | Histogram plus ECDF or box summary | Is sample size sufficient and are bins disclosed? |
| Two quantitative fields | Scatter | Is density high enough to require binning/contours? |
| Category + two quantitative fields | Scatter with color or facets | Is color categorical and redundant? |
| Whole plus parts | Stacked bar | Do values sum to a meaningful, non-overlapping total? |
| Hierarchical categories + value | Treemap or tree | Is the task magnitude comparison or path tracing? |
| Origin, destination, magnitude | Sankey or flow map | Does width conserve quantity and is direction visible? |
| Geographic region + rate | Choropleth | Is normalization appropriate and classification disclosed? |
| Estimate + uncertainty | Error bar/band or distribution | Which interval and confidence/probability does it encode? |
| Many variables | Small multiples, heatmap, SPLOM | Which subset supports the decision without hiding the rest? |

## Common misleading patterns and fixes

| Problem | Why it misleads | Fix |
|---|---|---|
| Truncated bar baseline | Length differences are exaggerated | Include zero or change to a point/line encoding and disclose the domain |
| Dual axes | Unrelated scale choices manufacture correlation | Normalize, facet, index to a baseline, or state why dual axes are necessary |
| 3D bars/pies | Perspective distorts length, angle, and area | Use a 2D common-scale form |
| Rainbow scale for ordered data | Hue is not perceptually ordered and creates false boundaries | Use a perceptually ordered sequential or diverging scale |
| Choropleth of totals | Large/populous regions dominate interpretation | Map rates or use proportional symbols for totals |
| Smoothed line across missing data | Implies observations and continuity that do not exist | Break the line, mark missing intervals, or show interpolation explicitly |
| Mean-only bar | Conceals sample distribution and uncertainty | Add raw points, intervals, box/violin, or sample counts |
| Pie with many close slices | Angle and area comparisons are imprecise | Use a sorted bar or table |
| Packed bubbles for rank | Area and packing impair lookup | Use bars/dots; retain bubbles only when topology/compactness matters |
| Unlabeled log scale | Distances are misread as linear differences | Label the scale, ticks, zero impossibility, and rationale |
| Auto-sorted time/categories | Destroys chronological or semantic order | Lock meaningful order and make sort explicit |
| Filtering without coverage | A polished subset appears complete | Show `selected of eligible`, active filters, exclusions, and reset |

## Sources used for this taxonomy

- [Vega-Lite mark types](https://vega.github.io/vega-lite/docs/mark.html)
- [Vega-Lite encoding channels](https://vega.github.io/vega-lite/docs/encoding.html)
- [Cleveland and McGill, Graphical Perception](https://doi.org/10.1080/01621459.1984.10478080)
- [Brehmer and Munzner, A Multi-Level Typology of Abstract Visualization Tasks](https://www.cs.ubc.ca/labs/imager/tr/2013/MultiLevelTaskTypology/)
- [ColorBrewer](https://colorbrewer2.org/)

