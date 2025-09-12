import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ResponsiveText,
  ResponsiveCard,
  GlobalStatusBar,
  ResponsiveButton,
  BackButton,
} from "@/components";
import {
  COLORS,
  FONT_SIZE,
  MARGIN,
  PADDING,
  BORDER_RADIUS,
} from "../../../constants";

// Profile data interface
export interface ProfileData {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "user" | "vendor" | "salesman";
  status?: "ACTIVE" | "PENDING" | "INACTIVE" | "SUSPENDED" | "VERIFIED";
  isEmailVerified?: boolean;
  businessName?: string; // For vendor/salesman
  phone?: string;
  address?: string;
}

// Settings menu item interface
export interface SettingItem {
  id: string;
  title: string;
  description?: string;
  icon: string;
  iconColor: string;
  iconBackground: string;
  onPress: () => void;
}

// Profile screen props
export interface ProfileScreenProps {
  profileData: ProfileData;
  settings: SettingItem[];
  additionalSettings?: SettingItem[];
  onEditProfile: () => void;
  onLogout: () => void;
  onEditAvatar?: () => void;
  title?: string;
  roleSwitchOption?: SettingItem;
  isLoggingOut?: boolean;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  profileData,
  settings = [],
  additionalSettings = [],
  onEditProfile,
  onLogout,
  onEditAvatar,
  title = "Manage Account",
  roleSwitchOption,
  isLoggingOut = false,
}) => {
  const router = useRouter();

  // Debug logging
  console.log("ProfileScreen render - profileData:", profileData);
  console.log(
    "ProfileScreen render - profileData.avatar:",
    profileData?.avatar
  );
  console.log("ProfileScreen render - roleSwitchOption:", roleSwitchOption);
  console.log("ProfileScreen render - settings:", settings);
  console.log("ProfileScreen render - additionalSettings:", additionalSettings);
  console.log("ProfileScreen render - onEditProfile:", onEditProfile);
  console.log("ProfileScreen render - onLogout:", onLogout);
  console.log("ProfileScreen render - title:", title);

  // Safety check for profileData
  if (!profileData) {
    console.log("ProfileScreen: profileData is null/undefined, returning null");
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <GlobalStatusBar />

      <LinearGradient
        colors={[COLORS.primary[200], COLORS.primary[200]]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        {/* Top Navigation */}
        <View style={styles.topNavigation}>
          <BackButton
            onPress={() => router.back()}
            variant="default"
            size="medium"
            showText={false}
            showIcon={true}
            iconName="arrow-back"
          />
          <TouchableOpacity style={styles.helpButton}>
            <Ionicons
              name="help-circle"
              size={24}
              color={COLORS.text.primary}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header with Gradient Background */}
        <LinearGradient
          colors={[COLORS.primary[200], COLORS.primary[50], "#fff"]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          {/* Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              {profileData.avatar ? (
                <Image
                  source={{ uri: profileData.avatar }}
                  style={styles.avatar}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <ResponsiveText
                    variant="h2"
                    weight="bold"
                    color={COLORS.text.primary}
                  >
                    {profileData.name &&
                    typeof profileData.name === "string" &&
                    profileData.name.trim()
                      ? profileData.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                      : "U"}
                  </ResponsiveText>
                </View>
              )}
            </View>

            <ResponsiveText
              variant="h4"
              weight="bold"
              color={COLORS.black}
              style={styles.userName}
            >
              {profileData.name && typeof profileData.name === "string"
                ? profileData.name
                : "User"}
            </ResponsiveText>

            <ResponsiveText
              variant="body2"
              color={COLORS.text.secondary}
              style={styles.userEmail}
            >
              {profileData.email && typeof profileData.email === "string"
                ? profileData.email
                : "user@example.com"}
            </ResponsiveText>

            {/* Status Badge based on database status and email verification */}
            {profileData.status && typeof profileData.status === "string" && (
              <View
                style={[
                  styles.verificationBadge,
                  {
                    backgroundColor:
                      profileData.status === "ACTIVE" &&
                      profileData.isEmailVerified
                        ? COLORS.success[100]
                        : profileData.status === "PENDING" ||
                          !profileData.isEmailVerified
                        ? COLORS.warning[100]
                        : COLORS.error[100],
                    borderColor:
                      profileData.status === "ACTIVE" &&
                      profileData.isEmailVerified
                        ? COLORS.success[300]
                        : profileData.status === "PENDING" ||
                          !profileData.isEmailVerified
                        ? COLORS.warning[300]
                        : COLORS.error[300],
                  },
                ]}
              >
                <ResponsiveText
                  variant="caption2"
                  weight="medium"
                  color={
                    profileData.status === "ACTIVE" &&
                    profileData.isEmailVerified
                      ? COLORS.success[700]
                      : profileData.status === "PENDING" ||
                        !profileData.isEmailVerified
                      ? COLORS.warning[700]
                      : COLORS.error[700]
                  }
                  style={styles.verificationBadgeText}
                >
                  {profileData.status === "ACTIVE" &&
                  profileData.isEmailVerified
                    ? "✓ Active"
                    : profileData.status === "PENDING" ||
                      !profileData.isEmailVerified
                    ? "⏳ Pending"
                    : profileData.status === "INACTIVE"
                    ? "✗ Inactive"
                    : profileData.status === "SUSPENDED"
                    ? "⚠ Suspended"
                    : "❓ Unknown"}
                </ResponsiveText>
              </View>
            )}
          </View>
        </LinearGradient>

        {/* Role Switch Option */}
        {roleSwitchOption &&
          roleSwitchOption.title &&
          roleSwitchOption.onPress && (
            <View style={styles.settingsSection}>
              <ResponsiveText
                variant="h4"
                weight="bold"
                color={COLORS.primary[300]}
                style={styles.sectionTitle}
              >
                Switch Role
              </ResponsiveText>
              <View style={styles.settingsContainer}>
                <TouchableOpacity
                  style={styles.settingCard}
                  onPress={roleSwitchOption.onPress}
                  activeOpacity={0.7}
                >
                  <View style={styles.settingLeft}>
                    <View
                      style={[
                        styles.settingIcon,
                        {
                          backgroundColor:
                            roleSwitchOption.iconBackground ||
                            COLORS.primary[100],
                        },
                      ]}
                    >
                      <Ionicons
                        name={roleSwitchOption.icon as any}
                        size={24}
                        color={
                          roleSwitchOption.iconColor || COLORS.primary[600]
                        }
                      />
                    </View>
                    <View style={styles.settingTextContainer}>
                      <ResponsiveText
                        variant="body2"
                        weight="semiBold"
                        color={COLORS.text.primary}
                      >
                        {roleSwitchOption.title}
                      </ResponsiveText>
                      {roleSwitchOption.description && (
                        <ResponsiveText
                          variant="caption2"
                          color={COLORS.text.secondary}
                          style={styles.settingDescription}
                        >
                          {roleSwitchOption.description}
                        </ResponsiveText>
                      )}
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={COLORS.text.secondary}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}

        {/* Manage Account Section */}
        <View style={styles.settingsSection}>
          <ResponsiveText
            variant="h4"
            weight="bold"
            color={COLORS.primary[300]}
            style={styles.sectionTitle}
          >
            Manage Account
          </ResponsiveText>

          <View style={styles.settingsContainer}>
            {/* Personal Details */}
            <TouchableOpacity
              style={styles.settingCard}
              onPress={() => {
                // Navigate to role-specific edit profile screen
                if (profileData.role && typeof profileData.role === "string") {
                  if (profileData.role === "vendor") {
                    router.push("/(dashboard)/(vendor)/edit-profile");
                  } else if (profileData.role === "user") {
                    router.push("/(dashboard)/(user)/edit-profile");
                  } else if (profileData.role === "salesman") {
                    router.push("/(dashboard)/(salesman)/edit-profile");
                  } else {
                    // For other roles, default to user edit profile
                    router.push("/(dashboard)/(user)/edit-profile");
                  }
                }
              }}
            >
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.settingIcon,
                    { backgroundColor: COLORS.warning[100] },
                  ]}
                >
                  <Ionicons
                    name="person"
                    size={20}
                    color={COLORS.warning[600]}
                  />
                </View>
                <View style={styles.settingTextContainer}>
                  <ResponsiveText
                    variant="body2"
                    weight="bold"
                    color={COLORS.text.primary}
                  >
                    Edit Personal Details
                  </ResponsiveText>
                  <ResponsiveText
                    variant="caption2"
                    color={COLORS.text.secondary}
                    style={styles.settingDescription}
                  >
                    Update your personal information
                  </ResponsiveText>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.text.secondary}
              />
            </TouchableOpacity>

            {/* My Saved Lists - Hide for vendors */}
            {profileData.role !== "vendor" && (
              <TouchableOpacity
                style={styles.settingCard}
                onPress={() => console.log("My saved lists pressed")}
              >
                <View style={styles.settingLeft}>
                  <View
                    style={[
                      styles.settingIcon,
                      { backgroundColor: COLORS.purple[100] },
                    ]}
                  >
                    <Ionicons
                      name="bookmark"
                      size={20}
                      color={COLORS.purple[600]}
                    />
                  </View>
                  <View style={styles.settingTextContainer}>
                    <ResponsiveText
                      variant="body2"
                      weight="bold"
                      color={COLORS.text.primary}
                    >
                      My Saved Lists
                    </ResponsiveText>
                    <ResponsiveText
                      variant="caption2"
                      color={COLORS.text.secondary}
                      style={styles.settingDescription}
                    >
                      Organize your favorite places
                    </ResponsiveText>
                  </View>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={COLORS.text.secondary}
                />
              </TouchableOpacity>
            )}

            {/* Notifications */}
            <TouchableOpacity
              style={styles.settingCard}
              onPress={() => console.log("Notifications pressed")}
            >
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.settingIcon,
                    { backgroundColor: COLORS.info[100] },
                  ]}
                >
                  <Ionicons
                    name="notifications"
                    size={20}
                    color={COLORS.info[600]}
                  />
                </View>
                <View style={styles.settingTextContainer}>
                  <ResponsiveText
                    variant="body2"
                    weight="bold"
                    color={COLORS.text.primary}
                  >
                    Notifications
                  </ResponsiveText>
                  <ResponsiveText
                    variant="caption2"
                    color={COLORS.text.secondary}
                    style={styles.settingDescription}
                  >
                    Manage your notification preferences
                  </ResponsiveText>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.text.secondary}
              />
            </TouchableOpacity>

            {/* Privacy & Security */}
            <TouchableOpacity
              style={styles.settingCard}
              onPress={() => console.log("Privacy & security pressed")}
            >
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.settingIcon,
                    { backgroundColor: COLORS.success[100] },
                  ]}
                >
                  <Ionicons
                    name="shield-checkmark"
                    size={20}
                    color={COLORS.success[600]}
                  />
                </View>
                <View style={styles.settingTextContainer}>
                  <ResponsiveText
                    variant="body2"
                    weight="bold"
                    color={COLORS.text.primary}
                  >
                    Privacy & Security
                  </ResponsiveText>
                  <ResponsiveText
                    variant="caption2"
                    color={COLORS.text.secondary}
                    style={styles.settingDescription}
                  >
                    Control your privacy settings
                  </ResponsiveText>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.text.secondary}
              />
            </TouchableOpacity>

            {/* About App */}
            <TouchableOpacity
              style={styles.settingCard}
              onPress={() => console.log("About app pressed")}
            >
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.settingIcon,
                    { backgroundColor: COLORS.info[100] },
                  ]}
                >
                  <Ionicons name="search" size={20} color={COLORS.info[600]} />
                </View>
                <View style={styles.settingTextContainer}>
                  <ResponsiveText
                    variant="body2"
                    weight="bold"
                    color={COLORS.text.primary}
                  >
                    About App
                  </ResponsiveText>
                  <ResponsiveText
                    variant="caption2"
                    color={COLORS.text.secondary}
                    style={styles.settingDescription}
                  >
                    Manage your payment options
                  </ResponsiveText>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.text.secondary}
              />
            </TouchableOpacity>

            {/* Help & Support */}
            <TouchableOpacity
              style={styles.settingCard}
              onPress={() => console.log("Help & Support pressed")}
            >
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.settingIcon,
                    { backgroundColor: COLORS.neutral[100] },
                  ]}
                >
                  <Ionicons
                    name="help-circle"
                    size={20}
                    color={COLORS.neutral[500]}
                  />
                </View>
                <View style={styles.settingTextContainer}>
                  <ResponsiveText
                    variant="body2"
                    weight="bold"
                    color={COLORS.text.primary}
                  >
                    Help & Support
                  </ResponsiveText>
                  <ResponsiveText
                    variant="caption2"
                    color={COLORS.text.secondary}
                    style={styles.settingDescription}
                  >
                    Get assistance and find answers
                  </ResponsiveText>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.text.secondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <ResponsiveButton
            title={isLoggingOut ? "Logging out..." : "Logout"}
            variant="outline"
            size="large"
            fullWidth
            onPress={onLogout}
            loading={isLoggingOut}
            disabled={isLoggingOut}
            leftIcon={
              !isLoggingOut && (
                <Ionicons name="log-out" size={20} color={COLORS.error[500]} />
              )
            }
            style={styles.logoutButton}
            textStyle={styles.logoutButtonText}
          />
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  headerGradient: {
    paddingBottom: MARGIN.xl - 18,
  },
  topNavigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: PADDING.lg,
    paddingTop: MARGIN.md - 6,
    paddingBottom: MARGIN.xs - 16,
  },
  helpButton: {
    width: 30,
    height: 30,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  profileSection: {
    alignItems: "center",
    paddingHorizontal: PADDING.lg,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: MARGIN.lg,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary[100],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  userName: {
    marginBottom: MARGIN.xs,
    textAlign: "center",
  },
  userEmail: {
    textAlign: "center",
    marginBottom: MARGIN.sm,
  },
  verificationBadge: {
    paddingHorizontal: PADDING.md,
    paddingVertical: PADDING.xs,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
  },
  verificationBadgeText: {
    fontSize: FONT_SIZE.caption1, // Increase back to caption1 size
  },
  settingsSection: {
    marginHorizontal: PADDING.lg,
    marginTop: MARGIN.lg,
    marginBottom: MARGIN.xl,
  },
  additionalSection: {
    marginHorizontal: PADDING.lg,
    marginBottom: MARGIN.xl,
  },
  sectionTitle: {
    marginBottom: MARGIN.lg,
  },
  settingsContainer: {
    gap: MARGIN.md,
  },
  settingCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.black,
    paddingHorizontal: PADDING.lg,
    paddingVertical: PADDING.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.xl,
    justifyContent: "center",
    alignItems: "center",
    marginRight: MARGIN.md,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingDescription: {
    marginTop: MARGIN.xs,
  },
  logoutSection: {
    marginHorizontal: PADDING.lg,
    marginBottom: MARGIN.xl,
  },
  logoutButton: {
    borderColor: COLORS.error[500],
    borderWidth: 1,
    backgroundColor: COLORS.background.primary,
    minHeight: 50, // Ensure minimum height
    paddingVertical: PADDING.md, // Add vertical padding
  },
  logoutButtonText: {
    color: COLORS.error[500],
    fontSize: FONT_SIZE.h4,
    lineHeight: FONT_SIZE.h4 * 1.4, // Ensure proper line height
  },
  bottomSpacing: {
    height: 100,
  },
});

export default ProfileScreen;
