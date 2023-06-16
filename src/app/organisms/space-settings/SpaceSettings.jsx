import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './SpaceSettings.scss';

import { twemojify } from '../../../util/twemojify';

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
import ImageUpload from '../../molecules/image-upload/ImageUpload';
import Avatar from '../../atoms/avatar/Avatar';

import { confirmDialog } from '../../molecules/confirm-dialog/ConfirmDialog';
import { useForceUpdate } from '../../hooks/useForceUpdate';

const tabText = {
  GENERAL: 'General',
  MEMBERS: 'Members',
  EMOJIS: 'Emojis',
  PERMISSIONS: 'Permissions',
};

const tabItems = [{
  faSrc: "fa-solid fa-gear",
  text: tabText.GENERAL,
  disabled: false,
}, {
  faSrc: "fa-solid fa-user",
  text: tabText.MEMBERS,
  disabled: false,
}, {
  faSrc: "fa-solid fa-face-smile",
  text: tabText.EMOJIS,
  disabled: false,
}, {
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

  const userId = mx.getUserId();
  const room = mx.getRoom(roomId);

  const roomName = room?.name;
  const [, forceUpdate] = useForceUpdate();

  // Pony Config
  const canPonyHouse = room.currentState.maySendStateEvent('pony.house.settings', userId);
  const bannerCfg = room.currentState.getStateEvents('pony.house.settings', 'banner')?.getContent();
  let avatarSrc;

  if (bannerCfg && typeof bannerCfg?.url === 'string' && bannerCfg?.url.length > 0) {
    avatarSrc = mx.mxcUrlToHttp(bannerCfg.url, 400, 227);
  }

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

  return (
    <>
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

          <li className="list-group-item very-small text-gray">Pony House Settings</li>
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
  const [window, setWindow] = useState(null);

  useEffect(() => {
    const openSpaceSettings = (roomId, tab, isProfile) => {
      setProfileMode(isProfile);
      setWindow({ roomId, tabText });
      const tabItem = tabItems.find((item) => item.text === tab);
      if (tabItem) setSelectedTab(tabItem);
    };
    navigation.on(cons.events.navigation.SPACE_SETTINGS_OPENED, openSpaceSettings);
    return () => {
      navigation.removeListener(cons.events.navigation.SPACE_SETTINGS_OPENED, openSpaceSettings);
    };
  }, []);

  const requestClose = () => setWindow(null);

  return [window, requestClose];
}

function SpaceSettings() {
  const [profileMode, setProfileMode] = useState(false);
  const [selectedTab, setSelectedTab] = useState(tabItems[0]);
  const [window, requestClose] = useWindowToggle(setSelectedTab, setProfileMode);
  const isOpen = window !== null;
  const roomId = window?.roomId;

  const mx = initMatrix.matrixClient;
  const room = mx.getRoom(roomId);

  const handleTabChange = (tabItem) => {
    setSelectedTab(tabItem);
  };

  return (
    <PopupWindow
      isOpen={isOpen}
      className="modal-xl modal-dialog-scrollable noselect"
      title={<>
        {isOpen && twemojify(room.name)}
        <span style={{ color: 'var(--tc-surface-low)' }}> — space settings</span>
      </>}
      onRequestClose={requestClose}
    >
      {isOpen && (
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
      )}
    </PopupWindow>
  );
}

export default SpaceSettings;
