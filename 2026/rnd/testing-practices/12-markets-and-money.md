# Testing markets, products, and money

Business testing splits cleanly in two. One half asks whether anyone wants the thing. The
other half asks whether the institution survives if things go badly. Both are testing in
the full sense of [01](01-anatomy-of-a-test.md), and both are usually run by people who
would not describe themselves as testers.

## Testing demand before building

The expensive mistake in product work is building something correct that nobody wants.
Verification without validation, in the language of
[07](07-safety-critical-and-standards.md). These methods attack it, ordered from cheapest
to most committing.

| Method | What you do | What it actually tests | Main risk |
|---|---|---|---|
| Customer discovery interview | ask people about their current behaviour and problems | what they do now | asking about the future, which people answer badly |
| Concept test | show a description or mockup, measure reaction | whether the idea is understood and appealing | stated preference is not behaviour |
| Fake door test, also called smoke test | ship a button or landing page for a feature that does not exist, count clicks | revealed intent, with real money and attention at stake | annoys the people who click |
| Wizard of Oz test | the interface is real, humans perform the work behind it | whether the experience is valuable, before automating it | does not scale, and hides the cost |
| Concierge test | you deliver the service manually, openly | whether the outcome is valuable | small sample, and you learn a lot |
| Pilot or limited launch | full product, small market or small group | everything, at small scale | slow, and the small group may not represent the rest |
| Minimum viable product | smallest thing that produces real learning | usually demand plus feasibility | "minimum" tends to win over "viable" |

The ordering principle is the same one used in clinical trials and canary releases: buy
the cheapest information first, and increase exposure as evidence accumulates.

**Fake door tests deserve a note on ethics**, because they are the one method here that
deliberately misleads. A button that returns "coming soon" is generally accepted. A
checkout flow that takes payment details for a product that does not exist is not. The
line is whether the person loses anything real by participating.

### Pricing tests

Price is the hardest thing to test, because asking about it directly does not work.

- **Van Westendorp price sensitivity meter**: four questions about what price would be too
  cheap, cheap, expensive, and too expensive, plotted to find an acceptable range. Cheap
  to run, and it measures perception rather than behaviour.
- **Conjoint analysis**: present bundles of features at prices and make people choose. It
  recovers how much each attribute is worth by forcing trade-offs, which is far more
  reliable than asking "how much would you pay".
- **Live price testing**: charge different prices to different groups. It gives the real
  answer and carries fairness, legal, and reputational risk that most other A/B tests do
  not.

The general point: **a test where the subject gives up nothing measures opinion, and a
test where the subject gives up money measures demand.** Conjoint sits in between by
forcing a trade-off even without real money.

## A/B testing, which is an RCT

An online A/B test is a randomised controlled trial. Split traffic randomly, show variant
A or B, compare a pre-declared metric. Every element from [08](08-science-and-statistics.md)
is present: random assignment, a control group, a threshold, a decision.

Two findings from large-scale practice change how you should read results.

**Most ideas do not work.** Reporting on years of experimentation at Microsoft, Ronny
Kohavi's figures are roughly one third of ideas positive and statistically significant,
one third flat, and one third actively negative. In a well-optimised product the positive
share falls further. This is the single most useful number in product development: it
means the value of experimentation is mostly in *stopping* things, and a team whose
experiments almost always win is measuring badly.

**The statistical hazards are worse online than in a lab**, because the data streams in
and the dashboard is always open. The four to watch are in
[08](08-science-and-statistics.md): peeking, multiple metrics, underpowered tests, and no
preregistered hypothesis.

Related designs:

- **Multivariate testing** varies several elements at once and estimates interactions. It
  needs far more traffic than most products have.
- **Multi-armed bandit** shifts traffic toward the winner while the test runs. It earns
  more during the experiment and gives a less clean estimate of how much each variant is
  worth. Use it for short-lived decisions like which headline to show, not for decisions
  you will build on.
- **Holdout groups** keep a slice of users permanently on the old experience, so you can
  measure the cumulative effect of a year of small wins. Individually significant wins
  frequently fail to add up, and a holdout is the only way to find that out.
- **Switchback testing** alternates a treatment over time rather than across users, for
  marketplaces where treating one user affects another.

## Testing that the institution survives

The other half of business testing asks what happens when things go wrong, and it is a
regulatory requirement in finance.

### Stress testing

Regulators define a hypothetical severe scenario and require banks to project their
position through it.

The 2025 Federal Reserve stress test, published 27 June 2025, covered 22 banks. Under the
severely adverse scenario the aggregate common equity tier 1 capital ratio fell from 13.4%
to a minimum of 11.6%, a decline of 1.8 percentage points, with projected losses of $549
billion over nine quarters, of which $472 billion was loan losses. The corresponding
decline in the 2024 test was 2.8 percentage points.

Four features of this design are worth copying:

1. **The scenario is set by the party bearing the risk**, not by the party being tested.
   Banks do not choose their own stress scenario. Almost every software resilience test is
   designed by the team that built the system, which is the equivalent of marking your own
   exam.
2. **It is a projection, not an execution.** Nobody crashes the economy. The test runs
   against a model, so the model itself must be validated separately.
3. **The result has a consequence**, the bank's required capital buffer. A test with no
   decision attached is a ritual, per [01](01-anatomy-of-a-test.md).
4. **It repeats annually with changing scenarios**, for the same anti-Goodhart reason
   Euro NCAP revises its protocols.

### Backtesting

Run a strategy or a risk model against historical data and see how it would have
performed. Standard for trading strategies and required for value-at-risk models, where a
model claiming a 1% daily loss threshold should be breached about 1% of days; far more or
far fewer breaches means the model is wrong.

Backtesting is the financial cousin of snapshot testing in
[04](04-software-generative-techniques.md), and it has the same flaw: **the oracle is the
past.** Its specific failure modes:

- **Overfitting**: try enough strategies against one history and one will look excellent
  by chance. This is p-hacking with money.
- **Survivorship bias**: testing against an index of companies that still exist omits the
  ones that failed, which is the population you cared about.
- **Look-ahead bias**: accidentally using information that was not available at the time,
  for example a restated earnings figure.
- **Regime change**: the past contains no example of the thing that breaks you.

### Model validation

US supervisory guidance SR 11-7 requires banks to validate the models they rely on,
including independent review of the model's conceptual soundness, ongoing monitoring, and
outcomes analysis. The core requirement is that validation be performed by people
independent of the model's developers.

That is the same **independent verification and validation** principle as DO-178C in
[07](07-safety-critical-and-standards.md), and it is the control that machine learning
deployment in most technology companies currently lacks.

### Audit sampling

External auditors cannot examine every transaction, so they sample, using either
statistical sampling with a computed sample size and a projected error rate, or judgemental
sampling of high-risk items. The output is an opinion with a stated scope and stated
materiality: a threshold below which an error is deemed not to matter.

Materiality is worth naming, because software has no equivalent term and badly needs one.
An auditor states, in advance, how large an error has to be before it changes the
conclusion. Software teams argue endlessly about whether a given defect is worth fixing
without ever having set that line.

### Insurance and actuarial testing

Insurers test their reserves and pricing by projecting portfolios through simulated
futures, usually with **Monte Carlo simulation**: run the model thousands of times with
randomly drawn inputs and look at the distribution of outcomes rather than a single
answer.

The mindset transfers directly. A single load test gives you one number. Running the same
scenario with randomly varied traffic mixes, failure timings, and data shapes gives you a
distribution, and the tail of that distribution is where incidents live.

## Sources

- Kohavi, R. et al. ["Online Controlled Experiments at Large Scale"](https://exp-platform.com/Documents/2015-08OnlineControlledExperimentsKDDKeynoteNR.pdf),
  KDD; and ["Online Experimentation at Microsoft"](http://ai.stanford.edu/~ronnyk/ExPThinkWeek2009Public.pdf)
- [Federal Reserve, 2025 Dodd-Frank Act Stress Test Results](https://www.federalreserve.gov/publications/2025-june-dodd-frank-act-stress-test-results.htm),
  June 2025
- [Bank Policy Institute, deep dive on the DFAST 2025 scenarios](https://bpi.com/deep-dive-dfast-2025-stress-test-scenarios/)
- [Harvard Business Review, The Surprising Power of Online Experiments](https://hbr.org/2017/09/the-surprising-power-of-online-experiments)
