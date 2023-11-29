import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import initMatrix from '../../../../client/initMatrix';
import { colorMXID } from '../../../../util/colorMXID';
import { moveSpaceShortcut } from '../../../../client/action/accountData';
import SpaceOptions from '../../../molecules/space-options/SpaceOptions';

import SidebarAvatar from '../../../molecules/sidebar-avatar/SidebarAvatar';
import Avatar from '../../../atoms/avatar/Avatar';
import NotificationBadge from '../../../atoms/badge/NotificationBadge';

import {
    selectTab, openReusableContextMenu,
} from '../../../../client/action/navigation';

import { useSelectedTab } from '../../../hooks/useSelectedTab';
import { abbreviateNumber, getEventCords } from '../../../../util/common';
import cons from '../../../../client/state/cons';

import { notificationClasses, useNotificationUpdate } from './Notification';
import { getAppearance, getAnimatedImageUrl } from '../../../../util/libs/appearance';

// Draggable Space Shortcut
function DraggableSpaceShortcut({
    isActive, spaceId, index, moveShortcut, onDrop,
}) {

    // Data
    const mx = initMatrix.matrixClient;
    const { notifications } = initMatrix;
    const room = mx.getRoom(spaceId);
    const shortcutRef = useRef(null);
    const avatarRef = useRef(null);
    const appearanceSettings = getAppearance();

    // Options
    const openSpaceOptions = (e, sId) => {
        e.preventDefault();
        openReusableContextMenu(
            'right',
            getEventCords(e, '.sidebar-avatar'),
            (closeMenu) => <SpaceOptions roomId={sId} afterOptionSelect={closeMenu} />,
        );
    };

    // Drop
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

    // Dragging
    const [{ isDragging }, drag] = useDrag({
        type: 'SPACE_SHORTCUT',
        item: () => ({ spaceId, index }),
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    // Final Drag Drop
    drag(avatarRef);
    drop(shortcutRef);

    // Style
    if (shortcutRef.current) {
        if (isDragging) shortcutRef.current.style.opacity = 0;
        else shortcutRef.current.style.opacity = 1;
    }

    // Complete
    return <SidebarAvatar
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
                animParentsCount={2}
                imageAnimSrc={!appearanceSettings.enableAnimParams ? room.getAvatarUrl(initMatrix.matrixClient.baseUrl) : getAnimatedImageUrl(room.getAvatarUrl(initMatrix.matrixClient.baseUrl, 42, 42, 'crop')) || null}
                imageSrc={room.getAvatarUrl(initMatrix.matrixClient.baseUrl, 42, 42, 'crop') || null}
                isDefaultImage
            />
        )}
        notificationBadge={notifications.hasNoti(spaceId) ? (
            <NotificationBadge
                className={notificationClasses}
                alert={notifications.getHighlightNoti(spaceId) > 0}
                content={abbreviateNumber(notifications.getTotalNoti(spaceId)) || null}
            />
        ) : null}
    />;

};

DraggableSpaceShortcut.propTypes = {
    spaceId: PropTypes.string.isRequired,
    isActive: PropTypes.bool.isRequired,
    index: PropTypes.number.isRequired,
    moveShortcut: PropTypes.func.isRequired,
    onDrop: PropTypes.func.isRequired,
};

// Space Shortcut
export default function SpaceShortcut() {

    // Data
    const { accountData } = initMatrix;
    const [selectedTab] = useSelectedTab();
    useNotificationUpdate();
    const [spaceShortcut, setSpaceShortcut] = useState([...accountData.spaceShortcut]);

    // Effect
    useEffect(() => {
        const handleShortcut = () => setSpaceShortcut([...accountData.spaceShortcut]);
        accountData.on(cons.events.accountData.SPACE_SHORTCUT_UPDATED, handleShortcut);
        return () => {
            accountData.removeListener(cons.events.accountData.SPACE_SHORTCUT_UPDATED, handleShortcut);
        };
    }, []);

    // Move Data
    const moveShortcut = (dragIndex, hoverIndex) => {
        const dragSpaceId = spaceShortcut[dragIndex];
        const newShortcuts = [...spaceShortcut];
        newShortcuts.splice(dragIndex, 1);
        newShortcuts.splice(hoverIndex, 0, dragSpaceId);
        setSpaceShortcut(newShortcuts);
    };

    // Drop Move Data
    const handleDrop = (dragIndex, dragSpaceId) => {
        if ([...accountData.spaceShortcut][dragIndex] === dragSpaceId) return;
        moveSpaceShortcut(dragSpaceId, dragIndex);
    };

    // Complete
    return <DndProvider backend={HTML5Backend}>{
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
    }</DndProvider>;

};
