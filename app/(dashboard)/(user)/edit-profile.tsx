import React, { useState } from "react";
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
  address: yup.string().min(10, "Address must be at least 10 characters"),
  bio: yup.string().max(300, "Bio must be less than 300 characters"),
});

type UserProfileFormData = yup.InferType<typeof userProfileSchema>;

export default function UserEditProfileScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<UserProfileFormData>({
    resolver: yupResolver(userProfileSchema),
    mode: "onChange",
    defaultValues: {
      name: "User Name",
      email: "user@example.com",
      phone: "+91 9876543210",
      address: "123 User Street, City, State 12345",
      bio: "I love discovering new services and experiences",
    },
  });

  const handleImagePicker = () => {
    // TODO: Implement image picker functionality
    Alert.alert(
      "Image Picker",
      "Image picker functionality will be implemented"
    );
  };

  const onSubmit = async (data: UserProfileFormData) => {
    try {
      setIsLoading(true);
      console.log("User profile data:", data);

      // TODO: Implement API call to update user profile
      // await userService.updateProfile(data);

      Alert.alert("Success", "Profile updated successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
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

            {/* Address Field */}
            <View style={styles.inputGroup}>
              <ResponsiveText
                variant="inputLabel"
                weight="medium"
                color={COLORS.text.primary}
                style={styles.inputLabel}
              >
                Address
              </ResponsiveText>
              <Controller
                control={control}
                name="address"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.textInput,
                      styles.textArea,
                      errors.address && styles.inputError,
                    ]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="Enter your address (optional)"
                    placeholderTextColor={COLORS.text.secondary}
                    multiline
                    numberOfLines={3}
                  />
                )}
              />
              {errors.address && (
                <ResponsiveText variant="inputHelper" color={COLORS.error[500]}>
                  {errors.address.message}
                </ResponsiveText>
              )}
            </View>

            {/* Bio Field */}
            <View style={styles.inputGroup}>
              <ResponsiveText
                variant="inputLabel"
                weight="medium"
                color={COLORS.text.primary}
                style={styles.inputLabel}
              >
                About Me
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
                    placeholder="Tell us about yourself (optional)"
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
              title={isLoading ? "Saving..." : "Save Changes"}
              variant="primary"
              size="medium"
              fullWidth
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid || isLoading}
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
});
