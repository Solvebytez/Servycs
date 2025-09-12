import React, { useState } from "react";
import { View, StyleSheet, Image, Alert } from "react-native";
import { ResponsiveButton } from "@/components/UI/ResponsiveButton";
import { ResponsiveText } from "@/components/UI/ResponsiveText";
import { COLORS } from "@/constants";
import { responsiveSpacing, responsiveScale } from "@/constants";
import { handleGoogleSignIn } from "@/utils/googleAuthUtils";

interface AuthButtonsProps {
  onGooglePress?: () => void; // Made optional since we'll handle it internally
}

export const AuthButtons: React.FC<AuthButtonsProps> = ({ onGooglePress }) => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGooglePress = async () => {
    if (isGoogleLoading) return; // Prevent multiple taps

    setIsGoogleLoading(true);

    try {
      // If custom handler is provided, use it
      if (onGooglePress) {
        onGooglePress();
        return;
      }

      // Otherwise, use our Google Sign-In handler
      await handleGoogleSignIn();
    } catch (error: any) {
      console.error("Google Sign-In error:", error);

      // Show error to user
      Alert.alert(
        "Google Sign-In Error",
        error.message || "Failed to sign in with Google. Please try again."
      );
    } finally {
      setIsGoogleLoading(false);
    }
  };

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
        title={isGoogleLoading ? "Signing in..." : "Continue with Google"}
        variant="outline"
        size="medium"
        fullWidth
        onPress={handleGooglePress}
        disabled={isGoogleLoading}
        style={styles.googleButton}
        textStyle={styles.googleButtonText}
        leftIcon={
          <Image
            source={require("../../../assets/google-icon.png")}
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
    width: "100%",
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
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
