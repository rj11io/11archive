# How to choose test cases

Scope tells you how much of the system a test turns on. This section is about a different
question: given that you cannot try every input, which inputs do you try?

The international vocabulary comes from the ISTQB Foundation syllabus, which sorts
techniques into three families:

- **Black-box**, also called specification-based. You look at what the software is
  supposed to do. You do not look inside.
- **White-box**, also called structure-based. You look at the code and pick inputs that
  reach parts of it.
- **Experience-based**. You use what testers know about where bugs live.

They are complementary, not competing. Black-box finds missing behaviour, white-box finds
unreachable and untested behaviour, experience-based finds what neither thought to ask.

A fourth family, where a machine generates the cases, is covered separately in
[04](04-software-generative-techniques.md).

## Black-box techniques

### Equivalence partitioning

Split the inputs into groups where every member should be handled the same way, then test
one member of each group.

Concretely, a discount rule for age:

| Group | Example input | Expected |
|---|---|---|
| under 18 | 12 | child price |
| 18 to 64 | 30 | full price |
| 65 and over | 70 | senior price |
| invalid: negative | -5 | rejected |
| invalid: not a number | "abc" | rejected |

Five tests instead of every integer. The assumption doing the work is that if 30 is
handled correctly, 31 is too. That assumption is usually right in the middle of a range
and usually wrong at the edges, which is why the next technique exists.

### Boundary value analysis

Bugs cluster at edges, because edges are where `<` and `<=` get confused. Test the value
on each side of every boundary.

For the same age rule, the boundaries are 18 and 65, so test 17, 18, 64, 65, plus the
absolute limits: 0, and whatever the maximum is.

This is the highest-yield black-box technique per test written. Off-by-one at a boundary
is one of the most common defects in any codebase.

### Decision tables

When output depends on a combination of conditions, write the combinations down as a
table. Filling it in exposes the combinations nobody specified.

A shipping rule:

| Member? | Order over 50? | Fragile? | Shipping |
|---|---|---|---|
| yes | yes | no | free |
| yes | yes | yes | free, packed |
| yes | no | no | 4.99 |
| yes | no | yes | 8.99 |
| no | yes | no | 4.99 |
| no | yes | yes | 8.99 |
| no | no | no | 7.99 |
| no | no | yes | 11.99 |

Three yes/no conditions produce eight rows. The value of the table is that the eight rows
are visible; a requirements document usually specifies four of them and leaves the reader
to guess the rest.

### State transition testing

When the system's response depends on what happened before, model it as states and the
events that move between them, then test the transitions, including the ones that should
be refused.

An order: `created` to `paid` to `shipped` to `delivered`, with `cancelled` reachable from
some states and not others. The interesting tests are the illegal transitions: what
happens if a `cancel` arrives for an already-shipped order, or a second `pay` arrives for
a paid one? Payment systems live or die on this class of test.

### Pairwise and combinatorial testing

When many settings can combine, the full set explodes. Ten settings with three values each
is 59,049 combinations.

**Pairwise testing** exploits the empirical finding that most defects involve one factor
or the interaction of two, not five. It selects a small set of test cases such that every
pair of values from every pair of settings appears at least once. For the case above,
pairwise coverage typically needs a few dozen cases rather than 59,049.

It is a bet, and worth stating as one: pairwise will not find a bug that requires three
specific settings to line up.

### Use case and scenario testing

Test a complete user journey, in order, as a user would perform it. "Register, verify
email, add an item, check out with a saved card, request a refund." This finds the
problems that live between features rather than inside one, and it is the black-box
technique closest to acceptance testing.

## White-box techniques

White-box techniques measure how much of the code the tests reach. Each criterion below
subsumes the one above it: satisfying branch coverage guarantees statement coverage, and
so on.

| Criterion | Requirement | Test count for `if (a && b)` |
|---|---|---|
| Statement | every line runs at least once | 1 |
| Branch, also called decision | every decision takes both outcomes | 2 |
| Condition | every single condition takes both values | 2 |
| Modified condition/decision (MC/DC) | each condition is shown, independently, to change the result | 3 |
| Multiple condition | every combination of conditions | 4 |
| Path | every route through the code | grows past counting with loops |

### The coverage trap

100% statement coverage means every line ran. It does not mean every line was checked. A
test suite that calls every function and asserts nothing scores 100%.

This is not a hypothetical. Coverage is a measure of what your tests *touched*, and it is
routinely read as a measure of what your tests *verified*. The gap between those two
readings is exactly the gap that [04](04-software-generative-techniques.md) closes with
mutation testing, which measures whether removing correct behaviour makes any test fail.

Use coverage the way it works: as a way to find code no test reaches at all. A file at 0%
is a real finding. The difference between 84% and 86% is noise.

### MC/DC, and why aviation requires it

**Modified condition/decision coverage** requires that each condition in a decision is
shown by execution to independently affect the outcome. For `if (a && b)`, that needs
three cases: one where flipping `a` alone changes the result, one where flipping `b` alone
changes the result, and the shared reference case.

DO-178C, the standard for airborne software, requires MC/DC for Level A software, the
level where a failure is catastrophic. Table A-7 of the standard sets it out.

The reason it is the criterion chosen, rather than testing every combination, is cost
arithmetic: for a decision with N conditions, MC/DC needs about N+1 tests, while every
combination needs 2^N. For a ten-condition decision that is 11 tests instead of 1,024,
while still proving each condition matters.

This is a good example of a threshold set deliberately, with the cost stated. Most
software coverage targets are set by rounding to a number that sounds serious.

## Experience-based techniques

### Exploratory testing

**Exploratory testing** is simultaneous learning, test design, and test execution. The
tester works from a charter rather than a script: "explore the checkout flow with expired
payment methods, for 60 minutes, looking for states the user cannot get out of."

It is not ad hoc clicking. Session-based test management gives it structure: a time-boxed
session, a stated charter, notes taken during the session, and a debrief. What comes out
is a list of findings and a record of what was covered, which is the coverage claim from
[01](01-anatomy-of-a-test.md) supplied by a human rather than a tool.

Exploratory testing finds a class of defect automation structurally cannot: things nobody
specified, and therefore nobody wrote an assertion for. A scripted test can only fail in
ways its author imagined.

### Error guessing

Use knowledge of where this team, this language, or this kind of system usually goes
wrong. Empty list. Null. Zero. Very large number. Unicode in a name field. Two requests at
once. Daylight saving time. A leap day. A user in a timezone with a 45-minute offset.

This is a checklist built from scar tissue, and it is more effective than its
unscientific reputation suggests.

### Checklist-based testing

Codify the scar tissue so it survives the person leaving. Accessibility, security, and
release checklists are all this technique. The failure mode is the checklist becoming a
ritual that is ticked rather than performed, which is the same failure mode that ruins
safety paperwork in every other industry.

## Choosing between them

| If your risk is | Reach for |
|---|---|
| a rule with ranges or limits | boundary value analysis |
| a rule with several conditions combined | decision table |
| order-dependent behaviour | state transition |
| many configuration options | pairwise |
| code that might not be exercised at all | coverage measurement |
| a safety-critical decision | MC/DC |
| something nobody specified | exploratory |
| a defect that already escaped once | add a regression test at the lowest level that reproduces it |

## Sources

- [ISTQB Certified Tester Foundation Level v4.0, test techniques overview](https://astqb.org/4-1-test-techniques-overview/)
- [LDRA: Modified Condition/Decision Coverage](https://ldra.com/capabilities/mc-dc/)
- [Modified condition/decision coverage, DO-178C Table A-7 requirement](https://en.wikipedia.org/wiki/Modified_condition/decision_coverage)
- ISO/IEC/IEEE 29119-4, Test Techniques.
  [softwaretestingstandard.org](https://softwaretestingstandard.org/)
