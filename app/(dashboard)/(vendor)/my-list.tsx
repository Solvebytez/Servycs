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
  VendorListCard,
  VendorListFilterBar,
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

// Import the VendorServiceListing type from VendorListCard
import { VendorServiceListing } from "@/components/vendor/VendorListCard";

export default function MyListScreen() {
  const router = useRouter();
  const [listings, setListings] = useState<VendorServiceListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "live" | "pending" | "inactive"
  >("all");

  // Mock data for service listings
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setIsLoading(true);
        // TODO: Implement actual API call when backend is ready
        // const response = await serviceService.getMyListings();
        // setListings(response.data);

        // Mock data for UI development
        setListings([
          {
            id: "1",
            title: "Swedish Massage",
            description:
              "Relaxing full-body massage using long strokes and kneading techniques",
            price: "$95",
            originalPrice: "$120",
            category: "Massage Therapy",
            status: "active",
            rating: 4.8,
            reviewCount: 156,
            views: 342,
            imageUrl:
              "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&h=300&fit=crop",
            badges: ["Live", "Best Seller", "Popular"],
            createdAt: "2024-01-15T10:00:00Z",
            updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          },
          {
            id: "2",
            title: "Deep Tissue Massage",
            description:
              "Intensive massage targeting deeper layers of muscle and connective tissue",
            price: "$140",
            category: "Massage Therapy",
            status: "active",
            rating: 4.6,
            reviewCount: 89,
            views: 198,
            imageUrl:
              "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
            badges: ["Live", "Trending"],
            createdAt: "2024-01-10T09:00:00Z",
            updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          },
          {
            id: "3",
            title: "Hydrating Facial",
            description:
              "Deep cleansing and hydrating facial treatment for glowing skin",
            price: "$95",
            category: "Facial Treatment",
            status: "pending",
            rating: 0,
            reviewCount: 0,
            views: 0,
            imageUrl:
              "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400&h=300&fit=crop",
            badges: ["Pending Approval", "New"],
            createdAt: "2024-01-25T15:00:00Z",
            updatedAt: "2024-01-25T15:00:00Z",
          },
          {
            id: "4",
            title: "Hot Stone Therapy",
            description:
              "Therapeutic massage using heated stones to relax muscles and improve circulation",
            price: "$120",
            category: "Massage Therapy",
            status: "active",
            rating: 4.9,
            reviewCount: 18,
            views: 156,
            imageUrl:
              "https://images.unsplash.com/photo-1596178060810-4d0b5b3b3b3b?w=400&h=300&fit=crop",
            badges: ["Live"],
            createdAt: "2024-01-05T11:00:00Z",
            updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
          },
          {
            id: "5",
            title: "Aromatherapy Session",
            description:
              "Relaxing massage with essential oils for stress relief and wellness",
            price: "$85",
            category: "Wellness",
            status: "inactive",
            rating: 4.5,
            reviewCount: 12,
            views: 89,
            imageUrl:
              "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=400&h=300&fit=crop",
            badges: [],
            createdAt: "2023-12-20T08:00:00Z",
            updatedAt: "2024-01-10T12:00:00Z",
          },
        ]);
      } catch (error) {
        console.error("Error fetching listings:", error);
        Alert.alert("Error", "Failed to load your listings. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, []);

  // Filter listings
  const filteredListings = React.useMemo(() => {
    let filtered = listings;

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((listing) => listing.status === filterStatus);
    }

    return filtered;
  }, [listings, filterStatus]);

  const handleListingPress = (listing: VendorServiceListing) => {
    // TODO: Navigate to listing details screen
    Alert.alert("Listing Details", `View details for ${listing.title}`, [
      { text: "Cancel", style: "cancel" },
      { text: "View", onPress: () => console.log("View listing:", listing.id) },
    ]);
  };

  const handleEditListing = (listing: VendorServiceListing) => {
    // TODO: Navigate to edit listing screen
    Alert.alert("Edit Listing", `Edit ${listing.title}`, [
      { text: "Cancel", style: "cancel" },
      { text: "Edit", onPress: () => console.log("Edit listing:", listing.id) },
    ]);
  };

  const handleToggleStatus = (listing: VendorServiceListing) => {
    const newStatus = listing.status === "active" ? "inactive" : "active";
    const action = newStatus === "active" ? "activate" : "deactivate";

    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Listing`,
      `Are you sure you want to ${action} "${listing.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          onPress: () => {
            setListings((prev) =>
              prev.map((item) =>
                item.id === listing.id ? { ...item, status: newStatus } : item
              )
            );
          },
        },
      ]
    );
  };

  const handleDeleteListing = (listing: VendorServiceListing) => {
    Alert.alert(
      "Delete Listing",
      `Are you sure you want to delete "${listing.title}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setListings((prev) =>
              prev.filter((item) => item.id !== listing.id)
            );
          },
        },
      ]
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
            My Listings
          </ResponsiveText>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              router.push("/(dashboard)/(vendor)/add-listing");
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
        <VendorListFilterBar
          totalCount={listings.length}
          onStatusChange={setFilterStatus}
          currentStatus={filterStatus}
        />

        {/* Listings */}
        {isLoading ? (
          <ResponsiveCard variant="elevated" style={styles.loadingCard}>
            <ResponsiveText
              variant="body1"
              color={COLORS.text.secondary}
              style={styles.loadingText}
            >
              Loading your listings...
            </ResponsiveText>
          </ResponsiveCard>
        ) : filteredListings.length === 0 ? (
          <ResponsiveCard variant="elevated" style={styles.emptyCard}>
            <Ionicons
              name="list-outline"
              size={LAYOUT.iconLarge}
              color={COLORS.text.secondary}
            />
            <ResponsiveText
              variant="h6"
              weight="medium"
              color={COLORS.text.secondary}
              style={styles.emptyTitle}
            >
              No Listings Found
            </ResponsiveText>
            <ResponsiveText
              variant="body2"
              color={COLORS.text.secondary}
              style={styles.emptyDescription}
            >
              {filterStatus === "all"
                ? "Start by adding your first service listing"
                : `No listings found for the selected filter`}
            </ResponsiveText>
            {filterStatus === "all" && (
              <ResponsiveButton
                title="Add First Listing"
                variant="primary"
                size="medium"
                onPress={() => {
                  router.push("/(dashboard)/(vendor)/add-listing");
                }}
                style={styles.addFirstButton}
              />
            )}
          </ResponsiveCard>
        ) : (
          filteredListings.map((listing) => (
            <VendorListCard
              key={listing.id}
              listing={listing}
              onPress={handleListingPress}
            />
          ))
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
});
