# Negativ Localization & Tone Guidelines

**Core tone for negative cases** (use this in every translation):
- Helpful, calm, actionable
- Never blame the user (“You did something wrong” → “Something went wrong on our side”)
- Short, scannable, friendly but professional
- Provide clear next step

**ICU MessageFormat rules** (use this standard):
- Plurals: `{count, plural, one {field} other {fields}}`
- Variables: `{field}`, `{time}`
- Gender / select when needed

**How to contribute a new language or improve a translation**
1. Copy `data/localization/messages/en.json` → `xx.json` (xx = language code)
2. Translate only the values (keep keys exactly the same)
3. Open a PR titled `[translation] Add/Improve xx language`
4. You can discuss nuances in GitHub Issues (any language is welcome — we’ll reply in English or your language)

We accept translations even if partial. Every language helps real users worldwide.