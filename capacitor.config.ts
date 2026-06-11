import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gopay.app',
  appName: 'GoPay',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  android: {
    allowMixedContent: true
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: "#0066FF",
      showSpinner: false,
      androidScaleType: "CENTER_CROP"
    }
  }
};

export default config;
