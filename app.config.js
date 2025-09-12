export default {
  expo: {
    name: "listroApp",
    slug: "listroApp",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    scheme: "listroapp",
    splash: {
      image: "./assets/logo.png",
      resizeMode: "contain",
      backgroundColor: "#00D4FF",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.sahin05.listroapp",
    },
    android: {
      package: "com.sahin05.listroapp",
      adaptiveIcon: {
        foregroundImage: "./assets/icon.png",
        backgroundColor: "#00D4FF",
      },
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      "expo-router",
      "expo-secure-store",
      [
        "expo-splash-screen",
        {
          image: "./assets/logo.png",
          resizeMode: "contain",
          backgroundColor: "#00D4FF",
        },
      ],
      [
        "@react-native-google-signin/google-signin",
        {
          iosUrlScheme:
            "com.googleusercontent.apps.711162559013-5tu8e0so9qro65fn6iv1rm1cmok5o5s4",
          iosClientId:
            "711162559013-mf02ppujrecmed3sm5ahurnp4p12aruo.apps.googleusercontent.com",
          androidClientId:
            "711162559013-llne15m3e7ermm55lvnmu9dm7njg3t9i.apps.googleusercontent.com",
          webClientId:
            "711162559013-5tu8e0so9qro65fn6iv1rm1cmok5o5s4.apps.googleusercontent.com",
        },
      ],
    ],
    extra: {
      router: {},
      eas: {
        projectId: "cd2edfc0-66b6-4fed-8b21-1b8a78fe153e",
      },
      apiBaseUrl: process.env.EXPO_API_BASE_URL || "http://192.168.0.131:5000",
      apiVersion: process.env.EXPO_API_VERSION || "v1",
      apiTimeout: process.env.EXPO_API_TIMEOUT || 30000,
      enableAnalytics: process.env.EXPO_ENABLE_ANALYTICS === "true",
      enableDebug: process.env.EXPO_ENABLE_DEBUG === "true",
      EXPO_PUBLIC_SECRET_KEY: process.env.EXPO_PUBLIC_SECRET_KEY,
      // Google OAuth Configuration
      GOOGLE_WEB_CLIENT_ID:
        "711162559013-5tu8e0so9qro65fn6iv1rm1cmok5o5s4.apps.googleusercontent.com",
      GOOGLE_IOS_CLIENT_ID:
        "711162559013-mf02ppujrecmed3sm5ahurnp4p12aruo.apps.googleusercontent.com",
      GOOGLE_ANDROID_CLIENT_ID:
        "711162559013-llne15m3e7ermm55lvnmu9dm7njg3t9i.apps.googleusercontent.com",
      appName: "ListroApp",
      appVersion: "1.0.0",
    },
  },
};
