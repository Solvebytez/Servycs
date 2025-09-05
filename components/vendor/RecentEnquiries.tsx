import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ResponsiveText, ResponsiveCard } from "@/components/UI";
import { COLORS, MARGIN, PADDING } from "@/constants";
import EnquiryItem from "./EnquiryItem";

interface Enquiry {
  id: string;
  name: string;
  avatar: string;
  status: "new" | "replied";
  timestamp: string;
  subject: string;
  message: string;
}

interface RecentEnquiriesProps {
  enquiries: Enquiry[];
  onViewAll?: () => void;
  onEnquiryPress?: (enquiry: Enquiry) => void;
}

export const RecentEnquiries: React.FC<RecentEnquiriesProps> = ({
  enquiries,
  onViewAll,
  onEnquiryPress,
}) => {
  return (
    <View style={styles.container}>
      <ResponsiveCard variant="elevated" style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons
              name="mail"
              size={20}
              color={COLORS.primary[300]}
              style={{ marginRight: MARGIN.sm }}
            />
            <ResponsiveText
              variant="h4"
              weight="bold"
              color={COLORS.text.primary}
            >
              Recent Enquiries
            </ResponsiveText>
          </View>
          <TouchableOpacity onPress={onViewAll} style={styles.viewAllButton}>
            <ResponsiveText
              variant="caption1"
              color={COLORS.primary[300]}
              weight="medium"
            >
              View All
            </ResponsiveText>
            <Ionicons
              name="chevron-forward"
              size={12}
              color={COLORS.primary[300]}
              style={{ marginLeft: 4 }}
            />
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Enquiries List */}
        <View style={styles.enquiriesList}>
          {enquiries.map((enquiry, index) => (
            <EnquiryItem
              key={enquiry.id}
              enquiry={enquiry}
              onPress={onEnquiryPress}
              showDivider={index < enquiries.length - 1}
            />
          ))}
        </View>
      </ResponsiveCard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: MARGIN.xl,
  },
  card: {
    padding: 0,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: PADDING.lg,
    paddingTop: PADDING.lg,
    paddingBottom: PADDING.md,
    backgroundColor: "#FAFBFC",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: PADDING.xs,
    paddingHorizontal: PADDING.sm,
    backgroundColor: COLORS.primary[50],
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.primary[100],
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginHorizontal: PADDING.lg,
  },
  enquiriesList: {
    paddingHorizontal: PADDING.lg,
    paddingVertical: PADDING.sm,
  },
});

export default RecentEnquiries;
