# 07. Performance felt as experience

Speed is not an engineering concern that happens to affect users. It is the first thing a user
experiences, before any layout or copy. This section covers the metrics that are measured on real
visits, what real sites score, and the design techniques that change perceived speed without changing
the underlying time.

## Core Web Vitals: the three numbers

Core Web Vitals are Google's three user-centred performance metrics, measured on real visits rather than
in a lab. All three are judged at the **75th percentile of page views**, which means the metric answers
"is it good for three visitors in four", not "is it good on my machine".

| Metric | Measures | Good | Needs improvement | Poor |
| --- | --- | --- | --- | --- |
| Largest Contentful Paint (LCP) | When the biggest visible element finished rendering, so roughly "when the page looks loaded" | 2.5 s or less | up to 4.0 s | over 4.0 s |
| Interaction to Next Paint (INP) | How long the page takes to visibly respond to a click, tap, or key press | 200 ms or less | up to 500 ms | over 500 ms |
| Cumulative Layout Shift (CLS) | How much visible content jumps around unexpectedly | 0.1 or less | up to 0.25 | over 0.25 |

**The change that caught teams out.** In March 2024, INP replaced First Input Delay (FID). FID measured
only the delay before the browser started handling the *first* interaction. A page could score well
while every menu, filter, and dropdown after that first click felt sluggish. INP looks at all
interactions across the visit and reports close to the worst one, discarding one outlier per 50
interactions on heavily used pages. Only clicks, taps, and key presses count. Scrolling, hovering, and
zooming do not.

**The three phases of an interaction**, which is how you debug an INP problem:

1. **Input delay:** time before your event handler starts running. Cause: the main thread is busy with
   something else, usually a script.
2. **Processing duration:** time your handlers take to run. Cause: your own code.
3. **Presentation delay:** time from your handlers finishing to the browser painting the next frame.
   Cause: expensive layout, large DOM, or heavy style recalculation.

Most teams assume phase 2 and find the problem in phase 1 or 3. Measure before optimising.

## What real sites score

From the HTTP Archive Web Almanac 2025, July 2025 crawl, 16.2 million sites.

| Measure | Desktop | Mobile |
| --- | --- | --- |
| All three Core Web Vitals good | 56% (from 55% in 2024) | 48% (from 44%) |
| LCP good | 74% | 62% |
| INP good | 97% | 77% (from 74%) |
| CLS good | 72% | 81% |

Two readings worth taking from that table. First, responsiveness on desktop is essentially a solved
problem and on mobile it is not, which is a statement about device capability rather than code quality:
the same JavaScript costs several times more on a mid-range phone. Second, roughly half the mobile web
still fails, so passing is a genuine competitive difference rather than table stakes.

**Where LCP time actually goes:** images are the largest element on 85.3% of desktop pages and 76% of
mobile pages. JPEG is still the most common format at 57%. About 16% to 18% of pages host their largest
image on a different domain, adding a connection setup before the download starts. And only 17% of
mobile pages mark that image with `fetchpriority="high"`, which is a one-attribute fix.

## Page weight

Also from the July 2025 crawl.

| Measure | Desktop | Mobile |
| --- | --- | --- |
| Median total page weight | 2,412 KB | 2,164 KB |
| 90th percentile page weight | 9,179 KB | 8,337 KB |
| Median images | 1,058 KB | n/a in this extract |
| Median JavaScript | 697 KB | n/a in this extract |
| Median fonts | 139 KB | n/a in this extract |
| Median CSS | 82 KB | n/a in this extract |
| Median HTML | 22 KB | n/a in this extract |
| Median unused JavaScript, uncompressed | 280 KB | 251 KB |

Ten-year growth, July 2015 to July 2025: the median mobile page went from 845 KB to 2,362 KB, up
202.8%. Desktop grew 110.2%.

Note one internal inconsistency in the source: the resource-type table gives median desktop JavaScript
as 697 KB while the narrative cites about 708 KB of total JavaScript per page. Medians of different
groupings do not have to agree. Use either as an order of magnitude, not a precise figure.

The number to act on is the unused JavaScript. A median page ships roughly a quarter of a megabyte of
code that never runs. That is a code-splitting and dependency-audit problem, and it is pure cost: it
delays LCP, it occupies the main thread, and it worsens INP.

## A performance budget that is actually enforceable

Budgets fail when they are aspirational. Make them build-breaking.

| Budget | Suggested value | Why this one |
| --- | --- | --- |
| JavaScript on the critical path, compressed | 150 to 200 KB | Beyond this, mid-range phones struggle to stay under 200 ms INP |
| LCP image, compressed | 150 KB | It must arrive before 2.5 s on a slow connection |
| Fonts | Two files, 100 KB total | Variable fonts make this achievable |
| Total requests before first paint | Under 20 | Each one is a queue slot |
| Third-party scripts | Counted individually, each with a named owner and a removal date | Third parties are where budgets go to die |

Two rules that matter more than the numbers: test on a mid-range Android phone on a throttled network,
never on the development machine; and make the budget a check in continuous integration that fails the
build, because a dashboard nobody is blocked by gets ignored.

## Perceived speed: changing the feeling, not the clock

Perceived duration and measured duration are different quantities. The classic response-time limits
(0.1 s, 1 s, 10 s, see [01](01-principles-and-laws.md)) tell you which technique applies.

| Technique | When it helps | When it backfires |
| --- | --- | --- |
| Optimistic update: show the result immediately, reconcile with the server after | Actions that almost always succeed: like, favourite, rename, add to list | Anything where failure is likely or costly. A rollback that surprises the user is worse than a wait |
| Skeleton placeholder: show the shape of the content | You know the layout in advance and the wait is roughly 1 to 10 s | Very short waits, where it flashes; and unknown layouts, where the skeleton lies about what is coming |
| Spinner | Short, indeterminate waits | Anything over a few seconds, where it communicates nothing and reads as "stuck" |
| Progress bar with an estimate | Waits over 10 s | Fake progress that stalls at 90% destroys trust for every future wait |
| Streaming or progressive rendering: show partial results as they arrive | Long generation, search results, long documents | When partial output is misleading on its own, for example a half-finished number |
| Preload and speculative loading on hover or focus | Predictable next navigation | Aggressive prefetching wastes the user's data and can trigger side effects |
| Skeleton-free instant paint of static shell | Any repeat visit | When the shell is stale and misrepresents state |

**Honest note about the evidence.** Claims that streaming cuts perceived wait by a specific
percentage, or that skeletons feel 40% faster, circulate widely but trace back to vendor blog posts
without published method or sample. The direction is well established in the human-factors literature
(feedback reduces perceived wait, and progress information reduces abandonment). The exact percentages
should not be quoted. See [14](14-methodology-and-sources.md) for this gap.

## Layout stability is a design problem

CLS is usually blamed on engineering, but it is caused by design decisions:

- **Media without reserved space.** Always set `width` and `height` attributes, or an `aspect-ratio`.
- **Web fonts that reflow text.** Use `font-display: swap` with a fallback whose metrics are adjusted
  using `size-adjust`, `ascent-override`, and friends, so the swap does not move lines.
- **Content injected above existing content.** Cookie bars, promo banners, and late-loading ads. Reserve
  the space or position them so they overlay rather than push.
- **Anything that grows after interaction.** Expanding an accordion is fine, because the user caused it.
  CLS only counts unexpected shifts.

## Field data versus lab data

You need both, and they answer different questions.

| | Field data | Lab data |
| --- | --- | --- |
| Source | Real visits from real devices, for example the Chrome User Experience Report | A synthetic run, for example Lighthouse |
| Answers | "Are users having a good time?" | "Why, and did my change help?" |
| Weakness | Slow to update, aggregated, no diagnostics | Not your users, not their devices, not their network |

The 2025 crawl found a tension worth knowing about: real-world INP scores improved while the lab metric
Total Blocking Time got worse. Lab tools use a fixed throttled profile that may not match your actual
audience. Trust the field for whether you have a problem and the lab for finding the cause.

## The performance checklist

1. LCP under 2.5 s, INP under 200 ms, CLS under 0.1, at the 75th percentile of real visits.
2. The LCP element identified, and marked with `fetchpriority="high"` if it is an image.
3. All media has dimensions or `aspect-ratio`.
4. Fonts self-hosted, subset, two files or fewer, with metric-adjusted fallbacks.
5. Unused JavaScript measured and trending down.
6. Third-party scripts inventoried, each with an owner.
7. A budget enforced in continuous integration.
8. Tested on a mid-range phone on a throttled network.
9. Every action over 100 ms acknowledges immediately.
10. No fake progress, and no optimistic update on an operation that can plausibly fail.
