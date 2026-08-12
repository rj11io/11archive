# Structured data

Facts about the page written in a machine format, so a search engine does not have to infer them from prose.

## 1. What it is and why it is separate

A `<meta name="description">` tag gives a search engine a sentence. Structured data gives it typed fields: this is a recipe, it takes 45 minutes, it has 312 reviews averaging 4.6 stars. That difference is what unlocks the richer result formats: star ratings, event dates, breadcrumb trails, and job listings.

Google supports three notations. It [recommends JSON-LD](https://developers.google.com/search/docs/appearance/structured-data/sd-policies), a JSON block in a script tag that sits apart from your markup:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "How metadata actually works"
}
</script>
```

The alternatives, Microdata and RDFa, weave attributes into the HTML itself. Both are supported and both are harder to maintain. Use JSON-LD unless something forces your hand.

## 2. The rules that get sites penalised

From Google's [structured data general guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies):

- **Only mark up what a visitor can see.** "Don't mark up content that is not visible to readers of the page."
- **Do not mark up irrelevant or misleading content**, such as invented reviews.
- **Do not block the markup.** If `robots.txt` or `noindex` keeps Google out, the structured data does nothing.
- **Include every required property** for the feature you want, and add the recommended ones to improve your chances.
- **Use the most specific type available.** `Recipe`, not `CreativeWork`.

Breaking these earns a manual action: the site loses rich-result eligibility. Normal rankings are not directly affected, but the visible result gets plainer.

And a caveat worth saying out loud: correct markup never guarantees a rich result. Google decides per query.

## 3. The features Google documents

Every type in Google's [search gallery](https://developers.google.com/search/docs/appearance/structured-data/search-gallery), with its schema.org type:

| Feature | schema.org type | What it enables |
|---|---|---|
| Article | `Article` | News, sports, and blog articles in various rich formats |
| Breadcrumb | `BreadcrumbList` | The hierarchy path shown above the result |
| Carousel | `ItemList` | A scrollable gallery of items from one site |
| Course list | `Course` | Courses with titles, providers, descriptions |
| Dataset | `Dataset` | Inclusion in Google Dataset Search |
| Discussion forum | `DiscussionForumPosting` | Threaded discussion results |
| Education Q&A | `FAQPage` | Study flashcards and question-answer pairs |
| Employer aggregate rating | `AggregateRating` | A hiring organisation's rating |
| Event | `Event` | Dates, times, and locations in the result |
| Image metadata | `CreativeWork` | Creator, credit, and licence for images |
| Job posting | `JobPosting` | The interactive job-search result |
| Local business | `LocalBusiness` | Hours, ratings, directions, booking |
| Math solver | `MathSolver` | Step-by-step problem solutions |
| Movie | `Movie` | Movie carousels |
| Organization | `Organization` | Logo, name, address, contact details |
| Product | `Product` | Price, availability, review ratings |
| Profile page | `ProfilePage` | Results about one person or organisation |
| Q&A | `QAPage` | Question-and-answer pages |
| Recipe | `Recipe` | Recipe results and carousels |
| Review snippet | `Review` | A rating excerpt in the result |
| Software app | `SoftwareApplication` | App ratings, description, download link |
| Speakable | `Speakable` | News read aloud on voice devices |
| Subscription and paywalled content | `CreativeWork` | Marks paid content so it is not treated as cloaking |
| Vacation rental | `VacationRental` | Property details and amenities |
| Video | `VideoObject` | Playable video, key moments, live streams |

## 4. The four blocks nearly every site should ship

### Organization, on the home page

Place it once, on the home page or a single "about" page. Not on every page.

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "url": "https://www.example.com",
  "name": "Example Corporation",
  "logo": "https://www.example.com/images/logo.png",
  "description": "Example makes high-quality widgets.",
  "email": "contact@example.com",
  "telephone": "+351-000-000-000",
  "sameAs": [
    "https://www.linkedin.com/company/example",
    "https://github.com/example"
  ],
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Rua Exemplo 99",
    "addressLocality": "Lisbon",
    "addressCountry": "PT",
    "postalCode": "1000-001"
  }
}
```

Logo requirements: at least 112 x 112 pixels, crawlable, indexable, and legible on a white background. Other recommended properties: `contactPoint`, `foundingDate` (ISO 8601), `numberOfEmployees`, `vatID`, `iso6523Code`.

### WebSite, for the site name in results

Google shows a site name beside your result. Its [site names documentation](https://developers.google.com/search/docs/appearance/site-names) ranks the signals: `WebSite` structured data first, then `og:site_name`, then `<title>`, then headings and page text, then how other sites refer to you.

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Example",
  "alternateName": ["Example Corp", "EXC"],
  "url": "https://www.example.com/"
}
```

Rules: home page only (the domain or subdomain root, not a subdirectory), one name per site, home page must be crawlable, and the name should match what your title and headings say. Changes take days to weeks. If your preferred name is rejected, Google weighs `alternateName` strongly.

### BreadcrumbList, on inner pages

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "Books", "item": "https://example.com/books"},
    {"@type": "ListItem", "position": 2, "name": "Science Fiction", "item": "https://example.com/books/sciencefiction"},
    {"@type": "ListItem", "position": 3, "name": "Award Winners"}
  ]
}
```

The last item may omit `item`; Google then uses the current page's URL. A page can declare several trails by putting multiple `BreadcrumbList` objects in a JSON array. Google's advice: model the path a typical user takes, not your URL folder structure.

### Article, on posts and news

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "How metadata actually works",
  "image": [
    "https://example.com/photos/1x1/photo.jpg",
    "https://example.com/photos/4x3/photo.jpg",
    "https://example.com/photos/16x9/photo.jpg"
  ],
  "datePublished": "2026-08-11T09:00:00+01:00",
  "dateModified": "2026-08-11T14:30:00+01:00",
  "author": [
    {"@type": "Person", "name": "Jane Doe", "url": "https://example.com/authors/jane"}
  ]
}
```

Google's [Article reference](https://developers.google.com/search/docs/appearance/structured-data/article) has **no required properties**. Recommended: `headline`, `image`, `datePublished`, `dateModified`, `author`.

- Types accepted: `Article`, `NewsArticle`, `BlogPosting`.
- Images: supply 16:9, 4:3, and 1:1 crops, each at least 50,000 total pixels, crawlable, and showing the article's actual subject rather than a logo.
- Dates: ISO 8601 with a timezone.
- Authors: list each person as a separate entry. Keep the publisher name, job titles, honorifics, and phrases like "posted by" out of `author.name`.

## 5. Structured data and AI answers

Google is explicit that AI Overviews and AI Mode need nothing extra: "There's also no special schema.org structured data that you need to add" ([AI features](https://developers.google.com/search/docs/appearance/ai-features)). Structured data still earns you the rich formats in ordinary search, which is reason enough.

## 6. How to validate

| Tool | Checks |
|---|---|
| [Rich Results Test](https://search.google.com/test/rich-results) | Whether Google can produce a rich result from your markup, on a live URL or pasted code |
| [Schema Markup Validator](https://validator.schema.org/) | Whether the markup is valid schema.org, regardless of Google's features |
| Search Console → Enhancements | Errors and warnings across your indexed pages over time |
| Search Console → URL Inspection | What Google's rendered version of a live page actually contains |

Test the rendered page, not the template. If a JavaScript framework injects the JSON-LD, confirm it survives rendering.

## 7. Practical guidance

- Start with `Organization` and `WebSite` on the home page, and `BreadcrumbList` on inner pages. Those three are cheap and apply everywhere.
- Add a page-type block (`Article`, `Product`, `Event`, `Recipe`) only where that type genuinely describes the page.
- Generate the JSON from the same data that renders the page. Hand-maintained JSON drifts out of sync, and drift is what breaks the "must be visible" rule.
- One JSON-LD script per page is easiest to read, using `@graph` when several objects belong together, but multiple scripts are valid.
- Do not mark up an `AggregateRating` you cannot show on the page. Invented ratings are the fastest route to a manual action.

## Sources

- [Structured data general guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- [Search gallery of structured data features](https://developers.google.com/search/docs/appearance/structured-data/search-gallery)
- [Organization structured data](https://developers.google.com/search/docs/appearance/structured-data/organization)
- [Site names in Google Search](https://developers.google.com/search/docs/appearance/site-names)
- [Breadcrumb structured data](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb)
- [Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article)
- [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
