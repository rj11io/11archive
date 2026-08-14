# Methodology and sources

## What this report is based on

Each tool's own documentation, read directly, plus one original measurement comparing
how three data languages parse the same metadata. No claim here rests on a secondary
summary of a tool's behaviour.

Everything was read or run on 2026-08-14.

## Evidence states used

| State | Meaning | Example |
|---|---|---|
| **Observed** | Measured by running code | Every row of the typing table in [02](02-what-the-parser-does.md) |
| **Source-reported** | Stated by the tool's documentation | Delimiters, format support |
| **Inferred** | Reasoned from evidence, labelled where used | Why YAML won on availability |
| **Unavailable** | Could not be established | Listed below |

## The typing measurement

The table in [02](02-what-the-parser-does.md) was produced by parsing the same eleven
pieces of metadata in each language and recording the Python type that came back.

**Versions:** Python 3.13.5, PyYAML 6.0.3, `tomllib` from the Python standard library,
`json` from the standard library.

PyYAML implements YAML 1.1, which is what most Markdown toolchains use in Python. A
YAML 1.2 library returns different answers for several rows, notably the boolean and
octal cases. That difference is itself part of the argument in
[04](04-tool-support-and-choosing.md) for naming a version.

The core of the script:

```python
import json, tomllib, yaml

CASES = [
    ('country: NO',             'country = "NO"',            '{"country": "NO"}'),
    ('zip: 02134',              'zip = "02134"',             '{"zip": "02134"}'),
    ('duration: 22:53',         'duration = "22:53"',        '{"duration": "22:53"}'),
    ('version: 1.10',           'version = "1.10"',          '{"version": "1.10"}'),
    ('at: 2026-05-28T14:30:00Z','at = 2026-05-28T14:30:00Z', '{"at": "2026-05-28T14:30:00Z"}'),
]

for y, t, j in CASES:
    print(y,
          repr(next(iter(yaml.safe_load(y).values()))),
          repr(next(iter(tomllib.loads(t).values()))),
          repr(next(iter(json.loads(j).values()))))
```

Selected output:

```
country: NO                False        'NO'         'NO'
zip: 02134                 1116         '02134'      '02134'
duration: 22:53            1373         '22:53'      '22:53'
version: 1.10              1.1          '1.10'       '1.10'
at: 2026-05-28T14:30:00Z   datetime     datetime     '2026-05-28T14:30:00Z'
```

### How to read the columns

The YAML column shows what you get from the natural, unquoted way of writing the value.
The TOML and JSON columns show the value after writing it correctly in that language.

This is not a rigged comparison. It is the point: TOML and JSON do not offer an
ambiguous form, so "writing it correctly" and "writing it naturally" are the same act.
YAML offers both and they differ.

### The rejection tests

Parse-time behaviour was tested separately by feeding each language input that YAML
accepts:

```python
tomllib.loads('tags = a, b, c')   # TOMLDecodeError
tomllib.loads('country = NO')     # TOMLDecodeError
tomllib.loads('draft = yes')      # TOMLDecodeError
tomllib.loads('type = "A"\ntype = "B"')  # TOMLDecodeError, duplicate key
```

Compared with:

```python
yaml.safe_load('type: A\ntype: B')       # {'type': 'B'}, silent
json.loads('{"type":"A","type":"B"}')    # {'type': 'B'}, silent
```

## Cross-format parity

The HTML report and the Markdown files render from the same text. The HTML adds
navigation and table interaction. It adds no facts.

## Limitations

- **Python parsers only.** A JavaScript reader using `js-yaml`, which implements YAML
  1.2, returns different values for the boolean and octal rows. The direction of the
  argument does not change; the specific results do.
- **One version of each library.** A different PyYAML or a YAML 1.2 loader gives
  different answers, which is the report's point rather than an oversight, but it means
  the table describes these versions.
- **Documentation, not behaviour, for tool support.** The matrix in
  [04](04-tool-support-and-choosing.md) reflects what each tool documents. None of the
  eleven tools was installed and exercised.
- **Not an exhaustive survey.** These are the conventions in common use. Individual
  projects invent their own, and this report does not attempt to catalogue those.
- **No adoption numbers.** No reliable count exists of how many projects use each
  format, and none is asserted here.

## What could not be established

| Question | Status |
|---|---|
| Any formal standard for Markdown frontmatter | **None exists.** No RFC, no W3C note. Every tool implements its own reader |
| A registered media type for a frontmatter document | Not found |
| Reliable usage share per format | Not found. Every figure located was a vendor claim |

## Sources

All read 2026-08-14.

| Source | Used for |
|---|---|
| [Jekyll front matter](https://jekyllrb.com/docs/front-matter/) | YAML only, must be first in file |
| [Hugo front matter](https://gohugo.io/content-management/front-matter/) | YAML, TOML, JSON delimiters |
| [Zola pages](https://www.getzola.org/documentation/content/page/) | TOML preferred, YAML for legacy |
| [Eleventy front matter](https://www.11ty.dev/docs/data-frontmatter/) | `---json` and `---js` syntax |
| [gray-matter](https://github.com/jonschlinkert/gray-matter) | Language detection after the fence, custom engines |
| [Docusaurus markdown features](https://docusaurus.io/docs/markdown-features) | YAML only |
| [Obsidian properties](https://obsidian.md/help/properties) | YAML, JSON input saved as YAML |
| [Quarto front matter](https://quarto.org/docs/authoring/front-matter.html) | YAML |
| [Pandoc manual](https://pandoc.org/MANUAL.html#extension-yaml_metadata_block) | `...` terminator, block position |
| [MultiMarkdown metadata](https://fletcher.github.io/MultiMarkdown-6/syntax/metadata.html) | Unfenced key-value block rules |
| [Python-Markdown Meta-Data](https://python-markdown.github.io/extensions/meta_data/) | Values as lists of strings |
| [Astro components](https://docs.astro.build/en/basics/astro-components/) | The component script quote |
| [YAML 1.2.2](https://yaml.org/spec/1.2.2/), [YAML 1.1](https://yaml.org/spec/1.1/) | Version differences |
| [TOML](https://toml.io/) | Type rules |

## Related

The YAML-specific failure modes summarised here are covered in depth, with a conformance
audit of a real specification that depends on them, in the companion report
[Google's Open Knowledge Format: A Working Reference](https://01kzxzhgv0h542j4y6jhdzt8kk.reports.rj11.io).
