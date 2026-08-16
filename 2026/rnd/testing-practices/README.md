# Testing: Every Kind, and What They Have in Common

Testing gets taught one domain at a time. Software engineers learn unit tests and never
hear about acceptance sampling. Quality engineers learn AQL tables and never hear about
mutation testing. Doctors, teachers, auditors and structural engineers each learn their
own vocabulary for the same handful of ideas.

This report covers software testing in depth, then covers testing everywhere else, then
maps the two onto each other.

## Read this first

**There is one kind of testing, run at wildly different costs.** Every test in every field
has the same six parts: a subject, a stimulus, an oracle that says what should have
happened, a threshold, a claim about what was covered, and a decision that follows. A
field's characteristic failure is whichever part it habitually leaves unstated. Software
leaves out the coverage claim, which is why "the tests pass" gets read as "the software
works".

## Contents

| If you want | Read |
|---|---|
| The short version and the eight findings | [00 Executive brief](00-executive-brief.md) |
| **The six-part frame the whole report rests on** | [01 The anatomy of a test](01-anatomy-of-a-test.md) |
| Unit, integration, contract, end-to-end, production | [02 Software testing by scope](02-software-scope-levels.md) |
| Choosing test cases by hand | [03 How to choose test cases](03-software-design-techniques.md) |
| Property-based, fuzzing, mutation, metamorphic, snapshot | [04 Machine-generated tests](04-software-generative-techniques.md) |
| Performance, security, accessibility, and the rest | [05 Testing what the software is like](05-software-non-functional.md) |
| TDD, test doubles, the shapes argument, CI gates, chaos | [06 Practices and workflows](06-software-practice-and-workflow.md) |
| Aviation, cars, medical devices, and testing AI | [07 When testing is regulated](07-safety-critical-and-standards.md) |
| Hypothesis tests, RCTs, p-values, the replication crisis | [08 Science and statistics](08-science-and-statistics.md) |
| Clinical trials, diagnostics, and the base rate problem | [09 Medicine and diagnostics](09-health-and-diagnostics.md) |
| NDT, sampling plans, HALT, commissioning, crash tests, food | [10 Materials and manufacturing](10-materials-and-manufacturing.md) |
| Exams, hiring, doping, forensics, fire drills, red teams | [11 People and organisations](11-people-and-organisations.md) |
| Fake doors, A/B tests, bank stress tests, backtesting | [12 Markets and money](12-markets-and-money.md) |
| **The translation table, and five things to steal** | [13 The translation table](13-cross-domain-map.md) |
| The twelve failure modes shared by every field | [14 How testing fails, everywhere](14-how-testing-fails.md) |
| Terms, including ones that differ across fields | [15 Glossary](15-glossary.md) |
| How this was built, and what it does not cover | [16 Methodology and sources](16-methodology-and-sources.md) |

## What is original here

**The six-part frame, and the claim built on it.** Sorting tests by domain hides what they
share. Sorting them by which part a field leaves unstated predicts how that field fails.
Set out in [01](01-anatomy-of-a-test.md), used throughout, and summarised in
[14](14-how-testing-fails.md).

**A cross-domain translation table.** Forty-odd software testing terms mapped to their
equivalents in materials, aviation, medicine, laboratories, finance and emergency planning.
Canary release is dose escalation. Mutation testing is proficiency testing. Staging is a
factory acceptance test. [13](13-cross-domain-map.md).

**Five concrete practices software should take from older testing disciplines**, with a
worked example of the first: a written sampling plan for a service, stating the accepted
escape rate, inspection intensity, flake budget, and a rule that relaxes inspection after a
clean run. [13](13-cross-domain-map.md).

**One recomputed calculation.** The diagnostic table in [09](09-health-and-diagnostics.md)
is worked from stated sensitivity, specificity and prevalence rather than quoted, so a
reader can check the arithmetic that produces a 7.9% positive predictive value from a good
test.

## Scope

**Covered:** software testing by scope, technique, generation method and quality attribute;
practice and workflow; regulated and safety-critical testing including testing of AI
systems; and testing in statistics, medicine, materials and manufacturing, psychometrics
and education, organisational security, and product and financial decision-making.

**Not covered:** tool comparisons and recommendations. Quantitative claims about which
practices produce better outcomes, because the evidence is weaker than its citation
frequency suggests. Test management tooling, staffing, and outsourcing.

Evidence boundary: public documentation, standards bodies' own descriptions, published
papers and regulator publications, read on 16 and 17 August 2026. No tools were installed
or exercised. Paywalled standards were not purchased; where a standard's contents are
described, the source is its publisher's public material or a technical summary that cites
it. Conflicting figures are listed in [16](16-methodology-and-sources.md).

## Related

The measurement problems in [14](14-how-testing-fails.md), applied to one narrow subject in
depth, are the companion report
[AI Benchmarking: A Working Reference](https://01kzseh0r0jaeg8n3cr0qx4kt2.reports.rj11.io).
