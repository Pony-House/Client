import React, { useState, useEffect, useRef } from 'react';

import initMatrix from '../../../client/initMatrix';
import cons from '../../../client/state/cons';
import settings from '../../../client/state/settings';
import navigation from '../../../client/state/navigation';
import { getEventCords } from '../../../util/common';
import {
  toggleSystemTheme, toggleMarkdown, toggleMembershipEvents, toggleNickAvatarEvents,
  toggleNotifications, toggleNotificationSounds,
} from '../../../client/action/settings';
import { emitUpdateProfile, openEmojiBoard } from '../../../client/action/navigation';
import { usePermission } from '../../hooks/usePermission';
import { TWEMOJI_BASE_URL } from '../../../util/twemojify';

import Button from '../../atoms/button/Button';
import Toggle from '../../atoms/button/Toggle';
import Tabs from '../../atoms/tabs/Tabs';
import SegmentedControls from '../../atoms/segmented-controls/SegmentedControls';

import PopupWindow from '../../molecules/popup-window/PopupWindow';
import SettingTile from '../../molecules/setting-tile/SettingTile';
import ImportE2ERoomKeys from '../../molecules/import-export-e2e-room-keys/ImportE2ERoomKeys';
import ExportE2ERoomKeys from '../../molecules/import-export-e2e-room-keys/ExportE2ERoomKeys';
import { ImagePackUser, ImagePackGlobal } from '../../molecules/image-pack/ImagePack';
import GlobalNotification from '../../molecules/global-notification/GlobalNotification';
import KeywordNotification from '../../molecules/global-notification/KeywordNotification';
import IgnoreUserList from '../../molecules/global-notification/IgnoreUserList';

import ProfileEditor from '../profile-editor/ProfileEditor';
import CrossSigning from './CrossSigning';
import KeyBackup from './KeyBackup';
import DeviceManage from './DeviceManage';

import { MenuItem } from '../../atoms/context-menu/ContextMenu';
import RadioButton from '../../atoms/button/RadioButton';
import ImageUpload from '../../molecules/image-upload/ImageUpload';

import { resizeWindowChecker } from '../../../util/tools';
import { getStatusCSS } from '../../../util/onlineStatus';

import { confirmDialog } from '../../molecules/confirm-dialog/ConfirmDialog';

const toggleAction = (dataFolder, valueName, setToggle) => data => {

  const content = initMatrix.matrixClient.getAccountData(dataFolder)?.getContent() ?? {};
  content[valueName] = data;

  initMatrix.matrixClient.setAccountData(dataFolder, content);
  setToggle((data === true));

};

function PrivacySection() {
  const [hideTypingWarn, sethideTypingWarn] = useState(false);

  useEffect(() => {

    const content = initMatrix.matrixClient.getAccountData('pony.house.privacy')?.getContent() ?? {};
    sethideTypingWarn((content.hideTypingWarn === true));

  }, []);

  return (
    <div>
      <div className="card noselect mt-3">
        <ul className="list-group list-group-flush">
          <li className="list-group-item very-small text-gray">Chat room</li>
          <SettingTile
            title={"Disable \"typing\" warning"}
            options={(
              <Toggle
                className='d-inline-flex'
                isActive={hideTypingWarn}
                onToggle={toggleAction('pony.house.privacy', 'hideTypingWarn', sethideTypingWarn)}
              />
            )}
            content={<div className="very-small text-gray">Users will no longer be able to see whether or not you are typing.</div>}
          />
        </ul>
      </div>
    </div>
  );
};

function AppearanceSection() {
  const [, updateState] = useState({});
  const [isAnimateAvatarsHidden, setAnimateAvatarsHidden] = useState(false);

  useEffect(() => {

    const content = initMatrix.matrixClient.getAccountData('pony.house.appearance')?.getContent() ?? {};
    setAnimateAvatarsHidden((content.isAnimateAvatarsHidden === true));

  }, []);

  return (
    <div>

      <div className="card noselect mb-3">
        <ul className="list-group list-group-flush">
          <li className="list-group-item very-small text-gray">Theme</li>
          <SettingTile
            title="Follow system theme"
            options={(
              <Toggle
                className='d-inline-flex'
                isActive={settings.useSystemTheme}
                onToggle={() => { toggleSystemTheme(); updateState({}); }}
              />
            )}
            content={<div className="very-small text-gray">Use light or dark mode based on the system settings.</div>}
          />
          <SettingTile
            title="Theme"
            content={(
              <div className='mt-2'>
                <SegmentedControls
                  selected={settings.useSystemTheme ? -1 : settings.getThemeIndex()}
                  segments={[
                    { text: 'Light' },
                    { text: 'Silver' },
                    { text: 'Dark' },
                    { text: 'Butter' },
                    { text: 'Black (Beta)' },
                  ]}
                  onSelect={(index) => {
                    if (settings.useSystemTheme) toggleSystemTheme();
                    settings.setTheme(index);
                    updateState({});
                  }}
                />
              </div>
            )}
          />
        </ul>
      </div>

      <div className="card noselect mt-3">
        <ul className="list-group list-group-flush">
          <li className="list-group-item very-small text-gray">Room messages</li>
          <SettingTile
            title="Markdown formatting"
            options={(
              <Toggle
                className='d-inline-flex'
                isActive={settings.isMarkdown}
                onToggle={() => { toggleMarkdown(); updateState({}); }}
              />
            )}
            content={<div className="very-small text-gray">Format messages with markdown syntax before sending.</div>}
          />
          <SettingTile
            title="Hide membership events"
            options={(
              <Toggle
                className='d-inline-flex'
                isActive={settings.hideMembershipEvents}
                onToggle={() => { toggleMembershipEvents(); updateState({}); }}
              />
            )}
            content={<div className="very-small text-gray">Hide membership change messages from room timeline. (Join, Leave, Invite, Kick and Ban)</div>}
          />
          <SettingTile
            title="Hide nick/avatar events"
            options={(
              <Toggle
                className='d-inline-flex'
                isActive={settings.hideNickAvatarEvents}
                onToggle={() => { toggleNickAvatarEvents(); updateState({}); }}
              />
            )}
            content={<div className="very-small text-gray">Hide nick and avatar change messages from room timeline.</div>}
          />
        </ul>
      </div>

      <div className="card noselect mt-3">
        <ul className="list-group list-group-flush">
          <li className="list-group-item very-small text-gray">{__ENV_APP__.info.name}</li>
          <SettingTile
            title="Disable animated hover avatars"
            options={(
              <Toggle
                className='d-inline-flex'
                isActive={isAnimateAvatarsHidden}
                onToggle={toggleAction('pony.house.appearance', 'isAnimateAvatarsHidden', setAnimateAvatarsHidden)}
              />
            )}
            content={<div className="very-small text-gray">Turn off animated avatars that are displayed when you mouse over it.</div>}
          />
        </ul>
      </div>

    </div>
  );
}

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

function EmojiSection() {
  return (
    <>
      <ImagePackUser />
      <ImagePackGlobal />
    </>
  );
}

function SecuritySection() {
  return (
    <div className="noselect">

      <div className="card noselect mb-3">
        <ul className="list-group list-group-flush">
          <li className="list-group-item very-small text-gray">Cross signing and backup</li>
          <CrossSigning />
          <KeyBackup />
        </ul>
      </div>

      <DeviceManage />

      <div className="card noselect mt-3">
        <ul className="list-group list-group-flush mt-3">

          <li className="list-group-item very-small text-gray">Export/Import encryption keys</li>

          <SettingTile
            title="Export E2E room keys"
            content={(
              <>
                <div className="very-small text-gray">Export end-to-end encryption room keys to decrypt old messages in other session. In order to encrypt keys you need to set a password, which will be used while importing.</div>
                <ExportE2ERoomKeys />
              </>
            )}
          />

          <SettingTile
            title="Import E2E room keys"
            content={(
              <>
                <div className="very-small text-gray">{'To decrypt older messages, Export E2EE room keys from Element (Settings > Security & Privacy > Encryption > Cryptography) and import them here. Imported keys are encrypted so you\'ll have to enter the password you set in order to decrypt it.'}</div>
                <ImportE2ERoomKeys />
              </>
            )}

          />
        </ul>
      </div>

    </div>
  );
}

function AboutSection() {
  return (
    <div className="noselect">

      <div className="card">

        <ul className="list-group list-group-flush">

          <li className="list-group-item very-small text-gray">Application</li>

          <li className="list-group-item border-0">

            <div className='row m-0 w-100'>

              <div className='col-md-1 ps-0'>
                <img width="60" height="60" src="./favicon.ico" alt="Cinny logo" />
              </div>

              <div className='col-md-11 pe-0'>

                <h4>
                  {__ENV_APP__.info.name}
                  <span className="very-small text-gray" style={{ margin: '0 var(--sp-extra-tight)' }}>{`v${cons.version}`}</span>
                </h4>

                <div>The open source house, your house, the house for all matrix ponies</div>

                <div className="mt-3">
                  <Button className='me-1' onClick={() => window.open('https://github.com/Pony-House/Client')}>Source code</Button>
                  <Button className='mx-1' onClick={() => window.open('https://puddy.club/')}>Support</Button>
                  <Button className='ms-1' onClick={() => initMatrix.clearCacheAndReload()} variant="danger">Clear cache & reload</Button>
                </div>

              </div>

            </div>

          </li>

        </ul>

      </div>

      <div className="card mt-3">

        <ul className="list-group list-group-flush">

          <li className="list-group-item very-small text-gray">Credits</li>

          <li className="list-group-item border-0">
            <div className='small'>The <a href="https://github.com/matrix-org/matrix-js-sdk" rel="noreferrer noopener" target="_blank">matrix-js-sdk</a> is © <a href="https://matrix.org/foundation" rel="noreferrer noopener" target="_blank">The Matrix.org Foundation C.I.C</a> used under the terms of <a href="http://www.apache.org/licenses/LICENSE-2.0" rel="noreferrer noopener" target="_blank">Apache 2.0</a>.</div>
          </li>

          <li className="list-group-item border-0">
            <div className='small'>The <a href="https://twemoji.twitter.com" target="_blank" rel="noreferrer noopener">Twemoji</a> emoji art is © <a href="https://twemoji.twitter.com" target="_blank" rel="noreferrer noopener">Twitter, Inc and other contributors</a> used under the terms of <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer noopener">CC-BY 4.0</a>.</div>
          </li>

          <li className="list-group-item border-0">
            <div className='small'>The <a href="https://material.io/design/sound/sound-resources.html" target="_blank" rel="noreferrer noopener">Material sound resources</a> are © <a href="https://google.com" target="_blank" rel="noreferrer noopener">Google</a> used under the terms of <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer noopener">CC-BY 4.0</a>.</div>
          </li>

          <li className="list-group-item border-0">
            <div className='small'>{`The ${__ENV_APP__.info.name} is a fork from the `}<a href="https://github.com/cinnyapp/cinny" target="_blank" rel="noreferrer noopener">Cinny</a>. All source code base credits go to this group.</div>
          </li>

        </ul>

      </div>

    </div>

  );
}

function DonateSection() {
  return (
    <div className="card noselect">
      <ul className="list-group list-group-flush">
        <li className="list-group-item very-small text-gray">Donation</li>

        <li className="list-group-item border-0">
          {/* eslint-disable-next-line react/jsx-one-expression-per-line */}
          <div className='small'>If you are enjoying the app, you are invited to make donations to help me keep all the infrastructure of the application and the domain working. All types of donation is welcome! Feel free to choose below.</div>
          <br />
        </li>

        <li className="list-group-item border-0">
          {/* eslint-disable-next-line react/jsx-one-expression-per-line */}
          <div className='small'><i className="fa-brands fa-patreon" /> <a href="https://patreon.com/jasmindreasond" target="_blank" rel="noreferrer noopener">Patreon</a></div>
        </li>

        <li className="list-group-item border-0">
          {/* eslint-disable-next-line react/jsx-one-expression-per-line */}
          <div className='small'><i className="fa-solid fa-mug-hot" /> <a href="https://ko-fi.com/jasmindreasond" target="_blank" rel="noreferrer noopener">Ko-Fi</a></div>
        </li>

        <li className="list-group-item border-0">
          {/* eslint-disable-next-line react/jsx-one-expression-per-line */}
          <div className='small'><i className="fa-brands fa-stripe-s" /> <a href="https://donate.stripe.com/bIYeYL3U08a3gsE7st" target="_blank" rel="noreferrer noopener">Stripe</a></div>
        </li>

        <li className="list-group-item border-0">
          {/* eslint-disable-next-line react/jsx-one-expression-per-line */}
          <div className='small'><i className="fa-brands fa-ethereum" /> <a href="https://ud.me/jasmindreasond.wallet" target="_blank" rel="noreferrer noopener">Crypto</a></div>
        </li>

      </ul>
    </div>
  );
}


function ProfileSection() {

  const userProfile = initMatrix.matrixClient.getAccountData('pony.house.profile')?.getContent() ?? {};

  const customStatusRef = useRef(null);
  const bioRef = useRef(null);
  const [customStatusIcon, setcustomStatusIcon] = useState('./img/default_avatar/1.jpg');
  const [customStatusValue, setcustomStatusValue] = useState(null);

  const [profileStatus, setProfileStatus] = useState(userProfile.status ? userProfile.status : 'online');
  const [banner, setBanner] = useState(userProfile.banner);
  const [customStatus, setCustomStatus] = useState(userProfile.msg);
  const [userBio, setUserBio] = useState(userProfile.bio);

  const sendSetStatus = (item) => {
    const content = initMatrix.matrixClient.getAccountData('pony.house.profile')?.getContent() ?? {};
    setProfileStatus(item.type);
    content.status = item.type;
    initMatrix.matrixClient.setAccountData('pony.house.profile', content);
    emitUpdateProfile(content);
  };

  const sendCustomStatus = () => {
    if (customStatusRef && customStatusRef.current) {

      const content = initMatrix.matrixClient.getAccountData('pony.house.profile')?.getContent() ?? {};

      const { value } = customStatusRef.current;
      if (typeof value === 'string' && value.length > 0) {
        setCustomStatus(value);
        content.msg = value;
      } else {
        setCustomStatus(null);
        content.msg = null;
      }

      initMatrix.matrixClient.setAccountData('pony.house.profile', content);
      emitUpdateProfile(content);

      alert('The custom status of your profile has been successfully defined.');

    }
  };

  const sendBio = () => {
    if (bioRef && bioRef.current) {

      const content = initMatrix.matrixClient.getAccountData('pony.house.profile')?.getContent() ?? {};

      const { value } = bioRef.current;
      if (typeof value === 'string' && value.length > 0) {
        setUserBio(value);
        content.bio = value;
      } else {
        setUserBio(null);
        content.bio = null;
      }

      initMatrix.matrixClient.setAccountData('pony.house.profile', content);
      emitUpdateProfile(content);

      alert('The biography of your profile has been successfully updated.');

    }
  };

  const items = [
    {
      type: '🟢',
      text: 'Online',
      faSrc: `${getStatusCSS('online')} user-presence-online`,
    },
    {
      type: '🟠',
      text: 'Idle',
      faSrc: `${getStatusCSS('idle')} user-presence-idle`,
    },
    {
      type: '🔴',
      text: 'Do not disturb',
      faSrc: `${getStatusCSS('dnd')} user-presence-dnd`,
    },
    {
      type: '🔘',
      text: 'Invisible',
      faSrc: `${getStatusCSS('offline')} user-presence-offline`,
    }
  ];

  let bannerSrc;
  if (typeof banner === 'string' && banner.length > 0) {
    bannerSrc = initMatrix.matrixClient.mxcUrlToHttp(banner, 400, 227);
  }

  const handleBannerUpload = async url => {

    const content = initMatrix.matrixClient.getAccountData('pony.house.profile')?.getContent() ?? {};

    const bannerPlace = $('.space-banner .avatar__border');
    const bannerImg = $('.space-banner img');

    if (url === null) {

      const isConfirmed = await confirmDialog(
        'Remove profile banner',
        'Are you sure that you want to remove banner?',
        'Remove',
        'warning',
      );

      if (isConfirmed) {

        setBanner(null);
        content.banner = null;
        initMatrix.matrixClient.setAccountData('pony.house.profile', content);
        emitUpdateProfile(content);

        bannerPlace.css('background-image', '').removeClass('banner-added');
        bannerImg.attr('src', '');

      }

    } else {

      setBanner(url);
      content.banner = url;
      initMatrix.matrixClient.setAccountData('pony.house.profile', content);
      emitUpdateProfile(content);

      bannerPlace.css('background-image', `url('${initMatrix.matrixClient.mxcUrlToHttp(url, 660, 227)}')`).addClass('banner-added');
      bannerImg.attr('src', initMatrix.matrixClient.mxcUrlToHttp(url, 400, 227));

    }

  };

  return (<>

    {window.matchMedia('screen and (min-width: 768px)').matches ? <div className="card noselect mb-3">
      <ul className="list-group list-group-flush">

        <li className="list-group-item very-small text-gray">Account ID</li>

        <li className="list-group-item border-0">
          <ProfileEditor userId={initMatrix.matrixClient.getUserId()} />
        </li>

      </ul></div> : null}

    <div className="card noselect mb-3">
      <ul className="list-group list-group-flush">

        <li className="list-group-item very-small text-gray">Status</li>

        <li className="list-group-item border-0">
          <div className='small'>Status</div>
          <div className='very-small text-gray'>Choose the current status of your profile.</div>
        </li>

        {items.map((item) => (
          <MenuItem
            className={profileStatus === item.type ? 'text-start btn-text-success' : 'text-start'}
            faSrc={item.faSrc}
            key={item.type}
            onClick={() => sendSetStatus(item)}
          >

            {item.text}
            <span className='ms-4 float-end'>
              <RadioButton isActive={profileStatus === item.type} />
            </span>

          </MenuItem>
        ))}

        <li className="list-group-item border-0">
          <div className='small'>Custom Status</div>
          <div className='very-small text-gray'>Enter a status that will appear next to your name.</div>
          <div className="input-group">
            <span className="input-group-text" id="basic-addon1">
              <img id='change-custom-status-img' className='img-fluid' src={customStatusIcon} alt='custom-status' onClick={(e) => {
                if (!$(e.target).hasClass('disabled')) {

                  const cords = getEventCords(e);
                  cords.x -= (document.dir === 'rtl' ? -80 : 280) - 200;
                  cords.y -= 230;

                  const tinyOpenEmojis = () => {
                    openEmojiBoard(null, cords, 'emoji', emoji => {

                      if (emoji.mxc) {
                        setcustomStatusIcon(initMatrix.matrixClient.mxcUrlToHttp(emoji.mxc));
                        setcustomStatusValue(emoji.mxc);
                      } else if (emoji.unicode) {
                        setcustomStatusIcon(`${TWEMOJI_BASE_URL}72x72/${emoji.hexcode.toLowerCase()}.png`);
                        setcustomStatusValue(emoji.unicode);
                      } else {
                        setcustomStatusIcon('./img/default_avatar/1.jpg');
                        setcustomStatusValue(null);
                      }

                      e.target.click();

                    });
                  };

                  tinyOpenEmojis();

                }
              }} />
            </span>
            <input ref={customStatusRef} className="form-control form-control-bg" type="text" placeholder="" maxLength="100" defaultValue={customStatus} />
          </div>
          <Button className='mt-2' onClick={sendCustomStatus} variant="primary">Submit</Button>
        </li>

      </ul></div>

    <div className="card noselect">
      <ul className="list-group list-group-flush">
        <li className="list-group-item very-small text-gray">Info</li>

        <li className="list-group-item border-0">
          <div className='small'>About me</div>
          <div className='very-small text-gray'>Enter a small biography about you.</div>
          <textarea ref={bioRef} className="form-control form-control-bg" placeholder="" rows="7" maxLength="190" defaultValue={userBio} />
          <Button className='mt-2' onClick={sendBio} variant="primary">Submit</Button>
        </li>

        <li className="list-group-item border-0">

          <div className='small'>Banner</div>

          <div className="very-small text-gray">
            <p>This image will display at the top of your profile.</p>
            The recommended minimum size is 1500x500 and recommended aspect ratio is 16:9.
          </div>

          <ImageUpload
            className='space-banner profile-banner'
            text='Banner'
            imageSrc={bannerSrc}
            onUpload={handleBannerUpload}
            onRequestRemove={() => handleBannerUpload(null)}
          />
        </li>

      </ul>
    </div>

  </>
  );

}

export const tabText = {
  APPEARANCE: 'Appearance',
  PRIVACY: 'Privacy',
  NOTIFICATIONS: 'Notifications',
  EMOJI: 'Emoji',
  SECURITY: 'Security',
  ABOUT: 'About',
  DONATE: 'Donate',
  PROFILE: 'Profile',
  LOGOUT: 'Logout',
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
    text: tabText.LOGOUT,
    faSrc: "fa-solid fa-power-off",
    className: 'btn-text-danger',
    disabled: false,
    onClick: async () => {
      if (await confirmDialog('Logout', 'Are you sure that you want to logout your session?', 'Logout', 'danger')) {
        initMatrix.logout();
      }
    }
  }];

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