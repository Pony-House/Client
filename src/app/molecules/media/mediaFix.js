let height = null;
export function fixScrollChat() {
    const scrollBar = $('#chatbox-scroll');
    const roomView = scrollBar.find('> .room-view__content #chatbox');
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

            for (let i = 0; i < 100; i++) {
                setTimeout(() => embedHeight ? embedHeight.execute() : embedHeight2.execute(), 10);
            }

        }

    }
};

export function setMediaHeight(value = null) {
    height = typeof value === 'number' && !Number.isNaN(value) && Number.isFinite(value) && value > -1 ? value : $('#chatbox-scroll > .room-view__content #chatbox').height();
};