import React, { useState, useEffect } from "react";
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
  COLORS,
  FONT_SIZE,
  MARGIN,
  PADDING,
  SPACING,
  BORDER_RADIUS,
} from "../../../constants";
import {
  ResponsiveText,
  ResponsiveCard,
  GlobalStatusBar,
  VendorMetricsCards,
  RecentEnquiries,
  LatestReviews,
  UserProfileButton,
  ReviewDetailsModal,
} from "../../../components";
import { userService, UserProfile } from "../../../services/user";
import { useUser } from "../../../hooks/useUser";

export default function VendorDashboardScreen() {
  console.log("VendorDashboardScreen: Component rendering");
  const router = useRouter();
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Use React Query to fetch user data
  const { data: user, isLoading: isLoadingUser, error } = useUser();

  // Handle profile button press
  const handleProfilePress = () => {
    router.push("/(dashboard)/(vendor)/profile");
  };

  // Mock data for vendor metrics
  const vendorMetrics = [
    {
      id: "1",
      title: "My Listing",
      value: "24",
      growth: "8%",
      icon: "list",
      color: "#8B5CF6", // Purple
    },
    {
      id: "2",
      title: "Enquiries",
      value: "47",
      growth: "15%",
      icon: "chatbubble",
      color: "#F59E0B", // Yellow
    },
    {
      id: "3",
      title: "Total reviews",
      value: "156",
      growth: "12%",
      icon: "star",
      color: "#F97316", // Orange
    },
    {
      id: "4",
      title: "Your Promotions",
      value: "3",
      growth: "1%",
      icon: "megaphone",
      color: "#3B82F6", // Blue
    },
  ];

  // Mock data for recent enquiries
  const recentEnquiries = [
    {
      id: "1",
      name: "Jay Johnson",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format",
      status: "new" as const,
      timestamp: "2 hours ago",
      subject: "Re: Swedish massage",
      message:
        "Hi! I would like to book a Swedish massage for this weekend. Are you available on Saturday afternoon?",
    },
    {
      id: "2",
      name: "John Snow",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format",
      status: "replied" as const,
      timestamp: "5 hours ago",
      subject: "Re: Hot Stone Therapy",
      message: "What is the duration of the hot stone therapy session?",
    },
    {
      id: "3",
      name: "Sansa Stark",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face&auto=format",
      status: "new" as const,
      timestamp: "1 day ago",
      subject: "Re: Deep Tissue Massage",
      message: "Do you offer deep tissue massage for sports injury recovery?",
    },
  ];

  // Mock data for latest reviews
  const latestReviews = [
    {
      id: "1",
      reviewerName: "Rahul Saini",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format",
      timestamp: "1 day ago",
      rating: 5,
      serviceType: "Swedish Massage",
      message:
        "Great massage therapy session. Very professional staff and clean facilities.",
      helpfulCount: 12,
    },
    {
      id: "2",
      reviewerName: "Sansa Stark",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face&auto=format",
      timestamp: "2 days ago",
      rating: 5,
      serviceType: "Hot Stone Therapy",
      message:
        "Perfect experience from start to finish. Will definitely book again!",
      helpfulCount: 8,
    },
    {
      id: "3",
      reviewerName: "Lisa Smith",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format",
      timestamp: "4 hours ago",
      rating: 5,
      serviceType: "Hydrating Facial",
      message:
        "Amazing service! The facial was incredibly relaxing and my skin feels wonderful. Highly recommend!",
      helpfulCount: 15,
    },
  ];

  return (
    <>
      <GlobalStatusBar />
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
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
                  <Ionicons
                    name="notifications"
                    size={24}
                    color={COLORS.black}
                  />
                </TouchableOpacity>
                <UserProfileButton
                  user={
                    user
                      ? {
                          name: (user as any).name,
                          avatar: (user as any).avatar,
                        }
                      : undefined
                  }
                  size={40}
                  onPress={handleProfilePress}
                />
              </View>
            </View>

            {/* Business Name and Growth Message */}
            <View style={styles.businessInfo}>
              <View style={styles.businessNameContainer}>
                <ResponsiveText
                  variant="h3"
                  weight="bold"
                  color={COLORS.text.primary}
                  style={styles.businessName}
                >
                  Serenity Spa & Wellness!
                </ResponsiveText>
                <ResponsiveText variant="h3" style={styles.celebrationEmoji}>
                  🎉
                </ResponsiveText>
              </View>
              <View style={styles.growthMessage}>
                <Ionicons
                  name="trending-up"
                  size={16}
                  color={COLORS.success[500]}
                />
                <ResponsiveText
                  variant="body2"
                  color={COLORS.text.secondary}
                  style={styles.growthText}
                >
                  Your business is growing up!
                </ResponsiveText>
              </View>
            </View>
          </LinearGradient>

          {/* Main Content */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Metrics Cards Grid */}
            <VendorMetricsCards
              metrics={vendorMetrics}
              onMetricPress={(metric) => {
                if (metric.id === "1") {
                  // Navigate to My List screen when "My Listing" card is pressed
                  router.push("/(dashboard)/(vendor)/my-list");
                } else if (metric.id === "4") {
                  // Navigate to My Promotions screen when "Your Promotions" card is pressed
                  router.push("/(dashboard)/(vendor)/my-promotions");
                }
              }}
            />

            {/* Recent Enquiries */}
            <RecentEnquiries
              enquiries={recentEnquiries}
              onViewAll={() => router.push("/(dashboard)/(vendor)/enquiries")}
              onEnquiryPress={(enquiry) => {
                // Handle enquiry press - could navigate to enquiry details
                console.log("Enquiry pressed:", enquiry);
              }}
            />

            {/* Latest Reviews */}
            <LatestReviews
              reviews={latestReviews}
              onViewAll={() => router.push("/(dashboard)/(vendor)/reviews")}
              onReviewPress={(review) => {
                setSelectedReview(review);
                setIsModalVisible(true);
              }}
              onHelpful={(review) => {
                // Handle helpful action
                console.log("Helpful pressed for review:", review.id);
              }}
            />

            {/* Bottom Spacing */}
            <View style={styles.bottomSpacing} />
          </ScrollView>
        </View>

        {/* Review Detail Modal */}
        <ReviewDetailsModal
          visible={isModalVisible}
          review={selectedReview}
          onClose={() => setIsModalVisible(false)}
        />
      </SafeAreaView>
    </>
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
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
  },
  businessInfo: {
    paddingHorizontal: PADDING.screen,
    marginTop: MARGIN.sm,
  },
  businessNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: MARGIN.sm,
  },
  businessName: {
    flex: 1,
  },
  celebrationEmoji: {
    marginLeft: MARGIN.sm,
  },
  growthMessage: {
    flexDirection: "row",
    alignItems: "center",
    gap: MARGIN.xs,
  },
  growthText: {
    marginLeft: MARGIN.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: PADDING.screen,
  },
  bottomSpacing: {
    height: 100,
  },
  bottomNavigation: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    paddingVertical: PADDING.sm,
    paddingHorizontal: PADDING.screen,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
    justifyContent: "space-around",
    alignItems: "center",
  },
  navItem: {
    alignItems: "center",
    paddingVertical: PADDING.xs,
    paddingHorizontal: PADDING.sm,
    flex: 1,
  },
  activeNavItem: {
    // Active state styling is handled by icon and text colors
  },
});
