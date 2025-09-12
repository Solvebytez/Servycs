import React, { useState } from "react";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { ProfileScreen, ProfileData, SettingItem } from "../../../components";
import { COLORS } from "../../../constants";
import { logout, switchRole } from "../../../utils/authUtils";
import { useUser } from "../../../hooks/useUser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";

export default function VendorProfileScreen() {
  const router = useRouter();
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const queryClient = useQueryClient();

  // Use React Query to fetch user data
  const { data: user, isLoading, error } = useUser();

  // Debug raw user data (only when needed)
  // console.log("=== RAW USER DATA DEBUG ===");
  // console.log("user:", user);
  // console.log("user?.role:", user?.role);
  // console.log("isLoading:", isLoading);
  // console.log("error:", error);
  // console.log("=== END RAW USER DATA DEBUG ===");

  // Transform user data to ProfileData format
  const vendorProfileData: ProfileData | null = user
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
        businessName: "Business Name", // You might want to get this from user data too
        avatar: (user as any).avatar,
      }
    : null;

  const handleSwitchToUser = async () => {
    try {
      Alert.alert(
        "Switch to User",
        "Are you sure you want to switch to User role? This will change your dashboard and available features.",
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
                await switchRole("USER");

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
    vendorProfileData?.role === "vendor"
      ? {
          id: "switch-to-user",
          title: isSwitchingRole ? "Switching..." : "Switch to User",
          description: isSwitchingRole
            ? "Please wait..."
            : "Change your role to user",
          icon: "swap-horizontal",
          iconColor: isSwitchingRole
            ? COLORS.neutral[400]
            : COLORS.warning[600],
          iconBackground: isSwitchingRole
            ? COLORS.neutral[100]
            : COLORS.warning[100],
          onPress: isSwitchingRole ? () => {} : handleSwitchToUser,
        }
      : undefined;

  const handleEditProfile = () => {
    // Navigate to edit profile screen based on current user role
    const currentRole = user?.role?.toLowerCase();
    console.log("Edit profile pressed, current role:", currentRole);

    switch (currentRole) {
      case "vendor":
        router.push("/(dashboard)/(vendor)/edit-profile");
        break;
      case "salesman":
        router.push("/(dashboard)/(salesman)/edit-profile");
        break;
      case "user":
      default:
        router.push("/(dashboard)/(user)/edit-profile");
        break;
    }
  };

  // Vendor-specific settings
  const vendorSettings: SettingItem[] = [
    {
      id: "edit-business-profile",
      title: "Edit Business Profile",
      icon: "business",
      iconColor: COLORS.primary[300],
      iconBackground: COLORS.primary[100],
      onPress: handleEditProfile,
    },
    {
      id: "business-hours",
      title: "Business Hours",
      icon: "time",
      iconColor: COLORS.warning[500],
      iconBackground: COLORS.warning[100],
      onPress: () => {
        // TODO: Navigate to business hours screen
        console.log("Business hours pressed");
      },
    },
    {
      id: "location-address",
      title: "Location & Address",
      icon: "location",
      iconColor: COLORS.primary[300],
      iconBackground: COLORS.primary[100],
      onPress: () => {
        // TODO: Navigate to location & address screen
        console.log("Location & address pressed");
      },
    },
    {
      id: "change-password",
      title: "Change Password",
      icon: "lock-closed",
      iconColor: COLORS.neutral[500],
      iconBackground: COLORS.neutral[100],
      onPress: () => {
        // TODO: Navigate to change password screen
        console.log("Change password pressed");
      },
    },
  ];

  // Additional settings for vendors
  const additionalSettings: SettingItem[] = [
    {
      id: "notifications",
      title: "Notifications",
      icon: "notifications",
      iconColor: COLORS.neutral[500],
      iconBackground: COLORS.neutral[100],
      onPress: () => {
        // TODO: Navigate to notifications settings
        console.log("Notifications pressed");
      },
    },
    {
      id: "help-support",
      title: "Help & Support",
      icon: "help-circle",
      iconColor: COLORS.neutral[500],
      iconBackground: COLORS.neutral[100],
      onPress: () => {
        // TODO: Navigate to help & support
        console.log("Help & Support pressed");
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
  if (isLoading || !vendorProfileData) {
    return (
      <ProfileScreen
        profileData={{
          id: "loading",
          name: "Loading...",
          email: "loading@example.com",
          role: "vendor",
          status: "PENDING",
          isEmailVerified: false,
        }}
        settings={[]}
        onEditProfile={() => {}}
        onLogout={() => {}}
        title="Business Profile"
        roleSwitchOption={undefined}
      />
    );
  }

  return (
    <ProfileScreen
      profileData={vendorProfileData}
      settings={vendorSettings}
      additionalSettings={additionalSettings}
      onEditProfile={handleEditProfile}
      onLogout={handleLogout}
      title="Business Profile"
      roleSwitchOption={roleSwitchOption}
      isLoggingOut={isLoggingOut}
    />
  );
}
