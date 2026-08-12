# What a control channel actually is

## Start with the problem the attacker has

Imagine you have picked the lock on a building and you are now standing inside, at
night, in the dark. You do not know the layout. You do not know which doors lead
where. You cannot see what is in the filing cabinets. And you have to leave before
morning.

What you want is a radio, so a colleague outside with a floor plan can tell you
where to go, and so you can read out what you find.

That radio is command and control. Everything else in this report is about how the
radio is built, how it is hidden, and how it is found.

The comparison holds up further than it looks. A radio needs a frequency both
sides agree on. It needs to not be so loud that a guard hears it. It needs to keep
working when someone jams one frequency. And crucially: a radio that never
transmits is useless, so there is always something to hear if you are listening in
the right way.

## The four jobs a channel does

Almost every control channel does the same four things, whatever it is built from.
Understanding the four separately is useful, because a defender can often break one
without touching the others.

**1. Check in.** The compromised machine reaches out and says "I am here, and I am
reachable." This is where the word *beacon* comes from — like a lighthouse, it
signals on a repeating cycle.

**2. Fetch orders.** The machine asks whether there is anything to do. Usually the
answer is no. This is the traffic a defender sees most of, and it is the traffic
that carries the rhythm.

**3. Send answers.** Results go back: a directory listing, a stolen file, a
screenshot, a password.

**4. Add capability.** The channel delivers new code — a module to dump
credentials, a tool to scan the network. In MITRE ATT&CK this is catalogued
separately as `T1105 Ingress Tool Transfer`, because it looks different from the
other three: it is a large, one-off transfer rather than a small, repeated one.

That difference in shape matters for detection. Jobs one and two produce many tiny
identical-ish exchanges. Job three produces occasional larger uploads. Job four
produces a rare big download. A channel that does all four leaves three distinct
statistical signatures in the same connection history, and defenders can hunt each.

## Which way does the connection go

This is the single most important design decision in a control channel, and it is
decided by firewalls rather than by the attacker.

A **reverse** channel means the compromised machine dials out to the attacker.
A **bind** channel means the attacker dials in to the compromised machine.

Bind channels are almost extinct on the internet. Any competent firewall blocks
unexpected inbound connections, and machines behind home routers or cloud network
translation are not directly reachable anyway. So essentially all real-world C2 is
reverse: the victim calls the attacker.

This is a gift to defenders and it is worth being explicit about why. It means the
attacker's traffic must cross your egress boundary — the point where your network
talks to the outside — in the outbound direction, initiated from inside, at a time
of the attacker's choosing but on a path of *your* choosing. You control the
resolver it asks, the proxy it may have to traverse, and the firewall it must pass.
Every one of those is a place to look.

## Asynchronous versus interactive

A channel can be slow and patient or fast and chatty, and the choice is a direct
trade of stealth against usefulness.

An **asynchronous** channel checks in on a long cycle — every few minutes, every
hour, sometimes once a day. The operator queues a command and waits. This is
quiet: a connection every hour hides easily in normal traffic. It is also painful
to work with, because every action takes a full cycle to complete.

An **interactive** channel keeps a live session, so typing feels like a terminal.
This is what an attacker wants when they are actively exploring, and it is much
louder: a steady stream of small packets in both directions for minutes on end.

Real operations use both, and switch. DOCUMENTED: Sliver, an open-source framework
from Bishop Fox, ships this as two explicit modes — "beacon" for the patient
asynchronous style and "session" for the live interactive one
([Bishop Fox / Sliver documentation](https://deepwiki.com/BishopFox/sliver/6.1-mtls-communication),
[Sliver field guide](https://ring0shady.github.io/posts/sliver-c2-deep-dive/)).

INFERRED, and this is a useful hunting insight: the switch itself is detectable.
A destination that has been contacted once an hour for three weeks and then
suddenly carries two hundred small exchanges in four minutes has changed
character. Nothing legitimate does that. You do not need to know what the traffic
says to know that something woke up.

## The life of one channel, start to finish

### Stage one: the stager

The first code to run on a compromised machine is usually tiny — a few hundred
bytes to a few kilobytes. It is called a **stager**, and its only job is to
download the real implant and run it in memory.

Why bother with two stages? Because the delivery method is usually cramped. A
malicious document macro, a command typed into a vulnerable web application, or a
buffer overflow gives you very little room. Small enough to fit, and small enough
that there is not much for a scanner to recognise.

DOCUMENTED: ATT&CK catalogues this as `T1104 Multi-Stage Channels`. The stager
often uses a different, simpler channel than the implant that follows — which
means a defender who only models the final channel misses the first request
entirely.

### Stage two: the implant checks in

The real payload — variously called an implant, agent, or beacon — starts up and
makes its first contact. This first message is the richest moment in the channel's
whole life, because it has to establish trust from nothing.

REPORTED, and unusually concrete: the AdaptixC2 agent sends a heartbeat carrying a
custom HTTP header, by default named `X-Beacon-Id`, with an obsolete Firefox 20.0
user-agent string, and receives a JSON reply containing `status`, `data`, and
`metrics` fields. Its TCP mode answers with the literal banner `AdaptixC2 server`
([Kaspersky Securelist, April 2026](https://securelist.com/tr/adaptixc2-network-and-host-detection/119424/)).
Every one of those is customisable by the operator, and in real intrusions some
are customised. But defaults are sticky, and defaults are why signature detection
still catches a great deal.

### Stage three: the working relationship

Now the loop runs. Check in, ask for orders, mostly get none, occasionally do
something. Weeks can pass like this. Ransomware crews use the time to map the
network and find backups; espionage operators use it to wait.

The two knobs the operator sets here are **sleep** — how long between check-ins —
and **jitter** — how much random variation to add to the sleep, so the pattern is
not exactly regular. REPORTED: a documented real-world configuration used an
average sleep of 787.5 seconds with jitter applied on top
([Hive Security](https://hivesecurity.gitlab.io/blog/cobalt-strike-detection-hunting/)).
Chapter 5 explains why jitter fails to hide the rhythm as well as operators hope.

### Stage four: fallback

Serious operators build a second way in. DOCUMENTED as `T1008 Fallback Channels`,
this means the implant tries an alternative when the primary stops answering —
a different protocol, a different address, a different service entirely.

INFERRED, and it has a direct operational consequence: blocking a primary channel
without watching for what happens next is worse than useless, because it converts
a channel you were monitoring into one you are not. The right sequence is
observe, prepare, then cut everything at once. Chapter 6 covers this.

### Stage five: how it ends

Channels die four ways. The operator finishes and shuts down. The defender finds
and cuts it. The machine is rebuilt or patched. Or the implant simply expires —
several frameworks support a **kill date**, a configured time after which the
implant deletes itself. REPORTED: AdaptixC2 exposes both a `KillDate` and a
`WorkingTime` setting, the latter restricting activity to chosen hours so the
traffic falls inside the victim's normal business day
([Unit 42](https://unit42.paloaltonetworks.com/adaptixc2-post-exploitation-framework/)).

That `WorkingTime` setting deserves attention, because it defeats a detection idea
many teams rely on. "Alert on connections at 3am" is a reasonable rule that a
single configuration option renders blind. INFERRED: time-of-day anomaly detection
should be treated as a bonus signal, never a primary one.

## Where the channel sits among everything else

An intrusion has phases, and control channels touch nearly all of them.

| Phase | What the attacker is doing | The channel's part |
| --- | --- | --- |
| Initial access | Getting the first foothold | Delivers the stager |
| Execution | Running their code | The implant *is* the running code |
| Persistence | Surviving a reboot | Restarts the channel automatically |
| Discovery | Learning the network | Every question and answer crosses it |
| Credential access | Stealing passwords | Loaded as a module, results returned over it |
| Lateral movement | Reaching the next machine | New implants report back, often via internal hops |
| Exfiltration | Taking the data | Sometimes over the channel, often over a separate path |
| Impact | Ransomware, destruction | The final command arrives over it |

Two things follow from this table. First, C2 is not one stage of an attack — it is
the thread running through the whole thing. Second, exfiltration is often
deliberately *separated* from the control channel, because the control channel is
tuned for small quiet messages and bulk data would ruin its profile. ATT&CK
catalogues exfiltration as its own tactic for exactly this reason. A defender who
treats "the C2 channel" and "the data theft channel" as one thing will model
neither correctly.

## Why this is the best place to catch an intruder

Three properties of control channels combine into the central defensive argument
of this report.

**It cannot be skipped.** An operator who cannot issue commands cannot conduct an
operation. Fully automated malware exists, but it cannot adapt, and adaptation is
what a targeted intrusion is for.

**It must cross a boundary you own.** As established above, real C2 is outbound
from inside your network. It passes your equipment.

**It must repeat.** One connection can be an accident. A relationship leaves a
history, and history is what statistics work on.

REPORTED, as the quantitative backing: benign software rarely reaches untrusted
places, and when it does it reaches very few — around 1% of benign samples made
any untrusted connection, averaging 1.6 destinations. Malware with C2 averaged
4.17 unique destinations over TCP
([Unit 42](https://unit42.paloaltonetworks.com/malware-bypass-dns-direct-to-ip/)).

INFERRED: the gap between those two behaviours is the detection surface. Every
technique in [05-detection-engineering.md](05-detection-engineering.md) is an
attempt to measure some part of it, and every technique in
[04-infrastructure-and-evasion.md](04-infrastructure-and-evasion.md) is an attempt
to close it.
