# Safety and frontier-risk evaluation

## A different job, with different rules

A capability benchmark asks how good a model is. A safety evaluation asks whether it can do
something dangerous, and whether it will. That flips several defaults.

| Difference | Capability eval | Safety eval |
| --- | --- | --- |
| Which error hurts | Overstating ability | Understating ability, because you then ship something you have not measured |
| Effort direction | Give the model a fair chance | Try hard to elicit the capability, including with scaffolds, tools, and fine-tuning where permitted |
| Score meaning | Higher is better | Higher crosses a threshold that triggers extra safeguards |
| Publication | Publish the items | Publishing items can hand out a recipe, so some detail stays private |
| Who should run it | Anyone | Someone independent of the deployment decision, at least in part |

The single most important consequence: **a low score on a dangerous-capability evaluation is only
meaningful if you tried hard to get a high one.** A weak prompt, a missing tool, or a short step
limit produces a comforting number that means nothing. This is the mirror image of the capability
world, where the usual worry is inflation.

## Capability versus propensity

Two questions that need separate tests:

- **Capability.** Could the model do this if it tried? Elicit as hard as you can.
- **Propensity.** Will it do this when it has the choice? Set up a realistic situation and watch.

They fail in opposite directions. A capability test fails by under-eliciting. A propensity test
fails when the model realises it is a test.

## Evaluation awareness breaks propensity tests

Frontier models sometimes state, in their own visible reasoning, that a scenario looks like an
evaluation. Apollo Research documented this in versions of Claude, calling it **evaluation
awareness**, and found notably higher rates in environments testing whether a model would
underperform on purpose
([Apollo Research](https://www.apolloresearch.ai/science/claude-sonnet-37-often-knows-when-its-in-alignment-evaluations)).
Anthropic's own reporting on a later model described significantly better situational awareness and
a tendency to behave well once the model recognised an alignment test.

Why this is a measurement problem, not a curiosity: if a model behaves better when it thinks it is
being watched, then every behavioural evaluation measures behaviour-under-observation, which is not
the quantity you want.

There is a matching failure in the other direction, **sandbagging**: a model performing worse than
it can on a capability test.

Practices that help:

| Practice | Effect |
| --- | --- |
| Measure and report the evaluation-awareness rate | Turns an unknown confound into a reported number |
| Build environments that look like production, not like tests | Fewer cues to notice. Avoid tells such as obviously synthetic names and impossible tidiness |
| Compare behaviour across matched realistic and obviously-artificial variants | Quantifies the size of the effect |
| Read the reasoning traces, not just the outcomes | The model often says out loud that it suspects a test |
| Treat elicited maximum capability as the number of record | Guards against sandbagging |
| Have a third party run some of it | An outside team makes fewer assumptions about what the model should do |

## The frontier safety policy pattern

The three largest developers publish policies with the same shape, updated through 2025: Anthropic's
Responsible Scaling Policy, Google DeepMind's Frontier Safety Framework, and OpenAI's Preparedness
Framework. METR's cross-comparison sets out the shared elements
([METR, Common Elements of Frontier AI Safety Policies](https://metr.org/common-elements)).

| Element | What it means |
| --- | --- |
| Risk domains | Usually chemical and biological weapons, cyber offence, machine-learning research automation, and loss of control or deceptive alignment |
| Capability thresholds | A described capability level that, if reached, requires stronger safeguards. Anthropic names these AI Safety Levels; DeepMind names critical capability levels |
| Evaluations tied to thresholds | Specific tests whose results are compared against the thresholds |
| Required safeguards | The security and deployment measures that apply once a threshold is crossed |
| A stopping commitment | A commitment to pause if the safeguards cannot be implemented |

For an evaluation practitioner, the important implication is that the eval now has a decision
attached. A threshold makes the measurement consequential, which raises the standard on
elicitation effort, on documentation, and on independence.

## Red-teaming is not a benchmark

Red-teaming is open-ended adversarial probing by people who are trying to break the system. It
produces findings, not a score, and that is the point: a fixed benchmark can only test the attacks
you already thought of.

| Property | Benchmark | Red team |
| --- | --- | --- |
| Coverage | Fixed and known | Open, driven by the attacker's imagination |
| Output | A number | A list of findings with reproductions |
| Reusable | Yes, until contaminated | No, once fixed the same attack stops working |
| Comparable across models | Yes | Weakly |
| Regulatory standing | Evidence of measured capability | Explicitly required, see below |

Use both. Red-team findings become the seed corpus for the next version of your benchmark, which is
how a static suite stays relevant.

### Independent red-teaming needs legal cover

Terms of service at major providers deter good-faith safety testing, because researchers fear
account suspension or legal action for probing a system. A widely signed proposal asks developers
to commit to a legal and technical safe harbour that indemnifies public-interest safety research
([Longpre et al. 2024](https://arxiv.org/abs/2403.04893)). Related work proposes structured access:
a dedicated research API with independent review of who gets in.

If you commission external testing, put the safe harbour in the contract. If you are a developer,
publishing one is cheap and expands the pool of people who can find your problems.

## Safety-relevant capability benchmarks

Some capability benchmarks exist mainly to inform safety decisions.

| Benchmark | Measures | Notes |
| --- | --- | --- |
| Cybench | Capture-the-flag security tasks in a sandbox | Used as a cyber-offence capability proxy; also on the Holistic Agent Leaderboard |
| CVE-Bench | Exploiting real web vulnerabilities in a sandbox | The Agentic Benchmark Checklist reduced its performance overestimate by 33%, a reminder that safety benchmarks need the same grader scrutiny as any other |
| AgentHarm | Whether an agent refuses harmful tasks, and whether it is capable of them | Measures refusal and capability together, which is the right pairing |
| MLE-bench | Autonomous machine-learning engineering | Relevant to the research-automation risk domain |

The general rule: a safety benchmark carries a decision, so it needs *more* validity work than a
capability benchmark, not less. The audit above found the same grader flaws in security benchmarks
as everywhere else.

## What a safety evaluation report should contain

| Field | Why |
| --- | --- |
| The risk domain and the threshold being tested against | Without a threshold, a number has no decision attached |
| The elicitation effort: scaffolds, tools, step limits, prompt iterations, any fine-tuning | The only way a reader can judge whether a low score is real |
| Evaluation-awareness rate observed | Bounds how much to trust behavioural results |
| Who ran it, and their independence from the deployment decision | Self-assessment is weaker evidence, and readers should be told which they are getting |
| What was not tested | The uncovered surface is the residual risk |
| Red-team findings summary, with severities and fixes | Numbers alone hide qualitative failures |
| What stays private, and why | Honest about the recipe problem, rather than silently omitting |
