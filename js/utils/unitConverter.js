/**
 * VRC - Video Room Calculator
 * Unit Converter Utilities
 *
 * Functions for converting between feet and meters,
 * parsing user input with various unit formats, etc.
 */

import { UNITS, UNIT_CONVERSION } from '../core/constants.js';

// ============================================
// CONVERSION CONSTANTS
// ============================================
const FEET_PER_METER = UNIT_CONVERSION.METERS_TO_FEET;
const METERS_PER_FOOT = UNIT_CONVERSION.FEET_TO_METERS;
const INCHES_PER_FOOT = 12;
const CM_PER_METER = 100;
const MM_PER_METER = 1000;
const INCHES_PER_METER = 39.3701;

// ============================================
// BASIC CONVERSIONS
// ============================================

/**
 * Convert feet to meters.
 * @param {number} feet - Value in feet
 * @returns {number} Value in meters
 */
export function feetToMeters(feet) {
  return feet * METERS_PER_FOOT;
}

/**
 * Convert meters to feet.
 * @param {number} meters - Value in meters
 * @returns {number} Value in feet
 */
export function metersToFeet(meters) {
  return meters * FEET_PER_METER;
}

/**
 * Convert inches to feet.
 * @param {number} inches - Value in inches
 * @returns {number} Value in feet
 */
export function inchesToFeet(inches) {
  return inches / INCHES_PER_FOOT;
}

/**
 * Convert feet to inches.
 * @param {number} feet - Value in feet
 * @returns {number} Value in inches
 */
export function feetToInches(feet) {
  return feet * INCHES_PER_FOOT;
}

/**
 * Convert centimeters to meters.
 * @param {number} cm - Value in centimeters
 * @returns {number} Value in meters
 */
export function cmToMeters(cm) {
  return cm / CM_PER_METER;
}

/**
 * Convert meters to centimeters.
 * @param {number} meters - Value in meters
 * @returns {number} Value in centimeters
 */
export function metersToCm(meters) {
  return meters * CM_PER_METER;
}

/**
 * Convert millimeters to meters.
 * @param {number} mm - Value in millimeters
 * @returns {number} Value in meters
 */
export function mmToMeters(mm) {
  return mm / MM_PER_METER;
}

/**
 * Convert meters to millimeters.
 * @param {number} meters - Value in meters
 * @returns {number} Value in millimeters
 */
export function metersToMm(meters) {
  return meters * MM_PER_METER;
}

/**
 * Convert inches to meters.
 * @param {number} inches - Value in inches
 * @returns {number} Value in meters
 */
export function inchesToMeters(inches) {
  return inches / INCHES_PER_METER;
}

/**
 * Convert meters to inches.
 * @param {number} meters - Value in meters
 * @returns {number} Value in inches
 */
export function metersToInches(meters) {
  return meters * INCHES_PER_METER;
}

// ============================================
// UNIT-AWARE CONVERSIONS
// ============================================

/**
 * Convert a value to the target unit.
 * @param {number} value - The value to convert
 * @param {string} fromUnit - Source unit ('feet' or 'meters')
 * @param {string} toUnit - Target unit ('feet' or 'meters')
 * @returns {number} Converted value
 */
export function convertUnit(value, fromUnit, toUnit) {
  if (fromUnit === toUnit) return value;

  if (fromUnit === UNITS.FEET && toUnit === UNITS.METERS) {
    return feetToMeters(value);
  } else if (fromUnit === UNITS.METERS && toUnit === UNITS.FEET) {
    return metersToFeet(value);
  }

  return value;
}

/**
 * Convert a value to meters regardless of current unit.
 * @param {number} value - The value to convert
 * @param {string} currentUnit - Current unit ('feet' or 'meters')
 * @returns {number} Value in meters
 */
export function toMeters(value, currentUnit) {
  if (currentUnit === UNITS.METERS) return value;
  return feetToMeters(value);
}

/**
 * Convert a value to feet regardless of current unit.
 * @param {number} value - The value to convert
 * @param {string} currentUnit - Current unit ('feet' or 'meters')
 * @returns {number} Value in feet
 */
export function toFeet(value, currentUnit) {
  if (currentUnit === UNITS.FEET) return value;
  return metersToFeet(value);
}

// ============================================
// INPUT PARSING
// ============================================

/**
 * Parse a measurement input string and convert to the target unit.
 * Handles formats like "5 ft 6 in", "1.5 m", "10' 6\"", "150 cm", etc.
 * @param {string} input - The input string to parse
 * @param {string} targetUnit - Target unit ('feet' or 'meters')
 * @returns {number} Parsed and converted value
 */
export function parseInput(input, targetUnit = UNITS.FEET) {
  if (typeof input !== 'string') {
    input = String(input);
  }

  // Replace fancy quotes (from iPhone keyboards, etc.)
  input = input
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"');

  // Regex to parse various formats
  const regex = /(?<negative>-)?\s*((?<meter>[0-9.]*)\s*m)?\s*((?<cm>[0-9.]*)\s*c)?\s*((?<feet>[0-9.]*)\s*(ft\.?|'|feet|foot))?\s*((?<inch>[0-9.]*)\s*(i|"))?\s*(?<value>[0-9.]*)?/gmi;

  const match = regex.exec(input);
  if (!match || !match.groups) {
    return 0;
  }

  let { negative, meter, cm, feet, inch, value } = match.groups;

  // Parse all values to numbers
  meter = parseFloat(meter) || 0;
  cm = parseFloat(cm) || 0;
  feet = parseFloat(feet) || 0;
  inch = parseFloat(inch) || 0;
  value = parseFloat(value) || 0;

  let measurement;

  if (targetUnit === UNITS.FEET) {
    measurement = (
      meter * FEET_PER_METER +
      cm * FEET_PER_METER / 100 +
      feet +
      inch / 12 +
      value
    );
  } else {
    measurement = (
      meter +
      cm / 100 +
      feet / FEET_PER_METER +
      inch / 12 / FEET_PER_METER +
      value
    );
  }

  if (negative === '-') {
    measurement = -measurement;
  }

  return Math.round(measurement * 100) / 100;
}

/**
 * Format a value with its unit suffix.
 * @param {number} value - The value to format
 * @param {string} unit - The unit ('feet' or 'meters')
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted string like "5.25 ft" or "1.60 m"
 */
export function formatWithUnit(value, unit, decimals = 2) {
  const formattedValue = value.toFixed(decimals);
  const suffix = unit === UNITS.FEET ? ' ft' : ' m';
  return formattedValue + suffix;
}

/**
 * Format a value in feet and inches.
 * @param {number} feet - Value in feet
 * @returns {string} Formatted string like "5' 6\""
 */
export function formatFeetInches(feet) {
  const wholeFeet = Math.floor(feet);
  const inches = Math.round((feet - wholeFeet) * 12);

  if (inches === 12) {
    return `${wholeFeet + 1}'`;
  } else if (inches === 0) {
    return `${wholeFeet}'`;
  }

  return `${wholeFeet}' ${inches}"`;
}

/**
 * Format a value in meters and centimeters.
 * @param {number} meters - Value in meters
 * @returns {string} Formatted string like "1.50 m"
 */
export function formatMeters(meters, decimals = 2) {
  return meters.toFixed(decimals) + ' m';
}

// ============================================
// ROOM OBJECT CONVERSION
// ============================================

/**
 * Convert all measurements in a room object to meters.
 * @param {object} roomObj - The room object to convert
 * @returns {object} New room object with values in meters
 */
export function convertRoomObjToMeters(roomObj) {
  if (roomObj.unit === UNITS.METERS) {
    return structuredClone(roomObj);
  }

  const converted = structuredClone(roomObj);
  converted.unit = UNITS.METERS;

  // Convert room dimensions
  if (converted.room) {
    if (converted.room.roomWidth) {
      converted.room.roomWidth = feetToMeters(Number(converted.room.roomWidth));
    }
    if (converted.room.roomLength) {
      converted.room.roomLength = feetToMeters(Number(converted.room.roomLength));
    }
  }

  // Convert items
  if (converted.items) {
    for (const itemType in converted.items) {
      if (Array.isArray(converted.items[itemType])) {
        converted.items[itemType] = converted.items[itemType].map(item =>
          convertItemToMeters(item)
        );
      }
    }
  }

  return converted;
}

/**
 * Convert measurements in an item to meters.
 * @param {object} item - The item to convert
 * @returns {object} New item with values in meters
 */
export function convertItemToMeters(item) {
  const converted = { ...item };

  // Position
  if (typeof converted.x === 'number') {
    converted.x = feetToMeters(converted.x);
  }
  if (typeof converted.y === 'number') {
    converted.y = feetToMeters(converted.y);
  }

  // Dimensions
  if (typeof converted.width === 'number') {
    converted.width = feetToMeters(converted.width);
  }
  if (typeof converted.length === 'number') {
    converted.length = feetToMeters(converted.length);
  }
  if (typeof converted.height === 'number') {
    converted.height = feetToMeters(converted.height);
  }

  // Points array (for walls, etc.)
  if (Array.isArray(converted.points)) {
    converted.points = converted.points.map(p => feetToMeters(p));
  }

  return converted;
}

/**
 * Convert all measurements in a room object to feet.
 * @param {object} roomObj - The room object to convert
 * @returns {object} New room object with values in feet
 */
export function convertRoomObjToFeet(roomObj) {
  if (roomObj.unit === UNITS.FEET) {
    return structuredClone(roomObj);
  }

  const converted = structuredClone(roomObj);
  converted.unit = UNITS.FEET;

  // Convert room dimensions
  if (converted.room) {
    if (converted.room.roomWidth) {
      converted.room.roomWidth = metersToFeet(Number(converted.room.roomWidth));
    }
    if (converted.room.roomLength) {
      converted.room.roomLength = metersToFeet(Number(converted.room.roomLength));
    }
  }

  // Convert items
  if (converted.items) {
    for (const itemType in converted.items) {
      if (Array.isArray(converted.items[itemType])) {
        converted.items[itemType] = converted.items[itemType].map(item =>
          convertItemToFeet(item)
        );
      }
    }
  }

  return converted;
}

/**
 * Convert measurements in an item to feet.
 * @param {object} item - The item to convert
 * @returns {object} New item with values in feet
 */
export function convertItemToFeet(item) {
  const converted = { ...item };

  // Position
  if (typeof converted.x === 'number') {
    converted.x = metersToFeet(converted.x);
  }
  if (typeof converted.y === 'number') {
    converted.y = metersToFeet(converted.y);
  }

  // Dimensions
  if (typeof converted.width === 'number') {
    converted.width = metersToFeet(converted.width);
  }
  if (typeof converted.length === 'number') {
    converted.length = metersToFeet(converted.length);
  }
  if (typeof converted.height === 'number') {
    converted.height = metersToFeet(converted.height);
  }

  // Points array (for walls, etc.)
  if (Array.isArray(converted.points)) {
    converted.points = converted.points.map(p => metersToFeet(p));
  }

  return converted;
}

// ============================================
// SCALE FACTOR CALCULATION
// ============================================

/**
 * Calculate the scale factor for a unit change.
 * @param {string} fromUnit - Source unit
 * @param {string} toUnit - Target unit
 * @returns {number} Scale factor
 */
export function getScaleFactor(fromUnit, toUnit) {
  if (fromUnit === toUnit) return 1;

  if (fromUnit === UNITS.FEET && toUnit === UNITS.METERS) {
    return METERS_PER_FOOT;
  } else if (fromUnit === UNITS.METERS && toUnit === UNITS.FEET) {
    return FEET_PER_METER;
  }

  return 1;
}

// Make available globally for non-module usage
if (typeof window !== 'undefined') {
  window.VRC_UnitConverter = {
    feetToMeters,
    metersToFeet,
    inchesToFeet,
    feetToInches,
    cmToMeters,
    metersToCm,
    mmToMeters,
    metersToMm,
    inchesToMeters,
    metersToInches,
    convertUnit,
    toMeters,
    toFeet,
    parseInput,
    formatWithUnit,
    formatFeetInches,
    formatMeters,
    convertRoomObjToMeters,
    convertRoomObjToFeet,
    convertItemToMeters,
    convertItemToFeet,
    getScaleFactor
  };
}
