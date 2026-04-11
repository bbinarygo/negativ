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
