# Command and Control: the conversation you were never meant to hear

How an attacker keeps talking to a machine they have broken into, why that
conversation is the hardest part of an intrusion to hide, and what actually
catches it.

"Command and control" — usually shortened to **C2** — is the channel an attacker
uses to send orders to a computer they already control, and to receive answers
back. Breaking in is a moment. C2 is a relationship, and it has to be maintained.
That is why it is the best place to catch an intruder, and why enormous effort
goes into hiding it.

## The short version

An attacker who gets in but cannot talk to what they got into has achieved almost
nothing. So every intrusion that matters carries a channel, and every channel has
to leave the network. That crossing is the defender's opportunity.

The trade has moved decisively toward hiding inside traffic you cannot afford to
block. Attackers now route commands through GitHub issue comments, Slack
webhooks, and Outlook draft folders — services your business already depends on.
REPORTED: one 2026 campaign polled a GitHub repository's issue list every 60
seconds for its orders and never contacted an attacker-owned server at all
([Zscaler](https://www.zscaler.com/blogs/security-research/tropic-trooper-pivots-adaptixc2-and-custom-beacon-listener)).

Meanwhile the paid tool that defined the category for a decade is losing ground
to free ones. And nobody agrees on which tool leads, because the three main ways
of counting measure three different things.

## Read in this order

| File | What it covers |
| --- | --- |
| [00-executive-brief.md](00-executive-brief.md) | The findings, the numbers, the disagreements, and what to do. Start here. |
| [01-what-c2-is.md](01-what-c2-is.md) | What a channel is, the four jobs it does, and the life of one from first call to last. |
| [02-channel-taxonomy.md](02-channel-taxonomy.md) | Every channel class: how it carries traffic, why it was chosen, what betrays it. Mapped to MITRE ATT&CK. |
| [03-framework-landscape.md](03-framework-landscape.md) | The tools: Cobalt Strike, Sliver, Havoc, Mythic, AdaptixC2 and the rest. Who uses what, and why the rankings conflict. |
| [04-infrastructure-and-evasion.md](04-infrastructure-and-evasion.md) | Redirectors, fast flux, generated domain names, dead drops, and hiding inside trusted services. |
| [05-detection-engineering.md](05-detection-engineering.md) | What actually finds a channel: rhythm analysis, handshake fingerprints, memory scanning. With honest limits. |
| [06-defender-playbook.md](06-defender-playbook.md) | The actionable chapter. Controls ranked by benefit against effort, plus what to do when you find a live channel. |
| [07-disruption-and-law.md](07-disruption-and-law.md) | Takedowns, court orders, and what disruption actually buys. |
| [08-frontier.md](08-frontier.md) | Language models writing their own commands, the QUIC blind spot, and intrusions with no implant to find. |
| [09-glossary.md](09-glossary.md) | Every term used here, in plain words. |
| [10-methodology-and-sources.md](10-methodology-and-sources.md) | How this was built, every calculation, every conflict, every gap, and all 54 sources. |

`data.json` holds the structured evidence, including all sources and the
recorded conflicts. `report.html` is the self-contained version with sortable
tables.

## How to read the evidence labels

Every material claim carries one of four labels. This report contains **no
original measurement** — that is its main limitation, and it is stated plainly
rather than hidden.

- **DOCUMENTED** — the thing's own owner says so: a vendor's documentation, a
  release note, a government advisory, the MITRE ATT&CK catalogue itself.
- **REPORTED** — a named third party published it. Not checked independently
  here. Treated as weaker, and the source is always named inline.
- **CALCULATED** — worked out in this report from reported numbers. Every
  formula appears in [10-methodology-and-sources.md](10-methodology-and-sources.md).
- **INFERRED** — a judgement drawn from the evidence. No source states it. The
  reasoning is always shown so you can disagree with it.

## Scope, and what this report will not do

This is a defensive and analytical report. It explains how channels work, what
each one costs the attacker, and what gives each one away. It maps the tools and
names the detection that catches them.

It does not include implant code, configuration files that would function as
working profiles, or step-by-step instructions for evading a named security
product. Where a technique is described, the description is at the level a
defender needs to write a detection or a network rule — which is the level the
vendor advisories and academic papers cited here already publish at.

Two further boundaries worth stating. First, every framework named in
[03-framework-landscape.md](03-framework-landscape.md) is a legitimate,
publicly available security testing tool. Naming it is not an accusation
against its authors; it is a description of what defenders are seeing. Second,
the numbers throughout come from vendors who sell detection products. Their
counts reflect what their sensors see, which is not the same as what exists.
[10-methodology-and-sources.md](10-methodology-and-sources.md) is specific about
where that bias bites.

No private data, credentials, customer information, or local file paths appear
anywhere in this report.
