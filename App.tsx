import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect } from "react";
import { initializeGoogleSignIn } from "@/utils/googleAuthUtils";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  useEffect(() => {
    // Initialize Google Sign-In when app starts
    initializeGoogleSignIn().catch((error) => {
      console.error("Failed to initialize Google Sign-In:", error);
      // Don't block app startup if Google Sign-In fails to initialize
    });
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
