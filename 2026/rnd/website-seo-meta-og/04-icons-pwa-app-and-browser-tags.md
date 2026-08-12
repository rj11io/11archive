# Icons, PWA, app, and browser tags

The tags that control the tab icon, the home-screen install, the browser chrome colour, the app banner, and what your links leak to other sites.

## 1. Favicons

The small icon in the browser tab, the bookmark list, and the Google search result.

```html
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
```

Four files cover every surface:

| File | Size | Used by |
|---|---|---|
| `favicon.ico` | 32 x 32 (multi-size ICO is fine) | Older browsers, some feed readers |
| `icon.svg` | Vector | Modern browsers, scales to any density |
| `apple-touch-icon.png` | 180 x 180 | iOS home screen |
| `icon-192.png`, `icon-512.png` | 192 and 512 | Referenced from the web app manifest, used by Android |

Google's [favicon documentation](https://developers.google.com/search/docs/appearance/favicon-in-search) adds constraints for search results:

- Accepted `rel` values: `icon` (preferred), `shortcut icon`, `apple-touch-icon`, `apple-touch-icon-precomposed`.
- Any valid favicon format works. Minimum 8 x 8 pixels; Google recommends larger than 48 x 48 so it looks right on every surface.
- **One favicon per hostname.** `www.example.com` and `docs.example.com` can differ. `example.com/news` cannot differ from `example.com`.
- Both Googlebot and Googlebot-Image must be able to fetch the favicon *and* the home page.
- Keep the URL stable. Frequent changes work against you.
- Google may replace an icon it considers inappropriate, and a favicon is never guaranteed to appear.

## 2. Web app manifest

A JSON file that lets a browser install your site as an app: its name, icons, colours, and start screen.

```html
<link rel="manifest" href="/site.webmanifest">
```

Use `crossorigin="use-credentials"` when the manifest sits behind authentication. The `.webmanifest` extension served as `application/manifest+json` is preferred; `.json` with `application/json` also works.

```json
{
  "id": "/",
  "name": "Example Corporation",
  "short_name": "Example",
  "description": "Tools for widget makers.",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "theme_color": "#0b0b0b",
  "background_color": "#0b0b0b",
  "icons": [
    {"src": "/icon-192.png", "sizes": "192x192", "type": "image/png"},
    {"src": "/icon-512.png", "sizes": "512x512", "type": "image/png"},
    {"src": "/icon-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}
  ]
}
```

Members documented on [MDN](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest): `background_color`, `categories`, `description`, `display`, `display_override`, `file_handlers`, `icons`, `id`, `launch_handler`, `name`, `note_taking`, `orientation`, `prefer_related_applications`, `protocol_handlers`, `related_applications`, `scope`, `scope_extensions`, `screenshots`, `serviceworker`, `share_target`, `short_name`, `shortcuts`, `start_url`, `theme_color`, plus localized `*_localized` variants.

MDN notes that `dir`, `lang`, and `iarc_rating_id` are documented but not implemented.

The `maskable` icon matters on Android: without it the system crops your square icon into a circle and clips the edges.

## 3. Browser chrome colour and dark mode

```html
<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0b0b0b" media="(prefers-color-scheme: dark)">
<meta name="color-scheme" content="light dark">
```

- `theme-color` tints the browser's own interface around the page, mostly on mobile. Community documentation reports Discord also uses it to colour the left border of a link card, which makes it a small branding win in chat.
- `color-scheme` tells the browser which colour schemes the page supports, so form controls and scrollbars match instead of staying stubbornly light.

## 4. Apple-specific tags

### Smart App Banner

A native iOS banner offering your app, shown above the page in Safari.

```html
<meta name="apple-itunes-app" content="app-id=123456789, app-argument=https://example.com/product/42">
```

Parameters (second-hand; Apple's own page did not return readable content on 2026-08-11):

| Parameter | Required | Purpose |
|---|---|---|
| `app-id` | Yes | The App Store identifier |
| `affiliate-data` | No | An iTunes affiliate token |
| `app-argument` | No | A full URL handed to the app on launch, so it opens the same content |

Encode the `app-argument` value, and replace commas with `%2C` because commas separate the parameters.

### Web app on iOS

```html
<meta name="apple-mobile-web-app-title" content="Example">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="mobile-web-app-capable" content="yes">
<link rel="apple-touch-startup-image" href="/startup.png">
```

## 5. App Links: opening a native app instead of the page

The `al:` family, generated by Next.js as `appLinks`, tells a platform which app can handle this URL.

```html
<meta property="al:ios:url" content="example://product/42">
<meta property="al:ios:app_store_id" content="123456789">
<meta property="al:ios:app_name" content="Example">
<meta property="al:android:package" content="com.example.app">
<meta property="al:android:url" content="example://product/42">
<meta property="al:android:app_name" content="Example">
<meta property="al:web:url" content="https://example.com/product/42">
<meta property="al:web:should_fallback" content="true">
```

## 6. Referrer policy: what your links leak

When someone clicks a link off your site, the browser tells the destination where they came from. The referrer policy decides how much it tells.

```html
<meta name="referrer" content="strict-origin-when-cross-origin">
```

Every value, from [MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Referrer-Policy):

| Value | Behaviour |
|---|---|
| `no-referrer` | Send nothing |
| `no-referrer-when-downgrade` | Full URL, except HTTPS to HTTP |
| `origin` | Only the origin, always |
| `origin-when-cross-origin` | Full URL to your own site, origin only to others |
| `same-origin` | Full URL to your own site, nothing to others |
| `strict-origin` | Origin only, and nothing when security downgrades |
| `strict-origin-when-cross-origin` | Full URL to your own site, origin to others, nothing on downgrade |
| `unsafe-url` | Full URL to everyone. Leaks paths and query strings |

`strict-origin-when-cross-origin` has been the browser default since late 2020. Set it explicitly only when you want a stricter policy; the meta tag sets it for the whole document, and `referrerpolicy` on an individual `<a>` overrides it.

## 7. Ownership verification tags

Each service proves you own the site with its own tag. They are inert otherwise.

```html
<meta name="google-site-verification" content="...">     <!-- Google Search Console -->
<meta name="msvalidate.01" content="...">                <!-- Bing Webmaster Tools -->
<meta name="yandex-verification" content="...">          <!-- Yandex Webmaster -->
<meta name="facebook-domain-verification" content="...">  <!-- Meta Business -->
<meta name="p:domain_verify" content="...">              <!-- Pinterest -->
```

Google's requirement: the value must match exactly what Search Console issued.

## 8. Odds and ends

```html
<meta name="format-detection" content="telephone=no">
```

Stops iOS turning every number that looks like a phone number into a link. Use it when your page shows order numbers or version strings.

```html
<link rel="alternate" type="application/rss+xml" title="Example blog" href="/feed.xml">
```

Feed discovery. Feed readers and some AI crawlers look for this.

```html
<meta name="application-name" content="Example">
<meta name="generator" content="Next.js">
<meta name="creator" content="Jane Doe">
<meta name="publisher" content="Example Corporation">
```

Document metadata from the HTML standard and the WHATWG extensions list. Harmless and occasionally useful; none of them affect ranking.

**Skip:** `msapplication-TileColor` and friends. Next.js documents them as "no longer supported in Chromium builds of Microsoft Edge, and thus no longer needed".

## 9. A complete non-essential head, for reference

```html
<!-- install and appearance -->
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0b0b0b" media="(prefers-color-scheme: dark)">
<meta name="color-scheme" content="light dark">

<!-- privacy and behaviour -->
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta name="format-detection" content="telephone=no">

<!-- discovery -->
<link rel="alternate" type="application/rss+xml" title="Example blog" href="/feed.xml">
<link rel="sitemap" type="application/xml" href="/sitemap.xml">
```

## Sources

- [Favicons in Google Search](https://developers.google.com/search/docs/appearance/favicon-in-search)
- [MDN web app manifest](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest)
- [MDN meta name values](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name)
- [MDN Referrer-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Referrer-Policy)
- [Next.js generateMetadata reference](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) (app links, Apple web app tags, `msapplication-*` status)
- Second-hand: Apple Smart App Banner parameters, Discord `theme-color` behaviour. See [methodology](08-methodology-and-sources.md).
