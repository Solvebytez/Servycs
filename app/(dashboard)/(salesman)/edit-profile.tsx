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
  BackButton,
} from "@/components";
import { COLORS, FONT_SIZE, MARGIN, PADDING, BORDER_RADIUS } from "@/constants";
import {
  useProfile,
  useUpdateProfile,
  isSalesmanProfile,
} from "../../../hooks/useProfile";

// Validation schema for salesman profile
const salesmanProfileSchema = yup.object({
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
    .min(10, "Address must be at least 10 characters"),
  primaryCity: yup.string().required("City is required"),
  primaryState: yup.string().required("State is required"),
  primaryZipCode: yup.string().required("Zip code is required"),
  primaryCountry: yup.string().required("Country is required"),
  bio: yup.string().max(500, "Bio must be less than 500 characters"),
  employeeId: yup.string().required("Employee ID is required"),
});

type SalesmanProfileFormData = yup.InferType<typeof salesmanProfileSchema>;

export default function SalesmanEditProfileScreen() {
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
  } = useForm<SalesmanProfileFormData>({
    resolver: yupResolver(salesmanProfileSchema),
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
      bio: "",
      employeeId: "",
    },
  });

  // Update form when profile data is loaded
  useEffect(() => {
    if (profileData && isSalesmanProfile(profileData)) {
      reset({
        name: profileData.name || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        primaryAddress: profileData.primaryAddress || "",
        primaryCity: profileData.primaryCity || "",
        primaryState: profileData.primaryState || "",
        primaryZipCode: profileData.primaryZipCode || "",
        primaryCountry: profileData.primaryCountry || "India",
        bio: profileData.bio || "",
        employeeId: profileData.employeeId || "",
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

  const onSubmit = async (data: SalesmanProfileFormData) => {
    try {
      console.log("Salesman profile data:", data);

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
        {/* Header with Gradient Background */}
        <LinearGradient
          colors={[COLORS.primary[200], COLORS.primary[50], "#fff"]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          {/* Top Navigation */}
          <View style={styles.topNavigation}>
            <BackButton
              onPress={handleCancel}
              variant="default"
              size="medium"
              showText={false}
              showIcon={true}
              iconName="arrow-back"
            />
            <ResponsiveText
              variant="h5"
              weight="bold"
              color={COLORS.text.primary}
            >
              Edit Profile
            </ResponsiveText>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>

        <ScrollView
          style={styles.scrollView}
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

            {/* Employee ID Field */}
            <View style={styles.inputGroup}>
              <ResponsiveText
                variant="inputLabel"
                weight="medium"
                color={COLORS.text.primary}
                style={styles.inputLabel}
              >
                Employee ID *
              </ResponsiveText>
              <Controller
                control={control}
                name="employeeId"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.textInput,
                      errors.employeeId && styles.inputError,
                    ]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="Enter your employee ID"
                    placeholderTextColor={COLORS.text.secondary}
                  />
                )}
              />
              {errors.employeeId && (
                <ResponsiveText variant="inputHelper" color={COLORS.error[500]}>
                  {errors.employeeId.message}
                </ResponsiveText>
              )}
            </View>
          </ResponsiveCard>

          {/* Additional Information Form */}
          <ResponsiveCard variant="elevated" style={styles.formCard}>
            <ResponsiveText
              variant="h6"
              weight="bold"
              color={COLORS.text.primary}
              style={styles.sectionTitle}
            >
              Additional Information
            </ResponsiveText>

            {/* Primary Address Fields */}
            <View style={styles.inputGroup}>
              <ResponsiveText
                variant="inputLabel"
                weight="medium"
                color={COLORS.text.primary}
                style={styles.inputLabel}
              >
                Primary Address
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
                    placeholder="Enter your primary address"
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

            {/* Bio Field */}
            <View style={styles.inputGroup}>
              <ResponsiveText
                variant="inputLabel"
                weight="medium"
                color={COLORS.text.primary}
                style={styles.inputLabel}
              >
                Professional Description
              </ResponsiveText>
              <Controller
                control={control}
                name="bio"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.textInput,
                      styles.textArea,
                      errors.bio && styles.inputError,
                    ]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="Describe your professional background (optional)"
                    placeholderTextColor={COLORS.text.secondary}
                    multiline
                    numberOfLines={4}
                  />
                )}
              />
              {errors.bio && (
                <ResponsiveText variant="inputHelper" color={COLORS.error[500]}>
                  {errors.bio.message}
                </ResponsiveText>
              )}
            </View>
          </ResponsiveCard>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <ResponsiveButton
              title="Cancel"
              variant="outline"
              size="medium"
              fullWidth
              onPress={handleCancel}
              leftIcon={
                <Ionicons name="close" size={20} color={COLORS.error[500]} />
              }
              style={styles.cancelButton}
              textStyle={styles.cancelButtonText}
            />

            <ResponsiveButton
              title={
                updateProfileMutation.isPending ? "Saving..." : "Save Changes"
              }
              variant="primary"
              size="medium"
              fullWidth
              onPress={handleSubmit(onSubmit)}
              disabled={
                !isValid || updateProfileMutation.isPending || isLoadingProfile
              }
              style={styles.saveButton}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  headerGradient: {
    paddingTop: MARGIN.sm,
    paddingBottom: MARGIN.md,
  },
  topNavigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: PADDING.screen,
    marginBottom: MARGIN.sm,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: PADDING.screen,
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
    paddingVertical: MARGIN.xl,
  },
  cancelButton: {
    borderColor: COLORS.error[500],
    borderWidth: 1,
    backgroundColor: COLORS.background.primary,
    minHeight: 50,
    paddingVertical: PADDING.md,
    marginBottom: MARGIN.md,
  },
  cancelButtonText: {
    color: COLORS.error[500],
    fontSize: FONT_SIZE.h4,
    lineHeight: FONT_SIZE.h4 * 1.4,
  },
  saveButton: {
    marginTop: 8,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  flex1: {
    flex: 1,
  },
});
