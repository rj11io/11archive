# Adoption playbook

What to do if you want to try OKF, in the order to do it. Everything here is grounded
in the spec and in the four bundles Google ships.

## Should you adopt it at all

Three honest cases.

**Good fit.** You already keep documentation in Git as Markdown, you are pointing an
agent at it, and you want that agent to stop inventing SQL. OKF costs you a frontmatter
block per file and gives you structure a program can filter on.

**Poor fit.** Your knowledge lives in a catalog product that already serves it to your
tools, and nothing is asking you to move it. OKF is a file format, not a system. It
will not index, search, serve, or authorise anything for you.

**Wait.** You need cryptographic guarantees about who verified what, you need
column-level lineage, or you need a validator you did not write. All three are missing
in v0.2, and two are explicitly deferred to a future revision.

## Directory layouts that already work

The spec does not prescribe a layout. Google's own bundles use two shapes.

**Data catalog shape**, from `ga4`, `stackoverflow`, and `crypto_bitcoin`:

```
bundle/
  index.md
  datasets/       one file per dataset
  tables/         one file per table
  references/     supporting material
    metrics/      metric definitions
    joins/        how tables join
```

**Governed metrics shape**, from `acme_retail`:

```
bundle/
  index.md
  log.md
  tables/         the data
  metrics/        business definitions
  computations/   Attested Computations, one per figure
  policies/       source-of-truth policy documents
  skills/         executor instructions
  attesters/      deterministic checking code
```

The second is the more interesting one. It separates what a number *means* (`metrics/`)
from how it is *calculated* (`computations/`) from the authority that *decides*
(`policies/`). A metric file narrates and links; the computation file is the only thing
an agent may run.

Start with whichever matches your domain. Directory names are yours.

## A starter type vocabulary

`type` values are not registered anywhere. Google's bundles use seven. A reasonable
starting set:

| Type | For |
|---|---|
| `Dataset`, `Table` | Data assets. Prefix with your platform if useful |
| `Metric` | What a number means |
| `Attested Computation` | The sanctioned way to calculate it |
| `Policy` | The authority a definition rests on |
| `Reference` | Supporting material, joins, enumerations |
| `Playbook` | Steps a person or agent follows |
| `Skill` | Instructions for running something |

Pick descriptive, self-explanatory values, and keep the list short. Readers must
tolerate unknown types, so a mismatch with someone else's vocabulary degrades
gracefully rather than breaking.

## Nine rules for producers

1. **Put `type` on every concept file.** It is the only required field and the only
   thing conformance checks.
2. **Write `description`.** Index generators, search snippets, and previews all use it.
   A concept without one is invisible in listings.
3. **Write `tags` as a list.** `tags: [a, b, c]`. Eight of Google's own files get this
   wrong; see [06](06-conformance-audit.md).
4. **Quote every date and timestamp.** Otherwise the type your reader gets depends on
   who wrote the file.
5. **Split your path convention by field.** Body links: use file-relative paths, because
   a leading `/` resolves against the repository root on GitHub and breaks once your
   bundle is a subdirectory. Frontmatter path fields: use a leading `/`, because they
   are never rendered as links and the slash removes a real ambiguity. The spec and the
   reference agent disagree on this; see [06](06-conformance-audit.md).
6. **Use the `human:` prefix accurately.** Trust tiers depend on it; nothing validates
   it.
7. **Set `stale_after` from your real review cycle.** A date you invented is worse than
   no date.
8. **Deprecate, do not delete.** `status: deprecated` keeps old links and old reports
   working.
9. **Generate `index.md` files.** They are how an agent navigates without loading the
   whole bundle.

## Six rules for consumers

1. **Never reject a bundle** for a missing optional field, an unknown `type`, an unknown
   key, a broken link, or a missing `index.md`. Section 11 requires this.
2. **Treat a bare `verified` mapping as a one-item list.** This is a MUST in the spec.
3. **Handle `generated.at` as both a string and a date object.** Both occur in
   Google's own bundles.
4. **Coerce `tags` before iterating.** If it is a string you will otherwise loop over
   characters.
5. **Try both path readings.** Document-relative first, then bundle-root.
6. **Check `stale_after` and act on it.** Nothing does this for you.

## Migrating from v0.1 to v0.2

Two renames and a set of additions. A v0.1 bundle is still readable by a v0.2 reader.

**Required changes:**

| v0.1 | v0.2 | Note |
|---|---|---|
| `timestamp: '...'` | `generated: { by: ..., at: '...' }` | `by` is required. Readers MAY still fall back to `timestamp` |
| Body `# Citations` list | `sources:` in frontmatter | Readers SHOULD read `sources`, MAY still parse the old list |

**Optional additions**, all of which mean nothing changes if you skip them:

- `sources` credibility signals: `author`, `usage_count`, `last_modified`, plus
  `usage_window`
- `verified`, `status`, `stale_after`
- The `Attested Computation` type and its five fields
- The `# Computation` body heading
- The actor convention for `generated.by` and `verified[].by`

Everything else carries forward unchanged: bundle structure, reserved filenames, the
required `type`, `title`/`description`/`resource`/`tags`, links, index files, log files,
and the permissive conformance rules.

**Do not declare `okf_version` casually.** It goes only in a bundle-root `index.md`,
the single place frontmatter is allowed in an index file.

## Build a validator first

OKF ships no validator. `document.py`'s `validate()` checks that `type` is present and
nothing else. Section 11 conformance is so permissive that all four of Google's bundles
pass it while carrying the defects in [06](06-conformance-audit.md).

So conformance is not a useful gate. Build a stricter check before you have 400 files.
The checklist is at the end of
[05-yaml-frontmatter-best-practices.md](05-yaml-frontmatter-best-practices.md).

Two checks matter more than the rest:

- **`tags` is a list.** The single most common real defect.
- **Path values resolve.** Under whichever rule you standardise on, stated explicitly.

## Handle the round-trip problem before it bites

If agents will rewrite your bundle, and OKF's premise is that they will, decide now how
files get written.

Python's `yaml.safe_dump`, which OKF's reference implementation uses, converts every
compact `{ ... }` to a block mapping, re-wraps long lines, and rewrites timestamps.
Reading and writing one unchanged file produced a 52-line diff in
[06](06-conformance-audit.md).

Two workable options:

- **Use `ruamel.yaml` in round-trip mode.** It preserves style, quoting, comments, and
  key order. This keeps the compact style the spec itself uses.
- **Or standardise on block style everywhere** and accept the verbosity. Then
  `safe_dump` output matches what people write, and diffs stay small.

Choose one and enforce it in the validator. The failure mode of choosing neither is
that every automated edit produces an unreviewable diff, which quietly removes the
version-control benefit the format exists for.

## A first week

| Day | Task |
|---|---|
| 1 | Pick 10 to 20 concepts that matter. Not everything |
| 2 | Choose a directory layout and a type vocabulary. Write them down |
| 3 | Write the concepts, `type` and `description` first |
| 4 | Add links between them. Generate `index.md` files |
| 5 | Write the validator. Run it. Fix what it finds |
| 6 | Add `generated`, and `verified` only where a real check happened |
| 7 | Point an agent at it and ask questions you know the answers to |

Day 7 is the real test. If the agent answers correctly from the bundle, the format is
doing its job. If it does not, the problem is almost always missing `description`
fields or missing links, not the format.

Add `Attested Computation` only once the plain bundle works, and only for numbers where
a wrong answer actually costs something.

## Sources

- OKF v0.2 specification, sections 3, 4, 8, 11, 12, 13:
  [okf/SPEC.md](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md)
- Bundle layouts observed in
  [okf/bundles/](https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf/bundles)
