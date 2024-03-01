import React, { useState } from 'react';
import mobileEvents, {
  isMobile,
  noNotification,
  notificationStatus,
  requestNotification,
} from '@src/util/libs/mobile';

import settings from '../../../../client/state/settings';
import { usePermission } from '../../../hooks/usePermission';
import Button from '../../../atoms/button/Button';
import Toggle from '../../../atoms/button/Toggle';
import SettingTile from '../../../molecules/setting-tile/SettingTile';
import GlobalNotification from '../../../molecules/global-notification/GlobalNotification';
import KeywordNotification from '../../../molecules/global-notification/KeywordNotification';
import IgnoreUserList from '../../../molecules/global-notification/IgnoreUserList';

import { toggleNotifications, toggleNotificationSounds } from '../../../../client/action/settings';

function NotificationsSection() {
  const [permission, setPermission] = usePermission('notifications', notificationStatus());

  const [, updateState] = useState({});

  const renderOptions = () => {
    if (noNotification()) {
      return (
        <div className="settings-notifications__not-supported">Not supported in this browser.</div>
      );
    }

    if (permission === 'granted') {
      return (
        <Toggle
          className="d-inline-flex"
          isActive={settings._showNotifications}
          onToggle={() => {
            toggleNotifications();
            setTimeout(() => {
              setPermission(mobileEvents.getNotificationPerm());
              updateState({});
            }, 200);
          }}
        />
      );
    }

    return (
      <Button variant="primary" onClick={() => requestNotification().then(setPermission)}>
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
            title={`${isMobile() ? 'Mobile' : __ENV_APP__.ELECTRON_MODE ? 'Desktop' : 'Web'} notification`}
            options={renderOptions()}
            content={
              <div className="very-small text-gray">
                Show notification when new messages arrive.
              </div>
            }
          />
          <SettingTile
            title="Notification Sound"
            options={
              <Toggle
                className="d-inline-flex"
                isActive={settings.isNotificationSounds}
                onToggle={() => {
                  toggleNotificationSounds();
                  updateState({});
                }}
              />
            }
            content={
              <div className="very-small text-gray">Play sound when new messages arrive.</div>
            }
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
