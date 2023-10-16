const urlBase = './img/png/';
const favicon = {

    value: 'cinny.png'

};

export function favIconQuery() {
    return $('head > #app-favicon');
};

export function changeFavIcon(value) {
    if (typeof value === 'string') {

        const newValue = `${urlBase}${value}`;
        favicon.value = value;

        favIconQuery().attr('href', newValue);

    }
};

export function favIconValue() {
    return favicon.value;
};

export function checkerFavIcon() {
    setTimeout(() => {

        // Number of messages from rooms which has "All Messages" notifications enabled or when mentionned in a room with "Mentions & Keyword" notifications level.
        let directCount = 0;
        // Number of messages for rooms which has "Mentions & Keyword" notifications level set which does not directly mention you.
        let indirectCount = 0;

        // Retrieves notification badges
        const badges = $('.sidebar .notification-badge');
        for (const badge of badges) {

            indirectCount++;
            const nb = Number($(badges[badge]).text());

            if (!Number.isNaN(nb) && Number.isFinite(nb)) {
                directCount += nb;
            }

        }

        // Change Icon
        const finalNumber = directCount || indirectCount;
        if (finalNumber > 0) {
            changeFavIcon('cinny-unread-red.png');
            if (__ENV_APP__.electron_mode) {
                global.changeTrayIcon('cinny-unread-red.png');
                global.changeAppIcon('cinny-unread-red.png');
            }
        } else {
            changeFavIcon('cinny.png');
            if (__ENV_APP__.electron_mode) {
                global.changeTrayIcon('cinny.png');
                global.changeAppIcon('cinny.png');
            }
        }

    }, 100);
};