# 8. What Changed by 2026

## The short version

Research agents made collection and first-draft synthesis fast and cheap. They
did not make verification cheap. The bottleneck moved from finding evidence to
deciding what is true. Every practical change below follows from that one shift.

## Agentic research arrived in the professional stack

AlphaSense launched **Deep Research** on 10 June 2025, an agent that runs
multi-step research over the company's corpus of more than 500 million business
and financial documents: equity research, earnings calls, expert-call
transcripts, filings, news, and, for enterprise customers, internal documents.
It produces company and industry primers, screening work, and meeting briefings
with citations, in minutes ([AlphaSense][as-dr]).

The general-purpose equivalents from the large model providers shipped over the
same period and now do the open-web version of the same job.

What this changed in practice:

| Task | Before | Now |
| --- | --- | --- |
| Industry primer, first draft | 2 to 5 analyst days | Under an hour, then a day of checking |
| Finding the relevant passage across 200 filings | Hours of search | Minutes |
| Competitor profile refresh | Half a day | Automated draft, analyst edits |
| Meeting brief | Often skipped | Routine |
| Deciding whether a claim is true | Analyst judgment | Analyst judgment, unchanged |

The last row is the whole story.

## Adoption, measured

| Measure | Figure | Period | Source |
| --- | --- | --- | --- |
| CI teams using AI to generate sales-facing competitive content | 80%, up from 61% in 2025 and 25% in 2024 | 2026 | [Crayon 2026][crayon] |
| CI teams running AI agents in production or pilot | 50%, with another 14% planning within a year | 2026 | [Crayon 2026][crayon] |
| Teams with agents in the sales motion reporting revenue impact | 82% versus 42% without | 2026 | [Crayon 2026][crayon] |
| Alternative-data buyers using AI for productivity and workflow | 66% | 2025 to 2026 | [Neudata][neudata] |
| Alternative-data buyers using AI for investment strategy | 31% | 2025 to 2026 | [Neudata][neudata] |

The gap between 66% and 31% in the last two rows is the most informative number
in the table. Firms trust these systems to speed up work far more than they
trust them to decide anything.

## The reliability ceiling

Model factuality improved a great deal and remains far from sufficient for
unchecked publication. Reported rates vary widely by benchmark, which is itself
the finding: no single number describes this.

| Measure | Reported figure | Source |
| --- | --- | --- |
| Frontier model hallucination across test suites | 4% to 19%, against 15% to 45% in 2024 | [Digital Applied][da-hall] |
| Worst frontier citation accuracy in a 5,000-prompt study | 19.1% | [Digital Applied][da-hall] |
| Best score on the FACTS factuality benchmark | 68.8, meaning wrong more than 30% of the time | [Digital Applied][da-hall] |

Read these as orders of magnitude, not as measurements. They come from
aggregator sites, benchmarks differ in construction, and results move month to
month. The robust conclusion survives the imprecision: **an unverified
machine-written citation is not evidence.**

Purpose-built evaluations for research agents now exist, including
ResearchRubrics and FinDeepResearch, which score deep-research agents on
rubric-based and financial-analysis tasks ([ResearchRubrics][rr],
[FinDeepResearch][fdr]). Use them to choose tools. Do not use them to skip
checking.

## Synthetic respondents: useful, oversold

Synthetic respondents are model-generated personas that answer research
questions in place of people.

What the evidence supports:

- A Stanford study in 2024 found agents built from rich real interviews matched
  a person's own survey answers roughly 85% as well as that person matched their
  own answers two weeks later.
- Peer-reviewed work also finds that synthetic respondents **collapse variance**
  and can **flip the sign** of key relationships. Even when explicitly asked for
  diverse personas, outputs cluster around a narrow stereotypical range.

Both findings are summarised in [SYMAR's practical guide][symar]. The industry
position is consistent across ESOMAR, GreenBook, Bain, NIQ, and Kantar: treat
synthetic research as a supplement that must be validated against real humans,
not a replacement. The ICC/ESOMAR Code introduced an official definition of
synthetic data in June 2025, and both ESOMAR and the Market Research Society have
signalled formal guidance with minimum validation requirements.

Defensible uses today:

| Use | Why it works |
| --- | --- |
| Pre-testing a questionnaire before it goes to humans | Catches ambiguous wording cheaply |
| Generating hypotheses to test with real respondents | Failure costs nothing |
| Rehearsing an objection or a buying-committee conversation | The output is a script to prepare against, not a finding |
| Filling a small gap in an otherwise human sample | Only with the share disclosed in the product |

Indefensible: sizing a market, setting a price, or claiming a preference share
from synthetic responses alone. The variance collapse means you will get a
confident answer that is wrong in a predictable direction.

## The data-quality arms race got worse

Covered in detail in [chapter 3](03-sources-and-collection.md). The 2026 summary:
roughly 31% of raw survey responses show some form of fraud, average discard
rates of 38% and up to 70%, and, as of late 2025, published work by Sean Westwood
in PNAS demonstrating an AI agent that passed as a human respondent while
evading every detection method then in use ([iMotions][imotions]).

The strategic consequence: **primary research got more expensive in real terms,
and secondary evidence got cheaper.** Rebalance accordingly. Fewer, better
primary studies. More systematic use of filings, behaviour, and internal records.

## What to automate and what not to

| Automate | Keep human |
| --- | --- |
| Source monitoring and change detection | Deciding which questions matter |
| Extraction and normalisation from documents | Grading source reliability |
| First-draft summaries and profiles | The judgment and its confidence level |
| Translation and transcription | Choosing between competing hypotheses |
| Formatting and distribution | Anything a customer or regulator will read |
| Finding the passage in a 300-page filing | Deciding the passage means what it appears to mean |

## A verification protocol for AI-assisted intelligence

Adopt this as a written standard. It is the cheapest quality control available.

1. **Claim-level sourcing.** Every load-bearing claim carries a source and a
   retrieval date. No source, no claim.
2. **Open the source.** Never cite a document the agent found but nobody opened.
   Machine-generated citations point to real documents that do not always say
   what the summary claims.
3. **Two independent origins for load-bearing numbers.** See the triangulation
   rule in [chapter 3](03-sources-and-collection.md).
4. **Keep the raw quote.** Store the exact sentence that supports the claim,
   next to the claim.
5. **Date every figure.** A number without a period is not evidence.
6. **Mark the tier.** Label each claim as directly sourced, inferred, or
   assumed. Readers weigh them differently and deserve the chance to.
7. **Declare AI involvement.** State in the product where machine assistance was
   used. This is increasingly a compliance matter as well as an honesty one.

## What the shift means for how you staff

- **Collection headcount falls in value.** Monitoring, extraction, and
  summarising are now commodity capabilities.
- **Judgment headcount rises in value.** The scarce person is the one who can
  say "this is probably wrong, and here is why" about a fluent, well-cited draft.
- **A new role appears: evidence engineer.** Someone who owns provenance,
  retrieval quality, and the archive. In practice this is the person who makes
  the difference between an agent that is useful and one that is dangerous.
- **Calibration training becomes worth paying for.** When drafting is free, the
  differentiator is being right, and being right is trainable. See
  [chapter 4](04-analysis-and-judgment.md).

## What did not change

- Requirements still decide quality. A fast answer to the wrong question is
  worse than no answer, because it is more convincing.
- The legal perimeter is unchanged by speed, and in Europe it tightened. See
  [chapter 7](07-law-and-ethics.md).
- Buyers still tell you things no dataset contains. Twenty good interviews still
  beat a large corrupted survey.
- Decisions are still made by people who have nine minutes.

---

[as-dr]: https://www.alpha-sense.com/press/alphasense-launches-deep-research-automating-in-depth-analysis-with-agentic-ai-on-high-value-content
[crayon]: https://www.crayon.co/state-of-competitive-intelligence-2026
[neudata]: https://www.neudata.co/blog/state-of-the-alternative-data-market-2026
[da-hall]: https://www.digitalapplied.com/blog/ai-model-hallucination-rate-benchmarks-2026-study
[rr]: https://arxiv.org/pdf/2511.07685
[fdr]: https://arxiv.org/pdf/2510.13936
[symar]: https://www.symar.ai/blog/synthetic-market-research-practical-guide/
[imotions]: https://imotions.com/blog/insights/thought-leadership/fraud-in-online-surveys/
