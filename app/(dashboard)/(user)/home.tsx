import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  COLORS,
  FONT_SIZE,
  MARGIN,
  PADDING,
  SPACING,
  BORDER_RADIUS,
} from "../../../constants";
import { ResponsiveText, ResponsiveCard, GlobalStatusBar } from "@/components";
import { useUser } from "../../../hooks/useUser";

export default function UserHomeScreen() {
  console.log("UserHomeScreen: Component rendering");

  // Use React Query to fetch user data
  const { data: user, isLoading, error } = useUser();

  // Mock data for favorite services
  const favoriteServices = [
    {
      id: "1",
      title: "Health & Care",
      image: require("../../../assets/user.png"),
      color: "#4CAF50",
    },
    {
      id: "2",
      title: "Fitness",
      image: require("../../../assets/businessman.png"),
      color: "#FF9800",
    },
    {
      id: "3",
      title: "Travel",
      image: require("../../../assets/user-laptop.png"),
      color: "#2196F3",
    },
  ];

  // Mock data for service categories
  const serviceCategories = [
    { id: "1", title: "Loans", icon: "wallet", color: "#20B2AA" },
    { id: "2", title: "Doctors", icon: "medical", color: "#20B2AA" },
    { id: "3", title: "Travel", icon: "airplane", color: "#87CEEB" },
    { id: "4", title: "Beauty", icon: "person", color: "#87CEEB" },
    { id: "5", title: "Gyms", icon: "fitness", color: "#9370DB" },
    {
      id: "6",
      title: "Repairs & Services",
      icon: "construct",
      color: "#FFA500",
    },
  ];

  // Debug arrays
  console.log("UserHomeScreen: favoriteServices:", favoriteServices);
  console.log("UserHomeScreen: serviceCategories:", serviceCategories);

  const handleSearchPress = () => {
    router.push("/(dashboard)/(user)/search");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <GlobalStatusBar />
      <View style={styles.container}>
        {/* Header Section with Gradient */}
        <LinearGradient
          colors={[COLORS.primary[200], COLORS.primary[50], "#fff"]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          {/* Logo and Icons */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image
                source={require("../../../assets/logo.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="notifications" size={24} color={COLORS.black} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.profileButton}
                onPress={() => {
                  console.log(
                    "UserHomeScreen: Profile button clicked, navigating to profile"
                  );
                  router.push("/(dashboard)/(user)/profile");
                }}
              >
                {user?.avatar ? (
                  <Image
                    source={{ uri: (user as any).avatar }}
                    style={styles.profileImage}
                    resizeMode="cover"
                  />
                ) : (
                  <ResponsiveText
                    variant="buttonSmall"
                    weight="bold"
                    color={COLORS.black}
                  >
                    {(user as any)?.name
                      ? (user as any).name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()
                      : "U"}
                  </ResponsiveText>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <TouchableOpacity
              style={styles.searchBar}
              onPress={handleSearchPress}
            >
              <Ionicons
                name="search"
                size={20}
                color={COLORS.text.light}
                style={styles.searchIcon}
              />
              <ResponsiveText variant="body2" color={COLORS.text.light}>
                Search & Shop Anywhere
              </ResponsiveText>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Main Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* My Favorite Services Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ResponsiveText
                variant="h4"
                weight="bold"
                color={COLORS.text.primary}
              >
                My Favorite Services
              </ResponsiveText>
              <TouchableOpacity>
                <ResponsiveText variant="body2" color={COLORS.text.secondary}>
                  See more
                </ResponsiveText>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.favoriteServicesContainer}
            >
              {favoriteServices.map((service) => {
                console.log(
                  "UserHomeScreen: Mapping favorite service:",
                  service
                );
                return (
                  <TouchableOpacity
                    key={service.id}
                    style={styles.favoriteServiceCard}
                  >
                    <View style={styles.serviceImageContainer}>
                      <Image
                        source={service.image}
                        style={styles.serviceImage}
                        resizeMode="cover"
                      />
                      <View
                        style={[
                          styles.serviceOverlay,
                          { backgroundColor: service.color },
                        ]}
                      >
                        <ResponsiveText
                          variant="body2"
                          weight="bold"
                          color={COLORS.white}
                        >
                          {service.title}
                        </ResponsiveText>
                      </View>
                    </View>
                    <ResponsiveText
                      variant="caption1"
                      weight="medium"
                      color={COLORS.text.primary}
                      style={styles.serviceTitle}
                    >
                      {service.title}
                    </ResponsiveText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Service Categories Grid */}
          <View style={styles.section}>
            <View style={styles.categoriesGrid}>
              {serviceCategories.map((category) => {
                console.log(
                  "UserHomeScreen: Mapping service category:",
                  category
                );
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={styles.categoryItem}
                  >
                    <View
                      style={[
                        styles.categoryIcon,
                        { backgroundColor: category.color },
                      ]}
                    >
                      <Ionicons
                        name={category.icon as any}
                        size={24}
                        color={COLORS.white}
                      />
                    </View>
                    <ResponsiveText
                      variant="caption1"
                      weight="medium"
                      color={COLORS.text.primary}
                      style={styles.categoryTitle}
                    >
                      {category.title}
                    </ResponsiveText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* View More Button */}
          <View style={styles.viewMoreContainer}>
            <TouchableOpacity style={styles.viewMoreButton}>
              <ResponsiveText
                variant="body2"
                weight="medium"
                color={COLORS.text.secondary}
              >
                View more
              </ResponsiveText>
              <Ionicons
                name="chevron-down"
                size={16}
                color={COLORS.text.secondary}
              />
            </TouchableOpacity>
          </View>

          {/* Additional Content for Scrolling Test */}
          <View style={styles.section}>
            <ResponsiveText
              variant="h4"
              weight="bold"
              color={COLORS.text.primary}
              style={styles.sectionTitle}
            >
              Recent Activities
            </ResponsiveText>
            <View style={styles.activityItem}>
              <ResponsiveText variant="body2" color={COLORS.text.secondary}>
                • You booked a fitness session yesterday
              </ResponsiveText>
            </View>
            <View style={styles.activityItem}>
              <ResponsiveText variant="body2" color={COLORS.text.secondary}>
                • New travel deals available for you
              </ResponsiveText>
            </View>
            <View style={styles.activityItem}>
              <ResponsiveText variant="body2" color={COLORS.text.secondary}>
                • Health checkup reminder for next week
              </ResponsiveText>
            </View>
          </View>

          <View style={styles.section}>
            <ResponsiveText
              variant="h4"
              weight="bold"
              color={COLORS.text.primary}
              style={styles.sectionTitle}
            >
              App Features
            </ResponsiveText>
            <ResponsiveText
              variant="body2"
              color={COLORS.text.secondary}
              style={styles.featureText}
            >
              Discover amazing services, book appointments, and manage your
              activities all in one place. Our app provides a seamless
              experience for all your needs.
            </ResponsiveText>
          </View>

          <View style={styles.section}>
            <ResponsiveText
              variant="h4"
              weight="bold"
              color={COLORS.text.primary}
              style={styles.sectionTitle}
            >
              Customer Support
            </ResponsiveText>
            <ResponsiveText
              variant="body2"
              color={COLORS.text.secondary}
              style={styles.featureText}
            >
              Need help? Our support team is available 24/7 to assist you with
              any questions or concerns. Contact us through the app or call our
              helpline.
            </ResponsiveText>
          </View>

          <View style={styles.section}>
            <ResponsiveText
              variant="h4"
              weight="bold"
              color={COLORS.text.primary}
              style={styles.sectionTitle}
            >
              Privacy & Security
            </ResponsiveText>
            <ResponsiveText
              variant="body2"
              color={COLORS.text.secondary}
              style={styles.featureText}
            >
              Your privacy and security are our top priorities. All your data is
              encrypted and protected according to industry standards. We never
              share your personal information with third parties.
            </ResponsiveText>
          </View>

          <View style={styles.section}>
            <ResponsiveText
              variant="h4"
              weight="bold"
              color={COLORS.text.primary}
              style={styles.sectionTitle}
            >
              Terms of Service
            </ResponsiveText>
            <ResponsiveText
              variant="body2"
              color={COLORS.text.secondary}
              style={styles.featureText}
            >
              By using this app, you agree to our terms of service and privacy
              policy. Please read them carefully before proceeding with any
              transactions or bookings.
            </ResponsiveText>
          </View>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },

  headerGradient: {
    paddingBottom: MARGIN.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: PADDING.screen,
    paddingTop: MARGIN.md,
  },
  logoContainer: {
    alignItems: "flex-start",
  },
  logoImage: {
    width: 80,
    height: 80,
    tintColor: COLORS.white,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: MARGIN.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  searchContainer: {
    paddingHorizontal: PADDING.screen,
    marginTop: MARGIN.md,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: PADDING.md,
    paddingVertical: PADDING.sm,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 50,
  },
  searchIcon: {
    marginRight: MARGIN.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZE.body2,
    color: COLORS.text.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: PADDING.screen,
  },
  section: {
    marginTop: MARGIN.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: MARGIN.md,
  },
  favoriteServicesContainer: {
    paddingRight: PADDING.screen,
  },
  favoriteServiceCard: {
    width: 120,
    marginRight: MARGIN.md,
  },
  serviceImageContainer: {
    width: 120,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
    overflow: "hidden",
    marginBottom: MARGIN.sm,
    position: "relative",
  },
  serviceImage: {
    width: "100%",
    height: "100%",
  },
  serviceOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: MARGIN.xs,
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.8,
  },
  serviceTitle: {
    textAlign: "center",
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: MARGIN.md,
  },
  categoryItem: {
    width: "30%",
    alignItems: "center",
    marginBottom: MARGIN.md,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: MARGIN.sm,
  },
  categoryTitle: {
    textAlign: "center",
  },
  viewMoreContainer: {
    alignItems: "center",
    marginTop: MARGIN.xl,
    marginBottom: MARGIN.xl,
  },
  viewMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: MARGIN.xs,
  },
  sectionTitle: {
    marginBottom: MARGIN.md,
  },
  activityItem: {
    marginBottom: MARGIN.sm,
  },
  featureText: {
    lineHeight: 22,
  },
  bottomSpacing: {
    height: 100,
  },
});
