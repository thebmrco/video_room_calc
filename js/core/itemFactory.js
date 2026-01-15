/**
 * VRC - Video Room Calculator
 * Item Factory
 *
 * Factory pattern for creating room items (video devices, tables, chairs, etc.).
 * Provides a unified interface for item creation with type-specific defaults.
 */

import { ITEM_TYPES, DATA_ATTRIBUTES } from './constants.js';

// ============================================
// ITEM TYPE DEFAULTS
// ============================================

/**
 * Default properties for each item type.
 */
const ITEM_DEFAULTS = {
  videoDevices: {
    width: 0.5,
    length: 0.3,
    height: 0.2,
    rotation: 0,
    data_fovHidden: false,
    data_audioHidden: false
  },

  microphones: {
    width: 0.15,
    length: 0.15,
    height: 0.05,
    rotation: 0,
    data_audioHidden: false
  },

  speakers: {
    width: 0.3,
    length: 0.3,
    height: 0.4,
    rotation: 0,
    data_speakerHidden: false
  },

  displays: {
    width: 1.2,
    length: 0.1,
    height: 0.7,
    rotation: 0,
    diagonalInches: 55,
    data_dispDistHidden: false
  },

  chairs: {
    width: 0.5,
    length: 0.5,
    height: 0.8,
    rotation: 0
  },

  tables: {
    width: 2,
    length: 1,
    height: 0.75,
    rotation: 0
  },

  touchPanels: {
    width: 0.25,
    length: 0.2,
    height: 0.15,
    rotation: 0
  },

  boxes: {
    width: 1,
    length: 1,
    height: 1,
    rotation: 0,
    color: '#808080',
    opacity: 1
  },

  stageFloors: {
    width: 2,
    length: 2,
    height: 0.2,
    rotation: 0,
    color: '#d4a574'
  },

  rooms: {
    width: 5,
    length: 5,
    height: 2.5,
    rotation: 0
  }
};

/**
 * Required properties for each item type.
 */
const REQUIRED_PROPERTIES = ['id', 'x', 'y'];

// ============================================
// UUID GENERATION
// ============================================

/**
 * Generate a unique ID for an item.
 * @returns {string} Unique ID
 */
export function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Generate a short ID for an item.
 * @returns {string} Short unique ID
 */
export function generateShortId() {
  return Math.random().toString(36).substr(2, 9);
}

// ============================================
// ITEM CREATION
// ============================================

/**
 * Create a new item with defaults for its type.
 * @param {string} itemType - Type of item (e.g., 'videoDevices', 'tables')
 * @param {object} properties - Custom properties to override defaults
 * @returns {object} New item object
 */
export function createItem(itemType, properties = {}) {
  // Get defaults for this item type
  const defaults = ITEM_DEFAULTS[itemType] || {};

  // Generate ID if not provided
  const id = properties.id || generateId();

  // Merge defaults with provided properties
  const item = {
    id,
    ...defaults,
    ...properties
  };

  // Ensure required properties exist
  for (const prop of REQUIRED_PROPERTIES) {
    if (item[prop] === undefined) {
      if (prop === 'x' || prop === 'y') {
        item[prop] = 0;
      }
    }
  }

  return item;
}

/**
 * Create a video device item.
 * @param {object} properties - Device properties
 * @returns {object} Video device item
 */
export function createVideoDevice(properties = {}) {
  return createItem(ITEM_TYPES.VIDEO_DEVICES, {
    data_deviceType: properties.deviceType || 'unknown',
    data_deviceid: properties.deviceId || generateShortId(),
    ...properties
  });
}

/**
 * Create a microphone item.
 * @param {object} properties - Microphone properties
 * @returns {object} Microphone item
 */
export function createMicrophone(properties = {}) {
  return createItem(ITEM_TYPES.MICROPHONES, {
    data_deviceType: properties.deviceType || 'tableMicPro',
    data_deviceid: properties.deviceId || generateShortId(),
    data_micRange: properties.micRange || 2.5,
    ...properties
  });
}

/**
 * Create a speaker item.
 * @param {object} properties - Speaker properties
 * @returns {object} Speaker item
 */
export function createSpeaker(properties = {}) {
  return createItem(ITEM_TYPES.SPEAKERS, {
    data_deviceType: properties.deviceType || 'speaker',
    data_deviceid: properties.deviceId || generateShortId(),
    data_speakerRange: properties.speakerRange || 5,
    ...properties
  });
}

/**
 * Create a display item.
 * @param {object} properties - Display properties
 * @returns {object} Display item
 */
export function createDisplay(properties = {}) {
  // Calculate dimensions from diagonal inches if provided
  let width = properties.width;
  let height = properties.height;

  if (properties.diagonalInches && !width) {
    // Assume 16:9 aspect ratio
    const aspectRatio = 16 / 9;
    const diagonal = properties.diagonalInches * 0.0254; // inches to meters
    height = diagonal / Math.sqrt(1 + aspectRatio * aspectRatio);
    width = height * aspectRatio;
  }

  return createItem(ITEM_TYPES.DISPLAYS, {
    data_deviceType: properties.deviceType || 'displaySngl',
    data_deviceid: properties.deviceId || generateShortId(),
    width,
    height,
    ...properties
  });
}

/**
 * Create a chair item.
 * @param {object} properties - Chair properties
 * @returns {object} Chair item
 */
export function createChair(properties = {}) {
  return createItem(ITEM_TYPES.CHAIRS, {
    data_deviceType: properties.deviceType || 'chair',
    data_deviceid: properties.deviceId || generateShortId(),
    ...properties
  });
}

/**
 * Create a table item.
 * @param {object} properties - Table properties
 * @returns {object} Table item
 */
export function createTable(properties = {}) {
  return createItem(ITEM_TYPES.TABLES, {
    data_deviceType: properties.deviceType || 'tblRect',
    data_deviceid: properties.deviceId || generateShortId(),
    tableType: properties.tableType || 'rectangular',
    ...properties
  });
}

/**
 * Create a touch panel item.
 * @param {object} properties - Touch panel properties
 * @returns {object} Touch panel item
 */
export function createTouchPanel(properties = {}) {
  return createItem(ITEM_TYPES.TOUCH_PANELS, {
    data_deviceType: properties.deviceType || 'navigatorTable',
    data_deviceid: properties.deviceId || generateShortId(),
    ...properties
  });
}

/**
 * Create a box/wall item.
 * @param {object} properties - Box properties
 * @returns {object} Box item
 */
export function createBox(properties = {}) {
  return createItem(ITEM_TYPES.BOXES, {
    data_deviceType: properties.deviceType || 'wallStd',
    data_deviceid: properties.deviceId || generateShortId(),
    ...properties
  });
}

/**
 * Create a wall from two points.
 * @param {number} x1 - Start X coordinate
 * @param {number} y1 - Start Y coordinate
 * @param {number} x2 - End X coordinate
 * @param {number} y2 - End Y coordinate
 * @param {object} properties - Additional wall properties
 * @returns {object} Wall item
 */
export function createWall(x1, y1, x2, y2, properties = {}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const rotation = Math.atan2(dy, dx) * (180 / Math.PI);

  // Wall position is at the center
  const x = (x1 + x2) / 2;
  const y = (y1 + y2) / 2;

  return createBox({
    x,
    y,
    width: properties.wallThickness || 0.1,
    length,
    height: properties.wallHeight || 2.5,
    rotation,
    data_deviceType: properties.wallType || 'wallStd',
    points: [x1, y1, x2, y2],
    ...properties
  });
}

/**
 * Create a stage floor item.
 * @param {object} properties - Stage floor properties
 * @returns {object} Stage floor item
 */
export function createStageFloor(properties = {}) {
  return createItem(ITEM_TYPES.STAGE_FLOORS, {
    data_deviceType: properties.deviceType || 'stageFloor',
    data_deviceid: properties.deviceId || generateShortId(),
    ...properties
  });
}

/**
 * Create a room partition item.
 * @param {object} properties - Room properties
 * @returns {object} Room item
 */
export function createRoom(properties = {}) {
  return createItem(ITEM_TYPES.ROOMS, {
    data_deviceType: properties.deviceType || 'room',
    data_deviceid: properties.deviceId || generateShortId(),
    ...properties
  });
}

// ============================================
// ITEM CLONING
// ============================================

/**
 * Clone an existing item with a new ID.
 * @param {object} item - Item to clone
 * @param {object} [overrides] - Properties to override
 * @returns {object} Cloned item
 */
export function cloneItem(item, overrides = {}) {
  return {
    ...structuredClone(item),
    id: generateId(),
    data_deviceid: generateShortId(),
    ...overrides
  };
}

/**
 * Clone an item with offset position.
 * @param {object} item - Item to clone
 * @param {number} offsetX - X offset
 * @param {number} offsetY - Y offset
 * @returns {object} Cloned item with offset
 */
export function cloneItemWithOffset(item, offsetX = 0.5, offsetY = 0.5) {
  return cloneItem(item, {
    x: item.x + offsetX,
    y: item.y + offsetY
  });
}

// ============================================
// ITEM VALIDATION
// ============================================

/**
 * Validate an item has all required properties.
 * @param {object} item - Item to validate
 * @returns {object} { valid: boolean, errors: string[] }
 */
export function validateItem(item) {
  const errors = [];

  for (const prop of REQUIRED_PROPERTIES) {
    if (item[prop] === undefined) {
      errors.push(`Missing required property: ${prop}`);
    }
  }

  if (typeof item.x !== 'number' || isNaN(item.x)) {
    errors.push('Invalid x coordinate');
  }

  if (typeof item.y !== 'number' || isNaN(item.y)) {
    errors.push('Invalid y coordinate');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get the item type for a given item.
 * @param {object} item - Item object
 * @returns {string|null} Item type or null
 */
export function getItemType(item) {
  if (!item || !item.data_deviceType) return null;

  const deviceType = item.data_deviceType;

  // Map device types to item categories
  if (deviceType.includes('Mic') || deviceType.includes('mic')) {
    return ITEM_TYPES.MICROPHONES;
  }
  if (deviceType.includes('speaker') || deviceType.includes('Speaker')) {
    return ITEM_TYPES.SPEAKERS;
  }
  if (deviceType.includes('display') || deviceType.includes('Display') || deviceType.includes('screen')) {
    return ITEM_TYPES.DISPLAYS;
  }
  if (deviceType.includes('chair') || deviceType.includes('Chair')) {
    return ITEM_TYPES.CHAIRS;
  }
  if (deviceType.includes('tbl') || deviceType.includes('table') || deviceType.includes('Table')) {
    return ITEM_TYPES.TABLES;
  }
  if (deviceType.includes('navigator') || deviceType.includes('Navigator')) {
    return ITEM_TYPES.TOUCH_PANELS;
  }
  if (deviceType.includes('wall') || deviceType.includes('Wall') || deviceType.includes('door')) {
    return ITEM_TYPES.BOXES;
  }
  if (deviceType.includes('stage') || deviceType.includes('Stage')) {
    return ITEM_TYPES.STAGE_FLOORS;
  }
  if (deviceType.includes('room') || deviceType.includes('Room')) {
    return ITEM_TYPES.ROOMS;
  }

  // Default to video devices
  return ITEM_TYPES.VIDEO_DEVICES;
}

// ============================================
// ITEM DEFAULTS ACCESS
// ============================================

/**
 * Get default properties for an item type.
 * @param {string} itemType - Item type
 * @returns {object} Default properties
 */
export function getDefaults(itemType) {
  return { ...ITEM_DEFAULTS[itemType] } || {};
}

/**
 * Get all available item types.
 * @returns {string[]} Array of item type keys
 */
export function getAvailableTypes() {
  return Object.keys(ITEM_DEFAULTS);
}

// ============================================
// GLOBAL EXPORT
// ============================================

const ItemFactory = {
  // ID generation
  generateId,
  generateShortId,

  // Generic creation
  createItem,

  // Type-specific creation
  createVideoDevice,
  createMicrophone,
  createSpeaker,
  createDisplay,
  createChair,
  createTable,
  createTouchPanel,
  createBox,
  createWall,
  createStageFloor,
  createRoom,

  // Cloning
  cloneItem,
  cloneItemWithOffset,

  // Validation
  validateItem,
  getItemType,

  // Defaults
  getDefaults,
  getAvailableTypes,

  // Constants
  ITEM_DEFAULTS,
  REQUIRED_PROPERTIES
};

export default ItemFactory;

// Make available globally for non-module usage
if (typeof window !== 'undefined') {
  window.VRC_ItemFactory = ItemFactory;
}
