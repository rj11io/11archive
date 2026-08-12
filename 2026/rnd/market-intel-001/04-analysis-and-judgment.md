# 4. Analysis and Judgment

Analysis is the step where observations become a claim about what is true or
what will happen, with the uncertainty stated. Everything before it is
housekeeping.

## Frameworks: what each one is actually for

Frameworks are containers for thinking, not answers. Each is good at one thing
and blind to others. Choose by the question, and say out loud what the chosen
framework cannot see.

| Framework | Answers | Blind to |
| --- | --- | --- |
| **Porter's Five Forces** | Why this industry is or is not profitable, structurally | Change over time. It is a snapshot. It also handles platforms and network effects poorly, where a rival is often also a complement provider ([limitations summary][five-forces-limits]) |
| **PESTEL** | Which macro forces touch this market: political, economic, social, technological, environmental, legal | Relative weight. It generates a list, not a ranking. Pair it with scenarios |
| **TAM, SAM, SOM** | How big the opportunity is at three widths | Timing and competitive response. A large TAM says nothing about whether you can reach any of it |
| **Segmentation and jobs-to-be-done** | Who buys, and what they are hiring the product to do | Supply-side economics. It says nothing about whether serving that segment is profitable |
| **Value chain and cost curve** | Where margin sits and who captures it | Demand shifts. A perfect cost position in a dying category is worthless |
| **Scenario planning** | What plausible futures look like, and which strategies survive several of them | Probability. Scenarios are deliberately not forecasts. Shell has been the most cited long-run practitioner |
| **Business war gaming** | How rivals will actually respond to your move | Anything outside the modelled players. Gilad has run these for large firms for over 30 years and describes the method as a metal detector for the company ([Academy of Competitive Intelligence][acci-wargame]) |
| **Competitive early warning** | Whether reality has drifted away from your strategy | Slow-moving structural change that nobody set a tripwire for. Gilad calls the gap "industry dissonance" ([Gilad, *Early Warning*][gilad-ew]) |
| **Blind spot analysis** | What your own leadership believes that is no longer true | Your own blind spots, unless someone external runs it |

### Market sizing without lying to yourself

Two methods. Use both and reconcile them. Lead with bottom-up.

**Top-down.** Start from a published industry figure, cut it by geography,
segment, and product to reach your addressable slice. Fast. It inherits every
error in the source figure and multiplies them by your assumptions.

**Bottom-up.** Start from countable units and price.

```text
SOM = (reachable accounts) x (win rate) x (annual contract value) x (ramp)
```

Worked example, deliberately small:

```text
Reachable accounts:  European B2B marketplaces with over 50 staff   = 3,400
Qualify (payments not yet embedded)                        x 0.45   = 1,530
Realistic 3-year penetration                               x 0.08   =   122
Annual contract value                                      x 42,000 = EUR 5.1m
```

Now stress the three assumptions. If penetration is 4% instead of 8%, the answer
halves. Publish that range. A single number with three decimal places is a claim
you cannot support.

Common sizing errors, all of them fatal to credibility:

| Error | What it looks like |
| --- | --- |
| **Vanity TAM** | Quoting the biggest adjacent category. "The US$4tn logistics market" for a freight-invoicing tool |
| **Percent-of-TAM reasoning** | "We only need 1% of a huge market." This is not a plan, it is a wish |
| **GMV mistaken for revenue** | Counting the value flowing through a platform as the platform's income |
| **Ignoring substitutes** | Sizing a category while buyers solve the job with spreadsheets for free |
| **Confirmation-driven build** | Choosing assumptions backwards from the number you wanted |

Sources on the method and the failure modes: [Forum VC][forum-vc],
[Alloy Partners][alloy], [Data-Mania][data-mania].

## Structured analytic techniques

These are procedures that force an analyst to consider what they would otherwise
skip. The term entered US intelligence use in 2005, growing out of the
"alternative analysis" work Jack Davis began in the 1980s
([SAGE, *Structured Analytic Techniques*][sage-sat]).

Four earn their place in business work.

### Analysis of competing hypotheses (ACH)

Start with the full set of plausible explanations, not the favourite one. Build
a matrix with hypotheses across the top and evidence down the side. Then try to
**disprove**, not prove. The hypothesis with the least disconfirming evidence
survives ([Kraven][kraven-ach]).

Worked example. Rival X drops price 20%.

| Evidence | H1: Winning share | H2: Clearing inventory | H3: Cash pressure | H4: Blocking our launch |
| --- | --- | --- | --- | --- |
| Cut applies only to last-gen SKU | Inconsistent | Consistent | Neutral | Inconsistent |
| Sales headcount flat | Inconsistent | Consistent | Consistent | Inconsistent |
| Their supplier extended payment terms | Neutral | Neutral | Consistent | Neutral |
| Cut began 3 weeks before our launch | Consistent | Neutral | Neutral | Consistent |
| No marketing spend increase | Inconsistent | Consistent | Consistent | Inconsistent |

H1 and H4 carry three inconsistencies each. H2 and H3 carry none. The
interesting output is not "the answer" but the discovery that the popular
internal story, that they are attacking us, is the worst-supported one.

### Key assumptions check

List every assumption the current judgment rests on. For each: what would make
it false, how would we notice, and how bad is it if it flips. Assumptions that
are both load-bearing and unmonitored are your real risk register.

### Premortem

Before committing, assume the decision failed badly and write the story of how.
Cheap, fast, and it surfaces objections that people will not raise directly to a
senior sponsor.

### Devil's advocacy and red teaming

Assign someone to argue the opposite case with real resources and real access.
It only works if the role is named, protected, and expected to be unpleasant.

## Saying how sure you are

Two separate things must be stated, and people constantly conflate them.

**Likelihood** is how probable the event is. Use a fixed scale and never mix
words and numbers loosely.

| Term | Probability band |
| --- | --- |
| Almost certainly | 95% to 99% |
| Very likely | 80% to 95% |
| Likely | 55% to 80% |
| Roughly even chance | 45% to 55% |
| Unlikely | 20% to 45% |
| Very unlikely | 5% to 20% |
| Almost certainly not | 1% to 5% |

**Confidence** is how much you trust the basis of the judgment: the quality of
sourcing, the number of independent origins, and how much of the reasoning rests
on assumption.

| Confidence | Basis |
| --- | --- |
| High | Multiple independent origins, consistent, few assumptions |
| Moderate | Credible sourcing, some gaps, plausible alternative readings |
| Low | Fragmentary or single-origin evidence, heavy assumption load |

Written correctly: "We judge it **likely** (60% to 70%) that rival X launches a
mid-market tier before Q2 2027. **Moderate confidence**, based on hiring and
channel signals from two independent origins, with no direct evidence of pricing."

This mirrors the discipline in US intelligence analytic standards, which require
that products express uncertainty explicitly and distinguish it from confidence
in the underlying sourcing. See [ODNI ICD 203][icd203].

## Calibration: getting better at being right

Forecast quality is measurable. The Good Judgment Project scored forecasters
with the Brier score, where lower is better, 0 is perfect. Its main findings
transfer directly to corporate market intelligence
([AI Impacts summary][aiimpacts], [Tetlock, *Superforecasting*][tetlock]):

1. **Start from the base rate, then adjust.** Look outward at how often this kind
   of thing happens before looking inward at this particular case.
2. **Update often, in small steps.** Not never, and not wildly on each headline.
3. **Teams beat individuals.** Structured disagreement improves accuracy.
4. **Be decisive as well as calibrated.** Always saying "roughly even chance" is
   safe and useless. Resolution matters alongside calibration.

The practical corporate version: write down a numeric probability for every
material judgment, with the resolution date. Score them quarterly. Within a year
you will know which analysts and which source classes to trust.

## Failure modes in analysis

| Bias | How it shows up in market work | Counter |
| --- | --- | --- |
| **Confirmation bias** | Collecting until the preferred story is supported | ACH. Assign someone to build the strongest opposite case |
| **Mirror imaging** | Assuming a rival will act as you would, with your incentives | Model their constraints, comp plan, and board pressure explicitly |
| **Single-origin dependence** | Three articles, one press release | Origin count, not source count |
| **Precision theatre** | "EUR 5,148,300 TAM" | Publish ranges. Show the two or three assumptions that drive them |
| **Recency** | The last customer conversation dominates | Fix the sample before you start listening |
| **Anchoring on the vendor's number** | The market-size slide comes from a firm selling into the market | Rebuild bottom-up before quoting anyone |
| **Availability** | Rivals you already track look more threatening than ones you do not | Periodically ask who is not on the list and why |
| **Paralysis** | Detailed reports, no recommendation ([Kompyte][kompyte]) | Every product ends with a judgment and a recommended action |

## The one-line test

Before publishing, answer this in a sentence: **what should the reader do
differently, and how sure are we?** If you cannot, the analysis is not finished.

---

[five-forces-limits]: https://rachel.worldpossible.org/mods/en-boundless/www.boundless.com/management/textbooks/boundless-management-textbook/strategic-management-12/external-inputs-to-strategy-87/limitations-of-the-five-forces-view-421-881/index.html
[acci-wargame]: https://academyci.com/ci-401-war-gaming/
[gilad-ew]: https://archive.org/details/earlywarningusin0000gila
[forum-vc]: https://www.forumvc.com/thought-pieces/understand-and-define-your-market-size
[alloy]: https://www.alloypartners.com/articles/market-sizing
[data-mania]: https://www.data-mania.com/blog/top-down-market-sizing-tam-sam-som-guide/
[sage-sat]: https://us.sagepub.com/sites/default/files/upm-assets/107812_book_item_107812.pdf
[kraven-ach]: https://kravensecurity.com/analysis-of-competing-hypotheses/
[icd203]: https://www.odni.gov/files/documents/ICD/ICD-203.pdf
[aiimpacts]: https://aiimpacts.org/evidence-on-good-forecasting-practices-from-the-good-judgment-project/
[tetlock]: https://www.ideasthesia.org/superforecasting-tetlock/
[kompyte]: https://www.kompyte.com/blog/top-ci-pitfalls-to-avoid/
