# Infrastructure and evasion

The previous chapter covered the tool. This one covers the network the tool talks
to, and the work attackers do so that network cannot be found, blocked, or traced
back to them.

The attacker's problem here is the mirror of the defender's. A defender wants to
identify a bad destination and block it. So the attacker's goal is to make sure
that either no fixed destination exists, or that blocking it costs the defender
something they are unwilling to pay.

## Redirectors: never expose the real server

The oldest and still most universal practice. The implant never talks to the
operator's actual server. It talks to a cheap disposable machine — a
**redirector** — that forwards traffic onward.

The economics are the point. A redirector is a small rented server with a domain
name, costing a few pounds a month. When defenders find and block it, the operator
loses a few pounds and swaps in another; the real server, holding the operation's
data and the operator's identity, was never exposed. DOCUMENTED in ATT&CK as
`T1090 Proxy`, with sub-techniques for relays inside the victim network, outside
it, and chained together.

INFERRED, on why this matters for how you respond: blocking a C2 address is
therefore almost never a win against a competent operator. It is a win against
commodity malware with a hard-coded address, and it is a useful *signal* that you
have been noticed if the channel comes back somewhere new. Treating an address
block as remediation is the mistake.

Chained relays make attribution close to impossible from the victim's side. Tor
and commercial VPN chains are both used. Once traffic has passed three hops across
three jurisdictions, the victim's logs contain no information about who is at the
other end.

## Fast flux: make the address a moving target

If a defender blocks addresses, change them constantly. **Fast flux** publishes a
domain name whose address record changes every few minutes.

DOCUMENTED, and this one has a formal government treatment. Advisory `AA25-093A`,
"Fast Flux: A National Security Threat", was published 3 April 2025 by the NSA,
CISA, and FBI together with partners in Australia, Canada, and New Zealand
([CISA](https://www.cisa.gov/news-events/cybersecurity-advisories/aa25-093a)).

REPORTED, on the two variants
([Vectra's summary of the advisory](https://www.vectra.ai/blog/cisa-flags-fast-flux-as-a-national-threat-are-you-covered)):

- **Single flux** rotates the addresses a name points to. Block one and the name
  already resolves elsewhere.
- **Double flux** rotates the name servers as well — the systems that answer the
  question in the first place. Now there is no stable point anywhere in the chain
  to attack.

REPORTED: the advisory names Hive and Nefilim ransomware operations and the
Russian-linked Gamaredon group as users, and identifies bulletproof hosting
providers as offering it as a service to their customers.

The advisory's own framing of the defensive problem is the useful part. Blocklists
and static filtering fail here by construction, because they operate on exactly the
indicator that is being rotated. Its recommendations move to anomaly detection on
DNS queries, behavioural analysis, and intelligence sharing — and it asks
protective-DNS providers specifically to build detection for it, which is an
admission that individual organisations mostly cannot.

INFERRED, on the detection that does work: fast flux is loud in a way its users
cannot avoid. A name whose address changes every three minutes, or which resolves
to addresses spread across many unrelated networks, does not look like a normal
service. Content delivery networks also rotate addresses, but they rotate within
their own network ranges. The distinguishing feature is address diversity *across
unrelated owners*, and it is computable from resolver logs you already keep.

## Generated domain names

Instead of hard-coding a name, the implant computes one. Both sides run the same
formula — often seeded by the date — so both arrive at the same answer without
ever communicating it. DOCUMENTED as `T1568.002 Domain Generation Algorithms`.

The attacker registers only the few names they need. The implant may try dozens or
hundreds daily and get failures for all but one.

**What gives it away.** The failures. A machine asking about many nonexistent
domains in a short window is the signature, and it is highly visible in resolver
logs. The generated names also tend to look wrong — random consonant strings with
no linguistic structure — which classifiers detect well.

INFERRED: generated names are the technique most thoroughly beaten by centralised
DNS logging. The technique's whole design assumes nobody is counting failed
lookups per machine. Counting them is straightforward if all queries pass through
one resolver you own, which is why that control ranks first in
[06-defender-playbook.md](06-defender-playbook.md).

## Domain fronting: mostly closed

A technique worth understanding precisely because it *was* fixed, which is rare.

**How it worked.** An encrypted web request has two places that name the
destination: the name sent in the clear during the handshake so the server knows
which certificate to present, and the name sent inside the encrypted request. If a
content delivery network read the first to route the connection but the second to
route the request, an attacker could put an innocent name outside and their own
name inside. Traffic appeared to go to a major cloud service. It went to the
attacker.

DOCUMENTED as `T1090.004 Domain Fronting`.

**Why it mattered.** It was close to unblockable. Blocking the outer name meant
blocking a major cloud provider.

**How it was closed.** REPORTED: Amazon and Google both blocked the mismatch in
2018, returning an HTTP 421 error when the two names disagree — action taken after
the technique was publicised through its use by the Signal messenger
([Wikipedia](https://en.wikipedia.org/wiki/Domain_fronting),
[Haven](https://havenmessenger.com/blog/posts/domain-fronting-explained/)).
DOCUMENTED: Microsoft blocked it for newly created Azure Front Door and CDN
resources from 8 November 2022 and completed enforcement for existing domains on
22 January 2024, with a narrow exception where both names belong to the same
subscription
([Microsoft Learn](https://learn.microsoft.com/en-us/answers/questions/1421101/take-action-to-stop-domain-fronting-on-your-applic),
[Microsoft Tech Community](https://techcommunity.microsoft.com/t5/azure-networking-blog/prohibiting-domain-fronting-with-azure-front-door-and-azure-cdn/ba-p/4006619)).

INFERRED, and this is the strategic lesson of the chapter: the technique died
because a handful of providers changed a default. No detection product, no
signature, and no customer configuration could have achieved that. Where control
of a technique sits with a small number of platforms, platform policy is the
effective intervention — and it is orders of magnitude cheaper than every
defender detecting it independently. Note also what it did *not* achieve:
attackers moved to abusing those same platforms in ways the platforms cannot
block, which is the next section.

## Living off trusted services

The current centre of gravity. Rather than hide the destination, choose a
destination that cannot be blocked.

DOCUMENTED as `T1102 Web Service`, with sub-techniques for two-way traffic,
one-way traffic, and dead drop resolvers — a public page or post that holds the
real server's address, so the implant looks it up rather than carrying it.

REPORTED: Cloudflare's 2026 threat report, published 3 March 2026, documents Google
Calendar, Google Drive, and Dropbox used to host payloads and deliver commands;
GitHub used for covert control; Amazon SES and SendGrid used for phishing delivery;
Azure Web Apps hosting credential-harvesting pages; and the paste sites
Teletype.in and Rentry.co used as dead drop resolvers pointing to rotating control
addresses. It names the pattern "living off the XaaS"
([Cloudflare](https://blog.cloudflare.com/2026-threat-report/)).

REPORTED: a China-linked group tracked as GopherWhisper ran two-way control over
Slack, Discord, and Microsoft Graph — using Outlook *draft* emails as the message
store, so the orders never actually sent — with exfiltration through the legitimate
file.io service
([DecryptionDigest](https://www.decryptiondigest.com/blog/gopherwhisper-china-apt-slack-discord-outlook-c2)).

REPORTED: compromised servers have been configured to POST directly to
`api.slack.com`, `hooks.slack.com`, and `discord.com` to deliver stolen AWS access
keys, SSH keys, and internal API tokens into attacker-controlled chat channels
([Hive Security](https://hivesecurity.gitlab.io/blog/c2-without-owning-c2/)).

The fully worked example remains the March 2026 GitHub channel described in
[02-channel-taxonomy.md](02-channel-taxonomy.md): session key posted to issue
number one, orders read from issue titles on a 60-second poll, results committed
as files, all RC4-encrypted under a per-session key
([Zscaler](https://www.zscaler.com/blogs/security-research/tropic-trooper-pivots-adaptixc2-and-custom-beacon-listener)).

### Why this defeats most defences

INFERRED, taking each defence in turn.

**Reputation scoring fails.** `github.com` has the best reputation available. So do
`slack.com`, `graph.microsoft.com`, and `drive.google.com`.

**Certificate inspection fails.** The certificate is genuinely GitHub's, genuinely
valid, and genuinely trusted.

**Handshake fingerprinting weakens.** An implant using the platform's own client
library produces the platform's own fingerprint. It is not imitating legitimate
traffic; it is generating it.

**Blocking is not available.** Your developers need GitHub. Your staff need Slack.
Your business runs on Microsoft Graph.

### What still works

INFERRED, and the reasoning is worth following because it is the whole defensive
answer to this class.

The attacker removed the *destination* signal. They did not remove the *actor*
signal or the *rhythm* signal.

**Which machine is doing it.** A finance workstation calling the GitHub API is
strange even though GitHub is fine. A domain controller calling any external API
is strange. The destination is trusted; the pairing of that destination with that
machine is not. This requires a baseline of which machines legitimately use which
services — real work, but it is work that pays off against the entire class at
once rather than against one campaign.

**How they are doing it.** REPORTED: the GitHub campaign authenticated with a
personal access token, recognisable by its `ghp_` prefix, to
`api.github.com`, alongside file operations and scheduled tasks named to imitate
Windows services such as `\MSDNSvc` and `\MicrosoftUDN`
([Zscaler](https://www.zscaler.com/blogs/security-research/tropic-trooper-pivots-adaptixc2-and-custom-beacon-listener)).
Real developer traffic goes through git over HTTPS or SSH. Automated API calls
with a personal token from a machine with no development tooling is a different
behaviour wearing the same destination.

**The rhythm.** A 60-second poll is a metronome. Trusted-service channels tend to
be *more* regular than tuned HTTPS beacons, because the operator has stopped
worrying about the network signal — they believe the destination protects them.
INFERRED: that is the exploitable overconfidence in this technique, and it is the
single most useful sentence in this chapter for a detection engineer.

## Bulletproof hosting

Some providers deliberately ignore abuse reports. They advertise it. This is
**bulletproof hosting**, and it is the commercial layer beneath a large share of
persistent C2 infrastructure.

REPORTED, on the enforcement record:

| Date | Target | Action | Source |
| --- | --- | --- | --- |
| Feb 2025 | Zservers / XHost | US, UK, Australia sanctions; two administrators named; LockBit support cited | [Elliptic](https://www.elliptic.co/blog/us-cracks-down-on-russian-bulletproof-hosting-services) |
| 1 Jul 2025 | Aeza Group | OFAC sanctions on the group, its leadership, and affiliates including a UK entity | [Chainalysis](https://www.chainalysis.com/blog/ofac-sanctions-aeza-group-bulletproof-hosting-crypto-payments-july-2025/), [The Hacker News](https://thehackernews.com/2025/07/us-sanctions-russian-bulletproof.html) |
| 19 Nov 2025 | Media Land, plus further Aeza fronts | OFAC sanctions; LockBit, BlackSuit, and Play ransomware support cited | [Security Affairs](https://securityaffairs.com/184871/cyber-crime/coordinated-sanctions-hit-russian-bulletproof-hosting-providers-enabling-top-ransomware-ops.html), [US Treasury](https://home.treasury.gov/news/press-releases/sb0185) |

REPORTED, and the most instructive detail: after the July 2025 sanctions, Aeza
rebranded to hide its links to new infrastructure, and a UK company called
Hypercore Ltd. was subsequently designated for shifting address infrastructure on
Aeza's behalf
([Security Affairs](https://securityaffairs.com/184871/cyber-crime/coordinated-sanctions-hit-russian-bulletproof-hosting-providers-enabling-top-ransomware-ops.html)).

INFERRED: sanctioning a hosting provider raises the cost of malicious hosting and
produces a traceable evasion trail — the rebranding itself became evidence. It does
not remove the capacity. The practical value to a defender is narrower and still
real: sanctioned and known-abusive networks are legitimate candidates for
network-level blocking, because almost no business need points there. That is a
cheaper and more durable control than tracking individual addresses.

## Hiding the infrastructure itself

DOCUMENTED as `T1665 Hide Infrastructure` — one of the two techniques added to the
tactic since ATT&CK v10.1, which is itself a signal about where the trade moved.

Two variants deserve specific mention.

**Compromised third parties.** The control server is somebody else's hacked
machine. There is nothing to trace, because the owner is a victim too. REPORTED:
Volt Typhoon routed traffic through compromised small-office and home-office
routers, firewalls, and VPN hardware
([Microsoft](https://www.microsoft.com/en-us/security/blog/2023/05/24/volt-typhoon-targets-us-critical-infrastructure-with-living-off-the-land-techniques/)).
INFERRED: this defeats geographic and reputation reasoning completely. Traffic to a
residential address in the victim's own country looks like nothing at all.

**Refusing to answer.** Servers that only respond to a client presenting the right
certificate, or after a specific sequence of connection attempts — ATT&CK's
`T1205 Traffic Signaling` and `T1205.001 Port Knocking`. To a scanner the server
looks closed or absent. This is a direct counter to the internet-scanning approach
that produces the numbers in [03-framework-landscape.md](03-framework-landscape.md),
and it is why those numbers systematically undercount careful operators.

## The pattern across the chapter

INFERRED, drawing the four sections together.

Every technique here trades one property for another, and the pattern is
consistent: **attackers give up control of their infrastructure to gain
invisibility.**

A redirector means someone else owns the machine. Fast flux means the address is
never stable. A trusted service means the platform owns the channel and can close
it. A compromised router means an unwitting third party is hosting the operation.

Each step makes the operator harder to find and easier to *interrupt*. A
trusted-service channel dies when the platform closes the account. A compromised
router channel dies when the owner reboots and patches.

That has a direct consequence for defensive strategy: as attackers move up this
ladder, the leverage moves from the individual defender to the platform. Chapter 7
argues that this is why disruption operations have become more prominent — not
because detection got worse, but because the choke points moved somewhere a
single organisation cannot reach.
