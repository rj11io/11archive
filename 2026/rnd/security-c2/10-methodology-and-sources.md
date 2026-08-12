# Methodology and sources

## What this report is

A desk study. It was built on 11 August 2026 by searching for and reading public
material on command-and-control channels, then organising what that material says
and reasoning about it.

**It contains no original measurement.** No network was instrumented, no malware
was run, no traffic was captured, no framework was installed. That is the single
most important limitation and it shapes everything below.

What the report adds beyond its sources is organisation, arithmetic, and judgement:
grouping techniques by the trade-off each represents, identifying where sources
disagree and why, working out a small number of derived figures, and ranking
controls. Everything in that third category is labelled INFERRED so you can
separate it from what the evidence says.

## Scope decisions

**Included.** How channels work, what each costs the attacker, what reveals each
one, which tools implement them, how the supporting infrastructure is built and
hidden, what detection works and what does not, what disruption operations achieve,
and three developments changing the picture.

**Deliberately excluded.** Implant source code, working configuration files,
step-by-step instructions for evading a named security product, and anything that
would function as operational tooling rather than as description. Where a technique
is described, the level of detail matches what the cited vendor advisories and
academic papers already publish — that level is what a defender needs to write a
rule, and it is already public.

**Out of scope, and worth naming.** Industrial control system protocols, mobile
platform channels, and the internal design of botnet peer-to-peer networks. Each
would need its own report.

## Evidence labels

| Label | Meaning |
| --- | --- |
| DOCUMENTED | The thing's own owner says so: vendor documentation, a release note, a government advisory, the ATT&CK catalogue |
| REPORTED | A named third party published it; not independently checked here |
| CALCULATED | Worked out in this report from reported numbers, using a formula listed below |
| INFERRED | A judgement drawn from the evidence; no source states it |

INFERRED is used heavily, particularly in the ranked control list in
[06-defender-playbook.md](06-defender-playbook.md) and the detection hierarchy in
[05-detection-engineering.md](05-detection-engineering.md). Those are arguments,
not findings. They are labelled that way throughout, and the reasoning is shown so
that a specific step can be disputed rather than the whole conclusion.

## How sources were read

An important distinction that most reports leave implicit.

**READ** means the full page or document was retrieved and read. 15 sources.

**SUMMARY** means only a search-result extract was seen — enough to attribute a
specific claim to a named publisher, but not the full context. 39 sources.

Claims resting on SUMMARY sources are weaker. Where such a claim carries real
analytical weight it is flagged in the text: the QUIC evasion percentages in
[08-frontier.md](08-frontier.md) are the clearest case, and they are explicitly
marked as indicative rather than established.

## Every calculation

| Result | Formula | Inputs | Where used |
| --- | --- | --- | --- |
| 9.11% of all analysed samples made a direct-to-address C2 connection | 20.11% × 45.32% | Unit 42, Aug 2026 | Brief, ch. 2 |
| January 2026 ran at 2.60× the 2025 monthly average | 1,921 ÷ 739 | Hunt.io | Brief, ch. 3 |
| 739.0 monthly average (consistency check) | 8,868 ÷ 12 | Hunt.io | ch. 3 |
| 45 catalogued entries in TA0011 | 18 + 27 | ATT&CK v19 | Brief, ch. 2 |
| 27 sub-techniques | 5+2+3+3+2+4+3+2+3 | ATT&CK v19 table | ch. 2 |
| 2 techniques added since ATT&CK v10.1, identified as T1659 and T1665 | list difference: 18 current parents minus 16 in the v10.1 mirror | ATT&CK v19 vs cyber-kill-chain.ch | ch. 2 |

The 739.0 check matters: it confirms Hunt.io's stated monthly average and its
annual total are internally consistent, which raises confidence in the 1,921 figure
drawn from the same source.

**No totals are computed for the Operation Endgame server counts** in
[07-disruption-and-law.md](07-disruption-and-law.md). The sources do not state
whether infrastructure counted in one phase was excluded from later phases, so a
sum could double count. The phases are shown individually instead.

## Conflicts, and how each was resolved

**1. Which C2 framework leads.** Three sources, three answers: Kaspersky's
open-source reporting counts put Sliver first; Red Canary's endpoint detections put
Cobalt Strike first; Hunt.io's internet scanning shows Cobalt Strike at large
scale. **Resolution:** all three are reported, with an analysis of what each method
actually measures. No single ranking is presented as correct, because the question
"which framework leads" has no method-independent answer.

**2. Kaspersky's framework ordering.** A widely shared secondary summary lists six
frameworks "in that order" including Cobalt Strike sixth. Kaspersky's own report
names four and in a different order. **Resolution:** the primary text was fetched
and used; the secondary ordering is recorded as an exclusion below.

**3. What the Cobalt Strike court order permitted.** Secondary coverage says
"seize domain names and take down IP addresses". Microsoft's own account says
disrupt infrastructure and notify providers and response teams. **Resolution:**
Microsoft's account used as authoritative, with the discrepancy stated explicitly
in both the brief and [07-disruption-and-law.md](07-disruption-and-law.md), because
the difference changes what anyone should expect legal action to accomplish.

**4. How many C2 servers exist.** Hunt.io reports 1,921 unique Cobalt Strike
addresses in January 2026. A hobbyist tracker reports 63 servers across seven
frameworks in one week of May 2026. **Resolution:** both reported, with the
explanation that these measure scanning breadth and matching looseness rather than
a shared underlying quantity.

**5. ATT&CK technique counts.** The current catalogue lists 18 parent techniques;
an older mirror lists 16; one search summary said "16 techniques and approximately
29 sub-techniques (45 entries)". **Resolution:** the current catalogue was fetched
and counted directly. The older mirror is cited only as the v10.1 comparison point.

## Claims excluded, and why

Recording these is part of the method. Each was found during research and left out.

| Claim | Reason for exclusion |
| --- | --- |
| Cracked Cobalt Strike used to attempt infection of ~1.5 million devices | Appears in secondary coverage; not present in Microsoft's own account, which was retrieved and read |
| DNS tunnelling tool shares: Cobalt Strike 26%, Iodine 24%, DNSCat2 13% | The summary containing them mixes "share of detected activity" with "detection rate" in one sentence, which indicates a garbled aggregation. Not traced to a primary source |
| Kaspersky's six-framework ranking with Cobalt Strike sixth | Contradicted by the primary Securelist text, which was fetched |
| A 2026 APT28 campaign using a Covenant backdoor beaconing to cloud storage, with specific email and country counts | The Trellix page returned HTTP 403 and could not be read. Consequently Covenant's "seen in real attacks" cell in ch. 3 reads "not verified here" |
| Performance metrics for arXiv 2506.08922 | Not extractable from the PDF during research. Recorded as unavailable rather than estimated |
| Performance metrics for arXiv 2512.20423 | Not stated in the abstract, which was all that could be read |
| Current-year Red Canary framework rankings | The page served under the current-report URL is the 2022 report. Cited as 2022 rather than presented as current |

The CISA fast flux advisory `AA25-093A` could not be retrieved directly — both the
CISA page and the IC3 PDF failed. Its contents are therefore cited from a named
secondary summary, which is stated inline where used in
[04-infrastructure-and-evasion.md](04-infrastructure-and-evasion.md).

## Limitations

**No original measurement.** Stated first because it is the most important. Every
number here was measured by someone else, using methods this report could not
inspect.

**Vendor telemetry bias, in a specific direction.** Most quantitative sources are
security vendors counting what their own sensors detected. A sensor cannot count
what it does not recognise, so these figures systematically undercount novel and
well-hidden channels — which is precisely the category the report argues is
growing. Every prevalence number should be read as a floor.

**Prevalence is unmeasurable in principle.** There is no census of control
channels. Internet scanning finds servers that answer probes; endpoint products
find implants they recognise; researchers write up what interests them. All three
miss careful operators by construction. Any statement about how common a technique
is inherits this.

**Recency is uneven.** Sources range from 2018 platform changes to August 2026
research. Where a source is materially older than the claim it supports — the 2022
Red Canary rankings, the 2023 DNS tunnelling study — the date is given inline so
the reader can discount it.

**Geographic and linguistic concentration.** Sources are predominantly US and
European, in English. Chinese, Russian, and other non-English research on this
topic exists and is not represented. This likely skews which threat actors and
which techniques appear prominent.

**Two-thirds of sources were read only as search extracts.** 39 of 54. Attribution
is accurate; full context was not always available.

**The rankings are judgements.** The control ranking in ch. 6, the detection
hierarchy in ch. 5, and the prevalence-versus-difficulty table in ch. 2 are all
INFERRED. They reflect reasoning about the cited evidence. Another analyst reading
the same sources could rank differently, and the reasoning is exposed so that
disagreement can be specific.

## Verification performed

- Every derived figure recomputed independently; results in the calculations table
  above.
- Hunt.io's internal consistency checked (8,868 ÷ 12 = 739.0 against its stated
  average). Passed.
- ATT&CK technique and sub-technique counts recounted from the fetched table rather
  than taken from a summary.
- Every cited URL recorded in the source table below and in `data.json`.
- Terminology checked for consistency between narrative, tables, glossary, and
  `data.json`.
- Acronyms checked for expansion on first use.
- Markdown and HTML checked for the same facts, ordering, and limitations.
- Report searched for secrets, credentials, personal data, and local absolute
  paths. None present.
- `report.html` rendered in a browser and its table interactions exercised.

## Sources

54 sources. **R** = read in full. **S** = seen as a search extract only.

### Catalogues and government advisories

| # | Source | Date | How |
| --- | --- | --- | --- |
| 1 | [MITRE ATT&CK TA0011 Command and Control](https://attack.mitre.org/tactics/TA0011/) (v19) | modified 2025-04-25 | R |
| 2 | [TA0011 mirror at ATT&CK v10.1](https://cyber-kill-chain.ch/tactics/TA0011/) | — | R |
| 3 | [CISA AA25-093A, Fast Flux: A National Security Threat](https://www.cisa.gov/news-events/cybersecurity-advisories/aa25-093a) | 2025-04-03 | S (403) |
| 4 | [CISA AA24-038A, PRC state-sponsored actors in US critical infrastructure](https://www.cisa.gov/news-events/cybersecurity-advisories/aa24-038a) | 2024-02 | S |
| 5 | [US Treasury press release SB0185, bulletproof hosting sanctions](https://home.treasury.gov/news/press-releases/sb0185) | 2025-11-19 | S |
| 6 | [Europol, 1,025 servers taken down](https://www.europol.europa.eu/media-press/newsroom/news/end-of-game-for-cybercrime-infrastructure-1025-servers-taken-down) | 2025-11 | S |
| 7 | [Eurojust, Operation Endgame continues](https://www.eurojust.europa.eu/news/operation-endgame-continues-international-coalition-takes-malware-offline) | 2026-06 | S |
| 8 | [MITRE ATT&CK group G1017, Volt Typhoon](https://attack.mitre.org/groups/G1017/) | — | S |

### Vendor and platform primary material

| # | Source | Date | How |
| --- | --- | --- | --- |
| 9 | [Cobalt Strike release notes](https://download.cobaltstrike.com/releasenotes.txt) | to 2026-06 | R |
| 10 | [Cobalt Strike, Sleep Masks](https://www.cobaltstrike.com/sleep-masks) | — | S |
| 11 | [Cobalt Strike 4.12: Fix Up, Look Sharp](https://www.cobaltstrike.com/blog/cobalt-strike-412-fix-up-look-sharp) | 2025-11 | S |
| 12 | [Microsoft, Stopping cybercriminals from abusing security tools](https://blogs.microsoft.com/on-the-issues/2023/04/06/stopping-cybercriminals-from-abusing-security-tools/) | 2023-04-06 | R |
| 13 | [Microsoft, Volt Typhoon targets US critical infrastructure](https://www.microsoft.com/en-us/security/blog/2023/05/24/volt-typhoon-targets-us-critical-infrastructure-with-living-off-the-land-techniques/) | 2023-05-24 | S |
| 14 | [Microsoft Learn, stop domain fronting before 8 January 2024](https://learn.microsoft.com/en-us/answers/questions/1421101/take-action-to-stop-domain-fronting-on-your-applic) | 2023 | S |
| 15 | [Microsoft Tech Community, prohibiting domain fronting with Azure Front Door](https://techcommunity.microsoft.com/t5/azure-networking-blog/prohibiting-domain-fronting-with-azure-front-door-and-azure-cdn/ba-p/4006619) | 2023 | S |
| 16 | [Cloudflare 2026 Threat Report](https://blog.cloudflare.com/2026-threat-report/) | 2026-03-03 | R |
| 17 | [Bishop Fox Sliver, mutual TLS communication (DeepWiki)](https://deepwiki.com/BishopFox/sliver/6.1-mtls-communication) | — | S |
| 18 | [RITA on GitHub](https://github.com/activecm/rita) | — | S |

### Threat research

| # | Source | Date | How |
| --- | --- | --- | --- |
| 19 | [Unit 42, Almost Half of Malware Samples Communicate Direct to IP](https://unit42.paloaltonetworks.com/malware-bypass-dns-direct-to-ip/) | 2026-08-04 | R |
| 20 | [Unit 42, Understanding DNS Tunneling Traffic in the Wild](https://unit42.paloaltonetworks.com/dns-tunneling-in-the-wild/) | 2023-10-13 | R |
| 21 | [Unit 42, AdaptixC2: A New Open-Source Framework Leveraged in Real-World Attacks](https://unit42.paloaltonetworks.com/adaptixc2-post-exploitation-framework/) | 2025-09-10 | R |
| 22 | [Unit 42 Global Incident Response Report 2026](https://www.paloaltonetworks.com/blog/2026/02/unit-42-global-ir-report/) | 2026-02 | S |
| 23 | [Kaspersky Securelist, vulnerability landscape Q2 2025](https://securelist.com/vulnerabilities-and-exploits-in-q2-2025/117333/) | 2025-08-27 | R |
| 24 | [Kaspersky Securelist, detecting the AdaptixC2 agent](https://securelist.com/tr/adaptixc2-network-and-host-detection/119424/) | 2026-04-17 | R |
| 25 | [Zscaler, Tropic Trooper pivots to AdaptixC2 and a custom Beacon listener](https://www.zscaler.com/blogs/security-research/tropic-trooper-pivots-adaptixc2-and-custom-beacon-listener) | 2026-04-22 | R |
| 26 | [Red Canary Threat Detection Report, C2 Frameworks](https://redcanary.com/threat-detection-report/trends/c2-frameworks/) | 2022 report | R |
| 27 | [Hunt.io, Complete Guide to Hunting Cobalt Strike part 4](https://hunt.io/blog/guide-hunting-cobalt-strike-part-4-c2-feeds-api) | 2026-08-10 | R |
| 28 | [Hunt.io, Exposing Russian malicious infrastructure](https://hunt.io/blog/russian-malicious-infrastructure-c2-servers-mapped) | — | S |
| 29 | [The Hacker News, Russian ransomware gangs weaponize AdaptixC2](https://thehackernews.com/2025/10/russian-ransomware-gangs-weaponize-open.html) | 2025-10 | S |
| 30 | [Infosecurity Magazine, AI-enabled malware now actively deployed](https://www.infosecurity-magazine.com/news/aienabled-malware-actively/) | 2025-11-06 | R |
| 31 | [stingrai, PROMPTSTEAL and PROMPTFLUX](https://www.stingrai.io/blog/promptsteal-promptflux-malware-llm-at-runtime) | 2026 | S |
| 32 | [DecryptionDigest, GopherWhisper uses Slack and Discord as C2](https://www.decryptiondigest.com/blog/gopherwhisper-china-apt-slack-discord-outlook-c2) | 2026 | S |
| 33 | [Vectra, Salt Typhoon threat briefing](https://www.vectra.ai/resources/vectra-ai-threat-briefing-salt-typhoon) | — | S |
| 34 | [Picus, Volt Typhoon explained](https://www.picussecurity.com/resource/blog/volt-typhoon-living-off-the-land-cyber-espionage) | — | S |
| 35 | [Tsurezure Diary, weekly threat infrastructure investigation week 19](https://disconinja.hatenablog.com/entry/2026/05/10/144248) | 2026-05-10 | S |

### Detection and defensive practice

| # | Source | Date | How |
| --- | --- | --- | --- |
| 36 | [Black Hills Information Security, detecting malware beacons with Zeek and RITA](https://www.blackhillsinfosec.com/detecting-malware-beacons-with-zeek-and-rita/) | — | S |
| 37 | [Active Countermeasures, RITA](https://www.activecountermeasures.com/free-tools/rita/) | — | S |
| 38 | [Threat Hunting Labs, beacons](https://activecm.github.io/threat-hunting-labs/beacons/) | — | S |
| 39 | [Hive Security, Cobalt Strike detection and hunting playbook](https://hivesecurity.gitlab.io/blog/cobalt-strike-detection-hunting/) | — | S |
| 40 | [Hive Security, C2 without owning C2](https://hivesecurity.gitlab.io/blog/c2-without-owning-c2/) | — | S |
| 41 | [FoxIO, JA4+ network fingerprinting](https://blog.foxio.io/ja4+-network-fingerprinting) | 2023-11 | S |
| 42 | [systemshardening.com, passive TLS fingerprinting with JA3 and JA4](https://www.systemshardening.com/articles/network/tls-fingerprinting-ja3-ja4/) | — | S |
| 43 | [Corelight, Zeek and Sigma compatibility](https://corelight.com/blog/zeek-sigma-fully-compatible-for-cross-siem-detections) | — | S |
| 44 | [Security Boulevard, writing Suricata rules to detect C2 traffic](https://securityboulevard.com/2026/08/writing-suricata-rules-to-detect-command-and-control-traffic/) | 2026-08 | S |
| 45 | [Medium / Aman, detecting payload execution and C2 with Wazuh, Suricata and Zeek](https://medium.com/@amgill003ca/detecting-payload-execution-and-c2-communication-using-wazuh-suricata-and-zeek-1776cb47f3df) | — | S |
| 46 | [BlueCat, NSA and CISA on protective DNS](https://bluecatnetworks.com/blog/nsa-and-cisa-protective-dns-key-to-network-defense/) | — | S |
| 47 | [Vectra, CISA flags fast flux as a national threat](https://www.vectra.ai/blog/cisa-flags-fast-flux-as-a-national-threat-are-you-covered) | 2025 | R |
| 48 | [Medium / TΞLΞMΞTRY, hunting Cobalt Strike servers](https://t3l3m3try.medium.com/hunting-cobalt-strike-servers-385c5bedda7b) | — | S |

### Academic

| # | Source | Date | How |
| --- | --- | --- | --- |
| 49 | [Parssegny, Mazel, Levillain, Chifflier, Striking Back At Cobalt (arXiv 2506.08922)](https://arxiv.org/pdf/2506.08922) | 2025-06-11 | R (metrics not extractable) |
| 50 | [Elaoumari, Evasion-Resilient Detection of DNS-over-HTTPS Data Exfiltration (arXiv 2512.20423)](https://arxiv.org/abs/2512.20423) | 2025-12-23 | R (abstract) |
| 51 | [The Promptware Kill Chain (arXiv 2601.09625)](https://arxiv.org/pdf/2601.09625) | 2026-01 | S |

### Reference and background

| # | Source | Date | How |
| --- | --- | --- | --- |
| 52 | [Wikipedia, Domain fronting](https://en.wikipedia.org/wiki/Domain_fronting) | — | S |
| 53 | [Haven, Domain fronting explained](https://havenmessenger.com/blog/posts/domain-fronting-explained/) | — | S |
| 54 | [ring0shady, Sliver C2 deep dive](https://ring0shady.github.io/posts/sliver-c2-deep-dive/) | — | S |

Additional sources consulted for the sanctions and Operation Endgame tables, cited
inline in [04-infrastructure-and-evasion.md](04-infrastructure-and-evasion.md) and
[07-disruption-and-law.md](07-disruption-and-law.md):
[Elliptic](https://www.elliptic.co/blog/us-cracks-down-on-russian-bulletproof-hosting-services),
[Chainalysis](https://www.chainalysis.com/blog/ofac-sanctions-aeza-group-bulletproof-hosting-crypto-payments-july-2025/),
[Security Affairs on sanctions](https://securityaffairs.com/184871/cyber-crime/coordinated-sanctions-hit-russian-bulletproof-hosting-providers-enabling-top-ransomware-ops.html),
[Security Affairs on Endgame](https://securityaffairs.com/184581/cyber-crime/a-new-round-of-europols-operation-endgame-dismantled-rhadamanthys-venom-rat-and-elysium-botnet.html),
[The Hacker News on Endgame](https://thehackernews.com/2025/11/operation-endgame-dismantles.html),
[The Hacker News on hosting sanctions](https://thehackernews.com/2025/07/us-sanctions-russian-bulletproof.html),
[Hackread](https://hackread.com/operation-endgame-disrupts-socgholish-malware/),
[Infosecurity on Endgame](https://www.infosecurity-magazine.com/news/operation-endgame-stealc-amadey/),
[BleepingComputer on the Cobalt Strike action](https://www.bleepingcomputer.com/news/security/microsoft-and-fortra-crack-down-on-malicious-cobalt-strike-servers/),
[CyberSecurityNews on Cobalt Strike 4.12](https://cybersecuritynews.com/cobalt-strike-4-12-released/),
[Medium / Khaled Fawzy on malleable profiles](https://khaled0x07.medium.com/engineering-a-highly-customized-malleable-c2-profile-30e0efee307c),
[dominicbreuker on Sliver transports](https://dominicbreuker.com/post/learning_sliver_c2_03_transports_in_detail_mtls_and_wg/),
[proxies.sx on HTTP/3 and QUIC](https://www.proxies.sx/use-cases/privacy/http3-quic).

## Reuse

`data.json` holds the structured evidence: the ATT&CK technique list, the framework
table, the prevalence figures with their sources, every calculation with its inputs,
every recorded conflict, every exclusion with its reason, and the full source list
with its read status. It is versioned so the tables can be rebuilt or checked
without re-reading the prose.
