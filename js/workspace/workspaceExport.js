/**
 * VRC - Video Room Calculator
 * Workspace Designer Export Module
 *
 * Handles conversion from VRC room format to Workspace Designer format.
 * This module exports room configurations for use with the Workspace Designer 3D view.
 */

import { DeviceCatalog, DISPLAY_DEFAULTS } from '../data/index.js';
import { findUpperLeftXY, findNewTransformationCoordinate, getItemCenter } from '../utils/geometry.js';

// ============================================
// DISPLAY CONSTANTS (from DISPLAY_DEFAULTS)
// ============================================

const { displayDepth, displayHeight, displayWidth, diagonalInches,
        displayDepth21_9, displayHeight21_9, displayWidth21_9, diagonalInches21_9 } = DISPLAY_DEFAULTS;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Parse JSON from data_labelField and merge with workspaceItem.
 * @param {Object} item - Item with data_labelField property
 * @param {Object} [workspaceItem] - Optional workspace item to merge into
 * @returns {Object} Parsed workspace item with merged properties
 */
export function parseDataLabelFieldJson(item, workspaceItem) {
    let commentPart;
    let jsonPart = /{.*}/.exec(item.data_labelField);

    if ('data_labelField' in item && item.data_labelField) {
        commentPart = item.data_labelField.replace(/{.*?}/g, '');
    }

    if (jsonPart) {
        try {
            let newKeyValues = JSON.parse(jsonPart[0]);
            workspaceItem = { ...workspaceItem, ...newKeyValues };
        } catch {
            console.info('Error parsing JSON ', jsonPart);
        }
    }

    if (commentPart && workspaceItem) {
        workspaceItem.comment = commentPart.trim();
    }

    return workspaceItem;
}

/**
 * Get default role/color string from device property array.
 * @param {Array} keyValue - Array of role/color options
 * @returns {string} Default role/color string
 */
function returnStringOfDefaultRoleColor(keyValue) {
    let defaultRole;

    if (typeof (keyValue[0]) === 'string') {
        defaultRole = keyValue[0];
    } else {
        for (const [key, value] of Object.entries(keyValue[0])) {
            defaultRole = key;
        }
    }

    return defaultRole;
}

/**
 * Add default role/color/mount to workspace designer properties.
 * Updates the workspaceDesigner property in DeviceCatalog for devices
 * that have roles/colors/mounts defined.
 * @param {Array} videoDevices - Video devices array
 * @param {Array} microphones - Microphones array
 * @param {Array} displays - Displays array
 * @param {Array} chairs - Chairs array
 */
export function addDefaultsToWorkspaceObj(videoDevices, microphones, displays, chairs) {
    compareAdd(videoDevices);
    compareAdd(microphones);
    compareAdd(displays);
    compareAdd(chairs);

    function compareAdd(items) {
        const allDeviceTypes = DeviceCatalog.getAllDeviceTypes();

        for (const deviceId in allDeviceTypes) {
            const device = allDeviceTypes[deviceId];
            if (!device.workspaceDesigner) continue;

            items.forEach((item) => {
                if (item.id === deviceId) {
                    if ('roles' in item && item.roles) {
                        DeviceCatalog.setWorkspaceDesigner(deviceId, {
                            role: returnStringOfDefaultRoleColor(item.roles)
                        });
                    }

                    if ('colors' in item && item.colors) {
                        DeviceCatalog.setWorkspaceDesigner(deviceId, {
                            color: returnStringOfDefaultRoleColor(item.colors)
                        });
                    }

                    if ('mount' in item && item.mounts) {
                        DeviceCatalog.setWorkspaceDesigner(deviceId, {
                            mount: returnStringOfDefaultRoleColor(item.mounts)
                        });
                    }
                }
            });
        }
    }
}

// ============================================
// UNIT CONVERSION
// ============================================

/**
 * Convert roomObj to meters for 3D Workspace export.
 * If already in meters, applies room offset adjustments.
 * @param {Object} roomObj2 - Cloned room object to convert
 * @param {Object} options - Conversion options
 * @param {number} options.activeRoomX - Active room X offset
 * @param {number} options.activeRoomY - Active room Y offset
 * @param {number} options.activeRoomWidth - Active room width
 * @param {number} options.activeRoomLength - Active room length
 * @param {Array} options.itemsOffStageId - IDs of items off stage
 * @param {boolean} options.isActiveRoomPart - Whether room partitioning is active
 * @param {function} options.round - Rounding function
 * @returns {Object} Room object converted to meters
 */
export function convertToMeters(roomObj2, options) {
    const {
        activeRoomX,
        activeRoomY,
        activeRoomWidth,
        activeRoomLength,
        itemsOffStageId = [],
        isActiveRoomPart = false,
        round = (v) => Math.round(v * 1000) / 1000
    } = options;

    let roomObjTemp = {};
    roomObjTemp.room = {};
    roomObjTemp.items = {};

    let roomX;
    let roomY;

    Object.keys(roomObj2.items).forEach(key => {
        roomObjTemp.items[key] = [];
    });

    let ratio = 1;

    if (roomObj2.unit === 'feet') {
        ratio = 1 / 3.28084;
    }
    roomObjTemp.name = roomObj2.name;

    roomX = ratio * (activeRoomX - (roomObj2.room.roomWidth - activeRoomWidth) / 2);
    roomY = ratio * (activeRoomY - (roomObj2.room.roomLength - activeRoomLength) / 2);

    roomObjTemp.room.roomWidth = roomObj2.room.roomWidth * ratio;
    roomObjTemp.room.roomLength = roomObj2.room.roomLength * ratio;

    roomObjTemp.activeRoomLength = activeRoomLength * ratio;
    roomObjTemp.activeRoomWidth = activeRoomWidth * ratio;
    roomObjTemp.activeRoomX = roomX;
    roomObjTemp.activeRoomY = roomY;

    if (roomObj2.room.roomHeight) {
        roomObjTemp.room.roomHeight = roomObj2.room.roomHeight * ratio;
    } else {
        roomObjTemp.room.roomHeight = 2.5;
    }

    if ('backgroundImage' in roomObj2) {
        roomObjTemp.backgroundImage = {};
        roomObjTemp.backgroundImage.x = roomObj2.backgroundImage.x * ratio;
        roomObjTemp.backgroundImage.y = roomObj2.backgroundImage.y * ratio;
        roomObjTemp.backgroundImage.width = roomObj2.backgroundImage.width * ratio;
        roomObjTemp.backgroundImage.height = roomObj2.backgroundImage.height * ratio;
        roomObjTemp.backgroundImage.rotation = roomObj2.backgroundImage.rotation;
        roomObjTemp.backgroundImage.name = roomObj2.backgroundImage.name;
        roomObjTemp.backgroundImage.opacity = roomObj2.backgroundImage.opacity;
    }

    for (const category in roomObj2.items) {
        roomObjTemp.items[category] = [];
        for (const i in roomObj2.items[category]) {

            const isItemOnStage = !itemsOffStageId.includes(roomObj2.items[category][i].id);

            if (isItemOnStage || isActiveRoomPart) {

                let item = roomObj2.items[category][i];

                if ('x' in item) {
                    item.x = (item.x * ratio) - roomX;
                }

                if ('y' in item) {
                    item.y = (item.y * ratio) - roomY;
                }

                if ('width' in item) {
                    item.width = item.width * ratio;
                }

                if ('height' in item) {
                    item.height = item.height * ratio;
                }

                if ('radius' in item) {
                    item.radius = item.radius * ratio;
                }

                if ('data_zPosition' in item) {
                    item.data_zPosition = round(item.data_zPosition * ratio);
                }

                if ('data_vHeight' in item) {
                    item.data_vHeight = round(item.data_vHeight * ratio);
                }

                if ('tblRectRadius' in item) {
                    item.tblRectRadius = round(item.tblRectRadius * ratio);
                }

                if ('data_trapNarrowWidth' in item) {
                    item.data_trapNarrowWidth = round(item.data_trapNarrowWidth * ratio);
                }

                if ('tblRectRadiusRight' in item) {
                    item.tblRectRadiusRight = round(item.tblRectRadiusRight * ratio);
                }

                if (isItemOnStage) {
                    item.data_isItemOnStage = true;
                } else {
                    item.data_isItemOnStage = false;
                }

                roomObjTemp.items[category].push(item);
            }
        }
    }

    return roomObjTemp;
}

// ============================================
// MAIN EXPORT FUNCTION
// ============================================

/**
 * Export room object to Workspace Designer format.
 * Converts VRC room data to the JSON format expected by Workspace Designer.
 *
 * @param {Object} roomObj - The VRC room object to export
 * @param {Object} options - Export options
 * @param {number} options.activeRoomX - Active room X offset
 * @param {number} options.activeRoomY - Active room Y offset
 * @param {number} options.activeRoomWidth - Active room width
 * @param {number} options.activeRoomLength - Active room length
 * @param {Array} options.itemsOffStageId - IDs of items off stage
 * @param {boolean} options.isActiveRoomPart - Whether room partitioning is active
 * @param {number} options.defaultWallHeight - Default wall height in meters
 * @param {string} options.fullShareLinkCollabExpBase - Full share link base URL
 * @param {string} options.version - VRC version string
 * @param {Object} options.defaultRoomSurfaces - Default room surfaces configuration
 * @param {boolean} options.removeDefaultWallsChecked - Whether remove default walls checkbox is checked
 * @param {function} options.expandChairs - Function to expand chair groups
 * @param {function} options.round - Rounding function
 * @returns {Object} Workspace Designer format object
 */
export function exportRoomObjToWorkspace(roomObj, options) {
    const {
        activeRoomX,
        activeRoomY,
        activeRoomWidth,
        activeRoomLength,
        itemsOffStageId = [],
        isActiveRoomPart = false,
        defaultWallHeight = 2.5,
        fullShareLinkCollabExpBase = '',
        version = '',
        defaultRoomSurfaces = {},
        removeDefaultWallsChecked = false,
        expandChairs = null,
        round = (v) => Math.round(v * 1000) / 1000
    } = options;

    const swapXY = true;
    const allDeviceTypes = DeviceCatalog.getAllDeviceTypes();

    // Helper to get workspace designer properties for a device
    const getWorkspaceKey = (deviceId) => DeviceCatalog.getWorkspaceDesigner(deviceId);

    let roomObj2 = structuredClone(roomObj);

    roomObj2 = convertToMeters(roomObj2, {
        activeRoomX,
        activeRoomY,
        activeRoomWidth,
        activeRoomLength,
        itemsOffStageId,
        isActiveRoomPart,
        round
    });

    let activeRoomLengthM = roomObj2.activeRoomLength;
    let activeRoomWidthM = roomObj2.activeRoomWidth;
    let activeRoomXM = roomObj2.activeRoomX;
    let activeRoomYM = roomObj2.activeRoomY;

    let workspaceObj = {};
    workspaceObj.title = '';
    workspaceObj.roomShape = {};
    workspaceObj.roomShape.manual = true;
    workspaceObj.roomShape.plant = false;

    if (swapXY) {
        workspaceObj.roomShape.width = roomObj2.room.roomWidth;
        workspaceObj.roomShape.length = roomObj2.room.roomLength;
    } else {
        workspaceObj.roomShape.width = roomObj2.room.roomLength;
        workspaceObj.roomShape.length = roomObj2.room.roomWidth;
    }

    ['leftwall', 'videowall', 'rightwall', 'backwall'].forEach(roomSurfaceId => {
        if (roomObj.roomSurfaces && roomObj.roomSurfaces[roomSurfaceId] &&
            roomObj.roomSurfaces[roomSurfaceId].door === 'none') {
            delete roomObj.roomSurfaces[roomSurfaceId].door;
        }
    });

    if (roomObj.roomSurfaces) {
        workspaceObj.roomShape.roomSurfaces = [
            { ...{ objectId: 'leftwall' }, ...roomObj.roomSurfaces.leftwall },
            { ...{ objectId: 'videowall' }, ...roomObj.roomSurfaces.videowall },
            { ...{ objectId: 'rightwall' }, ...roomObj.roomSurfaces.rightwall },
            { ...{ objectId: 'backwall' }, ...roomObj.roomSurfaces.backwall },
        ];
    }

    // Alternative default wall handling
    let altDefaultWall = true;

    if (altDefaultWall === true && !roomObj.workspace.removeDefaultWalls) {
        let backwall = {};
        let leftwall = {};
        let rightwall = {};
        let videowall = {};

        backwall.id = 'backwall';
        backwall.x = -0.1 - activeRoomXM;
        backwall.y = roomObj2.room.roomLength + 0.1 - activeRoomYM;
        backwall.data_zPosition = -0.10;
        backwall.data_vHeight = roomObj2.room.roomHeight + 0.10;
        backwall.rotation = -90;
        backwall.width = 0.10;
        backwall.height = roomObj2.room.roomWidth + 2 * 0.10;

        videowall.id = 'videowall';
        videowall.x = roomObj2.room.roomWidth + 0.10 - activeRoomXM;
        videowall.y = -0.1 - activeRoomYM;
        videowall.data_zPosition = -0.10;
        videowall.data_vHeight = roomObj2.room.roomHeight + 0.10;
        videowall.rotation = 90;
        videowall.width = 0.10;
        videowall.height = roomObj2.room.roomWidth + 2 * 0.10;

        leftwall.id = 'leftwall';
        leftwall.x = -0.1 - activeRoomXM;
        leftwall.y = 0 - activeRoomYM;
        leftwall.data_zPosition = 0;
        leftwall.data_vHeight = roomObj2.room.roomHeight;
        leftwall.rotation = 0;
        leftwall.width = 0.10;
        leftwall.height = roomObj2.room.roomLength;

        rightwall.id = 'rightwall';
        rightwall.x = roomObj2.room.roomWidth + 0.1 - activeRoomXM;
        rightwall.y = roomObj2.room.roomLength - activeRoomYM;
        rightwall.data_zPosition = 0;
        rightwall.data_vHeight = roomObj2.room.roomHeight;
        rightwall.rotation = 180;
        rightwall.width = 0.1;
        rightwall.height = roomObj2.room.roomLength;

        [backwall, leftwall, rightwall, videowall].forEach(wall => {
            let jsonLabel = {};

            if (roomObj.roomSurfaces && roomObj.roomSurfaces[wall.id]) {
                if (roomObj.roomSurfaces[wall.id].type === 'regular') {
                    wall.data_deviceid = 'wallStd';
                }
                else if (roomObj.roomSurfaces[wall.id].type === 'glass') {
                    wall.data_deviceid = 'wallGlass';
                }
                else if (roomObj.roomSurfaces[wall.id].type === 'window') {
                    wall.data_deviceid = 'wallWindow';
                }

                if ('acousticTreatment' in roomObj.roomSurfaces[wall.id]) {
                    jsonLabel.acousticTreatment = roomObj.roomSurfaces[wall.id].acousticTreatment;
                }

                if ('door' in roomObj.roomSurfaces[wall.id]) {
                    jsonLabel.door = roomObj.roomSurfaces[wall.id].door;
                }
            } else {
                wall.data_deviceid = 'wallStd';
            }

            wall.data_labelField = JSON.stringify(jsonLabel);
            roomObj2.items.tables.push(wall);
        });
    }

    if ('roomHeight' in roomObj2.room) {
        if ((roomObj2.room.roomHeight == 0 || roomObj2.room.roomHeight == '')) {
            workspaceObj.roomShape.height = 2.5;
        } else {
            workspaceObj.roomShape.height = roomObj2.room.roomHeight;
        }
    }

    if (roomObj.software) {
        workspaceObj.meetingPlatform = roomObj.software;
    }

    workspaceObj.roomId = roomObj.roomId;
    workspaceObj.customObjects = [];

    workspaceObj.source = {};
    workspaceObj.source.name = 'vrc';
    workspaceObj.source.url = fullShareLinkCollabExpBase;
    workspaceObj.source.version = version;

    workspaceObj.data = {};
    workspaceObj.data.vrc = {};
    workspaceObj.data.vrc.workspace = {};
    workspaceObj.data.vrc.workspace.theme = roomObj.workspace.theme || 'regular';

    if ('backgroundImageFile' in roomObj && 'backgroundImage' in roomObj2) {
        workspaceObj.data.vrc.backgroundImageFile = roomObj.backgroundImageFile;
        workspaceObj.data.vrc.backgroundImage = roomObj2.backgroundImage;
    }

    if (altDefaultWall && !removeDefaultWallsChecked) {
        delete workspaceObj.roomShape;
        let floor = {
            x: roomObj2.room.roomWidth + 0.1 - activeRoomXM,
            y: 0 - activeRoomYM,
            rotation: 90,
            id: "primaryFloor",
            data_zPosition: -0.1,
            data_vHeight: 0.1,
            width: roomObj2.room.roomLength,
            height: roomObj2.room.roomWidth + 0.2,
        };

        workspaceObjWallPush(floor, 'floor');
    }

    if (removeDefaultWallsChecked) {
        delete workspaceObj.roomShape;

        let floor = {
            x: roomObj2.room.roomWidth - activeRoomXM,
            y: 0 - activeRoomYM,
            rotation: 90,
            id: "primaryFloor",
            data_zPosition: -0.1,
            data_vHeight: 0.1,
            width: roomObj2.room.roomLength,
            height: roomObj2.room.roomWidth
        };

        workspaceObjWallPush(floor, 'floor');

        let wallWidth = 0.10;
        let outerFloor = {
            x: roomObj2.room.roomWidth + wallWidth - activeRoomXM,
            y: 0 - wallWidth - activeRoomYM,
            rotation: 90,
            data_deviceid: "wall",
            id: "secondary-outerFloor",
            data_zPosition: -0.105,
            data_vHeight: 0.1,
            data_labelField: `{"color":"#CCC", "opacity": 0.97}`,
            width: roomObj2.room.roomLength + wallWidth * 2,
            height: roomObj2.room.roomWidth + wallWidth * 2
        };

        workspaceObjWallPush(outerFloor);
    }

    if ((roomObj.workspace.addCeiling === true && roomObj.workspace.removeDefaultWalls)) {
        let wallWidth = 0;
        let ceiling = {
            "x": 0 - wallWidth - activeRoomXM,
            "y": 0 - wallWidth - activeRoomYM,
            "rotation": 0,
            "id": "ceiling",
            "data_zPosition": roomObj2.room.roomHeight || defaultWallHeight,
            "data_vHeight": 0.01,
            "width": roomObj2.room.roomWidth + (wallWidth * 2),
            "height": roomObj2.room.roomLength + (wallWidth * 2)
        };

        if (!swapXY) {
            ceiling.width = roomObj2.room.roomLength;
            ceiling.height = roomObj2.room.roomWidth;
        }

        workspaceObjWallPush(ceiling, 'ceiling');
    }

    if (roomObj2.name == null || roomObj2.name == '') {
        workspaceObj.title = 'Custom Room';
    } else {
        workspaceObj.title = roomObj2.name;
    }

    // Process chairs
    roomObj2.items.chairs.forEach((item) => {
        if (item.data_deviceid === 'wheelchairTurnCycle') {
            let newItem = structuredClone(item);
            newItem.width = 1.5;
            newItem.height = 1.5;
            let xy = findUpperLeftXY(newItem);
            let fakeTable = {
                data_deviceid: 'tblEllip',
                id: 'secondary-wheelChairRound-' + item.id,
                rotation: item.rotation,
                data_zPosition: -0.07,
                data_vHeight: 0.1,
                width: 1.5,
                height: 1.5,
                x: xy.x,
                y: xy.y
            };
            workspaceObjTablePush(fakeTable);
        }

        if (item.data_deviceid.startsWith('doorDouble')) {
            let leftDoor = structuredClone(item);
            let rightDoor = structuredClone(item);
            let deltaX = 0.51;
            let deltaY = -1 * ((allDeviceTypes[item.data_deviceid].depth / 2 / 1000) - 0.05);

            leftDoor.id = 'primary1-doorDouble-L-' + item.id;
            leftDoor.data_deviceid = rightDoor.data_deviceid + 'Left';

            rightDoor.id = 'primary2-dooorDouble-R-' + item.id;
            rightDoor.data_deviceid = rightDoor.data_deviceid + 'Right';

            let leftDoorXY = findNewTransformationCoordinate(item, deltaX, deltaY);
            let rightDoorXY = findNewTransformationCoordinate(item, -deltaX, deltaY);

            leftDoor.x = leftDoorXY.x;
            leftDoor.y = leftDoorXY.y;

            rightDoor.x = rightDoorXY.x;
            rightDoor.y = rightDoorXY.y;

            workspaceObjItemPush(rightDoor);
            item = structuredClone(leftDoor);
        }

        workspaceObjItemPush(item);
    });

    // Process microphones
    roomObj2.items.microphones.forEach((item) => {
        if ((item.data_mount && item.data_mount.value.startsWith('ceilingMount')) ||
            ((item.data_deviceid === 'ceilingMicPro') && !item.data_mount)) {
            let ceilingMount = structuredClone(item);
            let poleHeight = (roomObj2.room.roomHeight || defaultWallHeight) - (item.data_zPosition || 0);
            ceilingMount.data_vHeight = poleHeight;
            ceilingMount.data_deviceid = "ceilingMount";
            ceilingMount.data_zPosition = item.data_zPosition + (poleHeight / 35);
            ceilingMount.id = "secondary-ceilingMount-" + item.id;
            delete ceilingMount.data_mount;

            workspaceObjItemPush(ceilingMount);
            delete item.data_mount;
        }

        if (item.data_deviceid === 'ceilingMic') {
            item.data_ceilingHeight = roomObj2.room.roomHeight;
        }

        workspaceObjItemPush(item);
    });

    // Process tables
    roomObj2.items.tables.forEach((item) => {
        if (item.data_deviceid) {
            if (item.data_deviceid.startsWith('tbl') || item.data_deviceid.startsWith('couch')) {
                workspaceObjTablePush(item);
            }
            else if (item.data_deviceid.startsWith('wallChairs')) {
                if (expandChairs) {
                    let chairs = expandChairs(item, 'meters');
                    chairs.forEach(chair => {
                        workspaceObjItemPush(chair);
                    });
                }
            }
            else if (item.data_deviceid === 'sphere' || item.data_deviceid === 'cylinder') {
                workspaceObjWallPush(item);
            }
            else if (item.data_deviceid === 'pathShape') {
                workspaceObjItemPush(item);
            }
            else if (item.data_deviceid.startsWith('wall') || item.data_deviceid.startsWith('column') ||
                     item.data_deviceid.startsWith('floor') || item.data_deviceid.startsWith('box')) {
                workspaceObjWallPush(item);
            }
        }
    });

    // Process stage floors
    roomObj2.items.stageFloors.forEach((item) => {
        if (item.data_deviceid) {
            if (item.data_deviceid.startsWith('stageFloor')) {
                if (item.id.startsWith('stage') || item.id.startsWith('step')) {
                    // do nothing for stage or step objects
                } else {
                    item.id = 'stageFloor~' + item.id;
                }
                workspaceObjWallPush(item);
            }
            else if (item.data_deviceid.startsWith('carpet')) {
                workspaceObjWallPush(item);
            }
        }
    });

    // Process boxes
    roomObj2.items.boxes.forEach((item) => {
        workspaceObjWallPush(item);
    });

    // Process rooms
    roomObj2.items.rooms.forEach((item) => {
        workspaceObjWallPush(item);
    });

    // Process video devices
    roomObj2.items.videoDevices.forEach((item) => {
        if (item.data_mount && item.data_mount.value.startsWith('flippedPole')) {
            if (item.data_deviceid === 'ptz4kMount2' || item.data_deviceid === 'ptzVision2') {
                item.data_zPosition = item.data_zPosition + allDeviceTypes[item.data_deviceid].height / 1000;
            }

            let pole = {};
            let poleHeight = (roomObj2.room.roomHeight || defaultWallHeight) - (item.data_zPosition || 0);
            pole.width = 0.04;
            pole.height = 0.04;
            let poleXY = findNewTransformationCoordinate(item, pole.width / 2, pole.width / 2);
            pole.x = poleXY.x;
            pole.y = poleXY.y;
            pole.data_zPosition = (item.data_zPosition || 0);
            pole.data_vHeight = poleHeight;
            pole.rotation = item.rotation;
            pole.data_deviceid = "box";
            pole.data_labelField = '{"color":"#999999"}';
            pole.id = "secondary-flippedPoleMount-" + item.id;
            workspaceObjWallPush(pole);
        }

        if (item.data_mount && item.data_mount.value === 'flipped') {
            if (item.data_deviceid === 'ptz4kMount2' || item.data_deviceid === 'ptzVision2') {
                item.data_zPosition = item.data_zPosition + allDeviceTypes[item.data_deviceid].height / 1000;
            }
        }

        workspaceObjItemPush(item);
    });

    // Process displays
    roomObj2.items.displays.forEach((item) => {
        let displayRatio = 1.02;

        if (item.data_deviceid === 'displayDbl' || item.data_deviceid === 'displayTrpl') {
            let leftDisplay = structuredClone(item);
            let rightDisplay = structuredClone(item);
            let centerDisplay = structuredClone(item);
            let deltaX = (item.data_diagonalInches / 12 / 3.804 * displayRatio) / 2;

            if (item.data_deviceid === 'displayTrpl') {
                deltaX = deltaX * 1.98;
                centerDisplay.data_deviceid = 'displaySngl';
                centerDisplay.id = 'centerScreen~' + centerDisplay.id;
                centerDisplay.role = 'firstScreen';
                workspaceObjDisplayPush(centerDisplay);
            }
            let deltaY = 0;

            let leftDisplayXY = findNewTransformationCoordinate(item, -deltaX, deltaY);
            let rightDisplayXY = findNewTransformationCoordinate(item, deltaX, deltaY);

            leftDisplay.data_deviceid = 'displaySngl';
            leftDisplay.id = 'screen-L~' + leftDisplay.id;
            leftDisplay.x = leftDisplayXY.x;
            leftDisplay.y = leftDisplayXY.y;
            leftDisplay.role = 'secondScreen';
            workspaceObjDisplayPush(leftDisplay);

            rightDisplay.data_deviceid = 'displaySngl';
            rightDisplay.id = 'screen-R~' + rightDisplay.id;
            rightDisplay.x = rightDisplayXY.x;
            rightDisplay.y = rightDisplayXY.y;
            rightDisplay.role = 'firstScreen';
            workspaceObjDisplayPush(rightDisplay);
        } else {
            item.role = 'firstScreen';
            workspaceObjDisplayPush(item);
        }
    });

    // ============================================
    // NESTED HELPER FUNCTIONS
    // ============================================

    function workspaceObjItemPush(newItem) {
        let x, y, attr;
        let z = 0;
        let item = structuredClone(newItem);

        // Plants will be converted to christmas trees
        if (item.data_deviceid === 'plant' && roomObj.workspace.theme === 'christmas') {
            item.data_deviceid = 'tree';
        }

        const workspaceKey = getWorkspaceKey(item.data_deviceid);
        if (workspaceKey && Object.keys(workspaceKey).length > 0) {
            attr = workspaceKey;
        } else {
            console.info('Item not in workSpaceKey', item.data_deviceid);
            attr = getWorkspaceKey('customVRC') || { objectType: 'custom' };
            attr.model = item.data_deviceid;
        }

        // Handle Room Kit EQX devices with displays
        if (item.data_deviceid.startsWith('roomKitEqx')) {
            let newData_zPosition, deltaY;
            let leftDisplay = structuredClone(item);
            let rightDisplay = structuredClone(item);
            let displayRatio = 1.02;

            if (!item.data_zPosition) {
                item.data_zPosition = 0;
            }

            let deltaX = (item.data_diagonalInches / 12 / 3.804 * displayRatio) / 2;
            let newDisplayHeight = item.data_diagonalInches / diagonalInches * displayHeight / 1000;

            if (item.data_deviceid === 'roomKitEqxFS') {
                newData_zPosition = 1.76 + Number(item.data_zPosition) - newDisplayHeight;
                deltaY = -0.07;
            }
            else if (item.data_deviceid === 'roomKitEqxWS') {
                newData_zPosition = 1.76 + Number(item.data_zPosition) - newDisplayHeight;
                deltaY = -0.12;
            }
            else {
                newData_zPosition = 1.081 + Number(item.data_zPosition) - newDisplayHeight;
                deltaY = -0.12;
            }

            let leftDisplayXY = findNewTransformationCoordinate(item, -deltaX, deltaY);
            let rightDisplayXY = findNewTransformationCoordinate(item, deltaX, deltaY);

            leftDisplay.data_deviceid = 'displaySngl';
            leftDisplay.id = 'display-KitEQX-L~' + item.data_deviceid + '-' + leftDisplay.id;
            leftDisplay.x = leftDisplayXY.x;
            leftDisplay.y = leftDisplayXY.y;
            leftDisplay.data_zPosition = newData_zPosition;
            leftDisplay.role = 'secondScreen';
            workspaceObjDisplayPush(leftDisplay);

            rightDisplay.data_deviceid = 'displaySngl';
            rightDisplay.id = 'display-KitEQX-R~' + item.data_deviceid + '-' + rightDisplay.id;
            rightDisplay.x = rightDisplayXY.x;
            rightDisplay.y = rightDisplayXY.y;
            rightDisplay.data_zPosition = newData_zPosition;
            rightDisplay.role = 'firstScreen';
            workspaceObjDisplayPush(rightDisplay);
        }

        if ('data_zPosition' in item) {
            if (item.data_zPosition != "") z = item.data_zPosition;
        }

        if ('yOffset' in attr || 'xOffset' in attr || 'data_labelField' in item) {
            let yOffset = 0;
            let xOffset = 0;

            if ('yOffset' in attr) yOffset = attr.yOffset;
            if ('xOffset' in attr) xOffset = attr.xOffset;

            if ('data_labelField' in item) {
                let labelParsed = parseDataLabelFieldJson(item);
                if (labelParsed) {
                    xOffset = labelParsed.xOffset || xOffset;
                    yOffset = labelParsed.yOffset || yOffset;
                }
            }

            let newXY = findNewTransformationCoordinate(item, xOffset, yOffset);
            item.y = newXY.y;
            item.x = newXY.x;
        }

        x = (item.x - (roomObj2.room.roomWidth) / 2);
        y = (item.y - (roomObj2.room.roomLength) / 2);

        if ('vertOffset' in attr) {
            z = z + attr.vertOffset;
        }

        if (item.data_deviceid === 'cylinder' || item.data_deviceid === 'sphere') {
            x = x + item.width / 2;
            y = y + item.width / 2;
        }

        let workspaceItem = {
            id: item.id,
            "position": [
                (swapXY ? x : y),
                z,
                (swapXY ? y : x)
            ],
            "rotation": [
                ((item.data_tilt) * (Math.PI / 180)) || 0,
                ((item.rotation) * -(Math.PI / 180)),
                ((item.data_slant) * (Math.PI / 180)) || 0,
            ]
        };

        workspaceItem = { ...workspaceItem, ...attr };
        delete workspaceItem.idRegex;

        if (item.data_deviceid === 'sphere') {
            workspaceItem.radius = item.width / 2;
        }

        if (item.data_deviceid === 'cylinder') {
            let zPosition = item.data_zPosition || 0;
            z = zPosition - (item.width / 2);
        }

        if ('data_role' in item && item.data_role) {
            workspaceItem.role = item.data_role.value;
            if (workspaceItem.role === 'presentertrack2') {
                workspaceItem.role = 'presentertrack';
            } else if (workspaceItem.role === 'crossviewPresenterTrack') {
                workspaceItem.role = 'crossview+presentertrack';
            }
        }

        if ('data_ceilingHeight' in item && item.data_ceilingHeight) {
            workspaceItem.ceilingHeight = item.data_ceilingHeight;
        }

        if ('data_isItemOnStage' in item) {
            workspaceItem.ignore = !item.data_isItemOnStage;
        }

        if ('data_color' in item && item.data_color) {
            workspaceItem.color = item.data_color.value;
        }

        if ('data_mount' in item && item.data_mount) {
            if (item.data_mount.value.startsWith('flipped')) {
                workspaceItem.scale = [1, -1, 1];
            }
            else if (item.data_mount.value.startsWith('stdMount')) {
                workspaceItem.scale = [1, 1, 1];
            }
            else {
                workspaceItem.mount = item.data_mount.value;
            }
        }

        if (item.data_deviceid.startsWith('ceilingMount')) {
            workspaceItem.scale = [1, item.data_vHeight, 1];
        }

        if (item.data_deviceid === 'ceilingMic') {
            workspaceItem.sphere = 'quarter';
        }

        if (item.data_hiddenInDesigner) {
            workspaceItem.hidden = true;
        }

        if ('data_vHeight' in item && item.data_vHeight && item.data_deviceid === 'pathShape') {
            workspaceItem.thickness = item.data_vHeight;
        }

        if ('data_labelField' in item) {
            workspaceItem = parseDataLabelFieldJson(item, workspaceItem);
        }

        if ('vertOffset' in workspaceItem) {
            delete workspaceItem.vertOffset;
        }

        if ('yOffset' in workspaceItem) {
            delete workspaceItem.yOffset;
        }

        if ('xOffset' in workspaceItem) {
            delete workspaceItem.xOffset;
        }

        workspaceObj.customObjects.push(workspaceItem);
    }

    function workspaceObjDisplayPush(item) {
        let x, y;
        let z = displayHeight / 1000;
        let displayScale = item.data_diagonalInches / diagonalInches;
        const attr = getWorkspaceKey(item.data_deviceid) || {};

        if (item.data_deviceid === 'display21_9') {
            z = displayHeight21_9 / 1000;
            displayScale = item.data_diagonalInches / diagonalInches21_9;
            item.role = 'ultrawide';
        }

        z = z * displayScale / 2;

        if ('data_zPosition' in item) {
            if (item.data_zPosition != "") {
                z = item.data_zPosition + z;
            }
        }

        if ('yOffset' in attr || 'xOffset' in attr || 'data_labelField' in item) {
            let yOffset = 0;
            let xOffset = 0;

            if ('yOffset' in attr) yOffset = attr.yOffset;
            if ('xOffset' in attr) xOffset = attr.xOffset;

            if ('data_labelField' in item) {
                let labelParsed = parseDataLabelFieldJson(item);
                if (labelParsed) {
                    xOffset = labelParsed.xOffset || xOffset;
                    yOffset = labelParsed.yOffset || yOffset;
                }
            }

            let newXY = findNewTransformationCoordinate(item, xOffset, yOffset);
            item.y = newXY.y;
            item.x = newXY.x;
        }

        x = (item.x - (roomObj2.room.roomWidth) / 2);
        y = (item.y - (roomObj2.room.roomLength) / 2);

        let workspaceItem = {
            id: item.id,
            "position": [
                (swapXY ? x : y),
                z,
                (swapXY ? y : x)
            ],
            "rotation": [
                ((item.data_tilt) * (Math.PI / 180)) || 0,
                ((item.rotation) * -(Math.PI / 180)),
                ((item.data_slant) * (Math.PI / 180)) || 0,
            ],
            size: item.data_diagonalInches,
            "role": item.role
        };

        workspaceItem = { ...attr, ...workspaceItem };
        delete workspaceItem.idRegex;

        if ('data_role' in item && item.data_role) {
            workspaceItem.role = item.data_role.value;
        }

        if ('data_color' in item && item.data_color) {
            workspaceItem.color = item.data_color.value;
        }

        if ('data_mount' in item && item.data_mount) {
            workspaceItem.mount = item.data_mount.value;
        }

        if (item.data_hiddenInDesigner) {
            workspaceItem.hidden = true;
        }

        if ('data_labelField' in item) {
            workspaceItem = parseDataLabelFieldJson(item, workspaceItem);
        }

        if ('data_isItemOnStage' in item) {
            workspaceItem.ignore = !item.data_isItemOnStage;
        }

        if ('yOffset' in workspaceItem) {
            delete workspaceItem.yOffset;
        }

        if ('xOffset' in workspaceItem) {
            delete workspaceItem.xOffset;
        }

        workspaceObj.customObjects.push(workspaceItem);
    }

    function workspaceObjTablePush(item) {
        let x, y, z, vh, workspaceItem;
        z = 0;
        vh = 0;

        let xy = getItemCenter(item);
        const attr = getWorkspaceKey(item.data_deviceid) || {};

        x = (xy.x - roomObj2.room.roomWidth / 2);
        y = (xy.y - roomObj2.room.roomLength / 2);

        if ('yOffset' in attr || 'xOffset' in attr || 'data_labelField' in item) {
            let yOffset = 0;
            let xOffset = 0;

            if ('yOffset' in attr) yOffset = attr.yOffset;
            if ('xOffset' in attr) xOffset = attr.xOffset;

            if ('data_labelField' in item) {
                let labelParsed = parseDataLabelFieldJson(item);
                if (labelParsed) {
                    xOffset = labelParsed.xOffset || xOffset;
                    yOffset = labelParsed.yOffset || yOffset;
                }
            }

            let newXY = findNewTransformationCoordinate({ x: x, y: y, rotation: item.rotation }, xOffset, yOffset);
            y = newXY.y;
            x = newXY.x;
        }

        if ('data_zPosition' in item) {
            if (item.data_zPosition != "") z = item.data_zPosition;
        } else {
            z = 0;
        }

        if ('data_vHeight' in item) {
            if (item.data_vHeight != "") {
                vh = item.data_vHeight + vh;
            } else {
                vh = null;
            }
        }

        workspaceItem = {
            id: item.id,
            "position": [
                (swapXY ? x : y),
                z,
                (swapXY ? y : x)
            ],
            "rotation": [
                ((item.data_tilt) * (Math.PI / 180)) || 0,
                ((item.rotation) * -(Math.PI / 180)),
                ((item.data_slant) * (Math.PI / 180)) || 0,
            ],
            "width": item.width,
            "length": item.height
        };

        if (vh) {
            workspaceItem.height = vh;
        }

        if ('tblRectRadius' in item && item.data_deviceid != 'tblSchoolDesk') {
            workspaceItem.radius = item.tblRectRadius;
        }

        if ('tblRectRadiusRight' in item && item.data_deviceid != 'tblSchoolDesk') {
            workspaceItem.radiusRight = item.tblRectRadiusRight;
        }

        if (item.data_deviceid === 'tblSchoolDesk') {
            workspaceItem.rotation[1] = ((item.rotation - 180) * -(Math.PI / 180));
        }

        if (item.data_deviceid === 'couch') {
            workspaceItem.scale = [item.height, 1, 1];
            workspaceItem.rotation[1] = (item.rotation - 90) * -(Math.PI / 180);
        }

        if (item.data_deviceid === 'tblTrap') {
            if (item.data_trapNarrowWidth < item.width) {
                workspaceItem.width = Number(item.data_trapNarrowWidth);
                workspaceItem.taper = item.width - item.data_trapNarrowWidth;
            }
            else {
                workspaceItem.width = Number(item.width);
                workspaceItem.taper = 0;
            }
        }

        workspaceItem = { ...workspaceItem, ...attr };
        delete workspaceItem.idRegex;

        if ('data_role' in item && item.data_role) {
            workspaceItem.role = item.data_role.value;
        }

        if ('data_color' in item && item.data_color) {
            workspaceItem.color = item.data_color.value;
        }

        if ('data_mount' in item && item.data_mount) {
            workspaceItem.mount = item.data_mount.value;
        }

        if (item.data_hiddenInDesigner) {
            workspaceItem.hidden = true;
        }

        if ('yOffset' in workspaceItem) {
            delete workspaceItem.yOffset;
        }

        if ('xOffset' in workspaceItem) {
            delete workspaceItem.xOffset;
        }

        if ('data_labelField' in item) {
            workspaceItem = parseDataLabelFieldJson(item, workspaceItem);
        }

        workspaceObj.customObjects.push(workspaceItem);
    }

    /**
     * Push a wall-like object (wall, floor, ceiling, box, etc.) to the workspace.
     * @param {Object} item - The item to push
     * @param {string} [objectType='wall'] - The workspace objectType (e.g., 'wall', 'floor', 'ceiling')
     */
    function workspaceObjWallPush(item, objectType = 'wall') {
        let x, y, z, verticalHeight, workspaceItem;

        let xy = getItemCenter(item);
        const attr = getWorkspaceKey(item.data_deviceid) || {};

        x = (xy.x - roomObj2.room.roomWidth / 2);
        y = (xy.y - roomObj2.room.roomLength / 2);

        verticalHeight = defaultWallHeight;

        if ('data_vHeight' in item && item.data_vHeight) {
            verticalHeight = item.data_vHeight;
        } else {
            verticalHeight = roomObj2.room.roomHeight || defaultWallHeight;
        }

        if (isNaN(verticalHeight)) {
            verticalHeight = Number(defaultWallHeight);
        }

        if ('data_zPosition' in item) {
            if (item.data_zPosition != "") {
                z = item.data_zPosition + (verticalHeight / 2);
            } else {
                z = (verticalHeight / 2);
            }
        } else {
            z = (verticalHeight / 2);
        }

        if (item.data_deviceid === 'sphere') {
            z = item.data_zPosition + (item.width / 2);
        }

        if (item.data_deviceid === 'carpet') {
            z = Math.round((z - 0.005) * 100) / 100;
        }

        workspaceItem = {
            "objectType": objectType,
            id: item.id,
            "position": [
                (swapXY ? x : y),
                z,
                (swapXY ? y : x)
            ],
            "rotation": [
                ((item.data_slant) * -(Math.PI / 180)) || 0,
                ((item.rotation - 90) * -(Math.PI / 180)),
                ((item.data_tilt) * (Math.PI / 180)) || 0,
            ],
            "height": verticalHeight,
            "length": item.width,
            "width": item.height,
        };

        if (item.data_deviceid === 'boxRoomPart' || item.data_deviceid === 'polyRoom') {
            workspaceItem.hidden = true;
            workspaceItem.opacity = 0.01;
        }

        if (item.data_deviceid === 'sphere') {
            workspaceItem.radius = item.width / 2;
            delete workspaceItem.width;
            delete workspaceItem.height;
            delete workspaceItem.rotation;
        }

        if (item.data_deviceid === 'cylinder') {
            workspaceItem.radius = item.width / 2;
            if ('data_vHeight' in item && item.data_vHeight) {
                workspaceItem.length = item.data_vHeight;
            } else {
                workspaceItem.length = roomObj2.room.roomHeight || defaultWallHeight;
            }

            workspaceItem.rotation[0] = ((item.data_tilt) * (Math.PI / 180)) || 0;
            workspaceItem.rotation[1] = ((item.rotation) * -(Math.PI / 180)) || 0;
            workspaceItem.rotation[2] = ((item.data_slant) * (Math.PI / 180)) || 0;

            delete workspaceItem.width;
            delete workspaceItem.height;
        }

        // Ceiling objects use scale instead of dimensions
        if (objectType === 'ceiling') {
            workspaceItem.scale = [item.height, verticalHeight, item.width];
            delete workspaceItem.height;
            delete workspaceItem.length;
            delete workspaceItem.width;
        }

        // Merge with device catalog attributes (may override objectType for catalog items)
        workspaceItem = { ...workspaceItem, ...attr };
        delete workspaceItem.idRegex;

        if ('data_role' in item && item.data_role) {
            workspaceItem.role = item.data_role.value;
        }

        if ('data_color' in item && item.data_color) {
            workspaceItem.color = item.data_color.value;
        }

        if ('data_mount' in item && item.data_mount) {
            workspaceItem.mount = item.data_mount.value;
        }

        if (item.data_hiddenInDesigner) {
            workspaceItem.hidden = true;
        }

        if ('data_labelField' in item) {
            workspaceItem = parseDataLabelFieldJson(item, workspaceItem);
        }

        workspaceObj.customObjects.push(workspaceItem);
    }

    return workspaceObj;
}

// ============================================
// DOWNLOAD FUNCTIONS
// ============================================

/**
 * Download workspace object as JSON file.
 * @param {Object} workspaceObj - Workspace object to download
 */
export function downloadJsonWorkspaceFile(workspaceObj) {
    let downloadRoomName;
    const link = document.createElement("a");
    const content = JSON.stringify(workspaceObj, null, 5);
    const file = new Blob([content], { type: 'text/plain' });
    link.href = URL.createObjectURL(file);
    downloadRoomName = workspaceObj.title.replace(/[/\\?%*:|"<>]/g, '-');
    downloadRoomName = downloadRoomName.trim() + '.json';
    link.download = downloadRoomName;
    link.click();
    URL.revokeObjectURL(link.href);
}

// ============================================
// GLOBAL EXPORT
// ============================================

if (typeof window !== 'undefined') {
    window.VRC_WorkspaceExport = {
        exportRoomObjToWorkspace,
        convertToMeters,
        parseDataLabelFieldJson,
        addDefaultsToWorkspaceObj,
        downloadJsonWorkspaceFile
    };
}
