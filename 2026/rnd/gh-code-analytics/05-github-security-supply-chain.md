# Security and supply-chain data

This is the part of the GitHub surface with no local equivalent. Alert states,
scan results and the resolved dependency graph exist only on the platform. It is
also the part where "no data" and "no permission" look almost identical, and
where confusing the two turns an unmonitored repository into a clean report.

All calls made 2026-08-11 with a token holding `repo`, `read:org`, `workflow`,
`gist`. Note that it does **not** hold `security_events`, which is why several
rows below show 403. That is itself the finding: the scope you use decides which
security data exists as far as your collector is concerned.

## The status codes and what each one means

| Endpoint | Observed | Real meaning |
| --- | --- | --- |
| `GET /repos/{o}/{r}/code-scanning/alerts` | **404** on own repo, body `no analysis found` | scanning is on or off, but nothing has ever run |
| same, on a repo we do not administer | **403** | token lacks `security_events` |
| `GET /repos/{o}/{r}/secret-scanning/alerts` | **200, `[]`** on own repo | enabled, zero alerts. A real observed zero |
| same, on a repo we do not administer | **404** | not enabled, or not visible to us |
| `GET /repos/{o}/{r}/dependabot/alerts` | **403** on a repo we do not administer | needs write access plus alert read permission |
| same, on own repo | **200-shaped error**: `Dependabot alerts are disabled for this repository.` | the feature is off |
| `GET /repos/{o}/{r}/vulnerability-alerts` | **404** | alerts not enabled. 204 would mean enabled |
| `GET /repos/{o}/{r}/dependency-graph/sbom` | **404** on all four own repos, **200** on `cli/cli` | 404 here means the dependency graph is switched off |
| `GET /repos/{o}/{r}/security-advisories` | **200** | repository-published advisories, readable without extra scope |
| `GET /advisories` | **200** | the global advisory database, public |
| `GET /repos/{o}/{r}/attestations/{digest}` | **200, `{"attestations": []}`** | valid digest shape, nothing attested |

**The single most important rule in this chapter:** a 403 or 404 is an
*unavailable* result. It is not zero alerts. A dashboard that renders both as "0"
will show a repository with security scanning switched off as the safest
repository you own. Store the status code beside every count.

Four of the four repositories owned by the token holder returned "Dependabot
alerts are disabled" and had no code-scanning analysis. The data does not exist
to be collected. The first action is a settings change, not a collector.

## Checking what is switched on

Before collecting alerts, collect configuration. This is one call and it tells
you whether the alert numbers mean anything:

```bash
gh api repos/{owner}/{repo} --jq '.security_and_analysis'
```

Returns the enablement state of secret scanning, push protection, Dependabot
security updates, and advanced security where licensed. Pair it with:

```bash
gh api repos/{owner}/{repo}/vulnerability-alerts -i | head -1   # 204 on, 404 off
gh api repos/{owner}/{repo}/rulesets                            # [] means none
gh api repos/{owner}/{repo}/branches/{branch}/protection        # 404 "Branch not protected"
```

Observed on the test repository: rulesets `[]`, branch protection **404 "Branch
not protected"**. Both are real configuration findings and both are one call.

## The dependency graph and SBOM

An SBOM is a software bill of materials: a machine-readable list of every
package a project pulls in, in a standard format.

```bash
gh api repos/cli/cli/dependency-graph/sbom --jq '.sbom | {spdxVersion, dataLicense, packages: (.packages|length)}'
```

Observed for `cli/cli`:

| Field | Value |
| --- | --- |
| Format | SPDX-2.3 |
| Data licence | CC0-1.0 |
| Packages | 221 |
| Relationships | 1,189 |
| Packages carrying a version | 221 of 221 (100%) |
| Packages with a concluded licence | 181 of 221 (81.9%) |
| Generating tools | `protobom`, `GitHub.com-Dependency-Graph`, `dependabot` |
| `creationInfo.created` | the moment of the request |

Three things follow from that table.

**It is generated on demand.** The `created` timestamp equals request time, so
the SBOM reflects the default branch now. It is not a build artefact and it is
not tied to a release. For release provenance you need an SBOM produced by your
own build and attached to the release.

**Licence coverage is partial.** 18.1% of packages carry no concluded licence.
Reporting "licence compliance verified" from this data would be wrong for one
package in five. Report the coverage number beside the finding.

**404 is a configuration answer.** All four repositories owned by the token
holder returned 404, including ones with a `package-lock.json` containing 753
resolved packages. The lock file exists; the graph is off.

For comparison, the local view of the same question from
[02-local-code-structure.md](02-local-code-structure.md): 33 declared
dependencies resolving to 753 installed packages. The lock file is always
available offline and is more precise about versions. GitHub's graph adds the
cross-reference to known vulnerabilities, which the lock file cannot give you.

## The global advisory database

This one is free, public, needs no special scope, and is the most under-used
endpoint on the list.

```bash
gh api "advisories?ecosystem=npm&severity=critical&per_page=100"
```

Returns GHSA identifiers, CVE identifiers, severity, affected package names and
version ranges, patched versions, CVSS vectors, CWE identifiers and references.
Observed sample from today included `GHSA-rg76-677x-56q9` (CVE-2026-71851,
critical, `crypto-js`) and `GHSA-279x-mwfv-vcqv` (CVE-2026-71319, critical,
`@nuxt/devtools`).

Filters worth knowing: `ecosystem`, `severity`, `cwes`, `affects` (a package
name), `published` and `updated` date ranges, `type`. Pagination is cursor-based
through `before` and `after`, not page numbers.

**This lets you run your own vulnerability matching offline.** Take the resolved
package list from your lock file, take the advisory database for your ecosystem,
and join them. You get Dependabot's core function without enabling anything, for
any repository, including ones you do not own. What you do not get is the
transitive path explanation and the automatic pull requests.

## Artifact attestations and provenance

```bash
gh api repos/{owner}/{repo}/attestations/sha256:{digest}
```

Returns the signed statements that a specific artefact was built by a specific
workflow. Observed shape for a digest with nothing recorded: `{"attestations":
[]}` with status 200. A wrong repository returns 404.

This is the GitHub implementation of build provenance in the SLSA sense: a
signed record linking a binary to the source commit and the workflow that
produced it. It is generated by `actions/attest-build-provenance` in a workflow
and verified with `gh attestation verify`. If your build does not produce
attestations, this endpoint is empty rather than absent, which is a good example
of why the empty-versus-missing distinction has to be recorded.

## Repository-published advisories

```bash
gh api repos/{owner}/{repo}/security-advisories --jq '[.[] | {ghsa_id, severity, state, published_at}]'
```

Observed on a project that publishes them: `GHSA-r4w5-6pfg-jxp5` (medium,
published 2026-07-27) and `GHSA-q6m5-f73j-m9mc` (critical, published
2026-06-03). Readable on public repositories without extra scope, which makes it
a good way to track the security history of your **dependencies'** repositories,
not only your own.

## Static analysis you can run yourself

Code scanning results live on GitHub, but the scanners run anywhere. Running
them locally gives you findings on repositories where the platform feature is
off, and it gives you the findings before the push.

| Tool | Finds | Local invocation |
| --- | --- | --- |
| Semgrep | pattern-based bugs and injection risks across 30+ languages | `semgrep --config=auto .` |
| Gitleaks | secrets in the working tree **and in history** | `gitleaks detect --source .` |
| Trivy | vulnerable dependencies, container layers, misconfiguration | `trivy fs .` |
| CodeQL CLI | deep dataflow queries, the engine behind GitHub code scanning | `codeql database create` then `codeql database analyze` |
| OSV-Scanner | lock file to advisory matching, from Google's OSV database | `osv-scanner -r .` |

Availability on the machine used for this report, checked with `command -v`:
`semgrep` present, `gitleaks` absent, `trivy` absent, `codeql` absent,
`osv-scanner` absent. Nothing was installed for this research, so the numbers in
this report use only `git`, `gh`, `jq`, `node` and `awk`.

**Gitleaks deserves special mention.** It scans history, not just the current
tree. A secret removed in a later commit is still in the pack file and still
retrievable, so a clean working tree proves nothing. This is the one security
scan whose local version is strictly more useful than the platform version,
because GitHub's secret scanning covers a fixed provider list while a history
scan finds anything shaped like a credential.

## Supply-chain posture in one number

OpenSSF Scorecard grades a repository against 19 to 23 automated checks and
returns 0 to 10 per check plus a weighted total. Weights follow the risk level:
critical counts 10, high 7.5, medium 5, low 2.5.

Checks include: Binary-Artifacts, Branch-Protection, CI-Tests, CII-Best-Practices,
Code-Review, Contributors, Dangerous-Workflow, Dependency-Update-Tool, Fuzzing,
License, Maintained, Packaging, Pinned-Dependencies, SAST, Security-Policy,
Signed-Releases, Token-Permissions, Vulnerabilities, Webhooks.

Run it three ways: the command line tool, a GitHub Action on a schedule, or the
public API and BigQuery dataset of pre-computed scores for widely used projects.
The last one is the interesting one for supply-chain work, because it lets you
score your **dependencies** without cloning any of them.

Caveat: Scorecard measures process, not code. A project can score well and still
be unsafe, and a small well-written library will score poorly for lacking fuzzing
and a security policy. Use it to sort a long list of dependencies, not to judge
one.

## What to collect, and how often

| Item | Cost | Cadence |
| --- | --- | --- |
| `security_and_analysis` enablement flags | 1 request | daily |
| Alert counts per category, with the status code | 1 request each | daily |
| Alert age distribution (oldest open alert per severity) | reuse the list call | daily |
| SBOM | 1 request | weekly, and on every release |
| Global advisories for your ecosystems, incremental by `published` | a few requests | daily |
| Scorecard | 1 job | weekly |
| Gitleaks history scan | minutes | on every push, and once in full |

Alert **age** matters more than alert **count**. A repository with 40 alerts all
opened yesterday is healthier than one with 3 alerts open for 8 months. Both the
Dependabot and code-scanning alert objects carry `created_at`, `dismissed_at`
and `fixed_at`, which is everything you need for a time-to-remediate
distribution.
