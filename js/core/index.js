/**
 * VRC - Video Room Calculator
 * Core Module Index
 *
 * Re-exports all core modules for easier importing.
 */

// Constants - explicit named exports
export {
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
} from './constants.js';

// State Manager
export { default as StateManager } from './stateManager.js';

// DOM Controller
export { default as DOMController } from './domController.js';

// Item Factory
export { default as ItemFactory } from './itemFactory.js';

// Coverage Toggle
export {
    toggleCoverageSingleItem,
    toggleCoverageAll,
    isCoverageHidden,
    getCoverageConfig,
    createLegacyToggleFunctions
} from './coverageToggle.js';
export { default as CoverageToggle } from './coverageToggle.js';
