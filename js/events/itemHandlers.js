/**
 * VRC - Video Room Calculator
 * Item Event Handlers
 *
 * Event handlers for individual room items including:
 * - Drag events (start, move, end)
 * - Click/tap events
 * - Double-click for editing
 * - Transform events (rotate, resize)
 */

// ============================================
// STATE
// ============================================

/**
 * Internal state for item handling.
 */
const state = {
  isDragging: false,
  dragStartPosition: null,
  lastSelectedNode: null,
  lastSelectedNodePosition: null
};

/**
 * Context object with app references.
 */
let context = {
  stage: null,
  tr: null,
  roomObj: null,
  canvasToJson: null,
  // Shading groups for updates
  grShadingCamera: null,
  grShadingMicrophone: null,
  grShadingSpeaker: null,
  grDisplayDistance: null,
  // Callbacks
  onItemSelected: null,
  onItemDragStart: null,
  onItemDragEnd: null,
  onItemDragMove: null,
  onItemDoubleClick: null,
  onItemUpdate: null,
  updateShading: null,
  updateFormatDetails: null
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
  console.log('[ItemHandlers] Initialized');
}

/**
 * Update context properties.
 * @param {object} updates - Properties to update
 */
export function updateContext(updates) {
  context = { ...context, ...updates };
}

// ============================================
// ITEM LISTENER ATTACHMENT
// ============================================

/**
 * Attach all event listeners to an item.
 * @param {Konva.Node} item - Konva node (group or shape)
 * @param {object} options - Options for handler behavior
 */
export function attachListeners(item, options = {}) {
  const {
    draggable = true,
    selectable = true,
    resizable = false,
    doubleClickEdit = true
  } = options;

  if (draggable) {
    item.draggable(true);
    item.on('dragstart', handleDragStart);
    item.on('dragmove', handleDragMove);
    item.on('dragend', handleDragEnd);
  }

  if (selectable) {
    item.on('click tap', handleClick);
  }

  if (doubleClickEdit) {
    item.on('dblclick dbltap', handleDoubleClick);
  }

  // Transform events (for when item is in transformer)
  item.on('transformstart', handleTransformStart);
  item.on('transform', handleTransform);
  item.on('transformend', handleTransformEnd);
}

/**
 * Remove all event listeners from an item.
 * @param {Konva.Node} item - Konva node
 */
export function removeListeners(item) {
  item.off('dragstart', handleDragStart);
  item.off('dragmove', handleDragMove);
  item.off('dragend', handleDragEnd);
  item.off('click tap', handleClick);
  item.off('dblclick dbltap', handleDoubleClick);
  item.off('transformstart', handleTransformStart);
  item.off('transform', handleTransform);
  item.off('transformend', handleTransformEnd);
}

// ============================================
// DRAG HANDLERS
// ============================================

/**
 * Handle drag start.
 * @param {Konva.KonvaEventObject} e - Event
 */
function handleDragStart(e) {
  const node = e.target;

  state.isDragging = true;
  state.dragStartPosition = {
    x: node.x(),
    y: node.y()
  };

  // Store for undo
  state.lastSelectedNode = node;
  state.lastSelectedNodePosition = structuredClone({
    x: node.x(),
    y: node.y(),
    rotation: node.rotation()
  });

  // Notify callback
  if (context.onItemDragStart) {
    context.onItemDragStart(node, e);
  }
}

/**
 * Handle drag move.
 * @param {Konva.KonvaEventObject} e - Event
 */
function handleDragMove(e) {
  const node = e.target;

  // Update shading in real-time
  if (context.updateShading) {
    context.updateShading(node);
  }

  // Update guidelines if available
  updateGuidelines(node);

  // Notify callback
  if (context.onItemDragMove) {
    context.onItemDragMove(node, e);
  }
}

/**
 * Handle drag end.
 * @param {Konva.KonvaEventObject} e - Event
 */
function handleDragEnd(e) {
  const node = e.target;

  state.isDragging = false;

  // Clear guidelines
  clearGuidelines();

  // Update item in roomObj
  updateItemInRoomObj(node);

  // Update shading final position
  if (context.updateShading) {
    context.updateShading(node);
  }

  // Update format details panel
  if (context.updateFormatDetails) {
    context.updateFormatDetails(node.id());
  }

  // Save state
  if (context.canvasToJson) {
    context.canvasToJson();
  }

  // Notify callback
  if (context.onItemDragEnd) {
    context.onItemDragEnd(node, e);
  }
}

// ============================================
// CLICK HANDLERS
// ============================================

/**
 * Handle click/tap on item.
 * @param {Konva.KonvaEventObject} e - Event
 */
function handleClick(e) {
  const node = e.target;

  // Update selection state
  state.lastSelectedNode = node;

  // Update format details
  if (context.updateFormatDetails) {
    context.updateFormatDetails(node.id());
  }

  // Notify callback
  if (context.onItemSelected) {
    context.onItemSelected(node, e);
  }
}

/**
 * Handle double-click/double-tap on item.
 * @param {Konva.KonvaEventObject} e - Event
 */
function handleDoubleClick(e) {
  const node = e.target;

  // Open edit dialog/panel
  if (context.onItemDoubleClick) {
    context.onItemDoubleClick(node, e);
  }
}

// ============================================
// TRANSFORM HANDLERS
// ============================================

/**
 * Handle transform start.
 * @param {Konva.KonvaEventObject} e - Event
 */
function handleTransformStart(e) {
  const node = e.target;

  // Store initial state for undo
  state.lastSelectedNodePosition = structuredClone({
    x: node.x(),
    y: node.y(),
    rotation: node.rotation(),
    scaleX: node.scaleX(),
    scaleY: node.scaleY()
  });
}

/**
 * Handle transform (during).
 * @param {Konva.KonvaEventObject} e - Event
 */
function handleTransform(e) {
  const node = e.target;

  // Update shading during transform
  if (context.updateShading) {
    context.updateShading(node);
  }
}

/**
 * Handle transform end.
 * @param {Konva.KonvaEventObject} e - Event
 */
function handleTransformEnd(e) {
  const node = e.target;

  // Update item in roomObj
  updateItemInRoomObj(node);

  // Final shading update
  if (context.updateShading) {
    context.updateShading(node);
  }

  // Update format details
  if (context.updateFormatDetails) {
    context.updateFormatDetails(node.id());
  }

  // Save state
  if (context.canvasToJson) {
    context.canvasToJson();
  }
}

// ============================================
// TABLE/WALL SPECIFIC HANDLERS
// ============================================

/**
 * Create handlers for table items (with resize).
 * @param {Konva.Node} tableNode - Table node
 */
export function attachTableHandlers(tableNode) {
  attachListeners(tableNode, {
    draggable: true,
    selectable: true,
    resizable: true,
    doubleClickEdit: true
  });

  // Additional table-specific handlers
  tableNode.on('dblclick', (e) => {
    // Enable resize mode on double-click
    if (context.tr) {
      context.tr.nodes([tableNode]);
      context.tr.resizeEnabled(true);
    }
  });
}

/**
 * Create handlers for wall items.
 * @param {Konva.Node} wallNode - Wall node
 */
export function attachWallHandlers(wallNode) {
  attachListeners(wallNode, {
    draggable: true,
    selectable: true,
    resizable: true,
    doubleClickEdit: false
  });
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Update item data in roomObj from Konva node.
 * @param {Konva.Node} node - Konva node
 */
function updateItemInRoomObj(node) {
  if (!context.roomObj || !node.id()) return;

  const id = node.id();
  const parentGroup = node.getParent()?.name();

  if (!parentGroup || !context.roomObj.items[parentGroup]) return;

  // Find item in roomObj
  const items = context.roomObj.items[parentGroup];
  const itemIndex = items.findIndex(item => item.id === id);

  if (itemIndex === -1) return;

  // Update position and rotation
  const item = items[itemIndex];

  // Convert pixel position to room coordinates
  const scale = context.scale || 50;
  const pxOffset = context.pxOffset || 50;
  const pyOffset = context.pyOffset || 50;

  item.x = (node.x() - pxOffset) / scale;
  item.y = (node.y() - pyOffset) / scale;
  item.rotation = node.rotation();

  // Copy any data_ properties from node
  for (const key in node) {
    if (key.startsWith('data_')) {
      item[key] = node[key];
    }
  }

  // Notify callback
  if (context.onItemUpdate) {
    context.onItemUpdate(item, node);
  }
}

/**
 * Update alignment guidelines during drag.
 * @param {Konva.Node} node - Node being dragged
 */
function updateGuidelines(node) {
  // This would integrate with the guideline system in roomcalc.js
  // Simplified version here - full implementation would check
  // alignment with other items and room edges
}

/**
 * Clear alignment guidelines.
 */
function clearGuidelines() {
  // Clear any visible guidelines
}

/**
 * Get item data from node.
 * @param {Konva.Node} node - Konva node
 * @returns {object} Item data
 */
export function getItemData(node) {
  const data = {
    id: node.id(),
    x: node.x(),
    y: node.y(),
    rotation: node.rotation()
  };

  // Copy data_ properties
  for (const key in node) {
    if (key.startsWith('data_')) {
      data[key] = node[key];
    }
  }

  return data;
}

/**
 * Set item data on node.
 * @param {Konva.Node} node - Konva node
 * @param {object} data - Data to set
 */
export function setItemData(node, data) {
  if (data.x !== undefined) node.x(data.x);
  if (data.y !== undefined) node.y(data.y);
  if (data.rotation !== undefined) node.rotation(data.rotation);

  // Set data_ properties
  for (const key in data) {
    if (key.startsWith('data_')) {
      node[key] = data[key];
    }
  }
}

// ============================================
// STATE GETTERS
// ============================================

/**
 * Check if currently dragging.
 * @returns {boolean}
 */
export function isDragging() {
  return state.isDragging;
}

/**
 * Get last selected node.
 * @returns {Konva.Node|null}
 */
export function getLastSelectedNode() {
  return state.lastSelectedNode;
}

/**
 * Get last selected node's original position.
 * @returns {object|null}
 */
export function getLastSelectedNodePosition() {
  return state.lastSelectedNodePosition;
}

// ============================================
// BATCH OPERATIONS
// ============================================

/**
 * Attach listeners to multiple items.
 * @param {array} items - Array of Konva nodes
 * @param {object} options - Options
 */
export function attachListenersBatch(items, options = {}) {
  items.forEach(item => attachListeners(item, options));
}

/**
 * Remove listeners from multiple items.
 * @param {array} items - Array of Konva nodes
 */
export function removeListenersBatch(items) {
  items.forEach(item => removeListeners(item));
}

// ============================================
// GLOBAL EXPORT
// ============================================

const ItemHandlers = {
  init,
  updateContext,
  attachListeners,
  removeListeners,
  attachTableHandlers,
  attachWallHandlers,
  getItemData,
  setItemData,
  isDragging,
  getLastSelectedNode,
  getLastSelectedNodePosition,
  attachListenersBatch,
  removeListenersBatch
};

export default ItemHandlers;

// Make available globally
if (typeof window !== 'undefined') {
  window.VRC_ItemHandlers = ItemHandlers;
}
