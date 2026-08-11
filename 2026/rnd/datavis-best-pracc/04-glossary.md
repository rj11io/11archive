# Data visualization glossary

Chart-form definitions are in [Chart taxonomy and selection](01-chart-taxonomy-and-selection.md). This glossary defines the data, statistical, visual, interaction, accessibility, and product terms used across the report.

## A–C

| Term | Definition |
|---|---|
| Accessibility tree | Programmatic representation of interface structure, names, roles, values, and states used by assistive technology. |
| Active filter | A filter currently restricting the eligible data. Its value and effect should be visible. |
| Aggregation | Combining observations, such as sum, count, mean, median, minimum, maximum, or percentile. |
| Analytical question | Specific lookup, comparison, pattern, or decision the visualization must support. |
| Annotation | Explanatory text or graphic attached to a data point, interval, event, or region. |
| Area encoding | Mapping a quantity to two-dimensional size. Less precise for comparison than common position or length. |
| ARIA | Accessible Rich Internet Applications specification for supplementing semantics when native HTML is insufficient. |
| Aspect ratio | Plot width divided by height. It affects perceived slopes, density, and label space. |
| Axis | Guide that visualizes a positional scale using a line, ticks, labels, gridlines, and title. |
| Baseline | Reference position from which magnitude or change is judged, commonly zero. |
| Benchmark | Standard reference, task set, or comparison point used to evaluate performance. |
| Bin | Interval grouping nearby numeric values for aggregation or display. |
| Binning | Mapping continuous values into discrete intervals. Bin boundaries can materially change a histogram or heatmap. |
| Bivariate | Involving two variables. |
| Brush | Direct manipulation that selects a continuous region or interval, usually by dragging. |
| Calculated field | Value derived deterministically from other fields. |
| Caption | Text associated with a figure that explains context, takeaway, source, or limitations. |
| Cardinality | Number of distinct values in a field. High-cardinality categories usually require search, grouping, or aggregation. |
| Categorical data | Values representing groups or labels rather than measurable magnitude. Nominal categories are unordered; ordinal categories have order. |
| Channel | Visual property to which data is mapped, such as position, length, color, size, shape, opacity, angle, text, or facet. |
| Chart | A visual encoding of data for lookup, comparison, pattern detection, or explanation. |
| Chart junk | Decoration that consumes attention without improving interpretation. |
| Clear | Remove all current selections or filters. Different from reset, which restores a designed default. |
| Cohort | Group sharing a start event or defining characteristic, often compared across elapsed time. |
| Color domain | Data values or categories mapped by a color scale. |
| Color range | Actual colors produced by a color scale. |
| Common scale | One shared mapping used across marks or panels, enabling direct comparison. |
| Comparison set | Entities intentionally displayed together. |
| Composition | Parts that form a meaningful, usually non-overlapping whole. |
| Confidence interval | Procedure-derived interval that would contain the target parameter at a stated rate over repeated samples. It is not generally the probability that this one interval contains the parameter. |
| Confounder | Variable related to both an explanatory variable and outcome that can bias causal interpretation. |
| Continuous data | Numeric values conceptually able to vary across an interval. |
| Control | Interface element that changes data scope, view, encoding, navigation, or output. |
| Coverage | Measured or available portion of the intended population, often shown as count or percentage. |
| Cross-filter | Selection in one view filters data in another linked view. |
| Cross-highlight | Selection emphasizes related marks elsewhere while retaining all data. |

## D–H

| Term | Definition |
|---|---|
| Dashboard | Coordinated collection of metrics and views supporting monitoring or analysis. |
| Data domain | Input values a scale accepts. |
| Data provenance | Origin, collection method, transformations, ownership, and lineage of data. |
| Data range | Visual outputs produced by a scale, such as pixels, colors, or sizes. |
| Datum | One value or one data item. Plural: data. |
| Debounce | Delay repeated updates until input activity pauses, reducing unnecessary recomputation. |
| Default view | Designed initial chart state, including selection, filter, sort, scale, and annotations. |
| Denominator | Quantity a rate, percentage, or normalized measure is divided by. |
| Derived metric | Metric calculated from other values using a defined formula. |
| Desirability direction | Whether larger, smaller, closer to a target, or inside a range is preferred. |
| Detail on demand | Interaction revealing additional information about selected or focused marks. |
| Dimension | Field used to group, segment, identify, or filter observations, such as country or model family. |
| Direct label | Text placed beside a mark instead of requiring a separate legend lookup. |
| Disclosure | Expandable region that progressively reveals definitions, methods, notes, or detail. |
| Discrete data | Values occurring as distinct categories or countable steps. |
| Diverging scale | Ordered scale extending in two directions from a meaningful center. |
| Domain line | Main axis line representing the span of a scale. |
| Drill down | Move from an aggregate to finer detail. |
| Drill up | Return from detail to a broader aggregation. |
| Dual axis | Chart with two quantitative axes for separate measures. It can manufacture apparent correlation through arbitrary scale choices. |
| Encoding | Mapping data fields or constants to visual channels. |
| Endpoint | Specific provider/configuration serving a model, distinct from the abstract model identity. |
| Error bar | Mark showing an interval around an estimate. The interval type must be named. |
| Estimate | Approximate value of an unknown quantity derived from data or a model. |
| Exact-data view | Table or downloadable dataset exposing values behind a visualization. |
| Facet | Split a view into aligned small multiples based on a categorical field. |
| Filter | Predicate restricting which records or entities are eligible. |
| Focus | Current keyboard-interaction target. Visible focus and logical order are required. |
| Focus + context | Detailed view paired with an overview that preserves location in the full domain. |
| Forecast | Model-based prediction about future or unobserved values. |
| Freshness | How current the evidence is, expressed with data-as-of and update information. |
| Gridline | Reference line extending from an axis tick across the plot. |
| Group | Set of observations sharing dimension values. |
| Guide | Visual aid interpreting encodings, primarily axes, legends, and headers. |
| Highlight | Temporary or selected visual emphasis without removing other data. |
| Hover | Pointer state over a target. Hover-only content is inaccessible to keyboard and many touch users. |

## I–M

| Term | Definition |
|---|---|
| Imputation | Replacing missing values using a stated method. It must not be confused with observation. |
| Index | Composite or normalized measure combining inputs under a defined method. |
| Inference | Conclusion about a population, process, or cause drawn from evidence and assumptions. |
| Interaction | User action that changes scope, view, encoding, navigation, selection, or output. |
| Interpolation | Estimating values between known observations. |
| Interval | Numeric range with a defined statistical or operational meaning. |
| Jitter | Small positional displacement used to reveal overlapping points. |
| Key performance indicator (KPI) | Metric selected to monitor progress toward an objective. |
| Label | Visible text naming a mark, axis value, control, or category. |
| Latency | Delay before a response or first result. Define the exact start and end events. |
| Layer | Multiple marks superimposed in the same coordinate system. |
| Legend | Guide mapping non-positional encodings such as color, shape, size, or line style to meaning. |
| Linear scale | Scale where equal data differences produce equal visual differences. |
| Linked views | Multiple charts/tables coordinated by shared selection or filters. |
| Log scale | Scale where equal ratios produce equal visual distances. Valid ordinary log domains exclude zero and negative values. |
| Long description | Structured text conveying the information, relationships, scales, and trends in a complex image/chart. |
| Mark | Primitive data-bearing geometry, such as point, line, bar, area, rect, rule, text, or geoshape. |
| Measure | Quantitative field commonly aggregated or compared. |
| Median | 50th percentile; half the observations are at or below it. |
| Metadata | Data describing a dataset or artifact, such as source, units, schema, dates, and method. |
| Metric | Quantified measure defined by population, formula, unit, period, and direction. |
| Missing at random/non-random | Statistical assumptions about why values are absent. Missingness can bias visual conclusions. |
| Missing value | Expected value that is unavailable. It is not zero. |
| Mode | Most frequent value or a local peak of a distribution. |
| Multivariate | Involving more than two variables. |

## N–R

| Term | Definition |
|---|---|
| Nominal data | Unordered categories, such as creator or country. |
| Non-text contrast | Contrast of interface components and graphical objects needed to perceive state and meaning. |
| Normalization | Transforming values to a common basis, such as percentage, rate per capita, z-score, or index baseline. |
| Null | Machine-readable absence of a value. It must have a defined display and aggregation policy. |
| Observation | One measured or recorded data record. |
| Opacity | Transparency channel. Weak for precise reading and risky when it is the only selected-state cue. |
| Ordinal data | Categories with meaningful order but not necessarily equal intervals. |
| Outlier | Observation unusually distant under a stated rule or model. It is not automatically an error. |
| Overplotting | Marks overlap enough to hide count, density, or outliers. |
| Panel | One chart region within a multi-view display. |
| Parameter | Named value that can change a visualization's calculation, filter, or encoding. |
| Pareto frontier | Set of non-dominated options for which improving one objective would worsen another. |
| Percent change | `(new - old) / old`; undefined when the baseline is zero and unstable near zero. |
| Percentage point | Arithmetic difference between percentages, distinct from percent change. |
| Percentile | Value at or below which a stated percentage of observations falls. |
| Perceptually uniform | Equal steps in encoded value appear approximately equal in visual difference. |
| Period | Time interval a metric covers. |
| Persistence | Whether interaction state survives reload/navigation. If used, make it visible and resettable. |
| Plot area | Coordinate region containing data marks. |
| Population | Full set of entities or events a claim concerns. |
| Precision | Resolution supported by measurement, calculation, and uncertainty, not merely displayed decimals. |
| Preset | Named collection of parameter values for a known use case. |
| Progressive disclosure | Initially showing essential content, with optional access to detail. |
| Projection | Transformation from geographic coordinates to a planar map. |
| Qualitative scale | Unordered visual palette for categories. |
| Quantile | Cut point dividing ordered data into specified probability fractions. |
| Rate | Quantity normalized by exposure, population, time, or another denominator. |
| Redundant encoding | Expressing the same meaning through more than one channel, such as color and shape. |
| Reference band | Shaded interval representing a target, normal range, uncertainty, or policy threshold. |
| Reference line | Line marking a target, baseline, event, mean, or other comparator. |
| Reset | Restore the designed default state. Different from clearing all values. |
| Responsive visualization | Visualization that adapts layout, labels, controls, and sometimes representation to available space and input mode. |

## S–Z

| Term | Definition |
|---|---|
| Sample | Observed subset used to learn about a population. |
| Sampling | Selecting or reducing observations. Visual sampling must retain material structure or disclose bias. |
| Scale | Function mapping a data domain to a visual range. |
| Schema | Formal structure, types, relationships, and constraints of data. |
| Selection | Data values or marks identified by direct manipulation or control input. |
| Semantic color | Color chosen for domain meaning, such as loss/gain, while remaining accessible. |
| Sequential scale | Ordered scale moving from low to high, commonly through luminance. |
| Series | Ordered set of related observations represented together. |
| Shape channel | Symbol form used to distinguish categories. Useful as redundant encoding. |
| Shareable state | Visualization configuration encoded so another user can reproduce the same view. |
| Small multiple | Repeated aligned chart using consistent encodings for different groups. Also called a trellis or faceted view. |
| Smoothing | Estimating a less noisy pattern from observations. Method and parameters can change conclusions. |
| Sort | Ordering records or categories by value, time, alphabet, or domain logic. |
| Source note | Visible attribution and provenance attached to a chart or table. |
| State | Current values of selections, filters, parameters, navigation, and display controls. |
| Statistical significance | Result of a hypothesis-test procedure. It does not measure practical importance or effect size. |
| Status message | Non-focus-moving update about result, progress, success, waiting, or error exposed to assistive technology. |
| Story | Deliberately ordered sequence of views and annotations guiding an explanation. |
| Subgroup | Subset defined by one or more dimensions. |
| Subtitle | Supporting chart text defining metric, unit, period, method, or scope. |
| Tab | Control switching among mutually exclusive views within the same context. |
| Table header | Semantic cell naming a row or column and associated programmatically with data cells. |
| Target | Desired value or interval set by policy, benchmark, or decision rule. |
| Target size | Pointer-active area of a control. Larger targets improve touch and motor accessibility. |
| Temporal data | Dates, times, durations, or ordered periods. |
| Threshold | Cut point separating categories or operational states. |
| Tick | Reference mark on an axis associated with a scale value. |
| Timezone | Civil-time reference used to interpret timestamps and period boundaries. |
| Title | Primary label identifying a chart's subject or finding. |
| Tooltip | Temporary detail appearing on hover/focus or activation. It must not carry the only copy of material information. |
| Transform | Operation that changes data before encoding, such as filtering, calculation, aggregation, binning, or regression. |
| Trend | Directional pattern across ordered observations, not necessarily causal or statistically significant. |
| Uncertainty | Limited knowledge about a value, estimate, model, sample, or future outcome. |
| Unit | Measurement basis, such as USD per million tokens, seconds, percent, or count. |
| Univariate | Involving one variable. |
| Value label | Text rendering a data value near a mark. |
| Variable | Characteristic that can take different values. |
| View | One visualization specification or analytical state. |
| Viewport | Visible region available to render and operate an interface. |
| Visual hierarchy | Deliberate ordering of attention through position, scale, contrast, spacing, and typography. |
| Visual variable | Perceptual property used to encode data; synonymous with encoding channel in many contexts. |
| Whisker | Line segment extending from a box or estimate under a defined rule. |
| Zero baseline | Scale domain includes zero at the magnitude origin. Essential for ordinary bar-length comparison. |
| Zoom | Change the scale/domain to focus on a smaller or larger region. It needs bounds and reset/overview. |

## Evidence-state vocabulary

| State | Definition |
|---|---|
| Observed | Directly inspected or measured during this research. |
| Source-reported | Stated by a cited source but not independently measured. |
| Calculated | Derived deterministically from stated inputs and method. |
| Estimated | Approximated through a disclosed method. |
| Inferred | Reasoned from observed evidence but not directly present. |
| Unavailable | Expected evidence could not be obtained. |
| Not applicable | The field or concept does not apply. |

