# What this frame does not explain

A report arguing that every field should state what its tests do not cover owes the same of
itself. This section attacks the report's own claims. It is here because leaving it out would
make [16](16-how-testing-fails.md) hypocritical.

## The thesis, stated so it can be attacked

The report claims two things:

1. **Descriptive.** Every test has six parts: subject, stimulus, oracle, threshold, coverage
   claim, decision.
2. **Predictive.** A field's characteristic failure is whichever part it habitually leaves
   unstated.

Claim 1 is close to unfalsifiable and therefore close to worthless on its own. If you can
always find six parts by looking hard enough, finding them proves nothing. A frame that fits
everything explains nothing.

Claim 2 is the one that carries weight, because it can be wrong. It predicts that if you
find a field that states all six parts explicitly, that field will not have a characteristic
systemic failure of the kind listed in [16](16-how-testing-fails.md). And it predicts that
where a field's practice changes to make a missing part explicit, the associated failure
should decline.

**Neither prediction is tested in this report.** The evidence assembled here is consistent
with claim 2 and was gathered by someone who already believed it. That is the shape of a
hypothesis, not a finding, and the report should be read that way.

## Where the six parts genuinely do not fit

Three cases resist the frame, and two of them matter.

**Exploratory testing has no threshold and no stimulus set in advance.** A tester with a
charter is deciding the stimulus as they go, and the oracle is their own judgement, applied
after the fact. Forcing this into the frame requires calling the charter a subject and the
tester's surprise a threshold, which is stretching words to protect a diagram. The honest
description is that exploratory testing is a *search*, and search is a different activity
from evaluation. See [03](03-software-design-techniques.md).

**Monitoring has no discrete stimulus.** Production traffic is not applied by a tester; it
arrives. Synthetic monitoring does have a stimulus, and passive monitoring does not. Calling
observation a test blurs a distinction worth keeping: a test chooses its inputs, and
monitoring accepts whatever comes.

**Formal verification has no stimulus at all**, which the report already concedes in
[04](04-software-generative-techniques.md). It is the strongest correctness technique
available and the frame does not describe it. That is a real limit, not a technicality: the
frame covers testing, and testing is not the whole of assurance.

A fourth case is worth flagging as unresolved. In chaos engineering
([07](07-software-practice-and-workflow.md)), the subject changes during the test, because
the experiment modifies the system it is measuring. The frame assumes a stable subject.

## Where the frame flattens real differences

The translation table in [15](15-cross-domain-map.md) is the report's most useful artefact
and its most dangerous one, because equivalence in shape is not equivalence in stakes.

| Pairing the report makes | What the pairing hides |
|---|---|
| Canary release = dose escalation cohort | A canary can be rolled back in seconds. A dose cannot be un-administered. One needs a deploy button, the other needs informed consent and an ethics board |
| Mutation testing = proficiency testing | Proficiency testing is external, blind, and periodic by regulation. Mutation testing is run by the same team on its own schedule, which removes most of the control |
| A/B test = randomised controlled trial | Trial participants consent and know they are in a study. A/B test subjects do not, which is a live ethical question the report treats as a footnote |
| Chaos engineering = fire drill | A fire drill harms nobody by design. Chaos experiments run on real users' real requests |
| Test coverage = inspection sampling fraction | Inspection sampling rests on a statistical model connecting sample to population. Coverage has no such model. The analogy is aspirational |

The last row deserves emphasis because it undercuts the report's own headline recommendation.
Acceptance sampling works because attribute sampling has a defensible probability model
behind it, expressed as an operating characteristic curve. Test coverage has nothing
equivalent: there is no accepted function from "82% branch coverage" to "probability this
release contains a defect of severity X". Borrowing the *form* of a sampling plan without
that model gives you the appearance of rigour, which is worse than admitted ignorance.

The written sampling plan proposed in [15](15-cross-domain-map.md) is therefore best
understood as **a forcing device for making decisions explicit, not as a statistical
instrument.** The report should have said so more plainly than it does.

## Where the report overstates

**"Software is the only serious testing discipline with no sampling plan."** Too strong.
Counter-evidence the report does not weigh:

- ISO/IEC/IEEE 29119-2 defines a risk-based test process, and DO-178C requires a Software
  Verification Plan with stated criteria. Regulated software does have plans.
- Large engineering organisations have internal policies on test sizes and required
  coverage that function as inspection intensity rules.
- The risk-based testing literature has proposed quantitative approaches for decades.

The defensible version of the claim is narrower: **mainstream commercial software practice
rarely states a quantitative acceptance criterion, and almost never states the two error
risks separately.** That is still worth saying, and it is a smaller claim than the one in
[00](00-executive-brief.md).

**"There is one kind of testing, run at wildly different costs."** A slogan. It is useful for
dislodging the habit of learning testing one domain at a time, and it is false as a
statement about practice. The differences the slogan hides are exactly the ones in the table
above, plus one more: whether the subject can respond to being tested. A weld cannot game an
ultrasound. A student, an employee, a bank, and a car manufacturer can all game their tests,
and do. That single distinction sorts the field better than the six-part frame does, and the
report only develops it in [13](13-people-and-organisations.md).

## Where the evidence is weak

Stated in [19](19-methodology-and-sources.md) and repeated here because it matters more than
the methodology section suggests.

- **Nothing was run.** No tool was installed. No practice was trialled. The five proposals in
  [15](15-cross-domain-map.md) have never been applied by the author to a real team, so their
  cost is estimated and their benefit is argued.
- **One figure is computed**, the diagnostic matrix in
  [11](11-health-and-diagnostics.md). Everything else is sourced or reasoned.
- **Source selection is biased toward organisations that publish.** Google's flakiness
  numbers, Microsoft's experiment win rates, and Amazon's formal methods experience are used
  as though they describe software engineering. They describe three unusually large, unusually
  well-resourced companies that chose to write about it. Practice at the median organisation
  is invisible here, and there is no reason to assume it resembles theirs.
- **Standards are described from public summaries**, not from purchased texts, for ISO
  documents behind paywalls.
- **The domain survey is uneven.** Software gets seven sections and food safety gets four
  paragraphs. That reflects the author's knowledge, not the fields' relative depth.

## What would change the conclusions

Concretely, the experiments that would test this report:

| Claim | How it could be falsified |
|---|---|
| Stating the coverage claim reduces over-reading of results | Have teams publish a "what this suite does not cover" note. Compare later incident post-mortems for "we thought the tests covered that" as a stated cause |
| The written sampling plan improves decisions | Run it on half the services in one organisation for two quarters. Compare escape rates and the time spent arguing about test scope |
| Mutation score is worth its cost | Track mutation score against subsequent escaped defects per module. If they do not correlate, the recommendation is wrong |
| Detection ratings in FMEA improve test targeting | Compare FMEA-directed test additions against coverage-directed ones on subsequent escapes. See [08](08-choosing-what-to-test.md) |
| The frame predicts failure modes | Find a field that states all six parts and check whether it lacks the corresponding failure. Manufacturing is the report's own example and its failure is different in kind, which is weak support, not strong |

None of these is expensive. That the report proposes them rather than reports them is its
main limitation.

## What to read instead, for the parts this does not cover

- Tool selection and comparisons: deliberately excluded, and stale within a year anyway.
- Whether specific practices improve outcomes: the empirical software engineering literature,
  read with attention to sample sizes. The honest summary is that this evidence is thinner
  than the confidence with which practices are advocated, including in this report.
- Depth in any single domain here: every section is an orientation, not a manual. The
  sources in [19](19-methodology-and-sources.md) are where the actual detail is.
- Ethics of experimenting on users without consent: raised in
  [14](14-markets-and-money.md) and not resolved. It deserves its own treatment by someone
  qualified to give it.
