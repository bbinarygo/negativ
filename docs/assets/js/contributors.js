/* contributors.js — GitHub contributor leaderboard for /contribute/ page
   - fetchContributors(): calls GitHub API (3 endpoints), builds enriched list
   - computeScore(): pure function — contributions, linesChanged, repoStars → number
   - renderLeaderboard(): injects contributor cards into .contrib-grid
   - initContributors(): entry point, called on DOMContentLoaded              */

const GITHUB_API = 'https://api.github.com/repos/bbinarygo/negativ';
const RANK_BADGES = ['🥇', '🥈', '🥉'];

// ── Score ─────────────────────────────────────────────────────────────────
function computeScore(contributor, linesMap, repoStars) {
  const lines = linesMap[contributor.login] || 0;
  const firstTimer = contributor.contributions === 1 ? 25 : 0;
  const base = (contributor.contributions * 10) + (lines * 0.1) + firstTimer;
  return Math.round(base * (1 + repoStars / 1000));
}

// ── Fetch ─────────────────────────────────────────────────────────────────
async function fetchContributors() {
  const fetchJSON = (typeof Utils !== 'undefined')
    ? Utils.fetchJSON
    : (url) => fetch(url).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });

  const [rawContributors, repo, pulls] = await Promise.all([
    fetchJSON(GITHUB_API + '/contributors?per_page=100'),
    fetchJSON(GITHUB_API),
    fetchJSON(GITHUB_API + '/pulls?state=closed&per_page=100')
  ]);

  const repoStars = repo.stargazers_count || 0;

  const linesMap = {};
  pulls
    .filter(p => p.merged_at !== null)
    .forEach(p => {
      const login = p.user && p.user.login;
      if (!login) return;
      linesMap[login] = (linesMap[login] || 0) + (p.additions || 0) + (p.deletions || 0);
    });

  const scored = rawContributors.map(c => ({
    login: c.login,
    avatarUrl: c.avatar_url,
    contributions: c.contributions,
    score: computeScore(c, linesMap, repoStars)
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored;
}

// ── Render ────────────────────────────────────────────────────────────────
function renderLeaderboard(contributors) {
  const grid = document.querySelector('.contrib-grid');
  if (!grid) return;

  const esc = (typeof Utils !== 'undefined') ? Utils.esc : s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');

  if (contributors.length === 0) {
    grid.innerHTML = '<p class="contrib-empty">No contributors yet — be the first!</p>';
    return;
  }

  grid.innerHTML = contributors.map((c, i) => {
    const rank = RANK_BADGES[i] ? `<span class="contrib-rank">${RANK_BADGES[i]}</span>` : '';
    return `<a class="contrib-card" href="https://github.com/${esc(c.login)}" target="_blank" rel="noopener">
  <img class="contrib-avatar" src="${esc(c.avatarUrl)}" alt="${esc(c.login)}" width="40" height="40" onerror="this.src='https://github.com/ghost.png'" />
  <div class="contrib-info">
    <span class="contrib-login">@${esc(c.login)}${rank}</span>
    <span class="contrib-prs">${esc(String(c.contributions))} contribution${c.contributions === 1 ? '' : 's'}</span>
    <span class="contrib-score">Score: ${esc(String(c.score))}</span>
  </div>
</a>`;
  }).join('');
}

function showError() {
  const grid = document.querySelector('.contrib-grid');
  if (!grid) return;
  grid.innerHTML = '<p class="contrib-empty">Unable to load — <a href="https://github.com/bbinarygo/negativ/graphs/contributors" target="_blank" rel="noopener">view contributors on GitHub</a></p>';
}

function renderSkeletons() {
  const grid = document.querySelector('.contrib-grid');
  if (!grid) return;
  grid.innerHTML = Array(8).fill('<div class="contrib-card contrib-skel"><div class="contrib-avatar skeleton"></div><div class="contrib-info"><div class="skeleton" style="width:80px;height:12px;margin-bottom:6px"></div><div class="skeleton" style="width:60px;height:10px;margin-bottom:4px"></div><div class="skeleton" style="width:50px;height:10px"></div></div></div>').join('');
}

// ── Init ──────────────────────────────────────────────────────────────────
async function initContributors() {
  renderSkeletons();
  try {
    const contributors = await fetchContributors();
    renderLeaderboard(contributors);
  } catch (e) {
    showError();
  }
}

// ── Exports ───────────────────────────────────────────────────────────────
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { computeScore };
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initContributors);
}
