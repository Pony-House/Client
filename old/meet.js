// Server
const domain = 'meet.jit.si';
const options = {
  // Insert App
  parentNode: document.querySelector('#meet'),
  lang: 'en',

  // Selected Device
  devices: {
    // audioInput: '<deviceLabel>',
    // audioOutput: '<deviceLabel>',
    // videoInput: '<deviceLabel>'
  },

  // Page Config
  configOverwrite: {
    // Room Name
    subject: `{{title | safe}}`,

    // Start Mode
    startWithAudioMuted: false,
    startAudioOnly: true,

    // Rest Config

    startWithVideoMuted: true,

    disableInviteFunctions: true,
    readOnlyName: false,

    prejoinConfig: {
      enabled: false,
    },

    useHostPageLocalStorage: true,
    disableAudioLevels: false,

    securityUi: {
      hideLobbyButton: true,
      disableLobbyPassword: false,
    },

    enableEmailInStats: false,
    enableDisplayNameInStats: true,

    breakoutRooms: {
      hideAddRoomButton: true,
      hideAutoAssignButton: true,
      hideJoinRoomButton: true,
    },

    transcribingEnabled: false,
    disableSimulcast: false,

    // etherpad_base: 'https://your-etherpad-installati.on/p/',

    giphy: {
      enabled: false,
    },

    gravatar: {
      baseUrl: 'https://www.gravatar.com/avatar/',
      disabled: true,
    },

    whiteboard: {
      enabled: false,
      // collabServerBaseUrl: 'https://excalidraw-backend.example.com'
    },
  },

  // Interface
  interfaceConfigOverwrite: {
    // App Template
    APP_NAME: __ENV_APP__.INFO.name,
    DEFAULT_BACKGROUND: '#040404',

    AUDIO_LEVEL_PRIMARY_COLOR: 'rgba(255,255,255,0.4)',
    AUDIO_LEVEL_SECONDARY_COLOR: 'rgba(255,255,255,0.2)',

    // Rest

    GENERATE_ROOMNAMES_ON_WELCOME_PAGE: false,
    DISABLE_TRANSCRIPTION_SUBTITLES: true,

    DEFAULT_WELCOME_PAGE_LOGO_URL: 'images/watermark.svg',

    DISPLAY_WELCOME_FOOTER: false,
    DISPLAY_WELCOME_PAGE_ADDITIONAL_CARD: false,
    DISPLAY_WELCOME_PAGE_CONTENT: false,
    DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT: false,

    HIDE_INVITE_MORE_HEADER: true,
    MOBILE_APP_PROMO: false,

    VIDEO_QUALITY_LABEL_DISABLED: false,

    SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'sounds', 'more'],
    SHARING_FEATURES: [],

    SHOW_CHROME_EXTENSION_BANNER: false,
    SHOW_PROMOTIONAL_CLOSE_PAGE: false,

    TOOLBAR_BUTTONS: [
      'camera',
      'chat',
      'closedcaptions',
      'desktop',
      'fullscreen',
      'microphone',
      'noisesuppression',
      'participants-pane',
      'raisehand',
      'recording',
      'select-background',
      'settings',
      'shareaudio',
      'sharedvideo',
      'shortcuts',
      'stats',
      'tileview',
      'toggle-camera',
      'videoquality',
      'etherpad',
    ],
  },

  // User Data
  userInfo: {
    displayName: 'JasminDreasond',
  },

  // Room Key
  roomName: `{{key | safe}}`,

  // Page Load
  onload: function () {
    // Set Avatar
    api.executeCommand('avatarUrl', 'https://avatars0.githubusercontent.com/u/3671647');

    // Test
    setTimeout(function () {
      api.executeCommand(
        'avatarUrl',
        'https://matrix-client.matrix.org/_matrix/media/r0/thumbnail/matrix.org/XhHfjJYarbeWNgNUMeNSROLW?width=512&height=512&method=crop',
      );
      api.executeCommand('displayName', 'Tiny Jasmini');

      //
    }, 20000);
  },
};

// Start
const api = new JitsiMeetExternalAPI(domain, options);

// Ready to Close
api.addListener('readyToClose', () => {
  console.log('[meet] readyToClose');
});

// Mute Audio
api.addListener('audioMuteStatusChanged', (data) => {
  console.log('[meet] audioMuteStatusChanged', data);
  // api.executeCommand('toggleAudio');
});

// Mute Video
api.addListener('videoMuteStatusChanged', (data) => {
  console.log('[meet] videoMuteStatusChanged', data);
  // api.executeCommand('toggleVideo');
});

// set new password for channel
api.addEventListener('participantRoleChanged', function (event) {
  if (event.role === 'moderator') {
    api.executeCommand('password', `{{password | safe}}`);
  }
});

// Insert Password
api.addListener('passwordRequired', () => {
  api.executeCommand('password', `{{password | safe}}`);
});
