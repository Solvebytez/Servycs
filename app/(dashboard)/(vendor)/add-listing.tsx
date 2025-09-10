import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
  MARGIN,
  PADDING,
  BORDER_RADIUS,
  LAYOUT,
} from "@/constants";

interface FormData {
  title: string;
  category: string;
  description: string;
  images: string[];
}

const categories = [
  "Massage Therapy",
  "Facial Treatment",
  "Wellness",
  "Beauty Services",
  "Spa Treatments",
  "Hair Services",
  "Nail Services",
  "Other",
];

export default function AddListingScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    title: "",
    category: "",
    description: "",
    images: [],
  });
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedAddresses, setSelectedAddresses] = useState<string[]>([]);
  const [newAddress, setNewAddress] = useState({
    address: "",
  });
  const [showMultipleServices, setShowMultipleServices] = useState(false);
  const [multipleServices, setMultipleServices] = useState([
    {
      id: 1,
      name: "",
      description: "",
      price: "",
      discountPrice: "",
    },
  ]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = () => {
    // TODO: Implement actual image upload functionality
    Alert.alert(
      "Image Upload",
      "Image upload functionality will be implemented with proper file picker and upload service"
    );
  };

  const handlePreview = () => {
    // TODO: Implement preview functionality
    Alert.alert(
      "Preview",
      "Preview functionality will show how the listing will appear to users"
    );
  };

  const handleAddressInputChange = (
    field: keyof typeof newAddress,
    value: string
  ) => {
    setNewAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveAddress = () => {
    if (!newAddress.address.trim()) {
      Alert.alert("Error", "Please enter an address");
      return;
    }

    // TODO: Save address to database
    Alert.alert("Address Saved", "Address has been saved successfully", [
      {
        text: "OK",
        onPress: () => {
          setShowAddressForm(false);
          setNewAddress({ address: "" });
        },
      },
    ]);
  };

  const handleCancelAddressForm = () => {
    setShowAddressForm(false);
    setNewAddress({ address: "" });
  };

  const handleMultipleServiceChange = (
    id: number,
    field: string,
    value: string
  ) => {
    setMultipleServices((prev) =>
      prev.map((service) =>
        service.id === id ? { ...service, [field]: value } : service
      )
    );
  };

  const addNewService = () => {
    const newId = Math.max(...multipleServices.map((s) => s.id)) + 1;
    setMultipleServices((prev) => [
      ...prev,
      {
        id: newId,
        name: "",
        description: "",
        price: "",
        discountPrice: "",
      },
    ]);
  };

  const removeService = (id: number) => {
    if (multipleServices.length > 1) {
      setMultipleServices((prev) =>
        prev.filter((service) => service.id !== id)
      );
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Alert.alert("Error", "Please enter a shop name");
      return;
    }
    if (!formData.category) {
      Alert.alert("Error", "Please select a service category");
      return;
    }
    if (!formData.description.trim()) {
      Alert.alert("Error", "Please enter a service description");
      return;
    }

    try {
      setIsSubmitting(true);
      // TODO: Implement actual API call to create listing
      // await serviceService.createListing(formData);

      Alert.alert("Success", "Your listing has been created successfully!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Error creating listing:", error);
      Alert.alert("Error", "Failed to create listing. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <GlobalStatusBar />

      {/* Header with Solid Background */}
      <View style={styles.headerSolid}>
        {/* Top Navigation */}
        <View style={styles.topNavigation}>
          <BackButton
            onPress={() => router.back()}
            variant="default"
            size="medium"
            showText={false}
            showIcon={true}
            iconName="arrow-back"
          />
          <View style={styles.titleContainer}>
            <ResponsiveText variant="h5" weight="bold" color={COLORS.white}>
              Add New Listing
            </ResponsiveText>
            <ResponsiveText
              variant="body2"
              color={COLORS.white}
              style={styles.subtitle}
            >
              Create a new service offering
            </ResponsiveText>
          </View>
          <TouchableOpacity
            style={styles.previewButton}
            onPress={handlePreview}
          >
            <Ionicons
              name="eye"
              size={LAYOUT.iconMedium}
              color={COLORS.white}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Product Images Section */}
        <ResponsiveCard variant="elevated" style={styles.formCard}>
          <ResponsiveText
            variant="h6"
            weight="bold"
            color={COLORS.text.primary}
            style={styles.sectionTitle}
          >
            Product Images
          </ResponsiveText>

          <TouchableOpacity
            style={styles.uploadArea}
            onPress={handleImageUpload}
            activeOpacity={0.7}
          >
            <Ionicons
              name="cloud-upload"
              size={LAYOUT.iconLarge}
              color={COLORS.text.secondary}
            />
            <ResponsiveText
              variant="h6"
              weight="bold"
              color={COLORS.text.primary}
              style={styles.uploadTitle}
            >
              Upload Images
            </ResponsiveText>
            <ResponsiveText
              variant="body2"
              color={COLORS.text.secondary}
              style={styles.uploadInstructions}
            >
              Drag & drop your images, or click to browse
            </ResponsiveText>
            <ResponsiveText
              variant="caption2"
              color={COLORS.text.secondary}
              style={styles.uploadRequirements}
            >
              JPG, PNG up to 5MB
            </ResponsiveText>
          </TouchableOpacity>
        </ResponsiveCard>

        {/* Listing Details Section */}
        <ResponsiveCard variant="elevated" style={styles.formCard}>
          <ResponsiveText
            variant="h6"
            weight="bold"
            color={COLORS.text.primary}
            style={styles.sectionTitle}
          >
            Listing Details
          </ResponsiveText>
          <ResponsiveText
            variant="body2"
            color={COLORS.text.secondary}
            style={styles.sectionSubtitle}
          >
            Provide detailed information about your service
          </ResponsiveText>

          {/* Shop Name Input */}
          <View style={styles.inputGroup}>
            <ResponsiveText
              variant="inputLabel"
              weight="medium"
              color={COLORS.text.primary}
              style={styles.inputLabel}
            >
              Shop Name *
            </ResponsiveText>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your shop name"
              placeholderTextColor={COLORS.text.secondary}
              value={formData.title}
              onChangeText={(text) => handleInputChange("title", text)}
              maxLength={100}
            />
          </View>

          {/* Category Dropdown */}
          <View style={styles.inputGroup}>
            <ResponsiveText
              variant="inputLabel"
              weight="medium"
              color={COLORS.text.primary}
              style={styles.inputLabel}
            >
              Service Category *
            </ResponsiveText>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
            >
              <ResponsiveText
                variant="body2"
                color={
                  formData.category
                    ? COLORS.text.primary
                    : COLORS.text.secondary
                }
              >
                {formData.category || "Select a category"}
              </ResponsiveText>
              <Ionicons
                name={showCategoryDropdown ? "chevron-up" : "chevron-down"}
                size={20}
                color={COLORS.text.secondary}
              />
            </TouchableOpacity>

            {/* Category Dropdown Options */}
            {showCategoryDropdown && (
              <View style={styles.dropdownMenu}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.dropdownItem,
                      formData.category === category &&
                        styles.dropdownItemSelected,
                    ]}
                    onPress={() => {
                      handleInputChange("category", category);
                      setShowCategoryDropdown(false);
                    }}
                  >
                    <ResponsiveText
                      variant="body1"
                      color={
                        formData.category === category
                          ? COLORS.primary[300]
                          : COLORS.text.primary
                      }
                    >
                      {category}
                    </ResponsiveText>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Description Text Area */}
          <View style={styles.inputGroup}>
            <ResponsiveText
              variant="inputLabel"
              weight="medium"
              color={COLORS.text.primary}
              style={styles.inputLabel}
            >
              Detailed Description *
            </ResponsiveText>
            <View style={styles.textAreaContainer}>
              <TextInput
                style={styles.textArea}
                placeholder="Describe your service in detail. Include what makes it special, benefits, duration, what to expect..."
                placeholderTextColor={COLORS.text.secondary}
                value={formData.description}
                onChangeText={(text) => handleInputChange("description", text)}
                multiline
                numberOfLines={6}
                maxLength={1000}
                textAlignVertical="top"
              />
              <View style={styles.characterCounter}>
                <ResponsiveText
                  variant="caption2"
                  color={COLORS.text.secondary}
                >
                  {formData.description.length}/1000 characters
                </ResponsiveText>
              </View>
            </View>
          </View>
        </ResponsiveCard>

        {/* Add Address Button */}
        <View style={styles.addAddressSection}>
          <ResponsiveButton
            title="Add Address"
            variant="outline"
            size="medium"
            fullWidth
            onPress={() => setShowAddressModal(true)}
            leftIcon={
              <Ionicons name="add" size={16} color={COLORS.primary[300]} />
            }
          />
        </View>

        {/* Add Multiple Services Button */}
        <View style={styles.addMultipleServicesSection}>
          <ResponsiveButton
            title={
              showMultipleServices
                ? "Hide Multiple Services"
                : "Add Multiple Services"
            }
            variant="outline"
            size="medium"
            fullWidth
            onPress={() => setShowMultipleServices(!showMultipleServices)}
            leftIcon={
              <Ionicons
                name={showMultipleServices ? "remove-circle" : "add-circle"}
                size={16}
                color={COLORS.primary[300]}
              />
            }
          />
        </View>

        {/* Multiple Services Form */}
        {showMultipleServices && (
          <View style={styles.multipleServicesContainer}>
            <ResponsiveText
              variant="h6"
              weight="bold"
              color={COLORS.text.primary}
              style={styles.multipleServicesTitle}
            >
              Multiple Services
            </ResponsiveText>
            <ResponsiveText
              variant="body2"
              color={COLORS.text.secondary}
              style={styles.multipleServicesSubtitle}
            >
              Add multiple service options with different pricing
            </ResponsiveText>

            {multipleServices.map((service, index) => (
              <ResponsiveCard
                key={service.id}
                variant="elevated"
                style={styles.serviceCard}
              >
                <View style={styles.serviceCardHeader}>
                  <ResponsiveText
                    variant="h6"
                    weight="bold"
                    color={COLORS.text.primary}
                  >
                    Service {index + 1}
                  </ResponsiveText>
                  {multipleServices.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeServiceButton}
                      onPress={() => removeService(service.id)}
                    >
                      <Ionicons
                        name="close-circle"
                        size={20}
                        color={COLORS.error[500]}
                      />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Service Name */}
                <View style={styles.inputGroup}>
                  <ResponsiveText
                    variant="inputLabel"
                    weight="medium"
                    color={COLORS.text.primary}
                    style={styles.inputLabel}
                  >
                    Service Name *
                  </ResponsiveText>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter service name"
                    placeholderTextColor={COLORS.text.secondary}
                    value={service.name}
                    onChangeText={(text) =>
                      handleMultipleServiceChange(service.id, "name", text)
                    }
                  />
                </View>

                {/* Service Description */}
                <View style={styles.inputGroup}>
                  <ResponsiveText
                    variant="inputLabel"
                    weight="medium"
                    color={COLORS.text.primary}
                    style={styles.inputLabel}
                  >
                    Service Description *
                  </ResponsiveText>
                  <TextInput
                    style={styles.textArea}
                    placeholder="Describe this service"
                    placeholderTextColor={COLORS.text.secondary}
                    value={service.description}
                    onChangeText={(text) =>
                      handleMultipleServiceChange(
                        service.id,
                        "description",
                        text
                      )
                    }
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>

                {/* Price and Discount Row */}
                <View style={styles.priceRow}>
                  {/* Service Price */}
                  <View style={[styles.inputGroup, styles.priceInputGroup]}>
                    <ResponsiveText
                      variant="inputLabel"
                      weight="medium"
                      color={COLORS.text.primary}
                      style={styles.inputLabel}
                    >
                      Price *
                    </ResponsiveText>
                    <TextInput
                      style={styles.textInput}
                      placeholder="0.00"
                      placeholderTextColor={COLORS.text.secondary}
                      value={service.price}
                      onChangeText={(text) =>
                        handleMultipleServiceChange(service.id, "price", text)
                      }
                      keyboardType="numeric"
                    />
                  </View>

                  {/* Discount Price */}
                  <View style={[styles.inputGroup, styles.priceInputGroup]}>
                    <ResponsiveText
                      variant="inputLabel"
                      weight="medium"
                      color={COLORS.text.primary}
                      style={styles.inputLabel}
                    >
                      Discount Price
                    </ResponsiveText>
                    <TextInput
                      style={styles.textInput}
                      placeholder="0.00"
                      placeholderTextColor={COLORS.text.secondary}
                      value={service.discountPrice}
                      onChangeText={(text) =>
                        handleMultipleServiceChange(
                          service.id,
                          "discountPrice",
                          text
                        )
                      }
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </ResponsiveCard>
            ))}

            {/* Add New Service Button */}
            <ResponsiveButton
              title="Add Another Service"
              variant="outline"
              size="medium"
              fullWidth
              onPress={addNewService}
              leftIcon={
                <Ionicons name="add" size={16} color={COLORS.primary[300]} />
              }
              style={styles.addAnotherServiceButton}
            />
          </View>
        )}

        {/* Bottom Spacing for Fixed Button */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.fixedBottomButton}>
        <ResponsiveButton
          title="Create Listing"
          variant="primary"
          size="large"
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={isSubmitting}
          style={styles.submitButton}
        />
      </View>

      {/* Address Modal */}
      <Modal
        visible={showAddressModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddressModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowAddressModal(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color={COLORS.text.primary} />
            </TouchableOpacity>
            <ResponsiveText
              variant="h5"
              weight="bold"
              color={COLORS.text.primary}
            >
              Select Addresses
            </ResponsiveText>
            <View style={styles.modalPlaceholder} />
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Existing Addresses Section */}
            <ResponsiveCard variant="elevated" style={styles.modalCard}>
              <ResponsiveText
                variant="h6"
                weight="bold"
                color={COLORS.text.primary}
                style={styles.modalSectionTitle}
              >
                Existing Addresses
              </ResponsiveText>

              {/* TODO: Replace with actual addresses from DB */}
              <View style={styles.emptyAddressState}>
                <Ionicons
                  name="location-outline"
                  size={LAYOUT.iconLarge}
                  color={COLORS.text.secondary}
                />
                <ResponsiveText
                  variant="body2"
                  color={COLORS.text.secondary}
                  style={styles.emptyAddressText}
                >
                  No addresses found. Add your first address below.
                </ResponsiveText>
              </View>
            </ResponsiveCard>

            {/* Add New Address Section */}
            <ResponsiveCard variant="elevated" style={styles.modalCard}>
              <ResponsiveText
                variant="h6"
                weight="bold"
                color={COLORS.text.primary}
                style={styles.modalSectionTitle}
              >
                Add New Address
              </ResponsiveText>

              <ResponsiveButton
                title="Add New Address"
                variant="primary"
                size="medium"
                onPress={() => setShowAddressForm(true)}
                leftIcon={
                  <Ionicons name="add" size={16} color={COLORS.white} />
                }
                style={styles.addNewAddressButton}
              />
            </ResponsiveCard>

            {/* Address Form - Inline */}
            {showAddressForm && (
              <ResponsiveCard variant="elevated" style={styles.modalCard}>
                <ResponsiveText
                  variant="h6"
                  weight="bold"
                  color={COLORS.text.primary}
                  style={styles.modalSectionTitle}
                >
                  Address Information
                </ResponsiveText>

                {/* Address */}
                <View style={styles.inputGroup}>
                  <TextInput
                    style={styles.textArea}
                    placeholder="Enter the business address"
                    placeholderTextColor={COLORS.text.secondary}
                    value={newAddress.address}
                    onChangeText={(text) =>
                      handleAddressInputChange("address", text)
                    }
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>

                {/* Form Actions */}
                <View style={styles.formActions}>
                  <ResponsiveButton
                    title="Save Address"
                    variant="outline"
                    size="small"
                    fullWidth
                    onPress={handleSaveAddress}
                    style={styles.formSaveButton}
                  />
                </View>
              </ResponsiveCard>
            )}
          </ScrollView>

          {/* Modal Footer */}
          <View style={styles.modalFooter}>
            <ResponsiveButton
              title="Cancel"
              variant="danger"
              size="medium"
              onPress={() => setShowAddressModal(false)}
              style={styles.modalCancelButton}
              textStyle={styles.modalCancelButtonText}
            />
            <ResponsiveButton
              title="Done"
              variant="primary"
              size="medium"
              onPress={() => setShowAddressModal(false)}
              style={styles.modalDoneButton}
            />
          </View>
        </SafeAreaView>
      </Modal>
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
    paddingTop: MARGIN.sm,
    marginBottom: MARGIN.sm,
    minHeight: 60,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  subtitle: {
    marginTop: MARGIN.xs,
    textAlign: "center",
  },
  previewButton: {
    width: LAYOUT.buttonHeightSmall,
    height: LAYOUT.buttonHeightSmall,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: PADDING.screen,
    paddingBottom: 100, // Space for fixed button
  },
  formCard: {
    marginTop: MARGIN.lg,
    marginBottom: MARGIN.md,
  },
  sectionTitle: {
    marginBottom: MARGIN.sm,
  },
  sectionSubtitle: {
    marginBottom: MARGIN.lg,
  },
  uploadArea: {
    height: 200,
    borderWidth: 2,
    borderColor: COLORS.border.light,
    borderStyle: "dashed",
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.neutral[50],
    alignItems: "center",
    justifyContent: "center",
    padding: PADDING.lg,
  },
  uploadTitle: {
    marginTop: MARGIN.md,
    marginBottom: MARGIN.sm,
  },
  uploadInstructions: {
    textAlign: "center",
    marginBottom: MARGIN.sm,
  },
  uploadRequirements: {
    textAlign: "center",
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
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.text.primary,
    backgroundColor: COLORS.background.primary,
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
  dropdownMenu: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    marginTop: MARGIN.xs,
    zIndex: 1000,
    elevation: 5,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownItem: {
    paddingHorizontal: PADDING.md,
    paddingVertical: PADDING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  dropdownItemSelected: {
    backgroundColor: COLORS.primary[50],
  },
  textAreaContainer: {
    position: "relative",
  },
  textArea: {
    borderWidth: 1,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.input,
    paddingHorizontal: PADDING.inputLarge,
    paddingTop: 8,
    paddingBottom: 32, // Space for character counter
    fontSize: 14,
    color: COLORS.text.primary,
    backgroundColor: COLORS.background.primary,
    minHeight: 120,
  },
  compactTextArea: {
    borderWidth: 1,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.input,
    paddingHorizontal: PADDING.inputLarge,
    paddingVertical: 12,
    paddingBottom: 32,
    fontSize: 14,
    color: COLORS.text.primary,
    backgroundColor: COLORS.background.primary,
    minHeight: 120,
  },
  characterCounter: {
    position: "absolute",
    bottom: PADDING.sm,
    right: PADDING.md,
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
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  submitButton: {
    width: "100%",
  },
  bottomSpacing: {
    height: 100,
  },
  // Add Address Section Styles
  addAddressSection: {
    marginTop: MARGIN.md,
    marginBottom: MARGIN.md,
    alignItems: "center",
  },
  // Add Multiple Services Section Styles
  addMultipleServicesSection: {
    marginTop: MARGIN.md,
    marginBottom: MARGIN.md,
    alignItems: "center",
  },
  // Multiple Services Form Styles
  multipleServicesContainer: {
    marginTop: MARGIN.lg,
    marginBottom: MARGIN.lg,
  },
  multipleServicesTitle: {
    marginBottom: MARGIN.sm,
  },
  multipleServicesSubtitle: {
    marginBottom: MARGIN.lg,
  },
  serviceCard: {
    marginBottom: MARGIN.lg,
  },
  serviceCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: MARGIN.lg,
  },
  removeServiceButton: {
    padding: PADDING.xs,
  },
  priceRow: {
    flexDirection: "row",
    gap: MARGIN.md,
  },
  priceInputGroup: {
    flex: 1,
  },
  addAnotherServiceButton: {
    marginTop: MARGIN.lg,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: PADDING.screen,
    paddingVertical: MARGIN.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  modalCloseButton: {
    padding: PADDING.sm,
  },
  modalPlaceholder: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: PADDING.screen,
  },
  modalCard: {
    marginTop: MARGIN.lg,
    marginBottom: MARGIN.md,
  },
  modalSectionTitle: {
    marginBottom: MARGIN.lg,
  },
  emptyAddressState: {
    alignItems: "center",
    paddingVertical: MARGIN.xl,
  },
  emptyAddressText: {
    textAlign: "center",
    marginTop: MARGIN.md,
  },
  addNewAddressButton: {
    marginTop: MARGIN.sm,
  },
  modalFooter: {
    flexDirection: "row",
    paddingHorizontal: PADDING.screen,
    paddingVertical: MARGIN.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
    gap: MARGIN.md,
  },
  modalCancelButton: {
    flex: 1,
    borderColor: COLORS.error[500],
    borderWidth: 1,
    backgroundColor: COLORS.background.primary,
  },
  modalCancelButtonText: {
    color: COLORS.error[500],
  },
  modalDoneButton: {
    flex: 1,
  },
  // Inline Form Actions
  formActions: {
    marginTop: MARGIN.xs,
  },
  formCancelButton: {
    flex: 1,
    borderColor: COLORS.error[500],
    borderWidth: 1,
    backgroundColor: COLORS.background.primary,
  },
  formSaveButton: {
    flex: 1,
  },
});
