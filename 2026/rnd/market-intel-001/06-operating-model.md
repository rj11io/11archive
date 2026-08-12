# 6. Operating Model

## Where the function sits

There is no correct home. There is a correct match between where it sits and
what it is asked to do.

| Home | Serves best | Fails at |
| --- | --- | --- |
| **Strategy or corporate development** | Entry, acquisition, long-horizon threats | Sales speed. Sellers will not wait for a quarterly cycle |
| **Product marketing** | Battlecards, win/loss, positioning, launches | Structural and macro questions. Horizon rarely exceeds two quarters |
| **Revenue operations** | Deal-level competitive support, pipeline signals | Anything that is not measurable in the CRM |
| **Procurement** | Supplier markets, category strategy, cost and risk | Demand-side and buyer questions |
| **Investment team (VC or PE)** | Thesis development, sourcing, commercial diligence | Nothing, if resourced. This is the natural home in an investment firm |
| **Standalone, reporting to the CEO** | Cross-cutting questions and genuine early warning | Getting used, unless the CEO actually consumes it |

Practical rule: put it where the decisions are, then give it a standing line to
one other function so it does not become captive to a single reader.

## Roles

A small team covers five jobs, sometimes with one person doing several.

| Role | Owns |
| --- | --- |
| **Head of intelligence** | Requirements, the KIT list, the relationship with deciders, the quality bar |
| **Analyst** | Analysis, judgment, products. This is the scarce role |
| **Collection and tooling** | Sources, feeds, scrapers, vendor contracts, the archive |
| **Field network** | Structured access to sellers, support, partners, and customers |
| **Compliance sponsor** | The ethics policy and the escalation path. Usually part-time legal |

The single most common staffing error is hiring collectors and calling them
analysts. Collection is increasingly automatable. Judgment is not.

## Benchmarks

All figures below come from vendor surveys of self-selected respondents. They
are the best public numbers available and they are not neutral.

| Measure | Figure | Period | Source |
| --- | --- | --- | --- |
| Companies over 1,000 staff with a dedicated CI program | 94% | 2025 | Crayon, cited in [UserIntuition][ui-pricing] |
| Average CI team size at those companies | 4.2 full-time equivalents | 2025 | Crayon, cited in [UserIntuition][ui-pricing] |
| Teams running a dedicated CI platform | 66.7%, up from roughly one third in 2022 | 2026 | [Crayon 2026][crayon] |
| Teams tracking specific KPIs | 60.5%, up from 30% in 2022 | 2026 | [Crayon 2026][crayon] |
| Teams with an executive sponsor in sales | 56.7%, flat for years | 2026 | [Crayon 2026][crayon] |
| Teams sharing intelligence weekly or faster | 56% | 2026 | [Crayon 2026][crayon] |
| Teams reporting a competitive win-rate increase | 49.6% | 2026 | [Crayon 2026][crayon] |
| Teams reporting more deals are competitive than a year ago | 57.5% | 2026 | [Crayon 2026][crayon] |
| Teams where at least half of opportunities are competitive | 70% | 2026 | [Crayon 2026][crayon] |

### What correlates with reported impact

| Condition | Reported revenue impact | Source |
| --- | --- | --- |
| KPIs plus an executive sponsor | 88% versus 29% without both | [Crayon 2026][crayon] |
| KPIs, platform, and executive sponsor together | 90% versus 25% with none | [Crayon 2026][crayon] |
| AI agents in the sales motion | 82% versus 42% without | [Crayon 2026][crayon] |
| Weekly cadence versus monthly or slower | 79% versus 41% | [Crayon 2026][crayon] |

Read these as a checklist of what mature programs have, not as a causal recipe.
The honest reading: an executive sponsor, tracked KPIs, and a weekly rhythm are
the visible signature of a program that leadership already takes seriously.
Buying a platform does not create the sponsor.

## Cost bands

| Line | Typical range | Note |
| --- | --- | --- |
| CI or MI monitoring platform | US$25k to US$100k per year | [UserIntuition][ui-pricing] |
| Consulting or expert-network engagement | US$15k to US$500k or more per engagement | [UserIntuition][ui-pricing] |
| Internal analyst, fully loaded | US$120k to US$200k or more | [UserIntuition][ui-pricing] |
| Syndicated data subscription | Highly variable, five to seven figures | Negotiate. Average clients per alternative dataset fell from 25 to 20 in 2025, so buyers have leverage ([Neudata][neudata]) |
| Total program, mid-size B2B company | US$25k to US$200k or more per year | [UserIntuition][ui-pricing] |

Build-versus-buy heuristic: buy monitoring, build judgment. Monitoring is a
commodity with real economies of scale. Judgment about your market is the thing
you cannot outsource without losing the point.

## The tool stack, by layer

Name the layer first. Vendors sell across layers and the categories blur.

| Layer | Job | Representative tools |
| --- | --- | --- |
| **Monitoring** | Watch defined sources, alert on change | Crayon, Klue, Kompyte, Contify |
| **Aggregated research corpus** | Search across filings, calls, broker research, expert transcripts | AlphaSense |
| **Digital and web signals** | Traffic, ads, SEO, app data | Similarweb, Semrush, Sensor Tower |
| **Private-market data** | Companies, funding, investors, deals | PitchBook, Crunchbase, Dealroom, Tracxn, CB Insights |
| **Primary research** | Surveys, interviews, expert calls | Panels, expert networks, win/loss vendors such as Clozd and Klue Win-Loss |
| **Alternative data** | Transactions, geolocation, workforce, satellite | Vendor-specific. Sourced via marketplaces or brokers such as Neudata |
| **Knowledge store** | Keep what you learned findable | Wiki, vector store, or the CI platform's own repository |
| **Delivery** | Get it to the reader where they work | Chat, CRM, email, enablement tools |

Categories and vendor placements per [Improvado][improvado],
[Infomineo][infomineo], and the platform comparisons in [Unkover][unkover].

### Private-market data: a specific caution

For an investment team, this layer is the one where source choice changes
conclusions.

- **PitchBook** relies heavily on manual research staff and is the institutional
  default for verified deal, fund, and financial records.
- **Crunchbase** blends community contributions, automated collection from press
  releases and filings, and editorial review. Broader, less consistent.
- **Dealroom** is deepest on European early-stage, including pre-seed rounds
  that US-centric databases miss.
- **Tracxn** goes deepest on sector taxonomies and on India and Southeast Asia.

See [PitchBook's own comparison][pb-compare], [Crustdata][crustdata], and the
[Dealroom versus PitchBook comparison][dr-pb]. Note that the first is published
by one of the vendors compared.

Practical consequence: a market map built from one database will systematically
miss whatever that database under-covers. If the map matters, build it from two
and reconcile the difference. The reconciliation itself is usually informative.

## Metrics

Market intelligence has a measurement problem that never fully goes away: its
best outcomes are counterfactual. A threat neutralised early looks like nothing
happening.

Measure four things, and accept that the first is the important one and the
hardest.

| Metric | Definition | How to capture |
| --- | --- | --- |
| **Decision influence** | Share of material decisions where an MI product was cited as an input | Ask the decider at the point of decision. Log it |
| **Decision velocity** | Time from question raised to decision taken | Timestamp the request and the decision |
| **Early warnings delivered** | Threats or opportunities surfaced before they appeared in sales data | Count and review at quarter end |
| **Judgment accuracy** | Scored probabilistic judgments against outcomes | Quarterly scoring of the judgment log |

Secondary, easier, and less meaningful: request throughput, product usage,
battlecard views, win rate on tracked competitors, cost avoided.

Frameworks that group these as risk avoided, speed gained, and decision quality
improved: [Beroe][beroe], [Valona][valona], [UserIntuition][ui-roi].

A caution on win-rate attribution. Win rate moves for many reasons. Attributing
it to the intelligence program requires either a holdout group or a long enough
series to see the trend break. Most companies have neither and claim the credit
anyway.

## Maturity ladder

| Level | Description | Tell |
| --- | --- | --- |
| 0. Ad hoc | Someone Googles the competitor before a big meeting | No record exists a month later |
| 1. Reactive | Requests arrive, someone answers them | No requirements list. Queue is first-in-first-out |
| 2. Programmatic | Fixed products, fixed cadence, a named owner | A battlecard set exists and is maintained |
| 3. Decision-linked | Every product names a decision, a decider, and a date. Outcomes recorded | A judgment log exists |
| 4. Anticipatory | Tripwires set in advance. Early warning fires before the event | Leadership has changed a plan because of an alert |

Most corporate functions sit at level 1 or 2. The step from 2 to 3 costs almost
nothing in tools and almost everything in discipline.

## Failure modes and fixes

| Failure | Symptom | Fix |
| --- | --- | --- |
| No requirements | Everything is urgent, nothing is prioritised | Publish a KIT list. Review it quarterly with the sponsor |
| Librarian trap | High output, no judgments ([PMA][pma]) | Cap collection at half of project time. Require a judgment in every product |
| No sponsor | Products are read but never acted on | Get a named executive sponsor or stop the program |
| Tool-first | A platform was bought before the questions were written | Write the KIT list first. The platform serves it |
| Findability collapse | Work is redone because nobody could find the old answer ([PMA][pma]) | Tag by decision and question. Assign an archivist |
| Vanity metrics | Reporting article counts and alert volumes | Replace with decision influence and judgment accuracy |
| Ethics drift | Grey-area collection creeps in under deal pressure | Written policy, named escalation path, training. See [chapter 7](07-law-and-ethics.md) |

---

[crayon]: https://www.crayon.co/state-of-competitive-intelligence-2026
[ui-pricing]: https://www.userintuition.ai/posts/competitive-intelligence-pricing/
[ui-roi]: https://www.userintuition.ai/reference-guides/how-to-measure-competitive-intelligence-roi/
[neudata]: https://www.neudata.co/blog/state-of-the-alternative-data-market-2026
[improvado]: https://improvado.io/blog/marketing-intelligence-tools
[infomineo]: https://infomineo.com/industries/technology-telecommunication/software/best-ai-powered-competitive-intelligence-tools-in-2026/
[unkover]: https://unkover.com/blog/competitive-intelligence-tools/
[pb-compare]: https://pitchbook.com/compare/pitchbook-vs-crunchbase
[crustdata]: https://crustdata.com/blog/7-best-startup-databases-for-investors-in-2026
[dr-pb]: https://signals.gitdealflow.com/vs/dealroom-vs-pitchbook
[beroe]: https://www.beroeinc.com/resource-centre/insights/roi-market-intelligence-how-better-insights-drive-enterprise-value
[valona]: https://valonaintelligence.com/resources/blog/how-to-measure-the-roi-of-intelligence
[pma]: https://www.productmarketingalliance.com/why-competitive-intelligence-programs-fail-and-what-to-do-about-it/
