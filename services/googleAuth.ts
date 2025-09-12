import {
  GoogleSignin,
  statusCodes,
  User,
  isSuccessResponse,
} from "@react-native-google-signin/google-signin";
import { Platform } from "react-native";
import Constants from "expo-constants";

// Google Sign-In configuration interface
interface GoogleSignInConfig {
  webClientId: string;
  iosClientId?: string;
  androidClientId?: string;
}

// Google user data interface
export interface GoogleUserData {
  id: string;
  name: string;
  email: string;
  photo?: string;
  givenName?: string;
  familyName?: string;
}

// Google Sign-In service class
class GoogleAuthService {
  private isConfigured = false;

  /**
   * Configure Google Sign-In with client IDs
   */
  configure = async (): Promise<void> => {
    try {
      // Get client IDs from environment or app config
      const config = this.getGoogleConfig();

      if (!config.webClientId) {
        throw new Error("Google Web Client ID is not configured");
      }

      // Configure Google Sign-In
      const configureOptions: any = {
        webClientId: config.webClientId,
        offlineAccess: true, // Request offline access
        hostedDomain: "", // Optional: restrict to specific domain
        forceCodeForRefreshToken: true, // Android only
        accountName: "", // Android only
        googleServicePlistPath: "", // iOS only
        openIdConnect: true, // Request OpenID Connect
        profileImageSize: 120, // Request profile image size
      };

      // Add platform-specific client IDs
      if (Platform.OS === "ios" && config.iosClientId) {
        configureOptions.iosClientId = config.iosClientId;
      }

      await GoogleSignin.configure(configureOptions);

      this.isConfigured = true;
      console.log("Google Sign-In configured successfully");
    } catch (error) {
      console.error("Error configuring Google Sign-In:", error);
      throw new Error("Failed to configure Google Sign-In");
    }
  };

  /**
   * Get Google configuration from environment variables
   */
  private getGoogleConfig = (): GoogleSignInConfig => {
    const extra = Constants.expoConfig?.extra;

    return {
      webClientId: extra?.GOOGLE_WEB_CLIENT_ID || "",
      iosClientId: extra?.GOOGLE_IOS_CLIENT_ID || "",
      androidClientId: extra?.GOOGLE_ANDROID_CLIENT_ID || "",
    };
  };

  /**
   * Check if Google Sign-In is available and configured
   */
  isAvailable = async (): Promise<boolean> => {
    try {
      if (!this.isConfigured) {
        await this.configure();
      }

      const isAvailable = await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      return isAvailable;
    } catch (error) {
      console.error("Error checking Google Sign-In availability:", error);
      return false;
    }
  };

  /**
   * Sign in with Google
   */
  signIn = async (): Promise<GoogleUserData> => {
    try {
      // Ensure Google Sign-In is configured
      if (!this.isConfigured) {
        await this.configure();
      }

      // Check if Google Play Services are available (Android)
      if (Platform.OS === "android") {
        await GoogleSignin.hasPlayServices({
          showPlayServicesUpdateDialog: true,
        });
      }

      // Sign in
      const userInfo = await GoogleSignin.signIn();

      console.log(
        "Google Sign-In response:",
        JSON.stringify(userInfo, null, 2)
      );

      if (!isSuccessResponse(userInfo)) {
        throw new Error("Google Sign-In failed");
      }

      // Extract user data using the correct structure
      const userData: GoogleUserData = {
        id: userInfo.data.user.id,
        name: userInfo.data.user.name || "",
        email: userInfo.data.user.email,
        photo: userInfo.data.user.photo || undefined,
        givenName: userInfo.data.user.givenName || undefined,
        familyName: userInfo.data.user.familyName || undefined,
      };

      console.log("Google Sign-In successful:", userData);
      return userData;
    } catch (error: any) {
      console.error("Google Sign-In error:", error);

      // Handle specific error cases
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new Error("Sign-in was cancelled by user");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        throw new Error("Sign-in is already in progress");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error("Google Play Services not available");
      } else if (error.code === statusCodes.SIGN_IN_REQUIRED) {
        throw new Error("Sign-in required");
      } else {
        throw new Error(error.message || "Google Sign-In failed");
      }
    }
  };

  /**
   * Sign out from Google
   */
  signOut = async (): Promise<void> => {
    try {
      await GoogleSignin.signOut();
      console.log("Google Sign-Out successful");
    } catch (error) {
      console.error("Google Sign-Out error:", error);
      throw new Error("Failed to sign out from Google");
    }
  };

  /**
   * Get current user (if signed in)
   */
  getCurrentUser = async (): Promise<GoogleUserData | null> => {
    try {
      const userInfo = await GoogleSignin.getCurrentUser();

      if (!userInfo || !isSuccessResponse(userInfo as any)) {
        return null;
      }

      return {
        id: (userInfo as any).data.user.id,
        name: (userInfo as any).data.user.name || "",
        email: (userInfo as any).data.user.email,
        photo: (userInfo as any).data.user.photo || undefined,
        givenName: (userInfo as any).data.user.givenName || undefined,
        familyName: (userInfo as any).data.user.familyName || undefined,
      };
    } catch (error) {
      console.error("Error getting current Google user:", error);
      return null;
    }
  };

  /**
   * Check if user is signed in
   */
  isSignedIn = async (): Promise<boolean> => {
    try {
      const userInfo = await GoogleSignin.getCurrentUser();
      return userInfo ? isSuccessResponse(userInfo as any) : false;
    } catch (error) {
      console.error("Error checking Google Sign-In status:", error);
      return false;
    }
  };

  /**
   * Revoke access (sign out and revoke tokens)
   */
  revokeAccess = async (): Promise<void> => {
    try {
      await GoogleSignin.revokeAccess();
      console.log("Google access revoked successfully");
    } catch (error) {
      console.error("Error revoking Google access:", error);
      throw new Error("Failed to revoke Google access");
    }
  };
}

// Export singleton instance
export const googleAuthService = new GoogleAuthService();

// Export the class for testing purposes
export { GoogleAuthService };
