import React, { useEffect, useState } from 'react';
import settings from '@src/client/state/settings';
import initMatrix from '@src/client/initMatrix';

import { openShortcutSpaces, openSearch, openSettings } from '../../../../client/action/navigation';

import { eventMaxListeners, isCrossVerified } from '../../../../util/matrixUtil';

import Avatar from '../../../atoms/avatar/Avatar';
import ScrollView from '../../../atoms/scroll/ScrollView';
import SidebarAvatar from '../../../molecules/sidebar-avatar/SidebarAvatar';

import { useDeviceList } from '../../../hooks/useDeviceList';
import { tabText as settingTabText } from '../../settings/Settings';
import SpaceShortcut from './SpaceShortcut';
import FeaturedTab from './FeaturedTab';
import InviteSidebar from './InviteSidebar';

// Cross Sigin Alert
function CrossSigninAlert({ isIconsColored }) {
  const { deviceList } = useDeviceList();
  const [unverified, setUnverified] = useState([]);
  const [devicesChecked, setDevicesChecked] = useState(false);

  useEffect(() => {
    const mx = initMatrix.matrixClient;
    if (!devicesChecked && deviceList) {
      setDevicesChecked(true);
      const checkDevices = async () => {
        const tinyUnverified = [];

        for (const item in deviceList) {
          const device = deviceList[item];
          try {
            const isVerified = await isCrossVerified(device.device_id);
            if (isVerified === false) {
              tinyUnverified.push(device);
            }
          } catch {}
        }

        setUnverified(tinyUnverified);
      };

      checkDevices();
    }

    try {
      const updateList = () => setDevicesChecked(false);
      const crypto = mx.getCrypto();
      crypto.setMaxListeners(eventMaxListeners);
      crypto.on('deviceVerificationChanged', updateList);
      crypto.on('userCrossSigningUpdated', updateList);
      crypto.on('userTrustStatusChanged', updateList);
      crypto.on('crypto.devicesUpdated', updateList);
      crypto.on('crypto.roomKeyRequestCancellation', updateList);
      crypto.on('crypto.roomKeyRequest', updateList);
      crypto.on('crypto.verificationRequestReceived', updateList);
      crypto.on('crypto.willUpdateDevices', updateList);
      crypto.on('crypto.warning', updateList);
      return () => {
        crypto.off('deviceVerificationChanged', updateList);
        crypto.off('userCrossSigningUpdated', updateList);
        crypto.off('userTrustStatusChanged', updateList);
        crypto.off('crypto.devicesUpdated', updateList);
        crypto.off('crypto.roomKeyRequestCancellation', updateList);
        crypto.off('crypto.roomKeyRequest', updateList);
        crypto.off('crypto.verificationRequestReceived', updateList);
        crypto.off('crypto.willUpdateDevices', updateList);
        crypto.off('crypto.warning', updateList);
      };
    } catch (err) {
      console.error(err);
    }
  });

  if (!unverified?.length) return null;

  return (
    <SidebarAvatar
      className="sidebar__cross-signin-alert"
      tooltip={`${unverified.length} unverified sessions`}
      onClick={() => openSettings(settingTabText.SECURITY)}
      avatar={
        <Avatar
          neonColor
          iconColor={!isIconsColored ? null : 'var(--bs-danger)'}
          faSrc="bi bi-shield-lock-fill btn-text-danger"
          className="profile-image-container"
          size="normal"
        />
      }
    />
  );
}

// Sidebar
function SideBar() {
  const [isIconsColored, setIsIconsColored] = useState(settings.isSelectedThemeColored());
  settings.isThemeColoredDetector(useEffect, setIsIconsColored);

  return (
    <>
      <center className="sidebar-item-1 h-100">
        <ScrollView invisible>
          <div className="scrollable-content">
            <div id="space-feature" className="featured-container">
              <FeaturedTab />
              <InviteSidebar />
              <CrossSigninAlert isIconsColored={isIconsColored} />
            </div>

            <div className="sidebar-divider" />

            <div id="space-container" className="space-container">
              <SpaceShortcut />
              <SidebarAvatar
                tooltip="Pin spaces"
                onClick={() => openShortcutSpaces()}
                avatar={
                  <Avatar
                    neonColor
                    iconColor={!isIconsColored ? null : 'rgb(84, 101, 232)'}
                    faSrc="bi bi-bookmark-plus-fill"
                    className="profile-image-container"
                    size="normal"
                  />
                }
              />
            </div>
          </div>
        </ScrollView>
      </center>

      <center className="sidebar-item-2">
        <div className="sidebar-divider" />
        <div id="space-container-2" className="sticky-container">
          <SidebarAvatar
            tooltip="Search"
            onClick={() => openSearch()}
            avatar={
              <Avatar
                neonColor
                iconColor={!isIconsColored ? null : 'rgb(164, 42, 212)'}
                faSrc="fa-solid fa-magnifying-glass"
                className="profile-image-container"
                size="normal"
              />
            }
          />
        </div>
      </center>
    </>
  );
}

export default SideBar;
