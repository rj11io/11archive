# Head essentials and indexing control

What every page declares about itself, and how you tell search engines what to crawl, index, and show.

## 1. The document basics

| Tag | Value to use | Notes |
|---|---|---|
| `<html lang>` | `en`, `pt-PT`, `zh-Hans` | Language of the page's main text. Helps screen readers and translation |
| `<meta charset>` | `utf-8` | Put it first inside `<head>`. Browsers stop looking for it after the opening bytes |
| `<title>` | Unique per page | Google's top source for the result title |
| `<meta name="description">` | Unique per page | Feeds the grey snippet text under the title |
| `<meta name="viewport">` | `width=device-width, initial-scale=1` | Controls mobile layout |

### Viewport values

Every directive the viewport tag accepts, from [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Viewport_meta_element):

| Directive | Values | Use |
|---|---|---|
| `width` | `device-width` or 1 to 10000 | Almost always `device-width` |
| `height` | `device-height` or 1 to 10000 | Rarely needed |
| `initial-scale` | 0.0 to 10.0 | Set to `1` |
| `minimum-scale` / `maximum-scale` | 0.0 to 10.0 | Leave unset |
| `user-scalable` | `yes` / `no` | Leave unset. `no` blocks zoom |
| `viewport-fit` | `auto` / `contain` / `cover` | `cover` draws under a phone notch |
| `interactive-widget` | `resizes-visual` / `resizes-content` / `overlays-content` | How the on-screen keyboard affects layout |

MDN is explicit that `user-scalable=no` and `maximum-scale=1.0` harm people with low vision. WCAG expects at least 2x zoom.

## 2. Title and description, as Google actually treats them

Google's [title link documentation](https://developers.google.com/search/docs/appearance/title-link) lists the sources it draws the result title from, in order of weight:

1. `<title>`
2. The main visible title on the page
3. `<h1>` and other headings
4. `og:title`
5. Styled, prominent text
6. Page body text
7. Anchor text of links pointing at the page
8. Structured data

**There is no character limit.** Google says the title link "is truncated in Google Search results as needed, typically to fit the device width". The same wording appears for descriptions. Treat roughly 60 characters for titles and roughly 155 for descriptions as a *display budget*, not a rule: put the important words first so truncation costs you nothing.

Google's named title problems: missing titles, boilerplate repeated across pages, keyword-stuffed titles, titles in a different language from the page, inaccurate titles, and a site name repeated so often it crowds out the specific part.

For descriptions, Google's [snippet documentation](https://developers.google.com/search/docs/appearance/snippet) says it uses the meta description only when it "might give users a more accurate description of the page than content taken directly from the page". Different searches on the same page can produce different snippets. Programmatic generation is fine for large sites as long as the result is readable and specific.

## 3. Canonical: one page, one address

The problem: `example.com/shoes`, `example.com/shoes?ref=twitter`, and `example.com/shoes/` can all serve the same page. Left alone, their signals split.

```html
<link rel="canonical" href="https://example.com/shoes">
```

For files that are not HTML, such as a PDF, use the HTTP header instead:

```
Link: <https://example.com/white-paper.pdf>; rel="canonical"
```

Google's [canonicalization guide](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls) ranks the signals it weighs:

1. Redirects (strongest)
2. `rel="canonical"`
3. Presence in the sitemap
4. Internal links
5. `hreflang` groups
6. HTTPS over HTTP

Rules that matter:

- Put a canonical on the canonical page too, pointing at itself.
- Use absolute URLs. No relative paths, no `#fragments`.
- Do not give the same page different canonicals through different methods.
- Do not use `robots.txt` or the removal tool to pick a canonical.
- Do not combine `noindex` with a canonical on a duplicate page.
- Prefer the HTML source over JavaScript. If JavaScript sets it, it must set the same value the HTML already had.

Google treats your canonical as a strong hint, not a command. Search Console's URL Inspection shows the canonical Google actually chose.

## 4. Robots directives: what to index and what to show

Two ways to say the same thing. Use the meta tag for HTML pages, the header for everything else.

```html
<meta name="robots" content="noindex, nofollow">
```

```
X-Robots-Tag: noindex, nofollow
```

Full directive list, from [Google's robots meta tag specification](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag):

| Directive | Effect |
|---|---|
| `all` | Default. No restrictions |
| `noindex` | Keep this page out of search results |
| `nofollow` | Do not crawl links on this page |
| `none` | Same as `noindex, nofollow` |
| `nosnippet` | No text snippet and no video preview |
| `indexifembedded` | Allow indexing when embedded in an iframe, despite `noindex` |
| `max-snippet:[n]` | Cap snippet length. `0` means none, `-1` lets Google choose |
| `max-image-preview:[none\|standard\|large]` | Cap image preview size |
| `max-video-preview:[n]` | Cap video preview seconds. `0` means a static image, `-1` means unlimited |
| `notranslate` | Do not offer a translated result |
| `noimageindex` | Do not index images on this page |
| `unavailable_after:[date]` | Drop the page after a date. Accepts RFC 822, RFC 850, or ISO 8601 |

You can target one crawler by name: `<meta name="googlebot" content="noindex">`. Google also honours `googlebot-news`.

**Conflicts resolve to the stricter rule.** Google's example: `max-snippet:50` alongside `nosnippet` produces no snippet at all.

To exclude part of a page from snippets rather than the whole page, use the `data-nosnippet` attribute on a `span`, `div`, or `section`:

```html
<p>Public summary. <span data-nosnippet>Internal note, keep out of snippets.</span></p>
```

It is a boolean attribute: `data-nosnippet="false"` still excludes the content.

**The trap:** a page blocked in `robots.txt` is never downloaded, so its `noindex` is never read. To remove a page from search, allow crawling and serve `noindex`.

## 5. Multiple languages: hreflang

Tell search engines which translations of a page exist, so a Portuguese reader gets the Portuguese one.

```html
<link rel="alternate" hreflang="en" href="https://example.com/en/page">
<link rel="alternate" hreflang="pt-PT" href="https://example.com/pt/page">
<link rel="alternate" hreflang="x-default" href="https://example.com/">
```

From [Google's localized versions guide](https://developers.google.com/search/docs/specialty/international/localized-versions):

- **Return links are mandatory.** If page X lists page Y, page Y must list page X. Missing return links make Google ignore the whole set.
- **Each page must list itself.**
- **Use full URLs**, including `https://`.
- Language codes follow ISO 639-1 (`en`, `de`). Region codes follow ISO 3166-1 Alpha 2 (`en-GB`, `de-CH`). Chinese scripts use ISO 15924 (`zh-Hans`, `zh-Hant`).
- `x-default` is the fallback for visitors whose language matches nothing you offer. A language chooser page is the natural target.
- Region alone is invalid. `be` is Belarusian the language, not Belgium.
- `EU`, `UN`, and `UK` are not valid region codes. Britain is `GB`.

Same information can go in an HTTP header (for PDFs) or inside the XML sitemap with the `xhtml:link` element.

## 6. robots.txt: what may be crawled

One plain text file at the site root. From [Google's robots.txt specification](https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt):

```
User-agent: *
Disallow: /admin/
Allow: /admin/public-page

Sitemap: https://example.com/sitemap.xml
```

| Property | Value |
|---|---|
| Location | Site root only |
| Encoding | UTF-8 plain text |
| Size limit | 500 KiB |
| Cache | Up to 24 hours |
| On 4xx (except 429) | Google assumes no restrictions |
| On 5xx | Google stops crawling for 12 hours, uses the cached file for 30 days, then treats the file as absent |
| Wildcards | `*` matches any characters, `$` anchors the end of a URL |
| Rule precedence | The most specific rule by path length wins; on a tie, the least restrictive wins |
| Sitemap lines | Any number, absolute URLs |

**What robots.txt cannot do:** stop a URL appearing in search. Google's own words: it "can't index the content of pages which are disallowed for crawling, but it may still index the URL".

## 7. Sitemaps: helping discovery

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/page</loc>
    <lastmod>2026-08-11</lastmod>
  </url>
</urlset>
```

From [Google's sitemap guide](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap):

- Limits per file: 50,000 URLs or 50 MB uncompressed. Split with a sitemap index beyond that.
- UTF-8 encoded, full URLs, XML-escaped values.
- **Google uses `lastmod`** when it is "consistently and verifiably accurate". Bumping it for a copyright-year change teaches Google to ignore it.
- **Google ignores `priority` and `changefreq`.** Do not spend time on them.
- Submit through Search Console, through the `Sitemap:` line in robots.txt, or through the Search Console API. Submitting is advisory; it does not guarantee a download.

## 8. Faster updates: IndexNow

IndexNow pushes a "this URL changed" ping instead of waiting for a crawl. Bing and Yandex participate, and submissions are shared between participating engines. From [the IndexNow documentation](https://www.indexnow.org/documentation):

- Key: 8 to 128 characters, using `a-z`, `A-Z`, `0-9`, and dashes.
- Host the key in a UTF-8 text file, normally `https://example.com/<key>.txt`.
- The key file's directory limits which URLs you may submit.

Single URL:

```
https://api.indexnow.org/indexnow?url=https://example.com/page&key=YOUR_KEY
```

Bulk, up to 10,000 URLs per request:

```http
POST /indexnow HTTP/1.1
Content-Type: application/json; charset=utf-8

{
  "host": "example.com",
  "key": "YOUR_KEY",
  "keyLocation": "https://example.com/YOUR_KEY.txt",
  "urlList": ["https://example.com/a", "https://example.com/b"]
}
```

Response codes: `200` accepted, `202` key check pending, `400` bad format, `403` key invalid, `422` URL does not match the host, `429` too many requests.

## 9. When metadata is added by JavaScript

Googlebot renders JavaScript, in three stages: crawl, render, index. Pages that return HTTP 200 are queued for rendering in a headless browser, and that queue can add seconds or much longer. From [Google's JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics):

- Titles and descriptions set by JavaScript **are** picked up during rendering.
- Canonicals set by JavaScript are picked up, but you "shouldn't use JavaScript to change the canonical URL to something else than the URL you specified as the canonical URL in the original HTML".
- A `noindex` in the original HTML can make Google skip rendering, so removing that `noindex` with JavaScript may never take effect.
- Use the History API, not URL fragments, for single-page apps.
- Fingerprint asset filenames. Googlebot caches aggressively and may ignore cache headers.

Social and chat preview crawlers are a different story: treat them as HTML-only. Server-side rendering or pre-rendering is the safe default for anything that must appear in a preview card.

## 10. Head tags worth skipping

| Tag | Verdict |
|---|---|
| `<meta name="keywords">` | Ignored by Google for many years. No benefit |
| `<meta name="revisit-after">` | Never supported by any major engine |
| `<meta http-equiv="X-UA-Compatible">` | Was for Internet Explorer. Dead |
| `<meta name="author">` as an SEO signal | Fine as document metadata, not a ranking input. Use `Article` structured data for authorship |
| `<meta http-equiv="refresh">` | Use a server redirect instead. Google supports the tag but calls redirects better |
| `msapplication-*` | Next.js documents these as "no longer supported in Chromium builds of Microsoft Edge, and thus no longer needed" |

Two `<meta>` tags Google does support and people forget:

```html
<meta name="google" content="nopagereadaloud">      <!-- block text-to-speech reading -->
<meta name="googlebot" content="notranslate">        <!-- do not offer translated results -->
<meta name="google-site-verification" content="...">  <!-- Search Console ownership -->
<meta name="rating" content="adult">                 <!-- SafeSearch labelling -->
```

## Sources

- [Meta tags and attributes Google supports](https://developers.google.com/search/docs/crawling-indexing/special-tags)
- [Robots meta tag specifications](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)
- [Title links](https://developers.google.com/search/docs/appearance/title-link)
- [Snippets](https://developers.google.com/search/docs/appearance/snippet)
- [Canonicalization](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [robots.txt specification](https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt)
- [Build a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [IndexNow documentation](https://www.indexnow.org/documentation)
- [MDN viewport meta element](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Viewport_meta_element)
