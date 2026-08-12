# The framework landscape

## What a framework is, and why one exists at all

A command-and-control framework is a product. It has a server the operator runs, a
console they work from, and a generator that builds implants for whatever machine
they are targeting. It handles the encryption, the scheduling, the file transfers,
the module loading, and the bookkeeping of thirty compromised machines at once.

These tools were built for penetration testers and red teams — security
professionals who are paid to break into their own employer's network and report
what they found. That work is legitimate, valuable, and requires exactly the
capabilities an intruder needs. Which is the whole problem: a tool that
convincingly emulates an attacker is a tool an attacker can use.

Every framework named below is a real security testing product with real
legitimate users. Naming them describes what defenders are finding, not what their
authors intended.

## The lineup

REPORTED and DOCUMENTED as marked in the notes. Costs and languages come from each
project's own material; the "seen in real attacks" column comes from the named
third-party reporting cited under each entry.

| Framework | Author | Language | Cost | Channel types | Seen in real attacks |
| --- | --- | --- | --- | --- | --- |
| Cobalt Strike | Fortra | Java server, C implant | commercial | HTTP, HTTPS, DNS, SMB pipes, TCP, SSH | extensively |
| Sliver | Bishop Fox | Go | free, open | mutual TLS, HTTP, HTTPS, DNS, WireGuard | extensively |
| Metasploit | Rapid7 | Ruby | free tier plus commercial | many | extensively |
| Havoc | community | C++, Go | free, open | HTTP, HTTPS, SMB pipes | extensively |
| Mythic | community | Python, Go | free, open | varies by agent: TCP, HTTP, DNS, SMB | yes |
| Brute Ratel C4 | Dark Vortex | C | commercial | HTTP, HTTPS, DNS, SMB, TCP | yes |
| AdaptixC2 | community | Go, C++ | free, open | HTTP, HTTPS, mutual TLS, DNS, encrypted DNS, SMB pipes, TCP | yes, rising |
| Empire | community | Python | free, open | HTTP, HTTPS | historically |
| Covenant | community | .NET | free, open | HTTP, HTTPS | not verified here |
| NimPlant | community | Nim | free, open | HTTP, HTTPS | limited |
| SuperShell | community | Go | free, open | HTTP, HTTPS | limited |

Sources for the "seen in real attacks" column, in order of the rows that need one:
[Red Canary](https://redcanary.com/threat-detection-report/trends/c2-frameworks/) and
[Microsoft](https://blogs.microsoft.com/on-the-issues/2023/04/06/stopping-cybercriminals-from-abusing-security-tools/)
for Cobalt Strike;
[Kaspersky](https://securelist.com/vulnerabilities-and-exploits-in-q2-2025/117333/)
for Sliver, Metasploit, Havoc, and Brute Ratel C4;
[Unit 42](https://unit42.paloaltonetworks.com/adaptixc2-post-exploitation-framework/)
and [The Hacker News](https://thehackernews.com/2025/10/russian-ransomware-gangs-weaponize-open.html)
for AdaptixC2; and a weekly infrastructure tracker
([Tsurezure Diary, May 2026](https://disconinja.hatenablog.com/entry/2026/05/10/144248))
for Mythic, NimPlant, and SuperShell. Covenant is listed as "not verified here"
because the one 2026 report found attributing it to a named campaign could not be
retrieved — see the exclusions list in
[10-methodology-and-sources.md](10-methodology-and-sources.md).

## The ranking problem

Three respected organisations publish which frameworks matter most. They disagree.
Understanding why is more useful than picking a winner.

### What each measurement is actually counting

| Source | Method | Result | Period |
| --- | --- | --- | --- |
| [Kaspersky Securelist](https://securelist.com/vulnerabilities-and-exploits-in-q2-2025/117333/) | Frequency of framework mentions in open-source reporting | Top four: Sliver, Metasploit, Havoc, Brute Ratel C4 | H1 2025 |
| [Red Canary](https://redcanary.com/threat-detection-report/trends/c2-frameworks/) | Confirmed detections across managed customer environments | Cobalt Strike leads; Metasploit second | 2022 report |
| [Hunt.io](https://hunt.io/blog/guide-hunting-cobalt-strike-part-4-c2-feeds-api) | Internet-wide scanning for exposed servers | Cobalt Strike, at large scale | 2025–Jan 2026 |

INFERRED, taking each in turn.

**Reporting frequency measures research attention.** A framework gets written up
when it is novel, when it is easy to analyse, or when a vendor wants to
demonstrate coverage. Kaspersky's own methodology note is careful about this: the
ranking comes from tracking "the frequency of known C2 framework usage in attacks"
across open sources. A well-established tool that everyone already understands
generates fewer new write-ups than a newcomer, regardless of which is more common.
Sliver topping this list is a real signal — but the signal is "Sliver is where the
analytical energy is", which is not the same as "Sliver is in most intrusions".

**Endpoint detection counts measure what defenders caught on machines they were
watching.** This is the closest thing to ground truth about real intrusions, and
it is biased in a specific direction: toward frameworks that are well-signatured.
A framework the sensor does not recognise does not appear in the count. Note also
that the Red Canary page cited here is from its 2022 report, so it is the oldest
of the three and should be weighted accordingly.

**Internet scanning measures infrastructure that answers a probe.** This is the
most precise of the three and the most systematically skewed. A server is counted
if a scanner can identify it — meaning the count rewards frameworks that are easy
to fingerprint and misses those hiding behind a relay, requiring a client
certificate, or living inside GitHub. Cobalt Strike dominates the scanning data
partly because it is the most heavily studied and therefore the most identifiable
target on the internet.

### The numbers behind the scanning view

REPORTED ([Hunt.io](https://hunt.io/blog/guide-hunting-cobalt-strike-part-4-c2-feeds-api)):

| Measure | Value |
| --- | --- |
| Unique addresses hosting Cobalt Strike, January 2026 | 1,921 |
| Distinct addresses across all of 2025 | 8,868 |
| 2025 monthly average | ~739 |

CALCULATED: 8,868 ÷ 12 = 739.0, which matches the reported monthly average exactly
— the figures are internally consistent. CALCULATED: January 2026 ran at 2.60× the
2025 monthly average.

INFERRED, and worth stating carefully because it is easy to misread: a jump in
distinct addresses is not necessarily a jump in operations. It is at least as
likely to indicate faster rotation — the same operators cycling through more
addresses to stay ahead of blocklists. The source itself frames the finding that
way, emphasising "rapid rotation and dynamic deployment". A number that goes up
because attackers are moving faster looks identical to a number that goes up
because there are more attackers, and this dataset cannot separate them.

For contrast on scope: REPORTED, a hobbyist tracker monitoring seven frameworks
identified 63 servers worldwide in the week of 4–10 May 2026
([Tsurezure Diary](https://disconinja.hatenablog.com/entry/2026/05/10/144248)).
INFERRED: the two-orders-of-magnitude gap against Hunt.io's figures is not a
contradiction — it is what happens when you change how much you scan and how
loosely you match. Any published count of "how many C2 servers exist" is really a
statement about the scanner.

## The four that matter most

### Cobalt Strike

The commercial product that defined the category. Its implant is called Beacon,
and its defining feature is the **malleable profile** — a configuration file that
changes almost everything about how the implant behaves on the network and in
memory.

REPORTED: a malleable profile is often mistaken for cosmetic traffic disguise, but
it is better understood as a behaviour policy — it controls HTTP header values,
payload encoding, sleep timing, and how the implant injects into other processes
([Medium / Khaled Fawzy](https://khaled0x07.medium.com/engineering-a-highly-customized-malleable-c2-profile-30e0efee307c)).

Its other well-known feature is the **sleep mask**. When a beacon is idle its code
sits in memory where a scanner can find it, so the sleep mask scrambles that
memory while dormant and unscrambles it only to check in. DOCUMENTED: Fortra's own
documentation describes the built-in behaviour as XOR-based obfuscation of strings
and data before sleeping ([Cobalt Strike](https://www.cobaltstrike.com/sleep-masks)).
INFERRED: this means memory scanning has a narrow window — the moments around each
check-in — which is a direct argument for continuous rather than scheduled memory
inspection.

Development continues actively. DOCUMENTED, from Fortra's own release notes: 4.13
shipped June 2026 with reworked task tracking and the ability to change malleable
settings without restarting the server; 4.12 in November 2025 added "drip loading"
and a REST interface in beta
([release notes](https://download.cobaltstrike.com/releasenotes.txt),
[Cobalt Strike blog](https://www.cobaltstrike.com/blog/cobalt-strike-412-fix-up-look-sharp)).
REPORTED: drip loading writes a payload into memory in small pieces with delays
between them, specifically to break the event-correlation logic that endpoint
products use to spot injection
([CyberSecurityNews](https://cybersecuritynews.com/cobalt-strike-4-12-released/)).
4.12 also added two Windows privilege-escalation bypasses covering up to Windows 11
24H2, and raised the in-memory download ceiling to 2 GB so large files never touch
disk.

INFERRED: read that release list as a statement of where the arms race is. Every
headline item targets a specific detection method — event correlation, disk-based
scanning, restart-based configuration extraction.

### Sliver

Written in Go by Bishop Fox, free and open. Its significance is that it made
Cobalt Strike's capabilities free.

REPORTED: it offers mutual TLS, HTTP, HTTPS, DNS, and WireGuard channels, with
mutual TLS authenticating both ends by certificate and WireGuard building a full
encrypted tunnel between implant and server. It runs implants in either patient
beacon mode or live session mode, and being written in Go it cross-compiles for
Windows, Linux, and macOS from one codebase
([Sliver field guide](https://ring0shady.github.io/posts/sliver-c2-deep-dive/),
[transport analysis](https://dominicbreuker.com/post/learning_sliver_c2_03_transports_in_detail_mtls_and_wg/)).

INFERRED: the WireGuard option is the most defensively awkward feature in the
lineup. WireGuard is a legitimate, widely deployed VPN protocol, so the traffic is
not anomalous in itself, and once the tunnel is up everything inside it is opaque.
Detection has to happen at tunnel establishment or not at all.

### Havoc

Free and open, written in C++ and Go, with a polished operator interface. REPORTED:
it ranks in the top four by open-source reporting frequency and is detectable via
JA4X handshake fingerprinting
([Kaspersky](https://securelist.com/vulnerabilities-and-exploits-in-q2-2025/117333/),
[FoxIO](https://blog.foxio.io/ja4+-network-fingerprinting)). Its role in the
landscape is that it demonstrated a free tool could match commercial polish, which
mattered for adoption.

### AdaptixC2

The newest of the four and the best-documented from a defender's point of view,
which makes it the most useful teaching example in this report.

REPORTED: Unit 42 first wrote it up in September 2025 as an open-source
post-exploitation framework already appearing in campaigns. It supports web,
named-pipe, and TCP beacons; encrypts its configuration with RC4; runs shellcode
in memory via PowerShell without writing to disk; loads Beacon Object Files —
small compiled C modules that execute inside the implant's own process; and exposes
`KillDate` and `WorkingTime` settings so the implant expires on schedule and only
operates during the victim's business hours
([Unit 42](https://unit42.paloaltonetworks.com/adaptixc2-post-exploitation-framework/)).

REPORTED: it was deployed alongside Fog ransomware against a financial institution
in Asia, and has been adopted by actors tied to both Fog and Akira ransomware
operations
([Unit 42](https://unit42.paloaltonetworks.com/adaptixc2-post-exploitation-framework/),
[The Hacker News](https://thehackernews.com/2025/10/russian-ransomware-gangs-weaponize-open.html)).

REPORTED: by April 2026 Kaspersky had published detection indicators across all
five of its channel types, with named detection verdicts for each — HTTP, TLS, TCP,
SMB, and DNS
([Securelist](https://securelist.com/tr/adaptixc2-network-and-host-detection/119424/)).
Those indicators are the source for most of the concrete channel detail in
[02-channel-taxonomy.md](02-channel-taxonomy.md).

REPORTED: it was also the framework in the March 2026 GitHub-based campaign, where
a threat actor wrote a *custom listener* so the standard beacon could talk to
GitHub's API instead of a server
([Zscaler](https://www.zscaler.com/blogs/security-research/tropic-trooper-pivots-adaptixc2-and-custom-beacon-listener)).

INFERRED: that last point is the important one, and it generalises past AdaptixC2.
An extensible open framework means the channel is no longer a property of the tool.
A defender cannot enumerate "the ways framework X communicates" and be finished,
because a competent actor writes a new transport in an afternoon. Detection has to
target the behaviour that survives a transport swap — the check-in rhythm, the
message structure, the host-side artefacts — and Kaspersky's own finding that
AdaptixC2's mutual-TLS mode carries "identical payload structure" to its plainer
transports is the proof that such invariants exist.

## Why free tools are winning

INFERRED, with the supporting evidence named.

**No licence to revoke.** Fortra can decline a sale and can cooperate with legal
action, as it did in 2023. Nobody can decline to let you download an open-source
project.

**No watermark.** Commercial builds carry identifiers that link an implant to a
licence. Open tools do not, which removes an attribution risk.

**Modification is expected.** The extensibility that makes these tools good for
red teams — Beacon Object Files, custom transports, module systems — is equally
available to an attacker, and it is what allowed the GitHub transport above.

**Detection pressure was applied unevenly.** A decade of industry effort went into
recognising Cobalt Strike. REPORTED: Hunt.io describes it as "one of the most
recognized and heavily signatured offensive frameworks", and says this has "driven
some actors toward alternatives such as Sliver or Havoc"
([Hunt.io](https://hunt.io/blog/russian-malicious-infrastructure-c2-servers-mapped)).

INFERRED, as the uncomfortable conclusion: the industry's success against one
framework produced migration to less-studied ones, and legal pressure on a vendor
pushed activity toward tools with no vendor to pressure. Both are real, and
neither means the effort was wrong — a heavily signatured tool is genuinely
harder to use. But it does mean framework-specific detection is a treadmill.
Anything built on behaviour that all of these tools share, because the job
requires it, is where durable detection lives. That is the subject of
[05-detection-engineering.md](05-detection-engineering.md).
