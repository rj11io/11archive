# Methodology, coverage, limitations, and sources

- **Created:** 2026-08-11

## Objective

Establish how modern agent harnesses and chat surfaces handle standing-instruction files at global, project, and thread scope, with enough precision that a reader can set up their own files correctly, or build a harness that behaves predictably.

## Reporting period and timezone

- Research date: 2026-08-11.
- Working session timezone: Europe/Lisbon.
- All product behaviour is a point-in-time observation. Every harness in this report ships weekly or faster, and several documented behaviours here carry version numbers precisely because they changed recently.

## Evidence method

Sources were preferred in this order:

1. Vendor product documentation, current at the research date.
2. Published open specifications.
3. Vendor engineering posts and changelogs.
4. Peer-reviewed papers and preprints for research claims.
5. Public issue trackers, for behaviour the docs do not describe.
6. Practitioner write-ups, used only for observations no primary source covers, and always marked.

All claims were paraphrased. No long passages were copied.

Where a documentation page states an exact path, cap, or command, it is quoted or reproduced verbatim in the report so the reader can grep for it. Where a number came from a secondary source, it carries a `[secondary]` or `[medium confidence]` marker at the point of use.

## Coverage

**Systems examined, with the depth of evidence.** Fifteen of these are agent harnesses profiled in the comparison matrix in `data.json`. The Claude memory tool, LangGraph, and Roo Code are examined but not profiled there: the first is an API building block rather than a harness, the second is a framework, the third is covered only through community repositories.

| Harness | Evidence | Depth |
|---|---|---|
| Claude Code | Vendor docs, three pages read in full | Complete |
| Claude memory tool (API) | Vendor docs read in full | Complete |
| OpenAI Codex | Vendor docs | Complete for discovery and merge |
| Gemini CLI | Vendor docs in repo | Complete for hierarchy and commands |
| Cursor | Vendor docs | Complete for rules; Memories removal is secondary |
| GitHub Copilot | Vendor docs and changelog | Good |
| Windsurf Cascade | Vendor docs | Complete for memories, rules, caps |
| JetBrains Junie | Vendor docs | Good; memory section absent from the page |
| Cline | Vendor docs | Good |
| OpenHands | Vendor docs | Good |
| Devin | Vendor docs | Good |
| Kiro | Vendor docs plus issue tracker | Partial; CLI behaviour from an open issue |
| Amazon Q Developer | AWS docs | Partial |
| Aider | Vendor docs | Partial |
| Zed | Vendor docs | Partial |
| Amp | Secondary only | Thin, marked throughout |
| Roo Code | Community repositories | Thin, mentioned only |
| LangGraph | Vendor docs | Sufficient for the thread and store distinction |

**Chat surfaces:** ChatGPT (OpenAI posts and help centre), Claude.ai (Anthropic help centre).

## Limitations

**No first-hand benchmarking.** Nothing here was measured. Every performance number is attributed to its source. If you need to know how a change to your instruction file affects your work, measure it in your repository.

**No paid-tier or enterprise verification.** Team Rules, enterprise policy deployment, and organisation dashboards are described from documentation, not from use.

**Version drift is certain.** Several documented behaviours are tied to specific Claude Code versions (v2.1.198, v2.1.206, v2.1.211, v2.1.213, v2.1.214, v2.1.216, v2.1.217, v2.1.222). Behaviour before those versions differed and behaviour after them may differ again.

**Undocumented internals.** Compaction thresholds are documented for almost no product. The Codex figures come from configuration keys and its issue tracker; the cross-harness comparison comes from one detailed public gist. Treat them as directionally right and specifically uncertain.

**Memory benchmark scores are excluded from conclusions.** LOCOMO and LongMemEval results for mem0, Zep, Letta, and similar systems vary widely between vendor-reported and independently reproduced numbers, in some cases by more than 30 points. They are mentioned in [00-executive-brief.md](00-executive-brief.md) only to say they should not be used as a ranking.

**A note on one redirect.** `docs.windsurf.com` now redirects to `docs.devin.ai`, following Cognition's acquisition of Windsurf. Windsurf documentation is cited at its current location.

## Conflicts and unresolved items

- **Cursor Memories.** Multiple secondary sources state the feature shipped in mid-2025 and was removed in version 2.1.x, with migration to Rules. Current vendor documentation describes Rules only and does not describe Memories. The removal is reported as secondary and the current state as documented.
- **Junie memory.** The vendor page is titled "Guidelines and memory" but the fetched content contains no memory section. Guidelines behaviour is reported; memory behaviour is recorded as not documented rather than guessed.
- **Kiro global steering.** The product documentation describes `~/.kiro/steering/`. An open issue on the vendor's CLI repository reports that global steering is ignored when project steering exists. Both are reported, with the issue cited.
- **Zed rules library.** One secondary source states the rules library was retired in favour of skills in version 1.4.2. Vendor documentation confirms `AGENTS.md` as the primary instruction file. The retirement claim is marked secondary.

## Sources

### Vendor documentation, primary

- Anthropic. [How Claude remembers your project](https://code.claude.com/docs/en/memory)
- Anthropic. [Explore the context window](https://code.claude.com/docs/en/context-window)
- Anthropic. [Create custom subagents](https://code.claude.com/docs/en/sub-agents)
- Anthropic. [Checkpointing](https://code.claude.com/docs/en/checkpointing)
- Anthropic. [Memory tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool)
- OpenAI. [Custom instructions with AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md)
- OpenAI. [Projects in ChatGPT](https://help.openai.com/en/articles/10169521-projects-in-chatgpt)
- Google. [Provide context with GEMINI.md files](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/gemini-md.md)
- Cursor. [Rules](https://cursor.com/docs/context/rules)
- GitHub. [Adding repository custom instructions for GitHub Copilot](https://docs.github.com/copilot/customizing-copilot/adding-custom-instructions-for-github-copilot)
- GitHub. [Copilot code review and coding agent now support agent-specific instructions](https://github.blog/changelog/2025-11-12-copilot-code-review-and-coding-agent-now-support-agent-specific-instructions/)
- Windsurf and Cognition. [Cascade memories](https://docs.devin.ai/desktop/cascade/memories)
- Cognition. [Knowledge onboarding](https://docs.devin.ai/onboard-devin/knowledge-onboarding)
- JetBrains. [Guidelines and memory](https://junie.jetbrains.com/docs/guidelines-and-memory.html)
- Cline. [Memory Bank](https://docs.cline.bot/best-practices/memory-bank)
- OpenHands. [Skills overview](https://docs.openhands.dev/overview/skills)
- Kiro. [Steering](https://kiro.dev/docs/steering/)
- AWS. [Generating a memory bank for Amazon Q chat](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/context-memory-bank.html)
- Aider. [Specifying coding conventions](https://aider.chat/docs/usage/conventions.html)
- Zed. [Agent instructions](https://zed.dev/docs/ai/instructions)
- LangChain. [Persistence](https://docs.langchain.com/oss/python/langgraph/persistence)
- Anthropic. [Use Claude's chat search and memory](https://support.claude.com/en/articles/11817273-use-claude-s-chat-search-and-memory-to-build-on-previous-context)

### Specifications and governance

- [AGENTS.md](https://agents.md/), stewarded by the Agentic AI Foundation under the Linux Foundation

### Vendor engineering posts

- Anthropic. [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- Anthropic. [Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- OpenAI. [Dreaming: Better memory for a more helpful ChatGPT](https://openai.com/index/chatgpt-memory-dreaming/)
- OpenAI. [Memory and new controls for ChatGPT](https://openai.com/index/memory-and-new-controls-for-chatgpt/)

### Research

- Jaroslawicz et al. [How many instructions can LLMs follow at once?](https://arxiv.org/pdf/2507.11538) IFScale. NeurIPS 2025 LLM Evaluation Workshop.
- Hong, Troynikov, Huber. [Context Rot: How increasing input tokens impacts LLM performance](https://www.trychroma.com/research/context-rot). Chroma, July 2025.
- [Memory injection attacks on LLM agents via query-only interaction](https://arxiv.org/abs/2503.03704). MINJA.
- [Memory poisoning attack and defense on memory based LLM-agents](https://arxiv.org/abs/2601.05504).

### Issue trackers

- [aws/amazon-q-developer-cli#3719](https://github.com/aws/amazon-q-developer-cli/issues/3719), global steering files not loaded by the Kiro CLI

### Secondary, used for observations no primary source covers

- [Context compaction research: Claude Code, Codex CLI, OpenCode, Amp](https://gist.github.com/badlogic/cd2ef65b0697c4dbe2d13fbecb0a0a5f)
- Tessl. [Amp drops compaction for handoff to fix AI's long-context drift](https://tessl.io/blog/amp-retires-compaction-for-a-cleaner-handoff-in-the-coding-agent-context-race/)
- Charlie Hills. [Delete your CLAUDE.md](https://charliehills.substack.com/p/delete-your-claudemd)
- SwirlAI. [Agent Skills: progressive disclosure as a system design pattern](https://www.newsletter.swirlai.com/p/agent-skills-progressive-disclosure)

## Verification performed

- Every path, cap, command, and version number in [02-harness-mechanics.md](02-harness-mechanics.md) was taken from the cited page in the same session, not from memory.
- Claims appearing in more than one file were checked for agreement across files.
- `data.json` was generated from the same facts as the markdown and the counts in it were checked against the tables.
- Numbers with different units in their sources (lines, KB, KiB, characters, tokens) are reported in their original unit and never converted, because the conversions would be false precision.
- Every claim attributed to a vendor is one the vendor states about its own product.
