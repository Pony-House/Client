import React from 'react';
import PropTypes from 'prop-types';

import { twemojifyReact } from '../../../util/twemojify';

import initMatrix from '../../../client/initMatrix';
import cons from '../../../client/state/cons';
import {
  openPublicRooms, openCreateRoom, openSpaceManage, openJoinAlias,
  openSpaceAddExisting, openInviteUser, openReusableContextMenu,
} from '../../../client/action/navigation';
import { getEventCords } from '../../../util/common';

import RawIcon from '../../atoms/system-icons/RawIcon';
import { Header } from '../../atoms/header/Header';
import IconButton from '../../atoms/button/IconButton';
import { MenuItem, MenuHeader } from '../../atoms/context-menu/ContextMenu';
import SpaceOptions from '../../molecules/space-options/SpaceOptions';
import { getCurrentState } from '../../../util/matrixUtil';

const HashPlusIC = './img/ic/outlined/hash-plus.svg';
const HashGlobeIC = './img/ic/outlined/hash-globe.svg';
const HashSearchIC = './img/ic/outlined/hash-search.svg';
const SpacePlusIC = './img/ic/outlined/space-plus.svg';

export function HomeSpaceOptions({ spaceId, afterOptionSelect }) {
  const mx = initMatrix.matrixClient;
  const room = mx.getRoom(spaceId);
  const canManage = room
    ? getCurrentState(room).maySendStateEvent('m.space.child', mx.getUserId())
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

function DrawerHeader({ selectedTab, spaceId, room, banner }) {

  const tabName = selectedTab !== cons.tabs.DIRECTS ? 'Home' : 'Direct messages';

  const isDMTab = selectedTab === cons.tabs.DIRECTS;

  const spaceName = isDMTab ? null : (room?.name || null);

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
    <Header banner={banner}>

      <ul className='navbar-nav mr-auto w-100 space-menu-1'>

        {spaceName ? (
          <button
            className="nav-link btn btn-bg border-0 p-1 text-truncate d-inline-block space-title"
            onClick={openSpaceOptions}
            type="button"
          >
            <strong className='me-2'>{twemojifyReact(spaceName)}</strong>
            <RawIcon size="small" fa="fa-solid fa-chevron-down" />
          </button>
        ) : (
          <strong className='p-1'>{tabName}</strong>
        )}

      </ul>

      <ul className='navbar-nav ms-auto mt-0 mt-md-1 small space-menu-2'>

        {isDMTab && <IconButton className='nav-link' onClick={() => openInviteUser()} tooltipPlacement='bottom' tooltip="Start DM" fa="fa-solid fa-plus" size="small" />}
        {!isDMTab && <IconButton className='nav-link' onClick={openHomeSpaceOptions} tooltipPlacement='bottom' tooltip="Add rooms/spaces" fa="fa-solid fa-plus" size="small" />}

      </ul >

    </Header>
  );
}

DrawerHeader.defaultProps = {
  spaceId: null,
  banner: null,
  room: null,
};
DrawerHeader.propTypes = {
  selectedTab: PropTypes.string.isRequired,
  spaceId: PropTypes.string,
  banner: PropTypes.string,
  room: PropTypes.object,
};

export default DrawerHeader;
