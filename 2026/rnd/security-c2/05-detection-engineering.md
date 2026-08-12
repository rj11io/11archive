# Detection engineering

Everything so far described the attacker's side. This chapter is about what
actually finds a control channel, ranked by how well it survives an attacker who
knows you are using it.

That last criterion is the one that matters and the one most often skipped. A
detection that works until someone changes a configuration value is not a control;
it is a delay. So each method below carries an explicit note on what defeats it.

## The hierarchy that matters

INFERRED, and it organises the rest of the chapter. Detection methods sort by how
fundamental the thing they measure is to the attacker's job.

| Level | What it measures | How durable | Why |
| --- | --- | --- | --- |
| Behaviour | That a relationship exists and repeats | very high | The attacker needs the relationship |
| Structure | How messages are shaped and sized | high | Changing it means rewriting the tool |
| Implementation | How the software builds a connection | moderate | Changeable with effort |
| Content | Specific strings, paths, certificates | low | Changeable with a config edit |
| Reputation | Whether the destination is known bad | very low | New infrastructure is free |

Most security spending sits at the bottom two rows. Most durable value sits at the
top two.

## Rhythm analysis

The most durable network detection there is, and the one that needs no decryption.

### The idea

An implant checks in on a schedule. Schedules are periodic. Periodicity lives in
the *timing* of connections, and timing is metadata — visible whatever encryption
is in use, whatever the destination, whatever the protocol.

### How it is done in practice

REPORTED: the standard open-source approach pairs Zeek, which turns raw network
traffic into connection records, with RITA, which scores those records. RITA gives
each source-and-destination pair a beacon score from 0.0 for random to 1.0 for
perfectly periodic, and scores above 0.8 across hundreds of connections indicate
the statistically regular traffic characteristic of an automated beacon
([Black Hills Information Security](https://www.blackhillsinfosec.com/detecting-malware-beacons-with-zeek-and-rita/),
[RITA](https://github.com/activecm/rita)).

REPORTED: RITA scores both the intervals between connections *and* the sizes of
those connections, and uses skew — how lopsided a distribution is — as one input,
because a value near zero means a symmetric spread, which is what a randomised
sleep timer produces
([Active Countermeasures](https://www.activecountermeasures.com/free-tools/rita/),
[threat hunting labs](https://activecm.github.io/threat-hunting-labs/beacons/)).

### Why jitter does not save the attacker

This is the important part, and it is counter-intuitive enough to be worth stating
slowly.

Jitter adds randomness to the sleep interval so check-ins are not exactly regular.
An operator setting a 45-second sleep with jitter might produce intervals of 37,
52, 41, 55, 39 seconds — visibly irregular.

But the randomness itself is regular. The intervals are uniformly distributed
between 35 and 55 seconds, every time, for as long as the channel runs. A
distribution that tight and that stable is not what human or application traffic
produces. REPORTED: a beacon sleeping between 35 and 55 seconds still reads as
periodic across 200 connections in three hours, because the statistical pattern
survives even though each individual interval differs
([Hive Security](https://hivesecurity.gitlab.io/blog/cobalt-strike-detection-hunting/)).

INFERRED: to genuinely defeat rhythm analysis an operator would need intervals
drawn from a wide, irregular, non-stationary distribution — hours to days, varying
in character over time. That is available, and it is why long-haul implants exist.
The cost is severe: an implant checking in twice a day is nearly unusable for
interactive work. The attacker is choosing between being detectable and being
useful, and that is the best position a defender can put them in.

### What defeats it

**Very long, highly varied sleeps.** Costs the attacker usability, as above.

**Traffic volume you cannot store.** Rhythm analysis needs history. Organisations
that keep 24 hours of connection records cannot detect a channel checking in every
six hours, because four data points prove nothing.

**Legitimate periodic traffic.** This is the real operational cost, and it is
large. Software update checks, monitoring agents, certificate revocation lookups,
telemetry, and cloud sync clients are all periodic beacons by design. INFERRED:
rhythm analysis without a maintained allowlist of known-good periodic destinations
produces enough noise to be abandoned, which is the most common way teams fail at
this. The allowlist is the work. Budget for it.

## Handshake fingerprinting

### The idea

When a program opens an encrypted connection it announces its capabilities — which
ciphers it supports, in which order, with which extensions. Different software
makes different announcements. Hash the announcement and you get a fingerprint
identifying the software, without reading a byte of the encrypted content.

The schemes in use:

| Scheme | Fingerprints | Note |
| --- | --- | --- |
| JA3 | The client's opening message | Original, widely deployed, easiest to change |
| JA3S | The server's reply | Pairs with JA3 |
| JA4 | The client, improved | More stable across versions than JA3 |
| JA4S | The server, improved | |
| JA4X | Certificate structure | Catches how the certificate was generated |
| JARM | Server response to crafted probes | Active — you scan the server |

REPORTED: Zeek records JA3 and JA3S fingerprints automatically in its TLS log, and
Suricata collects JA3 as well, so the raw material is available in standard
open-source tooling
([systemshardening.com](https://www.systemshardening.com/articles/network/tls-fingerprinting-ja3-ja4/)).

### Why the server side matters more

REPORTED, and this is the sharpest idea in the fingerprinting literature: an
attacker can customise their client's announcement to avoid a known JA4, but they
cannot control the server's reply unless they control the server. So pairing the
client fingerprint with the server fingerprint gives a full-handshake identity that
is much harder to forge, and known-bad server fingerprints from Cobalt Strike team
servers are published in threat intelligence feeds
([systemshardening.com](https://www.systemshardening.com/articles/network/tls-fingerprinting-ja3-ja4/)).

REPORTED: JA4X can detect and block traffic to SoftEther, Tor, Metasploit, Sliver,
Havoc, and various remote-access implants, and combined with JARM data it is
effective for finding related servers during internet-wide hunting
([FoxIO](https://blog.foxio.io/ja4+-network-fingerprinting)).

REPORTED: Shodan has carried "Cobalt Strike Beacon" as an identified product since
November 2021, so hunting for newly stood-up servers through public scanning data
is possible for anyone
([Medium / TΞLΞMΞTRY](https://t3l3m3try.medium.com/hunting-cobalt-strike-servers-385c5bedda7b)).

### What defeats it, and the decay problem

**Fingerprint feeds go stale, quietly.** This is the finding defenders most need to
internalise. REPORTED: researchers found it is possible to identify C2 servers by
their TLS fingerprint, but that fingerprints overlapping with legitimate servers
increased over time, concluding that a fingerprint database must be updated often
or detection becomes less effective
([systemshardening.com](https://www.systemshardening.com/articles/network/tls-fingerprinting-ja3-ja4/)).

INFERRED: a stale fingerprint feed is worse than none, because it presents as a
working control on a dashboard while catching nothing and generating false
positives against legitimate software that has drifted into the same fingerprint.
Treat these feeds as perishable, with an owner and a refresh cadence.

**Using a real library.** An implant built on the platform's own HTTP library
produces the platform's own fingerprint. This is the deep reason trusted-service
channels weaken fingerprinting: the traffic is not imitating a legitimate client,
it *is* one.

**Refusing to answer probes.** JARM requires the server to respond. Servers behind
client-certificate requirements or connection-sequence triggers do not.

## Structure and volume analysis

Between behaviour and implementation sits the shape of the messages.

### What to look at

**Directional balance.** Browsing downloads far more than it uploads. A channel
sending large volumes outbound is a different shape. Bulk theft over the control
channel inverts the expected ratio outright.

**Size clustering.** Check-in messages are near-identical in size because they are
the same message. A destination receiving hundreds of requests all within a few
bytes of each other is not being browsed by a person.

**Session duration.** Interactive sessions produce long-lived connections carrying
small packets in both directions — a shape that looks like a terminal, because it
is one.

### The academic state of play

REPORTED: a June 2025 paper, "Striking Back At Cobalt: Using Network Traffic
Metadata To Detect Cobalt Strike Masquerading Command and Control Channels" by
Parssegny, Mazel, Levillain, and Chifflier, detects Cobalt Strike channels from
connection patterns and flow characteristics rather than content, using samples
from malware-traffic-analysis.net plus controlled instances across 2023–2024
([arXiv 2506.08922](https://arxiv.org/pdf/2506.08922)).

Its specific performance figures could not be extracted from the paper during this
research and are therefore **unavailable** here rather than estimated. What the
work establishes for our purposes is directional and still useful: metadata-based
detection sidesteps the encryption problem that stops content inspection, and
published academic approaches exist that do not require decryption.

REPORTED: on the encrypted-DNS side, a December 2025 paper by Elaoumari built a
containerised toolkit to generate evasive DNS-over-HTTPS exfiltration and benchmark
Random Forest, Gradient Boosting, and Logistic Regression classifiers against it,
varying chunk size, encoding, padding, and resolver rotation
([arXiv 2512.20423](https://arxiv.org/abs/2512.20423)). No performance figures
appear in its abstract, so none are quoted.

INFERRED: the honest summary of the research literature is that metadata detection
works, that it is an active field, and that published effectiveness numbers are
hard to compare because everyone uses different datasets. Do not expect a paper to
hand you a threshold. Do expect the *features* they identify — interval
distribution, size clustering, directional ratio, destination novelty — to be the
right things to measure in your own environment.

## DNS analytics

Because so many channels touch DNS, resolver logs are disproportionately valuable.

### What to look for

**Name shape.** REPORTED, concretely: AdaptixC2's DNS channel produces subdomains
nested eight or more levels deep, high-randomness strings, and names exceeding 100
characters
([Securelist](https://securelist.com/tr/adaptixc2-network-and-host-detection/119424/)).
Tunnels must encode data into names, and encoded data does not look like language.

**Failed lookups per machine.** Generated-name schemes try many names that were
never registered. A machine producing an unusual number of failures in a short
window is the signature.

**Unique names under one parent.** A tunnel generates a new name for every message.
Thousands of distinct names under a single domain, from a single machine, is a
tunnel.

**Query volume to one domain.** Moving real data through DNS takes thousands of
queries because each one carries so little.

**Who else asks.** A domain queried by exactly one machine in your organisation,
ever, is interesting regardless of anything else about it.

### The rule that catches DNS-skipping malware

INFERRED, and it is the highest value-per-effort item in this chapter. Correlate
two logs you probably already have: outbound connections, and DNS queries.

A connection to an external address with no preceding lookup for a name that
resolves to it is anomalous by construction. Normal software resolves names first.
REPORTED, on how much this is worth: 45.32% of malware samples with C2 activity
made at least one direct-to-address connection, accounting for 23.17% of all C2
connection attempts
([Unit 42](https://unit42.paloaltonetworks.com/malware-bypass-dns-direct-to-ip/)).

The known exceptions are enumerable — your own infrastructure by address,
peer-to-peer applications, some network appliances, cached results within their
lifetime — which means the allowlist is finite and the rule is maintainable.

### What defeats DNS analytics

Encrypted DNS to an outside resolver, which is why forcing all DNS through your own
resolver is the precondition for everything in this section. See
[06-defender-playbook.md](06-defender-playbook.md).

## Host-side detection

The network sees the channel. The endpoint sees the thing creating it, and
sometimes that is easier.

### Memory scanning against sleep masks

An implant runs in memory. Scanning memory for known implant patterns works — which
is why sleep masks exist. DOCUMENTED: Cobalt Strike's built-in sleep mask XOR-
obfuscates strings and data before the beacon sleeps, so the payload is masked most
of the time and briefly exposed when it checks in
([Cobalt Strike](https://www.cobaltstrike.com/sleep-masks)).

INFERRED, and it is an actionable scheduling point: the exposure window is
correlated with check-in time. Periodic memory scanning has a low chance of
sampling that window; scanning triggered by the process making a network connection
has a much higher one. Tie memory inspection to network events rather than to a
timer.

### Injection sequences

REPORTED: process injection produces a recognisable sequence of Windows API calls —
open a remote process, allocate memory in it, write code, create a thread — and
interactions between processes at different privilege levels are themselves
suspicious
([Securelist](https://securelist.com/tr/adaptixc2-network-and-host-detection/119424/)).

REPORTED: Cobalt Strike 4.12's drip loading attacks exactly this, writing payloads
in small chunks with configurable delays to break the correlation logic
([CyberSecurityNews](https://cybersecuritynews.com/cobalt-strike-4-12-released/)).
INFERRED: correlation windows are therefore a tunable that attackers now target
directly. A detection requiring all four calls within two seconds is defeated by a
three-second delay. Widening the window costs noise. This is a genuine arms race
with no clean resolution, and it argues for weighting network-side detection more
heavily than sequence-based host detection.

### Internal channel artefacts

REPORTED, with useful specificity: AdaptixC2's named-pipe mode produces a
characteristic operation sequence, an initial packet whose size field reads 100 to
140 bytes, and periodic pipe-peek requests while idle; its internal TCP mode
defaults to port 9000
([Securelist](https://securelist.com/tr/adaptixc2-network-and-host-detection/119424/)).

REPORTED: the same source lists the host behaviours that usually accompany a live
channel — LDAP queries against Active Directory password attributes, access to
`lsass.exe` memory, registry hive access for SAM, SECURITY and SYSTEM, browser
profile access, Kerberos events 4768 and 4769, and command shells spawned as
children of the Windows remote-management service.

INFERRED: these are not channel detections, they are *consequence* detections. In
practice they fire more often than channel detections do, because attackers vary
their transport far more readily than they vary the credential theft and lateral
movement the transport exists to enable.

## Rule-based detection: still worth having

The bottom of the hierarchy is not worthless. It is cheap, fast, and catches the
large volume of attackers who did not customise anything.

REPORTED: Suricata community rules detect beaconing through signatures matching
terms such as *beacon*, *C2*, *Meterpreter*, and *Metasploit*; Zeek identifies
self-signed certificates commonly used by Meterpreter sessions; and modern
frameworks use port 443 but also 80, 8080, 8443, 4433 and custom high ports, so
detection port lists and Zeek's TLS port configuration should cover all of them
([Medium / Aman](https://medium.com/@amgill003ca/detecting-payload-execution-and-c2-communication-using-wazuh-suricata-and-zeek-1776cb47f3df),
[Security Boulevard](https://securityboulevard.com/2026/08/writing-suricata-rules-to-detect-command-and-control-traffic/)).

REPORTED: Zeek logs are fully compatible with Sigma, the vendor-neutral detection
rule format, so network detections can be written once and deployed across
different analysis platforms
([Corelight](https://corelight.com/blog/zeek-sigma-fully-compatible-for-cross-siem-detections)).

That port list is worth acting on immediately. INFERRED: a monitoring
configuration that only decodes TLS on 443 is blind to a channel on 8443 by
configuration rather than by evasion, and this is a common misconfiguration that
costs nothing to fix.

## What does not work as well as people hope

### Indicator feeds alone

Lists of known-bad addresses and domains catch commodity malware and the tail of
careless operators. They do not catch anything that stood up new infrastructure
this week, which is free. The redirector economics in
[04-infrastructure-and-evasion.md](04-infrastructure-and-evasion.md) mean a blocked
address costs a competent operator a few pounds.

Keep the feeds. They are cheap and they clear volume. Do not report their coverage
as your C2 detection capability.

### Decryption

Inspecting encrypted traffic by terminating it and re-encrypting it looks like the
complete answer. INFERRED, on why it is not:

- It fails outright against the growth area. Trusted-service channels are
  genuinely going to GitHub, with a genuine certificate, over an authorised
  connection. Decrypting reveals an API call that looks like an API call.
- Certificate pinning breaks. Modern applications, and most mobile software, refuse
  a substituted certificate. Every exception you add is a hole.
- You create a single system holding every plaintext session in the organisation.
  That is now the highest-value target on your network.
- Mutual TLS defeats it. Without the client certificate there is no session to
  intercept.

Metadata approaches deliver more detection per unit of cost and risk. Decryption
has legitimate narrow uses — a specific investigation, a specific segment — and is
a poor foundation for a programme.

### Time-of-day rules

"Alert on connections outside business hours" is defeated by one configuration
value. REPORTED: AdaptixC2's `WorkingTime` restricts activity to chosen hours
specifically to blend with the victim's normal day
([Unit 42](https://unit42.paloaltonetworks.com/adaptixc2-post-exploitation-framework/)).
Useful as a supporting signal. Never a primary one.

### Anything framework-specific, over time

Detection for Cobalt Strike specifically became excellent, and
[03-framework-landscape.md](03-framework-landscape.md) documents the migration
that followed. INFERRED: framework-specific detection is necessary and permanently
incomplete. Build it, and do not let it substitute for the behavioural layer.

## Putting it together

INFERRED. A detection programme for control channels, in the order to build it.

1. **Centralise DNS.** Every query through a resolver you own, logged. This is the
   precondition for the DNS analytics and the correlation rule, and it is the
   single highest-leverage step.
2. **Record connection metadata and keep it long enough.** Thirty days minimum.
   Rhythm analysis is impossible without history, and this determines the longest
   sleep interval you can ever detect.
3. **Write the missing-lookup rule.** Cheap, targets a known 45% of C2-active
   malware, and mostly reuses what steps 1 and 2 produced.
4. **Score periodicity, and fund the allowlist.** The scoring is the easy half.
   The allowlist of legitimate periodic destinations is the half that determines
   whether the team keeps using it.
5. **Subscribe to fingerprint feeds and assign an owner.** With a refresh cadence,
   because they decay.
6. **Baseline machine-to-service pairings.** Which machines legitimately use
   GitHub, Slack, cloud storage, and code-editor tunnels. This is the only thing
   that works against trusted-service channels.
7. **Tie memory inspection to network events.** Not to a timer.
8. **Keep the rule feeds.** For volume, not for coverage.

Steps 1 through 4 are behaviour and structure — the durable half. Steps 5 through 8
are implementation and content, and they need continuous maintenance to stay
useful. INFERRED: a team that reverses this order builds the fragile half first,
watches it decay, and concludes the problem is unsolvable.
