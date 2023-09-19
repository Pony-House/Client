// eslint-disable-next-line import/no-extraneous-dependencies
import * as colors from 'console-log-colors';
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

const framelabs = {};
framelabs.srcDir = path.join(__dirname, '../electron/extensions/frame');

// To copy a folder or file, select overwrite accordingly
try {

    console.log(`${colors.blue('[deps]')} Component installation has started!`);

    console.log(`${colors.blue('[twemoji]')} Installing twemoji repository into the repositories folder...`);
    download('direct:https://github.com/twitter/twemoji/archive/refs/tags/v14.0.2.zip', twemoji.srcRep, (err) => {
        if (err) {
            console.error(err);
        } else {

            console.log(`${colors.blue('[twemoji]')} Twemoji repository complete!`);
            console.log(`${colors.blue('[twemoji]')} Installing assets files into the public folder...`);
            fse.copySync(twemoji.srcDir, twemoji.destDir, { overwrite: true });
            console.log(`${colors.blue('[twemoji]')} Success!`);

            console.log(`${colors.blue('[frame-labs-extension]')} Installing chrome extension files into the electron folder...`);
            download('direct:https://github.com/frame-labs/frame-extension/archive/refs/tags/v0.10.2.zip', framelabs.srcDir, (err1) => {
                if (err1) {
                    console.error(err1);
                } else {

                    const ls = spawn(`cd "${framelabs.srcDir}" && npm install && npm run build`, {
                        shell: true
                    });

                    ls.stdout.on('data', data => {
                        console.log(`${colors.blue('[frame-labs-extension]')} ${data}`);
                    });

                    ls.stderr.on('data', data => {
                        console.log(`${colors.blue('[frame-labs-extension]')} ${data}`);
                    });

                    ls.on('error', (err) => {
                        console.log(`${colors.blue('[frame-labs-extension]')} ${err.message}`);
                        console.error(err);
                    });

                    ls.on('close', code => {
                        console.log(`${colors.blue('[frame-labs-extension]')} child process exited with code ${code}`);
                        console.log(`${colors.blue('[deps]')} Complete!`);
                    });

                }
            });

        }
    });

} catch (err) {
    console.error(err);
}