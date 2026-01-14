/**
 * VRC - Video Room Calculator
 * Sync Integration Module
 *
 * Bridges the Yjs provider with VRC's roomObj for real-time collaboration.
 * This module handles the synchronization of room data between multiple clients.
 */

import yjsProvider from './yjsProvider.js';

// ============================================
// STATE
// ============================================
let syncEnabled = false;
let isRemoteUpdate = false;
let lastSyncedState = null;
let syncCallbacks = {
  onRoomDataChange: null,
  onItemsChange: null,
  onUsersChange: null,
  onStatusChange: null
};

// Debounce timer for local changes
let localChangeTimer = null;
const LOCAL_CHANGE_DEBOUNCE = 100;

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize real-time sync for a room.
 * @param {string} roomId - The room ID to sync
 * @param {object} options - Configuration options
 * @param {object} options.user - Current user info { id, name }
 * @param {string} options.wsUrl - WebSocket server URL (optional)
 * @param {function} options.onRoomDataChange - Callback when room data changes remotely
 * @param {function} options.onItemsChange - Callback when items change remotely
 * @param {function} options.onUsersChange - Callback when connected users change
 * @param {function} options.onStatusChange - Callback when connection status changes
 */
export function initSync(roomId, options = {}) {
  if (syncEnabled) {
    console.warn('[SyncIntegration] Already initialized. Call stopSync() first.');
    return;
  }

  // Store callbacks
  syncCallbacks.onRoomDataChange = options.onRoomDataChange || null;
  syncCallbacks.onItemsChange = options.onItemsChange || null;
  syncCallbacks.onUsersChange = options.onUsersChange || null;
  syncCallbacks.onStatusChange = options.onStatusChange || null;

  // Initialize Yjs provider
  const { yRoomData, yItems, yMeta } = yjsProvider.initYjs(roomId, {
    wsUrl: options.wsUrl,
    user: options.user
  });

  // Set up observers for remote changes
  setupObservers(yRoomData, yItems, yMeta);

  // Listen for connection status changes
  yjsProvider.onConnectionChange((status) => {
    console.log('[SyncIntegration] Connection status:', status);
    if (syncCallbacks.onStatusChange) {
      syncCallbacks.onStatusChange(status);
    }
  });

  // Listen for awareness changes (user presence)
  yjsProvider.onAwarenessChange((type, data) => {
    if (syncCallbacks.onUsersChange) {
      syncCallbacks.onUsersChange(yjsProvider.getConnectedUsers());
    }
  });

  syncEnabled = true;
  console.log('[SyncIntegration] Sync initialized for room:', roomId);

  return {
    syncRoomObj,
    updateCursor,
    updateSelection,
    getConnectedUsers: yjsProvider.getConnectedUsers,
    getConnectionStatus: yjsProvider.getConnectionStatus
  };
}

/**
 * Set up Yjs observers for remote changes.
 */
function setupObservers(yRoomData, yItems, yMeta) {
  // Observe changes from the Yjs provider
  yjsProvider.observeChanges((events, transaction) => {
    if (isRemoteUpdate) return; // Skip if this is a local update we're sending

    // Check if this is a remote change
    if (!transaction.local) {
      handleRemoteChange(yRoomData, yItems);
    }
  });
}

/**
 * Handle remote changes from other clients.
 */
function handleRemoteChange(yRoomData, yItems) {
  console.log('[SyncIntegration] Handling remote change');

  // Get the updated data from Yjs
  const { yRoomData: sharedRoomData, yItems: sharedItems } = yjsProvider.getSharedTypes();

  if (!sharedRoomData || !sharedItems) return;

  // Convert Yjs data to roomObj format
  const remoteRoomData = sharedRoomData.toJSON ? sharedRoomData.toJSON() : {};
  const remoteItems = sharedItems.toJSON ? sharedItems.toJSON() : {};

  // Notify callbacks
  if (syncCallbacks.onRoomDataChange && Object.keys(remoteRoomData).length > 0) {
    syncCallbacks.onRoomDataChange(remoteRoomData);
  }

  if (syncCallbacks.onItemsChange && Object.keys(remoteItems).length > 0) {
    syncCallbacks.onItemsChange(remoteItems);
  }
}

// ============================================
// SYNC OPERATIONS
// ============================================

/**
 * Sync the local roomObj to all connected clients.
 * Call this after local changes to roomObj.
 * @param {object} roomObj - The VRC roomObj to sync
 */
export function syncRoomObj(roomObj) {
  if (!syncEnabled) return;

  // Debounce rapid changes
  if (localChangeTimer) {
    clearTimeout(localChangeTimer);
  }

  localChangeTimer = setTimeout(() => {
    performSync(roomObj);
  }, LOCAL_CHANGE_DEBOUNCE);
}

/**
 * Perform the actual sync operation.
 */
function performSync(roomObj) {
  const { yRoomData, yItems, yMeta } = yjsProvider.getSharedTypes();

  if (!yRoomData || !yItems) {
    console.warn('[SyncIntegration] Shared types not available');
    return;
  }

  // Create a clean copy without circular references
  const roomObjCopy = createSyncableRoomObj(roomObj);

  // Check if data actually changed
  const currentState = JSON.stringify(roomObjCopy);
  if (currentState === lastSyncedState) {
    return; // No changes
  }
  lastSyncedState = currentState;

  isRemoteUpdate = true;

  try {
    // Sync room data (dimensions, settings, etc.)
    const roomData = {
      roomId: roomObjCopy.roomId,
      name: roomObjCopy.name,
      version: roomObjCopy.version,
      unit: roomObjCopy.unit,
      room: roomObjCopy.room,
      software: roomObjCopy.software,
      authorVersion: roomObjCopy.authorVersion,
      workspace: roomObjCopy.workspace,
      layersVisible: roomObjCopy.layersVisible,
      roomSurfaces: roomObjCopy.roomSurfaces,
      arMaps: roomObjCopy.arMaps,
      activeArMapId: roomObjCopy.activeArMapId
    };

    // Update Yjs shared data
    for (const [key, value] of Object.entries(roomData)) {
      if (value !== undefined) {
        yRoomData.set(key, value);
      }
    }

    // Sync items (devices, furniture, etc.)
    if (roomObjCopy.items) {
      for (const [category, items] of Object.entries(roomObjCopy.items)) {
        yItems.set(category, items);
      }
    }

    // Sync metadata
    yMeta.set('lastUpdated', Date.now());
    yMeta.set('lastUpdatedBy', yjsProvider.getLocalUser()?.id || 'unknown');

    console.log('[SyncIntegration] Synced roomObj');
  } finally {
    isRemoteUpdate = false;
  }
}

/**
 * Create a clean copy of roomObj suitable for syncing.
 * Removes non-serializable data and circular references.
 */
function createSyncableRoomObj(roomObj) {
  const copy = {};

  // Copy basic properties
  const basicProps = [
    'roomId', 'name', 'version', 'unit', 'software', 'authorVersion'
  ];
  basicProps.forEach(prop => {
    if (roomObj[prop] !== undefined) {
      copy[prop] = roomObj[prop];
    }
  });

  // Copy room dimensions
  if (roomObj.room) {
    copy.room = { ...roomObj.room };
  }

  // Copy workspace settings
  if (roomObj.workspace) {
    copy.workspace = { ...roomObj.workspace };
  }

  // Copy layer visibility
  if (roomObj.layersVisible) {
    copy.layersVisible = { ...roomObj.layersVisible };
  }

  // Copy room surfaces
  if (roomObj.roomSurfaces) {
    copy.roomSurfaces = JSON.parse(JSON.stringify(roomObj.roomSurfaces));
  }

  // Copy AR World Maps
  if (roomObj.arMaps) {
    copy.arMaps = JSON.parse(JSON.stringify(roomObj.arMaps));
  }
  if (roomObj.activeArMapId !== undefined) {
    copy.activeArMapId = roomObj.activeArMapId;
  }

  // Copy items (deep clone to avoid references)
  if (roomObj.items) {
    copy.items = {};
    const itemCategories = [
      'videoDevices', 'chairs', 'tables', 'stageFloors', 'boxes',
      'rooms', 'displays', 'speakers', 'microphones', 'touchPanels'
    ];

    itemCategories.forEach(category => {
      if (roomObj.items[category]) {
        copy.items[category] = JSON.parse(JSON.stringify(roomObj.items[category]));
      }
    });
  }

  return copy;
}

/**
 * Apply remote room data to local roomObj.
 * @param {object} localRoomObj - The local roomObj to update
 * @param {object} remoteRoomData - The remote room data
 * @returns {object} Updated roomObj
 */
export function applyRemoteRoomData(localRoomObj, remoteRoomData) {
  const updated = { ...localRoomObj };

  // Apply basic properties
  const basicProps = [
    'roomId', 'name', 'version', 'unit', 'software', 'authorVersion'
  ];
  basicProps.forEach(prop => {
    if (remoteRoomData[prop] !== undefined) {
      updated[prop] = remoteRoomData[prop];
    }
  });

  // Apply room dimensions
  if (remoteRoomData.room) {
    updated.room = { ...updated.room, ...remoteRoomData.room };
  }

  // Apply workspace settings
  if (remoteRoomData.workspace) {
    updated.workspace = { ...updated.workspace, ...remoteRoomData.workspace };
  }

  // Apply layer visibility
  if (remoteRoomData.layersVisible) {
    updated.layersVisible = { ...updated.layersVisible, ...remoteRoomData.layersVisible };
  }

  // Apply room surfaces
  if (remoteRoomData.roomSurfaces) {
    updated.roomSurfaces = { ...remoteRoomData.roomSurfaces };
  }

  // Apply AR World Maps
  if (remoteRoomData.arMaps) {
    updated.arMaps = JSON.parse(JSON.stringify(remoteRoomData.arMaps));
  }
  if (remoteRoomData.activeArMapId !== undefined) {
    updated.activeArMapId = remoteRoomData.activeArMapId;
  }

  return updated;
}

/**
 * Apply remote items to local roomObj.
 * @param {object} localRoomObj - The local roomObj to update
 * @param {object} remoteItems - The remote items
 * @returns {object} Updated roomObj
 */
export function applyRemoteItems(localRoomObj, remoteItems) {
  const updated = { ...localRoomObj };

  if (!updated.items) {
    updated.items = {};
  }

  // Apply each item category
  for (const [category, items] of Object.entries(remoteItems)) {
    updated.items[category] = JSON.parse(JSON.stringify(items));
  }

  return updated;
}

// ============================================
// AWARENESS (CURSORS & SELECTIONS)
// ============================================

/**
 * Update the local user's cursor position.
 * @param {object} position - { x, y } cursor position in room coordinates
 */
export function updateCursor(position) {
  if (!syncEnabled) return;

  yjsProvider.updateAwareness({
    cursor: position
  });
}

/**
 * Update the local user's selection.
 * @param {array} selectedIds - Array of selected item IDs
 */
export function updateSelection(selectedIds) {
  if (!syncEnabled) return;

  yjsProvider.updateAwareness({
    selection: selectedIds
  });
}

/**
 * Update dragging state for the local user.
 * @param {object|null} dragInfo - { itemId, startPosition } or null if not dragging
 */
export function updateDragging(dragInfo) {
  if (!syncEnabled) return;

  yjsProvider.updateAwareness({
    dragging: dragInfo
  });
}

// ============================================
// STATUS & CLEANUP
// ============================================

/**
 * Check if sync is enabled.
 */
export function isSyncEnabled() {
  return syncEnabled;
}

/**
 * Get current connection status.
 */
export function getConnectionStatus() {
  return yjsProvider.getConnectionStatus();
}

/**
 * Get all connected users.
 */
export function getConnectedUsers() {
  return yjsProvider.getConnectedUsers();
}

/**
 * Stop syncing and disconnect.
 */
export function stopSync() {
  if (localChangeTimer) {
    clearTimeout(localChangeTimer);
    localChangeTimer = null;
  }

  yjsProvider.disconnect();

  syncEnabled = false;
  isRemoteUpdate = false;
  lastSyncedState = null;
  syncCallbacks = {
    onRoomDataChange: null,
    onItemsChange: null,
    onUsersChange: null,
    onStatusChange: null
  };

  console.log('[SyncIntegration] Sync stopped');
}

// ============================================
// EXPORTS
// ============================================
export default {
  initSync,
  stopSync,
  syncRoomObj,
  applyRemoteRoomData,
  applyRemoteItems,
  updateCursor,
  updateSelection,
  updateDragging,
  isSyncEnabled,
  getConnectionStatus,
  getConnectedUsers
};
