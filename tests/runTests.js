/**
 * VRC - Video Room Calculator
 * Test Runner
 *
 * Run all unit tests for the refactored modules.
 *
 * Usage:
 *   node --experimental-modules tests/runTests.js
 *
 * Or in browser, include as:
 *   <script type="module" src="tests/runTests.js"></script>
 */

import { runAllGeometryTests } from './geometry.test.js';
import { runAllUnitConverterTests } from './unitConverter.test.js';

// ============================================
// TEST RUNNER
// ============================================

async function runAllTests() {
  console.log('╔═══════════════════════════════════════╗');
  console.log('║   VRC Refactored Modules Test Suite   ║');
  console.log('╚═══════════════════════════════════════╝\n');

  const results = {
    total: 0,
    passed: 0,
    failed: 0
  };

  // Run geometry tests
  results.total++;
  if (runAllGeometryTests()) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Run unit converter tests
  results.total++;
  if (runAllUnitConverterTests()) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Summary
  console.log('\n═══════════════════════════════════════');
  console.log('               SUMMARY                 ');
  console.log('═══════════════════════════════════════\n');
  console.log(`  Total Test Suites: ${results.total}`);
  console.log(`  Passed: ${results.passed}`);
  console.log(`  Failed: ${results.failed}`);
  console.log('');

  if (results.failed === 0) {
    console.log('  ✓ All tests passed!\n');
    return true;
  } else {
    console.log(`  ✗ ${results.failed} test suite(s) failed\n`);
    return false;
  }
}

// Run tests
runAllTests().then(success => {
  if (typeof process !== 'undefined') {
    process.exit(success ? 0 : 1);
  }
});

export { runAllTests };
