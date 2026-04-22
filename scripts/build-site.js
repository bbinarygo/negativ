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
  buildImpactPage();
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
      '<td><button class="copy-btn" onclick="copyMsg(this,' + JSON.stringify(msg).replace(/"/g, '&quot;') + ')">Copy</button></td>' +
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

function buildImpactPage() {
  const data    = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/negative-ux-benchmarks.json'), 'utf8'));
  const benchmarks    = data.benchmarks || [];
  const contributions = data.contributions || [];

  const benchmarkRows = benchmarks.map(b =>
    '<tr>' +
      '<td>' + esc(b.metric) + '</td>' +
      '<td><strong>' + esc(b.value) + '</strong></td>' +
      '<td>' + esc(b.impact || '\u2014') + '</td>' +
      '<td>' + esc(b.source) + (b.year ? ' (' + esc(String(b.year)) + ')' : '') + '</td>' +
    '</tr>'
  ).join('\n');

  const contributionCards = contributions.length === 0
    ? '<div class="empty-state"><p>No community contributions yet. <a href="https://github.com/bbinarygo/negativ/blob/main/playbooks/negative-ux-roi.md" target="_blank" rel="noopener">Be the first \u2014 add your company\'s data &rarr;</a></p></div>'
    : contributions.map(c =>
        '<div class="reg-card">' +
          '<div class="card-meta">' +
            '<span class="code-badge">' + esc(c.company) + '</span>' +
            (c.industry ? ' <span class="locale-badge">' + esc(c.industry) + '</span>' : '') +
          '</div>' +
          '<div class="screen-preview" style="min-height:60px">' +
            '<div class="preview-msg">' + esc(c.metric) + '</div>' +
            '<div style="margin-top:0.4rem;font-size:0.8rem;color:var(--text2)">' +
              esc(c.before) + ' &rarr; ' + esc(c.after) +
              (c.lift ? ' &nbsp;<strong style="color:var(--accent)">' + esc(c.lift) + '</strong>' : '') +
            '</div>' +
          '</div>' +
          '<div class="card-actions" style="font-size:0.75rem;color:var(--text2)">' +
            (c.contributor ? '@' + esc(c.contributor) : '') +
            (c.source ? ' \u00b7 ' + esc(c.source) : '') +
          '</div>' +
        '</div>'
      ).join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Impact Dashboard \u2014 negativ</title>
  <meta name="description" content="Industry benchmarks and community ROI data for negative UX \u2014 cart abandonment, validation errors, and recovery flows." />
  <link rel="stylesheet" href="../assets/css/custom.css" />
</head>
<body>

<nav class="nav">
  <a class="nav-logo" href="../">negativ</a>
  <div class="nav-links">
    <a href="../registry/">Registry</a>
    <a href="../playbooks/">Playbooks</a>
    <a href="../impact/">Impact</a>
    <a href="../contribute/">Contribute</a>
    <a class="nav-gh" href="https://github.com/bbinarygo/negativ" target="_blank" rel="noopener">&#9733; GitHub</a>
  </div>
</nav>

<div style="max-width:900px;margin:2rem auto;padding:0 2rem">
  <h1 style="font-size:1.4rem;margin-bottom:0.4rem">Negative UX by the numbers</h1>
  <p style="color:var(--text2);font-size:0.9rem;margin-bottom:0.5rem">Real data from Baymard, PwC, and the Negativ community.</p>
  <p style="margin-bottom:1.5rem">
    <span class="locale-badge">${contributions.length} community contribution${contributions.length === 1 ? '' : 's'}</span>
  </p>

  <h2 style="font-size:1rem;margin-bottom:0.75rem">Industry Benchmarks</h2>
  <div style="overflow-x:auto;margin-bottom:2rem">
    <table class="copy-table">
      <thead><tr><th>Metric</th><th>Value</th><th>Business Impact</th><th>Source</th></tr></thead>
      <tbody>
${benchmarkRows}
      </tbody>
    </table>
  </div>

  <h2 style="font-size:1rem;margin-bottom:0.75rem">Community Contributions</h2>
  <div class="card-grid" style="grid-template-columns:repeat(auto-fill,minmax(280px,1fr));margin-bottom:2rem">
${contributionCards}
  </div>

  <div style="background:var(--surface2);border-radius:8px;padding:1.25rem 1.5rem;margin-bottom:2rem">
    <strong>Add your company\u2019s data</strong>
    <p style="margin:0.4rem 0 0.75rem;color:var(--text2);font-size:0.9rem">Every contribution gets featured here. Submit via PR \u2014 anonymized or attributed.</p>
    <a class="card-btn" href="https://github.com/bbinarygo/negativ/blob/main/playbooks/negative-ux-roi.md" target="_blank" rel="noopener">ROI Playbook &rarr;</a>
  </div>
</div>

<footer class="footer">
  <span>negativ</span>
  <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener">CC BY-SA 4.0</a>
  <a href="https://github.com/bbinarygo/negativ" target="_blank" rel="noopener">GitHub</a>
  <span class="footer-mono">npm install @negativ/core</span>
</footer>

</body>
</html>`;

  const outDir = path.join(ROOT, 'docs/impact');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
  console.log('build-site: generated impact page');
}

if (require.main === module) buildSite();
module.exports = { buildSite };
