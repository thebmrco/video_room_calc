/**
 * VRC - Video Room Calculator
 * Main Sync Entry Point
 *
 * This is the main entry point for real-time collaboration in VRC.
 * It provides a simple API for roomcalc.js to use.
 *
 * Usage:
 *   // Enable collaboration mode
 *   VRCSync.enable(roomObj.roomId, {
 *     user: { id: userId, name: userName },
 *     onRoomUpdate: (updatedRoomObj) => { ... },
 *     onRedraw: () => drawRoom(true)
 *   });
 *
 *   // Call this after any local change to roomObj
 *   VRCSync.sync(roomObj);
 *
 *   // Disable collaboration
 *   VRCSync.disable();
 */

import syncIntegration from './syncIntegration.js';
import collaborationUI from './collaborationUI.js';

// ============================================
// STATE
// ============================================
let isEnabled = false;
let currentRoomId = null;
let callbacks = {
  onRoomUpdate: null,
  onRedraw: null,
  getRoomObj: null
};

// ============================================
// PUBLIC API
// ============================================

/**
 * Enable real-time collaboration for the current room.
 * @param {string} roomId - The room ID to collaborate on
 * @param {object} options - Configuration options
 * @param {object} options.user - Current user { id, name }
 * @param {function} options.onRoomUpdate - Callback when room data is updated remotely
 * @param {function} options.onRedraw - Callback to redraw the room
 * @param {function} options.getRoomObj - Callback to get current roomObj
 */
function enable(roomId, options = {}) {
  if (isEnabled) {
    console.log('[VRCSync] Already enabled, disabling first...');
    disable();
  }

  currentRoomId = roomId;
  callbacks.onRoomUpdate = options.onRoomUpdate;
  callbacks.onRedraw = options.onRedraw;
  callbacks.getRoomObj = options.getRoomObj;

  // Initialize collaboration UI
  collaborationUI.initCollabUI();
  collaborationUI.updateConnectionStatus('connecting');

  // Initialize sync
  syncIntegration.initSync(roomId, {
    user: options.user || { id: generateUserId(), name: 'User' },
    onRoomDataChange: handleRemoteRoomDataChange,
    onItemsChange: handleRemoteItemsChange,
    onUsersChange: handleUsersChange,
    onStatusChange: handleStatusChange
  });

  isEnabled = true;
  console.log('[VRCSync] Enabled for room:', roomId);
}

/**
 * Disable real-time collaboration.
 */
function disable() {
  if (!isEnabled) return;

  syncIntegration.stopSync();
  collaborationUI.destroyCollabUI();

  isEnabled = false;
  currentRoomId = null;
  callbacks = {
    onRoomUpdate: null,
    onRedraw: null,
    getRoomObj: null
  };

  console.log('[VRCSync] Disabled');
}

/**
 * Sync the current roomObj to all connected clients.
 * Call this after any local change to roomObj.
 * @param {object} roomObj - The current roomObj
 */
function sync(roomObj) {
  if (!isEnabled) return;
  syncIntegration.syncRoomObj(roomObj);
}

/**
 * Update cursor position (for showing other users where you're pointing).
 * @param {object} position - { x, y } in room coordinates
 */
function updateCursor(position) {
  if (!isEnabled) return;
  syncIntegration.updateCursor(position);
}

/**
 * Update selection (for showing other users what you've selected).
 * @param {array} selectedIds - Array of selected item IDs
 */
function updateSelection(selectedIds) {
  if (!isEnabled) return;
  syncIntegration.updateSelection(selectedIds);
}

/**
 * Check if collaboration is enabled.
 */
function getIsEnabled() {
  return isEnabled;
}

/**
 * Get connection status.
 */
function getStatus() {
  return syncIntegration.getConnectionStatus();
}

/**
 * Get connected users.
 */
function getUsers() {
  return syncIntegration.getConnectedUsers();
}

// ============================================
// INTERNAL HANDLERS
// ============================================

function handleRemoteRoomDataChange(remoteRoomData) {
  console.log('[VRCSync] Remote room data change received');

  if (callbacks.onRoomUpdate && callbacks.getRoomObj) {
    const currentRoomObj = callbacks.getRoomObj();
    const updatedRoomObj = syncIntegration.applyRemoteRoomData(currentRoomObj, remoteRoomData);
    callbacks.onRoomUpdate(updatedRoomObj);

    // Trigger redraw
    if (callbacks.onRedraw) {
      callbacks.onRedraw();
    }
  }
}

function handleRemoteItemsChange(remoteItems) {
  console.log('[VRCSync] Remote items change received');

  if (callbacks.onRoomUpdate && callbacks.getRoomObj) {
    const currentRoomObj = callbacks.getRoomObj();
    const updatedRoomObj = syncIntegration.applyRemoteItems(currentRoomObj, remoteItems);
    callbacks.onRoomUpdate(updatedRoomObj);

    // Trigger redraw
    if (callbacks.onRedraw) {
      callbacks.onRedraw();
    }
  }
}

function handleUsersChange(users) {
  collaborationUI.updateConnectedUsers(users);
}

function handleStatusChange(status) {
  collaborationUI.updateConnectionStatus(status);
}

function generateUserId() {
  return 'user-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
}

// ============================================
// GLOBAL EXPORT
// ============================================

// Make VRCSync available globally for non-module usage
const VRCSync = {
  enable,
  disable,
  sync,
  updateCursor,
  updateSelection,
  isEnabled: getIsEnabled,
  getStatus,
  getUsers
};

// Export for ES modules
export default VRCSync;

// Attach to window for global access
if (typeof window !== 'undefined') {
  window.VRCSync = VRCSync;
}
