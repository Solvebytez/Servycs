import Constants from 'expo-constants';

// Get config from Expo Constants
const extra = Constants.expoConfig?.extra || {};

// Environment configuration for the app
export const ENV = {
  // API Configuration
  API_BASE_URL: extra.apiBaseUrl || 'http://localhost:5000',
  API_VERSION: extra.apiVersion || 'v1',
  API_TIMEOUT: extra.apiTimeout || 30000,
  
  // App Configuration
  APP_NAME: extra.appName || 'ListroApp',
  APP_VERSION: extra.appVersion || '1.0.0',
  
  // Feature Flags
  ENABLE_ANALYTICS: extra.enableAnalytics || false,
  ENABLE_DEBUG: extra.enableDebug || true,
  
  // OAuth Configuration
  GOOGLE_ANDROID_CLIENT_ID: extra.googleAndroidClientId,
  GOOGLE_IOS_CLIENT_ID: extra.googleIosClientId,
  GOOGLE_WEB_CLIENT_ID: extra.googleWebClientId,
  GOOGLE_CLIENT_SECRET: extra.googleClientSecret,
  
  // Timeouts
  REQUEST_TIMEOUT: 10000, // 10 seconds
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${ENV.API_BASE_URL}/api/${ENV.API_VERSION}${endpoint}`;
};

// Helper function to check if in development
export const isDevelopment = (): boolean => {
  return __DEV__;
};

// Helper function to check if in production
export const isProduction = (): boolean => {
  return !__DEV__;
};

// Helper function to get OAuth config
export const getOAuthConfig = () => ({
  google: {
    androidClientId: ENV.GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: ENV.GOOGLE_IOS_CLIENT_ID,
    webClientId: ENV.GOOGLE_WEB_CLIENT_ID,
    clientSecret: ENV.GOOGLE_CLIENT_SECRET,
  },
});
