import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../../../constants';

export default function SalesmanDashboardScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sales Dashboard</Text>
        <Text style={styles.subtitle}>Track your performance</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Vendors Onboarded</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Users Onboarded</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>₹0</Text>
            <Text style={styles.statLabel}>Commission</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0%</Text>
            <Text style={styles.statLabel}>Target Achievement</Text>
          </View>
        </View>
        
        <View style={styles.targetsSection}>
          <Text style={styles.sectionTitle}>Monthly Targets</Text>
          <View style={styles.targetCard}>
            <Text style={styles.targetLabel}>Vendor Target</Text>
            <View style={styles.targetProgress}>
              <Text style={styles.targetCurrent}>0</Text>
              <Text style={styles.targetSeparator}>/</Text>
              <Text style={styles.targetTotal}>25</Text>
            </View>
          </View>
          <View style={styles.targetCard}>
            <Text style={styles.targetLabel}>User Target</Text>
            <View style={styles.targetProgress}>
              <Text style={styles.targetCurrent}>0</Text>
              <Text style={styles.targetSeparator}>/</Text>
              <Text style={styles.targetTotal}>100</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📈</Text>
            <Text style={styles.emptyTitle}>No recent activity</Text>
            <Text style={styles.emptySubtitle}>Start onboarding vendors and users</Text>
          </View>
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
    padding: 20,
    paddingTop: 60,
    backgroundColor: COLORS.primary[100],
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 0,
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.background.secondary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary[200],
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  targetsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  targetCard: {
    backgroundColor: COLORS.info[50],
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.info[200],
  },
  targetLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.info[700],
    marginBottom: 8,
  },
  targetProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetCurrent: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.info[600],
  },
  targetSeparator: {
    fontSize: 24,
    color: COLORS.info[400],
    marginHorizontal: 8,
  },
  targetTotal: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.info[800],
  },
  recentSection: {
    padding: 20,
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
});
