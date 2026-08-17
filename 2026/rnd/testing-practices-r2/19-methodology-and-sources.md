# Methodology and sources

## What this report is

A survey of testing as a general practice, written in two halves. The first half covers
software testing in depth. The second half covers testing in fields that do not write
code, and the closing sections map the two onto each other and then attack the map.

The organising claim, developed in [01](01-anatomy-of-a-test.md) and applied throughout, is
that every test in every field has the same six parts, and that a field's characteristic
failure is whichever part it habitually leaves unstated. That claim is stated so it can be
attacked, and attacked, in [17](17-limits-of-the-frame.md).

## What changed in revision 2

Revision 1 is [published here](https://01m06ep190kam9w5e8d681wayy.reports.rj11.io) and is
unchanged. This revision added three sections and corrected one error.

**Added, from a gap audit run against revision 1:**

| Gap | Where it is now |
|---|---|
| Testing the published artifact rather than the source tree | new subsection in [02](02-software-scope-levels.md) |
| Sanity testing, absent entirely from revision 1 | [02](02-software-scope-levels.md) |
| Concurrency, distributed state, clocks, and rolling upgrades | new section [05](05-software-concurrency-and-state.md) |
| How to decide what deserves a test, and what does not | new section [08](08-choosing-what-to-test.md) |
| Simulation rigs (model, software, processor, hardware in the loop) | [09](09-safety-critical-and-standards.md) |
| Conformance test suites as a multi-party pattern | [09](09-safety-critical-and-standards.md) |
| Preclinical testing, which revision 1 skipped by starting at Phase 1 | [11](11-health-and-diagnostics.md) |
| Human factors validation and its stated minimum sample | [11](11-health-and-diagnostics.md) |
| First article inspection, and IQ/OQ/PQ | [12](12-materials-and-manufacturing.md) |
| Gauge R&R, the measurement-system framing of flaky tests | [12](12-materials-and-manufacturing.md) |
| Operating characteristic curves and sequential sampling | [12](12-materials-and-manufacturing.md) |
| Risk-limiting audits | [14](14-markets-and-money.md) |
| Unreproducible failures as a shared failure mode | [16](16-how-testing-fails.md) |
| A red team on the report's own claims | new section [17](17-limits-of-the-frame.md) |

**Corrected:** revision 1 listed a smoke test and a build verification test as two separate
activities at two different points in the pipeline. ISTQB treats build verification test,
build acceptance test and confidence test as synonyms for smoke test. Fixed in
[02](02-software-scope-levels.md), which now also separates the three distinct things called
a smoke test.

**Softened:** revision 1 claimed software is the only serious testing discipline with no
sampling plan. Regulated software does have verification plans, and the risk-based testing
literature exists. The narrower claim, that mainstream commercial practice rarely states a
quantitative acceptance criterion and almost never states the two error risks separately, is
what the evidence supports. See [17](17-limits-of-the-frame.md).

**Still missing, and known to be:** games testing, translation quality assessment,
environmental and agricultural monitoring, sports officiating, and military operational test
and evaluation. Each is named here so a reader does not mistake absence for irrelevance.

## How it was built

**Evidence boundary.** Public documentation, standards bodies' own descriptions, published
papers, regulator publications, and engineering blogs, read on 16 and 17 August 2026. No
paywalled standards texts were purchased, so where a standard's contents are described, the
description comes from the publishing body's public abstract, a freely available part, or a
technical summary that cites it. Those cases are marked in the section that uses them.

**No tools were installed or exercised.** Every claim about how a tool behaves comes from
its documentation or from published measurement, not from running it. This is the largest
limitation of the report.

**One original calculation.** The diagnostic table in [11](11-health-and-diagnostics.md) was
recomputed from the stated sensitivity, specificity and prevalence rather than copied. The
working is shown in full so a reader can check it. Result: positive predictive value 7.9%,
which matches the 8% figure the source states.

**Everything else is synthesis.** The translation table and the seven proposals in
[15](15-cross-domain-map.md), the six-part frame in [01](01-anatomy-of-a-test.md), and the
failure taxonomy in [16](16-how-testing-fails.md) are original to this report. They are
arguments, not measurements, and should be read as such.
[17](17-limits-of-the-frame.md) says which of them could be wrong and what would show it.

## What is covered and what is not

**Covered:** software testing by scope, by technique, by generation method, and by quality
attribute; testing practice and workflow; regulated and safety-critical testing; testing in
statistics and experimental science, medicine and diagnostics, materials and manufacturing,
psychometrics and education, organisational and security exercises, and product and
financial testing; the failure modes shared across all of them.

**Not covered:**

- Tool comparisons and recommendations. The report names tools only where a tool is the
  canonical example of a technique.
- Any quantitative claim about which practices produce better outcomes. The empirical
  software engineering literature on this is weaker than its citation frequency suggests,
  which is itself covered in [07](07-software-practice-and-workflow.md).
- Testing in fields not listed above, including agriculture beyond a single example,
  telecommunications conformance, and materials characterisation at research depth.
- Test management tooling, staffing models, and outsourcing.

**Known conflicts in the evidence**, all noted where they appear:

- Accessibility automation coverage is reported as 57%, 20% to 40%, 29%, and 22.6% by
  different sources. These measure different denominators; see
  [06](06-software-non-functional.md).
- The 2025 Federal Reserve stress test is described by secondary sources as covering both
  22 and 31 banks. The Federal Reserve's own publication says 22, and that is the figure
  used.
- The "100x cost of a late defect" curve is widely cited and has no traceable dataset; see
  [07](07-software-practice-and-workflow.md).
- Clinical trial participant counts vary between sources because they are typical ranges,
  not rules. They are presented as ranges.

## Sources

### Software testing standards and vocabulary

- [ISO/IEC/IEEE 29119 series overview](https://softwaretestingstandard.org/), parts 1 to 6,
  11 and 13
- [ISO/IEC/IEEE 29119-1:2022](https://www.iso.org/standard/81291.html)
- [ISO/IEC 25010:2023 product quality model](https://www.iso.org/standard/78176.html);
  [summary of the 2023 revision](https://www.sonarsource.com/resources/library/iso-iec-25010-explained/)
- [ISTQB Certified Tester Foundation Level v4.0](https://istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/);
  [test techniques overview](https://astqb.org/4-1-test-techniques-overview/)

### Software testing research

- Weyuker, E. "On Testing Non-Testable Programs", *The Computer Journal* 25(4), 1982
- Barr, Harman, McMinn, Shahbaz, Yoo. ["The Oracle Problem in Software Testing: A Survey"](https://dl.acm.org/doi/10.1109/TSE.2014.2372785),
  *IEEE TSE* 41(5), 2015
- DeMillo, Lipton, Sayward. "Hints on Test Data Selection: Help for the Practicing
  Programmer", *Computer* 11(4), 1978
- [Claessen, K. and Hughes, J. "QuickCheck"](https://alastairreid.github.io/RelatedWork/papers/claessen:icfp:2000/),
  ICFP 2000
- Chen, Cheung, Yiu. "Metamorphic testing: a new approach for generating next test cases",
  HKUST-CS98-01, 1998; [survey](https://dl.acm.org/doi/10.1145/3143561)
- Ding, Z.Y. and Le Goues, C. ["An Empirical Study of OSS-Fuzz Bugs"](https://squareslab.github.io/materials/DingOSSFuzz21.pdf),
  MSR 2021
- Dijkstra, E.W. NATO Software Engineering Techniques conference, Rome, October 1969
  (published April 1970); "Notes on Structured Programming" (EWD249), 1970.
  [Wikiquote, with citations](https://en.wikiquote.org/wiki/Edsger_W._Dijkstra)

### Software testing practice

- [Google Testing Blog: Where do our flaky tests come from?](https://testing.googleblog.com/2017/04/where-do-our-flaky-tests-come-from.html)
- [Google Testing Blog: Flaky Tests at Google and How We Mitigate Them](https://testing.googleblog.com/2016/05/flaky-tests-at-google-and-how-we.html)
- Memon, Gao et al. [Taming Google-Scale Continuous Testing](https://research.google.com/pubs/archive/45861.pdf)
- [OSS-Fuzz](https://github.com/google/oss-fuzz), figures as stated in the README, May 2025
- Fowler, M. ["Mocks Aren't Stubs"](https://martinfowler.com/articles/mocksArentStubs.html);
  Meszaros, G. *xUnit Test Patterns*, 2007; [xunitpatterns.com](http://xunitpatterns.com/Mocks,%20Fakes,%20Stubs%20and%20Dummies.html)
- [web.dev: Pyramid or crab, find a testing strategy that fits](https://web.dev/articles/ta-strategies)
- [Principles of Chaos Engineering](https://principlesofchaos.org/)
- [Pact documentation](https://docs.pact.io/)
- Bossavit, L. [*The Leprechauns of Software Engineering*](https://books.google.com/books/about/The_Leprechauns_of_Software_Engineering.html?id=6LcpBgAAQBAJ)
- [DORA change failure rate benchmarks, 2025](https://www.opstrails.dev/insights/change-failure-rate-dora-metric)
- Accessibility automation coverage:
  [TestParty](https://testparty.ai/blog/automated-accessibility-testing-guide),
  [QA Wolf](https://www.qawolf.com/blog/automated-accessibility-testing-explained)

### Concurrency and distributed systems

- [Jepsen analyses](https://jepsen.io/analyses) and [blog](https://jepsen.io/blog);
  Kingsbury, K. and Alvaro, P. on the Elle checker, via
  [ACM PODC 2021](https://www.podc.org/podc2021/kyle-kingsbury/)
- [Antithesis on deterministic simulation testing](https://antithesis.com/docs/resources/deterministic_simulation_testing/);
  [WarpStream's account of applying it to a whole service](https://www.warpstream.com/blog/deterministic-simulation-testing-for-our-entire-saas);
  Eaton, P. [on why it matters](https://notes.eatonphil.com/2024-08-20-deterministic-simulation-testing.html)
- Newcombe, C. et al. ["How Amazon Web Services Uses Formal Methods"](https://cacm.acm.org/research/how-amazon-web-services-uses-formal-methods/),
  *CACM*, April 2015
- Satarin, A. [Testing distributed systems, curated resources](https://asatarin.github.io/testing-distributed-systems/)

### Risk methods

- [AIAG & VDA FMEA, and the replacement of RPN with action priority](https://quality-one.com/aiag-vda-fmea/);
  [action priority tables](https://relyence.com/help/user-guide/fmea-ap.html);
  [FMEA worked examples](https://reliamag.com/guides/how-to-perform-fmea/); IEC 60812:2018

### Safety-critical and regulated

- [LDRA on MC/DC and DO-178C](https://ldra.com/capabilities/mc-dc/);
  [modified condition/decision coverage](https://en.wikipedia.org/wiki/Modified_condition/decision_coverage)
- [LDRA on ISO 26262 and ASILs](https://ldra.com/iso-26262/);
  [Automotive Safety Integrity Level](https://en.wikipedia.org/wiki/Automotive_Safety_Integrity_Level)
- [IEC 62304 safety classifications](https://www.greenlight.guru/glossary/iec-62304)
- [CISA: AI red teaming, applying software TEVV for AI evaluations](https://www.cisa.gov/news-events/news/ai-red-teaming-applying-software-tevv-ai-evaluations)
- [NIST SP 800-115, and red/blue/purple teams](https://www.compassitc.com/blog/penetration-testing-understanding-red-blue-purple-teams)

### Science and statistics

- [ASA Statement on Statistical Significance and P-Values, 2016](https://www.amstat.org/asa/files/pdfs/p-valuestatement.pdf);
  [six principles as quoted](https://mostlyeconomics.wordpress.com/2016/03/17/six-principles-for-the-use-and-interpretation-of-p-values/)
- Open Science Collaboration. ["Estimating the reproducibility of psychological science"](https://www.science.org/doi/10.1126/science.aac4716),
  *Science*, 2015; [full text PDF](https://discovery.dundee.ac.uk/ws/files/7385883/RPP_SCIENCE_2015.pdf)
- [Nobel Prize in Economic Sciences 2019, press release](https://www.nobelprize.org/prizes/economic-sciences/2019/press-release/);
  [CEPR on what randomisation can and cannot do](https://cepr.org/voxeu/columns/what-randomisation-can-and-cannot-do-2019-nobel-prize)

### Medicine and laboratories

- [FDA, Step 3: Clinical Research](https://www.fda.gov/patients/drug-development-process/step-3-clinical-research);
  phase ranges via [Cancer Therapy Advisor](https://www.cancertherapyadvisor.com/factsheets/clinical-trial-phases/)
  and [BrightFocus](https://www.brightfocus.org/about/clinical-trials/phases-of-clinical-trials/)
- [NY State Department of Health, disease screening](https://www.health.ny.gov/diseases/chronic/discreen.htm)
- [ISO/IEC 17025:2017](https://www.iso.org/standard/66912.html);
  [PECB whitepaper](https://pecb.com/en/whitepaper/iso-iec-170252017-general-requirements-for-the-competence-of-testing-and-calibration-laboratories)
- National Research Council. [*The Polygraph and Lie Detection*](https://www.nationalacademies.org/read/10420/chapter/10), 2003

### Materials, manufacturing, and products

- [ASNT: what is nondestructive testing](https://www.asnt.org/what-is-nondestructive-testing);
  [six most common NDT methods](https://www.vareximaging.com/blogs/what-are-the-six-most-common-ndt-methods/)
- [ISO 2859-1 inspection levels](https://qualityinspection.org/inspection-level/);
  [ISO 2859-1 versus ANSI/ASQ Z1.4](https://ecqa.com/iso-2859-1-vs-ansi-z1-4/);
  [history of ANSI/ASQ Z1.4](https://www.qualitymag.com/articles/98097-brief-history-of-ansi-asq-z14)
- [Tektronix: Fundamentals of HALT/HASS Testing](https://download.tek.com/document/HALT_HASS_WP.pdf);
  [Accendo Reliability: ESS and HASS](https://accendoreliability.com/ess-hass/)
- [PQE: FAT and SAT](https://blog.pqegroup.com/commissioning-qualification/fat-and-sat);
  [hydrostatic, proof and burst testing](https://sarum-hydraulics.co.uk/white-paper/hydrostatic-pressure-testing/hydrostatic-proof-burst-fatigue-test-explainer/)
- [Euro NCAP: the stars explained](https://www.euroncap.com/how-to-read-the-stars/);
  [2026 protocol changes](https://www.euroncap.com/press-media/euro-ncap-announces-2026-protocol-changes-to-tackle-modern-driving-risks/)
- [FDA HACCP principles and application guidelines](https://www.fda.gov/food/hazard-analysis-critical-control-point-haccp/haccp-principles-application-guidelines);
  [ISO 4120 triangle test](https://www.iso.org/standard/33495.html)

### People, organisations, markets

- [Types of reliability](https://conjointly.com/kb/types-of-reliability/);
  [reliability and validity of measurement](https://opentext.wsu.edu/carriecuttler/chapter/reliability-and-validity-of-measurement/1000/)
- [Yale Poorvu Center: formative and summative assessment](https://poorvucenter.yale.edu/teaching/teaching-resource-library/formative-summative-assessments)
- [Campbell's law](https://en.wikipedia.org/wiki/Campbell%27s_law);
  [Goodhart's law, Campbell's law and the cobra effect](https://psychsafety.com/goodharts-law-campbells-law-and-the-cobra-effect/)
- [The five Daubert factors](https://bridgelegal.org/understanding-five-daubert-factors-expert-testimony/)
- Kohavi, R. et al. [Online Controlled Experiments at Large Scale](https://exp-platform.com/Documents/2015-08OnlineControlledExperimentsKDDKeynoteNR.pdf);
  [Online Experimentation at Microsoft](http://ai.stanford.edu/~ronnyk/ExPThinkWeek2009Public.pdf)
- [Federal Reserve, 2025 Dodd-Frank Act Stress Test Results](https://www.federalreserve.gov/publications/2025-june-dodd-frank-act-stress-test-results.htm)
- [Bank Policy Institute, DFAST 2025 scenarios](https://bpi.com/deep-dive-dfast-2025-stress-test-scenarios/)
