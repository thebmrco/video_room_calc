/**
 * VRC - Video Room Calculator
 * Device Catalog Module
 *
 * Pluggable interface for device/furniture data.
 * Default implementation uses static data, but can be replaced
 * with a REST-based catalog service.
 *
 * Usage:
 *   import DeviceCatalog from './data/deviceCatalog.js';
 *
 *   // Get devices (works with both static and async sources)
 *   const cameras = await DeviceCatalog.getCameras();
 *
 *   // Or use sync access for static data (backwards compatible)
 *   const cameras = DeviceCatalog.cameras;
 *
 *   // Register a custom catalog provider (e.g., REST-based)
 *   DeviceCatalog.registerProvider(myRestCatalogProvider);
 */

// ============================================
// DEFAULT DISPLAY CONSTANTS
// ============================================

export const DISPLAY_DEFAULTS = {
    displayDepth: 90,
    displayHeight: 695,
    displayWidth: 1223,
    diagonalInches: 55,
    // 21:9 display defaults
    displayDepth21_9: 90,
    displayHeight21_9: 1073,
    displayWidth21_9: 2490,
    diagonalInches21_9: 105
};

// ============================================
// CATALOG STATE
// ============================================

let catalogProvider = null;
let isInitialized = false;
let cachedData = {
    videoDevices: [],
    cameras: [],
    microphones: [],
    speakers: [],
    touchpanels: [],
    tables: [],
    chairs: [],
    displays: [],
    stageFloors: [],
    boxes: [],
    rooms: []
};

// Lookup maps for fast access
let allDeviceTypes = {};
let idKeyMap = {};
let keyIdMap = {};

// ============================================
// CATALOG PROVIDER INTERFACE
// ============================================

/**
 * Interface for catalog providers.
 * Implement this interface to create a custom catalog (e.g., REST-based).
 *
 * @typedef {Object} CatalogProvider
 * @property {function(): Promise<Array>|Array} getVideoDevices
 * @property {function(): Promise<Array>|Array} getCameras
 * @property {function(): Promise<Array>|Array} getMicrophones
 * @property {function(): Promise<Array>|Array} getSpeakers
 * @property {function(): Promise<Array>|Array} getTouchpanels
 * @property {function(): Promise<Array>|Array} getTables
 * @property {function(): Promise<Array>|Array} getChairs
 * @property {function(): Promise<Array>|Array} getDisplays
 * @property {function(): Promise<Array>|Array} getStageFloors
 * @property {function(): Promise<Array>|Array} getBoxes
 * @property {function(): Promise<Array>|Array} getRooms
 * @property {function(): Object} [getDisplayDefaults] - Optional display constants
 */

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize the catalog with data from the provider.
 * @param {Object} options - Initialization options
 * @param {boolean} options.force - Force re-initialization
 * @returns {Promise<void>}
 */
async function init(options = {}) {
    if (isInitialized && !options.force) {
        return;
    }

    if (!catalogProvider) {
        console.warn('[DeviceCatalog] No provider registered, using empty catalog');
        isInitialized = true;
        return;
    }

    try {
        // Load all device categories
        const results = await Promise.all([
            Promise.resolve(catalogProvider.getVideoDevices?.() || []),
            Promise.resolve(catalogProvider.getCameras?.() || []),
            Promise.resolve(catalogProvider.getMicrophones?.() || []),
            Promise.resolve(catalogProvider.getSpeakers?.() || []),
            Promise.resolve(catalogProvider.getTouchpanels?.() || []),
            Promise.resolve(catalogProvider.getTables?.() || []),
            Promise.resolve(catalogProvider.getChairs?.() || []),
            Promise.resolve(catalogProvider.getDisplays?.() || []),
            Promise.resolve(catalogProvider.getStageFloors?.() || []),
            Promise.resolve(catalogProvider.getBoxes?.() || []),
            Promise.resolve(catalogProvider.getRooms?.() || [])
        ]);

        cachedData.videoDevices = results[0];
        cachedData.cameras = results[1];
        cachedData.microphones = results[2];
        cachedData.speakers = results[3];
        cachedData.touchpanels = results[4];
        cachedData.tables = results[5];
        cachedData.chairs = results[6];
        cachedData.displays = results[7];
        cachedData.stageFloors = results[8];
        cachedData.boxes = results[9];
        cachedData.rooms = results[10];

        // Build lookup maps
        buildLookupMaps();

        isInitialized = true;
        console.log('[DeviceCatalog] Initialized with', getTotalDeviceCount(), 'devices');
    } catch (error) {
        console.error('[DeviceCatalog] Failed to initialize:', error);
        throw error;
    }
}

/**
 * Build lookup maps for fast device access.
 */
function buildLookupMaps() {
    allDeviceTypes = {};
    idKeyMap = {};
    keyIdMap = {};

    const categories = [
        { data: cachedData.videoDevices, group: 'videoDevices' },
        { data: cachedData.cameras, group: 'cameras' },
        { data: cachedData.microphones, group: 'microphones' },
        { data: cachedData.speakers, group: 'speakers' },
        { data: cachedData.touchpanels, group: 'touchpanels' },
        { data: cachedData.tables, group: 'tables' },
        { data: cachedData.chairs, group: 'chairs' },
        { data: cachedData.displays, group: 'displays' },
        { data: cachedData.stageFloors, group: 'stageFloors' },
        { data: cachedData.boxes, group: 'boxes' },
        { data: cachedData.rooms, group: 'rooms' }
    ];

    for (const category of categories) {
        for (const item of category.data) {
            if (item.id) {
                allDeviceTypes[item.id] = { ...item, parentGroup: category.group };
                if (item.key) {
                    idKeyMap[item.id] = item.key;
                    keyIdMap[item.key] = {
                        groupName: category.group,
                        data_deviceid: item.id,
                        name: item.name,
                        width: item.width,
                        height: item.depth
                    };
                }
            }
        }
    }
}

/**
 * Get total count of all devices.
 */
function getTotalDeviceCount() {
    return Object.values(cachedData).reduce((sum, arr) => sum + arr.length, 0);
}

// ============================================
// PROVIDER MANAGEMENT
// ============================================

/**
 * Register a catalog provider.
 * @param {CatalogProvider} provider - The catalog provider
 * @param {Object} options - Options
 * @param {boolean} options.initialize - Immediately initialize after registration
 */
async function registerProvider(provider, options = { initialize: true }) {
    catalogProvider = provider;
    isInitialized = false;

    if (options.initialize) {
        await init({ force: true });
    }

    console.log('[DeviceCatalog] Provider registered');
}

/**
 * Get the current catalog provider.
 */
function getProvider() {
    return catalogProvider;
}

// ============================================
// DEVICE ACCESS - ASYNC API
// ============================================

async function getVideoDevices() {
    if (!isInitialized) await init();
    return cachedData.videoDevices;
}

async function getCameras() {
    if (!isInitialized) await init();
    return cachedData.cameras;
}

async function getMicrophones() {
    if (!isInitialized) await init();
    return cachedData.microphones;
}

async function getSpeakers() {
    if (!isInitialized) await init();
    return cachedData.speakers;
}

async function getTouchpanels() {
    if (!isInitialized) await init();
    return cachedData.touchpanels;
}

async function getTables() {
    if (!isInitialized) await init();
    return cachedData.tables;
}

async function getChairs() {
    if (!isInitialized) await init();
    return cachedData.chairs;
}

async function getDisplays() {
    if (!isInitialized) await init();
    return cachedData.displays;
}

async function getStageFloors() {
    if (!isInitialized) await init();
    return cachedData.stageFloors;
}

async function getBoxes() {
    if (!isInitialized) await init();
    return cachedData.boxes;
}

async function getRooms() {
    if (!isInitialized) await init();
    return cachedData.rooms;
}

// ============================================
// DEVICE LOOKUP
// ============================================

/**
 * Get a device by ID.
 * @param {string} deviceId - Device ID
 * @returns {Object|null} Device object or null
 */
function getDeviceById(deviceId) {
    return allDeviceTypes[deviceId] || null;
}

/**
 * Get a device by key.
 * @param {string} key - Device key (e.g., 'AB', 'CA')
 * @returns {Object|null} Device info or null
 */
function getDeviceByKey(key) {
    return keyIdMap[key] || null;
}

/**
 * Get key for a device ID.
 * @param {string} deviceId - Device ID
 * @returns {string|null} Device key or null
 */
function getKeyForId(deviceId) {
    return idKeyMap[deviceId] || null;
}

/**
 * Get all device types map.
 * @returns {Object} Map of device ID to device object
 */
function getAllDeviceTypes() {
    return allDeviceTypes;
}

/**
 * Find devices matching a predicate.
 * @param {function} predicate - Filter function
 * @returns {Array} Matching devices
 */
function findDevices(predicate) {
    return Object.values(allDeviceTypes).filter(predicate);
}

/**
 * Get workspace designer properties for a device.
 * @param {string} deviceId - Device ID
 * @returns {Object} Workspace designer properties or empty object
 */
function getWorkspaceDesigner(deviceId) {
    const device = allDeviceTypes[deviceId];
    return device?.workspaceDesigner || {};
}

/**
 * Set or update workspace designer properties for a device.
 * Used for runtime modifications (e.g., user adjustments to offsets).
 * @param {string} deviceId - Device ID
 * @param {Object} properties - Properties to set/update
 */
function setWorkspaceDesigner(deviceId, properties) {
    const device = allDeviceTypes[deviceId];
    if (device) {
        if (!device.workspaceDesigner) {
            device.workspaceDesigner = {};
        }
        Object.assign(device.workspaceDesigner, properties);
    }
}

// ============================================
// SYNC ACCESS (BACKWARDS COMPATIBILITY)
// ============================================

/**
 * Direct sync access to cached data.
 * Use these for backwards compatibility with existing code.
 * Note: Data must be initialized first.
 */
const syncAccess = {
    get videoDevices() { return cachedData.videoDevices; },
    get cameras() { return cachedData.cameras; },
    get microphones() { return cachedData.microphones; },
    get speakers() { return cachedData.speakers; },
    get touchpanels() { return cachedData.touchpanels; },
    get tables() { return cachedData.tables; },
    get chairs() { return cachedData.chairs; },
    get displays() { return cachedData.displays; },
    get stageFloors() { return cachedData.stageFloors; },
    get boxes() { return cachedData.boxes; },
    get rooms() { return cachedData.rooms; },
    get allDeviceTypes() { return allDeviceTypes; },
    get idKeyMap() { return idKeyMap; },
    get keyIdMap() { return keyIdMap; }
};

// ============================================
// EXPORT
// ============================================

const DeviceCatalog = {
    // Initialization
    init,
    registerProvider,
    getProvider,
    get isInitialized() { return isInitialized; },

    // Async API
    getVideoDevices,
    getCameras,
    getMicrophones,
    getSpeakers,
    getTouchpanels,
    getTables,
    getChairs,
    getDisplays,
    getStageFloors,
    getBoxes,
    getRooms,

    // Lookup
    getDeviceById,
    getDeviceByKey,
    getKeyForId,
    getAllDeviceTypes,
    findDevices,
    getWorkspaceDesigner,
    setWorkspaceDesigner,

    // Sync access (backwards compatibility)
    ...syncAccess,

    // Constants
    DISPLAY_DEFAULTS
};

export default DeviceCatalog;

// Global export for non-module usage
if (typeof window !== 'undefined') {
    window.VRC_DeviceCatalog = DeviceCatalog;
}
