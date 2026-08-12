# 10. Anti-patterns, deceptive design, and regulation

Some design failures are mistakes. Others are choices that work for the business by working against the
user. Both now carry consequences: the first through accessibility law, the second through consumer
protection law. This section catalogues both, with the fix for each.

## Deceptive design: from a blog term to an enforcement priority

"Dark patterns", now often called deceptive design, are interface choices that steer users into
decisions they would not otherwise make. The category moved from criticism to enforcement.

**United States.** The Federal Trade Commission finalised a rule in 2024 requiring cancellation to be as
easy as sign-up, commonly called "click to cancel". A federal appeals court vacated it in 2025 on
procedural grounds, and the Commission has continued to act under its general authority against unfair
and deceptive practices. The consequential number: a reported $2.5 billion settlement with Amazon in
September 2025 over allegations that its subscription sign-up used deceptive design and made cancellation
difficult, plus a reported $8 million settlement with Care.com in 2025. Whatever happens to the specific
rule, the exposure is real.

**European Union.** The Digital Fairness Act is the Commission's planned instrument covering manipulative
interface design, addictive design, misleading influencer marketing, and unfair personalisation. It is a
headline item in the 2030 Consumer Agenda adopted on 19 November 2025, with a legislative proposal
expected late 2026. Existing instruments already bite in the meantime, and national regulators are
active.

The practical planning assumption: design the cancellation, consent, and pricing flows as if the rule
exists, because the enforcement already does.

## The deceptive-design catalogue

| Pattern | What it looks like | Why it is a problem | The fix |
| --- | --- | --- | --- |
| Confirmshaming | "No thanks, I prefer paying full price" | Coerces through embarrassment | Neutral decline wording, same visual weight |
| Asymmetric buttons | "Accept all" is a filled button, "Reject" is grey text | Manipulates by visual hierarchy, not information | Equal size, weight, and colour treatment for both |
| Roach motel | Easy to subscribe, phone call to cancel | The specific target of FTC action | Cancel in the same number of steps as sign-up, in the same channel |
| Hidden costs | Fees appear only at the last step | Sunk-cost manipulation | Total price, including fees, from the first step |
| Forced continuity | Trial converts silently to a paid plan | Charges without a decision | Reminder before charge, and a visible cancel path |
| Pre-checked options | Marketing consent already ticked | Consent that was never given | Unchecked by default, always |
| Fake urgency | "3 people are viewing this" with no basis | False information | Only show counts and timers that are true and verifiable |
| Nagging | Repeated prompts to enable notifications | Wears down refusal | Ask once, respect the answer, offer it in settings |
| Disguised ads | Sponsored content styled as results | Confuses identity of content | Clear, persistent labelling |
| Trick wording | Double negatives on opt-outs | Confuses through language | One clear affirmative statement per choice |
| Obstruction | Cancellation buried five levels deep | Friction as a retention strategy | Direct route from the account page |
| Bait and switch | The button does something other than its label | Breaks the basic contract of a control | Labels describe the action |

A useful test for any flow: **would you be comfortable showing this screen to the user afterwards and
explaining why it was designed this way?** If not, it is a deceptive pattern regardless of what it is
called internally.

## Cookie and consent banners

The most-seen interface on the web, and one of the worst. What the evidence says:

- Regulators are now specifically targeting **click-depth asymmetry** (reject taking more clicks than
  accept), non-functional withdrawal of consent, and banners that appear compliant while tracking loads
  regardless.
- A 2025 French regulator action issued formal notices over banner design asymmetry, and Austria's
  highest court ruled that a coloured accept button paired with a grey reject link violates the
  requirement for parity.
- Presence of both accept and reject buttons rose from 2.94% of EEA sites in 2018 to 30.66% in 2024,
  which also means most sites still lacked parity in 2024.
- One study reported that only about 15% of the top 10,000 EU websites ran a minimally compliant banner
  while about 67% showed a consent interface at all.
- Reported behaviour: about a quarter of visitors accept everything on first click and about a third
  ignore the banner entirely. Reported consent rates with symmetric buttons around 40% in one German
  market study.

Treat the specific percentages as secondary and indicative; the regulatory direction is not in doubt.

Design rules that both comply and read as honest:

1. Accept and reject get identical treatment: same element type, size, colour weight, and position
   prominence.
2. One click to reject everything, from the first screen.
3. No pre-ticked non-essential categories.
4. Withdrawal is as easy as granting, and reachable later from a persistent control.
5. Nothing non-essential loads before consent, including the analytics you forgot about.
6. The banner does not cover content in a way that traps keyboard focus (see WCAG 2.4.11).

## Accessibility overlays: the widget that does not work

Third-party scripts that promise to make a site accessible by injecting an overlay are used by about 2%
of desktop sites, but only 0.2% of the top 1,000. That gap is informative: the sites with the largest
accessibility budgets and the most legal scrutiny use them least.

The problems are structural rather than about any one vendor: an overlay cannot fix a missing label
correctly because it cannot know the field's purpose, it cannot restructure headings, it cannot add
meaningful alternative text, it often conflicts with the user's own assistive technology, and it does not
remove legal exposure. Fix the underlying markup instead. If a vendor offers a scan, use the scan and
skip the widget.

## The interface anti-pattern catalogue

Failures that are mistakes rather than manipulation. Each maps to a section of this report.

| Anti-pattern | Symptom | Fix | Section |
| --- | --- | --- | --- |
| Removing the focus ring | Keyboard users cannot see where they are; about 67% of sites do this | Style `:focus-visible`, 2 px, 3:1 contrast | [05](05-interaction-and-motion.md) |
| Placeholder as label | Field meaning vanishes on typing | Real `<label>` | [08](08-forms-and-authentication.md) |
| `div` as button | No keyboard, no role, no focus | `<button>` | [06](06-accessibility-and-law.md) |
| ARIA over native | More detected failures, not fewer | Native element first | [06](06-accessibility-and-law.md) |
| Blocking pinch zoom | Fails WCAG 1.4.4; one page in five still does it | Remove `maximum-scale`; use 16 px inputs | [04](04-color-typography-and-theming.md) |
| Drag-only interaction | Fails WCAG 2.5.7 | Add a single-pointer alternative | [05](05-interaction-and-motion.md) |
| Hover-only reveal | Invisible on touch, unreachable by keyboard | Click or `interestfor` | [05](05-interaction-and-motion.md) |
| Tiny tap targets | Mis-taps, rage taps | 24 px floor, 44 px for frequent actions | [05](05-interaction-and-motion.md) |
| Low-contrast "elegant" grey | Most common failure on the web | 4.5:1 body, 3:1 large and controls | [04](04-color-typography-and-theming.md) |
| Colour-only status | Invisible to about 8% of men | Add icon, shape, or text | [04](04-color-typography-and-theming.md) |
| Infinite scroll with a footer | Footer becomes unreachable | Paginate, or move footer content elsewhere | [03](03-layout-and-responsive.md) |
| Carousel as primary navigation | Very low interaction with slides past the first | Show the content; if you must, add pause and controls | [05](05-interaction-and-motion.md) |
| Auto-playing motion with no pause | Fails WCAG 2.2.2 | Pause control, respect reduced motion | [05](05-interaction-and-motion.md) |
| Layout shift from late content | Users click the wrong thing | Reserve space, `aspect-ratio` | [07](07-performance-as-ux.md) |
| Fake progress bar | Stalls at 90%, destroys trust | Real progress or an honest indeterminate state | [07](07-performance-as-ux.md) |
| Modal on arrival | Blocks the task before it starts | Delay, or use an inline offer | [01](01-principles-and-laws.md) |
| Scroll hijacking | Removes the user's control of the page | Do not intercept scroll | [05](05-interaction-and-motion.md) |
| Icon-only toolbars | Meaning guessed, not read | Labels, or labels on hover plus accessible names | [04](04-color-typography-and-theming.md) |
| Destructive action next to a common one | Deletes the wrong thing | Separate, differentiate, confirm, and offer undo | [01](01-principles-and-laws.md) |
| Error message without a fix | "Invalid input" | Say what and how | [08](08-forms-and-authentication.md) |
| Disabled submit with no explanation | User cannot tell what is missing | Keep it enabled and explain on submit, or explain the blocker inline | [08](08-forms-and-authentication.md) |
| Silent AI confidence | Wrong answers stated as facts | Express uncertainty, show provenance | [09](09-ai-native-ux.md) |
| Unlabelled AI action with side effects | Something got sent | Confirm specifically, and say whether undo exists | [09](09-ai-native-ux.md) |
| Half-migrated design system | Two versions of every pattern | Finish the migration, or revert it | [02](02-design-systems-and-tokens.md) |

## Where the two categories meet

The overlap is worth naming: a cancellation flow that is technically present but only reachable by
dragging, or a consent banner that traps keyboard focus, is simultaneously an accessibility failure and a
consumer protection problem. Deceptive patterns hurt users with disabilities disproportionately, because
extra friction compounds. Auditing both at once is more efficient than auditing either alone.
