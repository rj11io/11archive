# Anatomy of an Intelligence Report

## Scope

There is no universal intelligence-report template. A raw information report, a
current-intelligence bulletin, a strategic assessment, and a national estimate
have different purposes and structures.

This document describes a canonical **finished analytic report**. Declassified
National Intelligence Estimates commonly use the core sequence **Scope Note,
Key Judgments, Discussion, and Annexes**. See this [declassified CIA National
Intelligence Estimate][nie-example].

## Canonical structure

```text
CLASSIFICATION AND HANDLING MARKINGS

REPORT IDENTIFIER
Title
Product type
Producing organization
Publication date
Information cutoff date
Audience and distribution

SCOPE NOTE
INTELLIGENCE QUESTION
EXECUTIVE SUMMARY OR BOTTOM LINE
KEY JUDGMENTS

1. CONTEXT AND BACKGROUND
2. CURRENT SITUATION
3. ANALYSIS OR DISCUSSION
4. OUTLOOK AND SCENARIOS
5. IMPLICATIONS
6. INDICATORS AND WARNING
7. INTELLIGENCE GAPS

ANALYTIC CONFIDENCE
ALTERNATIVE ANALYSIS AND DISSENT
SOURCE SUMMARY
METHODOLOGY
REFERENCES

ANNEXES
Maps, charts, timelines, glossary, and supporting data
```

## 1. Administrative and security layer

| Component | Definition and purpose |
| --- | --- |
| **Classification marking** | States the security classification of the whole product and, when required, each portion. |
| **Control marking** | Specifies restrictions on access, release, reproduction, or further dissemination. |
| **Handling instruction** | Gives operational directions for storing, transmitting, sharing, or destroying the product. |
| **Report identifier** | Unique identifier supporting retrieval, citation, audit, and version control. |
| **Title** | Identifies the subject and ideally conveys the principal analytic message. |
| **Product type** | Identifies the document as an assessment, estimate, warning, bulletin, information report, or other recognized product. |
| **Producing organization** | Names the organization accountable for the product. |
| **Publication date** | Date the product was issued. |
| **Information cutoff date** | Latest date through which information was considered. Later developments are outside the assessment. |
| **Version or status** | Identifies draft, coordinated, final, revised, corrected, or superseded status. |
| **Audience or customer** | Identifies the intended decision-maker or authorized readership. |
| **Distribution statement** | Records authorized recipients or dissemination channels. |
| **Author or contact** | Enables clarification, correction, feedback, and specialist follow-up. |

## 2. Executive layer

### Scope note

Defines precisely what the report covers and does not cover. It should state:

- Subject and geographic scope.
- Time period.
- Intelligence questions addressed.
- Important definitions.
- Major assumptions or constraints.
- Matters deliberately excluded.
- Information cutoff date if not stated elsewhere.

The scope note prevents readers from treating the product as an answer to a
question it did not examine.

### Intelligence question

The precise decision-relevant question the report must answer. A useful question
specifies the actor or issue, timeframe, and decision context.

Examples:

- What is Actor X trying to achieve during the next six months?
- How capable is Organization Y of conducting a sustained attack?
- Which conditions could destabilize Government Z?

### Executive summary or bottom line

A short, standalone statement of the answer and its significance. It normally
contains the principal judgment, strongest reason, expected consequence, and
main uncertainty.

### Key judgments

The report's most important analytic conclusions. Each key judgment should:

- Answer the intelligence question.
- Be clear and independently understandable.
- Be distinguishable from fact.
- Include likelihood when relevant.
- Identify important uncertainty or confidence.
- Be supported by the body.
- Explain decision relevance.

A key judgment is not merely a topic summary.

## 3. Main analytic body

### Context and background

Provides only the history, actors, concepts, and baseline conditions needed to
understand the assessment. It should not become a general encyclopedia of the
subject.

### Current situation

Describes relevant present conditions, recent changes, capabilities, actor
relationships, and observable trends. Facts and attributed reporting should be
distinguishable from interpretation.

### Analysis or discussion

Explains how the evidence supports the key judgments:

```text
Evidence -> interpretation -> judgment -> implication
```

The discussion normally examines:

- What is happening.
- Why it is happening.
- Relevant actors and relationships.
- Capabilities and intentions.
- Drivers and constraints.
- Evidence supporting and contradicting the assessment.
- Alternative explanations.

[ODNI ICD 203][icd203] requires analytic products to distinguish underlying
information, assumptions, and judgments.

### Outlook

Assesses the likely direction of developments during a specified period. It
identifies the expected development, conditions affecting the forecast, and
events that could invalidate it.

### Scenarios

Structured descriptions of distinct, plausible, decision-relevant futures.
Common categories include:

- Most likely.
- Plausible alternative.
- High-impact, low-probability.
- Best and worst case when operationally useful.

Scenarios are not exhaustive lists of everything imaginable.

### Implications

Explains why the assessment matters to the customer. Implications may concern
threat, opportunity, operational exposure, strategic effect, vulnerability, or
decision timing. National intelligence generally informs policy without
advocating a preferred policy.

### Indicators and warning

Lists observable developments that would support, weaken, or change the
assessment. Each indicator should state what might be observed, what it would
mean, and which judgment or scenario it affects.

### Intelligence gaps

Identifies consequential unknowns. A useful gap explains what is unknown, why it
matters, which judgment depends on it, and whether collection could resolve it.

## 4. Analytic assurance layer

### Evidence

Observations, reports, data, imagery, documents, signals, or measurements used to
support analysis. Storage in an intelligence system does not by itself make an
item true.

### Source citation

A retrievable reference connecting a statement or judgment to underlying
reporting. [ODNI ICD 206][icd206] requires sufficient sourcing for readers to
assess the quality and scope of the source base while avoiding an exhaustive
source dump.

### Source descriptor

A protected or generalized description of a source, such as "a source with
direct access" or "commercial satellite imagery." It communicates relevant
access and limitations without unnecessarily exposing identity or method.

### Source summary statement

A holistic assessment of the source base, including breadth, access,
corroboration, currency, bias or deception concerns, significant gaps, and the
sources most important to the judgments.

### Source reliability

Assessment of whether a source has historically provided authentic, accurate,
and dependable reporting. It evaluates the source, not the specific claim.

### Information credibility

Assessment of whether a specific item is direct, plausible, corroborated, and
consistent with other knowledge. A reliable source can be wrong. An untested
source can be right.

### Assumptions

Suppositions used to frame or bridge the analysis. A critical assumption should
be explicit, necessary, reasonable, tested where possible, and accompanied by
the consequences of it being wrong.

### Likelihood

The assessed probability that a statement is true or an event will occur.
Organizations should define terms such as "unlikely," "roughly even chance," and
"likely" through a probability yardstick.

### Analytic confidence

The assessed strength and stability of the basis for a judgment. It depends on
evidence quality, access, corroboration, consistency, method, assumptions, and
information gaps.

Likelihood and confidence are different:

- "An attack is likely" describes the event's assessed probability.
- "Confidence is low" describes weakness in the basis for that judgment.

The UK assessment community uses separate probability and confidence frameworks.
See [UK guidance on explaining uncertainty][uk-uncertainty].

### Alternative analysis

A serious examination of another explanation consistent with the evidence. It
states the alternative, supporting evidence, why it is not the principal
assessment, and what would make it more likely.

### Dissent

A documented substantive disagreement among analysts or participating
organizations. It should state the alternative judgment and reasoning, not
merely record that disagreement exists.

### Methodology

Explains data selection, definitions, models, structured analytic techniques,
comparison cases, time horizon, and important methodological limitations.

## 5. Annexes and supporting material

| Component | Purpose |
| --- | --- |
| **Maps** | Show locations, relationships, routes, ranges, or geographic constraints. |
| **Charts and graphs** | Present trends, comparisons, uncertainty, or quantitative evidence. |
| **Chronology** | Establish sequence, timing, and possible causality. |
| **Actor profile** | Summarize an actor's capabilities, intentions, relationships, and vulnerabilities. |
| **Capability table** | Record personnel, equipment, organization, readiness, or disposition. |
| **Glossary** | Define terms whose interpretation affects the analysis. |
| **Probability yardstick** | Define the product's estimative language. |
| **Detailed sourcing** | Provide references that would interrupt the main argument. |
| **Collection requirements** | Convert intelligence gaps into questions for collectors. |
| **Tearline** | Provide a separable, sanitized section suitable for wider distribution. |
| **Coordination record** | Identify participating organizations, concurrence, and dissent. |

[ODNI ICD 208][icd208] encourages tearlines and alternate versions when they
permit wider dissemination without changing facts, judgments, confidence, or
probability language.

## Minimum viable analytic report

```text
TITLE
DATE AND INFORMATION CUTOFF
INTELLIGENCE QUESTION

BOTTOM LINE
One direct answer and why it matters.

KEY JUDGMENTS
1. Judgment with likelihood.
2. Judgment with likelihood.
3. Judgment with likelihood.

ANALYSIS
Evidence and reasoning supporting each judgment.

UNCERTAINTY
Confidence, assumptions, gaps, and plausible alternatives.

OUTLOOK AND INDICATORS
Expected development and what would change the assessment.

SOURCES
Source summary and retrievable references.
```

## Structural quality test

A reader should be able to determine quickly:

1. What question was asked?
2. What is the answer?
3. Why does the analyst believe it?
4. What is fact, reporting, assumption, or judgment?
5. How uncertain is the judgment?
6. What could change the assessment?
7. Why does it matter?

[nie-example]: https://www.cia.gov/readingroom/docs/DOC_0001507657.pdf
[icd203]: https://www.odni.gov/files/documents/ICD/ICD-203.pdf
[icd206]: https://www.odni.gov/files/documents/ICD/ICD-206.pdf
[icd208]: https://www.odni.gov/files/documents/ICD/ICD-208-Maximizing-the-Utility-of-Analytic-Products-2017-01-09.pdf
[uk-uncertainty]: https://www.gov.uk/government/publications/explaining-uncertainty-in-uk-intelligence-assessment/explaining-uncertainty-in-uk-intelligence-assessment

