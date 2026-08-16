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

## The eight findings

**1. Software is the only serious testing discipline with no sampling plan.**
Manufacturing states, before inspection begins, how much will be inspected, what defect
rate is accepted, what result rejects the batch, and who carries each risk. ISO 2859-1 puts
it on one page. Software teams have all four implicitly and none explicitly, which is why
"are we testing enough" is an argument that never resolves.
([10](10-materials-and-manufacturing.md), [13](13-cross-domain-map.md))

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
[09](09-health-and-diagnostics.md). The same arithmetic governs your alerting rules, your
dependency scanner, and your fraud model. The fix is never a better single test; it is a
cheap sensitive pass followed by an expensive specific one.

**5. Metrics decay into targets, and every field has watched it happen.** US schools under
high-stakes testing shifted 20% to 30% more class time to test preparation. Software teams
hit coverage targets with assertion-free tests and improve change failure rate by deploying
less. Campbell's law and Goodhart's law describe the same effect. The defence that works is
institutional: Euro NCAP revises its crash protocols on a schedule precisely because
manufacturers optimise for the test. ([11](11-people-and-organisations.md),
[14](14-how-testing-fails.md))

**6. Verification and validation mean the same thing in every field, and software is the
one that blurs them.** Verification asks whether you built it to specification. Validation
asks whether the specification could ever have worked. Food safety law separates them
formally under HACCP. A team with a green build has verification. Very few have validation.
([07](07-safety-critical-and-standards.md), [10](10-materials-and-manufacturing.md))

**7. Testing in production is not a compromise, it is a regulated requirement elsewhere.**
Phase 4 clinical trials exist because a 3,000-person Phase 3 trial cannot detect a harm
affecting one patient in 20,000. Release plus surveillance is the only design that finds
it. Canary releases, dark launching and synthetic monitoring are the same idea, and chaos
engineering's "minimise the blast radius" is the same principle as dose escalation.
([06](06-software-practice-and-workflow.md), [09](09-health-and-diagnostics.md))

**8. Most ideas do not work, and experimentation is mostly for stopping things.** At
Microsoft, across years of online controlled experiments, roughly one third of ideas moved
the target metric positively, one third did nothing, and one third made things worse. A
team whose experiments almost always win is not succeeding, it is measuring badly.
([12](12-markets-and-money.md))

## The number that should change a decision

Two figures in this report describe the same tools and disagree by a factor of two and a
half. Automated accessibility testing catches **57%** of accessibility issues by volume,
and **22.6%** of the issues a manual audit finds, and covers **20% to 40%** of distinct
WCAG success criteria. All three are correct. They have different denominators.

That is the whole report in one example. **A test result without its denominator is not a
result.** ([05](05-software-non-functional.md), [14](14-how-testing-fails.md))

## What to do about it

Five practices from other fields, ranked by change per unit of effort. Full versions in
[13](13-cross-domain-map.md).

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
