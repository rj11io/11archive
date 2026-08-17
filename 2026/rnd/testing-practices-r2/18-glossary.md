# Glossary

Terms used across this report, including the ones that mean different things in different
fields. Where a term has a field-specific meaning, the field is named.

## The frame

**Coverage claim.** What a test result covers, and what it does not. Used in this report as
one of the six parts of any test. Rarely written down in software; standard practice in
laboratory reporting.

**Oracle.** Whatever tells you the observed result was correct. An expected value, a
reference standard, a second implementation, a control group, or a human expert.

**Oracle problem.** The difficulty of getting an oracle for programs whose correct output
nobody can compute independently. Named by Weyuker in 1982.

**Subject, stimulus, threshold, decision.** The other four parts of a test, per
[01](01-anatomy-of-a-test.md).

## Errors and accuracy

**False positive.** The test says yes and the truth is no. Called producer's risk in
sampling, Type I error in statistics, a flaky failure in software.

**False negative.** The test says no and the truth is yes. Called consumer's risk in
sampling, Type II error in statistics, an escaped defect in software.

**Sensitivity.** Of the cases that are truly positive, the share the test catches.

**Specificity.** Of the cases that are truly negative, the share the test correctly clears.

**Positive predictive value (PPV).** Given a positive result, the probability the subject
really is positive. Depends on how common the condition is.

**Base rate fallacy.** Reading a positive result without accounting for how rare the thing
is. Causes most positives to be false when the thing is rare.

**Power.** The probability a study detects a real effect of a given size. One minus the
false negative rate.

**Accuracy versus precision.** Accuracy is closeness to the true value. Precision is
consistency between repeated measurements. A test can be precise and wrong.

**Measurement uncertainty.** The range within which the true value is expected to lie.
Required in accredited laboratory reporting.

## Software levels and kinds

**Unit test.** One small piece, isolated, dependencies replaced.

**Integration test.** Two or more real parts running together.

**Contract test.** A recorded agreement between a service and its caller, verified by each
side separately without running both together.

**End-to-end test.** The whole system, driven through its real interface.

**Smoke test.** Overloaded across three senses, distinguished in
[02](02-software-scope-levels.md). (1) A very small set of checks answering whether a build is
worth testing further. ISTQB treats build verification test, build acceptance test and
confidence test as synonyms of this sense. (2) A check that the published artifact works
when installed clean. (3) In product research, a fake-door demand test.

**Sanity test.** A quick, narrow check that one specific change behaves as intended. Smoke is
wide and shallow across the build; sanity is narrow and deep on one change.

**Packaged-artifact test.** Installing the published artifact into a clean environment as a
stranger would, then exercising one critical path. Catches packaging failures that no
source-tree test can see: missing files, wrong entry points, development dependencies
imported at runtime, build steps that strip something semantic.

**Race detector.** A tool that instruments memory access and reports unsynchronised access
between threads, whether or not the run misbehaved. Finds the defect rather than the symptom.

**Linearizability.** A consistency model under which every operation appears to take effect
instantaneously at some point between its start and its end. Used as an oracle: rather than
asserting on individual reads, check whether any single ordering explains the whole recorded
history.

**Deterministic simulation testing (DST).** Running an entire distributed system on one
thread with every source of non-determinism controlled from a single seed, so faults can be
injected, years of operation simulated in minutes, and any failure replayed exactly.

**Model checking.** Exhaustively exploring the reachable states of a formal specification to
find one that violates a stated property. Tests a design before an implementation exists.

**Expand and contract migration.** Changing a schema in stages that are each compatible with
both the old and new code: add, dual-write, backfill, switch reads, remove later.

**Test impact analysis.** Running only the tests a given change could affect, using a
dependency map. The software analogue of adaptive inspection intensity.

**Regression test.** Any test re-run to check a change did not break working behaviour.

**Confirmation test.** Re-running the specific test that exposed a defect, after the fix.

**Hermetic test.** A test that depends on nothing outside its own declared inputs.

**Flaky test.** A test that passes and fails on unchanged code.

## Techniques

**Equivalence partitioning.** Group inputs that should be handled identically, test one of
each.

**Boundary value analysis.** Test the values either side of every limit.

**Pairwise testing.** Choose test cases so that every pair of setting values appears at
least once.

**MC/DC, modified condition/decision coverage.** Each condition in a decision is shown by
execution to independently change the outcome. Required for DO-178C Level A software.

**Property-based testing.** State a rule the output must always obey; a tool generates
inputs looking for a violation, then shrinks any failure to its simplest form.

**Metamorphic testing.** Test the relationship between multiple runs rather than the value
of any one, for programs with no known correct answer.

**Mutation testing.** Introduce small changes to the code and measure how many your test
suite catches. The mutation score is the share killed.

**Fuzzing.** Feed malformed or generated input and watch for crashes. Coverage-guided
fuzzing keeps inputs that reach new code and mutates them further.

**Differential testing.** Run two independent implementations on the same input and compare.

**Snapshot, golden, or approval testing.** Compare output against a committed recording of
previous output.

**Characterization testing.** Snapshot testing used to fence in the behaviour of legacy
code before changing it.

**Exploratory testing.** Simultaneous learning, test design and execution, guided by a
charter rather than a script.

**Test double.** Any stand-in for a real dependency. Dummy, stub, spy, mock, or fake.

## Practices

**TDD, BDD, ATDD.** Writing the test, the behaviour description, or the acceptance
criteria before the code.

**Shift left.** Move testing earlier in development.

**Shift right.** Test in production, using canaries, flags, dark launching and monitoring.

**Canary release.** Send a small share of traffic to the new version and compare.

**Dark launching.** Run new code on real traffic without using its results.

**Chaos engineering.** Deliberately injecting failure into a production system to test a
hypothesis about its steady state, with the blast radius bounded.

**Blast radius.** How much harm an experiment can cause. Bounded deliberately in chaos
engineering, dose escalation, and pilot programmes alike.

## Verification, validation, and quality

**Verification.** Did we build the thing right, against its specification.

**Validation.** Did we build the right thing, against the actual need. In food safety,
specifically: evidence that the control measures are scientifically capable of controlling
the hazard.

**IV&V, independent verification and validation.** Verification performed by people
independent of the developers.

**Conformance test suite.** A test suite owned by the body that owns a specification, run by
every implementer, so that interoperability becomes a testing problem rather than a
try-everything problem. Test262 for ECMAScript is the canonical example.

**Formative assessment.** A test whose purpose is to change what happens next.

**Summative assessment.** A test whose purpose is to certify a result.

**Reliability (psychometrics).** The test gives a consistent answer. Distinct from
reliability in engineering, which means the system keeps working.

**Validity (psychometrics).** The test measures the thing it claims to measure.

## Sampling and quality control

**Acceptance sampling.** Deciding whether to accept a batch by inspecting a sample.

**Operating characteristic (OC) curve.** For a given sampling plan, the probability of
accepting a lot plotted against the lot's true defect rate. Shows both risks at once, and
shows that no sample size produces a sharp accept or reject line.

**Sequential probability ratio test (SPRT).** Wald, 1945. Inspect one item at a time and stop
as soon as a running likelihood ratio crosses an accept or reject boundary. Designed to be
monitored continuously, which is why it is the correct answer to peeking at an A/B test.

**FMEA, failure mode and effects analysis.** Working through a system part by part, scoring
each failure mode on severity, occurrence, and detection, where detection rates how likely
your own process is to catch it before a customer does.

**RPN, risk priority number.** Severity times occurrence times detection. Known to be
defective, because multiplying ordinal ratings gives equal scores to very unequal risks. The
2019 AIAG-VDA handbook replaced it with **action priority**, a lookup weighting severity
first.

**FTA, fault tree analysis.** Starting from an unacceptable outcome and working backwards
through the combinations of events that could cause it. Top-down, where FMEA is bottom-up.

**HAZOP.** A guided walkthrough applying prompt words (none, more, less, reverse, other than)
to each flow in a process, to generate failure scenarios.

**Gauge R&R, %GRR.** The share of observed variation that comes from the measurement system
rather than from the thing measured, split into repeatability (same operator, same part) and
reproducibility (different operators). AIAG bands: under 10% acceptable, 10% to 30%
conditional, over 30% unacceptable. A flaky test rate is the same quantity.

**Measurement system analysis (MSA).** The broader practice of testing the instrument and the
operator before trusting any measurement they produce.

**First article inspection (FAI).** Complete, independent, documented inspection of an item
from the first production run against every drawing characteristic, to verify the process,
documentation and tooling can produce conforming parts. Standardised as AS9102 in aerospace.

**IQ, OQ, PQ.** Installation qualification (is it installed correctly), operational
qualification (does it operate across its range including limits and failure modes),
performance qualification (does it produce acceptable results consistently under real
conditions). Asked in that order, each gated on the one before.

**AQL, acceptance quality limit.** The defect rate that will routinely be accepted.

**Producer's risk / consumer's risk.** The probability of rejecting a good lot / accepting
a bad one.

**Statistical process control (SPC).** Plotting a process measurement over time against
limits derived from its own variation, to separate normal noise from a real shift.

**Materiality.** In auditing, the threshold below which an error is deemed not to change
the conclusion.

## Physical and reliability testing

**Destructive / non-destructive testing.** Whether the test damages the item.

**NDT methods.** Visual (VT), liquid penetrant (PT), magnetic particle (MT), eddy current
(ET), ultrasonic (UT), radiographic (RT). The first three are surface methods; the last two
are volumetric.

**X-in-the-loop (XIL).** A ladder of test rigs where progressively more of the system is
real: model-in-the-loop (all simulated), software-in-the-loop (real code, simulated world),
processor-in-the-loop (real chip), hardware-in-the-loop (real control unit and real electrical
signals), vehicle-in-the-loop (the whole machine).

**Preclinical.** Testing before any human is dosed. **In vitro** means in glassware, on cells
and tissues. **In vivo** means in living animals. Roughly 10% of candidates get past it.

**Human factors validation.** Watching real intended users operate a device under simulated
real conditions and recording use errors. FDA guidance calls for at least 15 participants
from each distinct user group.

**HALT.** Highly accelerated life testing. Stress a design past failure to learn how it
fails. No survivors, by design.

**HASS.** Highly accelerated stress screening. Apply HALT-derived stresses to production
units to catch manufacturing defects.

**ESS, burn-in.** Milder screening of every unit to remove early-life failures.

**FAT / SAT.** Factory acceptance test at the manufacturer, site acceptance test at the
final installation.

**Hydrostatic test.** Pressurise with water above working pressure and watch for leaks.
Water is used because it barely compresses, so a failure releases far less energy.

**Proof load / proof pressure.** Testing at a defined multiple of the rated load, commonly
1.5 times, to show margin.

**Metrological traceability.** An unbroken documented chain of calibrations linking a
measurement to a national or international standard.

**Proficiency testing.** An external scheme sends a laboratory samples of unknown value and
compares its answers against other laboratories.

## Experiments and markets

**RCT, randomised controlled trial.** Random assignment to treatment or control, ideally
blinded.

**A/B test.** An RCT run on live traffic.

**Multi-armed bandit.** An experiment that shifts traffic toward the better-performing arm
while running.

**Holdout group.** Users permanently kept on the old experience, to measure the cumulative
effect of many changes.

**Fake door test.** Offering something that does not exist yet, to measure real intent.

**Wizard of Oz test.** A real interface with humans doing the work behind it.

**Backtesting.** Running a strategy or model against historical data.

**Stress testing (finance).** Projecting an institution's position through a severe
hypothetical scenario defined by a regulator.

**Risk-limiting audit (RLA).** An audit procedure guaranteed that, if the reported outcome is
wrong, it has at most a pre-specified chance of failing to catch it. The sample size is not
fixed; counting continues until the evidence is strong enough, or until everything has been
counted.

**Risk limit.** The stated maximum chance an RLA will fail to correct a wrong outcome. Chosen
before the audit begins, not discovered afterwards.

**Preregistration.** Publishing the hypothesis, sample size and analysis plan before
collecting data.

**P-hacking.** Analysing many ways and reporting the one that crosses the significance
threshold.

**HARKing.** Hypothesising after the results are known, then presenting it as a prediction.

## Laws and effects

**Campbell's law.** The more a quantitative social indicator is used for decision-making,
the more it will be corrupted and the more it will distort the process it monitors.

**Goodhart's law.** When a measure becomes a target, it ceases to be a good measure.

**Coupling effect.** The conjecture behind mutation testing: tests that catch simple faults
also tend to catch complex ones.

**Daubert factors.** The five considerations a US federal judge weighs when deciding
whether scientific evidence is admissible, including the known error rate of the method.
