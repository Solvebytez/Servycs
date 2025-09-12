import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  ResponsiveText,
  ResponsiveCard,
  ResponsiveButton,
  GlobalStatusBar,
  AppHeader,
} from "@/components";
import {
  COLORS,
  FONT_SIZE,
  MARGIN,
  PADDING,
  BORDER_RADIUS,
  LAYOUT,
  LINE_HEIGHT,
} from "@/constants";
import {
  useProfile,
  useUpdateProfile,
  isUserProfile,
} from "../../../hooks/useProfile";

// Validation schema for user profile
const userProfileSchema = yup.object({
  name: yup
    .string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup
    .string()
    .required("Phone number is required")
    .min(10, "Phone must be at least 10 digits"),
  primaryAddress: yup
    .string()
    .min(10, "Landmark must be at least 10 characters"),
  primaryCity: yup.string().required("City is required"),
  primaryState: yup.string().required("State is required"),
  primaryZipCode: yup.string().required("Zip code is required"),
  primaryCountry: yup.string().required("Country is required"),
});

type UserProfileFormData = yup.InferType<typeof userProfileSchema>;

export default function UserEditProfileScreen() {
  const router = useRouter();

  // Use TanStack Query hooks
  const {
    data: profileData,
    isLoading: isLoadingProfile,
    error: profileError,
  } = useProfile();
  const updateProfileMutation = useUpdateProfile();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<UserProfileFormData>({
    resolver: yupResolver(userProfileSchema) as any,
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      primaryAddress: "",
      primaryCity: "",
      primaryState: "",
      primaryZipCode: "",
      primaryCountry: "India",
    },
  });

  // Update form when profile data is loaded
  useEffect(() => {
    if (profileData && isUserProfile(profileData)) {
      reset({
        name: profileData.name || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        primaryAddress: profileData.primaryAddress || "",
        primaryCity: profileData.primaryCity || "",
        primaryState: profileData.primaryState || "",
        primaryZipCode: profileData.primaryZipCode || "",
        primaryCountry: profileData.primaryCountry || "India",
      });
    }
  }, [profileData, reset]);

  const handleImagePicker = () => {
    // TODO: Implement image picker functionality
    Alert.alert(
      "Image Picker",
      "Image picker functionality will be implemented"
    );
  };

  const onSubmit = async (data: any) => {
    try {
      console.log("User profile data:", data);

      await updateProfileMutation.mutateAsync(data);

      Alert.alert("Success", "Profile updated successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    }
  };

  const handleCancel = () => {
    Alert.alert(
      "Discard Changes",
      "Are you sure you want to discard your changes?",
      [
        { text: "Keep Editing", style: "cancel" },
        { text: "Discard", style: "destructive", onPress: () => router.back() },
      ]
    );
  };

  return (
    <>
      <GlobalStatusBar />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <AppHeader onBackPress={handleCancel} title="Edit Profile" />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Picture Section */}
          <ResponsiveCard variant="elevated" style={styles.profileCard}>
            <View style={styles.profilePictureSection}>
              <ResponsiveText
                variant="h6"
                weight="bold"
                color={COLORS.text.primary}
                style={styles.sectionTitle}
              >
                Profile Picture
              </ResponsiveText>

              <View style={styles.avatarContainer}>
                <View style={styles.avatarPlaceholder}>
                  <Ionicons
                    name="person"
                    size={40}
                    color={COLORS.text.secondary}
                  />
                </View>
                <TouchableOpacity
                  style={styles.editAvatarButton}
                  onPress={handleImagePicker}
                >
                  <Ionicons name="camera" size={16} color={COLORS.white} />
                </TouchableOpacity>
              </View>

              <ResponsiveText
                variant="caption2"
                color={COLORS.text.secondary}
                style={styles.avatarHint}
              >
                Tap to change profile picture
              </ResponsiveText>
            </View>
          </ResponsiveCard>

          {/* Personal Information Form */}
          <ResponsiveCard variant="elevated" style={styles.formCard}>
            <ResponsiveText
              variant="h6"
              weight="bold"
              color={COLORS.text.primary}
              style={styles.sectionTitle}
            >
              Personal Information
            </ResponsiveText>

            {/* Name Field */}
            <View style={styles.inputGroup}>
              <ResponsiveText
                variant="inputLabel"
                weight="medium"
                color={COLORS.text.primary}
                style={styles.inputLabel}
              >
                Full Name *
              </ResponsiveText>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.textInput, errors.name && styles.inputError]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="Enter your full name"
                    placeholderTextColor={COLORS.text.secondary}
                  />
                )}
              />
              {errors.name && (
                <ResponsiveText variant="inputHelper" color={COLORS.error[500]}>
                  {errors.name.message}
                </ResponsiveText>
              )}
            </View>

            {/* Email Field */}
            <View style={styles.inputGroup}>
              <ResponsiveText
                variant="inputLabel"
                weight="medium"
                color={COLORS.text.primary}
                style={styles.inputLabel}
              >
                Email Address *
              </ResponsiveText>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.textInput,
                      errors.email && styles.inputError,
                    ]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="Enter your email"
                    placeholderTextColor={COLORS.text.secondary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                )}
              />
              {errors.email && (
                <ResponsiveText variant="inputHelper" color={COLORS.error[500]}>
                  {errors.email.message}
                </ResponsiveText>
              )}
            </View>

            {/* Phone Field */}
            <View style={styles.inputGroup}>
              <ResponsiveText
                variant="inputLabel"
                weight="medium"
                color={COLORS.text.primary}
                style={styles.inputLabel}
              >
                Phone Number *
              </ResponsiveText>
              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.textInput,
                      errors.phone && styles.inputError,
                    ]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="Enter your phone number"
                    placeholderTextColor={COLORS.text.secondary}
                    keyboardType="phone-pad"
                  />
                )}
              />
              {errors.phone && (
                <ResponsiveText variant="inputHelper" color={COLORS.error[500]}>
                  {errors.phone.message}
                </ResponsiveText>
              )}
            </View>

            {/* City, State, Zip Code Row */}
            <View style={styles.rowContainer}>
              <View style={[styles.inputGroup, styles.flex1]}>
                <ResponsiveText
                  variant="inputLabel"
                  weight="medium"
                  color={COLORS.text.primary}
                  style={styles.inputLabel}
                >
                  City
                </ResponsiveText>
                <Controller
                  control={control}
                  name="primaryCity"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[
                        styles.textInput,
                        errors.primaryCity && styles.inputError,
                      ]}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      placeholder="City"
                      placeholderTextColor={COLORS.text.secondary}
                    />
                  )}
                />
                {errors.primaryCity && (
                  <ResponsiveText
                    variant="inputHelper"
                    color={COLORS.error[500]}
                  >
                    {errors.primaryCity.message}
                  </ResponsiveText>
                )}
              </View>

              <View
                style={[styles.inputGroup, styles.flex1, { marginLeft: 10 }]}
              >
                <ResponsiveText
                  variant="inputLabel"
                  weight="medium"
                  color={COLORS.text.primary}
                  style={styles.inputLabel}
                >
                  State
                </ResponsiveText>
                <Controller
                  control={control}
                  name="primaryState"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[
                        styles.textInput,
                        errors.primaryState && styles.inputError,
                      ]}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      placeholder="State"
                      placeholderTextColor={COLORS.text.secondary}
                    />
                  )}
                />
                {errors.primaryState && (
                  <ResponsiveText
                    variant="inputHelper"
                    color={COLORS.error[500]}
                  >
                    {errors.primaryState.message}
                  </ResponsiveText>
                )}
              </View>
            </View>

            {/* Zip Code and Country Row */}
            <View style={styles.rowContainer}>
              <View style={[styles.inputGroup, styles.flex1]}>
                <ResponsiveText
                  variant="inputLabel"
                  weight="medium"
                  color={COLORS.text.primary}
                  style={styles.inputLabel}
                >
                  Zip Code
                </ResponsiveText>
                <Controller
                  control={control}
                  name="primaryZipCode"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[
                        styles.textInput,
                        errors.primaryZipCode && styles.inputError,
                      ]}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      placeholder="Zip Code"
                      placeholderTextColor={COLORS.text.secondary}
                    />
                  )}
                />
                {errors.primaryZipCode && (
                  <ResponsiveText
                    variant="inputHelper"
                    color={COLORS.error[500]}
                  >
                    {errors.primaryZipCode.message}
                  </ResponsiveText>
                )}
              </View>

              <View
                style={[styles.inputGroup, styles.flex1, { marginLeft: 10 }]}
              >
                <ResponsiveText
                  variant="inputLabel"
                  weight="medium"
                  color={COLORS.text.primary}
                  style={styles.inputLabel}
                >
                  Country
                </ResponsiveText>
                <Controller
                  control={control}
                  name="primaryCountry"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[
                        styles.textInput,
                        errors.primaryCountry && styles.inputError,
                      ]}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      placeholder="Country"
                      placeholderTextColor={COLORS.text.secondary}
                    />
                  )}
                />
                {errors.primaryCountry && (
                  <ResponsiveText
                    variant="inputHelper"
                    color={COLORS.error[500]}
                  >
                    {errors.primaryCountry.message}
                  </ResponsiveText>
                )}
              </View>
            </View>

            {/* Landmark Field */}
            <View style={styles.inputGroup}>
              <ResponsiveText
                variant="inputLabel"
                weight="medium"
                color={COLORS.text.primary}
                style={styles.inputLabel}
              >
                Landmark
              </ResponsiveText>
              <Controller
                control={control}
                name="primaryAddress"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.textInput,
                      styles.textArea,
                      errors.primaryAddress && styles.inputError,
                    ]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="Enter your landmark"
                    placeholderTextColor={COLORS.text.secondary}
                    multiline
                    numberOfLines={2}
                  />
                )}
              />
              {errors.primaryAddress && (
                <ResponsiveText variant="inputHelper" color={COLORS.error[500]}>
                  {errors.primaryAddress.message}
                </ResponsiveText>
              )}
            </View>
          </ResponsiveCard>
        </ScrollView>

        {/* Fixed Footer Action Buttons */}
        <View style={styles.fixedFooter}>
          <View style={styles.buttonContainer}>
            <ResponsiveButton
              title="Cancel"
              variant="outline"
              size="medium"
              onPress={handleCancel}
              leftIcon={
                <Ionicons name="close" size={20} color={COLORS.error[500]} />
              }
              style={[styles.cancelButton, styles.halfWidthButton] as any}
              textStyle={styles.cancelButtonText}
            />

            <ResponsiveButton
              title={
                updateProfileMutation.isPending ? "Saving..." : "Save Changes"
              }
              variant="primary"
              size="medium"
              onPress={handleSubmit(onSubmit)}
              disabled={updateProfileMutation.isPending || isLoadingProfile}
              style={[styles.saveButton, styles.halfWidthButton] as any}
            />
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: PADDING.screen,
    paddingBottom: 150, // Add padding for fixed footer
  },
  profileCard: {
    marginTop: MARGIN.lg,
    marginBottom: MARGIN.md,
  },
  profilePictureSection: {
    alignItems: "center",
    paddingVertical: MARGIN.md,
  },
  sectionTitle: {
    marginBottom: MARGIN.lg,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: MARGIN.sm,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.neutral[100],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.border.light,
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary[300],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  avatarHint: {
    textAlign: "center",
  },
  formCard: {
    marginBottom: MARGIN.md,
  },
  inputGroup: {
    marginBottom: MARGIN.lg,
  },
  inputLabel: {
    marginBottom: MARGIN.xs,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.black,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.text.primary,
    backgroundColor: COLORS.background.primary,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: COLORS.error[500],
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: MARGIN.xs,
    gap: MARGIN.md,
  },
  halfWidthButton: {
    flex: 1,
    minHeight: LAYOUT.buttonHeight,
    paddingVertical: PADDING.button,
  },
  cancelButton: {
    borderColor: COLORS.error[500],
    borderWidth: 1,
    backgroundColor: COLORS.background.primary,
  },
  cancelButtonText: {
    color: COLORS.error[500],
    fontSize: FONT_SIZE.button,
    lineHeight: LINE_HEIGHT.button,
  },
  saveButton: {
    // Size is handled by halfWidthButton
  },
  fixedFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background.primary,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
    paddingHorizontal: PADDING.screen,
    paddingVertical: PADDING.md,
    paddingBottom: PADDING.lg, // Extra padding for safe area
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  flex1: {
    flex: 1,
  },
});
