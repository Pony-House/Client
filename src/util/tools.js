let resizePlace = null;
let head;

// Check DOM Visible
export function checkVisible(elm) {
    const rect = elm.getBoundingClientRect();
    const viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
    return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
}

export function hljsFixer(element, where) {
    if (where === 'MessageBody') {

        element.innerHTML = `<table class="table table-borderless align-middle m-0"><tbody><tr><td class="code-line">1</td><td>${element.innerHTML}</tbody></table>`;
        element.classList.add('fixhl');
        let countBr = 1;

        element.innerHTML = element.innerHTML.replace(/(?:\r\n|\r|\n)/g, data => {
            countBr++;
            return `</td></tr><tr><td class="code-line">${countBr}</td><td>`;
        });

    }
};

// Check Resize css Fixer
export function resizeWindowChecker(timeout = 500) {
    setTimeout(() => {

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

            } else { setTimeout(() => resizeWindowChecker(), 1); }
        }

        // Room View
        const roomView = document.querySelector('.room-view');
        if (roomView) {

            let removeValue = 130;
            if (window.matchMedia('screen and (max-width: 768px)').matches) {
                removeValue -= 30;
            }

            resizePlace.innerHTML = `
                .chatbox-size-fix {
                    width: ${roomView.offsetWidth - removeValue}px!important;
                }
            `;

        }

    }, timeout);
}