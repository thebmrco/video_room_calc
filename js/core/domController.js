/**
 * VRC - Video Room Calculator
 * DOM Controller
 *
 * Centralized DOM element access and manipulation.
 * Replaces scattered getElementById calls throughout the codebase.
 */

import { DOM_IDS } from './constants.js';

// ============================================
// DOM ELEMENT CACHE
// ============================================

/**
 * Cache of DOM elements to avoid repeated querySelector calls.
 * @type {Map<string, HTMLElement>}
 */
const elementCache = new Map();

/**
 * Whether the cache has been initialized.
 */
let isInitialized = false;

// ============================================
// ELEMENT DEFINITIONS
// ============================================

/**
 * All known element IDs in the application.
 * Organized by category for clarity.
 */
const ELEMENT_IDS = {
  // Room configuration
  roomName: 'roomName',
  roomWidth: 'roomWidth',
  roomLength: 'roomLength',
  roomHeight: 'roomHeight',
  roomUnit: 'unit',

  // Canvas
  canvasDiv: 'canvasDiv',
  scrollContainer: 'scroll-container',
  roomCalcStage: 'roomCalcStage',

  // Item editing
  itemId: 'itemId',
  itemGroup: 'itemGroup',
  itemX: 'itemX',
  itemY: 'itemY',
  itemRotation: 'itemRotation',
  itemWidth: 'itemWidth',
  itemLength: 'itemLength',
  itemHeight: 'itemHeight',
  itemLabel: 'itemLabel',

  // Dialogs
  dialogSingleItemToggles: 'dialogSingleItemToggles',
  dialogExport: 'dialogExport',
  dialogImport: 'dialogImport',
  dialogShare: 'dialogShare',
  dialogSettings: 'dialogSettings',

  // Floating panels
  floatingWorkspace: 'floatingWorkspace',
  floatingSidebar: 'floatingSidebar',

  // Buttons - coverage toggles
  btnMicToggle: 'btnMicToggle',
  btnSpeakerToggle: 'btnSpeakerToggle',
  btnCamToggle: 'btnCamToggle',
  btnDisplayToggle: 'btnDisplayToggle',
  btnGridToggle: 'btnGridToggle',
  btnLabelToggle: 'btnLabelToggle',

  // Buttons - actions
  btnUndo: 'btnUndo',
  btnRedo: 'btnRedo',
  btnZoomIn: 'btnZoomIn',
  btnZoomOut: 'btnZoomOut',
  btnExport: 'btnExport',
  btnImport: 'btnImport',
  btnShare: 'btnShare',

  // Wall builder
  btnWallBuilderStd: 'btnWallBuilderStd',
  btnWallBuilderGlass: 'btnWallBuilderGlass',
  btnWallBuilderWindow: 'btnWallBuilderWindow',
  btnWallBuilderCustom: 'btnWallBuilderCustom',

  // Templates & devices list
  templateList: 'templateList',
  deviceList: 'deviceList',

  // Status indicators
  collaborationStatus: 'collaborationStatus',
  connectionStatus: 'connectionStatus',
  userCount: 'userCount',

  // QR Code
  qrCodeContainer: 'qrCodeContainer',

  // Tabs
  tabDevices: 'tabDevices',
  tabRoom: 'tabRoom',
  tabExport: 'tabExport',

  // Menus
  rightClickMenu: 'rightClickMenuDialog',
  contextMenu: 'contextMenu'
};

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize the DOM controller by caching commonly used elements.
 * Should be called after DOM is ready.
 */
export function init() {
  if (typeof document === 'undefined') {
    console.warn('[DOMController] No document available, running in non-browser environment');
    return;
  }

  // Clear existing cache
  elementCache.clear();

  // Pre-cache frequently used elements
  const frequentlyUsed = [
    'roomName', 'roomWidth', 'roomLength', 'roomHeight',
    'canvasDiv', 'scrollContainer',
    'itemId', 'itemGroup', 'itemX', 'itemY', 'itemRotation',
    'floatingWorkspace'
  ];

  for (const id of frequentlyUsed) {
    const elementId = ELEMENT_IDS[id] || id;
    const element = document.getElementById(elementId);
    if (element) {
      elementCache.set(id, element);
    }
  }

  isInitialized = true;
  console.log('[DOMController] Initialized with', elementCache.size, 'cached elements');
}

// ============================================
// ELEMENT ACCESS
// ============================================

/**
 * Get an element by its key or ID.
 * Uses cache when available for performance.
 * @param {string} key - Element key from ELEMENT_IDS or direct ID
 * @returns {HTMLElement|null} The element or null if not found
 */
export function get(key) {
  if (typeof document === 'undefined') return null;

  // Check cache first
  if (elementCache.has(key)) {
    return elementCache.get(key);
  }

  // Look up the actual ID
  const elementId = ELEMENT_IDS[key] || key;
  const element = document.getElementById(elementId);

  // Cache for future use
  if (element) {
    elementCache.set(key, element);
  }

  return element;
}

/**
 * Get multiple elements by their keys.
 * @param {...string} keys - Element keys
 * @returns {object} Object with key -> element mapping
 */
export function getMultiple(...keys) {
  const result = {};
  for (const key of keys) {
    result[key] = get(key);
  }
  return result;
}

/**
 * Query selector within the document.
 * @param {string} selector - CSS selector
 * @returns {HTMLElement|null} First matching element
 */
export function query(selector) {
  if (typeof document === 'undefined') return null;
  return document.querySelector(selector);
}

/**
 * Query all matching elements.
 * @param {string} selector - CSS selector
 * @returns {NodeList} Matching elements
 */
export function queryAll(selector) {
  if (typeof document === 'undefined') return [];
  return document.querySelectorAll(selector);
}

// ============================================
// VALUE GETTERS/SETTERS
// ============================================

/**
 * Get the value of an input element.
 * @param {string} key - Element key
 * @returns {string} Element value or empty string
 */
export function getValue(key) {
  const element = get(key);
  if (!element) return '';

  if (element.type === 'checkbox') {
    return element.checked;
  }

  return element.value || '';
}

/**
 * Set the value of an input element.
 * @param {string} key - Element key
 * @param {*} value - Value to set
 */
export function setValue(key, value) {
  const element = get(key);
  if (!element) return;

  if (element.type === 'checkbox') {
    element.checked = Boolean(value);
  } else {
    element.value = value;
  }
}

/**
 * Get the text content of an element.
 * @param {string} key - Element key
 * @returns {string} Text content or empty string
 */
export function getText(key) {
  const element = get(key);
  return element ? (element.innerText || element.textContent || '') : '';
}

/**
 * Set the text content of an element.
 * @param {string} key - Element key
 * @param {string} text - Text to set
 */
export function setText(key, text) {
  const element = get(key);
  if (element) {
    element.innerText = text;
  }
}

/**
 * Set the HTML content of an element.
 * @param {string} key - Element key
 * @param {string} html - HTML to set
 */
export function setHTML(key, html) {
  const element = get(key);
  if (element) {
    element.innerHTML = html;
  }
}

// ============================================
// VISIBILITY CONTROL
// ============================================

/**
 * Show an element.
 * @param {string} key - Element key
 * @param {string} displayValue - CSS display value (default: 'block')
 */
export function show(key, displayValue = 'block') {
  const element = get(key);
  if (element) {
    element.style.display = displayValue;
  }
}

/**
 * Hide an element.
 * @param {string} key - Element key
 */
export function hide(key) {
  const element = get(key);
  if (element) {
    element.style.display = 'none';
  }
}

/**
 * Toggle element visibility.
 * @param {string} key - Element key
 * @param {boolean} [visible] - Force visible state (optional)
 */
export function toggle(key, visible) {
  const element = get(key);
  if (!element) return;

  if (typeof visible === 'boolean') {
    element.style.display = visible ? '' : 'none';
  } else {
    element.style.display = element.style.display === 'none' ? '' : 'none';
  }
}

/**
 * Check if an element is visible.
 * @param {string} key - Element key
 * @returns {boolean} True if visible
 */
export function isVisible(key) {
  const element = get(key);
  if (!element) return false;

  return element.style.display !== 'none' && element.offsetParent !== null;
}

// ============================================
// CLASS MANIPULATION
// ============================================

/**
 * Add a class to an element.
 * @param {string} key - Element key
 * @param {string} className - Class to add
 */
export function addClass(key, className) {
  const element = get(key);
  if (element) {
    element.classList.add(className);
  }
}

/**
 * Remove a class from an element.
 * @param {string} key - Element key
 * @param {string} className - Class to remove
 */
export function removeClass(key, className) {
  const element = get(key);
  if (element) {
    element.classList.remove(className);
  }
}

/**
 * Toggle a class on an element.
 * @param {string} key - Element key
 * @param {string} className - Class to toggle
 * @param {boolean} [force] - Force add/remove (optional)
 */
export function toggleClass(key, className, force) {
  const element = get(key);
  if (element) {
    element.classList.toggle(className, force);
  }
}

/**
 * Check if element has a class.
 * @param {string} key - Element key
 * @param {string} className - Class to check
 * @returns {boolean} True if element has the class
 */
export function hasClass(key, className) {
  const element = get(key);
  return element ? element.classList.contains(className) : false;
}

// ============================================
// DIALOG MANAGEMENT
// ============================================

/**
 * Show a modal dialog.
 * @param {string} key - Dialog element key
 */
export function showModal(key) {
  const dialog = get(key);
  if (dialog && typeof dialog.showModal === 'function') {
    dialog.showModal();
  }
}

/**
 * Close a modal dialog.
 * @param {string} key - Dialog element key
 */
export function closeModal(key) {
  const dialog = get(key);
  if (dialog && typeof dialog.close === 'function') {
    dialog.close();
  }
}

// ============================================
// EVENT HANDLING
// ============================================

/**
 * Add an event listener to an element.
 * @param {string} key - Element key
 * @param {string} event - Event type
 * @param {function} handler - Event handler
 * @param {object} [options] - Event listener options
 */
export function on(key, event, handler, options) {
  const element = get(key);
  if (element) {
    element.addEventListener(event, handler, options);
  }
}

/**
 * Remove an event listener from an element.
 * @param {string} key - Element key
 * @param {string} event - Event type
 * @param {function} handler - Event handler
 */
export function off(key, event, handler) {
  const element = get(key);
  if (element) {
    element.removeEventListener(event, handler);
  }
}

// ============================================
// ATTRIBUTE MANIPULATION
// ============================================

/**
 * Set an attribute on an element.
 * @param {string} key - Element key
 * @param {string} attr - Attribute name
 * @param {string} value - Attribute value
 */
export function setAttr(key, attr, value) {
  const element = get(key);
  if (element) {
    element.setAttribute(attr, value);
  }
}

/**
 * Get an attribute from an element.
 * @param {string} key - Element key
 * @param {string} attr - Attribute name
 * @returns {string|null} Attribute value
 */
export function getAttr(key, attr) {
  const element = get(key);
  return element ? element.getAttribute(attr) : null;
}

/**
 * Remove an attribute from an element.
 * @param {string} key - Element key
 * @param {string} attr - Attribute name
 */
export function removeAttr(key, attr) {
  const element = get(key);
  if (element) {
    element.removeAttribute(attr);
  }
}

// ============================================
// STYLE MANIPULATION
// ============================================

/**
 * Set inline styles on an element.
 * @param {string} key - Element key
 * @param {object} styles - Style properties
 */
export function setStyles(key, styles) {
  const element = get(key);
  if (element) {
    Object.assign(element.style, styles);
  }
}

/**
 * Get computed style value.
 * @param {string} key - Element key
 * @param {string} property - CSS property
 * @returns {string} Computed style value
 */
export function getStyle(key, property) {
  const element = get(key);
  if (!element) return '';

  return window.getComputedStyle(element).getPropertyValue(property);
}

// ============================================
// CACHE MANAGEMENT
// ============================================

/**
 * Clear a specific element from cache.
 * @param {string} key - Element key
 */
export function clearCache(key) {
  elementCache.delete(key);
}

/**
 * Clear all cached elements.
 */
export function clearAllCache() {
  elementCache.clear();
  isInitialized = false;
}

/**
 * Check if DOM controller is initialized.
 * @returns {boolean} Initialization status
 */
export function isReady() {
  return isInitialized;
}

// ============================================
// GLOBAL EXPORT
// ============================================

const DOMController = {
  init,
  get,
  getMultiple,
  query,
  queryAll,
  getValue,
  setValue,
  getText,
  setText,
  setHTML,
  show,
  hide,
  toggle,
  isVisible,
  addClass,
  removeClass,
  toggleClass,
  hasClass,
  showModal,
  closeModal,
  on,
  off,
  setAttr,
  getAttr,
  removeAttr,
  setStyles,
  getStyle,
  clearCache,
  clearAllCache,
  isReady,
  ELEMENT_IDS
};

export default DOMController;

// Make available globally for non-module usage
if (typeof window !== 'undefined') {
  window.VRC_DOM = DOMController;
}
