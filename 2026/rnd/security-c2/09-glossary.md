# Glossary

Every specialist term used in this report, in plain words. Where a term has a
formal MITRE ATT&CK identifier, it is given.

## Core concepts

**Command and control (C2)** — The channel an attacker uses to send instructions to
a computer they control, and to receive answers back. ATT&CK tactic `TA0011`.

**Implant** — The attacker's software running on the compromised machine. Also
called an agent or a beacon depending on the tool. It maintains the channel.

**Beacon** — An implant that reaches out on a repeating schedule, like a lighthouse
signalling on a cycle. Also the specific name of Cobalt Strike's implant.

**Stager** — A very small first-stage program whose only job is to download and run
the real implant. Kept small because the delivery method usually offers little
room. ATT&CK `T1104 Multi-Stage Channels`.

**Check-in** — One cycle of the implant contacting the server to report presence and
ask for orders.

**Sleep** — How long the implant waits between check-ins.

**Jitter** — Random variation added to the sleep time so check-ins are not exactly
regular. Intended to hide the rhythm; see
[05-detection-engineering.md](05-detection-engineering.md) for why it works less
well than operators expect.

**Reverse channel** — The compromised machine dials out to the attacker. Almost all
real C2 works this way, because firewalls block unexpected inbound connections.

**Bind channel** — The attacker dials in to the compromised machine. Nearly extinct
on the internet.

**Asynchronous** — A channel that checks in on a long cycle and queues commands.
Quiet, slow to work with.

**Interactive** — A live session where typing feels like a terminal. Fast to work
with, much louder on the network.

**Fallback channel** — A second way in, used when the first stops working. ATT&CK
`T1008`.

**Kill date** — A configured time after which the implant deletes itself.

**Egress** — Traffic leaving your network. The boundary where outbound C2 must
cross equipment you control.

**Dwell time** — How long an attacker is present before being detected or removed.

## Tools and frameworks

**C2 framework** — A product that manages control channels: a server, an operator
console, and an implant generator. Built for penetration testers; used by both
defenders and attackers.

**Cobalt Strike** — The commercial framework from Fortra that defined the category.
Its implant is Beacon.

**Malleable profile** — Cobalt Strike's configuration file controlling how the
implant behaves on the network and in memory. Better understood as a behaviour
policy than as traffic disguise.

**Sleep mask** — Code that scrambles the implant's own memory while it is idle, so
memory scanners find nothing, unscrambling only to check in.

**Drip loading** — Writing a payload into memory in small pieces with delays
between them, to break the event-correlation logic endpoint products use to spot
injection. Added in Cobalt Strike 4.12.

**Beacon Object File (BOF)** — A small compiled C module that runs inside the
implant's own process rather than as a separate program, leaving less trace.

**Sliver** — Free, open-source framework in Go from Bishop Fox. Offers mutual TLS,
HTTP, HTTPS, DNS, and WireGuard channels.

**Havoc, Mythic, AdaptixC2, Empire, Covenant, NimPlant, SuperShell** — Free,
community-built frameworks. See
[03-framework-landscape.md](03-framework-landscape.md).

**Brute Ratel C4** — A commercial framework from Dark Vortex.

**Metasploit** — Rapid7's long-established exploitation framework, with a free tier.
Its implant is Meterpreter.

**Redirector** — A cheap disposable server that forwards traffic to the operator's
real server, so the real server is never exposed. ATT&CK `T1090 Proxy`.

**Team server** — The framework's central server that implants report to and
operators connect to.

**Watermark** — An identifier in a commercial framework's builds that links an
implant back to a licence.

## Channels and protocols

**DNS** — The domain name system, which turns names into addresses. Every network
allows it, which is why it makes such a durable tunnel.

**DNS tunnelling** — Hiding data inside the names being looked up and inside the
answers. Works almost anywhere; carries very little data. ATT&CK `T1071.004`.

**DNS over HTTPS (DoH)** — Name lookups wrapped inside ordinary web requests, so a
network operator cannot see or filter them. Recognisable by requests to a
`/dns-query` endpoint carrying the `application/dns-message` content type.

**Mutual TLS (mTLS)** — Encryption where both ends prove their identity with
certificates, not just the server. Locks defenders and researchers out of the
session entirely.

**WireGuard** — A legitimate, widely used VPN protocol. Some frameworks use it to
build a fully encrypted tunnel, which is defensively awkward because the traffic is
not anomalous in itself.

**Named pipe** — A Windows mechanism for one program to talk to another, including
across machines. Used so several implants can route through one machine that has
internet access.

**ICMP** — The protocol behind `ping`. Its data field can carry a tunnel, and it
sits below the layer most security tooling inspects. ATT&CK `T1095`.

**QUIC and HTTP/3** — Newer transport protocols that encrypt more of the connection,
including transport headers older equipment relied on reading.

**Direct-to-IP (D2IP)** — Connecting to a hard-coded address with no name lookup at
all. Defeats every DNS-based control, at the cost of being impossible to change
after deployment.

**Dead drop resolver** — A public page or post holding the real server's address, so
the implant looks it up rather than carrying it. ATT&CK `T1102.001`.

**Content injection** — Commands inserted into traffic while it is in transit.
ATT&CK `T1659`.

**Traffic signalling** — A secret trigger — such as a specific sequence of
connection attempts — that wakes a dormant implant or opens a hidden service.
ATT&CK `T1205`.

## Infrastructure and evasion

**Fast flux** — Rapidly changing the addresses a domain name points to, so blocking
addresses never works. ATT&CK `T1568.001`. Subject of CISA advisory `AA25-093A`.

**Single flux** — The addresses rotate.

**Double flux** — The addresses *and* the name servers rotate, leaving no stable
point to attack.

**Domain generation algorithm (DGA)** — A formula both sides run to compute today's
domain name, so it never has to be transmitted. Detectable by the many failed
lookups it produces. ATT&CK `T1568.002`.

**Domain fronting** — Sending one domain name in the clear during the handshake and
a different one inside the encrypted request, so traffic appears to go to a major
cloud service. Largely closed by Amazon and Google in 2018 and by Microsoft by
January 2024. ATT&CK `T1090.004`.

**Living off the land (LOTL)** — Using the software already on the machine —
PowerShell, WMI, built-in administrative tools — so nothing unusual has to be
installed.

**Living off trusted services** — Putting the control channel inside a service the
victim already relies on, such as GitHub, Slack, or cloud storage, so no
attacker-owned destination appears in the traffic. Cloudflare calls the pattern
"living off the XaaS". ATT&CK `T1102 Web Service`.

**Bulletproof hosting** — Hosting providers that deliberately ignore abuse reports,
and advertise doing so.

**Hide infrastructure** — Concealing the attacker's own servers, including by using
compromised third-party machines or by refusing to answer scanners. ATT&CK `T1665`.

**Sinkholing** — Taking control of the domain implants call and pointing it at a
defender-run server, which kills the channel and produces a victim list.

## Detection

**Beaconing detection / rhythm analysis** — Finding channels by the regularity of
their timing rather than their content. Works through encryption because timing is
metadata.

**Periodicity score** — A number from 0.0 (random) to 1.0 (perfectly regular)
describing how rhythmic a connection pattern is. RITA scores above 0.8 across
hundreds of connections indicate an automated beacon.

**Zeek** — Open-source software that turns raw network traffic into structured
connection records. The usual source of the metadata everything else analyses.

**RITA** — Open-source tool that scores Zeek's records for beacon-like behaviour.

**Suricata** — Open-source intrusion detection system that matches network traffic
against rules.

**Sigma** — A vendor-neutral format for detection rules, so a rule can be written
once and deployed on different analysis platforms.

**TLS fingerprinting** — Identifying which software opened an encrypted connection
from how it announced its capabilities, without reading the content.

**JA3 / JA3S** — Fingerprint of the client's opening message / the server's reply.

**JA4 / JA4S / JA4X** — Newer, more stable versions. JA4X fingerprints how a
certificate was generated.

**JARM** — An active fingerprint: you send crafted probes to a server and hash its
responses. Requires the server to answer.

**Protective DNS (PDNS)** — A resolver that checks each lookup against threat
intelligence and refuses to answer for known-bad names.

**Egress filtering** — Controlling which outbound connections are permitted, rather
than allowing everything out by default.

**Allowlist** — An explicit list of permitted things. In this report, usually the
list of legitimate periodic destinations that stops rhythm analysis drowning in
noise.

**Baseline** — A record of what normal looks like, so an anomaly can be recognised.
The only workable answer to trusted-service channels.

**Indicator of compromise (IOC)** — A specific observable fact, such as an address,
domain, or file hash, associated with known malicious activity. Cheap to check;
easily invalidated by attackers standing up new infrastructure.

## Attacker groups and campaigns named in this report

**APT28** — Russian state-linked group, also tracked as Fancy Bear and Fighting
Ursa. Associated with the PromptSteal/LAMEHUG malware.

**Volt Typhoon** — China-linked group targeting critical infrastructure, defined by
its avoidance of custom malware. ATT&CK group `G1017`.

**Salt Typhoon** — China-linked group targeting telecommunications, primarily via
known vulnerabilities in network edge devices.

**Gamaredon** — Russian-linked group named in the CISA fast flux advisory.

**Tropic Trooper** — Group behind the March 2026 campaign that used GitHub issues as
its entire control channel.

**GopherWhisper** — China-linked group reported using Slack, Discord, and Outlook
draft emails for two-way control.

**Fog, Akira, LockBit, Conti, Hive, Nefilim, BlackSuit, Play** — Ransomware
operations named in the cited sources.

**Operation Endgame** — The Europol- and Eurojust-coordinated programme of repeated
infrastructure disruption actions, running since May 2024.

## Evidence labels used in this report

**DOCUMENTED** — The thing's own owner says so: vendor documentation, a release
note, a government advisory, the ATT&CK catalogue itself.

**REPORTED** — A named third party published it. Not independently checked here.

**CALCULATED** — Worked out in this report from reported numbers. Formulas are in
[10-methodology-and-sources.md](10-methodology-and-sources.md).

**INFERRED** — A judgement drawn from the evidence. No source states it.
