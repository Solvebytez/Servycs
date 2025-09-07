import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { ResponsiveText } from "./ResponsiveText";
import { COLORS, MARGIN, PADDING, BORDER_RADIUS } from "@/constants";

interface UserProfileButtonProps {
  user?: {
    name?: string;
    avatar?: string;
  };
  size?: number;
  onPress?: () => void;
  style?: any;
}

export const UserProfileButton: React.FC<UserProfileButtonProps> = ({
  user,
  size = 40,
  onPress,
  style,
}) => {
  // Get user initials from name
  const getInitials = (name?: string): string => {
    if (!name) return "U";

    const names = name.trim().split(" ");
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }

    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
  };

  const initials = getInitials(user?.name);
  const hasAvatar = user?.avatar && user.avatar.trim() !== "";

  return (
    <TouchableOpacity
      style={[
        styles.profileButton,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {hasAvatar ? (
        <Image
          source={{ uri: user.avatar }}
          style={[
            styles.avatarImage,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
          resizeMode="cover"
        />
      ) : (
        <ResponsiveText
          variant="buttonSmall"
          weight="bold"
          color={COLORS.black}
          style={styles.initialsText}
        >
          {initials}
        </ResponsiveText>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  profileButton: {
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarImage: {
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  initialsText: {
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default UserProfileButton;
