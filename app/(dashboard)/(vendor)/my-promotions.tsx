import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ResponsiveText,
  ResponsiveCard,
  ResponsiveButton,
  GlobalStatusBar,
  BackButton,
} from "@/components";
import {
  COLORS,
  FONT_SIZE,
  LINE_HEIGHT,
  MARGIN,
  PADDING,
  BORDER_RADIUS,
  LAYOUT,
} from "@/constants";

// Promotion interface
export interface VendorPromotion {
  id: string;
  title: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: string;
  originalPrice?: string;
  discountedPrice?: string;
  category: string;
  status: "active" | "inactive" | "pending" | "expired";
  startDate: string;
  endDate: string;
  views: number;
  clicks: number;
  conversions: number;
  imageUrl: string;
  badges: string[];
  createdAt: string;
  updatedAt: string;
}

export default function MyPromotionsScreen() {
  const router = useRouter();
  const [promotions, setPromotions] = useState<VendorPromotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "pending" | "inactive" | "expired"
  >("all");

  // Mock data for promotions
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setIsLoading(true);
        // TODO: Implement actual API call when backend is ready
        // const response = await promotionService.getMyPromotions();
        // setPromotions(response.data);

        // Mock data for UI development
        setPromotions([
          {
            id: "1",
            title: "Summer Wellness Special",
            description:
              "Get 20% off on all massage therapy sessions this summer",
            discountType: "percentage",
            discountValue: "20%",
            originalPrice: "$120",
            discountedPrice: "$96",
            category: "Massage Therapy",
            status: "active",
            startDate: "2024-06-01T00:00:00Z",
            endDate: "2024-08-31T23:59:59Z",
            views: 1250,
            clicks: 89,
            conversions: 23,
            imageUrl:
              "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&h=300&fit=crop",
            badges: ["Live", "Popular", "Summer Special"],
            createdAt: "2024-05-15T10:00:00Z",
            updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "2",
            title: "New Customer Welcome",
            description: "First-time customers get $25 off their first service",
            discountType: "fixed",
            discountValue: "$25",
            originalPrice: "$95",
            discountedPrice: "$70",
            category: "All Services",
            status: "active",
            startDate: "2024-01-01T00:00:00Z",
            endDate: "2024-12-31T23:59:59Z",
            views: 890,
            clicks: 156,
            conversions: 45,
            imageUrl:
              "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
            badges: ["Live", "New Customer"],
            createdAt: "2024-01-01T09:00:00Z",
            updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "3",
            title: "Holiday Spa Package",
            description:
              "Special holiday package with facial and massage combo",
            discountType: "percentage",
            discountValue: "15%",
            originalPrice: "$200",
            discountedPrice: "$170",
            category: "Spa Package",
            status: "pending",
            startDate: "2024-12-01T00:00:00Z",
            endDate: "2024-12-31T23:59:59Z",
            views: 0,
            clicks: 0,
            conversions: 0,
            imageUrl:
              "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400&h=300&fit=crop",
            badges: ["Pending Approval", "Holiday Special"],
            createdAt: "2024-11-25T15:00:00Z",
            updatedAt: "2024-11-25T15:00:00Z",
          },
          {
            id: "4",
            title: "Weekend Warrior Deal",
            description: "Weekend special on all fitness and wellness services",
            discountType: "percentage",
            discountValue: "10%",
            originalPrice: "$140",
            discountedPrice: "$126",
            category: "Fitness & Wellness",
            status: "expired",
            startDate: "2024-10-01T00:00:00Z",
            endDate: "2024-10-31T23:59:59Z",
            views: 567,
            clicks: 34,
            conversions: 12,
            imageUrl:
              "https://images.unsplash.com/photo-1596178060810-4d0b5b3b3b3b?w=400&h=300&fit=crop",
            badges: ["Expired"],
            createdAt: "2024-09-25T11:00:00Z",
            updatedAt: "2024-10-31T23:59:59Z",
          },
        ]);
      } catch (error) {
        console.error("Error fetching promotions:", error);
        Alert.alert(
          "Error",
          "Failed to load your promotions. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchPromotions();
  }, []);

  // Filter promotions
  const filteredPromotions = React.useMemo(() => {
    let filtered = promotions;

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(
        (promotion) => promotion.status === filterStatus
      );
    }

    return filtered;
  }, [promotions, filterStatus]);

  const handlePromotionPress = (promotion: VendorPromotion) => {
    // TODO: Navigate to promotion details screen
    Alert.alert("Promotion Details", `View details for ${promotion.title}`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "View",
        onPress: () => console.log("View promotion:", promotion.id),
      },
    ]);
  };

  const handleEditPromotion = (promotion: VendorPromotion) => {
    // TODO: Navigate to edit promotion screen
    Alert.alert("Edit Promotion", `Edit ${promotion.title}`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Edit",
        onPress: () => console.log("Edit promotion:", promotion.id),
      },
    ]);
  };

  const handleToggleStatus = (promotion: VendorPromotion) => {
    const newStatus = promotion.status === "active" ? "inactive" : "active";
    const action = newStatus === "active" ? "activate" : "deactivate";

    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Promotion`,
      `Are you sure you want to ${action} "${promotion.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          onPress: () => {
            setPromotions((prev) =>
              prev.map((item) =>
                item.id === promotion.id ? { ...item, status: newStatus } : item
              )
            );
          },
        },
      ]
    );
  };

  const handleDeletePromotion = (promotion: VendorPromotion) => {
    Alert.alert(
      "Delete Promotion",
      `Are you sure you want to delete "${promotion.title}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setPromotions((prev) =>
              prev.filter((item) => item.id !== promotion.id)
            );
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return COLORS.success[500];
      case "inactive":
        return COLORS.error[500];
      case "pending":
        return COLORS.warning[500];
      case "expired":
        return COLORS.text.secondary;
      default:
        return COLORS.text.secondary;
    }
  };

  const getBadgeColor = (badge: string) => {
    switch (badge.toLowerCase()) {
      case "live":
        return COLORS.success[500];
      case "popular":
        return COLORS.primary[300];
      case "summer special":
        return COLORS.warning[600];
      case "new customer":
        return COLORS.success[400];
      case "pending approval":
        return COLORS.warning[500];
      case "holiday special":
        return COLORS.primary[300];
      case "expired":
        return COLORS.text.secondary;
      default:
        return COLORS.primary[300];
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Updated just now";
    if (diffInHours < 24)
      return `Updated ${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `Updated ${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderPromotionCard = (promotion: VendorPromotion) => {
    const cardContent = (
      <ResponsiveCard variant="outlined" style={styles.card}>
        {/* Image Header with Badges */}
        <View style={styles.imageContainer}>
          <View style={styles.serviceImagePlaceholder}>
            <Ionicons name="megaphone" size={40} color={COLORS.primary[300]} />
          </View>

          {/* Status Badges Overlay */}
          <View style={styles.badgesContainer}>
            {promotion.badges.map((badge, index) => (
              <View
                key={index}
                style={[
                  styles.badge,
                  { backgroundColor: getBadgeColor(badge) + "80" },
                ]}
              >
                <ResponsiveText
                  variant="caption2"
                  weight="medium"
                  color={COLORS.white}
                  style={styles.badgeText}
                >
                  {badge}
                </ResponsiveText>
              </View>
            ))}
          </View>
        </View>

        {/* Promotion Details */}
        <View style={styles.detailsContainer}>
          {/* Title and Category */}
          <View style={styles.titleSection}>
            <ResponsiveText
              variant="h5"
              weight="bold"
              color={COLORS.text.primary}
              style={styles.promotionTitle}
            >
              {promotion.title}
            </ResponsiveText>
            <View style={styles.categoryContainer}>
              <Ionicons name="pricetag" size={12} color={COLORS.primary[300]} />
              <ResponsiveText
                variant="caption1"
                weight="medium"
                color={COLORS.primary[300]}
                style={styles.category}
              >
                {promotion.category}
              </ResponsiveText>
            </View>
          </View>

          {/* Discount Info */}
          <View style={styles.discountSection}>
            <View style={styles.discountContainer}>
              <View style={styles.discountValueContainer}>
                <ResponsiveText
                  variant="h4"
                  weight="bold"
                  color={COLORS.success[500]}
                  style={styles.discountValue}
                >
                  {promotion.discountValue} OFF
                </ResponsiveText>
                {promotion.originalPrice && (
                  <View style={styles.priceContainer}>
                    <ResponsiveText
                      variant="body2"
                      color={COLORS.text.secondary}
                      style={styles.originalPrice}
                    >
                      {promotion.originalPrice}
                    </ResponsiveText>
                    <ResponsiveText
                      variant="h6"
                      weight="bold"
                      color={COLORS.primary[300]}
                      style={styles.discountedPrice}
                    >
                      {promotion.discountedPrice}
                    </ResponsiveText>
                  </View>
                )}
              </View>
              <View style={styles.statusIndicator}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: getStatusColor(promotion.status) },
                  ]}
                />
                <ResponsiveText
                  variant="caption2"
                  weight="medium"
                  color={getStatusColor(promotion.status)}
                  style={styles.statusText}
                >
                  {promotion.status.charAt(0).toUpperCase() +
                    promotion.status.slice(1)}
                </ResponsiveText>
              </View>
            </View>
          </View>

          {/* Date Range */}
          <View style={styles.dateRangeContainer}>
            <View style={styles.dateItem}>
              <Ionicons
                name="calendar"
                size={12}
                color={COLORS.text.secondary}
              />
              <ResponsiveText
                variant="caption2"
                color={COLORS.text.secondary}
                style={styles.dateText}
              >
                {formatDate(promotion.startDate)} -{" "}
                {formatDate(promotion.endDate)}
              </ResponsiveText>
            </View>
          </View>

          {/* Update Time */}
          <View style={styles.updateTimeContainer}>
            <Ionicons name="time" size={10} color={COLORS.text.secondary} />
            <ResponsiveText
              variant="caption2"
              color={COLORS.text.secondary}
              style={styles.updateTime}
            >
              {formatTimeAgo(promotion.updatedAt)}
            </ResponsiveText>
          </View>
        </View>
      </ResponsiveCard>
    );

    return (
      <TouchableOpacity
        key={promotion.id}
        onPress={() => handlePromotionPress(promotion)}
        activeOpacity={0.8}
        style={styles.cardWrapper}
      >
        {cardContent}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <GlobalStatusBar />

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
          <ResponsiveText variant="h5" weight="bold" color={COLORS.white}>
            My Promotions
          </ResponsiveText>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              router.push("/(dashboard)/(vendor)/create-promotion");
            }}
          >
            <Ionicons
              name="add"
              size={LAYOUT.iconMedium}
              color={COLORS.white}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Filter Bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterStatus === "all" && styles.filterButtonActive,
            ]}
            onPress={() => setFilterStatus("all")}
          >
            <ResponsiveText
              variant="caption1"
              weight="medium"
              color={
                filterStatus === "all"
                  ? COLORS.primary[600]
                  : COLORS.text.secondary
              }
            >
              All
            </ResponsiveText>
            <View
              style={[
                styles.filterCount,
                filterStatus === "all"
                  ? styles.filterCountActive
                  : styles.filterCountInactive,
              ]}
            >
              <ResponsiveText
                variant="caption3"
                weight="medium"
                color={
                  filterStatus === "all" ? COLORS.white : COLORS.text.secondary
                }
              >
                {promotions.length}
              </ResponsiveText>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterStatus === "active" && styles.filterButtonActive,
            ]}
            onPress={() => setFilterStatus("active")}
          >
            <ResponsiveText
              variant="caption1"
              weight="medium"
              color={
                filterStatus === "active"
                  ? COLORS.primary[600]
                  : COLORS.text.secondary
              }
            >
              Active
            </ResponsiveText>
            <View
              style={[
                styles.filterCount,
                filterStatus === "active"
                  ? styles.filterCountActive
                  : styles.filterCountInactive,
              ]}
            >
              <ResponsiveText
                variant="caption3"
                weight="medium"
                color={
                  filterStatus === "active"
                    ? COLORS.white
                    : COLORS.text.secondary
                }
              >
                {promotions.filter((p) => p.status === "active").length}
              </ResponsiveText>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterStatus === "pending" && styles.filterButtonActive,
            ]}
            onPress={() => setFilterStatus("pending")}
          >
            <ResponsiveText
              variant="caption1"
              weight="medium"
              color={
                filterStatus === "pending"
                  ? COLORS.primary[600]
                  : COLORS.text.secondary
              }
            >
              Pending
            </ResponsiveText>
            <View
              style={[
                styles.filterCount,
                filterStatus === "pending"
                  ? styles.filterCountActive
                  : styles.filterCountInactive,
              ]}
            >
              <ResponsiveText
                variant="caption3"
                weight="medium"
                color={
                  filterStatus === "pending"
                    ? COLORS.white
                    : COLORS.text.secondary
                }
              >
                {promotions.filter((p) => p.status === "pending").length}
              </ResponsiveText>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterStatus === "expired" && styles.filterButtonActive,
            ]}
            onPress={() => setFilterStatus("expired")}
          >
            <ResponsiveText
              variant="caption1"
              weight="medium"
              color={
                filterStatus === "expired"
                  ? COLORS.primary[600]
                  : COLORS.text.secondary
              }
            >
              Expired
            </ResponsiveText>
            <View
              style={[
                styles.filterCount,
                filterStatus === "expired"
                  ? styles.filterCountActive
                  : styles.filterCountInactive,
              ]}
            >
              <ResponsiveText
                variant="caption3"
                weight="medium"
                color={
                  filterStatus === "expired"
                    ? COLORS.white
                    : COLORS.text.secondary
                }
              >
                {promotions.filter((p) => p.status === "expired").length}
              </ResponsiveText>
            </View>
          </TouchableOpacity>
        </ScrollView>

        {/* Promotions */}
        {isLoading ? (
          <ResponsiveCard variant="elevated" style={styles.loadingCard}>
            <ResponsiveText
              variant="body1"
              color={COLORS.text.secondary}
              style={styles.loadingText}
            >
              Loading your promotions...
            </ResponsiveText>
          </ResponsiveCard>
        ) : filteredPromotions.length === 0 ? (
          <ResponsiveCard variant="elevated" style={styles.emptyCard}>
            <Ionicons
              name="megaphone-outline"
              size={LAYOUT.iconLarge}
              color={COLORS.text.secondary}
            />
            <ResponsiveText
              variant="h6"
              weight="medium"
              color={COLORS.text.secondary}
              style={styles.emptyTitle}
            >
              No Promotions Found
            </ResponsiveText>
            <ResponsiveText
              variant="body2"
              color={COLORS.text.secondary}
              style={styles.emptyDescription}
            >
              {filterStatus === "all"
                ? "Start by creating your first promotion"
                : `No promotions found for the selected filter`}
            </ResponsiveText>
            {filterStatus === "all" && (
              <ResponsiveButton
                title="Create First Promotion"
                variant="primary"
                size="medium"
                onPress={() => {
                  router.push("/(dashboard)/(vendor)/create-promotion");
                }}
                style={styles.addFirstButton}
              />
            )}
          </ResponsiveCard>
        ) : (
          filteredPromotions.map((promotion) => renderPromotionCard(promotion))
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    marginBottom: MARGIN.sm,
  },
  addButton: {
    width: LAYOUT.buttonHeightSmall,
    height: LAYOUT.buttonHeightSmall,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.primary[300],
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: PADDING.screen,
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
  loadingCard: {
    marginTop: MARGIN.lg,
    padding: PADDING.lg,
    alignItems: "center",
  },
  loadingText: {
    textAlign: "center",
  },
  emptyCard: {
    marginTop: MARGIN.lg,
    padding: PADDING.xl,
    alignItems: "center",
  },
  emptyTitle: {
    marginTop: MARGIN.md,
    marginBottom: MARGIN.sm,
  },
  emptyDescription: {
    textAlign: "center",
    marginBottom: MARGIN.lg,
  },
  addFirstButton: {
    marginTop: MARGIN.sm,
  },
  bottomSpacing: {
    height: 100,
  },
  // Promotion Card Styles
  cardWrapper: {
    marginBottom: MARGIN.md,
  },
  card: {
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
    height: 120,
    marginTop: -PADDING.lg,
    marginHorizontal: -PADDING.lg,
  },
  serviceImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: COLORS.primary[50],
    alignItems: "center",
    justifyContent: "center",
  },
  badgesContainer: {
    position: "absolute",
    top: MARGIN.md,
    left: MARGIN.md,
    right: MARGIN.md,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: MARGIN.xs,
  },
  badge: {
    paddingHorizontal: PADDING.sm,
    paddingVertical: PADDING.xs,
    borderRadius: BORDER_RADIUS.xl,
  },
  badgeText: {
    fontSize: 12,
  },
  detailsContainer: {
    paddingTop: PADDING.lg - 10,
    paddingHorizontal: PADDING.lg - 20,
    paddingBottom: PADDING.xs,
  },
  titleSection: {
    marginBottom: MARGIN.md,
  },
  promotionTitle: {
    marginBottom: MARGIN.sm,
    lineHeight: 24,
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: MARGIN.xs,
  },
  category: {
    // Category styling
  },
  discountSection: {
    marginBottom: MARGIN.lg,
    paddingVertical: PADDING.sm,
    paddingHorizontal: PADDING.md,
    backgroundColor: COLORS.success[50],
    borderRadius: BORDER_RADIUS.md,
  },
  discountContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  discountValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: MARGIN.md,
  },
  discountValue: {
    // Discount value styling
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: MARGIN.sm,
  },
  originalPrice: {
    textDecorationLine: "line-through",
    opacity: 0.7,
  },
  discountedPrice: {
    // Discounted price styling
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: MARGIN.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    // Status text styling
  },
  dateRangeContainer: {
    marginBottom: MARGIN.md,
  },
  dateItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: MARGIN.xs,
  },
  dateText: {
    fontSize: 12,
  },
  updateTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: MARGIN.xs,
    paddingTop: PADDING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  },
  updateTime: {
    fontSize: 12,
  },
});
