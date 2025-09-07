import React from "react";
import { useRouter } from "expo-router";
import { ProfileScreen, ProfileData, SettingItem } from "../../../components";
import { COLORS } from "../../../constants";

export default function VendorProfileScreen() {
  const router = useRouter();

  // Mock vendor profile data
  const vendorProfileData: ProfileData = {
    id: "1",
    name: "John Doe",
    email: "vendor@example.com",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format",
    role: "vendor",
    businessName: "Spa & Wellness Center",
    verificationStatus: "verified",
    phone: "+1 234 567 8900",
    address: "123 Business St, City, State 12345",
  };

  // Vendor-specific settings
  const vendorSettings: SettingItem[] = [
    {
      id: "edit-business-profile",
      title: "Edit Business Profile",
      icon: "business",
      iconColor: COLORS.primary[300],
      iconBackground: COLORS.primary[100],
      onPress: () => {
        // TODO: Navigate to edit business profile screen
        console.log("Edit business profile pressed");
      },
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
      profileData={vendorProfileData}
      settings={vendorSettings}
      additionalSettings={additionalSettings}
      onEditProfile={handleEditProfile}
      onLogout={handleLogout}
      title="Business Profile"
    />
  );
}
