import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import { twemojifyReact } from '../../../util/twemojify';

import initMatrix from '../../../client/initMatrix';
import cons from '../../../client/state/cons';
import { selectTab, selectSpace } from '../../../client/action/navigation';
import navigation from '../../../client/state/navigation';
import { abbreviateNumber } from '../../../util/common';

import NotificationBadge from '../../atoms/badge/NotificationBadge';

function DrawerBreadcrumb({ spaceId = null }) {
  const [, forceUpdate] = useState({});
  const scrollRef = useRef(null);
  const { roomList, notifications, accountData } = initMatrix;
  const mx = initMatrix.matrixClient;
  const spacePath = navigation.selectedSpacePath;

  function onNotiChanged(roomId, total, prevTotal) {
    if (total === prevTotal) return;
    if (navigation.selectedSpacePath.includes(roomId)) {
      forceUpdate({});
    }
    if (navigation.selectedSpacePath[0] === cons.tabs.HOME) {
      if (!roomList.isOrphan(roomId)) return;
      if (roomList.directs.has(roomId)) return;
      forceUpdate({});
    }
  }

  useEffect(() => {
    requestAnimationFrame(() => {
      if (scrollRef?.current === null) return;
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    });
    notifications.on(cons.events.notifications.NOTI_CHANGED, onNotiChanged);
    return () => {
      notifications.removeListener(cons.events.notifications.NOTI_CHANGED, onNotiChanged);
    };
  }, [spaceId]);

  function getHomeNotiExcept(childId) {
    const orphans = roomList
      .getOrphans()
      .filter((id) => id !== childId)
      .filter((id) => !accountData.spaceShortcut.has(id));

    let noti = null;

    orphans.forEach((roomId) => {
      if (!notifications.hasNoti(roomId)) return;
      if (noti === null) noti = { total: 0, highlight: 0 };
      const childNoti = notifications.getNoti(roomId);
      noti.total += childNoti.total;
      noti.highlight += childNoti.highlight;
    });

    return noti;
  }

  function getNotiExcept(roomId, childId) {
    if (!notifications.hasNoti(roomId)) return null;

    const noti = notifications.getNoti(roomId);
    if (!notifications.hasNoti(childId)) return noti;
    if (noti.from === null) return noti;

    const childNoti = notifications.getNoti(childId);

    let noOther = true;
    let total = 0;
    let highlight = 0;
    noti.from.forEach((fromId) => {
      if (childNoti.from.has(fromId)) return;
      noOther = false;
      const fromNoti = notifications.getNoti(fromId);
      total += fromNoti.total;
      highlight += fromNoti.highlight;
    });

    if (noOther) return null;
    return { total, highlight };
  }

  return (
    <div className="">
      <nav className="p-3">
        <ol className="breadcrumb">
          {spacePath.map((id, index) => {
            const noti =
              id !== cons.tabs.HOME && index < spacePath.length
                ? getNotiExcept(id, index === spacePath.length - 1 ? null : spacePath[index + 1])
                : getHomeNotiExcept(index === spacePath.length - 1 ? null : spacePath[index + 1]);

            const room = mx.getRoom(id);

            return (
              room && (
                <React.Fragment key={id}>
                  <li
                    className={`emoji-size-fix breadcrumb-item ${index === spacePath.length - 1 ? 'active' : ''}`}
                  >
                    <a
                      href="#"
                      onClick={(event) => {
                        if (id === cons.tabs.HOME) selectTab(id);
                        else selectSpace(id);
                        event.preventDefault();
                      }}
                    >
                      {id === cons.tabs.HOME ? 'Home' : twemojifyReact(room.name)}
                      {noti !== null && (
                        <NotificationBadge
                          className="ms-1"
                          alert={noti.highlight !== 0}
                          content={noti.total > 0 ? abbreviateNumber(noti.total) : null}
                        />
                      )}
                    </a>
                  </li>
                </React.Fragment>
              )
            );
          })}
        </ol>
      </nav>

      <hr className="m-0 border-bg" />
    </div>
  );
}

DrawerBreadcrumb.propTypes = {
  spaceId: PropTypes.string,
};

export default DrawerBreadcrumb;
