# Standards, regulation, and governance

## Why this section exists

Evaluation used to be a research choice. For some systems it is now a legal obligation, and for many
buyers it is a procurement question. This section covers what external requirements actually say
about evaluation, and what governance practices are worth copying even where nothing compels you.

Nothing here is legal advice. Read the primary texts, which are linked.

## EU AI Act: evaluation as a legal duty

The Act creates a category of **general-purpose AI model with systemic risk**, and Article 55(1)
requires providers of those models to perform model evaluation using standardised protocols and
tools that reflect the state of the art, including conducting and documenting adversarial testing
in order to identify and mitigate systemic risks
([Article 55](https://artificialintelligenceact.eu/article/55/)).

Four points that matter to an evaluation team:

| Point | Consequence |
| --- | --- |
| "Standardised protocols and tools reflecting the state of the art" | Your evaluation method has to be defensible against current practice, and current practice moves. A frozen internal suite ages into non-compliance |
| "Conducting and documenting adversarial testing" | Red-teaming is named explicitly, and the documentation is part of the obligation, not an optional extra |
| Independent external experts may be involved | External testing is anticipated, and is proportionate to risk |
| A Code of Practice can demonstrate compliance until a standard exists | The General-Purpose AI Code of Practice was published on 10 July 2025, and the general-purpose obligations applied from 2 August 2025 |

Practical reading: the Act pushes towards written, versioned evaluation methodology with a
documented adversarial component. That is the same thing good practice asks for, with a filing
requirement attached.

## NIST: the American framework

The **AI Risk Management Framework** organises work into four functions: Govern, Map, Measure, and
Manage. Evaluation lives in **Measure**, which NIST ties to TEVV, meaning testing, evaluation,
verification, and validation, and which calls for a mix of methods including red-teaming, bias
assessment, and security testing ([NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework)).

The **Generative AI Profile**, NIST AI 600-1, published 26 July 2024, extends the framework to
generative systems and names the risk categories to measure against. They are worth listing because
they make a useful coverage checklist for an evaluation suite:

| Risk category from NIST AI 600-1 |
| --- |
| Chemical, biological, radiological, and nuclear information or capabilities |
| Confabulation, commonly called hallucination |
| Dangerous, violent, or hateful content |
| Data privacy |
| Environmental impact |
| Harmful bias or homogenisation |
| Human and AI configuration |
| Information integrity |
| Information security |
| Intellectual property |
| Obscene, degrading, or abusive content |
| Value chain and component integration |

Use it as a gap analysis. Most in-house suites cover two or three of these twelve and have never
written down which ones.

## ISO: two standards that are often confused

| Standard | What it is | What it is not |
| --- | --- | --- |
| ISO/IEC TS 4213:2022 | A technical specification for assessing machine-learning classification performance: performance measures, evaluation methods, and model selection. Published October 2022 by ISO/IEC JTC 1/SC 42, about 33 pages, confirmed as current in 2025 | Not applicable to generative or agentic evaluation. It is a classification-metrics document |
| ISO/IEC 42001:2023 | A management-system standard for AI: requirements for establishing, operating, and improving an AI management system, published December 2023 | Not a technical evaluation spec, and certification does not by itself establish EU AI Act compliance |

Both are useful for different reasons. TS 4213 is a good reference for getting classification
metrics right. 42001 is what an auditor will ask about, and it obliges you to have a documented
evaluation process rather than prescribing what the process measures.

## MLPerf: governance worth stealing

Systems benchmarking solved a problem that model benchmarking still has. MLPerf, run by MLCommons,
compares hardware and software stacks, and its rules are built to stop the comparison being gamed.

| Rule | What it prevents | Model-benchmarking equivalent |
| --- | --- | --- |
| A Closed division that requires the same model, initialisation, optimiser, schedule, and data traversal as the reference implementation | Winning by changing the workload | Fix the prompt, the scaffold, and the scoring code across all systems compared |
| An Open division that permits changes but requires every deviation to be documented | Hiding the change | A "custom scaffold" column, with the scaffold published |
| Reference implementations published | Ambiguity about what the benchmark is | Publish a runnable harness, not a description |
| Up to two submissions audited per round, one chosen at random and one optionally by the review committee | Unverifiable claims | Random audit of submitted agent logs |
| Hyperparameter changes allowed only if publicly described at a level that allows reproduction | Secret tuning | Publish sampling settings and retry policies |

The transferable idea is the divisions. Most model comparisons quietly mix Closed and Open: one
system runs bare, another runs inside an elaborate scaffold, and the table presents them as
comparable. Separating the two would fix a large share of published confusion.

## Documentation formats

| Format | Documents | Core idea |
| --- | --- | --- |
| Model cards ([Mitchell et al. 2019](https://arxiv.org/abs/1810.03993)) | A trained model | Report intended use, evaluation conditions, and performance broken down by group and condition, not just an aggregate |
| Datasheets for datasets | A dataset | Record motivation, composition, collection process, and recommended uses |
| Data cards | A dataset, for practitioners | Structured, purpose-oriented dataset documentation |
| Benchmark documentation per BetterBench ([Reuel et al. 2024](https://arxiv.org/abs/2411.12990)) | A benchmark | Cover the whole lifecycle: design, implementation, documentation, maintenance, and retirement |

The disaggregation point from model cards is the one most often skipped and most often decisive: an
aggregate score can hide a group or condition where the system fails badly.

## Independent evaluation

Self-reported scores have an obvious incentive problem. Three structures reduce it, in increasing
strength:

| Structure | Example | Strength |
| --- | --- | --- |
| Published methodology plus published raw outputs | HELM publishes every prompt and completion | Anyone can re-grade |
| A third party re-runs the benchmarks itself | Epoch AI runs GPQA Diamond, MATH Level 5, Mock AIME, FrontierMath, and SWE-bench Verified with published settings, 16 samples per question on two of them, and plus or minus one standard error | Removes the provider's harness from the loop |
| A third party holds a private test set | FrontierMath, ARC-AGI | Removes contamination as well, at the cost of concentrating trust in the holder |

The third structure is the strongest and the most fragile. It only works if the holder's funding,
access arrangements, and data-use terms are disclosed. See the FrontierMath disclosure episode in
[04-contamination-and-saturation.md](04-contamination-and-saturation.md).

## A compliance-shaped evaluation record

If you need to satisfy an external requirement, this is the minimum record to keep per model
version. It also happens to be good engineering practice.

| Record | Contents |
| --- | --- |
| Evaluation plan | Constructs measured, benchmarks chosen, why, and the coverage gaps against a named risk taxonomy |
| Protocol | Prompts, settings, samples per item, scaffolds, tools, step limits, all versioned |
| Results | Scores with standard errors, paired comparisons against the previous version, cost and latency |
| Adversarial testing | Who tested, for how long, what they found, severities, fixes, retests |
| Grader validation | Negative and positive control results; for model graders, agreement with human labels |
| Decisions | What the results changed: shipped, blocked, mitigated, or escalated |
| Sign-off | Who reviewed, and their independence from the shipping decision |
| Retention | Where the raw transcripts live, and for how long |
