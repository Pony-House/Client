let resizePlace = null;
let head;

// Check DOM Visible
export function checkVisible(elm) {
    const rect = elm.getBoundingClientRect();
    const viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
    return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
}

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

            console.log(roomView.offsetWidth);

        }

    }, timeout);
}