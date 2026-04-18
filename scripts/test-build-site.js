#!/usr/bin/env node
'use strict';
const fs   = require('fs');
const path = require('path');
const { buildSite } = require('./build-site');

const ROOT         = path.join(__dirname, '..');
const DOCS_REG     = path.join(ROOT, 'docs/registry');
const registry     = JSON.parse(fs.readFileSync(path.join(ROOT, 'registry/index.json'), 'utf8'));
const expectedCount = registry.count;

buildSite();

// Verify count
const generated = registry.codes.filter(c =>
  fs.existsSync(path.join(DOCS_REG, c.code, 'index.html'))
);
console.assert(generated.length === expectedCount,
  `FAIL: Expected ${expectedCount} pages, got ${generated.length}`);

// Spot-check NEG-400-validation-format
const neg400 = fs.readFileSync(path.join(DOCS_REG, 'NEG-400-validation-format', 'index.html'), 'utf8');
console.assert(neg400.includes('Invalid Format'),        'FAIL: NEG-400 title missing');
console.assert(neg400.includes('validation.format'),     'FAIL: NEG-400 messageKey missing');
console.assert(neg400.includes('dir="rtl"'),             'FAIL: NEG-400 Arabic RTL row missing');
console.assert(neg400.includes('lang-tag-override'),     'FAIL: NEG-400 locale override row missing');
console.assert(neg400.includes('breadcrumb'),            'FAIL: NEG-400 breadcrumb missing');
console.assert(neg400.includes('a11y-grid'),             'FAIL: NEG-400 accessibility section missing');

// Spot-check NEG-401 for CCPA locale override
const neg401 = fs.readFileSync(path.join(DOCS_REG, 'NEG-401-auth-unauthorized', 'index.html'), 'utf8');
console.assert(neg401.includes('CCPA'),                                 'FAIL: NEG-401 CCPA badge missing');
console.assert(neg401.includes('California Consumer Privacy Act'),      'FAIL: NEG-401 CCPA override text missing');

console.log(`\nbuild-site tests: PASS — ${generated.length}/${expectedCount} detail pages generated`);
