# What a benchmark measures

## The measurement chain

A score is the last link in a chain. Each link is a decision someone made, and each decision can
change the number. If you cannot see a link, you cannot trust the score.

Think of it like a bathroom scale. The reading depends on the spring, where the scale sits, and
whether you are holding a bag. A benchmark has eight such dependencies.

<!-- figure: measurement-chain -->

| # | Link | The decision made here | How it goes wrong |
| --- | --- | --- | --- |
| 1 | Construct | What ability are we claiming to measure? | Named too broadly, for example "reasoning", so any task counts as evidence |
| 2 | Task | What concrete work stands in for that ability? | The task is solvable by a shortcut that does not need the ability |
| 3 | Items | Which specific questions, and how many? | Too few to detect the difference you care about; labels are wrong |
| 4 | Protocol | Prompt, examples shown, temperature, samples per item, tools allowed | Undisclosed, so nobody can reproduce or compare |
| 5 | Extraction | How do we pull an answer out of free text? | A correct answer in the wrong format is scored wrong |
| 6 | Grader | Who or what decides right from wrong? | An automated checker accepts a wrong answer, or rejects a right one |
| 7 | Aggregation | How do item scores become one number? | Averaging across unlike groups, or averaging benchmarks with different chance baselines |
| 8 | Claim | What sentence do we write next to the number? | The sentence describes the construct, while the number describes the task |

Two rules follow.

**Every link needs to be published.** "Model X scores 88.4% on Y" is not reproducible. "Model X
scores 88.4% (standard error 1.1) on Y, zero-shot chain-of-thought, empty system prompt, default
temperature, 8 samples per question, answers extracted by the published regular expression, code
at this commit" is.

**The claim must match the task, not the construct.** Epoch AI runs GPQA Diamond and reports it as
a graduate-level science question benchmark, not as a measure of scientific ability
([Epoch AI benchmarking methodology](https://epoch.ai/benchmarks/about)). That restraint is the
practice.

## Construct validity

**Construct validity** means the test measures the thing it claims to measure. The term comes from
psychometrics, the study of measuring human abilities, and it is the single most useful borrowed
idea in AI evaluation.

The failure is easy to picture. A driving test held entirely in an empty car park measures parking.
Call it a driving test and people will licence drivers who have never met traffic.

Raji and colleagues made the strong version of this argument about AI benchmarks that present
themselves as general. Framing a dataset as general purpose, they wrote, misguides task design,
hides the biases and subjective judgements baked into the data, and enables misuse through false
performance claims ([Raji et al. 2021](https://arxiv.org/abs/2111.15366)). Their targets were
ImageNet and GLUE, but the argument transfers directly to any benchmark whose name contains the
word "general", "massive", or "universal".

### Four validity questions to ask of any benchmark

| Question | Name in the literature | Concrete test |
| --- | --- | --- |
| Does the task need the ability, and only that ability? | Task validity | Can a shortcut solve it? Can a domain expert solve it without the ability? |
| Does the scoring correctly separate success from failure? | Outcome validity | Feed the grader a known-wrong solution. Does it reject it? Feed it a known-right one in an unusual style. Does it accept it? |
| Do the items cover the ability's range? | Content validity | Which subskills, domains, difficulty levels, and languages are absent? |
| Does the score predict the behaviour you care about downstream? | Criterion validity | Does a 5-point benchmark gain show up in your product metric? |

The first two names come from the Agentic Benchmark Checklist, which splits benchmark validity
exactly this way and supplies 10 criteria for task validity and 20 for outcome validity
([Zhu et al. 2025](https://arxiv.org/abs/2507.02825)).

### The benchmark lottery

Even with valid benchmarks, the *choice* of benchmark decides the winner. Dehghani and colleagues
called this the benchmark lottery: which method looks best depends heavily on which tasks the
community happens to have standardised on, and in some fields researchers can effectively pick
tasks that suit their method ([Dehghani et al. 2021](https://arxiv.org/abs/2107.07002)).

The practical consequence is not that comparison is hopeless. It is that a single benchmark cannot
carry a general claim, and a suite chosen by the person making the claim is weak evidence. Ask who
chose the suite.

### How well does the field do on this?

Poorly, and it has been measured. BetterBench assessed 24 widely used AI benchmarks against 46
best practices covering the whole benchmark lifecycle, from design through documentation to
retirement. Most of the benchmarks did not report whether their results were statistically
significant, and most did not let their results be replicated easily
([Reuel et al. 2024](https://arxiv.org/abs/2411.12990)). The per-benchmark scores are published in
a public repository at betterbench.stanford.edu.

## The taxonomy: what kind of eval is this?

"Eval" covers at least six different activities with different rules. Mixing them up is a common
source of bad argument.

| Kind | Question it answers | Typical form | Score shape |
| --- | --- | --- | --- |
| Capability benchmark | Can the model do X at all? | Fixed items, automatic grading | Accuracy, pass rate |
| Behaviour or alignment eval | Does the model behave a certain way when it could choose not to? | Constructed scenarios, judged transcripts | Rate of the behaviour |
| Preference evaluation | Which output do people prefer? | Head-to-head votes | Win rate, or a fitted rating |
| Agentic or task evaluation | Can the system finish a real multi-step job? | Sandbox environment, outcome check | Success rate, cost, reliability |
| Red-teaming | Can a determined person make it fail? | Open-ended adversarial probing | Findings, not a score |
| Production monitoring | Is it still working on live traffic? | Sampled real traces, ongoing review | Trend, incident counts |

Four distinctions matter more than the labels.

**Capability versus propensity.** A capability eval asks whether the model *can*. A propensity or
behaviour eval asks whether it *will*. Safety work needs both, and they fail differently: a
capability eval is broken by a weak prompt or scaffold, which makes the model look less able than
it is, while a propensity eval is broken by the model noticing that it is being tested. See
[07-safety-and-frontier-risk-evals.md](07-safety-and-frontier-risk-evals.md).

**Model evaluation versus product evaluation.** Kapoor and colleagues draw this line sharply:
model developers and downstream developers have different benchmarking needs, and a benchmark
built for the first can mislead the second
([Kapoor et al. 2024](https://arxiv.org/abs/2407.01502)). A model developer wants a hard, general,
contamination-resistant benchmark. A product team wants their own traffic, their own failure
modes, and their own cost ceiling.

**Log-probability scoring versus generation.** For a multiple-choice question you can either read
the model's probability for each option token, or make it write an answer and parse it. These give
different numbers for the same model on the same items, and neither is wrong. They are different
measurements. Comparing across the two is the single most common invalid comparison in published
tables ([Biderman et al. 2024](https://arxiv.org/abs/2405.14782)).

**Static versus live.** A static benchmark is a fixed file. A live benchmark refreshes items over
time, which defends against contamination but destroys comparability across dates unless each
version is pinned and named.

## What a benchmark can and cannot support

Claims come in strengths. Match the claim to the evidence.

| Claim | Supported by | Not supported by |
| --- | --- | --- |
| "Scores 71.2% on this benchmark, standard error 1.4" | One properly reported run | Nothing else needed |
| "Better than model B on this benchmark" | Paired per-question comparison with an interval that excludes zero | Two averages from different papers |
| "Better at coding" | A suite of coding benchmarks, held-out items, and cost disclosed | One benchmark |
| "Can do the work of a junior engineer" | Real tasks, human baselines, expert graders, error analysis | Any accuracy number |
| "Safe to deploy" | Task evals plus red-teaming plus monitoring plus a rollback plan | Any benchmark, ever |

## The minimum a benchmark should document

Adapted from the BetterBench minimum checklist ([Reuel et al. 2024](https://arxiv.org/abs/2411.12990)),
the reproducibility lessons from the lm-evaluation-harness maintainers
([Biderman et al. 2024](https://arxiv.org/abs/2405.14782)), and model-card practice
([Mitchell et al. 2019](https://arxiv.org/abs/1810.03993)).

| Field | Why |
| --- | --- |
| The construct, stated in one sentence, plus what it excludes | Stops the score being read as broader than it is |
| Who built the items, and their domain expertise | Expert-written items behave differently from crowd-written ones |
| Item count, split sizes, and whether any split is private | Sets the precision ceiling and the contamination exposure |
| The exact prompt template, including separators and system prompt | The largest reproducibility lever, see [03](03-statistics-and-uncertainty.md) |
| Sampling settings and samples per item | Determines the noise floor |
| Answer extraction rule | Decides how many right answers get scored wrong |
| Grader definition, and for model graders the agreement with humans | The grader is a measuring instrument and needs its own calibration |
| Aggregation formula, including any normalisation and its chance baseline | Two benchmarks with different chance levels cannot be averaged raw |
| Known label errors and the process for fixing them | Sets the ceiling above which a score is meaningless |
| Contamination stance: canary string, dated items, private split, or none | Tells a reader how much of the score could be memorisation |
| Licence, version identifier, and citation | Makes the result referenceable a year later |
| Funding and any early access granted to model providers | A conflict of interest a reader cannot infer |
| Retirement criteria | Nobody retires a benchmark without a pre-agreed trigger |
