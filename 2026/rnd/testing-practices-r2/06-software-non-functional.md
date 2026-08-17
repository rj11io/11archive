# Testing what the software is like, not what it does

Functional testing asks whether the software produces the right answer. Non-functional
testing asks about everything else: how fast, how safe, how usable, how well it survives
being pushed. These are the qualities that get a product cancelled after it works.

The reference vocabulary is ISO/IEC 25010:2023, the product quality model. The 2023
revision is a real change from the well-known 2011 version and is worth knowing about:

- **Safety** was added as a ninth top-level characteristic, with subcharacteristics
  including fail safe and hazard warning.
- **Usability** was renamed **interaction capability**, and gained **inclusivity** and
  **self-descriptiveness** as subcharacteristics.
- **Portability** was renamed **flexibility**, and gained **scalability**.
- **Security** gained **resistance**.

The nine characteristics are: functional suitability, performance efficiency,
compatibility, interaction capability, reliability, security, maintainability,
flexibility, and safety.

Used as a checklist rather than a taxonomy, this list is the fastest way to find the
quality nobody on the team owns.

## Performance testing

All of these run load against a system. They differ in the shape of the load and the
question being asked.

| Name | Load shape | Question |
|---|---|---|
| Load test | expected peak traffic | does it meet its targets under normal worst-case use |
| Stress test | increase until it breaks | where is the limit, and how does it fail |
| Spike test | sudden jump, then back down | does it survive a traffic surge, and does it recover |
| Soak test, endurance test | normal load, for many hours | does anything leak, drift, or fill up |
| Volume test | normal traffic, very large data | does it survive a 500GB table rather than a 500MB one |
| Scalability test | load rises while capacity rises | does adding machines actually add throughput |
| Capacity test | rising load, measured against a target | how many users can we serve at our latency target |

Three points decide whether a performance test is worth anything:

**Measure percentiles, not averages.** An average response time of 200ms is consistent
with 95% of users seeing 50ms and 5% seeing 3 seconds. Report p50, p95, p99. The tail is
where users are, because a page that makes 20 requests hits its p99 often.

**A soak test is the only way to find a slow leak.** A memory leak of 4MB per hour is
invisible in a 10-minute load test and takes the service down on day nine. This is the
same idea as the accelerated life testing in [12](12-materials-and-manufacturing.md): run
long enough, or run harder, to bring a slow failure into view.

**Test data volume, not just request rate.** Query plans change when a table crosses a
size threshold. A system that is fast in a test environment with 10,000 rows and slow in
production with 40 million rows has not been performance tested; it has been benchmarked
on a different system.

## Security testing

Security testing splits by what the tool can see, which is exactly the black-box and
white-box split from [03](03-software-design-techniques.md).

| Method | What it is | What it sees | What it misses |
|---|---|---|---|
| SAST, static application security testing | reads source code for unsafe patterns | all code paths, including unreached ones | anything that depends on runtime configuration |
| DAST, dynamic application security testing | attacks the running application from outside | real, exploitable behaviour | code it never reaches |
| IAST, interactive | instruments the running app while it is exercised | runtime behaviour with code-level detail | needs the app to be driven well |
| SCA, software composition analysis | checks third-party dependencies against known vulnerability lists | published vulnerabilities in libraries | vulnerabilities nobody has published |
| Secret scanning | looks for keys and passwords in code and history | committed credentials | credentials elsewhere |
| Penetration testing | a person tries to break in, with permission | logic flaws, chained weaknesses | anything outside the agreed scope and time |
| Red teaming | a person simulates a real adversary against the whole organisation, usually without warning defenders | whether you would detect and respond | narrow technical coverage |

The distinction that gets missed is the last one. A penetration test asks "can this be
broken into". A red team exercise asks "would we notice". NIST's definition of a red team
is a group authorised to emulate an adversary's attack capabilities against an
enterprise's security posture, and its purpose includes demonstrating what works for the
defenders. A **purple team** exercise runs both sides together, deliberately closing the
loop between what the attackers found and what the defensive tooling saw.

The coverage claim matters more here than anywhere else in software. A penetration test
report covers the systems in scope, during the test window, against the techniques that
tester tried. "We passed the pentest" is not a statement about the security of the system.
It is a statement about one sample.

Organisational security exercises, including tabletop drills and phishing simulations,
are covered in [13](13-people-and-organisations.md), because they test people rather than
code.

## Accessibility testing

Accessibility testing checks that people using assistive technology, or with limited
vision, hearing, motor control, or attention, can use the product. In many jurisdictions
it is a legal requirement, not a preference.

The important, repeatedly measured fact is how much of it a machine can do.

- A Deque study across more than 2,000 audits, 13,000 pages, and nearly 300,000 issues
  found that automated testing caught **57% of total issues**. That number is inflated by
  colour contrast, which tools detect almost perfectly and which appears in enormous
  volume.
- Measured by distinct success criteria rather than issue count, the ceiling for any
  automated tool sits at roughly **20% to 40%** of WCAG criteria.
- A UK Government test found axe caught **29% of documented barriers**; a January 2026
  study found axe-core alone surfaced **22.6%** of the issues a manual audit found.

The spread between 57% and 22.6% is not a contradiction. It is the difference between
counting issues and counting kinds of issue, and it is a clean example of a metric whose
denominator decides the answer.

The practical reading: automation is a cheap first pass that removes a large volume of
real defects, and it cannot tell you whether the page makes sense when read aloud in
order, whether a custom widget is operable by keyboard, or whether an error message
explains what to do. Those need a person, ideally a person who uses a screen reader daily.

## The rest, briefly

| Type | What it checks | Concrete example |
|---|---|---|
| Usability testing | can a real person complete a task | watch five people try to cancel a subscription, count how many find it |
| Compatibility testing | does it work across browsers, devices, OS versions | the same checkout on Safari 16, Chrome on Android 12, and a 320px screen |
| Reliability and resilience | does it keep working when parts fail | kill the cache and confirm the site degrades instead of dying |
| Recoverability and disaster recovery | can you get back after losing something | restore last night's backup into a clean environment and check the data |
| Internationalisation (i18n) | does it work in other languages and locales | a German string 40% longer than English, right-to-left Arabic, a Japanese name with no surname field |
| Localisation (l10n) | is the translation right in context | "Save" translated as the verb for rescuing someone |
| Installability and upgrade | can it be installed, upgraded, and rolled back | run the migration, then run the rollback, on a copy of production data |
| Observability | can you tell what happened after the fact | trigger a failure and check whether the logs and traces let you diagnose it |
| Compliance and conformance | does it meet a stated external rule | WCAG 2.2 AA, PCI DSS, GDPR data deletion within the stated window |
| Migration and data testing | did the data survive the move | row counts, checksums, and spot-checked records before and after |

Two of these deserve a note.

**Recoverability is the most commonly skipped test in the industry.** Backups are taken;
restores are rarely rehearsed. A backup that has never been restored is a hypothesis. The
equivalent practice in other fields is mandatory: fire drills, disaster recovery
exercises, and site acceptance tests all exist because nobody trusts an untested
capability.

**Observability testing is testing the tests.** If a failure in production produces no
usable signal, the production monitoring described in
[07](07-software-practice-and-workflow.md) is decoration.

## Sources

- [ISO/IEC 25010:2023, product quality model](https://www.iso.org/standard/78176.html);
  summary of the 2023 changes at
  [Sonar](https://www.sonarsource.com/resources/library/iso-iec-25010-explained/)
- [NIST glossary definition of red team](https://www.compassitc.com/blog/penetration-testing-understanding-red-blue-purple-teams);
  [NIST SP 800-115, Technical Guide to Information Security Testing and Assessment](https://www.softwaresecured.com/post/nist-sp-800-115-and-penetration-testing),
  September 2008
- Deque audit study and criteria-based ceiling figures, as reported by
  [TestParty](https://testparty.ai/blog/automated-accessibility-testing-guide) and
  [QA Wolf](https://www.qawolf.com/blog/automated-accessibility-testing-explained)
