# Website metadata, Open Graph, and SEO: executive playbook

**Created:** 2026-08-11
**Audience:** web engineers, technical marketers, content owners, reviewers
**Scope:** the tags a page puts in its `<head>` (plus the two files at the site root) that decide how search engines, chat apps, social networks, and AI assistants read, index, and display the page
**Evidence boundary:** official documentation from Google, Meta, Slack, Pinterest, Apple, Anthropic, OpenAI, Mozilla, Next.js, the Open Graph protocol, oEmbed, and IndexNow, read on 2026-08-11. X (Twitter) card documentation was unreachable (HTTP 402), so X specifics are marked as second-hand. No live crawl or A/B test was run.

## Terms used everywhere in this report

- **Metadata:** information *about* the page rather than the page content. Most of it lives in `<head>` as `<meta>` and `<link>` tags.
- **Crawler (or bot):** a program that downloads your page automatically. Googlebot is one. So is the fetcher behind a WhatsApp link preview.
- **Unfurl:** what a chat app does when you paste a link and it turns into a card with a title, a blurb, and a picture.
- **Canonical URL:** the one address you want counted as the real one when the same page is reachable at several addresses.
- **Structured data:** facts about the page written in a machine format (usually JSON) so a search engine does not have to guess them from prose.

## Result

Most sites need far fewer tags than the average "SEO checklist" implies, and they need them in the right layer. Three layers do almost all the work:

1. **Ten tags on every page** decide indexing and how the page looks in search and in chat previews.
2. **Two files at the site root** (`robots.txt`, `sitemap.xml`) decide what gets crawled and how fast changes are found.
3. **One JSON block** (structured data) unlocks the richer search result formats, and only for the page types Google actually supports.

Everything else is conditional: add it when the page type, the platform, or the app you ship needs it.

Two rules explain most real-world breakage:

- **Preview crawlers usually do not run JavaScript.** If your tags are injected in the browser, Facebook, WhatsApp, LinkedIn, Slack, and Discord see an empty card. Googlebot does render JavaScript, but on a delay and with caveats. Put metadata in the HTML the server sends.
- **Previews are cached by URL, not by page.** Fixing a bad image and re-sharing the same link changes nothing until you either force a refresh in the platform's debugger or publish the image at a new URL. Meta states this directly: images "are cached based on the URL and won't be updated unless the URL changes" ([Facebook webmasters docs](https://developers.facebook.com/docs/sharing/webmasters/)).

## The ten-tag baseline

Copy this block into every page and fill it in. Nothing here is optional for a public page.

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <title>Page-specific title, then site name</title>
  <meta name="description" content="One or two plain sentences describing this page only.">
  <link rel="canonical" href="https://example.com/exact/page/url">

  <meta property="og:type" content="website">
  <meta property="og:url" content="https://example.com/exact/page/url">
  <meta property="og:title" content="Page-specific title">
  <meta property="og:description" content="One or two plain sentences.">
  <meta property="og:site_name" content="Example">
  <meta property="og:image" content="https://example.com/og/page.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="What the image shows, in words.">

  <meta name="twitter:card" content="summary_large_image">

  <link rel="icon" href="/favicon.ico" sizes="32x32">
  <link rel="icon" href="/icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
</head>
```

Why each line is there:

| Line | What breaks without it |
|---|---|
| `lang` on `<html>` | Screen readers pick the wrong voice; translation signals get weaker |
| `charset` | Accented characters render as mojibake. Keep it first: browsers only scan the opening bytes for it |
| `viewport` | The page renders zoomed-out on phones. Google treats the tag's presence as a mobile-friendliness signal ([Google special tags](https://developers.google.com/search/docs/crawling-indexing/special-tags)) |
| `title` | Google's top source for the blue link text ([Google title link](https://developers.google.com/search/docs/appearance/title-link)) |
| `description` | Google writes its own snippet, often from the page's first paragraph |
| `canonical` | Duplicate addresses split their signals; Google picks a version for you |
| `og:*` | Every chat and social preview falls back to guessing from page text |
| `og:image:width` / `height` | Slow first share, and Discord cannot decide big image versus small thumbnail before downloading |
| `og:image:alt` | Blind users get a picture with no description in the preview card |
| `twitter:card` | X shows a small thumbnail instead of the large card, and Discord follows the same tag |
| icons | The tab and search result show a generic globe |

## Priority tiers

| Tier | Add it | Tags and files |
|---|---|---|
| 1. Always | Every public page | `charset`, `viewport`, `title`, `description`, `canonical`, `og:type/url/title/description/image` (+ width, height, alt), `og:site_name`, `twitter:card`, icons |
| 2. Site level | Once per site | `robots.txt`, `sitemap.xml`, `WebSite` and `Organization` structured data on the home page, `site.webmanifest`, `theme-color` |
| 3. Conditional | When the page type calls for it | `article:*` tags, `Article`/`Product`/`Event`/`FAQ` structured data, `BreadcrumbList`, `hreflang`, `robots` directives, `oEmbed` discovery link |
| 4. Platform specific | When you use that platform | `fb:app_id`, `twitter:site`/`creator`, `fediverse:creator`, `pinterest-rich-pin`, `apple-itunes-app`, `al:*` app links |
| 5. Rarely useful | Almost never | `keywords`, `author` as an SEO play, `revisit-after`, `msapplication-*`, `X-UA-Compatible` |

## Non-negotiable defaults

- Give every page its own title and description. Boilerplate repeated site-wide is on Google's list of title problems.
- Make every URL in metadata absolute, starting with `https://`. Relative paths in `og:image` and `canonical` are the single most common broken-preview cause.
- Ship metadata in the server's HTML response. Client-side injection loses every preview crawler.
- One `og:image` per page unless you truly want alternatives. When several are present the first one wins, and WhatsApp takes the first it finds.
- Use 1200 x 630 pixels for the share image. It satisfies the 1.91:1 shape Facebook and LinkedIn render, and X's large card, from one file.
- Keep the share image under 300 KB. That single number clears WhatsApp's limit and every other platform's, with room to spare.
- Never point `canonical` at a page that also carries `noindex`. Google names that combination as a mistake.
- Do not use `robots.txt` to hide a page from search. It blocks the download, not the listing. The URL can still appear without a snippet.
- Do not set `user-scalable=no` or `maximum-scale=1` in the viewport tag. It blocks zoom for people with low vision.
- Write structured data only for facts a visitor can see on the page. Marking up invisible or fake content is what triggers a manual penalty.
- Check the rendered HTML, not your source template. What the crawler sees is what counts.

## What is genuinely new since 2024

- **AI assistants read your site through two doors, and you control them separately.** Training crawlers (GPTBot, ClaudeBot, Google-Extended) and answer-time fetchers (OAI-SearchBot, Claude-User, ChatGPT-User) are different user agents with different consequences. Blocking the first does not block the second.
- **You do not need new files to appear in AI answers on Google.** Google states it plainly: "You don't need to create new machine readable files, AI text files, or markup to appear in these features" ([Google AI features](https://developers.google.com/search/docs/appearance/ai-features)). `llms.txt` is a community proposal with real adoption, not a search requirement.
- **X removed its preview tool.** The card validator no longer previews. Test by drafting a post in the X composer, or use a third-party checker.
- **Mastodon added author credit.** `fediverse:creator` puts a "more from" byline on your link cards, and it only works if you also list the domain in your Mastodon profile settings.
- **Frameworks now own metadata.** In Next.js, hand-writing `<head>` tags is the wrong move: the metadata API merges parent and child values and generates the tags, and it changes how they stream to bots.

## Definition of done

A page's metadata is finished when:

- The rendered HTML, fetched with JavaScript off, contains title, description, canonical, and the full `og:` set.
- Title and description describe this page and no other page on the site.
- Canonical is absolute, resolves with HTTP 200, and points at a page that is not `noindex`.
- The share image loads over `https://`, is 1200 x 630, is under 300 KB, and has alt text.
- The card looks right in the Facebook Sharing Debugger, the LinkedIn Post Inspector, a Slack or Discord test channel, and an X draft post.
- Structured data passes Google's Rich Results Test with no errors, and every marked-up fact is visible on the page.
- `robots.txt` allows the page, and the sitemap lists it with an honest `lastmod`.
- Search Console's URL Inspection shows the canonical Google picked, and it matches yours.
- Crawler rules for AI training and AI answers reflect a decision someone actually made, rather than a copied default.

## Report map

- [Head essentials and indexing control](01-head-essentials-and-indexing.md)
- [Open Graph and social cards](02-open-graph-and-social-cards.md)
- [Structured data](03-structured-data.md)
- [Icons, PWA, app, and browser tags](04-icons-pwa-app-and-browser-tags.md)
- [Crawler and AI agent controls](05-crawler-and-ai-agent-controls.md)
- [Implementation, testing, and failure modes](06-implementation-testing-and-failure-modes.md)
- [Glossary](07-glossary.md)
- [Methodology, coverage, limitations, and sources](08-methodology-and-sources.md)
