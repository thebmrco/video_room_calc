/**
 * VRC - Video Room Calculator
 * Module Integration Bridge
 *
 * This file bridges the new modular architecture with the existing roomcalc.js.
 * It provides backward-compatible global functions that use the new modules internally.
 *
 * Usage in roomcalc.js:
 *   <script type="module" src="js/core/moduleIntegration.js"></script>
 *
 * This will expose all module functionality globally while allowing
 * gradual migration to ES6 module imports.
 */

// Import all modules
import * as Constants from './constants.js';
import StateManager from './stateManager.js';
import DOMController from './domController.js';
import ItemFactory from './itemFactory.js';
import CoverageToggle from './coverageToggle.js';
import * as Geometry from '../utils/geometry.js';
import * as UnitConverter from '../utils/unitConverter.js';
import Renderer from '../canvas/renderer.js';

// ============================================
// LEGACY FUNCTION WRAPPERS
// ============================================

/**
 * Initialize all modules.
 * Call this after DOM is ready.
 */
function initModules() {
  // Initialize DOM controller
  DOMController.init();

  console.log('[ModuleIntegration] Modules initialized');
}

/**
 * Create legacy toggle functions bound to the current context.
 * @param {object} context - Context with roomObj, stage, canvasToJson
 * @returns {object} Legacy function object
 */
function createLegacyToggles(context) {
  return CoverageToggle.createLegacyToggleFunctions(context);
}

/**
 * Bridge function for toggleMicShadingSingleItem.
 * Must be called with proper context bound.
 */
function toggleMicShadingSingleItem() {
  const context = window._vrcContext || {};
  CoverageToggle.toggleCoverageSingleItem('mic', context);
}

/**
 * Bridge function for toggleSpeakerShadingSingleItem.
 */
function toggleSpeakerShadingSingleItem() {
  const context = window._vrcContext || {};
  CoverageToggle.toggleCoverageSingleItem('speaker', context);
}

/**
 * Bridge function for toggleCamShadeSingleItem.
 */
function toggleCamShadeSingleItem() {
  const context = window._vrcContext || {};
  CoverageToggle.toggleCoverageSingleItem('camera', context);
}

/**
 * Bridge function for toggleDisplayDistanceSingleItem.
 */
function toggleDisplayDistanceSingleItem() {
  const context = window._vrcContext || {};
  CoverageToggle.toggleCoverageSingleItem('display', context);
}

/**
 * Set the VRC context for legacy functions.
 * @param {object} context - Context object
 */
function setVRCContext(context) {
  window._vrcContext = context;
}

// ============================================
// GEOMETRY FUNCTION WRAPPERS
// ============================================

/**
 * Legacy wrapper for rotatePointAroundOrigin.
 */
function rotatePointAroundOrigin(pointX, pointY, originX, originY, angleInDegrees) {
  return Geometry.rotatePointAroundOrigin(pointX, pointY, originX, originY, angleInDegrees);
}

/**
 * Legacy wrapper for lineAngleDegrees.
 */
function lineAngleDegrees(x1, y1, x2, y2) {
  return Geometry.lineAngleDegrees(x1, y1, x2, y2);
}

/**
 * Legacy wrapper for normalizeDegree.
 */
function normalizeDegree(degree) {
  return Geometry.normalizeDegree(degree);
}

/**
 * Legacy wrapper for findEndPointCoordinates.
 */
function findEndPointCoordinates(x1, y1, length, angleDegrees) {
  return Geometry.findEndPointCoordinates(x1, y1, length, angleDegrees);
}

/**
 * Legacy wrapper for getVectorAngleDegrees.
 */
function getVectorAngleDegrees(A, B, C) {
  return Geometry.getVectorAngleDegrees(A, B, C);
}

// ============================================
// UNIT CONVERTER WRAPPERS
// ============================================

/**
 * Legacy wrapper for convertToUnit (parseInput).
 */
function convertToUnit(input) {
  // Get current unit from global roomObj or default to feet
  const unit = (typeof roomObj !== 'undefined' && roomObj.unit) || 'feet';
  return UnitConverter.parseInput(input, unit);
}

/**
 * Legacy wrapper for feetToMeters.
 */
function feetToMeters(feet) {
  return UnitConverter.feetToMeters(feet);
}

/**
 * Legacy wrapper for metersToFeet.
 */
function metersToFeet(meters) {
  return UnitConverter.metersToFeet(meters);
}

// ============================================
// ITEM FACTORY WRAPPERS
// ============================================

/**
 * Legacy wrapper for createUuid (generateId).
 */
function createUuid() {
  return ItemFactory.generateId();
}

/**
 * Legacy wrapper for createRoomId.
 */
function createRoomId() {
  return StateManager.createRoomId();
}

// ============================================
// EXPOSE GLOBALLY
// ============================================

// Make modules available globally
if (typeof window !== 'undefined') {
  // Module namespaces
  window.VRC = {
    Constants,
    StateManager,
    DOMController,
    ItemFactory,
    CoverageToggle,
    Geometry,
    UnitConverter,
    Renderer
  };

  // Initialization
  window.VRC.init = initModules;
  window.VRC.setContext = setVRCContext;

  // Legacy functions for backward compatibility
  window.toggleMicShadingSingleItem = toggleMicShadingSingleItem;
  window.toggleSpeakerShadingSingleItem = toggleSpeakerShadingSingleItem;
  window.toggleCamShadeSingleItem = toggleCamShadeSingleItem;
  window.toggleDisplayDistanceSingleItem = toggleDisplayDistanceSingleItem;

  // Geometry legacy functions
  window.rotatePointAroundOrigin = rotatePointAroundOrigin;
  window.lineAngleDegrees = lineAngleDegrees;
  window.normalizeDegree = normalizeDegree;
  window.findEndPointCoordinates = findEndPointCoordinates;
  window.getVectorAngleDegrees = getVectorAngleDegrees;

  // Unit converter legacy functions
  window.convertToUnit = convertToUnit;
  window.feetToMeters = feetToMeters;
  window.metersToFeet = metersToFeet;

  // Item factory legacy functions
  window.createUuid = createUuid;
  window.createRoomId = createRoomId;

  // Also expose individual modules under their own namespaces
  window.VRC_CONSTANTS = Constants;
  window.VRC_State = StateManager;
  window.VRC_DOM = DOMController;
  window.VRC_ItemFactory = ItemFactory;
  window.VRC_CoverageToggle = CoverageToggle;
  window.VRC_Geometry = Geometry;
  window.VRC_UnitConverter = UnitConverter;
  window.VRC_Renderer = Renderer;

  console.log('[ModuleIntegration] VRC modules exposed globally');
}

// Export for ES6 module usage
export {
  initModules,
  setVRCContext,
  createLegacyToggles,
  Constants,
  StateManager,
  DOMController,
  ItemFactory,
  CoverageToggle,
  Geometry,
  UnitConverter,
  Renderer
};

export default {
  init: initModules,
  setContext: setVRCContext,
  Constants,
  StateManager,
  DOMController,
  ItemFactory,
  CoverageToggle,
  Geometry,
  UnitConverter,
  Renderer
};
