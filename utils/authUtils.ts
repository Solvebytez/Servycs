import JWT from "expo-jwt";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

// Get the secret key from app config
const getSecretKey = (): string => {
  console.log("getSecretKey: Getting secret key from Constants");
  console.log("getSecretKey: Constants.expoConfig:", Constants.expoConfig);
  console.log(
    "getSecretKey: Constants.expoConfig?.extra:",
    Constants.expoConfig?.extra
  );

  const secretKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_SECRET_KEY;
  console.log("getSecretKey: Secret key:", secretKey);

  if (!secretKey) {
    throw new Error(
      "EXPO_PUBLIC_SECRET_KEY is not configured in app.config.js"
    );
  }
  return secretKey;
};

export interface AuthUserData {
  name: string;
  email: string;
  avatar: string;
  provider: "LOCAL" | "GOOGLE";
  providerId?: string;
  password?: string; // Optional password for login validation
  phone?: string; // Optional phone number
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      status: string;
      provider?: string;
      profilePicture?: string;
      isEmailVerified: boolean;
      vendor?: any;
      salesman?: any;
      admin?: any;
    };
    accessToken: string;
  };
}

/**
 * Generate JWT token for authentication
 */
export const generateAuthToken = (userData: AuthUserData): string => {
  try {
    const secretKey = getSecretKey();

    // Create token payload
    const payload = {
      name: userData.name,
      email: userData.email,
      avatar: userData.avatar,
      provider: userData.provider,
      providerId: userData.providerId,
      password: userData.password, // Include password for validation
      phone: userData.phone, // Include phone number
      iat: Math.floor(Date.now() / 1000), // Issued at
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // Expires in 24 hours
    };

    // Generate JWT token
    const token = JWT.encode(payload, secretKey);
    return token;
  } catch (error) {
    console.error("Error generating auth token:", error);
    throw new Error("Failed to generate authentication token");
  }
};

/**
 * Handle authentication with token-based login/register
 */
export const authHandle = async (
  userData: AuthUserData
): Promise<AuthResponse> => {
  try {
    // Generate token
    const token = generateAuthToken(userData);

    // Import token auth API dynamically to avoid circular imports
    const { tokenAuthApi } = await import("@/services/api");

    // Make API call to backend
    const response = await tokenAuthApi.post("/login", {
      signInToken: token,
    });

    if (response.status === 200 || response.status === 201) {
      const authResponse: AuthResponse = response.data as AuthResponse;

      // Validate response data
      if (!authResponse.data?.accessToken || !authResponse.data?.user?.role) {
        throw new Error("Invalid response: Missing access token or user role");
      }

      // Store access token and user role
      await AsyncStorage.multiSet([
        ["accessToken", authResponse.data.accessToken],
        ["userRole", authResponse.data.user.role],
        ["userEmail", authResponse.data.user.email],
        ["userId", authResponse.data.user.id],
        ["tokenTimestamp", Date.now().toString()],
        ["hasCompletedOnboarding", "true"],
      ]);

      // Verify data was stored correctly
      const [storedToken, storedRole, storedEmail, storedUserId] =
        await AsyncStorage.multiGet([
          "accessToken",
          "userRole",
          "userEmail",
          "userId",
        ]);

      if (
        !storedToken[1] ||
        !storedRole[1] ||
        !storedEmail[1] ||
        !storedUserId[1]
      ) {
        throw new Error("Failed to store authentication data in AsyncStorage");
      }

      console.log("Authentication successful and data stored:", {
        user: authResponse.data.user,
        stored: {
          hasToken: !!storedToken[1],
          hasRole: !!storedRole[1],
          hasEmail: !!storedEmail[1],
          hasUserId: !!storedUserId[1],
        },
      });

      return authResponse;
    } else {
      throw new Error(`Unexpected response status: ${response.status}`);
    }
  } catch (error: any) {
    console.error("Authentication Error:", JSON.stringify(error, null, 2));

    // Handle specific error cases
    if (error.response?.status === 409) {
      throw new Error(
        "User with this email already exists. Please try logging in instead."
      );
    } else if (error.response?.status === 401) {
      throw new Error("Invalid credentials or token verification failed.");
    } else if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error("Authentication failed. Please try again.");
    }
  }
};

/**
 * Handle registration with token-based register
 */
export const registerHandle = async (
  userData: AuthUserData
): Promise<AuthResponse> => {
  try {
    // Generate token
    const token = generateAuthToken(userData);

    // Import token auth API dynamically to avoid circular imports
    const { tokenAuthApi } = await import("@/services/api");

    // Make API call to backend for registration
    const response = await tokenAuthApi.post("/register", {
      signInToken: token,
    });

    if (response.status === 200 || response.status === 201) {
      const authResponse: AuthResponse = response.data as AuthResponse;

      // For LOCAL provider, only store user data if email is verified
      // For GOOGLE provider, store everything including access token
      if (
        userData.provider === "LOCAL" &&
        !authResponse.data.user.isEmailVerified
      ) {
        // LOCAL user needs OTP verification - don't store access token yet
        console.log(
          "Registration successful, OTP verification required:",
          authResponse.data.user
        );
        return authResponse;
      } else {
        // GOOGLE user or verified LOCAL user - store access token and user data
        await AsyncStorage.multiSet([
          ["accessToken", authResponse.data.accessToken],
          ["userRole", authResponse.data.user.role],
          ["userEmail", authResponse.data.user.email],
          ["userId", authResponse.data.user.id],
          ["tokenTimestamp", Date.now().toString()],
          ["hasCompletedOnboarding", "true"],
        ]);

        console.log(
          "Registration successful and data stored:",
          authResponse.data.user
        );
        return authResponse;
      }
    } else {
      throw new Error(`Unexpected response status: ${response.status}`);
    }
  } catch (error: any) {
    console.error("Registration Error:", JSON.stringify(error, null, 2));

    // Handle specific error cases
    if (error.response?.status === 409) {
      throw new Error(
        "User with this email already exists. Please try logging in instead."
      );
    } else if (error.response?.status === 401) {
      throw new Error("Invalid credentials or token verification failed.");
    } else if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error("Registration failed. Please try again.");
    }
  }
};

/**
 * Check if user is authenticated and get stored user data
 */
export const checkAuthenticationStatus = async (): Promise<{
  isAuthenticated: boolean;
  userRole?: string;
  userData?: any;
  isOffline?: boolean;
}> => {
  try {
    const [accessToken, userRole, userEmail, userId] =
      await AsyncStorage.multiGet([
        "accessToken",
        "userRole",
        "userEmail",
        "userId",
      ]);

    if (accessToken[1] && userRole[1]) {
      // Try to validate token with backend first
      try {
        const { api } = await import("@/services/api");
        await api.get("/auth/me"); // Validate token with backend

        // Backend validation successful
        return {
          isAuthenticated: true,
          userRole: userRole[1],
          userData: {
            id: userId[1],
            email: userEmail[1],
            role: userRole[1],
          },
          isOffline: false,
        };
      } catch (backendError) {
        // Backend unreachable or token invalid
        console.log("Backend validation failed:", backendError);

        // If backend returns 401, it means user is not authenticated (could be PENDING, INACTIVE, etc.)
        // Don't allow offline access in this case - force re-authentication
        if (
          backendError &&
          typeof backendError === "object" &&
          "response" in backendError
        ) {
          const error = backendError as any;
          if (error.response?.status === 401) {
            console.log("User not authenticated (401), clearing stored data");
            await clearAuthData();
            return {
              isAuthenticated: false,
            };
          }
        }

        // Only allow offline access if backend is truly unreachable (network error)
        console.log("Backend unreachable, checking for offline access");

        // Check if token is expired locally (basic check)
        try {
          // Simple token expiration check - just check if token exists and is not too old
          // For offline mode, we'll allow access if token exists (backend will validate on next API call)
          const tokenTimestamp = await AsyncStorage.getItem("tokenTimestamp");
          const tokenAge =
            Date.now() - (tokenTimestamp ? parseInt(tokenTimestamp) : 0);
          const maxOfflineAge = 24 * 60 * 60 * 1000; // 24 hours

          if (tokenAge < maxOfflineAge) {
            // Token not expired locally, allow offline access
            return {
              isAuthenticated: true,
              userRole: userRole[1],
              userData: {
                id: userId[1],
                email: userEmail[1],
                role: userRole[1],
              },
              isOffline: true,
            };
          }
        } catch (jwtError) {
          console.error("Error decoding token:", jwtError);
        }

        // Token expired or invalid, clear cache
        await AsyncStorage.multiRemove([
          "accessToken",
          "userRole",
          "userEmail",
          "userId",
        ]);
        return { isAuthenticated: false };
      }
    }
    return { isAuthenticated: false };
  } catch (error) {
    console.error("Error checking authentication status:", error);
    return { isAuthenticated: false };
  }
};

/**
 * Navigate to appropriate dashboard based on user role
 */
export const navigateToDashboard = (userRole: string) => {
  console.log(
    "navigateToDashboard: Navigating to dashboard for role:",
    userRole
  );
  switch (userRole.toLowerCase()) {
    case "vendor":
      console.log("navigateToDashboard: Navigating to vendor dashboard");
      router.replace("/(dashboard)/(vendor)/dashboard");
      break;
    case "salesman":
      console.log("navigateToDashboard: Navigating to salesman dashboard");
      router.replace("/(dashboard)/(salesman)/dashboard");
      break;
    case "admin":
      console.log("navigateToDashboard: Navigating to admin dashboard");
      router.replace("/(dashboard)/(admin)/dashboard");
      break;
    case "user":
    default:
      console.log("navigateToDashboard: Navigating to user home");
      router.replace("/(dashboard)/(user)/home");
      break;
  }
};

/**
 * Clear authentication data without navigation
 */
export const clearAuthData = async () => {
  try {
    // Clear stored tokens and user data
    await AsyncStorage.multiRemove([
      "accessToken",
      "userRole",
      "userEmail",
      "userId",
      "tokenTimestamp",
      "hasCompletedOnboarding",
      "userData",
    ]);
  } catch (error) {
    console.error("Clear auth data error:", error);
  }
};

/**
 * Clear authentication data and redirect to login
 */
export const logout = async () => {
  try {
    // Clear stored tokens and user data
    await AsyncStorage.multiRemove([
      "accessToken",
      "userRole",
      "userEmail",
      "userId",
      "tokenTimestamp",
      "hasCompletedOnboarding",
      "userData",
    ]);

    // Navigate to role selection
    router.replace("/(auth)/role-selection");
  } catch (error) {
    console.error("Logout error:", error);
    // Force navigation even if clearing storage fails
    router.replace("/(auth)/role-selection");
  }
};

/**
 * Switch user role and navigate to appropriate dashboard
 */
export const switchRole = async (newRole: string) => {
  try {
    console.log("switchRole: Starting role switch to:", newRole);
    const { userService } = await import("@/services/user");

    // Call backend to switch role
    console.log("switchRole: Calling backend to switch role");
    const response = await userService.switchRole(newRole);
    console.log("switchRole: Backend response:", response);

    if ((response as any).success) {
      // Update AsyncStorage with new role
      console.log(
        "switchRole: Updating AsyncStorage with new role:",
        newRole.toUpperCase()
      );
      await AsyncStorage.setItem("userRole", newRole.toUpperCase());

      // Navigate to the appropriate dashboard
      console.log(
        "switchRole: Navigating to dashboard for role:",
        newRole.toUpperCase()
      );
      navigateToDashboard(newRole.toUpperCase());

      return response;
    } else {
      throw new Error((response as any).message || "Failed to switch role");
    }
  } catch (error) {
    console.error("switchRole: Role switch error:", error);
    throw error;
  }
};
