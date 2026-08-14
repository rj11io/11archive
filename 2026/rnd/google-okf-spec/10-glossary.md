# Glossary

Terms used in this report. Terms marked **(OKF)** are defined by the specification;
the rest are general.

| Term | Meaning |
|---|---|
| **Actor** (OKF) | Who or what did something. Written as `human:alice`, `process:nightly-job`, or `agent_name/version`. |
| **Attestation** (OKF) | Checking that a single run produced its number the sanctioned way. Happens at runtime, on every call, and is never stored in the bundle. |
| **Attested Computation** (OKF) | A concept holding the one approved way to calculate a value, so a reader can confirm an agent ran it rather than improvising. |
| **Attester** (OKF) | Plain deterministic code, with no AI model involved, that inspects a receipt and returns pass or fail. |
| **Block style** | YAML written one key per line, indented. The opposite of flow style. |
| **Body** (OKF) | Everything in a concept file after the frontmatter. Ordinary Markdown. |
| **Bundle** (OKF) | A directory of OKF files. The unit you ship. |
| **Byte order mark** | An invisible marker some editors put at the start of a file. Breaks readers that expect `---` as the first characters. |
| **Chomping indicator** | The `-` or `+` after a YAML block scalar marker, controlling trailing newlines. `\|-` strips them. |
| **Concept** (OKF) | One unit of knowledge, stored as one Markdown file. |
| **Concept ID** (OKF) | The file's path inside the bundle with `.md` removed. |
| **Conformance** (OKF) | The three-rule test in section 11: frontmatter parses, `type` is non-empty, reserved files follow their format. |
| **Credibility signal** (OKF) | An objective fact about a source (`author`, `usage_count`, `last_modified`) from which a reader infers trust. OKF records signals, never a score. |
| **Deprecated** (OKF) | `status: deprecated`. Kept so old links and reports work; no longer current. |
| **Diffable** | You can see line by line what changed between two versions. The reason the format is text. |
| **Executor** (OKF) | Instructions or code that runs a computation and returns a receipt. |
| **Flow style** | Compact YAML using `{ }` and `[ ]` on one line. Used throughout OKF's examples. |
| **Frontmatter** | A block of YAML at the top of a Markdown file, fenced by `---`. No formal standard defines it. |
| **Implicit typing** | YAML guessing what a value means from how it looks. The root of most YAML surprises. |
| **Index file** (OKF) | `index.md`. Lists a directory's contents so a reader can see what exists before opening anything. Carries no frontmatter, except `okf_version` at the bundle root. |
| **ISO 8601** | The international date and time format, for example `2026-05-28T14:30:00Z`. |
| **Lifecycle** (OKF) | Whether a concept is current: `status` and `stale_after`. |
| **Link** (OKF) | An ordinary Markdown link between concepts. Asserts a relationship without saying what kind. |
| **Log file** (OKF) | `log.md`. History of changes, newest first, grouped by ISO date. |
| **Norway problem** | YAML 1.1 reading `NO` as the boolean false. Named for the country code. |
| **Octal** | Base 8. YAML 1.1 reads a leading zero as octal, so `02134` becomes `1116`. |
| **Progressive disclosure** (OKF) | Letting a reader see what is available before opening it. The reason `index.md` exists. |
| **Provenance** (OKF) | The set of sources a concept derives from. Recorded in `sources`. |
| **Receipt** (OKF) | Evidence a run returns, shaped by `executor.receipt`. A runtime object, never stored. |
| **Reserved filename** (OKF) | `index.md` and `log.md`. Cannot be used for concepts. |
| **Round-trip** | Reading a file and writing it back. Lossless if formatting survives; OKF's reference writer is not lossless. |
| **Runtime** (OKF) | How a computation is executed: `bigquery`, `dbt`, `python`. Decides what `parameters` mean. |
| **Sexagesimal** | Base 60. YAML 1.1 reads `22:53` as `1373`. |
| **Source** (OKF) | Material a concept derives from, internal or external. |
| **Stale** (OKF) | Today's date is on or after `stale_after`. |
| **Trust tier** (OKF) | One of unverified, machine-confirmed, or human-reviewed. Calculated from `verified` on read, never written into a file. |
| **Verified** (OKF) | The field recording who confirmed a concept's content against its sources. Distinct from who wrote it. |
| **YAML** | The text format used for frontmatter. Version 1.1 (2005) and 1.2 (2009) differ in ways that matter; PyYAML still implements 1.1. |
