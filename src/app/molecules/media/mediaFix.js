export default function mediaFix(itemEmbed, embedHeight, setEmbedHeight, isLoaded) {

    if (itemEmbed.current) {

        if (embedHeight === null) {
            setEmbedHeight(itemEmbed.current.offsetHeight);
        } else if (isLoaded) {

            let newHeight = itemEmbed.current.offsetHeight - embedHeight;
            if (newHeight < 0) newHeight = 0;

            // console.log(newHeight);
            // const scrollBar = $('#chatbox-scroll');
            // scrollBar.animate({ scrollTop: scrollBar.scrollTop() + newHeight + 150 }, 0);

        }

        console.log(embedHeight);

    }

};