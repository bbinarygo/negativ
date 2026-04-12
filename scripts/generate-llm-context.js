#!/usr/bin/env node
/**
 * scripts/generate-llm-context.js
 * Generates llm-context.json and llm-context.md from the registry.
 * Run: node scripts/generate-llm-context.js
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// Load registry index (source of truth for code list)
const registryIndex = JSON.parse(fs.readFileSync(path.join(ROOT, 'registry/index.json'), 'utf8'));

// Load v1 languages from supported-language.json
const supportedLangs = JSON.parse(fs.readFileSync(path.join(ROOT, 'localization/supported-language.json'), 'utf8'));
const v1Languages = supportedLangs.v1Languages;

// Build error codes: full atom details + per-language translations
const errorCodes = registryIndex.codes.map(entry => {
  const atomPath = path.join(ROOT, entry._path);
  const atom = JSON.parse(fs.readFileSync(path.join(atomPath, 'index.json'), 'utf8'));

  const messages = {};
  for (const lang of v1Languages) {
    const locPath = path.join(atomPath, 'localization', `${lang}.json`);
    if (fs.existsSync(locPath)) {
      const locData = JSON.parse(fs.readFileSync(locPath, 'utf8'));
      const resolved = locData[atom.messageKey];
      if (resolved === undefined) {
        console.warn(`  WARN: ${atom.code}/${lang}.json — key '${atom.messageKey}' not found`);
      } else {
        messages[lang] = resolved;
      }
    } else {
      console.warn(`  WARN: ${atom.code} — missing ${lang}.json`);
    }
  }

  return {
    code: atom.code,
    category: atom.category,
    httpStatus: atom.httpStatus,
    severity: atom.severity,
    title: atom.title,
    description: atom.description,
    messageKey: atom.messageKey,
    recoveryAction: atom.recoveryAction,
    platforms: atom.platforms,
    accessibility: atom.accessibility,
    messages,
  };
});

// Load all journey maps (inlined in full)
const journeysDir = path.join(ROOT, 'journeys');
const journeys = fs.readdirSync(journeysDir)
  .filter(f => f.endsWith('.json'))
  .sort()
  .map(f => JSON.parse(fs.readFileSync(path.join(journeysDir, f), 'utf8')));

// Build playbook references (path only, name derived from filename)
function toTitleCase(str) {
  return str.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

const playbooksDir = path.join(ROOT, 'playbooks');
const playbooks = fs.readdirSync(playbooksDir)
  .filter(f => f.endsWith('.md'))
  .sort()
  .map(f => ({
    name: toTitleCase(path.basename(f, '.md')),
    path: `playbooks/${f}`,
  }));

// ── JSON output ──────────────────────────────────────────────────────────────

const jsonOutput = {
  meta: {
    version: '1.0',
    generated: new Date().toISOString(),
    source: 'https://github.com/bbinarygo/negativ',
    description: 'Negativ error code registry — LLM context pack',
  },
  errorCodes,
  journeys,
  playbooks,
};

fs.writeFileSync(
  path.join(ROOT, 'llm-context.json'),
  JSON.stringify(jsonOutput, null, 2) + '\n'
);
console.log(`✅ llm-context.json — ${errorCodes.length} codes, ${journeys.length} journeys, ${playbooks.length} playbooks`);

// ── Markdown output ──────────────────────────────────────────────────────────

function buildMarkdown() {
  const lines = [];

  lines.push('# Negativ Error Code Registry — LLM Context Pack');
  lines.push(`_Generated: ${jsonOutput.meta.generated} · ${errorCodes.length} codes · ${v1Languages.length} languages · Source: ${jsonOutput.meta.source}_`);
  lines.push('');

  // Quick-lookup table
  lines.push(`## Error Codes (${errorCodes.length})`);
  lines.push('');
  lines.push('| Code | Category | HTTP | Severity | Title |');
  lines.push('|------|----------|------|----------|-------|');
  for (const c of errorCodes) {
    lines.push(`| ${c.code} | ${c.category} | ${c.httpStatus ?? '—'} | ${c.severity} | ${c.title} |`);
  }
  lines.push('');

  // Per-code detail blocks
  for (const c of errorCodes) {
    lines.push(`### ${c.code} — ${c.title}`);
    lines.push(`- **Description:** ${c.description}`);
    lines.push(`- **Recovery:** ${c.recoveryAction}`);
    lines.push(`- **Platforms:** ${c.platforms.join(', ')}`);
    lines.push(`- **Accessibility:** role=${c.accessibility.ariaRole}, aria-live=${c.accessibility.ariaLive}`);
    lines.push('- **Messages:**');
    for (const [lang, msg] of Object.entries(c.messages)) {
      lines.push(`  - ${lang}: "${msg}"`);
    }
    lines.push('');
  }

  // Journey maps
  lines.push(`## Customer Journeys (${journeys.length})`);
  lines.push('');
  for (const j of journeys) {
    lines.push(`### ${j.title}`);
    lines.push(j.description);
    lines.push('');
    lines.push('**Steps:**');
    for (const s of (j.steps || [])) {
      lines.push(`${s.step}. Trigger: ${s.trigger} → Screen: \`${s.screen}\` → User action: ${s.userAction}`);
    }
    lines.push('');
    lines.push(`**Error codes involved:** ${(j.errorCodes || []).join(', ')}`);
    lines.push('');
  }

  // Playbooks
  lines.push('## Playbooks');
  lines.push('');
  for (const p of playbooks) {
    lines.push(`- [\`${p.name}\`](${p.path})`);
  }
  lines.push('');

  return lines.join('\n');
}

const mdContent = buildMarkdown();
fs.writeFileSync(path.join(ROOT, 'llm-context.md'), mdContent);
console.log(`✅ llm-context.md — ${mdContent.split('\n').length - 1} lines`);
