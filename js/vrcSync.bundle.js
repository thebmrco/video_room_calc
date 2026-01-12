/**
 * VRC - Video Room Calculator
 * Real-time Collaboration Bundle
 *
 * This is a bundled, non-module version of the VRC sync system.
 * It provides real-time collaboration using Yjs and WebSockets.
 *
 * Usage in roomcalc.js:
 *   // Enable collaboration mode
 *   VRCSync.enable(roomObj.roomId, {
 *     user: { id: userId, name: userName },
 *     onRoomUpdate: (updatedRoomObj) => { roomObj = updatedRoomObj; },
 *     onRedraw: () => drawRoom(true, true, true),
 *     getRoomObj: () => roomObj
 *   });
 *
 *   // In saveToUndoArray(), add:
 *   VRCSync.sync(roomObj);
 *
 *   // Disable collaboration
 *   VRCSync.disable();
 */

(function(global) {
  'use strict';

  // ============================================
  // MINIMAL YJS IMPLEMENTATION
  // ============================================

  class YDoc {
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

    emit(event, ...args) {
      this.listeners
        .filter(l => l.event === event)
        .forEach(l => l.callback(...args));
    }

    destroy() {
      this.data = {};
      this.listeners = [];
    }
  }

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
      this.notifyObservers([{ key, oldValue, newValue: value }], { local: true });
    }

    delete(key) {
      const oldValue = this.data[key];
      delete this.data[key];
      this.notifyObservers([{ key, oldValue, newValue: undefined, deleted: true }], { local: true });
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

    notifyObservers(changes, transaction) {
      this.observers.forEach(cb => {
        try {
          cb(changes, transaction);
        } catch (e) {
          console.error('[YMap] Observer error:', e);
        }
      });
    }
  }

  const Y = {
    Doc: YDoc,
    encodeStateAsUpdate: (doc) => {
      const data = {};
      for (const [key, value] of Object.entries(doc.data)) {
        if (value instanceof YMap) {
          data[key] = value.toJSON();
        }
      }
      return new TextEncoder().encode(JSON.stringify(data));
    },
    applyUpdate: (doc, update, origin) => {
      try {
        const data = JSON.parse(new TextDecoder().decode(update));
        for (const [key, value] of Object.entries(data)) {
          const map = doc.getMap(key);
          for (const [k, v] of Object.entries(value)) {
            map.data[k] = v;
            map.notifyObservers([{ key: k, newValue: v }], { local: false, origin });
          }
        }
      } catch (e) {
        console.error('[Y] Error applying update:', e);
      }
    }
  };

  // ============================================
  // YJS PROVIDER
  // ============================================

  const YjsProvider = (function() {
    // State
    let ydoc = null;
    let wsProvider = null;
    let awareness = null;
    let connectionStatus = 'disconnected';
    let connectionListeners = [];
    let awarenessListeners = [];
    let roomId = null;
    let localUser = null;

    // Shared types
    let yRoomData = null;
    let yItems = null;
    let yMeta = null;

    // Configuration
    const RECONNECT_INTERVAL = 3000;
    const MAX_RECONNECT_ATTEMPTS = 10;
    let reconnectAttempts = 0;
    let reconnectTimer = null;

    // User colors
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

    function generateClientId() {
      return 'client-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
    }

    function getDefaultWsUrl() {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${protocol}//${window.location.host}`;
    }

    function initYjs(roomIdentifier, options) {
      if (ydoc) {
        console.warn('[YjsProvider] Already initialized. Call disconnect() first.');
        return { yRoomData, yItems, yMeta, awareness };
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

      return { ydoc, yRoomData, yItems, yMeta, awareness };
    }

    function connectWebSocket(url) {
      console.log('[YjsProvider] Attempting WebSocket connection to:', url);
      try {
        wsProvider = new WebSocket(url);
        wsProvider.binaryType = 'arraybuffer';
        console.log('[YjsProvider] WebSocket object created, readyState:', wsProvider.readyState);

        wsProvider.onopen = () => {
          console.log('[YjsProvider] WebSocket CONNECTED successfully');
          connectionStatus = 'connected';
          reconnectAttempts = 0;
          notifyConnectionListeners('connected');
          sendSyncStep1();
        };

        wsProvider.onclose = (event) => {
          console.log('[YjsProvider] WebSocket CLOSED - code:', event.code, 'reason:', event.reason, 'wasClean:', event.wasClean);
          connectionStatus = 'disconnected';
          notifyConnectionListeners('disconnected');
          scheduleReconnect(url);
        };

        wsProvider.onerror = (error) => {
          console.error('[YjsProvider] WebSocket ERROR:', error);
          console.error('[YjsProvider] WebSocket readyState on error:', wsProvider ? wsProvider.readyState : 'null');
          connectionStatus = 'disconnected';
          notifyConnectionListeners('disconnected');
        };

        wsProvider.onmessage = (event) => {
          console.log('[YjsProvider] WebSocket MESSAGE received, size:', event.data.byteLength || event.data.length);
          handleMessage(event.data);
        };
      } catch (error) {
        console.error('[YjsProvider] Failed to create WebSocket:', error);
        connectionStatus = 'disconnected';
        notifyConnectionListeners('disconnected');
        scheduleReconnect(url);
      }
    }

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

    function sendSyncStep1() {
      if (!wsProvider || wsProvider.readyState !== WebSocket.OPEN) return;
      const message = new Uint8Array([0]);
      wsProvider.send(message);
    }

    function sendSyncStep2() {
      if (!wsProvider || wsProvider.readyState !== WebSocket.OPEN || !ydoc) return;
      const state = Y.encodeStateAsUpdate(ydoc);
      const message = new Uint8Array(state.length + 1);
      message[0] = 1;
      message.set(state, 1);
      wsProvider.send(message);
    }

    function sendUpdate(update) {
      if (!wsProvider || wsProvider.readyState !== WebSocket.OPEN) return;
      const message = new Uint8Array(update.length + 1);
      message[0] = 2;
      message.set(update, 1);
      wsProvider.send(message);
    }

    function applyState(payload) {
      if (!ydoc || payload.length === 0) return;
      try {
        Y.applyUpdate(ydoc, payload, 'remote');
        console.log('[YjsProvider] Applied state from server');
      } catch (error) {
        console.error('[YjsProvider] Error applying state:', error);
      }
    }

    function applyUpdate(payload) {
      if (!ydoc || payload.length === 0) return;
      try {
        Y.applyUpdate(ydoc, payload, 'remote');
      } catch (error) {
        console.error('[YjsProvider] Error applying update:', error);
      }
    }

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
      sendAwarenessUpdate();
    }

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

    function notifyConnectionListeners(status) {
      connectionListeners.forEach(cb => {
        try {
          cb(status);
        } catch (e) {
          console.error('[YjsProvider] Error in connection listener:', e);
        }
      });
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

    function updateAwareness(updates) {
      if (!awareness) return;
      Object.assign(awareness.localState, updates);
      sendAwarenessUpdate();
    }

    function getConnectedUsers() {
      if (!awareness) return [];
      const users = [{ ...awareness.localState, isLocal: true }];
      awareness.states.forEach((state, id) => {
        users.push({ ...state, isLocal: false });
      });
      return users;
    }

    function observeChanges(callback) {
      if (!ydoc) return () => {};

      const observer = (events, transaction) => {
        if (transaction.local) {
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

    function onConnectionChange(callback) {
      connectionListeners.push(callback);
      callback(connectionStatus);
      return () => {
        connectionListeners = connectionListeners.filter(cb => cb !== callback);
      };
    }

    function onAwarenessChange(callback) {
      awarenessListeners.push(callback);
      return () => {
        awarenessListeners = awarenessListeners.filter(cb => cb !== callback);
      };
    }

    function getConnectionStatus() {
      return connectionStatus;
    }

    function disconnect() {
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

    function getYDoc() {
      return ydoc;
    }

    function getSharedTypes() {
      return { yRoomData, yItems, yMeta };
    }

    function getRoomId() {
      return roomId;
    }

    function getLocalUser() {
      return localUser;
    }

    function setLocalUser(user) {
      localUser = { ...localUser, ...user };
      if (awareness) {
        awareness.localState.user = localUser;
        sendAwarenessUpdate();
      }
    }

    return {
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
  })();

  // ============================================
  // SYNC INTEGRATION
  // ============================================

  const SyncIntegration = (function() {
    let syncEnabled = false;
    let isRemoteUpdate = false;
    let lastSyncedState = null;
    let syncCallbacks = {
      onRoomDataChange: null,
      onItemsChange: null,
      onUsersChange: null,
      onStatusChange: null
    };

    let localChangeTimer = null;
    const LOCAL_CHANGE_DEBOUNCE = 100;

    function initSync(roomId, options) {
      if (syncEnabled) {
        console.warn('[SyncIntegration] Already initialized. Call stopSync() first.');
        return;
      }

      syncCallbacks.onRoomDataChange = options.onRoomDataChange || null;
      syncCallbacks.onItemsChange = options.onItemsChange || null;
      syncCallbacks.onUsersChange = options.onUsersChange || null;
      syncCallbacks.onStatusChange = options.onStatusChange || null;

      const { yRoomData, yItems, yMeta } = YjsProvider.initYjs(roomId, {
        wsUrl: options.wsUrl,
        user: options.user
      });

      setupObservers(yRoomData, yItems, yMeta);

      YjsProvider.onConnectionChange((status) => {
        console.log('[SyncIntegration] Connection status:', status);
        if (syncCallbacks.onStatusChange) {
          syncCallbacks.onStatusChange(status);
        }
      });

      YjsProvider.onAwarenessChange((type, data) => {
        if (syncCallbacks.onUsersChange) {
          syncCallbacks.onUsersChange(YjsProvider.getConnectedUsers());
        }
      });

      syncEnabled = true;
      console.log('[SyncIntegration] Sync initialized for room:', roomId);

      return {
        syncRoomObj,
        updateCursor,
        updateSelection,
        getConnectedUsers: YjsProvider.getConnectedUsers,
        getConnectionStatus: YjsProvider.getConnectionStatus
      };
    }

    function setupObservers(yRoomData, yItems, yMeta) {
      YjsProvider.observeChanges((events, transaction) => {
        if (isRemoteUpdate) return;

        if (!transaction.local) {
          handleRemoteChange(yRoomData, yItems);
        }
      });
    }

    function handleRemoteChange(yRoomData, yItems) {
      console.log('[SyncIntegration] Handling remote change');

      const { yRoomData: sharedRoomData, yItems: sharedItems } = YjsProvider.getSharedTypes();

      if (!sharedRoomData || !sharedItems) return;

      const remoteRoomData = sharedRoomData.toJSON ? sharedRoomData.toJSON() : {};
      const remoteItems = sharedItems.toJSON ? sharedItems.toJSON() : {};

      if (syncCallbacks.onRoomDataChange && Object.keys(remoteRoomData).length > 0) {
        syncCallbacks.onRoomDataChange(remoteRoomData);
      }

      if (syncCallbacks.onItemsChange && Object.keys(remoteItems).length > 0) {
        syncCallbacks.onItemsChange(remoteItems);
      }
    }

    function syncRoomObj(roomObj) {
      if (!syncEnabled) return;

      if (localChangeTimer) {
        clearTimeout(localChangeTimer);
      }

      localChangeTimer = setTimeout(() => {
        performSync(roomObj);
      }, LOCAL_CHANGE_DEBOUNCE);
    }

    function performSync(roomObj) {
      const { yRoomData, yItems, yMeta } = YjsProvider.getSharedTypes();

      if (!yRoomData || !yItems) {
        console.warn('[SyncIntegration] Shared types not available');
        return;
      }

      const roomObjCopy = createSyncableRoomObj(roomObj);

      const currentState = JSON.stringify(roomObjCopy);
      if (currentState === lastSyncedState) {
        return;
      }
      lastSyncedState = currentState;

      isRemoteUpdate = true;

      try {
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
          roomSurfaces: roomObjCopy.roomSurfaces
        };

        for (const [key, value] of Object.entries(roomData)) {
          if (value !== undefined) {
            yRoomData.set(key, value);
          }
        }

        if (roomObjCopy.items) {
          for (const [category, items] of Object.entries(roomObjCopy.items)) {
            yItems.set(category, items);
          }
        }

        yMeta.set('lastUpdated', Date.now());
        yMeta.set('lastUpdatedBy', YjsProvider.getLocalUser()?.id || 'unknown');

        console.log('[SyncIntegration] Synced roomObj');
      } finally {
        isRemoteUpdate = false;
      }
    }

    function createSyncableRoomObj(roomObj) {
      const copy = {};

      const basicProps = [
        'roomId', 'name', 'version', 'unit', 'software', 'authorVersion'
      ];
      basicProps.forEach(prop => {
        if (roomObj[prop] !== undefined) {
          copy[prop] = roomObj[prop];
        }
      });

      if (roomObj.room) {
        copy.room = { ...roomObj.room };
      }

      if (roomObj.workspace) {
        copy.workspace = { ...roomObj.workspace };
      }

      if (roomObj.layersVisible) {
        copy.layersVisible = { ...roomObj.layersVisible };
      }

      if (roomObj.roomSurfaces) {
        copy.roomSurfaces = JSON.parse(JSON.stringify(roomObj.roomSurfaces));
      }

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

    function applyRemoteRoomData(localRoomObj, remoteRoomData) {
      const updated = { ...localRoomObj };

      const basicProps = [
        'roomId', 'name', 'version', 'unit', 'software', 'authorVersion'
      ];
      basicProps.forEach(prop => {
        if (remoteRoomData[prop] !== undefined) {
          updated[prop] = remoteRoomData[prop];
        }
      });

      if (remoteRoomData.room) {
        updated.room = { ...updated.room, ...remoteRoomData.room };
      }

      if (remoteRoomData.workspace) {
        updated.workspace = { ...updated.workspace, ...remoteRoomData.workspace };
      }

      if (remoteRoomData.layersVisible) {
        updated.layersVisible = { ...updated.layersVisible, ...remoteRoomData.layersVisible };
      }

      if (remoteRoomData.roomSurfaces) {
        updated.roomSurfaces = { ...remoteRoomData.roomSurfaces };
      }

      return updated;
    }

    function applyRemoteItems(localRoomObj, remoteItems) {
      const updated = { ...localRoomObj };

      if (!updated.items) {
        updated.items = {};
      }

      for (const [category, items] of Object.entries(remoteItems)) {
        updated.items[category] = JSON.parse(JSON.stringify(items));
      }

      return updated;
    }

    function updateCursor(position) {
      if (!syncEnabled) return;
      YjsProvider.updateAwareness({ cursor: position });
    }

    function updateSelection(selectedIds) {
      if (!syncEnabled) return;
      YjsProvider.updateAwareness({ selection: selectedIds });
    }

    function updateDragging(dragInfo) {
      if (!syncEnabled) return;
      YjsProvider.updateAwareness({ dragging: dragInfo });
    }

    function isSyncEnabled() {
      return syncEnabled;
    }

    function getConnectionStatus() {
      return YjsProvider.getConnectionStatus();
    }

    function getConnectedUsers() {
      return YjsProvider.getConnectedUsers();
    }

    function stopSync() {
      if (localChangeTimer) {
        clearTimeout(localChangeTimer);
        localChangeTimer = null;
      }

      YjsProvider.disconnect();

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

    return {
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
  })();

  // ============================================
  // COLLABORATION UI
  // ============================================

  const CollaborationUI = (function() {
    let uiContainer = null;
    let statusIndicator = null;
    let usersPanel = null;
    let cursorLayers = new Map();

    const USER_COLORS = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
      '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
      '#BB8FCE', '#85C1E9', '#F8B500', '#00CED1'
    ];

    const STYLES = `
.vrc-collab-container {
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 10000;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 12px;
}

.vrc-collab-status {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.95);
  padding: 8px 12px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: all 0.2s ease;
}

.vrc-collab-status:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.vrc-collab-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.vrc-collab-status-dot.connected {
  background-color: #4CAF50;
  box-shadow: 0 0 6px rgba(76, 175, 80, 0.6);
}

.vrc-collab-status-dot.connecting {
  background-color: #FFC107;
  animation: pulse 1s ease-in-out infinite;
}

.vrc-collab-status-dot.disconnected {
  background-color: #9E9E9E;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.vrc-collab-status-text {
  color: #333;
  white-space: nowrap;
}

.vrc-collab-users-panel {
  margin-top: 8px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  max-height: 0;
  transition: max-height 0.3s ease;
}

.vrc-collab-users-panel.expanded {
  max-height: 300px;
}

.vrc-collab-users-header {
  padding: 10px 12px;
  background: #f5f5f5;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #e0e0e0;
}

.vrc-collab-users-list {
  padding: 8px 0;
  max-height: 200px;
  overflow-y: auto;
}

.vrc-collab-user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  transition: background-color 0.2s ease;
}

.vrc-collab-user:hover {
  background: #f8f8f8;
}

.vrc-collab-user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
}

.vrc-collab-user-info {
  flex: 1;
  min-width: 0;
}

.vrc-collab-user-name {
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.vrc-collab-user-status {
  font-size: 10px;
  color: #666;
}

.vrc-collab-user.local .vrc-collab-user-name::after {
  content: ' (You)';
  color: #999;
  font-weight: normal;
}

.vrc-remote-cursor {
  position: absolute;
  pointer-events: none;
  z-index: 9999;
  transition: transform 0.1s ease-out;
}

.vrc-remote-cursor-pointer {
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 12px solid currentColor;
  transform: rotate(-45deg);
}

.vrc-remote-cursor-label {
  position: absolute;
  top: 12px;
  left: 8px;
  background: currentColor;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  white-space: nowrap;
}
`;

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

    function getInitials(name) {
      if (!name) return '?';
      const parts = name.trim().split(/\s+/);
      if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
      }
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    function initCollabUI(container) {
      container = container || document.body;

      if (!document.getElementById('vrc-collab-styles')) {
        const styleEl = document.createElement('style');
        styleEl.id = 'vrc-collab-styles';
        styleEl.textContent = STYLES;
        document.head.appendChild(styleEl);
      }

      uiContainer = document.createElement('div');
      uiContainer.className = 'vrc-collab-container';
      uiContainer.innerHTML = `
        <div class="vrc-collab-status" id="vrc-collab-status">
          <span class="vrc-collab-status-dot disconnected" id="vrc-collab-status-dot"></span>
          <span class="vrc-collab-status-text" id="vrc-collab-status-text">Offline</span>
        </div>
        <div class="vrc-collab-users-panel" id="vrc-collab-users-panel">
          <div class="vrc-collab-users-header">
            <span id="vrc-collab-users-count">0</span> Connected
          </div>
          <div class="vrc-collab-users-list" id="vrc-collab-users-list"></div>
        </div>
      `;

      container.appendChild(uiContainer);

      statusIndicator = uiContainer.querySelector('#vrc-collab-status');
      usersPanel = uiContainer.querySelector('#vrc-collab-users-panel');

      statusIndicator.addEventListener('click', () => {
        usersPanel.classList.toggle('expanded');
      });

      console.log('[CollaborationUI] Initialized');
    }

    function updateConnectionStatus(status) {
      if (!uiContainer) return;

      const dot = uiContainer.querySelector('#vrc-collab-status-dot');
      const text = uiContainer.querySelector('#vrc-collab-status-text');

      dot.classList.remove('connected', 'connecting', 'disconnected');
      dot.classList.add(status);

      switch (status) {
        case 'connected':
          text.textContent = 'Live';
          break;
        case 'connecting':
          text.textContent = 'Connecting...';
          break;
        case 'disconnected':
        default:
          text.textContent = 'Offline';
          break;
      }
    }

    function updateConnectedUsers(users) {
      if (!uiContainer) return;

      const countEl = uiContainer.querySelector('#vrc-collab-users-count');
      const listEl = uiContainer.querySelector('#vrc-collab-users-list');

      countEl.textContent = users.length;
      listEl.innerHTML = '';

      users.forEach((userData, index) => {
        const user = userData.user || { id: 'unknown', name: 'Unknown' };
        const color = getUserColor(user.id);
        const initials = getInitials(user.name);

        const userEl = document.createElement('div');
        userEl.className = `vrc-collab-user${userData.isLocal ? ' local' : ''}`;
        userEl.innerHTML = `
          <div class="vrc-collab-user-avatar" style="background-color: ${color}">
            ${initials}
          </div>
          <div class="vrc-collab-user-info">
            <div class="vrc-collab-user-name">${escapeHtml(user.name)}</div>
            <div class="vrc-collab-user-status">${userData.isLocal ? 'You' : 'Editing'}</div>
          </div>
        `;

        listEl.appendChild(userEl);
      });

      updateRemoteCursors(users.filter(u => !u.isLocal));
    }

    function updateRemoteCursors(remoteUsers) {
      const canvasContainer = document.getElementById('canvasDiv') || document.getElementById('scroll-container');
      if (!canvasContainer) return;

      const seenUserIds = new Set();

      remoteUsers.forEach(userData => {
        const user = userData.user;
        if (!user || !userData.cursor) return;

        seenUserIds.add(user.id);

        let cursorEl = cursorLayers.get(user.id);

        if (!cursorEl) {
          cursorEl = document.createElement('div');
          cursorEl.className = 'vrc-remote-cursor';
          cursorEl.style.color = getUserColor(user.id);
          cursorEl.innerHTML = `
            <div class="vrc-remote-cursor-pointer"></div>
            <div class="vrc-remote-cursor-label">${escapeHtml(user.name)}</div>
          `;
          canvasContainer.appendChild(cursorEl);
          cursorLayers.set(user.id, cursorEl);
        }

        cursorEl.style.transform = `translate(${userData.cursor.x}px, ${userData.cursor.y}px)`;
        cursorEl.style.display = 'block';
      });

      cursorLayers.forEach((cursorEl, usrId) => {
        if (!seenUserIds.has(usrId)) {
          cursorEl.remove();
          cursorLayers.delete(usrId);
        }
      });
    }

    function destroyCollabUI() {
      cursorLayers.forEach(cursorEl => cursorEl.remove());
      cursorLayers.clear();

      if (uiContainer) {
        uiContainer.remove();
        uiContainer = null;
      }

      statusIndicator = null;
      usersPanel = null;

      console.log('[CollaborationUI] Destroyed');
    }

    return {
      initCollabUI,
      destroyCollabUI,
      updateConnectionStatus,
      updateConnectedUsers
    };
  })();

  // ============================================
  // MAIN VRC SYNC API
  // ============================================

  let isEnabled = false;
  let currentRoomId = null;
  let callbacks = {
    onRoomUpdate: null,
    onRedraw: null,
    getRoomObj: null
  };

  function generateUserId() {
    return 'user-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
  }

  function handleRemoteRoomDataChange(remoteRoomData) {
    console.log('[VRCSync] Remote room data change received');

    if (callbacks.onRoomUpdate && callbacks.getRoomObj) {
      const currentRoomObj = callbacks.getRoomObj();
      const updatedRoomObj = SyncIntegration.applyRemoteRoomData(currentRoomObj, remoteRoomData);
      callbacks.onRoomUpdate(updatedRoomObj);

      if (callbacks.onRedraw) {
        callbacks.onRedraw();
      }
    }
  }

  function handleRemoteItemsChange(remoteItems) {
    console.log('[VRCSync] Remote items change received');

    if (callbacks.onRoomUpdate && callbacks.getRoomObj) {
      const currentRoomObj = callbacks.getRoomObj();
      const updatedRoomObj = SyncIntegration.applyRemoteItems(currentRoomObj, remoteItems);
      callbacks.onRoomUpdate(updatedRoomObj);

      if (callbacks.onRedraw) {
        callbacks.onRedraw();
      }
    }
  }

  function handleUsersChange(users) {
    CollaborationUI.updateConnectedUsers(users);
  }

  function handleStatusChange(status) {
    CollaborationUI.updateConnectionStatus(status);
  }

  const VRCSync = {
    /**
     * Enable real-time collaboration.
     * @param {string} roomId - The room ID to collaborate on
     * @param {object} options - Configuration options
     */
    enable: function(roomId, options) {
      options = options || {};

      if (isEnabled) {
        console.log('[VRCSync] Already enabled, disabling first...');
        VRCSync.disable();
      }

      currentRoomId = roomId;
      callbacks.onRoomUpdate = options.onRoomUpdate;
      callbacks.onRedraw = options.onRedraw;
      callbacks.getRoomObj = options.getRoomObj;

      CollaborationUI.initCollabUI();
      CollaborationUI.updateConnectionStatus('connecting');

      SyncIntegration.initSync(roomId, {
        user: options.user || { id: generateUserId(), name: 'User' },
        onRoomDataChange: handleRemoteRoomDataChange,
        onItemsChange: handleRemoteItemsChange,
        onUsersChange: handleUsersChange,
        onStatusChange: handleStatusChange
      });

      isEnabled = true;
      console.log('[VRCSync] Enabled for room:', roomId);
    },

    /**
     * Disable real-time collaboration.
     */
    disable: function() {
      if (!isEnabled) return;

      SyncIntegration.stopSync();
      CollaborationUI.destroyCollabUI();

      isEnabled = false;
      currentRoomId = null;
      callbacks = {
        onRoomUpdate: null,
        onRedraw: null,
        getRoomObj: null
      };

      console.log('[VRCSync] Disabled');
    },

    /**
     * Sync the current roomObj.
     * @param {object} roomObj - The roomObj to sync
     */
    sync: function(roomObj) {
      if (!isEnabled) return;
      SyncIntegration.syncRoomObj(roomObj);
    },

    /**
     * Update cursor position.
     * @param {object} position - { x, y }
     */
    updateCursor: function(position) {
      if (!isEnabled) return;
      SyncIntegration.updateCursor(position);
    },

    /**
     * Update selection.
     * @param {array} selectedIds - Array of selected item IDs
     */
    updateSelection: function(selectedIds) {
      if (!isEnabled) return;
      SyncIntegration.updateSelection(selectedIds);
    },

    /**
     * Check if sync is enabled.
     */
    isEnabled: function() {
      return isEnabled;
    },

    /**
     * Get connection status.
     */
    getStatus: function() {
      return SyncIntegration.getConnectionStatus();
    },

    /**
     * Get connected users.
     */
    getUsers: function() {
      return SyncIntegration.getConnectedUsers();
    }
  };

  // Export to global scope
  global.VRCSync = VRCSync;

})(typeof window !== 'undefined' ? window : this);
