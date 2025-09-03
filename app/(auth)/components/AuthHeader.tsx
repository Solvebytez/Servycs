import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ResponsiveText } from '@/components';
import { COLORS } from '@/constants';
import { responsiveSpacing, responsiveScale } from '@/constants';

interface AuthHeaderProps {
  selectedRole: string;
  onBackPress: () => void;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ selectedRole, onBackPress }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={onBackPress}
        style={styles.backButton}
        activeOpacity={0.7}
      >
        <View style={styles.backButtonContent}>
          <Ionicons 
            name="chevron-back" 
            size={responsiveScale(20)} 
            color={COLORS.white} 
            style={styles.backIcon}
          />
          <ResponsiveText
            variant="buttonSmall"
            weight="semiBold"
            color={COLORS.white}
          >
            Back
          </ResponsiveText>
        </View>
      </TouchableOpacity>
      
      <ResponsiveText
        variant="h4"
        weight="bold"
        color={COLORS.white}
        transform="capitalize"
        style={styles.roleText}
      >
        As {selectedRole || 'User'}
      </ResponsiveText>
      
      <View style={styles.spacer} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    marginTop: responsiveSpacing(-10),
    marginBottom: responsiveSpacing(-10),
  },
  backButton: {
    padding: responsiveSpacing(12),
    borderRadius: responsiveScale(8),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    minHeight: responsiveScale(40),
    justifyContent: 'center',
  },
  backButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    marginRight: responsiveSpacing(4),
  },
  roleText: {
    textAlign: 'center',
    flex: 1,
  },
  spacer: {
    width: responsiveScale(50),
  },
});

export default AuthHeader;
