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
            console.log(oldHeight, newHeight, diffHeight);

            scrollBar.animate({ scrollTop: scrollBar.scrollTop() + diffHeight }, 0);

        }
    };
};

export function mediaFix(itemEmbed, embedHeight, setEmbedHeight, isLoaded) {
    if (itemEmbed.current) {
        if (embedHeight === null) {
            setEmbedHeight(fixScrollChat());
        } else if (isLoaded) {
            embedHeight.execute()
        }
    }
};