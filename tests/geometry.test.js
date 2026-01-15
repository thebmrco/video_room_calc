/**
 * VRC - Video Room Calculator
 * Geometry Utilities Unit Tests
 */

import {
  lineAngleDegrees,
  getVectorAngleDegrees,
  normalizeDegree,
  degreesToRadians,
  radiansToDegrees,
  rotatePointAroundOrigin,
  findEndPointCoordinates,
  distance,
  distancePoints,
  linesIntersect,
  pointInPolygon,
  getBoundingBox,
  clamp,
  lerp,
  roundTo
} from '../js/utils/geometry.js';

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

function assertDeepEqual(actual, expected, message) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

// ============================================
// ANGLE CALCULATION TESTS
// ============================================

function testLineAngleDegrees() {
  console.log('Testing lineAngleDegrees...');

  // Horizontal line pointing right (should be -90 because of the -90 adjustment)
  const angle1 = lineAngleDegrees(0, 0, 1, 0);
  assertClose(angle1, -90, 0.001, 'Horizontal right');

  // Vertical line pointing down
  const angle2 = lineAngleDegrees(0, 0, 0, 1);
  assertClose(angle2, 0, 0.001, 'Vertical down');

  // Diagonal 45 degrees
  const angle3 = lineAngleDegrees(0, 0, 1, 1);
  assertClose(angle3, -45, 0.001, 'Diagonal 45');

  console.log('  ✓ lineAngleDegrees tests passed');
}

function testNormalizeDegree() {
  console.log('Testing normalizeDegree...');

  assertEqual(normalizeDegree(0), 0, 'Zero degrees');
  assertEqual(normalizeDegree(360), 0, 'Full rotation');
  assertEqual(normalizeDegree(90), 90, 'Quarter rotation');
  assertEqual(normalizeDegree(-90), 270, 'Negative quarter');
  assertEqual(normalizeDegree(450), 90, 'Over rotation');
  assertEqual(normalizeDegree(-450), 270, 'Negative over rotation');

  console.log('  ✓ normalizeDegree tests passed');
}

function testDegreesRadiansConversion() {
  console.log('Testing degrees/radians conversion...');

  assertClose(degreesToRadians(0), 0, 0.0001, '0 degrees');
  assertClose(degreesToRadians(90), Math.PI / 2, 0.0001, '90 degrees');
  assertClose(degreesToRadians(180), Math.PI, 0.0001, '180 degrees');
  assertClose(degreesToRadians(360), Math.PI * 2, 0.0001, '360 degrees');

  assertClose(radiansToDegrees(0), 0, 0.0001, '0 radians');
  assertClose(radiansToDegrees(Math.PI / 2), 90, 0.0001, 'PI/2 radians');
  assertClose(radiansToDegrees(Math.PI), 180, 0.0001, 'PI radians');

  console.log('  ✓ degrees/radians conversion tests passed');
}

// ============================================
// POINT OPERATION TESTS
// ============================================

function testRotatePointAroundOrigin() {
  console.log('Testing rotatePointAroundOrigin...');

  // Rotate (1, 0) around origin by 90 degrees
  const result1 = rotatePointAroundOrigin(1, 0, 0, 0, 90);
  assertClose(result1.x, 0, 0.0001, 'Rotate 90° x');
  assertClose(result1.y, 1, 0.0001, 'Rotate 90° y');

  // Rotate (1, 0) around origin by 180 degrees
  const result2 = rotatePointAroundOrigin(1, 0, 0, 0, 180);
  assertClose(result2.x, -1, 0.0001, 'Rotate 180° x');
  assertClose(result2.y, 0, 0.0001, 'Rotate 180° y');

  // Rotate around non-origin point
  const result3 = rotatePointAroundOrigin(2, 1, 1, 1, 90);
  assertClose(result3.x, 1, 0.0001, 'Rotate around (1,1) x');
  assertClose(result3.y, 2, 0.0001, 'Rotate around (1,1) y');

  console.log('  ✓ rotatePointAroundOrigin tests passed');
}

function testFindEndPointCoordinates() {
  console.log('Testing findEndPointCoordinates...');

  // From origin, length 1, angle 0 (pointing right)
  const result1 = findEndPointCoordinates(0, 0, 1, 0);
  assertClose(result1.x, 1, 0.0001, 'Angle 0 x');
  assertClose(result1.y, 0, 0.0001, 'Angle 0 y');

  // From origin, length 1, angle 90 (pointing down)
  const result2 = findEndPointCoordinates(0, 0, 1, 90);
  assertClose(result2.x, 0, 0.0001, 'Angle 90 x');
  assertClose(result2.y, 1, 0.0001, 'Angle 90 y');

  // From (5, 5), length 2, angle 45
  const result3 = findEndPointCoordinates(5, 5, 2, 45);
  assertClose(result3.x, 5 + Math.sqrt(2), 0.0001, 'Angle 45 x');
  assertClose(result3.y, 5 + Math.sqrt(2), 0.0001, 'Angle 45 y');

  console.log('  ✓ findEndPointCoordinates tests passed');
}

// ============================================
// DISTANCE TESTS
// ============================================

function testDistance() {
  console.log('Testing distance...');

  assertEqual(distance(0, 0, 0, 0), 0, 'Same point');
  assertEqual(distance(0, 0, 3, 4), 5, 'Pythagorean triple');
  assertEqual(distance(0, 0, 1, 0), 1, 'Unit horizontal');
  assertEqual(distance(0, 0, 0, 1), 1, 'Unit vertical');
  assertClose(distance(0, 0, 1, 1), Math.sqrt(2), 0.0001, 'Diagonal');

  console.log('  ✓ distance tests passed');
}

function testDistancePoints() {
  console.log('Testing distancePoints...');

  assertEqual(distancePoints({ x: 0, y: 0 }, { x: 3, y: 4 }), 5, 'Pythagorean triple');
  assertEqual(distancePoints({ x: 1, y: 1 }, { x: 1, y: 1 }), 0, 'Same point');

  console.log('  ✓ distancePoints tests passed');
}

// ============================================
// LINE INTERSECTION TESTS
// ============================================

function testLinesIntersect() {
  console.log('Testing linesIntersect...');

  // Crossing lines
  assertEqual(linesIntersect(0, 0, 2, 2, 0, 2, 2, 0), true, 'Crossing X');

  // Parallel lines
  assertEqual(linesIntersect(0, 0, 1, 0, 0, 1, 1, 1), false, 'Parallel horizontal');

  // Non-crossing lines
  assertEqual(linesIntersect(0, 0, 1, 0, 2, 0, 3, 0), false, 'Collinear separate');

  // T-junction
  assertEqual(linesIntersect(0, 0, 2, 0, 1, -1, 1, 1), true, 'T-junction');

  console.log('  ✓ linesIntersect tests passed');
}

// ============================================
// POLYGON TESTS
// ============================================

function testPointInPolygon() {
  console.log('Testing pointInPolygon...');

  const square = [
    { x: 0, y: 0 },
    { x: 2, y: 0 },
    { x: 2, y: 2 },
    { x: 0, y: 2 }
  ];

  assertEqual(pointInPolygon(1, 1, square), true, 'Center of square');
  assertEqual(pointInPolygon(3, 3, square), false, 'Outside square');
  assertEqual(pointInPolygon(-1, 1, square), false, 'Left of square');

  console.log('  ✓ pointInPolygon tests passed');
}

function testGetBoundingBox() {
  console.log('Testing getBoundingBox...');

  const points = [
    { x: 1, y: 2 },
    { x: 5, y: 3 },
    { x: 3, y: 7 }
  ];

  const bbox = getBoundingBox(points);

  assertEqual(bbox.minX, 1, 'minX');
  assertEqual(bbox.minY, 2, 'minY');
  assertEqual(bbox.maxX, 5, 'maxX');
  assertEqual(bbox.maxY, 7, 'maxY');
  assertEqual(bbox.width, 4, 'width');
  assertEqual(bbox.height, 5, 'height');

  // Empty array
  const emptyBbox = getBoundingBox([]);
  assertEqual(emptyBbox.width, 0, 'empty width');

  console.log('  ✓ getBoundingBox tests passed');
}

// ============================================
// UTILITY FUNCTION TESTS
// ============================================

function testClamp() {
  console.log('Testing clamp...');

  assertEqual(clamp(5, 0, 10), 5, 'Within range');
  assertEqual(clamp(-5, 0, 10), 0, 'Below min');
  assertEqual(clamp(15, 0, 10), 10, 'Above max');
  assertEqual(clamp(0, 0, 10), 0, 'At min');
  assertEqual(clamp(10, 0, 10), 10, 'At max');

  console.log('  ✓ clamp tests passed');
}

function testLerp() {
  console.log('Testing lerp...');

  assertEqual(lerp(0, 10, 0), 0, 't=0');
  assertEqual(lerp(0, 10, 1), 10, 't=1');
  assertEqual(lerp(0, 10, 0.5), 5, 't=0.5');
  assertEqual(lerp(-10, 10, 0.5), 0, 'Negative to positive');

  console.log('  ✓ lerp tests passed');
}

function testRoundTo() {
  console.log('Testing roundTo...');

  assertEqual(roundTo(3.14159, 2), 3.14, '2 decimals');
  assertEqual(roundTo(3.14159, 0), 3, '0 decimals');
  assertEqual(roundTo(3.14159, 4), 3.1416, '4 decimals');
  assertEqual(roundTo(100, 2), 100, 'Integer');

  console.log('  ✓ roundTo tests passed');
}

// ============================================
// RUN ALL TESTS
// ============================================

export function runAllGeometryTests() {
  console.log('\n=== Geometry Module Tests ===\n');

  try {
    testLineAngleDegrees();
    testNormalizeDegree();
    testDegreesRadiansConversion();
    testRotatePointAroundOrigin();
    testFindEndPointCoordinates();
    testDistance();
    testDistancePoints();
    testLinesIntersect();
    testPointInPolygon();
    testGetBoundingBox();
    testClamp();
    testLerp();
    testRoundTo();

    console.log('\n✓ All geometry tests passed!\n');
    return true;
  } catch (error) {
    console.error('\n✗ Test failed:', error.message);
    return false;
  }
}

// Run if executed directly
if (typeof window === 'undefined') {
  runAllGeometryTests();
}
