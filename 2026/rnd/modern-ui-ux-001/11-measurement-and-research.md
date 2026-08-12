# 11. Measuring and researching interface quality

Design arguments end when there is a number. This section covers how to pick numbers that mean something,
the standard instruments and their real benchmarks, and how many people you actually need to test with.

## HEART, and the process that makes it work

**HEART** is a framework from Google (Kerry Rodden, Hilary Hutchinson, and Xin Fu) for choosing
user-centred metrics. It names five categories:

| Category | Question it answers | Typical measure |
| --- | --- | --- |
| **H**appiness | How do users feel about it? | Survey score, satisfaction rating, System Usability Scale |
| **E**ngagement | How much do they use it? | Actions per active user per week, session depth |
| **A**doption | Are new users taking it up? | New users completing the core action in their first week |
| **R**etention | Do they come back? | Share of users active in a period who are active in the next |
| **T**ask success | Can they do the thing? | Completion rate, time on task, error rate |

The framework is not the useful part. The **Goals, Signals, Metrics** process is:

1. **Goal.** What should be true for the user? Not "increase engagement" but "people find the right
   document without asking a colleague."
2. **Signal.** What observable behaviour would show that? "Search result clicked in the first three
   positions", "no repeated search within two minutes."
3. **Metric.** The exact number, with its population, numerator, denominator, and period. "Share of
   search sessions ending in a first-page click, weekly, excluding bot traffic."

Two rules that keep this honest. Pick at most one metric per category, because a dashboard with 30
numbers gets ignored. And write down what would make you abandon the change, before you run it.

**Watch for the engagement trap.** Engagement rises when a product is confusing, because users need more
clicks to achieve the same thing. Pair every engagement metric with a task success metric, or you will
optimise for friction.

## The System Usability Scale

**SUS** is a ten-item questionnaire from 1986 that produces a single score from 0 to 100. It is worth
knowing precisely because it is the most widely used and most widely misread instrument in the field.

- **The average is 68.** From Jeff Sauro's meta-analysis of about 5,000 scores across 500 studies.
- **68 is the 50th percentile, not a pass mark of 68%.** A SUS score is not a percentage. Sauro and
  Lewis's curved grading scale, built from 241 studies, puts 68 at the centre of a "C" grade, with the
  top and bottom 15 percentiles as A and F.
- **So a score of 72 is above average**, and a score of 68 means exactly ordinary.

Use SUS for comparison, either against your own previous release or against the benchmark. Do not use it
to diagnose anything: it tells you there is a problem, never what it is. For that you need task-level
observation.

## How many test participants

The "five users is enough" rule comes from Nielsen's 2000 article, resting on a model he and Thomas
Landauer published in 1993. The model says the number of problems found grows as
`N × (1 − (1 − L)^n)`, where `L` is the share of problems a single user reveals, typically about 31%
across the projects they studied. At `L = 31%`, five users surface roughly 85% of problems.

**Where it breaks, and this matters:**

- The 31% figure is an average across projects. Where problems are rarer, five users finds far fewer of
  them. Roughly: at a 20% discovery rate you need about nine users for the same coverage, and at 10%
  about eighteen.
- Variance between samples is large. In one study of 60 users, some random sets of five found 99% of
  problems and others found 55%. Ten users raised the worst case to 80%, and twenty to 95%.
- It assumes one user group. Distinct groups (an administrator and an end user, a novice and an expert)
  each need their own participants.
- It applies to formative usability testing only. It says nothing about quantitative work: measuring a
  conversion difference needs a sample size calculation, not five people.

**The actual recommendation, which is the part that gets dropped:** run more, smaller studies. Three
rounds of five users with fixes in between beats one round of fifteen, because the second round tests the
fixes and finds the problems the first round's problems were hiding.

| Purpose | Participants | Note |
| --- | --- | --- |
| Formative usability test, one user group | 5 per round, 3 rounds | Fix between rounds |
| Multiple distinct user groups | 3 to 4 per group | Analyse separately |
| Comparing two designs qualitatively | 8 to 12 | Counterbalance the order |
| Measuring a completion rate or time | Calculate from the effect size you care about | Usually 20 or more per condition |
| A/B test of a conversion metric | Calculate from baseline rate and expected lift | Usually thousands |
| Card sorting or tree testing | 15 to 30 | These are quantitative even though they feel qualitative |

## Task-level measures that actually diagnose

| Measure | Definition | Watch out for |
| --- | --- | --- |
| Completion rate | Share of participants who finish unaided | Define "unaided" before you start |
| Time on task | Median, not mean, of successful attempts only | Including failures makes fast failures look good |
| Error rate | Errors per attempt, categorised by type | Categories are where the insight is |
| Assists | Times the facilitator had to intervene | The most honest measure in moderated testing |
| Single Ease Question | One 7-point rating right after each task | Cheap, and localised to a task unlike SUS |
| First-click accuracy | Whether the first click was on the right path | Strong predictor of eventual success |

## Field data as a continuous research channel

You already have three instruments running:

- **Core Web Vitals from real visits.** See [07](07-performance-as-ux.md). Segment by device and country,
  because an aggregate hides the mid-range Android problem.
- **Funnel drop-off by step and field.** For forms, log which field was last focused before abandonment.
  This single measurement finds more form problems than most usability tests.
- **Search terms with no results, and repeated searches.** A direct list of things users expected and did
  not find.

Two cautions. Analytics tells you what happened, never why, so treat every finding as a hypothesis for
qualitative work. And session replay tools record real people: strip fields, respect consent, and never
replay anything with credentials or payment data in it.

## Accessibility as a measurable programme

| Metric | How | Target |
| --- | --- | --- |
| Automated failures per page | Scanner in continuous integration | Zero new failures; existing count falling |
| Share of pages scanned | Coverage of routes | Rising to all |
| Keyboard pass rate | Manual per flow, quarterly | All primary flows pass |
| Screen reader pass rate | Manual per flow | All primary flows pass |
| Time to fix an accessibility bug | From report to release | Same as any other defect of that severity |
| Findings from users with disabilities | Sessions run per year | More than zero, and rising |

The first metric alone is not compliance: automated tools detect roughly a third of issues. Report the
coverage limit next to the number, every time.

## Reporting results honestly

- **State the population.** Which users, which platform, which period.
- **Give the denominator.** "40% preferred B" from 10 people is four people.
- **Give uncertainty.** For any rate from a small sample, a confidence interval, or at minimum the raw
  counts.
- **Never total percentages, averages, or ratios** across rows in a table.
- **Say what you did not measure.** The unmeasured segment is where the surprise lives.
- **Separate observed behaviour from stated preference.** They frequently disagree, and behaviour wins.
- **Keep the raw data.** Aggregations you regret are recoverable; discarded raw data is not.

## The measurement checklist

1. One goal, one signal, one metric per HEART category that matters here.
2. Every metric has a written population, numerator, denominator, and period.
3. Engagement paired with task success.
4. A benchmark to compare against, either previous release or the SUS average of 68.
5. Usability testing in rounds of five with fixes between, not one large round.
6. Separate participants per distinct user group.
7. Quantitative claims backed by a sample size calculation.
8. Field performance segmented by device class and region.
9. Accessibility findings reported with their coverage limit.
10. Raw data retained, and privacy handled before storage rather than after.
