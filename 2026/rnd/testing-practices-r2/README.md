# Testing: Every Kind, and What They Have in Common

Testing gets taught one domain at a time. Software engineers learn unit tests and never
hear about acceptance sampling. Quality engineers learn AQL tables and never hear about
mutation testing. Doctors, teachers, auditors and structural engineers each learn their
own vocabulary for the same handful of ideas.

This report covers software testing in depth, then covers testing everywhere else, then
maps the two onto each other, then attacks its own argument.

## Read this first

**There is one kind of testing, run at wildly different costs.** Every test in every field
has the same six parts: a subject, a stimulus, an oracle that says what should have
happened, a threshold, a claim about what was covered, and a decision that follows. A
field's characteristic failure is whichever part it habitually leaves unstated. Software
leaves out the coverage claim, which is why "the tests pass" gets read as "the software
works".

That slogan is useful and overstated, and [17](17-limits-of-the-frame.md) says exactly how.

## Contents

| If you want | Read |
|---|---|
| The short version and the eleven findings | [00 Executive brief](00-executive-brief.md) |
| **The six-part frame the whole report rests on** | [01 The anatomy of a test](01-anatomy-of-a-test.md) |
| Unit, integration, contract, end-to-end, packaged artifact, production | [02 Software testing by scope](02-software-scope-levels.md) |
| Choosing test cases by hand | [03 How to choose test cases](03-software-design-techniques.md) |
| Property-based, fuzzing, mutation, metamorphic, snapshot | [04 Machine-generated tests](04-software-generative-techniques.md) |
| **Jepsen, deterministic simulation, model checking, clocks, upgrades** | [05 Concurrency, distributed state, and time](05-software-concurrency-and-state.md) |
| Performance, security, accessibility, and the rest | [06 Testing what the software is like](06-software-non-functional.md) |
| TDD, test doubles, the shapes argument, CI gates, chaos | [07 Practices and workflows](07-software-practice-and-workflow.md) |
| **FMEA, fault trees, and the economics of not testing** | [08 Choosing what to test](08-choosing-what-to-test.md) |
| Aviation, cars, medical devices, simulation rigs, testing AI | [09 When testing is regulated](09-safety-critical-and-standards.md) |
| Hypothesis tests, RCTs, p-values, the replication crisis | [10 Science and statistics](10-science-and-statistics.md) |
| Preclinical, clinical trials, diagnostics, the base rate problem | [11 Medicine and diagnostics](11-health-and-diagnostics.md) |
| NDT, sampling plans, gauge R&R, first article inspection, HALT, crash tests, food | [12 Materials and manufacturing](12-materials-and-manufacturing.md) |
| Exams, hiring, doping, forensics, fire drills, red teams | [13 People and organisations](13-people-and-organisations.md) |
| Fake doors, A/B tests, bank stress tests, risk-limiting audits | [14 Markets and money](14-markets-and-money.md) |
| **The translation table, and seven things to steal** | [15 The translation table](15-cross-domain-map.md) |
| The thirteen failure modes shared by every field | [16 How testing fails, everywhere](16-how-testing-fails.md) |
| **Where this report's own argument breaks** | [17 What this frame does not explain](17-limits-of-the-frame.md) |
| Terms, including ones that differ across fields | [18 Glossary](18-glossary.md) |
| How this was built, and what it does not cover | [19 Methodology and sources](19-methodology-and-sources.md) |

## What is original here

**The six-part frame, and the claim built on it.** Sorting tests by domain hides what they
share. Sorting them by which part a field leaves unstated predicts how that field fails. Set
out in [01](01-anatomy-of-a-test.md), used throughout, summarised in
[16](16-how-testing-fails.md), and attacked in [17](17-limits-of-the-frame.md).

**A cross-domain translation table.** Software testing terms mapped to their equivalents in
materials, aviation, medicine, laboratories, finance, elections and emergency planning.
Canary release is dose escalation. Mutation testing is proficiency testing. A packaged-artifact
test is first article inspection. A flaky test rate is a gauge R&R failure.
[15](15-cross-domain-map.md).

**Seven concrete practices software should take from older testing disciplines**, with a
worked example of the first: a written sampling plan for a service, stating the accepted
escape rate, inspection intensity, flake budget, and a rule that relaxes inspection after a
clean run. [15](15-cross-domain-map.md).

**A red team on the report itself.** [17](17-limits-of-the-frame.md) states which of the
report's claims are unfalsifiable, where the six parts genuinely do not fit, which
translation-table pairings flatten differences that matter ethically, where the headline
recommendation lacks the statistical model that makes its manufacturing original work, and
what experiment would falsify each proposal.

**One recomputed calculation.** The diagnostic table in [11](11-health-and-diagnostics.md)
is worked from stated sensitivity, specificity and prevalence rather than quoted, so a
reader can check the arithmetic that produces a 7.9% positive predictive value from a good
test. The generator recomputes it on every build and fails if the prose disagrees.

## Scope

**Covered:** software testing by scope, technique, generation method, concurrency, and
quality attribute; how to choose what to test; practice and workflow; regulated and
safety-critical testing including simulation rigs and testing of AI systems; and testing in
statistics, medicine, materials and manufacturing, psychometrics and education,
organisational security, elections, and product and financial decision-making.

**Not covered:** tool comparisons and recommendations. Quantitative claims about which
practices produce better outcomes, because the evidence is weaker than its citation
frequency suggests. Test management tooling, staffing, and outsourcing. Games testing,
translation quality assessment, and environmental monitoring, which are named and skipped.

Evidence boundary: public documentation, standards bodies' own descriptions, published
papers and regulator publications, read on 16 and 17 August 2026. No tools were installed
or exercised. Paywalled standards were not purchased; where a standard's contents are
described, the source is its publisher's public material or a technical summary that cites
it. Conflicting figures are listed in [19](19-methodology-and-sources.md).

## Revision

This is revision 2. Revision 1 is
[published here](https://01m06ep190kam9w5e8d681wayy.reports.rj11.io). What changed, and why,
is in [19](19-methodology-and-sources.md).

## Related

The measurement problems in [16](16-how-testing-fails.md), applied to one narrow subject in
depth, are the companion report
[AI Benchmarking: A Working Reference](https://01kzseh0r0jaeg8n3cr0qx4kt2.reports.rj11.io).
