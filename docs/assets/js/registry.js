/* registry.js — fetch + render + filter registry cards
   Field names from schemas/error-code.schema.json:
   code, category, severity (info|warning|error), title, messageKey,
   recoveryAction, description, httpStatus, platforms, _path          */

const RAW = 'https://raw.githubusercontent.com/bbinarygo/negativ/main/';

let allCodes = [];
let tokens = {};

async function init() {
  const grid = document.getElementById('card-grid');
  const countEl = document.getElementById('filter-count');

  // Show skeletons
  grid.innerHTML = Array(6).fill('<div class="skeleton-card skeleton"></div>').join('');

  try {
    const [indexRes, tokensRes] = await Promise.all([
      fetch(RAW + 'registry/index.json'),
      fetch(RAW + 'localization/tokens/en.json')
    ]);
    const index = await indexRes.json();
    tokens = await tokensRes.json();
    allCodes = index.codes;
  } catch (e) {
    grid.innerHTML = '<div class="empty-state"><strong>Could not load registry.</strong><p>Check your connection or view the <a href="https://github.com/bbinarygo/negativ/tree/main/registry">raw files on GitHub</a>.</p></div>';
    return;
  }

  populateFilters();
  syncFiltersFromURL();
  render();
  bindFilters();
}

function populateFilters() {
  const cats = ['', ...new Set(allCodes.map(c => c.category))].sort();
  const sevs = ['', 'error', 'warning', 'info'];
  const catEl = document.getElementById('filter-cat');
  const sevEl = document.getElementById('filter-sev');
  cats.forEach(c => { const o = document.createElement('option'); o.value = c; o.textContent = c || 'All categories'; catEl.appendChild(o); });
  sevs.forEach(s => { const o = document.createElement('option'); o.value = s; o.textContent = s || 'All severities'; sevEl.appendChild(o); });
}

function getFilters() {
  return {
    cat: document.getElementById('filter-cat').value,
    sev: document.getElementById('filter-sev').value,
    q:   document.getElementById('filter-q').value.toLowerCase().trim()
  };
}

function syncFiltersFromURL() {
  const p = new URLSearchParams(location.search);
  if (p.get('category')) document.getElementById('filter-cat').value = p.get('category');
  if (p.get('severity')) document.getElementById('filter-sev').value = p.get('severity');
  if (p.get('q'))        document.getElementById('filter-q').value   = p.get('q');
}

function pushURL(f) {
  const p = new URLSearchParams();
  if (f.cat) p.set('category', f.cat);
  if (f.sev) p.set('severity', f.sev);
  if (f.q)   p.set('q', f.q);
  history.replaceState(null, '', p.toString() ? '?' + p.toString() : location.pathname);
}

function filtered(f) {
  return allCodes.filter(c =>
    (!f.cat || c.category === f.cat) &&
    (!f.sev || c.severity === f.sev) &&
    (!f.q   || c.code.toLowerCase().includes(f.q) || c.title.toLowerCase().includes(f.q))
  );
}

function render() {
  const f = getFilters();
  const codes = filtered(f);
  const grid = document.getElementById('card-grid');
  const countEl = document.getElementById('filter-count');
  pushURL(f);
  if (countEl) countEl.textContent = codes.length + ' code' + (codes.length !== 1 ? 's' : '');
  if (!codes.length) {
    grid.innerHTML = '<div class="empty-state"><strong>No codes match your filter.</strong><p>Try clearing the filters above.</p></div>';
    return;
  }
  grid.innerHTML = codes.map(cardHTML).join('');
}

function cardHTML(c) {
  const msg = tokens[c.messageKey] || c.description || '';
  const msgSnippet = msg.length > 80 ? msg.slice(0, 80) + '\u2026' : msg;
  const editURL = `https://github.com/bbinarygo/negativ/edit/main/${c._path}/index.json`;
  return `<div class="reg-card">
  <div class="card-meta">
    <span class="code-badge">${c.code.split('-').slice(0,2).join('-')}</span>
    <span class="sev-chip sev-${c.severity}">${c.severity}</span>
    <span class="cat-label">${c.category}</span>
  </div>
  <div class="screen-preview">
    <div class="preview-title">${escHtml(c.title)}</div>
    <div class="preview-msg">${escHtml(msgSnippet)}</div>
    <span class="preview-cta">${escHtml(c.recoveryAction || 'Dismiss')}</span>
  </div>
  <div class="card-actions">
    <button class="card-btn" onclick="copyJSON('${escAttr(c._path)}', '${escAttr(c.code)}')">Copy JSON</button>
    <a class="card-btn" href="${escAttr(editURL)}" target="_blank" rel="noopener">Edit</a>
  </div>
</div>`;
}

async function copyJSON(path, code) {
  try {
    const res = await fetch(RAW + path + '/index.json');
    const text = await res.text();
    await navigator.clipboard.writeText(text);
    showToast('Copied JSON for ' + code);
  } catch {
    showToast('Copy failed — try manually');
  }
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 1800);
}

function bindFilters() {
  ['filter-cat','filter-sev','filter-q'].forEach(id => {
    document.getElementById(id).addEventListener('input', render);
  });
}

function escHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function escAttr(s) { return String(s).replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

document.addEventListener('DOMContentLoaded', init);

// Exported for landing page preview use
window.registryInit = init;
window.registryCardHTML = cardHTML;
window.registryFiltered = filtered;
window.registryAllCodes = () => allCodes;
window.registryTokens = () => tokens;
