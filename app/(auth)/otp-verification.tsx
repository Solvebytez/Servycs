import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { authService } from "@/services/auth";
import {
  ResponsiveText,
  ResponsiveButton,
  GlobalStatusBar,
  BackButton,
} from "@/components";
import {
  COLORS,
  FONT_SIZE,
  PADDING,
  SPACING,
  BORDER_RADIUS,
  responsiveSpacing,
  responsiveScale,
  LINE_HEIGHT,
} from "@/constants";

interface OTPInputProps {
  length: number;
  value: string;
  onChangeText: (text: string) => void;
  disabled?: boolean;
}

const OTPInput: React.FC<OTPInputProps> = ({
  length,
  value,
  onChangeText,
  disabled = false,
}) => {
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const animatedValues = useRef(
    Array.from({ length }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    // Animate inputs on mount
    animatedValues.forEach((animValue, index) => {
      Animated.timing(animValue, {
        toValue: 1,
        duration: 300,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  const handleChangeText = (text: string, index: number) => {
    // Check if this looks like a pasted OTP (more than 1 character)
    if (text.length > 1) {
      // Remove any non-numeric characters and limit to 6 digits
      const cleanText = text.replace(/\D/g, "").slice(0, 6);

      // If pasted text is 6 digits, fill all inputs
      if (cleanText.length === 6) {
        onChangeText(cleanText);
        // Focus the last input
        inputRefs.current[length - 1]?.focus();
        return;
      } else if (cleanText.length > 1) {
        // If less than 6 digits, fill from current position
        const newValue = value.split("");
        for (let i = 0; i < cleanText.length && index + i < length; i++) {
          newValue[index + i] = cleanText[i];
        }
        onChangeText(newValue.join(""));

        // Focus the next empty input or the last filled input
        const nextIndex = Math.min(index + cleanText.length, length - 1);
        inputRefs.current[nextIndex]?.focus();
        return;
      }
    }

    // Normal single character input
    const newValue = value.split("");
    newValue[index] = text;
    const updatedValue = newValue.join("").slice(0, length);
    onChangeText(updatedValue);

    // Auto-focus next input
    if (text && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.otpContainer}>
      {Array.from({ length }, (_, index) => (
        <Animated.View
          key={index}
          style={[
            styles.otpInputWrapper,
            {
              opacity: animatedValues[index],
              transform: [
                {
                  scale: animatedValues[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <TextInput
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            style={[
              styles.otpInput,
              value[index] && styles.otpInputFilled,
              disabled && styles.otpInputDisabled,
            ]}
            value={value[index] || ""}
            onChangeText={(text) => handleChangeText(text, index)}
            onKeyPress={({ nativeEvent }) =>
              handleKeyPress(nativeEvent.key, index)
            }
            keyboardType="numeric"
            maxLength={6}
            editable={!disabled}
            selectTextOnFocus
            placeholder="•"
            placeholderTextColor={COLORS.text.light}
          />
        </Animated.View>
      ))}
    </View>
  );
};

export default function OTPVerificationScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Initial animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Pulse animation for timer
  useEffect(() => {
    if (timeLeft <= 60) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length !== 6) {
      Alert.alert("Error", "Please enter the complete 6-digit OTP code");
      return;
    }

    if (!email) {
      Alert.alert("Error", "Email not found. Please try registering again.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.verifyOTP(email, otpCode);

      if (response && (response as any).success) {
        Alert.alert(
          "Success",
          "Email verified successfully! Your account is now active. Please login to continue.",
          [
            {
              text: "Login",
              onPress: () => {
                // Navigate to login screen
                router.replace("/(auth)/auth");
              },
            },
          ]
        );
      } else {
        throw new Error(
          (response as any)?.message || "OTP verification failed"
        );
      }
    } catch (error: any) {
      console.error("OTP verification error:", error);
      Alert.alert(
        "Verification Failed",
        error.response?.data?.error ||
          error.message ||
          "Invalid OTP code. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      Alert.alert("Error", "Email not found. Please try registering again.");
      return;
    }

    setIsResending(true);

    try {
      const response = await authService.resendOTP(email);

      if (response && (response as any).success) {
        Alert.alert("Success", "New OTP sent to your email address");
        setOtpCode("");
        setTimeLeft(15 * 60);
        setCanResend(false);
      } else {
        throw new Error((response as any)?.message || "Failed to resend OTP");
      }
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      Alert.alert(
        "Resend Failed",
        error.response?.data?.error ||
          error.message ||
          "Failed to resend OTP. Please try again."
      );
    } finally {
      setIsResending(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <>
      <GlobalStatusBar />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <LinearGradient
          colors={[COLORS.primary[200], "#E0F7FF", COLORS.white]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          locations={[0, 0.7, 1]}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Header Section */}
            <Animated.View
              style={[
                styles.header,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.headerTop}>
                <BackButton
                  onPress={handleBack}
                  variant="default"
                  size="medium"
                  title="Back"
                  showIcon={true}
                  showText={true}
                />
                <View style={styles.spacer} />
              </View>

              {/* Illustration Section */}
              <View style={styles.illustrationSection}>
                <View style={styles.phoneIllustration}>
                  <Ionicons
                    name="phone-portrait"
                    size={60}
                    color={COLORS.primary[300]}
                  />
                  <View style={styles.envelopeIcon}>
                    <Ionicons
                      name="mail"
                      size={24}
                      color={COLORS.primary[500]}
                    />
                  </View>
                </View>
                {/* Decorative shapes */}
                <View style={styles.decorativeShapes}>
                  <View style={[styles.shape, styles.shape1]} />
                  <View style={[styles.shape, styles.shape2]} />
                  <View style={[styles.shape, styles.shape3]} />
                  <View style={[styles.shape, styles.shape4]} />
                </View>
              </View>

              <ResponsiveText style={styles.mainTitle}>
                OTP Verification
              </ResponsiveText>
              <View style={styles.emailContainer}>
                <ResponsiveText style={styles.email}>{email}</ResponsiveText>
              </View>
            </Animated.View>

            {/* OTP Section */}
            <Animated.View
              style={[
                styles.otpSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.otpCard}>
                <OTPInput
                  length={6}
                  value={otpCode}
                  onChangeText={setOtpCode}
                  disabled={isLoading}
                />
              </View>
            </Animated.View>

            {/* Timer Section */}
            <Animated.View
              style={[
                styles.timerSection,
                {
                  opacity: fadeAnim,
                  transform: [
                    { translateY: slideAnim },
                    { scale: timeLeft <= 60 ? pulseAnim : 1 },
                  ],
                },
              ]}
            >
              <View style={styles.timerCard}>
                <Ionicons
                  name={timeLeft > 0 ? "time-outline" : "alert-circle-outline"}
                  size={20}
                  color={timeLeft > 0 ? COLORS.success[500] : COLORS.error[500]}
                />
                {timeLeft > 0 ? (
                  <ResponsiveText style={styles.timerText}>
                    Code expires in {formatTime(timeLeft)}
                  </ResponsiveText>
                ) : (
                  <ResponsiveText style={styles.timerExpiredText}>
                    Code has expired. Please request a new one.
                  </ResponsiveText>
                )}
              </View>
            </Animated.View>

            {/* Button Section */}
            <Animated.View
              style={[
                styles.buttonSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <ResponsiveButton
                title={isLoading ? "Verifying..." : "Verify & Proceed"}
                variant="primary"
                size="large"
                fullWidth
                onPress={handleVerifyOTP}
                disabled={isLoading || otpCode.length !== 6}
                style={styles.verifyButton}
              />

              <View style={styles.resendSection}>
                <ResponsiveText style={styles.resendQuestion}>
                  Don't receive the OTP?{" "}
                </ResponsiveText>
                <TouchableOpacity
                  onPress={handleResendOTP}
                  disabled={!canResend || isResending}
                >
                  <ResponsiveText
                    style={[
                      styles.resendLink,
                      (!canResend || isResending) && styles.resendLinkDisabled,
                    ]}
                  >
                    RESEND OTP
                  </ResponsiveText>
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Help Section */}
            <Animated.View
              style={[
                styles.helpSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.helpCard}>
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color={COLORS.info[500]}
                />
                <ResponsiveText style={styles.helpText}>
                  Don't receive the OTP? Check your spam folder or try
                  resending.
                </ResponsiveText>
              </View>
            </Animated.View>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: responsiveSpacing(PADDING.screen),
    paddingTop: responsiveSpacing(40),
    paddingBottom: responsiveSpacing(SPACING.xl),
  },

  // Header Styles
  header: {
    alignItems: "center",
    marginBottom: responsiveSpacing(SPACING.xxl),
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: responsiveSpacing(-10),
    marginBottom: responsiveSpacing(-10),
  },
  headerTitle: {
    textAlign: "center",
    flex: 1,
  },
  spacer: {
    width: responsiveScale(50),
  },

  // Illustration Section Styles
  illustrationSection: {
    alignItems: "center",
    marginBottom: responsiveSpacing(SPACING.xl),
    position: "relative",
  },
  phoneIllustration: {
    width: 120,
    height: 120,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.primary[300],
    position: "relative",
  },
  envelopeIcon: {
    position: "absolute",
    bottom: 15,
    right: 15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },
  decorativeShapes: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  shape: {
    position: "absolute",
    borderRadius: 4,
  },
  shape1: {
    width: 8,
    height: 8,
    backgroundColor: COLORS.success[400],
    top: 20,
    right: 40,
    transform: [{ rotate: "45deg" }],
  },
  shape2: {
    width: 6,
    height: 6,
    backgroundColor: COLORS.error[400],
    bottom: 30,
    left: 30,
    borderRadius: 3,
  },
  shape3: {
    width: 10,
    height: 10,
    backgroundColor: COLORS.info[400],
    top: 60,
    left: 20,
    borderRadius: 5,
  },
  shape4: {
    width: 7,
    height: 7,
    backgroundColor: COLORS.warning[400],
    bottom: 20,
    right: 20,
    transform: [{ rotate: "30deg" }],
  },

  // Main Title Styles
  mainTitle: {
    fontSize: responsiveScale(FONT_SIZE.display3),
    fontWeight: "bold",
    color: COLORS.text.primary,
    textAlign: "center",
    marginBottom: responsiveSpacing(SPACING.md),
  },
  iconSection: {
    alignItems: "center",
    marginBottom: responsiveSpacing(SPACING.lg),
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: responsiveScale(FONT_SIZE.display3),
    fontWeight: "bold",
    color: COLORS.white,
    textAlign: "center",
    marginBottom: responsiveSpacing(SPACING.sm),
  },
  subtitle: {
    fontSize: responsiveScale(FONT_SIZE.body1),
    color: COLORS.white,
    textAlign: "center",
    marginBottom: responsiveSpacing(SPACING.md),
    lineHeight: LINE_HEIGHT.body1,
  },
  emailContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: responsiveSpacing(PADDING.md),
    paddingVertical: responsiveSpacing(PADDING.sm),
    borderRadius: BORDER_RADIUS.pill,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  email: {
    fontSize: responsiveScale(FONT_SIZE.body1),
    fontWeight: "600",
    color: COLORS.white,
    marginLeft: responsiveSpacing(SPACING.sm),
  },

  // OTP Section Styles
  otpSection: {
    alignItems: "center",
    marginBottom: responsiveSpacing(SPACING.lg),
  },
  otpCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.cardLarge,
    padding: responsiveSpacing(PADDING.lg),
    width: "100%",
    maxWidth: 400,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  otpLabel: {
    fontSize: responsiveScale(FONT_SIZE.h3),
    fontWeight: "700",
    color: COLORS.text.primary,
    textAlign: "center",
    marginBottom: responsiveSpacing(SPACING.lg),
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  otpInputWrapper: {
    flex: 1,
    marginHorizontal: 4,
  },
  otpInput: {
    height: 60,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    borderRadius: BORDER_RADIUS.md,
    textAlign: "center",
    fontSize: responsiveScale(FONT_SIZE.display3),
    fontWeight: "700",
    color: COLORS.text.primary,
    backgroundColor: COLORS.background.primary,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  otpInputFilled: {
    borderColor: COLORS.primary[500],
    backgroundColor: COLORS.primary[50],
    shadowColor: COLORS.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  otpInputDisabled: {
    backgroundColor: COLORS.background.light,
    borderColor: COLORS.border.medium,
    opacity: 0.6,
  },

  // Timer Section Styles
  timerSection: {
    alignItems: "center",
    marginBottom: responsiveSpacing(SPACING.lg),
  },
  timerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    paddingHorizontal: responsiveSpacing(PADDING.md),
    paddingVertical: responsiveSpacing(PADDING.sm),
    borderRadius: BORDER_RADIUS.pill,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timerText: {
    fontSize: responsiveScale(FONT_SIZE.body2),
    color: COLORS.text.primary,
    fontWeight: "600",
    marginLeft: responsiveSpacing(SPACING.sm),
  },
  timerExpiredText: {
    fontSize: responsiveScale(FONT_SIZE.body2),
    color: COLORS.error[500],
    fontWeight: "600",
    marginLeft: responsiveSpacing(SPACING.sm),
  },

  // Button Section Styles
  buttonSection: {
    marginBottom: responsiveSpacing(SPACING.lg),
  },
  verifyButton: {
    marginBottom: responsiveSpacing(SPACING.md),
  },
  resendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: responsiveSpacing(PADDING.md),
    paddingHorizontal: responsiveSpacing(PADDING.lg),
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    fontSize: responsiveScale(FONT_SIZE.body1),
    color: COLORS.primary[500],
    fontWeight: "600",
    marginLeft: responsiveSpacing(SPACING.sm),
  },
  resendButtonTextDisabled: {
    color: COLORS.text.disabled,
  },

  // Resend Section Styles
  resendSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: responsiveSpacing(SPACING.md),
  },
  resendQuestion: {
    fontSize: responsiveScale(FONT_SIZE.body2),
    color: COLORS.text.secondary,
  },
  resendLink: {
    fontSize: responsiveScale(FONT_SIZE.body2),
    color: COLORS.error[500],
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  resendLinkDisabled: {
    color: COLORS.text.disabled,
  },

  // Help Section Styles
  helpSection: {
    alignItems: "center",
    paddingHorizontal: responsiveSpacing(PADDING.md),
  },
  helpCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.info[50],
    paddingHorizontal: responsiveSpacing(PADDING.md),
    paddingVertical: responsiveSpacing(PADDING.md),
    borderRadius: BORDER_RADIUS.md,
    width: "100%",
    borderLeftWidth: 4,
    borderLeftColor: COLORS.info[500],
  },
  helpText: {
    fontSize: responsiveScale(FONT_SIZE.body2),
    color: COLORS.text.secondary,
    textAlign: "left",
    lineHeight: LINE_HEIGHT.body2,
    marginLeft: responsiveSpacing(SPACING.sm),
    flex: 1,
  },
});
