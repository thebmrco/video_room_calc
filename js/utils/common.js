/**
 * VRC - Video Room Calculator
 * Common Utilities
 *
 * General-purpose utility functions used throughout the application.
 */

// ============================================
// UUID GENERATION
// ============================================

/**
 * Generate a UUID v4 string.
 * Uses crypto.getRandomValues for secure random number generation.
 * @returns {string} A UUID v4 string (e.g., "10000000-1000-4000-8000-100000000000")
 */
export function createUuid() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

/**
 * Generate a room-specific UUID.
 * Alias for createUuid for semantic clarity.
 * @returns {string} A UUID v4 string
 */
export function createRoomId() {
    return createUuid();
}

// ============================================
// NUMBER UTILITIES
// ============================================

/**
 * Check if a value is a valid numeric value.
 * Handles edge cases like empty strings which parseFloat would accept.
 * @param {*} value - The value to check
 * @returns {boolean} True if the value is numeric
 */
export function isNumeric(value) {
    return !(typeof value === 'string' && value.trim() === '') && Number.isFinite(Number(value));
}

/**
 * Round a number to a specified decimal place.
 * Unlike toFixed(), this drops trailing zeros.
 * @param {number} inNumber - The number to round
 * @param {number} place - The decimal place (negative = right of decimal, e.g., -2 = hundredths)
 * @returns {number} The rounded number
 */
export function round(inNumber, place = -2) {
    let factor = 10 ** (-1 * place);
    return Math.round(inNumber * factor) / factor;
}

/**
 * Get a numeric value from a DOM element by ID.
 * Returns 0 if element not found or value is not numeric.
 * @param {string} id - The DOM element ID
 * @returns {number} The numeric value or 0
 */
export function getNumberValue(id) {
    const element = document.getElementById(id);
    if (!element) return 0;
    const value = parseFloat(element.value);
    return isNaN(value) ? 0 : value;
}

// ============================================
// DEVICE/TOUCH DETECTION
// ============================================

/**
 * Check if the device supports touch input.
 * @returns {boolean} True if touch is enabled
 */
export function isTouchEnabled() {
    return ('ontouchstart' in window) ||
           (navigator.maxTouchPoints > 0) ||
           (navigator.msMaxTouchPoints > 0);
}

// ============================================
// DOM UTILITIES
// ============================================

/**
 * Check if an element has a scrollbar.
 * @param {HTMLElement} element - The element to check
 * @returns {boolean} True if element has vertical scrollbar
 */
export function hasScrollbar(element) {
    return element.scrollHeight > element.clientHeight;
}

/**
 * Get the full height of an element including margins.
 * @param {HTMLElement} element - The element to measure
 * @returns {number} Total height including margins
 */
export function getFullHeightIncludingMargin(element) {
    const styles = window.getComputedStyle(element);
    const marginTop = parseFloat(styles.marginTop);
    const marginBottom = parseFloat(styles.marginBottom);
    return element.offsetHeight + marginTop + marginBottom;
}

// ============================================
// OBJECT UTILITIES
// ============================================

/**
 * Create a deep copy of a Konva node including data_ properties.
 * @param {Object} node - The Konva node to copy
 * @returns {Object} A deep copy of the node
 */
export function deepCopyNode(node) {
    let newNode = node.clone();
    let keys = Object.keys(node);
    keys.forEach(key => {
        if (key.startsWith('data_')) {
            newNode[key] = node[key];
        }
    });
    return newNode;
}

// ============================================
// GLOBAL EXPORT
// ============================================

// Make available globally for non-module usage
if (typeof window !== 'undefined') {
    window.VRC_Common = {
        createUuid,
        createRoomId,
        isNumeric,
        round,
        getNumberValue,
        isTouchEnabled,
        hasScrollbar,
        getFullHeightIncludingMargin,
        deepCopyNode
    };
}
