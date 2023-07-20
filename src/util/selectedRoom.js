import initMatrix from '../client/initMatrix';

const eventType = 'io.pony.house.';

function getDataFolderRaw(dataFolder) {
    return initMatrix.matrixClient.getAccountData(eventType + dataFolder)?.getContent() ?? {};
}

export function getDataList(where, dataFolder) {
    return getDataFolderRaw(dataFolder)[where];
}

export function addToDataFolder(spaceData, where, dataFolder) {

    const tinyData = getDataFolderRaw(dataFolder);
    const i = tinyData[where].findIndex(([u]) => u && u.id === spaceData.id);

    let entry;

    if (i < 0) {
        entry = [spaceData, 1];
    } else {
        [entry] = tinyData[where].splice(i, 1);
        entry[1] += 1;
    }
    tinyData[where].unshift(entry);

    tinyData[where] = tinyData[where].slice(0, 100);
    initMatrix.matrixClient.setAccountData(eventType + dataFolder, tinyData);

}

export function removeDataFolder(spaceData, where, dataFolder) {

    const tinyData = getDataFolderRaw(dataFolder);

    let index = 0;
    while (index > -1) {
        index = tinyData[where].findIndex(([u]) => u && u.id === spaceData.id);
        if (index > -1) {
            tinyData[where].splice(index, 1);
        }
    }

    initMatrix.matrixClient.setAccountData(eventType + dataFolder, tinyData);

}

// getDataList('hc', 'space_temp_data');

let room;
export function setSelectRoom(body) {
    room = body;
};

export function getSelectRoom() {
    return room;
};

let space;
export function setSelectSpace(body) {
    space = body;
};

export function getSelectSpace() {
    return space;
};

export function getSpaceItem(name) {
    if (space && global.localStorage && typeof name === 'string' && name.length > 0) {
        return global.localStorage.getItem(`${space.roomId}_${name}`);
    }
    return null;
};

export function setSpaceItem(name, data) {
    if (space && global.localStorage && typeof name === 'string' && name.length > 0) {
        return global.localStorage.setItem(`${space.roomId}_${name}`, data);
    }
    return null;
};

export function removeSpaceItem(name) {
    if (space && global.localStorage && typeof name === 'string' && name.length > 0) {
        return global.localStorage.removeItem(`${space.roomId}_${name}`);
    }
    return null;
};