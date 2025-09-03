import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../../../constants';

export default function UserServicesScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Services</Text>
        <Text style={styles.subtitle}>Find what you need</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.searchSection}>
          <Text style={styles.placeholderText}>Search bar will be here</Text>
        </View>
        
        <View style={styles.filtersSection}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterChip}>
              <Text style={styles.filterText}>All</Text>
            </View>
            <View style={styles.filterChip}>
              <Text style={styles.filterText}>Healthcare</Text>
            </View>
            <View style={styles.filterChip}>
              <Text style={styles.filterText}>Fitness</Text>
            </View>
            <View style={styles.filterChip}>
              <Text style={styles.filterText}>Beauty</Text>
            </View>
          </ScrollView>
        </View>
        
        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>Available Services</Text>
          <Text style={styles.placeholderText}>Service listings will appear here</Text>
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
  searchSection: {
    padding: 20,
    backgroundColor: COLORS.background.secondary,
    margin: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  filtersSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  filterChip: {
    backgroundColor: COLORS.primary[100],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.primary[200],
  },
  filterText: {
    color: COLORS.primary[300],
    fontSize: 14,
    fontWeight: '500',
  },
  servicesSection: {
    padding: 20,
  },
  placeholderText: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
