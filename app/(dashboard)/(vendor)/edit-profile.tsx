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
import {
  COLORS,
  FONT_SIZE,
  LINE_HEIGHT,
  MARGIN,
  PADDING,
  BORDER_RADIUS,
  LAYOUT,
} from "@/constants";

// Business address type
type BusinessAddress = {
  id: string;
  name: string;
  address: string;
  description: string;
};

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
  businessAddresses: yup
    .array()
    .of(
      yup.object({
        id: yup.string().required(),
        name: yup
          .string()
          .required("Business name is required")
          .min(2, "Business name must be at least 2 characters"),
        address: yup
          .string()
          .required("Address is required")
          .min(10, "Address must be at least 10 characters"),
        description: yup
          .string()
          .max(500, "Description must be less than 500 characters"),
      })
    )
    .min(1, "At least one business address is required")
    .required("Business addresses are required"),
});

type VendorProfileFormData = yup.InferType<typeof vendorProfileSchema>;

export default function VendorEditProfileScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [businessAddresses, setBusinessAddresses] = useState<BusinessAddress[]>(
    [
      {
        id: "1",
        name: "My Business",
        address: "123 Business Street, City, State 12345",
        description: "Professional vendor providing quality services",
      },
    ]
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<VendorProfileFormData>({
    resolver: yupResolver(vendorProfileSchema),
    mode: "onChange",
    defaultValues: {
      name: "Vendor User",
      email: "vendor@example.com",
      phone: "+91 9876543210",
      businessAddresses: [
        {
          id: "1",
          name: "My Business",
          address: "123 Business Street, City, State 12345",
          description: "Professional vendor providing quality services",
        },
      ],
    },
  });

  // Watch business addresses for form validation
  const watchedAddresses = watch("businessAddresses");

  const handleImagePicker = () => {
    // TODO: Implement image picker functionality
    Alert.alert(
      "Image Picker",
      "Image picker functionality will be implemented"
    );
  };

  const addNewAddress = () => {
    const newAddress: BusinessAddress = {
      id: Date.now().toString(),
      name: "",
      address: "",
      description: "",
    };
    const updatedAddresses = [...businessAddresses, newAddress];
    setBusinessAddresses(updatedAddresses);
    setValue("businessAddresses", updatedAddresses);
  };

  const removeAddress = (id: string) => {
    if (businessAddresses.length <= 1) {
      Alert.alert(
        "Cannot Remove",
        "You must have at least one business address."
      );
      return;
    }

    const updatedAddresses = businessAddresses.filter((addr) => addr.id !== id);
    setBusinessAddresses(updatedAddresses);
    setValue("businessAddresses", updatedAddresses);
  };

  const updateAddress = (
    id: string,
    field: keyof BusinessAddress,
    value: string
  ) => {
    const updatedAddresses = businessAddresses.map((addr) =>
      addr.id === id ? { ...addr, [field]: value } : addr
    );
    setBusinessAddresses(updatedAddresses);
    setValue("businessAddresses", updatedAddresses);
  };

  const onSubmit = async (data: VendorProfileFormData) => {
    try {
      setIsLoading(true);
      console.log("Vendor profile data:", data);

      // TODO: Implement API call to update vendor profile
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
    <SafeAreaView style={styles.container}>
      <GlobalStatusBar />
      {/* Header with Solid Background */}
      <View style={styles.headerSolid}>
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
          <ResponsiveText variant="h5" weight="bold" color={COLORS.white}>
            Edit Profile
          </ResponsiveText>
          <View style={styles.placeholder} />
        </View>
      </View>

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

          {/* Business Addresses Section */}
          <View style={styles.inputGroup}>
            <View style={styles.addressesHeader}>
              <ResponsiveButton
                title="Add New Address"
                variant="outline"
                size="small"
                onPress={addNewAddress}
                leftIcon={
                  <Ionicons name="add" size={16} color={COLORS.primary[300]} />
                }
                style={styles.addAddressButton}
                textStyle={styles.addAddressButtonText}
              />
            </View>

            {businessAddresses.map((address, index) => (
              <View key={address.id} style={styles.addressCard}>
                <View style={styles.addressHeader}>
                  <ResponsiveText
                    variant="caption1"
                    weight="medium"
                    color={COLORS.text.secondary}
                  >
                    Address {index + 1}
                  </ResponsiveText>
                  {businessAddresses.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removeAddress(address.id)}
                      style={styles.removeButton}
                    >
                      <Ionicons
                        name="close-circle"
                        size={20}
                        color={COLORS.error[500]}
                      />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Business Name for this address */}
                <View style={styles.addressInputGroup}>
                  <ResponsiveText
                    variant="caption2"
                    weight="medium"
                    color={COLORS.text.primary}
                    style={styles.addressInputLabel}
                  >
                    Business Name *
                  </ResponsiveText>
                  <TextInput
                    style={[
                      styles.textInput,
                      styles.addressInput,
                      errors.businessAddresses?.[index]?.name &&
                        styles.inputError,
                    ]}
                    onChangeText={(value) =>
                      updateAddress(address.id, "name", value)
                    }
                    value={address.name}
                    placeholder="Enter business name for this address"
                    placeholderTextColor={COLORS.text.secondary}
                  />
                  {errors.businessAddresses?.[index]?.name && (
                    <ResponsiveText
                      variant="inputHelper"
                      color={COLORS.error[500]}
                    >
                      {errors.businessAddresses[index].name.message}
                    </ResponsiveText>
                  )}
                </View>

                {/* Address for this business */}
                <View style={styles.addressInputGroup}>
                  <ResponsiveText
                    variant="caption2"
                    weight="medium"
                    color={COLORS.text.primary}
                    style={styles.addressInputLabel}
                  >
                    Address *
                  </ResponsiveText>
                  <TextInput
                    style={[
                      styles.textInput,
                      styles.textArea,
                      styles.addressInput,
                      errors.businessAddresses?.[index]?.address &&
                        styles.inputError,
                    ]}
                    onChangeText={(value) =>
                      updateAddress(address.id, "address", value)
                    }
                    value={address.address}
                    placeholder="Enter the business address"
                    placeholderTextColor={COLORS.text.secondary}
                    multiline
                    numberOfLines={3}
                  />
                  {errors.businessAddresses?.[index]?.address && (
                    <ResponsiveText
                      variant="inputHelper"
                      color={COLORS.error[500]}
                    >
                      {errors.businessAddresses[index].address.message}
                    </ResponsiveText>
                  )}
                </View>

                {/* Business Description for this address */}
                <View style={styles.addressInputGroup}>
                  <ResponsiveText
                    variant="caption2"
                    weight="medium"
                    color={COLORS.text.primary}
                    style={styles.addressInputLabel}
                  >
                    Business Description
                  </ResponsiveText>
                  <TextInput
                    style={[
                      styles.textInput,
                      styles.textArea,
                      styles.addressInput,
                      errors.businessAddresses?.[index]?.description &&
                        styles.inputError,
                    ]}
                    onChangeText={(value) =>
                      updateAddress(address.id, "description", value)
                    }
                    value={address.description}
                    placeholder="Describe this business location (optional)"
                    placeholderTextColor={COLORS.text.secondary}
                    multiline
                    numberOfLines={4}
                  />
                  {errors.businessAddresses?.[index]?.description && (
                    <ResponsiveText
                      variant="inputHelper"
                      color={COLORS.error[500]}
                    >
                      {errors.businessAddresses[index].description.message}
                    </ResponsiveText>
                  )}
                </View>
              </View>
            ))}

            {errors.businessAddresses && (
              <ResponsiveText variant="inputHelper" color={COLORS.error[500]}>
                {errors.businessAddresses.message}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  headerSolid: {
    backgroundColor: COLORS.primary[200],
    paddingTop: MARGIN.sm,
    paddingBottom: MARGIN.md - 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
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
    paddingVertical: MARGIN.xl,
  },
  cancelButton: {
    borderColor: COLORS.error[500],
    borderWidth: 1,
    backgroundColor: COLORS.background.primary,
    minHeight: LAYOUT.buttonHeight,
    paddingVertical: PADDING.buttonLarge,
    marginBottom: MARGIN.md,
  },
  cancelButtonText: {
    color: COLORS.error[500],
    fontSize: FONT_SIZE.button,
    lineHeight: LINE_HEIGHT.button,
  },
  saveButton: {
    marginTop: MARGIN.xs,
  },
  addressesHeader: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: MARGIN.md,
  },
  addAddressButton: {
    borderColor: COLORS.primary[300],
    borderWidth: 1,
    backgroundColor: COLORS.background.primary,
    paddingHorizontal: PADDING.button,
    paddingVertical: PADDING.buttonSmall,
    minHeight: LAYOUT.buttonHeightSmall,
  },
  addAddressButtonText: {
    color: COLORS.primary[300],
    fontSize: FONT_SIZE.buttonSmall,
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
});
