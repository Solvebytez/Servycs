export default {
  expo: {
    name: 'listroApp',
    slug: 'listroApp',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    scheme: 'listroapp',
    splash: {
      image: './assets/logo.png',
      resizeMode: 'contain',
      backgroundColor: '#00D4FF'
    },
    assetBundlePatterns: [
      '**/*'
    ],
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/icon.png',
        backgroundColor: '#00D4FF'
      }
    },
    web: {
      favicon: './assets/favicon.png'
    },
    plugins: [
      'expo-router',
      'expo-secure-store',
      ['expo-splash-screen', {
        image: './assets/logo.png',
        resizeMode: 'contain',
        backgroundColor: '#00D4FF'
      }],
    ],
    extra: {
      router: {},
      eas: { projectId: process.env.EXPO_EAS_PROJECT_ID || 'your-project-id-here' },
      apiBaseUrl: process.env.EXPO_API_BASE_URL || 'http://localhost:5000',
      apiVersion: process.env.EXPO_API_VERSION || 'v1',
      apiTimeout: process.env.EXPO_API_TIMEOUT || 30000,
      enableAnalytics: process.env.EXPO_ENABLE_ANALYTICS === 'true',
      enableDebug: process.env.EXPO_ENABLE_DEBUG === 'true',
      appName: 'ListroApp',
      appVersion: '1.0.0',
    },
  },
};
