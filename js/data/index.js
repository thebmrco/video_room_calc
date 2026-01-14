/**
 * VRC - Video Room Calculator
 * Data Module Index
 *
 * Re-exports all data modules for easier importing.
 */

export { default as DeviceCatalog, DISPLAY_DEFAULTS } from './deviceCatalog.js';
export { default as StaticDeviceProvider } from './staticDeviceData.js';

// Re-export workspace designer helpers from DeviceCatalog
export { default as deviceCatalog } from './deviceCatalog.js';

// For backwards compatibility, create a workspaceKey proxy that uses DeviceCatalog
import DeviceCatalog from './deviceCatalog.js';
export const getWorkspaceDesigner = DeviceCatalog.getWorkspaceDesigner;
export const setWorkspaceDesigner = DeviceCatalog.setWorkspaceDesigner;
