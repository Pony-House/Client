import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { colorMXID } from '@src/util/colorMXID';
import ImageUpload from '../../molecules/image-upload/ImageUpload';
import Avatar, { avatarDefaultColor } from '../../atoms/avatar/Avatar';

import Toggle from '../../atoms/button/Toggle';
import SettingTile from '../../molecules/setting-tile/SettingTile';

import initMatrix from '../../../client/initMatrix';

import { confirmDialog } from '../../molecules/confirm-dialog/ConfirmDialog';
import { getCurrentState } from '../../../util/matrixUtil';
import { handleBannerUpload } from './handleBannerUpload';

function PonyHouseSettings({ roomId, room }) {
  const mx = initMatrix.matrixClient;
  const userId = mx.getUserId();
  const roomName = room?.name;
  const [isRoomIconsVisible, setRoomIconsVisible] = useState(false);
  const color = colorMXID(initMatrix.matrixClient.getUserId());

  const toggleShowRoomIcons = async (data) => {
    await mx.sendStateEvent(roomId, 'pony.house.settings', { isActive: data }, 'roomIcons');
    setRoomIconsVisible(data);
  };

  // Pony Config
  const canPonyHouse = getCurrentState(room).maySendStateEvent('pony.house.settings', userId);
  let avatarSrc;

  const bannerCfg =
    getCurrentState(room).getStateEvents('pony.house.settings', 'banner')?.getContent() ?? {};
  if (typeof bannerCfg?.url === 'string' && bannerCfg?.url.length > 0) {
    avatarSrc = mx.mxcUrlToHttp(bannerCfg.url, 400, 227);
  }

  useEffect(() => {
    const roomIconCfg =
      getCurrentState(room).getStateEvents('pony.house.settings', 'roomIcons')?.getContent() ?? {};
    setRoomIconsVisible(roomIconCfg.isActive === true);
  }, [room]);

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
            onUpload={(url) => handleBannerUpload(url, roomId)}
            onRequestRemove={() => handleBannerUpload(null, roomId)}
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
