# When testing is regulated

Most software teams choose their own testing standard. In aircraft, cars, medical devices,
railways, and nuclear plants, someone else chooses it, and an auditor checks.

This section matters even to people who will never build a pacemaker, because regulated
testing is where the six parts from [01](01-anatomy-of-a-test.md) are all written down.
It is the closest software gets to the discipline of a calibration lab.

## The organising idea: rigour scales with harm

Every safety standard works the same way. Classify how bad it would be if this component
failed, then let that class dictate how much evidence you must produce.

| Standard | Domain | Levels, least to most severe |
|---|---|---|
| DO-178C / ED-12C | Airborne software | Level E, D, C, B, A |
| ISO 26262 | Road vehicles | ASIL A, B, C, D (plus QM, meaning no safety requirement) |
| IEC 62304 | Medical device software | Class A, B, C |
| IEC 61508 | Industrial functional safety, the parent standard | SIL 1 to SIL 4 |
| EN 50128 | Railway control software | SIL 0 to SIL 4 |

Concretely, in a car under ISO 26262: rear lights are ASIL A, headlights and brake lights
ASIL B, cruise control ASIL C, and airbags, anti-lock braking and power steering are
ASIL D, the highest.

In a medical device under IEC 62304: Class A means no injury is possible, Class B means
injury is possible but not serious, Class C means death or serious injury is possible.
Class C software carries the heaviest testing and documentation burden.

The mechanism is worth stealing even without a regulator. Most teams test every part of
the system with roughly the same effort. Almost no system deserves that. Ask what the
worst realistic outcome of each component failing is, and spend accordingly.

## What the highest level actually demands

DO-178C Level A, where failure is catastrophic, is the most demanding widely used
software testing regime. It requires, among much else:

- Every requirement traced to the code that implements it and the test that verifies it,
  in both directions.
- Test cases derived from requirements, not from the code.
- **Modified condition/decision coverage** of the code structure, described in
  [03](03-software-design-techniques.md). Table A-7 of the standard sets this out.
- Evidence that any code not covered by requirements-based testing is either dead code,
  which must be removed, or deactivated code, which must be justified.
- Independence between the person who wrote the code and the person who verifies it, for
  the highest levels.

That last point has a name outside aviation: **independent verification and validation**,
often shortened to IV&V. The principle is that the author is the worst possible reviewer
of their own work, and it recurs everywhere testing is serious. Peer review in science,
external audit in finance, and a reviewer who is not the owner in an engineering issue
tracker are the same control.

## Verification and validation are not the same thing

This distinction is formal in every regulated field and casually blurred everywhere else.
It is worth getting right, because the two failures are different.

- **Verification**: did we build the thing right? Does it meet its specification?
- **Validation**: did we build the right thing? Does it meet the actual need?

A payment form that correctly rejects the card format it was specified to reject is
verified. If the specification named the wrong format, it is not validated. Verification
is answered by tests; validation is answered by users, and by the acceptance testing in
[02](02-software-scope-levels.md).

Food safety uses the identical pair, and states it more sharply than software does. Under
HACCP, **validation** is obtaining evidence that the control measures are scientifically
capable of controlling the hazard, done once, before implementation and after any major
change. **Verification** is the ongoing checking that the plan is being followed. See
[12](12-materials-and-manufacturing.md).

## The V-model

The V-model is the picture that regulated development is organised around. The left arm
descends through levels of specification; the right arm ascends through matching levels of
testing; each test level verifies the specification level opposite it.

```
User requirements ─────────────────────► Acceptance testing
  System requirements ─────────────────► System testing
    Architecture ──────────────────────► Integration testing
      Detailed design ─────────────────► Unit testing
                    Code
```

Its reputation among agile teams is poor, and the criticism of it as a delivery process is
fair: it front-loads a full specification. But as a picture of *what verifies what* it is
correct, and it survives inside iterative processes. Every level of decomposition needs a
matching level of check, whether you write them a year apart or an hour apart.

## Testing against a simulated world

Safety-critical software controls physical things, and you cannot crash a real car ten
thousand times. The answer is a ladder of increasingly real test rigs, known collectively as
**X-in-the-loop**, where the X is whatever part is real.

| Rig | What is real | What is simulated | Answers |
|---|---|---|---|
| Model-in-the-loop (MIL) | nothing; both controller and plant are models | everything | is the control logic right in principle |
| Software-in-the-loop (SIL) | the actual application code | the hardware and the physical world | does the real software behave, fast enough to run in CI |
| Processor-in-the-loop (PIL) | the code, on the target processor | the rest | does it behave on the real chip, with its timing and precision |
| Hardware-in-the-loop (HIL) | the physical control unit and selected components | the vehicle and environment, in real time | does the real hardware behave with real electrical signals |
| Vehicle-in-the-loop | the whole vehicle | the traffic and scenario around it | does it behave as a system |

Two things transfer.

**The ladder is a cost and realism trade, made explicit.** MIL and SIL are cheap, fast, and
run on every commit. HIL rigs are expensive, few, and booked. The decision about which
question to answer at which level is written down, because the rigs cost real money. In
software the same trade exists and is usually implicit, which is why the end-to-end suite
grows until nobody trusts it.

**SIL is the pattern most software teams already half-use and rarely name.** Running the
real application against a simulated world is what a good integration test does. Naming it
as a rig, with a defined fidelity and a defined set of questions it can answer, is more
useful than calling everything an integration test. The deterministic simulation testing in
[05](05-software-concurrency-and-state.md) is SIL taken to its conclusion.

## The general software testing standards

Outside safety-critical work, two bodies define the shared vocabulary.

**ISO/IEC/IEEE 29119** is the international software testing standard series. Eight parts
are published:

| Part | Subject |
|---|---|
| 1 | Concepts and definitions |
| 2 | Test processes |
| 3 | Test documentation |
| 4 | Test techniques |
| 5 | Keyword-driven testing |
| 6 | Guidelines for use in agile projects |
| 11 | Testing of AI-based systems |
| 13 | Testing of biometric systems |

Part 11 is the notable recent addition, and reflects that testing systems whose behaviour
is learned rather than written needs its own treatment. Parts 1 and 11 are freely
available from ISO.

29119 has real critics. A campaign in the context-driven testing community argued that a
standardised, document-heavy process misrepresents testing as a mechanical activity and
would be used by procurement and courts as a definition of due care. That criticism is
worth knowing when someone cites the standard as settled.

**ISTQB** provides the certification syllabi that supply most of the shared vocabulary in
commercial testing, including the black-box, white-box, and experience-based split used in
[03](03-software-design-techniques.md).

There are also coding standards whose purpose is to make testing possible at all. **MISRA
C** restricts the C language to a subset with defined behaviour, on the reasoning that you
cannot meaningfully verify code that relies on constructs the compiler is free to
interpret differently.

## Conformance suites: when the specification ships its own tests

A different model of shared testing is worth knowing, because it solves a problem no
individual team can solve alone: **does everyone's implementation agree?**

A **conformance test suite** is written once, by the body that owns the specification, and
run by every implementer. Test262 is the canonical example: the official ECMAScript
conformance suite, developed by Ecma's TC39, consisting of over 50,000 test files as of May
2025, covering the majority of the algorithms and grammar productions in the standard. Every
JavaScript engine, parser and runtime runs it.

The properties that make this work are unusual and worth naming:

- **The tests are owned by the specification, not by any implementation.** Nobody's home
  advantage.
- **Passing is a public, comparable number**, so conformance becomes a competitive claim.
- **Contributing a test is how you report an ambiguity.** When two engines disagree, the
  argument gets settled in the suite.
- **It converts an interoperability problem into a testing problem.** Without it, "does my
  code work in every browser" is answered by trying every browser forever.

The same structure appears wherever many parties must interoperate: protocol interop events,
conformance suites for web standards, and certification test suites for hardware interfaces.

If you own an interface that several teams implement, this is the pattern to copy. Write the
suite once, next to the specification, and make everyone run it. It is the multi-party
generalisation of the [contract testing](02-software-scope-levels.md) idea.

## Testing machine-learning systems

This is where the regulated world and the ordinary world are converging fastest, and it is
the clearest current example of the oracle problem from [01](01-anatomy-of-a-test.md).

The difficulty is structural. A traditional program's behaviour is written down, so a test
can compare against it. A learned model's behaviour is a consequence of data, so there is
often no independent statement of what the right output is.

What the practice looks like now:

| Method | What it does | Limit |
|---|---|---|
| Held-out benchmark evaluation | score the model on data it did not train on | benchmark contamination, where the test data leaked into training; scores that do not transfer to real use |
| Metamorphic testing | check relations rather than values, as in [04](04-software-generative-techniques.md) | you must invent the relations |
| Data validation | test the inputs: schema, ranges, distribution drift | catches data problems, not model problems |
| Behavioural testing | curated cases for known failure classes, for example negation, names, dialects | only covers what you thought of |
| Red teaming | people deliberately probe for harmful or disallowed outputs | coverage is unmeasured |
| Slice-based evaluation | report accuracy per subgroup, not just overall | requires you to know which slices matter |
| Shadow deployment | run the model on real traffic without acting on it | needs an outcome to compare against |

The US framework language for this is **TEVV**, testing, evaluation, verification and
validation. The NIST AI Risk Management Framework's Measure function calls for a mix of
these, explicitly including red teaming alongside benchmarks, and NIST's own finding is
that relying entirely on existing tooling gives a false sense of assurance.

That conclusion is the base rate problem in another costume. A benchmark score is a
coverage claim. Without knowing what the benchmark covers, and what share of real inputs
resemble it, the number does not support the conclusion people draw from it.

## Sources

- [ISO 26262 and ASILs](https://ldra.com/iso-26262/);
  [Automotive Safety Integrity Level](https://en.wikipedia.org/wiki/Automotive_Safety_Integrity_Level)
- [IEC 62304 safety classifications](https://www.greenlight.guru/glossary/iec-62304)
- [DO-178C structural coverage and MC/DC](https://ldra.com/capabilities/mc-dc/)
- [ISO/IEC/IEEE 29119 series](https://softwaretestingstandard.org/)
- [FDA HACCP principles and application guidelines](https://www.fda.gov/food/hazard-analysis-critical-control-point-haccp/haccp-principles-application-guidelines)
- [CISA: AI red teaming, applying software TEVV for AI evaluations](https://www.cisa.gov/news-events/news/ai-red-teaming-applying-software-tevv-ai-evaluations)
- [What is hardware-in-the-loop testing](https://www.ni.com/en/solutions/transportation/hardware-in-the-loop/what-is-hardware-in-the-loop-.html);
  [what is software-in-the-loop](https://www.opal-rt.com/blog/what-is-software-in-the-loop/)
- [tc39/test262, the official ECMAScript conformance test suite](https://github.com/tc39/test262)
