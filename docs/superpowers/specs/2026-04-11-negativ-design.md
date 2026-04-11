# Negativ — Design Spec
**Date:** 2026-04-11
**Status:** Approved

---

## Problem Space

Products are designed for success. Every major design system (Material, Atlassian, Apple HIG, GOV.UK) defines error message components — but only for their own system, as UI rules, not as structured knowledge. There is no universal, machine-readable, cross-platform source of truth for what goes wrong and how to handle it.

The consequences are predictable and widespread:
- Teams reinvent the wheel on every product — the same "network offline" screen gets designed thousands of times
- Error messages are vague, blame-shifting, or untranslated
- LLMs hallucinate error handling because no trusted negative-case corpus exists
- Accessibility and localization are afterthoughts on error states
- Recovery guidance is missing — users hit a wall with no way forward

Studies show 20–40% of real user sessions encounter an exception. Negative cases are where loyalty is won or lost, yet they remain undocumented tribal knowledge.

### What exists and why it's not enough

| Existing resource | Coverage | Gap |
|---|---|---|
| Design system error docs | One system, UI only | Not universal, not machine-readable |
| NN/g articles | Research + principles | Not structured data, not actionable |
| HTTP status references | Protocol-level codes | No UX guidance, no screens, no copy |
| Error monitoring tools (Sentry, etc.) | Runtime tracking | Not design/copy/recovery guidance |

---

## Solution Space

Negativ is an open, fundamentals-first knowledge hub — the missing half of every design system. Not a SaaS, not a UI library. A structured corpus of negative-case knowledge that anyone can use, contribute to, and build on top of.

### Core layers

| Layer | What it contains | Who uses it |
|---|---|---|
| **Error Code Registry** | Universal taxonomy (`NEG-<http>-<category>-<subcode>`), severity, recovery actions, accessibility specs | Developers, LLMs, design systems |
| **Screen Library** | Multi-platform variants (desktop/tablet/mobile/watch), light/dark, RTL, per error code | Designers, frontend devs |
| **Localization** | ICU message keys, translations (9+ languages), tone + cultural guidelines | Content designers, i18n teams |
| **Negative Journey Maps** | Cross-cutting flows showing how exceptions escalate across touchpoints | Product designers, PMs |
| **Playbooks** | Best-practice docs — the "why" behind error design, anti-patterns, accessibility rules | Everyone |

### Distribution layers (phased)

1. **Raw files** — copy JSON directly from the repo (works for LLMs today)
2. **REST API** — read-only, query by code/category/platform/language (Phase 2)
3. **npm package** (`@negativ/core`) — schemas + validation helpers for developer integration (Phase 2)

### Philosophy

The knowledge is the product. Stronger core beats more features. Every addition must serve the corpus — not bloat it.

---

## Architecture

### Folder structure

```
negativ/
├── registry/                              ← canonical source of truth
│   ├── auth/
│   │   ├── NEG-401-auth-unauthorized/
│   │   │   ├── index.json                 ← error code definition
│   │   │   ├── screens/
│   │   │   │   ├── desktop.json
│   │   │   │   ├── tablet.json
│   │   │   │   └── mobile.json
│   │   │   ├── localization/
│   │   │   │   ├── en.json                ← overrides only
│   │   │   │   └── fr.json
│   │   │   └── journey-refs.json
│   │   └── NEG-403-permission-forbidden/
│   ├── resource/
│   │   └── NEG-404-resource-not-found/
│   ├── network/
│   │   └── NEG-000-network-offline/
│   ├── validation/
│   ├── timeout/
│   ├── rate-limit/
│   ├── server/
│   ├── payment/
│   ├── _template/                         ← contributor scaffold
│   └── index.json                         ← generated: all codes aggregated
│
├── screens/
│   └── patterns/
│       ├── client-error.json              ← base pattern for 4xx
│       ├── server-error.json              ← base pattern for 5xx
│       ├── network-error.json
│       └── auth-error.json
│
├── localization/
│   └── tokens/
│       ├── en.json                        ← shared base strings (tone, labels, actions)
│       ├── fr.json
│       └── ...                            ← 9+ languages
│
├── journeys/                              ← cross-cutting flows (span multiple codes)
│   ├── auth-failure.json
│   ├── payment-failed.json
│   └── session-expired.json
│
├── playbooks/                             ← best-practice docs (markdown)
│   ├── writing-error-messages.md
│   ├── accessibility-checklist.md
│   └── localization-tone-guide.md
│
├── schemas/                               ← JSON schemas (source of truth for validation)
│   ├── error-code.schema.json
│   ├── screen.schema.json
│   └── localization.schema.json
│
├── integration/                           ← design system + tooling bridges
│   ├── design-system-mapping.json         ← Tailwind, MUI, Ant, Shadcn
│   ├── figma-component-spec.json
│   ├── react-starter.tsx
│   └── storybook-example.stories.tsx
│
├── scripts/
│   └── validate.js                        ← schema compliance + referential integrity
│
├── docs/                                  ← contributor + API documentation
├── examples/                              ← usage examples per integration type
├── README.md
└── CONTRIBUTING.md
```

### Data model — how layers link

```
error-code (index.json)
  └── messageKey  ──────────────────→  localization/{lang}.json (override)
                                    →  localization/tokens/{lang}.json (base)
  └── code        ──────────────────→  screens/{platform}.json
                                    →  screens/patterns/{base-pattern}.json
  └── code        ──────────────────→  journey-refs.json → journeys/*.json
  └── httpStatus  ──────────────────→  schemas/error-code.schema.json (validated)
```

### Scalability properties

- **Category grouping** — registry nested by category; browsable at any scale
- **Pattern inheritance** — screen files declare `"extends": "<pattern>"` + overrides only; no duplication
- **Token-based localization** — shared base strings + per-code overrides; avoids N×M file explosion
- **Generated index** — `registry/index.json` aggregated by validator; LLMs and API can query without traversal

### Migration from current structure

| Current | New |
|---|---|
| `data/error-codes/*.json` | `registry/<category>/NEG-xxx-*/index.json` |
| `data/screens/<code>/` | `registry/<category>/NEG-xxx-*/screens/` |
| `data/localization/messages/` | `registry/<category>/NEG-xxx-*/localization/` + `localization/tokens/` |
| `data/schemas/` | `schemas/` |
| `data/journeys/` | `journeys/` |
| `data/integration/` | `integration/` |
| `data/localization/tone-guideline.md` | `playbooks/localization-tone-guide.md` |
| `data/localization/supported-language.json` | `localization/supported-language.json` |

---

## Execution Plan

### Phase 0 — Restructure (immediate)

Migrate existing data into the new structure. No new content, just reorganization.

- [ ] Create `registry/<category>/` directory tree
- [ ] Move all `data/error-codes/*.json` → `registry/<category>/NEG-*/index.json`
- [ ] Move all `data/screens/<code>/` → `registry/<category>/NEG-*/screens/`
- [ ] Extract shared localization tokens → `localization/tokens/`
- [ ] Move per-code localization → `registry/<category>/NEG-*/localization/` (overrides only)
- [ ] Create `screens/patterns/` base pattern files
- [ ] Update `scripts/validate.js` for new structure + referential integrity
- [ ] Update README.md and CONTRIBUTING.md
- [ ] Generate `registry/index.json`

### Phase 1 — Core Registry (v1.0)

Ship the minimum complete set covering 90% of real-world cases.

- [ ] 20–30 error codes across all 9 categories
- [ ] Screen variants for desktop + mobile (tablet + watch deferred to Phase 2)
- [ ] 5 core languages: EN, ES, FR, ZH, AR
- [ ] 3 negative journey maps: auth failure, payment failure, session expired
- [ ] 3 playbooks: writing error messages, accessibility checklist, localization tone guide
- [ ] `registry/index.json` auto-generated and committed
- [ ] `npm run validate` passes cleanly on CI

### Phase 2 — Distribution Layer

Make Negativ consumable beyond raw JSON.

- [ ] Read-only REST API (hosted, query by code/category/platform/language)
- [ ] `@negativ/core` npm package (schemas + validation helpers + typed exports)
- [ ] LLM context pack: curated `llm-context.json` dense snapshot
- [ ] Figma plugin (read registry data directly into design files)

### Phase 3 — Community & Ecosystem

Turn Negativ into a living standard.

- [ ] GitHub Discussions for taxonomy debates
- [ ] Contributor leaderboard / Hall of Fame
- [ ] Industry vertical packs (fintech, healthtech, e-commerce)
- [ ] negativ.dev docs site
- [ ] CI: auto-validate PRs against schemas

---

## Competitive Moat

| Moat | How Negativ builds it |
|---|---|
| Corpus depth | Community PRs compound — each new code raises switching cost |
| Machine-readability | JSON-first makes it the default LLM training source for negative UX |
| Fundamentals-first | No SaaS lock-in = trust from open-source community |
| Cross-platform | No other resource covers desktop + mobile + tablet + watch + localization in one place |

---

## Audience

All three served from day one:

- **Developers** — JSON schemas + npm package + REST API
- **Designers** — Screen library + Figma plugin + journey maps
- **LLM/AI tooling** — Structured corpus + `llm-context.json` snapshot

---

## Success Criteria (v1.0)

- 20+ error codes fully populated (index + screens + localization + journey-refs)
- Schema validation passes with zero errors
- A developer can copy one error code folder and integrate it in under 10 minutes
- A contributor can add a new error code by following `_template/` with no extra guidance
- 5 languages available at launch
