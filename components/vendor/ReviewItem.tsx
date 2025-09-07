import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ResponsiveText } from "@/components/UI";
import { COLORS, MARGIN, PADDING, FONT_SIZE, BORDER_RADIUS } from "@/constants";

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

interface ReviewItemProps {
  review: Review;
  onPress?: (review: Review) => void;
  onHelpful?: (review: Review) => void;
  showDivider?: boolean;
}

export const ReviewItem: React.FC<ReviewItemProps> = ({
  review,
  onPress,
  onHelpful,
  showDivider = true,
}) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Ionicons
        key={index}
        name={index < rating ? "star" : "star-outline"}
        size={FONT_SIZE.caption1}
        color="#FFD700"
        style={{ marginRight: 2 }}
      />
    ));
  };

  return (
    <>
      <TouchableOpacity
        style={styles.reviewItem}
        onPress={() => onPress?.(review)}
        activeOpacity={0.7}
      >
        {/* Avatar and Main Content */}
        <View style={styles.reviewContent}>
          <Image source={{ uri: review.avatar }} style={styles.avatar} />

          <View style={styles.reviewDetails}>
            {/* Name and Timestamp Row */}
            <View style={styles.topRow}>
              <View style={{ flex: 1 }}>
                <ResponsiveText
                  variant="body1"
                  weight="bold"
                  color={COLORS.text.primary}
                  style={{ fontSize: FONT_SIZE.body1 }}
                >
                  {review.reviewerName}
                </ResponsiveText>
              </View>
              <View style={styles.timestampContainer}>
                <Ionicons
                  name="time-outline"
                  size={FONT_SIZE.caption2}
                  color={COLORS.text.secondary}
                  style={{ marginRight: MARGIN.xs }}
                />
                <ResponsiveText
                  variant="caption2"
                  color={COLORS.text.secondary}
                  style={{ fontSize: FONT_SIZE.caption2 }}
                >
                  {review.timestamp}
                </ResponsiveText>
              </View>
            </View>

            {/* Rating and Service Type */}
            <View style={styles.ratingContainer}>
              <View style={styles.starsContainer}>
                {renderStars(review.rating)}
              </View>
              <Ionicons
                name="star-outline"
                size={FONT_SIZE.caption1}
                color={COLORS.primary[300]}
                style={{ marginLeft: MARGIN.xs, marginRight: MARGIN.xs }}
              />
              <ResponsiveText
                variant="body2"
                color={COLORS.primary[300]}
                style={styles.serviceType}
              >
                for {review.serviceType}
              </ResponsiveText>
            </View>

            {/* Review Message Preview */}
            <ResponsiveText
              variant="caption1"
              color={COLORS.text.secondary}
              style={styles.messagePreview}
              numberOfLines={2}
            >
              {review.message}
            </ResponsiveText>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onHelpful?.(review)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="thumbs-up-outline"
                  size={FONT_SIZE.caption1}
                  color={COLORS.text.secondary}
                  style={{ marginRight: MARGIN.xs }}
                />
                <ResponsiveText
                  variant="caption2"
                  color={COLORS.text.secondary}
                  style={{ fontSize: FONT_SIZE.caption2 }}
                >
                  Helpful ({review.helpfulCount})
                </ResponsiveText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Divider between items */}
      {showDivider && <View style={styles.itemDivider} />}
    </>
  );
};

const styles = StyleSheet.create({
  reviewItem: {
    paddingVertical: PADDING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginVertical: MARGIN.xs,
  },
  reviewContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.xxl,
    marginRight: MARGIN.lg,
    backgroundColor: COLORS.background.light,
    borderWidth: 2,
    borderColor: COLORS.background.light,
  },
  reviewDetails: {
    flex: 1,
    paddingTop: MARGIN.xs,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: MARGIN.sm,
  },
  timestampContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background.secondary,
    paddingHorizontal: PADDING.sm,
    paddingVertical: PADDING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: MARGIN.sm,
  },
  starsContainer: {
    flexDirection: "row",
  },
  serviceType: {
    fontWeight: "600",
    fontSize: FONT_SIZE.body2,
    flex: 1,
  },
  messagePreview: {
    lineHeight: 20,
    color: COLORS.text.secondary,
    fontSize: FONT_SIZE.caption1,
    marginBottom: MARGIN.sm,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: MARGIN.lg,
  },
  itemDivider: {
    height: 1,
    backgroundColor: COLORS.background.light,
    marginTop: PADDING.lg,
    marginLeft: 56, // Align with text content (avatar width + margin)
    marginRight: PADDING.lg,
  },
});

export default ReviewItem;
