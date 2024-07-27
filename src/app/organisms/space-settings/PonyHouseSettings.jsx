import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { RoomStateEvent } from 'matrix-js-sdk';

import { colorMXID } from '@src/util/colorMXID';

import ImageUpload from '../../molecules/image-upload/ImageUpload';
import Avatar, { avatarDefaultColor } from '../../atoms/avatar/Avatar';

import Toggle from '../../atoms/button/Toggle';
import SettingTile from '../../molecules/setting-tile/SettingTile';

import initMatrix from '../../../client/initMatrix';

import { confirmDialog } from '../../molecules/confirm-dialog/ConfirmDialog';
import { getCurrentState } from '../../../util/matrixUtil';
import PonyRoomEvent from './PonyRoomEvent';

function PonyHouseSettings({ roomId, room }) {
  const mx = initMatrix.matrixClient;
  const mxcUrl = initMatrix.mxcUrl;

  const userId = mx.getUserId();
  const roomName = room?.name;
  const [isRoomIconsVisible, setRoomIconsVisible] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState(null);
  const color = colorMXID(initMatrix.matrixClient.getUserId());

  const toggleShowRoomIcons = async (data) => {
    await mx.sendStateEvent(roomId, PonyRoomEvent.PhSettings, { isActive: data }, 'roomIcons');
    setRoomIconsVisible(data);
  };

  // Pony Config
  const canPonyHouse = getCurrentState(room).maySendStateEvent(PonyRoomEvent.PhSettings, userId);

  useEffect(() => {
    const roomIconCfg =
      getCurrentState(room).getStateEvents(PonyRoomEvent.PhSettings, 'roomIcons')?.getContent() ??
      {};
    setRoomIconsVisible(roomIconCfg.isActive === true);

    const bannerCfg =
      getCurrentState(room).getStateEvents(PonyRoomEvent.PhSettings, 'banner')?.getContent() ?? {};

    if (typeof bannerCfg?.url === 'string' && bannerCfg?.url.length > 0) {
      setAvatarSrc(mxcUrl.toHttp(bannerCfg.url));
    }
  }, [room]);

  const handleBannerUpload = async (url) => {
    if (url === null) {
      const isConfirmed = await confirmDialog(
        'Remove space banner',
        'Are you sure that you want to remove room banner?',
        'Remove',
        'warning',
      );

      if (isConfirmed) {
        await mx.sendStateEvent(roomId, PonyRoomEvent.PhSettings, { url: null }, 'banner');
        setAvatarSrc(null);
      }
    } else {
      await mx.sendStateEvent(roomId, PonyRoomEvent.PhSettings, { url }, 'banner');
      setAvatarSrc(mxcUrl.toHttp(url, 400, 227));
    }
  };

  useEffect(() => {
    const handleEvent = (event, state, prevEvent) => {
      if (event.getRoomId() !== roomId) return;
      if (event.getType() !== PonyRoomEvent.PhSettings) return;
      if (event.getStateKey() !== 'banner') return;

      const oldUrl = prevEvent?.getContent()?.url;
      const newUrl = event.getContent()?.url;

      if (!oldUrl || !newUrl || newUrl !== oldUrl) {
        setBannerSrc(mxcUrl.toHttp(newUrl, 960, 540));
      }
    };

    mx.on(RoomStateEvent.Events, handleEvent);
    return () => {
      mx.removeListener(RoomStateEvent.Events, handleEvent);
    };
  });

  return (
    <>
      <SettingTile
        title="Display room avatars"
        content={
          <div className="very-small text-gray">
            Instead of showing the traditional room icons of this space, you can click here for this
            space to show room avatars instead. Update your space page after applying this
            configuration.
          </div>
        }
        options={
          <Toggle
            className="d-inline-flex"
            isActive={isRoomIconsVisible}
            onToggle={toggleShowRoomIcons}
            disabled={!canPonyHouse}
          />
        }
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
            className="space-banner"
            text="Banner"
            imageSrc={avatarSrc}
            onUpload={(url) => handleBannerUpload(url)}
            onRequestRemove={() => handleBannerUpload(null)}
            defaultImage={avatarDefaultColor(color, 'space')}
          />
        )}
      </li>
    </>
  );
}

PonyHouseSettings.propTypes = {
  room: PropTypes.object,
  roomId: PropTypes.string.isRequired,
};

export default PonyHouseSettings;
