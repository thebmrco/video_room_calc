/**
 * VRC - Video Room Calculator
 * Yjs Provider Module
 *
 * Manages the Yjs document and WebSocket connection for real-time collaboration.
 */

// ============================================
// STATE
// ============================================
let ydoc = null;
let wsProvider = null;
let awareness = null;
let connectionStatus = 'disconnected';
let connectionListeners = [];
let roomId = null;
let localUser = null;

// Shared types
let yRoomData = null;
let yItems = null;
let yMeta = null;

// ============================================
// CONFIGURATION
// ============================================
const RECONNECT_INTERVAL = 3000;
const MAX_RECONNECT_ATTEMPTS = 10;
let reconnectAttempts = 0;
let reconnectTimer = null;

// ============================================
// USER COLORS
// ============================================
const USER_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#85C1E9', '#F8B500', '#00CED1'
];

function getUserColor(userId) {
  if (!userId) return USER_COLORS[0];
  let hash = 0;
  const str = String(userId);
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return USER_COLORS[Math.abs(hash) % USER_COLORS.length];
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize the Yjs document and WebSocket provider.
 * @param {string} roomIdentifier - Unique room identifier
 * @param {object} options - Configuration options
 * @param {string} options.wsUrl - WebSocket server URL (optional, defaults to current host)
 * @param {object} options.user - User info { id, name }
 */
export function initYjs(roomIdentifier, options = {}) {
  if (ydoc) {
    console.warn('[YjsProvider] Already initialized. Call disconnect() first.');
    return;
  }

  roomId = roomIdentifier;
  localUser = options.user || { id: generateClientId(), name: 'Anonymous' };

  // Create Yjs document
  ydoc = new Y.Doc();

  // Initialize shared types
  yRoomData = ydoc.getMap('roomData');
  yItems = ydoc.getMap('items');
  yMeta = ydoc.getMap('meta');

  // Determine WebSocket URL
  const wsUrl = options.wsUrl || getDefaultWsUrl();
  const fullUrl = `${wsUrl}/ws/yjs/${roomId}`;

  console.log('[YjsProvider] Connecting to:', fullUrl);

  // Create WebSocket connection
  connectWebSocket(fullUrl);

  // Set up awareness
  setupAwareness();

  return {
    ydoc,
    yRoomData,
    yItems,
    yMeta,
    awareness
  };
}

/**
 * Get default WebSocket URL based on current location.
 */
function getDefaultWsUrl() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}`;
}

/**
 * Generate a unique client ID.
 */
function generateClientId() {
  return 'client-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
}

// ============================================
// WEBSOCKET CONNECTION
// ============================================

/**
 * Connect to the WebSocket server.
 */
function connectWebSocket(url) {
  try {
    wsProvider = new WebSocket(url);
    wsProvider.binaryType = 'arraybuffer';

    wsProvider.onopen = () => {
      console.log('[YjsProvider] WebSocket connected');
      connectionStatus = 'connected';
      reconnectAttempts = 0;
      notifyConnectionListeners('connected');

      // Send sync step 1 to request current state
      sendSyncStep1();
    };

    wsProvider.onclose = (event) => {
      console.log('[YjsProvider] WebSocket closed:', event.code, event.reason);
      connectionStatus = 'disconnected';
      notifyConnectionListeners('disconnected');

      // Attempt reconnection
      scheduleReconnect(url);
    };

    wsProvider.onerror = (error) => {
      console.error('[YjsProvider] WebSocket error:', error);
      connectionStatus = 'disconnected';
      notifyConnectionListeners('disconnected');
    };

    wsProvider.onmessage = (event) => {
      handleMessage(event.data);
    };
  } catch (error) {
    console.error('[YjsProvider] Failed to create WebSocket:', error);
    connectionStatus = 'disconnected';
    notifyConnectionListeners('disconnected');
    scheduleReconnect(url);
  }
}

/**
 * Schedule a reconnection attempt.
 */
function scheduleReconnect(url) {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
  }

  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.log('[YjsProvider] Max reconnect attempts reached');
    return;
  }

  reconnectAttempts++;
  const delay = RECONNECT_INTERVAL * Math.min(reconnectAttempts, 5);

  console.log(`[YjsProvider] Reconnecting in ${delay}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
  connectionStatus = 'connecting';
  notifyConnectionListeners('connecting');

  reconnectTimer = setTimeout(() => {
    connectWebSocket(url);
  }, delay);
}

/**
 * Handle incoming WebSocket message.
 */
function handleMessage(data) {
  const bytes = new Uint8Array(data);
  if (bytes.length === 0) return;

  const messageType = bytes[0];
  const payload = bytes.slice(1);

  switch (messageType) {
    case 0: // Sync step 1 (request)
      sendSyncStep2();
      break;
    case 1: // Sync step 2 (state)
      applyState(payload);
      break;
    case 2: // Update
      applyUpdate(payload);
      break;
    case 3: // Awareness query
      sendAwarenessUpdate();
      break;
    case 4: // Awareness update
      handleAwarenessUpdate(payload);
      break;
    default:
      console.warn('[YjsProvider] Unknown message type:', messageType);
  }
}

/**
 * Send sync step 1 (request state).
 */
function sendSyncStep1() {
  if (!wsProvider || wsProvider.readyState !== WebSocket.OPEN) return;

  const message = new Uint8Array([0]);
  wsProvider.send(message);
}

/**
 * Send sync step 2 (full state).
 */
function sendSyncStep2() {
  if (!wsProvider || wsProvider.readyState !== WebSocket.OPEN || !ydoc) return;

  const state = Y.encodeStateAsUpdate(ydoc);
  const message = new Uint8Array(state.length + 1);
  message[0] = 1;
  message.set(state, 1);
  wsProvider.send(message);
}

/**
 * Send an update to the server.
 */
function sendUpdate(update) {
  if (!wsProvider || wsProvider.readyState !== WebSocket.OPEN) return;

  const message = new Uint8Array(update.length + 1);
  message[0] = 2;
  message.set(update, 1);
  wsProvider.send(message);
}

/**
 * Apply state from server.
 */
function applyState(payload) {
  if (!ydoc || payload.length === 0) return;

  try {
    Y.applyUpdate(ydoc, payload);
    console.log('[YjsProvider] Applied state from server');
  } catch (error) {
    console.error('[YjsProvider] Error applying state:', error);
  }
}

/**
 * Apply update from server.
 */
function applyUpdate(payload) {
  if (!ydoc || payload.length === 0) return;

  try {
    Y.applyUpdate(ydoc, payload);
  } catch (error) {
    console.error('[YjsProvider] Error applying update:', error);
  }
}

// ============================================
// AWARENESS
// ============================================

/**
 * Set up awareness for cursor/presence tracking.
 */
function setupAwareness() {
  awareness = {
    localState: {
      user: localUser,
      cursor: null,
      selection: [],
      dragging: null
    },
    states: new Map()
  };

  // Set initial awareness
  sendAwarenessUpdate();
}

/**
 * Send awareness update to server.
 */
function sendAwarenessUpdate() {
  if (!wsProvider || wsProvider.readyState !== WebSocket.OPEN || !awareness) return;

  const awarenessData = JSON.stringify(awareness.localState);
  const encoder = new TextEncoder();
  const payload = encoder.encode(awarenessData);

  const message = new Uint8Array(payload.length + 1);
  message[0] = 4;
  message.set(payload, 1);
  wsProvider.send(message);
}

/**
 * Handle awareness update from server.
 */
function handleAwarenessUpdate(payload) {
  try {
    const decoder = new TextDecoder();
    const data = JSON.parse(decoder.decode(payload));

    if (data.user && data.user.id !== localUser.id) {
      awareness.states.set(data.user.id, data);
      notifyAwarenessListeners('update', data);
    }
  } catch (error) {
    console.error('[YjsProvider] Error handling awareness:', error);
  }
}

/**
 * Update local awareness state.
 */
export function updateAwareness(updates) {
  if (!awareness) return;

  Object.assign(awareness.localState, updates);
  sendAwarenessUpdate();
}

/**
 * Get all connected users.
 */
export function getConnectedUsers() {
  if (!awareness) return [];

  const users = [{ ...awareness.localState, isLocal: true }];
  awareness.states.forEach((state, id) => {
    users.push({ ...state, isLocal: false });
  });
  return users;
}

// ============================================
// DOCUMENT OPERATIONS
// ============================================

/**
 * Set up observer for document changes.
 */
export function observeChanges(callback) {
  if (!ydoc) return () => {};

  const observer = (events, transaction) => {
    if (transaction.local) {
      // Local change - send to server
      const update = Y.encodeStateAsUpdate(ydoc);
      sendUpdate(update);
    }
    callback(events, transaction);
  };

  ydoc.on('update', (update, origin, doc, transaction) => {
    if (origin !== 'remote') {
      sendUpdate(update);
    }
  });

  yRoomData.observeDeep(observer);
  yItems.observeDeep(observer);

  return () => {
    yRoomData.unobserveDeep(observer);
    yItems.unobserveDeep(observer);
  };
}

// ============================================
// CONNECTION STATUS
// ============================================

/**
 * Subscribe to connection status changes.
 */
export function onConnectionChange(callback) {
  connectionListeners.push(callback);
  // Immediately call with current status
  callback(connectionStatus);
  return () => {
    connectionListeners = connectionListeners.filter(cb => cb !== callback);
  };
}

function notifyConnectionListeners(status) {
  connectionListeners.forEach(cb => {
    try {
      cb(status);
    } catch (e) {
      console.error('[YjsProvider] Error in connection listener:', e);
    }
  });
}

let awarenessListeners = [];

export function onAwarenessChange(callback) {
  awarenessListeners.push(callback);
  return () => {
    awarenessListeners = awarenessListeners.filter(cb => cb !== callback);
  };
}

function notifyAwarenessListeners(type, data) {
  awarenessListeners.forEach(cb => {
    try {
      cb(type, data);
    } catch (e) {
      console.error('[YjsProvider] Error in awareness listener:', e);
    }
  });
}

/**
 * Get current connection status.
 */
export function getConnectionStatus() {
  return connectionStatus;
}

// ============================================
// CLEANUP
// ============================================

/**
 * Disconnect and clean up.
 */
export function disconnect() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  if (wsProvider) {
    wsProvider.close();
    wsProvider = null;
  }

  if (ydoc) {
    ydoc.destroy();
    ydoc = null;
  }

  yRoomData = null;
  yItems = null;
  yMeta = null;
  awareness = null;
  roomId = null;
  connectionStatus = 'disconnected';
  reconnectAttempts = 0;

  console.log('[YjsProvider] Disconnected');
}

/**
 * Get the Yjs document.
 */
export function getYDoc() {
  return ydoc;
}

/**
 * Get shared types.
 */
export function getSharedTypes() {
  return { yRoomData, yItems, yMeta };
}

/**
 * Get the room ID.
 */
export function getRoomId() {
  return roomId;
}

/**
 * Get local user info.
 */
export function getLocalUser() {
  return localUser;
}

/**
 * Set local user info.
 */
export function setLocalUser(user) {
  localUser = { ...localUser, ...user };
  if (awareness) {
    awareness.localState.user = localUser;
    sendAwarenessUpdate();
  }
}

// ============================================
// EXPORTS
// ============================================
export default {
  initYjs,
  disconnect,
  getYDoc,
  getSharedTypes,
  getRoomId,
  getLocalUser,
  setLocalUser,
  getConnectionStatus,
  onConnectionChange,
  onAwarenessChange,
  updateAwareness,
  getConnectedUsers,
  observeChanges
};

// Make Y available globally if not using module bundler
if (typeof window !== 'undefined' && !window.Y) {
  // Minimal Yjs implementation for basic operations
  window.Y = {
    Doc: class Doc {
      constructor() {
        this.data = {};
        this.listeners = [];
      }
      getMap(name) {
        if (!this.data[name]) {
          this.data[name] = new YMap(this);
        }
        return this.data[name];
      }
      on(event, callback) {
        this.listeners.push({ event, callback });
      }
      destroy() {
        this.data = {};
        this.listeners = [];
      }
    },
    encodeStateAsUpdate: (doc) => {
      const data = {};
      for (const [key, value] of Object.entries(doc.data)) {
        if (value instanceof YMap) {
          data[key] = value.toJSON();
        }
      }
      return new TextEncoder().encode(JSON.stringify(data));
    },
    applyUpdate: (doc, update) => {
      try {
        const data = JSON.parse(new TextDecoder().decode(update));
        for (const [key, value] of Object.entries(data)) {
          const map = doc.getMap(key);
          for (const [k, v] of Object.entries(value)) {
            map.set(k, v);
          }
        }
      } catch (e) {
        console.error('Error applying update:', e);
      }
    }
  };

  class YMap {
    constructor(doc) {
      this.doc = doc;
      this.data = {};
      this.observers = [];
    }
    get(key) {
      return this.data[key];
    }
    set(key, value) {
      const oldValue = this.data[key];
      this.data[key] = value;
      this.notifyObservers([{ key, oldValue, newValue: value }]);
    }
    delete(key) {
      const oldValue = this.data[key];
      delete this.data[key];
      this.notifyObservers([{ key, oldValue, newValue: undefined, deleted: true }]);
    }
    has(key) {
      return key in this.data;
    }
    toJSON() {
      return { ...this.data };
    }
    forEach(callback) {
      for (const [key, value] of Object.entries(this.data)) {
        callback(value, key, this);
      }
    }
    observeDeep(callback) {
      this.observers.push(callback);
    }
    unobserveDeep(callback) {
      this.observers = this.observers.filter(cb => cb !== callback);
    }
    notifyObservers(changes) {
      this.observers.forEach(cb => {
        try {
          cb(changes, { local: true });
        } catch (e) {
          console.error('Observer error:', e);
        }
      });
    }
  }
}
