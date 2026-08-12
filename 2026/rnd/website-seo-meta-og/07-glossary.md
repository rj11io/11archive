# Glossary

Every term used in this report, in plain words.

## Core concepts

**Metadata.** Information about a page rather than the content of the page. Most of it lives in `<head>` as `<meta>` and `<link>` tags. A title, a description, and a share image are all metadata.

**Crawler (bot, spider).** A program that downloads pages automatically. Googlebot is one. So is the fetcher that runs when you paste a link into WhatsApp.

**User agent.** The name a program gives when it makes a request, such as `GPTBot`. It is the handle you use in `robots.txt` to allow or block that program. It can be faked, which is why vendors publish IP lists.

**Indexing.** Storing a page so it can appear in search results. Distinct from crawling, which is only downloading it. A page can be indexed without being crawled, which is why `robots.txt` cannot hide a URL from search.

**Rendering.** Running a page's JavaScript to see the final HTML. Googlebot does this on a delay. Most preview crawlers do not do it at all.

**Unfurl.** What a chat app does when a pasted link becomes a card with a title, a blurb, and a picture. Slack's term, now used generally.

**Snippet.** The grey descriptive text under a search result. Google writes it from your description, your page text, or both, depending on the query.

**Rich result.** A search result with extra visual features: star ratings, event dates, a breadcrumb trail, an image carousel. Structured data makes a page eligible.

## Addresses and duplication

**Canonical URL.** The one address you want treated as the real one when the same page is reachable at several. Declared with `<link rel="canonical">`.

**Canonicalization.** Google's process of picking one address from a group of duplicates. Your `rel=canonical` is a strong hint, not a command.

**hreflang.** A `<link>` annotation naming another language or region version of the same page. Requires reciprocal links: if A names B, B must name A.

**x-default.** The `hreflang` value for the fallback version, used when a visitor's language matches nothing you offer.

**Sitemap.** An XML file listing your URLs so search engines can discover them. Google reads `<loc>` and `<lastmod>` and ignores `<priority>` and `<changefreq>`.

**Sitemap index.** A sitemap of sitemaps, needed past 50,000 URLs or 50 MB per file.

## Directives

**robots.txt.** A plain text file at the site root saying which paths a crawler may download. It controls crawling, not indexing.

**robots meta tag.** A `<meta name="robots">` tag in the page controlling indexing and how the result may be displayed.

**X-Robots-Tag.** The same directives sent as an HTTP header. Needed for files that are not HTML, such as PDFs.

**noindex.** Keep this page out of search results. Only works if the crawler can download the page.

**nofollow.** Do not crawl the links on this page.

**nosnippet.** Show no text snippet. It also removes the page from Google's AI Overviews.

**data-nosnippet.** An HTML attribute on a `span`, `div`, or `section` excluding just that part from snippets. It is boolean: any value, including `"false"`, still excludes.

**max-snippet, max-image-preview, max-video-preview.** Caps on how much of your content Google may show. `max-image-preview:large` is required for large images in Discover.

**unavailable_after.** A date after which Google drops the page from results.

**indexifembedded.** Allow indexing when the page is embedded in an iframe, even though it carries `noindex`.

**Crawl-delay.** A non-standard directive asking a bot to slow down. Anthropic honours it; Google does not.

## Sharing and previews

**Open Graph (OG).** The `<meta property="og:*">` vocabulary from ogp.me that lets a page describe itself as an object. Required: `og:title`, `og:type`, `og:image`, `og:url`.

**og:type.** What kind of thing the page is: `website`, `article`, `book`, `profile`, `video.movie`, `music.song`, and others.

**Twitter card / X card.** The `<meta name="twitter:*">` family. Note `name=`, not `property=`. X falls back to Open Graph when these are absent.

**summary_large_image.** The card type that renders a full-width image above the text. Discord follows this tag too.

**og:image:alt.** The text description of the share image. The only accessible description a card carries.

**Share image (OG image).** The picture in a link preview. 1200 x 630 pixels, under 300 KB, absolute HTTPS URL.

**oEmbed.** A protocol where your site returns embeddable HTML for one of your URLs, so another site can show a working player instead of a picture. Discovered through a `<link rel="alternate" type="application/json+oembed">` tag.

**Sharing Debugger / Post Inspector.** Platform tools that re-fetch your page and clear the cached preview. Facebook and LinkedIn respectively.

**Rich Pin.** Pinterest's enhanced pin, built from your Open Graph or schema.org markup. Types: Product, Recipe, Article, in that priority order.

**fediverse:creator.** A meta tag added in Mastodon 4.3 that credits an author's fediverse profile on the link card. Requires matching settings on the Mastodon account.

## Structured data

**Structured data.** Facts about the page in a machine format, so a search engine reads typed fields instead of inferring from prose.

**schema.org.** The shared vocabulary of types and properties (`Article`, `Product`, `Organization`) that search engines agree on.

**JSON-LD.** JSON inside a `<script type="application/ld+json">` tag. Google's recommended notation because it sits apart from the markup.

**Microdata / RDFa.** Older notations that put structured data in HTML attributes. Supported, harder to maintain.

**@context, @type, @graph.** JSON-LD keywords: which vocabulary, which type, and a container for several related objects.

**Manual action.** A human penalty from Google. For structured data it removes rich-result eligibility without directly changing rankings.

## Icons and apps

**Favicon.** The small icon in a tab, bookmark, or search result. One per hostname.

**apple-touch-icon.** The 180 x 180 icon iOS uses on the home screen.

**Web app manifest.** A JSON file describing your site as an installable app: name, icons, colours, start screen. Linked with `<link rel="manifest">`.

**Maskable icon.** An icon with padding so Android can crop it into any shape without clipping the artwork.

**theme-color.** The colour a browser tints its own interface with. Discord also uses it for a link card's border stripe.

**color-scheme.** Tells the browser which light and dark schemes the page supports, so native controls match.

**Smart App Banner.** The iOS banner promoting your app, set with `<meta name="apple-itunes-app">`.

**App Links (`al:*`).** Tags telling a platform which native app can open this URL.

**Referrer policy.** How much of the current URL the browser tells the next site. Default in modern browsers: `strict-origin-when-cross-origin`.

## AI and crawling

**Training crawler.** Downloads pages to build a model. `GPTBot`, `ClaudeBot`, `CCBot`.

**Answer-time fetcher.** Downloads a page because a user just asked something. `OAI-SearchBot`, `Claude-User`, `ChatGPT-User`, `PerplexityBot`. Blocking these removes you from the answers.

**Control token.** A `robots.txt` name with no crawler behind it, existing only so you can opt out. `Google-Extended` and `Applebot-Extended`.

**AI Overviews / AI Mode.** Google's generated summaries above and instead of ordinary results. No special markup makes you eligible.

**Query fan-out.** AI Mode running several related searches at once for a single question.

**llms.txt.** A community-proposed Markdown file at the site root giving AI agents a clean map of the site. Widely adopted, not a standard, not required by Google.

**IndexNow.** A protocol for pushing "this URL changed" notifications to participating search engines instead of waiting for a crawl.

## Measurement

**Search Console.** Google's free site dashboard: indexing state, chosen canonicals, structured data errors, and search performance.

**URL Inspection.** The Search Console tool showing what Google did with one specific URL, including the canonical it picked.

**Rich Results Test.** Google's tool for checking whether markup produces a rich result, on a live URL or pasted code.

**Core Web Vitals.** Google's loading, interaction, and layout-stability measurements. Not metadata, but part of the same search picture, and influenced by what you put in `<head>`.
