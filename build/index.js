// eslint-disable-next-line import/no-extraneous-dependencies
import fse from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

import download from 'download-git-repo';

// Insert utils
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Twemoji
const twemoji = {};
twemoji.srcRep = path.join(__dirname, '../repositories/twemoji');
twemoji.srcDir = path.join(__dirname, '../repositories/twemoji/assets');
twemoji.destDir = path.join(__dirname, '../public/img/twemoji');

// Git Build
const gitBuild = (rep, name) => new Promise((resolve, reject) => {
    const ls = spawn(`cd "${rep}" && npm install && npm run build`, {
        shell: true
    });

    ls.stdout.on('data', data => {
        console.log(`[${name}] ${data}`);
    });

    ls.stderr.on('data', data => {
        console.log(`[${name}] ${data}`);
    });

    ls.on('error', (err) => {
        console.log(`[${name}] ${err.message}`);
        reject(err);
    });

    ls.on('close', code => {
        console.log(`[${name}] child process exited with code ${code}`);
        resolve(code);
    });
});

// To copy a folder or file, select overwrite accordingly
try {

    // Removing old version
    let oldVersionsCount = 0;

    if (fse.existsSync(twemoji.srcRep)) {
        oldVersionsCount++;
        console.log(`[deps] Removing old twemoji cache...`);
        fse.rmSync(twemoji.srcRep, { recursive: true, force: true });
    }

    if (fse.existsSync(twemoji.destDir)) {
        oldVersionsCount++;
        console.log(`[deps] Removing old twemoji assets cache...`);
        fse.rmSync(twemoji.destDir, { recursive: true, force: true });
    }

    if (oldVersionsCount > 0) {
        console.log(`[deps] Cache removed!`);
    }

    // Start deps
    console.log(`[deps] Component installation has started!`);

    // Twemoji
    console.log(`[twemoji] Installing twemoji repository into the repositories folder...`);
    download('direct:https://github.com/twitter/twemoji/archive/refs/tags/v14.0.2.zip', twemoji.srcRep, (err2) => {
        if (err2) {
            console.error(err2);
        } else {
            console.log(`[twemoji] Twemoji repository complete!`);
            gitBuild(twemoji.srcRep, 'twemoji').then(() => {

                // Copying twemoji folders
                console.log(`[twemoji] Installing assets files into the public folder...`);
                fse.copySync(twemoji.srcDir, twemoji.destDir, { overwrite: true });
                console.log(`[twemoji] Success!`);

                // Frame extension
                console.log(`[deps] Complete!`);

            }).catch(console.error);
        }
    });

} catch (err) {
    console.error(err);
}