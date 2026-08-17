# Testing bodies: medicine and diagnostics

Medicine runs two very different kinds of test, and confusing them causes most of the
public misunderstanding about health testing.

- **Trials** test a treatment. The subject is a claim about a population.
- **Diagnostics** test a person. The subject is one individual.

They have opposite failure modes and they are worth taking separately.

## Clinical trials: testing a treatment

Drug development runs a staged sequence, where each stage buys the right to expose more
people. It is a risk-graded pipeline, and it is the closest analogue in any field to a
staged software rollout.

| Phase | Who | Roughly how many | Question |
|---|---|---|---|
| Preclinical | cells, tissues, then animals | no humans | is it plausibly safe enough to give a person at all |
| Phase 0 | very few volunteers, microdoses | 10 to 15 | does the drug behave in humans the way we expect at all |
| Phase 1 | usually healthy volunteers | 20 to 100 | is it safe, what dose, what side effects |
| Phase 2 | people with the condition | 100 to 300 | does it appear to work |
| Phase 3 | people with the condition, many sites | 300 to 3,000 | does it work, compared to the current standard, with rare harms visible |
| Phase 4 | everyone taking it after approval | thousands, over years | what shows up in the real population over time |

Three things to notice.

**The funnel starts long before Phase 1, and most of the loss happens there.** Preclinical
work runs in two stages: **in vitro**, meaning in glassware, where candidates are screened
for receptor binding, enzyme effects and cell toxicity, and **in vivo**, meaning in living
animals, where toxicology studies run under Good Laboratory Practice to establish a safety
profile and a safe starting dose for the first human. Reported figures put preclinical
success at roughly 10%, with the great majority of candidates eliminated before a regulator
is ever asked for permission to dose a person.

That shape is worth carrying into software. The cheapest, least realistic tests eliminate
most candidates; the expensive realistic ones run on the few that survive. A pipeline that
spends equal effort at every stage has the economics backwards.

**Phase 1 tests safety on healthy people who cannot benefit.** The design accepts that
some participants take on risk for no personal gain, which is why ethics review boards
exist and why dose escalation is done in small cohorts with stopping rules. This is
exactly the "minimise the blast radius" principle from chaos engineering in
[07](07-software-practice-and-workflow.md), written thirty years earlier and with much
more at stake.

**Phase 4 exists because trials cannot see rare harms.** A Phase 3 trial with 3,000
participants cannot detect a side effect that occurs in one patient in 20,000. The only
way to find it is release, plus surveillance. This is the honest version of "testing in
production", and it is a permanent part of the regulated process, not an admission of
failure. Software teams who treat production monitoring as a sign of insufficient testing
have the relationship backwards.

The design elements are those in [10](10-science-and-statistics.md): randomisation, a
control arm which may receive the current standard treatment or a placebo, blinding of
patients, and double blinding of the assessors. Trials are registered before they start,
with their primary outcome named, for the same reason preregistration exists in
psychology.

## Diagnostics: testing a person

A diagnostic test's quality is described by two numbers that do not depend on how common
the disease is:

- **Sensitivity**: of the people who have the condition, what share does the test catch.
  High sensitivity means few false negatives.
- **Specificity**: of the people who do not have it, what share does the test correctly
  clear. High specificity means few false positives.

And two numbers that depend entirely on how common it is:

- **Positive predictive value (PPV)**: given a positive result, what is the chance you
  actually have it.
- **Negative predictive value (NPV)**: given a negative result, what is the chance you
  actually do not.

Patients, and most people reading a test result, want PPV. Test manufacturers report
sensitivity and specificity. That gap is the source of the most important arithmetic in
this report.

### The arithmetic, worked

Take a mammogram with 85% sensitivity and 90% specificity, in a population where 1% of
women have breast cancer. Run 10,000 women.

| | Has cancer (100) | No cancer (9,900) | Total |
|---|---|---|---|
| Test positive | 85 (true positive) | 990 (false positive) | 1,075 |
| Test negative | 15 (false negative) | 8,910 (true negative) | 8,925 |

- PPV = 85 / 1,075 = **7.9%**
- NPV = 8,910 / 8,925 = **99.8%**

A woman with a positive result has roughly an 8% chance of having cancer. The test is not
bad. The test is good. The condition is rare, so the enormous healthy group generates far
more false positives than the tiny sick group generates true positives.

This is the **base rate fallacy**, and it is not a quirk of medicine. It governs:

- A security scanner flagging 2% of dependencies in a repository with three real
  vulnerabilities.
- An alert rule that fires on a 3-sigma deviation, evaluated every minute across 500
  metrics.
- A fraud model applied to a payment stream where 0.1% of transactions are fraudulent.
- Any airport screening system, which is why secondary screening exists.
- The polygraph, where the US National Research Council's 2003 review concluded that even
  if it worked as claimed, screening a population with a low rate of the thing being
  looked for would produce a large number of false positives.

The general rule, worth memorising: **when the thing you are looking for is rare, most of
your positives are wrong, no matter how good your test is.** The fix is never a better
test alone. It is a two-stage design: a cheap, sensitive first test to rule out, then an
expensive, specific second test on the small group that survives. Screening programmes,
security triage, and continuous integration pipelines all use this shape.

### Trading the two off

Sensitivity and specificity trade against each other through the threshold. Move the
cutoff to catch more true cases and you also catch more false ones. The **ROC curve**
plots that trade-off across all thresholds, and the area under it summarises how well the
test separates the two groups regardless of where you set the line.

Where you set the line is a value judgement, not a statistical one:

- Screening for a treatable, aggressive cancer: favour sensitivity. A false alarm costs a
  follow-up scan; a miss costs a life.
- Confirming a diagnosis before starting chemotherapy: favour specificity. The treatment
  itself is harmful.
- Blood donation screening: favour sensitivity heavily. Discarding good blood is cheap
  compared to a transfusion infection.

The equivalent choice in software is made constantly and almost never stated: how noisy
should the linter be, how eagerly should the alert fire, how strict should the fraud rule
be. Naming it as a sensitivity/specificity choice makes the argument tractable.

## Testing the device against the people who use it

Medical devices carry a testing requirement software teams should envy: **human factors
validation**. Before a device can be marketed, the manufacturer must show that intended users
can use it safely, by watching them try under simulated real conditions.

The parts worth stealing:

- **A stated minimum sample.** FDA guidance calls for at least 15 participants from each
  distinct user group. Not "some users". A number, per group, that a regulator will check.
- **User groups defined in advance.** Age, training, prior experience, and whether the person
  is a professional or a layperson all define separate groups, each needing its own 15.
- **The measured outcome is use error, not satisfaction.** Sessions record errors, close
  calls, and difficulties, then analyse which remaining design problems could cause harm.
- **It is validation, not verification.** The device meeting its specification is a separate
  question, already answered. This asks whether a real person can use it without hurting
  someone.

Compare typical software usability practice, which is five users, no defined groups, a
satisfaction score, and no gate. The gap is not that software cannot afford 15 per group. It
is that nobody has to say how many, so nobody does.

## The lab itself has to be tested

A result is only as good as the laboratory that produced it, so laboratories are
themselves tested, under **ISO/IEC 17025:2017**, the international standard for the
competence of testing and calibration laboratories.

The mechanisms are the ones software quality assurance mostly lacks:

- **Metrological traceability.** Every measurement must be linked to a national or
  international reference through a documented, unbroken chain of calibrations, each with
  its own stated uncertainty. Your scale was calibrated against a weight that was
  calibrated against a national standard.
- **Measurement uncertainty.** A result is not a number, it is a number plus a range. The
  lab must estimate and report it.
- **Method validation.** Before a method is used for real, it is shown to work: its limit
  of detection, its limit of quantification, its precision, its accuracy.
- **Proficiency testing.** The lab periodically analyses samples whose true values it does
  not know, sent by an external scheme, and its answers are compared against other labs.
- **Accreditation.** An external body assesses the lab against the standard, for a defined
  scope of tests. Mutual recognition arrangements let an accredited result cross borders.

Proficiency testing is the practice with no software equivalent worth the name. It is a
blind, external, periodic check that your testing apparatus still produces correct answers
on samples you cannot game. The nearest software analogue would be periodically injecting
a known defect into the pipeline and checking that the suite catches it, which is
essentially mutation testing ([04](04-software-generative-techniques.md)) reframed as a
control on the process rather than on the code.

## Sources

- [FDA, Step 3: Clinical Research](https://www.fda.gov/patients/drug-development-process/step-3-clinical-research);
  phase participant counts as summarised by
  [Cancer Therapy Advisor](https://www.cancertherapyadvisor.com/factsheets/clinical-trial-phases/)
  and [BrightFocus](https://www.brightfocus.org/about/clinical-trials/phases-of-clinical-trials/)
- [NY State Department of Health, disease screening statistics](https://www.health.ny.gov/diseases/chronic/discreen.htm),
  source of the mammography example. Table recomputed independently in this report.
- National Research Council. *The Polygraph and Lie Detection*, 2003.
  [National Academies](https://www.nationalacademies.org/read/10420/chapter/10)
- [ISO/IEC 17025:2017](https://www.iso.org/standard/66912.html);
  [PECB overview](https://pecb.com/en/whitepaper/iso-iec-170252017-general-requirements-for-the-competence-of-testing-and-calibration-laboratories)
- [IND-enabling and GLP toxicology studies](https://www.nebiolab.com/complete-guide-on-ind-enabling-toxicology-studies/);
  [preclinical versus clinical research stages](https://intuitionlabs.ai/articles/preclinical-vs-clinical-research)
- [FDA, Applying Human Factors and Usability Engineering to Medical Devices](https://www.fda.gov/media/80481/download);
  [the 15-participants-per-user-group recommendation](https://www.emergobyul.com/news/top-5-dos-and-donts-human-factors-validation-testing-medical-devices-fda-market-access)
