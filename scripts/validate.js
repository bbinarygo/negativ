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
const LOCALIZATION_SUPPORTED_LOCALES = path.join(ROOT, 'localization/supported-locales.json');
const VERTICALS_DIR = path.join(ROOT, 'verticals');
const VALID_VERTICALS = ['fintech', 'healthtech', 'ecommerce'];

const ajv = new Ajv({ strict: false });

const errorCodeSchema = JSON.parse(fs.readFileSync(path.join(SCHEMAS_DIR, 'error-code.schema.json'), 'utf8'));
const screenSchema = JSON.parse(fs.readFileSync(path.join(SCHEMAS_DIR, 'screen.schema.json'), 'utf8'));
const localizationSchema = JSON.parse(fs.readFileSync(path.join(SCHEMAS_DIR, 'localization.schema.json'), 'utf8'));
const tokensEn = JSON.parse(fs.readFileSync(LOCALIZATION_TOKENS_EN, 'utf8'));

const supportedLocales = fs.existsSync(LOCALIZATION_SUPPORTED_LOCALES)
  ? JSON.parse(fs.readFileSync(LOCALIZATION_SUPPORTED_LOCALES, 'utf8'))
  : {};
const localeKeys = Object.keys(supportedLocales);

const validateErrorCode = ajv.compile(errorCodeSchema);
const validateScreen = ajv.compile(screenSchema);
const validateLocalization = ajv.compile(localizationSchema);

const VALID_CATEGORIES = ['validation', 'auth', 'permission', 'resource', 'timeout', 'rate-limit', 'server', 'network', 'payment'];
const REQUIRED_PLATFORMS = ['desktop', 'mobile'];
const VALID_PLAYBOOK_RULES = [
  'rule-1-say-what-happened',
  'rule-2-say-why',
  'rule-3-recovery-action',
  'rule-4-match-severity',
];

function validateCodeEnrichment(code, codeDir) {
  if (Array.isArray(code.playbookRules) && code.playbookRules.length > 0) {
    for (const rule of code.playbookRules) {
      if (!VALID_PLAYBOOK_RULES.includes(rule)) {
        err(`playbookRules contains unknown rule ID "${rule}"`);
      }
    }
  }
  if (code.triggers && code.triggers.length === 0) {
    console.warn(`  ⚠️  triggers is present but empty in ${codeDir}`);
  }
}

let errors = 0;
const index = [];
let totalVerticalCodes = 0;

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

    // 8. playbookRules values must match known enum if present
    validateCodeEnrichment(code, codeDir);

    // 9. Optional locale override files
    const foundLocales = [];
    for (const locale of localeKeys) {
      const locPath = path.join(atomDir, 'localization', `${locale}.json`);
      if (fs.existsSync(locPath)) {
        const locData = JSON.parse(fs.readFileSync(locPath, 'utf8'));
        if (!validateLocalization(locData)) {
          err(`localization/${locale}.json schema invalid: ${JSON.stringify(validateLocalization.errors)}`);
        }
        foundLocales.push(locale);
      }
    }

    index.push({
      code: code.code,
      category: code.category,
      httpStatus: code.httpStatus,
      severity: code.severity,
      title: code.title,
      messageKey: code.messageKey,
      _path: `registry/${category}/${codeDir}`,
      ...(foundLocales.length > 0 ? { supportedLocales: foundLocales } : {}),
    });
  }
}

// Validate verticals and generate per-vertical indexes
if (fs.existsSync(VERTICALS_DIR)) {
  for (const vertical of VALID_VERTICALS) {
    const verticalDir = path.join(VERTICALS_DIR, vertical);
    if (!fs.existsSync(verticalDir)) continue;
    const verticalIndex = [];

    const codeDirs = fs.readdirSync(verticalDir).filter(d => {
      return fs.statSync(path.join(verticalDir, d)).isDirectory() && !d.startsWith('_');
    });

    for (const codeDir of codeDirs) {
      const atomDir = path.join(verticalDir, codeDir);
      const indexPath = path.join(atomDir, 'index.json');
      console.log(`Checking ${vertical}/${codeDir}…`);

      if (!checkExists(indexPath, 'index.json')) continue;
      const code = JSON.parse(fs.readFileSync(indexPath, 'utf8'));

      if (!validateErrorCode(code)) {
        err(`index.json schema invalid: ${JSON.stringify(validateErrorCode.errors)}`);
      }
      if (code.code !== codeDir) {
        err(`Folder name "${codeDir}" must match code field "${code.code}"`);
      }
      if (code.category !== vertical) {
        err(`Category "${code.category}" in index.json must match vertical folder "${vertical}"`);
      }
      for (const platform of REQUIRED_PLATFORMS) {
        const screenPath = path.join(atomDir, 'screens', `${platform}.json`);
        if (checkExists(screenPath, `screens/${platform}.json`)) {
          const screen = JSON.parse(fs.readFileSync(screenPath, 'utf8'));
          if (!validateScreen(screen)) {
            err(`screens/${platform}.json schema invalid: ${JSON.stringify(validateScreen.errors)}`);
          }
        }
      }
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
      if (!tokensEn[code.messageKey]) {
        err(`messageKey "${code.messageKey}" not found in localization/tokens/en.json`);
      }
      checkExists(path.join(atomDir, 'journey-refs.json'), 'journey-refs.json');

      // playbookRules values must match known enum if present
      validateCodeEnrichment(code, codeDir);

      const foundLocales = [];
      for (const locale of localeKeys) {
        const locPath = path.join(atomDir, 'localization', `${locale}.json`);
        if (fs.existsSync(locPath)) {
          const locData = JSON.parse(fs.readFileSync(locPath, 'utf8'));
          if (!validateLocalization(locData)) {
            err(`localization/${locale}.json schema invalid: ${JSON.stringify(validateLocalization.errors)}`);
          }
          foundLocales.push(locale);
        }
      }

      verticalIndex.push({
        code: code.code,
        category: code.category,
        httpStatus: code.httpStatus,
        severity: code.severity,
        title: code.title,
        messageKey: code.messageKey,
        _path: `verticals/${vertical}/${codeDir}`,
        ...(foundLocales.length > 0 ? { supportedLocales: foundLocales } : {}),
      });
    }

    const verticalIndexPath = path.join(verticalDir, 'index.json');
    fs.writeFileSync(verticalIndexPath, JSON.stringify({
      generated: new Date().toISOString(),
      vertical,
      count: verticalIndex.length,
      codes: verticalIndex,
      ...(localeKeys.length > 0 ? { availableLocales: localeKeys } : {}),
    }, null, 2) + '\n');
    console.log(`\n📦 Generated verticals/${vertical}/index.json (${verticalIndex.length} codes)`);
    totalVerticalCodes += verticalIndex.length;
  }
}

// Generate registry/index.json
const indexPath = path.join(REGISTRY_DIR, 'index.json');
fs.writeFileSync(indexPath, JSON.stringify({
  generated: new Date().toISOString(),
  count: index.length,
  codes: index,
  ...(localeKeys.length > 0 ? { availableLocales: localeKeys } : {}),
}, null, 2) + '\n');
console.log(`\n📦 Generated registry/index.json (${index.length} codes)`);

// ── Playbooks index ──────────────────────────────────────────────────────
const playbooksDir = path.join(__dirname, '..', 'playbooks');
const playbookFiles = fs.readdirSync(playbooksDir).filter(f => f.endsWith('.md'));
const playbookIndex = playbookFiles.map(filename => {
  const raw = fs.readFileSync(path.join(playbooksDir, filename), 'utf8');
  const lines = raw.split('\n');
  const titleLine = lines.find(l => l.startsWith('# ')) || '';
  const title = titleLine.replace(/^# /, '').trim();
  let summary = '';
  let pastTitle = false;
  for (const line of lines) {
    if (!pastTitle) { if (line.startsWith('# ')) pastTitle = true; continue; }
    if (line.startsWith('#') || line.startsWith('---')) continue;
    if (line.trim()) { summary = line.trim(); break; }
  }
  // Extract rule IDs from headings with {#rule-id} anchors
  const rules = [];
  for (const line of lines) {
    const match = line.match(/^##\s+(.+?)\s+\{#([a-z0-9-]+)\}/);
    if (match) {
      rules.push({ id: match[2], label: match[1].replace(/^Rule \d+:\s*/, '').trim() });
    }
  }
  const slug = filename.replace(/\.md$/, '');
  return { slug, title, summary, path: `playbooks/${filename}`, ...(rules.length > 0 ? { rules } : {}) };
});
fs.writeFileSync(
  path.join(playbooksDir, 'index.json'),
  JSON.stringify({ count: playbookIndex.length, playbooks: playbookIndex }, null, 2) + '\n'
);
console.log(`\n📦 Generated playbooks/index.json (${playbookIndex.length} playbooks)`);

if (errors === 0) {
  const verticalNote = totalVerticalCodes > 0 ? ` + ${totalVerticalCodes} vertical codes` : '';
  console.log(`\n✅ All ${index.length} registry codes${verticalNote} passed validation!`);
} else {
  console.error(`\n❌ ${errors} validation error(s) found.`);
  process.exit(1);
}
