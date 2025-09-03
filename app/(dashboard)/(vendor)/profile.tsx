import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../../../constants';

export default function VendorProfileScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>🏪</Text>
          </View>
          <Text style={styles.businessName}>Business Name</Text>
          <Text style={styles.businessEmail}>business@example.com</Text>
          <View style={styles.verificationBadge}>
            <Text style={styles.verificationText}>✓ Verified</Text>
          </View>
        </View>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business</Text>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Edit Business Profile</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Business Hours</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Location & Address</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services</Text>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Service Categories</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Pricing & Packages</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Change Password</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Notifications</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
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
  avatarSection: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary[200],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
  },
  businessName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  businessEmail: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginBottom: 12,
  },
  verificationBadge: {
    backgroundColor: COLORS.success[100],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.success[300],
  },
  verificationText: {
    color: COLORS.success[700],
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
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
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  menuText: {
    fontSize: 16,
    color: COLORS.text.primary,
  },
  menuArrow: {
    fontSize: 18,
    color: COLORS.text.secondary,
  },
  logoutButton: {
    margin: 20,
    backgroundColor: COLORS.error[500],
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: COLORS.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
});
