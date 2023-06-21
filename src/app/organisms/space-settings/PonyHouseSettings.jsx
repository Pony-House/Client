import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import ImageUpload from '../../molecules/image-upload/ImageUpload';
import Avatar from '../../atoms/avatar/Avatar';

import Toggle from '../../atoms/button/Toggle';
import SettingTile from '../../molecules/setting-tile/SettingTile';

import initMatrix from '../../../client/initMatrix';

import { confirmDialog } from '../../molecules/confirm-dialog/ConfirmDialog';

function PonyHouseSettings({ roomId, room }) {

    const mx = initMatrix.matrixClient;
    const userId = mx.getUserId();
    const roomName = room?.name;
    const [isRoomIconsVisible, setRoomIconsVisible] = useState(false);

    const toggleShowRoomIcons = async data => {
        await mx.sendStateEvent(roomId, 'pony.house.settings', { isActive: data }, 'roomIcons');
        setRoomIconsVisible(data);
    };

    const handleBannerUpload = async url => {

        const spaceHeader = document.querySelector('#space-header > .navbar');
        const bannerPlace = document.querySelector('.space-banner .avatar__border');
        const bannerImg = document.querySelector('.space-banner img');

        if (url === null) {

            const isConfirmed = await confirmDialog(
                'Remove space banner',
                'Are you sure that you want to remove room banner?',
                'Remove',
                'warning',
            );

            if (isConfirmed) {

                await mx.sendStateEvent(roomId, 'pony.house.settings', { url }, 'banner');

                if (spaceHeader) {
                    spaceHeader.classList.remove('banner-mode');
                    spaceHeader.style.backgroundImage = '';
                }

                if (bannerPlace) bannerPlace.style.backgroundImage = ''; bannerPlace.classList.remove('banner-added');
                if (bannerImg) bannerImg.src = '';

            }

        } else {

            await mx.sendStateEvent(roomId, 'pony.house.settings', { url }, 'banner');

            if (spaceHeader) {
                spaceHeader.classList.add('banner-mode');
                spaceHeader.style.backgroundImage = `url("${mx.mxcUrlToHttp(url, 960, 540)}")`;
            }

            if (bannerPlace) bannerPlace.style.backgroundImage = `url('${mx.mxcUrlToHttp(url, 400, 227)}')`; bannerPlace.classList.add('banner-added');
            if (bannerImg) bannerImg.src = mx.mxcUrlToHttp(url, 400, 227);

        }

    };

    // Pony Config
    const canPonyHouse = room.currentState.maySendStateEvent('pony.house.settings', userId);
    let avatarSrc;

    const bannerCfg = room.currentState.getStateEvents('pony.house.settings', 'banner')?.getContent() ?? {};
    if (typeof bannerCfg?.url === 'string' && bannerCfg?.url.length > 0) {
        avatarSrc = mx.mxcUrlToHttp(bannerCfg.url, 400, 227);
    }

    useEffect(() => {

        const roomIconCfg = room.currentState.getStateEvents('pony.house.settings', 'roomIcons')?.getContent() ?? {};
        setRoomIconsVisible((roomIconCfg.isActive === true));

    }, [room]);

    return (<>

        <SettingTile
            title="Display room avatars"
            content={<div className="very-small text-gray">Instead of showing the traditional room icons of this space, you can click here for this sace to show room avatars instead.</div>}
            options={(
                <Toggle
                    className='d-inline-flex'
                    isActive={isRoomIconsVisible}
                    onToggle={toggleShowRoomIcons}
                    disabled={!canPonyHouse}
                />
            )}
        />

        <li className="list-group-item small">

            Space banner background

            <div className="very-small text-gray">
                <p>This image will display at the top of your rooms list.</p>
                The recommended minimum size is 960x540 and recommended aspect ratio is 16:9.
            </div>

            {!canPonyHouse && <Avatar imageSrc={avatarSrc} text={roomName} size="large" />}
            {canPonyHouse && (
                <ImageUpload
                    className='space-banner'
                    text='Banner'
                    imageSrc={avatarSrc}
                    onUpload={handleBannerUpload}
                    onRequestRemove={() => handleBannerUpload(null)}
                />
            )}

        </li>

    </>);

}

PonyHouseSettings.propTypes = {
    room: PropTypes.node,
    roomId: PropTypes.string.isRequired,
};

export default PonyHouseSettings;