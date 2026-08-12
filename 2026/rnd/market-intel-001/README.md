# Market Intelligence: A Working Handbook

Market intelligence is the work of answering a business question about the world
outside your company, using evidence you collected on purpose.

A concrete example. A pricing team asks: "can we raise list price 8% in January
without losing enterprise renewals?" Market intelligence is everything that
answers it. What competitors charge today. What buyers said in the last twenty
lost deals. What input costs did. What a regulator allows. The answer arrives as
a judgment with a confidence level attached, not as a folder of links.

This handbook covers the whole discipline: what it is, how the work runs, where
the evidence comes from, how to analyse it, what to publish, how to staff it,
what the law allows, and what changed once research agents arrived.

Research date: 11 August 2026. Every figure carries its period and source.

## Contents

1. [Foundations and scope](01-foundations-and-scope.md)
2. [The cycle: from question to decision](02-the-cycle.md)
3. [Sources and collection](03-sources-and-collection.md)
4. [Analysis and judgment](04-analysis-and-judgment.md)
5. [Products and cadence](05-products-and-cadence.md)
6. [Operating model](06-operating-model.md)
7. [Law and ethics](07-law-and-ethics.md)
8. [What changed by 2026](08-what-changed-by-2026.md)
9. [Build guide: first 90 days](09-build-guide.md)
10. [Glossary](GLOSSARY.md)
11. [Sources](SOURCES.md)

Companion artifacts (file names, not links, so they resolve in every view):

- `report.html` is the standalone reading version of all nine chapters, with a
  searchable glossary.
- `data.json` holds every quantitative claim in the report as a checkable
  record: value, period, source, and confidence.
- `verify.mjs` checks that the HTML, the chapters, and the data file agree. Run
  it with `node verify.mjs` from the source folder.

## Core model

```text
Decision needed
    -> intelligence question (KIT/KIQ)
    -> collection plan
    -> collection from ranked sources
    -> evaluation of source and content
    -> analysis and judgment with confidence
    -> product delivered to the decider before the decision date
    -> decision taken
    -> outcome recorded and questions refined
```

The loop is the point. A market intelligence team that never closes it produces
reading material, not intelligence.

## Three claims this handbook defends

1. **Intelligence starts with a decision, not a data source.** If you cannot
   name the decision, the person making it, and the date, you are doing
   monitoring. Programs that fail almost always fail here first. See
   [chapter 2](02-the-cycle.md).

2. **How you obtained something matters more than what it is.** Public price
   lists, reverse engineering, and honest interviews are lawful nearly
   everywhere. Impersonation, logged-in scraping, and pooled non-public
   competitor pricing are not. See [chapter 7](07-law-and-ethics.md).

3. **Speed got cheap in 2025 and 2026; verification did not.** Research agents
   read 500 million documents in minutes, and they still miscite. The scarce
   skill moved from finding things to deciding what is true. See
   [chapter 8](08-what-changed-by-2026.md).

## Scope and limits

- Covers business and investment market intelligence. Government and military
  intelligence doctrine appears only where it supplies a usable standard, mostly
  around uncertainty language and sourcing.
- Written from open sources. No proprietary vendor data, no client work.
- Vendor surveys are marked as such. They are self-reported, run by companies
  selling the thing they measure, and they show correlation, not cause.
- Sister collection: `2026/rnd/intel-reports-structure` covers the anatomy of
  intelligence reports themselves. This collection covers the market subject.
