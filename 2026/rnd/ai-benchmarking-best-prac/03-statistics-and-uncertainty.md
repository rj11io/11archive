# Statistics and uncertainty

## An eval is an experiment

The questions in a benchmark are a sample. Somebody could have written different ones. So a
benchmark score is an estimate of how the model would do on the whole imaginable pool of similar
questions, and every estimate has a spread. This framing is the whole of the argument in
Anthropic's statistical treatment of evals, which is the reference this section leans on
([Miller 2024](https://arxiv.org/abs/2411.00640)).

Its five recommendations, quoted in condensed form:

1. Compute standard errors of the mean using the Central Limit Theorem.
2. When questions are drawn in related groups, compute clustered standard errors.
3. Reduce variance by resampling answers and by analysing next-token probabilities.
4. When comparing two models, do the statistics on question-level paired differences, not on the
   summary averages.
5. Use power analysis to decide whether an eval can test the hypothesis you care about at all.

Everything below is those five, made concrete.

## 1. The error bar

For a benchmark scored right or wrong on each of n independent questions, with observed accuracy p:

```
standard error = sqrt( p * (1 - p) / n )
95% interval  = p  ±  1.96 * standard error
```

Worked example, which you can check with a calculator:

| Quantity | Value |
| --- | --- |
| Accuracy p | 0.712 |
| Questions n | 500 |
| p * (1 - p) | 0.205056 |
| Divided by n | 0.000410112 |
| Standard error | 0.02025, that is 2.03 percentage points |
| 95% interval | 67.2% to 75.2% |

So "71.2%" on a 500-question benchmark means "somewhere around 67% to 75%". A rival model at 74%
is not ahead. This is the single most useful arithmetic in the report, and it takes ten seconds.

<!-- figure: overlap -->


**Reporting rule.** Print the standard error next to the score, and print n. A percentage with
three significant figures and no n is false precision.

## 2. Questions that arrive in groups

Many benchmarks bundle several questions per source. Reading-comprehension sets ask five questions
about one passage. Multilingual sets translate one question into many languages. When one passage
is hard, all five of its questions are hard together, so you have fewer independent observations
than you have rows.

Ignoring this makes your interval too narrow, and the effect is large. Measured on real evals with
real models:

| Eval | Clustered standard error | Naive standard error | Ratio |
| --- | --- | --- | --- |
| DROP | 1.34 | 0.44 | 3.05 |
| RACE-H | 0.51% | 0.46% | 1.10 |
| MGSM | 1.62% | 0.86% | 1.88 |

Source: [Miller 2024](https://arxiv.org/abs/2411.00640), Table 4. A reader who took the naive DROP
interval at face value would believe the measurement was three times more precise than it is.

**Reporting rule.** Publish the cluster count beside the question count, and cluster on the unit
that was sampled: the passage, the source document, the language, the repository, the user session.

## 3. Getting a tighter number without more questions

The spread in a score has two parts. One comes from which questions you happened to pick, and you
cannot reduce it except by adding questions. The other comes from the model answering
inconsistently, and that part you can attack.

| Technique | What it does | Effect |
| --- | --- | --- |
| Ask each question K times and average the per-question scores | Removes the model's own answer-to-answer noise | Under a simple model of question difficulty: K = 2 cuts total variance by a third, K = 4 by a half, K = 6 by five ninths, with a ceiling of two thirds |
| Read the probability of the correct answer token instead of sampling text | Removes that noise completely, because the score becomes a number rather than a coin flip | Reaches the two-thirds ceiling at K = 1. Only works when no chain of thought is needed |
| Lower the sampling temperature | Looks like it removes noise | Do not do this |

The temperature warning deserves the space. Lowering temperature does not remove uncertainty, it
moves it somewhere you cannot fix, and it can shift the average as well. In one worked case from
the paper, dropping to temperature 0 turns a spread of 1/12 into a spread of 1/4, tripling the
irreducible part. In a second case the variance rises about fivefold and the expected score moves
from 2/3 to 3/4. Change temperature when you want to study the model at that temperature, never to
tidy up your error bars.

**Reporting rule.** State samples per question (K) and the temperature. Compute the standard error
across question-level means, never across all K times n individual answers, because repeated
answers to one question are not independent observations.

## 4. Comparing two models

Do not subtract two averages and compare their separate intervals. Score both models on the same
questions, take the difference per question, and analyse those differences.

```
paired standard error = sqrt( SE_A^2 + SE_B^2 - 2 * SE_A * SE_B * corr(A, B) )
```

Models agree substantially about which questions are hard, so the correlation term is positive and
the paired error is smaller than the unpaired one. At a correlation of 0.5 the variance drops by
about a third, for free, with no extra compute
([Miller 2024](https://arxiv.org/abs/2411.00640)).

**Reporting rule.** For any model comparison, publish the difference, the paired standard error of
the difference, and the score correlation. If the interval on the difference includes zero, write
that the models are indistinguishable on this eval. Do not write that one "slightly leads".

## 5. Deciding whether the eval can answer your question at all

Before running anything, ask what size of difference the eval could detect. The sample-size
formula, for a paired comparison:

```
n = (z_(alpha/2) + z_beta)^2 * (omega^2 + sigma_A^2 / K_A + sigma_B^2 / K_B) / delta^2
```

where delta is the smallest difference you want to catch, omega^2 is the variance of the
per-question difference in true difficulty, and the sigma terms are the models' own answer noise.

The paper's worked case: to catch a 3 percentage point difference 80% of the time at the 5%
significance level, with the noise terms set to zero and omega^2 = 1/9, you need

```
n = (1.95996 + 0.84162)^2 * (1/9) / 0.03^2 = 7.84885 * 0.111111 / 0.0009 = 969
```

Hence the paper's headline guidance: a new eval should carry at least about 1,000 questions to have
useful signalling ability.

Turned around, for a fixed benchmark size, the smallest difference you can detect is:

```
minimum detectable effect = (z_(alpha/2) + z_beta) * standard error of the difference
```

Worked example you can check: 500 questions, per-question differences with a standard deviation of
0.5, so the standard error of the mean difference is 0.5 / sqrt(500) = 0.02236. Then

```
MDE = (1.95996 + 0.84162) * 0.02236 = 6.3 percentage points
```

A 500-item benchmark cannot resolve a 3-point gap under these assumptions. Most published
model-versus-model tables report gaps smaller than their benchmark can detect.

## 6. Metrics for code and agents

### pass@k

For tasks where any correct solution counts, generate n samples, count c correct, and use the
unbiased estimator from the Codex paper ([Chen et al. 2021](https://arxiv.org/abs/2107.03374)):

```
pass@k = 1 - C(n - c, k) / C(n, k)
```

Two mistakes to avoid. First, do not use `1 - (1 - c/n)^k`, which is biased because it assumes
sampling with replacement. Second, sample n larger than k. The Codex paper used n = 200 for values
of k up to 100.

Worked example: n = 10 samples, c = 3 correct, k = 1 gives pass@1 = 1 - C(7,1)/C(10,1) =
1 - 7/10 = 0.30, which is just c/n. For k = 5: C(7,5) = 21, C(10,5) = 252, so
pass@5 = 1 - 21/252 = 0.9167.

### pass^k, the reliability metric

pass@k rewards a system that succeeds occasionally. Most deployed products need the opposite:
success every time. **pass^k** is the share of tasks solved in all k independent attempts,
introduced by τ-bench ([Yao et al. 2024](https://arxiv.org/abs/2406.12045)).

The two diverge sharply as k grows: pass@k climbs toward 100% while pass^k falls toward 0%. Report
both, or report the one that matches your deployment. A customer-facing agent should be judged on
pass^k.

### Cost and latency as first-class metrics

An agent can raise accuracy by calling the model more times. Reporting accuracy alone therefore
rewards spending, and the fix is to report the pair. See
[06-agentic-evaluation.md](06-agentic-evaluation.md).

## 7. Aggregating across benchmarks

Averaging raw accuracies from benchmarks with different chance baselines is wrong. A 4-option
multiple-choice benchmark gives 25% for free; a free-text benchmark gives 0%.

The Open LLM Leaderboard's second suite normalises first, mapping chance to 0 and perfect to 100:

```
normalised = (raw - chance) / (1 - chance)
```

Worked example: 50% raw on a 4-option benchmark, where chance is 0.25, becomes
(0.50 - 0.25) / 0.75 = 0.333, that is 33.3. The same 50% on a free-text benchmark stays at 50.
Without this step the multiple-choice benchmark contributes twice its earned weight.

Two more aggregation rules from ordinary table practice:

- Never total percentages, ratios, or averages. Totals are only valid for additive, non-overlapping
  counts.
- If you use weights, publish them. Artificial Analysis publishes both the category weights
  (Agents 34%, Coding 24%, Scientific Reasoning 24%, General 18%) and the per-evaluation weights
  inside them. That is the standard to hold an index to.

## 8. The variance the error bars miss

Standard errors describe sampling noise. They say nothing about the choices in the measurement
chain, and those are usually the bigger term.

| Source of variation | Typical size | Captured by a standard error? |
| --- | --- | --- |
| Prompt format, such as which separator sits between fields | Up to 76 accuracy points on one open model ([Sclar et al. 2024](https://arxiv.org/abs/2310.11324)) | No |
| Few-shot example choice and order | Large, and does not shrink with model size, more examples, or instruction tuning | No |
| Log-probability scoring versus generated answers | Different numbers for the same model, not comparable | No |
| Answer extraction rule | Silently converts correct answers into failures | No |
| Harness implementation | Different frameworks give different scores for the same benchmark and model ([Biderman et al. 2024](https://arxiv.org/abs/2405.14782)) | No |
| Question sampling | Computed above | Yes |
| Model answer noise | Reducible by resampling | Yes |

This is why the maintainers of the widely used lm-evaluation-harness argue for sharing exact
prompts, sharing code, versioning datasets, and refusing cross-harness comparison. The honest way
to report a prompt-sensitive result is a range across several plausible formats, not one number
from the format that happened to work.

## The reporting template

Everything above collapses into one table. If a results table has these columns, a reader can do
their own statistics.

| Column | Example |
| --- | --- |
| Benchmark and version | GPQA Diamond, 2023 release |
| Items, and clusters if grouped | 198 items, no clustering |
| Samples per item, temperature | 16 samples, default temperature |
| Scoring mode | Generated answer, exact match after published extraction |
| Score | 78.4% |
| Standard error | 1.6 points |
| Paired difference against the baseline, with its standard error | +2.1 points, standard error 1.2, correlation 0.61 |
| Verdict | Indistinguishable from the baseline at the 5% level |
| Cost per item | $0.11 |
| Harness and commit | Named framework, exact commit |
