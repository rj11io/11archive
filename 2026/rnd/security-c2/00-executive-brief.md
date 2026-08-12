# Executive brief

## The finding

Command and control is the one part of an intrusion the attacker cannot skip, and
the part they have spent the last three years moving out of your reach.

The move has a shape. Attackers used to run their own servers and try to make the
traffic look ordinary. Increasingly they do not run servers at all. They put the
orders inside a service you already trust — a code repository, a chat webhook, a
draft email — so that the only thing your network sees is a normal connection to
`api.github.com`. There is no attacker-owned address to block, no certificate to
fingerprint, and no reputation score that helps.

At the same time, the tool that defined the category has lost its monopoly, and
the three ways of counting which tool leads now give three different answers. That
disagreement is not noise. It is the most useful thing in this report, because it
tells you which measurement to trust for which decision.

## The numbers that matter

| Measure | Value | Label | Source |
| --- | --- | --- | --- |
| Malware samples showing any C2 activity | 20.11% | REPORTED | [Unit 42, Aug 2026](https://unit42.paloaltonetworks.com/malware-bypass-dns-direct-to-ip/) |
| Of those, share contacting a hard-coded IP address, skipping DNS entirely | 45.32% | REPORTED | same |
| Share of all analysed samples that skip DNS for C2 | 9.11% | CALCULATED | 20.11% × 45.32% |
| Benign samples making any untrusted outbound connection | ~1% | REPORTED | same |
| Unique addresses hosting Cobalt Strike, January 2026 | 1,921 | REPORTED | [Hunt.io, Aug 2026](https://hunt.io/blog/guide-hunting-cobalt-strike-part-4-c2-feeds-api) |
| Monthly average for 2025 | ~739 | REPORTED | same |
| January 2026 as a multiple of the 2025 monthly average | 2.60× | CALCULATED | 1,921 ÷ 739 |
| Entries in the MITRE ATT&CK command-and-control tactic | 18 techniques, 27 sub-techniques | DOCUMENTED | [ATT&CK TA0011 v19](https://attack.mitre.org/tactics/TA0011/) |
| Fastest observed time from break-in to data leaving | 72 minutes | REPORTED | [Unit 42 IR Report 2026](https://www.paloaltonetworks.com/blog/2026/02/unit-42-global-ir-report/) |
| Servers disrupted, Operation Endgame November 2025 phase | 1,025 | REPORTED | [Europol](https://www.europol.europa.eu/media-press/newsroom/news/end-of-game-for-cybercrime-infrastructure-1025-servers-taken-down) |

The 20.11% figure deserves a moment. It is not a claim that four in five malware
samples are harmless — plenty of them steal data, encrypt disks, or mine
currency without ever taking an order. It is a claim about how much malware needs
a live operator. That one fifth is where the intrusions that end in ransomware,
espionage, and extortion live.

The contrast with benign software is the whole detection argument in one line.
REPORTED: malware with C2 averaged 4.17 unique destination addresses per sample
over TCP; benign samples that connected anywhere untrusted at all averaged 1.6
([Unit 42](https://unit42.paloaltonetworks.com/malware-bypass-dns-direct-to-ip/)).
Normal software talks to few places, consistently. Implants shop around.

## Seven things worth knowing

**1. The channel is the attacker's only unavoidable exposure.**
An attacker can avoid writing files to disk, avoid installing anything, avoid
touching a password store, and avoid running a single unusual program — the
"living off the land" approach that REPORTED made Volt Typhoon so hard to find
([Microsoft](https://www.microsoft.com/en-us/security/blog/2023/05/24/volt-typhoon-targets-us-critical-infrastructure-with-living-off-the-land-techniques/)).
What they cannot avoid is talking to something outside. INFERRED: this makes
egress — traffic leaving your network — the single highest-value place to invest
detection effort, because it is the only place where the attacker's requirements
and the defender's visibility are guaranteed to overlap.

**2. The three ways of counting C2 tools disagree, and each is right about
something different.**

| Counting method | What it actually measures | Who leads | Source |
| --- | --- | --- | --- |
| Open-source reporting frequency, H1 2025 | How often researchers write a tool up | Sliver, then Metasploit, Havoc, Brute Ratel C4 | [Kaspersky](https://securelist.com/vulnerabilities-and-exploits-in-q2-2025/117333/) |
| Confirmed detections in customer environments | What actually landed on managed endpoints | Cobalt Strike | [Red Canary](https://redcanary.com/threat-detection-report/trends/c2-frameworks/) |
| Internet-wide scanning for exposed servers | How much infrastructure is standing up | Cobalt Strike, by a wide margin | [Hunt.io](https://hunt.io/blog/guide-hunting-cobalt-strike-part-4-c2-feeds-api) |

INFERRED, and this is the practical takeaway: use scanning data to decide what to
block at the perimeter, use endpoint detection data to decide what to hunt for
inside, and treat reporting-frequency rankings as a signal about where research
attention is going rather than where risk is. A tool can top the reporting charts
because it is new and interesting while barely appearing in real incidents. A tool
can dominate the scanning data because it is easy to fingerprint — which is a
statement about detectability, not popularity.

**3. Free tools with no licence to revoke are displacing the paid one.**
Cobalt Strike costs money and Fortra can refuse to sell to you. Sliver, Havoc,
Mythic, and AdaptixC2 are free, open, and cannot be taken away. REPORTED:
AdaptixC2, first written up as a threat in September 2025, was inside Fog and
Akira ransomware operations within months
([Unit 42](https://unit42.paloaltonetworks.com/adaptixc2-post-exploitation-framework/),
[The Hacker News](https://thehackernews.com/2025/10/russian-ransomware-gangs-weaponize-open.html)).
INFERRED: legal and commercial pressure on a vendor pushes attackers toward tools
where no vendor exists to pressure. That is a real cost of the takedown strategy,
and it is rarely stated when takedowns are announced.

**4. "Hiding inside a trusted service" has become the default, not the exotic
option.**
REPORTED: a March 2026 campaign used a GitHub repository as its entire control
channel — the implant posted its session key to issue number one, then polled the
repository's open-issues list every 60 seconds, reading its orders from issue
titles and sending answers back as files committed to a `download/` folder
([Zscaler](https://www.zscaler.com/blogs/security-research/tropic-trooper-pivots-adaptixc2-and-custom-beacon-listener)).
REPORTED: Cloudflare's 2026 threat report describes the same pattern across
Google Calendar, Drive, Dropbox, GitHub, and paste sites used as address books
that point to the real server, and gives it a name — "living off the XaaS"
([Cloudflare](https://blog.cloudflare.com/2026-threat-report/)).
The defensive problem is blunt: you cannot blocklist GitHub.

**5. A rhythm survives the disguise.**
An implant that checks in on a schedule is periodic, and periodicity survives
encryption because it lives in the timing, not the content. Attackers add
randomness — "jitter" — to break the pattern. REPORTED: it does not work well
enough. A beacon sleeping randomly between 35 and 55 seconds still scores as
periodic once you have a few hundred connections to look at, because the *spread*
is regular even when each interval is not
([Active Countermeasures / Black Hills](https://www.blackhillsinfosec.com/detecting-malware-beacons-with-zeek-and-rita/)).
This is the most durable detection idea in the field, and it needs no decryption.

**6. Handshake fingerprints work, and they are decaying.**
Every program that opens an encrypted connection does so in a slightly distinctive
way. Hash those details and you get a fingerprint — JA3, JA4, and JARM are the
well-known schemes — that identifies the software without reading the traffic.
REPORTED: JA4X detects Sliver, Havoc, Metasploit, Tor, and various remote-access
implants ([FoxIO](https://blog.foxio.io/ja4+-network-fingerprinting)). REPORTED,
and more important: researchers found the overlap between C2 fingerprints and
legitimate servers grows over time, so a fingerprint database that is not
constantly refreshed quietly stops working
([systemshardening.com](https://www.systemshardening.com/articles/network/tls-fingerprinting-ja3-ja4/)).
INFERRED: treat fingerprint feeds as perishable stock, not as a control you
install once.

**7. The frontier is a model writing the commands.**
REPORTED: Google's threat intelligence group named five malware families in
November 2025 that call a language model at run time. PromptSteal queries a code
model to generate the exact Windows commands it needs, then sends what it
collects to a control server. PromptFlux rewrites its own code using Gemini.
PromptLock generates fresh scripts each run
([Infosecurity](https://www.infosecurity-magazine.com/news/aienabled-malware-actively/)).
REPORTED: PromptSteal, also tracked as LAMEHUG, was used against Ukraine and
attributed to APT28 — a human operator replaced by an automated loop.
INFERRED: this breaks detection that depends on the *content* of commands being
stable, because the content is now generated fresh each time. It does not break
detection that depends on the channel existing. Which is an argument for putting
detection weight on the channel rather than the payload.

## Where this report disagrees with its own sources

Two conflicts are worth surfacing rather than smoothing over.

**The Cobalt Strike takedown was disruption, not seizure.** Secondary coverage
describes the March 2023 court order as letting Microsoft and Fortra "seize domain
names and take down IP addresses"
([BleepingComputer](https://www.bleepingcomputer.com/news/security/microsoft-and-fortra-crack-down-on-malicious-cobalt-strike-servers/)).
Microsoft's own account is narrower: the order let them disrupt infrastructure and
notify internet providers and national response teams so those parties could act
([Microsoft](https://blogs.microsoft.com/on-the-issues/2023/04/06/stopping-cybercriminals-from-abusing-security-tools/)).
The distinction matters for anyone reasoning about what legal action can achieve —
the mechanism is largely persuasion at scale, backed by a court's authority, not
direct confiscation.

**Framework rankings from secondary aggregation are unreliable.** A widely shared
summary lists Kaspersky's top six as "Sliver, Havoc, Metasploit, Mythic, Brute
Ratel C4, Cobalt Strike, in that order". Kaspersky's own report names the top four
as Sliver, Metasploit, Havoc, Brute Ratel C4 — a different order, and it does not
place Cobalt Strike sixth
([Securelist](https://securelist.com/vulnerabilities-and-exploits-in-q2-2025/117333/)).
This report uses the primary text. See
[10-methodology-and-sources.md](10-methodology-and-sources.md) for the full list
of claims excluded for this reason.

## What to do

Ranked by benefit against effort. Full detail, including what each control misses,
is in [06-defender-playbook.md](06-defender-playbook.md).

| Action | Why it works | Effort |
| --- | --- | --- |
| Force all outbound DNS through one resolver you control and log | Removes the attacker's easiest tunnel and gives you the query record you need for everything else | days |
| Deny outbound traffic by default from servers | Most servers have no business calling the internet; this alone removes the channel for a large class of intrusions | weeks, political |
| Score outbound connections for periodicity, not just reputation | Catches unknown channels to unknown destinations, which reputation cannot | weeks |
| Alert on new destinations reached without a preceding DNS lookup | Directly targets the 9.11% that skip DNS, and is close to free once DNS is centralised | days |
| Refresh handshake-fingerprint feeds continuously | They decay; a stale feed reads as a working control | ongoing |
| Baseline which of your machines legitimately use GitHub, Slack, and cloud storage APIs | The trusted-service channel is only invisible if you have no baseline to compare against | weeks |
| Alert on requests to `/dns-query` from anything that is not your resolver | Encrypted DNS from an application is either a policy violation or a tunnel | hours |

One trap worth naming. Inspecting encrypted traffic by decrypting it looks like
the answer to all of this, and it is not. It requires putting a device in the
middle of every connection, it breaks certificate pinning, it creates a
high-value target holding all your plaintext, and it fails entirely against the
trusted-service channels described above — because the traffic really is going to
GitHub, and it really is authorised. INFERRED: metadata approaches — timing,
volume, destination novelty, fingerprints — give more detection per unit of risk
and cost than decryption does. Chapter 6 makes the case in detail.

## The one-line version

Attackers can hide what they say, where they say it from, and increasingly who
they appear to be saying it to — but they cannot stop saying it, and they cannot
stop saying it on a schedule.
