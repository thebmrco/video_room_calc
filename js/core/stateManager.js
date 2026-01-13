/**
 * VRC - Video Room Calculator
 * State Manager
 *
 * Centralized state management to replace scattered global variables.
 * Provides a structured way to manage application state with change notifications.
 */

import { UNITS, ROOM_DEFAULTS, DEFAULT_ROOM_SURFACES, ITEM_TYPES } from './constants.js';

// ============================================
// STATE STRUCTURE
// ============================================

/**
 * Default state structure for a new room.
 */
const DEFAULT_STATE = {
  // Room identification
  roomId: null,
  name: '',
  version: '',
  authorVersion: '',
  software: '',

  // Units
  unit: UNITS.FEET,

  // Room dimensions
  room: {
    roomWidth: ROOM_DEFAULTS.WIDTH_FEET,
    roomLength: ROOM_DEFAULTS.LENGTH_FEET,
    roomHeight: ''
  },

  // All items in the room
  items: {
    videoDevices: [],
    chairs: [],
    tables: [],
    stageFloors: [],
    boxes: [],
    rooms: [],
    displays: [],
    speakers: [],
    microphones: [],
    touchPanels: []
  },

  // Selected items for undo/redo
  trNodes: [],

  // Workspace Designer settings
  workspace: {
    removeDefaultWalls: false,
    addCeiling: false,
    theme: 'standard'
  },

  // Layer visibility
  layersVisible: {
    grShadingCamera: true,
    grDisplayDistance: true,
    grShadingMicrophone: true,
    gridLines: true,
    grShadingSpeaker: true,
    grLabels: false
  },

  // Room surfaces
  roomSurfaces: structuredClone(DEFAULT_ROOM_SURFACES),

  // Background image
  backgroundImage: null
};

/**
 * Canvas/UI state (not persisted)
 */
const DEFAULT_CANVAS_STATE = {
  zoom: 100,
  pan: { x: 0, y: 0 },
  scale: 50,
  selectedItems: [],
  isRotating: false,
  isDragging: false,
  activeRoomPart: null
};

/**
 * UI state (not persisted)
 */
const DEFAULT_UI_STATE = {
  activeTab: 'devices',
  sidebarOpen: true,
  modalStack: [],
  blockKeyActions: false,
  isLoadingTemplate: false,
  quickSetupState: 'disabled'
};

// ============================================
// STATE STORAGE
// ============================================

let roomState = structuredClone(DEFAULT_STATE);
let canvasState = structuredClone(DEFAULT_CANVAS_STATE);
let uiState = structuredClone(DEFAULT_UI_STATE);

/**
 * Subscribers for state changes.
 * @type {Map<string, Set<function>>}
 */
const subscribers = new Map();

// ============================================
// ROOM STATE MANAGEMENT
// ============================================

/**
 * Get the entire room state.
 * @returns {object} Current room state
 */
export function getRoomState() {
  return roomState;
}

/**
 * Get a specific property from room state using dot notation.
 * @param {string} path - Path like 'room.roomWidth' or 'items.videoDevices'
 * @returns {*} Value at path
 */
export function get(path) {
  const parts = path.split('.');
  let value = roomState;

  for (const part of parts) {
    if (value === undefined || value === null) return undefined;
    value = value[part];
  }

  return value;
}

/**
 * Set a specific property in room state using dot notation.
 * @param {string} path - Path like 'room.roomWidth'
 * @param {*} value - Value to set
 * @param {boolean} [notify=true] - Whether to notify subscribers
 */
export function set(path, value, notify = true) {
  const parts = path.split('.');
  const lastPart = parts.pop();
  let target = roomState;

  for (const part of parts) {
    if (target[part] === undefined) {
      target[part] = {};
    }
    target = target[part];
  }

  const oldValue = target[lastPart];
  target[lastPart] = value;

  if (notify && oldValue !== value) {
    notifySubscribers(path, value, oldValue);
  }
}

/**
 * Set the entire room state (e.g., when loading from URL).
 * @param {object} newState - New room state
 * @param {boolean} [notify=true] - Whether to notify subscribers
 */
export function setRoomState(newState, notify = true) {
  const oldState = roomState;
  roomState = newState;

  if (notify) {
    notifySubscribers('*', newState, oldState);
  }
}

/**
 * Reset room state to defaults.
 * @param {boolean} [notify=true] - Whether to notify subscribers
 */
export function resetRoomState(notify = true) {
  setRoomState(structuredClone(DEFAULT_STATE), notify);
}

/**
 * Create a new room ID.
 * @returns {string} New UUID
 */
export function createRoomId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Initialize a new room with a fresh ID.
 */
export function initNewRoom() {
  resetRoomState(false);
  roomState.roomId = createRoomId();
  notifySubscribers('*', roomState, null);
}

// ============================================
// ITEMS MANAGEMENT
// ============================================

/**
 * Get all items of a specific type.
 * @param {string} itemType - Item type (e.g., 'videoDevices')
 * @returns {array} Array of items
 */
export function getItems(itemType) {
  return roomState.items[itemType] || [];
}

/**
 * Get an item by ID.
 * @param {string} id - Item ID
 * @param {string} [itemType] - Optional item type to search in
 * @returns {object|null} Item or null
 */
export function getItemById(id, itemType = null) {
  if (itemType) {
    const items = roomState.items[itemType];
    return items ? items.find(item => item.id === id) : null;
  }

  // Search all item types
  for (const type in roomState.items) {
    const items = roomState.items[type];
    if (Array.isArray(items)) {
      const item = items.find(item => item.id === id);
      if (item) return item;
    }
  }

  return null;
}

/**
 * Find an item and its type by ID.
 * @param {string} id - Item ID
 * @returns {object|null} { item, type } or null
 */
export function findItemWithType(id) {
  for (const type in roomState.items) {
    const items = roomState.items[type];
    if (Array.isArray(items)) {
      const item = items.find(item => item.id === id);
      if (item) return { item, type };
    }
  }
  return null;
}

/**
 * Add an item to the room.
 * @param {string} itemType - Item type
 * @param {object} item - Item to add
 * @param {boolean} [notify=true] - Whether to notify subscribers
 */
export function addItem(itemType, item, notify = true) {
  if (!roomState.items[itemType]) {
    roomState.items[itemType] = [];
  }

  roomState.items[itemType].push(item);

  if (notify) {
    notifySubscribers(`items.${itemType}`, roomState.items[itemType]);
  }
}

/**
 * Update an item by ID.
 * @param {string} id - Item ID
 * @param {object} updates - Properties to update
 * @param {boolean} [notify=true] - Whether to notify subscribers
 * @returns {boolean} True if item was found and updated
 */
export function updateItem(id, updates, notify = true) {
  const result = findItemWithType(id);
  if (!result) return false;

  Object.assign(result.item, updates);

  if (notify) {
    notifySubscribers(`items.${result.type}`, roomState.items[result.type]);
  }

  return true;
}

/**
 * Remove an item by ID.
 * @param {string} id - Item ID
 * @param {boolean} [notify=true] - Whether to notify subscribers
 * @returns {boolean} True if item was found and removed
 */
export function removeItem(id, notify = true) {
  for (const type in roomState.items) {
    const items = roomState.items[type];
    if (Array.isArray(items)) {
      const index = items.findIndex(item => item.id === id);
      if (index !== -1) {
        items.splice(index, 1);

        if (notify) {
          notifySubscribers(`items.${type}`, items);
        }

        return true;
      }
    }
  }

  return false;
}

/**
 * Clear all items of a specific type.
 * @param {string} itemType - Item type
 * @param {boolean} [notify=true] - Whether to notify subscribers
 */
export function clearItems(itemType, notify = true) {
  if (roomState.items[itemType]) {
    roomState.items[itemType] = [];

    if (notify) {
      notifySubscribers(`items.${itemType}`, []);
    }
  }
}

/**
 * Clear all items.
 * @param {boolean} [notify=true] - Whether to notify subscribers
 */
export function clearAllItems(notify = true) {
  for (const type in roomState.items) {
    roomState.items[type] = [];
  }

  if (notify) {
    notifySubscribers('items', roomState.items);
  }
}

// ============================================
// CANVAS STATE MANAGEMENT
// ============================================

/**
 * Get canvas state.
 * @returns {object} Canvas state
 */
export function getCanvasState() {
  return canvasState;
}

/**
 * Update canvas state.
 * @param {object} updates - Properties to update
 */
export function updateCanvasState(updates) {
  Object.assign(canvasState, updates);
  notifySubscribers('canvas', canvasState);
}

/**
 * Reset canvas state to defaults.
 */
export function resetCanvasState() {
  canvasState = structuredClone(DEFAULT_CANVAS_STATE);
  notifySubscribers('canvas', canvasState);
}

// ============================================
// UI STATE MANAGEMENT
// ============================================

/**
 * Get UI state.
 * @returns {object} UI state
 */
export function getUIState() {
  return uiState;
}

/**
 * Update UI state.
 * @param {object} updates - Properties to update
 */
export function updateUIState(updates) {
  Object.assign(uiState, updates);
  notifySubscribers('ui', uiState);
}

/**
 * Reset UI state to defaults.
 */
export function resetUIState() {
  uiState = structuredClone(DEFAULT_UI_STATE);
  notifySubscribers('ui', uiState);
}

// ============================================
// SUBSCRIPTION SYSTEM
// ============================================

/**
 * Subscribe to state changes.
 * @param {string} path - Path to watch (e.g., 'room.roomWidth', '*' for all)
 * @param {function} callback - Callback function (newValue, oldValue, path)
 * @returns {function} Unsubscribe function
 */
export function subscribe(path, callback) {
  if (!subscribers.has(path)) {
    subscribers.set(path, new Set());
  }

  subscribers.get(path).add(callback);

  // Return unsubscribe function
  return () => {
    const subs = subscribers.get(path);
    if (subs) {
      subs.delete(callback);
    }
  };
}

/**
 * Notify subscribers of a state change.
 * @param {string} path - Changed path
 * @param {*} newValue - New value
 * @param {*} oldValue - Old value
 */
function notifySubscribers(path, newValue, oldValue) {
  // Notify path-specific subscribers
  const pathSubs = subscribers.get(path);
  if (pathSubs) {
    for (const callback of pathSubs) {
      try {
        callback(newValue, oldValue, path);
      } catch (err) {
        console.error('[StateManager] Subscriber error:', err);
      }
    }
  }

  // Notify wildcard subscribers
  const wildcardSubs = subscribers.get('*');
  if (wildcardSubs && path !== '*') {
    for (const callback of wildcardSubs) {
      try {
        callback(newValue, oldValue, path);
      } catch (err) {
        console.error('[StateManager] Wildcard subscriber error:', err);
      }
    }
  }
}

// ============================================
// UNDO/REDO SUPPORT
// ============================================

const undoStack = [];
const redoStack = [];
const MAX_UNDO = ROOM_DEFAULTS.MAX_UNDO_LENGTH;

/**
 * Save current state to undo stack.
 */
export function saveToUndo() {
  undoStack.push(structuredClone(roomState));

  if (undoStack.length > MAX_UNDO) {
    undoStack.shift();
  }

  // Clear redo stack on new action
  redoStack.length = 0;
}

/**
 * Undo the last action.
 * @returns {boolean} True if undo was performed
 */
export function undo() {
  if (undoStack.length === 0) return false;

  redoStack.push(structuredClone(roomState));
  roomState = undoStack.pop();
  notifySubscribers('*', roomState, null);

  return true;
}

/**
 * Redo the last undone action.
 * @returns {boolean} True if redo was performed
 */
export function redo() {
  if (redoStack.length === 0) return false;

  undoStack.push(structuredClone(roomState));
  roomState = redoStack.pop();
  notifySubscribers('*', roomState, null);

  return true;
}

/**
 * Check if undo is available.
 * @returns {boolean} True if undo is available
 */
export function canUndo() {
  return undoStack.length > 0;
}

/**
 * Check if redo is available.
 * @returns {boolean} True if redo is available
 */
export function canRedo() {
  return redoStack.length > 0;
}

/**
 * Clear undo/redo stacks.
 */
export function clearUndoRedo() {
  undoStack.length = 0;
  redoStack.length = 0;
}

// ============================================
// SERIALIZATION
// ============================================

/**
 * Export room state to JSON string.
 * @returns {string} JSON string
 */
export function toJSON() {
  return JSON.stringify(roomState, null, 2);
}

/**
 * Import room state from JSON string.
 * @param {string} json - JSON string
 * @param {boolean} [notify=true] - Whether to notify subscribers
 * @returns {boolean} True if import was successful
 */
export function fromJSON(json, notify = true) {
  try {
    const newState = JSON.parse(json);
    setRoomState(newState, notify);
    return true;
  } catch (err) {
    console.error('[StateManager] Failed to parse JSON:', err);
    return false;
  }
}

/**
 * Clone the current room state.
 * @returns {object} Deep clone of room state
 */
export function cloneState() {
  return structuredClone(roomState);
}

// ============================================
// GLOBAL EXPORT
// ============================================

const StateManager = {
  // Room state
  getRoomState,
  get,
  set,
  setRoomState,
  resetRoomState,
  createRoomId,
  initNewRoom,

  // Items
  getItems,
  getItemById,
  findItemWithType,
  addItem,
  updateItem,
  removeItem,
  clearItems,
  clearAllItems,

  // Canvas state
  getCanvasState,
  updateCanvasState,
  resetCanvasState,

  // UI state
  getUIState,
  updateUIState,
  resetUIState,

  // Subscriptions
  subscribe,

  // Undo/Redo
  saveToUndo,
  undo,
  redo,
  canUndo,
  canRedo,
  clearUndoRedo,

  // Serialization
  toJSON,
  fromJSON,
  cloneState,

  // Constants
  DEFAULT_STATE
};

export default StateManager;

// Make available globally for non-module usage
if (typeof window !== 'undefined') {
  window.VRC_State = StateManager;
}
