import React from 'react';

import { openShortcutSpaces, openSearch, openSettings } from '../../../../client/action/navigation';

import { isCrossVerified } from '../../../../util/matrixUtil';

import Avatar from '../../../atoms/avatar/Avatar';
import ScrollView from '../../../atoms/scroll/ScrollView';
import SidebarAvatar from '../../../molecules/sidebar-avatar/SidebarAvatar';

import { useDeviceList } from '../../../hooks/useDeviceList';
import { tabText as settingTabText } from '../../settings/Settings';
import SpaceShortcut from './SpaceShortcut';
import FeaturedTab from './FeaturedTab';
import InviteSidebar from './InviteSidebar';

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
      avatar={
        <Avatar
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
  return (
    <>
      <center className="sidebar-item-1 h-100">
        <ScrollView invisible>
          <div className="scrollable-content">
            <div id="space-feature" className="featured-container">
              <FeaturedTab />
              <InviteSidebar />
              <CrossSigninAlert />
            </div>

            <div className="sidebar-divider" />

            <div id="space-container" className="space-container">
              <SpaceShortcut />
              <SidebarAvatar
                tooltip="Pin spaces"
                onClick={() => openShortcutSpaces()}
                avatar={
                  <Avatar
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
