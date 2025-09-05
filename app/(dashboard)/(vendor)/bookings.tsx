import { View, StyleSheet, ScrollView } from "react-native";
import { COLORS, MARGIN, PADDING, FONT_SIZE } from "../../../constants";
import {
  ResponsiveText,
  ResponsiveCard,
  ResponsiveButton,
} from "../../../components";

export default function VendorBookingsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ResponsiveText variant="h2" weight="bold" color={COLORS.text.primary}>
          Incoming Bookings
        </ResponsiveText>
        <ResponsiveText variant="body1" color={COLORS.text.secondary}>
          Manage service requests
        </ResponsiveText>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statsSection}>
          <ResponsiveCard variant="elevated" style={styles.statCard}>
            <ResponsiveText
              variant="h2"
              weight="bold"
              color={COLORS.primary[300]}
            >
              0
            </ResponsiveText>
            <ResponsiveText variant="body2" color={COLORS.text.secondary}>
              Pending
            </ResponsiveText>
          </ResponsiveCard>
          <ResponsiveCard variant="elevated" style={styles.statCard}>
            <ResponsiveText
              variant="h2"
              weight="bold"
              color={COLORS.success[300]}
            >
              0
            </ResponsiveText>
            <ResponsiveText variant="body2" color={COLORS.text.secondary}>
              Confirmed
            </ResponsiveText>
          </ResponsiveCard>
          <ResponsiveCard variant="elevated" style={styles.statCard}>
            <ResponsiveText variant="h2" weight="bold" color={COLORS.info[300]}>
              0
            </ResponsiveText>
            <ResponsiveText variant="body2" color={COLORS.text.secondary}>
              Completed
            </ResponsiveText>
          </ResponsiveCard>
        </View>

        <View style={styles.bookingsSection}>
          <ResponsiveText
            variant="h3"
            weight="bold"
            color={COLORS.text.primary}
          >
            Recent Bookings
          </ResponsiveText>
          <ResponsiveCard variant="elevated" style={styles.emptyState}>
            <ResponsiveText variant="h1" style={styles.emptyIcon}>
              📅
            </ResponsiveText>
            <ResponsiveText
              variant="h4"
              weight="bold"
              color={COLORS.text.primary}
            >
              No bookings yet
            </ResponsiveText>
            <ResponsiveText
              variant="body2"
              color={COLORS.text.secondary}
              style={styles.emptySubtitle}
            >
              Bookings will appear here when customers make requests
            </ResponsiveText>
          </ResponsiveCard>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    padding: PADDING.lg,
    paddingTop: 60,
    backgroundColor: COLORS.primary[100],
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  content: {
    flex: 1,
  },
  statsSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    paddingBottom: 0,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primary[200],
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    textAlign: "center",
  },
  bookingsSection: {
    padding: 20,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text.primary,
    marginBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: "center",
  },
});
