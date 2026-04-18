#!/usr/bin/env node
'use strict';
const fs   = require('fs');
const path = require('path');

const ROOT        = path.join(__dirname, '..');
const DOCS_REG    = path.join(ROOT, 'docs/registry');

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildSite() {
  const registryIndex    = JSON.parse(fs.readFileSync(path.join(ROOT, 'registry/index.json'), 'utf8'));
  const langData         = JSON.parse(fs.readFileSync(path.join(ROOT, 'localization/supported-language.json'), 'utf8'));
  const supportedLocales = JSON.parse(fs.readFileSync(path.join(ROOT, 'localization/supported-locales.json'), 'utf8'));

  const v1Languages = langData.v1Languages;
  const langMeta    = {};
  langData.languages.forEach(l => { langMeta[l.code] = l; });

  // Load shared base-language token files
  const tokens = {};
  for (const lang of v1Languages) {
    tokens[lang] = JSON.parse(fs.readFileSync(path.join(ROOT, `localization/tokens/${lang}.json`), 'utf8'));
  }

  // Load shared locale-override token files (en-US, vi-VN)
  const sharedLocaleTokens = {};
  for (const locale of Object.keys(supportedLocales)) {
    const p = path.join(ROOT, `localization/tokens/${locale}.json`);
    if (fs.existsSync(p)) sharedLocaleTokens[locale] = JSON.parse(fs.readFileSync(p, 'utf8'));
  }

  let count = 0;
  for (const entry of registryIndex.codes) {
    const atomPath = path.join(ROOT, entry._path);
    const atom     = JSON.parse(fs.readFileSync(path.join(atomPath, 'index.json'), 'utf8'));

    // Resolve base-language messages (same pattern as generate-llm-context.js)
    const messages = {};
    for (const lang of v1Languages) {
      const locFile = path.join(atomPath, 'localization', `${lang}.json`);
      if (fs.existsSync(locFile)) {
        const d = JSON.parse(fs.readFileSync(locFile, 'utf8'));
        if (d[atom.messageKey] !== undefined) { messages[lang] = d[atom.messageKey]; continue; }
      }
      messages[lang] = (tokens[lang] && tokens[lang][atom.messageKey]) || '';
    }

    // Resolve locale-override messages: per-code → shared locale token → base language fallback
    const localeMessages = {};
    for (const [locale, localeConf] of Object.entries(supportedLocales)) {
      const base         = localeConf.inherits;
      if (!base) {
        console.warn(`  WARN: locale '${locale}' has no 'inherits' field — skipping`);
        continue;
      }
      const overridePath = path.join(atomPath, 'localization', `${locale}.json`);
      if (fs.existsSync(overridePath)) {
        const d = JSON.parse(fs.readFileSync(overridePath, 'utf8'));
        if (d[atom.messageKey] !== undefined) { localeMessages[locale] = d[atom.messageKey]; continue; }
      }
      if (sharedLocaleTokens[locale] && sharedLocaleTokens[locale][atom.messageKey] !== undefined) {
        localeMessages[locale] = sharedLocaleTokens[locale][atom.messageKey]; continue;
      }
      localeMessages[locale] = messages[base] || '';
    }

    const related = registryIndex.codes
      .filter(c => c.category === atom.category && c.code !== atom.code)
      .slice(0, 3);

    const html = generateHTML({ atom, messages, localeMessages, related, langMeta, supportedLocales });
    const outDir = path.join(DOCS_REG, atom.code);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
    count++;
  }

  console.log(`build-site: generated ${count} detail pages`);
}

function generateHTML({ atom, messages, localeMessages, related, langMeta, supportedLocales }) {
  const { code, title, description, messageKey, recoveryAction, httpStatus, severity, category, platforms, accessibility } = atom;

  const sevColor = { error: '#f87171', warning: '#fbbf24', info: '#34d399' }[severity] || '#94a3b8';

  // Copy table — locale order: en, en-US, es, fr, zh, ar, vi, vi-VN
  const localeOrder = ['en', 'en-US', 'es', 'fr', 'zh', 'ar', 'vi', 'vi-VN'];
  const copyRows = localeOrder.map(locale => {
    const isLocaleOverride = locale in supportedLocales;
    const msg = isLocaleOverride ? localeMessages[locale] : messages[locale];
    if (!msg) return '';

    const isRTL       = isLocaleOverride ? (supportedLocales[locale].rtl === true) : !!(langMeta[locale] && langMeta[locale].rtl);
    const regulatory  = isLocaleOverride && supportedLocales[locale].regulatory ? supportedLocales[locale].regulatory : [];
    const baseCode    = isLocaleOverride ? supportedLocales[locale].inherits : locale;
    const nativeName  = (langMeta[baseCode] && langMeta[baseCode].native) || locale;

    return '<tr>' +
      '<td>' +
        '<span class="lang-tag' + (isLocaleOverride ? ' lang-tag-override' : '') + '">' + esc(locale) + '</span>' +
        '<div class="lang-native">' + esc(nativeName) + '</div>' +
        (isLocaleOverride ? '<div class="lang-native" style="color:var(--accent2);font-size:0.65rem">locale override</div>' : '') +
      '</td>' +
      '<td' + (isRTL ? ' dir="rtl"' : '') + '>' +
        esc(msg) +
        regulatory.map(r => ' <span class="locale-badge">' + esc(r) + '</span>').join('') +
      '</td>' +
      '<td><button class="copy-btn" onclick="copyMsg(this,' + JSON.stringify(msg) + ')">Copy</button></td>' +
    '</tr>';
  }).filter(Boolean).join('\n');

  const relatedHTML = related.length ? (
    '<div class="detail-section">' +
      '<h2>Related Codes</h2>' +
      '<div class="related-grid">' +
        related.map(r =>
          '<a class="related-card" href="../' + esc(r.code) + '/">' +
            '<span class="code-badge">' + esc(r.code.split('-').slice(0,2).join('-')) + '</span>' +
            '<div class="related-card-title">' + esc(r.title) + '</div>' +
          '</a>'
        ).join('') +
      '</div>' +
    '</div>'
  ) : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)} \u2014 negativ</title>
  <meta name="description" content="${esc(description)}" />
  <link rel="stylesheet" href="../../assets/css/custom.css" />
</head>
<body>

<nav class="nav">
  <a class="nav-logo" href="../../">negativ</a>
  <div class="nav-links">
    <a href="../../registry/">Registry</a>
    <a href="../../playbooks/">Playbooks</a>
    <a href="../../contribute/">Contribute</a>
    <a class="nav-gh" href="https://github.com/bbinarygo/negativ" target="_blank" rel="noopener">&#9733; GitHub</a>
  </div>
</nav>

<div class="breadcrumb">
  <a href="../../">negativ</a>
  <span class="breadcrumb-sep">/</span>
  <a href="../../registry/?category=${esc(category)}">${esc(category)}</a>
  <span class="breadcrumb-sep">/</span>
  <span>${esc(code)}</span>
</div>

<div class="detail-header">
  <div class="detail-http-badge" style="background:${sevColor}22;color:${sevColor}">${httpStatus != null ? httpStatus : '\u2014'}</div>
  <div class="detail-code">${esc(code)}</div>
  <h1 class="detail-title">${esc(title)}</h1>
  <div class="detail-chips">
    <span class="sev-chip sev-${esc(severity)}">${esc(severity)}</span>
    <span class="cat-label">${esc(category)}</span>
    ${(platforms || []).map(p => '<span class="platform-chip">' + esc(p) + '</span>').join('')}
  </div>
  <p class="detail-description">${esc(description)}</p>
</div>

<div class="detail-section">
  <h2>Localized Copy <span class="msg-key-badge">${esc(messageKey)}</span></h2>
  <table class="copy-table">
    <thead><tr><th>Language</th><th>Message</th><th></th></tr></thead>
    <tbody>
${copyRows}
    </tbody>
  </table>
</div>

<div class="detail-section">
  <h2>Recovery Action</h2>
  <p class="detail-recovery">${esc(recoveryAction || '')}</p>
</div>

<div class="detail-section">
  <h2>Accessibility</h2>
  <div class="a11y-grid">
    <div class="a11y-item">
      <div class="a11y-label">aria-role</div>
      <div class="a11y-value">${esc((accessibility && accessibility.ariaRole) || '\u2014')}</div>
    </div>
    <div class="a11y-item">
      <div class="a11y-label">aria-live</div>
      <div class="a11y-value">${esc((accessibility && accessibility.ariaLive) || '\u2014')}</div>
    </div>
  </div>
</div>

${relatedHTML}

<div id="toast" class="toast"></div>

<footer class="footer">
  <span>negativ</span>
  <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener">CC BY-SA 4.0</a>
  <a href="https://github.com/bbinarygo/negativ" target="_blank" rel="noopener">GitHub</a>
  <span class="footer-mono">npm install @negativ/core</span>
</footer>

<script>
function copyMsg(btn, text) {
  navigator.clipboard.writeText(text).then(function() {
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(function() { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 1500);
  }).catch(function() {
    btn.textContent = 'Failed';
    setTimeout(function() { btn.textContent = 'Copy'; }, 1500);
  });
}
</script>
</body>
</html>`;
}

if (require.main === module) buildSite();
module.exports = { buildSite };
