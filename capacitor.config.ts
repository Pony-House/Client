import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'pony.house.matrix',
  appName: 'pony-house-matrix',
  webDir: 'dist',

  server: {
    androidScheme: 'https',
  },

  plugins: {
    // LocalNotifications: {
    // smallIcon: "ic_stat_icon_config_sample",
    // iconColor: "#488AFF",
    // sound: "beep.wav",
    // },
  },
};

export default config;
