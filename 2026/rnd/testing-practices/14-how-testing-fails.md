# How testing fails, everywhere

The failure modes below are not domain-specific. Each one appears in software, in
medicine, in manufacturing, and in education, wearing different clothes. Recognising the
pattern in an unfamiliar field is the fastest way to see it in your own.

## 1. The measure becomes the target

**What happens:** a number chosen to indicate quality becomes the thing people optimise,
and stops indicating quality.

| Field | Version |
|---|---|
| Software | 80% coverage target met with tests that assert nothing |
| Software | change failure rate improved by deploying less often |
| Education | curriculum narrowed to the tested subjects; 20% to 30% more class time on test prep before exams |
| Emissions testing | vehicles that detected the test cycle and behaved differently during it |
| Healthcare | hospital wait-time targets met by reclassifying when the wait starts |
| Policing | crime statistics improved by downgrading offence categories |

Campbell's law and Goodhart's law both describe this, and neither offers a way out. The
partial defences that work in practice:

- **Change the test on a schedule.** Euro NCAP revises its protocols; exam boards rotate
  question banks. If the target moves, optimising for it converges on the real goal.
- **Use several measures that are hard to game together.** Coverage plus mutation score
  plus escaped defects. Gaming all three is roughly as much work as doing the job.
- **Never attach individual consequences to a diagnostic measure.** A phishing simulation
  used to discipline people produces staff who hide clicks.
- **Keep formative and summative separate**, in the sense of
  [11](11-people-and-organisations.md). A measure used to improve should not also be used
  to judge.

## 2. Coverage read as verification

**What happens:** a measure of what the test touched is read as a measure of what the test
checked.

Software: 100% line coverage with no assertions. Manufacturing: 100% inspection where the
inspector only checks the label. Medicine: a full body scan that was never read by a
radiologist.

The general form: **contact is not examination.** The corrections are mutation testing in
software ([04](04-software-generative-techniques.md)), blind sample insertion in
laboratories, and audit of the auditors elsewhere.

## 3. Base rate blindness

**What happens:** a positive result from an accurate test is read as evidence of the thing,
when the thing is rare enough that most positives are false. Fully worked in
[09](09-health-and-diagnostics.md).

Software versions:

- An alert rule at 3 standard deviations, evaluated every minute across 500 metrics,
  produces a continuous stream of false alarms.
- A dependency scanner flagging 200 findings in a codebase with two real, reachable
  vulnerabilities.
- A fraud model applied to a stream where 0.1% of transactions are fraudulent.

The fix is never a better single test. It is a two-stage design: a sensitive first pass to
narrow the field, then a specific second pass on what survives.

## 4. Alarm fatigue

**What happens:** enough false positives arrive that people stop responding to any of them,
including true ones.

Hospital monitors that beep so often nurses silence them. Car dashboards with a permanent
warning light. A CI suite with 14% flakiness where the first response to red is to press
retry. A security dashboard with 4,000 open findings.

This is the direct human consequence of failure mode 3, and it is why the false positive
rate is a design parameter rather than a thing to minimise blindly. A test suite that is
always slightly wrong is worse than a smaller suite that is trusted.

## 5. The oracle drifts

**What happens:** the standard you are comparing against quietly becomes wrong, and the
test now enforces the error.

| Field | Version |
|---|---|
| Software | a snapshot test re-recorded whenever it fails, until it asserts the current behaviour whatever that is |
| Software | a regression baseline captured from a build that already had the bug |
| Finance | a backtest overfitted to one history, which was never the future |
| Laboratories | a reference standard past its calibration date |
| Any field | a specification that was updated while the tests were not |

The structural defence is the one metrology uses: the oracle needs its own provenance and
its own expiry. A recorded baseline should say when it was recorded, by whom, and on what
grounds it was believed correct.

## 6. Testing the sample you can reach

**What happens:** the sample that got tested differs systematically from the population you
care about, and nobody adjusts.

- **Survivorship bias**: backtesting a strategy on companies that still exist.
- **Convenience samples**: psychology results drawn overwhelmingly from Western,
  educated, industrialised, rich, democratic populations, then generalised.
- **Test data unlike production data**: 10,000 tidy seeded rows standing in for 40 million
  messy real ones. This is the single most common cause of "it worked in staging".
- **Device and browser matrices** built from the team's own laptops.
- **Clinical trials** historically under-enrolling women, older patients, and people with
  several conditions at once, which is exactly the population that will take the drug.

The correction is to state who is in the sample and who is not, which is the coverage claim
again.

## 7. Ritual compliance

**What happens:** the paperwork is performed and the check is not.

A checklist ticked without looking. A code review approved in nine seconds. A signed
inspection report for an inspection that did not happen. A disaster recovery test where
the restore was declared successful because the job exited zero and nobody opened the
database.

The tell is that the artefact exists and the finding rate is zero. **A control that never
finds anything is either unnecessary or not being performed**, and it is worth checking
which.

## 8. Testing after the decision

**What happens:** the test is run to justify a decision already taken, and a result that
contradicts it is explained away.

A security review scheduled the week before a launch that cannot move. A pilot programme
whose expansion was announced before the results came in. A/B tests re-run until one
version wins. HARKing in research, where the hypothesis is written after the results are
known.

The defence is commitment in advance: preregistration in science, a preregistered primary
metric in an A/B test, a stated go/no-go criterion before the pilot, an acceptance
criterion written before the build.

## 9. Verification without validation

**What happens:** the thing meets its specification and the specification was wrong.

This is the failure that testing is structurally worst at catching, because every test is
written against the same possibly wrong specification. It is why acceptance testing exists,
why HACCP separates validation from verification, and why user research is not optional.

The concrete tell: a feature that passes every test, ships, and is used by nobody.

## 10. Precision confused with accuracy

**What happens:** a number is reported to more decimal places than the method supports, and
the precision is read as confidence.

A load test reporting a p99 of 412.7ms from a three-minute run on a shared machine. A model
accuracy of 94.37% on a 300-item benchmark. A survey result of 61.2% from 400 respondents.

Every field that measures seriously reports uncertainty alongside the value. ISO/IEC 17025
requires laboratories to estimate and state measurement uncertainty. Software reports
benchmark numbers with no error bars almost universally.

## 11. The observed test differs from the real one

**What happens:** the subject knows it is being tested, so you measure the tested behaviour
rather than the real behaviour.

An announced fire drill measures whether the route works, not whether people use it. A
phishing simulation after an all-staff warning measures nothing. A performance test run
against a warm cache. An interview candidate who has seen the questions. A benchmark whose
test set leaked into the training data, which is the current version of this problem in
machine learning and is severe.

The defence is separation: keep an unseen holdout, do not announce, and rotate the material.

## 12. Absence of evidence read as evidence of absence

**What happens:** the tests pass, therefore the software works.

This is Dijkstra's point, made at the NATO conference in 1969: "Program testing can be used
to show the presence of bugs, but never to show their absence." It is quoted constantly and
acted on rarely.

It is also not a counsel of despair. It says a passing test suite supports one specific
claim: the behaviours it checked, on the inputs it tried, in the environment it ran, were
correct at that moment. That is a genuinely valuable claim. It is not the claim people make
on its behalf.

## The compressed version

| Failure | One-line check |
|---|---|
| Measure becomes target | is anyone's outcome attached to this number? |
| Coverage as verification | if the code were wrong, would anything fail? |
| Base rate blindness | how rare is the thing? what share of positives are real? |
| Alarm fatigue | what is the first thing a person does when this goes red? |
| Oracle drift | where did the expected value come from, and when? |
| Unrepresentative sample | who or what is not in the test? |
| Ritual compliance | when did this control last find something? |
| Testing after the decision | could a bad result still change the plan? |
| Verification without validation | who confirmed this was the right thing to build? |
| False precision | what is the uncertainty on that number? |
| Observed test | does the subject know, and does that change it? |
| Absence of evidence | what exactly did the passing result cover? |

## Sources

- [Campbell's law](https://en.wikipedia.org/wiki/Campbell%27s_law) and
  [Goodhart's law](https://psychsafety.com/goodharts-law-campbells-law-and-the-cobra-effect/)
- Dijkstra, E.W., NATO Software Engineering Techniques conference, Rome, October 1969
  (published April 1970); "Notes on Structured Programming" (EWD249), 1970
- [ISO/IEC 17025:2017](https://www.iso.org/standard/66912.html) on measurement uncertainty
- Open Science Collaboration, *Science*, 2015, on publication bias and HARKing.
  [Science](https://www.science.org/doi/10.1126/science.aac4716)
