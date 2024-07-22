import forPromise from 'for-promise';
import { countObj } from 'for-promise/utils/lib.mjs';
import JSZip from 'jszip';
import FileSaver from 'file-saver';

import initMatrix, { fetchFn } from '@src/client/initMatrix';
import { setLoadingPage } from '@src/app/templates/client/Loading';
import moment from '../momentjs';
import EmojiEvents from './EmojiEvents';
import emojiEditor from './EmojiEditor';

export const supportedEmojiImportFiles = [
  'application/zip',
  'application/octet-stream',
  'application/x-zip-compressed',
  'multipart/x-zip',
];

export function getEmojiUsage(usage) {
  if (usage.includes('emoticon') && usage.includes('sticker')) return 'both';
  if (usage.includes('emoticon')) return 'emoticon';
  if (usage.includes('sticker')) return 'sticker';

  return 'both';
}

// Global Pack
export function addGlobalImagePack(roomId, stateKey) {
  const mx = initMatrix.matrixClient;
  const content = mx.getAccountData(EmojiEvents.EmoteRooms)?.getContent() ?? {};
  if (!content.rooms) content.rooms = {};
  if (!content.rooms[roomId]) content.rooms[roomId] = {};
  content.rooms[roomId][stateKey] = {};
  return mx.setAccountData(EmojiEvents.EmoteRooms, content);
}
export function removeGlobalImagePack(roomId, stateKey) {
  const mx = initMatrix.matrixClient;
  const content = mx.getAccountData(EmojiEvents.EmoteRooms)?.getContent() ?? {};
  if (!content.rooms) return Promise.resolve();
  if (!content.rooms[roomId]) return Promise.resolve();
  delete content.rooms[roomId][stateKey];
  if (Object.keys(content.rooms[roomId]).length === 0) {
    delete content.rooms[roomId];
  }
  return mx.setAccountData(EmojiEvents.EmoteRooms, content);
}

export function isGlobalPack(roomId, stateKey) {
  const mx = initMatrix.matrixClient;
  const globalContent = mx.getAccountData(EmojiEvents.EmoteRooms)?.getContent();
  if (typeof globalContent !== 'object') return false;

  const { rooms } = globalContent;
  if (typeof rooms !== 'object') return false;

  return rooms[roomId]?.[stateKey] !== undefined;
}

// Import Emoji
export function getEmojiImport(zipFile) {
  return new Promise((resolve, reject) => {
    try {
      JSZip.loadAsync(zipFile)
        .then(async (zip) => {
          const data = { title: null, client: null, items: {} };
          await forPromise({ data: zip.files }, async (item, fn, fn_error) => {
            try {
              const zipEntry = zip.files[item];
              if (!zipEntry.dir) {
                // Get Data
                const filePath = zipEntry.name.split('/');
                const fileType = filePath[0];
                const fileName = filePath[1] ? filePath[1].split('.') : ['', ''];

                // Image
                if (fileType === 'images') {
                  // Create obj
                  if (!data.items[fileName[0]]) data.items[fileName[0]] = {};

                  // Insert image
                  if (emojiEditor.allowedExt(fileName[1])) {
                    data.items[fileName[0]].file = await zip.file(zipEntry.name).async('blob');
                    data.items[fileName[0]].filename = fileName.join('.');
                  }
                }

                // Json
                else if (fileType === 'json') {
                  // Create obj
                  if (!data.items[fileName[0]]) data.items[fileName[0]] = {};
                  const file = JSON.parse(await zip.file(zipEntry.name).async('text'));

                  // Insert json
                  data.items[fileName[0]].shortcode =
                    typeof file.shortcode === 'string'
                      ? file.shortcode.trim().replace(/ /g, '')
                      : null;

                  data.items[fileName[0]].usage =
                    typeof file.usage === 'string' &&
                    (file.usage === 'emoticon' || file.usage === 'sticker' || file.usage === 'both')
                      ? file.usage
                      : null;

                  // Insert mxc
                  data.items[fileName[0]].mxc =
                    typeof file.mxc === 'string' && file.mxc.startsWith('mxc://')
                      ? file.mxc.trim().replace(/ /g, '').split('/')
                      : null;

                  if (
                    data.items[fileName[0]].mxc &&
                    data.items[fileName[0]].mxc.length === 4 &&
                    data.items[fileName[0]].mxc[0] &&
                    data.items[fileName[0]].mxc[1] === '' &&
                    data.items[fileName[0]].mxc[2] &&
                    data.items[fileName[0]].mxc[3]
                  ) {
                    data.items[fileName[0]].mxc = data.items[fileName[0]].mxc.join('/');
                  } else {
                    data.items[fileName[0]].mxc = null;
                  }
                }

                // Metadata
                else if (fileType === 'metadata.json') {
                  const file = JSON.parse(await zip.file(zipEntry.name).async('text'));
                  data.title = typeof file.title === 'string' ? file.title : null;
                  data.client = typeof file.client === 'string' ? file.client : null;
                }
              }
            } catch (err) {
              // Fail
              data.title = null;
              data.client = null;
              data.items = {};
              data.err = err;
              return fn_error(err);
            }

            // Complete
            fn();
          });

          // Delete invalid data
          if (typeof data.title === 'string' && data.title.length > 0 && countObj(data.items) > 0) {
            for (const item in data.items) {
              if (
                !data.items[item].file ||
                !data.items[item].filename ||
                !data.items[item].mxc ||
                !data.items[item].shortcode ||
                !data.items[item].usage
              )
                delete data.items[item];
            }
          } else {
            data.title = null;
            data.client = null;
            delete data.items;
            data.items = null;
            data.err = new Error('Invalid emoji pack!');
          }

          // Complete
          resolve(data);
        }, reject)
        .catch(reject);
    } catch (err) {
      reject(err);
    }
  });
}

// Export Emoji
export function emojiExport(title, images, roomId = null) {
  if (images.length > 0) {
    setLoadingPage('Exporting emojis...');
    try {
      const zip = new JSZip();
      const img = zip.folder('images');
      const errorFolder = zip.folder('error');
      const jsons = zip.folder('json');
      const fileData = {
        title,
        timestamp: moment().valueOf(),
        roomId,
        client: 'pony-house',
      };

      let count = 0;

      const mx = initMatrix.matrixClient;
      const validatorComplete = () => {
        if (count === images.length) {
          zip.file(`metadata.json`, JSON.stringify(fileData));

          zip
            .generateAsync({ type: 'blob' })
            .then((content) => {
              FileSaver.saveAs(content, `emojipack_${encodeURIComponent(title)}.zip`);
              setLoadingPage(false);
            })
            .catch((err) => {
              console.error(err);
              alert(err.message, 'Emoji Export Save Error');
              setLoadingPage(false);
            });
        }
      };

      images.map(([shortcode, image]) => {
        const fileUrl = new URL(initMatrix.mxcUrl.toHttp(image.mxc));
        const filename = encodeURIComponent(shortcode);
        fetchFn(fileUrl.href)
          .then((res) => {
            res.blob().then((blob) => {
              const mime = blob.type.split('/');
              if (mime[0] === 'image') {
                if (mime[1] === 'jpeg') mime[1] = 'jpg';
                img.file(`${filename}.${mime[1]}`, blob);
                jsons.file(
                  `${filename}.json`,
                  JSON.stringify({
                    mxc: image.mxc,
                    shortcode,
                    usage: getEmojiUsage(image.usage),
                  }),
                );
              }

              count++;
              validatorComplete();
            });
          })
          .catch((err) => {
            console.error(err);
            errorFolder.file(
              `${filename}.json`,
              JSON.stringify({
                message: err.message,
                code: err.code,
                mxc: image.mxc,
                shortcode,
                usage: getEmojiUsage(image.usage),
              }),
            );
            count++;
            validatorComplete();
          });
      });
    } catch (err) {
      console.error(err);
      alert(err.message, 'Emoji Export Error');
      setLoadingPage(false);
    }
  } else {
    alert('Emojis not found to export.', 'Emoji Export Error');
  }
}
