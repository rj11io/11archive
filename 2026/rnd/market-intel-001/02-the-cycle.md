# 2. The Cycle: From Question to Decision

## The loop

```text
1. Direction     Which decision needs help, by when, and what would change it
2. Planning      Which questions to answer, from which sources, at what cost
3. Collection    Get the material
4. Evaluation    Grade the source and grade the content, separately
5. Analysis      Integrate, test explanations, reach a judgment
6. Production    Write the product for the decider, not for the analyst
7. Delivery      Put it in front of the decider before the decision date
8. Feedback      Record what was decided and what actually happened
```

Two rules make this real rather than decorative.

**Stage 1 owns the whole cycle.** The quality ceiling of a piece of intelligence
is set at direction. No amount of collection rescues a badly framed question.

**Stage 8 is not optional.** If you never record outcomes, you never learn
whether your judgments are any good, and you cannot improve your calibration.
Most corporate programs skip it.

## Direction: turning a decision into questions

The standard instrument is the KIT and KIQ pair.

- A **Key Intelligence Topic (KIT)** is a broad area the leadership needs
  covered, tied to a decision or a risk.
- A **Key Intelligence Question (KIQ)** is one specific, answerable question
  underneath a KIT. Answer enough KIQs and the KIT is covered. See
  [the MAP Newsletter][map-kit].

Jan Herring's original framing sorts KITs into three kinds, and the sort matters
because each kind needs different collection:

| KIT type | Purpose | Example | Collection style |
| --- | --- | --- | --- |
| **Strategic decisions and issues** | Support a specific pending decision | "Should we enter Brazil in 2027?" | Project. Deep, time-boxed, ends |
| **Early warning** | Detect a threat before it lands | "Will our top rival cut price in mid-market?" | Continuous. Tripwires and indicators |
| **Key players** | Understand a rival, buyer, supplier, or regulator in the round | "How does rival X actually decide on pricing?" | Continuous. Profile maintained over time |

### Writing a good KIQ

A good KIQ is falsifiable, bounded in time, and answerable with obtainable
evidence.

| Bad KIQ | Why it fails | Better KIQ |
| --- | --- | --- |
| "What is our competitor up to?" | Not answerable, no boundary | "Has rival X hired mid-market sales staff in DACH since January 2026?" |
| "Is the market growing?" | No definition of market or period | "Did EU seats for category Y grow more than 12% in the year to Q2 2026?" |
| "Will AI disrupt us?" | No decision attached | "Which of our top five deal-losses in H1 2026 named an AI-native alternative?" |

### The decision header

Put this at the top of every intelligence request, before any work starts:

```text
Decision:      Raise enterprise list price 8% effective 1 January 2027
Decider:       VP Pricing, with CFO sign-off
Decision date: 15 October 2026
Delivery date: 26 September 2026
Would change the decision:
  - Two or more of the top four rivals hold price flat through Q4
  - Renewal cohort survey shows above 20% churn intent at +8%
  - Input cost index falls more than 5% by September
```

The last block is the most valuable. It defines, in advance, what evidence would
flip the answer. It stops the analyst chasing everything and it stops the
decider dismissing the finding after the fact.

## Planning: the collection plan

One table, one page. Never start collection without it.

| KIQ | Indicator to look for | Source | Method | Cost | Owner | Due |
| --- | --- | --- | --- | --- | --- | --- |
| Has rival X moved down-market? | Job ads for SMB or mid-market roles | Rival careers page, job boards | Weekly scrape | Low | Analyst A | Continuous |
| Has rival X moved down-market? | New pricing tier below current entry | Rival pricing page | Daily diff | Low | Automated | Continuous |
| Has rival X moved down-market? | Partner or reseller signings in that band | Trade press, partner directories | Weekly review | Low | Analyst A | Continuous |
| Would buyers accept +8%? | Stated churn intent at +8% | Renewal cohort, n=120 | Survey | Medium | Research vendor | 12 Sep |
| Would buyers accept +8%? | Realised discount trend | Internal CRM | Query | Low | RevOps | 5 Sep |

Notice that the first KIQ has three independent indicators. That is deliberate.
See the triangulation rule in [chapter 3](03-sources-and-collection.md).

## Evaluation: grade source and content separately

A reliable source can pass on a false claim. An unreliable source can be right.
Grade the two independently. The Admiralty-style scale used in intelligence
work is a good default because it is simple and it forces the separation:

| Source reliability | Meaning |
| --- | --- |
| A | Reliable. Proven history, no known failures |
| B | Usually reliable. Minor doubts |
| C | Fairly reliable. Some doubts |
| D | Not usually reliable. Significant doubt |
| E | Unreliable. History of being wrong |
| F | Cannot be judged |

| Information credibility | Meaning |
| --- | --- |
| 1 | Confirmed by other independent sources |
| 2 | Probably true. Consistent with other information |
| 3 | Possibly true. Reasonably consistent |
| 4 | Doubtful. Not confirmed, some inconsistency |
| 5 | Improbable. Contradicted by other information |
| 6 | Cannot be judged |

A rival's published price list is A1. A reseller's claim about that rival's
unpublished discounting is C3 until a second, unrelated source supports it.

## Analysis and production

Covered in [chapter 4](04-analysis-and-judgment.md) and
[chapter 5](05-products-and-cadence.md). The one rule that belongs here: the
product is written for the decider's decision, in the decider's time budget. An
excellent analysis delivered as a 40-page deck to someone with nine minutes is a
failed product.

## Feedback: closing the loop

Record four things after every decision the intelligence touched:

1. What we judged, and at what confidence.
2. What was decided.
3. What actually happened, checked at a set date.
4. Which evidence turned out to be load-bearing, and which was noise.

Keep this in one file per KIT. After a year it becomes the most valuable asset
the function owns, because it tells you which of your sources and which of your
analysts are actually calibrated. See
[chapter 4](04-analysis-and-judgment.md) on calibration.

## Where the cycle breaks

| Break | Symptom | Fix |
| --- | --- | --- |
| No decision named | Reports read as newsletters. Nobody asks follow-ups | Refuse requests without a decision header |
| Collection without analysis | Volume rises, judgments stay absent. The analyst becomes a librarian ([PMA][pma-fail]) | Cap collection time at 50% of project hours |
| Analysis without delivery | Good work sits in a drive. Forrester-cited figure: over 90% of customer intelligence becomes unfindable within 90 days ([via PMA][pma-fail], vendor-cited) | Push, do not publish. Named recipient, dated |
| No feedback | The same wrong assumptions recur | Quarterly review of judgments against outcomes |
| Unclear stakeholders | Products serve nobody in particular | One named consumer per recurring product ([Contify][contify-problems]) |
| Paralysis by analysis | Detailed reports, no recommendation | Force a judgment and a confidence level in every product ([Kompyte][kompyte-pitfalls]) |

## Cadence evidence

Frequency correlates strongly with impact in the field's longest-running
benchmark survey. In Crayon's 2026 State of Competitive Intelligence, 56% of
teams share intelligence with sales weekly or faster, and 79% of teams sharing
weekly report revenue impact against 41% of teams on a monthly or slower cadence.
See [Crayon 2026][crayon-2026].

Caveats worth stating every time you cite this: it is a vendor survey of
self-selected respondents, the outcome is self-reported, and the direction of
causation is unproven. Teams that are already good at this probably also publish
more often. Use it as a prior, not as proof.

---

[map-kit]: https://www.ismpp-newsletter.com/2019/11/13/converting-insight-to-action-key-aspects-of-competitive-intelligence-for-strategic-planning/
[pma-fail]: https://www.productmarketingalliance.com/why-competitive-intelligence-programs-fail-and-what-to-do-about-it/
[contify-problems]: https://www.contify.com/resources/blog/3-common-mci-problems-and-their-solutions/
[kompyte-pitfalls]: https://www.kompyte.com/blog/top-ci-pitfalls-to-avoid/
[crayon-2026]: https://www.crayon.co/state-of-competitive-intelligence-2026
