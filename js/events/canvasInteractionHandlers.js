/**
 * VRC - Video Room Calculator
 * Canvas Interaction Handlers
 *
 * Handlers for canvas tools and interactions including:
 * - Wall Builder tool
 * - Poly Builder tool
 * - Selection tool (two-point selection)
 * - Measuring tool
 * - Pan/scroll functionality
 */

import { distance, lineAngleDegrees } from '../utils/geometry.js';

// ============================================
// STATE
// ============================================

/**
 * Internal state for canvas interactions.
 */
const state = {
  // Wall Builder
  wallBuilder: {
    isOn: false,
    writingState: 'none', // 'none', 'firstNode', 'writing'
    wallType: 'wallStd',
    points: [],
    lastRotation: 0
  },

  // Poly Builder
  polyBuilder: {
    isOn: false,
    mode: '', // '', 'customPathEditor', 'polyRoom'
    editingId: '',
    points: []
  },

  // Two-point selection (for scaling background)
  twoPointSelection: {
    isOn: false,
    point1: null,
    point2: null
  },

  // Measuring tool
  measuringTool: {
    isOn: false,
    point1: null,
    point2: null
  },

  // Pan/Scroll
  pan: {
    isOn: false,
    startX: 0,
    startY: 0,
    isMoving: false
  }
};

/**
 * Context object with app references.
 */
let context = {
  stage: null,
  scale: 50,
  unit: 'feet',
  pxOffset: 50,
  pyOffset: 50,
  // Konva elements
  wallBuilderRect: null,
  polyBuilderRect: null,
  select2PointsRect: null,
  panRectangle: null,
  distanceLine: null,
  measuringToolLabel: null,
  wallBuilderConnectorLine: null,
  lastWallBuilderNode: null,
  // Callbacks
  onWallCreated: null,
  onPolyCreated: null,
  onMeasurement: null,
  onScaleSet: null
};

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize with application context.
 * @param {object} ctx - Context object
 */
export function init(ctx) {
  context = { ...context, ...ctx };
  console.log('[CanvasInteractionHandlers] Initialized');
}

/**
 * Update context properties.
 * @param {object} updates - Properties to update
 */
export function updateContext(updates) {
  context = { ...context, ...updates };
}

// ============================================
// WALL BUILDER
// ============================================

/**
 * Enable wall builder mode.
 * @param {string} wallType - Wall type ('wallStd', 'wallGlass', 'wallWindow')
 */
export function enableWallBuilder(wallType = 'wallStd') {
  state.wallBuilder.isOn = true;
  state.wallBuilder.wallType = wallType;
  state.wallBuilder.writingState = 'none';
  state.wallBuilder.points = [];

  // Show wall builder rect
  if (context.wallBuilderRect) {
    context.wallBuilderRect.show();
    context.wallBuilderRect.moveToTop();
  }

  // Attach handlers
  attachWallBuilderHandlers();

  console.log('[WallBuilder] Enabled:', wallType);
}

/**
 * Disable wall builder mode.
 */
export function disableWallBuilder() {
  state.wallBuilder.isOn = false;
  state.wallBuilder.writingState = 'none';
  state.wallBuilder.points = [];

  // Hide wall builder rect
  if (context.wallBuilderRect) {
    context.wallBuilderRect.hide();
  }

  // Hide helper elements
  hideWallBuilderHelpers();

  console.log('[WallBuilder] Disabled');
}

/**
 * Restart wall builder (clear current wall, keep mode on).
 */
export function restartWallBuilder() {
  state.wallBuilder.writingState = 'none';
  state.wallBuilder.points = [];
  hideWallBuilderHelpers();
}

/**
 * Set wall builder wall type.
 * @param {string} wallType - Wall type
 */
export function setWallType(wallType) {
  state.wallBuilder.wallType = wallType;

  // Update visual indicator
  const colors = {
    wallStd: 'grey',
    wallGlass: '#ADD8E6',
    wallWindow: '#8993ff'
  };

  if (context.wallBuilderConnectorLine) {
    context.wallBuilderConnectorLine.stroke(colors[wallType] || 'grey');
  }
}

/**
 * Attach wall builder event handlers.
 */
function attachWallBuilderHandlers() {
  if (!context.wallBuilderRect) return;

  context.wallBuilderRect.on('pointerdown', handleWallBuilderPointerDown);
  context.wallBuilderRect.on('pointermove', handleWallBuilderPointerMove);
}

/**
 * Handle pointer down in wall builder mode.
 * @param {Konva.KonvaEventObject} e - Event
 */
function handleWallBuilderPointerDown(e) {
  const pos = getCanvasPosition(e);

  if (state.wallBuilder.writingState === 'none') {
    // First point
    state.wallBuilder.writingState = 'firstNode';
    state.wallBuilder.points = [pos];

    // Show start node
    if (context.lastWallBuilderNode) {
      context.lastWallBuilderNode.position(pos);
      context.lastWallBuilderNode.show();
    }
  } else {
    // Add point
    state.wallBuilder.points.push(pos);

    // Check for double-click to finish
    if (state.wallBuilder.points.length >= 2) {
      const lastIdx = state.wallBuilder.points.length - 1;
      const prevPoint = state.wallBuilder.points[lastIdx - 1];
      const dist = distance(pos.x, pos.y, prevPoint.x, prevPoint.y);

      if (dist < 10) {
        // Double-click detected, finish wall
        finishWallBuilder();
        return;
      }
    }

    // Create wall segment
    if (state.wallBuilder.points.length >= 2) {
      createWallSegment();
    }

    state.wallBuilder.writingState = 'writing';
  }
}

/**
 * Handle pointer move in wall builder mode.
 * @param {Konva.KonvaEventObject} e - Event
 */
function handleWallBuilderPointerMove(e) {
  if (state.wallBuilder.writingState === 'none') return;

  const pos = getCanvasPosition(e);
  const lastPoint = state.wallBuilder.points[state.wallBuilder.points.length - 1];

  // Update connector line
  if (context.wallBuilderConnectorLine && lastPoint) {
    context.wallBuilderConnectorLine.points([lastPoint.x, lastPoint.y, pos.x, pos.y]);
    context.wallBuilderConnectorLine.show();
  }
}

/**
 * Create a wall segment from the last two points.
 */
function createWallSegment() {
  const points = state.wallBuilder.points;
  if (points.length < 2) return;

  const p1 = points[points.length - 2];
  const p2 = points[points.length - 1];

  // Convert to room coordinates
  const roomP1 = pixelToRoom(p1.x, p1.y);
  const roomP2 = pixelToRoom(p2.x, p2.y);

  // Notify callback
  if (context.onWallCreated) {
    context.onWallCreated({
      x1: roomP1.x,
      y1: roomP1.y,
      x2: roomP2.x,
      y2: roomP2.y,
      wallType: state.wallBuilder.wallType
    });
  }
}

/**
 * Finish wall builder and create final wall.
 */
function finishWallBuilder() {
  // Remove duplicate last point
  state.wallBuilder.points.pop();

  if (state.wallBuilder.points.length >= 2) {
    createWallSegment();
  }

  restartWallBuilder();
}

/**
 * Hide wall builder helper elements.
 */
function hideWallBuilderHelpers() {
  const helpers = [
    context.wallBuilderConnectorLine,
    context.lastWallBuilderNode,
    context.beforeLastWallBuilderNode,
    context.hingeNode,
    context.newStartNode
  ];

  helpers.forEach(el => {
    if (el && el.hide) el.hide();
  });
}

// ============================================
// MEASURING TOOL
// ============================================

/**
 * Enable measuring tool.
 */
export function enableMeasuringTool() {
  state.measuringTool.isOn = true;
  state.measuringTool.point1 = null;
  state.measuringTool.point2 = null;

  // Show measuring elements
  if (context.select2PointsRect) {
    context.select2PointsRect.show();
    context.select2PointsRect.moveToTop();
  }

  attachMeasuringToolHandlers();
  console.log('[MeasuringTool] Enabled');
}

/**
 * Disable measuring tool.
 */
export function disableMeasuringTool() {
  state.measuringTool.isOn = false;
  state.measuringTool.point1 = null;
  state.measuringTool.point2 = null;

  // Hide measuring elements
  if (context.select2PointsRect) {
    context.select2PointsRect.hide();
  }
  if (context.distanceLine) {
    context.distanceLine.hide();
  }
  if (context.measuringToolLabel) {
    context.measuringToolLabel.hide();
  }

  console.log('[MeasuringTool] Disabled');
}

/**
 * Attach measuring tool handlers.
 */
function attachMeasuringToolHandlers() {
  if (!context.select2PointsRect) return;

  context.select2PointsRect.on('pointerdown', handleMeasuringToolPointerDown);
  context.select2PointsRect.on('pointermove', handleMeasuringToolPointerMove);
  context.select2PointsRect.on('pointerup', handleMeasuringToolPointerUp);
}

/**
 * Handle pointer down for measuring tool.
 * @param {Konva.KonvaEventObject} e - Event
 */
function handleMeasuringToolPointerDown(e) {
  const pos = getCanvasPosition(e);
  state.measuringTool.point1 = pos;
  state.measuringTool.point2 = pos;

  // Show distance line
  if (context.distanceLine) {
    context.distanceLine.points([pos.x, pos.y, pos.x, pos.y]);
    context.distanceLine.show();
  }

  // Show circle at start
  if (context.circleStart) {
    context.circleStart.position(pos);
    context.circleStart.show();
  }
}

/**
 * Handle pointer move for measuring tool.
 * @param {Konva.KonvaEventObject} e - Event
 */
function handleMeasuringToolPointerMove(e) {
  if (!state.measuringTool.point1) return;

  const pos = getCanvasPosition(e);
  state.measuringTool.point2 = pos;

  // Update distance line
  if (context.distanceLine) {
    const p1 = state.measuringTool.point1;
    context.distanceLine.points([p1.x, p1.y, pos.x, pos.y]);
  }

  // Update measurement display
  updateMeasurementDisplay();
}

/**
 * Handle pointer up for measuring tool.
 * @param {Konva.KonvaEventObject} e - Event
 */
function handleMeasuringToolPointerUp(e) {
  const pos = getCanvasPosition(e);
  state.measuringTool.point2 = pos;

  // Final measurement
  updateMeasurementDisplay();

  // Notify callback
  if (context.onMeasurement) {
    const measurement = calculateMeasurement();
    context.onMeasurement(measurement);
  }
}

/**
 * Update the measurement display label.
 */
function updateMeasurementDisplay() {
  if (!context.measuringToolLabel) return;

  const measurement = calculateMeasurement();

  // Update label text
  const textNode = context.measuringToolLabel.findOne('.measuringToolText');
  if (textNode) {
    textNode.text(`${measurement.meters.toFixed(2)} m / ${measurement.feet.toFixed(2)} ft`);
  }

  // Position label at midpoint
  const p1 = state.measuringTool.point1;
  const p2 = state.measuringTool.point2;
  if (p1 && p2) {
    context.measuringToolLabel.position({
      x: (p1.x + p2.x) / 2 + 10,
      y: (p1.y + p2.y) / 2 - 20
    });
    context.measuringToolLabel.show();
  }
}

/**
 * Calculate measurement from current points.
 * @returns {object} Measurement in meters and feet
 */
function calculateMeasurement() {
  const p1 = state.measuringTool.point1;
  const p2 = state.measuringTool.point2;

  if (!p1 || !p2) return { pixels: 0, meters: 0, feet: 0 };

  const pixels = distance(p1.x, p1.y, p2.x, p2.y);
  const roomUnits = pixels / context.scale;

  let meters, feet;
  if (context.unit === 'feet') {
    feet = roomUnits;
    meters = feet * 0.3048;
  } else {
    meters = roomUnits;
    feet = meters * 3.2808;
  }

  return { pixels, meters, feet };
}

// ============================================
// TWO-POINT SELECTION (Background Scaling)
// ============================================

/**
 * Enable two-point selection mode.
 */
export function enableTwoPointSelection() {
  state.twoPointSelection.isOn = true;
  state.twoPointSelection.point1 = null;
  state.twoPointSelection.point2 = null;

  if (context.select2PointsRect) {
    context.select2PointsRect.show();
    context.select2PointsRect.moveToTop();
  }

  console.log('[TwoPointSelection] Enabled');
}

/**
 * Disable two-point selection mode.
 */
export function disableTwoPointSelection() {
  state.twoPointSelection.isOn = false;

  if (context.select2PointsRect) {
    context.select2PointsRect.hide();
  }

  console.log('[TwoPointSelection] Disabled');
}

// ============================================
// PAN/SCROLL
// ============================================

/**
 * Enable pan mode.
 */
export function enablePan() {
  state.pan.isOn = true;

  if (context.panRectangle) {
    context.panRectangle.show();
    context.panRectangle.moveToTop();
  }

  attachPanHandlers();
  console.log('[Pan] Enabled');
}

/**
 * Disable pan mode.
 */
export function disablePan() {
  state.pan.isOn = false;

  if (context.panRectangle) {
    context.panRectangle.hide();
  }

  console.log('[Pan] Disabled');
}

/**
 * Attach pan handlers.
 */
function attachPanHandlers() {
  if (!context.panRectangle) return;

  context.panRectangle.on('mousedown', handlePanMouseDown);
  context.panRectangle.on('mousemove', handlePanMouseMove);
  context.panRectangle.on('mouseup', handlePanMouseUp);
}

/**
 * Handle mouse down for pan.
 * @param {Konva.KonvaEventObject} e - Event
 */
function handlePanMouseDown(e) {
  state.pan.startX = e.evt.clientX;
  state.pan.startY = e.evt.clientY;
  state.pan.isMoving = true;
}

/**
 * Handle mouse move for pan.
 * @param {Konva.KonvaEventObject} e - Event
 */
function handlePanMouseMove(e) {
  if (!state.pan.isMoving) return;

  const dx = e.evt.clientX - state.pan.startX;
  const dy = e.evt.clientY - state.pan.startY;

  // Update scroll position
  if (context.scrollContainer) {
    context.scrollContainer.scrollLeft -= dx;
    context.scrollContainer.scrollTop -= dy;
  }

  state.pan.startX = e.evt.clientX;
  state.pan.startY = e.evt.clientY;
}

/**
 * Handle mouse up for pan.
 * @param {Konva.KonvaEventObject} e - Event
 */
function handlePanMouseUp(e) {
  state.pan.isMoving = false;
}

// ============================================
// POLY BUILDER
// ============================================

/**
 * Enable poly builder mode.
 * @param {string} mode - Mode ('customPathEditor' or 'polyRoom')
 * @param {string} editingId - ID of shape being edited (optional)
 */
export function enablePolyBuilder(mode = 'polyRoom', editingId = '') {
  state.polyBuilder.isOn = true;
  state.polyBuilder.mode = mode;
  state.polyBuilder.editingId = editingId;
  state.polyBuilder.points = [];

  if (context.polyBuilderRect) {
    context.polyBuilderRect.show();
    context.polyBuilderRect.moveToTop();
  }

  console.log('[PolyBuilder] Enabled:', mode);
}

/**
 * Disable poly builder mode.
 */
export function disablePolyBuilder() {
  state.polyBuilder.isOn = false;
  state.polyBuilder.mode = '';
  state.polyBuilder.editingId = '';
  state.polyBuilder.points = [];

  if (context.polyBuilderRect) {
    context.polyBuilderRect.hide();
  }

  console.log('[PolyBuilder] Disabled');
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get canvas position from event.
 * @param {Konva.KonvaEventObject} e - Event
 * @returns {object} Position {x, y}
 */
function getCanvasPosition(e) {
  if (context.stage) {
    const pos = context.stage.getPointerPosition();
    return { x: pos.x, y: pos.y };
  }

  // Fallback to event coordinates
  return {
    x: e.evt.clientX,
    y: e.evt.clientY
  };
}

/**
 * Convert pixel coordinates to room coordinates.
 * @param {number} px - Pixel X
 * @param {number} py - Pixel Y
 * @returns {object} Room coordinates {x, y}
 */
function pixelToRoom(px, py) {
  return {
    x: (px - context.pxOffset) / context.scale,
    y: (py - context.pyOffset) / context.scale
  };
}

/**
 * Convert room coordinates to pixel coordinates.
 * @param {number} rx - Room X
 * @param {number} ry - Room Y
 * @returns {object} Pixel coordinates {x, y}
 */
function roomToPixel(rx, ry) {
  return {
    x: rx * context.scale + context.pxOffset,
    y: ry * context.scale + context.pyOffset
  };
}

// ============================================
// STATE GETTERS
// ============================================

/**
 * Check if wall builder is active.
 * @returns {boolean}
 */
export function isWallBuilderOn() {
  return state.wallBuilder.isOn;
}

/**
 * Check if poly builder is active.
 * @returns {boolean}
 */
export function isPolyBuilderOn() {
  return state.polyBuilder.isOn;
}

/**
 * Check if measuring tool is active.
 * @returns {boolean}
 */
export function isMeasuringToolOn() {
  return state.measuringTool.isOn;
}

/**
 * Check if two-point selection is active.
 * @returns {boolean}
 */
export function isTwoPointSelectionOn() {
  return state.twoPointSelection.isOn;
}

/**
 * Check if pan is active.
 * @returns {boolean}
 */
export function isPanOn() {
  return state.pan.isOn;
}

/**
 * Check if any interaction mode is active.
 * @returns {boolean}
 */
export function isAnyModeActive() {
  return (
    state.wallBuilder.isOn ||
    state.polyBuilder.isOn ||
    state.measuringTool.isOn ||
    state.twoPointSelection.isOn ||
    state.pan.isOn
  );
}

/**
 * Get current state (for debugging).
 * @returns {object}
 */
export function getState() {
  return { ...state };
}

// ============================================
// GLOBAL EXPORT
// ============================================

const CanvasInteractionHandlers = {
  init,
  updateContext,

  // Wall Builder
  enableWallBuilder,
  disableWallBuilder,
  restartWallBuilder,
  setWallType,
  isWallBuilderOn,

  // Poly Builder
  enablePolyBuilder,
  disablePolyBuilder,
  isPolyBuilderOn,

  // Measuring Tool
  enableMeasuringTool,
  disableMeasuringTool,
  isMeasuringToolOn,

  // Two-Point Selection
  enableTwoPointSelection,
  disableTwoPointSelection,
  isTwoPointSelectionOn,

  // Pan
  enablePan,
  disablePan,
  isPanOn,

  // Utilities
  isAnyModeActive,
  getState
};

export default CanvasInteractionHandlers;

// Make available globally
if (typeof window !== 'undefined') {
  window.VRC_CanvasInteractionHandlers = CanvasInteractionHandlers;
}
