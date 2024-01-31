import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import { forceUnloadedAvatars } from '../../atoms/avatar/load';
import { twemojifyReact } from '../../../util/twemojify';

import initMatrix from '../../../client/initMatrix';
import cons from '../../../client/state/cons';
import navigation from '../../../client/state/navigation';
import {
  toggleRoomSettings,
  openReusableContextMenu,
  openNavigation,
  selectRoomMode,
} from '../../../client/action/navigation';
import { togglePeopleDrawer /* , startVoiceChat */ } from '../../../client/action/settings';
import { colorMXID } from '../../../util/colorMXID';
import { getEventCords } from '../../../util/common';

import { tabText } from './RoomSettings';
import RawIcon from '../../atoms/system-icons/RawIcon';
import IconButton from '../../atoms/button/IconButton';
import { Header } from '../../atoms/header/Header';
import Avatar from '../../atoms/avatar/Avatar';
import RoomOptions from '../../molecules/room-options/RoomOptions';

import { useForceUpdate } from '../../hooks/useForceUpdate';
import copyText from '../profile-viewer/copyText';

// import RoomViewPin from './RoomViewPin';
import { openPinMessageModal } from '../../../util/libs/pinMessage';
import { openThreadsMessageModal } from '../../../util/libs/thread';

function RoomViewHeader({ roomId, threadId, roomAlias, roomItem, disableActions }) {

  const [, forceUpdate] = useForceUpdate();
  const mx = initMatrix.matrixClient;
  const isDM = initMatrix.roomList && initMatrix.roomList.directs.has(roomId);
  const room = !roomItem ? mx.getRoom(roomId) : roomItem;

  const getAvatarUrl = () => isDM ? room.getAvatarFallbackMember()?.getAvatarUrl(mx.baseUrl, 36, 36, 'crop') : room.getAvatarUrl(mx.baseUrl, 36, 36, 'crop');
  const [avatarSrc, setAvatarSrc] = useState(getAvatarUrl());
  const [roomName, setRoomName] = useState(roomAlias || room.name);

  const roomInfoUpdate = () => {
    const newAvatar = getAvatarUrl();
    const newName = roomAlias || room.name;
    if (avatarSrc !== newAvatar) setAvatarSrc(newAvatar);
    if (roomName !== newName) setRoomName(newName);
  };

  roomInfoUpdate();

  const roomHeaderBtnRef = useRef(null);
  useEffect(() => {

    const settingsToggle = (isVisible) => {
      if (roomHeaderBtnRef.current) {
        const rawIcon = roomHeaderBtnRef.current.lastElementChild;
        rawIcon.style.transform = isVisible ? 'rotateX(180deg)' : 'rotateX(0deg)';
      }
    };

    navigation.on(cons.events.navigation.ROOM_SETTINGS_TOGGLED, settingsToggle);
    navigation.on(cons.events.navigation.ROOM_INFO_UPDATED, roomInfoUpdate);
    return () => {
      navigation.removeListener(cons.events.navigation.ROOM_SETTINGS_TOGGLED, settingsToggle);
      navigation.removeListener(cons.events.navigation.ROOM_INFO_UPDATED, roomInfoUpdate);
    };

  }, []);

  useEffect(() => {

    const { roomList } = initMatrix;
    const handleProfileUpdate = (rId) => {
      forceUnloadedAvatars();
      if (roomId !== rId) return;
      forceUpdate();
    };

    forceUnloadedAvatars();
    if (roomList) {
      roomList.on(cons.events.roomList.ROOM_PROFILE_UPDATED, handleProfileUpdate);
      return () => {
        roomList.removeListener(cons.events.roomList.ROOM_PROFILE_UPDATED, handleProfileUpdate);
      };
    }

  }, [roomId]);

  if (!room) {
    console.warn(`RoomViewHeader: Room ${roomId} not found`);
    return null;
  }

  const openRoomOptions = (e) => {
    openReusableContextMenu('bottom', getEventCords(e, '.ic-btn'), (closeMenu) => (
      <RoomOptions roomId={roomId} afterOptionSelect={closeMenu} />
    ));
  };

  //       <IconButton className="room-header__drawer-btn" onClick={startVoiceChat} tooltip="Start VC" fa="fa-solid fa-phone" />

  setTimeout(forceUnloadedAvatars, 200);

  const navigationSidebarCallback = () => {
    if (window.matchMedia('screen and (max-width: 768px)').matches) {
      selectRoomMode('navigation');
      openNavigation();
    } else if ($('body').hasClass('disable-navigation-wrapper')) {
      $('body').removeClass('disable-navigation-wrapper');
    } else {
      $('body').addClass('disable-navigation-wrapper');
    }
  };

  // <li className="nav-item"><IconButton className="nav-link border-0 d-none d-sm-block" onClick={() => openThreadsMessageModal(room)} tooltipPlacement="bottom" tooltip="Threads" fa="bi bi-layers" /></li>

  return <Header>

    <ul className='navbar-nav mr-auto'>

      {!disableActions ? <li className="nav-item back-navigation">

        <IconButton
          className="nav-link nav-sidebar-1"
          fa="fa-solid fa-chevron-left"
          tooltip="Navigation sidebar"
          tooltipPlacement="bottom"
          onClick={navigationSidebarCallback}
        />

        <IconButton
          className="nav-link nav-sidebar-2"
          fa="fa-solid fa-chevron-right"
          tooltip="Navigation sidebar"
          tooltipPlacement="bottom"
          onClick={navigationSidebarCallback}
        />

      </li> : null}

      <li className="nav-item avatar-base">

        {!disableActions ? <button
          className="nav-link btn btn-bg border-0 p-1"
          onClick={() => toggleRoomSettings()}
          type="button"
        >

          <Avatar className='d-inline-block me-2' imageSrc={avatarSrc} text={roomName} bgColor={colorMXID(roomId)} size="small" isDefaultImage />
          <span className='me-2 text-truncate d-inline-block room-name'>{twemojifyReact(roomName)}</span>
          <RawIcon fa="fa-solid fa-chevron-down room-icon" />

        </button> : <button
          className="nav-link btn btn-bg border-0 p-1"
          onClick={(event) => roomAlias ? copyText(event, 'Room alias successfully copied to the clipboard.') : null}
          style={{ pointerEvents: !roomAlias ? 'none' : null }}
          type="button"
        >

          <Avatar className='d-inline-block me-2' imageSrc={avatarSrc} text={roomName} bgColor={colorMXID(roomId)} size="small" isDefaultImage />
          <span className='me-2 text-truncate d-inline-block room-name'>{twemojifyReact(roomName)}</span>

        </button>}

      </li>

    </ul>

    {!disableActions ? <ul className='navbar-nav ms-auto mb-0 small' id='room-options'>

      {mx.isRoomEncrypted(roomId) === false && (<>

        <li className="nav-item">
          <IconButton className="nav-link btn btn-bg border-0" onClick={() => toggleRoomSettings(tabText.SEARCH)} tooltipPlacement="bottom" tooltip="Search" fa="fa-solid fa-magnifying-glass" />
        </li>



        <li className="nav-item"><IconButton className="nav-link border-0 d-none d-sm-block" onClick={() => openPinMessageModal(room)} tooltipPlacement="bottom" tooltip="Pinned Messages" fa="bi bi-pin-angle-fill" /></li>

      </>)}

      <li className="nav-item"><IconButton className="nav-link border-0 d-none d-sm-block" onClick={togglePeopleDrawer} tooltipPlacement="bottom" tooltip="People" fa="fa-solid fa-user" /></li>
      <li className="nav-item"><IconButton className="nav-link border-0 d-none d-sm-block" onClick={() => toggleRoomSettings(tabText.MEMBERS)} tooltipPlacement="bottom" tooltip="Members" fa="fa-solid fa-users" /></li>

      <li className="nav-item">
        <IconButton
          tooltipPlacement="bottom"
          className="nav-link border-0"
          onClick={openRoomOptions}
          tooltip="Options"
          fa="bi bi-three-dots-vertical"
        />
      </li>

    </ul> : null}

  </Header>;

}
RoomViewHeader.defaultProps = {
  disableActions: false,
};

RoomViewHeader.propTypes = {
  roomId: PropTypes.string.isRequired,
  disableActions: PropTypes.bool,
};

export default RoomViewHeader;
