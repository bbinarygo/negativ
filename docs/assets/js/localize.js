/* localize.js — fetch language token files, diff against en.json */

const RAW = 'https://raw.githubusercontent.com/bbinarygo/negativ/main/';

async function localizeInit() {
  const tbody = document.getElementById('lang-tbody');
  tbody.innerHTML = '<tr><td colspan="6" style="color:var(--text3);padding:1rem">Loading&hellip;</td></tr>';

  const [enRes, supportedRes] = await Promise.all([
    fetch(RAW + 'localization/tokens/en.json'),
    fetch(RAW + 'localization/supported-language.json')
  ]);
  const en = await enRes.json();
  const supported = await supportedRes.json();
  const enKeys = Object.keys(en);

  const rows = await Promise.all(supported.languages.map(async lang => {
    if (lang.code === 'en') return { lang, total: enKeys.length, translated: enKeys.length, missing: [] };
    try {
      const res = await fetch(RAW + 'localization/tokens/' + lang.code + '.json');
      if (!res.ok) return { lang, total: enKeys.length, translated: 0, missing: enKeys };
      const tokens = await res.json();
      const missing = enKeys.filter(k => !tokens[k]);
      return { lang, total: enKeys.length, translated: enKeys.length - missing.length, missing };
    } catch {
      return { lang, total: enKeys.length, translated: 0, missing: enKeys };
    }
  }));

  tbody.innerHTML = rows.map(r => {
    const pct = Math.round((r.translated / r.total) * 100);
    const isV1 = supported.v1Languages.includes(r.lang.code);
    const issueURL = 'https://github.com/bbinarygo/negativ/issues/new?template=translation.yml&title=' +
      encodeURIComponent('translation: ' + r.lang.name + ' (' + r.lang.code + ')');
    const v1Badge = isV1 ? ' <span style="font-size:0.7rem;background:rgba(124,58,237,.2);color:var(--accent2);border-radius:3px;padding:1px 5px">v1</span>' : '';
    const progressBar = '<div style="background:var(--surface2);border-radius:999px;height:6px;width:80px;overflow:hidden">' +
      '<div style="height:100%;background:' + (pct === 100 ? 'var(--sev-info)' : 'var(--accent)') + ';width:' + pct + '%"></div>' +
      '</div><span style="font-size:0.75rem;color:var(--text3)">' + pct + '%</span>';
    const action = r.missing.length
      ? '<a href="' + issueURL + '" target="_blank" style="font-size:0.82rem">Contribute &rarr;</a>'
      : '&mdash;';
    return '<tr>' +
      '<td style="padding:0.6rem 1rem"><strong>' + r.lang.native + '</strong> <span style="color:var(--text3);font-size:0.8rem">' + r.lang.code + '</span>' + v1Badge + '</td>' +
      '<td style="padding:0.6rem 1rem;color:var(--text2)">' + r.total + '</td>' +
      '<td style="padding:0.6rem 1rem;color:var(--text2)">' + r.translated + '</td>' +
      '<td style="padding:0.6rem 1rem;color:' + (r.missing.length ? 'var(--sev-warning)' : 'var(--sev-info)') + '">' + r.missing.length + '</td>' +
      '<td style="padding:0.6rem 1rem">' + progressBar + '</td>' +
      '<td style="padding:0.6rem 1rem">' + action + '</td>' +
      '</tr>';
  }).join('');
}

document.addEventListener('DOMContentLoaded', localizeInit);
