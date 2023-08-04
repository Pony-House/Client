import initMatrix from '../client/initMatrix';

const eventType = 'io.pony.house.';

function getDataFolderRaw(dataFolder, where) {
    const tinyTemplate = {};
    tinyTemplate[where] = [];
    return initMatrix.matrixClient.getAccountData(eventType + dataFolder)?.getContent() ?? tinyTemplate;
}

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

export function getDataList(dataFolder, folderName, where) {

    const data = getDataFolderRaw(dataFolder, folderName)[folderName];
    let result = null;

    try {
        result = data.find(([u]) => u && u.id === where)[0].value;
    } catch (err) {
        result = null;
    }

    return result;

}

export function addToDataFolder(dataFolder, folderName, where, data, limit = 100) {

    const tinyData = getDataFolderRaw(dataFolder, folderName);
    const i = tinyData[folderName].findIndex(([u]) => u && u.id === where);

    let entry;

    if (i < 0) {
        entry = [{ value: data, id: where }, 1];
    } else {
        [entry] = tinyData[folderName].splice(i, 1);
        entry[0].value = data;
        entry[1] += 1;
    }

    tinyData[folderName].unshift(entry);

    tinyData[folderName] = tinyData[folderName].slice(0, limit);
    initMatrix.matrixClient.setAccountData(eventType + dataFolder, tinyData);

}

export function removeFromDataFolder(dataFolder, folderName, where) {

    const tinyData = getDataFolderRaw(dataFolder, folderName);

    let index = 0;
    while (index > -1) {
        index = tinyData[folderName].findIndex(([u]) => u && u.id === where);
        if (index > -1) {
            tinyData[folderName].splice(index, 1);
        }
    }

    initMatrix.matrixClient.setAccountData(eventType + dataFolder, tinyData);

}