import $ from 'jquery';
import moment from 'moment-timezone';

let resizePlace = null;
let resizeTimeout = null;
let head;

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
        }));

    }

};

// Check Resize css Fixer
export function resizeWindowChecker(timeout = 500) {
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

            } else { setTimeout(() => resizeWindowChecker(), 1); return; }
        }

        // Room View
        const roomView = document.querySelector('.room-view');
        if (roomView) {

            let removeValue = 130;
            if (window.matchMedia('screen and (max-width: 768px)').matches) {
                removeValue -= 30;
            }

            $(resizePlace).html(`
                .chatbox-size-fix {
                    width: ${roomView.offsetWidth - removeValue}px!important;
                }

                .room-search__result-item .chatbox-size-fix {
                    width: ${roomView.offsetWidth - removeValue - 50}px!important;
                }
            `);

        } else { setTimeout(() => resizeWindowChecker(), 1); }

    }, timeout);
}

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

    const modal = $("<div>", { class: "modal fade", id: data.id, tabindex: -1, role: "dialog", }).on('hidden.bs.modal', () => {
        $(this).remove();
        if (typeof data.hidden === "function") {
            data.hidden();
        }
    }).append(
        $("<div>", { class: `modal-dialog ${data.dialog}`, role: "document" }).append(
            $("<div>", { class: "modal-content" }).append(

                $("<div>", { class: "modal-header" }).append(
                    $("<h5>", { class: "modal-title" }).text(data.title),
                    $("<button>", { type: "button", class: "btn-close", "data-bs-dismiss": "modal" })
                ),

                $("<div>", { class: "modal-body" }).append(data.body),
                $("<div>", { class: "modal-footer" }).append(data.footer)

            )
        )
    );

    $("body").prepend(modal);
    modal.modal();

};

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
