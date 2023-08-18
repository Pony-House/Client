import React, { useState, useEffect, } from 'react';

import initMatrix from '../../../client/initMatrix';
import cons from '../../../client/state/cons';
import navigation from '../../../client/state/navigation';

import Tabs from '../../atoms/tabs/Tabs';
import PopupWindow from '../../molecules/popup-window/PopupWindow';
import { ImagePackUser, ImagePackGlobal } from '../../molecules/image-pack/ImagePack';
import ProfileEditor from '../profile-editor/ProfileEditor';
import { resizeWindowChecker } from '../../../util/tools';
import { confirmDialog } from '../../molecules/confirm-dialog/ConfirmDialog';

import ProfileSection from './pages/Profile';
import AppearanceSection from './pages/Appearance';
import NotificationsSection from './pages/Notifications';
import SecuritySection from './pages/Security';
import PrivacySection from './pages/Privacy';
import DonateSection from './pages/Donate';
import AboutSection from './pages/About';
import ExperimentalSection from './pages/Experimental';
import VoiceVideoSection from './pages/VoiceVideo';

function EmojiSection() {
  return (
    <>
      <ImagePackUser />
      <ImagePackGlobal />
    </>
  );
};

export const tabText = {
  APPEARANCE: 'Appearance',
  VOICEVIDEO: 'Voice & Video',
  PRIVACY: 'Privacy',
  NOTIFICATIONS: 'Notifications',
  EMOJI: 'Emoji',
  SECURITY: 'Security',
  ABOUT: 'About',
  DONATE: 'Donate',
  PROFILE: 'Profile',
  LOGOUT: 'Logout',
  EXPERIMENTAL: 'Experimental',
};

const tabItems = [

  {
    text: tabText.PROFILE,
    faSrc: "fa-solid fa-id-card",
    disabled: false,
    render: () => <ProfileSection />,
  },

  {
    text: tabText.APPEARANCE,
    faSrc: "fa-solid fa-sun",
    disabled: false,
    render: () => <AppearanceSection />,
  },

  {
    text: tabText.VOICEVIDEO,
    faSrc: "bi bi-optical-audio-fill",
    disabled: false,
    render: () => <VoiceVideoSection />,
  },

  {
    text: tabText.EMOJI,
    faSrc: "fa-solid fa-face-smile",
    disabled: false,
    render: () => <EmojiSection />,
  },

  { type: 'divider', },

  {
    text: tabText.NOTIFICATIONS,
    faSrc: "fa-solid fa-bell",
    disabled: false,
    render: () => <NotificationsSection />,
  },

  {
    text: tabText.SECURITY,
    faSrc: "fa-solid fa-lock",
    disabled: false,
    render: () => <SecuritySection />,
  },

  {
    text: tabText.PRIVACY,
    faSrc: "bi bi-eye-fill",
    disabled: false,
    render: () => <PrivacySection />,
  },

  { type: 'divider', },

  {
    text: tabText.DONATE,
    faSrc: "fa-solid fa-coins",
    disabled: false,
    render: () => <DonateSection />,
  },

  {
    text: tabText.ABOUT,
    faSrc: "fa-solid fa-circle-info",
    disabled: false,
    render: () => <AboutSection />,
  },

  { type: 'divider', },

  {
    text: tabText.EXPERIMENTAL,
    faSrc: "fa-solid fa-flask",
    disabled: false,
    render: () => <ExperimentalSection />,
  },

  { type: 'divider', },

  {
    text: tabText.LOGOUT,
    faSrc: "fa-solid fa-power-off",
    className: 'btn-text-danger',
    disabled: false,
    onClick: async () => {
      if (await confirmDialog('Logout', 'Are you sure that you want to logout your session?', 'Logout', 'danger')) {
        initMatrix.logout();
      }
    }
  }

];

function useWindowToggle(setSelectedTab) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const openSettings = (tab) => {
      const tabItem = tabItems.find((item) => item.text === tab);
      if (tabItem) setSelectedTab(tabItem);
      setIsOpen(true);
    };
    navigation.on(cons.events.navigation.SETTINGS_OPENED, openSettings);
    return () => {
      navigation.removeListener(cons.events.navigation.SETTINGS_OPENED, openSettings);
    };
  }, []);

  const requestClose = () => setIsOpen(false);

  return [isOpen, requestClose];
}

function Settings() {
  const [selectedTab, setSelectedTab] = useState(tabItems[0]);
  const [isOpen, requestClose] = useWindowToggle(setSelectedTab);

  const handleTabChange = (tabItem) => setSelectedTab(tabItem);
  resizeWindowChecker();

  if (isOpen) {
    $('body').addClass('settings-modal-open');
  } else {
    $('body').removeClass('settings-modal-open');
  }

  if (window.matchMedia('screen and (max-width: 768px)').matches) {
    $('body').addClass('settings-modal-open-2');
  } else {
    $('body').removeClass('settings-modal-open-2');
  }

  return (
    <PopupWindow
      id='settings-base'
      classBody='py-0 my-0'
      title={window.matchMedia('screen and (max-width: 768px)').matches ? 'Settings' : null}
      isOpen={isOpen}
      size={window.matchMedia('screen and (max-width: 768px)').matches ? 'modal-xl' : 'modal-fullscreen'}
      onRequestClose={requestClose}
    >
      {isOpen && (

        (!window.matchMedia('screen and (max-width: 768px)').matches ?

          <div className="my-0 py-0">

            <div id='setting-tab' className='py-3 h-100 border-bg'>
              <Tabs
                requestClose={requestClose}
                items={tabItems}
                defaultSelected={tabItems.findIndex((tab) => tab.text === selectedTab.text)}
                onSelect={handleTabChange}
                isFullscreen
              />
            </div>

            <div id="settings-content" className='py-3'>
              {selectedTab.render()}
            </div>

          </div>

          :

          <div className="w-100 py-3">

            <ProfileEditor userId={initMatrix.matrixClient.getUserId()} />
            <Tabs
              id='setting-tab-2'
              items={tabItems}
              defaultSelected={tabItems.findIndex((tab) => tab.text === selectedTab.text)}
              onSelect={handleTabChange}
            />

            <div id="settings-content-2" className="p-3 border-top border-bg">
              {selectedTab.render()}
            </div>

          </div>

        )

      )}
    </PopupWindow>
  );
}

export default Settings;