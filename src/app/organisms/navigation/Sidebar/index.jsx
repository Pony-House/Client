import React, { useState, useEffect } from 'react';

import initMatrix from '../../../../client/initMatrix';
import cons from '../../../../client/state/cons';

import {
  selectTab, openShortcutSpaces, openInviteList,
  openSearch, openSettings,
} from '../../../../client/action/navigation';

import { abbreviateNumber } from '../../../../util/common';
import { isCrossVerified } from '../../../../util/matrixUtil';

import Avatar from '../../../atoms/avatar/Avatar';
import NotificationBadge from '../../../atoms/badge/NotificationBadge';
import ScrollView from '../../../atoms/scroll/ScrollView';
import SidebarAvatar from '../../../molecules/sidebar-avatar/SidebarAvatar';

import { useSelectedTab } from '../../../hooks/useSelectedTab';
import { useDeviceList } from '../../../hooks/useDeviceList';

import { tabText as settingTabText } from '../../settings/Settings';

import SpaceShortcut from './SpaceShortcut';
import { notificationClasses, useNotificationUpdate } from './Notification';

// Cross Sigin Alert
function CrossSigninAlert() {
  const deviceList = useDeviceList();
  const unverified = deviceList?.filter((device) => isCrossVerified(device.device_id) === false);

  if (!unverified?.length) return null;

  return (
    <SidebarAvatar
      className="sidebar__cross-signin-alert"
      tooltip={`${unverified.length} unverified sessions`}
      onClick={() => openSettings(settingTabText.SECURITY)}
      avatar={<Avatar faSrc="bi bi-shield-lock-fill btn-text-danger" size="normal" />}
    />
  );
};

// Featured Tab
function FeaturedTab() {

  // Data
  const { roomList, accountData, notifications } = initMatrix;
  const [selectedTab] = useSelectedTab();
  useNotificationUpdate();

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
  function getDMsNoti() {
    if (roomList.directs.size === 0) return null;
    let noti = null;

    [...roomList.directs].forEach((roomId) => {
      if (!notifications.hasNoti(roomId)) return;
      if (noti === null) noti = { total: 0, highlight: 0 };
      const childNoti = notifications.getNoti(roomId);
      noti.total += childNoti.total;
      noti.highlight += childNoti.highlight;
    });

    return noti;
  }

  // Get Data
  const dmsNoti = getDMsNoti();
  const homeNoti = getHomeNoti();

  // Complete
  return (
    <>

      <SidebarAvatar
        tooltip="Direct Messages"
        active={selectedTab === cons.tabs.DIRECTS}
        onClick={() => selectTab(cons.tabs.DIRECTS)}
        avatar={<Avatar faSrc="fa-solid fa-user" size="normal" />}
        notificationBadge={dmsNoti ? (
          <NotificationBadge
            className={notificationClasses}
            alert={dmsNoti?.highlight > 0}
            content={abbreviateNumber(dmsNoti.total) || null}
          />
        ) : null}
      />

      <SidebarAvatar
        tooltip="Home"
        active={selectedTab === cons.tabs.HOME}
        onClick={() => selectTab(cons.tabs.HOME)}
        avatar={<Avatar faSrc="fa-solid fa-house" size="normal" />}
        notificationBadge={homeNoti ? (
          <NotificationBadge
            className={notificationClasses}
            alert={homeNoti?.highlight > 0}
            content={abbreviateNumber(homeNoti.total) || null}
          />
        ) : null}
      />

    </>
  );
};

// Total Invites
function useTotalInvites() {

  // Rooms
  const { roomList } = initMatrix;
  const totalInviteCount = () => roomList.inviteRooms.size
    + roomList.inviteSpaces.size
    + roomList.inviteDirects.size;
  const [totalInvites, updateTotalInvites] = useState(totalInviteCount());

  // Effect
  useEffect(() => {

    // Change
    const onInviteListChange = () => {
      updateTotalInvites(totalInviteCount());
    };

    // Events
    roomList.on(cons.events.roomList.INVITELIST_UPDATED, onInviteListChange);
    return () => {
      roomList.removeListener(cons.events.roomList.INVITELIST_UPDATED, onInviteListChange);
    };

  }, []);

  // Complete
  return [totalInvites];

};

// Sidebar
function SideBar() {

  const [totalInvites] = useTotalInvites();

  return (
    <>
      <center className='sidebar-item-1 h-100'>
        <ScrollView invisible>
          <div className="scrollable-content">

            <div id='space-feature' className="featured-container">

              <FeaturedTab />

              {totalInvites !== 0 && (
                <SidebarAvatar
                  tooltip="Invites"
                  onClick={() => openInviteList()}
                  avatar={<Avatar faSrc="bi bi-envelope-plus-fill" size="normal" />}
                  notificationBadge={<NotificationBadge className={notificationClasses} alert content={totalInvites} />}
                />
              )}

              <CrossSigninAlert />

            </div>

            <div className="sidebar-divider" />

            <div id='space-container' className="space-container">
              <SpaceShortcut />
              <SidebarAvatar
                tooltip="Pin spaces"
                onClick={() => openShortcutSpaces()}
                avatar={<Avatar faSrc="bi bi-bookmark-plus-fill" size="normal" />}
              />
            </div>

          </div>
        </ScrollView>
      </center>

      <center className='sidebar-item-2'>
        <div className="sidebar-divider" />
        <div id='space-container-2' className="sticky-container">

          <SidebarAvatar
            tooltip="Search"
            onClick={() => openSearch()}
            avatar={<Avatar faSrc="fa-solid fa-magnifying-glass" size="normal" />}
          />

        </div>
      </center>

    </>
  );
};

export default SideBar;
