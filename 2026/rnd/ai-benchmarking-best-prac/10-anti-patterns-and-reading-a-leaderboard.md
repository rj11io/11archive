# Anti-patterns, and how to read a leaderboard

## The failure catalogue

Twenty-six ways a benchmark result misleads. Each row gives the symptom you can spot from outside,
the fix, and where in this report the argument sits. Sort by area if you are auditing one part of a
claim.

| ID | Area | Failure | Symptom you can spot | Fix | Section |
| --- | --- | --- | --- | --- | --- |
| A1 | Reporting | Score with no uncertainty | A percentage to one or two decimals, no interval, no n | Publish the standard error and n | [03](03-statistics-and-uncertainty.md) |
| A2 | Reporting | Ranking on gaps smaller than the noise | "Slightly ahead", "narrowly leads", table sorted by a 0.4-point gap | Report the paired difference and its interval; call overlapping results indistinguishable | [03](03-statistics-and-uncertainty.md) |
| A3 | Reporting | Numbers from different harnesses in one table | Footnotes citing several different papers for one column | Re-run every system yourself under one harness, or do not put them in one table | [03](03-statistics-and-uncertainty.md) |
| A4 | Reporting | No stated limitations | The write-up has no section describing what the result cannot support | Write the limitation section; it is the part a decision-maker needs | [01](01-what-a-benchmark-measures.md) |
| A5 | Reporting | Undisclosed funding or early access | A benchmark whose top scorer also paid for it, with no conflict statement | Disclose funding, access, and data-use terms at publication | [04](04-contamination-and-saturation.md) |
| A6 | Selection | Cherry-picked suite | The benchmark set was chosen by the party making the claim, and no unfavourable benchmark appears | Ask who chose the suite; require a pre-registered set or a standard one | [01](01-what-a-benchmark-measures.md) |
| A7 | Selection | Best-of-many disclosure | Only one variant's score is published, with no count of how many were tried | Disclose every run including withdrawn ones, or limit submissions per version | [05](05-judges-and-human-evaluation.md) |
| A8 | Selection | Tuning against the eval set | The suite is also the development target, with no held-out split | Hold back a split you rarely look at; the gap is your overfitting estimate | [09](09-build-your-own-eval-suite.md) |
| A9 | Statistics | Clustering ignored | A reading-comprehension or multilingual benchmark reporting a plain standard error | Cluster on the sampled unit; the correction reached 3x on a real eval | [03](03-statistics-and-uncertainty.md) |
| A10 | Statistics | Unpaired comparison | Two averages with separate intervals, no per-question analysis | Take per-question differences; roughly a third less variance for free | [03](03-statistics-and-uncertainty.md) |
| A11 | Statistics | Underpowered eval | A 200-item benchmark used to argue a 2-point improvement | Compute the minimum detectable effect first | [03](03-statistics-and-uncertainty.md) |
| A12 | Statistics | Temperature lowered to steady the numbers | "We used temperature 0 to reduce variance" | Do not. It can triple the irreducible spread and shift the mean | [03](03-statistics-and-uncertainty.md) |
| A13 | Statistics | Standard error pooled over all samples | An interval that shrinks when they resample the same questions more | Compute the error across question-level means | [03](03-statistics-and-uncertainty.md) |
| A14 | Aggregation | Averaging benchmarks with different chance baselines | A mean of a 4-option multiple-choice score and a free-text score | Normalise chance to 0 and perfect to 100 before averaging | [03](03-statistics-and-uncertainty.md) |
| A15 | Aggregation | Totalling percentages or ratios | A "Total" row under a column of rates | Total only additive, non-overlapping counts | [03](03-statistics-and-uncertainty.md) |
| A16 | Aggregation | Undisclosed index weights | A single "intelligence" number with no published composition | Publish the components and their weights | [02](02-benchmark-catalog.md) |
| A17 | Validity | Construct named broader than the task | A multiple-choice set presented as measuring "reasoning" | State the construct and what it excludes; describe the task in the claim | [01](01-what-a-benchmark-measures.md) |
| A18 | Validity | Task solvable by a shortcut | The answer is reachable from a file in the environment, or from the question's phrasing | Run the shortcut hunt; audits found up to 100% relative overstatement | [06](06-agentic-evaluation.md) |
| A19 | Validity | Grader accepts non-answers | An empty or truncated output scored as success | Negative controls: empty, wrong, and partial outputs must all fail | [06](06-agentic-evaluation.md) |
| A20 | Validity | Answer-extraction failures counted as model failures | A correct answer in an unexpected format scored wrong | Publish and test the extraction rule; report extraction failures separately | [01](01-what-a-benchmark-measures.md) |
| A21 | Validity | Human baseline missing or unexplained | "Above human level" with no description of which humans, or how long they had | State who the humans were, their expertise, and their conditions | [06](06-agentic-evaluation.md) |
| A22 | Contamination | Public test set treated as evidence of generalisation | A claim about generalisation on a benchmark that has been on the open web for two years | Use a private split, dated items, or a fresh set | [04](04-contamination-and-saturation.md) |
| A23 | Contamination | Saturated benchmark still used to rank | Top models within a point of each other, near the ceiling | Retire it, or report it as a floor check only | [04](04-contamination-and-saturation.md) |
| A24 | Judging | Model judge with no human calibration | A model-graded score with no agreement rate reported | Hold out human labels, report agreement, re-check after any judge change | [05](05-judges-and-human-evaluation.md) |
| A25 | Judging | Judge shares lineage with a contestant, or order effects uncontrolled | One provider's model both competes and grades; single-order comparisons | Use an independent judge family; swap positions and require the win to survive both | [05](05-judges-and-human-evaluation.md) |
| A26 | Agents | Accuracy without cost or reliability | An agent leaderboard with one accuracy column | Report cost per task and pass^k, and plot accuracy against cost | [06](06-agentic-evaluation.md) |

## Two failure modes specific to safety claims

| Failure | Symptom | Fix |
| --- | --- | --- |
| Weak elicitation behind a reassuring number | A dangerous-capability score reported without describing the scaffold, tools, step limits, or prompt iterations | Publish the elicitation effort. A low score only means something if you tried hard for a high one |
| Behavioural test invalidated by the model noticing | A propensity result with no mention of whether the model recognised the setting | Measure and report the evaluation-awareness rate; use production-like environments |

Both are argued in [07-safety-and-frontier-risk-evals.md](07-safety-and-frontier-risk-evals.md).

## Reading a leaderboard, step by step

Take any leaderboard page and work through this. It takes about two minutes and usually changes what
you conclude.

| Step | Look for | If it is missing |
| --- | --- | --- |
| 1 | The composition: which benchmarks, at what weights | You cannot interpret the number. Stop, and go to the component scores |
| 2 | Intervals or error bars on the leading rows | Assume the top group is a tie |
| 3 | The harness: did the leaderboard run every model, or collect claims? | Collected claims are not a comparison |
| 4 | Repeats per item and temperature | Assume the numbers are noisier than shown |
| 5 | Whether any test set is private or date-filtered | Assume contamination inflates absolute scores |
| 6 | Cost and latency columns | On an agent leaderboard, the ranking is incomplete without them |
| 7 | Submission policy: how many variants per provider, and are withdrawals published? | Treat top scores as maxima, not estimates |
| 8 | Date of the run, and version pins | An undated leaderboard is a snapshot of nothing |

Then apply the one-sentence test: **write down the claim the leaderboard supports, in your own
words, without using the word "best".** If you cannot write a sentence that survives the eight
checks above, the page is entertainment.

## Questions to ask a vendor

For a procurement conversation, in order of how quickly they separate serious answers from marketing.

| # | Question | A good answer sounds like |
| --- | --- | --- |
| 1 | Which of your published numbers did you produce, and which did you copy? | A clear split, with the harness named for each |
| 2 | What is the standard error on your headline result? | A number, and n |
| 3 | Can you run your suite on my data? | Yes, and here is what we need |
| 4 | What does one task cost, at the median and the 95th percentile? | Two numbers in currency |
| 5 | How often does it succeed on the same task across five tries? | A pass^5 figure |
| 6 | Which benchmark do you do worst on, and why? | A specific benchmark and an honest diagnosis |
| 7 | What did your last regression catch? | A concrete story |
| 8 | Who graded your open-ended results, and what was their agreement with human experts? | A model grader plus an agreement rate, or human experts with qualifications |
| 9 | What is not tested? | A list |

Question 6 is the highest-yield. A vendor who cannot name a weakness has not measured carefully.

## The shortest version

A benchmark result is a claim about a measurement. Ask what was measured, how, with what
uncertainty, by whom, and at what cost. Five questions. Most published claims fail on at least two,
and knowing which two is usually enough to decide how much weight to give the number.
