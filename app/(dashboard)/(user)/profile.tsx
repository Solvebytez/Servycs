import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, FONT_SIZE, MARGIN, PADDING } from '../../../constants';

export default function UserProfileScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Manage your account</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>John Doe</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>john@example.com</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Change Password</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Privacy Settings</Text>
          </TouchableOpacity>
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
    marginBottom: MARGIN.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: MARGIN.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  label: {
    fontSize: FONT_SIZE.body1,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  value: {
    fontSize: FONT_SIZE.body1,
    color: COLORS.text.secondary,
  },
  settingItem: {
    paddingVertical: MARGIN.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  settingText: {
    fontSize: FONT_SIZE.body1,
    color: COLORS.text.primary,
  },
});
