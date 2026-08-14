# Google's Open Knowledge Format: A Working Reference

A technical reference for the Open Knowledge Format (OKF), the specification Google
Cloud published for writing down what an organisation knows in a form AI agents can
read. It covers what the specification says, what its own example bundles reveal when
you measure them, and how to write the YAML frontmatter it depends on.

## Read this first

**The live specification is version 0.2, and roughly half of it has no working
implementation.**

Version 0.2 replaced v0.1 on 2026-07-24 and added provenance, trust, freshness,
lifecycle, and attested computations. Measured across everything Google ships:
`verified`, `stale_after`, and `Attested Computation` appear only in the one bundle a
human wrote by hand, and no code in the reference implementation reads any of the five
attestation fields.

The specification is a serious document worth reading. The tooling implements the v0.1
subset. Plan to build the v0.2 half yourself.

## How to read this report

| If you want | Read |
|---|---|
| The short version | [00 Executive brief](00-executive-brief.md) |
| To understand the format | [01 The format](01-the-format.md) |
| Every field, precisely | [02 Frontmatter reference](02-frontmatter-reference.md) |
| How trust works | [03 The trust model](03-the-trust-model.md) |
| The attestation design | [04 Attested computations](04-attested-computations.md) |
| **YAML frontmatter and its pitfalls** | [05 YAML frontmatter best practices](05-yaml-frontmatter-best-practices.md) |
| What the audit found | [06 Conformance audit](06-conformance-audit.md) |
| How it compares to alternatives | [07 How OKF compares](07-how-okf-compares.md) |
| Whether anyone uses it | [08 Adoption and reception](08-adoption-and-reception.md) |
| To adopt it | [09 Adoption playbook](09-adoption-playbook.md) |
| Definitions | [10 Glossary](10-glossary.md) |
| How this was checked | [11 Methodology and sources](11-methodology-and-sources.md) |

## What is original here

Two things in this report are not available anywhere else.

**A measured audit of Google's own bundles.** All 78 Markdown files in the four official
example bundles were parsed with the same code OKF's reference implementation uses, and
checked against the specification. All 53 concepts pass the conformance test. Eight
distinct findings sit above it, including a conformant file that crashes the reference
viewer and a round trip that turns an unchanged file into a 52-line diff. Details in
[06](06-conformance-audit.md).

**A YAML frontmatter guide grounded in measured parser behaviour.** The differences
between YAML 1.1 and 1.2 were measured directly rather than quoted, because the
divergences are the reason frontmatter breaks. Of twelve cases tested, six give
different answers depending on which library reads the file. The sharpest example is
inside Google's own repository, which ships two implementations that disagree about where
a frontmatter block ends. Details in
[05](05-yaml-frontmatter-best-practices.md).

## Scope

**Covered:** the specification text section by section, the complete frontmatter field
surface, the trust model, attested computations, YAML frontmatter practice, a
conformance audit of the shipped bundles, comparison with adjacent formats, and what
can be established about adoption.

**Not covered:** running the reference attester, which needs billed BigQuery
credentials. Any production OKF bundle, none of which were available to examine.
Commercial terms for Google's Knowledge Catalog product.

Evidence boundary: the specification, reference implementation, and four sample bundles
at commit `374e0bc`, plus public secondary coverage read on 2026-08-13. Limitations are
listed in full in [11](11-methodology-and-sources.md).
