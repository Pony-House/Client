import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Insert utils
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const indexFile = path.join(__dirname, '../../index.js');
fs.writeFileSync(indexFile, `import('expo/AppEntry.js');`);