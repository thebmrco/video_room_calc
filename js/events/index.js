/**
 * VRC - Video Room Calculator
 * Events Module Index
 *
 * Re-exports all event handler modules.
 */

export { default as EventManager } from './eventManager.js';
export { default as KeyboardHandlers } from './keyboardHandlers.js';
export { default as StageHandlers } from './stageHandlers.js';
export { default as CanvasInteractionHandlers } from './canvasInteractionHandlers.js';
export { default as ItemHandlers } from './itemHandlers.js';

// Re-export everything from EventManager as default API
export * from './eventManager.js';
