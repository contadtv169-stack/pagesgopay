import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gopay.app',
  appName: 'GoPay',
  webDir: 'dist',
  server: {
    // FIX: androidScheme https + NO hostname → assets carregam via capacitor://
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: true,
  },
  plugins: {
    SplashScreen: {
      // FIX: launchAutoHide false → controlamos quando esconder via código
      launchAutoHide: false,
      backgroundColor: '#0066FF',
      showSpinner: false,
      launchShowDuration: 0,
    }
  }
};

export default config;
