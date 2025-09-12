import { googleAuthService, GoogleUserData } from "@/services/googleAuth";
import { authHandle, AuthUserData } from "./authUtils";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Handle Google Sign-In and integrate with existing auth system
 */
export const handleGoogleSignIn = async (): Promise<void> => {
  try {
    console.log("Starting Google Sign-In process...");

    // Check if Google Sign-In is available
    const isAvailable = await googleAuthService.isAvailable();
    if (!isAvailable) {
      throw new Error("Google Sign-In is not available on this device");
    }

    // Sign in with Google
    const googleUserData = await googleAuthService.signIn();
    console.log("Google Sign-In successful:", googleUserData);

    // Convert Google user data to our auth format
    const authUserData: AuthUserData = {
      name: googleUserData.name,
      email: googleUserData.email.toLowerCase().trim(),
      avatar: googleUserData.photo || "",
      provider: "GOOGLE",
      providerId: googleUserData.id,
    };

    console.log("Attempting authentication with backend...");

    // Use existing authHandle function with Google provider
    const response = await authHandle(authUserData);

    if (response.success) {
      console.log("Google authentication successful:", response.data.user);

      // Store additional Google user data
      await AsyncStorage.setItem(
        "googleUserData",
        JSON.stringify(googleUserData)
      );

      // Navigate to appropriate dashboard based on user role
      const userRole = response.data.user.role || "user";
      navigateToDashboard(userRole);
    } else {
      throw new Error(response.message || "Google authentication failed");
    }
  } catch (error: any) {
    console.error("Google Sign-In error:", error);

    // Handle specific error cases
    if (error.message?.includes("cancelled")) {
      // User cancelled sign-in, don't show error
      return;
    }

    // Show error to user
    throw new Error(
      error.message || "Google Sign-In failed. Please try again."
    );
  }
};

/**
 * Handle Google Sign-Out
 */
export const handleGoogleSignOut = async (): Promise<void> => {
  try {
    console.log("Starting Google Sign-Out process...");

    // Sign out from Google
    await googleAuthService.signOut();

    // Clear stored Google user data
    await AsyncStorage.removeItem("googleUserData");

    console.log("Google Sign-Out successful");
  } catch (error) {
    console.error("Google Sign-Out error:", error);
    // Don't throw error for sign-out, just log it
  }
};

/**
 * Check if user is signed in with Google
 */
export const isGoogleSignedIn = async (): Promise<boolean> => {
  try {
    return await googleAuthService.isSignedIn();
  } catch (error) {
    console.error("Error checking Google Sign-In status:", error);
    return false;
  }
};

/**
 * Get current Google user data
 */
export const getCurrentGoogleUser =
  async (): Promise<GoogleUserData | null> => {
    try {
      return await googleAuthService.getCurrentUser();
    } catch (error) {
      console.error("Error getting current Google user:", error);
      return null;
    }
  };

/**
 * Navigate to appropriate dashboard based on user role
 */
const navigateToDashboard = (userRole: string) => {
  console.log("Navigating to dashboard for role:", userRole);

  switch (userRole.toLowerCase()) {
    case "vendor":
      router.replace("/(dashboard)/(vendor)/dashboard");
      break;
    case "salesman":
      router.replace("/(dashboard)/(salesman)/dashboard");
      break;
    case "admin":
      router.replace("/(dashboard)/(admin)/dashboard");
      break;
    case "user":
    default:
      router.replace("/(dashboard)/(user)/home");
      break;
  }
};

/**
 * Initialize Google Sign-In (call this in App.tsx or main component)
 */
export const initializeGoogleSignIn = async (): Promise<void> => {
  try {
    await googleAuthService.configure();
    console.log("Google Sign-In initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Google Sign-In:", error);
    // Don't throw error, just log it - app should still work without Google Sign-In
  }
};
