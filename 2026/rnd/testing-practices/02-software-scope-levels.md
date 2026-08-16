# Software testing by scope

The first way to sort software tests is by how much of the system each one switches on.
This is the axis people mean when they say "unit test" or "end-to-end test".

The vocabulary is genuinely inconsistent across teams. "Integration test" means three
different things in three different companies. The reliable way to talk about a test is
to say what it starts up, not what it is called.

## The ladder

| Level | What it starts up | Typical time | What it can catch | What it cannot catch |
|---|---|---|---|---|
| Static analysis | nothing; reads the code | milliseconds | type errors, unsafe patterns, style, some security bugs | anything about runtime behaviour |
| Unit | one function or class, everything else replaced by stand-ins | under 10ms | logic errors in that one piece | wrong assumptions about the pieces around it |
| Component | one module with its real internals, external systems replaced | 10ms to 1s | wiring inside a module | wiring between modules |
| Integration | two or more real parts together, often with a real database | 100ms to 10s | mismatched interfaces, schema errors, transaction bugs | whole-journey problems |
| Contract | one service, plus a recorded agreement with another | under 1s | one side changing an interface the other relies on | behaviour neither side wrote down |
| System | the whole application, dependencies stubbed at the edge | seconds | configuration, startup, cross-cutting behaviour | real third-party behaviour |
| End-to-end | everything real, driven through the real interface | seconds to minutes | anything, in principle | anything, reliably, in practice |
| Acceptance | the system, judged against what a user or buyer asked for | varies | "we built the wrong thing" | "we built it badly" |
| Production | the live system, with real traffic | continuous | everything the other levels assumed away | problems you did not think to watch for |

### Unit

A **unit test** exercises one small piece in isolation, with its neighbours replaced by
stand-ins. Concretely: a test for `applyDiscount(cart, code)` that never touches a
database, never makes a network call, and finishes in under a millisecond.

Unit tests are fast, precise about where the fault is, and blind to whether the pieces
fit together. Their real cost is design pressure: to isolate a unit you must be able to
substitute its dependencies, which pushes code toward interfaces and injection whether
or not the design wanted them.

### Component and integration

**Integration testing** turns on more than one real part. A typical example: start a real
PostgreSQL in a container, run the repository layer against it, and check that a
migration and a query agree. This catches the class of bug unit tests are structurally
incapable of catching, where each piece is correct and the assumption between them is
wrong.

The cost is speed and setup. Test containers, database seeding, and cleanup between runs
are the bulk of the work.

### Contract

**Contract testing** solves a specific problem: service A calls service B, and you want
to know that a change to B breaks A, without running A and B together.

The consumer-driven version, popularised by [Pact](https://docs.pact.io/), works in two
halves:

1. A's test suite runs against a mock of B, and records every request it made and every
   response it expected. That recording is the contract, a file.
2. B's test suite replays that file against the real B, and fails if B can no longer
   satisfy it.

Neither service ever runs alongside the other. A broker stores the contracts and the
verification results, and answers the deploy-time question: is this version of A safe to
release against the version of B currently in production?

This is the closest software has to a **reference standard**, the same idea a calibration
lab uses. See [13](13-cross-domain-map.md).

### End-to-end

An **end-to-end test** drives the real system through its real interface, usually a
browser or an API client, with real dependencies. It is the only level that tests the
thing users actually touch.

It is also, measurably, the level that lies most often. Google published flakiness rates
by test size across a week of its own continuous integration:

| Google test size | Roughly corresponds to | Flaky rate |
|---|---|---|
| Small | unit, single process, no network or disk | 0.5% |
| Medium | single machine, may use localhost network | 1.6% |
| Large | multi-machine, full system | 14% |

A **flaky** test is one that passes and fails on the same code. At 14%, roughly one large
test in seven gives you an answer unrelated to whether the code works. That is not a
tooling problem to be fixed; it is a property of testing systems with clocks, networks,
and concurrency in them, and it is the strongest single argument for the shapes discussed
in [06](06-software-practice-and-workflow.md).

### Production

Testing does not stop at release, and pretending it does discards the only environment
with real data, real traffic, and real scale. The practices are covered in
[06](06-software-practice-and-workflow.md): canary releases, feature flags, synthetic
monitoring, and chaos engineering.

## The other axis: what a test is allowed to touch

Google's small/medium/large taxonomy sorts tests by resources rather than by scope, and
it is more useful for a build system, because a build system can enforce it.

- **Small**: one process, no network, no disk, no sleeps. Enforced, not requested.
- **Medium**: one machine, localhost network allowed.
- **Large**: anything.

The point of the taxonomy is that it is mechanically checkable. A test that tries to open
a socket in a small test target fails to run at all. This is worth stealing: "unit test"
is a claim about intent, "no network access" is a claim a machine can verify.

A test that runs entirely from its own declared inputs, with no shared or external state,
is called **hermetic**. Hermetic tests are the reason a build can be cached and run in
parallel across thousands of machines.

## Who runs the test, and when

Scope is not the only distinction that matters. Two others sort tests usefully.

**By who judges the result:**

- Developer tests: written by the person writing the code, run before merge.
- Independent tests: run by a separate quality function, common in regulated and
  safety-critical work. See [07](07-safety-critical-and-standards.md).
- User acceptance testing (UAT): the buyer or a real user decides whether it is what they
  asked for. This is the only level that catches "correct software, wrong product".
- Operational acceptance: can the operations team run, monitor, back up, and restore it.

**By what triggers the run:**

- On every save: static analysis, fast unit tests.
- On every commit or pull request: the main suite, plus a **smoke test**, a very small set
  of checks that answers "is this build broken enough that running the rest is a waste of
  time".
- Nightly or weekly: long suites, performance runs, full browser matrices.
- On release: acceptance, and a **build verification test** against the deployed artefact.
- Continuously in production: synthetic checks and monitoring.

**Regression testing** is not a level. It is a purpose: re-running existing tests to check
that a change did not break something that used to work. Almost any test at any level can
serve as a regression test the second time it runs. **Confirmation testing**, sometimes
called retesting, is the narrower act of re-running the specific test that exposed a
defect, after the fix.

## Sources

- [Google Testing Blog: Where do our flaky tests come from?](https://testing.googleblog.com/2017/04/where-do-our-flaky-tests-come-from.html)
- [Google Testing Blog: Flaky Tests at Google and How We Mitigate Them](https://testing.googleblog.com/2016/05/flaky-tests-at-google-and-how-we.html)
- Memon, Gao et al. [Taming Google-Scale Continuous Testing](https://research.google.com/pubs/archive/45861.pdf)
- [Pact: consumer-driven contract testing](https://docs.pact.io/)
- [ISTQB Certified Tester Foundation Level v4.0, test levels and test types](https://astqb.org/4-1-test-techniques-overview/)
