import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './SideBar.scss';

import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import initMatrix from '../../../client/initMatrix';
import cons from '../../../client/state/cons';
import { colorMXID } from '../../../util/colorMXID';
import {
  selectTab, openShortcutSpaces, openInviteList,
  openSearch, openSettings, openReusableContextMenu,
} from '../../../client/action/navigation';
import { moveSpaceShortcut } from '../../../client/action/accountData';
import { abbreviateNumber, getEventCords } from '../../../util/common';
import { isCrossVerified } from '../../../util/matrixUtil';

import Avatar from '../../atoms/avatar/Avatar';
import NotificationBadge from '../../atoms/badge/NotificationBadge';
import ScrollView from '../../atoms/scroll/ScrollView';
import SidebarAvatar from '../../molecules/sidebar-avatar/SidebarAvatar';
import SpaceOptions from '../../molecules/space-options/SpaceOptions';

import { useSelectedTab } from '../../hooks/useSelectedTab';
import { useDeviceList } from '../../hooks/useDeviceList';

import { tabText as settingTabText } from '../settings/Settings';

const notificationClasses = 'position-absolute top-0 start-100 translate-middle badge rounded-pill sidebar-mode';

function useNotificationUpdate() {
  const { notifications } = initMatrix;
  const [, forceUpdate] = useState({});
  useEffect(() => {
    function onNotificationChanged(roomId, total, prevTotal) {
      if (total === prevTotal) return;
      forceUpdate({});
    }
    notifications.on(cons.events.notifications.NOTI_CHANGED, onNotificationChanged);
    return () => {
      notifications.removeListener(cons.events.notifications.NOTI_CHANGED, onNotificationChanged);
    };
  }, []);
}

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
}

function FeaturedTab() {
  const { roomList, accountData, notifications } = initMatrix;
  const [selectedTab] = useSelectedTab();
  useNotificationUpdate();

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

  const dmsNoti = getDMsNoti();
  const homeNoti = getHomeNoti();

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
}

function DraggableSpaceShortcut({
  isActive, spaceId, index, moveShortcut, onDrop,
}) {
  const mx = initMatrix.matrixClient;
  const { notifications } = initMatrix;
  const room = mx.getRoom(spaceId);
  const shortcutRef = useRef(null);
  const avatarRef = useRef(null);

  const openSpaceOptions = (e, sId) => {
    e.preventDefault();
    openReusableContextMenu(
      'right',
      getEventCords(e, '.sidebar-avatar'),
      (closeMenu) => <SpaceOptions roomId={sId} afterOptionSelect={closeMenu} />,
    );
  };

  const [, drop] = useDrop({
    accept: 'SPACE_SHORTCUT',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    drop(item) {
      onDrop(item.index, item.spaceId);
    },
    hover(item, monitor) {
      if (!shortcutRef.current) return;

      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = shortcutRef.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      moveShortcut(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });
  const [{ isDragging }, drag] = useDrag({
    type: 'SPACE_SHORTCUT',
    item: () => ({ spaceId, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(avatarRef);
  drop(shortcutRef);

  if (shortcutRef.current) {
    if (isDragging) shortcutRef.current.style.opacity = 0;
    else shortcutRef.current.style.opacity = 1;
  }

  return (
    <SidebarAvatar
      ref={shortcutRef}
      active={isActive}
      tooltip={room.name}
      onClick={() => selectTab(spaceId)}
      onContextMenu={(e) => openSpaceOptions(e, spaceId)}
      avatar={(
        <Avatar
          ref={avatarRef}
          text={room.name}
          bgColor={colorMXID(room.roomId)}
          size="normal"
          imageSrc={room.getAvatarUrl(initMatrix.matrixClient.baseUrl, 42, 42, 'crop') || null}
        />
      )}
      notificationBadge={notifications.hasNoti(spaceId) ? (
        <NotificationBadge
          className={notificationClasses}
          alert={notifications.getHighlightNoti(spaceId) > 0}
          content={abbreviateNumber(notifications.getTotalNoti(spaceId)) || null}
        />
      ) : null}
    />
  );
}

DraggableSpaceShortcut.propTypes = {
  spaceId: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired,
  index: PropTypes.number.isRequired,
  moveShortcut: PropTypes.func.isRequired,
  onDrop: PropTypes.func.isRequired,
};

function SpaceShortcut() {
  const { accountData } = initMatrix;
  const [selectedTab] = useSelectedTab();
  useNotificationUpdate();
  const [spaceShortcut, setSpaceShortcut] = useState([...accountData.spaceShortcut]);

  useEffect(() => {
    const handleShortcut = () => setSpaceShortcut([...accountData.spaceShortcut]);
    accountData.on(cons.events.accountData.SPACE_SHORTCUT_UPDATED, handleShortcut);
    return () => {
      accountData.removeListener(cons.events.accountData.SPACE_SHORTCUT_UPDATED, handleShortcut);
    };
  }, []);

  const moveShortcut = (dragIndex, hoverIndex) => {
    const dragSpaceId = spaceShortcut[dragIndex];
    const newShortcuts = [...spaceShortcut];
    newShortcuts.splice(dragIndex, 1);
    newShortcuts.splice(hoverIndex, 0, dragSpaceId);
    setSpaceShortcut(newShortcuts);
  };

  const handleDrop = (dragIndex, dragSpaceId) => {
    if ([...accountData.spaceShortcut][dragIndex] === dragSpaceId) return;
    moveSpaceShortcut(dragSpaceId, dragIndex);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      {
        spaceShortcut.map((shortcut, index) => (
          <DraggableSpaceShortcut
            key={shortcut}
            index={index}
            spaceId={shortcut}
            isActive={selectedTab === shortcut}
            moveShortcut={moveShortcut}
            onDrop={handleDrop}
          />
        ))
      }
    </DndProvider>
  );
}

function useTotalInvites() {
  const { roomList } = initMatrix;
  const totalInviteCount = () => roomList.inviteRooms.size
    + roomList.inviteSpaces.size
    + roomList.inviteDirects.size;
  const [totalInvites, updateTotalInvites] = useState(totalInviteCount());

  useEffect(() => {
    const onInviteListChange = () => {
      updateTotalInvites(totalInviteCount());
    };
    roomList.on(cons.events.roomList.INVITELIST_UPDATED, onInviteListChange);
    return () => {
      roomList.removeListener(cons.events.roomList.INVITELIST_UPDATED, onInviteListChange);
    };
  }, []);

  return [totalInvites];
}

function SideBar() {
  const [totalInvites] = useTotalInvites();

  return (
    <>
      <center className='sidebar-item-1 h-100'>
        <ScrollView invisible>
          <div className="scrollable-content">
            <div className="featured-container">
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
            <div className="space-container">
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
        <div className="sticky-container">
          <SidebarAvatar
            tooltip="Search"
            onClick={() => openSearch()}
            avatar={<Avatar faSrc="fa-solid fa-magnifying-glass" size="normal" />}
          />
        </div>
      </center>
    </>
  );
}

export default SideBar;
