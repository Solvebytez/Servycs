import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { ResponsiveButton } from '@/components/UI/ResponsiveButton';
import { ResponsiveText } from '@/components/UI/ResponsiveText';
import { COLORS } from '@/constants';
import { responsiveSpacing, responsiveScale } from '@/constants';

interface AuthButtonsProps {
  onGooglePress: () => void;
}

export const AuthButtons: React.FC<AuthButtonsProps> = ({ onGooglePress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.separatorContainer}>
        <View style={styles.separatorLine} />
        <ResponsiveText variant="body2" style={styles.separatorText}>
          or
        </ResponsiveText>
        <View style={styles.separatorLine} />
      </View>

      <ResponsiveButton
        title="Continue with Google"
        variant="outline"
        size="medium"
        fullWidth
        onPress={onGooglePress}
        style={styles.googleButton}
        textStyle={styles.googleButtonText}
        leftIcon={
          <Image 
            source={require('../../../assets/google-icon.png')} 
            style={styles.googleIcon}
            resizeMode="contain"
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: responsiveSpacing(20),
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border.medium,
  },
  separatorText: {
    color: COLORS.text.secondary,
    marginHorizontal: responsiveSpacing(16),
  },
  googleButton: {
    borderColor: COLORS.black,
    borderWidth: 1,
    backgroundColor: COLORS.background.primary,
  },
  googleButtonText: {
    color: COLORS.black,
    fontSize: responsiveScale(16), // Assuming responsiveScale is available
  },
  googleIcon: {
    width: responsiveScale(20), // Assuming responsiveScale is available
    height: responsiveScale(20), // Assuming responsiveScale is available
    marginRight: responsiveSpacing(5),
  },
});

export default AuthButtons;
