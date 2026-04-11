# Negativ Restructure + Core Registry v1.0 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the existing `data/` layout into the new atom-based `registry/` structure, then expand to a complete v1.0 corpus covering 20+ error codes, 5 languages, 3 journey maps, and 3 playbooks.

**Architecture:** Each error code is a self-contained folder (`registry/<category>/<code>/`) owning its own `index.json`, per-platform screen files, and per-language localization overrides. Shared base patterns live in `screens/patterns/` and shared message tokens in `localization/tokens/`. A generated `registry/index.json` aggregates all codes for fast LLM and API consumption.

**Tech Stack:** Node.js 20, `ajv` ^8 (JSON Schema validation), JSON, Markdown, GitHub Actions

---

## File Structure Map

### Phase 0 — Files created / moved / deleted

| Action | Path |
|---|---|
| Create | `package.json` |
| Create | `schemas/error-code.schema.json` |
| Create | `schemas/screen.schema.json` |
| Create | `schemas/localization.schema.json` |
| Create | `screens/patterns/client-error.json` |
| Create | `screens/patterns/server-error.json` |
| Create | `screens/patterns/network-error.json` |
| Create | `screens/patterns/auth-error.json` |
| Create | `localization/tokens/en.json` |
| Create | `localization/tokens/es.json` |
| Create | `localization/supported-language.json` |
| Create | `registry/<category>/<code>/index.json` ×10 |
| Create | `registry/<category>/<code>/screens/desktop.json` ×10 |
| Create | `registry/<category>/<code>/screens/mobile.json` ×10 |
| Create | `registry/<category>/<code>/localization/en.json` ×10 |
| Create | `registry/<category>/<code>/localization/es.json` ×10 |
| Create | `registry/<category>/<code>/journey-refs.json` ×10 |
| Create | `registry/_template/index.json` |
| Create | `registry/_template/screens/desktop.json` |
| Create | `registry/_template/screens/mobile.json` |
| Create | `registry/_template/localization/en.json` |
| Create | `registry/_template/journey-refs.json` |
| Create | `registry/index.json` (generated) |
| Create | `scripts/migrate.js` |
| Rewrite | `scripts/validate.js` |
| Move | `data/journeys/*.json` → `journeys/` |
| Move | `data/integration/*` → `integration/` |
| Move | `data/localization/tone-guideline.md` → `playbooks/localization-tone-guide.md` |
| Update | `.github/workflows/validate.yml` |
| Update | `README.md` |
| Update | `CONTRIBUTING.md` |
| Delete | `data/` (entire directory) |

### Phase 1 — Files created

| Action | Path |
|---|---|
| Create | `registry/*/NEG-xxx-*/` ×12 new codes (index + screens + localization + journey-refs) |
| Create | `localization/tokens/fr.json` |
| Create | `localization/tokens/zh.json` |
| Create | `localization/tokens/ar.json` |
| Create | Per-code `localization/fr.json`, `zh.json`, `ar.json` ×22 codes |
| Create | `journeys/auth-failure.json` |
| Create | `journeys/session-expired.json` |
| Create | `playbooks/writing-error-messages.md` |
| Create | `playbooks/accessibility-checklist.md` |
| Update | `localization/supported-language.json` |
| Update | `registry/index.json` (regenerated) |

---

## Phase 0: Restructure

---

### Task 1: Bootstrap package.json

**Files:**
- Create: `package.json`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "negativ",
  "version": "1.0.0",
  "description": "The open knowledge hub for everything that can go wrong.",
  "license": "CC-BY-SA-4.0",
  "scripts": {
    "validate": "node scripts/validate.js",
    "migrate": "node scripts/migrate.js"
  },
  "devDependencies": {
    "ajv": "^8.17.1"
  }
}
```

Save to `package.json`.

- [ ] **Step 2: Install dependencies**

Run: `npm install`

Expected: `node_modules/` created, `package-lock.json` generated.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add package.json with ajv for schema validation"
```

---

### Task 2: Create schemas/ directory

**Files:**
- Create: `schemas/error-code.schema.json`
- Create: `schemas/screen.schema.json`
- Create: `schemas/localization.schema.json`

- [ ] **Step 1: Copy existing schema files**

```bash
mkdir -p schemas
cp data/schemas/error-code.schema.json schemas/error-code.schema.json
cp data/schemas/screen.schema.json schemas/screen.schema.json
```

- [ ] **Step 2: Update screen.schema.json to support `extends`**

Open `schemas/screen.schema.json` and add the `extends` property so per-platform screen files can declare pattern inheritance:

Replace the content of `schemas/screen.schema.json` with:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Negativ Screen Schema",
  "type": "object",
  "required": ["copyMessageKey"],
  "properties": {
    "extends": {
      "type": "string",
      "description": "Base pattern ID from screens/patterns/. Inherits defaults."
    },
    "layout": { "type": "string" },
    "copyTitle": { "type": "string" },
    "copyMessageKey": { "type": "string" },
    "illustration": { "type": "string" },
    "cta": { "type": "string" },
    "patterns": { "type": "object" },
    "accessibility": { "type": "object" },
    "figmaNote": { "type": "string" },
    "designSystemIntegrations": {
      "type": "object",
      "additionalProperties": { "type": "string" }
    }
  }
}
```

- [ ] **Step 3: Create schemas/localization.schema.json**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Negativ Localization Override Schema",
  "description": "Per-code localization file. Contains only the keys relevant to this error code. Values are ICU MessageFormat strings.",
  "type": "object",
  "additionalProperties": {
    "type": "string"
  },
  "minProperties": 1
}
```

Save to `schemas/localization.schema.json`.

- [ ] **Step 4: Commit**

```bash
git add schemas/
git commit -m "feat: add schemas/ directory with updated screen + new localization schema"
```

---

### Task 3: Create screens/patterns/ base patterns

**Files:**
- Create: `screens/patterns/client-error.json`
- Create: `screens/patterns/server-error.json`
- Create: `screens/patterns/network-error.json`
- Create: `screens/patterns/auth-error.json`

These define shared defaults inherited by per-platform screen files via `"extends"`.

- [ ] **Step 1: Create screens/patterns/client-error.json**

```json
{
  "patternId": "client-error",
  "description": "Base pattern for 4xx client errors (validation, resource, rate-limit, payment).",
  "defaults": {
    "layout": "centered illustration",
    "accessibility": {
      "ariaRole": "alert",
      "ariaLive": "polite"
    },
    "figmaNote": "Duplicate component → create variants for light/dark + RTL. Resolve copy via messageKey from localization/tokens/."
  }
}
```

- [ ] **Step 2: Create screens/patterns/server-error.json**

```json
{
  "patternId": "server-error",
  "description": "Base pattern for 5xx server errors and timeout errors.",
  "defaults": {
    "layout": "centered illustration",
    "accessibility": {
      "ariaRole": "alert",
      "ariaLive": "assertive"
    },
    "figmaNote": "Duplicate component → create variants for light/dark + RTL. Use warning-level illustration (broken server, cloud with lightning)."
  }
}
```

- [ ] **Step 3: Create screens/patterns/network-error.json**

```json
{
  "patternId": "network-error",
  "description": "Base pattern for network connectivity errors.",
  "defaults": {
    "layout": "full-screen illustration",
    "accessibility": {
      "ariaRole": "alert",
      "ariaLive": "assertive"
    },
    "figmaNote": "Duplicate component → variants for light/dark. Use offline/no-wifi illustration."
  }
}
```

- [ ] **Step 4: Create screens/patterns/auth-error.json**

```json
{
  "patternId": "auth-error",
  "description": "Base pattern for authentication and permission errors.",
  "defaults": {
    "layout": "centered illustration",
    "accessibility": {
      "ariaRole": "alert",
      "ariaLive": "polite"
    },
    "figmaNote": "Duplicate component → variants for light/dark + RTL. Use lock/shield illustration."
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add screens/
git commit -m "feat: add screens/patterns/ with 4 base pattern definitions"
```

---

### Task 4: Create localization/tokens/

**Files:**
- Create: `localization/tokens/en.json`
- Create: `localization/tokens/es.json`
- Create: `localization/supported-language.json`

- [ ] **Step 1: Copy existing messages as token files**

```bash
mkdir -p localization/tokens
cp data/localization/messages/en.json localization/tokens/en.json
cp data/localization/messages/es.json localization/tokens/es.json
cp data/localization/supported-language.json localization/supported-language.json
```

- [ ] **Step 2: Verify token files**

Run:
```bash
node -e "const en = require('./localization/tokens/en.json'); console.log('Keys:', Object.keys(en).length)"
```

Expected: `Keys: 10`

- [ ] **Step 3: Commit**

```bash
git add localization/
git commit -m "feat: add localization/tokens/ with en + es base token files"
```

---

### Task 5: Write and run the migration script

This script reads all `data/error-codes/*.json` and `data/screens/*/screen.json`, then creates the full `registry/<category>/<code>/` atom structure for all 10 existing codes.

**Files:**
- Create: `scripts/migrate.js`
- Create: `registry/<category>/<code>/` × 10 (all subdirectories + files)

**Category → base pattern mapping used by this script:**

| Category | Base pattern |
|---|---|
| validation | client-error |
| auth | auth-error |
| permission | auth-error |
| resource | client-error |
| timeout | server-error |
| rate-limit | client-error |
| server | server-error |
| network | network-error |
| payment | client-error |

- [ ] **Step 1: Create scripts/migrate.js**

```javascript
#!/usr/bin/env node
/**
 * scripts/migrate.js
 * Migrates data/error-codes/ + data/screens/ → registry/<category>/<code>/
 * Run once: npm run migrate
 */
const fs = require('fs');
const path = require('path');

const PATTERN_MAP = {
  validation: 'client-error',
  auth: 'auth-error',
  permission: 'auth-error',
  resource: 'client-error',
  timeout: 'server-error',
  'rate-limit': 'client-error',
  server: 'server-error',
  network: 'network-error',
  payment: 'client-error',
};

const ERROR_CODES_DIR = path.join(__dirname, '../data/error-codes');
const SCREENS_DIR = path.join(__dirname, '../data/screens');
const LOCALIZATION_EN = require('../localization/tokens/en.json');
const LOCALIZATION_ES = require('../localization/tokens/es.json');
const REGISTRY_DIR = path.join(__dirname, '../registry');

function mkdirp(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 4) + '\n');
  console.log(`  ✅ ${path.relative(process.cwd(), filePath)}`);
}

const codeFiles = fs.readdirSync(ERROR_CODES_DIR).filter(f => f.endsWith('.json'));

for (const file of codeFiles) {
  const code = JSON.parse(fs.readFileSync(path.join(ERROR_CODES_DIR, file), 'utf8'));
  const codeId = code.code; // e.g. "NEG-404-resource-not-found"
  const category = code.category;
  const atomDir = path.join(REGISTRY_DIR, category, codeId);

  console.log(`\nMigrating ${codeId}…`);

  // 1. index.json
  mkdirp(atomDir);
  writeJson(path.join(atomDir, 'index.json'), code);

  // 2. screens — split per platform
  const screenFile = path.join(SCREENS_DIR, codeId, 'screen.json');
  const screensDir = path.join(atomDir, 'screens');
  mkdirp(screensDir);

  if (fs.existsSync(screenFile)) {
    const screen = JSON.parse(fs.readFileSync(screenFile, 'utf8'));
    const basePattern = PATTERN_MAP[category] || 'client-error';
    const platforms = screen.platforms || {};

    for (const [platform, platformData] of Object.entries(platforms)) {
      const screenEntry = {
        extends: basePattern,
        ...platformData,
        copyMessageKey: platformData.copyMessageKey || screen.title,
      };
      // Include designSystemIntegrations + patterns + figmaNote only on desktop
      if (platform === 'desktop') {
        if (screen.patterns) screenEntry.patterns = screen.patterns;
        if (screen.figmaNote) screenEntry.figmaNote = screen.figmaNote;
        if (screen.designSystemIntegrations) screenEntry.designSystemIntegrations = screen.designSystemIntegrations;
      }
      writeJson(path.join(screensDir, `${platform}.json`), screenEntry);
    }
  } else {
    console.warn(`  ⚠️  No screen.json found for ${codeId}, skipping screens`);
  }

  // 3. localization overrides (only the key for this code)
  const locDir = path.join(atomDir, 'localization');
  mkdirp(locDir);
  const msgKey = code.messageKey;

  if (LOCALIZATION_EN[msgKey]) {
    writeJson(path.join(locDir, 'en.json'), { [msgKey]: LOCALIZATION_EN[msgKey] });
  }
  if (LOCALIZATION_ES[msgKey]) {
    writeJson(path.join(locDir, 'es.json'), { [msgKey]: LOCALIZATION_ES[msgKey] });
  }

  // 4. journey-refs.json (empty for now — journeys are added in Phase 1)
  writeJson(path.join(atomDir, 'journey-refs.json'), { journeys: [] });
}

console.log('\n🎉 Migration complete!');
```

- [ ] **Step 2: Run the migration script**

```bash
node scripts/migrate.js
```

Expected output (abbreviated):
```
Migrating NEG-000-network-offline…
  ✅ registry/network/NEG-000-network-offline/index.json
  ✅ registry/network/NEG-000-network-offline/screens/desktop.json
  ✅ registry/network/NEG-000-network-offline/screens/mobile.json
  ...
🎉 Migration complete!
```

- [ ] **Step 3: Spot-check one atom manually**

Run:
```bash
node -e "console.log(JSON.stringify(require('./registry/resource/NEG-404-resource-not-found/index.json'), null, 2))"
node -e "console.log(JSON.stringify(require('./registry/resource/NEG-404-resource-not-found/screens/desktop.json'), null, 2))"
node -e "console.log(JSON.stringify(require('./registry/resource/NEG-404-resource-not-found/localization/en.json'), null, 2))"
```

Expected for `localization/en.json`:
```json
{
    "resource.not-found": "We couldn't find what you were looking for."
}
```

Expected for `screens/desktop.json` (first field):
```json
{
    "extends": "client-error",
    ...
}
```

- [ ] **Step 4: Commit**

```bash
git add registry/ scripts/migrate.js
git commit -m "feat: migrate 10 error codes to registry/ atom structure"
```

---

### Task 6: Create registry/_template/

**Files:**
- Create: `registry/_template/index.json`
- Create: `registry/_template/screens/desktop.json`
- Create: `registry/_template/screens/mobile.json`
- Create: `registry/_template/localization/en.json`
- Create: `registry/_template/journey-refs.json`

- [ ] **Step 1: Create registry/_template/index.json**

```json
{
  "code": "NEG-000-category-subcode",
  "category": "validation",
  "httpStatus": null,
  "severity": "error",
  "title": "Short Human-Readable Title",
  "description": "One sentence describing when this error occurs.",
  "messageKey": "category.subcode",
  "recoveryAction": "One sentence telling the user what to do next.",
  "platforms": ["web", "mobile", "tablet"],
  "accessibility": {
    "ariaRole": "alert",
    "ariaLive": "polite"
  }
}
```

- [ ] **Step 2: Create registry/_template/screens/desktop.json**

```json
{
  "extends": "client-error",
  "layout": "centered illustration",
  "copyTitle": "Short Human-Readable Title",
  "copyMessageKey": "category.subcode",
  "illustration": "describe illustration here",
  "cta": "Action label",
  "patterns": {
    "fullPage": {
      "description": "When to use the full-page variant",
      "usage": "Describe the use case"
    }
  },
  "figmaNote": "Duplicate this component → variants for light/dark + RTL.",
  "designSystemIntegrations": {
    "tailwind": "class=\"flex flex-col items-center gap-6 text-slate-700 bg-white p-10 rounded-3xl shadow-sm\"",
    "shadcn": "<Alert variant=\"default\"><AlertTitle>{title}</AlertTitle><AlertDescription>{t(messageKey)}</AlertDescription></Alert>",
    "material": "<Alert severity=\"info\">{t(messageKey)}</Alert>",
    "ant": "<Alert message={title} description={t(messageKey)} type=\"info\" showIcon />"
  }
}
```

- [ ] **Step 3: Create registry/_template/screens/mobile.json**

```json
{
  "extends": "client-error",
  "layout": "full-screen illustration",
  "copyTitle": "Short Human-Readable Title",
  "copyMessageKey": "category.subcode",
  "illustration": "describe illustration here",
  "cta": "Action label"
}
```

- [ ] **Step 4: Create registry/_template/localization/en.json**

```json
{
  "category.subcode": "Human-readable message in English. Calm, helpful, actionable."
}
```

- [ ] **Step 5: Create registry/_template/journey-refs.json**

```json
{
  "journeys": []
}
```

- [ ] **Step 6: Commit**

```bash
git add registry/_template/
git commit -m "feat: add registry/_template/ contributor scaffold"
```

---

### Task 7: Rewrite scripts/validate.js

The new validator: (1) finds all `registry/<category>/<code>/index.json` files, (2) validates each against `schemas/error-code.schema.json` using ajv, (3) checks that `screens/desktop.json` and `screens/mobile.json` exist, (4) checks that `localization/en.json` exists and contains the code's `messageKey`, (5) checks that `messageKey` exists in `localization/tokens/en.json`, (6) generates `registry/index.json`.

**Files:**
- Modify: `scripts/validate.js`

- [ ] **Step 1: Write the new validator**

Replace the full contents of `scripts/validate.js` with:

```javascript
#!/usr/bin/env node
/**
 * scripts/validate.js
 * Validates all registry atoms and generates registry/index.json
 * Run: npm run validate
 */
const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

const ROOT = path.join(__dirname, '..');
const REGISTRY_DIR = path.join(ROOT, 'registry');
const SCHEMAS_DIR = path.join(ROOT, 'schemas');
const LOCALIZATION_TOKENS_EN = path.join(ROOT, 'localization/tokens/en.json');

const ajv = new Ajv({ strict: false });

const errorCodeSchema = JSON.parse(fs.readFileSync(path.join(SCHEMAS_DIR, 'error-code.schema.json'), 'utf8'));
const screenSchema = JSON.parse(fs.readFileSync(path.join(SCHEMAS_DIR, 'screen.schema.json'), 'utf8'));
const localizationSchema = JSON.parse(fs.readFileSync(path.join(SCHEMAS_DIR, 'localization.schema.json'), 'utf8'));
const tokensEn = JSON.parse(fs.readFileSync(LOCALIZATION_TOKENS_EN, 'utf8'));

const validateErrorCode = ajv.compile(errorCodeSchema);
const validateScreen = ajv.compile(screenSchema);
const validateLocalization = ajv.compile(localizationSchema);

const VALID_CATEGORIES = ['validation', 'auth', 'permission', 'resource', 'timeout', 'rate-limit', 'server', 'network', 'payment'];
const REQUIRED_PLATFORMS = ['desktop', 'mobile'];

let errors = 0;
const index = [];

function err(msg) {
  console.error(`  ❌ ${msg}`);
  errors++;
}

function checkExists(filePath, label) {
  if (!fs.existsSync(filePath)) {
    err(`Missing ${label}: ${path.relative(ROOT, filePath)}`);
    return false;
  }
  return true;
}

console.log('🔍 Validating Negativ registry...\n');

for (const category of VALID_CATEGORIES) {
  const categoryDir = path.join(REGISTRY_DIR, category);
  if (!fs.existsSync(categoryDir)) continue;

  const codeDirs = fs.readdirSync(categoryDir).filter(d => {
    return fs.statSync(path.join(categoryDir, d)).isDirectory() && !d.startsWith('_');
  });

  for (const codeDir of codeDirs) {
    const atomDir = path.join(categoryDir, codeDir);
    const indexPath = path.join(atomDir, 'index.json');
    console.log(`Checking ${category}/${codeDir}…`);

    // 1. index.json must exist and be valid
    if (!checkExists(indexPath, 'index.json')) continue;
    const code = JSON.parse(fs.readFileSync(indexPath, 'utf8'));

    if (!validateErrorCode(code)) {
      err(`index.json schema invalid: ${JSON.stringify(validateErrorCode.errors)}`);
    }

    // 2. Folder name must match code field
    if (code.code !== codeDir) {
      err(`Folder name "${codeDir}" must match code field "${code.code}"`);
    }

    // 3. Category must match folder
    if (code.category !== category) {
      err(`Category "${code.category}" in index.json must match parent folder "${category}"`);
    }

    // 4. Required screen files
    for (const platform of REQUIRED_PLATFORMS) {
      const screenPath = path.join(atomDir, 'screens', `${platform}.json`);
      if (checkExists(screenPath, `screens/${platform}.json`)) {
        const screen = JSON.parse(fs.readFileSync(screenPath, 'utf8'));
        if (!validateScreen(screen)) {
          err(`screens/${platform}.json schema invalid: ${JSON.stringify(validateScreen.errors)}`);
        }
      }
    }

    // 5. localization/en.json must exist and contain the messageKey
    const locEnPath = path.join(atomDir, 'localization', 'en.json');
    if (checkExists(locEnPath, 'localization/en.json')) {
      const locEn = JSON.parse(fs.readFileSync(locEnPath, 'utf8'));
      if (!validateLocalization(locEn)) {
        err(`localization/en.json schema invalid: ${JSON.stringify(validateLocalization.errors)}`);
      }
      if (!locEn[code.messageKey]) {
        err(`localization/en.json missing messageKey "${code.messageKey}"`);
      }
    }

    // 6. messageKey must exist in shared tokens
    if (!tokensEn[code.messageKey]) {
      err(`messageKey "${code.messageKey}" not found in localization/tokens/en.json`);
    }

    // 7. journey-refs.json must exist
    checkExists(path.join(atomDir, 'journey-refs.json'), 'journey-refs.json');

    index.push({
      code: code.code,
      category: code.category,
      httpStatus: code.httpStatus,
      severity: code.severity,
      title: code.title,
      messageKey: code.messageKey,
      _path: `registry/${category}/${codeDir}`,
    });
  }
}

// Generate registry/index.json
const indexPath = path.join(REGISTRY_DIR, 'index.json');
fs.writeFileSync(indexPath, JSON.stringify({ generated: new Date().toISOString(), count: index.length, codes: index }, null, 2) + '\n');
console.log(`\n📦 Generated registry/index.json (${index.length} codes)`);

if (errors === 0) {
  console.log(`\n✅ All ${index.length} error codes passed validation!`);
} else {
  console.error(`\n❌ ${errors} validation error(s) found.`);
  process.exit(1);
}
```

- [ ] **Step 2: Run validator and confirm it passes**

```bash
npm run validate
```

Expected:
```
🔍 Validating Negativ registry...

Checking auth/NEG-401-auth-unauthorized…
Checking auth/NEG-403-permission-forbidden…
...
📦 Generated registry/index.json (10 codes)

✅ All 10 error codes passed validation!
```

If it fails: check the error message carefully. Most likely cause is a missing field or a wrong `messageKey` in one of the migrated localization files. Fix the file named in the error output, then re-run.

- [ ] **Step 3: Commit**

```bash
git add scripts/validate.js registry/index.json
git commit -m "feat: rewrite validate.js with ajv schema checks + registry/index.json generation"
```

---

### Task 8: Move journeys/, integration/, playbooks/

**Files:**
- Create: `journeys/payment-failed.json`
- Create: `journeys/validation-failed.json`
- Create: `integration/*` (all 5 files)
- Create: `playbooks/localization-tone-guide.md`

- [ ] **Step 1: Move journeys**

```bash
mkdir -p journeys
cp data/journeys/payment-failed.json journeys/payment-failed.json
cp data/journeys/validation-failed.json journeys/validation-failed.json
```

- [ ] **Step 2: Move integration**

```bash
mkdir -p integration
cp data/integration/design-system-mapping.json integration/design-system-mapping.json
cp data/integration/figma-component-spec.json integration/figma-component-spec.json
cp data/integration/react-starter.tsx integration/react-starter.tsx
cp data/integration/storybook-example.stories.tsx integration/storybook-example.stories.tsx
cp data/integration/tailwind-patterns.css integration/tailwind-patterns.css
```

- [ ] **Step 3: Move tone guideline as playbook**

```bash
mkdir -p playbooks
cp data/localization/tone-guideline.md playbooks/localization-tone-guide.md
```

- [ ] **Step 4: Commit**

```bash
git add journeys/ integration/ playbooks/
git commit -m "feat: move journeys/, integration/, and localization tone guide to playbooks/"
```

---

### Task 9: Update .github/workflows/validate.yml

**Files:**
- Modify: `.github/workflows/validate.yml`

- [ ] **Step 1: Rewrite validate.yml**

Replace the full contents of `.github/workflows/validate.yml` with:

```yaml
name: Validate Negativ Registry

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Validate registry + generate index
        run: npm run validate

      - name: Check required files exist
        run: |
          test -f schemas/error-code.schema.json && echo "✅ error-code schema present" || exit 1
          test -f schemas/screen.schema.json && echo "✅ screen schema present" || exit 1
          test -f schemas/localization.schema.json && echo "✅ localization schema present" || exit 1
          test -f localization/tokens/en.json && echo "✅ English tokens present" || exit 1
          test -f registry/index.json && echo "✅ registry index present" || exit 1
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/validate.yml
git commit -m "ci: update workflow to use new registry/ structure and npm ci"
```

---

### Task 10: Update README.md

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace the Data Structure and Quick Start sections in README.md**

Find the section starting with `### Quick Start` and replace it (and everything below it) with:

```markdown
### Quick Start

1. Browse `registry/` — pick a category, open any error code folder.
2. Copy `registry/<category>/<code>/index.json` into your design system or LLM prompt.
3. Use `registry/index.json` for a full machine-readable snapshot of all codes.
4. Need a specific error? Open an issue or submit a PR (see [CONTRIBUTING.md](CONTRIBUTING.md)).

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
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: update README to reflect new registry/ structure"
```

---

### Task 11: Update CONTRIBUTING.md

**Files:**
- Modify: `CONTRIBUTING.md`

- [ ] **Step 1: Replace the Development Setup and filename rule sections**

Find `## Development Setup` and replace through the end of `### Filename Rule` with:

```markdown
## Development Setup

1. Fork the repo and clone it locally.
2. `git checkout -b feat/your-contribution`
3. `npm install`
4. Copy `registry/_template/` into `registry/<category>/NEG-<httpStatus>-<category>-<subcode>/`
5. Fill `index.json`, `screens/desktop.json`, `screens/mobile.json`, `localization/en.json`, `journey-refs.json`
6. Run `npm run validate` — must pass with zero errors.
7. Open a PR with a clear title and description.

## Contribution Guidelines

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
```

- [ ] **Step 2: Commit**

```bash
git add CONTRIBUTING.md
git commit -m "docs: update CONTRIBUTING.md with new registry/ contribution flow"
```

---

### Task 12: Delete data/ and run final Phase 0 validation

**Files:**
- Delete: `data/` (entire directory)

- [ ] **Step 1: Run validate one final time before deleting**

```bash
npm run validate
```

Expected: `✅ All 10 error codes passed validation!`

Do not proceed if there are errors.

- [ ] **Step 2: Delete data/ directory**

```bash
rm -rf data/
```

- [ ] **Step 3: Run validate again to confirm nothing depended on data/**

```bash
npm run validate
```

Expected: `✅ All 10 error codes passed validation!`

If this fails, it means something still imports from `data/`. Check `scripts/validate.js` and `scripts/migrate.js` for any remaining `data/` references and update the paths.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: remove data/ directory after successful migration to registry/"
```

---

## Phase 1: Core Registry v1.0

---

### Task 13: Add 12 new error codes

Add these codes to reach 22 total. Each needs: `index.json`, `screens/desktop.json`, `screens/mobile.json`, `localization/en.json`, `journey-refs.json`. Also add each new `messageKey` to `localization/tokens/en.json`.

**New codes:**

| Code | Category | HTTP | Title |
|---|---|---|---|
| NEG-401-auth-session-expired | auth | 401 | Session Expired |
| NEG-422-validation-conflict | validation | 422 | Conflicting Input |
| NEG-400-validation-length | validation | 400 | Input Too Long |
| NEG-403-permission-read-only | permission | 403 | Read-Only Access |
| NEG-409-resource-conflict | resource | 409 | Already Exists |
| NEG-410-resource-deleted | resource | 410 | No Longer Available |
| NEG-504-timeout-gateway | timeout | 504 | Gateway Timeout |
| NEG-429-rate-limit-daily | rate-limit | 429 | Daily Limit Reached |
| NEG-502-server-bad-gateway | server | 502 | Service Unavailable |
| NEG-503-server-unavailable | server | 503 | Down for Maintenance |
| NEG-000-network-slow | network | null | Slow Connection |
| NEG-402-payment-expired | payment | 402 | Card Expired |

**Files:**
- Modify: `localization/tokens/en.json`
- Create: `registry/auth/NEG-401-auth-session-expired/` (and 11 more atoms)

- [ ] **Step 1: Add new messageKeys to localization/tokens/en.json**

Open `localization/tokens/en.json` and add these entries:

```json
{
  "validation.required": "Please fill in the required field{count, plural, one {} other {s}}.",
  "validation.format": "Please enter a valid {field} (e.g. email@example.com).",
  "validation.conflict": "This value conflicts with an existing entry. Please use a different one.",
  "validation.length": "This field is too long. Please use {maxLength} characters or fewer.",
  "auth.unauthorized": "Please sign in to continue.",
  "auth.session-expired": "Your session has expired. Please sign in again.",
  "permission.forbidden": "Sorry, you don't have access to this feature.",
  "permission.read-only": "You have read-only access and cannot make changes here.",
  "resource.not-found": "We couldn't find what you were looking for.",
  "resource.conflict": "This already exists. Please use a different name or identifier.",
  "resource.deleted": "This item is no longer available.",
  "timeout.request": "The request took too long. Please try again.",
  "timeout.gateway": "A upstream service is taking too long to respond. Please try again shortly.",
  "rate-limit.exceeded": "Please wait a few moments before trying again.",
  "rate-limit.daily": "You've reached today's limit. Come back tomorrow.",
  "server.internal": "We're sorry, something went wrong on our end.",
  "server.bad-gateway": "One of our services is currently unavailable. We're looking into it.",
  "server.unavailable": "We're down for scheduled maintenance. We'll be back shortly.",
  "network.offline": "It looks like you're offline. Check your connection.",
  "network.slow": "Your connection is slow. This may take longer than usual.",
  "payment.declined": "Your payment was declined. Please try another method.",
  "payment.expired": "Your card has expired. Please update your payment details."
}
```

- [ ] **Step 2: Create registry/auth/NEG-401-auth-session-expired/**

`registry/auth/NEG-401-auth-session-expired/index.json`:
```json
{
  "code": "NEG-401-auth-session-expired",
  "category": "auth",
  "httpStatus": 401,
  "severity": "warning",
  "title": "Session Expired",
  "description": "The user's session token has expired and they need to re-authenticate.",
  "messageKey": "auth.session-expired",
  "recoveryAction": "Sign in again to continue.",
  "platforms": ["web", "mobile", "tablet"],
  "accessibility": {
    "ariaRole": "alert",
    "ariaLive": "polite"
  }
}
```

`registry/auth/NEG-401-auth-session-expired/screens/desktop.json`:
```json
{
  "extends": "auth-error",
  "layout": "centered illustration",
  "copyTitle": "Session Expired",
  "copyMessageKey": "auth.session-expired",
  "illustration": "clock or lock with timer icon",
  "cta": "Sign in again",
  "patterns": {
    "modal": {
      "description": "Intercept modal when session expires mid-flow",
      "usage": "SaaS dashboards, admin tools"
    },
    "fullPage": {
      "description": "Full-page sign-in redirect",
      "usage": "Public-facing apps"
    }
  },
  "figmaNote": "Duplicate component → variants for light/dark + RTL.",
  "designSystemIntegrations": {
    "tailwind": "class=\"flex flex-col items-center gap-6 text-slate-700 bg-white p-10 rounded-3xl shadow-sm\"",
    "shadcn": "<Alert variant=\"default\"><AlertTitle>Session Expired</AlertTitle><AlertDescription>{t('auth.session-expired')}</AlertDescription></Alert>",
    "material": "<Alert severity=\"warning\">{t('auth.session-expired')}</Alert>",
    "ant": "<Alert message=\"Session Expired\" description={t('auth.session-expired')} type=\"warning\" showIcon />"
  }
}
```

`registry/auth/NEG-401-auth-session-expired/screens/mobile.json`:
```json
{
  "extends": "auth-error",
  "layout": "full-screen illustration",
  "copyTitle": "Session Expired",
  "copyMessageKey": "auth.session-expired",
  "illustration": "clock or lock with timer icon",
  "cta": "Sign in again"
}
```

`registry/auth/NEG-401-auth-session-expired/localization/en.json`:
```json
{
  "auth.session-expired": "Your session has expired. Please sign in again."
}
```

`registry/auth/NEG-401-auth-session-expired/journey-refs.json`:
```json
{
  "journeys": ["session-expired"]
}
```

- [ ] **Step 3: Create the remaining 11 new codes**

Repeat the pattern from Step 2 for each of the following codes. All fields follow the same structure. Use the `messageKey` values defined in Step 1.

**registry/validation/NEG-422-validation-conflict/**

`index.json`:
```json
{
  "code": "NEG-422-validation-conflict",
  "category": "validation",
  "httpStatus": 422,
  "severity": "error",
  "title": "Conflicting Input",
  "description": "The submitted value conflicts with an existing entry.",
  "messageKey": "validation.conflict",
  "recoveryAction": "Use a different value that doesn't conflict with existing entries.",
  "platforms": ["web", "mobile", "tablet"],
  "accessibility": { "ariaRole": "alert", "ariaLive": "polite" }
}
```

`screens/desktop.json`:
```json
{
  "extends": "client-error",
  "layout": "inline form error",
  "copyTitle": "Conflicting Input",
  "copyMessageKey": "validation.conflict",
  "illustration": "warning icon near input field",
  "cta": "Try a different value",
  "patterns": {
    "inline": { "description": "Inline beneath the input field", "usage": "Form fields with uniqueness constraints" }
  },
  "figmaNote": "Duplicate component → variants for light/dark + RTL.",
  "designSystemIntegrations": {
    "tailwind": "class=\"text-red-600 text-sm mt-1\"",
    "shadcn": "<p className=\"text-sm text-destructive\">{t('validation.conflict')}</p>",
    "material": "<FormHelperText error>{t('validation.conflict')}</FormHelperText>",
    "ant": "<Form.Item validateStatus=\"error\" help={t('validation.conflict')} />"
  }
}
```

`screens/mobile.json`:
```json
{
  "extends": "client-error",
  "layout": "inline form error",
  "copyTitle": "Conflicting Input",
  "copyMessageKey": "validation.conflict",
  "illustration": "warning icon near input field",
  "cta": "Try a different value"
}
```

`localization/en.json`: `{ "validation.conflict": "This value conflicts with an existing entry. Please use a different one." }`

`journey-refs.json`: `{ "journeys": [] }`

---

**registry/validation/NEG-400-validation-length/**

`index.json`:
```json
{
  "code": "NEG-400-validation-length",
  "category": "validation",
  "httpStatus": 400,
  "severity": "error",
  "title": "Input Too Long",
  "description": "The submitted value exceeds the maximum allowed length.",
  "messageKey": "validation.length",
  "recoveryAction": "Shorten your input to meet the character limit.",
  "platforms": ["web", "mobile", "tablet"],
  "accessibility": { "ariaRole": "alert", "ariaLive": "polite" }
}
```

`screens/desktop.json`:
```json
{
  "extends": "client-error",
  "layout": "inline form error",
  "copyTitle": "Input Too Long",
  "copyMessageKey": "validation.length",
  "illustration": "character counter indicator",
  "cta": "Shorten your input",
  "patterns": {
    "inline": { "description": "Inline beneath input with character count", "usage": "Text inputs with max length" }
  },
  "figmaNote": "Pair with a character counter component.",
  "designSystemIntegrations": {
    "tailwind": "class=\"text-red-600 text-sm mt-1\"",
    "shadcn": "<p className=\"text-sm text-destructive\">{t('validation.length', { maxLength })}</p>",
    "material": "<FormHelperText error>{t('validation.length', { maxLength })}</FormHelperText>",
    "ant": "<Form.Item validateStatus=\"error\" help={t('validation.length', { maxLength })} />"
  }
}
```

`screens/mobile.json`:
```json
{
  "extends": "client-error",
  "layout": "inline form error",
  "copyTitle": "Input Too Long",
  "copyMessageKey": "validation.length",
  "illustration": "character counter indicator",
  "cta": "Shorten your input"
}
```

`localization/en.json`: `{ "validation.length": "This field is too long. Please use {maxLength} characters or fewer." }`

`journey-refs.json`: `{ "journeys": [] }`

---

**registry/permission/NEG-403-permission-read-only/**

`index.json`:
```json
{
  "code": "NEG-403-permission-read-only",
  "category": "permission",
  "httpStatus": 403,
  "severity": "info",
  "title": "Read-Only Access",
  "description": "The user can view but not modify this resource.",
  "messageKey": "permission.read-only",
  "recoveryAction": "Contact your administrator to request edit access.",
  "platforms": ["web", "mobile", "tablet"],
  "accessibility": { "ariaRole": "status", "ariaLive": "polite" }
}
```

`screens/desktop.json`:
```json
{
  "extends": "auth-error",
  "layout": "banner",
  "copyTitle": "Read-Only Access",
  "copyMessageKey": "permission.read-only",
  "illustration": "eye icon (view only)",
  "cta": "Request access",
  "patterns": {
    "banner": { "description": "Persistent top-of-page banner", "usage": "Shared documents, admin views" }
  },
  "figmaNote": "Use info-level color (blue), not error red.",
  "designSystemIntegrations": {
    "tailwind": "class=\"flex items-center gap-3 bg-blue-50 text-blue-800 px-4 py-2 rounded\"",
    "shadcn": "<Alert variant=\"default\"><AlertDescription>{t('permission.read-only')}</AlertDescription></Alert>",
    "material": "<Alert severity=\"info\">{t('permission.read-only')}</Alert>",
    "ant": "<Alert message={t('permission.read-only')} type=\"info\" showIcon />"
  }
}
```

`screens/mobile.json`:
```json
{
  "extends": "auth-error",
  "layout": "banner",
  "copyTitle": "Read-Only Access",
  "copyMessageKey": "permission.read-only",
  "illustration": "eye icon (view only)",
  "cta": "Request access"
}
```

`localization/en.json`: `{ "permission.read-only": "You have read-only access and cannot make changes here." }`

`journey-refs.json`: `{ "journeys": [] }`

---

**registry/resource/NEG-409-resource-conflict/**

`index.json`:
```json
{
  "code": "NEG-409-resource-conflict",
  "category": "resource",
  "httpStatus": 409,
  "severity": "error",
  "title": "Already Exists",
  "description": "The resource being created conflicts with an existing one.",
  "messageKey": "resource.conflict",
  "recoveryAction": "Use a different name or identifier.",
  "platforms": ["web", "mobile", "tablet"],
  "accessibility": { "ariaRole": "alert", "ariaLive": "polite" }
}
```

`screens/desktop.json`:
```json
{
  "extends": "client-error",
  "layout": "inline or modal",
  "copyTitle": "Already Exists",
  "copyMessageKey": "resource.conflict",
  "illustration": "duplicate documents icon",
  "cta": "Use a different name",
  "patterns": {
    "inline": { "description": "Inline error on name/identifier field", "usage": "Username, project name, slug creation" },
    "modal": { "description": "Confirmation dialog before overwrite", "usage": "File upload, import flows" }
  },
  "figmaNote": "Duplicate component → variants for light/dark.",
  "designSystemIntegrations": {
    "tailwind": "class=\"text-red-600 text-sm mt-1\"",
    "shadcn": "<p className=\"text-sm text-destructive\">{t('resource.conflict')}</p>",
    "material": "<FormHelperText error>{t('resource.conflict')}</FormHelperText>",
    "ant": "<Form.Item validateStatus=\"error\" help={t('resource.conflict')} />"
  }
}
```

`screens/mobile.json`:
```json
{
  "extends": "client-error",
  "layout": "inline or modal",
  "copyTitle": "Already Exists",
  "copyMessageKey": "resource.conflict",
  "illustration": "duplicate documents icon",
  "cta": "Use a different name"
}
```

`localization/en.json`: `{ "resource.conflict": "This already exists. Please use a different name or identifier." }`

`journey-refs.json`: `{ "journeys": [] }`

---

**registry/resource/NEG-410-resource-deleted/**

`index.json`:
```json
{
  "code": "NEG-410-resource-deleted",
  "category": "resource",
  "httpStatus": 410,
  "severity": "error",
  "title": "No Longer Available",
  "description": "The resource existed but has been permanently deleted.",
  "messageKey": "resource.deleted",
  "recoveryAction": "Go back or search for an alternative.",
  "platforms": ["web", "mobile", "tablet"],
  "accessibility": { "ariaRole": "alert", "ariaLive": "polite" }
}
```

`screens/desktop.json`:
```json
{
  "extends": "client-error",
  "layout": "centered illustration",
  "copyTitle": "No Longer Available",
  "copyMessageKey": "resource.deleted",
  "illustration": "tombstone or empty box icon",
  "cta": "Go back",
  "patterns": {
    "fullPage": { "description": "Full-page 410 error", "usage": "Deleted posts, expired links" }
  },
  "figmaNote": "Distinct from 404 — use 'deleted' not 'missing' iconography.",
  "designSystemIntegrations": {
    "tailwind": "class=\"flex flex-col items-center gap-6 text-slate-700 bg-white p-10 rounded-3xl shadow-sm\"",
    "shadcn": "<Alert variant=\"default\"><AlertTitle>No Longer Available</AlertTitle><AlertDescription>{t('resource.deleted')}</AlertDescription></Alert>",
    "material": "<Alert severity=\"info\">{t('resource.deleted')}</Alert>",
    "ant": "<Alert message=\"No Longer Available\" description={t('resource.deleted')} type=\"info\" showIcon />"
  }
}
```

`screens/mobile.json`:
```json
{
  "extends": "client-error",
  "layout": "full-screen illustration",
  "copyTitle": "No Longer Available",
  "copyMessageKey": "resource.deleted",
  "illustration": "tombstone or empty box icon",
  "cta": "Go back"
}
```

`localization/en.json`: `{ "resource.deleted": "This item is no longer available." }`

`journey-refs.json`: `{ "journeys": [] }`

---

**registry/timeout/NEG-504-timeout-gateway/**

`index.json`:
```json
{
  "code": "NEG-504-timeout-gateway",
  "category": "timeout",
  "httpStatus": 504,
  "severity": "error",
  "title": "Gateway Timeout",
  "description": "An upstream service did not respond in time.",
  "messageKey": "timeout.gateway",
  "recoveryAction": "Wait a moment and try again.",
  "platforms": ["web", "mobile", "tablet"],
  "accessibility": { "ariaRole": "alert", "ariaLive": "assertive" }
}
```

`screens/desktop.json`:
```json
{
  "extends": "server-error",
  "layout": "centered illustration",
  "copyTitle": "Gateway Timeout",
  "copyMessageKey": "timeout.gateway",
  "illustration": "server with clock or spinning loader",
  "cta": "Try again",
  "patterns": {
    "fullPage": { "description": "Full-page timeout with retry", "usage": "Page-level timeouts" },
    "inline": { "description": "Inline retry within a widget", "usage": "Dashboard components, data tables" }
  },
  "figmaNote": "Pair with a countdown or retry spinner.",
  "designSystemIntegrations": {
    "tailwind": "class=\"flex flex-col items-center gap-6 text-slate-700 bg-white p-10 rounded-3xl shadow-sm\"",
    "shadcn": "<Alert variant=\"destructive\"><AlertTitle>Gateway Timeout</AlertTitle><AlertDescription>{t('timeout.gateway')}</AlertDescription></Alert>",
    "material": "<Alert severity=\"error\">{t('timeout.gateway')}</Alert>",
    "ant": "<Alert message=\"Gateway Timeout\" description={t('timeout.gateway')} type=\"error\" showIcon />"
  }
}
```

`screens/mobile.json`:
```json
{
  "extends": "server-error",
  "layout": "full-screen illustration",
  "copyTitle": "Gateway Timeout",
  "copyMessageKey": "timeout.gateway",
  "illustration": "server with clock icon",
  "cta": "Try again"
}
```

`localization/en.json`: `{ "timeout.gateway": "A upstream service is taking too long to respond. Please try again shortly." }`

`journey-refs.json`: `{ "journeys": [] }`

---

**registry/rate-limit/NEG-429-rate-limit-daily/**

`index.json`:
```json
{
  "code": "NEG-429-rate-limit-daily",
  "category": "rate-limit",
  "httpStatus": 429,
  "severity": "warning",
  "title": "Daily Limit Reached",
  "description": "The user has exhausted their daily quota.",
  "messageKey": "rate-limit.daily",
  "recoveryAction": "Come back tomorrow or upgrade your plan.",
  "platforms": ["web", "mobile", "tablet"],
  "accessibility": { "ariaRole": "alert", "ariaLive": "polite" }
}
```

`screens/desktop.json`:
```json
{
  "extends": "client-error",
  "layout": "centered illustration",
  "copyTitle": "Daily Limit Reached",
  "copyMessageKey": "rate-limit.daily",
  "illustration": "gauge at full or bucket overflowing",
  "cta": "Upgrade plan",
  "patterns": {
    "banner": { "description": "Persistent banner warning as limit approaches", "usage": "API quota dashboards" },
    "fullPage": { "description": "Full block when limit is hit", "usage": "Freemium products" }
  },
  "figmaNote": "Use warning-level color (amber), not error red.",
  "designSystemIntegrations": {
    "tailwind": "class=\"flex flex-col items-center gap-6 text-amber-700 bg-amber-50 p-10 rounded-3xl\"",
    "shadcn": "<Alert variant=\"default\"><AlertTitle>Daily Limit Reached</AlertTitle><AlertDescription>{t('rate-limit.daily')}</AlertDescription></Alert>",
    "material": "<Alert severity=\"warning\">{t('rate-limit.daily')}</Alert>",
    "ant": "<Alert message=\"Daily Limit Reached\" description={t('rate-limit.daily')} type=\"warning\" showIcon />"
  }
}
```

`screens/mobile.json`:
```json
{
  "extends": "client-error",
  "layout": "full-screen illustration",
  "copyTitle": "Daily Limit Reached",
  "copyMessageKey": "rate-limit.daily",
  "illustration": "gauge at full",
  "cta": "Upgrade plan"
}
```

`localization/en.json`: `{ "rate-limit.daily": "You've reached today's limit. Come back tomorrow." }`

`journey-refs.json`: `{ "journeys": [] }`

---

**registry/server/NEG-502-server-bad-gateway/**

`index.json`:
```json
{
  "code": "NEG-502-server-bad-gateway",
  "category": "server",
  "httpStatus": 502,
  "severity": "error",
  "title": "Service Unavailable",
  "description": "The server received an invalid response from an upstream service.",
  "messageKey": "server.bad-gateway",
  "recoveryAction": "Try again in a few minutes.",
  "platforms": ["web", "mobile", "tablet"],
  "accessibility": { "ariaRole": "alert", "ariaLive": "assertive" }
}
```

`screens/desktop.json`:
```json
{
  "extends": "server-error",
  "layout": "centered illustration",
  "copyTitle": "Service Unavailable",
  "copyMessageKey": "server.bad-gateway",
  "illustration": "broken server or cloud with X",
  "cta": "Try again",
  "patterns": {
    "fullPage": { "description": "Full-page service error", "usage": "Core service outages" }
  },
  "figmaNote": "Duplicate component → variants for light/dark.",
  "designSystemIntegrations": {
    "tailwind": "class=\"flex flex-col items-center gap-6 text-slate-700 bg-white p-10 rounded-3xl shadow-sm\"",
    "shadcn": "<Alert variant=\"destructive\"><AlertTitle>Service Unavailable</AlertTitle><AlertDescription>{t('server.bad-gateway')}</AlertDescription></Alert>",
    "material": "<Alert severity=\"error\">{t('server.bad-gateway')}</Alert>",
    "ant": "<Alert message=\"Service Unavailable\" description={t('server.bad-gateway')} type=\"error\" showIcon />"
  }
}
```

`screens/mobile.json`:
```json
{
  "extends": "server-error",
  "layout": "full-screen illustration",
  "copyTitle": "Service Unavailable",
  "copyMessageKey": "server.bad-gateway",
  "illustration": "broken server icon",
  "cta": "Try again"
}
```

`localization/en.json`: `{ "server.bad-gateway": "One of our services is currently unavailable. We're looking into it." }`

`journey-refs.json`: `{ "journeys": [] }`

---

**registry/server/NEG-503-server-unavailable/**

`index.json`:
```json
{
  "code": "NEG-503-server-unavailable",
  "category": "server",
  "httpStatus": 503,
  "severity": "warning",
  "title": "Down for Maintenance",
  "description": "The service is temporarily unavailable due to planned maintenance.",
  "messageKey": "server.unavailable",
  "recoveryAction": "We'll be back shortly. Check our status page for updates.",
  "platforms": ["web", "mobile", "tablet"],
  "accessibility": { "ariaRole": "alert", "ariaLive": "polite" }
}
```

`screens/desktop.json`:
```json
{
  "extends": "server-error",
  "layout": "centered illustration",
  "copyTitle": "Down for Maintenance",
  "copyMessageKey": "server.unavailable",
  "illustration": "tools / hard hat icon",
  "cta": "Check status page",
  "patterns": {
    "fullPage": { "description": "Full maintenance page", "usage": "Planned downtime windows" }
  },
  "figmaNote": "Use warm/calm color palette — this is expected, not alarming.",
  "designSystemIntegrations": {
    "tailwind": "class=\"flex flex-col items-center gap-6 text-slate-700 bg-white p-10 rounded-3xl shadow-sm\"",
    "shadcn": "<Alert variant=\"default\"><AlertTitle>Down for Maintenance</AlertTitle><AlertDescription>{t('server.unavailable')}</AlertDescription></Alert>",
    "material": "<Alert severity=\"warning\">{t('server.unavailable')}</Alert>",
    "ant": "<Alert message=\"Down for Maintenance\" description={t('server.unavailable')} type=\"warning\" showIcon />"
  }
}
```

`screens/mobile.json`:
```json
{
  "extends": "server-error",
  "layout": "full-screen illustration",
  "copyTitle": "Down for Maintenance",
  "copyMessageKey": "server.unavailable",
  "illustration": "tools / hard hat icon",
  "cta": "Check status page"
}
```

`localization/en.json`: `{ "server.unavailable": "We're down for scheduled maintenance. We'll be back shortly." }`

`journey-refs.json`: `{ "journeys": [] }`

---

**registry/network/NEG-000-network-slow/**

`index.json`:
```json
{
  "code": "NEG-000-network-slow",
  "category": "network",
  "httpStatus": null,
  "severity": "warning",
  "title": "Slow Connection",
  "description": "The user's network is connected but too slow to complete the request.",
  "messageKey": "network.slow",
  "recoveryAction": "Move closer to your router or switch to a better network.",
  "platforms": ["web", "mobile", "tablet"],
  "accessibility": { "ariaRole": "status", "ariaLive": "polite" }
}
```

`screens/desktop.json`:
```json
{
  "extends": "network-error",
  "layout": "banner",
  "copyTitle": "Slow Connection",
  "copyMessageKey": "network.slow",
  "illustration": "wifi signal with one or two bars",
  "cta": "Dismiss",
  "patterns": {
    "banner": { "description": "Non-blocking top banner", "usage": "Background data loading" }
  },
  "figmaNote": "Use warning amber — non-blocking, informational.",
  "designSystemIntegrations": {
    "tailwind": "class=\"flex items-center gap-3 bg-amber-50 text-amber-800 px-4 py-2 rounded\"",
    "shadcn": "<Alert variant=\"default\"><AlertDescription>{t('network.slow')}</AlertDescription></Alert>",
    "material": "<Alert severity=\"warning\">{t('network.slow')}</Alert>",
    "ant": "<Alert message={t('network.slow')} type=\"warning\" showIcon closable />"
  }
}
```

`screens/mobile.json`:
```json
{
  "extends": "network-error",
  "layout": "banner",
  "copyTitle": "Slow Connection",
  "copyMessageKey": "network.slow",
  "illustration": "wifi signal with one or two bars",
  "cta": "Dismiss"
}
```

`localization/en.json`: `{ "network.slow": "Your connection is slow. This may take longer than usual." }`

`journey-refs.json`: `{ "journeys": [] }`

---

**registry/payment/NEG-402-payment-expired/**

`index.json`:
```json
{
  "code": "NEG-402-payment-expired",
  "category": "payment",
  "httpStatus": 402,
  "severity": "error",
  "title": "Card Expired",
  "description": "The payment card used has passed its expiration date.",
  "messageKey": "payment.expired",
  "recoveryAction": "Update your payment details with a valid card.",
  "platforms": ["web", "mobile", "tablet"],
  "accessibility": { "ariaRole": "alert", "ariaLive": "polite" }
}
```

`screens/desktop.json`:
```json
{
  "extends": "client-error",
  "layout": "inline form error",
  "copyTitle": "Card Expired",
  "copyMessageKey": "payment.expired",
  "illustration": "credit card with X or expired stamp",
  "cta": "Update payment details",
  "patterns": {
    "inline": { "description": "Inline error on card expiry field", "usage": "Checkout flows" },
    "modal": { "description": "Update card modal", "usage": "Subscription renewal" }
  },
  "figmaNote": "Sensitive context — keep tone calm, avoid blame.",
  "designSystemIntegrations": {
    "tailwind": "class=\"text-red-600 text-sm mt-1\"",
    "shadcn": "<p className=\"text-sm text-destructive\">{t('payment.expired')}</p>",
    "material": "<FormHelperText error>{t('payment.expired')}</FormHelperText>",
    "ant": "<Form.Item validateStatus=\"error\" help={t('payment.expired')} />"
  }
}
```

`screens/mobile.json`:
```json
{
  "extends": "client-error",
  "layout": "inline form error",
  "copyTitle": "Card Expired",
  "copyMessageKey": "payment.expired",
  "illustration": "credit card with expired stamp",
  "cta": "Update payment details"
}
```

`localization/en.json`: `{ "payment.expired": "Your card has expired. Please update your payment details." }`

`journey-refs.json`: `{ "journeys": [] }`

- [ ] **Step 4: Run validator to confirm all 22 codes pass**

```bash
npm run validate
```

Expected:
```
📦 Generated registry/index.json (22 codes)
✅ All 22 error codes passed validation!
```

- [ ] **Step 5: Commit**

```bash
git add registry/ localization/tokens/en.json
git commit -m "feat: add 12 new error codes to reach 22 total in registry/"
```

---

### Task 14: Add fr, zh, ar localization tokens + per-code overrides

**Files:**
- Create: `localization/tokens/fr.json`
- Create: `localization/tokens/zh.json`
- Create: `localization/tokens/ar.json`
- Create: Per-code `localization/fr.json`, `zh.json`, `ar.json` for all 22 codes
- Modify: `localization/supported-language.json`

- [ ] **Step 1: Create localization/tokens/fr.json**

```json
{
  "validation.required": "Veuillez remplir le{count, plural, one {s} other {}} champ{count, plural, one {} other {s}} obligatoire{count, plural, one {} other {s}}.",
  "validation.format": "Veuillez entrer un {field} valide (ex. email@exemple.com).",
  "validation.conflict": "Cette valeur est en conflit avec une entrée existante. Veuillez en choisir une autre.",
  "validation.length": "Ce champ est trop long. Utilisez {maxLength} caractères ou moins.",
  "auth.unauthorized": "Veuillez vous connecter pour continuer.",
  "auth.session-expired": "Votre session a expiré. Veuillez vous reconnecter.",
  "permission.forbidden": "Désolé, vous n'avez pas accès à cette fonctionnalité.",
  "permission.read-only": "Vous avez un accès en lecture seule et ne pouvez pas effectuer de modifications.",
  "resource.not-found": "Nous n'avons pas trouvé ce que vous cherchiez.",
  "resource.conflict": "Cela existe déjà. Veuillez utiliser un autre nom ou identifiant.",
  "resource.deleted": "Cet élément n'est plus disponible.",
  "timeout.request": "La requête a pris trop de temps. Veuillez réessayer.",
  "timeout.gateway": "Un service en amont met trop de temps à répondre. Veuillez réessayer dans un moment.",
  "rate-limit.exceeded": "Veuillez attendre quelques instants avant de réessayer.",
  "rate-limit.daily": "Vous avez atteint la limite quotidienne. Revenez demain.",
  "server.internal": "Désolé, une erreur s'est produite de notre côté.",
  "server.bad-gateway": "L'un de nos services est actuellement indisponible. Nous nous en occupons.",
  "server.unavailable": "Nous sommes en maintenance planifiée. Nous serons de retour sous peu.",
  "network.offline": "Vous semblez être hors ligne. Vérifiez votre connexion.",
  "network.slow": "Votre connexion est lente. Cela peut prendre plus de temps que d'habitude.",
  "payment.declined": "Votre paiement a été refusé. Veuillez essayer avec une autre méthode.",
  "payment.expired": "Votre carte a expiré. Veuillez mettre à jour vos informations de paiement."
}
```

- [ ] **Step 2: Create localization/tokens/zh.json**

```json
{
  "validation.required": "请填写必填字段。",
  "validation.format": "请输入有效的{field}（例如：email@example.com）。",
  "validation.conflict": "此值与现有条目冲突，请使用不同的值。",
  "validation.length": "此字段过长，请使用{maxLength}个字符或更少。",
  "auth.unauthorized": "请登录后继续。",
  "auth.session-expired": "您的会话已过期，请重新登录。",
  "permission.forbidden": "抱歉，您无权访问此功能。",
  "permission.read-only": "您只有只读权限，无法进行更改。",
  "resource.not-found": "我们找不到您要找的内容。",
  "resource.conflict": "此内容已存在，请使用不同的名称或标识符。",
  "resource.deleted": "此项目已不再可用。",
  "timeout.request": "请求时间过长，请重试。",
  "timeout.gateway": "上游服务响应超时，请稍后重试。",
  "rate-limit.exceeded": "请稍等片刻后再试。",
  "rate-limit.daily": "您已达到今日限额，请明天再来。",
  "server.internal": "很抱歉，我们这边出了问题。",
  "server.bad-gateway": "我们的某个服务目前不可用，我们正在处理中。",
  "server.unavailable": "我们正在进行计划维护，即将恢复。",
  "network.offline": "您似乎已离线，请检查您的网络连接。",
  "network.slow": "您的网络连接较慢，可能需要更长时间。",
  "payment.declined": "您的付款被拒绝，请尝试其他付款方式。",
  "payment.expired": "您的银行卡已过期，请更新您的付款信息。"
}
```

- [ ] **Step 3: Create localization/tokens/ar.json**

```json
{
  "validation.required": "يرجى ملء الحقل{count, plural, one {} other {ين}} المطلوب{count, plural, one {} other {ين}}.",
  "validation.format": "يرجى إدخال {field} صحيح (مثال: email@example.com).",
  "validation.conflict": "هذه القيمة تتعارض مع إدخال موجود. يرجى استخدام قيمة مختلفة.",
  "validation.length": "هذا الحقل طويل جداً. يرجى استخدام {maxLength} حرف أو أقل.",
  "auth.unauthorized": "يرجى تسجيل الدخول للمتابعة.",
  "auth.session-expired": "انتهت صلاحية جلستك. يرجى تسجيل الدخول مجدداً.",
  "permission.forbidden": "عذراً، ليس لديك صلاحية الوصول إلى هذه الميزة.",
  "permission.read-only": "لديك صلاحية القراءة فقط ولا يمكنك إجراء تغييرات.",
  "resource.not-found": "لم نتمكن من العثور على ما تبحث عنه.",
  "resource.conflict": "هذا العنصر موجود بالفعل. يرجى استخدام اسم أو معرّف مختلف.",
  "resource.deleted": "هذا العنصر لم يعد متاحاً.",
  "timeout.request": "استغرق الطلب وقتاً طويلاً. يرجى المحاولة مرة أخرى.",
  "timeout.gateway": "يستغرق أحد الخدمات وقتاً طويلاً للاستجابة. يرجى المحاولة مجدداً قريباً.",
  "rate-limit.exceeded": "يرجى الانتظار قليلاً قبل المحاولة مرة أخرى.",
  "rate-limit.daily": "لقد وصلت إلى حدك اليومي. عد غداً.",
  "server.internal": "عذراً، حدث خطأ من جانبنا.",
  "server.bad-gateway": "أحد خدماتنا غير متاح حالياً. نحن نعمل على حل المشكلة.",
  "server.unavailable": "نحن في وضع الصيانة المجدولة. سنعود قريباً.",
  "network.offline": "يبدو أنك غير متصل بالإنترنت. تحقق من اتصالك.",
  "network.slow": "اتصالك بطيء. قد يستغرق هذا وقتاً أطول من المعتاد.",
  "payment.declined": "تم رفض دفعتك. يرجى تجربة طريقة دفع أخرى.",
  "payment.expired": "انتهت صلاحية بطاقتك. يرجى تحديث بيانات الدفع الخاصة بك."
}
```

- [ ] **Step 4: Update localization/supported-language.json**

Replace the contents with:

```json
{
  "languages": [
    { "code": "en", "name": "English", "native": "English" },
    { "code": "es", "name": "Spanish", "native": "Español" },
    { "code": "fr", "name": "French", "native": "Français" },
    { "code": "zh", "name": "Chinese (Simplified)", "native": "简体中文" },
    { "code": "ar", "name": "Arabic", "native": "العربية", "rtl": true },
    { "code": "de", "name": "German", "native": "Deutsch" },
    { "code": "ja", "name": "Japanese", "native": "日本語" },
    { "code": "pt", "name": "Portuguese", "native": "Português" },
    { "code": "ru", "name": "Russian", "native": "Русский" }
  ],
  "v1Languages": ["en", "es", "fr", "zh", "ar"],
  "default": "en",
  "fallback": "en"
}
```

- [ ] **Step 5: Add per-code fr/zh/ar localization overrides for all 22 codes**

For each error code, create `registry/<category>/<code>/localization/fr.json`, `zh.json`, and `ar.json` containing only the single messageKey for that code, taken from the token files above.

Example for `registry/resource/NEG-404-resource-not-found/localization/fr.json`:
```json
{
  "resource.not-found": "Nous n'avons pas trouvé ce que vous cherchiez."
}
```

Run this shell command to generate all per-code files for fr, zh, ar programmatically using Node.js:

```bash
node -e "
const fs = require('fs');
const path = require('path');
const langs = ['fr', 'zh', 'ar'];
const REGISTRY = path.join(__dirname, 'registry');
const TOKENS = {
  fr: require('./localization/tokens/fr.json'),
  zh: require('./localization/tokens/zh.json'),
  ar: require('./localization/tokens/ar.json'),
};
for (const cat of fs.readdirSync(REGISTRY)) {
  if (cat.startsWith('_') || cat === 'index.json') continue;
  const catDir = path.join(REGISTRY, cat);
  if (!fs.statSync(catDir).isDirectory()) continue;
  for (const code of fs.readdirSync(catDir)) {
    if (code.startsWith('_')) continue;
    const indexPath = path.join(catDir, code, 'index.json');
    if (!fs.existsSync(indexPath)) continue;
    const { messageKey } = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    for (const lang of langs) {
      const val = TOKENS[lang][messageKey];
      if (!val) { console.warn('Missing', lang, messageKey); continue; }
      const outPath = path.join(catDir, code, 'localization', lang + '.json');
      fs.writeFileSync(outPath, JSON.stringify({ [messageKey]: val }, null, 4) + '\n');
      console.log('✅', path.relative(__dirname, outPath));
    }
  }
}
"
```

Expected: 66 lines of output (22 codes × 3 languages).

- [ ] **Step 6: Run validator**

```bash
npm run validate
```

Expected: `✅ All 22 error codes passed validation!`

- [ ] **Step 7: Commit**

```bash
git add localization/ registry/
git commit -m "feat: add fr, zh, ar localization tokens and per-code overrides for all 22 codes"
```

---

### Task 15: Add auth-failure and session-expired journey maps

**Files:**
- Create: `journeys/auth-failure.json`
- Create: `journeys/session-expired.json`
- Modify: `registry/auth/NEG-401-auth-unauthorized/journey-refs.json`
- Modify: `registry/auth/NEG-401-auth-session-expired/journey-refs.json`

- [ ] **Step 1: Create journeys/auth-failure.json**

```json
{
  "journeyId": "auth-failure",
  "title": "Authentication Failure → Recovery Flow",
  "description": "Negative journey when a user fails to authenticate (wrong credentials, locked account).",
  "mermaid": "graph TD\n    A[User submits credentials] --> B{Auth API response?}\n    B -->|401 Wrong credentials| C[NEG-401-auth-unauthorized screen]\n    C --> D{User action?}\n    D -->|Retry| A\n    D -->|Forgot password| E[Password reset flow]\n    D -->|Contact support| F[Support escalation]\n    E --> G[Reset email sent]\n    G --> H[User resets password]\n    H --> A\n    B -->|429 Too many attempts| I[NEG-429-rate-limit-exceeded screen]\n    I --> J[Wait + retry]\n    B -->|Network error| K[NEG-000-network-offline screen]",
  "steps": [
    {
      "step": 1,
      "trigger": "Auth API returns 401",
      "screen": "NEG-401-auth-unauthorized",
      "userAction": "Retry or initiate password reset"
    },
    {
      "step": 2,
      "trigger": "Too many failed attempts → 429",
      "screen": "NEG-429-rate-limit-exceeded",
      "userAction": "Wait for cooldown period"
    },
    {
      "step": 3,
      "trigger": "User requests password reset",
      "screen": "Password reset confirmation (success state)",
      "userAction": "Check email"
    }
  ],
  "errorCodes": ["NEG-401-auth-unauthorized", "NEG-429-rate-limit-exceeded", "NEG-000-network-offline"],
  "localizationNote": "All screens reuse centralized messageKeys from localization/tokens/"
}
```

- [ ] **Step 2: Create journeys/session-expired.json**

```json
{
  "journeyId": "session-expired",
  "title": "Session Expiry → Re-authentication Flow",
  "description": "Negative journey when a user's session token expires mid-usage.",
  "mermaid": "graph TD\n    A[User performs action] --> B{Token valid?}\n    B -->|Expired| C[NEG-401-auth-session-expired screen]\n    C --> D{User action?}\n    D -->|Sign in again| E[Auth flow]\n    D -->|Dismiss| F[Redirect to login page]\n    E -->|Success| G[Return to original action]\n    E -->|Fail| H[NEG-401-auth-unauthorized]\n    B -->|Network error| I[NEG-000-network-offline]",
  "steps": [
    {
      "step": 1,
      "trigger": "API call returns 401 with session-expired code",
      "screen": "NEG-401-auth-session-expired",
      "userAction": "Sign in again or dismiss"
    },
    {
      "step": 2,
      "trigger": "User re-authenticates successfully",
      "screen": "Return to original page/action",
      "userAction": "Resume task"
    },
    {
      "step": 3,
      "trigger": "Re-authentication fails",
      "screen": "NEG-401-auth-unauthorized",
      "userAction": "Retry or contact support"
    }
  ],
  "errorCodes": ["NEG-401-auth-session-expired", "NEG-401-auth-unauthorized", "NEG-000-network-offline"],
  "localizationNote": "All screens reuse centralized messageKeys from localization/tokens/"
}
```

- [ ] **Step 3: Update journey-refs for NEG-401-auth-unauthorized**

Replace contents of `registry/auth/NEG-401-auth-unauthorized/journey-refs.json`:

```json
{
  "journeys": ["auth-failure", "session-expired"]
}
```

- [ ] **Step 4: Confirm NEG-401-auth-session-expired/journey-refs.json already references session-expired**

```bash
cat registry/auth/NEG-401-auth-session-expired/journey-refs.json
```

Expected: `{ "journeys": ["session-expired"] }` (set in Task 13).

- [ ] **Step 5: Commit**

```bash
git add journeys/ registry/auth/NEG-401-auth-unauthorized/journey-refs.json
git commit -m "feat: add auth-failure and session-expired journey maps"
```

---

### Task 16: Write 3 playbooks

**Files:**
- Create: `playbooks/writing-error-messages.md`
- Create: `playbooks/accessibility-checklist.md`
- (Note: `playbooks/localization-tone-guide.md` already created in Task 8)

- [ ] **Step 1: Create playbooks/writing-error-messages.md**

```markdown
# Writing Error Messages

The four rules every error message must follow in Negativ.

---

## Rule 1: Say what happened

Bad: "Something went wrong."
Good: "We couldn't save your changes."

Users need to know what failed. Be specific about the operation, not the system.

## Rule 2: Say why (if it helps)

Bad: "Payment failed."
Good: "Your payment was declined. This can happen when card details are incorrect or funds are unavailable."

Only include the reason if it helps the user fix the problem. Don't expose internal errors.

## Rule 3: Say what to do next

Every error must include a recovery action — even if the only action is "try again."

Bad: "Network error."
Good: "It looks like you're offline. Check your connection and try again."

Recovery actions:
- Should be specific: "Go back to the sign-in page" not "Try again"
- Should use imperative verbs: "Check", "Update", "Contact"
- Should never blame the user: "Your connection" not "You disconnected"

## Rule 4: Match the severity

| Severity | When to use | Tone |
|---|---|---|
| `info` | Something the user should know, but doesn't block them | Calm, neutral |
| `warning` | Something that may become a problem | Cautious, helpful |
| `error` | Something that blocks the user from completing their task | Clear, actionable, never alarming |

---

## Anti-Patterns

| Anti-pattern | Why it's bad | Fix |
|---|---|---|
| "Error 500" | Meaningless to users | "Something went wrong on our end" |
| "Invalid input" | Doesn't say which field or why | "Please enter a valid email address" |
| "You must be logged in" | Blame-shifting | "Please sign in to continue" |
| "An unexpected error occurred" | Adds fear, no recovery path | "We couldn't load this page. Try refreshing." |
| All-caps error text | Creates panic | Use sentence case |
| Error modals for minor issues | Interrupts flow unnecessarily | Use inline errors for form validation |

---

## Tone Checklist

Before shipping an error message, ask:
- [ ] Does it say what happened?
- [ ] Does it give a next step?
- [ ] Is it calm (no panic words like "failed", "crashed", "broken")?
- [ ] Does it avoid blaming the user?
- [ ] Is it 1-2 sentences max?
- [ ] Does it work in all languages (no idioms, no wordplay)?
```

- [ ] **Step 2: Create playbooks/accessibility-checklist.md**

```markdown
# Accessibility Checklist for Error States

Error states require extra care for accessibility. Users who rely on screen readers, keyboard navigation, or high contrast modes are most likely to struggle when something goes wrong.

---

## ARIA Requirements

Every error message must have:

```html
role="alert"           <!-- announces immediately to screen readers -->
aria-live="polite"     <!-- for most errors: waits for current speech to finish -->
aria-live="assertive"  <!-- for blocking/critical errors: interrupts immediately -->
```

Use `assertive` only for errors that completely block the user (network offline, server down).
Use `polite` for everything else (validation errors, warnings).

## Focus Management

When an error appears:

1. **Inline validation errors** — focus stays on the field. The error is announced via `aria-describedby` linking the field to the error message.

   ```html
   <input id="email" aria-describedby="email-error" aria-invalid="true" />
   <p id="email-error" role="alert">Please enter a valid email address.</p>
   ```

2. **Full-page errors** — move focus to the error heading so screen readers announce it immediately.

   ```javascript
   errorHeading.focus(); // after rendering the error page
   ```

3. **Modal errors** — trap focus inside the modal. Return focus to the trigger element when dismissed.

## Color + Contrast

- Never use color alone to indicate an error. Always pair with an icon or text label.
- Error text must meet WCAG AA contrast: at minimum 4.5:1 against its background.
- Provide a high-contrast variant for all error screens (see `screens/patterns/`).

## Icon Usage

- Use `aria-hidden="true"` on decorative error icons.
- For meaningful icons (the only indicator of state), add `aria-label`.

```html
<!-- Decorative: hidden from screen readers -->
<svg aria-hidden="true">...</svg>

<!-- Meaningful: announced -->
<svg aria-label="Error" role="img">...</svg>
```

## Keyboard Navigation

- All CTAs in error states (retry, go home, contact support) must be reachable via `Tab`.
- Retry buttons must trigger the same action as clicking.
- Dismiss buttons must close the error and return focus correctly.

## Testing Checklist

Before shipping any error screen:

- [ ] Tested with VoiceOver (macOS/iOS) or NVDA (Windows)
- [ ] Error announced immediately on appear
- [ ] Focus moves to error heading on full-page errors
- [ ] CTA button reachable via keyboard
- [ ] Color contrast passes WCAG AA (4.5:1)
- [ ] Error readable without color (icon + text label present)
- [ ] RTL layout tested for Arabic/Hebrew if localized
```

- [ ] **Step 3: Commit**

```bash
git add playbooks/
git commit -m "feat: add writing-error-messages and accessibility playbooks"
```

---

### Task 17: Final validation + registry/index.json regeneration

**Files:**
- Modify: `registry/index.json` (regenerated)

- [ ] **Step 1: Run full validation**

```bash
npm run validate
```

Expected:
```
🔍 Validating Negativ registry...
...
📦 Generated registry/index.json (22 codes)
✅ All 22 error codes passed validation!
```

If any errors appear: read the error message, find the file named, fix the issue (usually a missing `messageKey` in a localization file or a mismatched folder name), and re-run.

- [ ] **Step 2: Verify registry/index.json**

```bash
node -e "
const idx = require('./registry/index.json');
console.log('Total codes:', idx.count);
console.log('Generated:', idx.generated);
const cats = [...new Set(idx.codes.map(c => c.category))].sort();
console.log('Categories:', cats.join(', '));
"
```

Expected:
```
Total codes: 22
Generated: 2026-04-12T...
Categories: auth, network, payment, permission, rate-limit, resource, server, timeout, validation
```

- [ ] **Step 3: Check success criteria from spec**

Run each check:

```bash
# 1. 20+ error codes fully populated
node -e "const {count} = require('./registry/index.json'); console.log(count >= 20 ? '✅ ' + count + ' codes' : '❌ Only ' + count)"

# 2. 5 core languages present
node -e "
const langs = ['en','es','fr','zh','ar'];
const fs = require('fs');
langs.forEach(l => {
  const ok = fs.existsSync('localization/tokens/' + l + '.json');
  console.log(ok ? '✅ ' + l : '❌ missing ' + l);
});
"

# 3. 3 journey maps present
node -e "
const fs = require('fs');
['auth-failure','payment-failed','session-expired'].forEach(j => {
  const ok = fs.existsSync('journeys/' + j + '.json');
  console.log(ok ? '✅ ' + j : '❌ missing ' + j);
});
"

# 4. 3 playbooks present
node -e "
const fs = require('fs');
['writing-error-messages','accessibility-checklist','localization-tone-guide'].forEach(p => {
  const ok = fs.existsSync('playbooks/' + p + '.md');
  console.log(ok ? '✅ ' + p : '❌ missing ' + p);
});
"
```

All checks must show ✅ before proceeding.

- [ ] **Step 4: Final commit**

```bash
git add registry/index.json
git commit -m "chore: regenerate registry/index.json for v1.0 — 22 codes, 5 languages, 3 journeys, 3 playbooks"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task(s) |
|---|---|
| registry/ atom structure (error code as the atom) | Task 5 |
| Category grouping within registry/ | Task 5 |
| Pattern inheritance for screens (extends) | Task 3, Task 5 |
| Token-based localization (shared tokens + overrides) | Task 4, Task 13-14 |
| Generated registry/index.json | Task 7 |
| Migration from data/ → registry/ | Tasks 5, 8 |
| schemas/ directory | Task 2 |
| screens/patterns/ | Task 3 |
| localization/tokens/ | Task 4 |
| journeys/ | Tasks 8, 15 |
| integration/ | Task 8 |
| playbooks/ | Tasks 8, 16 |
| Updated validate.js with ajv + referential integrity | Task 7 |
| Updated CI workflow | Task 9 |
| Updated README + CONTRIBUTING | Tasks 10, 11 |
| Delete data/ | Task 12 |
| 20+ error codes | Task 13 |
| 5 languages (en, es, fr, zh, ar) | Task 14 |
| 3 journey maps | Task 15 |
| 3 playbooks | Task 16 |
| registry/_template/ | Task 6 |
| Success criteria verification | Task 17 |

**No gaps found.**
