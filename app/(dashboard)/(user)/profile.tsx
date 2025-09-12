import React, { useState } from "react";

import { useRouter } from "expo-router";

import { Alert } from "react-native";

import { ProfileScreen, ProfileData, SettingItem } from "../../../components";
import { COLORS } from "../../../constants";
import { logout, switchRole } from "../../../utils/authUtils";
import { useUser } from "../../../hooks/useUser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";

export default function UserProfileScreen() {
  const router = useRouter();
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const queryClient = useQueryClient();

  // Use React Query to fetch user data
  const { data: user, isLoading, error } = useUser();

  // Debug raw user data (only when needed)
  // console.log("=== RAW USER DATA DEBUG (USER PROFILE) ===");
  // console.log("user:", user);
  // console.log("user?.role:", user?.role);
  // console.log("isLoading:", isLoading);
  // console.log("error:", error);
  // console.log("=== END RAW USER DATA DEBUG (USER PROFILE) ===");

  // Transform user data to ProfileData format
  const userProfileData: ProfileData | null = user
    ? {
        id: (user as any).id,
        name: (user as any).name,
        email: (user as any).email,
        role: (user as any).role?.toLowerCase() as
          | "user"
          | "vendor"
          | "salesman",
        status: (user as any).status as
          | "ACTIVE"
          | "PENDING"
          | "INACTIVE"
          | "SUSPENDED"
          | "VERIFIED",
        isEmailVerified: (user as any).isEmailVerified || false,
        phone: (user as any).phone || "",
        address: (user as any).address || "",
        avatar: (user as any).avatar,
      }
    : null;

  const handleSwitchToVendor = async () => {
    // Check if user is verified
    if (
      userProfileData?.status === "PENDING" ||
      !userProfileData?.isEmailVerified
    ) {
      Alert.alert(
        "Verification Required",
        "Please complete your email verification before switching roles. Check your email for the OTP code.",
        [
          {
            text: "OK",
            style: "default",
          },
        ]
      );
      return;
    }

    try {
      Alert.alert(
        "Switch to Vendor",
        "Are you sure you want to switch to Vendor role? This will change your dashboard and available features.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Switch",
            onPress: async () => {
              try {
                setIsSwitchingRole(true);
                console.log("Switching to VENDOR role");
                await switchRole("VENDOR");

                // Invalidate React Query cache to get fresh user data
                console.log("Invalidating user cache after role switch");
                queryClient.invalidateQueries({ queryKey: ["user"] });
              } catch (error) {
                console.error("Role switch error:", error);
                Alert.alert(
                  "Error",
                  "Failed to switch role. Please try again."
                );
              } finally {
                setIsSwitchingRole(false);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Role switch error:", error);
      Alert.alert("Error", "Failed to switch role. Please try again.");
    }
  };

  // Role switch option
  const roleSwitchOption: SettingItem | undefined =
    userProfileData?.role === "user"
      ? {
          id: "switch-to-vendor",
          title: isSwitchingRole ? "Switching..." : "Switch to Vendor",
          description: isSwitchingRole
            ? "Please wait..."
            : "Change your role to vendor",
          icon: "swap-horizontal",
          iconColor: isSwitchingRole
            ? COLORS.neutral[400]
            : COLORS.primary[600],
          iconBackground: isSwitchingRole
            ? COLORS.neutral[100]
            : COLORS.primary[100],
          onPress: isSwitchingRole ? () => {} : handleSwitchToVendor,
        }
      : undefined;

  const handleEditProfile = () => {
    // Navigate to edit profile screen based on current user role
    const currentRole = user?.role?.toLowerCase();
    console.log("=== EDIT PROFILE DEBUG (USER SCREEN) ===");
    console.log("Raw user data:", user);
    console.log("User role:", user?.role);
    console.log("Current role (lowercase):", currentRole);
    console.log("isLoading:", isLoading);
    console.log("=== END EDIT PROFILE DEBUG ===");

    // Force navigation based on actual role from user data
    if (currentRole === "vendor") {
      console.log("FORCE: Navigating to VENDOR edit profile");
      router.push("/(dashboard)/(vendor)/edit-profile");
    } else if (currentRole === "salesman") {
      console.log("FORCE: Navigating to SALESMAN edit profile");
      router.push("/(dashboard)/(salesman)/edit-profile");
    } else {
      console.log("FORCE: Navigating to USER edit profile (default)");
      router.push("/(dashboard)/(user)/edit-profile");
    }
  };

  // User-specific settings
  const userSettings: SettingItem[] = [
    {
      id: "personal-details",
      title: "Personal Details",
      description: "Update your personal information",
      icon: "person",
      iconColor: COLORS.warning[600],
      iconBackground: COLORS.warning[100],
      onPress: handleEditProfile,
    },
    {
      id: "saved-lists",
      title: "My Saved Lists",
      description: "Organize your favorite places",
      icon: "bookmark",
      iconColor: COLORS.purple[600],
      iconBackground: COLORS.purple[100],
      onPress: () => {
        // TODO: Navigate to saved lists screen
        console.log("Saved lists pressed");
      },
    },
    {
      id: "notifications",
      title: "Notifications",
      description: "Manage your notification preferences",
      icon: "notifications",
      iconColor: COLORS.info[600],
      iconBackground: COLORS.info[100],
      onPress: () => {
        // TODO: Navigate to notifications settings
        console.log("Notifications pressed");
      },
    },
    {
      id: "privacy-security",
      title: "Privacy & Security",
      description: "Control your privacy settings",
      icon: "shield-checkmark",
      iconColor: COLORS.success[600],
      iconBackground: COLORS.success[100],
      onPress: () => {
        // TODO: Navigate to privacy settings screen
        console.log("Privacy & security pressed");
      },
    },
    {
      id: "about-app",
      title: "About App",
      description: "Manage your payment options",
      icon: "information-circle",
      iconColor: COLORS.info[600],
      iconBackground: COLORS.info[100],
      onPress: () => {
        // TODO: Navigate to about app screen
        console.log("About app pressed");
      },
    },
  ];

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      // Call backend logout API first
      console.log("Calling backend logout API");
      const { authService } = await import("../../../services/auth");
      await authService.logout();

      // Only proceed if API call was successful
      console.log("Backend logout successful, proceeding with cleanup");

      // Clear React Query cache
      console.log("Clearing React Query cache after API logout");
      queryClient.clear();

      // Navigate to role selection only after successful API response
      console.log("Navigating to role selection");
      router.replace("/(auth)/role-selection");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if API call fails, clear local data and navigate
      console.log("API logout failed, clearing local data anyway");
      queryClient.clear();
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Show loading state or return early if no profile data
  if (isLoading || !userProfileData) {
    return (
      <ProfileScreen
        profileData={{
          id: "loading",
          name: "Loading...",
          email: "loading@example.com",
          role: "user",
          status: "PENDING",
          isEmailVerified: false,
        }}
        settings={[]}
        onEditProfile={() => {}}
        onLogout={() => {}}
        title="Manage Account"
        roleSwitchOption={undefined}
      />
    );
  }

  return (
    <ProfileScreen
      profileData={userProfileData}
      settings={userSettings}
      onEditProfile={handleEditProfile}
      onLogout={handleLogout}
      title="Manage Account"
      roleSwitchOption={roleSwitchOption}
      isLoggingOut={isLoggingOut}
    />
  );
}
