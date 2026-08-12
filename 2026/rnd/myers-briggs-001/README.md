# Myers-Briggs: A Working Reference

**Created:** 2026-08-11
**Audience:** anyone who has to decide what to do about the MBTI. HR and people leaders being sold a
workshop, coaches and consultants who use it, researchers and builders who label people or models with
four letters, and anyone who has been handed a type and wants to know what it means.
**Objective:** set out what the Myers-Briggs Type Indicator is, what its own numbers show, what the
best arguments on each side are, and what to use instead when a decision depends on the answer.
**Scope:** the MBTI's theory, its instrument family from 1943 to the 2018 Global versions, its
psychometric evidence, the main critiques and replies, its principal alternatives and look-alikes, and
the ethics and employment law around its use.
**Not in scope:** a full account of Jung's psychology, clinical assessment, personnel selection science
beyond one comparison, and any per-type description of the 16 types. Type descriptions are the one
thing the internet already has in abundance.
**Evidence boundary:** peer-reviewed papers, publisher technical documents and web pages, regulator
guidance, and reported figures, all read on 2026-08-11. Every material claim is traced in
[10-methodology-and-sources.md](10-methodology-and-sources.md), which also lists what could not be
obtained.

## The MBTI in one paragraph

The **Myers-Briggs Type Indicator** is a forced-choice questionnaire that reports a person as one of
16 **types**, written as four letters. It measures four things the publisher calls **preference
pairs**: extraversion or introversion, sensing or intuition, thinking or feeling, judging or
perceiving. The four scales are internally consistent and correlate with mainstream personality
measures. The step that converts four scores into four letters is where the evidence stops supporting
it: score distributions have one peak rather than two, about half of people change at least one letter
on a retest, statistical tests for underlying categories find none, and the type predicts work
outcomes weakly.

## How to read this bundle

Start with the brief. Then go to whichever file matches your job.

| File | What it covers | Read it if |
| --- | --- | --- |
| [00-executive-brief.md](00-executive-brief.md) | The verdict table, the core problem in one number, ten rules | You have five minutes |
| [01-origins-and-history.md](01-origins-and-history.md) | Jung to Briggs to ETS to CPP to today, and who owns what | You want to know where this came from |
| [02-the-type-model.md](02-the-type-model.md) | The four pairs, the eight function-attitudes, the function order for all 16 types, best-fit type, population distribution | You need to understand what is actually being claimed |
| [03-the-instruments.md](03-the-instruments.md) | Every form with item counts, the 1998 and 2018 scoring changes, Step I to III, the 20 facets with their reliability | You are buying, administering, or reading a report |
| [04-evidence-reliability-and-validity.md](04-evidence-reliability-and-validity.md) | What would have to be true, and what the numbers show, claim by claim | You want the evidence |
| [05-critiques-and-replies.md](05-critiques-and-replies.md) | Each critique at its strongest, the best reply, a verdict, plus where both sides overreach | You have to argue this with someone |
| [06-alternatives-and-lookalikes.md](06-alternatives-and-lookalikes.md) | 16Personalities is not the MBTI, plus 14 alternatives with evidence status and appropriate use | You need to pick something else |
| [07-use-misuse-and-law.md](07-use-misuse-and-law.md) | The code of ethics, US employment law, data protection, the labelling harm, an adoptable policy | You are responsible for how it gets used |
| [08-decision-guide.md](08-decision-guide.md) | A decision split, vendor questions, how to read a report in 60 seconds, what to do if you already misuse it | You need to act today |
| [09-glossary.md](09-glossary.md) | 70 terms, including where MBTI usage differs from mainstream usage | A word is unfamiliar |
| [10-methodology-and-sources.md](10-methodology-and-sources.md) | Evidence grading, 26 sources, everything unobtainable, seven limitations | You want to check the work |

## Artifacts

| Artifact | Purpose |
| --- | --- |
| `00` to `10` Markdown files | The portable, readable report |
| `data.json` | The machine-readable evidence model: claims with verdicts, forms, facets, studies, instruments, sources |
| `report.html` | One self-contained page with navigation, sortable tables, and a diagram of the four-letters-to-function-order rule |
| `build.mjs` | Deterministic generator: the Markdown files plus `data.json` in, `report.html` out |

`report.html` is generated from the same Markdown files you can read directly, so the two never
disagree on facts. The HTML adds navigation and interaction, never extra content.

## Rebuilding the HTML

The generator needs the house report styleguide for its embedded fonts and design tokens. Point
`ELEVEN_AGI_REPO` at a local 11agi checkout, then:

```bash
node 2026/rnd/myers-briggs-001/build.mjs
```

The build prints a JSON summary of what it emitted. Running it twice on unchanged input produces a
byte-identical file apart from the generation timestamp.

## One thing to take away

The four letters are the least informative version of what the questionnaire collected. Ask for the
scores.
