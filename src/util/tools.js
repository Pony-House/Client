import { Toast } from '@capacitor/toast';
import { Capacitor } from '@capacitor/core';

import tinyAPI from './mods';
import { twemojify } from './twemojify';
import moment from './libs/momentjs';

let resizePlace = null;
let resizeTimeout = null;
let head;

// Zoom Validator
const tinyAppZoomValidator = (value) => !Number.isNaN(value) && Number.isFinite(value) ? value >= 50 ? value <= 200 ? value : 200 : 100 : 100;

// Blob Creator
const blobCreator = (result) => {

    if (typeof result === 'string') {

        const arr = result.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);

        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }

        return new Blob([u8arr], { type: mime });

    }

    return new Blob([], { type: 'text/plain' });

};

// Export
export { tinyAppZoomValidator, blobCreator };

// Message to number
export function textValueToNumber(text = '', nb = 11) {

    const encodedMsg = Buffer.from(String(text))
        .toString('base64')
        .split('');

    encodedMsg.forEach((item, index, array) => {
        array[index] = item.charCodeAt(0);
    });

    return encodedMsg.reduce((a, b) => a + b, 0) % nb;

}

global.textValueToNumber = textValueToNumber;

// Check DOM Visible
export function checkVisible(elm) {
    const rect = elm.getBoundingClientRect();
    const viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
    return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
}

// Is Window Visible
export function checkVisibleWindow() {
    return $('body').hasClass('windowVisible');
}

// HL JS fixer
export function hljsFixer(el, where) {

    if (where === 'MessageBody') {

        el.html(`<table class="table table-borderless align-middle m-0"><tbody><tr><td class="code-line noselect">1</td><td class="code-text">${el.html()}</tbody></table>`);
        el.addClass('fixhl');
        let countBr = 1;

        el.html(el.html().replace(/(?:\r\n|\r|\n)/g, () => {
            countBr++;
            return `</td></tr><tr><td class="code-line noselect">${countBr}</td><td class="code-text">`;
        })).on("dblclick", () => {
            if (!el.hasClass('hljs-fullview')) {
                el.addClass('hljs-fullview');
            } else {
                el.removeClass('hljs-fullview');
            }
        });;

    }

};

export function toast(msg, title) {
    return new Promise((resolve, reject) => {
        if (Capacitor.isNativePlatform()) {
            Toast.show({ text: msg }).then(resolve).catch(reject);
        } else { resolve(alert(msg, title)); }
    });
};

// Check Resize css Fixer
const tinyResizeFixer = (timeout = 500) => {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {

        // Insert Style into head
        if (!resizePlace) {
            if (!head) head = document.head || document.getElementsByTagName('head')[0];
            if (head) {

                // Exist DOM
                const resizePlaceDOM = head.querySelector('style#resize-place');

                // Create One
                if (!resizePlaceDOM) {
                    resizePlace = document.createElement('style');
                    resizePlace.id = 'resize-place';
                    head.appendChild(resizePlace);
                }

                // Update Value
                else {
                    resizePlace = resizePlaceDOM;
                }

                // eslint-disable-next-line no-use-before-define
            } else { setTimeout(() => resizeWindowChecker(), 1); return; }
        }

        let heightModalFullSize = 159;
        if (window.matchMedia('screen and (max-width: 768px)').matches) {
            heightModalFullSize -= 58;
        }

        // Room View
        const newTinyHTML = `
            .height-full-size {
                height: ${$(document).height()}px;
            }

            .height-modal-full-size {
                height: ${$(document).height() - heightModalFullSize}px;
            }
        `;

        const roomView = document.querySelector('.room-view');
        if (roomView) {

            let removeValue = 130;
            if (window.matchMedia('screen and (max-width: 768px)').matches) {
                removeValue -= 30;
            }

            let emojiWidth = $('.room-view__sticky').get(0)?.offsetHeight - 85;
            if (Number.isNaN(emojiWidth) || !Number.isFinite(emojiWidth)) {
                emojiWidth = 0;
            }

            $(resizePlace).html(`${newTinyHTML}
                
                .chatbox-size-fix {
                    width: ${roomView.offsetWidth - removeValue}px!important;
                }

                .room-search__result-item .chatbox-size-fix {
                    width: ${roomView.offsetWidth - removeValue - 50}px!important;
                }

                @media (max-width: 576px) {
                    .emoji-board-tippy {
                        transform: translate(0px, -${emojiWidth}px) !important;
                    }
                }

            `);

        } else { $(resizePlace).html(newTinyHTML); }

    }, timeout);
};

export function resizeWindowChecker(timeout = 500) { return tinyResizeFixer(timeout); };
export function scrollFixer(event) { tinyAPI.emit('mouseWheel', event); };

export function dialogWindow(data1, data2) {

    const newData = $('<div>', {
        id: data1.id,
        title: data1.title
    }).append(data1.html);

    $("body").append(newData);
    newData.dialog(data2);

};

export function btAlert(where, alertType, icon, text) {
    $(where)
        .empty()
        .append($("<div>", {
            class: `alert alert-${alertType} alert-dismissible fade show`
        }).append(
            $("<button>", { class: "close", "data-dismiss": "alert", type: "button" }).append(
                $("<span>", { "aria-hidden": true, class: "text-secondary" }).text("×")
            ),
            $("<i>", { class: icon }), " ", text));
};

export function btModal(data) {

    if (typeof data.dialog !== "string") { data.dialog = ''; }

    let footer = null;
    if (data.footer) {
        footer = $("<div>", { class: "modal-footer" }).append(data.footer);
    }

    const modal = $("<div>", { class: "fade modal", id: data.id, tabindex: -1, role: "dialog", 'aria-hidden': true, 'aria-modal': 'true', }).append(
        $("<div>", { class: `modal-dialog ${data.dialog} modal-popup modal-dialog-scrollable` }).append(
            $("<div>", { class: "modal-content" }).append(

                typeof data.title === 'string' ? $("<div>", { class: "noselect modal-header" }).append(
                    $("<div>", { class: "h5 emoji-size-fix modal-title h4" }).text(data.title),
                    $("<button>", { type: "button", class: "btn-close", "data-bs-dismiss": "modal", 'aria-label': 'Close' })
                ) : null,

                $("<div>", { class: `modal-body bg-bg2${typeof data.bodyClass === 'string' ? ` ${data.bodyClass}` : ''}` }).append(data.body),
                footer,

            )
        )
    );

    $("body").append(modal);
    let modalControl;

    if (typeof data.cfg !== 'string') {
        modalControl = new bootstrap.Modal(modal.get(0), data.cfg);
    } else {
        modalControl = new bootstrap.Modal(modal.get(0));
    }

    modal.get(0).addEventListener('hidden.bs.modal', () => {

        $('body > .modal-temp-hide').removeClass('modal-temp-hide').fadeIn();

        modal.remove();
        if (typeof data.hidden === "function") {
            data.hidden();
        }

    });

    $('body > .modal, body > .modal-backdrop').addClass('modal-temp-hide').fadeOut();
    modalControl.show();
    return modalControl;

};

global.alert = (text = '', title = 'App Alert') => btModal({
    id: 'browser-alert',
    dialog: 'modal-dialog-centered modal-dialog-scrollable',
    bodyClass: 'small text-freedom noselect p-4',
    title,
    body: twemojify(text),
});

export function formatBytes(bytes, decimals = 2) {

    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    // eslint-disable-next-line prefer-exponentiation-operator, no-restricted-properties
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;

};

export function capitalize(text) {
    return text.replace(/\b\w/g, (l) => l.toUpperCase());
};

export function dice(obj) {
    return Number(Math.floor(Math.random() * ((obj - 1) + 1) + 1));
};

global.dice = dice;

export function percentage(preco, porcentagem) {
    return preco * (porcentagem / 100);
};

export function rule3(val1, val2, val3, inverse) {

    if (inverse === true) {
        return Number(val1 * val2) / val3;
    }

    return Number(val3 * val2) / val1;

};

export function objType(obj, type) {

    // Is Defined
    if (typeof obj !== "undefined") {

        // Check Obj Type
        if (typeof type === "string") {

            if (Object.prototype.toString.call(obj).toLowerCase() === `[object ${type}]`) {
                return true;
            }

            return false;
        }

        // Get Obj Type

        // Result
        const result = Object.prototype.toString.call(obj).toLowerCase();

        // Send Result
        return result.substring(8, result.length - 1);

    }

    // Nope
    return null;

};

export function countObj(obj) {

    // Is Array
    if (Array.isArray(obj)) {
        return obj.length;
    }

    // Object
    if (objType(obj, 'object')) {
        return Object.keys(obj).length;
    }

    // Nothing
    return 0;

};


// Time Duration
export function timeDuration(timeData = 0, durationType = 'asSeconds', now = null) {

    // Number
    if (typeof timeData !== 'undefined') {

        if (!now) { now = moment(); }

        const duration = moment.duration(now.clone().add(timeData, 'milliseconds').diff(now.clone()));
        const result = duration[durationType]();

        // Complete
        return result;

    }

    // Nope
    return null;

};

export function momentCountdown(callbackStart, eventTime, currentTime = moment(), interval = 1000) {

    const diffTime = eventTime.valueOf() - currentTime.valueOf();
    let duration = moment.duration(diffTime, 'milliseconds');

    const tinyCountDown = () => {

        duration = moment.duration(duration + interval, 'milliseconds');

        const hours = duration.hours();
        const minutes = duration.minutes();
        const seconds = duration.seconds();

        callbackStart(`${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : hours}:${seconds < 10 ? `0${seconds}` : seconds}`);

    };

    tinyCountDown();
    return setInterval(tinyCountDown, interval);

}

// Age
export function getAge(timeData = 0, now = null) {

    // Number
    if (typeof timeData !== 'undefined') {

        if (!now) { now = moment(); }

        const birthday = moment(timeData);
        const age = Math.abs(birthday.diff(now, 'years'));
        return age;

    }

    // Nope
    return null;

};

// Scroll Follower
export function scrollFollower(where, where2, time1 = 60, time2 = 8.33) {
    for (let i = 0; i < time1; i++) {
        setTimeout(() => {
            $(where).css('transform', `translateY(${$(where2).scrollTop()}px)`);
        }, time2 * i);
    }
};

// Tiny Confirm
export function tinyPrompt(text = '', title = 'App Alert', inputObj = {}, onInput = {}) {
    return new Promise((resolve) => {

        const inputSettings = { class: 'form-control form-control-bg mt-2' };
        if (objType(inputObj, 'object')) {
            for (const item in inputObj) {
                inputSettings[item] = inputObj[item];
            }
        }

        let value = null;
        let tinyModal;

        const input = $('<input>', inputSettings);
        const tinyComplete = () => {
            value = input.val();
            tinyModal.hide();
        };

        tinyModal = btModal({

            id: 'browser-alert',
            dialog: 'modal-dialog-centered modal-dialog-scrollable',
            bodyClass: 'small text-freedom noselect p-4',
            title,
            body: [twemojify(text), input,],

            footer: [
                $('<button>', { class: 'btn btn-bg mx-2' }).text('Cancel').on('click', () => tinyModal.hide()),
                $('<button>', { class: `btn btn-primary mx-2` }).text('Confirm').on('click', tinyComplete),
            ],

            hidden: () => resolve(value)

        });

        input.on('keyup', (e) => {
            if (e.key === 'Enter' || e.keyCode === 13) tinyComplete();
        });

        if (objType(onInput, 'object')) {
            for (const item in onInput) {
                if (typeof onInput[item] === 'function') input.on(item, onInput[item]);
            }
        }

        setTimeout(() => input.focus(), 500);

    });
};

export function tinyConfirm(text = '', title = 'App Alert') {
    return new Promise((resolve) => {

        let isConfirmed = false;
        let tinyModal;

        const tinyComplete = () => {
            isConfirmed = true;
            tinyModal.hide();
        };

        tinyModal = btModal({

            id: 'browser-alert',
            dialog: 'modal-dialog-centered modal-dialog-scrollable',
            bodyClass: 'small text-freedom noselect p-4',
            title,
            body: twemojify(text),

            footer: [
                $('<button>', { class: 'btn btn-bg mx-2' }).text('Cancel').on('click', () => tinyModal.hide()),
                $('<button>', { class: `btn btn-primary mx-2` }).text('Confirm').on('click', tinyComplete),
            ],

            hidden: () => resolve(isConfirmed)

        });

    });
};

// eslint-disable-next-line no-extend-native
Date.prototype.isValid = function () {

    // If the date object is invalid it
    // will return 'NaN' on getTime()
    // and NaN is never equal to itself
    // eslint-disable-next-line no-self-compare
    return this.getTime() === this.getTime();
};