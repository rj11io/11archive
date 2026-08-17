# Testing concurrency, distributed state, and time

Everything in [03](03-software-design-techniques.md) and
[04](04-software-generative-techniques.md) assumes the same input gives the same result.
Once there are two threads, two machines, or two clocks, that stops being true, and most of
the testing toolkit quietly stops working.

The reason is worth stating precisely. **A concurrent test that passes tells you one
interleaving was correct.** There may be a million others. The scheduler picks, you do not,
and the one that corrupts your data may never be picked on your laptop and may be picked
within an hour of production traffic. Running the test a thousand times does not fix this,
because the scheduler is not sampling uniformly from the interesting cases; it is doing
whatever is fastest, which is usually the same thing every time.

This is the area where software testing has advanced most in the last decade, and it is
where the strongest techniques in the whole field now live.

## The cheap layer: detectors

**Race detectors** instrument memory access and report when two threads touch the same
location without synchronisation, whether or not anything went wrong on that run. Go's
`-race` flag and ThreadSanitizer for C, C++ and Rust are the common ones.

The important property: a race detector does not need the bug to manifest. It reports the
unsynchronised access itself. That makes it closer to
[static analysis](06-software-non-functional.md) than to a test, and it means it finds
things a passing test cannot.

The cost is real. Instrumented builds typically run several times slower and use much more
memory, so the usual arrangement is to run the suite twice: once fast, once instrumented and
less often.

## The middle layer: fault injection against real systems

**Jepsen**, the project Kyle Kingsbury started in 2013, became the industry's standard way
to check whether a distributed database does what its documentation claims. Its method has
two halves, and both matter.

**One, break the environment for real:**

| Fault | How Jepsen causes it |
|---|---|
| Network partition | firewall rules that drop traffic between groups of nodes |
| Process death | `SIGKILL` |
| Garbage collection pause, or a hung process | `SIGSTOP` then `SIGCONT` |
| Clock skew | setting the system clock on individual nodes |

**Two, check the history against a formal consistency model.** This is the part people
skip when they imitate Jepsen. Jepsen records every operation with its start and end time,
then asks whether the whole recorded history could have been produced by a correct system.
Its checker, Elle, identifies transactional anomalies in the Adya formalism in linear time,
covering isolation levels up to strict serializability.

That second half is a genuinely clever answer to the oracle problem from
[01](01-anatomy-of-a-test.md). You do not need to know what each read should have returned.
You need to know whether *some* consistent ordering explains all of them at once. If none
does, the database violated its own guarantee, and you have proof rather than a suspicion.

Jepsen has found consistency errors in widely deployed systems including PostgreSQL, Dgraph
and Redis-Raft, and in the Dgraph case reported deadlocks, crashes, record loss and
corruption occurring even in healthy clusters with no faults injected at all.

The practice to copy, if you run anything distributed: **record a history, then check the
history, rather than asserting on individual reads.**

## The strong layer: deterministic simulation testing

Deterministic simulation testing (DST) takes the opposite approach to Jepsen. Rather than
breaking a real cluster and hoping to catch the bad interleaving, it removes every source of
non-determinism so that *you* choose the interleaving.

How it works:

1. Run the whole distributed system, every node, on a single thread.
2. Replace everything non-deterministic with a controlled version: the clock, the network,
   the disk, thread scheduling, and the random number generator, all driven from one seed.
3. Inject faults: dropped messages, reordered messages, latency, disk corruption, node
   restarts, clock jumps.
4. Assert the system's invariants after every step.
5. Change the seed and repeat, forever.

Two consequences follow, and they are the reason this technique matters:

**Time compresses.** Because nothing waits on a real clock or a real disk, a simulation can
cover what would be years of operation in minutes. The FoundationDB team, who pioneered the
approach, reported routinely accumulating five to ten million simulated hours per night.

**Failures replay exactly.** A failing run is a seed. Hand someone the seed and they get
byte-identical behaviour, including the bug. This eliminates the single worst property of
concurrency bugs, which is that they do not reproduce. In the six-part frame, DST gives a
concurrency bug a **chain of custody**, in the sense [13](13-people-and-organisations.md)
uses the term for forensic evidence.

The most telling endorsement is indirect: Kingsbury declined to run Jepsen against
FoundationDB, on the grounds that its own simulator had already stressed it harder than
Jepsen could.

The technique has spread. TigerBeetle built its database around it. WarpStream applied it to
an entire commercial service. Antithesis, built by people from the FoundationDB team,
packages it as a deterministic hypervisor that runs ordinary non-deterministic software,
in Docker containers, inside a deterministic environment.

The cost is honest and high: you generally cannot retrofit DST. It requires that all
input and output go through interfaces you can substitute, which is an architectural
commitment made at the start.

## The exhaustive layer: model checking the design

The techniques above test an implementation. **Model checking** tests a design, before an
implementation exists.

You write a specification of the algorithm in a language such as TLA+, state the properties
it must always hold, and a checker explores the reachable states looking for a sequence that
violates one. It is exhaustive over the model, which is exactly the "show their absence"
that Dijkstra said testing cannot do, bought by shrinking what you are reasoning about.

Amazon Web Services has used this since 2011. Their published account reports seven teams
using TLA+, that the model checker found serious and subtle bugs in their algorithms, and
that the engineers were convinced those bugs would not have been found by conventional
design review, code review, or testing.

The limit is the gap between model and code. A verified design implemented incorrectly is
still broken. Model checking and DST are complements: one checks that the algorithm is
right, the other checks that the program is the algorithm.

## Time is its own category

Clocks break software in ways that look like concurrency bugs and are not. Worth testing
deliberately, because none of it appears in ordinary test data:

| Case | What breaks |
|---|---|
| Daylight saving transitions | an hour that happens twice, and an hour that never happens |
| Timezones with non-hour offsets | India at +5:30, Nepal at +5:45, Chatham Islands at +12:45 |
| Leap years, and 29 February | date arithmetic, annual renewals, birthdays |
| Leap seconds | monotonic assumptions, and systems that smear the second instead |
| Clock skew between machines | anything ordering events by wall clock |
| Clock moving backwards | timeouts, caches, tokens, rate limiters |
| Wall clock versus monotonic clock | measuring a duration with a clock that can be adjusted |

The practice: never read the system clock directly in code you want to test. Inject it. Then
a test can put the system at 01:59:59 on a transition night, or move the clock backwards
mid-request, without waiting for October.

## Upgrades, which are concurrency in disguise

A rolling upgrade puts two versions of your software in the same cluster, talking to each
other and to one database, for as long as the rollout takes. Almost nobody tests that state,
and it is a live production configuration every time you deploy.

What to test:

- **Mixed-version operation.** Run old and new together and exercise the traffic that
  crosses between them. Old readers must survive new writers, and new readers must survive
  old writers.
- **Expand and contract migrations.** Change a schema in stages that are each compatible
  with both code versions: add the new column, write to both, backfill, switch reads, then
  remove the old column in a later release. Never in one step.
- **Deploy order.** For a backwards-compatible change, roll out the consumers before the
  producers, so nothing receives a shape it cannot read.
- **Rollback.** The new version wrote data. Can the old version still read it? A rollback
  path that has never been exercised is not a rollback path.
- **Idempotency and retries.** At-least-once delivery means your handler will see the same
  message twice. Test that it does, deliberately, rather than discovering it during an
  incident.

Contract testing from [02](02-software-scope-levels.md) is the cheapest tool here, because
the recorded contract is exactly the compatibility question written down.

## What to reach for

| Situation | What to use |
|---|---|
| Shared mutable state between threads | race detector on a second CI run |
| A distributed database or queue you depend on | read its Jepsen report; if there is none, treat its consistency claims as unverified |
| A distributed system you are building | record histories and check them; adopt DST if you are early enough to design for it |
| A consensus or replication algorithm you invented | model check it before you implement it |
| Anything with dates, renewals, or scheduling | inject the clock, then test the transitions above |
| Every deployment | mixed-version tests plus an exercised rollback |
| A message consumer | deliver the same message twice on purpose |

## Sources

- [Jepsen](https://jepsen.io/analyses), analyses and method; [Jepsen blog](https://jepsen.io/blog)
- Kingsbury, K. and Alvaro, P. "Elle: Inferring Isolation Anomalies from Experimental
  Observations". Summarised at [ACM PODC 2021](https://www.podc.org/podc2021/kyle-kingsbury/)
- [Antithesis: deterministic simulation testing, how it works and when to use it](https://antithesis.com/docs/resources/deterministic_simulation_testing/)
- [WarpStream: deterministic simulation testing for our entire SaaS](https://www.warpstream.com/blog/deterministic-simulation-testing-for-our-entire-saas)
- Eaton, P. ["What's the big deal about deterministic simulation testing?"](https://notes.eatonphil.com/2024-08-20-deterministic-simulation-testing.html)
- Newcombe, C. et al. ["How Amazon Web Services Uses Formal Methods"](https://cacm.acm.org/research/how-amazon-web-services-uses-formal-methods/),
  *Communications of the ACM*, April 2015;
  [PDF](https://lamport.azurewebsites.net/tla/formal-methods-amazon.pdf)
- Satarin, A. [Testing distributed systems, curated resources](https://asatarin.github.io/testing-distributed-systems/)
- [Backward compatibility in schema evolution](https://www.dataexpert.io/blog/backward-compatibility-schema-evolution-guide)
