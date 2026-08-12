# 08. Forms and authentication

Forms are where users pay you, sign up, or leave. They are also the most consistently broken part of the
web: half of the top million home pages have an input with no label, and about a quarter of inputs
across the 2025 crawl had no accessible name at all.

## The label rule, and why placeholders are not labels

Every input needs a visible, persistent label associated with it in markup:

```html
<label for="email">Email address</label>
<input id="email" name="email" type="email" autocomplete="email" inputmode="email">
```

Placeholder text fails as a label for five separate reasons: it disappears when the user starts typing,
so they lose the field's meaning halfway through; it is usually low contrast, so it fails 1.4.3; it gets
mistaken for a filled value, so users skip the field; it cannot hold a hint and a label at once; and
screen reader support for placeholder-as-name is inconsistent. In the July 2025 crawl, 53% of desktop
inputs and 55% of mobile inputs relied on placeholder alone.

Floating labels are a compromise, not a solution. They are acceptable if the label remains visible above
the value at a readable contrast after entry, and if the animation respects reduced motion. They are not
acceptable if they leave the field ambiguous when filled.

## Types, keyboards, and autofill: the three attributes

Three attributes turn a generic text box into a good field. Set all three.

| Attribute | Job | Example |
| --- | --- | --- |
| `type` | Validation and platform behaviour | `type="email"`, `type="tel"`, `type="url"`, `type="date"` |
| `inputmode` | Which on-screen keyboard appears | `inputmode="numeric"` for a card number, `inputmode="decimal"` for a price |
| `autocomplete` | Which stored value the browser or password manager fills | `autocomplete="email"`, `autocomplete="street-address"` |

Why each matters concretely: `type="tel"` gives a phone keypad instead of a full keyboard, which removes
about half the taps. `inputmode="numeric"` gives digits without turning the field into a number spinner,
which is what you want for a card number or a postcode. And correct `autocomplete` tokens let a browser
fill name, email, and phone in one tap, which is the single largest completion-rate improvement available
on mobile.

`autocomplete` also satisfies WCAG rule 1.3.5 Identify Input Purpose (Level AA), which requires
programmatic identification of common field purposes.

The tokens people get wrong most:

| Field | Token |
| --- | --- |
| Existing password on a sign-in form | `current-password` |
| New password on a signup or change form | `new-password` |
| One-time code from SMS or an authenticator | `one-time-code` |
| Full name in one field | `name` |
| Card number | `cc-number` |
| Card expiry as one field | `cc-exp` |

**Do not disable autofill for security.** Turning off `autocomplete` does not stop data being stored, it
just forces manual typing, which increases errors and pushes people toward weaker, memorable passwords.
The safer pattern is correct tokens so managers handle the data properly.

## Structure: fewer fields, better order

- **Ask for less.** Every field is a chance to abandon. If you can derive it (city from a postcode,
  country from a phone prefix) do not ask.
- **One column.** Multi-column form layouts cause users to miss fields and confuse the visual reading
  order, and they break at small widths. Baymard's checkout research flags extensive multicolumn layouts
  as a recurring usability mistake.
- **Group and label sections** for long forms, and use a real `<fieldset>` with a `<legend>` for grouped
  controls such as radio sets.
- **Do not split what people think of as one thing.** A card number is one field with automatic spacing,
  not four boxes. An expiry date is one field or a pair of selects, not a free-text challenge. Baymard
  reports the majority of sites make card expiry entry harder than it needs to be.
- **Explain unusual requests.** A required phone number with no reason is a known abandonment cause.
  One sentence of explanation next to the field fixes it.
- **Never ask twice.** WCAG 2.2 rule 3.3.7 Redundant Entry now makes repeated entry in one process a
  Level A failure. Shipping address already collected? Offer it, do not re-ask.

## Validation that helps

| Rule | Do | Do not |
| --- | --- | --- |
| Timing | Validate on blur, or as the user types once they have plausibly finished. Re-validate on submit | Show an error while they are still typing the first characters |
| Placement | Message directly below the field it concerns | A summary at the top only |
| Content | Say what is wrong and what to do: "Enter a date after 12 August 2026" | "Invalid input" |
| Both channels | Text plus an icon plus colour, and `aria-describedby` linking the message to the field | Colour alone, which fails for colour vision deficiency |
| Programmatic state | `aria-invalid="true"` on the field when it is in error | Only a red border |
| Submit failure | Move focus to the first error, and provide a list of errors at the top with links to each field | Silently scroll, leaving focus where it was |
| Success | Confirm what happened and what comes next | A blank page or a bare "Success" |

Two specific things worth building once and reusing: a required-field convention that does not rely on
colour, and an error summary component that is announced as a live region on submit failure.

## Mobile-specific form failures

- **Inputs must be 16 px or larger.** Below that, mobile Safari zooms the whole page when the field is
  focused, which then leaves the layout scrolled sideways. Setting `maximum-scale=1` to stop the zoom is
  the wrong fix: it blocks pinch zoom entirely and fails WCAG 1.4.4. Roughly one page in five still does
  this.
- **Keep the submit button reachable.** A sticky bar with `env(safe-area-inset-bottom)` padding beats a
  button that lands under the keyboard.
- **Do not clear the form on error.** Losing entered data on a phone is a near-certain abandonment.
- **Use platform pickers.** A native date input, a native select, and the platform's autofill all beat a
  custom equivalent on a phone.

## Authentication in 2026

The rules changed twice: once because of WCAG 2.2, and once because passkeys became mainstream.

**What WCAG 2.2 rule 3.3.8 requires.** No step of authentication may depend on a cognitive function
test, which means remembering a password, transcribing something, solving a puzzle, or recalling
information, unless there is an alternative, or a mechanism to help, or the test is object or personal
content recognition. In practice:

- Copy and paste must work in every authentication field, including one-time-code fields.
- A password manager must be able to fill and submit.
- An image or logic puzzle cannot be the only route through.
- Email links, passkeys, and third-party sign-in all count as compliant alternatives.

**Passkeys.** A passkey replaces a password with a private key held by the device, unlocked by the
device's own biometric or PIN. There is nothing to remember and nothing to phish. Reported adoption as of
May 2026, from FIDO Alliance surveys conducted by Sapio Research in April 2026 across 11,000 consumers
in ten countries:

| Measure | Reported figure |
| --- | --- |
| Passkeys in use worldwide | About 5 billion |
| Consumers aware of passkeys | 90% |
| Consumers who have enabled at least one | 75% |
| Consumers who use them regularly where available | 49% |
| Organisations deployed or actively deploying for employees | 68% |
| Top 100 websites supporting them | About 48% |

These are vendor-sponsored survey figures, so treat the levels as indicative. The comparative claim of
higher login success rates for passkeys against passwords is reported by multiple parties but with no
single published method available here.

**Design guidance for passkeys**, since the pattern is new to most users:

- Offer passkeys alongside the existing method, never as an abrupt replacement.
- Explain in one sentence with no jargon: "Sign in with your face, fingerprint, or screen lock. Nothing
  to remember."
- Handle the device-loss case in the interface, not just the help centre. Always keep a documented
  recovery route.
- Do not call it "passwordless" in user-facing copy. Users do not know what that means.
- Keep the fallback path visible, because passkey support still varies by browser and platform.

## The form checklist

1. Every input has a visible, associated label.
2. `type`, `inputmode`, and `autocomplete` set on every field.
3. One column, grouped sections, no split fields for a single mental unit.
4. Nothing asked twice in one flow.
5. Errors named, placed at the field, announced, and reachable by focus on submit.
6. Inputs at 16 px or larger; pinch zoom not blocked.
7. Paste works everywhere, especially password and code fields.
8. Data preserved through validation errors and back navigation.
9. Card, address, and phone fields tested against real formats from more than one country.
10. Authentication has at least one route that requires no memory test.
