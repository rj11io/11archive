# 9. Build Guide: First 90 Days

For one person, or a small team, standing up a market intelligence function
from nothing. Assumes no platform purchase in the first 90 days. That is
deliberate.

## Day 0 to 15: decide what you are for

| Task | Output |
| --- | --- |
| Interview the five people whose decisions you will serve | A list of decisions they face in the next four quarters, with dates |
| Convert those into KITs and KIQs | One page. Between 4 and 8 KITs. No more |
| Name your executive sponsor | A person, in writing, who will read the output and act |
| Write the ethics policy | One page. Use the template in [chapter 7](07-law-and-ethics.md). Get legal sign-off |
| Inventory what already exists | Existing reports, subscriptions, dashboards, and the CRM fields nobody uses |
| Agree the first three products and their cadence | Usually: weekly digest, one battlecard set, one deep dive |

Do not buy anything yet. Do not build a dashboard. Do not write a charter longer
than a page.

The interview script that works:

```text
1. What decision are you making in the next two quarters that you feel
   under-informed about?
2. What would you need to know to feel confident?
3. What is the last thing that surprised you about this market?
4. Where do you go for market information today, and what is wrong with it?
5. If I could put one page on your desk every week, what would be on it?
```

Question 3 is the most productive one. Surprises map directly to the early
warning topics you should be covering and are not.

## Day 16 to 45: build the evidence base

| Task | Output |
| --- | --- |
| Build the source inventory | A table of sources per KIQ, ranked using the source ladder in [chapter 3](03-sources-and-collection.md) |
| Mine what you already own | Lost-deal reasons, support tickets, churn notes, sales call transcripts |
| Set up free monitoring | Price-page diffs, job-ad watches, filing alerts, changelog feeds |
| Run the first primary research | 15 to 20 win/loss interviews. This will be your highest-value asset by day 90 |
| Grade your sources | Assign reliability grades. Write them down |
| Ship the first weekly digest | Even if it is thin. Rhythm before richness |

Costs at this stage should be close to zero apart from your time and the
interviews.

## Day 46 to 75: publish and close the loop

| Task | Output |
| --- | --- |
| Ship the first battlecard set | Top 3 competitors only. One screen each |
| Ship the first deep dive | Answering the single highest-value KIT |
| Start the judgment log | Every probabilistic judgment, with date and resolution date |
| Set tripwires | For each early-warning KIT: the specific observable that triggers an alert, and who receives it |
| Establish the archive | Tagged by decision and question, not by source |
| Collect feedback formally | Ask each reader: did this change anything you did? |

## Day 76 to 90: measure and decide what to scale

| Task | Output |
| --- | --- |
| Baseline the four metrics | Decision influence, decision velocity, early warnings delivered, judgment accuracy. See [chapter 6](06-operating-model.md) |
| Score the first judgments that have resolved | Even three or four data points start the calibration habit |
| Review the KIT list with the sponsor | Kill what nobody used. Add what surprised you |
| Write the tooling case, if any | Now you know which layer actually constrains you |
| Decide build versus buy per layer | Buy monitoring. Build judgment |

## Templates

### KIT and KIQ register

| ID | KIT | Type | KIQ | Indicator | Owner | Cadence | Consumer |
| --- | --- | --- | --- | --- | --- | --- | --- |
| K1 | Rival X moving down-market | Early warning | Has X hired SMB sales in DACH since Jan 2026? | Job ads by title and location | A | Weekly | VP Sales |
| K1 | Rival X moving down-market | Early warning | Has X added a tier below current entry? | Pricing page diff | Auto | Daily | VP Sales |
| K2 | Enterprise price increase Jan 2027 | Strategic decision | What churn intent at +8%? | Renewal cohort survey | Vendor | Once, by 12 Sep | VP Pricing |

### Source card

```text
Source:        Rival X pricing page
URL:           https://example.com/pricing
Type:          Company-published, tier 3
Reliability:   A (published by the subject, factual content)
Credibility:   1 for list prices, 4 for implied discounting
Collected by:  Daily automated diff
Retention:     Screenshot archived per change
Known limits:  Regional variants and A/B tests produce false positives
Legal:         Public, logged out, rate limited. No personal data
```

### Judgment log entry

```text
ID:              J-0007
Date:            2026-08-11
KIT:             K1
Judgment:        Rival X launches a mid-market tier before 2027-04-01
Likelihood:      Likely (60% to 70%)
Confidence:      Moderate
Origins:         2 independent (hiring signals, channel reports)
Assumptions:     Their Series D closes as reported; no leadership change
Would falsify:   Hiring freeze; a public statement of enterprise-only focus
Resolution date: 2027-04-01
Outcome:         [ pending ]
Notes:           Popular internal view is that this is aimed at us. ACH does
                 not support that reading. See analysis of 2026-08-04
```

### Product front page

```text
TITLE
Decision this supports:  ...
Decider and date:        ...
Prepared:                YYYY-MM-DD

BOTTOM LINE
[One or two sentences. Judgment, likelihood, confidence, recommended action.]

SO WHAT
[What the reader should do differently.]

KEY JUDGMENTS
1. ... (likelihood, confidence)
2. ...
3. ...

WHAT WOULD CHANGE OUR MIND
- ...
- ...

SOURCING
[Sources with grades. Gaps named explicitly.]
```

## Build versus buy, by layer

| Layer | Default | Reason |
| --- | --- | --- |
| Monitoring | Buy, after 90 days | Real economies of scale. Cheap relative to analyst time |
| Aggregated research corpus | Buy if you need filings, calls, and broker research often | Cannot be replicated |
| Private-market data | Buy at least one, ideally two | Coverage differs by database and by region. See [chapter 6](06-operating-model.md) |
| Web and digital signals | Buy | Panel infrastructure cannot be replicated |
| Primary research | Mixed. Run interviews in-house, buy panels and expert access | The interviews are where your edge is |
| Alternative data | Buy selectively, after provenance diligence | Expensive, and most datasets will not move your decisions |
| Knowledge store | Build or reuse | Depends entirely on where your readers already work |
| Analysis and judgment | Build | This is the function. Outsourcing it defeats the purpose |

## The 90-day success test

At day 90, you should be able to point to:

- [ ] A one-page KIT list agreed with a named sponsor
- [ ] Three products shipping on a fixed cadence
- [ ] At least 15 buyer interviews conducted and coded
- [ ] A judgment log with dated, probabilistic entries
- [ ] At least one tripwire that fired, or was demonstrated to work
- [ ] One decision a named person will say your work changed
- [ ] A written ethics policy with a named escalation contact

If you can point to the sixth item, the program is real. If you cannot, fix
requirements and delivery before you buy any tool. No platform has ever
converted a program that nobody was waiting on.

## Common first-year traps

| Trap | Symptom | Fix |
| --- | --- | --- |
| Boiling the ocean | 30 competitors tracked, none well | Three competitors, properly. Add the fourth when the first three are boring |
| Tool before question | A platform purchased in month two | Delay all purchases to day 90 |
| Reporting to nobody | A weekly digest with no named recipient | One named consumer per product, or kill the product |
| Avoiding a judgment | Reports that summarise without concluding | Every product ends with a probability and a recommended action |
| Neglecting internal evidence | Buying data about your own market that your CRM already holds | Mine CRM and support before any purchase |
| Ethics by vibes | No written policy, grey calls made under deadline | Write the one-page policy in week one |

---

Related: [chapter 2](02-the-cycle.md) for requirements,
[chapter 5](05-products-and-cadence.md) for product formats,
[chapter 6](06-operating-model.md) for metrics and stack,
[chapter 7](07-law-and-ethics.md) for the policy template.
