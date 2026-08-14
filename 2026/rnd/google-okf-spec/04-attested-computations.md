# Attested computations

The largest addition in v0.2, and the part of OKF with no real equivalent in other
knowledge formats. It deserves its own section because it is also the part most likely
to be misread as stronger than it is.

## The problem in one sentence

An agent asked "what was revenue last year?" can write its own SQL, run it, and report
a number that looks authoritative and is wrong.

Provenance fields answer "where did this text come from". They do not answer "was this
*number* produced the way Finance says it must be". Attestation is OKF's answer to the
second question.

## The shape of the answer

A sanctioned calculation becomes its own file, with `type: Attested Computation`. Any
concept that needs the number links to it.

```markdown
---
type: Attested Computation
title: Revenue for fiscal year
runtime: bigquery
parameters:
  - { name: year, type: integer, required: true }
executor:
  resource: skills/run-on-bq.md
  receipt: [job_id, executed_sql, result]
attester:
  resource: attesters/sql_equality.py
---

# Computation

    SELECT SUM(amount) AS revenue
    FROM finance.recognized_revenue
    WHERE fiscal_year = @year
```

The rule that makes the whole thing work is one sentence in section 10.3:

> "The agent MAY only supply *values* for the declared `parameters`; it MUST NOT author
> or edit the computation."

The agent's entire freedom is filling `year`. Everything else is fixed. That turns
"did the agent do the right thing?" from a judgement call into a string comparison.

## Why a computation is a separate file

Section 10.1 gives three reasons, and they are good ones:

1. **`runtime` decides what `parameters` mean.** A parameter is a SQL bind variable
   under `bigquery`, a variable under `dbt`, a function argument under `python`.
   Keeping them in one file makes the meaning obvious.
2. **One computation, many users.** The same revenue calculation can back a metric, a
   dashboard, and a report. Define once.
3. **Trust is per calculation.** Revenue, profit, and margin each go stale on their own
   schedule and each need their own sign-off.

The practical effect: revenue can be fresh while profit is past its `stale_after`, and
one reader reaches two different verdicts in the same session.

## The six steps of a run

Section 10.5, which the spec marks as explanatory rather than binding:

| Step | What happens |
|---|---|
| 1. Discover | Reader finds the file, by type or by following a link |
| 2. Load | Contract from frontmatter, calculation from the body or the `computation` file |
| 3. Parameterise | Agent supplies values for declared parameters, nothing else |
| 4. Execute | The executor runs it and returns a **receipt** |
| 5. Attest | Plain code checks the receipt and returns pass or fail |
| 6. Gate | Refuse to show a failing result. Warn when past `stale_after` |

The receipt and the verdict are runtime objects. The spec is explicit that they are
**not** stored in the bundle.

## What the reference attester actually does

`acme_retail/attesters/sql_equality.py` is the only working attester Google ships. It
is 120 lines of plain Python. Its own docstring states the rules: "Never uses an LLM.
Never makes network calls. Safe to run consumer-side."

It checks two things:

1. **Provenance.** The SQL that ran, from `receipt.executed_sql`, equals the sanctioned
   SQL after stripping comments, collapsing whitespace, and uppercasing keywords.
2. **Fidelity.** The value about to be shown to the user equals the first cell of
   `receipt.result`.

Fidelity is the underrated half. It catches the case where the right query ran and the
agent then mistyped the number into its prose.

## Three limits worth knowing before you rely on this

### Limit 1: the reference attester does not check parameter values

Section 10.3 describes the check like this:

> "Binding `computation` with the parameter values into the executable artifact is the
> consumer's job, and the attester independently re-derives that same binding to
> compare against what actually ran."

The reference attester does not do that. Its docstring says:

> "Named bind variables (@name) are compared symbolically; their values are not
> inspected here (the executor is trusted to bind)."

So an agent that runs the sanctioned query with `year = 2019` and presents the result
as fiscal year 2026 **passes attestation**. The SQL text matches. Nothing compares the
parameter value to the claim in the prose.

This is a gap between what the spec describes and what the shipped code does, not a
flaw in the idea. But if you adopt OKF, do not assume the reference attester closes it.

### Limit 2: SQL text equality cannot see a changed dependency

Section 10.3 claims the comparison catches "a rewritten query, a swapped computation
file, or a mutated dependency".

The first two, yes. The third does not follow for the BigQuery case. If
`finance.recognized_revenue` is a view and somebody changes its definition, the SQL
text is byte-identical and the attester passes. The number changes; the check does not
notice.

For `dbt`, where the receipt carries `compiled_sql`, a changed model does show up in
the compiled text. So the claim holds for one runtime and not the other. The spec
states it without that qualification.

### Limit 3: nothing is signed

This is the most important thing to understand about OKF's trust model.

`verified: { by: human:ahormati, at: ... }` is a line of text in a file. Anyone who can
edit the file can write that line. There is no signature, no hash, no key, nothing to
check it against. The same is true of `generated`, of the trust tiers derived from
`verified`, and of the `sources` credibility signals.

The spec never claims otherwise, and section 12 lists what is deliberately postponed:

- the runtime protocol, including receipt and verdict formats
- the attester interface, portability, and sandboxing
- attestation caching
- semantic-layer templates for Looker and dbt

So the honest statement of what OKF v0.2 gives you: **integrity comes entirely from
wherever the bundle lives.** In a Git repository with protected branches and required
review, `verified: human:ahormati` means a reviewed commit said so, which is real. In a
tarball someone emailed you, it means nothing at all.

Compare that with what signed-provenance standards do. In-toto, SLSA, and Sigstore all
bind a claim to a cryptographic identity so the claim survives leaving its repository.
OKF does not, by choice. It is a format, not a security protocol. Just do not treat a
trust tier as a security boundary. The spec says this itself in section 5.3: trust
tiers "are advisory signals, not access control".

## Verification and attestation are different things

Section 10.6 draws a distinction that is easy to lose:

| | `verified` | Attestation |
|---|---|---|
| Confirms | The **definition** still matches policy | A single **run** produced the value correctly |
| When | Occasionally, by a person or a job | Every single call |
| Speed | Slow | Immediate |
| Stored | Yes, in the file | **No**, it is a runtime object |

A stale definition can still attest cleanly, because the SQL ran correctly. A
freshly-verified definition still needs attesting on every run, because verification
says nothing about what the agent just did. You need both.

## What this is genuinely good for

Setting the limits aside, the core design is sound and unusual. Three things it gets
right:

- **The parameter-only surface.** Restricting an agent to filling declared holes is a
  real constraint, mechanically checkable, and much stronger than asking a model to
  behave.
- **The no-LLM attester.** Requiring the checker to be plain deterministic code means
  the thing verifying the model cannot itself hallucinate.
- **Fidelity checking.** Re-reading the authoritative result rather than trusting the
  agent's text catches a whole class of quiet errors.

If you want an agent to quote your company's revenue figure, this is a more serious
proposal than anything else in the agent-knowledge space right now. Just deploy it
inside a repository whose history you trust, and write your own attester.

## Sources

- OKF v0.2 specification, section 10:
  [okf/SPEC.md](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md)
- Reference attester:
  [okf/bundles/acme_retail/attesters/sql_equality.py](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/bundles/acme_retail/attesters/sql_equality.py)
- Reference executor:
  [okf/bundles/acme_retail/skills/run-on-bq.md](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/bundles/acme_retail/skills/run-on-bq.md)
- [in-toto attestation framework](https://in-toto.io/), [SLSA](https://slsa.dev/),
  [Sigstore](https://www.sigstore.dev/)
