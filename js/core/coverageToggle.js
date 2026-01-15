/**
 * VRC - Video Room Calculator
 * Coverage Toggle Module
 *
 * Unified functions for toggling coverage overlays (mic, speaker, camera, display).
 * This module consolidates the duplicate toggle functions from roomcalc.js.
 */

import { COVERAGE_TYPES, DOM_IDS } from './constants.js';

// ============================================
// COVERAGE TYPE CONFIGURATIONS
// ============================================

/**
 * Configuration for each coverage type.
 * Maps the coverage type key to its layer visibility key, data attribute, and ID prefix.
 */
const COVERAGE_CONFIG = {
  mic: {
    layerKey: 'grShadingMicrophone',
    dataAttr: 'data_audioHidden',
    idPrefix: 'audio~',
    dialogMessage: 'To toggle this button, first toggle on the microphone overlay button above the canvas.'
  },
  speaker: {
    layerKey: 'grShadingSpeaker',
    dataAttr: 'data_speakerHidden',
    idPrefix: 'speaker~',
    dialogMessage: 'To toggle this button, first toggle on the speaker overlay button above the canvas.'
  },
  camera: {
    layerKey: 'grShadingCamera',
    dataAttr: 'data_fovHidden',
    idPrefix: 'fov~',
    dialogMessage: 'To toggle this button, first toggle on the camera overlay button above the canvas.'
  },
  display: {
    layerKey: 'grDisplayDistance',
    dataAttr: 'data_dispDistHidden',
    idPrefix: 'dispDist~',
    dialogMessage: 'To toggle this button, first toggle on the display distance button above the canvas.'
  }
};

// ============================================
// MAIN TOGGLE FUNCTION
// ============================================

/**
 * Toggle the visibility of a coverage overlay for a single item.
 * This is the unified replacement for:
 * - toggleMicShadingSingleItem()
 * - toggleSpeakerShadingSingleItem()
 * - toggleCamShadeSingleItem()
 * - toggleDisplayDistanceSingleItem()
 *
 * @param {string} coverageType - Type of coverage: 'mic', 'speaker', 'camera', or 'display'
 * @param {object} options - Configuration options
 * @param {object} options.roomObj - The room object containing items and layer visibility
 * @param {object} options.stage - The Konva stage
 * @param {function} options.canvasToJson - Function to save canvas state
 * @param {string} [options.itemId] - Item ID (if not provided, reads from DOM)
 * @param {string} [options.parentGroup] - Parent group name (if not provided, reads from DOM)
 * @returns {boolean} True if toggle was successful, false if blocked
 */
export function toggleCoverageSingleItem(coverageType, options = {}) {
  const config = COVERAGE_CONFIG[coverageType];
  if (!config) {
    console.error(`[CoverageToggle] Unknown coverage type: ${coverageType}`);
    return false;
  }

  const { roomObj, stage, canvasToJson } = options;

  // Get item ID and parent group from options or DOM
  const id = options.itemId || getElementText(DOM_IDS.ITEM_ID);
  const parentGroup = options.parentGroup || getElementText(DOM_IDS.ITEM_GROUP);

  if (!id || !parentGroup) {
    console.error('[CoverageToggle] Missing item ID or parent group');
    return false;
  }

  // Check if the layer is visible
  if (roomObj.layersVisible[config.layerKey] === false) {
    showToggleBlockedDialog(config.dialogMessage);
    return false;
  }

  // Find and toggle the item
  const items = roomObj.items[parentGroup];
  if (!Array.isArray(items)) {
    console.error(`[CoverageToggle] No items found in group: ${parentGroup}`);
    return false;
  }

  const item = items.find(item => item.id === id);
  if (!item) {
    console.error(`[CoverageToggle] Item not found: ${id}`);
    return false;
  }

  // Get the Konva node
  const nodes = stage.find('#' + id);
  const node = nodes.length > 0 ? nodes[0] : null;

  // Get the coverage shape
  const coverageNodes = stage.find('#' + config.idPrefix + id);
  const coverageShape = coverageNodes.length > 0 ? coverageNodes[0] : null;

  if (!coverageShape) {
    console.warn(`[CoverageToggle] Coverage shape not found: ${config.idPrefix}${id}`);
    return false;
  }

  // Toggle visibility
  const isCurrentlyHidden = item[config.dataAttr] === true;

  if (isCurrentlyHidden) {
    // Show the coverage
    coverageShape.visible(true);
    delete item[config.dataAttr];
    if (node) {
      delete node[config.dataAttr];
    }
  } else {
    // Hide the coverage
    coverageShape.visible(false);
    item[config.dataAttr] = true;
    if (node) {
      node[config.dataAttr] = true;
    }
  }

  // Save state
  if (typeof canvasToJson === 'function') {
    canvasToJson();
  }

  return true;
}

// ============================================
// BATCH TOGGLE FUNCTIONS
// ============================================

/**
 * Toggle coverage for all items of a specific type.
 * @param {string} coverageType - Type of coverage: 'mic', 'speaker', 'camera', or 'display'
 * @param {boolean} visible - Whether to show (true) or hide (false) the coverage
 * @param {object} options - Configuration options
 * @param {object} options.roomObj - The room object
 * @param {object} options.stage - The Konva stage
 * @param {function} options.canvasToJson - Function to save canvas state
 * @param {string} [options.itemGroup] - Specific item group to toggle (optional)
 */
export function toggleCoverageAll(coverageType, visible, options = {}) {
  const config = COVERAGE_CONFIG[coverageType];
  if (!config) {
    console.error(`[CoverageToggle] Unknown coverage type: ${coverageType}`);
    return;
  }

  const { roomObj, stage, canvasToJson } = options;

  // Iterate through all item groups or specific group
  const groups = options.itemGroup
    ? [options.itemGroup]
    : Object.keys(roomObj.items);

  for (const groupName of groups) {
    const items = roomObj.items[groupName];
    if (!Array.isArray(items)) continue;

    for (const item of items) {
      // Get the coverage shape
      const coverageNodes = stage.find('#' + config.idPrefix + item.id);
      const coverageShape = coverageNodes.length > 0 ? coverageNodes[0] : null;

      if (coverageShape) {
        coverageShape.visible(visible);
      }

      // Update item data
      if (visible) {
        delete item[config.dataAttr];
      } else {
        item[config.dataAttr] = true;
      }

      // Update Konva node
      const nodes = stage.find('#' + item.id);
      if (nodes.length > 0) {
        const node = nodes[0];
        if (visible) {
          delete node[config.dataAttr];
        } else {
          node[config.dataAttr] = true;
        }
      }
    }
  }

  // Save state
  if (typeof canvasToJson === 'function') {
    canvasToJson();
  }
}

/**
 * Check if a specific item has its coverage hidden.
 * @param {string} coverageType - Type of coverage
 * @param {object} item - The item to check
 * @returns {boolean} True if coverage is hidden
 */
export function isCoverageHidden(coverageType, item) {
  const config = COVERAGE_CONFIG[coverageType];
  if (!config) return false;

  return item[config.dataAttr] === true;
}

/**
 * Get the coverage configuration for a type.
 * @param {string} coverageType - Type of coverage
 * @returns {object|null} Configuration object or null
 */
export function getCoverageConfig(coverageType) {
  return COVERAGE_CONFIG[coverageType] || null;
}

// ============================================
// LEGACY COMPATIBILITY FUNCTIONS
// ============================================

/**
 * Create legacy-compatible toggle functions.
 * Returns an object with the original function names that call the unified function.
 * @param {object} context - Context object with roomObj, stage, canvasToJson
 * @returns {object} Object with legacy function names
 */
export function createLegacyToggleFunctions(context) {
  return {
    toggleMicShadingSingleItem: () => toggleCoverageSingleItem('mic', context),
    toggleSpeakerShadingSingleItem: () => toggleCoverageSingleItem('speaker', context),
    toggleCamShadeSingleItem: () => toggleCoverageSingleItem('camera', context),
    toggleDisplayDistanceSingleItem: () => toggleCoverageSingleItem('display', context)
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get text content from a DOM element by ID.
 * @param {string} elementId - The element ID
 * @returns {string|null} Text content or null
 */
function getElementText(elementId) {
  if (typeof document === 'undefined') return null;

  const element = document.getElementById(elementId);
  return element ? element.innerText : null;
}

/**
 * Show the toggle blocked dialog.
 * @param {string} message - Message to display (optional)
 */
function showToggleBlockedDialog(message) {
  if (typeof document === 'undefined') return;

  const dialog = document.getElementById(DOM_IDS.DIALOG_SINGLE_ITEM_TOGGLES);
  if (dialog && typeof dialog.showModal === 'function') {
    dialog.showModal();
  } else if (message) {
    alert(message);
  }
}

// ============================================
// GLOBAL EXPORT
// ============================================

const CoverageToggle = {
  toggleCoverageSingleItem,
  toggleCoverageAll,
  isCoverageHidden,
  getCoverageConfig,
  createLegacyToggleFunctions,
  COVERAGE_CONFIG
};

export default CoverageToggle;

// Make available globally for non-module usage
if (typeof window !== 'undefined') {
  window.VRC_CoverageToggle = CoverageToggle;
}
