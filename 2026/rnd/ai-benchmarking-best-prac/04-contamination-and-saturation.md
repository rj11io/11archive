# Contamination and saturation

## The two ways a benchmark dies

**Contamination** is test material reaching the model during training. The model then partly
remembers answers instead of working them out, and the score overstates its ability.

**Saturation** is the benchmark running out of headroom. Scores bunch near the top, differences
fall inside the noise, and the remaining gap is often just the dataset's own wrong labels.

Both are normal. A benchmark is a consumable, like a set of exam papers: useful once, then leaked.
Planning for that is the practice, not preventing it.

## How contamination happens

You do not need anyone to cheat. Five ordinary paths:

| Path | Example |
| --- | --- |
| The benchmark is published on the open web | Any dataset on a public hosting site gets crawled |
| The source material is public and the benchmark is drawn from it | SWE-bench issues come from public GitHub repositories that providers already train on |
| People discuss the items online | Forum threads quoting hard questions with worked answers |
| Solutions ship with code | Competition solutions live in public repositories |
| Someone mirrors the file | Copies escape whatever access control the original had |

The clearest published demonstration comes from OpenAI's work building SWE-bench Verified. While
reviewing the original benchmark, they found that every frontier model they tested could reproduce
the original human-written fix, or the exact wording of problem statements, for at least some tasks.
That is direct evidence of exposure during training
([OpenAI 2024, introducing SWE-bench Verified](https://openai.com/index/introducing-swe-bench-verified/)).

## Detecting it

No method is conclusive for a model whose training data you cannot inspect, which means every
commercial model. Use several, and treat the result as a probability rather than a verdict.

| Method | How it works | Limits |
| --- | --- | --- |
| Overlap search | Look for exact or near-exact matches between test items and training text, typically with n-grams. GPT-2's report measured contamination as the share of 8-grams from an evaluation set also present in training | Needs access to the training corpus. Misses paraphrases and translations |
| Canary strings | The dataset embeds a unique marker so anyone can grep a corpus, or ask a model to reproduce it. BIG-bench introduced this convention | Only proves inclusion when the marker survives; a filter can strip it |
| Perturbation test | Change surface details that do not change the answer, then compare. A large drop suggests memorisation | A real ability can also be format-sensitive, so a drop is suggestive rather than proof |
| Date split | Score items published before and after the model's training cutoff separately. LiveCodeBench is built on this | Needs trustworthy cutoff dates, and later items may differ in difficulty |
| Ask the model to continue the item | Give the first half of a question and see whether it completes the rest verbatim | Weak evidence on its own; a fluent model can guess plausible continuations |
| Held-out comparison | Score a private set alongside the public one. A gap is the contamination estimate | Requires having built a private set in advance |

The last row is the only one that gives a number you can act on, and it can only be done by whoever
built the benchmark. That is the argument for building private splits.

## Designing against it

Six defences, in rough order of strength.

| Defence | Example in the wild | Cost |
| --- | --- | --- |
| Keep the whole set private, publish only samples | FrontierMath keeps 338 problems private and publishes 12 as samples | You must run every evaluation yourself, or trust a submission process |
| Keep a private evaluation split | ARC-AGI keeps a private set; GAIA withholds test-split answers and scores submissions | Ongoing maintenance and submission handling |
| Date every item and score only post-cutoff items | LiveCodeBench tags problems with their publication date | Comparability across time needs pinned versions |
| Refresh items on a schedule | Live benchmarks rotate in new questions regularly | Every refresh breaks comparison with earlier runs unless versioned |
| Generate items procedurally | Template-generated tasks with randomised content | Generated items often measure a narrower thing than they appear to |
| Canary string plus a licence term asking for exclusion | BIG-bench | Honour-system only |

Two rules go with all of them:

- **Version and pin.** A live benchmark without version identifiers produces numbers that cannot be
  compared to anything, including its own earlier results.
- **Publish the stance.** A benchmark page should say plainly which of the six defences it uses, or
  that it uses none. A reader cannot infer it.

## The conflict-of-interest problem

Private test sets create a new risk: someone has to hold them, and that party's independence
becomes load-bearing.

FrontierMath is the worked example, in both directions. Epoch AI disclosed only after publication
that OpenAI had funded the benchmark and had access to a subset of problems, with a verbal
agreement not to train on it. Contributing mathematicians said they had not been told, and
critics argued the restriction should have been a written contract
([TechCrunch, 19 January 2025](https://techcrunch.com/2025/01/19/ai-benchmarking-organization-criticized-for-waiting-to-disclose-funding-from-openai/)).
Epoch's co-founder acknowledged that the contract should have allowed more disclosure. The
benchmark page now carries a conflict-of-interest statement, which is the correct end state.

**Practice.** Disclose funding, disclose early access, disclose data-use restrictions, and disclose
them at publication rather than after. Treat any benchmark where the top scorer also paid for the
benchmark as requiring independent replication before it carries weight.

## Saturation and the label-error ceiling

A benchmark cannot measure a model more accurately than its own labels. Once frontier accuracy
approaches the label-error rate, the score measures agreement with mistakes.

MMLU is the clearest case. An audit re-annotated 5,700 questions across all 57 subjects and
estimated errors in 6.49% of the dataset, with 57% of the analysed virology questions affected. The
same work showed that model rankings shift once the errors are fixed
([Gema et al. 2024](https://arxiv.org/abs/2406.04127)).

FrontierMath shows the same problem in a young benchmark, and shows the right response. An audit
found errors affecting 42% of the original problem set. Version 2, released on 12 June 2026,
corrected 123 problems in Tiers 1 to 3 and 12 in Tier 4, and removed 12 problems, leaving 338
([Epoch AI](https://epoch.ai/benchmarks/frontiermath)). Auditing your own benchmark and publishing
the diff is the behaviour to reward.

### Retirement

The Hugging Face Open LLM Leaderboard retired its first six-benchmark suite in June 2024 on the
grounds that it was becoming obsolete and risked pushing the field to optimise things that no
longer mattered. It replaced it with a harder suite, and later archived the whole leaderboard.
Deciding to stop is a maintenance action, not a failure.

Set the trigger in advance. Useful triggers:

| Trigger | Threshold worth using |
| --- | --- |
| Top scores cluster | The best three models sit inside each other's confidence intervals |
| Ceiling reached | Frontier accuracy is within the dataset's estimated label-error rate |
| Contamination confirmed | Post-cutoff items score materially lower than pre-cutoff items |
| No headroom left in the construct | The remaining failures are all label errors or ambiguous items |

## What contamination does not excuse

Two arguments to reject.

**"Everything is contaminated, so benchmarks are useless."** Contamination inflates absolute
scores. It does not automatically destroy comparison, provided every model faces the same exposure
and the same harness. What it does destroy is the claim that a score reflects generalisation.

**"Our model scores well because it generalises."** That is the claim contamination attacks. If you
want it, you need a private split, dated items, or a fresh set. Assertion is not evidence.
