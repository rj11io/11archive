# 14. Methodology, sources, and limitations

## How this report was built

1. **Framing.** Audience, objective, scope, and exclusions were fixed first and are stated in
   [README.md](README.md). The scope deliberately excludes anything that ranks tools or products, because
   those rankings change faster than a report can.
2. **Collection.** Web search and direct page retrieval on 2026-08-11, working outward from primary
   sources: specification text, standards bodies, regulator publications, browser vendor documentation,
   and large-sample crawls. Secondary and vendor sources were used only where no primary equivalent
   exists, and are labelled as such below.
3. **Verification of contested facts.** Where a search summary and a primary source disagreed, the primary
   source won and the discrepancy was recorded. Two examples: a secondary article dated an acquisition to
   2025 when the primary announcement is 2022, and another reported a repository at 75,000 stars against
   121,100 read directly from the repository.
4. **Modelling.** The evidence was structured into `data.json` around this report's subject: rules with
   levels and sources, numeric thresholds with units, platform features with availability status,
   regulations with dates, failure modes with fixes, and sources with confidence.
5. **Writing.** Each section leads with what changes a decision, then the evidence, then the limits. Every
   material number carries its source and, where relevant, its date and population.
6. **Rendering.** `report.html` is a self-contained page carrying the same facts, order, and terminology as
   the Markdown. It adds sorting, row highlighting, and column resizing, and adds no information.

## Evidence states used

| State | Meaning in this report |
| --- | --- |
| Specified | Stated in a specification or standard. Not an estimate |
| Regulatory | Stated in law, a final rule, or an official publication |
| Measured | From a disclosed large-sample measurement, with method published |
| Vendor-reported | Published by a party with an interest in the result, with method partly disclosed |
| Secondary | Reported by a third party without access to the underlying method |
| Excluded | Encountered but not used, with a reason given below |

## Confidence, and how to read the numbers

| Confidence | Applies to | Example |
| --- | --- | --- |
| High | Specification text, thresholds, regulatory dates, and figures from disclosed large-sample crawls | The 4.5:1 contrast ratio; the 28 June 2025 EAA date; 95.9% of home pages with detected failures |
| Medium | Browser availability status, which changes monthly; vendor-published research | `contrast-color()` support; the Material 3 Expressive study figures |
| Low | Market and adoption statistics from interested parties; litigation counts where trackers disagree | Passkey adoption percentages; US accessibility lawsuit totals |

Anything at low confidence is labelled in the body text where it appears. Do not quote a low-confidence
figure without its source and its caveat.

## Sources

Grouped by type. All retrieved 2026-08-11.

### Specifications and standards

| # | Source | Used for | State |
| --- | --- | --- | --- |
| S1 | W3C, Web Content Accessibility Guidelines (WCAG) 2.2, `w3.org/TR/WCAG22/` | Principles, levels, the nine new criteria, the 4.1.1 removal, revision date | Specified |
| S2 | W3C, Understanding SC 1.4.3 Contrast (Minimum) | Exact ratios, large-text definition, exceptions, comparison with 1.4.6 and 1.4.11 | Specified |
| S3 | W3C, Understanding SC 2.3.3 Animation from Interactions | Motion disable requirement | Specified |
| S4 | W3C WAI, ARIA Authoring Practices Guide, `w3.org/WAI/ARIA/apg/` | What the APG contains, patterns and practices | Specified |
| S5 | W3C ARIA specification and community guidance, via the APG "Read Me First" practice | First rule of ARIA: no ARIA is better than bad ARIA | Specified |
| S6 | Design Tokens Community Group, Format Module 2025.10, `designtokens.org/tr/drafts/format/` | Token file format, properties, types, aliases, groups, `$extends` | Specified |
| S7 | Design Tokens Community Group announcement, 28 October 2025, `w3.org/community/design-tokens/` | First stable version date and positioning | Specified |
| S8 | W3C, CSS Logical Properties and Values Module Level 1 | Logical property names and behaviour | Specified |
| S9 | WCAG 2.2 success criteria 2.5.5, 2.5.7, 2.5.8, 2.4.11, 2.4.13, 3.2.6, 3.3.7, 3.3.8, 3.3.9, 1.3.5, 1.4.4, 2.2.2, 2.5.1 | Individual requirements cited throughout | Specified |

### Regulation

| # | Source | Used for | State |
| --- | --- | --- | --- |
| S10 | European Accessibility Act, application date 28 June 2025, and EN 301 549 as the presumed-compliance standard | EU obligation, standard referenced, extraterritorial reach | Regulatory |
| S11 | US Federal Register, ADA Title II final rule, 24 April 2024 | Requirement of WCAG 2.1 AA for state and local government | Regulatory |
| S12 | US Federal Register, extension of ADA Title II compliance dates, published 20 April 2026 | New deadlines: 26 April 2027 and 26 April 2028 | Regulatory |
| S13 | US Federal Trade Commission Negative Option Rule ("click to cancel"), finalised 2024, vacated by a federal appeals court in 2025 | Status of the rule and continued enforcement under existing authority | Regulatory |
| S14 | European Commission 2030 Consumer Agenda, adopted 19 November 2025, and the Digital Fairness Act plan | Planned EU instrument on manipulative and addictive design, proposal expected late 2026 | Regulatory |
| S15 | European Parliament research briefing on regulating dark patterns towards digital fairness (2025) | Scope of the dark patterns problem in EU policy | Regulatory |

### Large-sample measurement

| # | Source | Population and date | Used for | State |
| --- | --- | --- | --- | --- |
| S16 | WebAIM Million, February 2026 | 1,000,000 home pages, Tranco ranking | Failure rates, failures per page, the ARIA correlation | Measured |
| S17 | WebAIM Million, 2025 edition | Same population, 2025 | Year-over-year comparison | Measured |
| S18 | HTTP Archive Web Almanac 2025, Accessibility chapter | July 2025 crawl, about 16.2 million sites, Lighthouse with axe-core | Contrast pass rate, labels, focus outlines, preference media features, zoom blocking, skip links, overlays | Measured |
| S19 | HTTP Archive Web Almanac 2025, Performance chapter | Same crawl, plus CrUX field data | Core Web Vitals pass rates, LCP element composition, `fetchpriority` adoption, field versus lab tension | Measured |
| S20 | HTTP Archive Web Almanac 2025, Page Weight chapter | Same crawl | Median and 90th percentile weights, resource breakdown, ten-year growth, unused JavaScript | Measured |
| S21 | HTTP Archive Web Almanac 2025, Generative AI chapter | About 12.9 million sites | Built-in AI API adoption, `llms.txt`, `robots.txt` AI directives, WebAssembly and WebGPU growth | Measured |
| S22 | HTTP Archive Web Almanac 2025, index and methodology | July 2025, 16.2 million sites, 244 TB processed | Sample size and chapter list | Measured |
| S23 | State of CSS 2025 survey | Self-selected developer survey | Feature sentiment and pain points, used qualitatively only | Secondary |

### Browser platform and availability

| # | Source | Used for | State |
| --- | --- | --- | --- |
| S24 | web.dev, "Interop 2026" announcement | The 20 focus areas, participants, purpose | Specified |
| S25 | WebKit and Mozilla Interop 2026 announcements | Cross-checking the focus area list and Safari-first features | Specified |
| S26 | chrome.dev, "CSS Wrapped 2025" | 2025 feature set: invoker commands, dialog light dismiss, `popover=hint`, customizable select, scroll markers, `interestfor`, scroll-state queries, `moveBefore()`, `shape()`, `if()`, `@function`, `corner-shape`, `text-box` | Specified |
| S27 | Chrome for Developers, "What's new in web UI" (Google I/O 2026) | Chrome 146, 147, and 150 features; view transition variants; scroll-triggered animations | Specified |
| S28 | MDN Web Docs, `light-dark()` and `contrast-color()` | Function behaviour and support notes | Specified |
| S29 | web.dev, "Interaction to Next Paint (INP)" | Definition, measurement, percentile, thresholds, the three interaction phases | Specified |
| S30 | Baseline definitions as used by web.dev and MDN | Limited, newly available, widely available | Specified |
| S31 | una.im, "Modern CSS theming with light-dark(), contrast-color(), and style queries" | Reported stable-in-all-engines status as of May 2026 | Secondary |

### Human factors and research method

| # | Source | Used for | State |
| --- | --- | --- | --- |
| S32 | Nielsen Norman Group, "10 Usability Heuristics for User Interface Design", 1994, revised 2020 | The ten heuristics and their wording | Specified |
| S33 | Nielsen Norman Group, "Response Time Limits", from *Usability Engineering* (1993) | The 0.1 s, 1 s, and 10 s limits | Specified |
| S34 | Fitts (1954); Fitts and Peterson (1964) | Fitts's law and its origin | Specified |
| S35 | Hick (1952); Hyman (1953); Card, Moran and Newell (1983) | Hick's law and its introduction to interface design | Specified |
| S36 | Nielsen, "Why You Only Need to Test with 5 Users" (2000), on the Nielsen and Landauer model (1993) | The formula, the 31% discovery rate, the run-more-smaller-tests conclusion | Specified |
| S37 | Springer, "Benefits of increased sample sizes in usability testing" | Sample variance: 55% to 99% coverage from different sets of five; 80% at ten; 95% at twenty | Measured |
| S38 | Sauro, System Usability Scale meta-analysis of about 5,000 scores across 500 studies; Sauro and Lewis (2016) curved grading from 241 studies | The 68 average, the percentile interpretation, the grading curve | Measured |
| S39 | Rodden, Hutchinson and Fu (Google), HEART framework and the Goals-Signals-Metrics process | Metric selection method | Specified |
| S40 | Bringhurst, *The Elements of Typographic Style*; Tinker and Paterson eye-movement studies | The 45 to 75 character line length range and its basis | Secondary |
| S41 | Miller (1956), on short-term memory for unrelated items | Why "seven plus or minus two" does not apply to menus | Specified |

### AI interface design

| # | Source | Used for | State |
| --- | --- | --- | --- |
| S42 | Amershi et al., "Guidelines for Human-AI Interaction", CHI 2019; Microsoft HAX Toolkit design library | All 18 guidelines, the four phases, the validation with 49 practitioners against 20 products | Specified |
| S43 | Google PAIR, People + AI Guidebook, and its generative AI update | Six chapters, mental models, explainability, feedback and control, graceful failure | Specified |
| S44 | Vendor articles on streaming UI, time to first token, and skeleton screens | Reviewed and excluded for numeric claims; see exclusions | Excluded |

### Platform design languages and component ecosystem

| # | Source | Used for | State |
| --- | --- | --- | --- |
| S45 | Google Design, "Expressive Material Design" research article | 46 studies, 18,000+ participants, three years, eye tracking, up to four times faster recognition across 10 apps, 87% preference among 18 to 24 year olds, brand perception deltas | Vendor-reported |
| S46 | Apple developer material on Liquid Glass, WWDC 2025, plus design commentary | The material's introduction, the legibility criticism, the Reduce Transparency, Increase Contrast, and Reduce Motion settings | Vendor-reported and Secondary |
| S47 | shadcn/ui repository, `github.com/shadcn-ui/ui` | Self-description as a code distribution platform, 121.1k stars, built on unstyled primitives | Measured |
| S48 | WorkOS announcement of the Modulz acquisition, June 2022 | Radix Primitives ownership | Vendor-reported |
| S49 | Base UI release information, v1.0.0, December 2025 | The actively maintained primitives alternative | Vendor-reported |
| S50 | Apple Human Interface Guidelines (44 pt) and Material Design guidance (48 dp) | Platform target size minimums | Specified |

### Adoption, market, and litigation figures

| # | Source | Used for | State |
| --- | --- | --- | --- |
| S51 | FIDO Alliance, World Passkey Day 2026 report; surveys by Sapio Research, April 2026, 11,000 consumers in ten countries | Passkey adoption figures | Vendor-reported |
| S52 | Baymard Institute checkout usability research | Form field usability failures, multicolumn layouts, card expiry entry, unexplained phone requirement | Secondary |
| S53 | UsableNet, EcomBack, ADA Title III blog, and other litigation trackers | US accessibility lawsuit counts for 2025, which disagree | Secondary |
| S54 | Cookie consent research: EEA accept/reject button prevalence 2018 to 2024; CNIL 2025 formal notices; Austrian Supreme Court parity ruling; top 10,000 EU site compliance study; etracker consent rate study | Consent banner practice and enforcement | Secondary |
| S55 | Reports of FTC settlements: Amazon, September 2025; Care.com, 2025 | Enforcement consequence figures | Secondary |

Source count: 55.

## Conflicts recorded

| Conflict | Resolution |
| --- | --- |
| Radix ownership dated to 2025 by a secondary article, 2022 by the primary announcement | Used 2022 |
| shadcn/ui reported at 75,000 stars by a secondary article, 121,100 in the repository | Used the repository figure, with its read date |
| US accessibility lawsuit counts for 2025: over 5,000, 3,117 federal, and 8,667 across all courts from three trackers | Reported the range and the methodological cause. No single figure adopted |
| Web Almanac 2025 median desktop JavaScript given as 697 KB in the resource table and about 708 KB in the narrative | Reported both, and noted that medians of different groupings need not agree |
| CLS is better on mobile (81% good) than desktop (72%) in the 2025 data, which is counter-intuitive | Reported as measured, without an explanation the source does not give |
| WCAG 2.2 publication date: the specification page carries 12 December 2024 as its current revision, while the original Recommendation is widely dated to October 2023 | Cited the revision date from the specification page only |

## What was excluded, and why

- **Numeric claims about streaming and skeleton screens.** Figures such as "perceived wait drops 55% to
  70%" and "skeletons feel 40% faster" appear in several vendor articles with no sample size, no method,
  and no citation to an underlying study. The direction is supported by the classic response-time
  literature; the numbers are not verifiable and are not used.
- **Design system adoption percentages** such as "70% growth in headless adoption" and "73% of businesses
  adopting headless architecture". No method or population is given by the publishing vendors.
- **Tokens-per-second thresholds for AI interfaces** ("100 TPS feels normal"). Sourced only to vendor
  blogs, and dependent on content type and renderer.
- **Any product or tool ranking.** Out of scope by design.
- **Figma, Sketch, and other design tool feature comparisons.** Out of scope, and they change monthly.
- **Reported plans for a future Liquid Glass opacity slider in iOS 27.** Single secondary source, so
  mentioned in [04](04-color-typography-and-theming.md) only as reported, not as fact.
- **Private or client data.** None was consulted. Every figure in this report is from a public source.

## Known limitations

1. **Automated accessibility data is a floor.** Scanners detect roughly a third of real problems, so the
   WebAIM and Web Almanac figures understate the true failure rate. They are still the best available
   population-scale evidence.
2. **Home pages are not applications.** WebAIM measures home pages. Signed-in application screens, which
   is where most complex interaction lives, are not represented in either crawl.
3. **Browser availability moves monthly.** Every feature status in this report is as of 2026-08-11. Check
   current support before shipping without a fallback, especially for anything listed as an Interop 2026
   focus area.
4. **Survey-based figures are self-selected.** The State of CSS survey and the FIDO consumer surveys draw
   from populations that are not representative of all developers or all consumers.
5. **Vendor research on its own design system is not independent.** The Material 3 Expressive figures are
   reported by the team that built it. The mechanism is plausible and the study scale is large; the effect
   sizes should be treated as vendor-reported.
6. **US litigation counts are not reconcilable** across trackers, as recorded above.
7. **No usability testing was conducted for this report.** It synthesises published evidence. Every
   threshold here still needs validation against your own users and content.
8. **Mobile app specifics are thin.** The report covers web mechanisms in depth and native platform
   guidance only where it sets a numeric standard, such as target sizes.
9. **Coverage of spatial, voice, and automotive interfaces is out of scope**, and those contexts change
   several of the thresholds here.

## Reproducing the work

Every source above is public and can be retrieved directly. The crawl-based figures (S16 to S22) are
recomputable from the published datasets: HTTP Archive publishes its tables in BigQuery, and WebAIM
publishes its methodology and per-year archives. The specification and regulatory facts (S1 to S15) are
stable text at fixed URLs. The availability statuses (S24 to S31) are the ones that will age fastest.
