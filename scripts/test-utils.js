#!/usr/bin/env node
/* test-utils.js — TDD test for docs/assets/js/utils.js
   Tests: esc(), fetchJSON() with cache, renderCard()          */

const utils = require('../docs/assets/js/utils.js');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    testsPassed++;
  } else {
    console.log(`  ✗ ${message}`);
    testsFailed++;
  }
}

function assertEqual(actual, expected, message) {
  if (actual === expected) {
    console.log(`  ✓ ${message}`);
    testsPassed++;
  } else {
    console.log(`  ✗ ${message}`);
    console.log(`    Expected: ${expected}`);
    console.log(`    Actual: ${actual}`);
    testsFailed++;
  }
}

// ── esc() tests ──────────────────────────────────────────────────────────
console.log('\n📋 Testing esc() function');

assertEqual(utils.esc('hello'), 'hello', 'Plain text unchanged');
assertEqual(utils.esc('hello & world'), 'hello &amp; world', 'Ampersand escaped');
assertEqual(utils.esc('<script>'), '&lt;script&gt;', 'HTML tags escaped');
assertEqual(utils.esc('test"value'), 'test&quot;value', 'Double quotes escaped');
assertEqual(utils.esc('a&b<c>d"e'), 'a&amp;b&lt;c&gt;d&quot;e', 'Multiple special chars');

// ── fetchJSON() tests with mock ──────────────────────────────────────────
console.log('\n📋 Testing fetchJSON() with cache');

(async () => {
  // Mock fetch globally for testing
  let fetchCallCount = 0;
  global.fetch = async (url) => {
    fetchCallCount++;
    // Simulate network delay
    await new Promise(r => setTimeout(r, 10));
    return {
      json: async () => ({ url, data: 'test-data', timestamp: Date.now() })
    };
  };

  const testUrl = 'https://example.com/test.json';
  const result1 = await utils.fetchJSON(testUrl);
  assert(result1.url === testUrl, 'fetchJSON returns data');
  assert(result1.data === 'test-data', 'Data contains expected payload');

  // Second call should be cached (no additional fetch)
  const result2 = await utils.fetchJSON(testUrl);
  assertEqual(fetchCallCount, 1, 'Second call uses cache (fetch count = 1)');
  assertEqual(result1.timestamp, result2.timestamp, 'Cached result has same timestamp');

  // Different URL should trigger new fetch
  const result3 = await utils.fetchJSON('https://example.com/other.json');
  assertEqual(fetchCallCount, 2, 'Different URL triggers new fetch (fetch count = 2)');
  assert(result3.url === 'https://example.com/other.json', 'Different URL fetched correctly');

  // ── renderCard() tests ───────────────────────────────────────────
  console.log('\n📋 Testing renderCard() function');

  const cardData = {
    code: 'NEG-401-auth-session-expired',
    category: 'auth',
    severity: 'error',
    title: 'Session expired',
    messageKey: 'auth.session-expired',
    recoveryAction: 'Log in again',
    description: 'Your session has timed out.',
    _path: 'registry/auth/401'
  };

  const tokens = {
    'auth.session-expired': 'Your session has ended. Please log in again to continue.'
  };

  const html = utils.renderCard(cardData, tokens);
  assert(html.includes('NEG-401'), 'Card includes code prefix');
  assert(html.includes('error'), 'Card includes severity');
  assert(html.includes('auth'), 'Card includes category');
  assert(html.includes('Session expired'), 'Card includes title');
  assert(html.includes('Your session has ended'), 'Card includes message token');
  assert(html.includes('Log in again'), 'Card includes recovery action');
  assert(html.includes('class="reg-card"'), 'Card has correct CSS class');

  // Test message truncation
  const longCardData = {
    ...cardData,
    messageKey: 'long.message'
  };
  const longTokens = {
    'long.message': 'A'.repeat(100)
  };
  const longCard = utils.renderCard(longCardData, longTokens);
  assert(longCard.includes('…'), 'Long messages are truncated');
  assert(!longCard.includes('A'.repeat(85)), 'Truncation removes excess characters');

  // ── Summary ──────────────────────────────────────────────────────
  console.log('\n' + '='.repeat(50));
  console.log(`Tests passed: ${testsPassed}`);
  console.log(`Tests failed: ${testsFailed}`);
  console.log('='.repeat(50) + '\n');

  process.exit(testsFailed > 0 ? 1 : 0);
})();
