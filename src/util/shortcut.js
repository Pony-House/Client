let key;
let isShift;
const keyPressDetect = (ev) => {

    key = ev.code;
    isShift = ev.shiftKey; // typecast to boolean

    if (isShift) {

        switch (key) {
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

export function shiftNuller(callback) {
    if (!isShift) callback();
}