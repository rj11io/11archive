# The trust model

Section [02](02-frontmatter-reference.md) lists the fields. This section explains how
they work together, and what the model can and cannot tell you. Skip it if you only
need the field names.

## The design principle: absence means something

Every trust field in OKF is optional. That sounds like it weakens the model. It is
actually the point. Spec section 5:

> "All are optional. Their absence carries meaning: an unverified concept is
> distinguishable from a verified one, but is never rejected."

So a bundle where half the files carry no `verified` key is not a broken bundle. It is
a bundle telling you, accurately, that half of it has never been checked. A format
that required the field would have forced producers to write something, and what they
would write is noise.

This is the single best decision in v0.2. Compare it with metadata systems that demand
an owner and a description for every asset: they get an owner and a description for
every asset, and none of them mean anything.

## Four questions, four fields

| Question | Field | Answer shape |
|---|---|---|
| Where did this come from? | `sources` | List of materials, with signals |
| Who wrote it, and when? | `generated` | One actor plus a timestamp |
| Who checked it, and when? | `verified` | List of actors plus timestamps |
| Is it still current? | `status`, `stale_after` | A state, and a date |

The split between `generated` and `verified` is the one to internalise. Who *wrote*
something is not who *confirmed* it. An agent writes; a person confirms. Content can
change without re-confirmation, and a fact can be re-confirmed without the text
changing. Two fields, because they move independently.

## Trust tiers: derived, never written

A reader works out one of three levels from `verified`:

```
no verified key          -> unverified
only process:/agent      -> machine-confirmed
at least one human:      -> human-reviewed
```

Nobody writes `trust_tier: human-reviewed` into a file. It is calculated on read, which
means it cannot go stale and cannot be inflated by a producer who wants their bundle to
look good.

The same reasoning drives the `sources` credibility signals. OKF records `author`,
`usage_count`, and `last_modified`, and refuses to record a score. The spec's argument:
a score "is subjective, unportable across consumers, and goes stale". Your finance team
and your marketing team should be free to weigh the same signals differently.

## Reading the signals honestly

`usage_count` is the weakest of the three, and the spec says so:

> "Consumers SHOULD read it as liveness and trend, not as a score."

A scheduled query firing hourly and an analyst deliberately opening a dashboard both
increment it. Use it for two things only: is this source alive or dead, and is it
trending up or down against its own history. Do not rank two different kinds of source
against each other with it.

`usage_count` also needs `usage_window` to mean anything. 5,000 uses over a week and
5,000 over three years are different facts. `usage_window` is written once next to
`sources` and applies to all of them:

```yaml
sources:
  - id: exec-rev-dash
    resource: dashboards/exec-revenue
    usage_count: 5000
    last_modified: 2026-06-18
usage_window: { from: 2026-06-01, to: 2026-06-30 }
```

## Freshness is a plain date comparison

`stale_after` holds an absolute date, never a duration. Section 5.5 explains why:

> "An absolute date, not a relative TTL, keeps the staleness decision a plain date
> comparison with no reference to when the concept was read."

A duration like "valid for 90 days" needs a start date, and the obvious candidate,
`generated.at`, is wrong: a definition can be rewritten for clarity without its review
deadline moving. An absolute date sidesteps all of it. A concept is stale when today is
on or after the date. That is the whole rule.

In practice, set `stale_after` to your actual review cycle. `acme_retail` sets
`2026-12-31` on its revenue concepts and explains why in the body: the
revenue-recognition policy is reviewed annually.

## Deprecation keeps the link working

`status: deprecated` means "kept for links and history; no longer current". This is
better than deleting the file, and `acme_retail` shows the pattern properly.

`metrics/gross-margin-legacy.md` is a retired definition. It stays in the bundle,
marked deprecated, with a body that says exactly why:

> "This concept is preserved so historical reports written before 2026-02-01 remain
> reproducible. Do not reference it for new work."

The current definition links back to it. A reader chasing an old report's number finds
the definition that produced it, correctly labelled as retired. Deleting the file would
have turned that into a dead end.

## Lineage is a link, not a field

OKF has no `derived_from` field. When a source's `resource` points at another concept
in the same bundle, the connection already exists as a link in the graph. A reader that
wants to trace further follows it and reads that concept's own `sources`.

The spec is candid that this stops early. Deeper lineage, meaning an explicit external
`derived_from` or column-level data lineage, is "out of scope for v0.2". If you need to
know which upstream table a number came from, OKF will not tell you.

## What this model does not do

Three honest limits.

**Nothing is signed.** Every field here is editable text. `verified: human:ahormati`
proves nothing on its own. Integrity comes from wherever the bundle lives: a Git
repository with protected branches and required review makes those lines meaningful,
and a downloaded tarball does not. Section [04](04-attested-computations.md) covers
this at length.

**Trust tiers are not permissions.** Section 5.3 states it outright: they "are advisory
signals, not access control". Do not build authorisation on them.

**Nothing enforces freshness.** `stale_after` is a date in a file. Something has to
actually check it and act. The spec tells readers they SHOULD "warn or refuse when
`today >= stale_after`", but no shipped tool does this for you.

## Using it day to day

A short version for a team adopting v0.2:

- Write `generated` on everything. It is cheap and it is the field readers use most.
- Write `verified` only when a real check happened. An empty `verified` is more useful
  than a fake one.
- Use the `human:` prefix accurately. Trust tiers depend on it and nothing validates it.
- Set `stale_after` from your review cycle, not from a guess.
- Deprecate rather than delete.
- Add `usage_window` whenever you add `usage_count`, or the number means nothing.

## Sources

- OKF v0.2 specification, sections 5, 7, 13:
  [okf/SPEC.md](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md)
- Deprecation example:
  [okf/bundles/acme_retail/metrics/gross-margin-legacy.md](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/bundles/acme_retail/metrics/gross-margin-legacy.md)
