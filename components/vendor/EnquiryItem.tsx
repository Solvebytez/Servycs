import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ResponsiveText } from "@/components/UI";
import { COLORS, MARGIN, PADDING, FONT_SIZE, BORDER_RADIUS } from "@/constants";

interface Enquiry {
  id: string;
  name: string;
  avatar: string;
  status: "new" | "replied";
  timestamp: string;
  subject: string;
  message: string;
}

interface EnquiryItemProps {
  enquiry: Enquiry;
  onPress?: (enquiry: Enquiry) => void;
  showDivider?: boolean;
}

export const EnquiryItem: React.FC<EnquiryItemProps> = ({
  enquiry,
  onPress,
  showDivider = true,
}) => {
  return (
    <>
      <TouchableOpacity
        style={styles.enquiryItem}
        onPress={() => onPress?.(enquiry)}
        activeOpacity={0.7}
      >
        {/* Avatar and Main Content */}
        <View style={styles.enquiryContent}>
          <Image source={{ uri: enquiry.avatar }} style={styles.avatar} />

          <View style={styles.enquiryDetails}>
            {/* Name and Timestamp Row */}
            <View style={styles.topRow}>
              <View style={{ flex: 1 }}>
                <ResponsiveText
                  variant="body1"
                  weight="bold"
                  color={COLORS.text.primary}
                  style={{ fontSize: FONT_SIZE.body1 }}
                >
                  {enquiry.name}
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
                  {enquiry.timestamp}
                </ResponsiveText>
              </View>
            </View>

            {/* Subject */}
            <View style={styles.subjectContainer}>
              <Ionicons
                name="chatbubble-outline"
                size={FONT_SIZE.caption1}
                color={COLORS.primary[300]}
                style={{ marginRight: MARGIN.xs }}
              />
              <ResponsiveText
                variant="body2"
                color={COLORS.primary[300]}
                style={styles.subject}
              >
                {enquiry.subject}
              </ResponsiveText>
            </View>

            {/* Message Preview */}
            <ResponsiveText
              variant="caption1"
              color={COLORS.text.secondary}
              style={styles.messagePreview}
              numberOfLines={2}
            >
              {enquiry.message}
            </ResponsiveText>
          </View>
        </View>
      </TouchableOpacity>

      {/* Divider between items */}
      {showDivider && <View style={styles.itemDivider} />}
    </>
  );
};

const styles = StyleSheet.create({
  enquiryItem: {
    paddingVertical: PADDING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginVertical: MARGIN.xs,
  },
  enquiryContent: {
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
  enquiryDetails: {
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
  subjectContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: MARGIN.sm,
  },
  subject: {
    fontWeight: "600",
    fontSize: FONT_SIZE.body2,
    flex: 1,
  },
  messagePreview: {
    lineHeight: 20,
    color: COLORS.text.secondary,
    fontSize: FONT_SIZE.caption1,
  },
  itemDivider: {
    height: 1,
    backgroundColor: COLORS.background.light,
    marginTop: PADDING.lg,
    marginLeft: 56, // Align with text content (avatar width + margin)
    marginRight: PADDING.lg,
  },
});

export default EnquiryItem;
