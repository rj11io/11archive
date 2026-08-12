# Building your own evaluation suite

## Why bother, when public benchmarks exist

Because a public benchmark measures a different task than yours. GPQA measures graduate science
questions. Your product summarises support tickets in three languages under a 400 millisecond
budget. A model that gains four points on GPQA may get worse at your job, and you will not find out
from the leaderboard.

Two more reasons, both practical:

- **Public benchmarks are contaminated and saturated.** Your traffic is neither.
- **You need a regression gate.** Model providers update models. Prompts get edited. Without a suite
  you run, you learn about breakage from customers.

The bar is lower than people assume. Twenty to fifty tasks drawn from real failures give you more
decision value than any public score, because early changes produce large, visible effects
([Anthropic engineering](https://anthropic.com/engineering/demystifying-evals-for-ai-agents)).

## Step 0: error analysis first

Do not start by choosing metrics. Start by reading your own outputs.

The loop, as practitioners describe it: pull about 100 real traces, read them, write a one-line note
on what went wrong in each, then group the notes into categories and count. It takes a couple of
hours and teaches more than months of speculation
([Hamel Husain, Your AI Product Needs Evals](https://hamel.dev/blog/posts/evals/)).

You get three things out of it:

| Output | Use |
| --- | --- |
| A ranked list of failure categories with counts | Tells you what to measure, in priority order |
| Concrete failing examples | Become your first test cases, verbatim |
| A sense of what "good" means here | Becomes your rubric |

This is the step teams skip, and skipping it produces suites that measure things nobody was getting
wrong.

## The build, in ten steps

| Step | Action | Done when |
| --- | --- | --- |
| 1 | Write the success criteria in plain sentences, one per failure category from your error analysis | Two colleagues reading a criterion agree on which outputs pass |
| 2 | Turn your worst real failures into test cases, unchanged | You have 20 to 50 cases and every one came from reality |
| 3 | Add negative cases: inputs where the behaviour must *not* happen | The set is roughly balanced, so the system cannot win by always acting |
| 4 | Add edge cases: empty input, very long input, irrelevant input, ambiguous input, wrong language | Each case has an expected behaviour written down |
| 5 | Write a reference answer or reference outcome for every case | Every case is provably solvable, and the graders can be tested |
| 6 | Choose the cheapest grader that works, per case | Code where possible, model grader where not, human for calibration |
| 7 | Validate the graders with negative and positive controls | An empty output, a known-wrong output, and a valid unusual output all score correctly |
| 8 | Fix the protocol: prompt template, settings, samples per case, isolation | Two runs on unchanged input give the same result within the noise you expect |
| 9 | Wire it into continuous integration with a threshold | A pull request that breaks a criterion fails before merge |
| 10 | Name an owner and a refresh cadence | New production failures land in the suite within a week |

## Choosing a grader per case

Work down this ladder and stop at the first row that fits. Each row down costs more and is less
reproducible.

| Grader | Fits when | Example |
| --- | --- | --- |
| Exact or normalised match | There is one right answer | Extracted invoice total equals 1,428.50 |
| Programmatic check | Correctness is a computable property | Output is valid JSON matching the schema; the ticket status in the database is now "closed" |
| Unit tests | The output is code | The generated patch passes the repository's tests |
| Constraint check | The requirement is about form | Reply is under 120 words and contains no phone number |
| Model grader with a rubric | Quality is subjective but describable | "Does the summary state the customer's requested action?" scored yes or no with a reason |
| Model pairwise comparison | You are comparing two systems, not scoring one | Which reply would a support lead rather send? |
| Human expert | The judgement needs professional skill, or you are calibrating | A clinician reviews 50 care-plan drafts |

Two rules for model graders:

- **Ask one question at a time.** A judge asked for a single 1-to-10 quality score produces noise.
  A judge asked "does this summary state the requested action, yes or no", repeated per dimension,
  produces a usable measurement.
- **Calibrate, then re-calibrate.** Hold out human-labelled cases, report the agreement rate, and
  re-check it whenever you change the judge model or the rubric. A silent drop in agreement is a
  silent change in every number you report.

## What to measure, beyond quality

A quality-only suite pushes you into a slow, expensive product.

| Dimension | Metric | Gate example |
| --- | --- | --- |
| Quality | Pass rate per criterion, with a standard error | No criterion drops more than 3 points against the previous release |
| Reliability | pass^k over 3 to 5 trials on the same cases | pass^3 above 90% on the critical path |
| Cost | Tokens and currency per task, at the median and the 95th percentile | Median cost per task under $0.02 |
| Latency | Wall clock per task, median and 95th percentile | 95th percentile under 4 seconds |
| Safety | Refusal rate on the negative set, and over-refusal on the positive set | Zero harmful completions, over-refusal under 2% |
| Coverage | Share of live failure categories represented in the suite | Every category with more than 5 incidents has a test |

Report all six every run. The pattern to watch for is a quality gain paid for with a cost or latency
regression that nobody priced.

## How many cases do you need?

It depends on the size of change you need to detect, and the arithmetic is in
[03-statistics-and-uncertainty.md](03-statistics-and-uncertainty.md). Two rules of thumb from that
section:

- To detect a 3 percentage point difference between two systems at conventional significance and
  power, you need something on the order of 1,000 items.
- With 500 items you can detect roughly 6 percentage points under typical assumptions.

That is not a reason to wait until you have 1,000 cases. It is a reason to be honest about what a
50-case suite can tell you: it catches breakage, not small improvements. Use a small suite as a
tripwire and a larger sampled set when you need to measure a real difference.

## Continuous integration

| Practice | Why |
| --- | --- |
| Run the fast subset on every pull request | Catches prompt edits that break behaviour |
| Run the full suite nightly and on release candidates | Model-graded cases cost money; do not pay per commit |
| Pin the model version in the test configuration | Otherwise a provider-side update looks like your bug |
| Store every transcript as a build artifact | You cannot debug an eval failure from a pass rate |
| Fail on a criterion regression, warn on aggregate movement | Aggregate scores drift; specific criteria breaking is a real signal |
| Re-run flaky cases and record the flakiness rather than hiding it | A case that passes 3 times in 5 is telling you about reliability |

## A worked specification

A minimal but complete spec for a real feature, as an example of the level of detail to aim for.

**Feature:** summarise a support ticket thread into a handover note for the next agent.

| Field | Value |
| --- | --- |
| Construct | Does the note let the next agent act without reading the thread? |
| Cases | 60, drawn from real threads: 40 typical, 10 edge (very long, mixed language, no clear request), 10 negative (threads where no handover is warranted) |
| Reference | A handover note written by a senior support agent for each case |
| Graders | Programmatic: note under 150 words, contains no card number pattern. Model rubric, one call per dimension: states the customer's requested action; states what has already been tried; states the next step. Pairwise model comparison against the senior agent's note. Human: 15 cases reviewed monthly by a support lead |
| Protocol | Fixed prompt template v7, temperature 0.2, 3 samples per case, fresh context per case |
| Metrics | Per-dimension pass rate with standard error, pass^3, median and 95th percentile cost and latency, redaction failures (must be zero) |
| Gates | Any dimension below 92%, or any redaction failure, blocks release |
| Calibration | Model-rubric agreement with the support lead's labels, measured monthly, must stay above 0.85 |
| Owner | Named person, reviewed quarterly |

## Mistakes small teams make

| Mistake | Fix |
| --- | --- |
| Writing test cases from imagination | Take them from logs and support tickets |
| One vague "quality" score from a judge | One yes-or-no rubric question per dimension |
| No negative cases | Half your value is proving the system stays quiet when it should |
| Never reading transcripts | Read them. Grader bugs are invisible in aggregates |
| Comparing this week's number to a number produced with a different prompt | Version the protocol and refuse cross-version comparisons |
| Letting the suite rot after launch | Owner, cadence, and a rule that every incident adds a case |
| Optimising against the suite until it passes | Keep a held-out set you do not iterate against, and rotate it |

The last one deserves emphasis. The moment you tune prompts against your eval set, that set stops
measuring generalisation and starts measuring fit. Hold back a portion, look at it rarely, and treat
a gap between the two as your overfitting estimate.
