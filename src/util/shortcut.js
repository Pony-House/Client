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
document.addEventListener('keydown', keyPressDetect);
document.addEventListener('keyup', keyPressDetect);
document.addEventListener('keypress', keyPressDetect);

// Shift Nuller
export function shiftNuller(callback) {
    if (!isShift) callback();
}