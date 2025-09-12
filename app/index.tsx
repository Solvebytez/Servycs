import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as ExpoSplashScreen from "expo-splash-screen";
import { COLORS, FONT_SIZE, MARGIN, SPACING } from "../constants";
import {
  checkAuthenticationStatus,
  navigateToDashboard,
} from "../utils/authUtils";

// Keep the splash screen visible while we fetch resources
ExpoSplashScreen.preventAutoHideAsync();

export default function SplashScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  console.log("SplashScreen component is rendering!");

  useEffect(() => {
    console.log("SplashScreen useEffect running");

    // Hide the default Expo splash screen immediately
    ExpoSplashScreen.hideAsync();

    // Check authentication and navigate accordingly
    const checkAuthAndNavigate = async () => {
      try {
        console.log("Checking authentication status...");
        const authStatus = await checkAuthenticationStatus();

        if (authStatus.isAuthenticated && authStatus.userRole) {
          // User is logged in, navigate to their dashboard
          if (authStatus.isOffline) {
            console.log(
              "User authenticated (offline mode), navigating to dashboard for role:",
              authStatus.userRole
            );
          } else {
            console.log(
              "User authenticated (online), navigating to dashboard for role:",
              authStatus.userRole
            );
          }
          navigateToDashboard(authStatus.userRole);
        } else {
          // User not logged in, go to role selection
          console.log("User not authenticated, navigating to role selection");
          router.replace("/(auth)/role-selection");
        }
      } catch (error) {
        console.error("Authentication check error:", error);
        // Fallback to role selection if check fails
        router.replace("/(auth)/role-selection");
      } finally {
        setIsLoading(false);
      }
    };

    // Add small delay for splash screen
    const timer = setTimeout(checkAuthAndNavigate, 1500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary[200], "#E0F7FF", COLORS.background.primary]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        locations={[0, 0.7, 1]}
      >
        <View style={styles.content}>
          <Image
            source={require("../assets/logo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
          {isLoading && <Text style={styles.loadingText}>Loading...</Text>}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: MARGIN.lg,
  },
  logoText: {
    fontSize: FONT_SIZE.display1,
    fontWeight: "bold",
    color: COLORS.text.primary,
    textAlign: "center",
    marginBottom: MARGIN.lg,
    textShadowColor: "rgba(255, 255, 255, 0.8)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  loadingText: {
    fontSize: FONT_SIZE.body1,
    color: COLORS.text.primary,
    textAlign: "center",
    marginBottom: MARGIN.md,
  },
});
