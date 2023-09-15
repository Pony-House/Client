import React, { useState, useEffect } from 'react';

import initMatrix from '../../../../client/initMatrix';
import cons from '../../../../client/state/cons';

import {
    selectTab, openSettings
} from '../../../../client/action/navigation';
import { tabText as settingTabText } from "../../settings/Settings";

import { abbreviateNumber } from '../../../../util/common';
import { useSelectedTab } from '../../../hooks/useSelectedTab';

import Avatar from '../../../atoms/avatar/Avatar';
import { notificationClasses, useNotificationUpdate } from './Notification';
import SidebarAvatar from '../../../molecules/sidebar-avatar/SidebarAvatar';
import NotificationBadge from '../../../atoms/badge/NotificationBadge';
import { getUserWeb3Account } from '../../../../util/web3';
import navigation from '../../../../client/state/navigation';

// Featured Tab
export default function FeaturedTab() {

    // Data
    const [userWeb3, setUserWeb3] = useState(getUserWeb3Account());
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

    // Ethereum
    useEffect(() => {
        const ethereumGetUpdate = (ethereumData) => setUserWeb3(ethereumData);
        navigation.on(cons.events.navigation.ETHEREUM_UPDATED, ethereumGetUpdate);
        return () => {
            navigation.removeListener(cons.events.navigation.ETHEREUM_UPDATED, ethereumGetUpdate);
        };
    });

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

            {userWeb3.address ? <SidebarAvatar
                tooltip={`Ethereum${!userWeb3.valid ? ' (INVALID ACCOUNT)' : ''}`}
                className={`ethereum-sidebar-icon ${userWeb3.valid ? 'ethereum-valid' : 'ethereum-invalid'}`}
                active={null}
                onClick={() => openSettings(settingTabText.WEB3)}
                avatar={<Avatar faSrc="fa-brands fa-ethereum" size="normal" />}
                notificationBadge={null}
            /> : null}

        </>
    );
};

// Total Invites
export function useTotalInvites() {

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
