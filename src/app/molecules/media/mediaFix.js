let height;
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
            scrollBar.animate({ scrollTop: scrollBar.scrollTop() + diffHeight }, 0);

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
        }

    }
};