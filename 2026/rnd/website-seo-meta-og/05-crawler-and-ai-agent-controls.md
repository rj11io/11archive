# Crawler and AI agent controls

Which programs read your site, what each one does with what it reads, and how to decide per bot.

## 1. The distinction that matters

AI companies run two kinds of crawler, and they have opposite consequences:

- **Training crawlers** download your pages to help build a model. Blocking them costs you nothing today; the trade is your content in exchange for nothing back.
- **Answer-time fetchers** download a page because a user just asked a question and the assistant needs your page to answer it, usually with a link back to you. Blocking these removes you from the answer.

They are separate user agents. Blocking `GPTBot` does not block `OAI-SearchBot`. A site that blocks everything named "AI" often blocks its own referral traffic by accident.

## 2. Google's crawlers

From [Google's common crawlers list](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers):

| Token | What it does |
|---|---|
| `Googlebot` | Search, Images, Video, News, and Discover, desktop and mobile |
| `Googlebot-Image` | Image indexing |
| `Googlebot-Video` | Video discovery |
| `Googlebot-News` | Google News (uses the standard Googlebot user-agent string in requests) |
| `Storebot-Google` | Google Shopping surfaces |
| `Google-InspectionTool` | Search Console testing tools. Does not affect rankings |
| `GoogleOther` | Generic crawler for internal product research |
| `GoogleOther-Image`, `GoogleOther-Video` | Media variants of the above |
| `Google-CloudVertexBot` | Crawls for customer-built Vertex AI agents. Does not affect Search |
| `Google-Extended` | Controls whether crawled content may train Gemini models and ground its answers |

The important line: `Google-Extended` "does not impact a site's inclusion in Google Search". Blocking it opts you out of Gemini training and grounding while leaving search untouched.

Google warns that user-agent strings can be spoofed, and publishes IP ranges for verification.

## 3. OpenAI's crawlers

From [OpenAI's bots documentation](https://developers.openai.com/api/docs/bots):

| User agent | Purpose | Blocking it means |
|---|---|---|
| `GPTBot` | Content for training foundation models | Your content is not used for training |
| `OAI-SearchBot` | Surfacing sites in ChatGPT search | You disappear from ChatGPT search results, though links may still appear. Changes take about 24 hours |
| `ChatGPT-User` | Fetches a page because a user asked for it | Users cannot have ChatGPT read your page. Not normally blocked, since it is user-initiated |
| `OAI-AdsBot` | Checks landing pages submitted to ChatGPT advertising | Only visits pages you submitted. Not used for training |

IP lists are published per bot at `openai.com/gptbot.json`, `openai.com/searchbot.json`, `openai.com/chatgpt-user.json`, and `openai.com/adsbot.json`.

## 4. Anthropic's crawlers

From [Anthropic's crawler support article](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler):

| User agent | Purpose |
|---|---|
| `ClaudeBot` | Collects web content that may contribute to model training |
| `Claude-User` | Fetches a page when a user asks Claude to visit it |
| `Claude-SearchBot` | Analyses content to improve the relevance and accuracy of search responses |

Anthropic honours `robots.txt` and supports the `Crawl-delay` extension:

```
User-agent: ClaudeBot
Crawl-delay: 1
```

IP verification list: `https://claude.com/crawling/bots.json`.

## 5. Other AI crawler tokens in circulation

These names are widely reported but were not confirmed against each vendor's own documentation in this pass. Treat the list as a starting point and verify before writing rules you care about.

| Token | Operator | Type |
|---|---|---|
| `PerplexityBot` | Perplexity | Indexing for answers |
| `Perplexity-User` | Perplexity | User-initiated fetch |
| `Applebot-Extended` | Apple | Training opt-out token only, no crawler behind it |
| `Bytespider` | ByteDance | Training |
| `CCBot` | Common Crawl | Open crawl corpus, used by many trainers |
| `Meta-ExternalAgent` | Meta | Training |
| `Cohere-AI` | Cohere | Training |
| `anthropic-ai`, `Claude-Web` | Legacy Anthropic names | Historic, kept in many robots.txt files |

`Google-Extended` and `Applebot-Extended` are control tokens rather than crawlers: nothing fetches under those names, they only exist so you can opt out of training.

## 6. Three robots.txt recipes

Pick one deliberately. Each expresses a different business decision.

**Open to everything.** You want maximum reach and treat AI answers as distribution.

```
User-agent: *
Allow: /

Sitemap: https://example.com/sitemap.xml
```

**Answers yes, training no.** The common middle ground: appear in AI answers with a link back, but do not feed training corpora.

```
User-agent: *
Allow: /

User-agent: GPTBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: Applebot-Extended
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: Bytespider
Disallow: /

# left allowed on purpose: OAI-SearchBot, ChatGPT-User, Claude-User,
# Claude-SearchBot, PerplexityBot, Googlebot

Sitemap: https://example.com/sitemap.xml
```

**Search only.** Nothing but classic search engines.

```
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: *
Disallow: /

Sitemap: https://example.com/sitemap.xml
```

Two cautions:

- `robots.txt` is a request, not a wall. Well-behaved bots obey; others do not. Use server-side blocking or bot protection when the content genuinely must not be taken.
- Blocking a crawler does not remove already-trained-on content, and it does not remove your URL from search. That needs `noindex` on a crawlable page.

## 7. What Google says about AI answers

From [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features):

- **No new files or markup.** "You don't need to create new machine readable files, AI text files, or markup to appear in these features. There's also no special schema.org structured data that you need to add."
- **Eligibility follows ordinary search.** The page must be indexed and eligible for snippets.
- **Controls are the ones you already have:** `nosnippet`, `data-nosnippet`, `max-snippet`, `noindex`, and robots.txt rules for Googlebot. Note the trade: `nosnippet` keeps you out of AI Overviews and out of ordinary snippets at the same time.
- **Query fan-out.** AI Mode may run several related searches at once, which Google says surfaces "a wider and more diverse set of helpful links".
- **Measurement.** AI-feature traffic appears in Search Console's Performance report under the "Web" search type, with no separate breakdown.

## 8. llms.txt

A community proposal, documented at [llmstxt.org](https://llmstxt.org/), for a Markdown file that gives AI agents a clean map of your site instead of making them parse navigation and scripts.

Format:

- Lives at `/llms.txt`, or in any subdirectory covering the URLs beneath it. The most specific file wins.
- One required element: an H1 with the project or site name.
- Optional: a blockquote summary, free-form Markdown sections, and H2 sections listing files as `[name](url)` links with notes.
- A section titled "Optional" marks links an agent can skip when short on context.

```markdown
# Example Corporation

> Tools for widget makers. This file points agents at the canonical docs.

## Docs

- [Getting started](https://example.com/docs/start.md): install and first run
- [API reference](https://example.com/docs/api.md): every endpoint

## Optional

- [Changelog](https://example.com/changelog.md): release history
```

**Status:** real adoption, no standing. Documentation platforms generate it automatically, and major AI labs publish one for their own docs. It is not a search requirement and Google explicitly says you do not need it. Ship it if you run a documentation site and want agents to read the clean version; skip it otherwise.

## 9. A decision table

| You want | Do this |
|---|---|
| Out of AI training, still in AI answers | Disallow `GPTBot`, `ClaudeBot`, `Google-Extended`, `Applebot-Extended`, `CCBot`, `Bytespider`. Allow the search and user bots |
| Out of AI answers entirely | Disallow the answer-time fetchers too, and consider `nosnippet` for Google |
| Out of Google's AI Overviews specifically | `nosnippet` or a tight `max-snippet`, accepting the same limit on normal snippets |
| Out of Gemini training, still fully in Search | Disallow `Google-Extended` only |
| Page out of search entirely | `noindex` on a page that stays crawlable. Not robots.txt |
| Part of a page out of snippets | `data-nosnippet` on that element |
| Clean, agent-readable docs | Publish `llms.txt` plus Markdown versions of key pages |

## Sources

- [Google common crawlers](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers)
- [OpenAI bots](https://developers.openai.com/api/docs/bots)
- [Anthropic crawler policy](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)
- [Google AI features](https://developers.google.com/search/docs/appearance/ai-features)
- [llms.txt proposal](https://llmstxt.org/)
- [robots.txt specification](https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt)
