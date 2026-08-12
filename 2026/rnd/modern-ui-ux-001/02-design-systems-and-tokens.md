# 02. Design systems and tokens

A design system is three things stacked: named decisions (tokens), reusable parts (components), and
the rules for using them (documentation). Most failed design systems failed at the third layer, not
the first.

## Design tokens, and the spec that finally landed

A **design token** is a named design decision stored as data. `color.action.background` holds a
specific green; every button reads the name, not the green. Change the name's value once and every
button changes.

The Design Tokens Community Group, a W3C community group of designers, developers, and tool makers,
published the first stable version of its format on 28 October 2025 (version 2025.10). Before that,
every design tool and every code pipeline invented its own JSON shape, so moving tokens between
Figma and a codebase needed a custom converter.

What the format specifies:

| Part | Detail |
| --- | --- |
| File | JSON, with the extension `.tokens` or `.tokens.json`, media type `application/design-tokens+json` |
| Required | `$value`, plus `$type` either on the token or inherited from its group |
| Optional | `$description` (plain text), `$extensions` (vendor metadata, reverse-domain keys), `$deprecated` |
| Simple types | `color`, `dimension`, `fontFamily`, `fontWeight`, `duration`, `cubicBezier`, `number` |
| Composite types | `strokeStyle`, `border`, `transition`, `shadow`, `gradient`, `typography` |
| Grouping | Any JSON object without `$value` is a group; groups carry a default `$type` for children |
| References | `{group.token}` resolves to another token's whole value; a JSON Pointer such as `#/path/to/$value` reaches inside a composite value |
| Errors | Circular references must be detected and reported |
| Inheritance | `$extends` lets one group inherit another, with local tokens overriding by deep merge |

Colour is expressed as an object with a colour space and components, not only a hex string, which is
what makes wide-gamut and perceptual colour spaces expressible. See
[04](04-color-typography-and-theming.md) for why that matters.

The spec deliberately takes no position on how you theme. It standardises the container, not the
strategy.

**One caution.** The drafts site also carries a later, explicitly-marked preview draft dated
2026-07-30 that says not to implement or cite it as authoritative. Build against the stable 2025.10
version and treat anything newer as provisional.

## The three token layers

The stable structure that most mature systems converge on. Each layer only ever references the one
below it.

| Layer | Also called | Example name | Example value | Who may use it |
| --- | --- | --- | --- | --- |
| 1. Primitive | reference, global | `green.600` | `oklch(0.508 0.118 165.6)` | Nobody outside the system |
| 2. Semantic | system, alias | `color.action.background` | `{green.600}` | Component authors |
| 3. Component | scoped | `button.primary.background` | `{color.action.background}` | That component only |

Why the middle layer exists: it is the only place a theme can intervene. Dark mode, a high-contrast
mode, and a second brand are all just different bindings of layer 2 to layer 1. If components read
primitives directly, every theme becomes a search-and-replace.

Rule of thumb: if a token's name says what it looks like (`grey.200`) it is a primitive; if it says
what it is for (`border.subtle`) it is semantic. Only semantic names belong in component code.

## Naming that survives contact with a second brand

- Name by role, not appearance. `color.danger.text`, not `color.red.dark`.
- Keep one axis per level: category, role, variant, state. For example
  `color.action.background.hover`.
- Never encode the platform or the tool in the name. `color.ios.button` will outlive the reason it
  existed.
- Reserve a state vocabulary and reuse it exactly: `default`, `hover`, `active`, `focus`,
  `disabled`, `selected`. Half the drift in real systems is `pressed` versus `active`.
- Numbers should mean something monotone. `space.4` is fine if 4 is a step on a scale; `space.md` is
  fine if the scale is short. Mixing both in one system is the problem.

## Spacing, size, and radius scales

Pick one base unit and multiply. A 4 px base with a partly-geometric scale is the common choice:
4, 8, 12, 16, 24, 32, 48, 64. The reason to skip 20, 28, and 36 is discipline rather than maths: a
short scale forces consistent rhythm, and a dense scale becomes a free-for-all.

Two modern notes:

- Express spacing in `rem` so it scales with the user's text size. A layout built in pixels ignores a
  user who set their browser font to 20 px.
- Type scales should be fluid rather than stepped. `clamp()` sets a minimum, a preferred value that
  can depend on viewport width, and a maximum, in one declaration. See
  [04](04-color-typography-and-theming.md).

## Components: the ownership question

The industry moved decisively from "install a styled library" to "own the component code." The
vocabulary:

- **Styled library:** ships behaviour and appearance. Fast to start, hard to rebrand.
- **Headless or unstyled primitives:** ship behaviour, keyboard handling, focus management, and
  accessibility semantics with no visual opinion. You style them.
- **Copy-in registry:** the component source is copied into your repository. You own and edit it.
  There is no version to upgrade, and no vendor to wait for.

The reference points, verified on 2026-08-11:

| Project | What it is | Status |
| --- | --- | --- |
| shadcn/ui | Copy-in registry of components built on unstyled primitives plus utility CSS. Describes itself as a code distribution platform, and tells you to use it to build your own library | 121.1k stars on GitHub |
| Radix Primitives | Unstyled accessible primitives; the behaviour layer under many registries | Maintained by WorkOS, which acquired the original team in 2022 |
| Base UI | Unstyled primitives from the MUI team, positioned as the actively developed alternative | v1.0.0 released December 2025 |

The trade-off, stated plainly. Copy-in ownership removes the upgrade treadmill and the rebranding
fight, and it transfers every future accessibility fix to you. Unstyled primitives exist precisely
because keyboard handling, focus trapping, and screen-reader semantics for a combobox are much harder
than they look. Do not write those yourself unless that is your product.

**What changed the calculus in 2025 and 2026:** the browsers started shipping the hard parts.
Dialogs with light dismissal, popovers with correct top-layer stacking, hint popovers for tooltips,
tooltip-and-preview triggers on hover and focus, stylable `<select>`, and carousel controls generated
by the browser are all now platform features. Before you adopt a primitive, check whether the element
exists. See [05](05-interaction-and-motion.md).

## Documentation is the load-bearing part

A component nobody can find gets rebuilt. The minimum that works:

- **One page per component** with: what it is for, what it is not for, an interactive example, the
  props or attributes, the keyboard behaviour, and the accessibility notes.
- **Decision records.** Why the switch has no intermediate state, why the modal cannot be dismissed
  by clicking outside during payment. Without these, every decision is relitigated annually.
- **A contribution path.** If the only way to get a component changed is to file a ticket with a
  central team, product teams will fork instead. Every fork is a future inconsistency.
- **A deprecation policy with dates.** The token format has a `$deprecated` field for exactly this.

## Measuring whether the system works

Adoption, not satisfaction. Useful numbers:

| Metric | How to get it | What good looks like |
| --- | --- | --- |
| Token coverage | Share of colour and spacing declarations in product code that reference a token | Rising each quarter; 90%+ in mature systems |
| Component coverage | Share of interactive elements rendered by system components | Rising; watch for a plateau caused by one missing component |
| Hard-coded colour count | Lint rule counting literal colours outside the token files | Trending to zero |
| Fork count | Copies of a system component edited in product code | Each one is a feature request in disguise |
| Time to first screen | How long a new engineer takes to build a compliant screen | Falling |

Do not measure the system by how many components it has. A large catalogue that nobody uses is a
maintenance liability, and building components nobody asked for is the most common way design system
teams waste a year.
