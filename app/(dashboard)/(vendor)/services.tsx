import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../../../constants';

export default function VendorServicesScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Services</Text>
        <Text style={styles.subtitle}>Manage your offerings</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>➕ Add New Service</Text>
        </TouchableOpacity>
        
        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>Active Services</Text>
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🛠️</Text>
            <Text style={styles.emptyTitle}>No services yet</Text>
            <Text style={styles.emptySubtitle}>Start by adding your first service</Text>
          </View>
        </View>
        
        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>Draft Services</Text>
          <Text style={styles.placeholderText}>Draft services will appear here</Text>
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
  addButton: {
    backgroundColor: COLORS.success[500],
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: COLORS.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  servicesSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 16,
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
  placeholderText: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
