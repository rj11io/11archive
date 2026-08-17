# Choosing what to test

Everything so far describes how to test. This section is about the question that actually
consumes teams: **what deserves a test, and how much.**

Software has almost no method for this. The usual answers are a coverage percentage, which
measures the wrong thing ([03](03-software-design-techniques.md)), or "test everything
important", which is not a method. Engineering has had formal answers for sixty years, and
they are transferable.

## FMEA, and why its third axis matters

**Failure mode and effects analysis (FMEA)** works through a system part by part, and for
each part asks: how could this fail, what happens when it does, why would it happen, and
would we notice.

The classic scoring uses three numbers, each 1 to 10:

| Axis | Question | 10 means |
|---|---|---|
| Severity (S) | how bad is the effect | catastrophic |
| Occurrence (O) | how often will the cause happen | almost certain |
| Detection (D) | how likely are we to catch it before it reaches the customer | we would not catch it |

Multiply them for a **risk priority number (RPN)**, and work the list from the top.

The third axis is the one worth stopping on. **Detection is a rating of your testing.** FMEA
is a method for deciding what to test that treats the quality of your testing as one of the
three inputs. That is a genuinely different posture from anything in mainstream software
practice: it says a low-severity, common bug you would definitely catch is a smaller problem
than a moderate, rare bug that would sail straight through to a customer.

A software FMEA on a checkout service, scored the same way:

| Function | Failure mode | Effect | S | O | D | RPN | Action |
|---|---|---|---|---|---|---|---|
| Charge card | charged twice on retry | customer charged twice, refund and complaint | 8 | 6 | 7 | 336 | idempotency key, plus a test that delivers the same message twice |
| Apply discount | wrong percentage | undercharge, revenue loss, quiet | 6 | 3 | 9 | 162 | boundary tests on the tiers, plus a daily reconciliation check |
| Send receipt | email not sent | customer confusion, support ticket | 3 | 5 | 3 | 45 | existing integration test is enough |
| Render button | wrong shade | nobody notices | 1 | 4 | 2 | 8 | no test |

The bottom row is the point as much as the top one. FMEA gives you written permission not to
test something, which is the part software teams find hardest and need most.

### RPN is known to be broken, and the fix is published

Multiplying three ordinal ratings produces a number that looks precise and is not. Different
combinations give the same RPN with very different meanings: a rare catastrophe and a
frequent annoyance can both score 200, and they do not deserve equal attention.

The 2019 AIAG-VDA FMEA handbook, the joint American and German automotive standard,
**eliminated RPN entirely** and replaced it with **action priority (AP)**, which classifies
each row as High, Medium or Low using a lookup table that weights severity first, then
occurrence, then detection. IEC 60812:2018 is the international standard for the method.

Take the correction seriously, because software repeats the same error constantly. Any
score built by multiplying ordinal ratings, including most home-grown bug priority formulas
and most vendor risk scores, has this defect. Sort by severity first, then break ties.

## The other risk methods, and when each fits

| Method | Direction | Good for |
|---|---|---|
| FMEA | bottom-up: start from a component, enumerate its failures | finding what to test, component by component |
| Fault tree analysis (FTA) | top-down: start from the bad outcome, work back through the combinations that cause it | one specific catastrophe you must prevent, for example "customer data leaks" |
| HAZOP | guided walkthrough using prompt words (none, more, less, reverse, other than) applied to each flow | processes and pipelines, where the failures are about quantity and direction rather than components |
| Preliminary hazard analysis | early, coarse, before the design exists | deciding which parts of a new system need the heavy treatment |

FTA is the one most obviously missing from software practice. Ask "what would have to be
true for customer data to become publicly readable", draw the branches, and you get a test
list that no component-by-component review would produce, because the failure requires three
things to line up.

HAZOP transfers surprisingly well to data pipelines. Apply the prompt words to a stream: no
data, more data than expected, less data, data in reverse order, data of another kind. That
is a better generator of test cases for a pipeline than any coverage tool.

## Risk matrices, and their known defect

The familiar likelihood-by-impact grid is a coarse FMEA. It is useful for conversation and
weak for ranking, and the reason is the same as with RPN: the categories are ordinal, so the
cells do not carry consistent meaning, and two risks in the same cell can differ by orders
of magnitude.

Use it to sort things into "must not happen", "must be caught", and "acceptable". Do not use
it to decide that risk 14 outranks risk 15.

## The economics nobody writes down

A test has a cost that recurs forever: it runs on every build, it breaks when the code
changes for good reasons, and someone maintains it. **Test code is not free inventory, it is
a liability with a benefit attached.** The decision is an investment decision.

The honest form of the trade-off:

```
write the test when:

    P(bug) x cost(bug) x P(this test catches it)
      >
    cost(writing it) + cost(maintaining it forever)
```

Nobody can fill that in precisely. You can fill it in roughly, and roughly is enough to
settle most arguments, because the terms usually differ by orders of magnitude rather than
percentages.

Cases where the arithmetic says do not write the test:

- **Code that will be deleted.** A spike, a migration script that runs once, an experiment
  behind a flag with a removal date.
- **Cases where the test is more likely to be wrong than the code.** A test that restates a
  complicated calculation in the same complicated way is a coin flip with extra steps.
  Prefer a property or a relation ([04](04-software-generative-techniques.md)).
- **Cases a type or an assertion covers more cheaply.** If making the state unrepresentable
  costs one type definition, it beats three tests forever.
- **Pure presentation with no logic**, where the real check is a person looking at it.
- **Third-party behaviour you do not control.** Test your handling of their responses, not
  their service.

And the direction the arithmetic usually points the other way:

- Anything touching money, identity, permissions, or personal data.
- Anything with an irreversible effect. A bug that sends 40,000 emails cannot be rolled back.
- Anything that has already broken once. A defect that escaped has demonstrated both its
  likelihood and your detection gap, so it has earned a regression test at the lowest level
  that reproduces it.
- Anything a lot of other code depends on, where the cost is multiplied by the number of
  callers.

## Do not trust the 100x number while doing this

The standard justification for testing early is the curve where a defect costs ten times
more per phase, reaching a hundred times or more in production. Treat the direction as sound
and the numbers as folklore. Laurent Bossavit traced the widely cited version to a textbook
citing internal IBM course notes, with no dataset anyone has produced. See
[07](07-software-practice-and-workflow.md).

Using a fabricated multiplier to justify a real practice is a bad habit, and it hands the
argument to whoever checks the citation.

## Scaling the decision: test selection

Past a certain size the question changes from "should this test exist" to "should this test
run now". **Test impact analysis** builds a map from code to the tests that cover it, then
runs only the tests a change could possibly affect.

This is the same logic as the switching rules in an
[ISO 2859-1 sampling plan](12-materials-and-manufacturing.md): inspection intensity responds
to evidence rather than staying fixed. It needs two things to be safe, and both are commonly
missing:

- The dependency map must be conservative. If it under-reports, you skip a test that would
  have failed.
- The full suite must still run on a schedule, so a wrong map is discovered by the schedule
  rather than by a customer.

## What to write down

The output of this section, for a real team, is short. One page per service:

1. The three or four failure modes with the highest severity, and what catches each.
2. The detection rating you are honest about, meaning where you know you would not catch it.
3. The accepted escape rate, so "did we test enough" has an answer.
4. The list of things you have decided not to test, and why.

Item 4 is the unusual one and the most valuable. Every team has an implicit version. Writing
it down converts a source of guilt into a decision someone can disagree with.

The full version of this, borrowed from manufacturing, is the written sampling plan in
[15](15-cross-domain-map.md).

## Sources

- [AIAG & VDA FMEA handbook, and the replacement of RPN with action priority](https://quality-one.com/aiag-vda-fmea/);
  [Action Priority tables explained](https://relyence.com/help/user-guide/fmea-ap.html)
- [FMEA methodology and worked examples](https://reliamag.com/guides/how-to-perform-fmea/);
  IEC 60812:2018, failure modes and effects analysis
- Bossavit, L. [*The Leprechauns of Software Engineering*](https://books.google.com/books/about/The_Leprechauns_of_Software_Engineering.html?id=6LcpBgAAQBAJ),
  on the cost-of-defects curve
- [ISO 2859-1 inspection levels and switching rules](https://qualityinspection.org/inspection-level/)
