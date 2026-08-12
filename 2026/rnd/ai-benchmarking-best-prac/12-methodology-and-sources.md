# Methodology and sources

## What this report is, and how it was made

**Objective.** Explain what an AI benchmark can and cannot tell you, and set out the practices that
make a score trustworthy.

**Method.** Desk research on 2026-08-11. Public papers, benchmark documentation, standards text,
regulator text, and vendor methodology pages were searched, fetched, and read. Every material claim
was traced to a named source. Where a source could not be read directly, the claim is marked below
and should be treated as reported by that source rather than confirmed by this report.

**No new measurements.** Nothing here was benchmarked. The arithmetic in
[03-statistics-and-uncertainty.md](03-statistics-and-uncertainty.md) is recomputed from the formulas
in the cited work, using the inputs shown, so a reader can check every number with a calculator.

## Evidence states used

The report distinguishes how each claim is known. This matters most in
[02-benchmark-catalog.md](02-benchmark-catalog.md), where item counts vary in reliability.

| State | Meaning | How it appears |
| --- | --- | --- |
| source-reported | Stated by a named source; not independently checked | The default for benchmark item counts and vendor methodology |
| calculated | Recomputed here from a disclosed formula and stated inputs | The worked examples in section 03 |
| not verified (`n/v`) | Expected but not confirmed against a source read for this report | Written as `n/v`, never as zero or a guess |
| inferred | Reasoned from the sources rather than stated by any one of them | Flagged in the text with wording such as "the mechanism generalises" |

## Counts this report could not verify

These appear as `n/v` in the catalog, or carry an explicit `(n/v)` marker. Do not quote them from
here. Check the benchmark's own documentation.

| Item | What is unverified |
| --- | --- |
| Terminal-Bench version 2 | The "about 89 core tasks" figure comes from a secondary summary |
| Cybench | The "40 capture-the-flag tasks" figure comes from a secondary summary |
| WebArena | The "812 tasks" figure comes from a secondary summary |
| τ-bench | The "165 tasks" split across retail and airline comes from a secondary summary |
| CORE-bench | The "270 tasks from 90 papers" figure comes from a secondary summary |
| LiveCodeBench | The "1,055 problems" figure is a snapshot from a secondary summary of a growing set |
| MuSR, ARC-AGI-2, τ²-bench, KernelBench, SciCode, CVE-Bench, AgentHarm, Mock AIME | No item count read |
| ARC-AGI-2 release year | Widely reported as 2025; no primary source read |
| "Why we no longer evaluate SWE-bench Verified" | Publication date not read |

## Claims that rest on a secondary reading

Every numeric or quotable claim below comes from a search-result synthesis of the named source
rather than a direct read of it. They are reported faithfully and were consistent across the results
seen, but a reader relying on one of them for a decision should open the primary link in the source
table. The `Depth` column of the source tables marks every source read only at this depth, including
ones whose claims are qualitative and therefore not listed here.

| Claim as used | Source to check |
| --- | --- |
| A strong model judge agreed with human raters more than 80% of the time, about the human-human rate of 81% | Zheng et al. 2023 |
| Prompt formatting moved accuracy by up to 76 points on one open model | Sclar et al. 2024 |
| MMLU error rate of 6.49%, with 57% of analysed virology questions affected, from 5,700 re-annotated questions | Gema et al. 2024 |
| SWE-bench Verified: 500 tasks selected from 1,699 reviewed, and frontier models reproducing the reference fix | OpenAI, Introducing SWE-bench Verified |
| HELM: 42 scenarios, 7 metrics on 16 core scenarios, coverage raised from 17.9% to 96.0% | Liang et al. 2022 |
| Codex pass@k sampling: n = 200 for k up to 100 | Chen et al. 2021 |
| τ-bench: under 50% first-attempt success and under 25% across eight attempts for a leading model of the time | Yao et al. 2024 |
| HAL: 21,730 rollouts, 9 models, 9 benchmarks, about $40,000, 2.5B tokens of logs | HAL 2025 |
| Kapoor et al.: simple baselines matching complex architectures on HumanEval at lower cost | Kapoor et al. 2024 |
| Open LLM Leaderboard: the two suites, the normalisation rule, and the retirement rationale | Hugging Face leaderboard documentation |
| EU AI Act Article 55(1) wording on model evaluation and adversarial testing; Code of Practice published 10 July 2025; obligations applied from 2 August 2025 | Article 55 text |
| NIST AI 600-1 publication date of 26 July 2024 and its risk-category list | NIST AI RMF pages |
| ISO/IEC TS 4213 scope, page count, and 2025 confirmation; ISO/IEC 42001 publication date | ISO catalogue entries |
| MLPerf division rules and the up-to-two-audited-submissions policy | MLCommons policies |
| Evaluation awareness in versions of Claude, and the later model's situational awareness | Apollo Research; developer system card reporting |
| The shared structure of frontier safety policies | METR, Common Elements |
| GDPval: 1,320 tasks, 44 occupations, 9 industries, blinded pairwise expert grading, authors averaging about 14 years of experience | OpenAI, GDPval |

## Verification performed on this report

| Check | Result |
| --- | --- |
| Statistical worked examples recomputed independently | Standard error example, the 969-question power calculation, the 6.3-point minimum detectable effect, both pass@k examples, and the chance-normalisation example all reproduce |
| arXiv identifiers, titles, first authors, and dates | Confirmed through the arXiv API for 23 papers; the remainder confirmed from search listings that displayed the identifier next to the title |
| Cross-format parity | `report.html` is generated from these Markdown files. `verify.mjs` extracts every heading and every table cell from both and compares them in order: 123 headings and 2,383 cells match |
| Machine-readable mirror | `data.json` is parsed out of the Markdown tables rather than typed by hand, so it cannot drift. Its counts are checked back against the tables, and the counts quoted in the README prose are checked against `data.json` |
| Determinism | The generator was run twice on unchanged input; `report.html` and `data.json` are byte-identical apart from the generation timestamp |
| Browser pass | Loaded in a real browser. Confirmed: dark by default with zero marked rows; sorting a table descending then ascending reorders rows and tracks `aria-sort`; two marked rows survive two sorts; the marks counter appears and clears; the theme toggle switches both ways and updates its label and pressed state; dragging a column freezes the layout with an explicit width on every column and a frozen table width; all four diagrams fit inside their view boxes with their colours resolving from the design tokens; the page body never scrolls sideways |
| Not checked by eye | The light theme and the print layout were verified from computed styles and the stylesheet, not from a screenshot: the preview pane in use would not produce further screenshots after the first load |
| Privacy scan | No credential-shaped values, personal data, or local absolute paths appear in any published artifact |
| Link check | Every external link in `report.html` traces back to a Markdown source, and every internal anchor resolves to an existing element |

## Limitations

- **No independent measurement.** This report describes practice. It did not run any benchmark, so
  every quantitative claim about a model or a benchmark is source-reported.
- **A moving target.** Benchmark composition, leaderboard rules, index weights, and model scores
  change monthly. Version numbers and dates are given so a reader can tell how stale a statement is.
  Treat anything version-specific, such as the index composition in
  [02-benchmark-catalog.md](02-benchmark-catalog.md), as a snapshot of 2026-08-11.
- **Coverage skews to language and agent models.** Vision, speech, robotics, recommendation, and
  scientific-model benchmarking are out of scope apart from general principles that transfer.
- **Coverage skews to English-language work.** Multilingual and non-English benchmarking practice is
  named but not surveyed.
- **Not legal advice.** The regulatory section summarises text and links to it. Obligations depend on
  facts this report does not know.
- **Secondary readings.** The table above lists every claim taken from a search-result synthesis
  rather than a direct read. That is 17 claims out of roughly 200 material ones.
- **One perspective on quality.** The report leans on a small number of methodology papers, in
  particular the statistical treatment in Miller 2024 and the agent-benchmark audit in Zhu et al.
  2025. Both are well argued, and neither is the last word.

## Sources

Depth values: `full text` means the whole document was read; `read` means the page or a substantial
part of the document was fetched and read; `metadata verified` means the identifier, title, authors,
and date were confirmed but the contents were not read for this report; `secondary` means the claim
came from a synthesis of search results about that source.

### Evaluation methodology and critique

| ID | Source | Author or org | Date | Link | Depth |
| --- | --- | --- | --- | --- | --- |
| S01 | Adding Error Bars to Evals: A Statistical Approach to Language Model Evaluations | Evan Miller, Anthropic | 2024-11-04 | [arXiv:2411.00640](https://arxiv.org/abs/2411.00640) | full text |
| S02 | AI and the Everything in the Whole Wide World Benchmark | Raji et al. | 2021 | [arXiv:2111.15366](https://arxiv.org/abs/2111.15366) | secondary |
| S03 | The Benchmark Lottery | Dehghani et al. | 2021-07 | [arXiv:2107.07002](https://arxiv.org/abs/2107.07002) | secondary |
| S04 | BetterBench: Assessing AI Benchmarks, Uncovering Issues, and Establishing Best Practices | Reuel et al., Stanford | 2024-11 | [arXiv:2411.12990](https://arxiv.org/abs/2411.12990) | read |
| S05 | Establishing Best Practices for Building Rigorous Agentic Benchmarks | Zhu et al. | 2025-07 | [arXiv:2507.02825](https://arxiv.org/abs/2507.02825) | read |
| S06 | AI Agents That Matter | Kapoor et al., Princeton | 2024-07 | [arXiv:2407.01502](https://arxiv.org/abs/2407.01502) | secondary |
| S07 | Holistic Agent Leaderboard: The Missing Infrastructure for AI Agent Evaluation | Princeton | 2025-10 | [arXiv:2510.11977](https://arxiv.org/abs/2510.11977) | secondary |
| S08 | Lessons from the Trenches on Reproducible Evaluation of Language Models | Biderman et al., EleutherAI | 2024-05 | [arXiv:2405.14782](https://arxiv.org/abs/2405.14782) | read |
| S09 | Quantifying Language Models' Sensitivity to Spurious Features in Prompt Design | Sclar et al., ICLR 2024 | 2023-10 | [arXiv:2310.11324](https://arxiv.org/abs/2310.11324) | secondary |
| S10 | Are We Done with MMLU? | Gema et al., NAACL 2025 | 2024-06 | [arXiv:2406.04127](https://arxiv.org/abs/2406.04127) | secondary |
| S11 | Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena | Lianmin Zheng et al. | 2023-06-09 | [arXiv:2306.05685](https://arxiv.org/abs/2306.05685) | metadata verified |
| S12 | Justice or Prejudice? Quantifying Biases in LLM-as-a-Judge (CALM) | Jiayi Ye et al., ICLR 2025 | 2024-10 | [arXiv:2410.02736](https://arxiv.org/abs/2410.02736) | read |
| S13 | Investigating Non-Transitivity in LLM-as-a-Judge | 2025 | 2025-02 | [arXiv:2502.14074](https://arxiv.org/abs/2502.14074) | metadata verified |
| S14 | Chatbot Arena: An Open Platform for Evaluating LLMs by Human Preference | Chiang et al. | 2024-03 | [arXiv:2403.04132](https://arxiv.org/abs/2403.04132) | metadata verified |
| S15 | The Leaderboard Illusion | Shivalika Singh et al., Cohere Labs and others | 2025-04 | [arXiv:2504.20879](https://arxiv.org/abs/2504.20879) | secondary |
| S16 | Response to "The Leaderboard Illusion" | LMArena | 2025 | [news.lmarena.ai](https://news.lmarena.ai/our-response/) | secondary |
| S17 | Holistic Evaluation of Language Models (HELM) | Liang et al., Stanford | 2022-11 | [arXiv:2211.09110](https://arxiv.org/abs/2211.09110) | secondary |
| S18 | Model Cards for Model Reporting | Mitchell et al. | 2019-01 | [arXiv:1810.03993](https://arxiv.org/abs/1810.03993) | metadata verified |
| S19 | A Safe Harbor for AI Evaluation and Red Teaming | Longpre et al. | 2024-03-05 | [arXiv:2403.04893](https://arxiv.org/abs/2403.04893) | secondary |
| S20 | A Comprehensive Survey of Contamination Detection Methods in Large Language Models | 2024 | 2024-04 | [arXiv:2404.00699](https://arxiv.org/abs/2404.00699) | metadata verified |
| S21 | Recent Advances in Large Language Model Benchmarks against Data Contamination | 2025 | 2025-02 | [arXiv:2502.17521](https://arxiv.org/abs/2502.17521) | metadata verified |

### Benchmark papers

| ID | Benchmark | First author | Date | Link | Depth |
| --- | --- | --- | --- | --- | --- |
| S22 | MMLU | Dan Hendrycks | 2020-09-07 | [arXiv:2009.03300](https://arxiv.org/abs/2009.03300) | metadata verified |
| S23 | MMLU-Pro | Yubo Wang | 2024-06-03 | [arXiv:2406.01574](https://arxiv.org/abs/2406.01574) | metadata verified |
| S24 | ARC (AI2 Reasoning Challenge) | Peter Clark | 2018-03-14 | [arXiv:1803.05457](https://arxiv.org/abs/1803.05457) | metadata verified |
| S25 | HellaSwag | Rowan Zellers | 2019-05-19 | [arXiv:1905.07830](https://arxiv.org/abs/1905.07830) | metadata verified |
| S26 | WinoGrande | Keisuke Sakaguchi | 2019-07-24 | [arXiv:1907.10641](https://arxiv.org/abs/1907.10641) | metadata verified |
| S27 | TruthfulQA | Stephanie Lin | 2021-09-08 | [arXiv:2109.07958](https://arxiv.org/abs/2109.07958) | metadata verified |
| S28 | BIG-bench | Aarohi Srivastava | 2022-06-09 | [arXiv:2206.04615](https://arxiv.org/abs/2206.04615) | metadata verified |
| S29 | BIG-Bench Hard (BBH) | Mirac Suzgun | 2022-10-17 | [arXiv:2210.09261](https://arxiv.org/abs/2210.09261) | metadata verified |
| S30 | GPQA | David Rein | 2023-11-20 | [arXiv:2311.12022](https://arxiv.org/abs/2311.12022) | metadata verified |
| S31 | MuSR | Zayne Sprague | 2023-10-24 | [arXiv:2310.16049](https://arxiv.org/abs/2310.16049) | metadata verified |
| S32 | IFEval | Jeffrey Zhou | 2023-11-14 | [arXiv:2311.07911](https://arxiv.org/abs/2311.07911) | metadata verified |
| S33 | Humanity's Last Exam | Long Phan | 2025-01-24 | [arXiv:2501.14249](https://arxiv.org/abs/2501.14249) | metadata verified |
| S34 | GSM8K | Karl Cobbe | 2021-10-27 | [arXiv:2110.14168](https://arxiv.org/abs/2110.14168) | metadata verified |
| S35 | MATH | Dan Hendrycks | 2021-03-05 | [arXiv:2103.03874](https://arxiv.org/abs/2103.03874) | metadata verified |
| S36 | HumanEval, and the pass@k estimator | Mark Chen et al. | 2021-07 | [arXiv:2107.03374](https://arxiv.org/abs/2107.03374) | secondary |
| S37 | MBPP | Jacob Austin | 2021-08-16 | [arXiv:2108.07732](https://arxiv.org/abs/2108.07732) | metadata verified |
| S38 | SWE-bench | Carlos E. Jimenez | 2023-10-10 | [arXiv:2310.06770](https://arxiv.org/abs/2310.06770) | metadata verified |
| S39 | LiveCodeBench | Naman Jain | 2024-03-12 | [arXiv:2403.07974](https://arxiv.org/abs/2403.07974) | metadata verified |
| S40 | Terminal-Bench | Mike A. Merrill | 2026-01-17 | [arXiv:2601.11868](https://arxiv.org/abs/2601.11868) | metadata verified |
| S41 | KernelBench | Anne Ouyang | 2025-02-14 | [arXiv:2502.10517](https://arxiv.org/abs/2502.10517) | metadata verified |
| S42 | SciCode | Minyang Tian | 2024-07-18 | [arXiv:2407.13168](https://arxiv.org/abs/2407.13168) | metadata verified |
| S43 | GAIA | 2023 | 2023-11 | [arXiv:2311.12983](https://arxiv.org/abs/2311.12983) | metadata verified |
| S44 | WebArena | 2023 | 2023-07 | [arXiv:2307.13854](https://arxiv.org/abs/2307.13854) | metadata verified |
| S45 | OSWorld | 2024 | 2024-04 | [arXiv:2404.07972](https://arxiv.org/abs/2404.07972) | metadata verified |
| S46 | τ-bench | Shunyu Yao et al. | 2024-06 | [arXiv:2406.12045](https://arxiv.org/abs/2406.12045) | secondary |
| S47 | τ²-bench | 2025 | 2025-06 | [arXiv:2506.07982](https://arxiv.org/abs/2506.07982) | metadata verified |
| S48 | MLE-bench | OpenAI | 2024-10 | [arXiv:2410.07095](https://arxiv.org/abs/2410.07095) | metadata verified |
| S49 | Cybench | Andy K. Zhang | 2024-08-15 | [arXiv:2408.08926](https://arxiv.org/abs/2408.08926) | metadata verified |
| S50 | CVE-Bench | Yuxuan Zhu | 2025-03-21 | [arXiv:2503.17332](https://arxiv.org/abs/2503.17332) | metadata verified |
| S51 | CORE-bench | 2024 | 2024-09 | [arXiv:2409.11363](https://arxiv.org/abs/2409.11363) | metadata verified |
| S52 | AgentHarm | 2024 | 2024-10 | [arXiv:2410.09024](https://arxiv.org/abs/2410.09024) | metadata verified |
| S53 | GDPval | OpenAI | 2025-10 | [arXiv:2510.04374](https://arxiv.org/abs/2510.04374) | metadata verified |

### Institutional and vendor documentation

| ID | Source | Org | Date | Link | Depth |
| --- | --- | --- | --- | --- | --- |
| S54 | Introducing SWE-bench Verified | OpenAI | 2024-08 | [openai.com](https://openai.com/index/introducing-swe-bench-verified/) | secondary |
| S55 | Why SWE-bench Verified no longer measures frontier coding capabilities | OpenAI | `n/v` | [openai.com](https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/) | secondary |
| S56 | Measuring the performance of our models on real-world tasks (GDPval) | OpenAI | 2025-09 | [openai.com](https://openai.com/index/gdpval/) | secondary |
| S57 | Benchmarking hub methodology | Epoch AI | 2026 snapshot | [epoch.ai](https://epoch.ai/benchmarks/about) | read |
| S58 | FrontierMath benchmark page, including the version 2 correction and the conflict-of-interest statement | Epoch AI | 2026-06-12 update | [epoch.ai](https://epoch.ai/benchmarks/frontiermath) | read |
| S59 | Measuring AI Ability to Complete Long Tasks | METR | 2025-03-19 | [metr.org](https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/) | read |
| S60 | Common Elements of Frontier AI Safety Policies | METR | 2025-12 | [metr.org](https://metr.org/common-elements) | secondary |
| S61 | Claude Sonnet 3.7 (often) knows when it's in alignment evaluations | Apollo Research | 2025 | [apolloresearch.ai](https://www.apolloresearch.ai/science/claude-sonnet-37-often-knows-when-its-in-alignment-evaluations) | secondary |
| S62 | Demystifying evals for AI agents | Anthropic | 2025 | [anthropic.com](https://anthropic.com/engineering/demystifying-evals-for-ai-agents) | read |
| S63 | Create strong empirical evaluations | Anthropic documentation | current | [docs.anthropic.com](https://docs.anthropic.com/en/docs/build-with-claude/develop-tests) | secondary |
| S64 | Your AI Product Needs Evals | Hamel Husain | 2024 | [hamel.dev](https://hamel.dev/blog/posts/evals/) | secondary |
| S65 | Inspect, an open-source evaluation framework | UK AI Security Institute | current | [inspect.aisi.org.uk](https://inspect.aisi.org.uk/) | secondary |
| S66 | Announcing Inspect Evals | UK AI Security Institute | 2025 | [aisi.gov.uk](https://www.aisi.gov.uk/blog/inspect-evals) | secondary |
| S67 | Intelligence benchmarking methodology, index version 4.1.1 | Artificial Analysis | 2026 snapshot | [artificialanalysis.ai](https://artificialanalysis.ai/methodology/intelligence-benchmarking) | read |
| S68 | Open LLM Leaderboard normalisation documentation | Hugging Face | current | [github.com/huggingface/leaderboards](https://github.com/huggingface/leaderboards/blob/main/docs/source/en/open_llm_leaderboard/normalization.md) | secondary |
| S69 | AI benchmarking organization criticized for waiting to disclose funding from OpenAI | TechCrunch | 2025-01-19 | [techcrunch.com](https://techcrunch.com/2025/01/19/ai-benchmarking-organization-criticized-for-waiting-to-disclose-funding-from-openai/) | secondary |

### Standards and regulation

| ID | Source | Body | Date | Link | Depth |
| --- | --- | --- | --- | --- | --- |
| S70 | EU AI Act, Article 55: obligations for providers of general-purpose AI models with systemic risk | European Union | in force | [artificialintelligenceact.eu](https://artificialintelligenceact.eu/article/55/) | secondary |
| S71 | AI Risk Management Framework, and the Generative AI Profile (AI 600-1) | NIST | 2023, profile 2024-07-26 | [nist.gov](https://www.nist.gov/itl/ai-risk-management-framework) | secondary |
| S72 | ISO/IEC TS 4213:2022, Assessment of machine learning classification performance | ISO/IEC JTC 1/SC 42 | 2022-10 | [iso.org](https://www.iso.org/standard/79799.html) | secondary |
| S73 | ISO/IEC 42001:2023, AI management systems | ISO/IEC | 2023-12 | [iso.org](https://www.iso.org/standard/42001) | secondary |
| S74 | MLPerf Training benchmark | MLCommons | current | [mlcommons.org](https://mlcommons.org/benchmarks/training/) | secondary |
| S75 | MLPerf Inference rules | MLCommons | current | [github.com/mlcommons](https://github.com/mlcommons/inference_policies/blob/master/inference_rules.adoc) | secondary |

Seventy-five sources: 21 methodology and critique, 32 benchmark papers, 16 institutional and vendor
pages, and 6 standards and regulation entries.

## How the artifacts were produced

| Artifact | Production |
| --- | --- |
| Markdown sections | Written by hand from the sources above |
| `data.json` | Parsed out of the Markdown tables by `build.mjs`, so the data and the prose cannot disagree |
| `report.html` | Generated by `build.mjs` from the Markdown files, with the house design tokens and embedded fonts from the 11agi reports styleguide, plus four inline diagrams |
| Diagrams | Inline SVG, generated in `build.mjs`, each redundant with an adjacent table so the Markdown loses no information |
| `verify.mjs` | The gate described above: 44 checks across structural pins, parity, data agreement, determinism, and hygiene |

The generator reads the styleguide's `fonts.css` and `tokens.css` from a local 11agi checkout, so
rebuilding requires `ELEVEN_AGI_REPO` to be set. The build is deterministic: identical input yields
a byte-identical file apart from the generation timestamp.

## Related reports in this archive

| Report | Overlap |
| --- | --- |
| Reverse engineering WhichAI.dev: a teardown of ui-design-bench | A worked audit of one small benchmark's methodology, using the validity questions in section 01 |
| Interactive Data Visualization Best Practices | How to present the tables and uncertainty this report asks you to publish |
