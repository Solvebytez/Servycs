import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, MARGIN, PADDING, BORDER_RADIUS } from "@/constants";
import { ResponsiveText, ResponsiveCard } from "@/components/UI";

// Extended ServiceListing interface for the new design
export interface VendorServiceListing {
  id: string;
  title: string;
  description: string;
  price: string;
  originalPrice?: string; // For showing strikethrough original price
  category: string;
  status: "active" | "inactive" | "pending";
  rating: number;
  reviewCount: number;
  views: number;
  imageUrl: string;
  badges: string[]; // Array of badge labels like ["Live", "Best Seller", "Popular"]
  createdAt: string;
  updatedAt: string;
}

interface VendorListCardProps {
  listing: VendorServiceListing;
  onPress?: (listing: VendorListCardProps["listing"]) => void;
}

export const VendorListCard: React.FC<VendorListCardProps> = ({
  listing,
  onPress,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return COLORS.success[500];
      case "inactive":
        return COLORS.error[500];
      case "pending":
        return COLORS.warning[500];
      default:
        return COLORS.text.secondary;
    }
  };

  const getBadgeColor = (badge: string) => {
    switch (badge.toLowerCase()) {
      case "live":
        return COLORS.success[500];
      case "best seller":
        return COLORS.primary[300];
      case "popular":
        return COLORS.warning[600];
      case "trending":
        return COLORS.primary[300];
      case "pending approval":
        return COLORS.warning[500];
      case "new":
        return COLORS.success[400];
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

  const cardContent = (
    <ResponsiveCard variant="outlined" style={styles.card}>
      {/* Image Header with Badges */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: listing.imageUrl }} style={styles.serviceImage} />

        {/* Status Badges Overlay */}
        <View style={styles.badgesContainer}>
          {listing.badges.map((badge, index) => (
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

      {/* Service Details */}
      <View style={styles.detailsContainer}>
        {/* Title and Category */}
        <View style={styles.titleSection}>
          <ResponsiveText
            variant="h5"
            weight="bold"
            color={COLORS.text.primary}
            style={styles.serviceTitle}
          >
            {listing.title}
          </ResponsiveText>
          <View style={styles.categoryContainer}>
            <Ionicons name="pricetag" size={12} color={COLORS.primary[300]} />
            <ResponsiveText
              variant="caption1"
              weight="medium"
              color={COLORS.primary[300]}
              style={styles.category}
            >
              {listing.category}
            </ResponsiveText>
          </View>
        </View>

        {/* Pricing */}
        <View style={styles.pricingSection}>
          <View style={styles.priceContainer}>
            {listing.originalPrice && (
              <ResponsiveText
                variant="body2"
                color={COLORS.text.secondary}
                style={styles.originalPrice}
              >
                {listing.originalPrice}
              </ResponsiveText>
            )}
            <ResponsiveText
              variant="h5"
              weight="bold"
              color={COLORS.primary[300]}
              style={styles.currentPrice}
            >
              {listing.price}
            </ResponsiveText>
          </View>
          <View style={styles.statusIndicator}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: getStatusColor(listing.status) },
              ]}
            />
            <ResponsiveText
              variant="caption2"
              weight="medium"
              color={getStatusColor(listing.status)}
              style={styles.statusText}
            >
              {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
            </ResponsiveText>
          </View>
        </View>

        {/* Metrics Row */}
        <View style={styles.metricsRow}>
          {/* Views */}
          <View style={styles.metricItem}>
            <View style={styles.metricIconContainer}>
              <Ionicons name="eye" size={14} color={COLORS.primary[300]} />
            </View>
            <ResponsiveText
              variant="caption1"
              weight="medium"
              color={COLORS.text.primary}
              style={styles.metricText}
            >
              {listing.views} views
            </ResponsiveText>
          </View>

          {/* Rating */}
          {listing.rating > 0 && (
            <View style={styles.metricItem}>
              <View style={styles.metricIconContainer}>
                <Ionicons name="star" size={14} color="#FF8C00" />
              </View>
              <ResponsiveText
                variant="caption1"
                weight="medium"
                color={COLORS.text.primary}
                style={styles.metricText}
              >
                {listing.rating} ({listing.reviewCount})
              </ResponsiveText>
            </View>
          )}
        </View>

        {/* Update Time */}
        <View style={styles.updateTimeContainer}>
          <Ionicons name="time" size={10} color={COLORS.text.secondary} />
          <ResponsiveText
            variant="caption2"
            color={COLORS.text.secondary}
            style={styles.updateTime}
          >
            {formatTimeAgo(listing.updatedAt)}
          </ResponsiveText>
        </View>
      </View>
    </ResponsiveCard>
  );

  // Wrap with TouchableOpacity if onPress is provided
  if (onPress) {
    return (
      <TouchableOpacity
        onPress={() => onPress(listing)}
        activeOpacity={0.8}
        style={styles.cardWrapper}
      >
        {cardContent}
      </TouchableOpacity>
    );
  }

  return <View style={styles.cardWrapper}>{cardContent}</View>;
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: MARGIN.md,
  },
  card: {
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
    height: 200,
    marginTop: -PADDING.lg,
    marginHorizontal: -PADDING.lg,
  },
  serviceImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
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
  serviceTitle: {
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
  pricingSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: MARGIN.lg,
    paddingVertical: PADDING.sm,
    paddingHorizontal: PADDING.md,
    backgroundColor: COLORS.neutral[50],
    borderRadius: BORDER_RADIUS.md,
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
  currentPrice: {
    // Current price styling
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
  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: MARGIN.sm,
    gap: MARGIN.md,
  },
  metricItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: MARGIN.xs,
  },
  metricIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary[50],
    alignItems: "center",
    justifyContent: "center",
  },
  metricText: {
    fontSize: 14,
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

export default VendorListCard;
