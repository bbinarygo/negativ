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

  // 4. journey-refs.json (empty for now)
  writeJson(path.join(atomDir, 'journey-refs.json'), { journeys: [] });
}

console.log('\n🎉 Migration complete!');
