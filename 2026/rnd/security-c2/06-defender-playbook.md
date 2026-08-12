# The defender playbook

The actionable chapter. Controls that prevent or reveal control channels, ranked by
benefit against effort, followed by what to do when you find a live one.

Everything here is INFERRED unless a source is named — these are judgements built
on the evidence in the preceding chapters, not findings anyone published as a
ranked list.

## Controls, ranked

| # | Control | What it does to the attacker | Effort | Main cost |
| --- | --- | --- | --- | --- |
| 1 | Force all DNS through resolvers you own and log | Removes the cheapest tunnel; creates the evidence everything else needs | days | Blocking encrypted DNS annoys some users |
| 2 | Deny outbound by default from servers | Removes the channel entirely for a large class of hosts | weeks, political | Requires an accurate list of legitimate destinations |
| 3 | Alert on external connections with no preceding lookup | Directly targets ~45% of C2-active malware | days | Small allowlist to maintain |
| 4 | Alert on encrypted-DNS requests from anything but your resolver | Catches a channel that is otherwise invisible | hours | Near zero |
| 5 | Keep connection metadata 30+ days | Sets the longest sleep interval you can ever detect | weeks | Storage |
| 6 | Score outbound connections for periodicity | Catches unknown channels to unknown destinations | weeks | The allowlist is real ongoing work |
| 7 | Use a protective resolver | Blocks known-bad names before they resolve | days | Subscription; misses new infrastructure |
| 8 | Baseline machine-to-service pairings | The only thing that works on trusted-service channels | weeks | Needs upkeep as the business changes |
| 9 | Route all outbound web traffic through an authenticated proxy | Forces attackers to handle authentication; produces clean logs | weeks | Breaks non-proxy-aware software |
| 10 | Restrict which remote-access tools may run | Removes a whole ATT&CK technique by policy | weeks | Users want these tools |
| 11 | Refresh handshake-fingerprint feeds continuously | Keeps a decaying control alive | ongoing | Needs a named owner |
| 12 | Block sanctioned and known-abusive networks wholesale | Cheap, durable; almost no business need points there | days | Occasional false positive |
| 13 | Tie memory inspection to network events | Catches masked implants in their exposure window | weeks | Endpoint product must support it |
| 14 | Segment the network so internal relays cannot reach everywhere | Breaks the one-machine-talks-out design | months | Expensive, high value beyond C2 |

## The four that carry most of the weight

### 1. One resolver, and everything through it

Nothing else in this chapter works properly without it. Resolver logs are the
cheapest high-quality evidence in security, and every DNS-based detection in
[05-detection-engineering.md](05-detection-engineering.md) reads from them.

What it takes:

- Every machine configured to use your resolvers.
- Firewall rules blocking outbound port 53 to anywhere else, so a machine that
  ignores its configuration still cannot bypass you.
- Encrypted DNS to outside providers blocked, and alerted on. REPORTED: US federal
  policy takes exactly this line — agency networks are configured to prevent
  devices and applications from talking directly to third-party DNS providers,
  whether over traditional or encrypted DNS, and agencies must route egress
  queries through the government service
  ([BlueCat summary of NSA/CISA guidance](https://bluecatnetworks.com/blog/nsa-and-cisa-protective-dns-key-to-network-defense/)).
- Queries logged with the client address and kept long enough to investigate.

The friction is real and specific: browsers ship encrypted DNS on by default in
some configurations, and disabling it looks like reducing privacy. The honest
framing for that conversation is that on a managed corporate network the choice is
not privacy versus surveillance — it is whether *your* security team or *an
external provider* sees the queries, and only one of those can detect a tunnel on
your behalf.

### 2. Deny outbound by default, starting with servers

The most effective control here and the hardest to get agreed, because it is a
political problem wearing a technical costume.

Start where the argument is easiest. A database server has no business browsing
the web. A domain controller has no reason to call an external API. These machines
have small, knowable sets of legitimate destinations — a patch source, a licence
check, a monitoring endpoint. Allow those and deny the rest.

This does not detect a channel. It prevents one. An implant on a machine that
cannot reach the internet has to find a relay, which means more activity, on your
internal network, where [05-detection-engineering.md](05-detection-engineering.md)
notes most organisations are not looking — so pair this with control 14.

Then work outward. Workstations are much harder because people genuinely need the
internet, which is where control 9 takes over.

### 3. The missing-lookup rule

The best value-per-hour item in this report, because it reuses infrastructure
controls 1 and 5 already built.

The logic: for each outbound connection to an external address, ask whether this
machine recently resolved a name that points there. If not, flag it.

REPORTED, on the size of the prize: 45.32% of malware samples with C2 activity made
at least one direct-to-address connection, and those accounted for 23.17% of all
observed C2 connection attempts
([Unit 42](https://unit42.paloaltonetworks.com/malware-bypass-dns-direct-to-ip/)).

The allowlist is finite: your own infrastructure by address, peer-to-peer
applications you sanction, appliances with hard-coded endpoints, and connections
inside a cached result's lifetime. Enumerate once, revisit quarterly.

### 6. Periodicity scoring, with the allowlist funded

Rhythm analysis is the most durable detection available. It also fails in a
predictable way, and knowing the failure mode in advance is most of the battle.

The failure: your network is full of legitimate beacons. Update checkers,
monitoring agents, certificate revocation lookups, telemetry, cloud sync. A naive
deployment produces hundreds of high-scoring destinations that are all fine, the
team stops reading the output within two weeks, and the capability is written off
as unworkable.

The fix is unglamorous and it is the whole job: build and maintain a list of
known-good periodic destinations, and treat additions to it as routine work rather
than as failures of the detection. Budget the maintenance explicitly when you
propose the project, because a team that treats the allowlist as an unexpected
burden will abandon the control.

REPORTED, for the tooling: Zeek plus RITA is the standard open-source path, with
RITA scoring each pair from 0.0 to 1.0 and scores above 0.8 across hundreds of
connections indicating an automated beacon
([Black Hills Information Security](https://www.blackhillsinfosec.com/detecting-malware-beacons-with-zeek-and-rita/)).

## Two cheap wins worth doing this week

**The encrypted-DNS rule.** Alert when anything other than your resolver makes an
HTTP request to a `/dns-query` endpoint or sends the
`application/dns-message` content type. REPORTED: this is precisely how AdaptixC2's
encrypted-DNS transport presents
([Securelist](https://securelist.com/tr/adaptixc2-network-and-host-detection/119424/)).
On a managed network the result is either a policy violation or a tunnel. Both are
worth an alert. Cost: hours.

**Fix your monitoring port list.** REPORTED: frameworks use 443 but also 80, 8080,
8443, 4433, and custom high ports, and both Suricata's detection ports and Zeek's
TLS port list need to cover them
([Security Boulevard](https://securityboulevard.com/2026/08/writing-suricata-rules-to-detect-command-and-control-traffic/)).
A sensor decoding TLS only on 443 is blind on 8443 by configuration, not by
evasion. Cost: minutes, and it is a common gap.

## What to do when you find a live channel

The instinct is to block it immediately. Resist that for as long as you safely
can, and be deliberate about why.

### Decide first: are you containing or investigating?

**Contain immediately** if data is actively leaving, if ransomware deployment looks
imminent, or if the affected system is critical enough that dwell time is
unacceptable. REPORTED, on how little time you may have: Unit 42 observed a fastest
time from initial access to data exfiltration of 72 minutes across more than 750
investigated incidents — roughly four times faster than the previous year
([Unit 42 IR Report 2026](https://www.paloaltonetworks.com/blog/2026/02/unit-42-global-ir-report/)).
That number should calibrate how long "watch and learn" is defensible. Often it is
not.

**Investigate first** if the channel appears to be in a reconnaissance phase, if
you have only found one implant and suspect more, and if you can monitor without
being noticed.

The reason not to reflexively block: `T1008 Fallback Channels`. Cutting the primary
tells the attacker they are detected and switches them to a channel you have not
characterised. You trade a monitored channel for an unmonitored one, and you have
told the adversary the clock is running.

### The investigation sequence

1. **Do not touch the machine.** No isolation, no scanning, no reboot. Anything
   visible to the attacker starts their clock.
2. **Pull the full connection history for that pair.** How long has this run? What
   is the interval? When did volume change? The first connection dates the
   intrusion.
3. **Pivot on the destination.** Which other machines have contacted it? Use
   resolver logs as well as connection logs — a machine that resolved the name but
   was blocked from connecting is still compromised.
4. **Pivot on the fingerprint and the infrastructure.** REPORTED: JARM and JA4X
   data are effective for finding related servers during hunting
   ([FoxIO](https://blog.foxio.io/ja4+-network-fingerprinting)). Certificate
   details, hosting provider, and registration data often reveal the rest of the
   set.
5. **Look for the second channel before you cut the first.** Check the same machine
   for other unusual outbound destinations, encrypted-DNS requests, internal relay
   traffic, and named-pipe activity. Assume a fallback exists.
6. **Establish scope on the host.** REPORTED, as the accompanying behaviours to
   check: `lsass.exe` memory access, registry hive access for SAM/SECURITY/SYSTEM,
   LDAP queries against Active Directory password attributes, Kerberos events 4768
   and 4769, browser profile access, and shells spawned by the remote-management
   service ([Securelist](https://securelist.com/tr/adaptixc2-network-and-host-detection/119424/)).
7. **Then cut everything at once.** All channels, all machines, all credentials that
   could have been taken, in one action. A staged response gives the attacker time
   to re-establish.

### After the cut

- **Assume every credential on every affected machine is gone.** Rotate them.
  Service accounts and machine accounts included.
- **Watch for the return.** Attackers who paid for access come back. New unusual
  destinations from the same segment in the following weeks are the signal, and
  this is where periodicity scoring earns its keep.
- **Record the channel's full characteristics.** Interval, jitter, destination,
  fingerprints, headers, framework if identified. This is your best detection
  content, because it came from an attacker who chose to target you.
- **Check whether your controls should have caught it, honestly.** If the channel
  ran for six weeks and you keep thirty days of connection metadata, the finding is
  a retention problem, not a detection problem. Those get different fixes and are
  routinely confused.

## What good looks like

A short checklist for auditing the programme rather than the tooling.

- [ ] Every DNS query in the organisation goes to a resolver you own, and is logged.
- [ ] Outbound port 53 to anywhere else is blocked at the firewall.
- [ ] Encrypted DNS from applications is blocked and alerted.
- [ ] Servers deny outbound by default.
- [ ] Connection metadata is retained at least 30 days.
- [ ] A rule fires on external connections with no preceding lookup.
- [ ] Periodicity scoring runs, and the allowlist has a named owner.
- [ ] Fingerprint feeds have a named owner and a refresh cadence.
- [ ] You know which machines legitimately use GitHub, Slack, cloud storage, and
      code-editor tunnels.
- [ ] Monitoring decodes TLS on all common alternative ports, not just 443.
- [ ] The incident runbook says find the fallback before cutting the primary.
- [ ] Someone can answer "how long would a six-hour beacon go unnoticed here?"
      with a number.

That last question is the most useful single test of whether any of this is real.
If the answer is "forever, because we keep seven days of logs", the retention gap
is the finding, and no amount of detection tooling fixes it.
