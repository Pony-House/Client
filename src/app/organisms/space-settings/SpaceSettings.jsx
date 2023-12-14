import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { twemojifyReact } from '../../../util/twemojify';

import initMatrix from '../../../client/initMatrix';
import cons from '../../../client/state/cons';
import navigation from '../../../client/state/navigation';
import { leave } from '../../../client/action/room';
import {
  createSpaceShortcut,
  deleteSpaceShortcut,
  categorizeSpace,
  unCategorizeSpace,
} from '../../../client/action/accountData';

import Tabs from '../../atoms/tabs/Tabs';
import { MenuItem } from '../../atoms/context-menu/ContextMenu';
import PopupWindow from '../../molecules/popup-window/PopupWindow';
import RoomProfile from '../../molecules/room-profile/RoomProfile';
import RoomVisibility from '../../molecules/room-visibility/RoomVisibility';
import RoomAliases from '../../molecules/room-aliases/RoomAliases';
import RoomPermissions from '../../molecules/room-permissions/RoomPermissions';
import RoomMembers from '../../molecules/room-members/RoomMembers';
import RoomEmojis from '../../molecules/room-emojis/RoomEmojis';
import PonyHouseSettings from './PonyHouseSettings';

import { confirmDialog } from '../../molecules/confirm-dialog/ConfirmDialog';
import { useForceUpdate } from '../../hooks/useForceUpdate';

const tabText = {
  GENERAL: 'General',
  MEMBERS: 'Members',
  EMOJIS: 'Emojis',
  PERMISSIONS: 'Permissions',
};

const tabItems = [

  {
    faSrc: "fa-solid fa-gear",
    text: tabText.GENERAL,
    disabled: false,
  },

  { type: 'divider', },

  {
    faSrc: "fa-solid fa-user",
    text: tabText.MEMBERS,
    disabled: false,
  },

  {
    faSrc: "fa-solid fa-face-smile",
    text: tabText.EMOJIS,
    disabled: false,
  },

  { type: 'divider', },

  {
    faSrc: "fa-solid fa-shield",
    text: tabText.PERMISSIONS,
    disabled: false,
  }];

// Config
function GeneralSettings({ roomId, profileMode }) {

  // Prepare Settings
  const isPinned = initMatrix.accountData.spaceShortcut.has(roomId);
  const isCategorized = initMatrix.accountData.categorizedSpaces.has(roomId);
  const mx = initMatrix.matrixClient;

  const room = mx.getRoom(roomId);

  const roomName = room?.name;
  const [, forceUpdate] = useForceUpdate();

  return (
    <>

      {window.matchMedia('screen and (min-width: 768px)').matches ? <div className="card noselect mb-3">
        <ul className="list-group list-group-flush">

          <li className="list-group-item very-small text-gray">Space ID</li>

          <li className="list-group-item border-0">
            <RoomProfile profileMode={profileMode} roomId={roomId} isSpace />
          </li>

        </ul></div> : null}

      <div className="card noselect mb-3">
        <ul className="list-group list-group-flush">

          <li className='list-group-item very-small text-gray'>Options</li>

          <MenuItem
            className='text-start'
            onClick={() => {
              if (isCategorized) unCategorizeSpace(roomId);
              else categorizeSpace(roomId);
              forceUpdate();
            }}
            faSrc={isCategorized ? "bi bi-grid" : "bi bi-grid-fill"}
          >
            {isCategorized ? 'Uncategorize subspaces' : 'Categorize subspaces'}
          </MenuItem>

          <MenuItem
            className='text-start'
            onClick={() => {
              if (isPinned) deleteSpaceShortcut(roomId);
              else createSpaceShortcut(roomId);
              forceUpdate();
            }}
            faSrc={isPinned ? "bi bi-pin-angle-fill" : "bi bi-pin-angle"}
          >
            {isPinned ? 'Unpin from sidebar' : 'Pin to sidebar'}
          </MenuItem>

          <MenuItem
            className='text-start btn-text-danger'
            onClick={async () => {
              const isConfirmed = await confirmDialog(
                'Leave space',
                `Are you sure that you want to leave "${roomName}" space?`,
                'Leave',
                'danger',
              );
              if (isConfirmed) leave(roomId);
            }}
            faSrc="fa-solid fa-arrow-right-from-bracket"
          >
            Leave
          </MenuItem>

        </ul>
      </div>

      <div className="card noselect mb-3">
        <ul className="list-group list-group-flush">
          <li className="list-group-item very-small text-gray">Space visibility (who can join)</li>
          <RoomVisibility roomId={roomId} />
        </ul>
      </div>

      <div className="card noselect mb-3">
        <ul className="list-group list-group-flush">
          <li className="list-group-item very-small text-gray">Space addresses</li>
          <RoomAliases roomId={roomId} />
        </ul>
      </div>

      <div className="card noselect mb-3">
        <ul className="list-group list-group-flush">
          <li className="list-group-item very-small text-gray">{`${__ENV_APP__.info.name} Settings`}</li>
          <PonyHouseSettings roomId={roomId} room={room} />
        </ul>
      </div>

    </>
  );

}

GeneralSettings.propTypes = {
  roomId: PropTypes.string.isRequired,
  profileMode: PropTypes.bool,
};

function useWindowToggle(setSelectedTab, setProfileMode) {
  const [tinyWindow, setWindow] = useState(null);

  useEffect(() => {

    const openSpaceSettings = (roomId, tab, isProfile) => {

      setProfileMode(isProfile);
      setWindow({ roomId, tabText });

      if (tab) {
        const tabItem = tabItems.find((item) => item.text === tab);
        if (tabItem) setSelectedTab(tabItem);
      } else {
        setSelectedTab(tabItems[0]);
      }

    };

    navigation.on(cons.events.navigation.SPACE_SETTINGS_OPENED, openSpaceSettings);
    return () => {
      navigation.removeListener(cons.events.navigation.SPACE_SETTINGS_OPENED, openSpaceSettings);
    };

  }, []);

  const requestClose = () => setWindow(null);

  return [tinyWindow, requestClose];
}

function SpaceSettings() {
  const [profileMode, setProfileMode] = useState(false);
  const [selectedTab, setSelectedTab] = useState(tabItems[0]);
  const [tinyWindow, requestClose] = useWindowToggle(setSelectedTab, setProfileMode);
  const isOpen = tinyWindow !== null;
  const roomId = tinyWindow?.roomId;

  const mx = initMatrix.matrixClient;
  const room = mx.getRoom(roomId);

  const handleTabChange = (tabItem) => {
    setSelectedTab(tabItem);
  };

  if (isOpen) {
    $('body').addClass('settings-modal-open');
  } else {
    $('body').removeClass('settings-modal-open');
  }

  if (window.matchMedia('screen and (max-width: 768px)').matches) {
    $('body').addClass('settings-modal-open-2');
  } else {
    $('body').removeClass('settings-modal-open-2');
  }

  return (
    <PopupWindow

      id='settings-base'
      isOpen={isOpen}
      className="modal-dialog-scrollable noselect"

      title={window.matchMedia('screen and (max-width: 768px)').matches ? <>
        {isOpen && twemojifyReact(room.name)}
        <span style={{ color: 'var(--tc-surface-low)' }}> — space settings</span>
      </> : null}

      size={window.matchMedia('screen and (max-width: 768px)').matches ? 'modal-xl' : 'modal-fullscreen'}

      onRequestClose={requestClose}

    >
      {isOpen && roomId &&
        (
          !window.matchMedia('screen and (max-width: 768px)').matches ?

            <div className="my-0 py-0">

              <div id='setting-tab' className='py-3 h-100 border-bg'>
                <Tabs
                  requestClose={requestClose}
                  className='border-bottom border-bg'
                  items={tabItems}
                  defaultSelected={tabItems.findIndex((tab) => tab.text === selectedTab.text)}
                  onSelect={handleTabChange}
                  isFullscreen
                />
              </div>

              <div id="settings-content" className='py-3'>
                {selectedTab.text === tabText.GENERAL && <GeneralSettings roomId={roomId} profileMode={profileMode} />}
                {selectedTab.text === tabText.MEMBERS && <RoomMembers roomId={roomId} profileMode={profileMode} />}
                {selectedTab.text === tabText.EMOJIS && <RoomEmojis roomId={roomId} profileMode={profileMode} />}
                {selectedTab.text === tabText.PERMISSIONS && <RoomPermissions roomId={roomId} profileMode={profileMode} />}
              </div>

            </div>

            :

            <>
              <RoomProfile profileMode={profileMode} roomId={roomId} isSpace />
              <Tabs
                className='border-bottom border-bg'
                items={tabItems}
                defaultSelected={tabItems.findIndex((tab) => tab.text === selectedTab.text)}
                onSelect={handleTabChange}
              />
              <div className="pt-3">
                {selectedTab.text === tabText.GENERAL && <GeneralSettings roomId={roomId} profileMode={profileMode} />}
                {selectedTab.text === tabText.MEMBERS && <RoomMembers roomId={roomId} profileMode={profileMode} />}
                {selectedTab.text === tabText.EMOJIS && <RoomEmojis roomId={roomId} profileMode={profileMode} />}
                {selectedTab.text === tabText.PERMISSIONS && <RoomPermissions roomId={roomId} profileMode={profileMode} />}
              </div>
            </>
        )
      }
    </PopupWindow>
  );
}

export default SpaceSettings;
