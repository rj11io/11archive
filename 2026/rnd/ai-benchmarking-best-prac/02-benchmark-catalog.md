# The benchmark catalog

## How to read this catalog

Thirty-seven benchmarks, plus ten suites and leaderboards, that a reader is likely to meet in a
model announcement or a procurement document. The point is not to rank them. It is to let you look
up what a named benchmark actually contains, so you can judge what its score can support.

**Columns.** *Year* is the year of the paper or release announcement cited in
[12-methodology-and-sources.md](12-methodology-and-sources.md), which is sometimes later than
first public use. *Items* is the number of scored units, questions for a quiz, tasks for an agent
environment. *Grader* is what decides right from wrong. *Held out* says whether any part of the
test set is kept private from model providers. *Status* is one of:

| Status | Meaning |
| --- | --- |
| live | In active use and not yet topped out |
| saturated | Frontier scores sit near the ceiling, so the benchmark no longer separates models |
| superseded | A corrected or harder replacement exists and should be used instead |
| retired | The maintainers stopped running it |

**Evidence note.** Item counts come from each benchmark's own paper or documentation. Where this
report could not confirm a count against a primary source, the cell reads `n/v`, meaning not
verified, rather than a guessed number. Do not read `n/v` as zero or small. The unverified counts
are listed in [12-methodology-and-sources.md](12-methodology-and-sources.md).

## Knowledge and reasoning quizzes

| Benchmark | Year | Items | Format | Grader | Held out | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| MMLU | 2020 | 15,908 across 57 subjects | 4-option multiple choice | Exact match | No | saturated | An audit found errors in 6.49% of questions, and 57% of the analysed virology questions ([Gema et al. 2024](https://arxiv.org/abs/2406.04127)) |
| MMLU-Redux | 2024 | 5,700 re-annotated | 4-option multiple choice | Exact match | No | live | The corrected subset of MMLU, across all 57 subjects |
| MMLU-Pro | 2024 | 12,032 | 10-option multiple choice | Exact match | No | live | Ten options lower the chance baseline from 25% to 10% |
| ARC (AI2 Reasoning Challenge) | 2018 | 7,787 total, 2,590 in the Challenge set | Multiple choice science | Exact match | No | saturated | Was in the first Open LLM Leaderboard suite |
| HellaSwag | 2019 | about 10,000 | Sentence completion | Exact match | No | saturated | Was in the first Open LLM Leaderboard suite |
| Winogrande | 2019 | about 44,000 | Pronoun resolution | Exact match | No | saturated | Was in the first Open LLM Leaderboard suite |
| TruthfulQA | 2021 | 817 | Short answer and multiple choice | Model or exact match | No | superseded | Measures imitation of common falsehoods, not general truthfulness |
| BIG-bench | 2022 | 204 tasks | Mixed | Task-specific | No | superseded | Introduced the canary string convention for contamination control |
| BIG-Bench Hard (BBH) | 2022 | 23 tasks | Mixed | Task-specific | No | live | The subset where models scored below the human rater average |
| GPQA | 2023 | 448 total, 198 in the Diamond subset | 4-option multiple choice | Exact match | No | live | Expert-written; validated so that non-experts with web access and 30 minutes cannot solve them |
| MuSR | 2023 | n/v | Multistep soft reasoning | Exact match | No | live | Added in the second Open LLM Leaderboard suite |
| IFEval | 2023 | about 540 | Instruction following with checkable constraints | Programmatic check | No | live | Constraints such as "reply in exactly three bullet points" are verified by code, not a judge |
| Humanity's Last Exam (HLE) | 2025 | 2,500 | Short answer and multiple choice | Exact match and model check | Partly | live | Questions were adversarially filtered against several frontier models, so those models should not be compared directly against later ones |
| ARC-AGI-2 | 2025 | n/v | Abstract visual grid puzzles | Exact match | Yes | live | Keeps a private evaluation set; targets composition and rule application rather than knowledge |

## Mathematics

| Benchmark | Year | Items | Format | Grader | Held out | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GSM8K | 2021 | 8,500 total, 1,319 in the test split | Grade-school word problems | Exact match on the final number | No | saturated | The canonical example of a benchmark that stopped discriminating |
| MATH | 2021 | 12,500 | Competition problems, 5 difficulty levels | Answer equivalence check | No | saturated | The Level 5 subset and the MATH-500 subset are both still quoted |
| Mock AIME 2024-2025 | 2025 | n/v | Contest-style problems | Exact match | No | live | Built by Epoch AI as a harder replacement once MATH Level 5 saturated |
| FrontierMath | 2024 | 338 (295 in Tiers 1 to 3, 43 in Tier 4), 12 published as samples | Research-level problems with a single checkable answer | Programmatic check | Yes | live | Version 2, released 12 June 2026, corrected 123 Tier 1 to 3 problems and 12 Tier 4 problems and removed 12 after an audit found errors affecting 42% of the original set. OpenAI funded the benchmark and holds access to a subset, disclosed on the benchmark page |

## Code

| Benchmark | Year | Items | Format | Grader | Held out | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| HumanEval | 2021 | 164 | Write a Python function from a docstring | Unit tests | No | saturated | Introduced the pass@k estimator used across the field |
| MBPP | 2021 | 974 | Short Python programming problems | Unit tests | No | saturated | Often quoted alongside HumanEval |
| SWE-bench | 2023 | 2,294 issues from 12 Python repositories | Resolve a real GitHub issue | Repository test suite | No | superseded | Drawn from public repositories that model providers train on |
| SWE-bench Verified | 2024 | 500, selected from 1,699 reviewed | Resolve a real GitHub issue | Repository test suite | No | live | Human-validated by OpenAI to remove wrong grading, underspecified issues, and over-specific tests. OpenAI has since said it no longer measures frontier coding capability |
| LiveCodeBench | 2024 | Grows continuously; a 2025 release covered 1,055 problems (`n/v`) | Contest programming problems tagged with a publication date | Unit tests | By date | live | Scores only problems published after a model's training cutoff, which is contamination control by timestamp |
| Terminal-Bench | 2026 | about 89 core tasks in version 2 (`n/v`) | Complete a job in a Linux shell | Programmatic check | Partly | live | Carries a large weight in the Artificial Analysis coding category |
| KernelBench | 2025 | n/v | Write GPU kernels | Correctness plus speedup | No | live | One of the ten benchmarks audited for validity failures by the Agentic Benchmark Checklist |
| SciCode | 2024 | n/v | Scientific computing subproblems from papers | Unit tests | No | live | Used in the Artificial Analysis coding category |

## Agents and real work

| Benchmark | Year | Items | Format | Grader | Held out | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GAIA | 2023 | 466 | Assistant questions needing browsing, files, and tools, in three difficulty levels | Exact match | Partly | live | Answers for the test split are withheld and scored by submission |
| WebArena | 2023 | 812 tasks (`n/v`) | Multi-step tasks on self-hosted clones of real websites | Programmatic outcome check | No | live | Audited for validity failures by the Agentic Benchmark Checklist |
| OSWorld | 2024 | 369 | Control a real desktop by mouse and keyboard | Programmatic outcome check | No | live | Audited for validity failures by the Agentic Benchmark Checklist |
| τ-bench | 2024 | 165 tasks across retail and airline (`n/v`) | Customer-service conversation with tools and a policy document | Database state check plus rules | No | live | Introduced pass^k, the share of tasks solved in every one of k attempts. Reported that a leading model of the time solved under 50% of tasks and under 25% consistently across 8 attempts |
| τ²-bench | 2025 | n/v | Same idea across airline, retail, and telecom, with the user also acting | Database state check | No | live | Adds a second actor, so the agent must coordinate rather than just execute |
| MLE-bench | 2024 | 75 Kaggle competitions | Build a machine-learning solution end to end | The competition's own scoring function | No | live | Grading is inherited from Kaggle, which removes grader design risk |
| Cybench | 2024 | 40 capture-the-flag tasks (`n/v`) | Solve security challenges in a sandbox | Flag match | No | live | Used as a safety-relevant capability eval, including on the Holistic Agent Leaderboard |
| CVE-Bench | 2025 | n/v | Exploit real web vulnerabilities in a sandbox | Programmatic exploit check | No | live | The Agentic Benchmark Checklist cut its performance overestimate by 33% |
| CORE-bench | 2024 | 270 tasks from 90 papers (`n/v`) | Reproduce the computational results of a published paper | Output comparison | No | live | Measures reproducibility work rather than invention |
| GDPval | 2025 | 1,320 tasks across 44 occupations and 9 industries | Produce a real work deliverable, such as a legal brief or a nursing care plan | Blinded pairwise expert comparison against a human deliverable | Partly | live | Task authors averaged about 14 years of professional experience. The grader is a human expert who does not know which deliverable is the model's |
| AgentHarm | 2024 | n/v | Harmful agent tasks with tools | Rubric and programmatic checks | No | live | A refusal-and-capability eval rather than a capability-only one |

## Suites, indices, and arenas

These are not benchmarks. They are ways of combining benchmarks, and they add their own decisions.

| Name | Year | What it is | Composition | Grader | Notes |
| --- | --- | --- | --- | --- | --- |
| HELM | 2022 | A standardised multi-metric suite | 42 scenarios, with 7 metrics measured on 16 core scenarios | Mixed | Raised the share of core scenarios that a typical model had been measured on from 17.9% to 96.0%, and publishes every prompt and completion |
| Open LLM Leaderboard | 2023 | An open-model leaderboard | First suite: ARC, HellaSwag, MMLU, TruthfulQA, Winogrande, GSM8K. Second suite from June 2024: MMLU-Pro, GPQA, MuSR, IFEval, BBH, MATH Level 5 | Automatic | The second suite normalises each score so that chance performance maps to 0 and perfect to 100 before averaging. The whole leaderboard was later archived |
| Chatbot Arena (LMArena) | 2023 | Crowd preference voting between anonymous model pairs | Open-ended user prompts | Human votes, fitted with a Bradley-Terry model | Ratings come with bootstrap confidence intervals, and the top few models usually overlap |
| MT-Bench | 2023 | A small multi-turn quality set | 80 questions | A strong model as judge | The judge agreed with human raters more than 80% of the time, about the same as humans agreed with each other |
| Arena-Hard | 2024 | Harder automatic prompts distilled from arena traffic | Prompts selected for difficulty | Model judge | Built to correlate with arena rankings at much lower cost |
| AlpacaEval, length-controlled | 2024 | Automatic instruction-following comparison | Fixed prompt set | Model judge with a length correction | Exists because judges prefer longer answers, so the raw version rewarded verbosity |
| Artificial Analysis Intelligence Index | 2024 | A weighted commercial index | Version 4.1.1 combines 9 evaluations in 4 categories: Agents 34%, Coding 24%, Scientific Reasoning 24%, General 18% | Mixed | Publishes repeat counts per evaluation (1 to 5), temperature settings, and cost and latency per task beside the score |
| Holistic Agent Leaderboard (HAL) | 2025 | A third-party, cost-aware agent leaderboard with one shared harness | 11 agent benchmarks | Benchmark-native | Validated with 21,730 agent attempts across 9 models and 9 benchmarks for about $40,000, with all logs published |
| Epoch AI Benchmarking Hub | 2024 | An independent re-runner of selected benchmarks | Runs GPQA Diamond, MATH Level 5, Mock AIME, FrontierMath, SWE-bench Verified itself | Benchmark-native | Runs 16 samples per question on GPQA Diamond and Mock AIME, 8 on MATH Level 5, and shows plus or minus one standard error |
| MLPerf | 2018 | Systems benchmarking for training and inference | Reference models and datasets | Reference implementations | Governance worth copying: a Closed division that fixes the model and optimiser, an Open division that must document every deviation, and up to two audited submissions per round |

## Choosing a benchmark for a decision

| Your decision | Look at | Do not rely on |
| --- | --- | --- |
| Which model for a coding agent product | SWE-bench Verified plus Terminal-Bench, with cost per task, then your own repository tasks | HumanEval, which is saturated and heavily contaminated |
| Which model for customer support automation | τ-bench or τ²-bench for reliability across repeats, then your own transcripts | Any single-turn quiz |
| Which model for research assistance | GPQA Diamond, HLE, and a browsing benchmark such as GAIA | MMLU |
| Whether a new model is genuinely better at maths | FrontierMath and dated contest problems | GSM8K or MATH, both saturated |
| Whether an agent can do a paid job | GDPval-style expert comparison on your own deliverables | Any accuracy benchmark |
| Whether a model is safe to deploy | Capability evals plus red-teaming plus monitoring | Any benchmark alone |
| Which hardware to buy | MLPerf | Any model-quality benchmark |

## Saturation is the normal end state

Every general benchmark in the first two tables above was, at release, described as hard. The
pattern is consistent enough to plan for.

<!-- figure: lifecycle -->


| Stage | What you see | What to do |
| --- | --- | --- |
| Release | Frontier models score near chance or far below expert level | Report raw scores with intervals |
| Useful life | Scores spread across a wide band and rank models consistently | This is the window where the benchmark earns its keep |
| Compression | Top models cluster within a few points, and gaps fall inside the confidence intervals | Stop ranking with it; report it as a floor check |
| Ceiling | Scores approach the label-error rate of the dataset | Retire it, or replace it with an audited version |

MMLU illustrates the last stage precisely. When an audit finds errors in 6.49% of items
([Gema et al. 2024](https://arxiv.org/abs/2406.04127)), a reported 95% cannot be distinguished from
a perfect model that disagrees with the wrong labels. The score has stopped measuring the model.
