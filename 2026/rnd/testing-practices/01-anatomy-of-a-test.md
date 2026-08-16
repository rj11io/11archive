# The anatomy of a test

Every test ever run is the same six-part machine. A unit test in JavaScript, an
ultrasound scan of a weld, a Phase 3 drug trial, and a school exam differ in cost and
consequence, not in shape.

Naming the six parts is useful because **a field's characteristic failure is whichever
part it leaves unstated.** Software leaves out the coverage claim. Medicine leaves out
the base rate. Education leaves out the construct. Manufacturing states all six, because
a lawyer will eventually read the paperwork.

## The six parts

| Part | Question it answers | Software example | Non-software example |
|---|---|---|---|
| Subject | What exactly is under test? | one function, `parsePrice()` | one weld on one pipe joint |
| Stimulus | What do you do to it? | call it with `"$1,299.00"` | send high-frequency sound through the weld |
| Oracle | How do you know the right answer? | the assertion `expect(result).toBe(129900)` | a reference block with a known, measured flaw in it |
| Threshold | Where is the pass/fail line? | exact equality; any difference fails | reject if the returned echo exceeds a set share of the reference echo |
| Coverage claim | What did this result cover, and what did it not? | US dollar format only; no euros, no negatives | flaws inside the metal only; says nothing about surface cracks |
| Decision | What changes because of the result? | block the merge | cut the weld out and redo it |

Drop any one part and the test stops being a test:

- No subject: you are describing, not testing.
- No stimulus: you are inspecting, not testing.
- No oracle: you are observing, not testing. This is the hard one, and it has a name.
- No threshold: you are measuring, not testing.
- No coverage claim: you have a result you cannot size.
- No decision: you have a ritual.

## The oracle is the hard part

An **oracle** is whatever tells you the observed behaviour was correct. Software testing
research calls the difficulty of getting one the **test oracle problem**, named in
Elaine Weyuker's 1982 paper "On Testing Non-Testable Programs" and surveyed in depth by
Barr and colleagues in 2015.

The problem is easy to see with a concrete case. Write a function that sorts a list, and
the oracle is trivial: check the output is in order and holds the same items. Write a
function that renders a 3D scene, or ranks search results, or estimates a house price,
and there is no cheap way to know the right answer. You are testing a program precisely
because you could not compute the answer another way.

Every field solves this differently, and the solutions are worth borrowing:

| Oracle strategy | How it works | Where it is used |
|---|---|---|
| Stated expected value | Someone writes down the answer in advance | unit tests, exam answer keys |
| Reference standard | Compare against a physical or certified artefact | calibration weights, NDT reference blocks, lab controls |
| Second implementation | Run two independent versions, compare | differential testing, dual-entry bookkeeping, double data entry in trials |
| Previous version | Compare against what the system did last time | snapshot and approval tests, regression baselines, control charts |
| Relation, not value | You do not know the answer, but you know how two answers must relate | metamorphic testing, physical conservation laws |
| Property | You do not know the answer, but you know a rule it must obey | property-based testing, mass balance in chemistry |
| Human judgement | An expert decides | exploratory testing, sensory panels, radiologists, peer review |
| Control group | The oracle is a second population that got nothing | clinical trials, A/B tests, field experiments in economics |

The last row is the one software borrowed most recently and least completely. An A/B
test is a randomised controlled trial with the vocabulary filed off.

## Two ways to be wrong, in every field

A test can be wrong in exactly two directions, and every domain has invented its own
words for the same two mistakes.

| Domain | False positive means | False negative means | Which one hurts more |
|---|---|---|---|
| Software test suite | flaky test, red build on good code | escaped defect reaching users | false positives, because they train people to ignore the suite |
| Static analysis and linters | noisy warning on correct code | missed vulnerability | false positives, for the same reason |
| Medical screening | healthy person told they may be ill | illness missed | depends on the disease and the follow-up cost |
| Manufacturing inspection | good part scrapped, "producer's risk" | bad part shipped, "consumer's risk" | stated explicitly in the sampling plan, in advance |
| Airport and security screening | innocent bag flagged | weapon missed | false negatives, so thresholds run permissive |
| Spam filtering | real mail in the junk folder | spam in the inbox | false positives, badly |
| Court and forensics | innocent person convicted | guilty person freed | the whole system is tuned around the first |
| Fire alarm | evacuation for burnt toast | no alarm during a fire | false positives erode the response to real ones |

Two general lessons fall out of this table.

**First, the ratio is a design choice, not a fact.** Manufacturing writes it down as two
named risks: producer's risk, the chance of rejecting a good batch, and consumer's risk,
the chance of accepting a bad one. Software almost never writes it down, which is why
teams argue about flaky tests as if the correct rate were zero. The correct rate is
whatever you decided the cost of a false alarm is.

**Second, a very accurate test can still be mostly wrong.** This is the single most
misunderstood fact about testing anywhere, and it has nothing to do with the test's
quality. If a condition is rare, most positive results are false, no matter how good the
test is. Section [09](09-health-and-diagnostics.md) works the arithmetic with a real
example: a mammogram with 85% sensitivity and 90% specificity, applied where 1% of women
have breast cancer, produces a positive result that is correct only 8% of the time.

The same arithmetic governs a security scanner that flags 2% of dependencies in a
codebase with three real vulnerabilities, and a school test that identifies "gifted"
children where giftedness is rare. Software teams meet this every time an alerting rule
fires all night on a healthy system.

## Where each field hides a part

This is the practical payoff of the frame. Read a test in any field and ask which of the
six parts nobody wrote down.

| Field | The part left implicit | What goes wrong |
|---|---|---|
| Software | coverage claim | "the tests pass" is read as "the software works" |
| Statistics and social science | threshold and decision | p < 0.05 gets treated as a discovery rather than a chosen line |
| Medical screening | coverage claim, specifically the base rate | a positive result is read as a diagnosis |
| Education | oracle, specifically what the exam is a proxy for | the score replaces the skill it stood for |
| Manufacturing | nothing, usually | the paperwork is the product, so cost and rigidity rise |
| Security testing | coverage claim | "we passed the pentest" is read as "we are secure" |
| Machine learning evaluation | oracle and coverage claim | benchmark contamination, and scores that do not transfer |

Manufacturing is the useful outlier. A sampling plan under ISO 2859-1 states the lot
size, the sample size, the accept and reject numbers, the acceptance quality limit, and
both risks, on one page, before inspection starts. Nothing in mainstream software
testing does this. Section [13](13-cross-domain-map.md) argues it should.

## Sources

- Weyuker, E. "On Testing Non-Testable Programs", *The Computer Journal* 25(4), 1982.
- Barr, Harman, McMinn, Shahbaz, Yoo. "The Oracle Problem in Software Testing: A Survey",
  *IEEE Transactions on Software Engineering* 41(5), 2015, pp. 507-525.
  [ACM](https://dl.acm.org/doi/10.1109/TSE.2014.2372785)
- [ISO 2859-1 sampling and inspection levels](https://qualityinspection.org/inspection-level/)
- [NY State Department of Health, disease screening arithmetic](https://www.health.ny.gov/diseases/chronic/discreen.htm)
