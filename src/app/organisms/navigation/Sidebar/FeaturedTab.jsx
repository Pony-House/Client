import React, { useState, useEffect, useRef } from 'react';
import envAPI from '@src/util/libs/env';

import initMatrix from '../../../../client/initMatrix';
import cons from '../../../../client/state/cons';

import {
  selectTab,
  openSettings,
  selectRoom,
  selectRoomMode,
} from '../../../../client/action/navigation';
import { tabText as settingTabText } from '../../settings/Settings';

import { abbreviateNumber } from '../../../../util/common';
import { useSelectedTab } from '../../../hooks/useSelectedTab';

import Avatar from '../../../atoms/avatar/Avatar';
import { notificationClasses, useNotificationUpdate } from './Notification';
import SidebarAvatar from '../../../molecules/sidebar-avatar/SidebarAvatar';
import NotificationBadge from '../../../atoms/badge/NotificationBadge';
import { getUserWeb3Account, tinyCrypto } from '../../../../util/web3';
import navigation from '../../../../client/state/navigation';
import { setEthereumStatusButton } from '../../../../util/web3/status';
import { objType } from '../../../../util/tools';
import { colorMXID } from '../../../../util/colorMXID';
import { getAppearance, getAnimatedImageUrl } from '../../../../util/libs/appearance';

// Featured Tab
export default function FeaturedTab() {
  // Data
  const ethereumButton = useRef(null);
  const [userWeb3, setUserWeb3] = useState(getUserWeb3Account());
  const [selectedUser, setSelectedUser] = useState(null);
  const { roomList, accountData, notifications } = initMatrix;
  const [selectedTab] = useSelectedTab();
  useNotificationUpdate();

  const mx = initMatrix.matrixClient;
  const appearanceSettings = getAppearance();

  // Home
  function getHomeNoti() {
    const orphans = roomList.getOrphans();
    let noti = null;

    orphans.forEach((roomId) => {
      if (accountData.spaceShortcut.has(roomId)) return;
      if (!notifications.hasNoti(roomId)) return;
      if (noti === null) noti = { total: 0, highlight: 0 };
      const childNoti = notifications.getNoti(roomId);
      noti.total += childNoti.total;
      noti.highlight += childNoti.highlight;
    });

    return noti;
  }

  // DMs
  const dmsNotification = [];
  function getDMsNoti() {
    if (roomList.directs.size === 0) return null;
    let noti = null;

    [...roomList.directs].forEach((roomId) => {
      if (!notifications.hasNoti(roomId)) return;

      if (noti === null) noti = { total: 0, highlight: 0 };
      const childNoti = notifications.getNoti(roomId);

      noti.total += childNoti.total;
      noti.highlight += childNoti.highlight;

      if (appearanceSettings.pinDMmessages !== false)
        dmsNotification.push([mx.getRoom(roomId), childNoti]);
    });

    return noti;
  }

  // Get Data
  const dmsNoti = getDMsNoti();
  const homeNoti = getHomeNoti();

  // Ethereum
  useEffect(() => {
    if (ethereumButton.current) {
      setEthereumStatusButton($(ethereumButton.current));
    } else {
      setEthereumStatusButton(null);
    }

    const updateUserRoomSelected = (roomId) => setSelectedUser(roomId);
    const ethereumGetUpdate = (ethereumData) => setUserWeb3(ethereumData);
    navigation.on(cons.events.navigation.ETHEREUM_UPDATED, ethereumGetUpdate);
    navigation.on(cons.events.navigation.SELECTED_ROOM, updateUserRoomSelected);

    return () => {
      navigation.removeListener(cons.events.navigation.ETHEREUM_UPDATED, ethereumGetUpdate);
      navigation.removeListener(cons.events.navigation.SELECTED_ROOM, updateUserRoomSelected);
    };
  });

  // Complete
  return (
    <>
      <SidebarAvatar
        tooltip="Direct Messages"
        active={selectedTab === cons.tabs.DIRECTS}
        onClick={() => {
          setSelectedUser(null);
          selectTab(cons.tabs.DIRECTS);
        }}
        avatar={<Avatar faSrc="fa-solid fa-user" size="normal" />}
        notificationBadge={
          dmsNoti ? (
            <NotificationBadge
              className={notificationClasses}
              alert={dmsNoti?.highlight > 0}
              content={abbreviateNumber(dmsNoti.total) || null}
            />
          ) : null
        }
      />

      <SidebarAvatar
        tooltip="Home"
        active={selectedTab === cons.tabs.HOME}
        onClick={() => {
          setSelectedUser(null);
          selectTab(cons.tabs.HOME);
        }}
        avatar={<Avatar faSrc="fa-solid fa-house" size="normal" />}
        notificationBadge={
          homeNoti ? (
            <NotificationBadge
              className={notificationClasses}
              alert={homeNoti?.highlight > 0}
              content={abbreviateNumber(homeNoti.total) || null}
            />
          ) : null
        }
      />

      {envAPI.get('WEB3') && userWeb3.address ? (
        <SidebarAvatar
          ref={ethereumButton}
          tooltip={`Ethereum${!userWeb3.valid ? ' (INVALID ACCOUNT)' : ''}`}
          className={`ethereum-sidebar-icon ${userWeb3.valid ? 'ethereum-valid' : 'ethereum-invalid'}${!tinyCrypto.existEthereum() ? ' ethereum-none' : ''}`}
          active={null}
          onClick={() => openSettings(settingTabText.WEB3)}
          avatar={<Avatar faSrc="fa-brands fa-ethereum" size="normal" />}
          notificationBadge={null}
        />
      ) : null}

      {dmsNotification.length > 0 ? <div className="sidebar-divider" /> : null}
      {dmsNotification.map((data) => {
        const room = data[0];
        const childNoti = data[1];

        if (selectedUser !== room.roomId && objType(room, 'object')) {
          return (
            <SidebarAvatar
              active={false}
              tooltip={room.name}
              onClick={() => {
                selectTab(cons.tabs.DIRECTS);
                selectRoomMode('room');
                setSelectedUser(room.roomId);
                return selectRoom(room.roomId);
              }}
              avatar={
                <Avatar
                  text={room.name}
                  bgColor={colorMXID(room.roomId)}
                  size="normal"
                  animParentsCount={2}
                  imageAnimSrc={
                    !appearanceSettings.enableAnimParams
                      ? room.getAvatarFallbackMember()?.getAvatarUrl(mx.baseUrl)
                      : getAnimatedImageUrl(
                            room
                              .getAvatarFallbackMember()
                              ?.getAvatarUrl(mx.baseUrl, 42, 42, 'crop'),
                          ) || !appearanceSettings.enableAnimParams
                        ? room.getAvatarUrl(mx.baseUrl)
                        : getAnimatedImageUrl(room.getAvatarUrl(mx.baseUrl, 42, 42, 'crop')) || null
                  }
                  imageSrc={
                    room.getAvatarFallbackMember()?.getAvatarUrl(mx.baseUrl, 42, 42, 'crop') ||
                    room.getAvatarUrl(mx.baseUrl, 42, 42, 'crop') ||
                    null
                  }
                  isDefaultImage
                />
              }
              notificationBadge={
                <NotificationBadge
                  className={notificationClasses}
                  alert={childNoti.highlight > 0}
                  content={abbreviateNumber(childNoti.total) || null}
                  ignoreClass
                />
              }
            />
          );
        }
      })}
    </>
  );
}
