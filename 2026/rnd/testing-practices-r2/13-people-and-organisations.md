# Testing people and organisations

Testing a person or an institution has a property no other kind of testing has: **the
subject knows it is being tested and can change its behaviour in response.** Everything
distinctive about this family follows from that.

## Psychometrics: testing what cannot be seen

An exam, a personality inventory, and a clinical depression scale all try to measure
something that has no physical existence. You cannot weigh reading comprehension. You can
only observe behaviour you claim is a sign of it.

The field that studies this, psychometrics, has the most developed language anywhere for
"is this test any good", and it splits the question into two.

**Reliability: does the test give a consistent answer?**

| Type | Question | How it is checked |
|---|---|---|
| Test-retest | same person, later, same score? | administer twice, correlate |
| Internal consistency | do the items measure the same thing? | Cronbach's alpha across items |
| Inter-rater | do two markers agree? | Cohen's kappa, which corrects raw agreement for chance |
| Parallel forms | do two versions of the test agree? | correlate scores across forms |

**Validity: is it measuring the thing you say it measures?**

| Type | Question |
|---|---|
| Face | does it look relevant to the people taking it |
| Content | does it cover the whole of the thing, not just the easy parts |
| Criterion | does it predict something real and external, like later job performance |
| Construct | does it actually measure the underlying trait it claims to |

The relationship between them is the lesson. **A test can be perfectly reliable and
completely invalid.** A bathroom scale reads the same weight every time; it is a very
reliable measure of your reading ability, and a useless one. Reliability is necessary and
nowhere near sufficient.

Software has reliability language and almost no validity language. A test suite that
passes consistently is reliable. Whether passing means the software is good is a validity
question, and the honest answer for most suites is that nobody has checked. Cohen's kappa
is also directly useful and unused: when two reviewers, or a human and a model, classify
the same items, raw agreement overstates the case, because some agreement happens by
chance.

## Education assessment

Two purposes, and the difference is who the result is for.

- **Formative assessment** happens during learning and exists to change what happens next.
  A quiz whose result tells a teacher which concept to reteach. Low stakes by design.
- **Summative assessment** happens at the end and exists to certify. A final exam. Usually
  high stakes.

The same distinction applies to software testing, and is worth borrowing explicitly. A
failing test in your editor is formative: it tells you what to do next. A release gate is
summative: it certifies. Confusing them produces both of the common dysfunctions, treating
a red build as a judgement rather than information, and treating a release gate as a
suggestion.

Two more distinctions:

- **Norm-referenced** scoring ranks you against other test-takers. Someone must be in the
  bottom 10%, by construction, however good everyone is.
- **Criterion-referenced** scoring measures you against a fixed standard. Everyone can
  pass. A driving test is criterion-referenced; a curve is norm-referenced.

**Adaptive testing** picks the next question based on your previous answers, using item
response theory to home in on your level. It gets a more precise estimate from fewer
questions, which is the same efficiency argument as coverage-guided fuzzing in
[04](04-software-generative-techniques.md): choose the next input based on what the
previous ones revealed.

### The failure mode with a name

High-stakes testing of people produces a specific, well-documented corruption, and two
laws describe it.

**Campbell's law**: "The more any quantitative social indicator is used for social
decision-making, the more subject it will be to corruption pressures and the more apt it
will be to distort and corrupt the social processes it is intended to monitor."

**Goodhart's law**, in its common paraphrase: when a measure becomes a target, it ceases to
be a good measure.

In education this appears as teaching to the test, narrowed curricula, and outright
cheating. Empirical analyses covering 2002 to 2007 in US schools found teachers dedicating
20% to 30% more time to test preparation in the weeks before exams, at the expense of
deeper conceptual work.

This is the same phenomenon as a team writing assertion-free tests to hit a coverage
target, or deploying less often to protect a change failure rate. See
[16](16-how-testing-fails.md), which treats it as the general problem it is.

## Hiring and professional licensing

Hiring assessment is a testing problem with poor construct validity and enormous stakes,
and it is worth naming because software people design these tests constantly without the
vocabulary.

- A **work sample test** asks the candidate to do a small version of the actual job. It has
  the best criterion validity of the common methods, because the test and the criterion
  are nearly the same thing.
- **Structured interviews**, where every candidate gets the same questions scored against
  a defined rubric, substantially outperform unstructured ones, largely because they raise
  inter-rater reliability.
- **Take-home exercises** trade realism for time, and introduce a coverage problem: they
  test who has free evenings.

Professional licensing, for doctors, pilots, electricians and lawyers, is criterion-
referenced summative testing with periodic revalidation. The revalidation is the part
software certification lacks: a licence that never expires tests what you knew once.

## Physical and performance testing of people

- **Fitness assessment**: VO2 max, lactate threshold, sprint and strength batteries. These
  are laboratory measurements with defined protocols, and the sports science literature
  worries about protocol standardisation for exactly the reasons ISO/IEC 17025 does.
- **Anti-doping testing**: in-competition and out-of-competition, with no-advance-notice
  collection, chain of custody, an A sample and a B sample so a positive can be
  independently confirmed, and the athlete biological passport, which watches an
  individual's own biological markers over time rather than testing for a substance.

The biological passport is a genuinely clever answer to an arms race. Rather than testing
for known substances, which invites the invention of unknown ones, it looks for changes in
the athlete that no natural process explains. The software equivalent is anomaly detection
on a system's own baseline, rather than signature matching against known attacks, and the
same trade-off applies: fewer things to evade, more false positives.

## Forensic and legal testing

Courts must decide whether a test is good enough to be believed, and US federal courts use
the **Daubert standard**, from *Daubert v. Merrell Dow Pharmaceuticals* (1993), which made
trial judges gatekeepers for scientific evidence. The factors:

1. Can the technique be tested, and has it been?
2. Has it been peer reviewed and published?
3. What is the known or potential error rate?
4. Do standards and controls exist and are they maintained?
5. Is it generally accepted in the relevant scientific community?

Factor 3 is the one to notice. **A court asks for the error rate of the test itself.** Not
whether the expert believes the result, but how often the method is wrong. Very few
software or security assessments could answer that question about themselves.

The **polygraph** is the standing example of what happens when a test is used widely
without an established error rate. The US National Research Council's 2003 review found
the scientific basis of the comparison question technique weak, the supporting research of
low quality, the profession's accuracy claims unfounded, and the error rate unknown, while
noting that accuracy is better than chance. It also made the base-rate point from
[11](11-health-and-diagnostics.md): screening a population where the thing being looked for
is rare would produce a large number of false positives even if the test worked as claimed.

Chain of custody is the other transferable idea: a documented, unbroken record of who held
the sample, when, and what they did to it. Any break makes the result inadmissible
regardless of what it says. Software has the same requirement for audit and incident
evidence and treats it far more casually.

## Testing organisations

An organisation can be tested as a system, and the methods are the direct ancestors of
chaos engineering in [07](07-software-practice-and-workflow.md).

| Exercise | What it tests | How real it is |
|---|---|---|
| Tabletop exercise | decision-making, roles, and communication under a scenario | discussion only, no systems touched |
| Walkthrough or drill | one specific procedure, performed for real | limited scope |
| Simulation or functional exercise | responders act, but on a simulated incident | systems may be exercised |
| Full-scale exercise | the real thing, with real systems and real disruption | fully real |
| Disaster recovery test | restore systems into a clean environment and confirm they work | real, if done properly |
| Fire drill and evacuation | can everyone get out, in the time budget | real |
| Phishing simulation | will staff click, and will they report it | real, on real people |
| Red team exercise | would you detect and respond to an actual intruder | real, usually undisclosed to defenders |
| War gaming | strategic decisions against an adversary who adapts | simulated |

The ladder from tabletop to full-scale is a blast radius ladder, exactly like the canary
progression in a software release. Start where being wrong is cheap, then increase realism
as confidence grows.

Two cautions worth carrying over.

**A drill everyone knew about tests a different thing.** An announced evacuation measures
whether the route works. An unannounced one measures whether people use it. Both are
useful; they are not the same test, and the announced version is routinely reported as
though it were the unannounced one.

**Phishing simulations test the organisation, not the individual.** A programme that
punishes people who click produces staff who hide incidents, which is worse than staff who
click. The metric worth tracking is the report rate, not the click rate. This is Campbell's
law arriving on schedule.

## Sources

- [Types of reliability, Research Methods Knowledge Base](https://conjointly.com/kb/types-of-reliability/);
  [reliability and validity of measurement](https://opentext.wsu.edu/carriecuttler/chapter/reliability-and-validity-of-measurement/1000/)
- [Formative and summative assessment, Yale Poorvu Center](https://poorvucenter.yale.edu/teaching/teaching-resource-library/formative-summative-assessments)
- [Campbell's law](https://en.wikipedia.org/wiki/Campbell%27s_law);
  [Goodhart's law, Campbell's law and the cobra effect](https://psychsafety.com/goodharts-law-campbells-law-and-the-cobra-effect/)
- [The Daubert standard and its five factors](https://bridgelegal.org/understanding-five-daubert-factors-expert-testimony/)
- National Research Council. *The Polygraph and Lie Detection*, 2003.
  [National Academies](https://www.nationalacademies.org/read/10420/chapter/10)
- [NIST SP 800-115 and red, blue and purple teams](https://www.compassitc.com/blog/penetration-testing-understanding-red-blue-purple-teams)
