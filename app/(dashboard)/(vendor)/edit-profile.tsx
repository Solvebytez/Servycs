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
  LINE_HEIGHT,
  MARGIN,
  PADDING,
  BORDER_RADIUS,
  LAYOUT,
} from "@/constants";
import {
  useProfile,
  useUpdateProfile,
  isVendorProfile,
  BusinessAddress,
} from "../../../hooks/useProfile";
import { useUser } from "../../../hooks/useUser";

// Remove duplicate BusinessAddress type since it's imported from useProfile

// Validation schema for vendor profile
const vendorProfileSchema = yup.object({
  name: yup
    .string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup
    .string()
    .required("Phone number is required")
    .min(10, "Phone must be at least 10 digits"),
  businessName: yup.string().required("Business name is required"),
  businessAddress: yup.string().required("Landmark is required"),
  businessCity: yup.string().required("Business city is required"),
  businessState: yup.string().required("Business state is required"),
  businessZipCode: yup.string().required("Business zip code is required"),
  businessCountry: yup.string().required("Business country is required"),
  businessDescription: yup
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
});

type VendorProfileFormData = {
  name: string;
  email: string;
  phone: string;
  businessName: string;
  businessAddress: string;
  businessCity: string;
  businessState: string;
  businessZipCode: string;
  businessCountry: string;
  businessDescription?: string;
};

export default function VendorEditProfileScreen() {
  const router = useRouter();
  const [additionalAddresses, setAdditionalAddresses] = useState<number[]>([]);

  // Functions to handle additional addresses
  const addAdditionalAddress = () => {
    const newId = Date.now(); // Use timestamp as unique ID
    setAdditionalAddresses((prev) => [...prev, newId]);
  };

  const removeAdditionalAddress = (id: number) => {
    setAdditionalAddresses((prev) =>
      prev.filter((addressId) => addressId !== id)
    );
  };

  // Use TanStack Query hooks
  const {
    data: profileData,
    isLoading: isLoadingProfile,
    error: profileError,
  } = useProfile();
  const updateProfileMutation = useUpdateProfile();

  // Also get user data to check role
  const { data: userData } = useUser();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<VendorProfileFormData>({
    resolver: yupResolver(vendorProfileSchema) as any,
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      businessName: "",
      businessAddress: "",
      businessCity: "",
      businessState: "",
      businessZipCode: "",
      businessCountry: "India",
      businessDescription: "",
    },
  });

  // Update form when profile data is loaded
  useEffect(() => {
    console.log("=== Vendor Edit Profile: useEffect triggered ===");
    console.log("profileData:", profileData);
    console.log("profileData?.role:", profileData?.role);
    console.log("userData:", userData);
    console.log("userData?.role:", userData?.role);
    console.log(
      "isVendorProfile(profileData):",
      profileData ? isVendorProfile(profileData) : false
    );
    console.log("isLoadingProfile:", isLoadingProfile);
    console.log("profileError:", profileError);

    // Always reset the form with whatever data we have, regardless of type guard
    if (profileData) {
      console.log(
        "=== Vendor Edit Profile: Resetting form with data ===",
        profileData
      );
      reset({
        name: profileData.name || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        businessName: (profileData as any).businessName || "",
        businessAddress: (profileData as any).businessAddress || "",
        businessCity: (profileData as any).businessCity || "",
        businessState: (profileData as any).businessState || "",
        businessZipCode: (profileData as any).businessZipCode || "",
        businessCountry: (profileData as any).businessCountry || "India",
        businessDescription: (profileData as any).businessDescription || "",
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
      console.log("Vendor profile data:", data);

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
    <SafeAreaView style={styles.container}>
      <GlobalStatusBar />
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
                  style={[styles.textInput, errors.email && styles.inputError]}
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
                  style={[styles.textInput, errors.phone && styles.inputError]}
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
        </ResponsiveCard>

        {/* Business Information Form */}
        <ResponsiveCard variant="elevated" style={styles.formCard}>
          <ResponsiveText
            variant="h6"
            weight="bold"
            color={COLORS.text.primary}
            style={styles.sectionTitle}
          >
            Business Information
          </ResponsiveText>

          {/* Business Information Section */}
          <View style={styles.inputGroup}>
            <ResponsiveText
              variant="inputLabel"
              weight="medium"
              color={COLORS.text.primary}
              style={styles.inputLabel}
            >
              Business Name
            </ResponsiveText>
            <Controller
              control={control}
              name="businessName"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[
                    styles.textInput,
                    errors.businessName && styles.inputError,
                  ]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Enter your business name"
                  placeholderTextColor={COLORS.text.secondary}
                />
              )}
            />
            {errors.businessName && (
              <ResponsiveText variant="inputHelper" color={COLORS.error[500]}>
                {errors.businessName.message}
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
                name="businessCity"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.textInput,
                      errors.businessCity && styles.inputError,
                    ]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="City"
                    placeholderTextColor={COLORS.text.secondary}
                  />
                )}
              />
              {errors.businessCity && (
                <ResponsiveText variant="inputHelper" color={COLORS.error[500]}>
                  {errors.businessCity.message}
                </ResponsiveText>
              )}
            </View>

            <View style={[styles.inputGroup, styles.flex1, { marginLeft: 10 }]}>
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
                name="businessState"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.textInput,
                      errors.businessState && styles.inputError,
                    ]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="State"
                    placeholderTextColor={COLORS.text.secondary}
                  />
                )}
              />
              {errors.businessState && (
                <ResponsiveText variant="inputHelper" color={COLORS.error[500]}>
                  {errors.businessState.message}
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
                name="businessZipCode"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.textInput,
                      errors.businessZipCode && styles.inputError,
                    ]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="Zip Code"
                    placeholderTextColor={COLORS.text.secondary}
                  />
                )}
              />
              {errors.businessZipCode && (
                <ResponsiveText variant="inputHelper" color={COLORS.error[500]}>
                  {errors.businessZipCode.message}
                </ResponsiveText>
              )}
            </View>

            <View style={[styles.inputGroup, styles.flex1, { marginLeft: 10 }]}>
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
                name="businessCountry"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.textInput,
                      errors.businessCountry && styles.inputError,
                    ]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="Country"
                    placeholderTextColor={COLORS.text.secondary}
                  />
                )}
              />
              {errors.businessCountry && (
                <ResponsiveText variant="inputHelper" color={COLORS.error[500]}>
                  {errors.businessCountry.message}
                </ResponsiveText>
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <ResponsiveText
              variant="inputLabel"
              weight="medium"
              color={COLORS.text.primary}
              style={styles.inputLabel}
            >
              Business Description
            </ResponsiveText>
            <Controller
              control={control}
              name="businessDescription"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[
                    styles.textInput,
                    styles.textArea,
                    errors.businessDescription && styles.inputError,
                  ]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Describe your business (optional)"
                  placeholderTextColor={COLORS.text.secondary}
                  multiline
                  numberOfLines={4}
                />
              )}
            />
            {errors.businessDescription && (
              <ResponsiveText variant="inputHelper" color={COLORS.error[500]}>
                {errors.businessDescription.message}
              </ResponsiveText>
            )}
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
              name="businessAddress"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[
                    styles.textInput,
                    styles.textArea,
                    errors.businessAddress && styles.inputError,
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
            {errors.businessAddress && (
              <ResponsiveText variant="inputHelper" color={COLORS.error[500]}>
                {errors.businessAddress.message}
              </ResponsiveText>
            )}
          </View>
        </ResponsiveCard>

        {/* Additional Address Cards */}
        {additionalAddresses.map((addressId, index) => (
          <ResponsiveCard
            key={addressId}
            variant="elevated"
            style={styles.formCard}
          >
            <View style={styles.additionalAddressHeader}>
              <ResponsiveText
                variant="h6"
                weight="bold"
                color={COLORS.text.primary}
                style={styles.sectionTitle}
              >
                Business Information {index + 2}
              </ResponsiveText>
              <TouchableOpacity
                onPress={() => removeAdditionalAddress(addressId)}
                style={styles.removeAddressButton}
              >
                <Ionicons name="close" size={20} color={COLORS.error[500]} />
              </TouchableOpacity>
            </View>

            {/* Business Name */}
            <View style={styles.inputGroup}>
              <ResponsiveText
                variant="inputLabel"
                weight="medium"
                color={COLORS.text.primary}
                style={styles.inputLabel}
              >
                Business Name
              </ResponsiveText>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your business name"
                placeholderTextColor={COLORS.text.secondary}
              />
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
                <TextInput
                  style={styles.textInput}
                  placeholder="City"
                  placeholderTextColor={COLORS.text.secondary}
                />
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
                <TextInput
                  style={styles.textInput}
                  placeholder="State"
                  placeholderTextColor={COLORS.text.secondary}
                />
              </View>
            </View>

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
                <TextInput
                  style={styles.textInput}
                  placeholder="Zip Code"
                  placeholderTextColor={COLORS.text.secondary}
                />
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
                <TextInput
                  style={styles.textInput}
                  placeholder="Country"
                  placeholderTextColor={COLORS.text.secondary}
                />
              </View>
            </View>

            {/* Business Description */}
            <View style={styles.inputGroup}>
              <ResponsiveText
                variant="inputLabel"
                weight="medium"
                color={COLORS.text.primary}
                style={styles.inputLabel}
              >
                Business Description
              </ResponsiveText>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Describe your business (optional)"
                placeholderTextColor={COLORS.text.secondary}
                multiline
                numberOfLines={4}
              />
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
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Enter your landmark"
                placeholderTextColor={COLORS.text.secondary}
                multiline
                numberOfLines={2}
              />
            </View>
          </ResponsiveCard>
        ))}

        {/* Add Multiple Address Button */}
        <TouchableOpacity
          style={styles.addAddressButton}
          onPress={addAdditionalAddress}
        >
          <Ionicons name="add" size={20} color={COLORS.primary[600]} />
          <ResponsiveText
            variant="body2"
            weight="medium"
            color={COLORS.primary[600]}
            style={styles.addAddressButtonText}
          >
            Add Multiple Address
          </ResponsiveText>
        </TouchableOpacity>
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
    borderRadius: BORDER_RADIUS.input,
    paddingHorizontal: PADDING.inputLarge,
    paddingVertical: PADDING.input,
    fontSize: 14,
    color: COLORS.text.primary,
    backgroundColor: COLORS.background.primary,
  },
  textArea: {
    height: LAYOUT.inputHeightLarge,
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
  addressesHeader: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: MARGIN.md,
  },
  addAddressButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: MARGIN.md,
    paddingHorizontal: MARGIN.lg,
    borderWidth: 1,
    borderColor: COLORS.primary[600],
    borderStyle: "dashed",
    borderRadius: 8,
    backgroundColor: COLORS.primary[50],
    marginTop: MARGIN.md,
  },
  addAddressButtonText: {
    marginLeft: MARGIN.xs,
  },
  addressCard: {
    backgroundColor: COLORS.neutral[50],
    borderRadius: BORDER_RADIUS.md,
    padding: PADDING.md,
    marginBottom: MARGIN.md,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  addressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: MARGIN.sm,
  },
  removeButton: {
    padding: PADDING.xs,
  },
  addressInputGroup: {
    marginBottom: MARGIN.md,
  },
  addressInputLabel: {
    marginBottom: MARGIN.xs,
  },
  addressInput: {
    backgroundColor: COLORS.background.primary,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  flex1: {
    flex: 1,
  },
  additionalAddressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: MARGIN.lg,
  },
  removeAddressButton: {
    padding: MARGIN.xs,
    borderRadius: 20,
    backgroundColor: COLORS.error[50],
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
});
