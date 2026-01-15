/**
 * VRC - Video Room Calculator
 * Canvas Renderer
 *
 * Manages Konva canvas rendering operations including
 * grid drawing, room outlines, and item rendering.
 */

import { CANVAS_DEFAULTS, UI_COLORS } from '../core/constants.js';

// ============================================
// CANVAS SETUP
// ============================================

/**
 * Configuration for canvas rendering.
 */
let config = {
  pxOffset: CANVAS_DEFAULTS.PX_OFFSET,
  pyOffset: CANVAS_DEFAULTS.PX_OFFSET,
  scale: 50,
  gridColor: '#ddd',
  gridLineWidth: 0.5,
  wallColor: '#333',
  wallWidth: 3
};

/**
 * Reference to Konva stage.
 * @type {Konva.Stage|null}
 */
let stage = null;

/**
 * Reference to main layers.
 */
let layers = {
  grid: null,
  transform: null,
  selectionBox: null
};

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize the renderer with a Konva stage.
 * @param {Konva.Stage} konvaStage - The Konva stage
 * @param {object} konvaLayers - Object containing layer references
 */
export function init(konvaStage, konvaLayers = {}) {
  stage = konvaStage;
  layers = { ...layers, ...konvaLayers };
  console.log('[Renderer] Initialized');
}

/**
 * Update renderer configuration.
 * @param {object} newConfig - Configuration updates
 */
export function updateConfig(newConfig) {
  config = { ...config, ...newConfig };
}

/**
 * Get current configuration.
 * @returns {object} Current config
 */
export function getConfig() {
  return { ...config };
}

// ============================================
// COORDINATE CONVERSION
// ============================================

/**
 * Convert room coordinates to pixel coordinates.
 * @param {number} roomX - X coordinate in room units
 * @param {number} roomY - Y coordinate in room units
 * @returns {object} Pixel coordinates {x, y}
 */
export function roomToPixel(roomX, roomY) {
  return {
    x: roomX * config.scale + config.pxOffset,
    y: roomY * config.scale + config.pyOffset
  };
}

/**
 * Convert pixel coordinates to room coordinates.
 * @param {number} pixelX - X coordinate in pixels
 * @param {number} pixelY - Y coordinate in pixels
 * @returns {object} Room coordinates {x, y}
 */
export function pixelToRoom(pixelX, pixelY) {
  return {
    x: (pixelX - config.pxOffset) / config.scale,
    y: (pixelY - config.pyOffset) / config.scale
  };
}

/**
 * Convert mouse event coordinates to canvas pixel coordinates.
 * @param {number} clientX - Mouse client X
 * @param {number} clientY - Mouse client Y
 * @returns {object} Canvas coordinates
 */
export function mouseToCanvas(clientX, clientY) {
  if (!stage) return { x: 0, y: 0 };

  const container = stage.container();
  const rect = container.getBoundingClientRect();

  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  };
}

/**
 * Convert mouse event to room coordinates.
 * @param {number} clientX - Mouse client X
 * @param {number} clientY - Mouse client Y
 * @returns {object} Room coordinates
 */
export function mouseToRoom(clientX, clientY) {
  const canvas = mouseToCanvas(clientX, clientY);
  return pixelToRoom(canvas.x, canvas.y);
}

// ============================================
// GRID DRAWING
// ============================================

/**
 * Draw grid lines on the canvas.
 * @param {Konva.Layer|Konva.Group} layer - Layer to draw on
 * @param {number} roomWidth - Room width in units
 * @param {number} roomLength - Room length in units
 * @param {object} options - Drawing options
 */
export function drawGrid(layer, roomWidth, roomLength, options = {}) {
  const {
    color = config.gridColor,
    lineWidth = config.gridLineWidth,
    spacing = 1,
    showLabels = false
  } = options;

  // Calculate grid bounds
  const startX = config.pxOffset;
  const startY = config.pyOffset;
  const endX = startX + roomLength * config.scale;
  const endY = startY + roomWidth * config.scale;

  // Draw vertical lines
  for (let i = 0; i <= roomLength; i += spacing) {
    const x = startX + i * config.scale;
    const line = new Konva.Line({
      points: [x, startY, x, endY],
      stroke: color,
      strokeWidth: lineWidth,
      name: 'gridLine'
    });
    layer.add(line);

    // Add label
    if (showLabels && i > 0) {
      const label = new Konva.Text({
        x: x - 10,
        y: startY - 20,
        text: String(i),
        fontSize: 10,
        fill: '#666',
        name: 'gridLabel'
      });
      layer.add(label);
    }
  }

  // Draw horizontal lines
  for (let i = 0; i <= roomWidth; i += spacing) {
    const y = startY + i * config.scale;
    const line = new Konva.Line({
      points: [startX, y, endX, y],
      stroke: color,
      strokeWidth: lineWidth,
      name: 'gridLine'
    });
    layer.add(line);

    // Add label
    if (showLabels && i > 0) {
      const label = new Konva.Text({
        x: startX - 25,
        y: y - 5,
        text: String(i),
        fontSize: 10,
        fill: '#666',
        name: 'gridLabel'
      });
      layer.add(label);
    }
  }
}

/**
 * Clear grid lines from a layer.
 * @param {Konva.Layer|Konva.Group} layer - Layer to clear
 */
export function clearGrid(layer) {
  const gridLines = layer.find('.gridLine');
  const gridLabels = layer.find('.gridLabel');

  gridLines.forEach(line => line.destroy());
  gridLabels.forEach(label => label.destroy());
}

// ============================================
// ROOM OUTLINE DRAWING
// ============================================

/**
 * Draw room outline/walls.
 * @param {Konva.Layer|Konva.Group} layer - Layer to draw on
 * @param {number} roomWidth - Room width in units
 * @param {number} roomLength - Room length in units
 * @param {object} options - Drawing options
 */
export function drawRoomOutline(layer, roomWidth, roomLength, options = {}) {
  const {
    color = config.wallColor,
    lineWidth = config.wallWidth,
    fill = null,
    cornerRadius = 0
  } = options;

  const startX = config.pxOffset;
  const startY = config.pyOffset;
  const width = roomLength * config.scale;
  const height = roomWidth * config.scale;

  const rect = new Konva.Rect({
    x: startX,
    y: startY,
    width: width,
    height: height,
    stroke: color,
    strokeWidth: lineWidth,
    fill: fill,
    cornerRadius: cornerRadius,
    name: 'roomOutline'
  });

  layer.add(rect);
  return rect;
}

/**
 * Draw a custom room shape from points.
 * @param {Konva.Layer|Konva.Group} layer - Layer to draw on
 * @param {array} points - Array of points [x1, y1, x2, y2, ...]
 * @param {object} options - Drawing options
 */
export function drawCustomRoomShape(layer, points, options = {}) {
  const {
    color = config.wallColor,
    lineWidth = config.wallWidth,
    fill = null,
    closed = true
  } = options;

  // Convert room coordinates to pixels
  const pixelPoints = [];
  for (let i = 0; i < points.length; i += 2) {
    const pixel = roomToPixel(points[i], points[i + 1]);
    pixelPoints.push(pixel.x, pixel.y);
  }

  const line = new Konva.Line({
    points: pixelPoints,
    stroke: color,
    strokeWidth: lineWidth,
    fill: fill,
    closed: closed,
    name: 'customRoomShape'
  });

  layer.add(line);
  return line;
}

// ============================================
// COVERAGE OVERLAY DRAWING
// ============================================

/**
 * Draw a camera field of view wedge.
 * @param {Konva.Group} group - Group to add to
 * @param {object} camera - Camera configuration
 * @returns {Konva.Wedge} The FOV wedge
 */
export function drawCameraFOV(group, camera) {
  const {
    x = 0,
    y = 0,
    rotation = 0,
    fovAngle = 83,
    fovRadius = 10,
    color = 'rgba(255, 200, 0, 0.2)',
    id
  } = camera;

  const pixel = roomToPixel(x, y);

  const wedge = new Konva.Wedge({
    x: pixel.x,
    y: pixel.y,
    radius: fovRadius * config.scale,
    angle: fovAngle,
    rotation: rotation - fovAngle / 2,
    fill: color,
    id: id ? `fov~${id}` : undefined,
    name: 'cameraFOV',
    listening: false
  });

  group.add(wedge);
  return wedge;
}

/**
 * Draw a microphone range circle.
 * @param {Konva.Group} group - Group to add to
 * @param {object} mic - Microphone configuration
 * @returns {Konva.Circle} The range circle
 */
export function drawMicRange(group, mic) {
  const {
    x = 0,
    y = 0,
    range = 2.5,
    color = 'rgba(0, 200, 255, 0.15)',
    id
  } = mic;

  const pixel = roomToPixel(x, y);

  const circle = new Konva.Circle({
    x: pixel.x,
    y: pixel.y,
    radius: range * config.scale,
    fill: color,
    id: id ? `audio~${id}` : undefined,
    name: 'micRange',
    listening: false
  });

  group.add(circle);
  return circle;
}

/**
 * Draw a speaker range indicator.
 * @param {Konva.Group} group - Group to add to
 * @param {object} speaker - Speaker configuration
 * @returns {Konva.Circle} The range circle
 */
export function drawSpeakerRange(group, speaker) {
  const {
    x = 0,
    y = 0,
    range = 5,
    color = 'rgba(200, 0, 255, 0.1)',
    id
  } = speaker;

  const pixel = roomToPixel(x, y);

  const circle = new Konva.Circle({
    x: pixel.x,
    y: pixel.y,
    radius: range * config.scale,
    fill: color,
    id: id ? `speaker~${id}` : undefined,
    name: 'speakerRange',
    listening: false
  });

  group.add(circle);
  return circle;
}

/**
 * Draw display viewing distance lines.
 * @param {Konva.Group} group - Group to add to
 * @param {object} display - Display configuration
 * @returns {Konva.Group} Group containing distance lines
 */
export function drawDisplayDistance(group, display) {
  const {
    x = 0,
    y = 0,
    rotation = 0,
    diagonalInches = 55,
    id
  } = display;

  const pixel = roomToPixel(x, y);

  // Calculate viewing distances (in room units)
  const minDistance = diagonalInches * 0.0254 * 1.5; // 1.5x diagonal
  const maxDistance = diagonalInches * 0.0254 * 3;   // 3x diagonal

  const distGroup = new Konva.Group({
    x: pixel.x,
    y: pixel.y,
    rotation: rotation,
    id: id ? `dispDist~${id}` : undefined,
    name: 'displayDistance'
  });

  // Draw min/max distance arcs
  const minArc = new Konva.Arc({
    innerRadius: 0,
    outerRadius: minDistance * config.scale,
    angle: 120,
    rotation: -60,
    fill: 'rgba(255, 100, 100, 0.1)',
    name: 'minDistance'
  });

  const maxArc = new Konva.Arc({
    innerRadius: minDistance * config.scale,
    outerRadius: maxDistance * config.scale,
    angle: 120,
    rotation: -60,
    fill: 'rgba(100, 255, 100, 0.1)',
    name: 'maxDistance'
  });

  distGroup.add(maxArc);
  distGroup.add(minArc);
  group.add(distGroup);

  return distGroup;
}

// ============================================
// HELPER SHAPES
// ============================================

/**
 * Draw a selection rectangle.
 * @param {Konva.Layer} layer - Layer to draw on
 * @param {number} x1 - Start X
 * @param {number} y1 - Start Y
 * @param {number} x2 - End X
 * @param {number} y2 - End Y
 * @returns {Konva.Rect} Selection rectangle
 */
export function drawSelectionRect(layer, x1, y1, x2, y2) {
  const rect = new Konva.Rect({
    x: Math.min(x1, x2),
    y: Math.min(y1, y2),
    width: Math.abs(x2 - x1),
    height: Math.abs(y2 - y1),
    stroke: '#4169E1',
    strokeWidth: 1,
    dash: [5, 5],
    fill: 'rgba(65, 105, 225, 0.1)',
    name: 'selectionRect'
  });

  layer.add(rect);
  return rect;
}

/**
 * Draw a measurement line with label.
 * @param {Konva.Layer} layer - Layer to draw on
 * @param {number} x1 - Start X
 * @param {number} y1 - Start Y
 * @param {number} x2 - End X
 * @param {number} y2 - End Y
 * @param {string} label - Distance label
 * @returns {Konva.Group} Group containing line and label
 */
export function drawMeasurementLine(layer, x1, y1, x2, y2, label) {
  const group = new Konva.Group({ name: 'measurementLine' });

  const line = new Konva.Line({
    points: [x1, y1, x2, y2],
    stroke: 'red',
    strokeWidth: 2,
    name: 'measureLine'
  });

  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  const text = new Konva.Text({
    x: midX + 10,
    y: midY - 10,
    text: label,
    fontSize: 14,
    fill: 'red',
    name: 'measureLabel'
  });

  // Start/end circles
  const startCircle = new Konva.Circle({
    x: x1,
    y: y1,
    radius: 4,
    fill: 'red',
    name: 'measureStart'
  });

  const endCircle = new Konva.Circle({
    x: x2,
    y: y2,
    radius: 4,
    fill: 'red',
    name: 'measureEnd'
  });

  group.add(line);
  group.add(text);
  group.add(startCircle);
  group.add(endCircle);
  layer.add(group);

  return group;
}

// ============================================
// LAYER MANAGEMENT
// ============================================

/**
 * Clear all shapes from a layer or group.
 * @param {Konva.Layer|Konva.Group} layer - Layer to clear
 * @param {string} [selector] - Optional selector to filter shapes
 */
export function clearLayer(layer, selector = null) {
  if (selector) {
    const shapes = layer.find(selector);
    shapes.forEach(shape => shape.destroy());
  } else {
    layer.destroyChildren();
  }
}

/**
 * Redraw the stage.
 */
export function redraw() {
  if (stage) {
    stage.batchDraw();
  }
}

/**
 * Get the current stage.
 * @returns {Konva.Stage|null}
 */
export function getStage() {
  return stage;
}

// ============================================
// ZOOM AND PAN
// ============================================

/**
 * Zoom the canvas.
 * @param {number} factor - Zoom factor (e.g., 1.2 to zoom in 20%)
 * @param {object} [center] - Center point for zoom
 */
export function zoom(factor, center = null) {
  if (!stage) return;

  const oldScale = stage.scaleX();
  const newScale = oldScale * factor;

  // Clamp zoom
  const clampedScale = Math.min(Math.max(newScale, 0.1), 5);

  if (center) {
    // Zoom towards center point
    const mousePointTo = {
      x: (center.x - stage.x()) / oldScale,
      y: (center.y - stage.y()) / oldScale
    };

    stage.scale({ x: clampedScale, y: clampedScale });

    const newPos = {
      x: center.x - mousePointTo.x * clampedScale,
      y: center.y - mousePointTo.y * clampedScale
    };
    stage.position(newPos);
  } else {
    stage.scale({ x: clampedScale, y: clampedScale });
  }

  stage.batchDraw();
}

/**
 * Reset zoom to 100%.
 */
export function resetZoom() {
  if (!stage) return;

  stage.scale({ x: 1, y: 1 });
  stage.position({ x: 0, y: 0 });
  stage.batchDraw();
}

/**
 * Pan the canvas.
 * @param {number} dx - X delta
 * @param {number} dy - Y delta
 */
export function pan(dx, dy) {
  if (!stage) return;

  const pos = stage.position();
  stage.position({
    x: pos.x + dx,
    y: pos.y + dy
  });
  stage.batchDraw();
}

// ============================================
// GLOBAL EXPORT
// ============================================

const Renderer = {
  init,
  updateConfig,
  getConfig,

  // Coordinate conversion
  roomToPixel,
  pixelToRoom,
  mouseToCanvas,
  mouseToRoom,

  // Grid
  drawGrid,
  clearGrid,

  // Room outline
  drawRoomOutline,
  drawCustomRoomShape,

  // Coverage overlays
  drawCameraFOV,
  drawMicRange,
  drawSpeakerRange,
  drawDisplayDistance,

  // Helpers
  drawSelectionRect,
  drawMeasurementLine,

  // Layer management
  clearLayer,
  redraw,
  getStage,

  // Zoom/Pan
  zoom,
  resetZoom,
  pan
};

export default Renderer;

// Make available globally for non-module usage
if (typeof window !== 'undefined') {
  window.VRC_Renderer = Renderer;
}
