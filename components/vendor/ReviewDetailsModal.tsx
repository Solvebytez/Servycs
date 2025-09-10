import React from "react";
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, MARGIN, PADDING, BORDER_RADIUS } from "../../constants";
import { ResponsiveText, ResponsiveCard } from "../UI";

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

interface ReviewDetailsModalProps {
  visible: boolean;
  review: Review | null;
  onClose: () => void;
}

// Render stars for rating display
const renderStars = (rating: number, size: number = 16) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Ionicons
        key={i}
        name="star"
        size={size}
        color="#FF8C00"
        style={{ marginRight: 2 }}
      />
    );
  }

  if (hasHalfStar) {
    stars.push(
      <Ionicons
        key="half"
        name="star-half"
        size={size}
        color="#FF8C00"
        style={{ marginRight: 2 }}
      />
    );
  }

  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <Ionicons
        key={`empty-${i}`}
        name="star-outline"
        size={size}
        color="#FF8C00"
        style={{ marginRight: 2 }}
      />
    );
  }

  return stars;
};

export const ReviewDetailsModal: React.FC<ReviewDetailsModalProps> = ({
  visible,
  review,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
            <Ionicons name="close" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <ResponsiveText
            variant="h6"
            weight="bold"
            color={COLORS.text.primary}
          >
            Review Details
          </ResponsiveText>
          <View style={styles.modalHeaderPlaceholder} />
        </View>

        {review && (
          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            <ResponsiveCard variant="elevated" style={styles.modalReviewCard}>
              <View style={styles.modalReviewHeader}>
                <View style={styles.modalReviewerInfo}>
                  <Image
                    source={{ uri: review.avatar }}
                    style={styles.modalAvatar}
                  />
                  <View style={styles.modalReviewerDetails}>
                    <ResponsiveText
                      variant="body1"
                      weight="bold"
                      color={COLORS.text.primary}
                    >
                      {review.reviewerName}
                    </ResponsiveText>
                    <ResponsiveText
                      variant="caption1"
                      color={COLORS.text.secondary}
                    >
                      {review.timestamp}
                    </ResponsiveText>
                  </View>
                </View>
                <View style={styles.modalRatingContainer}>
                  <View style={styles.modalStarsContainer}>
                    {renderStars(review.rating, 20)}
                  </View>
                  <ResponsiveText
                    variant="caption1"
                    color={COLORS.text.secondary}
                  >
                    {review.serviceType}
                  </ResponsiveText>
                </View>
              </View>

              <ResponsiveText
                variant="body2"
                color={COLORS.text.primary}
                style={styles.modalReviewMessage}
              >
                {review.message}
              </ResponsiveText>

              <View style={styles.modalReviewActions}>
                <TouchableOpacity style={styles.modalHelpfulButton}>
                  <Ionicons
                    name="thumbs-up-outline"
                    size={16}
                    color={COLORS.text.secondary}
                  />
                  <ResponsiveText
                    variant="caption1"
                    color={COLORS.text.secondary}
                    style={{ marginLeft: MARGIN.xs }}
                  >
                    Helpful ({review.helpfulCount})
                  </ResponsiveText>
                </TouchableOpacity>
              </View>
            </ResponsiveCard>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: PADDING.screen,
    paddingVertical: PADDING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  modalCloseButton: {
    padding: PADDING.xs,
  },
  modalHeaderPlaceholder: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: PADDING.screen,
  },
  modalReviewCard: {
    marginTop: MARGIN.lg,
    padding: PADDING.lg,
  },
  modalReviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: MARGIN.md,
  },
  modalReviewerInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  modalAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: MARGIN.md,
  },
  modalReviewerDetails: {
    flex: 1,
  },
  modalRatingContainer: {
    alignItems: "flex-end",
  },
  modalStarsContainer: {
    flexDirection: "row",
    marginBottom: MARGIN.xs,
  },
  modalReviewMessage: {
    lineHeight: 22,
    marginBottom: MARGIN.md,
  },
  modalReviewActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  modalHelpfulButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: PADDING.sm,
    paddingVertical: PADDING.xs,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.background.light,
  },
});

export default ReviewDetailsModal;
