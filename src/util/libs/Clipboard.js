import forPromise from 'for-promise';

// Emitter
class TinyClipboard {
  constructor() {
    this.existNavigator =
      typeof navigator.clipboard !== 'undefined' && navigator.clipboard !== null;
    this.existExecCommand =
      typeof document.execCommand !== 'undefined' && document.execCommand !== null;
    return this;
  }

  // Copy text
  copyText(text) {
    // Clipboard API
    if (this.existNavigator) {
      const tinyThis = this;
      return navigator.clipboard.writeText(text);
    }
    // Classic API
    else if (this.existExecCommand) {
      const host = document.body;
      const copyInput = document.createElement('input');
      copyInput.style.position = 'fixed';
      copyInput.style.opacity = '0';
      copyInput.value = text;
      host.append(copyInput);

      copyInput.select();
      copyInput.setSelectionRange(0, 99999);
      const result = document.execCommand('Copy');
      copyInput.remove();
      return new Promise((resolve) => resolve(result));
    }
    throw new Error('Clipboard API not found!');
  }

  // Copy blob text
  async copyBlobText(text) {
    const tinyThis = this;
    return new Promise((resolve, reject) => {
      if (tinyThis.existNavigator) {
        const type = 'text/plain';
        const blob = new Blob([text], { type });
        const data = [new ClipboardItem({ [type]: blob })];
        navigator.clipboard.write(data).then(resolve).catch(reject);
      } else {
        reject(new Error('Clipboard API not found!'));
      }
    });
  }

  // Copy blob data
  copyBlob(blob) {
    const tinyThis = this;
    return new Promise((resolve, reject) => {
      if (tinyThis.existNavigator) {
        navigator.clipboard
          .write([
            new ClipboardItem({
              [blob.type]: blob,
            }),
          ])
          .then(resolve)
          .catch(reject);
      } else {
        reject(new Error('Clipboard API not found!'));
      }
    });
  }

  // Read text
  readText(index = 0) {
    return this.readData(index, 'text');
  }

  readAllTexts(index = 0) {
    return this.readData(null, 'text');
  }

  // Read specific blob mime
  readCustom(mimeFormat = null, fixValue = false, index = 0) {
    return this.readData(index, 'custom', mimeFormat, fixValue);
  }

  readAllCustom(mimeFormat = null, fixValue = false) {
    return this.readData(null, 'custom', mimeFormat, fixValue);
  }

  // Parse blob file
  _handleBlob(type, clipboardItem) {
    return clipboardItem.getType(type);
  }

  // Parse text file
  _handleText(type, clipboardItem) {
    return clipboardItem.getType(type).then((blob) => blob.text());
  }

  // Read data
  readAllData(type = null, mimeFormat = null) {
    return this.readData(null, type, mimeFormat);
  }

  readData(index = 0, type = null, mimeFormat = null, fixValue = false) {
    const tinyThis = this;
    return new Promise((resolve, reject) => {
      tinyThis
        .read(index)
        .then((items) => {
          if (items) {
            const finalResult = [];

            // Complete task
            let continueLoop = true;
            const completeTask = (mimeType, item) => {
              if (continueLoop) {
                // Custom
                if (
                  (type === null || type === 'custom') &&
                  typeof mimeFormat === 'string' &&
                  ((!fixValue && mimeType.startsWith(mimeFormat)) ||
                    (fixValue && mimeType === mimeFormat))
                ) {
                  continueLoop = false;
                  return tinyThis._handleBlob(mimeType, item).then((result) => {
                    if (result) finalResult.push(result);
                  });
                }

                // Text
                else if ((type === null || type === 'text') && mimeType === 'text/plain') {
                  continueLoop = false;
                  return tinyThis._handleText(mimeType, item).then((result) => {
                    if (result) finalResult.push(result);
                  });
                }

                // Blob
                else if (type === null) {
                  continueLoop = false;
                  return tinyThis._handleBlob(mimeType, item).then((result) => {
                    if (result) finalResult.push(result);
                  });
                }

                // Nothing
                else {
                  return new Promise((resolve) => {
                    resolve(null);
                  });
                }
              } else {
                return new Promise((resolve) => {
                  resolve(null);
                });
              }
            };

            // Specific Item
            if (
              typeof index === 'number' &&
              !Number.isNaN(index) &&
              Number.isFinite(index) &&
              index > -1
            ) {
              forPromise({ data: items.types }, (tIndex, fn, fn_error) =>
                completeTask(items.types[tIndex], items)
                  .then(() => fn())
                  .catch(fn_error),
              )
                .then(() => {
                  if (finalResult[0]) resolve(finalResult[0]);
                  else resolve(null);
                })
                .catch(reject);
            }

            // All
            else if (Array.isArray(items)) {
              forPromise({ data: items }, (tIndex, fn, fn_error, extra) => {
                const extraForAwait = extra({ data: items[tIndex] });
                extraForAwait.run((tIndex2, fn2, fn_error2) =>
                  completeTask(items[tIndex].types[tIndex2], items[tIndex])
                    .then(() => fn2())
                    .catch(fn_error2),
                );
                fn();
              })
                .then(() => {
                  resolve(finalResult);
                })
                .catch(reject);
            }
          }

          // Noting
          else {
            resolve(null);
          }
        })
        // Fail
        .catch(reject);
    });
  }

  // Read all
  readAll() {
    return this.read(null);
  }

  // Read clipboard data
  read(index = 0) {
    const tinyThis = this;
    return new Promise((resolve, reject) => {
      if (tinyThis.existNavigator) {
        navigator.clipboard
          .read()
          .then((items) => {
            try {
              // Index is number
              if (typeof index === 'number') {
                // Specific item
                if (!Number.isNaN(index) && Number.isFinite(index) && index > -1) {
                  // Send specific item
                  if (items[index]) resolve(items[index]);
                  // Not found again
                  else resolve(null);
                  return;
                }
                // Not found
                return resolve(null);
              }
              // Get All
              return resolve(items);
            } catch (err) {
              // You're dead. Not big surprise
              reject(err);
            }
          })
          .catch(reject);
      } else {
        reject(new Error('Clipboard API not found!'));
      }
    });
  }
}

// Export
const tinyClipboard = new TinyClipboard();
export default tinyClipboard;

// DEV
if (__ENV_APP__.MODE === 'development') {
  global.tinyClipboard = tinyClipboard;
}
