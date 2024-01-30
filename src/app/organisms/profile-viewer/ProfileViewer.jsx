import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import clone from 'clone';

import { twemojifyReact } from '../../../util/twemojify';
import { getUserStatus, updateUserStatusIcon } from '../../../util/onlineStatus';

import imageViewer from '../../../util/imageViewer';

import initMatrix from '../../../client/initMatrix';
import cons from '../../../client/state/cons';
import navigation from '../../../client/state/navigation';
import { selectRoom, openReusableContextMenu, selectRoomMode } from '../../../client/action/navigation';
import * as roomActions from '../../../client/action/room';

import {
  getUsername, getUsernameOfRoomMember, getPowerLabel, hasDMWith, hasDevices, getCurrentState,
} from '../../../util/matrixUtil';
import { getEventCords } from '../../../util/common';
import { colorMXID, cssColorMXID } from '../../../util/colorMXID';

import Text from '../../atoms/text/Text';
import Chip from '../../atoms/chip/Chip';
import Input from '../../atoms/input/Input';
import Avatar from '../../atoms/avatar/Avatar';
import Button from '../../atoms/button/Button';
import { MenuItem } from '../../atoms/context-menu/ContextMenu';
import PowerLevelSelector from '../../molecules/power-level-selector/PowerLevelSelector';
import Dialog from '../../molecules/dialog/Dialog';

import { useForceUpdate } from '../../hooks/useForceUpdate';
import { confirmDialog } from '../../molecules/confirm-dialog/ConfirmDialog';
import { addToDataFolder, getDataList } from '../../../util/selectedRoom';
import { getUserWeb3Account, getWeb3Cfg } from '../../../util/web3';

import renderAbout from './tabs/main';
import renderEthereum from './tabs/ethereum';

import copyText from './copyText';
import tinyAPI from '../../../util/mods';

function ModerationTools({
  roomId, userId,
}) {
  const mx = initMatrix.matrixClient;
  const room = mx.getRoom(roomId);
  const roomMember = room.getMember(userId);

  const myPowerLevel = room.getMember(mx.getUserId())?.powerLevel || 0;
  const powerLevel = roomMember?.powerLevel || 0;
  const canIKick = (
    roomMember?.membership === 'join'
    && getCurrentState(room).hasSufficientPowerLevelFor('kick', myPowerLevel)
    && powerLevel < myPowerLevel
  );
  const canIBan = (
    ['join', 'leave'].includes(roomMember?.membership)
    && getCurrentState(room).hasSufficientPowerLevelFor('ban', myPowerLevel)
    && powerLevel < myPowerLevel
  );

  const handleKick = (e) => {
    e.preventDefault();
    const kickReason = e.target.elements['kick-reason']?.value.trim();
    roomActions.kick(roomId, userId, kickReason !== '' ? kickReason : undefined);
  };

  const handleBan = (e) => {
    e.preventDefault();
    const banReason = e.target.elements['ban-reason']?.value.trim();
    roomActions.ban(roomId, userId, banReason !== '' ? banReason : undefined);
  };

  return (
    (canIKick || canIBan) && (
      <div className="card-body">
        {canIKick && (
          <form onSubmit={handleKick}>
            <div className="input-group mb-3">
              <Input placeholder="Kick reason" name="kick-reason" />
              <Button className="border-bg" variant='outline-secondary' type="submit">Kick</Button>
            </div>
          </form>
        )}
        {canIBan && (
          <form onSubmit={handleBan}>
            <div className="input-group mb-3">
              <Input placeholder="Ban reason" name="ban-reason" />
              <Button className="border-bg" variant='outline-secondary' type="submit">Ban</Button>
            </div>
          </form>
        )}
      </div>
    ));
}
ModerationTools.propTypes = {
  roomId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
};

function SessionInfo({ userId }) {
  const [devices, setDevices] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const Crypto = initMatrix.matrixClient.getCrypto();

  useEffect(() => {
    let isUnmounted = false;

    async function loadDevices() {
      try {

        let input = await Crypto.getUserDeviceInfo([userId]);
        input = input.get(userId);

        const myDevices = [];
        input.forEach((value) => { myDevices.push(value); });

        if (isUnmounted) return;

        setDevices(myDevices);

      } catch {
        setDevices([]);
      }
    }
    loadDevices();

    return () => {
      isUnmounted = true;
    };
  }, [userId]);

  function renderSessionChips() {
    if (!isVisible) return null;
    return (
      <li className='list-group-item bg-bg text-center'>
        {devices === null && <Text variant="b2">Loading sessions...</Text>}
        {devices?.length === 0 && <Text variant="b2">No session found.</Text>}
        {devices !== null && (devices.map((device) => (
          <Chip
            key={device.deviceId}
            faSrc="fa-solid fa-shield"
            text={device.displayName || device.deviceId}
          />
        )))}
      </li>
    );
  }

  return (
    <ul className='list-group list-group-flush mt-3 border border-bg'>
      <MenuItem
        onClick={() => setIsVisible(!isVisible)}
        faSrc={isVisible ? "fa-solid fa-chevron-down" : "fa-solid fa-chevron-right"}
      >
        {`View ${devices?.length > 0 ? `${devices.length} ` : ''}sessions`}
      </MenuItem>
      {renderSessionChips()}
    </ul>
  );
}

SessionInfo.propTypes = {
  userId: PropTypes.string.isRequired,
};

function ProfileFooter({ roomId, userId, onRequestClose }) {
  const [isCreatingDM, setIsCreatingDM] = useState(false);
  const [isIgnoring, setIsIgnoring] = useState(false);
  const [isUserIgnored, setIsUserIgnored] = useState(initMatrix.matrixClient.isUserIgnored(userId));

  const isMountedRef = useRef(true);
  const mx = initMatrix.matrixClient;
  const room = mx.getRoom(roomId);
  const member = room.getMember(userId);
  const isInvitable = member?.membership !== 'join' && member?.membership !== 'ban';

  const [isInviting, setIsInviting] = useState(false);
  const [isInvited, setIsInvited] = useState(member?.membership === 'invite');

  const myPowerlevel = room.getMember(mx.getUserId())?.powerLevel || 0;
  const userPL = room.getMember(userId)?.powerLevel || 0;
  const canIKick = getCurrentState(room).hasSufficientPowerLevelFor('kick', myPowerlevel) && userPL < myPowerlevel;

  const isBanned = member?.membership === 'ban';

  const onCreated = (dmRoomId) => {
    if (isMountedRef.current === false) return;
    setIsCreatingDM(false);
    selectRoomMode('room');
    selectRoom(dmRoomId);
    onRequestClose();
  };

  useEffect(() => {
    const { roomList } = initMatrix;
    roomList.on(cons.events.roomList.ROOM_CREATED, onCreated);
    return () => {
      isMountedRef.current = false;
      roomList.removeListener(cons.events.roomList.ROOM_CREATED, onCreated);
    };
  }, []);
  useEffect(() => {
    setIsUserIgnored(initMatrix.matrixClient.isUserIgnored(userId));
    setIsIgnoring(false);
    setIsInviting(false);
  }, [userId]);

  const openDM = async () => {
    // Check and open if user already have a DM with userId.
    const dmRoomId = hasDMWith(userId);
    if (dmRoomId) {
      selectRoomMode('room');
      selectRoom(dmRoomId);
      onRequestClose();
      return;
    }

    // Create new DM
    try {
      setIsCreatingDM(true);
      await roomActions.createDM(userId, await hasDevices(userId));
    } catch {
      if (isMountedRef.current === false) return;
      setIsCreatingDM(false);
    }
  };

  const toggleIgnore = async () => {
    const isIgnored = mx.getIgnoredUsers().includes(userId);

    try {
      setIsIgnoring(true);
      if (isIgnored) {
        await roomActions.unignore([userId]);
      } else {
        await roomActions.ignore([userId]);
      }

      if (isMountedRef.current === false) return;
      setIsUserIgnored(!isIgnored);
      setIsIgnoring(false);
    } catch {
      setIsIgnoring(false);
    }
  };

  const toggleInvite = async () => {
    try {
      setIsInviting(true);
      let isInviteSent = false;
      if (isInvited) await roomActions.kick(roomId, userId);
      else {
        await roomActions.invite(roomId, userId);
        isInviteSent = true;
      }
      if (isMountedRef.current === false) return;
      setIsInvited(isInviteSent);
      setIsInviting(false);
    } catch {
      setIsInviting(false);
    }
  };

  return (
    <>
      <Button
        className='me-2'
        variant="primary"
        onClick={openDM}
        disabled={isCreatingDM}
      >
        {isCreatingDM ? 'Creating room...' : 'Message'}
      </Button>

      {isBanned && canIKick && (
        <Button
          className='mx-2'
          variant="success"
          onClick={() => roomActions.unban(roomId, userId)}
        >
          Unban
        </Button>
      )}

      {(isInvited ? canIKick : room.canInvite(mx.getUserId())) && isInvitable && (
        <Button
          className='mx-2'
          variant='secondary'
          onClick={toggleInvite}
          disabled={isInviting}
        >
          {
            isInvited
              ? `${isInviting ? 'Disinviting...' : 'Disinvite'}`
              : `${isInviting ? 'Inviting...' : 'Invite'}`
          }
        </Button>
      )}

      <Button
        className='ms-2'
        variant={isUserIgnored ? 'success' : 'danger'}
        onClick={toggleIgnore}
        disabled={isIgnoring}
      >
        {
          isUserIgnored
            ? `${isIgnoring ? 'Unignoring...' : 'Unignore'}`
            : `${isIgnoring ? 'Ignoring...' : 'Ignore'}`
        }
      </Button>

    </>
  );
}
ProfileFooter.propTypes = {
  roomId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  onRequestClose: PropTypes.func.isRequired,
};

function useToggleDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const loadProfile = (uId, rId) => {
      setIsOpen(true);
      setUserId(uId);
      setRoomId(rId);
    };
    navigation.on(cons.events.navigation.PROFILE_VIEWER_OPENED, loadProfile);
    return () => {
      navigation.removeListener(cons.events.navigation.PROFILE_VIEWER_OPENED, loadProfile);
    };
  }, []);

  const closeDialog = () => setIsOpen(false);

  const afterClose = () => {
    setUserId(null);
    setRoomId(null);
  };

  return [isOpen, roomId, userId, closeDialog, afterClose];
}

function useRerenderOnProfileChange(roomId, userId) {
  const mx = initMatrix.matrixClient;
  const [, forceUpdate] = useForceUpdate();
  useEffect(() => {
    const handleProfileChange = (mEvent, member) => {
      if (
        mEvent.getRoomId() === roomId
        && (member.userId === userId || member.userId === mx.getUserId())
      ) {
        forceUpdate();
      }
    };
    mx.on('RoomMember.powerLevel', handleProfileChange);
    mx.on('RoomMember.membership', handleProfileChange);
    return () => {
      mx.removeListener('RoomMember.powerLevel', handleProfileChange);
      mx.removeListener('RoomMember.membership', handleProfileChange);
    };
  }, [roomId, userId]);
}

// Read Profile
let tinyMenuId = 'default';
function ProfileViewer() {

  // Prepare
  const menubarRef = useRef(null);
  const profileAvatar = useRef(null);
  const bioRef = useRef(null);
  const timezoneRef = useRef(null);
  const noteRef = useRef(null);
  const customStatusRef = useRef(null);
  const statusRef = useRef(null);
  const profileBanner = useRef(null);

  const customPlaceRef = useRef(null);

  const [isOpen, roomId, userId, closeDialog, handleAfterClose] = useToggleDialog();
  const [lightbox, setLightbox] = useState(false);

  const userNameRef = useRef(null);
  const userPronounsRef = useRef(null);
  const displayNameRef = useRef(null);

  useRerenderOnProfileChange(roomId, userId);

  // Get Data
  const mx = initMatrix.matrixClient;
  const user = mx.getUser(userId);
  const room = mx.getRoom(roomId);
  let avatarUrl;
  let username;

  if (!isOpen) tinyMenuId = 'default';

  useEffect(() => {
    if (user) {

      // Menu Bar
      const menubar = $(menubarRef.current);
      const menuBarItems = [];

      // Get refs
      const bioPlace = $(bioRef.current);
      const timezonePlace = $(timezoneRef.current);
      const customPlace = $(customPlaceRef.current);

      // Actions
      const actions = {
        ethereum: renderEthereum,
      };

      tinyAPI.emit('profileTabs', actions);

      // Execute Menu
      const executeMenu = (where, tinyData) => {

        // Hide items
        bioPlace.addClass('no-show').addClass('d-none');
        timezonePlace.addClass('no-show').addClass('d-none');
        customPlace.addClass('d-none');

        // Show items back
        if (typeof actions[where] === 'function') {
          const tinyPlace = customPlace.find('#insert-custom-place');
          tinyPlace.empty().append(actions[where](tinyPlace, user, tinyData.content?.presenceStatusMsg, tinyData.ethereumValid));
          customPlace.removeClass('d-none');
        } else {
          timezonePlace.removeClass('no-show').removeClass('d-none');
          bioPlace.removeClass('no-show').removeClass('d-none');
        }

      };

      // Create menu
      const menuItem = (name, openItem = null, tinyData = {}) => {

        const button = $('<a>', { class: `nav-link text-bg-force${openItem === tinyMenuId ? ' active' : ''}${openItem !== 'default' ? ' ms-3' : ''}`, href: '#' }).on('click', () => {

          for (const item in menuBarItems) {
            menuBarItems[item].removeClass('active');
          }

          button.addClass('active');

          executeMenu(openItem, tinyData);
          tinyMenuId = openItem;
          return false;

        });

        menuBarItems.push(button);
        return $('<li>', { class: 'nav-item' }).append(button.text(name));

      };

      // Create Menu Bar Time
      const enableMenuBar = (content, ethereumValid, menubarReasons = 0) => {

        // Clear Menu bar
        menubar.empty().removeClass('d-none');

        // Start functions
        if (menubarReasons > 0) {

          const tinyData = { content, ethereumValid };

          // User info
          menubar.append(menuItem('User info', 'default', tinyData));

          // Ethereum
          tinyAPI.emit('profileTabsSpawnBefore', tinyData, user, (name, id) => menubar.append(menuItem(name, id, tinyData)));
          if (ethereumValid) {
            tinyAPI.emit('profileTabsSpawnEthereumBefore', tinyData, user, (name, id) => menubar.append(menuItem(name, id, tinyData)));
            menubar.append(menuItem('Ethereum', 'ethereum', tinyData));
            tinyAPI.emit('profileTabsSpawnEthereumAfter', tinyData, user, (name, id) => menubar.append(menuItem(name, id, tinyData)));
          }
          tinyAPI.emit('profileTabsSpawnAfter', tinyData, user, (name, id) => menubar.append(menuItem(name, id, tinyData)));

          // First Execute
          executeMenu(tinyMenuId, tinyData);

        }

        // Nope
        else {
          menubar.addClass('d-none');
        }

      };

      // Update Status Profile
      const updateProfileStatus = (mEvent, tinyData) => {

        // Ethereum Config
        const ethConfig = getWeb3Cfg();

        // Get Status
        let menubarReasons = 0;
        const tinyUser = tinyData;
        const status = $(statusRef.current);

        // Is You
        if (tinyUser.userId === mx.getUserId()) {
          const yourData = clone(mx.getAccountData('pony.house.profile')?.getContent() ?? {});
          yourData.ethereum = getUserWeb3Account();
          if (typeof yourData.ethereum.valid !== 'undefined') delete yourData.ethereum.valid;
          tinyUser.presenceStatusMsg = JSON.stringify(yourData);
        }

        // Update Status Icon
        const content = updateUserStatusIcon(status, tinyUser);
        const existPresence = (content && content.presenceStatusMsg);
        const ethereumValid = (__ENV_APP__.WEB3 && existPresence && content.presenceStatusMsg.ethereum && content.presenceStatusMsg.ethereum.valid);
        if (existPresence) {

          // Ethereum
          if (ethConfig.web3Enabled && ethereumValid) {
            menubarReasons++;
          }

          // About Page
          renderAbout(userPronounsRef, ethereumValid, displayNameRef, customStatusRef, profileBanner, bioRef, timezoneRef, content);

        }

        enableMenuBar(content, ethereumValid, menubarReasons);

      };

      // Copy Profile Username
      const copyUsername = {
        tag: (event) => copyText(event, 'Username successfully copied to the clipboard.'),
        display: (event) => copyText(event, 'Display name successfully copied to the clipboard.'),
      };

      // Avatar Preview
      const tinyAvatarPreview = () => {
        imageViewer({ lightbox, imgQuery: $(profileAvatar.current).find('> img'), name: username, url: avatarUrl, readMime: true });
      };

      // Update Note
      const tinyNoteUpdate = (event) => {
        addToDataFolder('user_cache', 'note', userId, $(event.target).val(), 200);
      };

      const tinyNoteSpacing = (event) => {
        const element = event.target;
        element.style.height = "5px";
        element.style.height = `${Number(element.scrollHeight)}px`;
      };

      // Read Events
      const tinyNote = getDataList('user_cache', 'note', userId);

      user.on('User.currentlyActive', updateProfileStatus);
      user.on('User.lastPresenceTs', updateProfileStatus);
      user.on('User.presence', updateProfileStatus);

      $(displayNameRef.current).find('> .button').on('click', copyUsername.display);
      $(userNameRef.current).find('> .button').on('click', copyUsername.tag);

      $(profileAvatar.current).on('click', tinyAvatarPreview);
      $(noteRef.current).on('change', tinyNoteUpdate).on('keypress keyup keydown', tinyNoteSpacing).val(tinyNote);

      tinyNoteSpacing({ target: noteRef.current });
      updateProfileStatus(null, user);

      return () => {
        menubar.empty();
        $(displayNameRef.current).find('> .button').off('click', copyUsername.display);
        $(userNameRef.current).find('> .button').off('click', copyUsername.tag);
        $(noteRef.current).off('change', tinyNoteUpdate).off('keypress keyup keydown', tinyNoteSpacing);
        $(profileAvatar.current).off('click', tinyAvatarPreview);
        user.removeListener('User.currentlyActive', updateProfileStatus);
        user.removeListener('User.lastPresenceTs', updateProfileStatus);
        user.removeListener('User.presence', updateProfileStatus);
      };

    }
  }, [user]);

  // Render Profile
  const renderProfile = () => {

    const roomMember = room.getMember(userId);
    username = roomMember ? getUsernameOfRoomMember(roomMember) : getUsername(userId);

    const avatarMxc = roomMember?.getMxcAvatarUrl?.() || user?.avatarUrl;
    avatarUrl = (avatarMxc && avatarMxc !== 'null') ? mx.mxcUrlToHttp(avatarMxc) : null;

    const powerLevel = roomMember?.powerLevel || 0;
    const myPowerLevel = room.getMember(mx.getUserId())?.powerLevel || 0;

    const canChangeRole = (
      getCurrentState(room).maySendEvent('m.room.power_levels', mx.getUserId())
      && (powerLevel < myPowerLevel || userId === mx.getUserId())
    );

    const handleChangePowerLevel = async (newPowerLevel) => {
      if (newPowerLevel === powerLevel) return;
      const SHARED_POWER_MSG = 'You will not be able to undo this change as you are promoting the user to have the same power level as yourself. Are you sure?';
      const DEMOTING_MYSELF_MSG = 'You will not be able to undo this change as you are demoting yourself. Are you sure?';

      const isSharedPower = newPowerLevel === myPowerLevel;
      const isDemotingMyself = userId === mx.getUserId();
      if (isSharedPower || isDemotingMyself) {
        const isConfirmed = await confirmDialog(
          'Change power level',
          isSharedPower ? SHARED_POWER_MSG : DEMOTING_MYSELF_MSG,
          'Change',
          'warning',
        );
        if (!isConfirmed) return;
        roomActions.setPowerLevel(roomId, userId, newPowerLevel);
      } else {
        roomActions.setPowerLevel(roomId, userId, newPowerLevel);
      }
    };

    const handlePowerSelector = (e) => {
      openReusableContextMenu(
        'bottom',
        getEventCords(e, '.btn-link'),
        (closeMenu) => (
          <PowerLevelSelector
            value={powerLevel}
            max={myPowerLevel}
            onSelect={(pl) => {
              closeMenu();
              handleChangePowerLevel(pl);
            }}
          />
        ),
      );
    };

    const toggleLightbox = () => {
      if (!avatarUrl) return;
      setLightbox(!lightbox);
    };

    return (
      <>

        <div ref={profileBanner} className={`profile-banner profile-bg${cssColorMXID(userId)}`} />

        <div className='p-4'>

          <div className="row pb-3">

            <div
              className='col-lg-3 text-center d-flex justify-content-center modal-user-profile-avatar'
              onClick={toggleLightbox}
              onKeyDown={toggleLightbox}
            >
              <Avatar ref={profileAvatar} imageSrc={avatarUrl} text={username} bgColor={colorMXID(userId)} size="large" isDefaultImage />
              <i ref={statusRef} className={`user-status user-status-icon pe-2 ${getUserStatus(user)}`} />
            </div>


            <div className='col-md-9'>
              <div className='float-end'>
                {userId !== mx.getUserId() && (
                  <ProfileFooter roomId={roomId} userId={userId} onRequestClose={closeDialog} />
                )}
              </div>
            </div>

          </div>

          <div className="card bg-bg">

            <div className="card-body">

              <div className="profile-viewer__user__role float-end noselect">
                <div className="very-small text-gray">Role</div>
                <Button
                  onClick={canChangeRole ? handlePowerSelector : null}
                  faSrc={canChangeRole ? "fa-solid fa-check" : null}
                >
                  {`${getPowerLabel(powerLevel) || 'Member'} - ${powerLevel}`}
                </Button>
              </div>

              <h6 ref={displayNameRef} className='emoji-size-fix m-0 mb-1 fw-bold display-name'><span className='button'>{twemojifyReact(username)}</span></h6>
              <small ref={userNameRef} className='text-gray emoji-size-fix username'><span className='button'>{twemojifyReact(userId)}</span></small>
              <div ref={userPronounsRef} className='text-gray emoji-size-fix pronouns small d-none' />

              <div ref={customStatusRef} className='d-none mt-2 emoji-size-fix small user-custom-status' />
              <ul ref={menubarRef} id='usertabs' className='nav nav-underline mt-2 small' />

              <div ref={customPlaceRef} className='d-none'>
                <hr />
                <div id='insert-custom-place' />
              </div>

              <div ref={timezoneRef} className='d-none'>

                <hr />

                <div className='text-gray text-uppercase fw-bold very-small mb-2'>Timezone</div>
                <div id='tiny-timezone' className='emoji-size-fix small text-freedom' />

              </div>

              <div ref={bioRef} className='d-none'>

                <hr />

                <div className='text-gray text-uppercase fw-bold very-small mb-2'>About me</div>
                <div id='tiny-bio' className='emoji-size-fix small text-freedom' />

              </div>

              <hr />

              <label for="tiny-note" className="form-label text-gray text-uppercase fw-bold very-small mb-2">Note</label>
              <textarea ref={noteRef} spellCheck="false" className="form-control form-control-bg emoji-size-fix small" id="tiny-note" placeholder="Insert a note here" />

            </div>

            <ModerationTools roomId={roomId} userId={userId} />

          </div>

          <SessionInfo userId={userId} />

        </div>

      </>
    );

  };

  // Read Modal
  return (
    <Dialog
      bodyClass='bg-bg2 p-0'
      className="modal-dialog-scrollable modal-dialog-centered modal-lg noselect modal-dialog-user-profile"
      isOpen={isOpen}
      title='User Profile'
      onAfterClose={handleAfterClose}
      onRequestClose={closeDialog}
    >
      {roomId ? renderProfile() : <div />}
    </Dialog>
  );
}

export default ProfileViewer;
