import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Image,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import DatePicker from "react-native-date-picker";
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

// Form validation schema
const promotionSchema = yup.object({
  title: yup.string().required("Promotion title is required"),
  category: yup.string().required("Service selection is required"),
  discountType: yup.string().required("Discount type is required"),
  discountValue: yup.string().required("Discount value is required"),
  originalPrice: yup.string().when("discountType", {
    is: "fixed",
    then: (schema) =>
      schema.required("Original price is required for fixed discount"),
    otherwise: (schema) => schema.optional(),
  }),
  startDate: yup.string().required("Start date is required"),
  endDate: yup.string().required("End date is required"),
  bannerImage: yup.string().optional(),
});

type PromotionFormData = yup.InferType<typeof promotionSchema>;

export default function CreatePromotionScreen() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showDiscountTypeDropdown, setShowDiscountTypeDropdown] =
    useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<PromotionFormData>({
    resolver: yupResolver(promotionSchema),
    defaultValues: {
      title: "",
      category: "",
      discountType: "",
      discountValue: "",
      originalPrice: "",
      startDate: "",
      endDate: "",
      bannerImage: "",
    },
  });

  const watchedDiscountType = watch("discountType");

  // Category options - using existing vendor services
  const categories = [
    "Massage Therapy",
    "Spa Package",
    "Fitness & Wellness",
    "All Services",
    "Beauty & Skincare",
    "Hair Services",
    "Nail Services",
    "Facial Treatment",
    "Body Treatment",
    "Manicure & Pedicure",
    "Hair Styling",
    "Hair Coloring",
    "Eyebrow & Eyelash",
    "Makeup Services",
    "Waxing Services",
    "Tanning Services",
  ];

  // Discount type options
  const discountTypes = [
    { value: "percentage", label: "Percentage (%)" },
    { value: "fixed", label: "Fixed Amount ($)" },
  ];

  const onSubmit = async (data: PromotionFormData) => {
    try {
      setIsSubmitting(true);

      // TODO: Implement API call to create promotion
      console.log("Creating promotion:", data);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      Alert.alert("Success", "Promotion created successfully!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Error creating promotion:", error);
      Alert.alert("Error", "Failed to create promotion. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const getTodayDate = () => {
    return formatDate(new Date());
  };

  const getMinEndDate = () => {
    const startDate = watch("startDate");
    if (startDate) {
      return startDate;
    }
    return getTodayDate();
  };

  const handleImageUpload = () => {
    Alert.alert("Select Image", "Choose how you want to add an image", [
      { text: "Cancel", style: "cancel" },
      { text: "Camera", onPress: () => console.log("Open camera") },
      { text: "Gallery", onPress: () => console.log("Open gallery") },
    ]);
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleStartDateConfirm = (date: Date) => {
    setStartDate(date);
    setValue("startDate", formatDate(date));
    setShowStartDatePicker(false);
  };

  const handleEndDateConfirm = (date: Date) => {
    setEndDate(date);
    setValue("endDate", formatDate(date));
    setShowEndDatePicker(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <GlobalStatusBar />

      {/* Header with Solid Background */}
      <View style={styles.headerSolid}>
        <View style={styles.topNavigation}>
          <BackButton
            onPress={() => router.back()}
            variant="default"
            size="medium"
            showText={false}
            showIcon={true}
            iconName="arrow-back"
          />
          <ResponsiveText variant="h5" weight="bold" color={COLORS.white}>
            Create Promotion
          </ResponsiveText>
          <View style={styles.placeholder} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Image Upload Card */}
        <ResponsiveCard variant="elevated" style={styles.card}>
          <ResponsiveText
            variant="h6"
            weight="bold"
            color={COLORS.text.primary}
            style={styles.sectionTitle}
          >
            Promotion Banner
          </ResponsiveText>
          <ResponsiveText
            variant="body2"
            color={COLORS.text.secondary}
            style={styles.sectionSubtitle}
          >
            Upload an attractive banner image for your promotion
          </ResponsiveText>

          <TouchableOpacity
            style={styles.imageUploadContainer}
            onPress={handleImageUpload}
          >
            {selectedImage ? (
              <Image
                source={{ uri: selectedImage }}
                style={styles.uploadedImage}
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera" size={40} color={COLORS.primary[300]} />
                <ResponsiveText
                  variant="body2"
                  color={COLORS.text.secondary}
                  style={styles.uploadText}
                >
                  Tap to upload banner image
                </ResponsiveText>
                <ResponsiveText
                  variant="caption2"
                  color={COLORS.text.secondary}
                  style={styles.uploadSubtext}
                >
                  Recommended: 800x400px
                </ResponsiveText>
              </View>
            )}
          </TouchableOpacity>
        </ResponsiveCard>

        {/* Promotion Details Card */}
        <ResponsiveCard variant="elevated" style={styles.card}>
          <ResponsiveText
            variant="h6"
            weight="bold"
            color={COLORS.text.primary}
            style={styles.sectionTitle}
          >
            Promotion Details
          </ResponsiveText>
          <ResponsiveText
            variant="body2"
            color={COLORS.text.secondary}
            style={styles.sectionSubtitle}
          >
            Enter the basic information for your promotion
          </ResponsiveText>

          {/* Promotion Title */}
          <View style={styles.inputGroup}>
            <ResponsiveText
              variant="inputLabel"
              weight="medium"
              color={COLORS.text.primary}
              style={styles.inputLabel}
            >
              Promotion Title *
            </ResponsiveText>
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="megaphone"
                    size={20}
                    color={COLORS.text.secondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[
                      styles.textInput,
                      errors.title && styles.inputError,
                    ]}
                    placeholder="Enter promotion title"
                    placeholderTextColor={COLORS.text.secondary}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                </View>
              )}
            />
            {errors.title && (
              <ResponsiveText variant="caption2" color={COLORS.error[500]}>
                {errors.title.message}
              </ResponsiveText>
            )}
          </View>

          {/* Service */}
          <View style={[styles.inputGroup, styles.dropdownContainer]}>
            <ResponsiveText
              variant="inputLabel"
              weight="medium"
              color={COLORS.text.primary}
              style={styles.inputLabel}
            >
              Select Service *
            </ResponsiveText>
            <Controller
              control={control}
              name="category"
              render={({ field: { onChange, value } }) => (
                <TouchableOpacity
                  style={[
                    styles.dropdownButton,
                    errors.category && styles.inputError,
                  ]}
                  onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                >
                  <ResponsiveText
                    variant="body2"
                    color={value ? COLORS.text.primary : COLORS.text.secondary}
                    style={styles.dropdownText}
                  >
                    {value || "Select service"}
                  </ResponsiveText>
                  <Ionicons
                    name={showCategoryDropdown ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={COLORS.text.secondary}
                  />
                </TouchableOpacity>
              )}
            />
            <Modal
              visible={showCategoryDropdown}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setShowCategoryDropdown(false)}
            >
              <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setShowCategoryDropdown(false)}
              >
                <View style={styles.modalDropdownContainer}>
                  <View style={styles.modalDropdownList}>
                    <ScrollView
                      style={styles.modalScrollView}
                      showsVerticalScrollIndicator={true}
                      nestedScrollEnabled={true}
                    >
                      {categories.map((category) => {
                        const isSelected = watch("category") === category;
                        return (
                          <TouchableOpacity
                            key={category}
                            style={[
                              isSelected
                                ? styles.modalDropdownItemActive
                                : styles.modalDropdownItem,
                            ]}
                            onPress={() => {
                              setValue("category", category);
                              setShowCategoryDropdown(false);
                            }}
                          >
                            <ResponsiveText
                              variant="body2"
                              color={
                                isSelected
                                  ? COLORS.primary[600]
                                  : COLORS.text.primary
                              }
                              weight={isSelected ? "medium" : "normal"}
                            >
                              {category}
                            </ResponsiveText>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                </View>
              </TouchableOpacity>
            </Modal>
            {errors.category && (
              <ResponsiveText variant="caption2" color={COLORS.error[500]}>
                {errors.category.message}
              </ResponsiveText>
            )}
          </View>
        </ResponsiveCard>

        {/* Discount Information Card */}
        <ResponsiveCard variant="elevated" style={styles.card}>
          <ResponsiveText
            variant="h6"
            weight="bold"
            color={COLORS.text.primary}
            style={styles.sectionTitle}
          >
            Discount Information
          </ResponsiveText>
          <ResponsiveText
            variant="body2"
            color={COLORS.text.secondary}
            style={styles.sectionSubtitle}
          >
            Set up your discount details
          </ResponsiveText>

          {/* Discount Type */}
          <View style={styles.inputGroup}>
            <ResponsiveText
              variant="inputLabel"
              weight="medium"
              color={COLORS.text.primary}
              style={styles.inputLabel}
            >
              Discount Type *
            </ResponsiveText>
            <Controller
              control={control}
              name="discountType"
              render={({ field: { onChange, value } }) => (
                <TouchableOpacity
                  style={[
                    styles.dropdownButton,
                    errors.discountType && styles.inputError,
                  ]}
                  onPress={() =>
                    setShowDiscountTypeDropdown(!showDiscountTypeDropdown)
                  }
                >
                  <ResponsiveText
                    variant="body2"
                    color={value ? COLORS.text.primary : COLORS.text.secondary}
                    style={styles.dropdownText}
                  >
                    {value
                      ? discountTypes.find((t) => t.value === value)?.label
                      : "Select discount type"}
                  </ResponsiveText>
                  <Ionicons
                    name={
                      showDiscountTypeDropdown ? "chevron-up" : "chevron-down"
                    }
                    size={20}
                    color={COLORS.text.secondary}
                  />
                </TouchableOpacity>
              )}
            />
            {showDiscountTypeDropdown && (
              <View style={styles.dropdownList}>
                {discountTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setValue("discountType", type.value);
                      setShowDiscountTypeDropdown(false);
                    }}
                  >
                    <ResponsiveText variant="body2" color={COLORS.text.primary}>
                      {type.label}
                    </ResponsiveText>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {errors.discountType && (
              <ResponsiveText variant="caption2" color={COLORS.error[500]}>
                {errors.discountType.message}
              </ResponsiveText>
            )}
          </View>

          {/* Discount Value */}
          <View style={styles.inputGroup}>
            <ResponsiveText
              variant="inputLabel"
              weight="medium"
              color={COLORS.text.primary}
              style={styles.inputLabel}
            >
              Discount Value *
            </ResponsiveText>
            <Controller
              control={control}
              name="discountValue"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="pricetag"
                    size={20}
                    color={COLORS.text.secondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[
                      styles.textInput,
                      errors.discountValue && styles.inputError,
                    ]}
                    placeholder={
                      watchedDiscountType === "percentage"
                        ? "Enter percentage (e.g., 20)"
                        : "Enter amount (e.g., 25)"
                    }
                    placeholderTextColor={COLORS.text.secondary}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="numeric"
                  />
                </View>
              )}
            />
            {errors.discountValue && (
              <ResponsiveText variant="caption2" color={COLORS.error[500]}>
                {errors.discountValue.message}
              </ResponsiveText>
            )}
          </View>

          {/* Original Price (only for fixed discount) */}
          {watchedDiscountType === "fixed" && (
            <View style={styles.inputGroup}>
              <ResponsiveText
                variant="inputLabel"
                weight="medium"
                color={COLORS.text.primary}
                style={styles.inputLabel}
              >
                Original Price *
              </ResponsiveText>
              <Controller
                control={control}
                name="originalPrice"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="cash"
                      size={20}
                      color={COLORS.text.secondary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[
                        styles.textInput,
                        errors.originalPrice && styles.inputError,
                      ]}
                      placeholder="Enter original price (e.g., 120)"
                      placeholderTextColor={COLORS.text.secondary}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="numeric"
                    />
                  </View>
                )}
              />
              {errors.originalPrice && (
                <ResponsiveText variant="caption2" color={COLORS.error[500]}>
                  {errors.originalPrice.message}
                </ResponsiveText>
              )}
            </View>
          )}
        </ResponsiveCard>

        {/* Date Range Card */}
        <ResponsiveCard variant="elevated" style={styles.card}>
          <ResponsiveText
            variant="h6"
            weight="bold"
            color={COLORS.text.primary}
            style={styles.sectionTitle}
          >
            Promotion Period
          </ResponsiveText>
          <ResponsiveText
            variant="body2"
            color={COLORS.text.secondary}
            style={styles.sectionSubtitle}
          >
            Set the start and end dates for your promotion
          </ResponsiveText>

          {/* Start Date */}
          <View style={styles.inputGroup}>
            <ResponsiveText
              variant="inputLabel"
              weight="medium"
              color={COLORS.text.primary}
              style={styles.inputLabel}
            >
              Start Date *
            </ResponsiveText>
            <Controller
              control={control}
              name="startDate"
              render={({ field: { value } }) => (
                <TouchableOpacity
                  style={[
                    styles.datePickerButton,
                    errors.startDate && styles.inputError,
                  ]}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <View style={styles.datePickerContent}>
                    <Ionicons
                      name="calendar"
                      size={20}
                      color={COLORS.text.secondary}
                    />
                    <ResponsiveText
                      variant="body2"
                      color={
                        value ? COLORS.text.primary : COLORS.text.secondary
                      }
                      style={styles.datePickerText}
                    >
                      {value
                        ? formatDateForDisplay(value)
                        : "Select start date"}
                    </ResponsiveText>
                  </View>
                  <Ionicons
                    name="chevron-down"
                    size={20}
                    color={COLORS.text.secondary}
                  />
                </TouchableOpacity>
              )}
            />
            {errors.startDate && (
              <ResponsiveText variant="caption2" color={COLORS.error[500]}>
                {errors.startDate.message}
              </ResponsiveText>
            )}
          </View>

          {/* End Date */}
          <View style={styles.inputGroup}>
            <ResponsiveText
              variant="inputLabel"
              weight="medium"
              color={COLORS.text.primary}
              style={styles.inputLabel}
            >
              End Date *
            </ResponsiveText>
            <Controller
              control={control}
              name="endDate"
              render={({ field: { value } }) => (
                <TouchableOpacity
                  style={[
                    styles.datePickerButton,
                    errors.endDate && styles.inputError,
                  ]}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <View style={styles.datePickerContent}>
                    <Ionicons
                      name="calendar"
                      size={20}
                      color={COLORS.text.secondary}
                    />
                    <ResponsiveText
                      variant="body2"
                      color={
                        value ? COLORS.text.primary : COLORS.text.secondary
                      }
                      style={styles.datePickerText}
                    >
                      {value ? formatDateForDisplay(value) : "Select end date"}
                    </ResponsiveText>
                  </View>
                  <Ionicons
                    name="chevron-down"
                    size={20}
                    color={COLORS.text.secondary}
                  />
                </TouchableOpacity>
              )}
            />
            {errors.endDate && (
              <ResponsiveText variant="caption2" color={COLORS.error[500]}>
                {errors.endDate.message}
              </ResponsiveText>
            )}
          </View>
        </ResponsiveCard>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Native Date Pickers */}
      <DatePicker
        modal
        open={showStartDatePicker}
        date={startDate}
        mode="date"
        minimumDate={new Date()}
        onConfirm={handleStartDateConfirm}
        onCancel={() => setShowStartDatePicker(false)}
        title="Select Start Date"
        confirmText="Confirm"
        cancelText="Cancel"
        theme="auto"
      />

      <DatePicker
        modal
        open={showEndDatePicker}
        date={endDate}
        mode="date"
        minimumDate={startDate}
        onConfirm={handleEndDateConfirm}
        onCancel={() => setShowEndDatePicker(false)}
        title="Select End Date"
        confirmText="Confirm"
        cancelText="Cancel"
        theme="auto"
      />

      {/* Fixed Bottom Button */}
      <View style={styles.fixedBottomButton}>
        <ResponsiveButton
          title="Create Promotion"
          variant="primary"
          size="large"
          fullWidth
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          disabled={isSubmitting}
        />
      </View>
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
    width: LAYOUT.buttonHeightSmall,
    height: LAYOUT.buttonHeightSmall,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: PADDING.screen,
    paddingTop: MARGIN.md,
    paddingBottom: 100,
  },
  card: {
    marginBottom: MARGIN.lg,
  },
  sectionTitle: {
    marginBottom: MARGIN.sm,
  },
  sectionSubtitle: {
    marginBottom: MARGIN.lg,
  },
  inputGroup: {
    marginBottom: MARGIN.lg,
  },
  inputLabel: {
    marginBottom: MARGIN.xs,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  inputIcon: {
    position: "absolute",
    left: PADDING.inputLarge,
    zIndex: 1,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.input,
    paddingLeft: 40,
    paddingRight: PADDING.inputLarge,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: COLORS.background.primary,
    color: COLORS.text.primary,
  },
  textArea: {
    paddingLeft: PADDING.inputLarge,
    paddingRight: PADDING.inputLarge,
    paddingTop: 8,
    paddingBottom: 8,
    fontSize: 14,
    minHeight: 120,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: COLORS.error[500],
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.input,
    paddingHorizontal: PADDING.inputLarge,
    paddingVertical: 12,
    backgroundColor: COLORS.background.primary,
  },
  dropdownText: {
    fontSize: 14,
  },
  dropdownContainer: {
    zIndex: 1000,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalDropdownContainer: {
    width: "90%",
    maxWidth: 400,
  },
  modalDropdownList: {
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.input,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
    maxHeight: 450,
  },
  modalScrollView: {
    maxHeight: 430,
  },
  modalDropdownItem: {
    paddingHorizontal: PADDING.inputLarge,
    paddingVertical: PADDING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  modalDropdownItemActive: {
    paddingHorizontal: PADDING.inputLarge,
    paddingVertical: PADDING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary[500],
    backgroundColor: COLORS.primary[50],
  },
  dropdownList: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: COLORS.background.primary,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    borderRadius: BORDER_RADIUS.input,
    marginTop: 4,
    zIndex: 1001,
    elevation: 10,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownItem: {
    paddingHorizontal: PADDING.inputLarge,
    paddingVertical: PADDING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  bottomSpacing: {
    height: 20,
  },
  // Image Upload Styles
  imageUploadContainer: {
    marginTop: MARGIN.md,
  },
  imagePlaceholder: {
    height: 200,
    backgroundColor: COLORS.primary[50],
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.border.light,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: MARGIN.sm,
  },
  uploadedImage: {
    width: "100%",
    height: 200,
    borderRadius: BORDER_RADIUS.md,
    resizeMode: "cover",
  },
  uploadText: {
    textAlign: "center",
  },
  uploadSubtext: {
    textAlign: "center",
    opacity: 0.7,
  },
  // Date Picker Styles
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.input,
    paddingHorizontal: PADDING.inputLarge,
    paddingVertical: 12,
    backgroundColor: COLORS.background.primary,
  },
  datePickerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: MARGIN.sm,
  },
  datePickerText: {
    fontSize: 14,
  },
  fixedBottomButton: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background.primary,
    paddingHorizontal: PADDING.screen,
    paddingVertical: PADDING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
});
