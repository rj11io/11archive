# Disruption and law

Individual defenders protect their own network. Control channels are shared
infrastructure across many victims, so a second kind of response exists: attack the
infrastructure itself, using courts, sanctions, and coordinated technical action.

This chapter covers what those operations actually do, what the record shows, and
what they cost — including a cost that is rarely mentioned in the announcements.

## The four instruments

**Sinkholing.** Take control of the domain name the implants call, and point it at a
server the defenders run. Every implant now reports to the good guys. The channel is
dead and you get a victim list, which is how notification programmes work. It needs
legal authority over the domain, so it works against name-based channels and not
against hard-coded addresses.

**Server seizure and disruption.** Take the servers offline, with a court order or
through provider cooperation. Immediate, and immediately reversible by the operator
unless the arrest happens too.

**Sanctions.** Make it illegal for regulated businesses to transact with the
provider. Aimed at the commercial layer beneath the infrastructure, not at any
individual server.

**Prosecution.** The only instrument that removes an operator rather than an asset.
Slowest, and constrained by where the operator lives.

## Operation Endgame

The largest sustained programme of its kind, coordinated by Europol and Eurojust
and launched in May 2024. It is run as repeated phases rather than a single action.

REPORTED, by phase:

| Phase | Servers | Domains | Malware families targeted | Other outcomes |
| --- | --- | --- | --- | --- |
| 19–22 May 2025 | 300 | 650 | Bumblebee, Lactrodectus, Qakbot, Hijackloader, DanaBot, Trickbot, Warmcookie | ransomware supply chain focus |
| 10–13 Nov 2025 | 1,025 | 20 | Rhadamanthys, VenomRAT, Elysium | principal VenomRAT suspect arrested in Greece |
| 18–27 Jun 2026 | 326 | 142 | SocGholish, Amadey, StealC | $47M cryptocurrency frozen; 27M credentials recovered; ~15,000 compromised websites remediated; 100+ C2 servers disrupted |

Sources:
[Europol](https://www.europol.europa.eu/media-press/newsroom/news/end-of-game-for-cybercrime-infrastructure-1025-servers-taken-down),
[Eurojust](https://www.eurojust.europa.eu/news/operation-endgame-continues-international-coalition-takes-malware-offline),
[The Hacker News](https://thehackernews.com/2025/11/operation-endgame-dismantles.html),
[Security Affairs](https://securityaffairs.com/184581/cyber-crime/a-new-round-of-europols-operation-endgame-dismantled-rhadamanthys-venom-rat-and-elysium-botnet.html),
[Hackread](https://hackread.com/operation-endgame-disrupts-socgholish-malware/),
[Infosecurity](https://www.infosecurity-magazine.com/news/operation-endgame-stealc-amadey/).

REPORTED: participating countries across the phases include Australia, Belgium,
Canada, Denmark, France, Germany, Greece, Lithuania, the Netherlands, the United
Kingdom, and the United States, with technical support in the June 2026 phase from
Microsoft and Coinbase.

**No total is given for the servers column, deliberately.** The sources do not
state whether infrastructure counted in one phase was excluded from later ones, so
adding the figures would produce a number that looks authoritative and might be
double counting. See
[10-methodology-and-sources.md](10-methodology-and-sources.md).

### What the numbers tell you, and what they do not

INFERRED. The 27 million recovered credentials and roughly 15,000 remediated
websites are the most meaningful figures in the table, because they describe harm
reduced rather than assets touched. A seized server is an input. A rotated
credential is an outcome.

Server counts are a weaker measure than they appear, for a specific reason. A
"server" in these announcements may be a redirector costing a few pounds a month —
exactly the disposable layer described in
[04-infrastructure-and-evasion.md](04-infrastructure-and-evasion.md). Removing a
thousand of those is genuinely disruptive at scale, because rebuilding a thousand
of anything takes time and money. It is not the same as removing a thousand
operations.

The arrest in the November 2025 phase is worth more than the 1,025 servers
alongside it. Infrastructure is replaceable. People are not.

## The Cobalt Strike action

The clearest case of legal action aimed at a specific C2 tool, and the one most
often described inaccurately.

DOCUMENTED, from Microsoft's own account: on 31 March 2023 the US District Court
for the Eastern District of New York issued an order to Microsoft, Fortra, and
Health-ISAC. Ransomware families associated with cracked copies of Cobalt Strike
had been linked to more than 68 ransomware attacks against healthcare organisations
in more than 19 countries. Conti and LockBit are named, along with the actor group
tracked as DEV-0243, and malicious infrastructure was identified in China, the
United States, and Russia
([Microsoft](https://blogs.microsoft.com/on-the-issues/2023/04/06/stopping-cybercriminals-from-abusing-security-tools/)).

**What the order actually permitted.** DOCUMENTED: it allowed the parties to
disrupt the infrastructure and to notify internet service providers and national
computer emergency response teams so those parties could take it offline
([Microsoft](https://blogs.microsoft.com/on-the-issues/2023/04/06/stopping-cybercriminals-from-abusing-security-tools/)).

REPORTED, and differently: secondary coverage describes the order as letting
Microsoft and Fortra "seize the domain names and take down the IP addresses" of
servers hosting cracked copies
([BleepingComputer](https://www.bleepingcomputer.com/news/security/microsoft-and-fortra-crack-down-on-malicious-cobalt-strike-servers/)).

This report treats Microsoft's own description as authoritative, and the distinction
is not pedantry. INFERRED: the mechanism is *notification backed by a court's
authority* — an abuse report that a hosting provider cannot ignore, delivered at
scale and continuously. That is a real and underrated capability, and it explains
why Microsoft called the approach "advanced persistent disruption": the value is in
being able to repeat it cheaply as the operator moves, not in a single seizure.

Anyone reasoning about what legal action can achieve should model it as persuasion
with legal weight, not confiscation.

## Sanctions on the hosting layer

Covered in detail in
[04-infrastructure-and-evasion.md](04-infrastructure-and-evasion.md). The record in
brief: Zservers/XHost sanctioned by the US, UK, and Australia in February 2025 over
LockBit support; Aeza Group and affiliates by the US Treasury on 1 July 2025; Media
Land plus further Aeza front companies on 19 November 2025, citing LockBit,
BlackSuit, and Play ransomware
([Elliptic](https://www.elliptic.co/blog/us-cracks-down-on-russian-bulletproof-hosting-services),
[Chainalysis](https://www.chainalysis.com/blog/ofac-sanctions-aeza-group-bulletproof-hosting-crypto-payments-july-2025/),
[US Treasury](https://home.treasury.gov/news/press-releases/sb0185)).

REPORTED, and the most useful detail for judging effectiveness: after the July 2025
action Aeza rebranded to obscure its links to new infrastructure, and a UK company,
Hypercore Ltd., was later designated for shifting address infrastructure on Aeza's
behalf
([Security Affairs](https://securityaffairs.com/184871/cyber-crime/coordinated-sanctions-hit-russian-bulletproof-hosting-providers-enabling-top-ransomware-ops.html)).

INFERRED, cutting both ways. The rebranding proves sanctions imposed a real cost —
nobody restructures a company for fun. It equally proves capacity was not removed,
only relocated and made more expensive. And the evasion generated fresh evidence
that supported the next designation, which is a genuine compounding effect over
time rather than a one-off win.

## The platform intervention, which is different

The most complete elimination of a C2 technique in the record was not a law
enforcement action at all.

Domain fronting, covered in
[04-infrastructure-and-evasion.md](04-infrastructure-and-evasion.md), was
effectively ended when Amazon and Google blocked the underlying mismatch in 2018
and Microsoft completed enforcement on Azure in January 2024
([Wikipedia](https://en.wikipedia.org/wiki/Domain_fronting),
[Microsoft Learn](https://learn.microsoft.com/en-us/answers/questions/1421101/take-action-to-stop-domain-fronting-on-your-applic)).

INFERRED: no court order, no sanctions, no arrests. A handful of engineering teams
changed a default and a whole ATT&CK sub-technique became largely unavailable.
Where a technique depends on behaviour that only a few platforms control, platform
policy is by far the most efficient intervention available — and it is the reason
the trusted-service channels in chapter 4 are strategically important. Those depend
on platforms too, which means the platforms could constrain them. Whether they can
do so without breaking the legitimate use of their own APIs is a much harder
question than the fronting fix was, and nothing in the sources suggests it has been
answered.

## The cost nobody puts in the press release

INFERRED, and it is the argument this chapter exists to make.

Pressure applied to a commercial tool moves activity to tools with no vendor to
pressure.

The sequence is visible in the evidence. A decade of industry effort made Cobalt
Strike the most recognisable framework on the internet — REPORTED: Hunt.io
describes it as "one of the most recognized and heavily signatured offensive
frameworks" and says this has "driven some actors toward alternatives such as
Sliver or Havoc"
([Hunt.io](https://hunt.io/blog/russian-malicious-infrastructure-c2-servers-mapped)).
Legal action in 2023 targeted its cracked copies specifically. And the frameworks
now leading the open-source reporting counts are free, community-built, and have no
licensing to crack, no vendor to serve with an order, and no watermark to trace
([Kaspersky](https://securelist.com/vulnerabilities-and-exploits-in-q2-2025/117333/)).

REPORTED, as the sharpest example: AdaptixC2 was first documented as a threat in
September 2025 and was inside Fog and Akira ransomware operations within months
([Unit 42](https://unit42.paloaltonetworks.com/adaptixc2-post-exploitation-framework/),
[The Hacker News](https://thehackernews.com/2025/10/russian-ransomware-gangs-weaponize-open.html)).

This is not an argument against the takedowns. Heavily signatured tools are
genuinely harder to use, disruption genuinely costs operators money and time, and
arrests genuinely remove people. It is an argument for honest accounting: the
displacement is a predictable second-order effect, it is currently absent from how
these operations are announced and evaluated, and defenders who plan around the
press release will be surprised by the migration.

## What this means for an individual organisation

INFERRED. Three practical consequences.

**Disruption is not a control you can rely on.** It reduces the volume of
opportunistic attacks and raises costs across the ecosystem. It will not be
happening on the day someone targets you. Everything in
[06-defender-playbook.md](06-defender-playbook.md) still has to work.

**Notification programmes are worth being reachable for.** Sinkholes and seizures
produce victim lists, and those lists get shared with national response teams who
try to make contact. Organisations that publish accurate security contact details
and monitor those channels find out about their own compromises this way. It is
free intelligence and most organisations are not set up to receive it.

**Sanctioned networks are cheap to block, and blocking them lasts.** Unlike an
address blocklist, a sanctioned hosting provider does not become clean next week.
Almost no legitimate business need points at these networks. This is one of the few
places where indicator-based blocking has durable value, which is why it appears in
the ranked control list rather than in the section on what does not work.
