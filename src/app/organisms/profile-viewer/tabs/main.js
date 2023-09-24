import { twemojify } from '../../../../util/twemojify';
import { copyToClipboard } from '../../../../util/common';
import { toast } from '../../../../util/tools';

export default function renderAbout(ethereumValid, displayNameRef, customStatusRef, profileBanner, bioRef, content) {

    // Ethereum
    if (ethereumValid) {

        const displayName = $(displayNameRef.current);
        let ethereumIcon = displayName.find('#ethereum-icon');
        if (ethereumIcon.length < 1) {

            ethereumIcon = $('<span>', { id: 'ethereum-icon', class: 'ms-2', title: content.presenceStatusMsg.ethereum.address }).append(
                $('<i>', { class: 'fa-brands fa-ethereum' })
            );

            ethereumIcon.on('click', () => {
                try {
                    copyToClipboard(content.presenceStatusMsg.ethereum.address);
                    toast('Ethereum address successfully copied to the clipboard.');
                } catch (err) {
                    console.error(err);
                    alert(err.message);
                }
            }).tooltip();

            displayName.append(ethereumIcon);

        }

    }

    // Get Banner Data
    const bannerDOM = $(profileBanner.current);

    if (bannerDOM.length > 0) {
        if (typeof content.presenceStatusMsg.banner === 'string' && content.presenceStatusMsg.banner.length > 0) {
            bannerDOM.css('background-image', `url("${content.presenceStatusMsg.banner}")`).addClass('exist-banner');
        } else {
            bannerDOM.css('background-image', '').removeClass('exist-banner');
        }
    }

    // Get Bio Data
    if (bioRef.current) {

        const bioDOM = $(bioRef.current);
        const tinyBio = $('#tiny-bio');

        if (tinyBio.length > 0) {

            bioDOM.removeClass('d-none');
            if (typeof content.presenceStatusMsg.bio === 'string' && content.presenceStatusMsg.bio.length > 0) {
                tinyBio.html(twemojify(content.presenceStatusMsg.bio.substring(0, 190), undefined, true, false));
            } else {
                bioDOM.addClass('d-none');
                tinyBio.html('');
            }

        } else {
            bioDOM.addClass('d-none');
        }

    }

    // Get Custom Status Data
    const customStatusDOM = $(customStatusRef.current);
    customStatusDOM.removeClass('d-none').removeClass('custom-status-emoji-only').addClass('emoji-size-fix');
    const htmlStatus = [];
    let isAloneEmojiCustomStatus = false;

    if (
        content && content.presenceStatusMsg &&
        content.presence !== 'offline' && content.presence !== 'unavailable' && (
            (typeof content.presenceStatusMsg.msg === 'string' && content.presenceStatusMsg.msg.length > 0) ||
            (typeof content.presenceStatusMsg.msgIcon === 'string' && content.presenceStatusMsg.msgIcon.length > 0)
        )
    ) {

        if (typeof content.presenceStatusMsg.msgIcon === 'string' && content.presenceStatusMsg.msgIcon.length > 0) {
            htmlStatus.push($('<img>', { src: content.presenceStatusMsg.msgIcon, alt: 'icon', class: 'emoji me-1' }));
        }

        if (typeof content.presenceStatusMsg.msg === 'string' && content.presenceStatusMsg.msg.length > 0) {
            htmlStatus.push($('<span>', { class: 'text-truncate cs-text' }).html(twemojify(content.presenceStatusMsg.msg.substring(0, 100))));
        } else { isAloneEmojiCustomStatus = true; }

    } else {
        customStatusDOM.addClass('d-none');
    }

    customStatusDOM.html(htmlStatus);
    if (isAloneEmojiCustomStatus) {
        customStatusDOM.addClass('custom-status-emoji-only').removeClass('emoji-size-fix');
    }

};