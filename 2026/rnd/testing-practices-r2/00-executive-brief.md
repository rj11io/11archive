# Executive brief

## The short answer

**There are not many kinds of testing. There is one kind of testing, run at wildly
different costs.** A unit test, a weld inspection, a Phase 3 drug trial, a bank stress
test, and a school exam are the same six-part machine: a subject, a stimulus, an oracle
that says what should happen, a threshold, a claim about what was covered, and a decision
that follows.

Sorting testing by domain, as most writing does, hides that. Sorting it by which of the
six parts a field leaves unstated explains almost every failure in every field.

| Field | Part left unstated | Result |
|---|---|---|
| Software | coverage claim | "the tests pass" gets read as "the software works" |
| Statistics | threshold and decision | p < 0.05 gets read as a discovery |
| Medical screening | coverage claim, specifically the base rate | a positive result gets read as a diagnosis |
| Education | oracle, specifically what the exam stands for | the score replaces the skill |
| Manufacturing | nothing, usually | the paperwork becomes the product |

## The eleven findings

**1. Mainstream software practice states no acceptance criterion, where manufacturing states
one before it starts.** ISO 2859-1 puts the lot size, sample size, accepted defect rate,
reject number, and both parties' risks on one page, before inspection. Software teams have
all of these implicitly and almost never explicitly, which is why "are we testing enough" is
an argument that never resolves. The caveat matters: acceptance sampling rests on a
probability model connecting sample to population, and test coverage has no equivalent, so
the borrowed version is a device for forcing decisions into the open rather than a
statistical instrument. ([12](12-materials-and-manufacturing.md),
[15](15-cross-domain-map.md), [17](17-limits-of-the-frame.md))

**2. Coverage measures contact, not examination.** A suite that calls every function and
asserts nothing scores 100% line coverage. Mutation testing, which changes the code and
counts how many changes the suite notices, is the only widely available measure that tests
the tests, and it dates to 1978. ([03](03-software-design-techniques.md),
[04](04-software-generative-techniques.md))

**3. Big tests lie. Measurably.** Google published flakiness by test size across a week of
its own continuous integration: 0.5% for small tests, 1.6% for medium, and 14% for large.
Roughly one large test in seven returns an answer unrelated to whether the code works.
That number, not fashion, is the real argument behind every test-shape debate.
([02](02-software-scope-levels.md))

**4. When the thing you look for is rare, most of your positives are wrong, however good
the test.** A mammogram with 85% sensitivity and 90% specificity, in a population where 1%
have breast cancer, gives a positive result that is correct 7.9% of the time. Recomputed in
[11](11-health-and-diagnostics.md). The same arithmetic governs your alerting rules, your
dependency scanner, and your fraud model. The fix is never a better single test; it is a
cheap sensitive pass followed by an expensive specific one.

**5. Metrics decay into targets, and every field has watched it happen.** US schools under
high-stakes testing shifted 20% to 30% more class time to test preparation. Software teams
hit coverage targets with assertion-free tests and improve change failure rate by deploying
less. Campbell's law and Goodhart's law describe the same effect. The defence that works is
institutional: Euro NCAP revises its crash protocols on a schedule precisely because
manufacturers optimise for the test. ([13](13-people-and-organisations.md),
[16](16-how-testing-fails.md))

**6. Verification and validation mean the same thing in every field, and software is the
one that blurs them.** Verification asks whether you built it to specification. Validation
asks whether the specification could ever have worked. Food safety law separates them
formally under HACCP. A team with a green build has verification. Very few have validation.
([09](09-safety-critical-and-standards.md), [12](12-materials-and-manufacturing.md))

**7. Testing in production is not a compromise, it is a regulated requirement elsewhere.**
Phase 4 clinical trials exist because a 3,000-person Phase 3 trial cannot detect a harm
affecting one patient in 20,000. Release plus surveillance is the only design that finds
it. Canary releases, dark launching and synthetic monitoring are the same idea, and chaos
engineering's "minimise the blast radius" is the same principle as dose escalation.
([07](07-software-practice-and-workflow.md), [11](11-health-and-diagnostics.md))

**8. Most ideas do not work, and experimentation is mostly for stopping things.** At
Microsoft, across years of online controlled experiments, roughly one third of ideas moved
the target metric positively, one third did nothing, and one third made things worse. A
team whose experiments almost always win is not succeeding, it is measuring badly.
([14](14-markets-and-money.md))

**9. Your tests cover the source tree; your users install the artifact.** A build and publish
step sits between the two and can destroy things the source got right: files left out, wrong
entry points, a development dependency imported at runtime, a compiler that strips a
directive. Aerospace has tested this for decades and calls it first article inspection: a
complete inspection of one item from the first production run, to verify that the *tooling*
can produce what the drawing says. The software version is one clean install of the published
artifact, and it takes a minute. ([02](02-software-scope-levels.md),
[12](12-materials-and-manufacturing.md))

**10. A concurrent test that passes tells you one interleaving was correct.** There may be a
million others, and the scheduler picks. The field's answer has moved on: record whole
histories and check them against a consistency model rather than asserting on individual
reads, and where you can design for it, control every source of non-determinism so a failure
reduces to a replayable seed. FoundationDB's team reported five to ten million simulated
hours per night this way. Kyle Kingsbury declined to run Jepsen against it, on the grounds
that its own simulator had already stressed it harder.
([05](05-software-concurrency-and-state.md))

**11. A flaky test rate is a measurement failure, and manufacturing has thresholds for it.**
Gauge R&R computes the share of observed variation coming from the measurement system rather
than the thing measured, with published bands: under 10% acceptable, over 30% unacceptable.
Google's 14% flakiness on large tests is, in those terms, a gauge that would be rejected. The
value is not the shaming, it is that the argument becomes a number against a stated band.
([12](12-materials-and-manufacturing.md), [15](15-cross-domain-map.md))

## The number that should change a decision

Two figures in this report describe the same tools and disagree by a factor of two and a
half. Automated accessibility testing catches **57%** of accessibility issues by volume,
and **22.6%** of the issues a manual audit finds, and covers **20% to 40%** of distinct
WCAG success criteria. All three are correct. They have different denominators.

That is the whole report in one example. **A test result without its denominator is not a
result.** ([06](06-software-non-functional.md), [16](16-how-testing-fails.md))

## What to do about it

Seven practices from other fields, ranked by change per unit of effort. Full versions in
[15](15-cross-domain-map.md).

1. **Write the sampling plan.** One page per service: accepted escape rate, inspection
   intensity, flake budget, and a rule that relaxes inspection after a clean run.
2. **Grade rigour by consequence.** Three tiers is enough. Put mutation testing and
   independent review on the top tier and stop apologising for light coverage on the
   bottom one.
3. **Test the tests on a schedule.** Mutation score on the critical modules, tracked. Plus
   the free version: at every incident review, ask why no test caught it.
4. **Write the negative coverage claim.** A short "what this suite does not cover" note
   next to the tests. It takes an hour and it is the most honest artefact most teams could
   produce.
5. **Separate the author from the verifier where the stakes justify it.** Someone other
   than the author should confirm the acceptance criteria against what was actually asked
   for.
6. **Treat flakiness as a measurement problem with a threshold.** Track it as a percentage
   against a stated band, the way a gauge R&R study does, instead of arguing about whether
   flaky tests are bad.
7. **Put detection in the risk assessment.** Score failure modes on severity, occurrence,
   and how likely you are to catch them, so "our testing would not catch this" becomes a
   visible input rather than a private worry. See
   [08](08-choosing-what-to-test.md).

## Read the limits before acting on any of this

[17](17-limits-of-the-frame.md) attacks the report's own claims: where the six-part frame does
not fit, where the translation table flattens differences that matter, where the evidence is
thin, and what experiment would falsify each recommendation above. None of the seven has been
trialled by the author on a real team. They are arguments, and they are cheap to test.
