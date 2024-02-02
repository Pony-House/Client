let key;
let isShift;
let isCtrl;
const keyPressDetect = (ev) => {
  key = ev.code;
  isShift = ev.shiftKey; // typecast to boolean
  isCtrl = ev.ctrlKey; // typecast to boolean

  if (isShift) {
    switch (key) {
      case 'ShiftRight': // ignore shift key
        break;
      default:
        // do stuff here?
        break;
    }
  }

  if (isCtrl) {
    switch (key) {
      case 'ControlRight': // ignore Ctrl key
        break;
      default:
        // do stuff here?
        break;
    }
  }

  if (isShift && isCtrl) {
    switch (key) {
      case 'ControlRight': // ignore Ctrl key
        break;
      case 'ShiftRight': // ignore shift key
        break;
      default:
        // do stuff here?
        break;
    }
  }
};

// Shift Hold Detector
$(document).on('keydown', keyPressDetect);
$(document).on('keyup', keyPressDetect);
$(document).on('keypress', keyPressDetect);

// Shift Nuller
export function shiftNuller(callback, isInverse = false) {
  if (!isShift) callback();
  if (isInverse && isShift) callback();
}

// Ctrl Nuller
export function ctrlNuller(callback, isInverse = false) {
  if (!isCtrl) callback();
  if (isInverse && isCtrl) callback();
}
