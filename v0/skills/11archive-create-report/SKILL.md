---
name: 11archive-create-report
description: Create, update, extend, rerender, and verify report artifacts inside 11archive by delegating the report lifecycle contract to the separately configured 11agi Core Reports Manager. Use when report source artifacts must be authored or changed in 11archive before optional publication.
---

# Create an 11archive report

Keep report source artifacts in 11archive. Keep the separately configured 11agi
checkout read-only.

## Configure

Require `ELEVEN_AGI_REPO` to contain the absolute path to the local 11agi checkout.
Never hardcode, infer, or clone the checkout.

Validate the configured report manager before changing report artifacts:

```bash
test -n "$ELEVEN_AGI_REPO"
test -f "$ELEVEN_AGI_REPO/v0/plugins/11agi-core/skills/11agi-core-reports-manager/SKILL.md"
```

Read and follow:

`$ELEVEN_AGI_REPO/v0/plugins/11agi-core/skills/11agi-core-reports-manager/SKILL.md`

Read every reporting, data-visualization, and style reference that manager routes
for the requested artifact. The upstream skills are dependencies, not mutation
targets.

## Create or update

1. Frame audience, objective, scope, evidence boundary, formats, destination, and
   privacy constraints.
2. Preserve source evidence read-only and collect provenance, dates, methods,
   units, confidence, coverage, exclusions, conflicts, and unavailable inputs.
3. Model the report around its subject. Add machine-readable data only when it
   supports validation, recomputation, comparison, or rerendering.
4. Render the smallest useful artifact set in the requested 11archive directory.
5. Do not silently overwrite an existing report. Preserve useful existing content
   and explain intentional changes.
6. Keep Markdown, HTML, and structured data aligned when multiple formats exist.

## Verify

- Trace material claims to evidence.
- Recompute derived values.
- Check units, denominators, periods, timezones, rounding, nulls, totals, coverage,
  citations, privacy, and cross-format parity.
- Render self-contained HTML in a real browser and exercise its material
  interactions.
- Confirm every requested artifact exists and opens.
- Search for secrets, credentials, private content, and unintended absolute paths.

## Handoff and publication

Link exact artifact paths, state limitations and checks, and provide a detailed
conventional commit message.

If the user requests publication, archive, deployment, or sharing through
11reports, follow the separate
[`11archive-publish-report`](../11archive-publish-report/SKILL.md) only after the
source report is complete and verified.
