/**
 * VRC - Video Room Calculator
 * Geometry Utilities
 *
 * Mathematical functions for geometric calculations including
 * point rotation, angle calculation, distance measurement, etc.
 */

// ============================================
// ANGLE CALCULATIONS
// ============================================

/**
 * Calculate the angle (slope) of the line from (x1,y1) to (x2,y2), in degrees.
 * 0 degrees points along +X, 90 degrees along +Y. Returns in (-180, 180].
 * @param {number} x1 - Start X coordinate
 * @param {number} y1 - Start Y coordinate
 * @param {number} x2 - End X coordinate
 * @param {number} y2 - End Y coordinate
 * @returns {number} Angle in degrees
 */
export function lineAngleDegrees(x1, y1, x2, y2) {
  const dy = y2 - y1;
  const dx = x2 - x1;
  return (Math.atan2(dy, dx) * (180 / Math.PI)) - 90;
}

/**
 * Calculates the angle at point B between vectors BA and BC in degrees.
 * @param {object} A - The first point {x, y}
 * @param {object} B - The middle point (vertex) {x, y}
 * @param {object} C - The third point {x, y}
 * @returns {number} The angle in degrees, in the range (-180, 180]
 */
export function getVectorAngleDegrees(A, B, C) {
  const BA_x = A.x - B.x;
  const BA_y = A.y - B.y;
  const BC_x = C.x - B.x;
  const BC_y = C.y - B.y;

  const angleRadians = Math.atan2(BA_y * BC_x - BA_x * BC_y, BA_x * BC_x + BA_y * BC_y);
  return angleRadians * 180 / Math.PI;
}

/**
 * Normalize a degree value to be within 0-360 range.
 * @param {number} degree - The angle in degrees
 * @returns {number} Normalized angle between 0 and 360
 */
export function normalizeDegree(degree) {
  degree = degree % 360;
  if (degree < 0) {
    degree = degree + 360;
  }
  return degree;
}

/**
 * Convert degrees to radians.
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
export function degreesToRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees.
 * @param {number} radians - Angle in radians
 * @returns {number} Angle in degrees
 */
export function radiansToDegrees(radians) {
  return radians * (180 / Math.PI);
}

// ============================================
// POINT OPERATIONS
// ============================================

/**
 * Rotate a point (x, y) around an origin point by a specified angle.
 * @param {number} pointX - X coordinate of the point to rotate
 * @param {number} pointY - Y coordinate of the point to rotate
 * @param {number} originX - X coordinate of the origin
 * @param {number} originY - Y coordinate of the origin
 * @param {number} angleInDegrees - Rotation angle in degrees
 * @returns {object} New coordinates {x, y}
 */
export function rotatePointAroundOrigin(pointX, pointY, originX, originY, angleInDegrees) {
  const angleInRadians = degreesToRadians(angleInDegrees);
  const cosTheta = Math.cos(angleInRadians);
  const sinTheta = Math.sin(angleInRadians);

  const translatedX = pointX - originX;
  const translatedY = pointY - originY;

  const rotatedX = translatedX * cosTheta - translatedY * sinTheta;
  const rotatedY = translatedX * sinTheta + translatedY * cosTheta;

  return {
    x: rotatedX + originX,
    y: rotatedY + originY
  };
}

/**
 * Calculate endpoint coordinates given a start point, length, and angle.
 * @param {number} x1 - Start X coordinate
 * @param {number} y1 - Start Y coordinate
 * @param {number} length - Length of the line
 * @param {number} angleDegrees - Angle in degrees
 * @returns {object} End point coordinates {x, y}
 */
export function findEndPointCoordinates(x1, y1, length, angleDegrees) {
  const angleRadians = degreesToRadians(angleDegrees);
  return {
    x: x1 + length * Math.cos(angleRadians),
    y: y1 + length * Math.sin(angleRadians)
  };
}

/**
 * Find the closest point on a line segment to a given point.
 * @param {number} px - Point X coordinate
 * @param {number} py - Point Y coordinate
 * @param {number} x1 - Line start X
 * @param {number} y1 - Line start Y
 * @param {number} x2 - Line end X
 * @param {number} y2 - Line end Y
 * @returns {object} Closest point {x, y}
 */
export function closestPointOnSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) {
    return { x: x1, y: y1 };
  }

  let t = ((px - x1) * dx + (py - y1) * dy) / lengthSquared;
  t = Math.max(0, Math.min(1, t));

  return {
    x: x1 + t * dx,
    y: y1 + t * dy
  };
}

// ============================================
// TRIGONOMETRY CALCULATIONS
// ============================================

/**
 * Calculate distance A in a right triangle using opposite/adjacent ratio.
 * Formula: distanceA = distanceB / tan(degreeB)
 * Reference: https://www2.clarku.edu/faculty/djoyce/trig/right.html
 * @param {number} degreeB - Angle B in degrees
 * @param {number} distanceB - Length of side B (opposite to angle B)
 * @returns {number} Length of side A (adjacent to angle B)
 */
export function getDistanceA(degreeB, distanceB) {
  return distanceB / Math.tan(degreesToRadians(degreeB));
}

/**
 * Calculate distance B in a right triangle using opposite/adjacent ratio.
 * Formula: distanceB = tan(degreeB) * distanceA
 * @param {number} degreeB - Angle B in degrees
 * @param {number} distanceA - Length of side A (adjacent to angle B)
 * @returns {number} Length of side B (opposite to angle B)
 */
export function getDistanceB(degreeB, distanceA) {
  return Math.tan(degreesToRadians(degreeB)) * distanceA;
}

// ============================================
// DISTANCE CALCULATIONS
// ============================================

/**
 * Calculate the distance between two points.
 * @param {number} x1 - First point X
 * @param {number} y1 - First point Y
 * @param {number} x2 - Second point X
 * @param {number} y2 - Second point Y
 * @returns {number} Distance between points
 */
export function distance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate the distance between two point objects.
 * @param {object} p1 - First point {x, y}
 * @param {object} p2 - Second point {x, y}
 * @returns {number} Distance between points
 */
export function distancePoints(p1, p2) {
  return distance(p1.x, p1.y, p2.x, p2.y);
}

/**
 * Calculate the squared distance between two points (faster than distance).
 * @param {number} x1 - First point X
 * @param {number} y1 - First point Y
 * @param {number} x2 - Second point X
 * @param {number} y2 - Second point Y
 * @returns {number} Squared distance
 */
export function distanceSquared(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return dx * dx + dy * dy;
}

// ============================================
// LINE OPERATIONS
// ============================================

/**
 * Check if two line segments intersect.
 * @param {number} x1 - Line 1 start X
 * @param {number} y1 - Line 1 start Y
 * @param {number} x2 - Line 1 end X
 * @param {number} y2 - Line 1 end Y
 * @param {number} x3 - Line 2 start X
 * @param {number} y3 - Line 2 start Y
 * @param {number} x4 - Line 2 end X
 * @param {number} y4 - Line 2 end Y
 * @returns {boolean} True if lines intersect
 */
export function linesIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
  const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  if (denom === 0) return false;

  const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
  const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;

  return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
}

/**
 * Get the intersection point of two lines.
 * @param {number} x1 - Line 1 start X
 * @param {number} y1 - Line 1 start Y
 * @param {number} x2 - Line 1 end X
 * @param {number} y2 - Line 1 end Y
 * @param {number} x3 - Line 2 start X
 * @param {number} y3 - Line 2 start Y
 * @param {number} x4 - Line 2 end X
 * @param {number} y4 - Line 2 end Y
 * @returns {object|null} Intersection point {x, y} or null if no intersection
 */
export function getLineIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
  const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  if (denom === 0) return null;

  const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;

  return {
    x: x1 + ua * (x2 - x1),
    y: y1 + ua * (y2 - y1)
  };
}

// ============================================
// POLYGON OPERATIONS
// ============================================

/**
 * Check if a point is inside a polygon.
 * @param {number} x - Point X coordinate
 * @param {number} y - Point Y coordinate
 * @param {array} polygon - Array of points [{x, y}, ...]
 * @returns {boolean} True if point is inside polygon
 */
export function pointInPolygon(x, y, polygon) {
  let inside = false;
  const n = polygon.length;

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;

    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Check if a polyline self-intersects.
 * @param {array} points - Array of points [x1, y1, x2, y2, ...]
 * @returns {boolean} True if polyline self-intersects
 */
export function polylineSelfIntersects(points) {
  const n = points.length / 2;
  if (n < 4) return false;

  for (let i = 0; i < n - 1; i++) {
    const x1 = points[i * 2];
    const y1 = points[i * 2 + 1];
    const x2 = points[(i + 1) * 2];
    const y2 = points[(i + 1) * 2 + 1];

    for (let j = i + 2; j < n - 1; j++) {
      if (i === 0 && j === n - 2) continue; // Skip first-last segment check for closed polygons

      const x3 = points[j * 2];
      const y3 = points[j * 2 + 1];
      const x4 = points[(j + 1) * 2];
      const y4 = points[(j + 1) * 2 + 1];

      if (linesIntersect(x1, y1, x2, y2, x3, y3, x4, y4)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Calculate the center point of a polygon.
 * @param {array} points - Array of points [{x, y}, ...]
 * @returns {object} Center point {x, y}
 */
export function getPolygonCenter(points) {
  let sumX = 0;
  let sumY = 0;

  for (const point of points) {
    sumX += point.x;
    sumY += point.y;
  }

  return {
    x: sumX / points.length,
    y: sumY / points.length
  };
}

/**
 * Calculate the bounding box of a set of points.
 * @param {array} points - Array of points [{x, y}, ...]
 * @returns {object} Bounding box {minX, minY, maxX, maxY, width, height}
 */
export function getBoundingBox(points) {
  if (points.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const point of points) {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY
  };
}

// ============================================
// ITEM/SHAPE COORDINATE HELPERS
// ============================================

/**
 * Find the upper-left corner coordinates of a rotated shape.
 * Takes a shape with center (x,y), width, height, and rotation.
 * @param {object} shape - Shape with x, y, width, height, rotation properties
 * @returns {object} Upper-left coordinates {x, y}
 */
export function findUpperLeftXY(shape) {
  return {
    x:
      shape.x
      - (shape.width / 2) * Math.cos(Math.PI / 180 * shape.rotation)
      - (shape.height / 2) * Math.sin(Math.PI / 180 * (-shape.rotation)),
    y:
      shape.y -
      (shape.height / 2) * Math.cos(Math.PI / 180 * shape.rotation) -
      (shape.width / 2) * Math.sin(Math.PI / 180 * shape.rotation)
  };
}

/**
 * Find new coordinates after applying offset transformation based on rotation.
 * @param {object} item - Item with x, y, and rotation properties
 * @param {number} deltaX - X offset to apply
 * @param {number} deltaY - Y offset to apply
 * @returns {object} New coordinates {x, y}
 */
export function findNewTransformationCoordinate(item, deltaX, deltaY) {
  return {
    x:
      item.x
      - (deltaX) * Math.cos(Math.PI / 180 * item.rotation)
      - (deltaY) * Math.sin(Math.PI / 180 * (-item.rotation)),
    y:
      item.y -
      (deltaY) * Math.cos(Math.PI / 180 * item.rotation) -
      (deltaX) * Math.sin(Math.PI / 180 * item.rotation)
  };
}

/**
 * Get center of an item from upper-left x, y coordinates.
 * Used for items in roomObj.items[] which use upper-left as origin.
 * @param {object} item - Item with x, y, width, height, rotation properties
 * @returns {object} Center coordinates {x, y}
 */
export function getItemCenter(item) {
  return {
    x:
      item.x
      + (item.width / 2) * Math.cos(Math.PI / 180 * item.rotation)
      + (item.height / 2) * Math.sin(Math.PI / 180 * (-item.rotation)),
    y:
      item.y +
      (item.height / 2) * Math.cos(Math.PI / 180 * item.rotation) +
      (item.width / 2) * Math.sin(Math.PI / 180 * item.rotation)
  };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Clamp a value between min and max.
 * @param {number} value - The value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values.
 * @param {number} a - Start value
 * @param {number} b - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} Interpolated value
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Round a number to a specified number of decimal places.
 * @param {number} value - The value to round
 * @param {number} decimals - Number of decimal places
 * @returns {number} Rounded value
 */
export function roundTo(value, decimals) {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

// Make available globally for non-module usage
if (typeof window !== 'undefined') {
  window.VRC_Geometry = {
    lineAngleDegrees,
    getVectorAngleDegrees,
    normalizeDegree,
    degreesToRadians,
    radiansToDegrees,
    rotatePointAroundOrigin,
    findEndPointCoordinates,
    closestPointOnSegment,
    getDistanceA,
    getDistanceB,
    distance,
    distancePoints,
    distanceSquared,
    linesIntersect,
    getLineIntersection,
    pointInPolygon,
    polylineSelfIntersects,
    getPolygonCenter,
    getBoundingBox,
    findUpperLeftXY,
    findNewTransformationCoordinate,
    getItemCenter,
    clamp,
    lerp,
    roundTo
  };
}
