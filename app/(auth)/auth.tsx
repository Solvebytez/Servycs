import React, { useState, useEffect } from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ResponsiveText,
  ResponsiveCard,
  ResponsiveButton,
  GlobalStatusBar,
} from "@/components";
import {
  COLORS,
  PADDING,
  FONT_SIZE,
  LINE_HEIGHT,
  FONT_FAMILY,
  responsiveSpacing,
  responsiveScale,
} from "@/constants";
import { AuthHeader, AuthTabs, AuthForm, AuthButtons } from "./components";
import {
  authHandle,
  registerHandle,
  navigateToDashboard,
} from "@/utils/authUtils";

export default function AuthScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [isLoading, setIsLoading] = useState(false);

  const selectedRole = (params.role as string) || "user";

  const handleTabChange = (tab: "login" | "signup") => {
    setActiveTab(tab);
  };

  const handleAuthSubmit = async (
    email: string,
    password: string,
    confirmPassword?: string,
    fullName?: string,
    phone?: string
  ) => {
    if (isLoading) return; // Prevent multiple submissions

    setIsLoading(true);

    try {
      const userData = {
        name: fullName || email.split("@")[0] || "User",
        email: email.toLowerCase().trim(),
        avatar: "",
        provider: "LOCAL" as const,
        phone: phone || "", // Include phone field
      };

      let response;
      if (activeTab === "login") {
        console.log("Attempting login:", { email, selectedRole });
        // Add password to userData for login
        const loginUserData = {
          ...userData,
          password: password, // Include password for validation
        };
        response = await authHandle(loginUserData);
      } else {
        console.log("Attempting registration:", {
          email,
          fullName,
          phone,
          selectedRole,
        });
        // Add password to userData for registration
        const registerUserData = {
          ...userData,
          password: password, // Include password for registration
        };
        response = await registerHandle(registerUserData);
      }

      if (response.success) {
        console.log("Authentication successful:", response.data.user);

        if (activeTab === "login") {
          // For login, navigate to dashboard directly
          const userRole = response.data.user.role || selectedRole;
          navigateToDashboard(userRole);
        } else {
          // For registration, check if email verification is needed
          const user = response.data.user;
          if (user.provider === "LOCAL" && !user.isEmailVerified) {
            // Redirect to OTP verification screen
            router.push({
              pathname: "/(auth)/otp-verification",
              params: { email: user.email },
            });
          } else {
            // Navigate to dashboard for verified users
            const userRole = user.role || selectedRole;
            navigateToDashboard(userRole);
          }
        }
      } else {
        throw new Error(response.message || "Authentication failed");
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      Alert.alert(
        "Authentication Error",
        error.message ||
          "An error occurred during authentication. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sign-In is now handled by AuthButtons component
  // No need for a separate handler here

  const handleBackToRoleSelection = () => {
    router.back();
  };

  return (
    <>
      <GlobalStatusBar />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <LinearGradient
          colors={[COLORS.primary[200], "#E0F7FF", COLORS.white]}
          style={{ flex: 1 }}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          locations={[0, 0.7, 1]}
        >
          {/* Main Content */}
          <View
            style={{
              flex: 1,
              paddingHorizontal: responsiveSpacing(PADDING.screen),
              paddingTop: responsiveSpacing(40),
            }}
          >
            <AuthHeader
              selectedRole={selectedRole}
              onBackPress={handleBackToRoleSelection}
            />

            {/* Logo Section - Centered */}
            <View
              style={{
                alignItems: "center",
                marginBottom: responsiveSpacing(15),
              }}
            >
              <Image
                source={require("../../assets/logo.png")}
                style={{
                  width: responsiveScale(120),
                  height: responsiveScale(120),
                }}
                resizeMode="contain"
              />
            </View>

            <AuthTabs activeTab={activeTab} onTabChange={handleTabChange} />
            <ResponsiveCard
              variant="elevated"
              size="auto"
              padding="large"
              margin="none"
              style={{
                borderRadius: responsiveScale(25),
                alignSelf: "center",
                width: "100%",
              }}
            >
              <AuthForm
                activeTab={activeTab}
                isLoading={isLoading}
                onSubmit={handleAuthSubmit}
              />

              <AuthButtons />
            </ResponsiveCard>
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>
    </>
  );
}
