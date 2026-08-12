# 01. Principles and laws that still hold

Interface fashion turns over every few years. The findings in this section are between 30 and 75
years old and have survived every turn, because they describe people rather than technology. Use
them as the ground you argue from when taste is in dispute.

## The ten heuristics

Jakob Nielsen published ten "heuristics" (rules of thumb for spotting usability problems) in 1994,
last revised in 2020. They are not a checklist to pass. They are a vocabulary for naming what is
wrong.

| # | Heuristic | Plain reading | A modern violation |
| --- | --- | --- | --- |
| 1 | Visibility of system status | Always show what is happening | A save button that does nothing visible for two seconds |
| 2 | Match between system and the real world | Use the user's words | Labelling a screen "Entity Manager" |
| 3 | User control and freedom | Always offer an exit | A modal with no close button, only "Continue" |
| 4 | Consistency and standards | Same thing, same name, same place | Three different date pickers in one product |
| 5 | Error prevention | Make the mistake impossible | A free-text date field instead of a picker plus a mask |
| 6 | Recognition rather than recall | Show options, do not make people remember | Hiding navigation behind a hamburger on a wide desktop screen |
| 7 | Flexibility and efficiency of use | Shortcuts for experts, defaults for newcomers | No keyboard shortcuts in a tool people use all day |
| 8 | Aesthetic and minimalist design | Remove what competes with the essential | A dashboard where six numbers compete for one glance |
| 9 | Help users recognise, diagnose, recover from errors | Plain language, the cause, the fix | "Error 0x8004005" |
| 10 | Help and documentation | Findable, task-based, in context | A help centre that does not mention the screen you are on |

Heuristic 1 is the one modern products break most, and it is also the cheapest to fix: any action
over 100 ms needs immediate acknowledgement, even if the result is not ready.

## The three response-time limits

From Nielsen's *Usability Engineering* (1993), and still the clearest way to pick a feedback
strategy.

| Limit | What the user feels | What to build |
| --- | --- | --- |
| 0.1 s | Instant. The user believes they moved the object themselves | No indicator. Just do it. Optimistic updates belong here |
| 1.0 s | A noticeable pause, but the train of thought survives | No spinner needed. A subtle state change is enough |
| 10 s | The edge of held attention | A progress indicator with an estimate, and the ability to do something else |

Beyond 10 seconds, stop pretending it is synchronous. Let the user leave and notify them.

These limits are about human perception, so they do not move when hardware improves. They pair
directly with the web's responsiveness metric in [07](07-performance-as-ux.md): the 200 ms "good"
threshold for Interaction to Next Paint sits between the first two limits, by design.

## Fitts's law

Published by Paul Fitts in 1954, extended by Fitts and Peterson in 1964. The time to hit a target
grows with the distance to it and shrinks as the target gets bigger.

What it actually tells you to do:

- Make the important control the biggest one. Size is the cheaper lever, because distance is
  constrained by layout.
- Put destructive and primary actions far apart. Adjacency plus similar size is how people delete
  the wrong thing.
- Screen edges and corners are effectively infinite in one direction, which is why the bottom bar on
  a phone and the menu bar on a Mac work well.
- Expand the hit area beyond the visible box. A 16 px icon can carry a 44 px target. WCAG's target
  size rule measures the clickable area, not the drawing.

## Hick's law

Hick (1952) and Hyman (1953): decision time rises with the logarithm of the number of choices. Card,
Moran, and Newell brought both laws into interface design in 1983.

The practical form: cutting a menu from 20 items to 10 helps much less than people expect, because
the relationship is logarithmic, not linear. What helps more is grouping, so that the user makes two
easy decisions instead of one hard one, and defaults, so that most users make no decision at all.

Do not use Hick's law as an argument for hiding things. Recognition beats recall (heuristic 6), so a
long visible list often beats a short list plus a memory task.

## Cognitive load, and the number that gets misquoted

"Seven plus or minus two" comes from George Miller's 1956 paper on short-term memory for unrelated
items. It is not a limit on menu items, navigation links, or form fields, and citing it that way is
a common error. Modern practice relies on three sturdier ideas:

- **Chunking.** Group related things so the user holds one thing instead of five. A card number in
  four groups of four is easier than sixteen digits.
- **Progressive disclosure.** Show the common path first, put the rest one deliberate step away.
  This is different from hiding: the entry point must be visible and named.
- **External memory.** Keep state on screen. Wizards that lose earlier answers force recall; WCAG
  2.2's "redundant entry" rule (3.3.7) now makes the worst version of this a failure.

## Consistency, and when to break it

Two kinds:

- **External consistency** with the platform. Users arrive with expectations about where the back
  button is, what a switch means, and how a date picker behaves. Breaking this costs you every time.
- **Internal consistency** inside your product. This is what a design system buys.

Break consistency only when the new pattern is measurably better and you can change every instance.
A half-migrated pattern is worse than either version, because the user now has two models.

## Recognition of state: the four states every component needs

Most component bugs are missing states rather than wrong pixels. Specify all four for anything that
loads data:

1. **Empty:** never shipped a blank box. Say what goes here and how to add the first one.
2. **Loading:** show the shape of what is coming when you know it, a spinner when you do not.
3. **Error:** what failed, whether it is retryable, and the retry control in the same place.
4. **Partial or stale:** data arrived but is incomplete or old. Say so, with a timestamp.

For AI features, add a fifth: **uncertain**, where the system produced something but is not
confident. See [09](09-ai-native-ux.md).

## The aesthetic-usability effect, stated honestly

People rate attractive interfaces as easier to use, and they forgive small problems in them. That is
a real and replicated finding. Two consequences that are usually skipped:

- It biases your usability tests. Participants under-report problems in polished prototypes, so run
  the important tests on something rough, or watch behaviour rather than trusting ratings.
- It does not make an attractive interface usable. Google's own research on its 2025 design update
  found the largest usability gains came from using colour, shape, and size to mark what matters, not
  from decoration for its own sake: participants spotted key buttons up to four times faster.

## What "modern" adds to this list

The classic laws say nothing about four things that now matter every day:

- **The interface has no fixed size.** Design for a range, not three breakpoints. See
  [03](03-layout-and-responsive.md).
- **The user has declared preferences.** Colour scheme, motion, contrast, and text size arrive with
  the request. Ignoring them is a defect. See [04](04-color-typography-and-theming.md).
- **The interface is legally regulated.** Both accessibility and manipulation now carry
  enforcement. See [06](06-accessibility-and-law.md), [10](10-anti-patterns-and-regulation.md).
- **Part of the interface is non-deterministic.** A model's output varies run to run, so the design
  must carry uncertainty, provenance, and correction. See [09](09-ai-native-ux.md).
