import React, { useState } from "react";
import { View, KeyboardAvoidingView, Platform, Image } from "react-native";
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

export default function AuthScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

  const selectedRole = (params.role as string) || "user";

  const handleTabChange = (tab: "login" | "signup") => {
    setActiveTab(tab);
  };

  const handleAuthSubmit = (
    email: string,
    password: string,
    confirmPassword?: string,
    fullName?: string,
    phone?: string
  ) => {
    // TODO: Implement authentication logic
    if (activeTab === "login") {
      console.log("Login:", { email, password, selectedRole });

      // Temporarily redirect to vendor home screen for testing
      // Later this will be dynamic based on user role and authentication status
      router.replace("/(dashboard)/(vendor)/dashboard");
    } else {
      console.log("Signup:", {
        email,
        password,
        confirmPassword,
        fullName,
        phone,
        selectedRole,
      });

      // Temporarily redirect to vendor home screen for testing
      // Later this will be dynamic based on user role and authentication status
      router.replace("/(dashboard)/(vendor)/dashboard");
    }
  };

  const handleGooglePress = () => {
    // TODO: Implement Google OAuth
    console.log("Google OAuth pressed");

    // Temporarily redirect to vendor home screen for testing
    // Later this will be dynamic based on user role and authentication status
    router.replace("/(dashboard)/(vendor)/dashboard");
  };

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
              <AuthForm activeTab={activeTab} onSubmit={handleAuthSubmit} />

              <AuthButtons onGooglePress={handleGooglePress} />
            </ResponsiveCard>
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>
    </>
  );
}
