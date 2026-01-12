/**
 * VRC - Video Room Calculator
 * Collaboration UI Module
 *
 * Provides UI components for real-time collaboration:
 * - Connection status indicator
 * - Connected users display
 * - Remote cursor visualization
 */

// ============================================
// STATE
// ============================================
let uiContainer = null;
let statusIndicator = null;
let usersPanel = null;
let cursorLayers = new Map(); // userId -> cursor element

// User colors for avatars and cursors
const USER_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#85C1E9', '#F8B500', '#00CED1'
];

// ============================================
// STYLES
// ============================================
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

.vrc-remote-selection {
  position: absolute;
  pointer-events: none;
  border: 2px dashed currentColor;
  border-radius: 4px;
  opacity: 0.5;
}
`;

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize the collaboration UI.
 * @param {HTMLElement} container - Container element (optional, defaults to body)
 */
export function initCollabUI(container = document.body) {
  // Inject styles
  if (!document.getElementById('vrc-collab-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'vrc-collab-styles';
    styleEl.textContent = STYLES;
    document.head.appendChild(styleEl);
  }

  // Create UI container
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

  // Get references
  statusIndicator = uiContainer.querySelector('#vrc-collab-status');
  usersPanel = uiContainer.querySelector('#vrc-collab-users-panel');

  // Set up click handler for expanding users panel
  statusIndicator.addEventListener('click', () => {
    usersPanel.classList.toggle('expanded');
  });

  console.log('[CollaborationUI] Initialized');
}

// ============================================
// STATUS UPDATES
// ============================================

/**
 * Update the connection status display.
 * @param {string} status - 'connected', 'connecting', or 'disconnected'
 */
export function updateConnectionStatus(status) {
  if (!uiContainer) return;

  const dot = uiContainer.querySelector('#vrc-collab-status-dot');
  const text = uiContainer.querySelector('#vrc-collab-status-text');

  // Remove all status classes
  dot.classList.remove('connected', 'connecting', 'disconnected');
  dot.classList.add(status);

  // Update text
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

/**
 * Update the connected users display.
 * @param {array} users - Array of user objects { user: { id, name }, isLocal, cursor, selection }
 */
export function updateConnectedUsers(users) {
  if (!uiContainer) return;

  const countEl = uiContainer.querySelector('#vrc-collab-users-count');
  const listEl = uiContainer.querySelector('#vrc-collab-users-list');

  countEl.textContent = users.length;

  // Clear current list
  listEl.innerHTML = '';

  // Add each user
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

  // Update remote cursors
  updateRemoteCursors(users.filter(u => !u.isLocal));
}

// ============================================
// REMOTE CURSORS
// ============================================

/**
 * Update remote cursor positions on the canvas.
 * @param {array} remoteUsers - Array of remote user data with cursor positions
 */
function updateRemoteCursors(remoteUsers) {
  // Get the canvas container
  const canvasContainer = document.getElementById('canvasDiv') || document.getElementById('scroll-container');
  if (!canvasContainer) return;

  // Track which users we've seen
  const seenUserIds = new Set();

  remoteUsers.forEach(userData => {
    const user = userData.user;
    if (!user || !userData.cursor) return;

    seenUserIds.add(user.id);

    let cursorEl = cursorLayers.get(user.id);

    if (!cursorEl) {
      // Create new cursor element
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

    // Update position
    cursorEl.style.transform = `translate(${userData.cursor.x}px, ${userData.cursor.y}px)`;
    cursorEl.style.display = 'block';
  });

  // Remove cursors for users who are no longer connected
  cursorLayers.forEach((cursorEl, usrId) => {
    if (!seenUserIds.has(usrId)) {
      cursorEl.remove();
      cursorLayers.delete(usrId);
    }
  });
}

/**
 * Show a remote selection highlight.
 * @param {string} userId - The user ID
 * @param {array} selectedIds - Array of selected item IDs
 * @param {function} getItemBounds - Function to get item bounds by ID
 */
export function showRemoteSelection(userId, selectedIds, getItemBounds) {
  // Implementation would depend on how items are rendered in VRC
  // This is a placeholder for future enhancement
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get a consistent color for a user based on their ID.
 */
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

/**
 * Get initials from a name.
 */
function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Escape HTML to prevent XSS.
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================
// CLEANUP
// ============================================

/**
 * Remove the collaboration UI.
 */
export function destroyCollabUI() {
  // Remove all cursor elements
  cursorLayers.forEach(cursorEl => cursorEl.remove());
  cursorLayers.clear();

  // Remove UI container
  if (uiContainer) {
    uiContainer.remove();
    uiContainer = null;
  }

  statusIndicator = null;
  usersPanel = null;

  console.log('[CollaborationUI] Destroyed');
}

// ============================================
// EXPORTS
// ============================================
export default {
  initCollabUI,
  destroyCollabUI,
  updateConnectionStatus,
  updateConnectedUsers,
  showRemoteSelection
};
