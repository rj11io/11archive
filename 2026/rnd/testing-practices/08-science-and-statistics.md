# Testing an idea: science and statistics

This is the oldest formal testing tradition, and it is the one every other kind borrows
from. A clinical trial, an A/B test, a crop trial, and a policy pilot are all the same
procedure with different subjects.

The defining feature: the subject is a **claim**, not an object. You are not asking
whether this bridge holds. You are asking whether bridges of this design hold, using a
sample.

## The basic move

A statistical hypothesis test works by trying to rule out boredom.

1. State the boring explanation, the **null hypothesis**: the new drug does nothing, the
   new button changes nothing, the difference is chance.
2. Collect data.
3. Compute how surprising the data would be if the boring explanation were true. That
   number is the **p-value**.
4. If it is surprising enough, below a threshold you chose in advance, reject the boring
   explanation.

Mapped onto the six parts from [01](01-anatomy-of-a-test.md):

| Part | In a hypothesis test |
|---|---|
| Subject | the claim, and the population it is about |
| Stimulus | the treatment or intervention |
| Oracle | the control group |
| Threshold | the significance level, usually 0.05 |
| Coverage claim | the sample, its size, and who it represents |
| Decision | reject the null, or fail to reject it |

The control group is the interesting part. This is the cleanest solution to the oracle
problem in existence: when you cannot say what should have happened, run a second group
that got nothing and see what did happen to them.

## Two errors, and the words for them

| | The claim is actually false | The claim is actually true |
|---|---|---|
| **Test says true** | Type I error, false positive | correct |
| **Test says false** | correct | Type II error, false negative |

- The **significance level**, usually written α, is the false positive rate you accept.
  At 0.05, one in twenty tests of a true null hypothesis will produce a "discovery".
- **Power** is one minus the false negative rate: the chance of detecting a real effect
  of a given size. A study aiming for 80% power has a one in five chance of missing a
  real effect it was designed to find.
- **Effect size** is how big the difference is. Statistical significance says a difference
  probably exists. Effect size says whether anyone should care.

An underpowered study is the most common quiet failure in research. If you run 60 people
through a test designed to detect a large effect and the real effect is small, the null
result tells you nothing at all, and it will be reported as though it did.

## What a p-value does not mean

The American Statistical Association published a formal statement in 2016 because
misinterpretation had become a professional problem. Its six principles:

1. "P-values can indicate how incompatible the data are with a specified statistical
   model."
2. "P-values do not measure the probability that the studied hypothesis is true, or the
   probability that the data were produced by random chance alone."
3. "Scientific conclusions and business or policy decisions should not be based only on
   whether a p-value passes a specific threshold."
4. "Proper inference requires full reporting and transparency."
5. "A p-value, or statistical significance, does not measure the size of an effect or the
   importance of a result."
6. "By itself, a p-value does not provide a good measure of evidence regarding a model or
   hypothesis."

Principle 3 is the one with the widest reach outside statistics. p = 0.05 is a threshold
someone chose. It is not a fact about nature, and it carries exactly the same status as a
coverage target of 80% or a latency budget of 200ms: a line drawn to make a decision
possible, whose only justification is the cost of being wrong in each direction.

## Randomised controlled trials

The RCT is the strongest general design for establishing that a treatment *caused* an
outcome. Four elements do the work:

| Element | What it removes |
|---|---|
| A control group | the possibility that the outcome would have happened anyway |
| Random assignment | selection effects, including ones nobody thought of |
| Blinding | the subject's expectations changing the outcome |
| Double blinding | the researcher's expectations changing the measurement |

Random assignment is the part that makes the design powerful, and it is subtle. It does
not balance the groups on the variables you thought of; matching does that. It balances
them, in expectation, on *every* variable, including the ones nobody has named. That is
why it beats a carefully matched comparison.

The design has spread far beyond medicine. The 2019 Nobel Prize in Economic Sciences went
to Abhijit Banerjee, Esther Duflo and Michael Kremer for adapting RCTs to development
economics. Their Kenyan schooling experiments found that neither extra textbooks nor free
school meals moved learning outcomes much, while changes to how teaching was targeted did,
a result nobody would have accepted from observation alone.

Online A/B testing is the same design, at a scale medicine cannot reach. See
[12](12-markets-and-money.md).

## When you cannot randomise

You cannot randomly assign countries to have a financial crisis. Quasi-experimental
designs recover some causal claim from data that arrived without an experiment.

| Design | The idea | Example |
|---|---|---|
| Natural experiment | something outside the researcher's control assigned people as-if randomly | a lottery for school places |
| Difference-in-differences | compare the change over time in a treated group against the change in an untreated group | one state raises its minimum wage, the neighbouring state does not |
| Regression discontinuity | compare people just above and just below an arbitrary cutoff | students who scored 59 and 61 on a scholarship threshold |
| Instrumental variables | use something that affects the treatment but not the outcome directly | distance to a college as a lever on years of education |
| Matching | compare treated units to untreated ones with similar known characteristics | weaker, because it can only match on what you measured |

Each of these buys a causal claim by making an assumption. The assumption is the coverage
claim, and it is where the argument always is.

## The replication crisis, and what it taught

In 2015, the Open Science Collaboration published an attempt to replicate 100 studies from
three leading psychology journals. Depending on how you measure success, the results were:

| Measure of replication | Result |
|---|---|
| Replications with a statistically significant result in the same direction | 36% |
| Original effect size inside the replication's 95% confidence interval | 47% |
| Subjectively judged by the replication team to have replicated | 39% |
| Combining original and replication data, still statistically significant | 68% |

Four numbers for one question. This is the same phenomenon as the accessibility automation
figures in [05](05-software-non-functional.md), where 57% and 22.6% both described the
same tools: **the denominator decides the answer, so the metric must be stated with it.**

The causes identified were structural, not fraudulent:

- **Publication bias**: journals published positive results, so negative results vanished
  and the literature over-represented flukes.
- **P-hacking**: analysing many ways and reporting the one that crossed 0.05. Not
  necessarily dishonest, since every choice can be defended individually.
- **HARKing**: hypothesising after the results are known, then presenting the hypothesis
  as though it came first.
- **Multiple comparisons**: test twenty things at α = 0.05 and one will look significant by
  chance. Corrections exist, and are frequently skipped.
- Weak incentives to replicate anything.

The fixes are all forms of committing in advance:

- **Preregistration**: publish the hypothesis, the sample size, and the analysis plan
  before collecting data. This is the same control as writing the test before the code in
  [06](06-software-practice-and-workflow.md), and for the same reason: a prediction made
  after seeing the result is not a prediction.
- **Registered reports**: journals accept the study based on the design, before results
  exist, which removes the incentive to produce a positive finding.
- Open data and open analysis code.
- Larger samples and reported power.
- Reporting effect sizes and confidence intervals, not just p-values.

## What software should take from this

Software A/B testing has a p-hacking problem that is worse than psychology's, because the
data arrives continuously and the dashboard updates in real time.

- **Peeking.** Checking an experiment repeatedly and stopping when it crosses significance
  inflates the false positive rate badly. Fixes: fix the sample size in advance, or use a
  sequential test designed for continuous monitoring.
- **Multiple metrics.** Twenty metrics on a dashboard is twenty chances for one to look
  significant. State the primary metric in advance; treat the rest as exploration.
- **Underpowered experiments.** Running a test on 800 users to detect a 1% conversion
  change is running it for the appearance of rigour.
- **No preregistration.** Writing down the expected direction and size before launch turns
  a post-hoc story into a real test, and costs one paragraph.

## Sources

- [American Statistical Association Statement on Statistical Significance and P-Values, 2016](https://www.amstat.org/asa/files/pdfs/p-valuestatement.pdf);
  principles as quoted
  [here](https://mostlyeconomics.wordpress.com/2016/03/17/six-principles-for-the-use-and-interpretation-of-p-values/)
- Open Science Collaboration. "Estimating the reproducibility of psychological science",
  *Science*, 2015.
  [Science](https://www.science.org/doi/10.1126/science.aac4716) |
  [PDF](https://discovery.dundee.ac.uk/ws/files/7385883/RPP_SCIENCE_2015.pdf)
- [Sveriges Riksbank Prize in Economic Sciences 2019, press release](https://www.nobelprize.org/prizes/economic-sciences/2019/press-release/)
- [CEPR: What randomisation can and cannot do](https://cepr.org/voxeu/columns/what-randomisation-can-and-cannot-do-2019-nobel-prize)
