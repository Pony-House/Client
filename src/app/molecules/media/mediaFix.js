export function fixScrollChat() {
    const scrollBar = $('#chatbox-scroll');
    const roomView = scrollBar.find('> .room-view__content');
    const height = roomView.height();
    return {
        height, execute() {

            const newHeight = roomView.height();
            const diffHeight = newHeight - height;
            console.log(height, newHeight, diffHeight);

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