/**
 * VRC - Video Room Calculator
 * Camera Cone Settings Module
 *
 * Extracts and centralizes camera field-of-view (FOV) and cone settings
 * for all camera-enabled products.
 *
 * Camera Cone Properties:
 * - wideHorizontalFOV: Wide-angle horizontal field of view in degrees
 * - teleHorizontalFOV: Telephoto horizontal field of view in degrees
 * - onePersonDistance: Distance for optimal single person framing (meters)
 * - twoPersonDistance: Distance for optimal two person framing (meters)
 * - onePersonZoom: Zoom multiplier for single person framing
 * - twoPersonZoom: Zoom multiplier for two person framing
 * - teleFullWidth: If true, combined tele angle equals wide FOV
 * - multiLensReach: Array of lens configurations for multi-lens cameras
 */

// ============================================
// PTZ CAMERA ROLE-BASED CONE SETTINGS
// ============================================

/**
 * PTZ 4K Camera extended reach role settings.
 * Used when PTZ 4K is configured for extended speaker view.
 */
export const PTZ_4K_EXTENDED_REACH = {
    wideHorizontalFOV: 33,
    teleHorizontalFOV: 33,
    onePersonDistance: 8,
    twoPersonDistance: 18
};

/**
 * PTZ 4K Camera presenter track role settings.
 * Used for PresenterTrack and Manual Camera modes.
 */
export const PTZ_4K_PRESENTER_TRACK = {
    wideHorizontalFOV: 33,
    teleHorizontalFOV: 33,
    onePersonDistance: 8,
    twoPersonDistance: 16
};

/**
 * Room Vision PTZ extended reach role settings.
 */
export const ROOM_VISION_EXTENDED_REACH = {
    wideHorizontalFOV: 33,
    teleHorizontalFOV: 33,
    onePersonDistance: 13,
    twoPersonDistance: 26
};

/**
 * Room Vision PTZ presenter track role settings.
 */
export const ROOM_VISION_PRESENTER_TRACK = {
    wideHorizontalFOV: 80,
    teleHorizontalFOV: 80,
    onePersonDistance: 10,
    twoPersonDistance: 22
};

// ============================================
// VIDEO DEVICE CAMERA CONE SETTINGS
// ============================================

/**
 * Room Bar camera cone settings.
 */
export const ROOM_BAR_CONE = {
    id: 'roomBar',
    name: 'Room Bar',
    wideHorizontalFOV: 120,
    teleHorizontalFOV: 120,
    onePersonZoom: 2.94,
    twoPersonDistance: 4.456
};

/**
 * Room Bar Pro camera cone settings.
 * Features multi-lens reach for extended coverage.
 */
export const ROOM_BAR_PRO_CONE = {
    id: 'roomBarPro',
    name: 'Room Bar Pro',
    wideHorizontalFOV: 110,
    teleHorizontalFOV: 44,
    onePersonDistance: 5.45,
    twoPersonDistance: 8
};

/**
 * Room Bar BYOD camera cone settings.
 * Same optical settings as Room Bar.
 */
export const ROOM_BAR_BYOD_CONE = {
    id: 'roomBarByod',
    name: 'Room Bar BYOD',
    wideHorizontalFOV: 120,
    teleHorizontalFOV: 120,
    onePersonZoom: 2.94,
    twoPersonDistance: 4.456
};

/**
 * Board Pro 75 camera cone settings.
 * Board Pro 55 inherits from Board Pro 75.
 */
export const BOARD_PRO_75_CONE = {
    id: 'boardPro75',
    name: 'Board Pro 75',
    wideHorizontalFOV: 120,
    teleHorizontalFOV: 85,
    onePersonZoom: 2.39,
    twoPersonZoom: 3.82
};

/**
 * Virtual Lens Bar Pro camera cone settings.
 * Modified optics from Room Bar Pro.
 */
export const VIRTUAL_LENS_BAR_PRO_CONE = {
    id: 'rmBarProVirtualLens',
    name: 'Virtual Lens Bar Pro',
    wideHorizontalFOV: 112,
    teleHorizontalFOV: 70,
    onePersonZoom: 4.335,
    twoPersonZoom: 3.5
};

/**
 * Webex Desk camera cone settings.
 */
export const DESK_CONE = {
    id: 'webexDesk',
    name: 'Desk [RoomOS]',
    wideHorizontalFOV: 64,
    teleHorizontalFOV: 64,
    onePersonZoom: 1,
    twoPersonZoom: 1
};

/**
 * Webex Desk Pro camera cone settings.
 */
export const DESK_PRO_CONE = {
    id: 'webexDeskPro',
    name: 'Desk Pro',
    wideHorizontalFOV: 71,
    teleHorizontalFOV: 71,
    onePersonDistance: 1.45,
    twoPersonDistance: 2.45
};

/**
 * Webex Desk Mini camera cone settings.
 */
export const DESK_MINI_CONE = {
    id: 'webexDeskMini',
    name: 'Desk Mini [RoomOS]',
    wideHorizontalFOV: 64,
    teleHorizontalFOV: 64,
    onePersonZoom: 1,
    twoPersonZoom: 1
};

/**
 * Room 55 camera cone settings (legacy).
 */
export const ROOM_55_CONE = {
    id: 'room55',
    name: 'Room 55',
    wideHorizontalFOV: 83,
    teleHorizontalFOV: 83,
    onePersonZoom: 2.72,
    twoPersonZoom: 3.99
};

/**
 * Room Kit Mini camera cone settings (legacy).
 */
export const ROOM_KIT_MINI_CONE = {
    id: 'rmKitMini',
    name: 'Room Kit Mini',
    wideHorizontalFOV: 112,
    teleHorizontalFOV: 112,
    onePersonZoom: 2.04,
    twoPersonZoom: 3.41
};

/**
 * Room Kit camera cone settings (legacy).
 */
export const ROOM_KIT_CONE = {
    id: 'roomKit',
    name: 'Room Kit',
    wideHorizontalFOV: 83,
    teleHorizontalFOV: 83,
    onePersonZoom: 2.72,
    twoPersonZoom: 3.99
};

// ============================================
// STANDALONE CAMERA CONE SETTINGS
// ============================================

/**
 * Precision 60 Camera cone settings (legacy).
 */
export const PRECISION_60_CONE = {
    id: 'cameraP60',
    name: 'Precision 60 Camera',
    wideHorizontalFOV: 83,
    teleHorizontalFOV: 83,
    onePersonZoom: 20,
    twoPersonZoom: 20
};

/**
 * PTZ 4K Camera cone settings (base/cross-view mode).
 */
export const PTZ_4K_CONE = {
    id: 'ptz4k',
    name: 'PTZ 4K Camera',
    wideHorizontalFOV: 70,
    teleHorizontalFOV: 70,
    onePersonZoom: 2.4,
    twoPersonZoom: 3
};

/**
 * Quad Camera cone settings.
 */
export const QUAD_CAMERA_CONE = {
    id: 'quadCam',
    name: 'Quad Camera',
    wideHorizontalFOV: 83,
    teleHorizontalFOV: 50,
    onePersonDistance: 5.96,
    twoPersonDistance: 10.96,
    teleFullWidth: true
};

/**
 * Quad Cam Extended (720p) cone settings.
 */
export const QUAD_CAM_EXTENDED_CONE = {
    id: 'quadCamExt',
    name: 'Quad Cam Extended (720p)',
    wideHorizontalFOV: 83,
    teleHorizontalFOV: 50,
    onePersonZoom: 4,
    twoPersonZoom: 4,
    teleFullWidth: true
};

/**
 * Quad Cam + PTZ 4K Extended cone settings.
 */
export const QUAD_PTZ_4K_EXTENDED_CONE = {
    id: 'quadPtz4kExt',
    name: 'Quad Cam + PTZ 4K Extended',
    wideHorizontalFOV: 83,
    teleHorizontalFOV: 50,
    onePersonZoom: 2.64,
    twoPersonZoom: 5,
    teleFullWidth: true
};

/**
 * Room Vision PTZ camera cone settings (base/cross-view mode).
 */
export const ROOM_VISION_PTZ_CONE = {
    id: 'ptzVision',
    name: 'Room Vision PTZ',
    wideHorizontalFOV: 80,
    teleHorizontalFOV: 80,
    onePersonDistance: 5,
    twoPersonDistance: 10
};

// ============================================
// MULTI-LENS REACH CONFIGURATION
// ============================================

/**
 * Generate multi-lens reach configuration for Room Bar Pro.
 * The reach zones extend the camera's coverage beyond the main cone.
 *
 * @param {number} wideHorizontalFOV - Wide FOV in degrees
 * @param {number} teleHorizontalFOV - Tele FOV in degrees
 * @returns {Array} Array of lens reach configurations
 */
export function generateRoomBarProMultiLensReach(wideHorizontalFOV = 110, teleHorizontalFOV = 44) {
    return [
        {
            rotation: teleHorizontalFOV / 2 + 90,
            teleAngle: 13,
            onePersonDistance: 2.5,
            twoPersonDistance: 6.85
        },
        {
            rotation: (180 - wideHorizontalFOV) / 2 + ((wideHorizontalFOV - teleHorizontalFOV) / 2) - 13,
            teleAngle: 13,
            onePersonDistance: 2.5,
            twoPersonDistance: 6.85
        },
        {
            rotation: teleHorizontalFOV / 2 + 90 + 13,
            teleAngle: 20,
            onePersonDistance: 1.4,
            twoPersonDistance: 4
        },
        {
            rotation: (180 - wideHorizontalFOV) / 2,
            teleAngle: 20,
            onePersonDistance: 1.4,
            twoPersonDistance: 4
        }
    ];
}

// ============================================
// CAMERA CONE COLLECTIONS
// ============================================

/**
 * All video device camera cone settings.
 * These are integrated products with built-in cameras.
 */
export const VIDEO_DEVICE_CONES = {
    roomBar: ROOM_BAR_CONE,
    roomBarPro: ROOM_BAR_PRO_CONE,
    roomBarByod: ROOM_BAR_BYOD_CONE,
    boardPro75: BOARD_PRO_75_CONE,
    rmBarProVirtualLens: VIRTUAL_LENS_BAR_PRO_CONE,
    webexDesk: DESK_CONE,
    webexDeskPro: DESK_PRO_CONE,
    webexDeskMini: DESK_MINI_CONE,
    room55: ROOM_55_CONE,
    rmKitMini: ROOM_KIT_MINI_CONE,
    roomKit: ROOM_KIT_CONE
};

/**
 * All standalone camera cone settings.
 */
export const CAMERA_CONES = {
    cameraP60: PRECISION_60_CONE,
    ptz4k: PTZ_4K_CONE,
    quadCam: QUAD_CAMERA_CONE,
    quadCamExt: QUAD_CAM_EXTENDED_CONE,
    quadPtz4kExt: QUAD_PTZ_4K_EXTENDED_CONE,
    ptzVision: ROOM_VISION_PTZ_CONE
};

/**
 * PTZ camera role configurations.
 * Maps role names to their cone settings.
 */
export const PTZ_ROLE_CONES = {
    ptz4k: {
        extended_reach: PTZ_4K_EXTENDED_REACH,
        presentertrack: PTZ_4K_PRESENTER_TRACK,
        presentertrack2: PTZ_4K_PRESENTER_TRACK
    },
    ptzVision: {
        extended_reach: ROOM_VISION_EXTENDED_REACH,
        presentertrack: ROOM_VISION_PRESENTER_TRACK,
        presentertrack2: ROOM_VISION_PRESENTER_TRACK
    }
};

/**
 * All camera cone settings combined.
 */
export const ALL_CAMERA_CONES = {
    ...VIDEO_DEVICE_CONES,
    ...CAMERA_CONES
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get camera cone settings by device ID.
 *
 * @param {string} deviceId - Device ID
 * @returns {Object|null} Camera cone settings or null if not found
 */
export function getConeSettingsById(deviceId) {
    return ALL_CAMERA_CONES[deviceId] || null;
}

/**
 * Get PTZ role-based cone settings.
 *
 * @param {string} cameraId - Camera ID (ptz4k or ptzVision)
 * @param {string} role - Role name (extended_reach, presentertrack, presentertrack2)
 * @returns {Object|null} Role-specific cone settings or null
 */
export function getPtzRoleConeSettings(cameraId, role) {
    return PTZ_ROLE_CONES[cameraId]?.[role] || null;
}

/**
 * Check if a device has camera cone settings.
 *
 * @param {string} deviceId - Device ID
 * @returns {boolean} True if device has camera cone settings
 */
export function hasConeSettings(deviceId) {
    return deviceId in ALL_CAMERA_CONES;
}

/**
 * Get all device IDs with camera cone settings.
 *
 * @returns {string[]} Array of device IDs
 */
export function getAllConeDeviceIds() {
    return Object.keys(ALL_CAMERA_CONES);
}

/**
 * Apply camera cone settings to a device object.
 * Merges cone settings into the device, preserving existing properties.
 *
 * @param {Object} device - Device object to enhance
 * @param {string} [coneId] - Optional specific cone ID to apply (defaults to device.id)
 * @returns {Object} Device with cone settings applied
 */
export function applyConeSettings(device, coneId) {
    const cone = getConeSettingsById(coneId || device.id);
    if (!cone) {
        return device;
    }

    // Extract only the FOV-related properties (exclude id and name)
    const { id, name, ...coneSettings } = cone;

    return {
        ...coneSettings,
        ...device
    };
}

// ============================================
// DEFAULT EXPORT
// ============================================

export default {
    // Individual cone settings
    ROOM_BAR_CONE,
    ROOM_BAR_PRO_CONE,
    ROOM_BAR_BYOD_CONE,
    BOARD_PRO_75_CONE,
    VIRTUAL_LENS_BAR_PRO_CONE,
    DESK_CONE,
    DESK_PRO_CONE,
    DESK_MINI_CONE,
    ROOM_55_CONE,
    ROOM_KIT_MINI_CONE,
    ROOM_KIT_CONE,
    PRECISION_60_CONE,
    PTZ_4K_CONE,
    QUAD_CAMERA_CONE,
    QUAD_CAM_EXTENDED_CONE,
    QUAD_PTZ_4K_EXTENDED_CONE,
    ROOM_VISION_PTZ_CONE,

    // PTZ role settings
    PTZ_4K_EXTENDED_REACH,
    PTZ_4K_PRESENTER_TRACK,
    ROOM_VISION_EXTENDED_REACH,
    ROOM_VISION_PRESENTER_TRACK,

    // Collections
    VIDEO_DEVICE_CONES,
    CAMERA_CONES,
    PTZ_ROLE_CONES,
    ALL_CAMERA_CONES,

    // Functions
    generateRoomBarProMultiLensReach,
    getConeSettingsById,
    getPtzRoleConeSettings,
    hasConeSettings,
    getAllConeDeviceIds,
    applyConeSettings
};
