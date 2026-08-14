# What the parser does to your values

Original measurement for this report. The same eleven pieces of metadata, written the
natural way in each language, parsed once each. YAML through PyYAML, which implements
YAML 1.1 and is what most Markdown toolchains reach for. TOML through Python's built-in
`tomllib`. JSON through `json`.

Read the YAML column as "what you get if you type the obvious thing".

## The measurement

| YAML source | YAML 1.1 result | TOML result | JSON result |
|---|---|---|---|
| `country: NO` | `False` (bool) | `'NO'` (str) | `'NO'` (str) |
| `draft: no` | `False` (bool) | `False` (bool) | `False` (bool) |
| `archived: off` | `False` (bool) | `False` (bool) | `False` (bool) |
| `zip: 02134` | `1116` (int) | `'02134'` (str) | `'02134'` (str) |
| `build: 010` | `8` (int) | `'010'` (str) | `'010'` (str) |
| `duration: 22:53` | `1373` (int) | `'22:53'` (str) | `'22:53'` (str) |
| `version: 1.10` | `1.1` (float) | `'1.10'` (str) | `'1.10'` (str) |
| `stale_after: 2026-09-23` | `date(2026, 9, 23)` | `date(2026, 9, 23)` | `'2026-09-23'` (str) |
| `at: 2026-05-28T14:30:00Z` | `datetime` | `datetime` | `'2026-05-28T14:30:00Z'` (str) |
| `tags: [a, b, c]` | `['a','b','c']` (list) | `['a','b','c']` (list) | `['a','b','c']` (list) |
| `tags: a, b, c` | `'a, b, c'` (str) | rejected | `'a, b, c'` (str) |

One clarification, because the table is easy to misread. The TOML and JSON columns show
the value after writing the metadata correctly in that language, for example
`country = "NO"`. The YAML column shows what happens when you write it the way the
language invites you to. That asymmetry is the finding, not a trick: YAML lets you write
`NO` and quietly means something else, and TOML does not offer you the ambiguous form at
all.

## Ten of eleven YAML values are not what you typed

Every row where YAML returns something other than the literal text:

| Case | You wrote | YAML gave you |
|---|---|---|
| Country code | `NO` | `False` |
| Draft flag | `no` | `False` |
| Archived flag | `off` | `False` |
| Zip code | `02134` | `1116` |
| Build number | `010` | `8` |
| Time of day | `22:53` | `1373` |
| Version | `1.10` | `1.1` |
| Date | `2026-09-23` | a `date` object |
| Timestamp | `2026-05-28T14:30:00Z` | a `datetime` object |
| Tag list | `[a, b, c]` | a list |

The last three are wanted. The first seven are the reason this report exists.

`02134` becoming `1116` deserves a second look: YAML 1.1 reads the leading zero as
"base 8", so a Boston postcode silently becomes a different number. `22:53` becoming
`1373` is base 60, which is 22 times 60 plus 53.

## TOML fails loudly where YAML fails quietly

This is the real difference between the two, and it is bigger than the typing rules.

| Input | YAML 1.1 | TOML |
|---|---|---|
| `tags = a, b, c` | accepted as one string | **rejected at parse time** |
| `country = NO` | accepted as `False` | **rejected at parse time** |
| `draft = yes` | accepted as `True` | **rejected at parse time** |

TOML has no bare-word scalars, so an unquoted `NO` is not a value at all. You get a
parse error pointing at the line. YAML gives you a boolean and moves on.

The same holds for a mistake that is easy to make in a file an agent has edited several
times:

| Duplicate keys | Behaviour |
|---|---|
| YAML | `{'type': 'B'}`, last one wins, silently |
| JSON | `{'type': 'B'}`, last one wins, silently |
| TOML | **rejected**, duplicate key is an error |

## Where each language actually hurts

**YAML** guesses. That is its entire design and its entire problem. It is also the only
one of the three with a serious readability advantage for hand-edited metadata, which is
why it won.

**JSON** has no comments. Not "discouraged": there is no syntax for them, and a parser
rejects the attempt. For metadata a human maintains, losing the ability to write "left
blank on purpose, see ticket 412" is a real cost. JSON also cannot express a date; every
date is a string you parse yourself, which is either honest or annoying depending on your
mood.

**TOML** is more verbose, requires quotes, and its nested-table syntax gets awkward
quickly. For the flat key-value shape that frontmatter almost always is, none of that
matters much.

## The unfenced conventions dodge the problem entirely

MultiMarkdown metadata and the Python-Markdown Meta-Data extension do no type inference
at all. Every value is text, and Python-Markdown goes further: every value is a **list**
of strings, one per line.

```
Title:   My Document
Authors: Waylan Limberg
         John Doe
```

gives `{'title': ['My Document'], 'authors': ['Waylan Limberg', 'John Doe']}`.

Nothing can become `False`. Nothing can become octal. You do all conversion yourself,
which is more work and zero surprises. For metadata that is mostly titles, authors, and
tags, that trade is better than it sounds.

## What this means in practice

Three conclusions the measurement supports.

1. **If you control the format choice and your metadata is machine-consumed, TOML is
   the safer default.** Every failure mode in the table above becomes a parse error
   instead of a wrong value.
2. **If you are stuck with YAML, quoting is the whole discipline.** Every one of the
   seven bad rows is fixed by wrapping the value in quotes. There is no second technique.
3. **A format that only ever hands you strings is not primitive, it is honest.** It
   moves the conversion to code you can see and test.

## Reproducing this

Full script in [05-methodology-and-sources.md](05-methodology-and-sources.md). The core
is three lines:

```python
import json, tomllib, yaml
yaml.safe_load("country: NO")     # {'country': False}
tomllib.loads('country = "NO"')   # {'country': 'NO'}
json.loads('{"country": "NO"}')   # {'country': 'NO'}
```

Versions: Python 3.13.5, PyYAML 6.0.3, `tomllib` from the standard library.
