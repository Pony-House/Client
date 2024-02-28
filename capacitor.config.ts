import { CapacitorConfig } from '@capacitor/cli';
import path from 'node:path';

// Insert utils
const config: CapacitorConfig = {
  appId: 'pony.house.matrix',
  appName: 'pony-house-matrix',
  webDir: 'dist',

  server: {
    iosScheme: 'https',
    androidScheme: 'https',
  },

  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    LocalNotifications: {
      smallIcon: 'icon',
      iconColor: '#48ffda',
      sound: path.join(__dirname, './public/sound/notification.ogg'),
    },
  },
  android: {
    buildOptions: {
      keystorePath: path.join(__dirname, './android/tinykey.jks'),
      keystoreAlias: 'JasminDreasond',
    },
  },
};

export default config;
