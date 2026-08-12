# Evaluating agents

## Why agent evaluation is a different problem

A quiz has one input and one output. An **agent** takes many steps: it reads, calls tools, changes
state in the world, and stops when it decides it is done. That adds four failure surfaces a quiz
does not have.

| Surface | The question | What breaks |
| --- | --- | --- |
| Environment | Does the sandbox behave like the real thing, identically every run? | Leftover files, cached state, a flaky network, and a version bump silently change the result |
| Shortcut | Can the task be finished without the ability being tested? | The answer sits in a file the agent can read, so the task measures searching, not solving |
| Grader | Does the checker separate real success from apparent success? | Thin tests pass a wrong patch; a blank answer counts as a pass |
| Cost and variance | How much did it spend, and does it work every time? | A system that succeeds once in five runs at ten times the price looks equal on an accuracy table |

The audit evidence says the grader is the biggest of the four.

## The audit: agent benchmarks overstate performance

The Agentic Benchmark Checklist examined ten widely used agent benchmarks, including SWE-bench
Verified, τ-bench, WebArena, OSWorld, KernelBench, and CVE-Bench. It found validity problems in all
of them, with performance overstated by up to 100% in relative terms. Two concrete examples: a
benchmark whose test cases were too thin to reject an incorrect fix, and one that counted an empty
response as a completed task. Applying the checklist cut CVE-Bench's overestimate by 33%
([Zhu et al. 2025](https://arxiv.org/abs/2507.02825)).

The checklist splits into three parts, and its shape is the most transferable thing in it:

| Part | Criteria | The rule in one line |
| --- | --- | --- |
| Task validity | 10 | The task is solvable if and only if the agent has the target ability |
| Outcome validity | 20 | The grader says "solved" exactly when the task was solved |
| Reporting | Several | Publish enough for someone else to reproduce and re-grade |

### Task validity checks worth running yourself

| Check | How |
| --- | --- |
| Shortcut hunt | Try to pass the task without the ability: grep the environment for the answer, read the test file, look for the reference solution on disk |
| Solvability proof | Write a reference solution for every task. If you cannot, the task may be impossible, and an impossible task quietly caps your ceiling |
| Ambiguity test | Two domain experts, working separately, must reach the same pass or fail verdict. If they do not, the task is underspecified |
| Sufficiency | Confirm the environment actually contains everything the task needs |

### Outcome validity checks worth running yourself

| Check | How |
| --- | --- |
| Negative controls | Feed the grader a known-wrong solution, an empty output, and a partial output. All three must fail |
| Positive controls | Feed the reference solution, plus one valid unusual solution. Both must pass |
| Coverage | Would the tests catch a plausible wrong implementation, not just a syntax error? |
| No step-matching | Grade the outcome, not the exact sequence of steps; agents find valid routes you did not plan |
| Transcript reading | Read the transcripts and grades from many trials. Grader bugs are invisible in aggregate numbers |

## Cost control

Accuracy alone rewards spending. Call the model more times, retry more, search wider, and accuracy
rises. That is not a better agent, it is a bigger bill.

Kapoor and colleagues made the argument directly: agent evaluation has to be cost-controlled, or the
field will produce extremely expensive agents whose only achievement is topping a leaderboard. They
showed simple baseline agents matching much more elaborate architectures on HumanEval at a fraction
of the cost, and argued for plotting results as an accuracy-versus-cost curve so that the two can be
optimised together ([Kapoor et al. 2024](https://arxiv.org/abs/2407.01502)).

<!-- figure: cost-accuracy -->

| Reporting choice | What it encourages |
| --- | --- |
| Accuracy only | Unlimited spending |
| Accuracy at a fixed budget per task | Efficiency at one operating point |
| Accuracy-versus-cost curve | Honest comparison across operating points, and lets a reader pick their own budget |

The infrastructure now exists to do this properly. Princeton's Holistic Agent Leaderboard runs 11
agent benchmarks through one shared harness, reports cost alongside accuracy by default, and was
validated with 21,730 agent attempts across 9 models and 9 benchmarks for about $40,000, with all
logs published ([HAL, 2025](https://arxiv.org/abs/2510.11977)). Publishing the logs is the part to
copy: it lets anyone re-grade the same runs.

Commercial indices have followed. Artificial Analysis computes the cost of each evaluation from
input, cache, reasoning, and output token prices divided by task count, then weights it the same way
it weights the score, and publishes latency per task the same way
([Artificial Analysis methodology](https://artificialanalysis.ai/methodology/intelligence-benchmarking)).

## Reliability, not just capability

An agent that works four times in five is not 80% as useful as one that always works. For most
deployments it is unusable, because the failure lands on a real customer.

Report both metrics and say which one you optimise:

| Metric | Definition | Deploy question it answers |
| --- | --- | --- |
| pass@k | Solved in at least one of k attempts | Can it find a solution if a human reviews and retries? |
| pass^k | Solved in every one of k attempts | Can I let it run unattended? |

τ-bench introduced pass^k for exactly this reason, and reported that a leading model of its time
solved under 50% of tasks on the first try and under 25% consistently across eight attempts
([Yao et al. 2024](https://arxiv.org/abs/2406.12045)). The gap between those two numbers is the
reliability problem, and an accuracy table hides it entirely.

## Time horizon: an interpretable capability scale

METR reports a different shape of result: the length of task, measured by how long a human expert
takes, that a model completes with a given success rate. The **50% time horizon** is the human task
length at which the model succeeds half the time.

Method, in brief: collect human completion times for a set of software and reasoning tasks, run the
model on the same tasks, fit a curve of success rate against human task length, and read off where
it crosses 50%. Confidence intervals come from a hierarchical bootstrap over task families, tasks,
and attempts. The headline finding was a doubling of that horizon roughly every 7 months over about
six years, with 2024 to 2025 data suggesting faster
([METR 2025](https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/)).

Why it is worth copying: the unit is meaningful to a non-specialist. "Handles jobs that take a
person an hour" communicates in a way that "78.4%" does not.

Why to handle it carefully: the number depends on which tasks were chosen and whose completion times
were measured, and METR says so. It is a well-constructed measurement of a specific task
distribution, not a universal constant.

## Building an agent eval that holds up

An eight-step order of work, following Anthropic's agent-evaluation guidance and the audit findings
above ([Anthropic engineering](https://anthropic.com/engineering/demystifying-evals-for-ai-agents)).

| Step | Do this | Watch for |
| --- | --- | --- |
| 1 | Start with 20 to 50 tasks taken from real failures, not a target of hundreds | Waiting for a big set means you ship without evidence |
| 2 | Convert the checks you already run by hand, plus bug-tracker and support-queue cases | Invented tasks drift from real usage |
| 3 | Write unambiguous tasks with reference solutions | If two experts disagree on pass or fail, rewrite the task |
| 4 | Balance the set: cases where the behaviour should happen, and cases where it should not | One-sided sets teach the system to always act |
| 5 | Isolate every trial in a clean environment | Shared state creates correlated failures that look like model behaviour |
| 6 | Grade outcomes, allow partial credit for multi-part tasks, calibrate model graders | Step-matching penalises valid alternative routes |
| 7 | Read transcripts and grades from many trials | This is where you find grader bugs, and there is no substitute |
| 8 | Watch for saturation and refresh with harder tasks | A suite everything passes gives no signal |

Then keep it alive: name an owner, let domain experts add tasks, and treat the suite like test code
rather than a document.

## Reporting checklist for an agent result

| Field | Example |
| --- | --- |
| Benchmark and version, or "internal suite" with its commit | Terminal-Bench 2.1 |
| Tasks attempted, and any excluded, with the reason | 89 attempted, 0 excluded |
| Trials per task | 3 |
| pass@1, and pass^k for the k you care about | 54.1% pass@1, 31.2% pass^3 |
| Standard error | 4.9 points |
| Cost per task, and total cost | $0.42 median, $37 total |
| Wall-clock per task | 3m 10s median |
| Agent scaffold: tools, retry policy, step limit, model settings | Named scaffold, 40-step limit, no retries |
| Grader definition and its negative-control results | Programmatic check; empty output and known-wrong patch both fail |
| Environment isolation method | Fresh container per trial |
| Logs published? | Yes, with a link |
