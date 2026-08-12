# Judges and human evaluation

## When there is no single right answer

Multiple choice has a key. A summary, a legal memo, or a bedside manner does not. For those you need
a judge, and the judge becomes part of the instrument. A biased ruler produces biased measurements
no matter how many things you measure with it.

Three families of grader, with the trade-offs stated plainly. The definitions follow Anthropic's
agent-evaluation guidance ([Anthropic engineering](https://anthropic.com/engineering/demystifying-evals-for-ai-agents)).

| Grader | How it decides | Strengths | Weaknesses | Use for |
| --- | --- | --- | --- | --- |
| Code-based | String match, unit tests, static checks, database state, tool-call inspection | Fast, cheap, deterministic, reproducible | Only works where success is expressible in code. Rejects valid unusual answers | Anything checkable. Always prefer this |
| Model-based | A model scores against a rubric, asserts in natural language, or picks between two answers | Handles open-ended work and scales | Has systematic biases; needs calibration; costs money per item | Open-ended quality, at scale, after calibration |
| Human | Expert review, crowd rating, spot checks | The reference standard | Slow, expensive, inconsistent between raters | Calibrating the other two, and final sign-off |

The correct architecture is all three: code where possible, a model grader calibrated against
humans where code cannot reach, and a human sample to keep the model grader honest.

## Model graders: how good are they?

Good enough to use, and biased enough to need controls.

On MT-Bench and Chatbot Arena, a strong model judge agreed with human raters more than 80% of the
time, which is about the rate at which the humans agreed with each other
([Zheng et al. 2023](https://arxiv.org/abs/2306.05685)). That is the case for using them.

The case for controlling them is that the biases are catalogued. The CALM framework quantified
twelve, measured as a "robustness rate", the share of cases where the judge's verdict survives an
irrelevant change ([Ye et al. 2024](https://arxiv.org/abs/2410.02736)):

| Bias | What triggers it |
| --- | --- |
| Position | Which answer appears first |
| Verbosity | Longer answers preferred regardless of quality |
| Self-enhancement | The judge prefers text from its own model family |
| Compassion fade | Named models treated differently from anonymous ones |
| Bandwagon | Told that most people prefer one answer |
| Distraction | Irrelevant added detail |
| Fallacy oversight | Checks the final answer and ignores broken reasoning |
| Authority | Fake citations increase credibility |
| Sentiment | Emotional tone shifts the score |
| Chain of thought | Asking for reasoning changes the verdict |
| Refinement aware | Told an answer was "improved" |
| Diversity | Demographic cues in the content |

Two more structural problems:

- **Non-transitivity.** A judge can prefer A over B, B over C, and C over A, which breaks any
  ranking built from pairwise judgements
  ([Investigating Non-Transitivity in LLM-as-a-Judge, 2025](https://arxiv.org/abs/2502.14074)).
- **Correlation with the thing being measured.** A judge that shares training lineage with the model
  under test is not an independent instrument.

## Controls that work

Apply these before trusting a model grader.

| Control | What it fixes | How |
| --- | --- | --- |
| Swap and average | Position bias | Run every pair twice with the order reversed; count a win only if it survives both |
| Length control | Verbosity bias | Correct for answer length statistically, as the length-controlled version of AlpacaEval does, or cap length in the prompt |
| Rubric per dimension | Vague, single-number judging | Score accuracy, completeness, and tone separately with explicit criteria, one judge call per dimension |
| Reference answer in the prompt | Drift and leniency | Give the judge a known-good answer to compare against |
| Pairwise instead of absolute | Unstable numeric scales | "Which is better" is more reliable than "score this 1 to 10" |
| Different judge family | Self-enhancement | Never let a model family grade its own outputs in a competitive comparison |
| Report agreement with humans | Everything above | Hold out a human-labelled set; report agreement, and treat a fall in agreement as a broken grader |
| Read the transcripts | Silent grader failure | You cannot know a grader works without reading its decisions on many trials |

**Reporting rule.** A model-graded result without a stated agreement rate against human labels is
not a measurement. Publish the agreement, the size of the human-labelled set, and the agreement
statistic used.

## Human evaluation

Human raters are the reference, not the truth. They disagree, drift, and can be gamed by
presentation.

| Practice | Why |
| --- | --- |
| Write the rubric before collecting ratings | A rubric written after seeing outputs encodes the outputs |
| Blind the raters to which system produced which output | Otherwise brand expectation leaks into the score |
| Measure agreement between raters and report it | Low agreement means the task, not the systems, is the problem |
| Use domain experts where the task needs domain judgement | Crowd raters cannot score a nursing care plan |
| Prefer pairwise comparison against a reference deliverable | Easier and more stable than absolute scoring |
| Publish rater qualifications and payment | Both affect quality and both are usually hidden |

GDPval is a good template. Tasks were built by professionals averaging about 14 years of experience,
and grading is a blinded pairwise comparison: an expert sees the task and two unlabelled
deliverables, one from the model and one from a human, and ranks them without knowing which is
which ([OpenAI 2025](https://openai.com/index/gdpval/)). That design controls brand expectation and
produces a directly interpretable result.

## Preference arenas

A preference arena shows an anonymous pair of answers to a real user, records the vote, and fits a
rating. Chatbot Arena, now LMArena, is the widely cited one
([Chiang et al. 2024](https://arxiv.org/abs/2403.04132)).

### What the rating is

Votes are fitted with a **Bradley-Terry model**, a standard statistical model for pairwise contests
that estimates one strength number per player from win and loss records. Intervals come from
bootstrap resampling.

### Its four assumptions, and how each breaks

| Assumption | Reality |
| --- | --- |
| A model's strength is fixed while the votes are collected | Models are updated, and routing and system prompts change |
| The order of matches does not matter | Traffic mix shifts over time, so early and late votes are not the same experiment |
| Preferences are transitive | Pairwise preference can cycle |
| Votes are representative of the use you care about | Arena traffic is whatever arena users type, which is not your workload |

### What the numbers actually say

The top few models routinely sit inside each other's confidence intervals, so their rank order is
partly noise. An arena ranking is a coarse instrument: it separates tiers reliably and adjacent
positions unreliably.

### The selective-disclosure problem

A 2025 study of the arena reported structural advantages for a few providers. It found that some
labs tested many private variants before release and disclosed only the best result. One example
given: 27 Llama 4 variants tested privately between January and March 2025, with a single score
published at launch. It also reported that two providers each received roughly 19% to 20% of arena
data, against about 30% for 83 open models combined
([Singh et al. 2025](https://arxiv.org/abs/2504.20879)). LMArena published a response disputing the
size of the effect and stating that any lab may submit as many variants as it can run
([LMArena response](https://news.lmarena.ai/our-response/)).

Whatever the true size of the effect, the mechanism is not in dispute and it generalises: **if a
participant can run a test many times and publish only the best result, the published result is a
maximum, not an estimate.** The fix is procedural.

| Fix | Effect |
| --- | --- |
| Disclose every run, including withdrawn ones | Removes selection |
| Limit submissions per model version | Caps the maximum-taking |
| Pre-register which variant will be scored | Removes post-hoc choice |
| Publish per-provider data volumes | Makes the fitting asymmetry visible |

### What arenas cannot tell you

They measure what a voter prefers after reading two answers for a few seconds. That is a real and
useful signal about presentation, tone, and apparent helpfulness. It is not a measure of
correctness, and a well-formatted wrong answer wins votes. Never use an arena rating as evidence of
factual accuracy, and never use it alone for a purchase decision.
