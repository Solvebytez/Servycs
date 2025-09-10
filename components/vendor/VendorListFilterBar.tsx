import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, MARGIN, PADDING, BORDER_RADIUS } from "@/constants";
import { ResponsiveText } from "@/components/UI";

export type FilterStatus = "all" | "live" | "pending" | "inactive";
export type SortOption =
  | "recently_updated"
  | "most_popular"
  | "highest_rated"
  | "lowest_price";
export type ViewMode = "grid" | "list";

interface VendorListFilterBarProps {
  totalCount: number;
  onStatusChange: (status: FilterStatus) => void;
  currentStatus?: FilterStatus;
}

export const VendorListFilterBar: React.FC<VendorListFilterBarProps> = ({
  totalCount,
  onStatusChange,
  currentStatus = "all",
}) => {
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const statusOptions = [
    { value: "all" as FilterStatus, label: "All Status" },
    { value: "live" as FilterStatus, label: "Live" },
    { value: "pending" as FilterStatus, label: "Pending" },
    { value: "inactive" as FilterStatus, label: "Inactive" },
  ];

  const getStatusLabel = (status: FilterStatus) => {
    const option = statusOptions.find((opt) => opt.value === status);
    return `${option?.label} (${totalCount})`;
  };

  const handleStatusSelect = (status: FilterStatus) => {
    onStatusChange(status);
    setShowStatusDropdown(false);
  };

  return (
    <View style={styles.filterBar}>
      <View style={styles.filterRow}>
        {/* Status Dropdown */}
        <View style={styles.dropdownContainer}>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowStatusDropdown(!showStatusDropdown)}
          >
            <ResponsiveText
              variant="caption1"
              weight="medium"
              color={COLORS.text.primary}
            >
              {getStatusLabel(currentStatus)}
            </ResponsiveText>
            <Ionicons
              name={showStatusDropdown ? "chevron-up" : "chevron-down"}
              size={16}
              color={COLORS.text.secondary}
            />
          </TouchableOpacity>

          {/* Status Dropdown Options */}
          {showStatusDropdown && (
            <View style={styles.dropdownMenu}>
              {statusOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.dropdownItem,
                    currentStatus === option.value &&
                      styles.dropdownItemSelected,
                  ]}
                  onPress={() => handleStatusSelect(option.value)}
                >
                  <ResponsiveText
                    variant="caption1"
                    weight={
                      currentStatus === option.value ? "medium" : "regular"
                    }
                    color={
                      currentStatus === option.value
                        ? COLORS.primary[300]
                        : COLORS.text.primary
                    }
                  >
                    {option.label}
                  </ResponsiveText>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  filterBar: {
    marginTop: MARGIN.md,
    marginBottom: MARGIN.md,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingVertical: PADDING.sm,
  },
  dropdownContainer: {
    width: 200,
    position: "relative",
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: PADDING.md,
    paddingVertical: PADDING.sm,
    backgroundColor: COLORS.neutral[50],
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border.light,
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
});

export default VendorListFilterBar;
