/**
 * VRC - Video Room Calculator
 * Events Module Index
 *
 * Re-exports all event handler modules.
 */

// Default exports as named exports
export { default as EventManager } from './eventManager.js';
export { default as KeyboardHandlers } from './keyboardHandlers.js';
export { default as StageHandlers } from './stageHandlers.js';
export { default as CanvasInteractionHandlers } from './canvasInteractionHandlers.js';
export { default as ItemHandlers } from './itemHandlers.js';

// EventManager API functions
export {
    init as initEvents,
    updateContext,
    enable as enableEvents,
    disable as disableEvents,
    registerKeyboardActions,
    onKeyboardAction,
    setKeyboardBlocked,
    registerStageCallbacks,
    clearSelection,
    selectNodes,
    getSelectedNodes,
    enableWallBuilder,
    disableWallBuilder,
    enableMeasuringTool,
    disableMeasuringTool,
    enablePan,
    disablePan,
    enablePolyBuilder,
    disablePolyBuilder,
    isToolActive,
    attachItemListeners,
    removeItemListeners,
    attachItemListenersBatch,
    isInitialized as isEventsInitialized,
    isEnabled as isEventsEnabled,
    isShiftDown,
    isWallBuilderOn,
    isMeasuringToolOn,
    isDragging,
    setZoomScale,
    setScrollOffset
} from './eventManager.js';
