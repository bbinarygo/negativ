/* utils.js — Shared utility functions for registry, wizard, and localize pages
   - esc(): Escape HTML special characters for safe output
   - fetchJSON(): Fetch JSON with in-memory cache
   - renderCard(): Render error code card HTML                                    */

// ── esc() ────────────────────────────────────────────────────────────────
// Escape HTML special characters to prevent XSS attacks
// Returns safe string suitable for innerHTML
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── fetchJSON() ──────────────────────────────────────────────────────────
// Fetch JSON from URL with in-memory caching to reduce network calls
// Returns Promise<Object> — the parsed JSON response
const fetchCache = {};

async function fetchJSON(url) {
  if (fetchCache[url]) {
    return fetchCache[url];
  }
  const response = await fetch(url);
  const data = await response.json();
  fetchCache[url] = data;
  return data;
}

// ── renderCard() ─────────────────────────────────────────────────────────
// Render a single error code card as HTML
// Takes: cardData (error code object), tokens (localization strings)
// Returns: HTML string ready for insertion into DOM
function renderCard(cardData, tokens) {
  const c = cardData;
  const msg = tokens[c.messageKey] || c.description || '';
  const msgSnippet = msg.length > 80 ? msg.slice(0, 80) + '\u2026' : msg;
  const editURL = `https://github.com/bbinarygo/negativ/edit/main/${c._path}/index.json`;

  return `<div class="reg-card">
  <div class="card-meta">
    <span class="code-badge">${esc(c.code.split('-').slice(0, 2).join('-'))}</span>
    <span class="sev-chip sev-${esc(c.severity)}">${esc(c.severity)}</span>
    <span class="cat-label">${esc(c.category)}</span>
  </div>
  <a class="card-detail-link" href="${esc(c.code)}/">
    <div class="screen-preview">
      <div class="preview-title">${esc(c.title)}</div>
      <div class="preview-msg">${esc(msgSnippet)}</div>
      <span class="preview-cta">${esc(c.recoveryAction || 'Dismiss')}</span>
    </div>
  </a>
  <div class="card-actions">
    <button class="card-btn" onclick="copyJSON('${esc(c._path).replace(/"/g, '&quot;')}', '${esc(c.code).replace(/"/g, '&quot;')}')">Copy JSON</button>
    <a class="card-btn" href="${esc(editURL).replace(/"/g, '&quot;')}" target="_blank" rel="noopener">Edit</a>
  </div>
</div>`;
}

// ── Module exports (Node.js/CommonJS for testing) ────────────────────────
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    esc,
    fetchJSON,
    renderCard
  };
}

// ── Global exports (browser use) ─────────────────────────────────────────
if (typeof window !== 'undefined') {
  window.Utils = { esc, fetchJSON, renderCard };
}
