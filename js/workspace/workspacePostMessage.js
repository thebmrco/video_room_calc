/**
 * VRC - Video Room Calculator
 * Workspace Designer PostMessage Communication Module
 *
 * Handles cross-origin communication between VRC and Workspace Designer
 * (designer.cisco.com / webex.com workspace designer).
 *
 * Messages SENT to Workspace Designer:
 * - roomdesigner.plan: Complete room configuration (dimensions, items, surfaces)
 * - roomdesigner.settings: Unit preference (meter/foot)
 * - roomdesigner.theme: Visual theme (standard, christmas, etc.)
 *
 * Messages RECEIVED from Workspace Designer:
 * - hideNewRoomDialog: Boolean to control dialog visibility
 * - loadRoom: String template name to load
 */

import { WORKSPACE_URLS } from '../core/constants.js';

// ============================================
// CONSTANTS
// ============================================

/**
 * Allowed origins for receiving postMessage events.
 * Messages from other origins are ignored for security.
 */
export const ALLOWED_ORIGINS = {
    CISCO_WEBEX_REGEX: /https:\/\/.*(\.cisco|\.webex|)\.com$/,
    COLLAB_EXPERIENCE: 'https://collabexperience.com',
    LOCALHOST: 'http://127.0.0.1'
};

/**
 * Default Workspace Designer URLs
 */
export const WORKSPACE_DESIGNER_URLS = {
    PRODUCTION: WORKSPACE_URLS.DEFAULT,
    TEST: WORKSPACE_URLS.TEST
};

/**
 * Initial message send delays (ms) for window initialization.
 * Messages are sent multiple times to handle slow page loads.
 */
export const INIT_MESSAGE_DELAYS = [1000, 3000, 5000];

// ============================================
// WORKSPACE POSTMESSAGE MANAGER
// ============================================

/**
 * Manages postMessage communication with Workspace Designer.
 * Handles sending room configurations and receiving commands.
 */
export class WorkspacePostMessageManager {
    constructor() {
        /** @type {Window|null} Popup window reference */
        this.workspaceWindow = null;

        /** @type {HTMLIFrameElement|null} iFrame element reference */
        this.iFrameWorkspaceWindow = null;

        /** @type {boolean} Whether iFrame mode is enabled */
        this.testiFrame = false;

        /** @type {boolean} Whether iFrame has been initialized */
        this.testiFrameInitialized = false;

        /** @type {boolean} Whether to suppress new room dialog */
        this.hideNewRoomDialog = false;

        /** @type {Function|null} Callback for loadRoom command */
        this.onLoadRoom = null;

        /** @type {Function|null} Callback for hideNewRoomDialog change */
        this.onHideNewRoomDialogChange = null;

        /** @type {Function|null} Function to get room export data */
        this.getExportData = null;

        /** @type {Function|null} Function to get room unit */
        this.getRoomUnit = null;

        /** @type {Function|null} Function to get workspace theme */
        this.getWorkspaceTheme = null;

        // Bind the message handler
        this._handleMessage = this._handleMessage.bind(this);
    }

    /**
     * Initialize the message listener.
     * Should be called once when the application starts.
     */
    init() {
        window.addEventListener('message', this._handleMessage, false);
    }

    /**
     * Clean up the message listener.
     */
    destroy() {
        window.removeEventListener('message', this._handleMessage, false);
    }

    /**
     * Configure callbacks for message handling.
     * @param {Object} callbacks - Callback configuration
     * @param {Function} [callbacks.onLoadRoom] - Called when loadRoom command received
     * @param {Function} [callbacks.onHideNewRoomDialogChange] - Called when hideNewRoomDialog changes
     * @param {Function} [callbacks.getExportData] - Returns room export data for messages
     * @param {Function} [callbacks.getRoomUnit] - Returns current room unit ('feet' or 'meters')
     * @param {Function} [callbacks.getWorkspaceTheme] - Returns workspace theme
     */
    configure(callbacks) {
        if (callbacks.onLoadRoom) this.onLoadRoom = callbacks.onLoadRoom;
        if (callbacks.onHideNewRoomDialogChange) this.onHideNewRoomDialogChange = callbacks.onHideNewRoomDialogChange;
        if (callbacks.getExportData) this.getExportData = callbacks.getExportData;
        if (callbacks.getRoomUnit) this.getRoomUnit = callbacks.getRoomUnit;
        if (callbacks.getWorkspaceTheme) this.getWorkspaceTheme = callbacks.getWorkspaceTheme;
    }

    /**
     * Set the popup workspace window reference.
     * @param {Window} win - The popup window object
     */
    setWorkspaceWindow(win) {
        this.workspaceWindow = win;
    }

    /**
     * Set the iFrame workspace window reference.
     * @param {HTMLIFrameElement} iframe - The iframe element
     */
    setIFrameWorkspaceWindow(iframe) {
        this.iFrameWorkspaceWindow = iframe;
    }

    /**
     * Enable or disable iFrame mode.
     * @param {boolean} enabled - Whether iFrame mode is enabled
     */
    setTestiFrame(enabled) {
        this.testiFrame = enabled;
    }

    /**
     * Mark iFrame as initialized.
     * @param {boolean} initialized - Whether iFrame is initialized
     */
    setTestiFrameInitialized(initialized) {
        this.testiFrameInitialized = initialized;
    }

    /**
     * Check if an origin is allowed to send messages.
     * @param {string} origin - The message origin
     * @returns {boolean} Whether the origin is allowed
     */
    isOriginAllowed(origin) {
        return (
            ALLOWED_ORIGINS.CISCO_WEBEX_REGEX.test(origin) ||
            origin.startsWith(ALLOWED_ORIGINS.COLLAB_EXPERIENCE) ||
            origin.startsWith(ALLOWED_ORIGINS.LOCALHOST)
        );
    }

    /**
     * Build the message payload for Workspace Designer.
     * @returns {Object} The message payload
     */
    buildMessage() {
        let unit = 'meter';
        const roomUnit = this.getRoomUnit ? this.getRoomUnit() : 'meters';

        if (roomUnit === 'feet') {
            unit = 'foot';
        }

        const exportData = this.getExportData ? this.getExportData() : {};
        const theme = this.getWorkspaceTheme ? this.getWorkspaceTheme() : 'standard';

        const message = {
            roomdesigner: {
                plan: exportData,
                settings: { unit: unit }
            }
        };

        message.roomdesigner.plan.theme = theme;

        // Additional settings that can be enabled:
        // message.roomdesigner.settings.roomView = 'farEnd'; // overview | farEnd | tableEnd | above | cameraCoverage | micCoverage | displayCoverage | accessibility | cables
        // message.roomdesigner.settings.occupancy = 'medium';  // empty | medium | full

        return message;
    }

    /**
     * Send room configuration to Workspace Designer.
     * Sends to both popup window and iFrame if configured.
     */
    postMessage() {
        if (!this.getExportData) {
            console.warn('WorkspacePostMessage: getExportData not configured');
            return;
        }

        const message = this.buildMessage();

        if (this.workspaceWindow) {
            this.workspaceWindow.postMessage(message, '*');
        }

        if (this.testiFrame && this.testiFrameInitialized && this.iFrameWorkspaceWindow) {
            this.iFrameWorkspaceWindow.contentWindow.postMessage(message, '*');
        }
    }

    /**
     * Send initial messages with delays for window initialization.
     * Sends messages at 1s, 3s, and 5s to handle slow page loads.
     */
    sendInitialMessages() {
        INIT_MESSAGE_DELAYS.forEach(delay => {
            setTimeout(() => {
                this.postMessage();
            }, delay);
        });
    }

    /**
     * Handle incoming postMessage events.
     * @param {MessageEvent} event - The message event
     * @private
     */
    _handleMessage(event) {
        if (!this.isOriginAllowed(event.origin)) {
            return;
        }

        console.info('message received postMessage() back: ', event.data);

        // Handle commands from parent iframe
        if (event.data && typeof event.data === 'object') {
            // Control hideNewRoomDialog setting
            if ('hideNewRoomDialog' in event.data) {
                this.hideNewRoomDialog = !!event.data.hideNewRoomDialog;
                console.info('hideNewRoomDialog set to:', this.hideNewRoomDialog);

                if (this.onHideNewRoomDialogChange) {
                    this.onHideNewRoomDialogChange(this.hideNewRoomDialog);
                }
            }

            // Load a room from postMessage
            if (event.data.loadRoom && typeof event.data.loadRoom === 'string') {
                if (this.onLoadRoom) {
                    this.onLoadRoom(event.data.loadRoom);
                    console.info('Room loaded from postMessage');
                } else {
                    console.warn('WorkspacePostMessage: onLoadRoom callback not configured');
                }
            }
        }
    }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

/**
 * Singleton instance of WorkspacePostMessageManager.
 * Use this for global access to the postMessage functionality.
 */
export const workspacePostMessage = new WorkspacePostMessageManager();

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Determine the appropriate Workspace Designer URL based on current site.
 * @param {string} [currentOrigin] - Current site origin (defaults to window.location.origin)
 * @param {string} [currentPathname] - Current site pathname (defaults to window.location.pathname)
 * @param {string} [testUrl] - Optional custom test URL override
 * @returns {string} The Workspace Designer URL to use
 */
export function getWorkspaceDesignerUrl(currentOrigin, currentPathname, testUrl) {
    const origin = currentOrigin || (typeof window !== 'undefined' ? window.location.origin : '');
    const pathname = currentPathname || (typeof window !== 'undefined' ? window.location.pathname : '');
    const currentSite = origin + pathname;

    // Use custom test URL if provided
    if (testUrl) {
        return testUrl;
    }

    // Production site uses production URL
    if (currentSite === 'https://collabexperience.com/') {
        return WORKSPACE_DESIGNER_URLS.PRODUCTION;
    }

    // All other sites use test URL
    return WORKSPACE_DESIGNER_URLS.TEST;
}

// ============================================
// GLOBAL EXPORT
// ============================================

if (typeof window !== 'undefined') {
    window.VRC_WorkspacePostMessage = {
        WorkspacePostMessageManager,
        workspacePostMessage,
        getWorkspaceDesignerUrl,
        ALLOWED_ORIGINS,
        WORKSPACE_DESIGNER_URLS,
        INIT_MESSAGE_DELAYS
    };
}
