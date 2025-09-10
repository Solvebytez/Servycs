import React, { useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
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
} from "../../../components";
import EnquiryItem from "../../../components/vendor/EnquiryItem";

interface Enquiry {
  id: string;
  name: string;
  avatar: string;
  subject: string;
  message: string;
  timestamp: string;
  status: "new" | "replied";
}

export default function EnquiriesScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState("all");

  // Mock data for enquiries
  const enquiries: Enquiry[] = [
    {
      id: "1",
      name: "Sarah Johnson",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      subject: "Re: Home Cleaning",
      message:
        "Hi, I'm interested in your weekly cleaning service. Could you please provide more details about pricing and availability?",
      timestamp: "2 hours ago",
      status: "new",
    },
    {
      id: "2",
      name: "Mike Chen",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      subject: "Re: Plumbing",
      message:
        "I have a leaky faucet in my kitchen. When would you be available to fix it?",
      timestamp: "4 hours ago",
      status: "replied",
    },
    {
      id: "3",
      name: "Emily Davis",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      subject: "Re: Electrical",
      message:
        "Need help with installing new light fixtures in my living room.",
      timestamp: "1 day ago",
      status: "new",
    },
    {
      id: "4",
      name: "David Wilson",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      subject: "Re: Painting",
      message:
        "Looking for interior painting services for a 3-bedroom house. What's your rate?",
      timestamp: "2 days ago",
      status: "replied",
    },
    {
      id: "5",
      name: "Lisa Brown",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
      subject: "Re: Carpentry",
      message: "Need custom bookshelf installation. Can you provide a quote?",
      timestamp: "3 days ago",
      status: "replied",
    },
    {
      id: "6",
      name: "Jay Johnson",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      subject: "Re: Swedish massage",
      message:
        "Hi! I would like to book a Swedish massage for this weekend. Are you available on Saturday afternoon?",
      timestamp: "2 hours ago",
      status: "new",
    },
  ];

  // Filter options
  const filterOptions = [
    { key: "all", label: "All Enquiries", count: enquiries.length },
    {
      key: "new",
      label: "New",
      count: enquiries.filter((e) => e.status === "new").length,
    },
    {
      key: "replied",
      label: "Replied",
      count: enquiries.filter((e) => e.status === "replied").length,
    },
  ];

  // Filter enquiries based on selected filter
  const filteredEnquiries =
    selectedFilter === "all"
      ? enquiries
      : enquiries.filter((enquiry) => enquiry.status === selectedFilter);

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
              <ResponsiveText variant="h5" weight="bold" color={COLORS.white}>
                All Enquiries
              </ResponsiveText>
              <View style={styles.headerPlaceholder} />
            </View>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
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

            {/* Enquiries List */}
            <View style={styles.enquiriesList}>
              {filteredEnquiries.length === 0 ? (
                <ResponsiveCard variant="elevated" style={styles.emptyCard}>
                  <Ionicons
                    name="mail-outline"
                    size={48}
                    color={COLORS.text.secondary}
                  />
                  <ResponsiveText
                    variant="h6"
                    weight="bold"
                    color={COLORS.text.primary}
                    style={styles.emptyTitle}
                  >
                    No enquiries found
                  </ResponsiveText>
                  <ResponsiveText
                    variant="body2"
                    color={COLORS.text.secondary}
                    style={styles.emptyDescription}
                  >
                    {selectedFilter === "all"
                      ? "You don't have any enquiries yet"
                      : `No ${selectedFilter} enquiries found`}
                  </ResponsiveText>
                </ResponsiveCard>
              ) : (
                filteredEnquiries.map((enquiry) => (
                  <EnquiryItem
                    key={enquiry.id}
                    enquiry={enquiry}
                    onPress={() => {
                      // Handle enquiry press - could open detail modal
                      console.log("Enquiry pressed:", enquiry.id);
                    }}
                  />
                ))
              )}
            </View>

            {/* Bottom Spacing */}
            <View style={styles.bottomSpacing} />
          </ScrollView>
        </View>
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
  },
  headerPlaceholder: {
    width: 40,
  },
  content: {
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
  enquiriesList: {
    marginTop: MARGIN.md,
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
  bottomSpacing: {
    height: 100,
  },
});
