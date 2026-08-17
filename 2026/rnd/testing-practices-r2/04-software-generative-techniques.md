# Machine-generated tests

The techniques in [03](03-software-design-techniques.md) all end with a human writing a
test case. This section covers the ones where a machine writes the cases, or writes the
verdict, or both.

They matter disproportionately because they attack the two limits of hand-written tests:
a human writes the cases they thought of, and a human asserts the behaviour they expected.

## Property-based testing

Instead of stating one input and one expected output, state a rule the output must always
obey, and let the tool generate hundreds of inputs looking for one that breaks the rule.

```javascript
// example-based: one case, one answer
expect(reverse([1, 2, 3])).toEqual([3, 2, 1])

// property-based: a rule, and a few hundred generated lists
forAll(arrayOf(integers), (list) => {
  expect(reverse(reverse(list))).toEqual(list)
})
```

The rule "reversing twice gives you back what you started with" holds for every list, so
the tool is free to try the empty list, a single item, 10,000 items, duplicates, and
negative numbers, without anyone listing them.

Useful properties, in rough order of how often they apply:

- **Round trip**: `decode(encode(x)) == x`. Applies to any serialiser, parser, or codec.
- **Invariant**: a sorted list has the same length and the same items as the input.
- **Idempotence**: applying twice equals applying once. Applies to most cleanup and
  normalisation code.
- **Comparison against a slow, obviously correct version**: a naive implementation you
  would never ship, used only as the oracle.

When a property fails, the tool **shrinks** the failing input: it repeatedly simplifies
until it finds the smallest input that still fails. A failure on a 400-item list arrives
as a failure on `[0, 0]`, which is a bug report a human can read.

Property-based testing was introduced by Koen Claessen and John Hughes in the 2000 paper
on QuickCheck for Haskell. The idea now appears in nearly every language: Hypothesis for
Python, fast-check for JavaScript, ScalaCheck, proptest for Rust.

## Fuzzing

Feed the program malformed, unexpected, or randomly mutated input, and watch for crashes,
hangs, memory errors, and assertion failures. The oracle is weak on purpose: the test is
not "did it produce the right answer" but "did it stay alive".

**Coverage-guided fuzzing** is the version that works. The fuzzer instruments the binary,
notices when an input reaches a new branch, and keeps that input as a seed to mutate
further. It discovers file formats and protocols by hill-climbing on coverage, without
being told the grammar.

The results at scale are large. Google's OSS-Fuzz, which continuously fuzzes open source
projects, states that as of May 2025 it "has helped identify and fix over 13,000
vulnerabilities and 50,000 bugs across 1,000 projects".

An empirical study of over 23,000 OSS-Fuzz bugs found six fault types account for more
than half of everything found: timeouts, out-of-memory errors, null dereferences, stack
overflows, memory leaks, and signal aborts. That list is the honest description of what
fuzzing is for. It finds robustness failures, not wrong answers.

## Mutation testing

Mutation testing tests the tests. The tool makes a small change to your source code, for
example turning `<` into `<=`, or deleting a line, then runs your suite. If no test fails,
that change is a **surviving mutant**: a real behavioural change your suite does not
notice.

The **mutation score** is the share of introduced mutants that at least one test kills.

This is the direct answer to the coverage trap in [03](03-software-design-techniques.md).
Line coverage asks whether a line ran. Mutation testing asks whether anything would have
noticed if the line were wrong. A suite with 95% line coverage and a 40% mutation score is
a suite that executes the code and checks almost nothing about it.

The technique dates to a 1978 paper by DeMillo, Lipton and Sayward, "Hints on Test Data
Selection". Its cost is the reason it took forty years to reach the mainstream: running
the whole suite once per mutant is expensive. Modern tools cut this by running only the
tests that cover the mutated line, and by testing a sample of mutants rather than all.

## Metamorphic testing

For programs where nobody knows the right answer, test the relationship between answers
instead of the answers themselves.

The classic case is a search engine. Nobody can say what the correct result set for a
query is. But you can say this: if you narrow a query by adding a term, the result set
must not grow. That is a **metamorphic relation**, and violating it is a definite bug even
though no individual result was ever labelled correct.

More examples:

| System | Metamorphic relation |
|---|---|
| Route planner | adding a waypoint must not shorten the route |
| Image classifier | rotating an image by 2 degrees must not change the predicted class |
| Tax calculator | increasing gross income must not decrease tax owed |
| Compiler | compiling at `-O0` and `-O2` must produce programs with the same output |
| Sorting service | sorting a shuffled copy must give the same result |

Metamorphic testing was introduced by Chen, Cheung and Yiu in a 1998 Hong Kong University
of Science and Technology technical report. It is the most useful technique available for
machine learning systems, where the oracle problem is at its worst, and it is badly
underused in ordinary business software, where "adding a discount must not increase the
total" is exactly the same kind of rule.

## Differential testing

Run two independent implementations on the same input and compare. Any disagreement is a
bug in at least one of them.

Real uses:

- Compilers: run the same program through GCC and Clang, compare output.
- Browsers and parsers: feed identical HTML or JSON to several implementations.
- Migrations: run the old system and the new system side by side on real traffic, compare
  results, and ship only when they agree. This pattern, sometimes called shadowing or
  dark launching, is the safest way to replace a system nobody fully understands.

The requirement is genuine independence. Two implementations sharing a library share its
bugs, and will agree while both being wrong.

## Snapshot, golden, and approval testing

Run the code, record the output, commit the recording. On later runs, compare against the
recording and fail on any difference.

```
Rendered output differs from snapshot:
- <button class="btn primary">Save</button>
+ <button class="btn primary" disabled>Save</button>
```

The oracle here is the previous version of the software, which has an important
consequence: a snapshot test cannot tell you the output is *correct*, only that it
*changed*. If the first recording was wrong, the test locks the bug in.

Where this earns its place:

- **Characterization testing** on legacy code. You need to change a 4,000-line function
  nobody understands. Record what it currently does across many inputs, then refactor
  until the recordings still match. The recordings are not a specification of what it
  should do; they are a fence around what it does do.
- Compiler and formatter output, rendered documents, API response shapes.

Its failure mode is well known: when a snapshot fails, the fastest fix is to re-record it.
Teams that press the update button reflexively have a suite that asserts nothing.

## Model-based testing

Write a model of what the system should do, usually a state machine, and let a tool
generate test sequences from the model, run them against the real system, and compare.

The generated sequences find the interleavings a human would not write, for example
"create, cancel, pay, cancel, refund" applied to an order. The cost is that you now
maintain a model as well as a system, and the model can drift.

This is the same idea as **stateful property testing**, where the tool generates random
sequences of operations against a system and a simple in-memory reference model, then
checks the two agree after every step.

## Symbolic execution and formal verification

These are not testing in the strict sense, because they do not run the program on specific
inputs. They belong here because they answer the question testing cannot.

- **Symbolic execution** runs the program with variables instead of values, building up
  the constraints along each path, then asks a solver for concrete inputs that reach each
  path. Concolic testing mixes this with real execution to stay tractable. Used to
  generate test inputs that reach hard-to-hit branches.
- **Formal verification** proves a property holds for all inputs, using a proof assistant
  or a model checker. Expensive, and applied where the cost of being wrong is extreme:
  processor designs, cryptographic protocols, aircraft control laws, the seL4 microkernel.

The relationship to testing is the one Dijkstra stated at the 1969 NATO conference:
"Program testing can be used to show the presence of bugs, but never to show their
absence." Proof is how you show absence. It is available for small, well-specified,
high-stakes components, and not for a web application.

## What to reach for

| Situation | Technique |
|---|---|
| A function with an algebraic rule (parse/serialise, sort, encode) | property-based |
| Code that handles untrusted input, parsers, decoders, anything in C or C++ | fuzzing |
| A suite you do not trust, or a coverage number you suspect | mutation testing |
| Machine learning output, search ranking, simulation, anything without a known answer | metamorphic |
| Replacing an existing system | differential, run in shadow |
| Legacy code you must change and do not understand | characterization via recorded output |
| Complex stateful protocol | model-based or stateful property testing |
| A component where failure is catastrophic | formal verification, on the core only |

## Sources

- Claessen, K. and Hughes, J. "QuickCheck: A Lightweight Tool for Random Testing of
  Haskell Programs", ICFP 2000.
  [paper](https://alastairreid.github.io/RelatedWork/papers/claessen:icfp:2000/)
- DeMillo, R., Lipton, R. and Sayward, F. "Hints on Test Data Selection: Help for the
  Practicing Programmer", *Computer* 11(4), April 1978, pp. 34-41.
- Chen, T.Y., Cheung, S.C. and Yiu, S.M. "Metamorphic testing: a new approach for
  generating next test cases", Technical Report HKUST-CS98-01, 1998.
- Segura et al. "A Survey on Metamorphic Testing", *IEEE TSE*, 2016.
- [OSS-Fuzz](https://github.com/google/oss-fuzz), figures as stated in the project README,
  May 2025.
- Ding, Z.Y. and Le Goues, C. ["An Empirical Study of OSS-Fuzz Bugs"](https://squareslab.github.io/materials/DingOSSFuzz21.pdf), MSR 2021.
- Dijkstra, E.W. Remarks at the NATO Software Engineering Techniques conference, Rome,
  October 1969, published April 1970; and "Notes on Structured Programming" (EWD249), 1970.
