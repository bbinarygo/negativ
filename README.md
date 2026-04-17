# Negativ

**The missing half of every customer journey or design system.**

[![GitHub stars](https://img.shields.io/github/stars/negativ/negativ)](https://github.com/negativ/negativ)
[![License](https://img.shields.io/badge/License-CC%20BY--SA%204.0-green)](https://creativecommons.org/licenses/by-sa/4.0/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)](CONTRIBUTING.md)
[![Live Registry](https://img.shields.io/badge/📋-Live_Registry-7c3aed)](https://bbinarygo.github.io/negativ/registry/)
[![Docs](https://img.shields.io/badge/📖-negativ.dev-7c3aed)](https://bbinarygo.github.io/negativ)

> % of user sessions hit errors.  
> Most design systems completely ignore them.  
> **Negativ fixes that.**

![Negativ hero visual — multi-device negative UX patterns](assets/images/hero-multi-device.png)
*Standardized error screens, recovery flows, and negative journeys that actually ship.*

### One-click access
- **[Browse the full registry →](https://bbinarygo.github.io/negativ/registry/)** (filter by platform, severity, industry)
- **[Contribute in 60 seconds →](https://bbinarygo.github.io/negativ/contribute/)** (wizard + auto PR)
- **[Copy LLM-ready context](https://raw.githubusercontent.com/bbinarygo/negativ/main/llm-context.json)** (for Cursor, Claude, etc.)
- **Figma Community file** (coming soon — reply if you want it first)

### Why teams are already bookmarking Negativ
- **Error Code Registry** — Standardized codes with recovery actions, tone guidelines, accessibility specs
- **Screen Library** — Responsive templates (desktop, mobile, tablet, watch) in light/dark/RTL/high-contrast
- **Negative Journey Maps** — Real branching flows that show how failures escalate
- **LLM-ready JSON** — Perfect for codegen, design tokens, and AI agents
- **Design-system ready** — Tailwind, Shadcn, Material, Ant Design mappings included

---

### Problem Space
Today’s products are built for happy paths only. Teams pour energy into polished onboarding and success states—yet 20-40% of real user sessions hit exceptions: validation failures, network issues, permission errors, edge cases, outages.

The result?  
- Vague “Something went wrong” messages  
- Inconsistent tone and recovery guidance  
- Platform breakage (desktop toast vs mobile full-screen)  
- Duplicated effort across every team  
- LLMs that hallucinate poor error handling because they lack a trusted negative-case corpus  

Negative cases are where loyalty is won or lost—yet they remain undocumented tribal knowledge.

### Solution Space
**Negativ** is the missing half of every design system: a centralized, open, fundamentals-first knowledge base for negative UX.

It provides:
- Standardized Error-Code Registry
- Multi-platform error screens (desktop, tablet, mobile, watch) with localization
- Negative customer journey maps
- Best-practice playbooks and anti-patterns
- Machine-readable JSON schemas perfect for LLMs, codegen, and design systems

### Core Features
- **Error Code Taxonomy** — Universal, extensible registry (e.g. `NEG-4xx-validation`, `NEG-auth-403`) with severity, recovery actions, HTTP mappings, and accessibility specs.
- **Screen Library** — Responsive templates + variants (light/dark, high-contrast, RTL) with Figma/SVG exports.
- **Localization Starter Pack** — i18n examples + tone/cultural rules for 10+ languages.
- **Negative Journey Maps** — Branching flows that show exactly how exceptions escalate.
- **Structured Data** — JSON schemas, OpenAPI extensions, YAML exports. Query via simple REST API (read-only).
- **Community-Driven** — GitHub-first. Anyone can PR new codes, screens, or industry verticals.
- **Configurable Localization** — Every message uses reusable ICU keys. Translations live in `data/localization/messages/`. Supports 9+ languages out of the box and easy community contributions.
- **Expanded Error Screen Patterns** — Inline, modal, banner, full-page, empty-state variants for every screen
- **Design System Integration Layer** — Ready-to-use mappings for Tailwind, Shadcn/UI, Material, Ant Design, Figma, Storybook + React starter

**Philosophy:** Stronger core matters more than chasing platforms. We ship knowledge, not another SaaS.

### First Contribution in 3 Steps

| Step | Action |
|---|---|
| ① | [Browse the registry](https://bbinarygo.github.io/negativ/registry/) — find a gap or pick a `good first issue` |
| ② | Fill the [contributor wizard](https://bbinarygo.github.io/negativ/contribute/) — validates your JSON client-side |
| ③ | Submit — the wizard opens a pre-filled GitHub Issue for review |

### Quick Start

1. Browse `registry/` — pick a category, open any error code folder.
2. Copy `registry/<category>/<code>/index.json` into your design system or LLM prompt.
3. Use `registry/index.json` for a full machine-readable snapshot of all codes.
4. Need a specific error? Open an issue or submit a PR (see [CONTRIBUTING.md](CONTRIBUTING.md)).

### LLM Usage

Paste `llm-context.md` directly into your system prompt, or load `llm-context.json` programmatically:

- **Raw Markdown:** `https://raw.githubusercontent.com/bbinarygo/negativ/main/llm-context.md`
- **Raw JSON:** `https://raw.githubusercontent.com/bbinarygo/negativ/main/llm-context.json`

Regenerate after registry changes:
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