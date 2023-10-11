import { twemojify } from '../../../util/twemojify';

export default function insertCustomStatus(customStatusRef, content, testMode = false) {
    // Custom Status
    if (customStatusRef && customStatusRef.current) {

        // Get Status
        const customStatus = $(customStatusRef.current);
        const htmlStatus = [];
        let customStatusImg;

        if (
            content && content.presenceStatusMsg &&
            ((content.presence !== 'offline' && content.presence !== 'unavailable') || testMode) && (
                (typeof content.presenceStatusMsg.msg === 'string' && content.presenceStatusMsg.msg.length > 0) ||
                (typeof content.presenceStatusMsg.msgIcon === 'string' && content.presenceStatusMsg.msgIcon.length > 0)
            )
        ) {

            if (typeof content.presenceStatusMsg.msgIcon === 'string' && content.presenceStatusMsg.msgIcon.length > 0) {

                customStatusImg = $('<img>', { src: content.presenceStatusMsg.msgIconThumb, alt: 'icon', class: 'emoji me-1' });
                htmlStatus.push(customStatusImg);

                customStatusImg.data('pony-house-cs-normal', content.presenceStatusMsg.msgIconThumb);
                customStatusImg.data('pony-house-cs-hover', content.presenceStatusMsg.msgIcon);

            }

            if (typeof content.presenceStatusMsg.msg === 'string' && content.presenceStatusMsg.msg.length > 0) {
                htmlStatus.push($('<span>', { class: 'text-truncate cs-text' }).html(twemojify(content.presenceStatusMsg.msg.substring(0, 100))));
            }

        }

        customStatus.html(htmlStatus);

        if (customStatusImg) {
            customStatusImg.parent().parent().parent().hover(
                () => {
                    customStatusImg.attr('src', customStatusImg.data('pony-house-cs-hover'));
                }, () => {
                    customStatusImg.attr('src', customStatusImg.data('pony-house-cs-normal'));
                }
            );
        }

    }
};