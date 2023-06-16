import React from 'react';
import PropTypes from 'prop-types';

import { twemojify } from '../../../util/twemojify';

import initMatrix from '../../../client/initMatrix';
import cons from '../../../client/state/cons';
import {
  openPublicRooms, openCreateRoom, openSpaceManage, openJoinAlias,
  openSpaceAddExisting, openInviteUser, openReusableContextMenu,
} from '../../../client/action/navigation';
import { getEventCords } from '../../../util/common';

import Text from '../../atoms/text/Text';
import RawIcon from '../../atoms/system-icons/RawIcon';
import { Header } from '../../atoms/header/Header';
import IconButton from '../../atoms/button/IconButton';
import { MenuItem, MenuHeader } from '../../atoms/context-menu/ContextMenu';
import SpaceOptions from '../../molecules/space-options/SpaceOptions';

import HashPlusIC from '../../../../public/res/ic/outlined/hash-plus.svg';
import HashGlobeIC from '../../../../public/res/ic/outlined/hash-globe.svg';
import HashSearchIC from '../../../../public/res/ic/outlined/hash-search.svg';
import SpacePlusIC from '../../../../public/res/ic/outlined/space-plus.svg';

import { setSelectSpace } from '../../../util/selectedRoom';

export function HomeSpaceOptions({ spaceId, afterOptionSelect }) {
  const mx = initMatrix.matrixClient;
  const room = mx.getRoom(spaceId);
  const canManage = room
    ? room.currentState.maySendStateEvent('m.space.child', mx.getUserId())
    : true;

  return (
    <>
      <MenuHeader>Add rooms or spaces</MenuHeader>
      <MenuItem
        className="text-start"
        iconSrc={SpacePlusIC}
        onClick={() => { afterOptionSelect(); openCreateRoom(true, spaceId); }}
        disabled={!canManage}
      >
        Create new space
      </MenuItem>
      <MenuItem
        className="text-start"
        iconSrc={HashPlusIC}
        onClick={() => { afterOptionSelect(); openCreateRoom(false, spaceId); }}
        disabled={!canManage}
      >
        Create new room
      </MenuItem>
      {!spaceId && (
        <MenuItem
          className="text-start"
          iconSrc={HashGlobeIC}
          onClick={() => { afterOptionSelect(); openPublicRooms(); }}
        >
          Explore public rooms
        </MenuItem>
      )}
      {!spaceId && (
        <MenuItem
          className="text-start"
          faSrc="fa-solid fa-plus"
          onClick={() => { afterOptionSelect(); openJoinAlias(); }}
        >
          Join with address
        </MenuItem>
      )}
      {spaceId && (
        <MenuItem
          className="text-start"
          faSrc="fa-solid fa-plus"
          onClick={() => { afterOptionSelect(); openSpaceAddExisting(spaceId); }}
          disabled={!canManage}
        >
          Add existing
        </MenuItem>
      )}
      {spaceId && (
        <MenuItem
          className="text-start"
          onClick={() => { afterOptionSelect(); openSpaceManage(spaceId); }}
          iconSrc={HashSearchIC}
        >
          Manage rooms
        </MenuItem>
      )}
    </>
  );
}
HomeSpaceOptions.defaultProps = {
  spaceId: null,
};
HomeSpaceOptions.propTypes = {
  spaceId: PropTypes.string,
  afterOptionSelect: PropTypes.func.isRequired,
};

function DrawerHeader({ selectedTab, spaceId }) {
  const mx = initMatrix.matrixClient;
  const tabName = selectedTab !== cons.tabs.DIRECTS ? 'Home' : 'Direct messages';

  const isDMTab = selectedTab === cons.tabs.DIRECTS;
  const room = mx.getRoom(spaceId);

  let bannerCfg;
  if (room) {
    bannerCfg = room.currentState.getStateEvents('pony.house.settings', 'banner')?.getContent();
  }

  const spaceName = isDMTab ? null : (room?.name || null);
  setSelectSpace(room);

  let avatarSrc = '';
  if (bannerCfg && typeof bannerCfg?.url === 'string' && bannerCfg?.url.length > 0) {
    avatarSrc = mx.mxcUrlToHttp(bannerCfg.url, 960, 540);
  } else {
    const spaceHeader = document.querySelector('#space-header > .navbar');
    if (spaceHeader) {
      spaceHeader.classList.remove('banner-mode');
      spaceHeader.style.backgroundImage = '';
    }
  }

  const openSpaceOptions = (e) => {
    e.preventDefault();
    openReusableContextMenu(
      'bottom',
      getEventCords(e, '.header'),
      (closeMenu) => <SpaceOptions roomId={spaceId} afterOptionSelect={closeMenu} />,
    );
  };

  const openHomeSpaceOptions = (e) => {
    e.preventDefault();
    openReusableContextMenu(
      'right',
      getEventCords(e, '.ic-btn'),
      (closeMenu) => <HomeSpaceOptions spaceId={spaceId} afterOptionSelect={closeMenu} />,
    );
  };

  return (
    <Header banner={avatarSrc}>

      <ul className='navbar-nav mr-auto w-100 space-menu-1'>

        {spaceName ? (
          <button
            className="nav-link btn btn-bg border-0 p-1 text-truncate d-inline-block space-title"
            onClick={openSpaceOptions}
            type="button"
          >
            <strong className='me-2'>{twemojify(spaceName)}</strong>
            <RawIcon size="small" fa="fa-solid fa-chevron-down" />
          </button>
        ) : (
          <strong className='p-1'>{tabName}</strong>
        )}

      </ul>

      <ul className='navbar-nav ms-auto mt-0 mt-md-1 small space-menu-2'>

        {isDMTab && <IconButton className='nav-link' onClick={() => openInviteUser()} tooltip="Start DM" fa="fa-solid fa-plus" size="small" />}
        {!isDMTab && <IconButton className='nav-link' onClick={openHomeSpaceOptions} tooltip="Add rooms/spaces" fa="fa-solid fa-plus" size="small" />}

      </ul >

    </Header>
  );
}

DrawerHeader.defaultProps = {
  spaceId: null,
};
DrawerHeader.propTypes = {
  selectedTab: PropTypes.string.isRequired,
  spaceId: PropTypes.string,
};

export default DrawerHeader;
