/**
 * VRC - Video Room Calculator
 * Data Module Index
 *
 * Re-exports all data modules for easier importing.
 */

export { default as DeviceCatalog, DISPLAY_DEFAULTS } from './deviceCatalog.js';
export { default as StaticDeviceProvider } from './staticDeviceData.js';

// Camera cone settings - centralized FOV and coverage data
export {
    default as CameraConeSettings,
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
} from './cameraConeSettings.js';

// Re-export workspace designer helpers from DeviceCatalog
export { default as deviceCatalog } from './deviceCatalog.js';

// For backwards compatibility, create a workspaceKey proxy that uses DeviceCatalog
import DeviceCatalog from './deviceCatalog.js';
export const getWorkspaceDesigner = DeviceCatalog.getWorkspaceDesigner;
export const setWorkspaceDesigner = DeviceCatalog.setWorkspaceDesigner;
