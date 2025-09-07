import React from "react";
import { useRouter } from "expo-router";
import { ProfileScreen, ProfileData, SettingItem } from "../../../components";
import { COLORS } from "../../../constants";

export default function UserProfileScreen() {
  const router = useRouter();

  // Mock user profile data
  const userProfileData: ProfileData = {
    id: "1",
    name: "John Doe",
    email: "johndoe@gmail.com",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format",
    role: "user",
    phone: "+1 234 567 8900",
    address: "123 Main St, City, State 12345",
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
      onPress: () => {
        // TODO: Navigate to edit profile screen
        console.log("Personal details pressed");
      },
    },
    {
      id: "saved-lists",
      title: "My Saved Lists",
      description: "Organize your favorite places",
      icon: "notifications",
      iconColor: COLORS.info[600],
      iconBackground: COLORS.info[100],
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
      icon: "search",
      iconColor: COLORS.info[600],
      iconBackground: COLORS.info[100],
      onPress: () => {
        // TODO: Navigate to about app screen
        console.log("About app pressed");
      },
    },
  ];

  const handleEditProfile = () => {
    // TODO: Navigate to edit profile screen
    console.log("Edit profile pressed");
  };

  const handleLogout = () => {
    // TODO: Implement logout functionality
    console.log("Logout pressed");
  };

  return (
    <ProfileScreen
      profileData={userProfileData}
      settings={userSettings}
      onEditProfile={handleEditProfile}
      onLogout={handleLogout}
      title="Manage Account"
    />
  );
}
