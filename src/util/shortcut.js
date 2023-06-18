let key;
let isShift;

// Shift Hold Detector
document.addEventListener('keydown', (ev) => {

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
});

export function shiftNuller(callback) {
    if (!isShift) callback();
}