/**
 * VRC - Video Room Calculator
 * Keyboard Event Handlers
 *
 * Centralized keyboard shortcut handling extracted from roomcalc.js.
 * Provides a clean interface for keyboard events with configurable shortcuts.
 */

// ============================================
// KEYBOARD SHORTCUT DEFINITIONS
// ============================================

/**
 * Keyboard shortcut configuration.
 * Maps key combinations to action names.
 */
export const SHORTCUTS = {
  // File operations (Ctrl/Cmd + key)
  SAVE: { key: 's', ctrl: true, action: 'save' },
  EXPORT: { key: 'e', ctrl: true, action: 'export' },
  OPEN: { key: 'o', ctrl: true, action: 'open' },
  OPEN_ALT: { key: 'i', ctrl: true, action: 'open' },

  // Edit operations (Ctrl/Cmd + key)
  UNDO: { key: 'z', ctrl: true, action: 'undo' },
  REDO: { key: 'z', ctrl: true, shift: true, action: 'redo' },
  REDO_ALT: { key: 'y', ctrl: true, action: 'redo' },
  COPY: { key: 'c', ctrl: true, action: 'copy' },
  PASTE: { key: 'v', ctrl: true, action: 'paste' },
  CUT: { key: 'x', ctrl: true, action: 'cut' },
  DUPLICATE: { key: 'd', ctrl: true, action: 'duplicate' },
  ROTATE: { key: 'r', ctrl: true, action: 'rotate' },

  // View operations (Ctrl/Cmd + key)
  ROTATE_ROOM_LEFT: { key: ',', ctrl: true, action: 'rotateRoomLeft' },
  ROTATE_ROOM_RIGHT: { key: '.', ctrl: true, action: 'rotateRoomRight' },

  // Tool toggles (single key, no modifier)
  TOGGLE_CAMERA: { key: 'c', action: 'toggleCamera' },
  TOGGLE_DISPLAY: { key: 'd', action: 'toggleDisplay' },
  TOGGLE_MIC: { key: 'm', action: 'toggleMic' },
  MEASURING_TOOL: { key: 'm', ctrl: true, action: 'measuringTool' },
  QUICK_ADD: { key: ' ', action: 'quickAdd' },

  // Wall builder shortcuts
  WALL_STANDARD: { key: 's', action: 'wallStandard' },
  WALL_GLASS: { key: 'g', action: 'wallGlass' },
  WALL_WINDOW: { key: 'w', action: 'wallWindow' },
  WALL_CUSTOM: { key: 'c', action: 'wallCustom' },

  // Navigation
  DELETE: { key: 'Delete', action: 'delete' },
  BACKSPACE: { key: 'Backspace', action: 'delete' },
  ESCAPE: { key: 'Escape', action: 'escape' },

  // Arrow keys for item movement
  ARROW_LEFT: { keyCode: 37, action: 'moveLeft' },
  ARROW_UP: { keyCode: 38, action: 'moveUp' },
  ARROW_RIGHT: { keyCode: 39, action: 'moveRight' },
  ARROW_DOWN: { keyCode: 40, action: 'moveDown' },

  // Arrow keys with Ctrl for Z-position
  Z_UP: { keyCode: 38, ctrl: true, action: 'zUp' },
  Z_DOWN: { keyCode: 40, ctrl: true, action: 'zDown' }
};

// ============================================
// STATE
// ============================================

/**
 * Internal state for keyboard handling.
 */
const state = {
  isShiftKeyDown: false,
  blockKeyActions: false,
  lastKeyDownMovement: false,
  isEnabled: false
};

/**
 * Registered action handlers.
 * @type {Map<string, function>}
 */
const actionHandlers = new Map();

/**
 * Context object containing references to app state and functions.
 */
let context = {
  roomObj: null,
  stage: null,
  tr: null,
  canvasToJson: null,
  // App state flags
  isWallBuilderOn: false,
  isPolyBuilderOn: false,
  isMeasuringToolOn: false
};

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize keyboard handlers with application context.
 * @param {object} ctx - Context object with app references
 */
export function init(ctx) {
  context = { ...context, ...ctx };
  console.log('[KeyboardHandlers] Initialized');
}

/**
 * Enable keyboard event listeners.
 */
export function enable() {
  if (state.isEnabled) return;

  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);
  state.isEnabled = true;

  console.log('[KeyboardHandlers] Enabled');
}

/**
 * Disable keyboard event listeners.
 */
export function disable() {
  if (!state.isEnabled) return;

  document.removeEventListener('keydown', handleKeyDown);
  document.removeEventListener('keyup', handleKeyUp);
  state.isEnabled = false;

  console.log('[KeyboardHandlers] Disabled');
}

/**
 * Set whether key actions should be blocked.
 * @param {boolean} blocked - Whether to block
 */
export function setBlocked(blocked) {
  state.blockKeyActions = blocked;
}

/**
 * Check if shift key is currently pressed.
 * @returns {boolean}
 */
export function isShiftDown() {
  return state.isShiftKeyDown;
}

// ============================================
// ACTION REGISTRATION
// ============================================

/**
 * Register a handler for an action.
 * @param {string} action - Action name
 * @param {function} handler - Handler function
 */
export function on(action, handler) {
  actionHandlers.set(action, handler);
}

/**
 * Unregister a handler for an action.
 * @param {string} action - Action name
 */
export function off(action) {
  actionHandlers.delete(action);
}

/**
 * Register multiple handlers at once.
 * @param {object} handlers - Object mapping action names to handlers
 */
export function registerHandlers(handlers) {
  for (const [action, handler] of Object.entries(handlers)) {
    on(action, handler);
  }
}

// ============================================
// KEY EVENT HANDLING
// ============================================

/**
 * Handle keydown events.
 * @param {KeyboardEvent} e - Keyboard event
 */
function handleKeyDown(e) {
  const { key, keyCode, target, ctrlKey, metaKey, shiftKey } = e;
  const tagName = target.tagName;
  const isModifier = ctrlKey || metaKey;

  // Track shift key state
  if (key === 'Shift') {
    state.isShiftKeyDown = true;
  }

  // Allow browser refresh
  if (key === 'r' && shiftKey && isModifier) return;

  // Prevent default for certain key combinations
  if ((key === ',' || key === '.') && isModifier) {
    e.preventDefault();
  }

  // Block if disabled
  if (state.blockKeyActions) return;

  // Check for input fields - allow normal typing
  const inputElements = ['INPUT', 'TEXTAREA', 'BUTTON'];
  const isInInputField = inputElements.includes(tagName);

  // Determine which action to trigger
  const action = matchShortcut(e, isInInputField);

  if (action) {
    // Prevent default for matched shortcuts
    e.preventDefault();

    // Execute the action
    executeAction(action, e);
  }

  // Handle arrow key movement for selected items
  if (!isInInputField && context.tr && context.tr.nodes().length > 0) {
    handleArrowKeys(e);
  }
}

/**
 * Handle keyup events.
 * @param {KeyboardEvent} e - Keyboard event
 */
function handleKeyUp(e) {
  // Track shift key state
  if (e.key === 'Shift') {
    state.isShiftKeyDown = false;
  }

  // Save state if items were moved
  if (state.lastKeyDownMovement && context.canvasToJson) {
    context.canvasToJson();
  }
  state.lastKeyDownMovement = false;
}

/**
 * Match a keyboard event to a shortcut action.
 * @param {KeyboardEvent} e - Keyboard event
 * @param {boolean} isInInputField - Whether focus is in an input field
 * @returns {string|null} Action name or null
 */
function matchShortcut(e, isInInputField) {
  const { key, keyCode, ctrlKey, metaKey, shiftKey } = e;
  const isModifier = ctrlKey || metaKey;

  // File operations (always allowed with Ctrl/Cmd)
  if (isModifier) {
    if (key === 's') return 'save';
    if (key === 'e') return 'export';
    if (key === 'o' || key === 'i') return 'open';
    if (key === 'z' && shiftKey) return 'redo';
    if (key === 'z') return 'undo';
    if (key === 'y') return 'redo';
    if (key === 'c') return 'copy';
    if (key === 'v') return 'paste';
    if (key === 'x') return 'cut';
    if (key === 'd') return 'duplicate';
    if (key === 'r') return 'rotate';
    if (key === ',') return 'rotateRoomLeft';
    if (key === '.') return 'rotateRoomRight';
    if (key === 'm') return 'measuringTool';
  }

  // Don't process single-key shortcuts in input fields
  if (isInInputField) return null;

  // Tool toggles (no modifier)
  if (!isModifier) {
    // Wall builder mode shortcuts
    if (context.isWallBuilderOn) {
      if (key === 's') return 'wallStandard';
      if (key === 'g') return 'wallGlass';
      if (key === 'w') return 'wallWindow';
      if (key === 'c') return 'wallCustom';
    } else {
      // Normal mode shortcuts
      if (key === 'c') return 'toggleCamera';
      if (key === 'd') return 'toggleDisplay';
      if (key === 'm') return 'toggleMic';
    }

    if (key === ' ') return 'quickAdd';
    if (key === 'Delete' || key === 'Backspace') return 'delete';
    if (key === 'Escape' || key === 'Esc') return 'escape';
  }

  return null;
}

/**
 * Execute an action by name.
 * @param {string} action - Action name
 * @param {KeyboardEvent} e - Original keyboard event
 */
function executeAction(action, e) {
  const handler = actionHandlers.get(action);
  if (handler) {
    handler(e);
  } else {
    console.debug(`[KeyboardHandlers] No handler for action: ${action}`);
  }
}

/**
 * Handle arrow key movement for selected items.
 * @param {KeyboardEvent} e - Keyboard event
 */
function handleArrowKeys(e) {
  const { keyCode, ctrlKey, metaKey } = e;
  const isModifier = ctrlKey || metaKey;
  const DELTA = 1; // Pixel movement amount

  if (!context.tr || !context.tr.nodes) return;

  const nodes = context.tr.nodes();
  if (nodes.length === 0) return;

  let moved = false;

  nodes.forEach(shape => {
    if (isModifier) {
      // Z-position adjustment
      if (keyCode === 38) { // Up
        if (!shape.data_zPosition) shape.data_zPosition = 0;
        shape.data_zPosition = Math.round((shape.data_zPosition + DELTA * 0.01) * 100) / 100;
        moved = true;
      } else if (keyCode === 40) { // Down
        if (!shape.data_zPosition) shape.data_zPosition = 0;
        shape.data_zPosition = Math.round((shape.data_zPosition - DELTA * 0.01) * 100) / 100;
        moved = true;
      }
    } else {
      // X/Y position adjustment
      if (keyCode === 37) { // Left
        shape.x(shape.x() - DELTA);
        moved = true;
      } else if (keyCode === 38) { // Up
        shape.y(shape.y() - DELTA);
        moved = true;
      } else if (keyCode === 39) { // Right
        shape.x(shape.x() + DELTA);
        moved = true;
      } else if (keyCode === 40) { // Down
        shape.y(shape.y() + DELTA);
        moved = true;
      }
    }
  });

  if (moved) {
    e.preventDefault();
    state.lastKeyDownMovement = true;

    // Trigger shading update if available
    if (context.updateShading) {
      nodes.forEach(shape => context.updateShading(shape));
    }

    // Update details panel if single selection
    if (nodes.length === 1 && context.updateFormatDetails) {
      context.updateFormatDetails(nodes[0].id());
    }
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Check if an element is an input field.
 * @param {HTMLElement} element - Element to check
 * @returns {boolean}
 */
export function isInputElement(element) {
  const inputTags = ['INPUT', 'TEXTAREA', 'BUTTON', 'SELECT'];
  return inputTags.includes(element.tagName);
}

/**
 * Create a keyboard shortcut string for display.
 * @param {object} shortcut - Shortcut definition
 * @returns {string} Human-readable shortcut string
 */
export function formatShortcut(shortcut) {
  const parts = [];

  if (shortcut.ctrl) {
    parts.push(navigator.platform.includes('Mac') ? '⌘' : 'Ctrl');
  }
  if (shortcut.shift) {
    parts.push('Shift');
  }
  if (shortcut.alt) {
    parts.push('Alt');
  }

  if (shortcut.key) {
    parts.push(shortcut.key.toUpperCase());
  } else if (shortcut.keyCode) {
    const keyNames = { 37: '←', 38: '↑', 39: '→', 40: '↓' };
    parts.push(keyNames[shortcut.keyCode] || `Key${shortcut.keyCode}`);
  }

  return parts.join('+');
}

/**
 * Get all registered shortcuts with their display strings.
 * @returns {object} Map of action names to shortcut strings
 */
export function getShortcutHelp() {
  const help = {};
  for (const [name, shortcut] of Object.entries(SHORTCUTS)) {
    help[shortcut.action] = formatShortcut(shortcut);
  }
  return help;
}

// ============================================
// GLOBAL EXPORT
// ============================================

const KeyboardHandlers = {
  init,
  enable,
  disable,
  setBlocked,
  isShiftDown,
  on,
  off,
  registerHandlers,
  isInputElement,
  formatShortcut,
  getShortcutHelp,
  SHORTCUTS
};

export default KeyboardHandlers;

// Make available globally for non-module usage
if (typeof window !== 'undefined') {
  window.VRC_KeyboardHandlers = KeyboardHandlers;
}
