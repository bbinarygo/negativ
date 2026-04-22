# Negativ

**The missing half of every customer journey or design system.**

[![GitHub stars](https://img.shields.io/github/stars/bbinarygo/negativ)](https://github.com/bbinarygo/negativ)
[![License](https://img.shields.io/badge/License-CC%20BY--SA%204.0-green)](https://creativecommons.org/licenses/by-sa/4.0/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)](CONTRIBUTING.md)
[![Live Registry](https://img.shields.io/badge/📋-Live_Registry-7c3aed)](https://bbinarygo.github.io/negativ/registry/)
[![Docs](https://img.shields.io/badge/📖-negativ.dev-7c3aed)](https://bbinarygo.github.io/negativ)
[![Roadmap](https://img.shields.io/badge/🗺️-Roadmap-7c3aed)](ROADMAP.md)
[![Impact Dashboard](https://img.shields.io/badge/📊-Impact_Dashboard-7c3aed)](https://bbinarygo.github.io/negativ/impact/)

> Most user sessions hit errors.  
> Most design systems completely ignore them.  
> **Negativ fixes that.**

![Negativ hero visual — multi-device negative UX patterns](assets/images/hero-multi-device.png)
*Standardized error screens, recovery flows, and negative journeys that actually ship.*

### One-click access
- **[Browse the full registry →](https://bbinarygo.github.io/negativ/registry/)** (filter by platform, severity, industry)
- **[Contribute in <15 minutes →](https://bbinarygo.github.io/negativ/contribute/)** (persona-specific tracks + Good First Issues)
- **[Copy LLM-ready context](https://raw.githubusercontent.com/bbinarygo/negativ/main/llm-context.json)** (for Cursor, Claude, Windsurf, etc.)
- **[Full Roadmap →](ROADMAP.md)** (Q2 2026 — Phase 0 live)
- **[Impact Dashboard →](https://bbinarygo.github.io/negativ/impact/)** (industry benchmarks + community ROI data)
- **[ROI Playbook →](playbooks/negative-ux-roi.md)** (add your company's metrics via PR)

### Why teams are already bookmarking Negativ
Negative UX is where loyalty is won or lost — yet it remains undocumented tribal knowledge.  
Negativ is the **centralized, open, fundamentals-first knowledge base** that turns error states, recovery flows, and negative journeys into first-class, reusable assets for Product Managers, Developers, and UX Researchers.

### Core Features
- **Error Code Registry** — 29+ standardized codes (`NEG-4xx`, `NEG-auth`, etc.) with recovery actions, tone guidelines, accessibility specs, and multi-language messages.
- **Screen Library** — Responsive templates (web, mobile, tablet, watch) in light/dark/RTL/high-contrast with design-system mappings.
- **Negative Journey Maps** — Real branching flows that show exactly how failures escalate.
- **Research-Ready Kits** — Usability test scripts, surveys, and success metrics for every journey.
- **Persona-first Contribution** — Dedicated tracks for PMs (ROI data), Devs (integrations), and UXRs (research protocols).
- **LLM-ready JSON** — Perfect for codegen, AI agents, and design tokens.
- **Design-system ready** — Tailwind, Shadcn, Material, Ant Design mappings included.

**Philosophy:** Stronger core matters more than chasing platforms. We ship knowledge, not another SaaS.

### Negative UX by the numbers

| Metric | Value | Source |
|--------|-------|--------|
| Average cart abandonment rate | 70.19–70.22% | Baymard Institute |
| Users who never return after one bad experience | 32% | PwC |
| Error reduction with inline validation | -42% errors, -22% abandonment | Baymard Institute |

→ **[See the full Impact Dashboard](https://bbinarygo.github.io/negativ/impact/)** — contribute your company's data via PR.

### How to Contribute (pick your track)
We built Negativ **for** Product Managers, Developers, and UX Researchers. Choose your path:

**🧭 Product Manager track** — Add business impact data to the Negative UX ROI playbook  
**💻 Developer track** — Ship a new design-system integration (Shadcn, Material, etc.)  
**🔬 UX Researcher track** — Expand journeys with research protocols and metrics  

→ **[See ROADMAP.md](ROADMAP.md)** (Phase 0 complete — contributor magnet now live)

### Quick Start
1. Browse the [registry](https://bbinarygo.github.io/negativ/registry/).
2. Copy any `index.json` into your design system or LLM prompt.
3. Use `llm-context.json` for full machine-readable context.
4. Need something missing? Open a persona-tagged Good First Issue or PR.

### LLM Usage
Paste `llm-context.json` directly into your system prompt:

```bash
npm run llm-context
```

### Project Structure

```
registry/               ← one folder per error code (the atom)
  <category>/
    <NEG-code>/
      index.json        ← error code definition (code, messageKey, recovery, etc.)
      screens/
        desktop.json    ← desktop screen spec (extends base pattern)
        mobile.json     ← mobile screen spec
      localization/
        en.json         ← English message override for this code
        es.json         ← Spanish (and more languages)
      journey-refs.json ← which journey maps include this error

screens/patterns/       ← base patterns inherited by screen files
localization/tokens/    ← shared message strings (all languages)
journeys/               ← cross-cutting negative flow diagrams
playbooks/              ← best-practice guides (writing, accessibility, i18n)
schemas/                ← JSON schemas for validation
integration/            ← design system mappings (Figma, React, Tailwind, etc.)
scripts/validate.js     ← validates all codes + generates registry/index.json
```

Together we’re making exceptional negative experiences… impossible to ignore.
