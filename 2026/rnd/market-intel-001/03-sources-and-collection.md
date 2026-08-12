# 3. Sources and Collection

## The source ladder

Rank sources by cost, delay, reliability, and legal risk. Work down the ladder,
not up. Most teams reach for expensive primary research before they have read
the free filings.

| Tier | Source class | Examples | Cost | Delay | Reliability | Legal risk |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Official statistics | Eurostat, US Census, BLS, OECD, World Bank, UN Comtrade | Free | Weeks to years | High for aggregates, poor for niches | None |
| 2 | Mandatory filings | SEC EDGAR, Companies House, patent offices, court dockets, EU tenders, customs records | Free to low | Days to months | High, and legally attestable | None |
| 3 | Company-published | Pricing pages, docs, changelogs, job ads, earnings calls, investor decks | Free | Live | High for facts, biased for framing | Low if public and logged out |
| 4 | Trade press and news | Sector titles, local press, conference coverage | Low | Days | Mixed. Often recycles company claims | None |
| 5 | Syndicated and panel | Nielsen, Circana, Similarweb, Sensor Tower, Semrush | Medium to high | Days to weeks | Good for direction, weak on levels | Low |
| 6 | Alternative data | Card transactions, geolocation, satellite, web-scraped, app telemetry, job postings | High | Days | Varies wildly by dataset | Medium. Consent chain and MNPI |
| 7 | Primary research | Surveys, interviews, expert networks, win/loss, mystery shopping | High | Weeks | Highest if designed well | Medium. Disclosure and MNPI rules |
| 8 | Internal | CRM, sales call notes, support tickets, churn reasons, lost-deal codes | Near zero | Live | Underused, often the best evidence you own | None |

Tier 8 deserves a note. Most companies own a large, current, unexploited record
of what buyers said, in their CRM and support systems. It costs nothing, it is
specific to your market, and nobody else has it. Mine it before buying anything.

## Government and institutional sources worth knowing

| Source | Best for |
| --- | --- |
| [Eurostat](https://ec.europa.eu/eurostat) | EU economy, trade inside and outside the EU, regional and social data, from 1960 |
| [US Census Bureau](https://www.census.gov) | US demographics, business patterns, industry statistics |
| [US Bureau of Labor Statistics](https://www.bls.gov) | US employment, wages, prices, productivity |
| [UN Comtrade](https://comtrade.un.org) | Detailed import and export flows for roughly 200 countries |
| [OECD Data](https://data.oecd.org) | Cross-country comparables across many sectors |
| [World Bank Open Data](https://data.worldbank.org) | Development, macro, and country indicators |

Standard limits. Official statistics are late, coarse, and organised by codes
(NACE in Europe, NAICS in North America) that rarely match how a modern market
actually segments. Use them for denominators and for sanity checks, not for
product-level questions.

## Signals: what leading indicators actually tell you

A signal is an observable proxy for something you cannot see directly. Each one
has a real predictive claim and a real limit. Both belong in your notes.

| Signal | What it indicates | Evidence and limits |
| --- | --- | --- |
| **Job postings** | Hiring intent, and ahead of that, growth | Changes in postings are positively associated with growth in headcount, SG&A, and one-year-ahead sales and earnings ([LinkUp][linkup]). Limits: postings get reposted, agencies duplicate, and "ghost" ads distort counts. Coverage is deep, with Revelio's COSMOS set at over 5 billion postings from over 1 million company sites ([Revelio][revelio]) |
| **Pricing page changes** | Packaging and segment strategy, often weeks before the announcement | Cheap and high signal. Limits: A/B tests and regional variants produce false positives. Diff daily and require two consecutive weeks before acting |
| **Web traffic estimates** | Direction of demand and channel mix | Panel-based estimates scale a sample to the whole site. Accuracy varies hugely: one SparkToro comparison rated Similarweb closest to Google Analytics among the major tools, while an Omniconvert study of 1,787 ecommerce sites found Similarweb overreported sessions by roughly 94% ([Collaborator][collab], [Omniconvert][omni]). Accuracy improves with site size. Never use levels. Use direction and only for large sites |
| **App downloads and ranks** | Consumer traction | Good for direction on consumer apps. Useless for B2B and for anything sold through enterprise agreements |
| **Patent filings** | R&D direction, 18 months late | Applications publish roughly 18 months after filing, so this is a lagging read on intent. Useful for capability mapping, not for early warning |
| **Customs and shipping records** | Physical supply chains, supplier relationships | Strong for goods, blind for services and software |
| **Headcount by function** | Where a rival is placing bets | Derived from public profile data. Limits: profile data is self-reported and stale, and coverage skews to white-collar roles in rich countries |
| **Review sites and support forums** | Product weak points, switching triggers | Excellent qualitative source for battlecards. Heavily skewed toward extremes and vulnerable to seeded reviews |

## The triangulation rule

**Two sources that share one origin are one source.**

Three trade articles all restating one company press release is a single data
point wearing three hats. Real triangulation means two or more sources with
genuinely independent origins, ideally collected by different methods.

Worked example. Claim: "rival X is entering the mid-market."

| Evidence | Origin | Independent? |
| --- | --- | --- |
| Their blog post announcing "solutions for growing teams" | Rival X | Origin 1 |
| TechCrunch article about the blog post | Rival X | Same origin. Not independent |
| Analyst note quoting the announcement | Rival X | Same origin. Not independent |
| 14 new job ads for "SMB Account Executive" in DACH | Rival X hiring behaviour | Origin 2. Independent |
| Two of your resellers report being asked to carry a cheaper tier | Channel | Origin 3. Independent |

Three origins, not five sources. That claim is now well supported.

## Primary research and its 2026 data-quality problem

Primary research is still the only way to learn what buyers think rather than
what they did. It has become materially harder to do well.

| Finding | Figure | Source |
| --- | --- | --- |
| Share of raw survey responses containing some form of fraud | Roughly 31% | Research Defender, cited in [iMotions][imotions] |
| Average share of collected data discarded for quality and panel fraud | 38%, and up to 70% for some | Kantar, cited in [iMotions][imotions] |
| AI agents passing as human respondents | An agent evaded every detection method then in use | Westwood, PNAS, late 2025, cited in [iMotions][imotions] |

Practical defences, in order of effect:

1. **Use identity-verified panels** rather than open links when the answer
   matters. Cost per complete rises. Usable data per euro rises more.
2. **Instrument the survey.** Attention checks, instructed-response items,
   completion-time floors, duplicate and geolocation checks, bot scoring.
3. **Treat open-ended answers as suspect.** Machine-written open ends are fluent,
   generic, and increasingly common. Read a sample by hand, always.
4. **Prefer interviews for high-stakes questions.** Twenty structured interviews
   beat a compromised n=800 survey. See the win/loss volumes in
   [chapter 5](05-products-and-cadence.md).
5. **Report your exclusion rate.** If you discarded 38% of responses, say so in
   the product. It changes how the reader should weigh the result.

The detection arms race has a second-order cost worth naming: aggressive bot
filters also remove real people who answer fast or oddly, which biases the
surviving sample in ways nobody has measured well.

## Expert networks

Paid calls with practitioners. The highest-signal source available during a
short diligence window, and the source with the most regulatory attention. See
[chapter 7](07-law-and-ethics.md) for the compliance requirements.

Use them for:

- How a buying process actually runs inside a specific kind of company
- Why a technology failed in production despite the vendor claims
- What a departed employee can lawfully describe about an industry, not about
  their former employer's confidential information

Do not use them to obtain a specific company's non-public financial or
operational data. That is the exact fact pattern that produced the Primary
Global Research enforcement actions.

## Alternative data: buy with a checklist

The category grew to roughly US$2.8bn in buy-side spend in 2025, up 17% year on
year, across 2,805 tracked datasets ([Neudata][neudata]). Average clients per
dataset fell from 25 to 20, which means supply is growing faster than demand and
buyers have leverage on price.

Before buying any dataset, get written answers to these:

| Question | Why it matters |
| --- | --- |
| Where does the raw data originate, and who consented? | Determines your GDPR and privacy exposure |
| Is any of it non-public information about a specific issuer? | Determines your MNPI exposure |
| What is the panel or sample, and how is it scaled to the universe? | Determines whether levels or only direction are usable |
| What is the history, and has the methodology changed? | Backfills that were recomputed under a new method are not a real history |
| What is the reporting lag and the revision policy? | Decides whether it can support early warning at all |
| Coverage by geography, segment, and company size? | Most datasets are strong in the US and thin everywhere else |
| Exclusivity and redistribution terms? | Decides whether the edge survives contact with your competitors |

Ask the vendor for a period where their data was wrong, and what they changed.
A vendor with no answer has not looked.

## Collection hygiene

- **Date everything.** A figure without a period is not evidence.
- **Keep the raw artefact.** Screenshot the pricing page, save the filing PDF,
  archive the job ad. Pages change and disappear.
- **Record the retrieval date** alongside the publication date.
- **Never launder a source.** If the number came from a vendor blog quoting a
  survey, cite the vendor blog, not the survey you have not read.
- **Log what you looked for and did not find.** Absence of evidence is evidence
  and it belongs in the record.

---

[linkup]: https://www.linkup.com/use-cases/the-market-reaction-to-job-listing-data
[revelio]: https://www.reveliolabs.com/job-postings-cosmos
[collab]: https://collaborator.pro/blog/research-semrush-similarweb-ahrefs
[omni]: https://www.omniconvert.com/blog/we-analyzed-1787-ecommerce-websites-similarweb-google-analytics-thats-we-learned/
[imotions]: https://imotions.com/blog/insights/thought-leadership/fraud-in-online-surveys/
[neudata]: https://www.neudata.co/blog/state-of-the-alternative-data-market-2026
