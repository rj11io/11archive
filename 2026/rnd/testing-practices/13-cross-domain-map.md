# The translation table

Most testing ideas were invented several times, in fields that do not read each other's
journals. This section maps the vocabulary across, then names what is actually worth
moving between fields.

## Same idea, different words

| Software term | Equivalent elsewhere | Field |
|---|---|---|
| Unit test | coupon test on a material sample | materials |
| Integration test | subsystem test rig | aerospace |
| End-to-end test | full-scale exercise; road test | emergency planning; automotive |
| Smoke test | power-on self-test; pre-flight check | electronics; aviation |
| Regression test | control chart; recurring proficiency test | manufacturing; laboratories |
| Staging environment | factory acceptance test (FAT) | industrial commissioning |
| Production validation | site acceptance test (SAT) | industrial commissioning |
| Canary release | dose escalation cohort; pilot programme | clinical trials; policy |
| A/B test | randomised controlled trial | medicine, economics |
| Feature flag | reversible pilot | policy |
| Chaos engineering | fire drill; HALT; disaster recovery exercise | safety; reliability |
| Load test | proof load test | structural engineering |
| Stress test to failure | HALT, highly accelerated life testing | reliability |
| Soak test | shelf-life or endurance test | food; mechanical |
| Snapshot test | control sample compared to a retained reference | laboratories |
| Differential testing | dual-entry bookkeeping; double data entry | accounting; clinical research |
| Mutation testing | proficiency testing with blind spiked samples | laboratories |
| Fuzzing | environmental stress screening | electronics |
| Static analysis | non-destructive testing | materials |
| Code review | peer review | science |
| Pair programming | four-eyes principle | finance, aviation |
| Test coverage | inspection coverage, sampling fraction | manufacturing |
| Flaky test | measurement repeatability failure | metrology |
| Test oracle | reference standard; control group | metrology; experimental science |
| Assertion | specification limit | manufacturing |
| Test double, mock | simulator; phantom (in imaging) | training; medical physics |
| Escaped defect | field failure; consumer's risk | reliability; sampling |
| False alarm in CI | producer's risk | sampling |
| Acceptance criteria | acceptance quality limit (AQL) | sampling |
| Definition of done | conformity assessment | standards |
| Verification | verification | identical meaning, universally |
| Validation | validation | identical meaning, universally |
| Independent QA | independent verification and validation; external audit | aviation; finance |
| Bug bounty | proficiency scheme; adversarial review | laboratories; security |
| Post-incident review | root cause analysis; corrective and preventive action (CAPA) | quality management |

The row that matters most is the last-but-one block. **Verification and validation mean
exactly the same thing in every field**, and software is the only one that routinely blurs
them.

## Five things software should take

These are ranked by how much they would change, per unit of effort to adopt.

### 1. Write the sampling plan down

Manufacturing states, before inspection starts: how much will be inspected, what defect
rate is accepted, what result rejects the batch, and who carries each risk. See
[10](10-materials-and-manufacturing.md).

Software teams have all of these implicitly and none explicitly. The written version would
be short:

```
Component: payments service
Risk class: high (money movement, regulated)
Accepted escape rate: no P1 defects reaching production per quarter
Inspection intensity: mutation score >= 70% on the core, contract tests on every
  consumer, load test to 3x peak before each release
Producer's risk accepted: pipeline may reject good builds up to 2% of the time
  (flake budget)
Switching rule: after two consecutive quarters with no P1 escapes, drop the
  pre-release full E2E run to weekly
```

Nothing in that is technically hard. What it does is turn arguments about "are we testing
enough" into arguments about numbers, which end.

### 2. Set inspection intensity by consequence, not uniformly

Every safety standard grades rigour by harm: ASIL A to D, IEC 62304 Class A to C, DO-178C
Level E to A. See [07](07-safety-critical-and-standards.md).

Most software teams apply roughly the same testing effort everywhere, then feel guilty
about the parts with less. The better move is to classify explicitly. A three-level scheme
is enough: could this cost money or safety, could it damage trust, or is it cosmetic. Then
put mutation testing, contract tests, and independent review on the first tier, and accept
much lighter coverage on the third without apology.

### 3. Test the tests, on a schedule

Laboratories under ISO/IEC 17025 participate in proficiency testing: an external body
sends samples with known values, the lab reports its results blind, and its performance is
compared against other labs. See [09](09-health-and-diagnostics.md).

The software version already exists and is used as a one-off audit rather than a control:
mutation testing. Run periodically on the critical modules, with a tracked score, it
answers the question a green build cannot: would this suite notice if the code were wrong?

A cheaper variant costs nothing: during incident review, ask why no test caught it, and
whether a test could have. Track the answer over time. That is outcomes analysis, in the
sense SR 11-7 uses in [12](12-markets-and-money.md).

### 4. Make coverage claims explicit, including the negative

Every field that takes testing seriously states what a result does *not* cover. An NDT
report says which method was used, so a reader knows surface flaws were checked and
internal ones were not. A penetration test report should say the same and often does. A
green build says nothing at all.

The lightweight version: a short "what this suite does not cover" note per service, kept
next to the tests. Concurrency under real load. Behaviour when the third-party payment
provider returns a 500. Data volumes above ten million rows. Anything in the admin
interface. Writing that list takes an hour and it is the most honest artefact most teams
could produce.

### 5. Separate the author from the verifier where the stakes justify it

DO-178C requires independence at high levels. SR 11-7 requires model validation by people
independent of the developers. Science requires peer review. Finance requires external
audit.

Software has code review, which is genuinely this control, and it degrades in a specific
way: the reviewer reads the diff, not the requirement. The stronger version is to have
someone other than the author write the acceptance criteria, or at least confirm them
against what was actually asked for. That is the difference between verification and
validation, staffed.

## Three things software has that other fields lack

The traffic is not one-way.

**Continuous, automated, cheap re-testing.** A software team can re-run 40,000 checks on
every change, in minutes, at nearly zero marginal cost. No physical field can do this. A
bridge is proof-loaded once. The consequence is that software can afford a regression
culture that other engineering disciplines can only dream about, and mostly wastes it by
not maintaining the suite.

**Version-controlled, executable specifications.** A test suite is a specification that
cannot silently drift out of date with the artefact, because it runs against it. Written
procedures in every other field drift, which is why audits exist.

**Testing at full population rather than by sample.** Manufacturing tests 200 units out of
50,000 because testing all of them is prohibitive. Software can run its checks against
every code path it has tests for, every time. Where software does sample, in load testing
and in production monitoring, it usually does so without the sampling theory that other
fields developed, which is the gap point 1 above addresses.

## The one thing everyone gets wrong

Across every field surveyed here, the same error recurs, and it is not a technical one.

**A test result is treated as a statement about the system, when it is a statement about a
sample.**

- "The tests pass" becomes "the software works".
- "Negative mammogram" becomes "no cancer".
- "Passed the pentest" becomes "secure".
- "The batch was accepted" becomes "there are no defects".
- "Five stars" becomes "safe in any crash".
- "p < 0.05" becomes "true".
- "Scored 94%" becomes "understands the subject".

Every one of these drops the coverage claim. It is the same mistake each time, and the
correction is the same each time: ask what the test sampled, and what it did not.

## Sources

Cross-references only; every claim in this section is sourced in the section it points to.
The synthesis, the translation table, and the five proposals are original to this report.
