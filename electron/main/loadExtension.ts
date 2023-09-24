import { app, session } from 'electron';
import path from 'node:path';

const unPackedFolder = path
  .join(app.getAppPath(), './dist-electron')
  .replace('app.asar', 'app.asar.unpacked');
const isUnpacked = unPackedFolder.includes('app.asar.unpacked');
export { isUnpacked, unPackedFolder };

const loadExtension = async (where: string) => {
  if (isUnpacked) {
    try {
      await session.defaultSession.loadExtension(
        path.join(unPackedFolder, `./extensions/${where}`),
      );
      return true;
    } catch {
      try {
        await session.defaultSession.loadExtension(path.join(__dirname, `../extensions/${where}`));
        return true;
      } catch (err) {
        console.error(err);
        return false;
      }
    }
  } else {
    try {
      await session.defaultSession.loadExtension(path.join(__dirname, `../extensions/${where}`));
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }
};

export default loadExtension;
