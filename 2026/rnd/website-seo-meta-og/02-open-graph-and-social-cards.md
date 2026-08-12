# Open Graph and social cards

How a pasted link turns into a card with a title, a blurb, and a picture, and which tags each platform reads.

## 1. What Open Graph is

Open Graph is a small vocabulary of `<meta>` tags, published at [ogp.me](https://ogp.me/), that lets a page describe itself to any program that wants to display it as an object rather than as a web page. Facebook created it; almost every chat app and social network now reads it.

It uses `property=`, not `name=`:

```html
<meta property="og:title" content="The Rock">
```

Four properties are required by the specification:

| Property | Meaning | Example |
|---|---|---|
| `og:title` | The name of the thing, without site branding | `The Rock` |
| `og:type` | What kind of thing it is | `video.movie` |
| `og:image` | A picture representing it | `https://example.com/rock.jpg` |
| `og:url` | Its permanent address | `https://www.imdb.com/title/tt0117500/` |

## 2. The full Open Graph vocabulary

### Core optional properties

| Property | Purpose |
|---|---|
| `og:description` | One or two sentences about the page |
| `og:site_name` | The name of the whole site, for example `IMDb` |
| `og:locale` | Language and territory, format `language_TERRITORY`, default `en_US` |
| `og:locale:alternate` | Other language versions available. Repeat the tag |
| `og:determiner` | The word before the title: `a`, `an`, `the`, blank, or `auto` |
| `og:audio` | A sound file for the page |
| `og:video` | A video file for the page |

### Structured sub-properties

Images and videos take a set of child tags. Each new root tag starts a fresh set.

```html
<meta property="og:image" content="https://example.com/og.jpg">
<meta property="og:image:secure_url" content="https://example.com/og.jpg">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="A shiny red apple with a bite taken out">
```

`og:video` accepts the same children except `alt`. `og:audio` accepts only `url`, `secure_url`, and `type`, because sound has no dimensions.

**Arrays:** repeat the root tag for multiple values. The specification says the first one takes priority when a consumer wants only one. That is why one `og:image` per page is the safe choice.

### Object types and their extra properties

| `og:type` | Extra properties |
|---|---|
| `website` | None beyond the required four |
| `article` | `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag` |
| `book` | `book:author`, `book:isbn`, `book:release_date`, `book:tag` |
| `profile` | `profile:first_name`, `profile:last_name`, `profile:username`, `profile:gender` |
| `video.movie`, `video.episode`, `video.tv_show`, `video.other` | `video:actor`, `video:actor:role`, `video:director`, `video:writer`, `video:duration`, `video:release_date`, `video:tag`, plus `video:series` for episodes |
| `music.song`, `music.album`, `music.playlist`, `music.radio_station` | `music:duration`, `music:album`, `music:album:disc`, `music:album:track`, `music:musician`, `music:song`, `music:creator`, `music:release_date` |
| `payment.link` (beta) | `payment:description`, `payment:currency`, `payment:amount`, `payment:expires_at`, `payment:status`, `payment:id`, `payment:success_url` |

An article page in practice:

```html
<meta property="og:type" content="article">
<meta property="article:published_time" content="2026-08-11T09:00:00Z">
<meta property="article:modified_time" content="2026-08-11T14:30:00Z">
<meta property="article:author" content="https://example.com/authors/jane">
<meta property="article:section" content="Engineering">
<meta property="article:tag" content="metadata">
```

### Namespaces

Built-in types use a dot (`music.song`). Custom types use a colon and need a declared prefix:

```html
<head prefix="my_namespace: https://example.com/ns#">
<meta property="og:type" content="my_namespace:my_type">
```

The `prefix="og: https://ogp.me/ns#"` declaration on `<html>` appears in the specification's example. In practice every consumer parses `og:` tags without it, so it is optional in the wild.

## 3. X (Twitter) cards

X reads its own `twitter:` tags, and falls back to Open Graph when they are missing. Note the attribute change: `name=`, not `property=`.

```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@example">
<meta name="twitter:creator" content="@janedoe">
<meta name="twitter:title" content="Page title">
<meta name="twitter:description" content="One or two sentences.">
<meta name="twitter:image" content="https://example.com/og.jpg">
<meta name="twitter:image:alt" content="What the image shows.">
```

| Card type | What it renders |
|---|---|
| `summary` | Small square thumbnail beside the text |
| `summary_large_image` | Full-width image above the text |
| `app` | A direct app-install card |
| `player` | An embedded video or audio player |

Other tags in the family: `twitter:site:id`, `twitter:creator:id`, `twitter:player`, `twitter:player:width`, `twitter:player:height`, `twitter:player:stream`, and the `twitter:app:name:*`, `twitter:app:id:*`, `twitter:app:url:*` sets for iPhone, iPad, and Google Play. The [Next.js metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) documents and generates all of them, which is useful independent confirmation of the tag names.

**Evidence note:** X's own card documentation returned HTTP 402 (payment required) on 2026-08-11, so the numbers below are second-hand and should be re-checked before you rely on them.

Second-hand image constraints for `summary_large_image`: minimum 300 x 157 pixels, maximum 4096 x 4096, under 5 MB, in JPG, PNG, WEBP, or GIF, centre-cropped to roughly 2:1.

**X's preview tool is gone.** The card validator stopped previewing in 2022. To check a card, start a draft post in the X composer, or use a third-party preview tool.

## 4. Which platform reads what

| Consumer | Tags it reads | Image handling | Refresh path |
|---|---|---|---|
| **Facebook** | `og:url`, `og:title`, `og:description`, `og:image`, `fb:app_id` | Cached by image URL. `og:image:width`/`height` let it render on the first share | Sharing Debugger |
| **LinkedIn** | `og:title`, `og:description`, `og:image`, `og:url` | 1200 x 627, 1.91:1 (second-hand) | Post Inspector |
| **X** | `twitter:*`, falls back to `og:*` | Centre-cropped to the card shape | No official tool. Draft a post |
| **Slack** | Open Graph and X card metadata (official wording), plus oEmbed for known domains | Follows the card metadata | Re-paste after cache expiry, or use an app unfurl |
| **Discord** | `og:*` plus `twitter:card` for large-versus-thumbnail, and `theme-color` for the card's left border stripe (second-hand) | HTTPS only (second-hand) | Cache expiry |
| **WhatsApp** | `og:title`, `og:description`, `og:url` required and non-empty; `og:image` optional | Under 600 KB, at least 300 px wide, aspect no taller than 4:1 | Re-send after cache expiry |
| **Telegram** | `og:title`, `og:description`, `og:image` (second-hand) | Large preview needs roughly 1200 x 630 (second-hand) | `@WebpageBot` |
| **Pinterest** | Open Graph or schema.org, whichever is present | Rich Pin layout by type | Rich Pins validator |
| **Mastodon** | `og:*` plus `fediverse:creator` for the author byline | Standard card | Re-fetch on next share |
| **Google** | `og:title` as one title source, `og:site_name` as one site-name source. Does **not** use `og:description` for snippets | Search image previews come from page images, not `og:image` | URL Inspection |

### The details worth knowing per platform

**Facebook.** Its [webmasters documentation](https://developers.facebook.com/docs/sharing/webmasters/) names four essential tags and says `og:url` "should be the undecorated URL, without session variables, user identifying parameters, or counters". Mobile and desktop versions should share one canonical so engagement counts add up. `fb:app_id` is what unlocks Facebook Insights traffic data. The [best practices page](https://developers.facebook.com/docs/sharing/best-practices/) recommends images at least 1080 pixels wide for high-resolution screens, a 1.91:1 rectangle, and running the URL through the Sharing Debugger to pre-fetch metadata whenever the image changes.

**WhatsApp.** The only platform publishing precise, official numbers ([Meta business messaging docs](https://developers.facebook.com/documentation/business-messaging/whatsapp/link-previews/)): tags must appear within the first 300 KB of the page, the image must be under 600 KB and at least 300 pixels wide with an aspect ratio no taller than 4:1, and `og:title`, `og:description`, `og:url` must all be present and non-empty. The description "80 characters will suffice". WhatsApp sends an `Accept-Language` header, so you may localize the preview. Allow up to 10 seconds in the composer for the preview to appear.

**Slack.** [Slack's documentation](https://docs.slack.dev/messaging/unfurling-links-in-messages/) describes two systems. Classic unfurling reads "common OpenGraph and X (formerly known as Twitter) Card metadata" and renders an approximation. App unfurling fires a `link_shared` event to an app registered for your domain, which then posts a custom Block Kit preview through `chat.unfurl`. Media links unfurl by default; text pages need the `unfurl_links` parameter when posted by an app.

**Discord.** Discord publishes no formal specification. Community documentation consistently reports that it reads Open Graph, uses `twitter:card` to decide between a large image and a right-hand thumbnail, colours the card's left border from the `theme-color` meta tag, and refuses plain HTTP image URLs. Treat these as second-hand.

**Pinterest.** [Rich Pins](https://developers.pinterest.com/docs/web-features/rich-pins-overview/) read Open Graph or schema.org. Three types exist: Article, Product, Recipe. When a page carries markup for several, Pinterest applies Product first, then Recipe, then Article. Opt out with:

```html
<meta name="pinterest-rich-pin" content="false">
```

**Mastodon.** Version 4.3 added `fediverse:creator`, which puts a "more from" byline linking to the author's fediverse profile on the link card (second-hand):

```html
<meta name="fediverse:creator" content="@jane@mastodon.social">
```

It only takes effect after the domain is added to the "Websites allowed to credit you" author-attribution field in the account's verification settings.

## 5. The share image

One image satisfies everything:

| Property | Value | Why |
|---|---|---|
| Dimensions | 1200 x 630 | Fits the 1.91:1 shape Facebook and LinkedIn render and X's large card |
| Format | JPG or PNG | Universally supported. WebP and GIF are unreliable on Telegram |
| File size | Under 300 KB | Clears WhatsApp's limit with margin |
| Protocol | `https://` | Discord rejects plain HTTP |
| URL | Absolute | Relative paths break every platform |
| Alt text | Always | `og:image:alt` is the only accessible description in the card |

Two habits that pay off:

- **Version the filename.** Facebook caches by image URL, so `og-v2.jpg` is a guaranteed refresh where re-uploading `og.jpg` is not.
- **Declare width and height.** Meta says these let the crawler "render the image immediately without having to asynchronously download and process it", and Discord uses them to pick its layout.

Keep important text inside the middle 80% of the image. Platforms crop to their own shapes, and X centre-crops.

## 6. oEmbed: when your page should embed elsewhere

Open Graph describes a page. oEmbed hands another site the actual HTML to embed it, which is how a YouTube link becomes a playing video rather than a picture. It matters if you publish embeddable content: videos, charts, interactive widgets.

Discovery goes in `<head>`:

```html
<link rel="alternate" type="application/json+oembed"
      href="https://example.com/oembed?url=https%3A%2F%2Fexample.com%2Fvideo%2F123&format=json"
      title="Video oEmbed Profile">
```

The `type` must be `application/json+oembed` or `text/xml+oembed`. Consumers call your endpoint with `url` (required), and optionally `maxwidth`, `maxheight`, and `format`.

| Response type | Required fields |
|---|---|
| `photo` | `url`, `width`, `height` |
| `video` | `html`, `width`, `height` |
| `link` | none beyond `type` and `version` |
| `rich` | `html`, `width`, `height` |

Every response carries `type` and `version` (always `"1.0"`), plus optional `title`, `author_name`, `provider_name`, and thumbnails. Full specification at [oembed.com](https://oembed.com/).

## 7. Common card failures and their fixes

| Symptom | Cause | Fix |
|---|---|---|
| No image anywhere | `og:image` is a relative path | Use the full `https://` URL |
| Card empty on Facebook and Slack, fine on Google | Tags injected by JavaScript | Render metadata server-side |
| Old image keeps appearing | Platform cache keyed on URL | Publish at a new filename, then re-run the debugger |
| Image missing only on WhatsApp | File over 600 KB, or tags past the first 300 KB of HTML | Compress the image, move meta tags to the top of `<head>` |
| Image missing only on Discord | `http://` image URL | Serve over HTTPS |
| Small thumbnail instead of a big image on X or Discord | `twitter:card` absent or set to `summary` | Set `summary_large_image` |
| Wrong page title in the card | Duplicate `og:title` tags | Keep one; the first wins |
| Card shows the home page for every link | `og:url` hardcoded to the site root | Emit the page's own canonical URL |
| Preview works logged in, fails when shared | Crawler blocked by robots.txt, a firewall, or bot protection | Allow the platform's user agent |

## Sources

- [The Open Graph protocol](https://ogp.me/)
- [Facebook sharing for webmasters](https://developers.facebook.com/docs/sharing/webmasters/)
- [Facebook sharing best practices](https://developers.facebook.com/docs/sharing/best-practices/)
- [WhatsApp link previews](https://developers.facebook.com/documentation/business-messaging/whatsapp/link-previews/)
- [Slack: unfurling links in messages](https://docs.slack.dev/messaging/unfurling-links-in-messages/)
- [Pinterest Rich Pins overview](https://developers.pinterest.com/docs/web-features/rich-pins-overview/)
- [oEmbed specification](https://oembed.com/)
- [Next.js generateMetadata reference](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) (used to confirm X and app-link tag names)
- Second-hand: X card image constraints, LinkedIn image sizes and cache window, Discord behaviour, Telegram behaviour, Mastodon `fediverse:creator`. See [methodology](08-methodology-and-sources.md) for the specific pages.
