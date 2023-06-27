import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'pony.house.matrix',
  appName: 'pony-house-matrix',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
