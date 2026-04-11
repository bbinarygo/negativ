# Contributing to Negativ

Thank you for wanting to make digital products more resilient! Negativ is 100% community-driven. Every error code, screen, or journey you add helps thousands of developers and designers ship better negative experiences.

## Ways to Contribute
- Add or improve an error code (most common & highest impact)
- Submit new multi-platform error screens or variants
- Create or expand a negative customer journey map
- Add localization strings or cultural adaptation notes
- Fix typos, improve accessibility specs, or enhance JSON schemas
- Write or update best-practice playbooks

## Development Setup

1. Fork the repo and clone it locally.
2. `git checkout -b feat/your-contribution`
3. `npm install`
4. Copy `registry/_template/` into `registry/<category>/NEG-<httpStatus>-<category>-<subcode>/`
5. Fill `index.json`, `screens/desktop.json`, `screens/mobile.json`, `localization/en.json`, `journey-refs.json`
6. Run `npm run validate` — must pass with zero errors.
7. Open a PR with a clear title and description.

## Contribution Guidelines

### General Rule
- **Error Codes** must follow the taxonomy: `NEG-<httpStatus-or-000>-<category>-<subcode>` (see `schemas/error-code.schema.json`)
- **Screens** must include: `copyTitle`, `copyMessageKey`, `extends` (base pattern), `cta`. Desktop screens should also include `patterns`, `figmaNote`, and `designSystemIntegrations`.
- **JSON Schemas** are the source of truth. Every entry must be valid against the published schema.
- **Localization** follows our tone-of-voice rules (helpful, calm, actionable, never blaming the user).
- **Attribution** — Credit original sources when adapting external research.
- **No feature bloat** — We are a knowledge hub, not another UI library.

### Filename / Folder Rule

New error code folders **must** follow:
```
registry/<category>/NEG-<httpStatus-or-000>-<category>-<subcode>/
```

- Use the exact HTTP status number when present (`404`, `401`, etc.)
- Use `000` when there is no HTTP status (e.g. `NEG-000-network-offline`)
- The `<category>` in the folder path must match the `category` field in `index.json`
- Use lowercase, hyphen-separated subcodes (`session-expired`, not `sessionExpired`)

`npm run validate` enforces this convention and will fail on any mismatch.

### Translations & Localization
We strongly encourage contributions in any language.
- Add or improve a language file in `data/localization/messages/`
- Discuss cultural nuances or tone questions in a GitHub Issue (title it `[localization] discussion`)
- No English required for translation PRs — we’ll help review

### Adding or Expanding Screens
1. Copy `data/screens/_template/`
2. Fill patterns + designSystemIntegrations
3. Run `node scripts/validate.js`
4. PR with screenshot of the Figma variant (optional but loved)

## Pull Request Process
1. Fill the PR template completely
2. One PR = one focused change (keeps reviews fast)
3. All new content requires at least one approval from a maintainer
4. After merge you’ll be added to the Hall of Fame in `CONTRIBUTORS.md`

## Code of Conduct
We follow the [Contributor Covenant v2.1](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). Be kind, assume best intent, and remember: we’re all here to reduce user friction.

## Questions?
- Open an issue labeled `question` or `discussion`
- Join the conversation in the GitHub Discussions tab

**First-time contributor?** Start with the [Good First Issues](https://github.com/negativ/negativ/labels/good%20first%20issue) label.

Together we’re building the source of truth for negative cases. Let’s make exceptional experiences… less exceptional.