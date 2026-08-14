# Executive brief

## The finding that changes what you do next

**Half of OKF v0.2 has no working implementation, including the feature it was
announced for.**

Version 0.2 added five things: provenance, trust, freshness, lifecycle, and attested
computations. Measured across the four bundles and the reference code Google ships:

- `verified`, `stale_after`, and `Attested Computation` appear **only** in the single
  bundle a human wrote by hand. Across the 44 concepts Google's own agent generated,
  the count for each is zero.
- **No code anywhere in the reference implementation reads `runtime`, `parameters`,
  `computation`, `executor`, or `attester`.** That is the whole of specification
  section 10, roughly 180 lines of specification and zero lines of implementation.

The specification is a serious document. The tooling is a demonstration of the v0.1
subset. Adopt v0.2 expecting to build the v0.2 half yourself.

## What OKF is, in one paragraph

A way to write down what an organisation knows so both people and AI agents can read it.
The format is a directory of Markdown files, each starting with a small block of
structured labels in YAML. One label, `type`, is required. Everything else is optional.
There is no runtime, no SDK, and no registry. A valid OKF file can be four lines long.

## The ten findings

1. **Half of v0.2 has no producer, and its marquee feature has no implementation at
   all.** As above. ([06](06-conformance-audit.md))

2. **Two Google implementations in one repository disagree on where a file's metadata
   ends.** The Python reference matches the closing `---` after trimming whitespace; the
   TypeScript tool in `toolbox/mdcode` matches it exactly. Give both the same file with
   an indented `---` inside a text block and one sees a truncated header with a field
   silently missing, the other sees the whole thing. Same bytes, two different
   documents, same repository. ([05](05-yaml-frontmatter-best-practices.md))

3. **One conformant file crashes the reference viewer.** Write `stale_after` as a full
   timestamp rather than a plain date and `is_stale()` raises `TypeError`, because in
   Python a `datetime` passes an `isinstance(..., date)` test and then cannot be compared
   with one. The function has a fallback intended to degrade gracefully; that fallback is
   unreachable. The viewer calls it unguarded, so the whole build dies on one file.
   ([06](06-conformance-audit.md))

4. **OKF is the on-disk format for a Google Cloud product, which the "vendor-neutral"
   framing omits.** It lives in the `knowledge-catalog` repository: Knowledge Catalog,
   formerly Dataplex. The repository ships `push.ts`, `pull.ts`, and a custom aspect
   definition that round-trip bundles into that product. The format really is readable
   without Google tooling. It is also a commercial interchange format, and both are
   true. ([08](08-adoption-and-reception.md))

5. **The recommended link style produces no graph edges in Google's own viewer.**
   Section 6.1 recommends starting links with `/`. The viewer explicitly skips every
   such link. The reference agent's prompt says "Never start a link with `/` (that
   breaks GitHub rendering)". Three parts of one project, three positions.
   ([06](06-conformance-audit.md))

6. **All four example bundles pass the conformance test, and all contain defects.**
   Section 11 has three rules, so failing is nearly impossible, and it then forbids
   consumers from rejecting a bundle for anything. It is a producer-side checklist, not
   a gate. You need your own validator. ([06](06-conformance-audit.md))

7. **The reference implementation rewrites files it reads.** Parsing and re-serialising
   one unchanged file produces a 52-line diff: compact YAML expanded, lines re-wrapped,
   `2026-06-30T14:00:00Z` rewritten to `2026-06-30 14:00:00+00:00`. The damage is silent
   and happens once, after which the file round-trips stably. For a format whose stated
   goal is being diffable in version control, the shipped writer is the wrong tool.
   ([06](06-conformance-audit.md))

8. **Nothing is signed.** `verified: { by: human:alice }` is editable text. No signature,
   hash, or key appears anywhere in v0.2. Trust in a bundle is exactly trust in wherever
   it is stored. The specification says so itself: trust tiers are "advisory signals, not
   access control". ([04](04-attested-computations.md))

9. **YAML's type guessing is the practical hazard, but it bites your tooling, not your
   model.** An agent reads raw bytes and never sees `NO` become `false`. Validators,
   viewers, indexers, and servers do. Of twelve frontmatter cases tested, six parse
   differently depending on the library. Google's own bundles disagree with themselves:
   the hand-written one leaves timestamps bare and gets `datetime` objects, the three
   generated ones quote them and get strings.
   ([05](05-yaml-frontmatter-best-practices.md))

10. **Attested computations remain the real contribution, unimplemented or not.**
    Restricting an agent to filling declared parameter holes, then having deterministic
    no-model code confirm the sanctioned calculation is what ran, has no close equivalent
    in any adjacent format. The one shipped attester compares queries symbolically and
    trusts the executor to bind parameters, so an agent running the sanctioned query for
    the wrong year still passes. ([04](04-attested-computations.md))

## What to do

**If you are evaluating OKF:** read the specification, not the coverage. It is one file
and about an hour. Then read `okf/bundles/acme_retail/`, the only bundle that exercises
v0.2, and treat everything in it as a specification illustration rather than as
something the tooling produces.

**If you are adopting it:** the format is cheap and low-risk. Your knowledge stays as
Markdown in a directory whether OKF succeeds or not, so trying it and walking away costs
almost nothing. That asymmetry is a better argument than any adoption statistic.

Before you have 400 files, do three things:

- **Write a validator.** Conformance will not catch your mistakes. Start with: `tags` is
  a list, timestamps are quoted, path values resolve, no duplicate keys, and
  `stale_after` is a plain date and not a timestamp.
- **Decide how files get written.** If agents will edit your bundle, use a YAML library
  that preserves formatting (`ruamel.yaml` in round-trip mode), or standardise on block
  style everywhere. Choosing neither means every automated edit produces an unreadable
  diff.
- **Quote every date and timestamp.** One quote character decides whether your reader
  gets text or a date object, and one of those crashes the reference helper.

**If you want attested computations:** the design is sound and nothing implements it.
Budget for writing the executor and the attester, and check parameter values, which the
example attester does not.

**If you need cryptographic guarantees, column-level lineage, or a validator you did not
write:** wait. All three are missing, and two are explicitly deferred.

## What this report does not claim

Two things worth stating, because an earlier draft of this research got them wrong.

**The published record is not stale.** Google announced v0.2 on the day it landed, and
Search Engine Journal, Open Source For You, and others covered it within a week. June
articles describe v0.1 because v0.2 did not exist yet, and at least one June guide has
since been revised. Some third-party *tools* still implement v0.1; the *coverage* is
current.

**The sample defects are not conformance violations.** The `tags`-as-a-string files and
the timestamp typing split break no rule in the specification. They are interoperability
traps, which is a different and more useful complaint.

## Confidence

Findings 1, 2, 3, 5, 6, 7, and 9 were measured directly against the specification and
the shipped code, and are reproducible from
[11-methodology-and-sources.md](11-methodology-and-sources.md). Finding 4 rests on
reading the repository. Statements about what could not be found, in
[08](08-adoption-and-reception.md), rest on searches returning nothing, which is weaker
evidence and is labelled as such.
