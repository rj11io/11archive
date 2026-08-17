# Practices, workflows, and where tests live

Techniques are what a test does. Practices are how testing fits into how a team works.
This is where most of the argument in the industry actually happens.

## Writing tests before the code

Three related practices, often confused, differing in who writes the test and what
language it is in.

**Test-driven development (TDD).** Write a failing test, write the smallest code that
passes it, then clean up the code without changing behaviour. Red, green, refactor. The
loop is measured in seconds to minutes.

The claimed benefit that holds up best in practice is not defect count. It is design
pressure. Code that is hard to test is usually code with too many dependencies, and TDD
makes that pain immediate rather than deferred. The claimed benefit that holds up least
well is that it replaces design thinking; it does not.

**Behaviour-driven development (BDD).** Write the expected behaviour in structured plain
language, then bind it to code.

```gherkin
Given a customer with an expired card
When they check out
Then they are asked for a new payment method
And the order is not charged
```

The point is not the syntax. It is that a non-engineer can read, correct, and disagree
with the specification before anyone builds it. BDD fails when nobody outside engineering
ever reads the files, at which point it is a slower way of writing tests.

**Acceptance-test-driven development (ATDD), or specification by example.** Before work
starts, the people who want the feature, the people who will build it, and the people who
will test it agree on concrete examples of what "done" looks like. Those examples become
the acceptance tests.

The strongest argument for all three is unglamorous: a test written before the code tests
the requirement, and a test written after the code tests the implementation. Tests written
afterwards tend to encode whatever the code happens to do, including its bugs.

## Test doubles

A **test double** is any stand-in used in place of a real dependency. Gerard Meszaros
named the family in *xUnit Test Patterns*; Martin Fowler's "Mocks Aren't Stubs" fixed the
vocabulary.

| Double | What it does | Use when |
|---|---|---|
| Dummy | passed in, never used | a parameter must be supplied and does not matter |
| Stub | returns canned answers | you need the code under test to receive a particular value |
| Spy | a stub that also records how it was called | you want to check a call happened, after the fact |
| Mock | pre-programmed with expectations, fails the test if they are not met | the call itself is the behaviour you are testing |
| Fake | a real, working, simplified implementation | you need realistic behaviour cheaply, for example an in-memory database |

The distinction that matters: **a stub answers a question, a mock verifies an action.**
Fowler frames this as state verification against behaviour verification. Checking that
`saveOrder` returned the right object is state verification. Checking that `sendEmail` was
called exactly once is behaviour verification.

The failure mode is over-mocking. A test where every dependency is a mock verifies that
the code calls the functions the test author expected, in the order the test author
expected. Refactor the internals without changing behaviour and it breaks. That is the
opposite of what a test is for. Prefer fakes over mocks where a fake is available.

## The shapes argument

Several competing pictures describe how many tests of each kind to write.

| Shape | Proposed by | Distribution | Best fit |
|---|---|---|---|
| Test pyramid | Mike Cohn, *Succeeding with Agile*, 2009 | many unit, fewer integration, very few end-to-end | monoliths with rich domain logic |
| Testing trophy | Kent C. Dodds | static analysis at the base, weight on integration | front-end and application code with thin logic and many integrations |
| Testing honeycomb | Spotify, Schaffer and Dybeck, January 2018 | small ends, fat middle of integration tests | microservices, where the risk is between services |
| Ice cream cone | nobody, on purpose | mostly manual and end-to-end, few unit | the shape teams end up with by accident |

The pyramid is the oldest and still the right default for code with real logic in it. The
argument for the trophy and the honeycomb is not fashion; it is that in a service whose
functions mostly call other services, a unit test with everything mocked verifies almost
nothing, and the risk has moved to the seams.

The empirical constraint on all of this is the flakiness data in
[02](02-software-scope-levels.md): Google measured 0.5% flakiness in small tests and 14%
in large ones. Any shape that puts a lot of weight at the top is buying coverage with
signal, and past a certain point a suite that cries wolf 14% of the time is a suite people
stop reading.

A practical rule that survives all four shapes: **push each test to the lowest level that
can still catch the bug.** If a unit test can catch it, do not write an end-to-end test
for it.

## Continuous integration and quality gates

A typical pipeline, ordered by cost:

1. Formatting and linting, seconds.
2. Type checking, seconds.
3. Unit tests, under two minutes.
4. Build.
5. Integration tests, minutes.
6. Contract verification.
7. Security scanning: dependencies, secrets, static analysis.
8. Deploy to a staging environment.
9. End-to-end smoke tests.
10. Deploy to production behind a flag or as a canary.

The ordering principle is to fail fast and fail cheap. There is no reason to spend eight
minutes on integration tests for a branch that does not compile.

**Gates worth setting**, with the caveats that make them useful rather than performative:

- Coverage must not *decrease*. Better than an absolute target, because it does not punish
  a legacy codebase and does not reward writing assertion-free tests to hit a number.
- No new high-severity findings from security scanning. Existing ones need a stated owner
  and date, not a permanent exception.
- Build time budget. A suite that takes 40 minutes is a suite people work around.
- Flake budget. Track the rate. Quarantine tests that exceed it rather than retrying them
  silently, because an auto-retry converts a real intermittent bug into a green build.

## Shift left and shift right

**Shift left** means moving testing earlier: static analysis in the editor, tests before
code, requirements reviewed with examples. The usual justification is the "cost of a
defect rises 100x by production" curve.

That curve is worth being careful about. Laurent Bossavit traced the widely cited version
of it in *The Leprechauns of Software Engineering* and found the attribution runs back to
a textbook citing internal IBM course notes, with no dataset that anyone has produced.
The direction is well supported: late fixes usually cost more. The specific multipliers
are folklore presented as data. Cite the direction, not the numbers.

**Shift right** means testing in production, where the real data, real traffic, and real
scale are. The techniques:

| Practice | What it does | Concrete example |
|---|---|---|
| Canary release | send a small share of traffic to the new version, compare error rates | 1% of users for 20 minutes, roll back automatically on a rise in 5xx responses |
| Blue-green deployment | run two full environments, switch traffic between them | instant rollback by switching back |
| Feature flags | ship the code off, turn it on for a chosen group | enable for internal staff, then 5% of users, then everyone |
| Dark launching | run the new code on real traffic without using its results | route real queries to a new search backend, log the differences, serve the old results |
| A/B testing | show two versions, compare outcomes on a metric | see [14](14-markets-and-money.md) |
| Synthetic monitoring | run scripted user journeys against production continuously | log in and check out every five minutes from three regions |
| Chaos engineering | inject failure deliberately, verify the system holds | below |

Dark launching deserves emphasis. It is [differential testing](04-software-generative-techniques.md)
run against production traffic, and it is the only technique that tests a replacement
system against the full weirdness of real inputs before anyone depends on it.

## Chaos engineering

Chaos engineering is "the discipline of experimenting on a system in order to build
confidence in the system's capability to withstand turbulent conditions in production".

It is a real experiment, in the scientific sense, and its published method maps exactly
onto the six parts in [01](01-anatomy-of-a-test.md):

1. Define **steady state** as a measurable output of normal behaviour, for example
   throughput, error rate, latency. That is the oracle.
2. Hypothesise that steady state continues in both the control group and the experimental
   group.
3. Introduce variables that reflect real events: servers crashing, disks failing, network
   latency rising.
4. Try to disprove the hypothesis by comparing steady state between the groups.

The published advanced principles add: vary real-world events, run experiments in
production, automate them to run continuously, and **minimise the blast radius** so the
fallout stays contained.

That last principle is the ethical core, and it is the same idea as the dose escalation
rule in a Phase 1 clinical trial ([11](11-health-and-diagnostics.md)). You are
experimenting on a live system with real users in it, so you bound the harm in advance.

## Managing the test suite itself

A test suite is code, and it decays.

- **Flaky tests.** Track flake rate per test as a first-class metric. Quarantine, then fix
  or delete. The common causes are time, ordering, shared state, real network calls, and
  concurrency. Silent auto-retry is not a fix; it hides real intermittent bugs.
- **Test data.** Prefer building the data each test needs inside the test over a shared
  fixture database. Shared fixtures produce tests that pass only in a particular order.
- **Slow tests.** Measure and publish the slowest 20. They are usually a handful of tests
  doing something they do not need to do, such as sleeping.
- **Dead tests.** A test that has never failed in three years and covers code that is
  covered elsewhere costs time and confidence and buys nothing.

## Metrics worth tracking

| Metric | What it tells you | How it gets gamed |
|---|---|---|
| Line or branch coverage | which code no test reaches | write tests with no assertions |
| Mutation score | whether tests would notice a behaviour change | ignore mutants as "equivalent" |
| Escaped defect rate | how many bugs reach users | classify bugs as features |
| Change failure rate | share of deployments causing a failure | deploy less often |
| Mean time to restore | how fast you recover | reclassify incidents |
| Flake rate | how much your suite lies | auto-retry until green |
| Suite runtime | whether people will keep running it | split the suite and only run part |

DORA's 2025 report puts a strong change failure rate at 0% to 2%, with only 16.7% of
respondents reporting one that low, and replaced the older elite-to-low tiers with seven
team profiles. It also reports that rising AI adoption correlates with increased delivery
instability even while individual effectiveness improves, which is the sort of finding
that argues for keeping the safety net rather than trusting the generator.

Every row in that table has a gaming column for a reason. Goodhart's law applies to
testing metrics exactly as it applies to school test scores; see
[16](16-how-testing-fails.md).

## Sources

- Meszaros, G. *xUnit Test Patterns*, 2007; Fowler, M.
  ["Mocks Aren't Stubs"](https://martinfowler.com/articles/mocksArentStubs.html)
- Cohn, M. *Succeeding with Agile*, 2009, for the test pyramid; Kent C. Dodds for the
  testing trophy; Schaffer, A. and Dybeck, R., Spotify Engineering, January 2018, for the
  honeycomb. Summarised at
  [web.dev](https://web.dev/articles/ta-strategies)
- Bossavit, L. *The Leprechauns of Software Engineering*, chapter on the cost-of-defects
  curve.
  [Google Books](https://books.google.com/books/about/The_Leprechauns_of_Software_Engineering.html?id=6LcpBgAAQBAJ)
- [Principles of Chaos Engineering](https://principlesofchaos.org/)
- [DORA 2025 State of DevOps, change failure rate benchmarks](https://www.opstrails.dev/insights/change-failure-rate-dora-metric)
