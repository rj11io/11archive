# Methodology, coverage, limitations, and sources

## 1. What this report is

A working reference for the metadata a website puts in its `<head>`, plus the two files at its root, covering four consumers: search engines, social and chat previews, structured-data features, and AI crawlers.

It is not a ranking-factor study. Nothing here was measured against traffic, and no claim about "what ranks" is made beyond what the platform owners publish.

## 2. How the evidence was collected

- **Date of research:** 2026-08-11. Timezone: Europe/Lisbon.
- **Method:** direct retrieval of vendor documentation, read and summarised page by page. Where the vendor page was unreachable, a targeted web search was run and the result is labelled second-hand.
- **Preference order:** the standard's own site (ogp.me, oembed.com, indexnow.org) first, then the platform's developer documentation, then MDN for browser behaviour, then framework documentation, then secondary sources.
- **No live crawling, no scraping, no A/B testing, and no authenticated surfaces.** Every fetch was a normal public page request.

## 3. Evidence states used

Every claim in this report falls into one of these:

| State | Meaning | How it is marked |
|---|---|---|
| **Documented** | Stated in the owning vendor's or standard's own documentation | Linked inline to that page |
| **Second-hand** | The vendor's page was unavailable; the claim comes from secondary sources that agree with each other | Labelled "second-hand" in the text |
| **Derived** | A recommendation combining several documented constraints, such as the single image spec that satisfies every platform | Stated as a recommendation with the constraints shown |
| **Unavailable** | Wanted but not obtainable in this pass | Listed in section 5 |

Numbers such as "1200 x 630" and "under 300 KB" are **derived**: they are the tightest values that satisfy every documented platform constraint at once, not a figure any single vendor publishes.

## 4. Coverage

**Consumers examined:** Google Search, Google Discover, Google AI Overviews and AI Mode, Bing and IndexNow participants, Facebook, WhatsApp, LinkedIn, X, Slack, Discord, Telegram, Pinterest, Mastodon, iOS Safari, Android and PWA installs, and the crawlers of OpenAI, Anthropic, Google, Apple, and other AI operators.

**Tag families examined:** document basics, indexing directives, canonical and hreflang, Open Graph and its object types, X cards, oEmbed discovery, structured data in JSON-LD, icons, web app manifest, theme and colour scheme, Apple and app-link tags, referrer policy, verification tags, robots.txt, sitemaps, IndexNow, and llms.txt.

**Framework coverage:** Next.js in depth, because its metadata API documents tag names and generation behaviour precisely. Other stacks named at one line each, without verification.

## 5. Limitations

1. **X (Twitter) documentation is paywalled.** `developer.x.com` and `developer.twitter.com` returned HTTP 402 on 2026-08-11, and `docs.x.com` returned 404 for the card paths tried. Every X image constraint and character limit in this report is second-hand and should be re-verified before you depend on it. The tag *names* are corroborated by the Next.js metadata API, which generates them.
2. **Apple's Smart App Banner page returned no readable body.** Parameter names come from secondary sources.
3. **Discord, Telegram, and LinkedIn publish no formal metadata specification.** Their behaviour here is reported by third parties who agree with each other, which is weaker than a vendor statement.
4. **Bing's webmaster guidelines were not retrieved.** The page returned no readable content. Bing-specific behaviour is therefore absent, except for IndexNow, which is documented independently.
5. **Platform behaviour drifts.** Caches, crop ratios, and character limits change without announcement. Everything here is a point-in-time reading of 2026-08-11.
6. **No effectiveness measurement.** This report says what the platforms accept and read. It does not say what improves clicks, rankings, or conversions. Those need your own tests.
7. **Character limits for titles and descriptions are display budgets, not rules.** Google states there is no limit and truncates to device width. Any specific number you see elsewhere, including the rough 60 and 155 figures cited here, is a convention.
8. **The AI crawler list is partial.** Only Google, OpenAI, and Anthropic tokens were confirmed against vendor documentation. The rest are listed as unverified.
9. **`llms.txt` adoption claims come from its own site**, which has an interest in reporting adoption favourably.

## 6. Primary sources

### Standards and protocols

- [The Open Graph protocol](https://ogp.me/)
- [oEmbed specification](https://oembed.com/)
- [IndexNow documentation](https://www.indexnow.org/documentation)
- [llms.txt proposal](https://llmstxt.org/)

### Google

- [Meta tags and attributes Google supports](https://developers.google.com/search/docs/crawling-indexing/special-tags)
- [Robots meta tag, data-nosnippet, and X-Robots-Tag specifications](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)
- [Robots.txt specifications](https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt)
- [Consolidate duplicate URLs (canonicalization)](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Localized versions of a page (hreflang)](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Google common crawlers](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers)
- [Control your title links](https://developers.google.com/search/docs/appearance/title-link)
- [Control your snippets](https://developers.google.com/search/docs/appearance/snippet)
- [Define a favicon](https://developers.google.com/search/docs/appearance/favicon-in-search)
- [Site names](https://developers.google.com/search/docs/appearance/site-names)
- [Google Discover](https://developers.google.com/search/docs/appearance/google-discover)
- [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [Structured data general guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- [Structured data search gallery](https://developers.google.com/search/docs/appearance/structured-data/search-gallery)
- [Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article)
- [Organization structured data](https://developers.google.com/search/docs/appearance/structured-data/organization)
- [Breadcrumb structured data](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb)

### Meta

- [Sharing for webmasters](https://developers.facebook.com/docs/sharing/webmasters/)
- [Sharing best practices](https://developers.facebook.com/docs/sharing/best-practices/)
- [WhatsApp link previews](https://developers.facebook.com/documentation/business-messaging/whatsapp/link-previews/)

### Other platforms

- [Slack: unfurling links in messages](https://docs.slack.dev/messaging/unfurling-links-in-messages/)
- [Pinterest Rich Pins overview](https://developers.pinterest.com/docs/web-features/rich-pins-overview/)
- [OpenAI bots](https://developers.openai.com/api/docs/bots)
- [Anthropic: does Anthropic crawl data from the web](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)

### Browser and framework

- [MDN: meta name values](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name)
- [MDN: viewport meta element](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Viewport_meta_element)
- [MDN: web app manifest](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest)
- [MDN: Referrer-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Referrer-Policy)
- [Next.js: generateMetadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)

## 7. Secondary sources, by claim

Used only where the vendor's own page was unavailable. Each was cross-checked against at least one other source making the same claim.

| Claim | Sources consulted |
|---|---|
| X card image sizes (min 300 x 157, max 4096 x 4096, under 5 MB, JPG/PNG/WEBP/GIF), 2:1 centre crop | og-image.org platform guide, ogpreview.io Twitter guide, opengraphplus.com Twitter images guide |
| X card validator preview removed in 2022, test via the composer | X developer community thread on card validator preview removal, ogfixer.com card validator guide |
| LinkedIn 1200 x 627 at 1.91:1, roughly 7-day preview cache | share-preview.com LinkedIn guide, connectsafely.ai Post Inspector article, missinglinkz.io preview size guide |
| Discord reads `twitter:card` for large images, uses `theme-color` for the border, requires HTTPS images | opengraphplus.com Discord tag reference, previewog.com Discord guide, Discord support community post on theme-color |
| Telegram needs `og:title`, prefers 1200 x 630, JPEG and PNG only | share-preview.com Telegram guide, opengraphplus.com Telegram images guide |
| Mastodon `fediverse:creator`, added in 4.3, requires author-attribution settings | rknight.me Mastodon author tags, chrismcleod.dev attribution meta tag, mastodon/mastodon discussion #32328 |
| Apple Smart App Banner parameters and `%2C` comma encoding | zhead.dev apple-itunes-app reference, david-smith.org Smart App Banners implementation |
| `og:image` must be absolute; JS-injected tags invisible to preview crawlers | veonr.com relative vs absolute analysis, ogmagic.dev OG image debugging guide, plus corroboration in vendor docs on caching |

## 8. Reproducing this report

Every documented claim can be re-checked by opening the linked page. To refresh the second-hand claims when the X and Apple pages become reachable:

1. Fetch `https://docs.x.com/x-for-websites/cards/overview/markup` and compare the image constraints in [Open Graph and social cards](02-open-graph-and-social-cards.md) section 3.
2. Fetch Apple's Smart App Banner page and compare the parameter table in [Icons, PWA, app, and browser tags](04-icons-pwa-app-and-browser-tags.md) section 4.
3. Re-run the crawler token lists in [Crawler and AI agent controls](05-crawler-and-ai-agent-controls.md) against each vendor's current documentation; this list changes fastest.

The machine-readable companion, `data.json`, carries the tag registry, platform matrix, image constraints, crawler tokens, and validator list used to build the HTML view. Regenerating the HTML from it reproduces the same facts in the same order.
