# Glossary

Terms are defined as this report uses them. Where a term has a stricter meaning in statistics or
psychometrics, the everyday version is given first.

| Term | Definition |
| --- | --- |
| Accuracy | The share of items scored correct. Only meaningful alongside the number of items and the chance baseline |
| Agent | A system that takes several steps on its own: reading, calling tools, changing state, and deciding when to stop |
| Agent harness | See scaffold |
| Agentic benchmark | A benchmark whose items are multi-step jobs in an environment, graded on the outcome rather than a single answer |
| Aggregation | Turning per-item scores into one number. The step where different chance baselines and unlike groups get illegally averaged |
| Answer extraction | The rule that pulls a gradeable answer out of free-form model text. A frequent source of correct answers scored wrong |
| ARC-AGI | A family of abstract visual puzzle benchmarks that keeps a private evaluation set |
| Benchmark | A fixed set of tasks plus a fixed way of scoring them, used to compare systems |
| Benchmark lottery | The observation that which method looks best depends heavily on which benchmarks the field happens to use |
| Bradley-Terry model | A statistical model that estimates one strength number per competitor from pairwise win and loss records. Used to turn arena votes into ratings |
| Canary string | A unique marker embedded in a benchmark so that anyone can search a training corpus for it, or ask a model to reproduce it, as a contamination check |
| Capability evaluation | A test of whether a system *can* do something. Contrast with propensity evaluation |
| Chance baseline | The score a system gets by guessing. 25% on a 4-option multiple-choice benchmark, 10% on a 10-option one, 0% on free text |
| Closed division | In MLPerf, a submission category that fixes the model, optimiser, and data handling so that only the system underneath varies. Contrast with Open division |
| Clustered standard error | An error bar corrected for items that arrive in groups, such as several questions about one passage. On real evals the correction has reached a factor of three |
| Confidence interval | A range that would contain the true value a stated share of the time if the experiment were repeated. Usually quoted at 95% |
| Construct | The ability or property a benchmark claims to measure, such as "multi-step arithmetic reasoning" |
| Construct validity | Whether the test measures the construct it claims to measure. Borrowed from psychometrics |
| Contamination | Test material reaching a model during training, so its score partly reflects memorisation |
| Coverage | Which parts of the construct, population, or risk taxonomy the benchmark actually touches, and which it does not |
| Criterion validity | Whether the score predicts the real-world outcome you care about |
| Dangerous capability evaluation | A test of whether a model can do something harmful, run to inform a deployment or safeguard decision |
| Datasheet | Structured documentation for a dataset: motivation, composition, collection method, and recommended uses |
| Decontamination | Removing or excluding test items from training data, or filtering results to items known to postdate training |
| Elicitation | The effort spent getting a model to show a capability: prompting, tools, scaffolds, step budgets, and permitted fine-tuning. Central to safety evaluation |
| Elo | A rating system for pairwise contests. Arena ratings are often called Elo but are usually fitted with a Bradley-Terry model |
| Error analysis | Reading a sample of real outputs, writing down what went wrong in each, then grouping and counting. The standard first step in building an in-house suite |
| Eval | One run of an evaluation against one system. Also used loosely for the evaluation itself |
| Evaluation awareness | A model recognising that it is being tested, which weakens any test of how it behaves when it thinks nobody is watching |
| Evaluation harness | The infrastructure that runs an evaluation end to end: supplies prompts and tools, runs items, records transcripts, grades, and aggregates |
| Evaluation suite | A collection of tasks assembled to measure a specific set of capabilities or behaviours |
| Few-shot | Showing the model worked examples in the prompt before the real item. The number, choice, and order of examples all move scores |
| Gate | A threshold in continuous integration that blocks a release when an evaluation criterion regresses |
| Goodhart's law | When a measure becomes a target, it stops being a good measure. The one-line summary of benchmark gaming |
| Grader | The logic that scores an attempt. Code-based, model-based, or human |
| Ground truth | The reference answer or outcome a grader compares against. Wrong ground truth caps a benchmark's usefulness |
| Held-out split | Items withheld from public release, or from your own tuning, so that a score on them measures generalisation |
| Holistic evaluation | Measuring several properties, such as accuracy, calibration, robustness, bias, and efficiency, on the same scenarios rather than accuracy alone |
| Human baseline | How well people do on the same items, under stated conditions. Required for any "human level" claim |
| Inter-annotator agreement | How often two human raters give the same verdict. Low agreement means the task is underspecified, not that the systems are similar |
| Item | One scored unit of a benchmark: a question, a problem, or a task |
| LLM-as-a-judge | Using a language model to grade open-ended outputs. Cheap, scalable, and biased in catalogued ways |
| Label error | A benchmark item whose recorded correct answer is wrong. Sets the ceiling above which scores are meaningless |
| Latency | Wall-clock time to complete an item. Report the median and a tail percentile, not the mean alone |
| Leaderboard | A ranked table of systems. Its composition, harness, and submission policy matter more than its order |
| Length control | Correcting a judge's preference for longer answers, either statistically or by capping length |
| Live benchmark | A benchmark that adds fresh items over time to resist contamination. Needs version pinning to stay comparable |
| Log-probability scoring | Scoring a multiple-choice item by the model's probability for each option token rather than by parsing generated text. Gives different numbers from generation, and the two are not comparable |
| Minimum detectable effect | The smallest difference an evaluation can reliably detect at a given size and power. Compute it before drawing conclusions |
| Model card | Short structured documentation for a trained model: intended use, evaluation conditions, and performance broken down by group and condition |
| Normalisation | Rescaling scores so that chance maps to 0 and perfect to 100, so that benchmarks with different chance baselines can be averaged |
| Open division | In MLPerf, a submission category that permits changes to the workload provided every deviation is documented |
| Outcome validity | Whether the grader reports success exactly when the task was actually solved |
| Paired comparison | Comparing two systems item by item and analysing the differences, rather than comparing two averages. Reduces variance for free |
| pass@k | The probability that at least one of k attempts succeeds. Estimated without bias as 1 minus C(n-c, k) / C(n, k) from n samples with c correct |
| pass^k | The share of tasks solved in every one of k attempts. The reliability metric for unattended deployment |
| Position bias | A judge preferring whichever answer it sees first. Fixed by running both orders and requiring the win to survive both |
| Power | The probability that an experiment detects a real difference of a given size. Conventionally set at 80% |
| Private test set | Items the benchmark holder never publishes, so providers cannot train on them. The strongest contamination defence and the greatest concentration of trust |
| Prompt sensitivity | Score changes caused by formatting choices that do not change meaning. Measured at up to 76 accuracy points on one open model |
| Propensity evaluation | A test of whether a system *will* do something when it has the choice. Contrast with capability evaluation |
| Protocol | Every setting that produces a score: prompt template, system prompt, examples, temperature, samples per item, tools, and step limits |
| Red-teaming | Open-ended adversarial probing by people trying to break the system. Produces findings, not a score |
| Reference solution | A known-good answer or outcome for an item. Proves the item is solvable and lets you test the grader |
| Resampling | Answering each item K times and averaging the per-item scores, to reduce the model's own answer noise |
| Retirement | Deliberately withdrawing a benchmark once it saturates, contaminates, or hits its label-error ceiling |
| Robustness rate | The share of judging decisions that survive an irrelevant change to the input. Used to quantify judge bias |
| Rubric | Explicit written criteria a grader applies. Best used one dimension at a time |
| Sandbagging | A model performing worse than it can, which makes a capability evaluation understate risk |
| Saturation | Frontier scores bunching near a benchmark's ceiling, so it no longer separates systems |
| Scaffold | The code around a model that turns it into an agent: prompts, tool wiring, retries, and step limits. Two systems with the same model and different scaffolds are not comparable |
| Self-enhancement bias | A model judge preferring text produced by its own model family |
| Shortcut | A way to pass a task without the ability being tested. The main threat to task validity |
| Standard error | The expected spread of an estimate. For accuracy p on n independent items, the square root of p times (1 minus p) divided by n |
| Statistical significance | Whether an observed difference is larger than would be expected from noise alone, at a stated threshold |
| Super-population | The imaginary larger pool of questions a benchmark's items are treated as a sample from. The assumption that makes error bars meaningful |
| Task validity | Whether a task is solvable if and only if the system has the target ability |
| Temperature | A sampling setting that controls output randomness. Do not change it to tidy up error bars |
| TEVV | Testing, evaluation, verification, and validation. The term NIST uses for the measurement work in its risk framework |
| Time horizon | The length of task, measured by how long a human expert takes, that a model completes with a stated success rate |
| Transcript | The complete record of one attempt: outputs, tool calls, intermediate results, and reasoning. Also called a trace or trajectory |
| Trial | One attempt at one task. Multiple trials per task are needed because behaviour varies between runs |
| Verbosity bias | A judge preferring longer answers regardless of quality |
| Zero-shot | Giving the model the task with no worked examples in the prompt |
