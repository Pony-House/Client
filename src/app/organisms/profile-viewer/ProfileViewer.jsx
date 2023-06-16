import ReactDOMServer from 'react-dom/server';
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import { twemojify } from '../../../util/twemojify';
import { getUserStatus, updateUserStatusIcon } from '../../../util/onlineStatus';

import initMatrix from '../../../client/initMatrix';
import cons from '../../../client/state/cons';
import navigation from '../../../client/state/navigation';
import { selectRoom, openReusableContextMenu } from '../../../client/action/navigation';
import * as roomActions from '../../../client/action/room';

import {
  getUsername, getUsernameOfRoomMember, getPowerLabel, hasDMWith, hasDevices,
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
    && room.currentState.hasSufficientPowerLevelFor('kick', myPowerLevel)
    && powerLevel < myPowerLevel
  );
  const canIBan = (
    ['join', 'leave'].includes(roomMember?.membership)
    && room.currentState.hasSufficientPowerLevelFor('ban', myPowerLevel)
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
  );
}
ModerationTools.propTypes = {
  roomId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
};

function SessionInfo({ userId }) {
  const [devices, setDevices] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const mx = initMatrix.matrixClient;

  useEffect(() => {
    let isUnmounted = false;

    async function loadDevices() {
      try {
        await mx.downloadKeys([userId], true);
        const myDevices = mx.getStoredDevicesForUser(userId);

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
            text={device.getDisplayName() || device.deviceId}
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
  const canIKick = room.currentState.hasSufficientPowerLevelFor('kick', myPowerlevel) && userPL < myPowerlevel;

  const isBanned = member?.membership === 'ban';

  const onCreated = (dmRoomId) => {
    if (isMountedRef.current === false) return;
    setIsCreatingDM(false);
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
function ProfileViewer() {

  // Prepare
  const bioRef = useRef(null);
  const customStatusRef = useRef(null);
  const statusRef = useRef(null);
  const profileBanner = useRef(null);
  const [isOpen, roomId, userId, closeDialog, handleAfterClose] = useToggleDialog();
  useRerenderOnProfileChange(roomId, userId);

  // Get Data
  const mx = initMatrix.matrixClient;
  const user = mx.getUser(userId);
  const room = mx.getRoom(roomId);

  useEffect(() => {
    if (user) {

      // Update Status Profile
      const updateProfileStatus = (mEvent, tinyData) => {
        if (statusRef && statusRef.current) {

          // Get Status
          const tinyUser = tinyData;
          const status = statusRef.current;

          // Is You
          if (tinyUser.userId === mx.getUserId()) {
            const yourData = mx.getAccountData('pony.house.profile')?.getContent() ?? {};
            tinyUser.presenceStatusMsg = JSON.stringify(yourData);
          }

          // Update Status Icon
          const content = updateUserStatusIcon(status, tinyUser);
          if (content && content.presenceStatusMsg) {

            // Get Banner Data
            if (profileBanner.current) {
              const bannerDOM = profileBanner.current;
              if (bannerDOM) {
                if (typeof content.presenceStatusMsg.banner === 'string' && content.presenceStatusMsg.banner.length > 0) {
                  bannerDOM.style.backgroundImage = `url("${content.presenceStatusMsg.banner}")`;
                } else {
                  bannerDOM.style.backgroundImage = '';
                }
              }
            }

            // Get Bio Data
            if (bioRef.current) {
              const bioDOM = bioRef.current;
              if (bioDOM) {
                const tinyBio = bioDOM.querySelector('#tiny-bio');
                if (tinyBio) {
                  bioDOM.classList.remove('d-none');
                  if (typeof content.presenceStatusMsg.bio === 'string' && content.presenceStatusMsg.bio.length > 0) {
                    tinyBio.innerHTML = ReactDOMServer.renderToStaticMarkup(twemojify(content.presenceStatusMsg.bio.substring(0, 190), undefined, true, false, true));
                  } else {
                    bioDOM.classList.add('d-none');
                    tinyBio.innerHTML = '';
                  }
                } else {
                  bioDOM.classList.add('d-none');
                }
              }
            }

            // Get Custom Status Data
            if (customStatusRef.current) {
              const customStatusDOM = customStatusRef.current;
              if (customStatusDOM) {
                customStatusDOM.classList.remove('d-none');
                if (
                  content.presence !== 'offline' && content.presence !== 'unavailable' &&
                  typeof content.presenceStatusMsg.msg === 'string' && content.presenceStatusMsg.msg.length > 0
                ) {
                  customStatusDOM.innerHTML = ReactDOMServer.renderToStaticMarkup(twemojify(content.presenceStatusMsg.msg.substring(0, 100)));
                } else {
                  customStatusDOM.classList.add('d-none');
                  customStatusDOM.innerHTML = '';
                }
              }
            }

          }

        }
      };

      // Read Events
      updateProfileStatus(null, user);
      user.on('User.currentlyActive', updateProfileStatus);
      user.on('User.lastPresenceTs', updateProfileStatus);
      user.on('User.presence', updateProfileStatus);
      return () => {
        user.removeListener('User.currentlyActive', updateProfileStatus);
        user.removeListener('User.lastPresenceTs', updateProfileStatus);
        user.removeListener('User.presence', updateProfileStatus);
      };

    }
  }, [user]);

  // Render Profile
  const renderProfile = () => {

    const roomMember = room.getMember(userId);
    const username = roomMember ? getUsernameOfRoomMember(roomMember) : getUsername(userId);

    const avatarMxc = roomMember?.getMxcAvatarUrl?.() || user?.avatarUrl;
    const avatarUrl = (avatarMxc && avatarMxc !== 'null') ? mx.mxcUrlToHttp(avatarMxc) : null;

    const powerLevel = roomMember?.powerLevel || 0;
    const myPowerLevel = room.getMember(mx.getUserId())?.powerLevel || 0;

    const canChangeRole = (
      room.currentState.maySendEvent('m.room.power_levels', mx.getUserId())
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

    return (
      <>

        <div ref={profileBanner} className={`profile-banner profile-bg${cssColorMXID(userId)}`} />

        <div className='p-4'>

          <div className="row pb-3">

            <div className='col-lg-3 text-center d-flex justify-content-center'>
              <Avatar imageSrc={avatarUrl} text={username} bgColor={colorMXID(userId)} size="large" />
              <i ref={statusRef} className={`user-status pe-2 ${getUserStatus(user)}`} />
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

              <h6 className='emoji-size-fix m-0 mb-1'><strong>{twemojify(username)}</strong></h6>
              <small className='text-gray emoji-size-fix'>{twemojify(userId)}</small>

              <div ref={customStatusRef} className='d-none mt-2 emoji-size-fix small' />

              <div ref={bioRef} className='d-none'>

                <hr />

                <div className='text-gray emoji-size-fix text-uppercase fw-bold very-small mb-2'>About me</div>
                <div id='tiny-bio' className='emoji-size-fix small text-freedom' />

              </div>

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
      className="modal-dialog-scrollable modal-lg noselect user-profile"
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
