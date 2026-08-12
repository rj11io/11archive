# Executive brief

## The main result

A benchmark score is not a measurement until three things travel with it: what the benchmark was
built to measure, how the number was produced, and how wide the uncertainty around it is. Most
published scores carry none of the three, and the gap is not a detail. It routinely reverses
conclusions.

Three concrete demonstrations, each from a published source:

**Uncertainty reverses a model choice.** In the worked example that opens Anthropic's statistical
treatment of evals, one model leads on one benchmark and trails on two others. A reader picks the
second model. Once the differences are tested properly, using per-question paired differences and
standard errors adjusted for questions that arrive in groups, only the first benchmark's gap
survives. The other two are noise. The careful reading picks the opposite model
([Miller 2024](https://arxiv.org/abs/2411.00640)).

**The scoring harness reverses a ranking.** Formatting choices that a human would call
meaningless, such as which separator sits between a question and its answer, moved accuracy by up
to 76 points on one open model, and reordered models against each other
([Sclar et al. 2024](https://arxiv.org/abs/2310.11324)).

**The grader inflates the score.** An audit of ten agent benchmarks found evaluation designs that
overstated performance by up to 100% in relative terms. One benchmark's checker counted an empty
response as a success. Another's tests were too thin to catch a wrong patch
([Zhu et al. 2025](https://arxiv.org/abs/2507.02825)).

None of these are exotic. They are the normal condition of published AI benchmarking.

## What follows for you

- **If you publish scores:** report standard errors, say how many times you sampled each
  question, publish your exact prompts and scoring code, and never compare a number you produced
  against a number someone else produced with a different harness.
- **If you read scores:** treat any leaderboard gap smaller than a few points as unresolved
  unless the page shows an interval. Check whether the test set is public. If it is, the score
  may partly measure memorisation.
- **If you buy models:** build a small private eval on your own task distribution. Twenty to
  fifty real cases beat any public benchmark for a purchase decision, because a public benchmark
  measures a different task than yours.
- **If you build benchmarks:** decide first what you claim to measure, then design tasks that are
  solvable only by the thing you claim to measure. Hold back a private split. Plan the sample
  size before you commission the questions.

## The ten rules

Each rule links to the section that argues it.

| # | Rule | Why it matters | Section |
| --- | --- | --- | --- |
| 1 | Name the construct before the task | A benchmark that claims to measure "reasoning" but scores multiple-choice recall will be read as the former and used as the former | [01](01-what-a-benchmark-measures.md) |
| 2 | Publish the whole measurement chain | Prompt, temperature, sampling count, answer extraction, and scoring code each change the number | [01](01-what-a-benchmark-measures.md), [03](03-statistics-and-uncertainty.md) |
| 3 | Put an error bar on every score | Without one, a reader cannot tell a real gain from run-to-run variation | [03](03-statistics-and-uncertainty.md) |
| 4 | Compare models per question, not per average | Paired differences are free precision, roughly a third less variance at a typical correlation | [03](03-statistics-and-uncertainty.md) |
| 5 | Assume the public test set leaked | Then design around it: private splits, fresh items, and dated problems | [04](04-contamination-and-saturation.md) |
| 6 | Retire a benchmark when it saturates | A score of 96% with a 6% label-error rate measures the labels, not the model | [04](04-contamination-and-saturation.md) |
| 7 | Calibrate every automated judge against humans | A model grader has known, measurable biases; agreement with experts is the only defence | [05](05-judges-and-human-evaluation.md) |
| 8 | Report cost and reliability beside accuracy | An agent that wins by calling the model 50 times is not better, it is more expensive | [06](06-agentic-evaluation.md) |
| 9 | Verify the grader before trusting the task | Most agent-benchmark inflation comes from the checker, not the tasks | [06](06-agentic-evaluation.md) |
| 10 | Write down what the benchmark cannot tell you | The limitation section is the part a decision-maker needs and the part usually missing | [10](10-anti-patterns-and-reading-a-leaderboard.md) |

## Reading a score in 60 seconds

Nine questions, in the order that kills a bad number fastest.

| Order | Question | Bad answer |
| --- | --- | --- |
| 1 | What exactly is the task, in one sentence? | The page only names a capability, such as "reasoning" |
| 2 | How many items? | Fewer than a few hundred, with no interval reported |
| 3 | Is there an error bar or confidence interval? | No |
| 4 | Is the test set public? | Yes, and no fresh or private split exists |
| 5 | Who grades, and how? | A model judge with no reported agreement against humans |
| 6 | How many samples per item, at what temperature? | Not stated |
| 7 | Was the harness the same for every model compared? | Numbers copied from different papers into one table |
| 8 | What does it cost per task? | Not reported, on an agent benchmark |
| 9 | Who funded and who had early access? | Undisclosed, or the top-scoring lab also paid for it |

Any single bad answer is a reason to widen your uncertainty, not to discard the score. Four or
more, and the number carries no decision weight.

## What changed between 2024 and 2026

| Shift | Evidence |
| --- | --- |
| Static knowledge tests stopped discriminating | The Hugging Face Open LLM Leaderboard retired its first suite in June 2024 because frontier models had topped it out, then archived the replacement too |
| Benchmarks started holding back private splits | FrontierMath keeps its full set private and publishes 12 sample problems; ARC-AGI keeps a private evaluation set |
| Agent evaluation became the frontier, and the harness became the bottleneck | Princeton's Holistic Agent Leaderboard ran 21,730 agent attempts across 9 models and 9 benchmarks for about $40,000 and published every log |
| Cost entered the score | Artificial Analysis publishes cost and latency per task beside its index; the agent literature now argues for accuracy-versus-cost curves rather than single points |
| Benchmark quality itself became a research subject | BetterBench scored 24 benchmarks against 46 lifecycle criteria; the Agentic Benchmark Checklist audited ten agent benchmarks and found validity failures in all of them |
| Models began recognising that they are being tested | Frontier models sometimes state in their own reasoning that a scenario looks like an evaluation, which weakens any behavioural test that assumes the model does not know |

## The one-line version

Treat an eval as an experiment, not a contest. Everything else in this report follows from that.
