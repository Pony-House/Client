import EventEmitter from 'events';
import { eventMaxListeners } from '../matrixUtil';

// Emitter
class TinyClipboard extends EventEmitter {
  constructor() {
    super();
  }

  existNavigatorClipboard() {
    return typeof navigator.clipboard !== 'undefined' && navigator.clipboard !== null;
  }

  existExecCommand() {
    return typeof document.execCommand !== 'undefined' && document.execCommand !== null;
  }

  copyText(text) {
    if (this.existNavigatorClipboard()) {
      const tinyThis = this;
      return navigator.clipboard.writeText(text).then((result) => {
        tinyThis.emit('copyText', text, result);
        return result;
      });
    } else if (this.existExecCommand()) {
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
      this.emit('copyText', text, null);
      return result;
    }
    throw new Error('Clipboard API not found!');
  }

  async copyBlobText(text) {
    const tinyThis = this;
    return new Promise((resolve, reject) => {
      if (tinyThis.existNavigatorClipboard()) {
        const type = 'text/plain';
        const blob = new Blob([text], { type });
        const data = [new ClipboardItem({ [type]: blob })];
        navigator.clipboard
          .write(data)
          .then((result) => {
            tinyThis.emit('copyBlob', text, result);
            return result;
          })
          .then(resolve)
          .catch(reject);
      } else {
        reject(new Error('Clipboard API not found!'));
      }
    });
  }

  copyBlob(blob) {
    const tinyThis = this;
    return new Promise((resolve, reject) => {
      if (tinyThis.existNavigatorClipboard()) {
        navigator.clipboard
          .write([
            new ClipboardItem({
              [blob.type]: blob,
            }),
          ])
          .then((result) => {
            tinyThis.emit('copyBlob', text, result);
            return result;
          })
          .then(resolve)
          .catch(reject);
      } else {
        reject(new Error('Clipboard API not found!'));
      }
    });
  }

  parseData(index = null) {
    const tinyThis = this;
    return new Promise((resolve, reject) => {
      if (tinyThis.existNavigatorClipboard()) {
        navigator.clipboard
          .read()
          .then((items) => {
            try {
              if (typeof index === 'number') {
                if (!Number.isNaN(index) && Number.isFinite(index) && index > -1) {
                  if (items[index]) resolve(items[index]);
                  else resolve(null);
                  tinyThis.emit('readData', items);
                  return;
                }
                return resolve(null);
              }
              return resolve(items);
            } catch (err) {
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

const tinyClipboard = new TinyClipboard();
tinyClipboard.setMaxListeners(eventMaxListeners);

export default tinyClipboard;

if (__ENV_APP__.MODE === 'development') {
  global.tinyClipboard = tinyClipboard;
}
