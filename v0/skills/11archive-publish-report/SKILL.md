---
name: 11archive-publish-report
description: Package, validate, archive, Git-publish, deploy, and verify reports from 11archive through the separate 11reports engine. Use when a report folder in 11archive must be archived, published, deployed, shared, or converted from multiple Markdown files into one immutable 11reports bundle.
---

# Publish an 11archive report

Keep the source folder unchanged. Treat every published artifact as public because
the 11reports Git repository is public.

## Configure

Require `ELEVEN_REPORTS_REPO` to contain the absolute path to the local 11reports
checkout. Never hardcode the checkout, read a committed env file, or fall back to
cloning.

Validate the checkout before changing anything:

```bash
test -n "$ELEVEN_REPORTS_REPO"
test -f "$ELEVEN_REPORTS_REPO/v0/www/scripts/11reports.mjs"
test -z "$(git -C "$ELEVEN_REPORTS_REPO" status --porcelain)"
git -C "$ELEVEN_REPORTS_REPO" remote get-url origin
```

Require the origin to identify `rj11io/11reports`. Read these engine instructions
before publication:

- `$ELEVEN_REPORTS_REPO/v0/plugins/11reports/skills/11reports-import-reports/SKILL.md`
- `$ELEVEN_REPORTS_REPO/v0/plugins/11reports/skills/11reports-publish-report/SKILL.md`

## Inspect

1. Inventory the source without changing it.
2. Check for secrets, personal data, confidential material, executables, symlinks,
   remote scripts, and duplicate content already in 11reports.
3. Choose explicit title, summary, slug, creation time, tags, access, and exposure
   values. Default listing to `listed`, indexing to `false`, HTML to `sandbox`,
   Markdown to `render`, and data to `hidden`.
4. Never invent `data.json`.

## Prepare

Create a temporary parent outside the source. Name the output leaf exactly after
the source leaf so 11reports records the meaningful `source.originalPath`, then
run:

```bash
node v0/skills/11archive-publish-report/scripts/prepare-report.mjs \
  <source-directory> <new-output-directory> --check-engine --json
```

The script accepts one HTML file, any number of Markdown files, and optional exact
`data.json`. It writes canonical `report.html`, consolidated `report.md`, and
optional `data.json`. It rejects unsupported files and rewrites local Markdown
links in the deployment copy so they do not become production 404s.

## Dry-run and import

Use the engine CLI from the configured checkout. Dry-run against the real checkout
first:

```bash
node "$ELEVEN_REPORTS_REPO/v0/www/scripts/11reports.mjs" import \
  <prepared-directory> --repo "$ELEVEN_REPORTS_REPO" --dry-run --json \
  --title <title> --summary <summary> --slug <slug> --created-at <timestamp> \
  --tags <comma-separated-tags> --workflow 11archive-publish-report \
  --agent codex --skill 11archive-publish-report
```

Do the real import in a disposable repository-shaped directory, not the live
11reports checkout. This prevents an untracked bundle from remaining in its main
working tree:

```bash
mkdir -p <temporary-import-root>/v0/www/content/reports
node "$ELEVEN_REPORTS_REPO/v0/www/scripts/11reports.mjs" import \
  <prepared-directory> --repo <temporary-import-root> --json <same-metadata-flags>
```

Read `reports[0].bundle`. Inspect `manifest.json`, validate the bundle, and confirm
artifact hashes and exposure settings before publishing.

## Publish

Publish only the reviewed temporary bundle:

```bash
node "$ELEVEN_REPORTS_REPO/v0/www/scripts/11reports.mjs" publish \
  <bundle> --repo "$ELEVEN_REPORTS_REPO" --json
```

The engine must use its isolated worktree, stage one report directory, push without
force, and verify the deployed ID, digest, and commit receipt. Return the URL only
for `status: published`. Report `deployment_pending` explicitly with its receipt
and preserved worktree.

After success, fast-forward the clean local checkout and validate the archive:

```bash
git -C "$ELEVEN_REPORTS_REPO" pull --ff-only
npm --prefix "$ELEVEN_REPORTS_REPO/v0/www" run reports:validate
npm --prefix "$ELEVEN_REPORTS_REPO/v0/www" test
```

Open the HTML and Markdown views. Test every adapted internal link. Report the URL,
ID, digest, commit, source path, and any skipped check.

Never force-push, stage unrelated files, mutate the source report, delete a failed
publication worktree, or accept HTTP 200 without exact receipt headers.
