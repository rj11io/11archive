# The channel taxonomy

## The catalogue defenders actually use

MITRE ATT&CK is a public catalogue of attacker behaviour, organised into tactics
(the goal) and techniques (the method). Command and control is tactic `TA0011`,
and its description is one sentence: "The adversary is trying to communicate with
compromised systems to control them."

DOCUMENTED: as of ATT&CK version 19, last modified 25 April 2025, `TA0011`
contains 18 techniques and 27 sub-techniques — 45 catalogued entries
([ATT&CK TA0011](https://attack.mitre.org/tactics/TA0011/)).

The catalogue is worth reading as a document about how the problem has grown.
CALCULATED, by comparing the current list against an ATT&CK v10.1 mirror that
lists 16 techniques
([cyber-kill-chain.ch](https://cyber-kill-chain.ch/tactics/TA0011/)): the two
techniques added since v10.1 are `T1659 Content Injection` and
`T1665 Hide Infrastructure`. Both describe attacker infrastructure work rather
than protocol choice. INFERRED: the catalogue is growing in the direction of *how
the attacker's own network is built and concealed*, not in the direction of new
protocols. That matches what chapter 4 describes.

One further change is telling. `T1219` was called "Remote Access Software" in the
older list and is now "Remote Access Tools", with three sub-techniques added
including `T1219.001 IDE Tunneling` — the abuse of the remote-development tunnels
built into modern code editors. REPORTED: a 2026 campaign used exactly that,
running a Visual Studio Code tunnel login command on a compromised host
([Zscaler](https://www.zscaler.com/blogs/security-research/tropic-trooper-pivots-adaptixc2-and-custom-beacon-listener)).

## The full catalogue

DOCUMENTED, reproduced from ATT&CK TA0011 v19. Grouped by what the technique is
really about, which is not the order ATT&CK lists them in.

| ID | Name | What it is about |
| --- | --- | --- |
| T1071 | Application Layer Protocol | Which everyday protocol carries the traffic |
| T1071.001 | Web Protocols | HTTP and HTTPS |
| T1071.002 | File Transfer Protocols | FTP and similar |
| T1071.003 | Mail Protocols | SMTP, IMAP, POP3 |
| T1071.004 | DNS | Orders hidden in name lookups |
| T1071.005 | Publish/Subscribe Protocols | MQTT and message-queue protocols |
| T1095 | Non-Application Layer Protocol | ICMP, raw sockets, lower-level protocols |
| T1571 | Non-Standard Port | A known protocol on an unexpected port |
| T1572 | Protocol Tunneling | One protocol wrapped inside another |
| T1132 | Data Encoding | Making the payload survive the carrier |
| T1132.001 | Standard Encoding | Base64 and friends |
| T1132.002 | Non-Standard Encoding | Custom schemes |
| T1001 | Data Obfuscation | Making the payload unrecognisable |
| T1001.001 | Junk Data | Padding to defeat size analysis |
| T1001.002 | Steganography | Hidden inside images or media |
| T1001.003 | Protocol or Service Impersonation | Pretending to be a different service |
| T1573 | Encrypted Channel | Encryption the attacker controls |
| T1573.001 | Symmetric Cryptography | One shared key |
| T1573.002 | Asymmetric Cryptography | Key pairs |
| T1568 | Dynamic Resolution | Working out the address at run time |
| T1568.001 | Fast Flux DNS | Address rotates constantly |
| T1568.002 | Domain Generation Algorithms | Names computed from a formula |
| T1568.003 | DNS Calculation | Address derived from a DNS answer |
| T1090 | Proxy | Traffic relayed through something else |
| T1090.001 | Internal Proxy | Relay inside the victim network |
| T1090.002 | External Proxy | Relay outside it |
| T1090.003 | Multi-hop Proxy | Several relays chained |
| T1090.004 | Domain Fronting | Hiding behind a shared content network |
| T1665 | Hide Infrastructure | Concealing the attacker's own servers |
| T1102 | Web Service | A legitimate online service as the carrier |
| T1102.001 | Dead Drop Resolver | A public page holding the real address |
| T1102.002 | Bidirectional Communication | Full two-way traffic via the service |
| T1102.003 | One-Way Communication | Orders in only |
| T1659 | Content Injection | Commands injected into traffic in transit |
| T1008 | Fallback Channels | A second way in when the first dies |
| T1104 | Multi-Stage Channels | Different channels for different stages |
| T1105 | Ingress Tool Transfer | Bringing new tools in |
| T1219 | Remote Access Tools | Legitimate remote-support software |
| T1219.001 | IDE Tunneling | Code-editor remote tunnels |
| T1219.002 | Remote Desktop Software | TeamViewer, AnyDesk and similar |
| T1219.003 | Remote Access Hardware | Physical devices |
| T1205 | Traffic Signaling | A secret knock that wakes the implant |
| T1205.001 | Port Knocking | A sequence of connection attempts |
| T1205.002 | Socket Filters | A kernel filter watching for a trigger |
| T1092 | Communication Through Removable Media | USB as the carrier, for isolated networks |

## Channel classes, and what each one costs

The catalogue lists techniques. What a defender needs is the trade-off behind
each choice: what the attacker gains, what they pay, and what gives them away.

### HTTPS to a web server

**How it works.** The implant makes ordinary encrypted web requests. Orders come
back in the response body, headers, or cookies. Answers go up in POST bodies.

**Why it dominates.** Every network permits outbound HTTPS. There is nothing to
open, nothing to request, and the traffic is indistinguishable from browsing at a
glance.

**What it costs.** Nothing, which is why it is the default in every framework.

**What gives it away.** The rhythm of the check-ins. The handshake fingerprint of
the client. Certificate details that do not match a real business. Header
combinations that no browser produces. And the destination itself, if it is new
and nothing else in your organisation talks to it.

REPORTED, as a concrete example of the header problem: AdaptixC2's default HTTP
mode sends a user-agent claiming to be Firefox 20.0 — a browser released in 2013
([Securelist](https://securelist.com/tr/adaptixc2-network-and-host-detection/119424/)).
A real Firefox 20 on a corporate network in 2026 would itself be an incident.

### DNS

**How it works.** The domain name system turns names into addresses. Every network
allows it, and it is designed so that any resolver will forward a question it
cannot answer to whoever owns the name. An attacker who owns a domain can
therefore receive data by encoding it into the name being asked about —
`<encoded-data>.attacker-domain.com` — and reply by putting data in the answer.

**Why it is chosen.** It works where nothing else does. A network that blocks all
outbound traffic still resolves names, because otherwise nothing functions.
REPORTED: DNS-based C2 "bypasses most egress firewalls since UDP/53 is almost
always allowed" ([Sliver field guide](https://ring0shady.github.io/posts/sliver-c2-deep-dive/)).

**What it costs.** Speed and volume. A name is limited to 253 characters and each
label to 63, and answers are small. Moving a real file through DNS means thousands
of queries. That is the trade: universal reach for terrible bandwidth.

**What gives it away.** The shape of the names. REPORTED, and specific enough to
build a rule from: AdaptixC2's DNS mode produces subdomains nested eight or more
levels deep, strings with high randomness, and names over 100 characters, with the
operation type encoded in the second label — `www` or `hi` to start a session,
`cdn` or `put` to send data, `api` or `get` to fetch orders, `hb` for a heartbeat
([Securelist](https://securelist.com/tr/adaptixc2-network-and-host-detection/119424/)).
Also giving it away: the sheer count of unique names under one parent domain, and
a client asking many questions about a domain nobody else in the organisation has
ever asked about.

REPORTED, on scale: Unit 42 identified over 50 tunnelling tools and campaigns
across more than 1,000 tunnelling domains using four years of passive DNS records
([Unit 42, Oct 2023](https://unit42.paloaltonetworks.com/dns-tunneling-in-the-wild/)).
That research also found the technique is not only criminal — several commercial
VPN products tunnel through DNS to get around paid network restrictions, which
means a detector tuned only on "tunnelling is malicious" will generate real false
positives.

### Encrypted DNS

**How it works.** DNS over HTTPS wraps name lookups inside ordinary web requests,
so a network operator cannot see or filter them. It was created for privacy, and
it works.

**Why it is chosen.** It removes the defender's single best source of evidence. If
your resolver never sees the query, your query logs are empty.

**What gives it away.** The requests still have a shape. REPORTED: AdaptixC2's
encrypted-DNS mode POSTs to a `/dns-query` endpoint with
`Content-Type: application/dns-message`, and carries the same obsolete Firefox
user-agent as its plain HTTP mode
([Securelist](https://securelist.com/tr/adaptixc2-network-and-host-detection/119424/)).

INFERRED, and it is one of the cheapest rules in this report: on a managed
corporate network, an application making encrypted-DNS requests directly is
either violating policy or is a tunnel. Either way you want to know. The rule is
narrow, the false-positive cost is low, and it does not require decryption —
`/dns-query` and the `application/dns-message` content type are visible in
plain metadata.

REPORTED: detection research on this specific problem exists and is honest about
being early. A December 2025 paper built a toolkit to generate evasive
encrypted-DNS exfiltration and benchmark machine-learning detectors against it,
testing evasion via chunk size, encoding, padding, and resolver rotation
([Elaoumari, arXiv 2512.20423](https://arxiv.org/abs/2512.20423)). Its abstract
states no performance figures, so none are quoted here.

### Mutual TLS

**How it works.** Ordinary HTTPS has the server prove who it is. Mutual TLS has
*both* sides prove it, using certificates the attacker generated.

**Why it is chosen.** It locks defenders and researchers out completely. Without
the client certificate you cannot connect to the server to study it, and you
cannot man-in-the-middle the session.

**What it costs.** Rarity. Mutual TLS is uncommon in general web traffic, so
using it is itself unusual.

**What gives it away.** That rarity, plus the handshake fingerprint. REPORTED:
AdaptixC2's mutual-TLS mode "substantially limits network monitoring tool
effectiveness" while carrying an identical payload structure to its plainer
transports ([Securelist](https://securelist.com/tr/adaptixc2-network-and-host-detection/119424/)).
INFERRED: that identical structure is the opening — the encryption changed, the
behaviour did not, so timing and volume analysis still applies.

### Named pipes and internal relays

**How it works.** Only one machine in a compromised network talks to the internet.
Every other implant talks to *it*, over an internal Windows mechanism called a
named pipe, or a plain internal TCP connection.

**Why it is chosen.** It shrinks the outbound footprint from twenty machines to
one. It also lets implants operate on machines with no internet access at all.

**What gives it away.** Machine-to-machine traffic that does not fit the
organisation's normal pattern — a workstation acting as a relay for other
workstations. REPORTED, with unusual precision: AdaptixC2's named-pipe mode
produces a characteristic sequence of pipe operations, an initial packet whose
size field reads 100 to 140 bytes, and periodic `FSCTL_PIPE_PEEK` requests while
idle; its internal TCP mode defaults to port 9000
([Securelist](https://securelist.com/tr/adaptixc2-network-and-host-detection/119424/)).

INFERRED: this class is systematically under-monitored, because most network
monitoring is deployed at the perimeter looking outward. An internal relay is
invisible to a sensor that only watches the egress point — and the relay design
exists precisely because attackers know that.

### Legitimate online services

**How it works.** The orders live in a normal account on a normal service. The
implant reads them from there.

**Why it is chosen.** It is the strongest available answer to reputation-based
blocking. There is no attacker-owned address in the traffic at all.

**What it costs.** The service can close the account, and the service holds
evidence. Both are real risks the attacker accepts.

**What gives it away.** Which machine is using the service, and how. REPORTED, in
full detail: the March 2026 GitHub-based channel had the implant post its
encrypted session key to issue number one of a specific repository, poll the
open-issues list every 60 seconds, take orders from issue titles — `beat` for a
heartbeat, titles starting with `upload` to deliver files — and return results as
base64 files committed under a `download/` path, all encrypted with RC4 using a
16-byte per-session key
([Zscaler](https://www.zscaler.com/blogs/security-research/tropic-trooper-pivots-adaptixc2-and-custom-beacon-listener)).

INFERRED: notice that the 60-second poll makes this channel *more* detectable by
rhythm analysis than a well-tuned HTTPS beacon, not less. It bought
destination-based invisibility and paid for it in timing regularity. That trade is
the crack in the trusted-service approach, and chapter 5 is where you exploit it.

### Non-application-layer protocols

**How it works.** ICMP — the protocol behind `ping` — carries a data field that
nobody inspects. So do various other low-level protocols. Data goes in the field.

**Why it is chosen.** It sits below the layer most security tooling watches. A
proxy that inspects all web traffic sees nothing of it.

**What it costs.** A lot. It is slow, it is often blocked outright at the border,
and it stands out badly once anyone looks.

**What gives it away.** Volume and size. Normal `ping` traffic uses small,
fixed-size, symmetric packets in modest numbers. A tunnel produces large payloads,
asymmetric sizes, and sustained high rates. INFERRED: this is a cheap detection
because the legitimate baseline is so narrow — most organisations could alert on
ICMP payloads above a threshold size and see almost no noise.

### Skipping DNS entirely

**How it works.** The address is compiled into the malware. No lookup happens.

**Why it is chosen.** It defeats every DNS-based control at once: protective
resolvers, query logging, name reputation, generated-name detection. All of it
watches a lookup that never occurs.

**What it costs.** Rigidity. Change the server and every deployed copy breaks.
That is why this is most common in commodity malware and botnets rather than
patient targeted operations.

**How common.** REPORTED: among malware samples showing C2 activity, 45.32% made
at least one direct-to-address connection; 41.97% after excluding port scanning;
and direct-to-address accounted for 23.17% of all C2 connection attempts observed.
The dataset was over 4 million dynamic-analysis reports across 30 days
([Unit 42, Aug 2026](https://unit42.paloaltonetworks.com/malware-bypass-dns-direct-to-ip/)).
CALCULATED: 9.11% of all analysed samples, benign and malicious together, made a
direct-to-address C2 connection.

**What gives it away.** The absence itself. INFERRED, and this is one of the
highest-value rules in the report: a connection to an external address for which
your own resolver logged no preceding lookup is anomalous by construction. Normal
software resolves names. Correlating the two logs turns "we cannot see the DNS"
from a blind spot into a signal — the missing lookup *is* the evidence.

## Which class to worry about

INFERRED throughout this table. It ranks the classes by how hard each is to
detect with commonly deployed tooling, against how often defenders report seeing
it. Both axes are judgements, not measurements, and the reasoning is in the notes
column so you can disagree with a specific cell rather than the whole table.

| Channel class | Prevalence | Detection difficulty | Note |
| --- | --- | --- | --- |
| Legitimate online services | rising fast | very high | No bad destination exists to block |
| HTTPS to attacker server | very high | moderate | Well understood, well tooled, still works |
| Direct to address, no DNS | high | low | The missing lookup is the signal |
| DNS tunnelling | moderate | moderate | Distinctive name shapes; VPN products cause noise |
| Encrypted DNS | rising | moderate | Cheap rule available; few teams have written it |
| Mutual TLS | moderate | high | Blocks inspection; timing still works |
| Internal relays | moderate | high | Invisible to perimeter-only monitoring |
| Legitimate remote-access tools | high | moderate | Often permitted by policy, which is the problem |
| Non-application-layer | low | low | Narrow legitimate baseline makes it easy |
| Removable media | very low | very high | Only relevant to isolated networks |

INFERRED, as the conclusion: the two rows that should drive investment are the
top one and the third one. Trusted-service channels are the growth area and the
hardest to see. Direct-to-address is common and cheap to catch, and most
organisations have not written the rule.
