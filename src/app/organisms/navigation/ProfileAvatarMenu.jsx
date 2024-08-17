import React, { useState, useEffect, useRef, useReducer } from 'react';
import $ from 'jquery';

import { UserEvent } from 'matrix-js-sdk';
import clone from 'clone';

import { ImgJquery } from '@src/app/atoms/image/Image';
import jReact from '@mods/lib/jReact';
import soundFiles from '@src/util/soundFiles';
import { convertUserId, dfAvatarSize } from '@src/util/matrixUtil';
import UserStatusIcon from '@src/app/atoms/user-status/UserStatusIcon';

import IconButton from '../../atoms/button/IconButton';
import { twemojifyReact } from '../../../util/twemojify';
import navigation from '../../../client/state/navigation';
import Avatar from '../../atoms/avatar/Avatar';
import cons from '../../../client/state/cons';

import { colorMXID } from '../../../util/colorMXID';

import initMatrix from '../../../client/initMatrix';
import { tabText as settingTabText } from '../settings/Settings';
import { canUsePresence, getPresence, getUserStatus } from '../../../util/onlineStatus';

import { openSettings } from '../../../client/action/navigation';
import tinyAPI from '../../../util/mods';
import { enableAfkSystem } from '../../../util/userStatusEffects';
import { getUserWeb3Account } from '../../../util/web3';

import matrixAppearance from '../../../util/libs/appearance';

// Account Status
const accountStatus = { status: null, data: null };
export function getAccountStatus(where) {
  if (typeof where === 'string' && accountStatus.data) {
    if (where !== 'status') {
      return clone(accountStatus.status);
    }

    return clone(accountStatus.data[where]);
  }

  return null;
}

// Profile Avatar Menu
function ProfileAvatarMenu() {
  // Data
  const mx = initMatrix.matrixClient;
  const mxcUrl = initMatrix.mxcUrl;
  const voiceChat = initMatrix.voiceChat;

  const user = mx.getUser(mx.getUserId());
  const [, forceUpdate] = useReducer((count) => count + 1, 0);

  const [accountContent, setAccountContent] = useState(null);
  const [microphoneMuted, setMicrophoneMuted] = useState(voiceChat.getMicrophoneMute());
  const [audioMuted, setAudioMuted] = useState(voiceChat.getAudioMute());

  // Get Display
  const [profile, setProfile] = useState({
    userId: user.userId,
    avatarUrl: null,
    displayName: user.displayName,
  });

  useEffect(() => {
    if (user) {
      // Update Status Profile
      const updateProfileStatus = (mEvent, tinyUser, isFirstTime = false) => {
        setAccountContent(getPresence(tinyUser));
      };
      user.on(UserEvent.AvatarUrl, updateProfileStatus);
      user.on(UserEvent.CurrentlyActive, updateProfileStatus);
      user.on(UserEvent.LastPresenceTs, updateProfileStatus);
      user.on(UserEvent.Presence, updateProfileStatus);
      user.on(UserEvent.DisplayName, updateProfileStatus);
      if (!accountContent) updateProfileStatus(null, user);
      return () => {
        if (user) user.removeListener(UserEvent.CurrentlyActive, updateProfileStatus);
        if (user) user.removeListener(UserEvent.LastPresenceTs, updateProfileStatus);
        if (user) user.removeListener(UserEvent.Presence, updateProfileStatus);
        if (user) user.removeListener(UserEvent.AvatarUrl, updateProfileStatus);
        if (user) user.removeListener(UserEvent.DisplayName, updateProfileStatus);
      };
    }
  });

  useEffect(() => {
    const tinyUpdate = () => forceUpdate();
    matrixAppearance.off('simplerHashtagSameHomeServer', tinyUpdate);
    return () => {
      matrixAppearance.off('simplerHashtagSameHomeServer', tinyUpdate);
    };
  });

  // Complete
  return (
    <table className="table table-borderless align-middle m-0" id="user-menu">
      <tbody>
        <tr>
          <td className="sidebar-photo p-0">
            <button
              className="btn btn-bg btn-link btn-sm ms-1 text-truncate text-start "
              onClick={() => openSettings(settingTabText.PROFILE)}
              type="button"
            >
              <Avatar
                className="d-inline-block float-start profile-image-container"
                imgClass="profile-image-container"
                text={profile.displayName}
                bgColor={colorMXID(mx.getUserId())}
                size="normal"
                imageAnimSrc={mxcUrl.toHttp(profile.avatarUrl)}
                imageSrc={mxcUrl.toHttp(profile.avatarUrl, dfAvatarSize, dfAvatarSize)}
                isDefaultImage
              />
              {canUsePresence() && (
                <UserStatusIcon presenceData={accountContent} user={user} classBase="" />
              )}
              <div className="very-small ps-2 text-truncate emoji-size-fix-2" id="display-name">
                {profile.displayName}
              </div>
              <div
                className="very-small ps-2 text-truncate emoji-size-fix-2 user-custom-status"
                id="user-presence"
              >
                {convertUserId(profile.userId)}
              </div>
              <div className="very-small ps-2 text-truncate emoji-size-fix-2" id="user-id">
                {convertUserId(profile.userId)}
              </div>
            </button>
          </td>

          <td className="p-0 pe-1 py-1 text-end">
            <IconButton
              tooltip={<span>{microphoneMuted ? 'Unmute' : 'Mute'}</span>}
              tooltipPlacement="top"
              fa="fa-solid fa-microphone"
              className={`action-button${microphoneMuted ? ' muted' : ''}`}
              onClick={() => voiceChat.setMicrophoneMute(!microphoneMuted)}
            />
            {microphoneMuted ? <i className="fa-solid fa-slash tiny-block" /> : null}
          </td>

          <td className="p-0 pe-1 py-1 text-end">
            <IconButton
              tooltip={<span>{audioMuted ? 'Undeafen' : 'Deafen'}</span>}
              tooltipPlacement="top"
              fa="bi bi-headphones"
              className={`action-button-2${audioMuted ? ' muted' : ''}`}
              onClick={() => voiceChat.setAudioMute(!audioMuted)}
            />
            {audioMuted ? <i className="fa-solid fa-slash tiny-block-2" /> : null}
          </td>

          <td className="p-0 pe-1 py-1 text-end">
            <IconButton
              tooltip={<span>User Settings</span>}
              tooltipPlacement="top"
              fa="fa-solid fa-gear"
              className="action-button"
              onClick={openSettings}
            />
          </td>
        </tr>
      </tbody>
    </table>
  );
}

/*
<i className="fa-solid fa-microphone"></i>
<i className="bi bi-headphones"></i>
<i className="bi bi-webcam-fill"></i>
<i className="fa-solid fa-desktop"></i>
<i className="bi bi-telephone-x-fill"></i>
*/
export default ProfileAvatarMenu;
