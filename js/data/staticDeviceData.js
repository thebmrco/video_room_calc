/**
 * VRC - Video Room Calculator
 * Static Device Data Provider
 *
 * Default implementation of the CatalogProvider interface using static data.
 * This can be replaced with a REST-based provider for dynamic catalog data.
 */

import { DISPLAY_DEFAULTS } from './deviceCatalog.js';
import {
    PTZ_4K_EXTENDED_REACH,
    PTZ_4K_PRESENTER_TRACK,
    ROOM_VISION_EXTENDED_REACH,
    ROOM_VISION_PRESENTER_TRACK,
    generateRoomBarProMultiLensReach
} from './cameraConeSettings.js';

// ============================================
// PTZ CAMERA CONFIGURATION
// ============================================

const ptzCameraMounts = [
    { stdMount: 'Standard' },
    { flipped: 'Flipped' },
    { flippedPole: 'Flipped & Ceiling Pole' }
];

const ptzCameraRoles = [
    { crossview: 'Cross-View' },
    { extended_reach: 'Extended Speaker View' },
    { presentertrack: 'PresenterTrack' },
    { presentertrack2: 'Manual Camera' }
];

const roomVisionRoles = [
    ...ptzCameraRoles,
    { crossviewPresenterTrack: 'Cross-View & PresenterTrack' }
];

// Use centralized cone settings for PTZ cameras
const ptz4kExtendedReach = PTZ_4K_EXTENDED_REACH;
const ptz4kPresenterTrack = PTZ_4K_PRESENTER_TRACK;
const roomVisionExtendedReach = ROOM_VISION_EXTENDED_REACH;
const roomVisionPresenterTrack = ROOM_VISION_PRESENTER_TRACK;

// ============================================
// VIDEO DEVICES (key starts with A)
// ============================================

const videoDevicesData = [
    { name: "Room Bar", id: 'roomBar', key: 'AB', wideHorizontalFOV: 120, teleHorizontalFOV: 120, onePersonZoom: 2.94, twoPersonDistance: 4.456, topImage: 'roomBar-top.png', frontImage: 'roomBar-front.png', width: 534, depth: 64.4, height: 82, micRadius: 2951, micDeg: 140, speakerRadius: 4500, speakerDeg: 160, cameraShadeOffSet: 20, defaultVert: 930, colors: [{ light: 'First Light' }, { dark: 'Carbon Black' }], workspaceDesigner: { objectType: 'videoDevice', model: 'Room Bar', color: 'light', mount: 'wall', yOffset: 0.032 } },
    { name: "Room Bar Pro", id: 'roomBarPro', key: 'AC', wideHorizontalFOV: 110, teleHorizontalFOV: 44, onePersonDistance: 5.45, twoPersonDistance: 8, topImage: 'roomBarPro-top.png', frontImage: 'roomBarPro-front.png', width: 960, depth: 90, height: 120, micRadius: 4000, micDeg: 100, speakerRadius: 5100, speakerDeg: 140, defaultVert: 900, colors: [{ light: 'First Light' }, { dark: 'Carbon Black' }], workspaceDesigner: { objectType: 'videoDevice', model: 'Room Bar Pro', color: 'light', mount: 'wall', yOffset: 0.045 } },
    { name: 'Room Kit EQX: Wall Mount', id: 'roomKitEqx', key: 'AD', codecParent: "roomKitEqQuadCam", cameraParent: "quadCam", topImage: 'roomKitEqx-top.png', frontImage: 'roomKitEqx-front.png', width: 3362, depth: 152, height: 1230, diagonalInches: 75, defaultVert: 681, colors: null, speakerRadius: 7000, speakerDeg: 140, workspaceDesigner: { objectType: 'videoDevice', model: 'EQX', mount: 'wall', color: 'dark', yOffset: 0.076 } },
    { name: "Room Kit EQ: Quad Camera", key: 'AE', id: 'roomKitEqQuadCam', cameraParent: 'quadCam', topImage: 'quadCam-top.png', frontImage: 'roomKitEqQuadCam-menu.png', workspaceDesigner: { objectType: 'videoDevice', model: 'Room Kit EQ', color: 'light', mount: 'wall', yOffset: 0.051 } },
    { name: "_Kit EQ: Quad Cam Extended (720p)", key: 'AF', id: 'roomKitEqQuadCamExt', cameraParent: 'quadCamExt', workspaceDesigner: { objectType: 'videoDevice', model: 'Room Kit EQ', color: 'light', mount: 'wall', yOffset: 0.051 } },
    { name: "_Room Kit EQ: PTZ 4K Camera", key: 'AG', id: 'roomKitEqPtz4k', cameraParent: 'ptz4k', workspaceDesigner: { objectType: 'camera', model: 'ptz', role: 'crossview', yOffset: 0.205 } },
    { name: "_Room Kit EQ: Quad Cam + PTZ 4K Extended", key: 'AH', id: 'roomKitEqQuadPtz4k', cameraParent: 'quadPtz4kExt', topImage: 'roomKitEqQuadPtz4k-top.png', frontImage: 'roomKitEqQuadPtz4k-front.png', defaultVert: 1900, workspaceDesigner: { objectType: 'videoDevice', model: 'Room Kit EQ' } },
    { name: "Room Kit Pro: Quad Camera", id: 'roomKitProQuadCam', key: 'AI', cameraParent: "quadCam", frontImage: 'roomKitEqQuadCam-menu.png', workspaceDesigner: { objectType: 'videoDevice', model: 'Room Kit Pro', mount: 'wall', color: 'light' } },
    { name: "Board Pro 55*", id: 'boardPro55', key: 'AJ', codecParent: "boardPro75", topImage: 'boardPro55-top.png', frontImage: 'boardPro55-front.png', width: 1278, depth: 92, height: 823, diagonalInches: 55, defaultVert: 974, workspaceDesigner: { objectType: 'videoDevice', model: 'Legacy', mount: 'wall', size: 55, role: 'firstScreen', yOffset: 0.046, scale: [1.4, 7, 0.5] } },
    { name: "Board Pro 75*", id: 'boardPro75', key: 'AK', wideHorizontalFOV: 120, teleHorizontalFOV: 85, onePersonZoom: 2.39, twoPersonZoom: 3.82, topImage: 'boardPro75-top.png', frontImage: 'boardPro75-front.png', width: 1719, depth: 95, height: 1102, diagonalInches: 75, defaultVert: 760, workspaceDesigner: { objectType: 'videoDevice', model: 'Legacy', mount: 'wall', size: 75, role: 'firstScreen', yOffset: 0.0475, scale: [1.8, 9.1, 0.5] } },
    { name: "Board Pro 55 G2: Wall Mount", id: 'brdPro55G2', key: 'AL', codecParent: 'roomBarPro', topImage: 'brdPro55G2-top.png', frontImage: 'brdPro55G2-front.png', width: 1278, depth: 92, height: 823, diagonalInches: 55, micRadius: 4000, micDeg: 100, defaultVert: 970, workspaceDesigner: { objectType: 'videoDevice', model: 'Board Pro', mount: 'wall', size: 55, role: 'firstScreen', yOffset: 0.046 } },
    { name: "Board Pro 75 G2: Wall Mount", id: 'brdPro75G2', key: 'AM', codecParent: 'roomBarPro', topImage: 'brdPro75G2-top.png', frontImage: 'brdPro75G2-front.png', width: 1719, depth: 95, height: 1102, diagonalInches: 75, micRadius: 4000, micDeg: 100, defaultVert: 760, workspaceDesigner: { objectType: 'videoDevice', model: 'Board Pro', mount: 'wall', size: 75, role: 'firstScreen', yOffset: 0.0475 } },
    { name: "Desk [RoomOS]", id: 'webexDesk', key: 'AN', wideHorizontalFOV: 64, teleHorizontalFOV: 64, onePersonZoom: 1, twoPersonZoom: 1, topImage: 'webexDesk-top.png', frontImage: 'webexDesk-front.png', width: 565, depth: 160, height: 474, diagonalInches: 24, defaultVert: 710, micRadius: 1049, micDeg: 140, workspaceDesigner: { objectType: 'videoDevice', model: 'Desk', role: 'singleScreen', yOffset: -0.08 } },
    { name: "Desk Pro", id: 'webexDeskPro', key: 'AO', wideHorizontalFOV: 71, teleHorizontalFOV: 71, onePersonDistance: 1.45, twoPersonDistance: 2.45, topImage: 'webexDeskPro-top.png', frontImage: 'webexDeskPro-front.png', width: 627.7, depth: 169.9, height: 497.8, diagonalInches: 27, cameraShadeOffSet: 40, defaultVert: 710, micRadius: 1049, micDeg: 140, workspaceDesigner: { objectType: 'videoDevice', model: 'Desk Pro', role: 'singleScreen' } },
    { name: "Desk Mini [RoomOS]", id: 'webexDeskMini', key: 'AP', wideHorizontalFOV: 64, teleHorizontalFOV: 64, onePersonZoom: 1, twoPersonZoom: 1, topImage: 'webexDeskMini-top.png', frontImage: 'webexDeskMini-front.png', width: 371, depth: 135, height: 162.5, diagonalInches: 15, cameraShadeOffSet: 30, defaultVert: 710, micRadius: 1049, micDeg: 140, workspaceDesigner: { objectType: 'videoDevice', model: 'Desk Mini', role: 'singleScreen' } },
    { name: "Room 55*", id: 'room55', key: 'AQ', wideHorizontalFOV: 83, teleHorizontalFOV: 83, onePersonZoom: 2.72, twoPersonZoom: 3.99, topImage: 'room55-top.png', frontImage: 'room55-front.png', width: 1245, depth: 775, height: 1593, diagonalInches: 55, displayOffSetY: 370, workspaceDesigner: { objectType: 'videoDevice', model: 'Legacy', scale: [1.5, 12, 0.5] } },
    { name: "Room Kit Mini*", id: 'rmKitMini', key: 'AR', wideHorizontalFOV: 112, teleHorizontalFOV: 112, onePersonZoom: 2.04, twoPersonZoom: 3.41, topImage: 'rmKitMini-top.png', frontImage: 'rmKitMini-front.png', width: 500, depth: 77, height: 80, defaultVert: 710, workspaceDesigner: { objectType: 'videoDevice', model: 'Legacy', scale: [0.55, 0.9, 0.9] } },
    { name: "Room Kit*", id: 'roomKit', key: 'AS', wideHorizontalFOV: 83, teleHorizontalFOV: 83, onePersonZoom: 2.72, twoPersonZoom: 3.99, topImage: 'roomKit-top.png', frontImage: 'roomKit-front.png', width: 700, depth: 88, height: 106, defaultVert: 1200, workspaceDesigner: { objectType: 'videoDevice', model: 'Legacy', scale: [0.75, 0.95, 0.95] } },
    { name: "Virtual Lens Bar Pro", id: 'rmBarProVirtualLens', key: 'AT', codecParent: 'roomBarPro', wideHorizontalFOV: 112, teleHorizontalFOV: 70, onePersonZoom: 4.335, twoPersonZoom: 3.5, defaultVert: 1200, workspaceDesigner: { objectType: 'videoDevice', model: 'Room Bar Pro', yOffset: 0.045 } },
    { name: 'Room Kit EQX: Floor Stand', id: 'roomKitEqxFS', key: 'AU', codecParent: "roomKitEqQuadCam", cameraParent: "quadCam", topImage: 'roomKitEqxFS-top.png', frontImage: 'roomKitEqxFS-front.png', width: 3362, depth: 924, height: 1910, diagonalInches: 75, displayOffSetY: 450, defaultVert: 0, colors: null, speakerRadius: 7000, speakerDeg: 140, workspaceDesigner: { objectType: 'videoDevice', model: 'EQX', mount: 'floor', yOffset: 0.44 } },
    { name: "Board Pro 55 G2: Floor Stand", id: 'brdPro55G2FS', key: 'AV', codecParent: 'roomBarPro', topImage: 'brdPro55G2FS-top.png', frontImage: 'brdPro55G2FS-front.png', width: 1278, depth: 944, height: 1778, diagonalInches: 55, micRadius: 4000, micDeg: 100, displayOffSetY: 420, defaultVert: 0, workspaceDesigner: { objectType: 'videoDevice', model: 'Board Pro', mount: 'floor', size: 55, role: 'firstScreen', yOffset: 0.475 } },
    { name: "Board Pro 75 G2: Floor Stand", id: 'brdPro75G2FS', key: 'AW', codecParent: 'roomBarPro', topImage: 'brdPro75G2FS-top.png', frontImage: 'brdPro75G2FS-front.png', width: 1719, depth: 926, height: 1866, diagonalInches: 75, micRadius: 4000, micDeg: 100, displayOffSetY: 420, defaultVert: 0, workspaceDesigner: { objectType: 'videoDevice', model: 'Board Pro', mount: 'floor', size: 75, role: 'firstScreen', yOffset: 0.475 } },
    { name: 'Room Kit EQX: Wall Stand', id: 'roomKitEqxWS', key: 'AX', codecParent: "roomKitEqQuadCam", cameraParent: "quadCam", topImage: 'roomKitEqx-top.png', frontImage: 'roomKitEqx-front.png', width: 3362, depth: 152, height: 1892, diagonalInches: 75, defaultVert: 0, colors: null, speakerRadius: 7000, speakerDeg: 140, workspaceDesigner: { objectType: 'videoDevice', model: 'EQX', mount: 'wallstand', yOffset: 0.062 } },
    { name: "Board Pro 75 G2: Wheel Stand", id: 'brdPro75G2Wheel', key: 'AY', codecParent: 'roomBarPro', topImage: 'brdPro75G2Wheel-top.png', frontImage: 'brdPro75G2FS-front.png', width: 1719, depth: 950, height: 1905, diagonalInches: 75, micRadius: 4000, micDeg: 100, displayOffSetY: 420, defaultVert: 0, workspaceDesigner: { objectType: 'videoDevice', model: 'Board Pro', mount: 'wheelstand', size: 75, role: 'firstScreen', yOffset: 0.475 } },
    { name: "Board Pro 55 G2: Wheel Stand", id: 'brdPro55G2Wheel', key: 'AZ', codecParent: 'roomBarPro', topImage: 'brdPro55G2FS-top.png', frontImage: 'brdPro55G2FS-front.png', width: 1278, depth: 944, height: 1778, diagonalInches: 55, micRadius: 4000, micDeg: 100, displayOffSetY: 420, defaultVert: 0, workspaceDesigner: { objectType: 'videoDevice', model: 'Board Pro', mount: 'wheelstand', size: 55, role: 'firstScreen', yOffset: 0.475 } },
    { name: "Board Pro 55 G2: Wall Stand", id: 'brdPro55G2WS', key: 'BA', codecParent: 'roomBarPro', topImage: 'brdPro55G2-top.png', frontImage: 'brdPro55G2-front.png', width: 1278, depth: 92, height: 823, diagonalInches: 55, micRadius: 4000, micDeg: 100, defaultVert: 0, workspaceDesigner: { objectType: 'videoDevice', model: 'Board Pro', mount: 'wallstand', size: 55, role: 'firstScreen', yOffset: 0.046 } },
    { name: "Board Pro 75 G2: Wall Stand", id: 'brdPro75G2WS', key: 'BB', codecParent: 'roomBarPro', topImage: 'brdPro75G2-top.png', frontImage: 'brdPro75G2-front.png', width: 1719, depth: 95, height: 1102, diagonalInches: 75, micRadius: 4000, micDeg: 100, defaultVert: 0, workspaceDesigner: { objectType: 'videoDevice', model: 'Board Pro', mount: 'wallstand', size: 75, role: 'firstScreen', yOffset: 0.0475 } },
    { name: "Room Bar BYOD", id: 'roomBarByod', key: 'BC', wideHorizontalFOV: 120, teleHorizontalFOV: 120, onePersonZoom: 2.94, twoPersonDistance: 4.456, topImage: 'roomBar-top.png', frontImage: 'roomBar-front.png', width: 534, depth: 64.4, height: 82, micRadius: 2951, micDeg: 140, speakerRadius: 4500, speakerDeg: 160, cameraShadeOffSet: 20, defaultVert: 930, colors: [{ light: 'First Light' }, { dark: 'Carbon Black' }], workspaceDesigner: { objectType: 'videoDevice', model: 'Room Bar BYOD', color: 'light', mount: 'wall', yOffset: 0.032 } },
];

// ============================================
// CAMERAS (key starts with C)
// ============================================

const camerasData = [
    { name: "Precision 60 Camera*", id: 'cameraP60', key: 'CA', wideHorizontalFOV: 83, teleHorizontalFOV: 83, onePersonZoom: 20, twoPersonZoom: 20, topImage: 'cameraP60-top.png', frontImage: 'cameraP60-front.png', width: 268.1, depth: 162.5, height: 151.9, cameraShadeOffSet: 40, displayOffSetY: 35, defaultVert: 1900, workspaceDesigner: { objectType: 'videoDevice', model: 'Legacy', scale: [0.25, 1.5, 1] } },
    { name: "_PTZ 4K Camera*", id: 'ptz4k', key: 'CB', wideHorizontalFOV: 70, teleHorizontalFOV: 70, onePersonZoom: 2.4, twoPersonZoom: 3, topImage: 'ptz4k-top.png', frontImage: 'ptz4k-front.png', width: 158.4, depth: 200.2, height: 177.5, cameraShadeOffSet: 50, displayOffSetY: 60, defaultVert: 1900, mounts: ptzCameraMounts, roles: ptzCameraRoles, extended_reach: ptz4kExtendedReach, presentertrack: ptz4kPresenterTrack, presentertrack2: ptz4kPresenterTrack, rolesDialog: 'How do you want to use the camera?', workspaceDesigner: { objectType: 'camera', model: 'ptz', role: 'extended_reach', yOffset: 0.183 } },
    { name: "Quad Camera", id: 'quadCam', key: 'CC', wideHorizontalFOV: 83, teleHorizontalFOV: 50, onePersonDistance: 5.96, twoPersonDistance: 10.96, teleFullWidth: true, topImage: 'quadCam-top.png', frontImage: 'quadCam-front.png', width: 950, depth: 102.5, height: 120, defaultVert: 890, colors: [{ light: 'First Light' }, { dark: 'Carbon Black' }], speakerRadius: 4000, speakerDeg: 140, workspaceDesigner: { objectType: 'camera', model: 'quad', role: 'crossview', yOffset: 0.076 } },
    { name: "_Quad Cam Extended (720p)", id: 'quadCamExt', key: 'CD', wideHorizontalFOV: 83, teleHorizontalFOV: 50, onePersonZoom: 4, twoPersonZoom: 4, teleFullWidth: true, topImage: 'quadCamExt-top.png', frontImage: 'quadCamExt-front.png', width: 950, depth: 102.5, height: 120, defaultVert: 890, colors: [{ light: 'First Light' }, { dark: 'Carbon Black' }], workspaceDesigner: { objectType: 'camera', model: 'quad', role: 'crossview', yOffset: 0.076 } },
    { name: "_Quad Cam + PTZ 4K Extended*", id: 'quadPtz4kExt', key: 'CE', wideHorizontalFOV: 83, teleHorizontalFOV: 50, onePersonZoom: 2.64, twoPersonZoom: 5, teleFullWidth: true, topImage: 'quadPtz4kExt-top.png', frontImage: 'quadPtz4kExt-front.png', width: 950, depth: 200.2, height: 177.5, displayOffSetY: 60, defaultVert: 1900, workspaceDesigner: { objectType: 'camera', model: 'quad', role: 'crossview', yOffset: 0.076 } },
    { name: "_Room Vision PTZ", id: 'ptzVision', key: 'CF', wideHorizontalFOV: 80, teleHorizontalFOV: 80, onePersonDistance: 5, twoPersonDistance: 10, topImage: 'ptzVision-top.png', frontImage: 'ptzVision-menu.png', width: 165, depth: 248, height: 193, cameraShadeOffSet: 34, defaultVert: 1900, mounts: ptzCameraMounts, roles: ptzCameraRoles, colors: [{ light: 'First Light' }, { dark: 'Carbon Black' }], extended_reach: roomVisionExtendedReach, presentertrack: roomVisionPresenterTrack, presentertrack2: roomVisionPresenterTrack, rolesDialog: 'How do you want to use the camera?', workspaceDesigner: { objectType: 'camera', model: 'vision', role: 'extended_reach', yOffset: 0.121 } },
    { name: "_PTZ 4K & Bracket", id: 'ptz4kMount', key: 'CG', wideHorizontalFOV: 70, teleHorizontalFOV: 70, onePersonZoom: 2.4, twoPersonZoom: 3, topImage: 'ptz4kMount-top.png', frontImage: 'ptz4kMount-menu.png', width: 158.4, depth: 290, height: 177.5, cameraShadeOffSet: 50, displayOffSetY: 60, defaultVert: 1900, mounts: ptzCameraMounts, roles: ptzCameraRoles, extended_reach: ptz4kExtendedReach, presentertrack: ptz4kPresenterTrack, presentertrack2: ptz4kPresenterTrack, rolesDialog: 'How do you want to use the camera?', workspaceDesigner: { objectType: 'camera', model: 'ptz', role: 'extended_reach', yOffset: 0.144 } },
    { name: "Room Vision PTZ Cam & Bracket", id: 'ptzVision2', key: 'CH', wideHorizontalFOV: 80, teleHorizontalFOV: 80, onePersonDistance: 5, twoPersonDistance: 10, topImage: 'ptzVision-top.png', frontImage: 'ptzVision-menu.png', width: 165, depth: 248, height: 193, cameraShadeOffSet: 34, defaultVert: 1900, mounts: ptzCameraMounts, roles: roomVisionRoles, colors: [{ light: 'First Light' }, { dark: 'Carbon Black' }], extended_reach: roomVisionExtendedReach, presentertrack: roomVisionPresenterTrack, presentertrack2: roomVisionPresenterTrack, rolesDialog: 'How do you want to use the camera?', workspaceDesigner: { objectType: 'camera', model: 'vision', role: 'extended_reach', yOffset: 0.121 } },
    { name: "PTZ 4K Cam & Bracket", id: 'ptz4kMount2', key: 'CI', wideHorizontalFOV: 70, teleHorizontalFOV: 70, onePersonZoom: 2.4, twoPersonZoom: 3, topImage: 'ptz4kMount-top.png', frontImage: 'ptz4kMount-menu.png', width: 158.4, depth: 290, height: 177.5, cameraShadeOffSet: 50, displayOffSetY: 60, defaultVert: 1900, mounts: ptzCameraMounts, roles: ptzCameraRoles, extended_reach: ptz4kExtendedReach, presentertrack: ptz4kPresenterTrack, presentertrack2: ptz4kPresenterTrack, rolesDialog: 'How do you want to use the camera?', workspaceDesigner: { objectType: 'camera', model: 'ptz', role: 'extended_reach', yOffset: 0.144 } },
];

// ============================================
// MICROPHONES & NAVIGATORS (key starts with M)
// ============================================

const microphonesData = [
    { name: "Table Microphone", id: "tableMic", key: "MB", micRadius: 1000, micDeg: 360, topImage: 'tableMic-top.png', frontImage: 'tableMic-front.png', width: 63.9, depth: 63.9, height: 10.9, defaultVert: 710, workspaceDesigner: { objectType: 'microphone', model: 'Table Mic' } },
    { name: "Table Microphone Pro", id: "tableMicPro", key: "MC", micRadius: 1500, micDeg: 360, topImage: 'tableMicPro-top.png', frontImage: 'tableMicPro-front.png', width: 98, depth: 98, height: 29, defaultVert: 710, colors: [{ light: 'First Light' }, { dark: 'Carbon Black' }], workspaceDesigner: { objectType: 'microphone', model: 'Table Mic Pro' } },
    { name: "Ceiling Microphone", id: "ceilingMic", key: "MD", micRadius: 4200, micDeg: 180, topImage: 'ceilingMic-top.png', frontImage: 'ceilingMic-front.png', width: 750, depth: 550, height: 270, defaultVert: 2500, workspaceDesigner: { objectType: 'microphone', model: 'Ceiling Mic', yOffset: 0.275 } },
    { name: "Ceiling Microphone Pro", id: "ceilingMicPro", key: "MA", micRadius: 3500, micDeg: 360, topImage: 'ceilingMicPro-top.png', frontImage: 'ceilingMicPro-front.png', width: 420, depth: 420, height: 48, defaultVert: 2500, colors: [{ light: 'First Light' }, { dark: 'Carbon Black' }], mounts: [{ ceilingMount: 'Wired Hanging Mount' }, { ceilingBracket: 'Ceiling Bracket Mount' }, { dropCeilingGrid: 'Drop Ceiling Grid Mount' }], workspaceDesigner: { objectType: 'microphone', model: 'Ceiling Mic Pro', color: 'light' } },
    // Ceiling mount pole - virtual construct for workspace export
    { name: "_Ceiling Mount", id: "ceilingMount", workspaceDesigner: { objectType: 'ceilingMount' } },
    { name: "Table Navigator", id: "navigatorTable", key: "ME", topImage: 'navigatorTable-top.png', frontImage: 'navigatorTable-menu.png', width: 242, depth: 163, height: 96, defaultVert: 710, roles: [{ navigator: 'Navigator' }, { scheduler: 'Scheduler' }], colors: [{ light: 'First Light' }, { dark: 'Carbon Black' }], workspaceDesigner: { objectType: 'navigator', role: 'navigator', yOffset: 0.0400 } },
    { name: "Wall Navigator", id: "navigatorWall", key: "MF", topImage: 'navigatorWall-top.png', frontImage: 'navigatorWall-menu.png', width: 242, depth: 115, height: 164, defaultVert: 1100, roles: [{ scheduler: 'Scheduler' }, { navigator: 'Navigator' }], colors: [{ light: 'First Light' }, { dark: 'Carbon Black' }], workspaceDesigner: { objectType: 'scheduler', role: 'scheduler', yOffset: 0.0575 } },
    { name: "Laptop", id: "laptop", key: "MG", topImage: 'laptop-top.png', frontImage: 'laptop-menu.png', width: 340, depth: 260, height: 164, defaultVert: 720, roles: [{ firstMonitor: 'First Monitor' }, { secondMonitor: 'Second Monitor' }], workspaceDesigner: { objectType: 'laptop', role: 'laptop', yOffset: 0.12 } },
    { name: "_Phone (unknown)", id: "phoneUnknown", key: "MH", topImage: 'phone9861-top.png', frontImage: 'phone9861-top.png', width: 210, depth: 190, height: 160, defaultVert: 720, workspaceDesigner: { objectType: 'phone', role: 'phone', yOffset: -0.1, xOffset: -0.04 } },
    { name: "Phone 9841", id: "phone9841", key: "MI", topImage: 'phone9861-top.png', frontImage: 'phone9861-top.png', width: 210, depth: 190, height: 160, defaultVert: 720, colors: [{ dark: 'Carbon Black' }, { light: 'First Light' }], workspaceDesigner: { objectType: 'phone', model: '9841', role: 'phone', yOffset: -0.1, xOffset: -0.04 } },
    { name: "Phone 9851", id: "phone9851", key: "MJ", topImage: 'phone9861-top.png', frontImage: 'phone9861-top.png', width: 210, depth: 190, height: 160, defaultVert: 720, colors: [{ dark: 'Carbon Black' }, { light: 'First Light' }], workspaceDesigner: { objectType: 'phone', model: '9851', role: 'phone', yOffset: -0.1, xOffset: -0.04 } },
    { name: "Phone 9861", id: "phone9861", key: "MK", topImage: 'phone9861-top.png', frontImage: 'phone9861-top.png', width: 210, depth: 190, height: 160, defaultVert: 720, colors: [{ dark: 'Carbon Black' }, { light: 'First Light' }], workspaceDesigner: { objectType: 'phone', model: '9861', role: 'phone', yOffset: -0.1, xOffset: -0.04 } },
    { name: "Phone 9871", id: "phone9871", key: "ML", topImage: 'phone9861-top.png', frontImage: 'phone9871-menu.png', width: 210, depth: 190, height: 160, defaultVert: 720, colors: [{ dark: 'Carbon Black' }, { light: 'First Light' }], workspaceDesigner: { objectType: 'phone', model: '9871', role: 'phone', yOffset: -0.1, xOffset: -0.04 } },
    { name: "_Cable Lid", id: "shareCableLid", key: "MM", topImage: 'shareCableUsbc-top.png', frontImage: 'shareCableUsbc-top.png', width: 500, depth: 685, height: 10, defaultVert: 720 },
    { name: "Desk Camera 4K (webcam)", id: "webcam4k", key: "MN", topImage: 'webcam-top.png', frontImage: 'webcam4k-menu.png', width: 92, depth: 67, height: 73, defaultVert: 1180, workspaceDesigner: { objectType: 'webcam', model: '4k' } },
    { name: "B&O Cisco 980", id: "headset980", key: "MO", topImage: 'headset-top.png', frontImage: 'headset980-menu.png', width: 175, depth: 175, height: 73, defaultVert: 720, workspaceDesigner: { objectType: 'headset', model: '980' } },
    { name: "B&O Cisco 950", id: "headset950", key: "MP", topImage: 'headset-top.png', frontImage: 'headset-top.png', width: 175, depth: 175, height: 73, defaultVert: 720, workspaceDesigner: { objectType: 'headset', model: '950' } },
    { name: "Headset 730", id: "headset730", key: "MQ", topImage: 'headset-top.png', frontImage: 'headset-top.png', width: 175, depth: 175, height: 73, defaultVert: 720, workspaceDesigner: { objectType: 'headset', model: '730' } },
    { name: "Headset 720", id: "headset720", key: "MR", topImage: 'headset-top.png', frontImage: 'headset-top.png', width: 175, depth: 175, height: 73, defaultVert: 720, workspaceDesigner: { objectType: 'headset', model: '720' } },
    { name: "Headset 560", id: "headset560", key: "MS", topImage: 'headset-top.png', frontImage: 'headset-top.png', width: 175, depth: 175, height: 73, defaultVert: 720, workspaceDesigner: { objectType: 'headset', model: '560' } },
    { name: "Headset 530", id: "headset530", key: "MT", topImage: 'headset-top.png', frontImage: 'headset-top.png', width: 175, depth: 175, height: 73, defaultVert: 720, workspaceDesigner: { objectType: 'headset', model: '530', yOffset: -0.08 } },
    { name: "Headset 320", id: "headset320", key: "MU", topImage: 'headset-top.png', frontImage: 'headset-top.png', width: 175, depth: 175, height: 73, defaultVert: 720, workspaceDesigner: { objectType: 'headset', model: '320', yOffset: -0.08 } },
    { name: "Keyboard", id: "keyboard", key: "MV", topImage: 'keyboard-top.png', frontImage: 'keyboard-menu.png', width: 360, depth: 130, height: 13, defaultVert: 720, workspaceDesigner: { objectType: 'keyboard' } },
    { name: "Ceiling Projector", id: "projector", key: "MW", topImage: 'projector-top.png', frontImage: 'projector-menu.png', width: 580, depth: 680, height: 200, defaultVert: 2500, workspaceDesigner: { objectType: 'projector' } },
    { name: "Ceiling Speaker Round**", id: "speaker", key: "MX", topImage: 'tblPodium-menu.png', frontImage: 'tblPodium-menu.png', width: 500, depth: 500, height: 10, defaultVert: 2500, speakerRadius: 1500, speakerDeg: 360 },
    { name: "Desk Camera 1080p (webcam)", id: "webcam1080p", key: "MY", topImage: 'webcam-top.png', frontImage: 'webcam4k-menu.png', width: 92, depth: 67, height: 73, defaultVert: 1180, workspaceDesigner: { objectType: 'webcam', model: '1080p' } },
];

// ============================================
// TABLES & WALLS (key starts with T or W)
// ============================================

const tablesData = [
    { name: 'Table Rect (round corners)', id: 'tblRect', key: 'TA', frontImage: 'tblRect-front.png', family: 'resizeItem', resizeable: ['width', 'depth', 'vheight'], workspaceDesigner: { objectType: 'table', model: 'regular' } },
    { name: 'Table Ellipse', id: 'tblEllip', key: 'TB', frontImage: 'tblEllip-front.png', family: 'resizeItem', resizeable: ['width', 'depth', 'vheight'], workspaceDesigner: { objectType: 'table', model: 'round' } },
    { name: 'Table Tapered (trapezoid)', id: 'tblTrap', key: 'TC', frontImage: 'tblTrap-front.png', family: 'resizeItem', resizeable: ['width', 'depth', 'vheight'], workspaceDesigner: { objectType: 'table', model: 'tapered' } },
    { name: 'Table U-Shaped', id: 'tblShapeU', key: 'TD', frontImage: 'tblShapeU-menu.png', family: 'tableBox', resizeable: ['width', 'depth', 'vheight'], workspaceDesigner: { objectType: 'table', model: 'ushape' } },
    { name: 'Desk', id: 'tblSchoolDesk', key: 'TE', depth: 590, frontImage: 'tblSchoolDesk-menu.png', family: 'resizeItem', resizeable: ['width', 'vheight'], workspaceDesigner: { objectType: 'table', model: 'schooldesk' } },
    { name: 'Podium, round', id: 'tblPodium', key: 'TF', frontImage: 'tblPodium-menu.png', family: 'resizeItem', resizeable: ['width', 'vheight'], workspaceDesigner: { objectType: 'table', model: 'podium' } },
    { name: 'Wall Standard (10 cm / 3.9")', id: 'wallStd', key: 'WA', frontImage: 'wallStd-front.png', family: 'wallBox', resizeable: ['depth', 'vheight'], workspaceDesigner: { objectType: 'wall' } },
    { name: 'Glass Wall', id: 'wallGlass', key: 'WB', frontImage: 'wallGlass-front.png', family: 'wallBox', resizeable: ['depth', 'vheight'], workspaceDesigner: { objectType: 'wall', model: 'glass', length: 0.03, opacity: '0.3' } },
    { name: 'Column', id: 'columnRect', key: 'WC', frontImage: 'columnRect-front.png', family: 'wallBox', resizeable: ['width', 'depth', 'vheight'], workspaceDesigner: { objectType: 'wall', color: '#808080' } },
    { name: 'Wall with Windows', id: 'wallWindow', key: 'WE', frontImage: 'wallWindow-front.png', topImage: 'wallWindow-top.png', family: 'wallBox', resizeable: ['depth', 'vheight'], workspaceDesigner: { objectType: 'wall', model: 'window' } },
    { name: 'Row of Chairs', id: 'wallChairs', key: 'WF', topImage: 'chair-top.png', frontImage: 'wallChairs-menu.png', family: 'resizeItem', resizeable: ['depth'] },
    { name: 'Table Curved', id: 'tblCurved', key: 'WG', frontImage: 'tblCurved-menu.png', family: 'resizeItem', resizeable: [], workspaceDesigner: { objectType: 'tableCurved', yOffset: 0.263 } },
    { name: 'Couch', id: 'couch', key: 'WH', frontImage: 'couch-menu.png', family: 'resizeItem', resizeable: ['depth'], workspaceDesigner: { objectType: 'couch', xOffset: -0.05 } },
    { name: 'Unknown Resizeable Workspace* Designer Object*', id: 'tblUnknownObj', key: 'WI', frontImage: 'tblUnknownObj-menu.png', family: 'resizeItem', stroke: 'purple', strokeWidth: 3, dash: [4, 4], resizeable: ['width', 'depth', 'vheight'], workspaceDesigner: {} },
    { name: 'Sphere', id: 'sphere', key: 'WJ', frontImage: 'sphere-menu.png', family: 'resizeItem', stroke: 'black', strokeWidth: 0.5, resizeable: [], workspaceDesigner: { objectType: 'sphere' } },
    { name: 'Column / Cylinder', id: 'cylinder', key: 'WK', frontImage: 'cylinder-menu.png', family: 'resizeItem', stroke: 'black', strokeWidth: 1, opacity: 0.4, resizeable: [], workspaceDesigner: { objectType: 'cylinder' } },
    { name: 'Custom Path Shape', id: 'pathShape', key: 'WL', frontImage: 'pathShape-menu.png', strokeWidth: 0.02, resizeable: [], workspaceDesigner: { objectType: 'shape' } },
];

// ============================================
// CHAIRS, DOORS & PEOPLE (key starts with S or U)
// ============================================

const chairsData = [
    { name: "Chair", id: "chair", key: "SA", topImage: 'chair-top.png', frontImage: 'chair-front.png', width: 640, depth: 640, opacity: 0.7, workspaceDesigner: { objectType: 'chair' } },
    { name: "Person Standing (woman)", id: "personStanding", key: "SC", topImage: 'person-top.png', frontImage: 'person-front.png', width: 640, depth: 640, opacity: 1, workspaceDesigner: { objectType: 'person', model: 'woman-standing' } },
    { name: "Door Right (thin frame)**", id: "doorRight", key: "SB", topImage: 'doorRight-top.png', frontImage: 'doorRight-menu.png', width: 1117, depth: 1016, opacity: 1, workspaceDesigner: { objectType: 'door', yOffset: -0.47, scale: [1, 1, 1] } },
    { name: "Door Left (thin frame)**", id: "doorLeft", key: "SD", topImage: 'doorLeft-top.png', frontImage: 'doorLeft-menu.png', width: 1117, depth: 1016, opacity: 1, workspaceDesigner: { objectType: 'door', yOffset: -0.47, scale: [-1, 1, 1] } },
    { name: "Double Door (thin frame)**", id: "doorDouble", key: "SE", topImage: 'doorDouble-top.png', frontImage: 'doorDouble-menu.png', width: 2134, depth: 1004, opacity: 1, workspaceDesigner: { objectType: 'door', scale: [1, 1, 1] } },
    { name: "Plant", id: "plant", key: "SF", topImage: 'plant.png', frontImage: 'plant.png', width: 640, depth: 640, opacity: 1, workspaceDesigner: { objectType: 'plant', scale: [1, 1, 1] } },
    { name: "Wheelchair", id: "wheelchair", key: "SG", topImage: 'wheelchair-top.png', frontImage: 'wheelchair-menu.png', width: 665, depth: 1050, opacity: 0.6, workspaceDesigner: { objectType: 'person', model: 'woman-sitting-wheelchair' } },
    { name: 'Wheelchair turn cycle (150cm/60")', id: 'wheelchairTurnCycle', key: "SH", topImage: 'wheelchairTurnCycle-top.png', frontImage: 'wheelchairTurnCycle-menu.png', width: 1500, depth: 1500, opacity: 0.65, workspaceDesigner: { objectType: 'person', model: 'woman-sitting-wheelchair' } },
    { name: "Circulation space (120cm/4')", id: 'circulationSpace', key: "SI", topImage: 'circulationSpace-top.png', frontImage: 'circulationSpace-menu.png', width: 1200, depth: 1200, opacity: 0.8, workspaceDesigner: { objectType: 'box', opacity: '0.5', color: '#8FDBCE', height: 0.02, length: 1.2, width: 1.2 } },
    { name: "Pouf (round stool)", id: 'pouf', key: 'SJ', width: 440, depth: 440, frontImage: 'tblPodium-menu.png', topImage: 'pouf-top.png', workspaceDesigner: { objectType: 'pouf' } },
    { name: "Door Right", id: "doorRight2", key: "SK", topImage: 'doorRight-top.png', frontImage: 'doorRight-menu.png', width: 1117, depth: 1016, opacity: 1, workspaceDesigner: { objectType: 'door', yOffset: -0.47, scale: [1, 1, 2] } },
    { name: "Door Left", id: "doorLeft2", key: "SL", topImage: 'doorLeft-top.png', frontImage: 'doorLeft-menu.png', width: 1117, depth: 1016, opacity: 1, workspaceDesigner: { objectType: 'door', yOffset: -0.47, scale: [-1, 1, 2] } },
    { name: "Double Door", id: "doorDouble2", key: "SM", topImage: 'doorDouble-top.png', frontImage: 'doorDouble-menu.png', width: 2134, depth: 1004, opacity: 1, workspaceDesigner: { objectType: 'door', scale: [1, 1, 2] } },
    { name: "Door Right (part of double)**", id: "doorDoubleRight", key: "SN", topImage: 'doorRight-top.png', frontImage: 'doorRight-menu.png', width: 1059, depth: 1016, opacity: 1, workspaceDesigner: { objectType: 'door', scale: [1, 1, 1] } },
    { name: "Door Left (part of double)**", id: "doorDoubleLeft", key: "SO", topImage: 'doorLeft-top.png', frontImage: 'doorLeft-menu.png', width: 1059, depth: 1016, opacity: 1, workspaceDesigner: { objectType: 'door', scale: [-1, 1, 1] } },
    { name: "Unknown Workspace Designer* Object*", id: "unknownObj", key: "SP", topImage: 'unknownObj-top.png', frontImage: 'unknownObj-menu.png', width: 350, depth: 350, opacity: 0.6, workspaceDesigner: {} },
    { name: "_Switch (cable map)", id: "switch", key: "SQ", topImage: 'switch-top.png', frontImage: 'switch-top.png', width: 720, depth: 300, opacity: 0.8, roles: [{ ceiling: 'ceiling' }, { table: 'table' }], workspaceDesigner: { objectType: 'switch' } },
    { name: "_Codec (cable map)", id: "codec", key: "SR", topImage: 'codec-top.png', frontImage: 'codec-top.png', width: 720, depth: 300, opacity: 0.8, workspaceDesigner: { objectType: 'codec' } },
    { name: "Person Standing (man)", id: "personStandingMan", key: "SS", topImage: 'person-top.png', frontImage: 'person-front.png', width: 640, depth: 640, opacity: 1, workspaceDesigner: { objectType: 'person', model: 'man-standing-pen' } },
    { name: 'PC Monitor 27"', id: 'displayMonitor', key: 'ST', frontImage: 'displayMonitor-menu.png', topImage: 'displayMonitor-top.png', width: 615, depth: 35, height: 450, defaultVert: 710, roles: [{ firstMonitor: 'First Monitor' }, { secondMonitor: 'Second Monitor' }], workspaceDesigner: { objectType: 'monitor' } },
    { name: "USB-C Cable", id: "shareCableUsbc", key: "SU", topImage: 'shareCableUsbc-top.png', frontImage: 'shareCableUsbc-menu.png', width: 499, depth: 499, height: 10, defaultVert: 710, workspaceDesigner: { objectType: 'sharelid', shareSettings: { hdmi: 0, usbc: 1, multihead: 0 } } },
    { name: "HDMI Cable", id: "shareCableHdmi", key: "SV", topImage: 'shareCableHdmi-top.png', frontImage: 'shareCableHdmi-menu.png', width: 499, depth: 499, height: 10, defaultVert: 710, workspaceDesigner: { objectType: 'sharelid', shareSettings: { hdmi: 1, usbc: 0, multihead: 0 } } },
    { name: "Multi-Head Cable", id: "shareCableMulti", key: "SW", topImage: 'shareCableMulti-top.png', frontImage: 'shareCableMulti-menu.png', width: 499, depth: 499, height: 10, defaultVert: 710, workspaceDesigner: { objectType: 'sharelid', shareSettings: { hdmi: 0, usbc: 0, multihead: 1 } } },
    { name: "Swivel Chair", id: "chairSwivel", key: "SX", topImage: 'chairSwivel-top.png', frontImage: 'chairSwivel-top.png', width: 640, depth: 640, opacity: 0.7, workspaceDesigner: { objectType: 'chair', model: 'swivel' } },
    { name: "USB-C & HDMI", id: "shareCableUsbcHdmi", key: "SY", topImage: 'shareCableUsbcHdmi-top.png', frontImage: 'shareCableUsbcHdmi-top.png', width: 499, depth: 499, height: 10, defaultVert: 710, workspaceDesigner: { objectType: 'sharelid', shareSettings: { hdmi: 1, usbc: 1, multihead: 0 } } },
    { name: "USB-C & Multi-Head", id: "shareCableUsbcMulti", key: "SZ", topImage: 'shareCableUsbcMulti-top.png', frontImage: 'shareCableUsbcMulti-top.png', width: 499, depth: 499, height: 10, defaultVert: 710, workspaceDesigner: { objectType: 'sharelid', shareSettings: { hdmi: 0, usbc: 1, multihead: 1 } } },
    { name: "HDMI & Multi-Head", id: "shareCableHdmiMulti", key: "UA", topImage: 'shareCableHdmiMulti-top.png', frontImage: 'shareCableHdmiMulti-top.png', width: 499, depth: 499, height: 10, defaultVert: 710, workspaceDesigner: { objectType: 'sharelid', shareSettings: { hdmi: 1, usbc: 0, multihead: 1 } } },
    { name: "HDMI & USB-C & Multi-Head", id: "shareCableUsbcHdmiMulti", key: "UB", topImage: 'shareCableUsbcHdmiMulti-top.png', frontImage: 'shareCableUsbcHdmiMulti-top.png', width: 499, depth: 683, height: 10, defaultVert: 710, workspaceDesigner: { objectType: 'sharelid', shareSettings: { hdmi: 1, usbc: 1, multihead: 1 } } },
    { name: "Mouse", id: "mouse", key: "UC", topImage: 'mouse-top.png', frontImage: 'mouse-menu.png', width: 45, depth: 85, height: 33, defaultVert: 730, workspaceDesigner: { objectType: 'mouse' } },
    { name: "Stool Chair", id: "chairHigh", key: "UD", topImage: 'chairHigh-top.png', frontImage: 'chairHigh-top.png', width: 640, depth: 640, opacity: 0.7, workspaceDesigner: { objectType: 'chair', model: 'high' } },
    { name: "Codec-Room Kit Pro**", id: "codecPro", key: "UE", topImage: 'codec-top.png', frontImage: 'codec-top.png', width: 720, depth: 300, opacity: 0.8, workspaceDesigner: { objectType: 'codec', model: 'Room Kit Pro' } },
    { name: "Codec-Room Kit EQ**", id: "codecEQ", key: "UF", topImage: 'codec-top.png', frontImage: 'codec-top.png', width: 720, depth: 300, opacity: 0.8, workspaceDesigner: { objectType: 'codec', model: 'Room Kit EQ' } },
    { name: "Codec-Room Kit EQX**", id: "codecEQX", key: "UG", topImage: 'codec-top.png', frontImage: 'codec-top.png', width: 720, depth: 300, opacity: 0.8, workspaceDesigner: { objectType: 'codec', model: 'EQX' } },
    { name: "Switch Catalyst 9200CX series**", id: "switchC9200CX", key: "UH", topImage: 'switch-top.png', frontImage: 'switch-top.png', width: 720, depth: 300, opacity: 0.8, roles: [{ ceiling: 'ceiling' }, { table: 'table' }], workspaceDesigner: { objectType: 'switch', model: 'Catalyst 9200CX Series' } },
    { name: "Switch Catalyst 1200 series**", id: "switchC1200", key: "UI", topImage: 'switch-top.png', frontImage: 'switch-top.png', width: 720, depth: 300, opacity: 0.8, roles: [{ ceiling: 'ceiling' }, { table: 'table' }], workspaceDesigner: { objectType: 'switch', model: 'Catalyst 1200 Series' } },
    { name: "Christmas Tree**", id: "tree", key: "UJ", topImage: 'tree.png', frontImage: 'tree.png', width: 800, depth: 800, opacity: 1, workspaceDesigner: { objectType: 'tree', scale: [0.533, 0.533, 0.533] } },
];

// ============================================
// DISPLAYS (key starts with D)
// ============================================

// Use defaults from DISPLAY_DEFAULTS
const { displayWidth, displayHeight, displayDepth, diagonalInches,
    displayWidth21_9, displayHeight21_9, displayDepth21_9, diagonalInches21_9 } = DISPLAY_DEFAULTS;

const displaysData = [
    { name: 'Single Display', id: 'displaySngl', key: 'DA', frontImage: 'displaySngl-front.png', topImage: 'displaySngl-top.png', width: displayWidth * 1, depth: displayDepth, height: displayHeight, diagonalInches: diagonalInches, defaultVert: 1010, roles: [{ 'singleScreen': 'Single Screen' }, { 'firstScreen': 'First Screen' }, { 'secondScreen': 'Second Screen' }, { 'thirdScreen': 'PresenterTrack Display' }], workspaceDesigner: { objectType: 'screen', yOffset: 0.045 } },
    { name: 'Dual Displays', id: 'displayDbl', key: 'DB', frontImage: 'displayDbl-front.png', topImage: 'displayDbl-top.png', width: displayWidth * 2, depth: displayDepth, height: displayHeight, diagonalInches: diagonalInches, defaultVert: 1010, workspaceDesigner: { objectType: 'screen', yOffset: 0.045 } },
    { name: 'Triple Displays', id: 'displayTrpl', key: 'DC', frontImage: 'displayTrpl-front.png', topImage: 'displayTrpl-top.png', width: displayWidth * 3, depth: displayDepth, height: displayHeight, diagonalInches: diagonalInches, defaultVert: 1010, workspaceDesigner: { objectType: 'screen', yOffset: 0.045 } },
    { name: 'Single 21:9 (MTR Only) display', id: 'display21_9', key: 'DD', frontImage: 'display21_9-front.png', topImage: 'displaySngl-top.png', width: displayWidth21_9, depth: displayDepth21_9, height: displayHeight21_9, diagonalInches: diagonalInches21_9, defaultVert: 1010, workspaceDesigner: { objectType: 'screen', aspect: '21:9', yOffset: 0.045 } },
    { name: 'Projector Screen', id: 'displayScreen', key: 'DE', frontImage: 'displayScreen-menu.png', topImage: 'displayScreen-top.png', width: displayWidth * 2, depth: displayDepth * 0.7, height: displayHeight & 2, diagonalInches: diagonalInches * 2, defaultVert: 1010, roles: [{ 'singleScreen': 'Single Screen' }, { 'firstScreen': 'First Screen' }, { 'secondScreen': 'Second Screen' }, { 'thirdScreen': 'PresenterTrack Display' }], workspaceDesigner: { objectType: 'screen', model: 'canvas', yOffset: 0.02 } },
];

// ============================================
// STAGE FLOORS (key starts with F)
// ============================================

const stageFloorsData = [
    { name: 'Stage Floor (Box)', id: 'stageFloor', key: 'FA', frontImage: 'box-front.png', family: 'wallBox', stroke: 'black', strokeWidth: 2, dash: [4, 8], resizeable: ['width', 'depth', 'vheight'], workspaceDesigner: { objectType: 'box', idRegex: '(^stage$)|(^step-)' } },
    { name: 'Carpet*', id: 'carpet', key: 'FB', frontImage: 'box-front.png', family: 'wallBox', stroke: 'grey', strokeWidth: 4, dash: [8, 3], resizeable: ['width', 'depth', 'vheight'], workspaceDesigner: { objectType: 'carpet', color: '#aaa' } },
];

// ============================================
// BOXES (key starts with W)
// ============================================

const boxesData = [
    { name: 'Box', id: 'box', key: 'WD', frontImage: 'box-front.png', family: 'wallBox', stroke: 'black', strokeWidth: 2, dash: [7, 5], resizeable: ['width', 'depth', 'vheight'], workspaceDesigner: { objectType: 'box' } },
    { name: 'Wall Builder - Multiple walls', id: 'wallBuilder', key: 'ZX', frontImage: 'wallBuilder-menu.png', strokeWidth: 1, resizeable: [] },
];

// ============================================
// ROOMS (key starts with Z)
// ============================================

const roomsData = [
    { name: 'Irregular Room (polyRoom) Experimental**', id: 'polyRoom', key: 'ZY', frontImage: 'pathShape-menu.png', strokeWidth: 1, fill: 'lightblue', resizeable: [] },
    { name: 'Room Part (Experimental)**', id: 'boxRoomPart', key: 'ZZ', frontImage: 'box-front.png', family: 'wallBox', stroke: 'darkgrey', strokeWidth: 3, fill: 'lightblue', resizeable: ['width', 'depth', 'vheight'] },
];

// ============================================
// MULTI-LENS REACH CONFIGURATION
// ============================================

/**
 * Add multiLensReach configuration to Room Bar Pro.
 * This is applied during expansion.
 * Uses the centralized generateRoomBarProMultiLensReach function.
 */
function addMultiLensReach(videoDevices) {
    const roomBarPro = videoDevices.find(d => d.id === 'roomBarPro');
    if (roomBarPro) {
        roomBarPro.multiLensReach = generateRoomBarProMultiLensReach(
            roomBarPro.wideHorizontalFOV,
            roomBarPro.teleHorizontalFOV
        );
    }
}

// ============================================
// VIDEO DEVICE EXPANSION
// ============================================

/**
 * Expand video devices array by merging camera attributes.
 * Each videoDevice can have a codecParent and a cameraParent.
 * If the parent device has an attribute missing on the child device, it is added.
 * cameraParent is applied before the codecParent.
 */
function expandVideoDeviceArray(videoDevices, cameras) {
    // Merge cameras into videoDevices
    const expanded = [...videoDevices, ...cameras];

    // Apply camera parent attributes
    expanded.forEach((primaryDevice, index) => {
        if ("cameraParent" in primaryDevice) {
            const parentDevice = expanded.find(d => d.id === primaryDevice.cameraParent);
            if (parentDevice) {
                expanded[index] = { ...parentDevice, ...primaryDevice };
            }
        }
    });

    // Apply codec parent attributes
    expanded.forEach((primaryDevice, index) => {
        if ("codecParent" in primaryDevice) {
            const parentDevice = expanded.find(d => d.id === primaryDevice.codecParent);
            if (parentDevice) {
                expanded[index] = { ...parentDevice, ...primaryDevice };
            }
        }
    });

    // Mark camera-only devices
    expanded.forEach((primaryDevice, index) => {
        if (cameras.some(camera => camera.id === primaryDevice.id)) {
            expanded[index].cameraOnly = true;
        }
    });

    return expanded;
}

// ============================================
// STATIC CATALOG PROVIDER
// ============================================

/**
 * Static catalog provider implementation.
 * Provides device data from static arrays.
 */
const StaticDeviceProvider = {
    getVideoDevices() {
        const videoDevices = structuredClone(videoDevicesData);
        const cameras = structuredClone(camerasData);
        addMultiLensReach(videoDevices);
        return expandVideoDeviceArray(videoDevices, cameras);
    },

    getCameras() {
        return structuredClone(camerasData);
    },

    getMicrophones() {
        return structuredClone(microphonesData);
    },

    getSpeakers() {
        // Speakers are included in microphones array (e.g., ceiling speaker)
        return [];
    },

    getTouchpanels() {
        // Touchpanels (navigators) are included in microphones array
        return [];
    },

    getTables() {
        return structuredClone(tablesData);
    },

    getChairs() {
        return structuredClone(chairsData);
    },

    getDisplays() {
        return structuredClone(displaysData);
    },

    getStageFloors() {
        return structuredClone(stageFloorsData);
    },

    getBoxes() {
        return structuredClone(boxesData);
    },

    getRooms() {
        return structuredClone(roomsData);
    },

    getDisplayDefaults() {
        return DISPLAY_DEFAULTS;
    }
};

export default StaticDeviceProvider;

// Also export individual data arrays for backwards compatibility
export {
    videoDevicesData,
    camerasData,
    microphonesData,
    tablesData,
    chairsData,
    displaysData,
    stageFloorsData,
    boxesData,
    roomsData,
    ptzCameraMounts,
    ptzCameraRoles,
    roomVisionRoles,
    expandVideoDeviceArray
};
