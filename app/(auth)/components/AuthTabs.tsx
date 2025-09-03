import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ResponsiveText } from '@/components/UI/ResponsiveText';
import { COLORS } from '@/constants';
import { responsiveSpacing, responsiveScale } from '@/constants';

interface AuthTabsProps {
  activeTab: 'login' | 'signup';
  onTabChange: (tab: 'login' | 'signup') => void;
}

export const AuthTabs: React.FC<AuthTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === 'login' && styles.activeTab
        ]}
        onPress={() => onTabChange('login')}
        activeOpacity={0.7}
      >
        <ResponsiveText
          variant="button"
          style={[
            styles.tabText,
            activeTab === 'login' && styles.activeTabText
          ]}
        >
          Login
        </ResponsiveText>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === 'signup' && styles.activeTab
        ]}
        onPress={() => onTabChange('signup')}
        activeOpacity={0.7}
      >
        <ResponsiveText
          variant="button"
          style={[
            styles.tabText,
            activeTab === 'signup' && styles.activeTabText
          ]}
        >
          Sign Up
        </ResponsiveText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.background.secondary,
    borderRadius: responsiveScale(12),
    padding: responsiveSpacing(4),
    marginBottom: responsiveSpacing(20),
  },
  tab: {
    flex: 1,
    paddingVertical: responsiveSpacing(12),
    paddingHorizontal: responsiveSpacing(16),
    borderRadius: responsiveScale(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: COLORS.primary[100],
    borderWidth: 1,
    borderColor: COLORS.primary[300],
  },
  tabText: {
    color: COLORS.black,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.white,
    fontWeight: '600',
  },
});

export default AuthTabs;
