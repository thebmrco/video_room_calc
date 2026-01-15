/**
 * VRC - Video Room Calculator
 * Event Manager
 *
 * Central manager for all event handlers. Provides a unified API
 * for initializing, enabling, and disabling event handling across
 * the application.
 */

import KeyboardHandlers from './keyboardHandlers.js';
import StageHandlers from './stageHandlers.js';
import CanvasInteractionHandlers from './canvasInteractionHandlers.js';
import ItemHandlers from './itemHandlers.js';

// ============================================
// STATE
// ============================================

/**
 * Initialization state.
 */
const state = {
  isInitialized: false,
  isEnabled: false
};

/**
 * Context object shared across all handlers.
 */
let sharedContext = {
  stage: null,
  tr: null,
  roomObj: null,
  canvasToJson: null,
  scale: 50,
  unit: 'feet',
  pxOffset: 50,
  pyOffset: 50
};

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize all event handlers with application context.
 * @param {object} ctx - Context object containing app references
 */
export function init(ctx) {
  sharedContext = { ...sharedContext, ...ctx };

  // Initialize all handler modules
  KeyboardHandlers.init(sharedContext);
  StageHandlers.init(sharedContext);
  CanvasInteractionHandlers.init(sharedContext);
  ItemHandlers.init(sharedContext);

  state.isInitialized = true;
  console.log('[EventManager] All handlers initialized');
}

/**
 * Update shared context across all handlers.
 * @param {object} updates - Context updates
 */
export function updateContext(updates) {
  sharedContext = { ...sharedContext, ...updates };

  // Propagate to all handlers
  KeyboardHandlers.init(sharedContext);
  StageHandlers.updateContext(updates);
  CanvasInteractionHandlers.updateContext(updates);
  ItemHandlers.updateContext(updates);
}

// ============================================
// ENABLE/DISABLE
// ============================================

/**
 * Enable all event handlers.
 */
export function enable() {
  if (!state.isInitialized) {
    console.warn('[EventManager] Not initialized. Call init() first.');
    return;
  }

  KeyboardHandlers.enable();
  StageHandlers.enable();

  state.isEnabled = true;
  console.log('[EventManager] All handlers enabled');
}

/**
 * Disable all event handlers.
 */
export function disable() {
  KeyboardHandlers.disable();
  StageHandlers.disable();
  CanvasInteractionHandlers.disableWallBuilder();
  CanvasInteractionHandlers.disableMeasuringTool();
  CanvasInteractionHandlers.disablePan();

  state.isEnabled = false;
  console.log('[EventManager] All handlers disabled');
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

/**
 * Register keyboard action handlers.
 * @param {object} handlers - Map of action names to handler functions
 */
export function registerKeyboardActions(handlers) {
  KeyboardHandlers.registerHandlers(handlers);
}

/**
 * Register a single keyboard action.
 * @param {string} action - Action name
 * @param {function} handler - Handler function
 */
export function onKeyboardAction(action, handler) {
  KeyboardHandlers.on(action, handler);
}

/**
 * Block/unblock keyboard actions.
 * @param {boolean} blocked - Whether to block
 */
export function setKeyboardBlocked(blocked) {
  KeyboardHandlers.setBlocked(blocked);
}

// ============================================
// STAGE EVENTS
// ============================================

/**
 * Register stage event callbacks.
 * @param {object} callbacks - Callback object
 */
export function registerStageCallbacks(callbacks) {
  StageHandlers.setCallbacks(callbacks);
}

/**
 * Clear current selection.
 */
export function clearSelection() {
  StageHandlers.clearSelection();
}

/**
 * Select specific nodes.
 * @param {array} nodes - Nodes to select
 */
export function selectNodes(nodes) {
  StageHandlers.selectNodes(nodes);
}

/**
 * Get selected nodes.
 * @returns {array}
 */
export function getSelectedNodes() {
  return StageHandlers.getSelectedNodes();
}

// ============================================
// CANVAS TOOLS
// ============================================

/**
 * Enable wall builder tool.
 * @param {string} wallType - Wall type
 */
export function enableWallBuilder(wallType) {
  CanvasInteractionHandlers.enableWallBuilder(wallType);
}

/**
 * Disable wall builder tool.
 */
export function disableWallBuilder() {
  CanvasInteractionHandlers.disableWallBuilder();
}

/**
 * Enable measuring tool.
 */
export function enableMeasuringTool() {
  CanvasInteractionHandlers.enableMeasuringTool();
}

/**
 * Disable measuring tool.
 */
export function disableMeasuringTool() {
  CanvasInteractionHandlers.disableMeasuringTool();
}

/**
 * Enable pan mode.
 */
export function enablePan() {
  CanvasInteractionHandlers.enablePan();
}

/**
 * Disable pan mode.
 */
export function disablePan() {
  CanvasInteractionHandlers.disablePan();
}

/**
 * Enable poly builder.
 * @param {string} mode - Mode
 * @param {string} editingId - ID of shape being edited
 */
export function enablePolyBuilder(mode, editingId) {
  CanvasInteractionHandlers.enablePolyBuilder(mode, editingId);
}

/**
 * Disable poly builder.
 */
export function disablePolyBuilder() {
  CanvasInteractionHandlers.disablePolyBuilder();
}

/**
 * Check if any canvas tool is active.
 * @returns {boolean}
 */
export function isToolActive() {
  return CanvasInteractionHandlers.isAnyModeActive();
}

// ============================================
// ITEM EVENTS
// ============================================

/**
 * Attach event listeners to an item.
 * @param {Konva.Node} item - Item node
 * @param {object} options - Handler options
 */
export function attachItemListeners(item, options) {
  ItemHandlers.attachListeners(item, options);
}

/**
 * Remove event listeners from an item.
 * @param {Konva.Node} item - Item node
 */
export function removeItemListeners(item) {
  ItemHandlers.removeListeners(item);
}

/**
 * Attach listeners to multiple items.
 * @param {array} items - Array of items
 * @param {object} options - Handler options
 */
export function attachItemListenersBatch(items, options) {
  ItemHandlers.attachListenersBatch(items, options);
}

// ============================================
// STATE QUERIES
// ============================================

/**
 * Check if event manager is initialized.
 * @returns {boolean}
 */
export function isInitialized() {
  return state.isInitialized;
}

/**
 * Check if event handlers are enabled.
 * @returns {boolean}
 */
export function isEnabled() {
  return state.isEnabled;
}

/**
 * Check if shift key is pressed.
 * @returns {boolean}
 */
export function isShiftDown() {
  return KeyboardHandlers.isShiftDown();
}

/**
 * Check if wall builder is active.
 * @returns {boolean}
 */
export function isWallBuilderOn() {
  return CanvasInteractionHandlers.isWallBuilderOn();
}

/**
 * Check if measuring tool is active.
 * @returns {boolean}
 */
export function isMeasuringToolOn() {
  return CanvasInteractionHandlers.isMeasuringToolOn();
}

/**
 * Check if an item is being dragged.
 * @returns {boolean}
 */
export function isDragging() {
  return ItemHandlers.isDragging();
}

// ============================================
// ZOOM/SCROLL UPDATES
// ============================================

/**
 * Update zoom scale for handlers.
 * @param {number} scaleX - X scale
 * @param {number} scaleY - Y scale
 */
export function setZoomScale(scaleX, scaleY) {
  StageHandlers.setZoomScale(scaleX, scaleY);
}

/**
 * Update scroll offset for handlers.
 * @param {number} dx - X offset
 * @param {number} dy - Y offset
 */
export function setScrollOffset(dx, dy) {
  StageHandlers.setScrollOffset(dx, dy);
}

// ============================================
// GLOBAL EXPORT
// ============================================

const EventManager = {
  // Initialization
  init,
  updateContext,
  enable,
  disable,
  isInitialized,
  isEnabled,

  // Keyboard
  registerKeyboardActions,
  onKeyboardAction,
  setKeyboardBlocked,
  isShiftDown,

  // Stage
  registerStageCallbacks,
  clearSelection,
  selectNodes,
  getSelectedNodes,

  // Canvas Tools
  enableWallBuilder,
  disableWallBuilder,
  enableMeasuringTool,
  disableMeasuringTool,
  enablePan,
  disablePan,
  enablePolyBuilder,
  disablePolyBuilder,
  isToolActive,
  isWallBuilderOn,
  isMeasuringToolOn,

  // Items
  attachItemListeners,
  removeItemListeners,
  attachItemListenersBatch,
  isDragging,

  // Zoom/Scroll
  setZoomScale,
  setScrollOffset,

  // Sub-modules (for direct access if needed)
  Keyboard: KeyboardHandlers,
  Stage: StageHandlers,
  CanvasInteraction: CanvasInteractionHandlers,
  Item: ItemHandlers
};

export default EventManager;

// Make available globally
if (typeof window !== 'undefined') {
  window.VRC_EventManager = EventManager;
}
