import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import Toggle from '../../atoms/button/Toggle';
import SettingTile from '../../molecules/setting-tile/SettingTile';

import initMatrix from '../../../client/initMatrix';

import { getCurrentState } from '../../../util/matrixUtil';

function PonyHousePersonalSettings({ roomId, room }) {
  const mx = initMatrix.matrixClient;
  const userId = mx.getUserId();
  const [isRoomIconsVisible, setRoomIconsVisible] = useState(false);

  const toggleShowRoomIcons = async (data) => {
    await mx.sendStateEvent(roomId, 'pony.house.settings', { isActive: data }, 'roomIcons');
    setRoomIconsVisible(data);
  };

  // Pony Config
  const canPonyHouse = getCurrentState(room).maySendStateEvent('pony.house.settings', userId);
  useEffect(() => {
    const roomIconCfg =
      getCurrentState(room).getStateEvents('pony.house.settings', 'roomIcons')?.getContent() ?? {};
    setRoomIconsVisible(roomIconCfg.isActive === true);
  }, [room]);

  return (
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
  );
}

PonyHousePersonalSettings.propTypes = {
  room: PropTypes.object,
  roomId: PropTypes.string.isRequired,
};

export default PonyHousePersonalSettings;

/*

<div className="card noselect mb-3">
<ul className="list-group list-group-flush">
    <li className="list-group-item very-small text-gray">{`${__ENV_APP__.INFO.name} Settings (Personal)`}<i className="ms-2 bi bi-person-circle" /></li>
    <PonyHousePersonalSettings roomId={roomId} room={room} />
</ul>
</div>

*/
