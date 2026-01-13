/**
 * VRC - Video Room Calculator
 * Stage Event Handlers
 *
 * Konva stage event handling extracted from roomcalc.js.
 * Manages click, tap, drag, and selection events on the canvas.
 */

// ============================================
// STATE
// ============================================

/**
 * Internal state for stage event handling.
 */
const state = {
  selecting: false,
  x1: 0,
  y1: 0,
  x2: 0,
  y2: 0,
  zoomScaleX: 1,
  zoomScaleY: 1,
  dx: 0,
  dy: 0,
  rightClickTouchTimer: null,
  isEnabled: false
};

/**
 * Context object containing references to app state and functions.
 */
let context = {
  stage: null,
  tr: null,
  selectionRectangle: null,
  canvasToJson: null,
  // Groups for selection
  groups: {
    videoDevices: null,
    microphones: null,
    displays: null,
    speakers: null,
    tables: null,
    chairs: null,
    boxes: null,
    rooms: null,
    stageFloors: null,
    touchPanels: null
  },
  // App state flags
  panScrollableOn: false,
  isSelectingTwoPointsOn: false,
  movingBackgroundImage: false,
  selectingOuterWall: false,
  isWallBuilderOn: false,
  isWallWriterOn2: false,
  isPolyBuilderOn: false,
  mobileDevice: 'false'
};

/**
 * Event callbacks.
 */
const callbacks = {
  onSelect: null,
  onDeselect: null,
  onClick: null,
  onDoubleClick: null,
  onRightClick: null,
  onDragStart: null,
  onDragEnd: null,
  onSelectionChange: null
};

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  rightClickTouchTimerDelta: 1500,
  rightClickMenuDialogId: 'rightClickMenuDialog'
};

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize stage handlers with application context.
 * @param {object} ctx - Context object with app references
 */
export function init(ctx) {
  context = { ...context, ...ctx };
  console.log('[StageHandlers] Initialized');
}

/**
 * Update context properties.
 * @param {object} updates - Properties to update
 */
export function updateContext(updates) {
  context = { ...context, ...updates };
}

/**
 * Update zoom scale values.
 * @param {number} scaleX - X scale
 * @param {number} scaleY - Y scale
 */
export function setZoomScale(scaleX, scaleY) {
  state.zoomScaleX = scaleX;
  state.zoomScaleY = scaleY;
}

/**
 * Update scroll offset values.
 * @param {number} dx - X offset
 * @param {number} dy - Y offset
 */
export function setScrollOffset(dx, dy) {
  state.dx = dx;
  state.dy = dy;
}

// ============================================
// EVENT BINDING
// ============================================

/**
 * Attach all stage event listeners.
 */
export function enable() {
  if (state.isEnabled || !context.stage) return;

  const stage = context.stage;

  // Click/Tap for selection
  stage.on('click tap', handleClickTap);

  // Mouse/Touch down for selection box
  stage.on('mousedown touchstart', handleMouseDownTouchStart);

  // Mouse/Touch move for selection box
  stage.on('mousemove touchmove', handleMouseMoveTouchMove);

  // Mouse/Touch up for selection completion
  stage.on('mouseup touchend', handleMouseUpTouchEnd);

  // Context menu (right-click)
  stage.on('contextmenu', handleContextMenu);

  state.isEnabled = true;
  console.log('[StageHandlers] Enabled');
}

/**
 * Remove all stage event listeners.
 */
export function disable() {
  if (!state.isEnabled || !context.stage) return;

  const stage = context.stage;

  stage.off('click tap', handleClickTap);
  stage.off('mousedown touchstart', handleMouseDownTouchStart);
  stage.off('mousemove touchmove', handleMouseMoveTouchMove);
  stage.off('mouseup touchend', handleMouseUpTouchEnd);
  stage.off('contextmenu', handleContextMenu);

  state.isEnabled = false;
  console.log('[StageHandlers] Disabled');
}

// ============================================
// CALLBACK REGISTRATION
// ============================================

/**
 * Register event callbacks.
 * @param {object} cbs - Callback object
 */
export function setCallbacks(cbs) {
  Object.assign(callbacks, cbs);
}

/**
 * Register a single callback.
 * @param {string} event - Event name
 * @param {function} callback - Callback function
 */
export function on(event, callback) {
  if (callbacks.hasOwnProperty(event)) {
    callbacks[event] = callback;
  }
}

// ============================================
// EVENT HANDLERS
// ============================================

/**
 * Handle click/tap events on stage.
 * @param {Konva.KonvaEventObject} e - Konva event
 */
function handleClickTap(e) {
  // Mobile touch counting for escape zoom
  if (callbacks.onMobileTouch && context.mobileDevice !== 'false') {
    callbacks.onMobileTouch();
  }

  // Check if background image resize is active
  if (isBackgroundImageResizeActive()) return;

  // Handle click on transform layer items
  if (e.target.findAncestor && e.target.findAncestor('.layerTransform')) {
    if (callbacks.onClick) {
      callbacks.onClick(e);
    }
  }

  // Selection logic
  if (state.selecting) return;

  if (context.selectionRectangle && context.selectionRectangle.visible()) {
    return;
  }

  // Click on non-draggable clears selection
  if (!e.target.draggable()) {
    if (context.tr) {
      context.tr.resizeEnabled(false);
      context.tr.nodes([]);
    }
    if (callbacks.onDeselect) {
      callbacks.onDeselect(e);
    }
    return;
  }

  // Handle multi-select with shift/ctrl
  handleSelection(e);
}

/**
 * Handle mouse down / touch start for selection box.
 * @param {Konva.KonvaEventObject} e - Konva event
 */
function handleMouseDownTouchStart(e) {
  // Skip if any special mode is active
  if (isSpecialModeActive()) return;

  // Clear any existing right-click timer
  clearTimeout(state.rightClickTouchTimer);

  // Start right-click timer for touch devices
  if (context.mobileDevice !== 'false') {
    state.rightClickTouchTimer = setTimeout(() => {
      if (callbacks.onRightClick) {
        callbacks.onRightClick(e);
      }
    }, CONFIG.rightClickTouchTimerDelta);
  }

  // Don't start selection if clicking on an item
  if (e.target.findAncestor && e.target.findAncestor('.layerTransform')) {
    return;
  }

  // Prevent default
  if (e.evt) e.evt.preventDefault();

  // Record starting position
  const pos = context.stage.getPointerPosition();
  state.x1 = pos.x / state.zoomScaleX;
  state.y1 = pos.y / state.zoomScaleY;
  state.x2 = state.x1;
  state.y2 = state.y1;

  // Reset selection rectangle
  if (context.selectionRectangle) {
    context.selectionRectangle.width(0);
    context.selectionRectangle.height(0);
  }

  state.selecting = true;
}

/**
 * Handle mouse move / touch move for selection box.
 * @param {Konva.KonvaEventObject} e - Konva event
 */
function handleMouseMoveTouchMove(e) {
  if (!state.selecting) return;
  if (isSpecialModeActive()) return;

  if (e.evt) e.evt.preventDefault();

  // Disable resize while selecting
  if (context.tr && !isBackgroundImageSelected()) {
    context.tr.resizeEnabled(false);
  }

  // Update selection rectangle
  const pos = context.stage.getPointerPosition();
  state.x2 = pos.x / state.zoomScaleX;
  state.y2 = pos.y / state.zoomScaleY;

  if (context.selectionRectangle) {
    context.selectionRectangle.setAttrs({
      visible: true,
      x: Math.min(state.x1, state.x2) + state.dx / state.zoomScaleX,
      y: Math.min(state.y1, state.y2) + state.dy / state.zoomScaleY,
      width: Math.abs(state.x2 - state.x1),
      height: Math.abs(state.y2 - state.y1)
    });
  }
}

/**
 * Handle mouse up / touch end for selection completion.
 * @param {Konva.KonvaEventObject} e - Konva event
 */
function handleMouseUpTouchEnd(e) {
  // Save state
  if (context.canvasToJson) {
    context.canvasToJson();
  }

  // Clear right-click timer
  clearTimeout(state.rightClickTouchTimer);

  state.selecting = false;

  // Check if selection rectangle was used
  if (!context.selectionRectangle || !context.selectionRectangle.visible()) {
    return;
  }

  if (e.evt) e.evt.preventDefault();

  // Hide selection rectangle after a brief delay
  setTimeout(() => {
    if (context.selectionRectangle) {
      context.selectionRectangle.visible(false);
    }
  }, 1);

  // Find all items that intersect with selection
  const selectedShapes = findShapesInSelection();

  // Update transformer
  if (context.tr) {
    context.tr.nodes(selectedShapes);
  }

  // Handle single selection of resizable items
  if (selectedShapes.length === 1) {
    const parent = selectedShapes[0].getParent();
    if (parent && isResizableGroup(parent.name())) {
      if (callbacks.onResizableSelected) {
        callbacks.onResizableSelected(selectedShapes[0]);
      }
    }
  }

  // Focus stage for keyboard shortcuts
  if (context.stage) {
    context.stage.container().tabIndex = 1;
    context.stage.container().focus();
  }

  // Notify selection change
  if (callbacks.onSelectionChange) {
    callbacks.onSelectionChange(selectedShapes);
  }
}

/**
 * Handle context menu (right-click).
 * @param {Konva.KonvaEventObject} e - Konva event
 */
function handleContextMenu(e) {
  // Prevent default browser context menu
  if (e.evt) e.evt.preventDefault();

  if (callbacks.onRightClick) {
    callbacks.onRightClick(e);
  }
}

// ============================================
// SELECTION HELPERS
// ============================================

/**
 * Handle item selection with shift/ctrl modifiers.
 * @param {Konva.KonvaEventObject} e - Konva event
 */
function handleSelection(e) {
  if (!context.tr) return;

  const metaPressed = e.evt && (e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey);
  const isSelected = context.tr.nodes().indexOf(e.target) >= 0;

  if (!metaPressed && !isSelected) {
    // Single selection (replace)
    context.tr.nodes([e.target]);
  } else if (metaPressed && isSelected) {
    // Deselect
    const nodes = context.tr.nodes().slice();
    nodes.splice(nodes.indexOf(e.target), 1);
    context.tr.nodes(nodes);
  } else if (metaPressed && !isSelected) {
    // Add to selection
    const nodes = context.tr.nodes().concat([e.target]);
    context.tr.nodes(nodes);
  }

  // Notify selection change
  if (callbacks.onSelectionChange) {
    callbacks.onSelectionChange(context.tr.nodes());
  }
}

/**
 * Find all shapes within the selection rectangle.
 * @returns {array} Array of selected Konva nodes
 */
function findShapesInSelection() {
  if (!context.selectionRectangle) return [];

  // Gather all selectable shapes from groups
  let shapes = [];
  const groupNames = [
    'videoDevices', 'microphones', 'displays', 'speakers',
    'tables', 'chairs', 'boxes', 'rooms', 'stageFloors', 'touchPanels'
  ];

  for (const name of groupNames) {
    const group = context.groups[name];
    if (group && group.getChildren) {
      shapes = shapes.concat(group.getChildren());
    }
  }

  // Get selection box bounds
  const box = getSelectionBounds();

  // Filter shapes that intersect with selection
  return shapes.filter(node => {
    if (!node.listening()) return false;

    const nodeBox = getNodeBounds(node);
    return doBoxesIntersect(box, nodeBox);
  });
}

/**
 * Get the bounding box of the selection rectangle.
 * @returns {object} Bounding box {x, y, width, height}
 */
function getSelectionBounds() {
  if (!context.selectionRectangle) return { x: 0, y: 0, width: 0, height: 0 };

  return {
    x: context.selectionRectangle.x(),
    y: context.selectionRectangle.y(),
    width: context.selectionRectangle.width(),
    height: context.selectionRectangle.height()
  };
}

/**
 * Get the bounding box of a Konva node.
 * @param {Konva.Node} node - Konva node
 * @returns {object} Bounding box
 */
function getNodeBounds(node) {
  const rect = node.getClientRect();
  return {
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height
  };
}

/**
 * Check if two bounding boxes intersect.
 * @param {object} box1 - First box
 * @param {object} box2 - Second box
 * @returns {boolean}
 */
function doBoxesIntersect(box1, box2) {
  return !(
    box1.x + box1.width < box2.x ||
    box2.x + box2.width < box1.x ||
    box1.y + box1.height < box2.y ||
    box2.y + box2.height < box1.y
  );
}

// ============================================
// STATE CHECKS
// ============================================

/**
 * Check if any special mode is active that should block selection.
 * @returns {boolean}
 */
function isSpecialModeActive() {
  return (
    context.panScrollableOn ||
    context.isSelectingTwoPointsOn ||
    context.movingBackgroundImage ||
    context.selectingOuterWall ||
    context.isWallBuilderOn ||
    context.isWallWriterOn2 ||
    context.isPolyBuilderOn
  );
}

/**
 * Check if background image resize is active.
 * @returns {boolean}
 */
function isBackgroundImageResizeActive() {
  if (typeof document === 'undefined') return false;
  const checkbox = document.getElementById('resizeBackgroundImageCheckBox');
  return checkbox && checkbox.checked;
}

/**
 * Check if background image is selected.
 * @returns {boolean}
 */
function isBackgroundImageSelected() {
  if (!context.tr || context.tr.nodes().length !== 1) return false;
  const node = context.tr.nodes()[0];
  return node.id() && node.id().startsWith('backgroundImageFloor');
}

/**
 * Check if a group is resizable (tables, walls, etc.).
 * @param {string} groupName - Group name
 * @returns {boolean}
 */
function isResizableGroup(groupName) {
  const resizableGroups = ['tables', 'stageFloors', 'boxes', 'rooms'];
  return resizableGroups.includes(groupName);
}

// ============================================
// PUBLIC API
// ============================================

/**
 * Get current selection state.
 * @returns {boolean}
 */
export function isSelecting() {
  return state.selecting;
}

/**
 * Clear current selection.
 */
export function clearSelection() {
  if (context.tr) {
    context.tr.nodes([]);
  }
  if (callbacks.onSelectionChange) {
    callbacks.onSelectionChange([]);
  }
}

/**
 * Select specific nodes.
 * @param {array} nodes - Array of Konva nodes
 */
export function selectNodes(nodes) {
  if (context.tr) {
    context.tr.nodes(nodes);
  }
  if (callbacks.onSelectionChange) {
    callbacks.onSelectionChange(nodes);
  }
}

/**
 * Get currently selected nodes.
 * @returns {array}
 */
export function getSelectedNodes() {
  return context.tr ? context.tr.nodes() : [];
}

// ============================================
// GLOBAL EXPORT
// ============================================

const StageHandlers = {
  init,
  updateContext,
  setZoomScale,
  setScrollOffset,
  enable,
  disable,
  setCallbacks,
  on,
  isSelecting,
  clearSelection,
  selectNodes,
  getSelectedNodes
};

export default StageHandlers;

// Make available globally for non-module usage
if (typeof window !== 'undefined') {
  window.VRC_StageHandlers = StageHandlers;
}
