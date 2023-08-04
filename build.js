// eslint-disable-next-line import/no-extraneous-dependencies
import * as colors from 'console-log-colors';
import fse from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

// Insert utils
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get Path
const srcDir = path.join(__dirname, '../repositories/twemoji/assets');
const destDir = path.join(__dirname, '../public/img/twemoji');

// To copy a folder or file, select overwrite accordingly
try {
    console.log(`${colors.blue('[twemoji]')} Installing assets files into the public folder...`);
    fse.copySync(srcDir, destDir, { overwrite: true });
    console.log(`${colors.blue('[twemoji]')} Success!`);
} catch (err) {
    console.error(err);
}