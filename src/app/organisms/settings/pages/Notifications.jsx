import React, { useState } from 'react';

import settings from '../../../../client/state/settings';
import { usePermission } from '../../../hooks/usePermission';
import Button from '../../../atoms/button/Button';
import Toggle from '../../../atoms/button/Toggle';
import SettingTile from '../../../molecules/setting-tile/SettingTile';
import GlobalNotification from '../../../molecules/global-notification/GlobalNotification';
import KeywordNotification from '../../../molecules/global-notification/KeywordNotification';
import IgnoreUserList from '../../../molecules/global-notification/IgnoreUserList';

import {
    toggleNotifications, toggleNotificationSounds,
} from '../../../../client/action/settings';

function NotificationsSection() {
    const [permission, setPermission] = usePermission('notifications', window.Notification?.permission);

    const [, updateState] = useState({});

    const renderOptions = () => {
        if (window.Notification === undefined) {
            return <div className="settings-notifications__not-supported">Not supported in this browser.</div>;
        }

        if (permission === 'granted') {
            return (
                <Toggle
                    className='d-inline-flex'
                    isActive={settings._showNotifications}
                    onToggle={() => {
                        toggleNotifications();
                        setPermission(window.Notification?.permission);
                        updateState({});
                    }}
                />
            );
        }

        return (
            <Button
                variant="primary"
                onClick={() => window.Notification.requestPermission().then(setPermission)}
            >
                Request permission
            </Button>
        );
    };

    return (
        <>
            <div className="card noselect">
                <ul className="list-group list-group-flush">
                    <li className="list-group-item very-small text-gray">Notification & Sound</li>
                    <SettingTile
                        title="Desktop notification"
                        options={renderOptions()}
                        content={<div className="very-small text-gray">Show desktop notification when new messages arrive.</div>}
                    />
                    <SettingTile
                        title="Notification Sound"
                        options={(
                            <Toggle
                                className='d-inline-flex'
                                isActive={settings.isNotificationSounds}
                                onToggle={() => { toggleNotificationSounds(); updateState({}); }}
                            />
                        )}
                        content={<div className="very-small text-gray">Play sound when new messages arrive.</div>}
                    />
                </ul>
            </div>
            <GlobalNotification />
            <KeywordNotification />
            <IgnoreUserList />
        </>
    );
}

export default NotificationsSection;