# 7. Law and Ethics

This chapter is a working map, not legal advice. Rules differ by country and by
industry, and several of the cases below are still moving. Get counsel before
anything near a line.

## The one rule that decides most cases

**How you obtained the information matters more than what the information is.**

The same fact can be lawful or unlawful depending on the route. A competitor's
manufacturing cost, worked out by buying their product and taking it apart, is
lawful nearly everywhere. The same number, obtained by an investigator
pretending to be their employee, is not.

## Trade secrets: the outer boundary

Both major legal systems landed in a similar place in 2016.

- **United States.** The Economic Espionage Act of 1996, amended by the Defend
  Trade Secrets Act of 2016, gives a federal civil claim for misappropriation.
- **European Union.** Directive (EU) 2016/943 harmonises trade-secret protection
  across member states, and member states may go further.

Both define a trade secret the same way in substance: information the owner took
reasonable steps to keep secret, which has economic value because it is not
generally known or readily ascertainable ([Osborne Clarke][oc-ts],
[EUR-Lex, Directive 2016/943][eurlex-ts]).

### What both systems treat as lawful acquisition

| Route | Status |
| --- | --- |
| **Reverse engineering** a lawfully obtained product | Expressly permitted under both the DTSA and the EU Directive |
| **Independent derivation** | Lawful |
| **Observation of what is publicly visible** | Lawful |
| **Other honest commercial practices** (EU wording) or other lawful means (US wording) | Lawful |

The EU Directive is explicit that reverse engineering and parallel innovation
must be guaranteed, because a trade secret is not an exclusive intellectual
property right ([Osborne Clarke][oc-ts]).

### What is unlawful

Acquiring the secret through improper means: theft, bribery,
misrepresentation, breach or inducement of a duty of confidence, or espionage.
Note that inducing someone else's breach counts. Asking a rival's employee to
share confidential material puts you inside the prohibition even though you did
not take anything yourself.

## The ethics line, drawn by real cases

| Case | What happened | Outcome |
| --- | --- | --- |
| **HP pretexting, 2006** | HP's investigators impersonated board members and journalists, in some cases using their Social Security numbers, to obtain phone records while hunting a boardroom leak. Targets included nine journalists, nine directors, over twenty employees or contractors, and a journalist's children | Chair resigned, congressional hearings, criminal charges, a US$14.5 million settlement with California, and a new federal law, the Telephone Records and Privacy Protection Act of 2006 ([Wikipedia][wiki-hp], [CIO timeline][cio-hp], [RCFP][rcfp-hp]) |
| **P&G and Unilever, 2001** | P&G staff went through Unilever's rubbish looking for competitive documents. P&G disclosed it themselves and called it a rogue operation | At least three staff fired, roughly US$10 million paid to Unilever ([CBS News][cbs-pg]) |

Both cases share a pattern worth internalising: the collection was performed by
people who believed they were serving the company, under pressure, without a
clear written boundary. The fix is a written policy plus a named escalation path,
not exhortation.

## The SCIP Code of Ethics

The most-cited standard in the field. Reproduced here from a secondary source,
because scip.org blocks automated retrieval; verify against the primary page
before quoting it formally ([Octopus Intelligence][octopus-scip]).

1. **Elevate the profession.** Continually strive to increase the recognition
   and respect of the profession.
2. **Always in compliance.** Comply with all applicable laws, domestic and
   international.
3. **Transparent.** Accurately disclose all relevant information, including
   one's identity and organisation, prior to all interviews.
4. **Conflict-free.** Avoid conflicts of interest in fulfilling one's duties.
5. **Honest.** Provide honest and realistic recommendations and conclusions.
6. **Act as an ambassador.** Promote this code within one's company, with
   third-party contractors, and within the profession.
7. **Strategically aligned.** Adhere to one's company policies, objectives, and
   guidelines.

Clause 3 is the operative one and the one most often broken. It rules out
calling a competitor's support line pretending to be a customer, and it rules out
attending a rival's webinar under a false name and employer. If your collection
method depends on the other party not knowing who you are, stop.

## Web scraping

Two US decisions define the current position.

**hiQ Labs v LinkedIn.** The Ninth Circuit narrowed the Computer Fraud and Abuse
Act so that it does not reach automated collection of data that is publicly
accessible without authentication ([FBM][fbm-hiq]). Note the case's own
counter-example: hiQ did get into trouble for hiring contractors to create fake
LinkedIn accounts to reach logged-in data.

**Meta Platforms v Bright Data.** On 23 January 2024, Judge Edward Chen of the
Northern District of California granted summary judgment for Bright Data. The
reasoning that matters: Meta's terms govern "your use" of its products, and
Bright Data did not "use" Facebook when it scraped public logged-out pages after
terminating its accounts ([Quinn Emanuel][qe-bd], [FBM][fbm-bd]).

### The four lines

| Line | Rule |
| --- | --- |
| **Authentication** | Do not bypass a login. Do not create fake accounts. This is where both defendants above got into trouble |
| **Personal data** | GDPR and CCPA apply to scraped personal data whether or not it was publicly visible |
| **Copyright** | Extract facts. Do not republish creative expression |
| **Harm** | Respect rate limits. Causing degradation converts a civil argument into a much worse one |

### GDPR and scraping

The European position tightened sharply.

- **EDPB Opinion 28/2024** recognised legitimate interest under Article 6(1)(f)
  as a viable basis for AI model development, subject to a rigorous three-part
  test ([IAPP][iapp-edpb]).
- **EDPB Guidelines 03/2026 on web scraping in the context of generative AI**,
  adopted July 2026, are the first comprehensive GDPR framework for large-scale
  extraction of publicly available data. The Board confirmed that GDPR applies
  whenever scraping involves personal data, regardless of public visibility, and
  that consent is generally not a viable basis for scraping at scale
  ([EDPB][edpb-news], [Reed Smith][rs-edpb]).

Practical consequence for a market intelligence team in Europe: scraping company
pages, prices, and product documentation is low risk. Scraping named individuals,
their profiles, or their posts requires a documented legitimate-interest
assessment, data minimisation before collection, and a retention decision. Write
the assessment before you collect, not after someone asks.

## Material non-public information and alternative data

If your organisation trades securities, or advises anyone who does, this section
is the one that ends careers.

- The SEC's Division of Examinations published a risk alert describing
  deficiencies it observed in advisers' use of alternative data and expert
  networks, with MNPI as the central concern ([Akin][akin-sec]).
- In the Primary Global Research matter, the SEC charged hedge funds and
  portfolio managers with trading on MNPI obtained from public-company insiders
  who were moonlighting as expert-network consultants, alleging more than
  US$30 million in illicit profits ([FieldSignal][fs-mnpi]).

Expert networks were never banned. The channel is not the problem. The control
over what flows through it is ([FieldSignal][fs-mnpi]).

### Minimum controls

| Control | Detail |
| --- | --- |
| **Pre-clearance** | Approve the expert and the topic list before the call |
| **Chaperone or recording** | For any call touching a covered issuer |
| **Scope script** | Read at the start: industry-level only, nothing confidential to a current or former employer |
| **Employment screen** | Screen out current employees, and recent leavers, of issuers you hold or are researching |
| **Vendor contract terms** | MNPI clauses, with liability on the vendor if MNPI is found in their data ([Daloopa][daloopa], [Lowenstein][lowenstein]) |
| **Data provenance diligence** | Written answers on origin, consent, and aggregation for every dataset ([chapter 3](03-sources-and-collection.md)) |
| **Restricted list integration** | Data acquisition decisions checked against the firm's restricted list |

Generally acceptable data types, when properly sourced: satellite images of
publicly visible areas, aggregated and anonymised consumer transaction data,
public filings, and public social media content ([Daloopa][daloopa]).

## Antitrust: competitor information and pricing

This is the fastest-moving area and the one most market intelligence teams
underestimate.

The Department of Justice announced a proposed settlement with **RealPage** on
24 November 2025, resolving allegations that RealPage's revenue-management
product used competing landlords' data in an algorithm producing pricing
recommendations. The settlement bars RealPage from using competitors'
non-public data in that product and limits model training to historic,
backward-looking non-public data at least twelve months old
([Wilson Sonsini][ws-realpage], [Hogan Lovells][hl-realpage],
[Reed Smith][rs-realpage]).

The enforcement posture, as read by counsel: the DOJ is not against algorithmic
pricing tools as such. It is against tools that pool non-public competitor data
and produce coordinated outputs. Risk is highest when the data is current or
forward-looking, non-public, competitively sensitive, and used at runtime in a
pricing decision. Risk rises further when the recommendation is applied
automatically with no human override ([Hogan Lovells][hl-realpage],
[Snell & Wilmer][sw-algo]).

### Rules for a market intelligence team

| Do | Do not |
| --- | --- |
| Collect published prices, public rate cards, public tender results | Exchange current or forward-looking non-public pricing with a competitor, directly or through any intermediary |
| Use aggregated, historic, anonymised benchmarks from a neutral third party | Contribute your own forward-looking pricing into a pool that feeds competitors' pricing |
| Keep a human decision step between any recommendation and a price change | Let a tool trained on rivals' non-public current data set prices automatically |
| Document the provenance of every input to a pricing model | Assume a vendor's data is clean because the vendor says so |

Trade associations and benchmarking exercises deserve particular care. Sharing
historic, aggregated, anonymised data through a neutral administrator is the
conventional safe design. Anything current, disaggregated, or attributable is not.

## Other regimes to keep in view

- **EU Data Act.** In force since January 2024, with core obligations applying
  from 12 September 2025. It creates data access and portability rights around
  connected products and cloud services, and it may open datasets that were
  previously locked ([Skadden][skadden-da], [Debevoise][deb-da]).
- **EU AI Act.** Transparency obligations touch how you disclose AI-generated
  analysis and how you document data used in models
  ([Truescreen][ts-aiact]).
- **Sector rules.** Pharmaceutical, defence, financial services, and healthcare
  each impose their own limits on competitor contact and on data handling. Check
  yours before designing collection.

## A one-page policy you can actually enforce

**Always allowed**

- Public sources, published prices, filings, patents, job ads, public
  documentation, logged-out pages
- Buying a competitor's product and testing it, including taking it apart
- Attending public events and identifying yourself honestly
- Interviewing anyone after disclosing who you are and who you work for
- Talking to your own customers, prospects, partners, and former buyers

**Allowed with controls**

- Expert-network calls, with pre-clearance and a scope script
- Purchased alternative data, after provenance and MNPI diligence
- Scraping public pages, within rate limits and with a legitimate-interest
  assessment where personal data is involved
- Surveys and interviews with a competitor's customers, where the sponsor's
  identity is disclosed or the design is cleared by counsel

**Never**

- Misrepresenting who you are or who you work for
- Creating fake accounts, or bypassing any login or paywall
- Asking anyone to breach a confidentiality obligation
- Taking physical material, including from bins
- Recording without the consent the local law requires
- Trading, or passing to anyone who trades, on non-public information about a
  specific issuer
- Pooling current or forward-looking non-public pricing with competitors

**Escalation.** Any grey case goes to a named person before collection, not
after. Write the name in the policy.

---

[oc-ts]: https://www.osborneclarke.com/insights/trade-secrets-harmony-us-europe
[eurlex-ts]: https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX%3A32016L0943
[wiki-hp]: https://en.wikipedia.org/wiki/Hewlett-Packard_spying_scandal
[cio-hp]: https://www.cio.com/article/260587/hp-spying-scandal-a-timeline.html
[rcfp-hp]: https://www.rcfp.org/hp-pay-145-million-settlement-pretexting-scandal/
[cbs-pg]: https://www.cbsnews.com/news/thou-shalt-not-steal-thy-competitors-secrets/
[octopus-scip]: https://www.octopusintelligence.com/scip-competitive-intelligence-code-of-ethics/
[fbm-hiq]: https://www.fbm.com/publications/what-recent-rulings-in-hiq-v-linkedin-and-other-cases-say-about-the-legality-of-data-scraping/
[qe-bd]: https://www.quinnemanuel.com/the-firm/news-events/client-alert-what-does-the-meta-v-bright-data-summary-judgment-ruling-mean-for-web-scraping/
[fbm-bd]: https://www.fbm.com/publications/major-decision-affects-law-of-scraping-and-online-data-collection-meta-platforms-v-bright-data/
[iapp-edpb]: https://iapp.org/news/a/edpb-opinion-sheds-light-on-lawful-ai-training-dpa-discretion
[edpb-news]: https://www.edpb.europa.eu/news/edpb-sheds-light-on-anonymisation-and-web-scraping-for-generative-ai-and-adopts-final-version_en
[rs-edpb]: https://www.reedsmith.com/our-insights/blogs/technology-law-dispatch/102nbqu/edpb-web-scraping-guidelines-for-ai-making-the-impossible-possible/
[akin-sec]: https://www.akingump.com/en/insights/alerts/sec-division-of-examinations-finally-speaks-on-alternative-data
[fs-mnpi]: https://fieldsignalhq.com/resources/blog/mnpi-and-expert-networks-what-pe-and-hedge-fund-buyers-need-to-know
[daloopa]: https://daloopa.com/blog/analyst-best-practices/the-growing-impact-of-alternative-data-on-hedge-fund-performance
[lowenstein]: https://www.lowenstein.com/news-insights/publications/articles/key-considerations-for-alternative-data-and-ai-vendors-to-investment-firms-demonstrating-compliance-in-the-face-of-an-evolving-regulatory-environment
[ws-realpage]: https://www.wsgr.com/en/insights/doj-settles-its-algorithmic-price-fixing-case-against-realpage.html
[hl-realpage]: https://www.hoganlovells.com/en/publications/proposed-doj-settlement-provides-guidance-on-use-of-competitive-information
[rs-realpage]: https://www.reedsmith.com/our-insights/blogs/viewpoints/102lwqx/algorithmic-pricing-under-pressure-dojs-realpage-settlement-changes-the-rules-f/
[sw-algo]: https://www.swlaw.com/publication/algorithmic-pricing-under-the-antitrust-microscope-doj-and-ftc-sharpen-their-enforcement-posture/
[skadden-da]: https://www.skadden.com/insights/publications/2025/06/eu-data-act
[deb-da]: https://www.debevoisedatablog.com/2025/10/09/eu-data-act-key-provisions-and-what-you-need-to-know/
[ts-aiact]: https://truescreen.io/articles/eu-ai-act-transparency-obligations-businesses/
