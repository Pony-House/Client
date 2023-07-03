import $ from 'jquery';

let resizePlace = null;
let resizeTimeout = null;
let head;

// Check DOM Visible
export function checkVisible(elm) {
    const rect = elm.getBoundingClientRect();
    const viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
    return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
}

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
                    width: ${roomView.offsetWidth - removeValue - 190}px!important;
                }
            `);

        } else { setTimeout(() => resizeWindowChecker(), 1); }

    }, timeout);
}