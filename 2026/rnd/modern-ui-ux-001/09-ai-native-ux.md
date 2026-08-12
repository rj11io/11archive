# 09. AI-native interface design

Putting a model in an interface breaks an assumption every other section of this report relies on: that
the same input produces the same output. When output varies, is sometimes wrong, and cannot be fully
explained, the interface has to carry the uncertainty. That is the whole design problem.

## The most-validated guidance available

Microsoft Research's **18 Guidelines for Human-AI Interaction** (Amershi and colleagues, published at
CHI 2019) remain the strongest-tested set. They were validated with 49 design practitioners applying them
against 20 shipped AI products, and they synthesise about two decades of prior work. They are grouped by
when they apply.

**Initially, before the user has typed anything:**

| # | Guideline | What it looks like in a real interface |
| --- | --- | --- |
| G1 | Make clear what the system can do | A short capability statement or example prompts, not a blank box with a cursor |
| G2 | Make clear how well the system can do what it can do | "Drafts are usually a good starting point; check figures before sending" |

**During interaction:**

| # | Guideline | What it looks like |
| --- | --- | --- |
| G3 | Time services based on context | Do not interrupt mid-sentence with a suggestion |
| G4 | Show contextually relevant information | Cite the document the answer came from, inline |
| G5 | Match relevant social norms | Tone that fits the setting; no false familiarity in a medical or financial product |
| G6 | Mitigate social biases | Test outputs for stereotyped language and skewed examples |

**When the system is wrong:**

| # | Guideline | What it looks like |
| --- | --- | --- |
| G7 | Support efficient invocation | One obvious way to ask for AI help |
| G8 | Support efficient dismissal | One key press to reject a suggestion, with no penalty |
| G9 | Support efficient correction | Edit the output in place; do not force a re-prompt |
| G10 | Scope services when in doubt | When confidence is low, offer a narrower answer or ask a question instead of guessing broadly |
| G11 | Make clear why the system did what it did | Show the inputs, the retrieved sources, or the rule that fired |

**Over time:**

| # | Guideline | What it looks like |
| --- | --- | --- |
| G12 | Remember recent interactions | Do not lose the thread between turns |
| G13 | Learn from user behaviour | Adapt to accepted and rejected suggestions |
| G14 | Update and adapt cautiously | Do not change behaviour abruptly under the user's hands |
| G15 | Encourage granular feedback | Feedback on the specific claim, not just thumbs on the whole answer |
| G16 | Convey the consequences of user actions | Say what "accept" will change, especially if it writes somewhere |
| G17 | Provide global controls | A real off switch, and settings for how much the system may do |
| G18 | Notify users about changes | Tell people when the model or behaviour changed |

Google's **People + AI Guidebook** (from the PAIR team, first published 2019 and updated for generative
AI) covers the same ground in six chapters, and its most useful contributions are three: setting the
user's **mental model** before first use, using **progressive disclosure** for explanations so the
interface is neither opaque nor overwhelming, and designing **graceful failure** as a first-class state
rather than an error page.

## The five states of an AI feature

Extend the four states from [01](01-principles-and-laws.md) with one more, and specify all five.

| State | What the interface must do |
| --- | --- |
| Empty, before first use | Say what this can do, give two or three concrete example prompts, and say what it cannot do |
| Working | Stream partial output if the wait exceeds about a second. Say what step it is on for multi-step work |
| Complete | Show provenance. Offer edit, regenerate, and dismiss with equal weight |
| Uncertain | Say so in words. Narrow the claim, offer to search, or ask a clarifying question |
| Failed | Explain what failed in plain words, whether retrying will help, and offer the non-AI path |

The state most products skip is **uncertain**, and it is the one that determines whether users trust the
feature after their first bad answer. A system that says "I am not sure about the second figure" survives
being wrong. A system that states everything with equal confidence does not.

## Streaming, and what it actually buys

Streaming means rendering the output as it is generated instead of waiting for the whole thing. Two real
benefits, one real cost.

Benefits: the user sees progress within a few hundred milliseconds instead of waiting several seconds,
which keeps the interaction inside the response-time limits from [01](01-principles-and-laws.md); and the
user can tell early whether the answer is going the wrong way and stop it.

Cost: partial output can mislead. A half-rendered number, table, or code block reads as complete for a
moment. Practical rules:

- Keep a **stop** control visible during generation, with the same prominence as send.
- Do not stream content whose meaning changes when incomplete. Buffer numbers, totals, and structured
  results until the unit is whole.
- Show a caret or subtle indicator so the user can distinguish "still writing" from "finished".
- Never let streaming text push the page around. Reserve the space or pin the scroll position, or you
  turn a feature into a layout-shift problem.

**Evidence note.** Specific percentage claims about how much streaming or skeleton screens reduce
perceived waiting circulate widely in vendor articles with no published method. The mechanism is well
supported by the classic response-time work; the numbers are not verifiable and are excluded here.

## Chat is a fallback, not a design

A text box is the easiest AI interface to build and usually the worst one to use, because it requires the
user to guess what the system can do and to phrase it correctly. Prefer, in order:

1. **In-place assistance.** The AI acts on the thing the user already selected: rewrite this paragraph,
   explain this error, fill this field. No prompting required, and the scope is obvious.
2. **Structured input.** A form or a set of controls that constructs the prompt. The user picks tone,
   length, and audience rather than describing them.
3. **Suggested actions.** A short list of things the system is good at, in this context, right now.
4. **Chat.** For genuinely open-ended, multi-turn work. Keep it, but do not make it the entry point.

If you do build chat: give it a scoped set of visible example prompts, keep prior turns editable, make
the context it is using visible (which documents, which selection), and let the user remove things from
that context.

## Generative interfaces, and where the risk is

"Generative UI" means the model assembles the interface, not just the text: it picks a chart over a
table, or produces a form on demand. The upside is a response shaped to the question. The three risks
are concrete:

- **Inconsistency.** If the model can invent components, your design system has stopped being a system.
  Constrain generation to a fixed catalogue of vetted components, with the model choosing among them
  rather than authoring new ones.
- **Accessibility regression.** Generated markup will not have your keyboard handling or labels unless
  the components it selects already do. This is another argument for a component catalogue as the only
  generation surface.
- **Unlearnable interfaces.** If the layout changes every time, users cannot build a mental model and
  cannot develop expertise. Keep the frame stable and let only the content vary.

## Agents: the transparency problem

When the system takes actions rather than producing text, the design burden rises sharply. The
non-negotiables:

- **Show the plan before acting**, for anything with a side effect. Sending, buying, deleting, and
  publishing all need explicit confirmation of the specific action, not a general permission.
- **Show what it did, as a reviewable log.** Not a spinner and then a claim of success.
- **Make undo real.** If the action cannot be undone, the confirmation must say so before, not after.
- **Distinguish proposal from action** visually and consistently. Users must never have to guess whether
  something already happened.
- **Fail loudly and stop.** An agent that silently continues after a failed step compounds the error.
- **Never let content the agent read give it instructions.** This is a security property, but it surfaces
  in the interface too: show the user which sources were consulted, so an injected instruction becomes
  visible rather than invisible.

## Feedback that is worth collecting

Thumbs up and thumbs down produce a number nobody can act on. Better:

- Attach feedback to a **specific span** of the output, not the whole response.
- Offer a small set of named reasons: wrong fact, wrong tone, missed the question, unsafe, too long.
- Capture the **edit**. What the user changed the output into is the highest-value training and
  diagnostic signal available, and it costs the user nothing extra.
- Close the loop. Guideline G18: tell people when their feedback changed something.

## How much AI is actually in interfaces today

For calibration, from the 2025 Web Almanac's generative AI chapter, July 2025 crawl of about 12.9 million
sites:

| Feature | Desktop | Mobile |
| --- | --- | --- |
| Browser Prompt API detected | 0.095% | 0.078% |
| Translator and Language Detector APIs | 0.277% | 0.262% |
| Writing assistance APIs | 0.127% | 0.137% |
| Valid `llms.txt` file present | 2.13% | 2.10% |
| `robots.txt` present with directives | 94.1% | n/a |
| `robots.txt` mentioning GPTBot | 4.5% (20.9% of the top 1,000) | n/a |

For contrast, the enabling technologies grew fast: WebAssembly use rose 27% across 2025 to 5.64% of page
loads, and WebGPU rose 591% on desktop to 0.243%.

The takeaway for a design team: browser-native AI is still negligible in the wild, so almost every AI
feature today is a server call with network latency and cost attached. Design for the wait and for the
failure, because both are guaranteed.

## The AI feature checklist

1. Capability and limits stated before first use.
2. Example prompts or, better, no prompt required.
3. Uncertainty expressed in words, not hidden.
4. Provenance shown for factual output.
5. Edit, regenerate, and dismiss all one action away and equally weighted.
6. Stop control visible during generation.
7. Partial output never misleading; numbers and tables buffered.
8. Side-effecting actions confirmed specifically, with an honest statement about undo.
9. A visible non-AI path to the same goal.
10. A global off switch, and feedback attached to specific spans.
