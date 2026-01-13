/**
 * VRC - Video Room Calculator
 * Unit Converter Unit Tests
 */

import {
  feetToMeters,
  metersToFeet,
  inchesToFeet,
  feetToInches,
  cmToMeters,
  metersToCm,
  mmToMeters,
  metersToMm,
  convertUnit,
  toMeters,
  toFeet,
  parseInput,
  formatWithUnit,
  formatFeetInches,
  getScaleFactor
} from '../js/utils/unitConverter.js';

// ============================================
// TEST UTILITIES
// ============================================

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${expected}, got ${actual}`);
  }
}

function assertClose(actual, expected, tolerance, message) {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(`${message}: expected ${expected} (±${tolerance}), got ${actual}`);
  }
}

// ============================================
// BASIC CONVERSION TESTS
// ============================================

function testFeetMetersConversion() {
  console.log('Testing feet/meters conversion...');

  // Feet to meters
  assertClose(feetToMeters(1), 0.3048, 0.0001, '1 foot to meters');
  assertClose(feetToMeters(3.2808), 1, 0.001, '~3.28 feet to meters');
  assertClose(feetToMeters(0), 0, 0.0001, '0 feet');

  // Meters to feet
  assertClose(metersToFeet(1), 3.2808, 0.001, '1 meter to feet');
  assertClose(metersToFeet(0.3048), 1, 0.001, '~0.3 meters to feet');
  assertClose(metersToFeet(0), 0, 0.0001, '0 meters');

  // Round trip
  const original = 10;
  assertClose(metersToFeet(feetToMeters(original)), original, 0.001, 'Round trip feet');

  console.log('  ✓ feet/meters conversion tests passed');
}

function testInchesConversion() {
  console.log('Testing inches conversion...');

  assertEqual(inchesToFeet(12), 1, '12 inches to feet');
  assertEqual(inchesToFeet(6), 0.5, '6 inches to feet');
  assertEqual(feetToInches(1), 12, '1 foot to inches');
  assertEqual(feetToInches(2.5), 30, '2.5 feet to inches');

  console.log('  ✓ inches conversion tests passed');
}

function testCentimetersConversion() {
  console.log('Testing centimeters conversion...');

  assertEqual(cmToMeters(100), 1, '100 cm to meters');
  assertEqual(cmToMeters(50), 0.5, '50 cm to meters');
  assertEqual(metersToCm(1), 100, '1 meter to cm');
  assertEqual(metersToCm(2.5), 250, '2.5 meters to cm');

  console.log('  ✓ centimeters conversion tests passed');
}

function testMillimetersConversion() {
  console.log('Testing millimeters conversion...');

  assertEqual(mmToMeters(1000), 1, '1000 mm to meters');
  assertEqual(mmToMeters(500), 0.5, '500 mm to meters');
  assertEqual(metersToMm(1), 1000, '1 meter to mm');
  assertEqual(metersToMm(0.5), 500, '0.5 meters to mm');

  console.log('  ✓ millimeters conversion tests passed');
}

// ============================================
// UNIT-AWARE CONVERSION TESTS
// ============================================

function testConvertUnit() {
  console.log('Testing convertUnit...');

  // Same unit (no conversion)
  assertEqual(convertUnit(10, 'feet', 'feet'), 10, 'Feet to feet');
  assertEqual(convertUnit(10, 'meters', 'meters'), 10, 'Meters to meters');

  // Feet to meters
  assertClose(convertUnit(10, 'feet', 'meters'), 3.048, 0.001, 'Feet to meters');

  // Meters to feet
  assertClose(convertUnit(10, 'meters', 'feet'), 32.808, 0.001, 'Meters to feet');

  console.log('  ✓ convertUnit tests passed');
}

function testToMetersToFeet() {
  console.log('Testing toMeters/toFeet...');

  // toMeters
  assertEqual(toMeters(10, 'meters'), 10, 'Meters input unchanged');
  assertClose(toMeters(10, 'feet'), 3.048, 0.001, 'Feet input converted');

  // toFeet
  assertEqual(toFeet(10, 'feet'), 10, 'Feet input unchanged');
  assertClose(toFeet(10, 'meters'), 32.808, 0.001, 'Meters input converted');

  console.log('  ✓ toMeters/toFeet tests passed');
}

// ============================================
// INPUT PARSING TESTS
// ============================================

function testParseInput() {
  console.log('Testing parseInput...');

  // Simple numbers
  assertEqual(parseInput('10', 'feet'), 10, 'Simple number');
  assertEqual(parseInput('5.5', 'feet'), 5.5, 'Decimal number');

  // Feet notation
  assertEqual(parseInput('10 ft', 'feet'), 10, 'Feet with ft');
  assertEqual(parseInput("10'", 'feet'), 10, "Feet with '");
  assertEqual(parseInput('10 feet', 'feet'), 10, 'Feet spelled out');

  // Feet and inches
  assertEqual(parseInput("5' 6\"", 'feet'), 5.5, 'Feet and inches');
  assertEqual(parseInput('5 ft 6 in', 'feet'), 5.5, 'Feet ft and inches in');
  assertEqual(parseInput("10' 0\"", 'feet'), 10, 'Feet with zero inches');

  // Meters notation
  assertEqual(parseInput('1 m', 'meters'), 1, 'Meters with m');
  assertClose(parseInput('1 m', 'feet'), 3.28, 0.01, 'Meters to feet');

  // Centimeters
  assertClose(parseInput('100 cm', 'meters'), 1, 0.01, 'Centimeters to meters');
  assertClose(parseInput('150 c', 'meters'), 1.5, 0.01, 'Centimeters shorthand');

  // Mixed input
  assertClose(parseInput('1 m 50 c', 'meters'), 1.5, 0.01, 'Meters and centimeters');

  // Negative values
  assertEqual(parseInput('-10', 'feet'), -10, 'Negative number');
  assertEqual(parseInput('-5 ft', 'feet'), -5, 'Negative feet');

  // Edge cases
  assertEqual(parseInput('', 'feet'), 0, 'Empty string');
  assertEqual(parseInput('abc', 'feet'), 0, 'Invalid input');

  console.log('  ✓ parseInput tests passed');
}

// ============================================
// FORMATTING TESTS
// ============================================

function testFormatWithUnit() {
  console.log('Testing formatWithUnit...');

  assertEqual(formatWithUnit(10, 'feet', 2), '10.00 ft', 'Feet format');
  assertEqual(formatWithUnit(5.5, 'meters', 2), '5.50 m', 'Meters format');
  assertEqual(formatWithUnit(3.14159, 'feet', 1), '3.1 ft', '1 decimal');

  console.log('  ✓ formatWithUnit tests passed');
}

function testFormatFeetInches() {
  console.log('Testing formatFeetInches...');

  assertEqual(formatFeetInches(5), "5'", 'Whole feet');
  assertEqual(formatFeetInches(5.5), "5' 6\"", 'Feet and inches');
  assertEqual(formatFeetInches(5.25), "5' 3\"", 'Quarter feet');
  assertEqual(formatFeetInches(0), "0'", 'Zero feet');

  console.log('  ✓ formatFeetInches tests passed');
}

// ============================================
// SCALE FACTOR TESTS
// ============================================

function testGetScaleFactor() {
  console.log('Testing getScaleFactor...');

  assertEqual(getScaleFactor('feet', 'feet'), 1, 'Same unit');
  assertEqual(getScaleFactor('meters', 'meters'), 1, 'Same unit meters');
  assertClose(getScaleFactor('feet', 'meters'), 0.3048, 0.0001, 'Feet to meters');
  assertClose(getScaleFactor('meters', 'feet'), 3.2808, 0.001, 'Meters to feet');

  console.log('  ✓ getScaleFactor tests passed');
}

// ============================================
// RUN ALL TESTS
// ============================================

export function runAllUnitConverterTests() {
  console.log('\n=== Unit Converter Module Tests ===\n');

  try {
    testFeetMetersConversion();
    testInchesConversion();
    testCentimetersConversion();
    testMillimetersConversion();
    testConvertUnit();
    testToMetersToFeet();
    testParseInput();
    testFormatWithUnit();
    testFormatFeetInches();
    testGetScaleFactor();

    console.log('\n✓ All unit converter tests passed!\n');
    return true;
  } catch (error) {
    console.error('\n✗ Test failed:', error.message);
    return false;
  }
}

// Run if executed directly
if (typeof window === 'undefined') {
  runAllUnitConverterTests();
}
