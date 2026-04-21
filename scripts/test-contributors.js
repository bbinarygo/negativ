#!/usr/bin/env node
/* test-contributors.js — TDD tests for computeScore() in contributors.js */

// contributors.js does not exist yet — this will throw on require until Task 2
let contributors;
try {
  contributors = require('../docs/assets/js/contributors.js');
} catch (e) {
  console.error('contributors.js not found — run after Task 2');
  process.exit(1);
}

const { computeScore } = contributors;

let passed = 0;
let failed = 0;

function assertEqual(actual, expected, message) {
  if (actual === expected) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.log(`  ✗ ${message}`);
    console.log(`    Expected: ${expected}`);
    console.log(`    Actual:   ${actual}`);
    failed++;
  }
}

console.log('\n📋 Testing computeScore()');

// base = (1 * 10) + (0 * 0.1) + 25 firstTimer, multiplier = 1 + 0/1000 = 1
assertEqual(
  computeScore({ login: 'a', contributions: 1 }, {}, 0),
  35,
  'First-timer with 0 lines, 0 stars → base 35, multiplier 1 → 35'
);

// base = (5 * 10) + (100 * 0.1) + 0 = 60, multiplier = 1 + 500/1000 = 1.5 → 90
assertEqual(
  computeScore({ login: 'b', contributions: 5 }, { b: 100 }, 500),
  90,
  '5 PRs, 100 lines, 500 stars → 90'
);

// base = (1 * 10) + (200 * 0.1) + 25 = 55, multiplier = 1 + 1000/1000 = 2 → 110
assertEqual(
  computeScore({ login: 'c', contributions: 1 }, { c: 200 }, 1000),
  110,
  'First-timer, 200 lines, 1000 stars → 110'
);

// base = (10 * 10) + (0 * 0.1) + 0 = 100, multiplier = 1 + 0/1000 = 1 → 100
assertEqual(
  computeScore({ login: 'd', contributions: 10 }, {}, 0),
  100,
  '10 PRs, no lines in map, 0 stars → 100'
);

// linesChanged missing from map defaults to 0
assertEqual(
  computeScore({ login: 'e', contributions: 2 }, { other: 999 }, 0),
  20,
  'contributor not in linesMap → linesChanged = 0'
);

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
