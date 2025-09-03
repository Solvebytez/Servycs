import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS, FONT_SIZE, MARGIN, PADDING } from '../../../constants';

export default function UserHomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Discover amazing services</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Services</Text>
          <Text style={styles.sectionText}>No recent services found</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <Text style={styles.sectionText}>Browse services, make bookings</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    padding: PADDING.large,
    paddingTop: 60,
    backgroundColor: COLORS.primary[100],
  },
  title: {
    fontSize: FONT_SIZE.h1,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: MARGIN.sm,
  },
  subtitle: {
    fontSize: FONT_SIZE.body1,
    color: COLORS.text.secondary,
  },
  content: {
    padding: PADDING.large,
  },
  section: {
    marginBottom: MARGIN.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.h3,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: MARGIN.sm,
  },
  sectionText: {
    fontSize: FONT_SIZE.body1,
    color: COLORS.text.secondary,
  },
});
