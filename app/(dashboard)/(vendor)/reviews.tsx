import React, { useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  COLORS,
  FONT_SIZE,
  MARGIN,
  PADDING,
  BORDER_RADIUS,
} from "../../../constants";
import {
  ResponsiveText,
  ResponsiveCard,
  GlobalStatusBar,
  BackButton,
  ReviewDetailsModal,
} from "../../../components";
import ReviewItem from "../../../components/vendor/ReviewItem";

interface Review {
  id: string;
  reviewerName: string;
  avatar: string;
  timestamp: string;
  rating: number;
  serviceType: string;
  message: string;
  helpfulCount: number;
}

export default function ReviewsScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Mock data for overall rating
  const overallRating = {
    score: 4.7,
    stars: 4.5,
    totalReviews: 387,
    customers: 439,
    performance: "Excellent",
  };

  // Mock data for rating breakdown
  const ratingBreakdown = [
    { stars: 5, count: 245, percentage: 63.9 },
    { stars: 4, count: 98, percentage: 25.3 },
    { stars: 3, count: 31, percentage: 8.0 },
    { stars: 2, count: 9, percentage: 2.3 },
    { stars: 1, count: 4, percentage: 1.0 },
  ];

  // Mock data for reviews
  const reviews = [
    {
      id: "1",
      reviewerName: "Harry Porter",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format",
      rating: 5,
      timestamp: "Aug 5, 2024",
      serviceType: "Swedish Massage",
      message:
        "Absolutely amazing experience! The Swedish massage was incredibly relaxing and the staff was so professional. The ambiance is perfect for unwinding. I felt completely rejuvenated after my session. Will definitely be returning soon!",
      helpfulCount: 23,
    },
    {
      id: "2",
      reviewerName: "Sarah Johnson",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face&auto=format",
      rating: 5,
      timestamp: "Aug 3, 2024",
      serviceType: "Hot Stone Therapy",
      message:
        "Perfect experience from start to finish. The hot stone therapy was incredibly therapeutic and the therapist was knowledgeable and caring.",
      helpfulCount: 15,
    },
    {
      id: "3",
      reviewerName: "Mike Wilson",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format",
      rating: 4,
      timestamp: "Aug 1, 2024",
      serviceType: "Deep Tissue Massage",
      message:
        "Great massage, very professional staff. The deep tissue work really helped with my back pain. Would recommend!",
      helpfulCount: 8,
    },
    {
      id: "4",
      reviewerName: "Emma Davis",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face&auto=format",
      rating: 5,
      timestamp: "Jul 28, 2024",
      serviceType: "Aromatherapy",
      message:
        "The aromatherapy session was absolutely divine! The scents were perfectly chosen and the therapist was very knowledgeable about essential oils. Highly recommend this service!",
      helpfulCount: 12,
    },
    {
      id: "5",
      reviewerName: "John Smith",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face&auto=format",
      rating: 4,
      timestamp: "Jul 25, 2024",
      serviceType: "Sports Massage",
      message:
        "Great sports massage after my workout. The therapist really focused on the areas that needed attention. Will definitely book again.",
      helpfulCount: 7,
    },
    {
      id: "6",
      reviewerName: "Lisa Chen",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face&auto=format",
      rating: 5,
      timestamp: "Jul 22, 2024",
      serviceType: "Facial Treatment",
      message:
        "Amazing facial treatment! My skin feels so refreshed and glowing. The esthetician was very professional and the products used were high quality.",
      helpfulCount: 18,
    },
  ];

  const filterOptions = [
    { key: "all", label: "All Reviews", count: 6 },
    { key: "5", label: "5 Star", count: 3 },
    { key: "4", label: "4 Star", count: 2 },
    { key: "3", label: "3 Star", count: 1 },
  ];

  const renderStars = (rating: number, size: number = FONT_SIZE.body1) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Ionicons
        key={index}
        name={index < rating ? "star" : "star-outline"}
        size={size}
        color="#FF8C00"
        style={{ marginRight: 2 }}
      />
    ));
  };

  const renderRatingBar = (percentage: number) => {
    return (
      <View style={styles.ratingBarContainer}>
        <View style={styles.ratingBarBackground}>
          <View style={[styles.ratingBarFill, { width: `${percentage}%` }]} />
        </View>
      </View>
    );
  };

  return (
    <>
      <GlobalStatusBar />
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <View style={styles.container}>
          {/* Header with Solid Background */}
          <View style={styles.headerSolid}>
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
              <View style={styles.titleContainer}>
                <ResponsiveText variant="h5" weight="bold" color={COLORS.white}>
                  Rating & Reviews
                </ResponsiveText>
                <ResponsiveText
                  variant="body2"
                  color={COLORS.white}
                  style={styles.reviewCount}
                >
                  6 reviews
                </ResponsiveText>
              </View>
              <View style={styles.headerPlaceholder} />
            </View>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Overall Rating Card */}
            <View style={styles.ratingCardContainer}>
              <View style={styles.ratingCardGradient}>
                <View style={styles.ratingHeader}>
                  <ResponsiveText
                    variant="h6"
                    weight="bold"
                    color={COLORS.text.primary}
                  >
                    Overall Rating
                  </ResponsiveText>
                  <View style={styles.performanceIndicator}>
                    <Ionicons
                      name="trending-up"
                      size={16}
                      color={COLORS.success[500]}
                    />
                    <ResponsiveText
                      variant="caption1"
                      color={COLORS.success[500]}
                      weight="medium"
                    >
                      {overallRating.performance}
                    </ResponsiveText>
                  </View>
                </View>

                <View style={styles.ratingScore}>
                  <ResponsiveText
                    variant="h1"
                    weight="bold"
                    color={COLORS.text.primary}
                  >
                    {overallRating.score}
                  </ResponsiveText>
                  <View style={styles.starsContainer}>
                    {renderStars(overallRating.stars, 28)}
                  </View>
                  <View style={styles.customerCount}>
                    <Ionicons
                      name="people"
                      size={18}
                      color={COLORS.text.secondary}
                    />
                    <ResponsiveText
                      variant="body2"
                      color={COLORS.text.secondary}
                      style={{ marginLeft: MARGIN.xs }}
                    >
                      {overallRating.customers} customer
                    </ResponsiveText>
                  </View>
                </View>
              </View>
            </View>

            {/* Rating Breakdown Card */}
            <ResponsiveCard variant="elevated" style={styles.breakdownCard}>
              <ResponsiveText
                variant="h6"
                weight="bold"
                color={COLORS.text.primary}
                style={styles.breakdownTitle}
              >
                Rating Breakdown
              </ResponsiveText>

              {ratingBreakdown.map((item) => (
                <View key={item.stars} style={styles.breakdownRow}>
                  <View style={styles.starLabel}>
                    <ResponsiveText
                      variant="caption1"
                      color={COLORS.text.primary}
                      style={styles.starText}
                    >
                      {item.stars}
                    </ResponsiveText>
                    <Ionicons name="star" size={14} color="#FF8C00" />
                  </View>
                  {renderRatingBar(item.percentage)}
                  <View style={styles.breakdownStats}>
                    <ResponsiveText
                      variant="caption2"
                      weight="bold"
                      color={COLORS.text.primary}
                      style={{ fontSize: 15 }}
                    >
                      {item.count}
                    </ResponsiveText>
                    <ResponsiveText
                      variant="caption2"
                      weight="medium"
                      color={COLORS.text.secondary}
                      style={{ fontSize: 15 }}
                    >
                      {item.percentage}%
                    </ResponsiveText>
                  </View>
                </View>
              ))}
            </ResponsiveCard>

            {/* Filter Buttons */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterContainer}
            >
              {filterOptions.map((filter) => (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.filterButton,
                    selectedFilter === filter.key && styles.filterButtonActive,
                  ]}
                  onPress={() => setSelectedFilter(filter.key)}
                >
                  <ResponsiveText
                    variant="caption1"
                    weight="medium"
                    color={
                      selectedFilter === filter.key
                        ? COLORS.primary[600]
                        : COLORS.text.secondary
                    }
                  >
                    {filter.label}
                  </ResponsiveText>
                  <View
                    style={[
                      styles.filterCount,
                      selectedFilter === filter.key
                        ? styles.filterCountActive
                        : styles.filterCountInactive,
                    ]}
                  >
                    <ResponsiveText
                      variant="caption3"
                      weight="medium"
                      color={
                        selectedFilter === filter.key
                          ? COLORS.white
                          : COLORS.text.secondary
                      }
                    >
                      {filter.count}
                    </ResponsiveText>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Reviews List */}
            <View style={styles.reviewsList}>
              {reviews.map((review, index) => (
                <ReviewItem
                  key={review.id}
                  review={review}
                  onPress={(review) => {
                    setSelectedReview(review);
                    setIsModalVisible(true);
                  }}
                  onHelpful={(review) => {
                    // Handle helpful action if needed
                    console.log("Helpful pressed for review:", review.id);
                  }}
                  showDivider={index < reviews.length - 1}
                />
              ))}
            </View>

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
  headerSolid: {
    backgroundColor: COLORS.primary[200],
    paddingTop: MARGIN.sm,
    paddingBottom: MARGIN.md - 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  topNavigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: PADDING.screen,
    paddingTop: MARGIN.sm,
    marginBottom: MARGIN.sm,
    minHeight: 60,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
  },
  reviewCount: {
    marginTop: MARGIN.xs,
    opacity: 0.9,
  },
  headerPlaceholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: PADDING.screen,
  },
  ratingCardContainer: {
    marginTop: MARGIN.lg,
    borderRadius: BORDER_RADIUS.lg,
    overflow: "hidden",
    elevation: 4,
    shadowColor: COLORS.primary[200],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  ratingCardGradient: {
    padding: PADDING.lg,
    backgroundColor: COLORS.white,
  },
  ratingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: MARGIN.lg,
  },
  performanceIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.success[50],
    paddingHorizontal: PADDING.sm,
    paddingVertical: PADDING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  ratingScore: {
    alignItems: "center",
  },
  starsContainer: {
    flexDirection: "row",
    marginVertical: MARGIN.sm,
  },
  customerCount: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: MARGIN.xs,
  },
  breakdownCard: {
    marginTop: MARGIN.md,
    padding: PADDING.md,
  },
  breakdownTitle: {
    marginBottom: MARGIN.md,
  },
  breakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: MARGIN.md,
  },
  starLabel: {
    flexDirection: "row",
    alignItems: "center",
    width: 40,
  },
  starText: {
    marginRight: MARGIN.xs,
    textAlign: "left",
  },
  ratingBarContainer: {
    flex: 1,
    marginRight: MARGIN.sm,
  },
  ratingBarBackground: {
    height: 6,
    backgroundColor: COLORS.background.light,
    borderRadius: BORDER_RADIUS.sm,
    overflow: "hidden",
  },
  ratingBarFill: {
    height: "100%",
    backgroundColor: "#FF8C00",
    borderRadius: BORDER_RADIUS.sm,
  },
  breakdownStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: 80,
    minWidth: 80,
  },
  singleLineStats: {
    textAlign: "right",
    flexShrink: 0,
  },
  filterContainer: {
    marginTop: MARGIN.lg,
    marginBottom: MARGIN.md,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: PADDING.md,
    paddingVertical: PADDING.sm,
    marginRight: MARGIN.sm,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary[50],
    borderColor: COLORS.primary[200],
  },
  filterCount: {
    marginLeft: MARGIN.sm,
    paddingHorizontal: PADDING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
    minWidth: 20,
    alignItems: "center",
  },
  filterCountActive: {
    backgroundColor: COLORS.primary[500],
  },
  filterCountInactive: {
    backgroundColor: COLORS.background.light,
  },
  reviewsList: {
    marginTop: MARGIN.md,
    paddingHorizontal: PADDING.screen,
  },
  bottomSpacing: {
    height: 100,
  },
});
