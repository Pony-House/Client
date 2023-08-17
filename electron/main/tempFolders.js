import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import { fileURLToPath } from 'url';

// Insert utils
const createDirName = (where) => {
    const __filename = fileURLToPath(where);
    const __dirname = path.dirname(__filename);
    return { __filename, __dirname };
};

// Validate Folders
const tempFolder = path.join(app.getPath('temp'), './pony-house-matrix');
if (!fs.existsSync(tempFolder)) {
    fs.mkdirSync(tempFolder);
}

const tempFolderNoti = path.join(tempFolder, './notification');
if (!fs.existsSync(tempFolderNoti)) {
    fs.mkdirSync(tempFolderNoti);
}

export { createDirName, tempFolder, tempFolderNoti };