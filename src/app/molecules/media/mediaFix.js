/* eslint-disable no-loop-func */
const chatboxQuery = '#chatbox-scroll';
const roomViewQuery = '> .room-view__content #chatbox';
const timeoutFixer = { i: 200, value: 10 };
let height = null;

export function fixScrollChat() {
    const scrollBar = $(chatboxQuery);
    const roomView = scrollBar.find(roomViewQuery);
    height = roomView.height();
    return {
        height, execute() {

            const oldHeight = height;
            const newHeight = roomView.height();
            height = newHeight;

            const diffHeight = newHeight - oldHeight;
            if (diffHeight > 0) scrollBar.animate({ scrollTop: scrollBar.scrollTop() + diffHeight }, 0);

        }
    };
};

export function tinyFixScrollChat(tinyI = timeoutFixer.i) {
    for (let i = 0; i < tinyI; i++) {
        setTimeout(() => {
            if (typeof height === 'number') {

                const scrollBar = $(chatboxQuery);
                const roomView = scrollBar.find(roomViewQuery);

                const oldHeight = height;
                const newHeight = roomView.height();
                height = newHeight;

                const diffHeight = newHeight - oldHeight;
                if (diffHeight > 0) scrollBar.animate({ scrollTop: scrollBar.scrollTop() + diffHeight }, 0);

            }
        }, timeoutFixer.value);
    }
};

export function mediaFix(itemEmbed, embedHeight, setEmbedHeight, isLoaded = true) {
    if (itemEmbed === null || (itemEmbed && itemEmbed.current)) {

        let embedHeight2;
        if (embedHeight === null) {
            embedHeight2 = fixScrollChat();
            setEmbedHeight(embedHeight2);
        }

        if (isLoaded) {

            // eslint-disable-next-line no-unused-expressions
            embedHeight ? embedHeight.execute() : embedHeight2.execute();

            for (let i = 0; i < timeoutFixer.i; i++) {
                setTimeout(() => embedHeight ? embedHeight.execute() : embedHeight2.execute(), timeoutFixer.value);
            }

        }

    }
};

export function setMediaHeight(value = null) {
    height = typeof value === 'number' && !Number.isNaN(value) && Number.isFinite(value) && value > -1 ? value : $('#chatbox-scroll > .room-view__content #chatbox').height();
};