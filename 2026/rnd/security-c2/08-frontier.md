# The frontier

Three developments are changing what a control channel is, rather than just where it
hides. Each breaks a different assumption defenders have been building on.

## A language model writing the commands

### What is happening

Traditionally the operator decides what to run, and the implant carries the
instruction. Some malware now asks a language model to generate the instruction at
run time instead.

REPORTED, from Google's threat intelligence work published November 2025, five
families:

| Family | Written in | What the model does | Channel involvement |
| --- | --- | --- | --- |
| PromptSteal | Python | Queries Qwen2.5-Coder-32B-Instruct to generate the Windows commands it needs to collect files | Sends what it collects to a control server |
| PromptFlux | VBScript | Uses the Gemini API to rewrite its own code, storing obfuscated versions for persistence | Spreads via removable drives and network shares |
| PromptLock | Go | Generates fresh Lua scripts at run time for reconnaissance, encryption, and theft | — |
| FruitShell | PowerShell | Carries hard-coded prompts intended to evade model-based security analysis | Establishes remote command execution |
| QuietVault | JavaScript | Uses prompts with on-host command-line tools to find and steal secrets | — |

Source: [Infosecurity Magazine, 6 Nov 2025](https://www.infosecurity-magazine.com/news/aienabled-malware-actively/).
Google's own framing: these tools "dynamically generate malicious scripts, obfuscate
their own code to evade detection, and leverage AI models to create malicious
functions on demand, rather than hard-coding them."

REPORTED: PromptSteal — also tracked as LAMEHUG — was used against Ukraine and
attributed to APT28, with the automated loop replacing a human operator
([Infosecurity](https://www.infosecurity-magazine.com/news/aienabled-malware-actively/),
[stingrai](https://www.stingrai.io/blog/promptsteal-promptflux-malware-llm-at-runtime)).

REPORTED: Unit 42's 2026 incident response report, drawing on more than 750
investigations, records early experiments with automated command generation and
deepfake identity creation as part of a broader pattern of attackers using AI
across the attack lifecycle
([Unit 42](https://www.paloaltonetworks.com/blog/2026/02/unit-42-global-ir-report/)).

### What it breaks, and what it does not

INFERRED, and the distinction is the point of this section.

**Broken: content-based detection.** A rule matching a specific command string, a
specific script, or a specific file hash assumes the content is stable across
infections. If the content is generated fresh each run, it is not. PromptFlux
rewriting its own code is a direct attack on file-based signatures.

**Not broken: the channel.** PromptSteal still sends its results to a control
server. FruitShell still establishes remote command execution. The model changed
*what is said*; it did not remove the need to say it, or to say it repeatedly, or
to say it to somewhere outside your network.

INFERRED, as the strategic read: this development strengthens rather than weakens
the argument in [05-detection-engineering.md](05-detection-engineering.md) for
weighting behaviour and structure over content. Content is now cheap for attackers
to vary at scale. The relationship is not.

**A genuinely new detection surface.** The malware now has to reach a model
provider's API. That is an outbound connection to a named service, from a machine
that may have no business making it. INFERRED: the same machine-to-service
baselining recommended for GitHub and Slack in
[06-defender-playbook.md](06-defender-playbook.md) applies directly — an
accounting workstation calling an inference API is as odd as one calling the GitHub
API, and possibly odder.

**A caution on how far this has gone.** REPORTED, and worth quoting for balance:
research on prompt-based attack chains found that although control over compromised
model instances has been demonstrated, "most attacks that achieve remote code
execution fall back to conventional binary-level C2 rather than prompt-level
mechanics"
([arXiv 2601.09625, via search](https://arxiv.org/pdf/2601.09625)). INFERRED: the
model is currently a component inside otherwise conventional malware, not a
replacement for the channel. Treat vendor framing of "AI-powered attacks" with
proportionate scepticism, while noting that five named families using models at run
time is not hype — it is a small number that was zero.

## The QUIC and HTTP/3 blind spot

### What is happening

QUIC is a newer transport protocol that carries HTTP/3. It encrypts more of the
connection than older protocols do, including parts of the transport headers that
security equipment used to read.

Most detection tooling was built for TCP.

REPORTED: many detection systems trained on TCP miss QUIC traffic entirely, and
website fingerprinting classifiers built for TCP fail against QUIC with evasion
rates up to 96% — with the caveat that this gap is expected to close as tooling is
updated
([proxies.sx](https://www.proxies.sx/use-cases/privacy/http3-quic)).

REPORTED: research is closing it. Transformer models targeting DNS-over-QUIC and
HTTP/3 achieve effective website identification, and an automated approach reported
a 99.79% F1 score for QUIC website fingerprinting
([proxies.sx](https://www.proxies.sx/use-cases/privacy/http3-quic)).

REPORTED, on the framing: QUIC "changes where the HTTP attack surface lives rather
than removing it", because encrypting the transport header stops middleboxes
inspecting HTTP
([proxies.sx](https://www.proxies.sx/use-cases/privacy/http3-quic)).

A caveat on these figures. They come from a commercial proxy vendor's marketing
material summarising academic work, not from the papers themselves. The direction is
consistent with the DNS-over-HTTPS research cited in
[05-detection-engineering.md](05-detection-engineering.md), which explicitly names
extending coverage to HTTP/3 and QUIC as future work
([arXiv 2512.20423](https://arxiv.org/abs/2512.20423)) — but the exact percentages
should be treated as indicative rather than established.

### What to do about it

INFERRED, and none of it is exotic.

**Check whether your sensors decode QUIC at all.** Many deployments silently pass
UDP 443 without analysis. This is a configuration question with a definite answer,
and it is worth getting before assuming coverage.

**Consider blocking QUIC where you can.** Browsers fall back to TCP-based HTTPS
when QUIC is unavailable, so blocking UDP 443 at the perimeter usually costs a
little performance and no functionality. It restores visibility to tooling that
already works. This is a legitimate trade many organisations should make explicitly
rather than by accident.

**Note that rhythm analysis survives.** Timing and volume are visible in UDP flow
records as readily as TCP ones. A channel over QUIC still checks in on a schedule.
The blind spot is in protocol inspection, not in behavioural analysis — which is
the third time in this report that the durable layer turns out to be the one that
survives a protocol change.

## Intrusions with no implant

### What is happening

The hardest case is not a cleverer channel. It is an intrusion that barely has one.

An attacker who compromises a network edge device — a VPN appliance, a firewall, a
router — and then operates using valid credentials and built-in system tools has
almost nothing for a defender to find. No implant in memory. No unusual program
running. No attacker-owned destination.

REPORTED: Volt Typhoon is defined by the absence of custom malware, using
legitimate tools including WMI, PowerShell, `ntdsutil`, and `netsh` to blend with
normal administration, and routing traffic through compromised small-office and
home-office routers, firewalls, and VPN hardware. It encrypts what control traffic
it has with AES and TLS
([Microsoft](https://www.microsoft.com/en-us/security/blog/2023/05/24/volt-typhoon-targets-us-critical-infrastructure-with-living-off-the-land-techniques/),
[Picus](https://www.picussecurity.com/resource/blog/volt-typhoon-living-off-the-land-cyber-espionage)).

REPORTED: CISA's advisory on the same activity notes detection is difficult
precisely because it relies on valid accounts and built-in binaries, requiring
behavioural monitoring of activity that arrives through normal sign-in channels
([CISA AA24-038A](https://www.cisa.gov/news-events/cybersecurity-advisories/aa24-038a)).

REPORTED: Salt Typhoon exploited known vulnerabilities in edge devices including
Ivanti Connect Secure, Sophos Firewall, Microsoft Exchange, Citrix NetScaler
Gateway, and Cisco IOS XE
([Vectra](https://www.vectra.ai/resources/vectra-ai-threat-briefing-salt-typhoon)).

### Why this is the hardest problem in the report

INFERRED. Every detection method in
[05-detection-engineering.md](05-detection-engineering.md) assumes something to
detect.

Rhythm analysis needs a periodic channel; a human logging in over a VPN with stolen
credentials is not periodic. Fingerprinting needs an unusual client; the VPN client
is the real one. Memory scanning needs an implant; there is none. Reputation needs
a bad destination; the traffic goes to a residential address in the victim's own
country.

And the compromised edge device is usually the worst-instrumented thing on the
network. It often cannot run an endpoint agent at all, its logs are thin, and it
sits *outside* the segment the internal monitoring watches.

### What actually applies

INFERRED, and it is a shift in where you look rather than a new technique.

**Identity, not network.** REPORTED: Unit 42 found identity weaknesses exploited in
89% of its 2026 investigations, and 87% of attacks involving multiple attack
surfaces
([Unit 42](https://www.paloaltonetworks.com/blog/2026/02/unit-42-global-ir-report/)).
When there is no implant, the credential use is the intrusion. Impossible travel,
new device, unusual access time, an account reaching systems it has never touched.

**Direction of connection from the edge device.** An appliance is supposed to accept
connections. It is not supposed to initiate them outbound to arbitrary places.
That inversion is one of the few network signals that survives this scenario, and
it is checkable.

**Administrative tool use, in context.** `ntdsutil` and `netsh` are legitimate. The
question is whether *this* account, on *this* machine, at *this* time, has ever
used them before — which requires a baseline rather than a signature.

**Configuration change monitoring on edge devices.** If you cannot detect the
intruder, detect what they modified. This is often the only visibility available.

## What holds up across all three

INFERRED. The three developments in this chapter attack three different layers, and
one layer survives all of them.

| Development | What it breaks | What still works |
| --- | --- | --- |
| Model-generated commands | Content signatures, file hashes | The channel exists and repeats; a new API destination appears |
| QUIC and HTTP/3 | Protocol inspection, TCP-trained tooling | Timing, volume, destination novelty in flow records |
| No-implant intrusions | Everything implant-based | Identity behaviour, connection direction, configuration changes |

The pattern is the same one that produced the hierarchy in
[05-detection-engineering.md](05-detection-engineering.md). Detection built on what
the attacker *must do* outlasts detection built on what they *happen to be doing*.

The strongest form of that argument is the third row, and it is also the limit of
this report's optimism. In the no-implant case the attacker has genuinely removed
the control channel as a distinct thing to find. What is left is a person using
your systems as though they were entitled to. That is not a network detection
problem, and organisations that have invested exclusively in network detection for
C2 should read it as the reason identity monitoring is not an adjacent concern but
the same concern arriving by a different route.
