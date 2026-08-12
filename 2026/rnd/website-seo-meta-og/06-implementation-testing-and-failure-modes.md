# Implementation, testing, and failure modes

How to ship metadata in a modern framework, how to prove it works, and the fifteen ways it breaks.

## 1. Next.js: the metadata API

Next.js generates the tags for you. Hand-writing `<head>` in an App Router project fights the framework. Two exports do the work.

### Static metadata

```tsx
// app/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://example.com'),
  title: {
    default: 'Example',
    template: '%s | Example',
  },
  description: 'Tools for widget makers.',
  alternates: {
    canonical: '/',
    languages: { 'en-US': '/en-US', 'pt-PT': '/pt-PT' },
  },
  openGraph: {
    type: 'website',
    siteName: 'Example',
    locale: 'en_US',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Example' }],
  },
  twitter: { card: 'summary_large_image', creator: '@example' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
}
```

### Dynamic metadata

```tsx
// app/blog/[slug]/page.tsx
import type { Metadata } from 'next'

export async function generateMetadata({ params }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
      images: [{ url: post.ogImage, width: 1200, height: 630, alt: post.title }],
    },
  }
}
```

### Behaviour worth memorising

From the [Next.js reference](https://nextjs.org/docs/app/api-reference/functions/generate-metadata):

- **Server Components only.** Metadata resolves on the server before the page renders.
- **You cannot export both** `metadata` and `generateMetadata` from the same route segment.
- **`metadataBase` unlocks relative paths.** Without it, a relative URL in a metadata field is a build error.
- **Merging is shallow.** A child that sets any `openGraph` field replaces the parent's whole `openGraph` object. Share pieces through a variable and spread them.
- **`title.template` applies to children only**, never to the segment that declares it, and needs a `default` alongside it. `title.absolute` ignores the parent template.
- **File conventions win.** `favicon.ico`, `icon.*`, `apple-icon.*`, `opengraph-image.*`, `twitter-image.*`, `robots.ts`, `sitemap.ts`, and `manifest.ts` override the config exports.
- **Streaming metadata.** Since v15.2, Next.js can send the initial UI before `generateMetadata` resolves, appending the tags near `<body>`. It detects HTML-only bots such as `facebookexternalhit` by user agent and blocks rendering for them so their tags land in `<head>`. Override the list with `htmlLimitedBots`, or disable streaming with `htmlLimitedBots: /.*/`.
- **`themeColor`, `colorScheme`, and `viewport` moved** out of `metadata` into `generateViewport` as of v13.2.

### Structured data in Next.js

There is no metadata field for JSON-LD. Render the script in the component:

```tsx
export default async function Page({ params }) {
  const post = await getPost((await params).slug)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    datePublished: post.publishedAt,
    author: [{ '@type': 'Person', name: post.author }],
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article>{/* ... */}</article>
    </>
  )
}
```

### Generated share images

`opengraph-image.tsx` renders an image per route at build or request time, so every post gets its own card without a designer in the loop. It emits the `og:image` tags, including width and height, automatically.

## 2. Other stacks, in one line each

| Stack | Where metadata lives |
|---|---|
| Astro | Props on a layout component, or the `astro-seo` component |
| SvelteKit | `<svelte:head>` in `+page.svelte`, fed by `+page.server.ts` load data |
| Nuxt | `useSeoMeta()` and `useHead()` |
| Remix / React Router | The `meta` export per route |
| Rails | `content_for :head` in the layout, or the `meta-tags` gem |
| Django | Template blocks in `base.html` |
| WordPress | Yoast, Rank Math, or SEOPress. Do not hand-edit the theme header |
| Plain HTML | A build step or an include. Never copy-paste per page |

The rule underneath all of them: metadata comes from the same data that renders the page. Anything hand-maintained drifts.

## 3. Test tools

| Tool | URL | Tests |
|---|---|---|
| Google Rich Results Test | `search.google.com/test/rich-results` | Structured data eligibility, rendered HTML |
| Google Search Console URL Inspection | `search.google.com/search-console` | Live crawl, chosen canonical, indexing state |
| Schema Markup Validator | `validator.schema.org` | schema.org validity |
| Facebook Sharing Debugger | `developers.facebook.com/tools/debug/` | Facebook card, cache refresh, tag errors |
| LinkedIn Post Inspector | `linkedin.com/post-inspector/` | LinkedIn card, cache refresh |
| Pinterest Rich Pins Validator | `developers.pinterest.com/tools/url-debugger/` | Rich Pin type detection |
| Telegram `@WebpageBot` | Telegram app | Telegram preview cache refresh |
| X composer | `x.com` draft post | The only reliable X card preview since the validator retired |
| Slack / Discord test channel | Your own workspace | Real unfurl behaviour |
| Lighthouse SEO audit | Chrome DevTools | Title, description, canonical, crawlability, plus an `llms.txt` check |

Command-line check of what a crawler really sees:

```bash
curl -sL -A "facebookexternalhit/1.1" https://example.com/page | grep -iE '<title|og:|twitter:|canonical'
```

## 4. A release checklist

Before a page goes live:

- [ ] `curl` the URL with JavaScript out of the picture; title, description, canonical, and `og:*` are all present
- [ ] Title and description are unique across the site
- [ ] Canonical is absolute, returns 200, and is not `noindex`
- [ ] `og:url` matches the canonical
- [ ] `og:image` is absolute, HTTPS, 1200 x 630, under 300 KB, with alt text
- [ ] `twitter:card` is `summary_large_image`
- [ ] Structured data passes the Rich Results Test with zero errors
- [ ] Every marked-up fact is visible on the page
- [ ] `robots.txt` allows the page
- [ ] The page is in the sitemap with an honest `lastmod`
- [ ] The card looks right in the Facebook debugger, the LinkedIn inspector, an X draft, and a Slack or Discord message
- [ ] `hreflang` links are reciprocal, if the page is translated
- [ ] AI crawler rules match a decision someone actually made

After a metadata change:

- [ ] Re-run the Facebook Sharing Debugger to refresh the cache
- [ ] Re-run the LinkedIn Post Inspector
- [ ] Publish a changed image under a new filename
- [ ] Ping IndexNow if you use it
- [ ] Watch Search Console coverage for the next crawl

## 5. Fifteen ways metadata breaks

| # | Symptom | Cause | Fix |
|---|---|---|---|
| 1 | Cards empty on every platform, fine in Google | Tags injected client-side | Render server-side or pre-render |
| 2 | No image anywhere | Relative `og:image` path | Absolute `https://` URL |
| 3 | Old image survives every fix | Platform cache keyed on URL | New filename plus a debugger refresh |
| 4 | Only WhatsApp misses the image | Over 600 KB, or tags past the first 300 KB of HTML | Compress; move meta to the top of `<head>` |
| 5 | Only Discord misses the image | Plain HTTP image URL | Serve over HTTPS |
| 6 | Small thumbnail instead of a big card | `twitter:card` missing or `summary` | Set `summary_large_image` |
| 7 | Every link previews as the home page | `og:url` hardcoded to the root | Emit the page's own canonical |
| 8 | Google shows a title you did not write | Title is boilerplate, stuffed, or contradicted by the visible heading | Write a specific title matching the visible `<h1>` |
| 9 | Google ignores your description | It judged page text more useful for that query | Expected behaviour, not a bug. Make the description specific |
| 10 | Page will not leave the index | `noindex` on a page blocked by robots.txt | Allow crawling so the directive can be read |
| 11 | Wrong canonical chosen | Conflicting signals, or a JavaScript override | One canonical, in the HTML, matching sitemap and internal links |
| 12 | `hreflang` ignored entirely | Missing return links or self-reference | Every version lists every version, itself included |
| 13 | Rich result never appears | Marked-up facts are not visible on the page | Show the data, or drop the markup |
| 14 | Traffic drops after a robots.txt change | An answer-time fetcher was blocked with the training crawlers | Separate the two lists |
| 15 | Duplicate tags with different values | A framework plus a plugin both emitting metadata | Pick one owner for `<head>` |

## 6. Performance-adjacent head tags

Not metadata, but they share the `<head>` and affect Core Web Vitals, which affect search:

```html
<link rel="preconnect" href="https://fonts.example.com" crossorigin>
<link rel="dns-prefetch" href="https://cdn.example.com">
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
```

- `preconnect` opens the network connection early. Use it for two or three origins at most; each one costs a connection.
- `dns-prefetch` only resolves the name. Cheaper, weaker.
- `preload` fetches a specific file early. Wrong `as` values make it a pure waste.

In Next.js these go through `ReactDOM.preload`, `ReactDOM.preconnect`, and `ReactDOM.prefetchDNS` rather than the metadata API, and `next/font`, `next/image`, and `next/script` handle most of it for you.

## Sources

- [Next.js generateMetadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
- Failure modes are drawn from the constraints documented in [head essentials](01-head-essentials-and-indexing.md) and [Open Graph](02-open-graph-and-social-cards.md), not from a measured incident sample.
