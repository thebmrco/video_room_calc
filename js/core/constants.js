/**
 * VRC - Video Room Calculator
 * Constants and Configuration
 *
 * Centralized constants, magic strings, and configuration values
 * extracted from roomcalc.js for better maintainability.
 */

// ============================================
// ITEM TYPES
// ============================================
export const ITEM_TYPES = {
  VIDEO_DEVICES: 'videoDevices',
  CHAIRS: 'chairs',
  TABLES: 'tables',
  STAGE_FLOORS: 'stageFloors',
  BOXES: 'boxes',
  ROOMS: 'rooms',
  DISPLAYS: 'displays',
  SPEAKERS: 'speakers',
  MICROPHONES: 'microphones',
  TOUCH_PANELS: 'touchPanels'
};

// ============================================
// UNITS
// ============================================
export const UNITS = {
  FEET: 'feet',
  METERS: 'meters'
};

export const UNIT_CONVERSION = {
  FEET_TO_METERS: 0.3048,
  METERS_TO_FEET: 3.2808
};

// ============================================
// LAYER VISIBILITY KEYS
// ============================================
export const LAYER_VISIBILITY = {
  CAMERA_SHADING: 'grShadingCamera',
  DISPLAY_DISTANCE: 'grDisplayDistance',
  MIC_SHADING: 'grShadingMicrophone',
  GRID_LINES: 'gridLines',
  SPEAKER_SHADING: 'grShadingSpeaker',
  LABELS: 'grLabels'
};

// ============================================
// DATA ATTRIBUTES
// ============================================
export const DATA_ATTRIBUTES = {
  AUDIO_HIDDEN: 'data_audioHidden',
  SPEAKER_HIDDEN: 'data_speakerHidden',
  FOV_HIDDEN: 'data_fovHidden',
  DISPLAY_DISTANCE_HIDDEN: 'data_dispDistHidden',
  DEVICE_TYPE: 'data_deviceType',
  DEVICE_ID: 'data_deviceid',
  LABEL: 'data_label',
  Z_POSITION: 'data_zPosition'
};

// ============================================
// COVERAGE TYPES (for toggle functions)
// ============================================
export const COVERAGE_TYPES = {
  MIC: {
    layerKey: 'grShadingMicrophone',
    dataAttr: 'data_audioHidden',
    idPrefix: 'audio~'
  },
  SPEAKER: {
    layerKey: 'grShadingSpeaker',
    dataAttr: 'data_speakerHidden',
    idPrefix: 'speaker~'
  },
  CAMERA: {
    layerKey: 'grShadingCamera',
    dataAttr: 'data_fovHidden',
    idPrefix: 'fov~'
  },
  DISPLAY: {
    layerKey: 'grDisplayDistance',
    dataAttr: 'data_dispDistHidden',
    idPrefix: 'dispDist~'
  }
};

// ============================================
// WALL BUILDER TYPES
// ============================================
export const WALL_BUILDER_TYPES = {
  STANDARD: 'wallStd',
  GLASS: 'wallGlass',
  WINDOW: 'wallWindow'
};

// ============================================
// CANVAS DEFAULTS
// ============================================
export const CANVAS_DEFAULTS = {
  PADDING: 100,
  PX_OFFSET: 50,
  GUIDELINE_OFFSET: 5,
  DEFAULT_ZOOM: 100,
  MIN_ZOOM: 10,
  MAX_ZOOM: 500
};

// ============================================
// TIMING DEFAULTS (in milliseconds)
// ============================================
export const TIMING = {
  UNDO_ARRAY_DELTA: 500,
  PAGE_LOAD_DELAY: 3000,
  LOAD_TEMPLATE_TIME: 500,
  RIGHT_CLICK_TOUCH_DELTA: 1500
};

// ============================================
// ROOM DEFAULTS
// ============================================
export const ROOM_DEFAULTS = {
  WIDTH_FEET: 26,
  LENGTH_FEET: 20,
  WALL_HEIGHT_METERS: 2.5,
  MAX_UNDO_LENGTH: 100
};

// ============================================
// DISPLAY DIMENSIONS (mm)
// ============================================
export const DISPLAY_DIMENSIONS = {
  STANDARD: {
    depth: 90,
    height: 695,
    width: 1223,
    diagonalInches: 55
  },
  ULTRAWIDE: {
    depth: 90,
    height: 1073,
    width: 2490,
    diagonalInches: 105
  }
};

// ============================================
// CAMERA CROP DISTANCES (meters)
// ============================================
export const CAMERA_CROP = {
  ONE_PERSON: 2.1,
  TWO_PERSON: 3.2
};

// ============================================
// UI COLORS
// ============================================
export const UI_COLORS = {
  TOGGLE_ON: '#4169E1',
  TOGGLE_OFF: '#800000',
  WALL_STANDARD: 'grey',
  WALL_GLASS: '#ADD8E6',
  WALL_WINDOW: '#8993ff',
  WALL_CUSTOM: '#5e3b50cc'
};

// ============================================
// ROTATION SNAPS (degrees)
// ============================================
export const ROTATION_SNAPS = [0, 45, 90, 135, 180, 225, 270, 315, 360];

// ============================================
// DEFAULT ROOM SURFACES
// ============================================
export const DEFAULT_ROOM_SURFACES = {
  leftwall: { type: 'regular', acousticTreatment: true },
  videowall: { type: 'regular', acousticTreatment: false },
  rightwall: { type: 'regular', acousticTreatment: false },
  backwall: { type: 'regular', acousticTreatment: false }
};

// ============================================
// KONVA GROUP NAMES
// ============================================
export const KONVA_GROUPS = {
  VIDEO_DEVICES: 'videoDevices',
  MICROPHONES: 'microphones',
  CHAIRS: 'chairs',
  TABLES: 'tables',
  STAGE_FLOORS: 'stageFloors',
  DISPLAYS: 'displays',
  SPEAKERS: 'speakers',
  TOUCH_PANELS: 'touchPanels',
  BOXES: 'boxes',
  ROOMS: 'rooms',
  LAYER_GRID: 'layerGrid',
  LAYER_TRANSFORM: 'layerTransform',
  LAYER_SELECTION_BOX: 'layerSelectionBox',
  BACKGROUND_IMAGE_FLOOR: 'layerBackgroundImageFloor',
  SHADING_MIC: 'grShadingMicrophone',
  SHADING_CAMERA: 'grShadingCamera',
  SHADING_SPEAKER: 'grShadingSpeaker',
  DISPLAY_DISTANCE: 'grDisplayDistance',
  LABELS: 'grLabels'
};

// ============================================
// SOFTWARE TYPES
// ============================================
export const SOFTWARE_TYPES = {
  MTR: 'mtr',
  WEBEX: 'webex'
};

// ============================================
// WORKSPACE DESIGNER URLs
// ============================================
export const WORKSPACE_URLS = {
  DEFAULT: 'https://www.webex.com/us/en/workspaces/workspace-designer.html#/room/custom',
  TEST: 'https://designer.cisco.com/#/room/custom'
};

// ============================================
// DOM ELEMENT IDS
// ============================================
export const DOM_IDS = {
  ROOM_NAME: 'roomName',
  ROOM_WIDTH: 'roomWidth',
  ROOM_LENGTH: 'roomLength',
  ROOM_HEIGHT: 'roomHeight',
  ITEM_ID: 'itemId',
  ITEM_GROUP: 'itemGroup',
  CANVAS_DIV: 'canvasDiv',
  SCROLL_CONTAINER: 'scroll-container',
  DIALOG_SINGLE_ITEM_TOGGLES: 'dialogSingleItemToggles',
  FLOATING_WORKSPACE: 'floatingWorkspace'
};

// Make available globally for non-module usage
if (typeof window !== 'undefined') {
  window.VRC_CONSTANTS = {
    ITEM_TYPES,
    UNITS,
    UNIT_CONVERSION,
    LAYER_VISIBILITY,
    DATA_ATTRIBUTES,
    COVERAGE_TYPES,
    WALL_BUILDER_TYPES,
    CANVAS_DEFAULTS,
    TIMING,
    ROOM_DEFAULTS,
    DISPLAY_DIMENSIONS,
    CAMERA_CROP,
    UI_COLORS,
    ROTATION_SNAPS,
    DEFAULT_ROOM_SURFACES,
    KONVA_GROUPS,
    SOFTWARE_TYPES,
    WORKSPACE_URLS,
    DOM_IDS
  };
}
