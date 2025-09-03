import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ResponsiveText, BackButton } from '@/components';
import { COLORS } from '@/constants';
import { responsiveSpacing, responsiveScale } from '@/constants';

interface AuthHeaderProps {
  selectedRole: string;
  onBackPress: () => void;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ selectedRole, onBackPress }) => {
  return (
    <View style={styles.container}>
      <BackButton
        onPress={onBackPress}
        variant="default"
        size="medium"
        title="Back"
        showIcon={true}
        showText={true}
      />
      
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
  roleText: {
    textAlign: 'center',
    flex: 1,
  },
  spacer: {
    width: responsiveScale(50),
  },
});

export default AuthHeader;
