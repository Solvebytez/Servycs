import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ResponsiveText } from './UI/ResponsiveText';
import { COLORS } from '@/constants';
import { responsiveSpacing, responsiveScale } from '@/constants';

/**
 * Global BackButton Component
 * 
 * A reusable back button component that can be used across the entire app.
 * Supports multiple variants, sizes, and customization options.
 * 
 * @example
 * // Basic usage
 * <BackButton onPress={() => router.back()} />
 * 
 * // Custom variant and size
 * <BackButton 
 *   onPress={() => router.back()} 
 *   variant="outlined" 
 *   size="large" 
 *   title="Go Back" 
 * />
 * 
 * // Icon only (no text)
 * <BackButton 
 *   onPress={() => router.back()} 
 *   showText={false} 
 *   size="small" 
 * />
 * 
 * // Custom icon
 * <BackButton 
 *   onPress={() => router.back()} 
 *   iconName="arrow-back" 
 *   variant="filled" 
 * />
 */
interface BackButtonProps {
  /** Function to call when button is pressed */
  onPress: () => void;
  /** Text to display (default: "Back") */
  title?: string;
  /** Visual style variant */
  variant?: 'default' | 'transparent' | 'outlined' | 'filled';
  /** Size of the button */
  size?: 'small' | 'medium' | 'large';
  /** Whether to show the icon */
  showIcon?: boolean;
  /** Whether to show the text */
  showText?: boolean;
  /** Ionicons icon name to use */
  iconName?: keyof typeof Ionicons.glyphMap;
  /** Additional styles for the button container */
  style?: ViewStyle;
  /** Additional styles for the text */
  textStyle?: any;
  /** Whether the button is disabled */
  disabled?: boolean;
}

export const BackButton: React.FC<BackButtonProps> = ({
  onPress,
  title = 'Back',
  variant = 'default',
  size = 'medium',
  showIcon = true,
  showText = true,
  iconName = 'chevron-back',
  style,
  textStyle,
  disabled = false,
}) => {
  const getButtonStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: responsiveScale(8),
      minHeight: responsiveScale(40),
      paddingHorizontal: responsiveSpacing(12),
      paddingVertical: responsiveSpacing(8),
    };

    const sizeStyles: Record<string, ViewStyle> = {
      small: {
        minHeight: responsiveScale(32),
        paddingHorizontal: responsiveSpacing(8),
        paddingVertical: responsiveSpacing(6),
      },
      medium: {
        minHeight: responsiveScale(40),
        paddingHorizontal: responsiveSpacing(12),
        paddingVertical: responsiveSpacing(8),
      },
      large: {
        minHeight: responsiveScale(48),
        paddingHorizontal: responsiveSpacing(16),
        paddingVertical: responsiveSpacing(12),
      },
    };

    const variantStyles: Record<string, ViewStyle> = {
      default: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
      },
      transparent: {
        backgroundColor: 'transparent',
      },
      outlined: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: COLORS.white,
      },
      filled: {
        backgroundColor: COLORS.white,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const getIconSize = (): number => {
    const sizeMap = {
      small: 16,
      medium: 20,
      large: 24,
    };
    return responsiveScale(sizeMap[size]);
  };

  const getTextColor = (): string => {
    if (variant === 'filled') {
      return COLORS.text.primary;
    }
    return COLORS.white;
  };

  const getIconColor = (): string => {
    if (variant === 'filled') {
      return COLORS.text.primary;
    }
    return COLORS.white;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyles(), style]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      {showIcon && (
        <Ionicons
          name={iconName}
          size={getIconSize()}
          color={getIconColor()}
          style={showText ? { marginRight: responsiveSpacing(4) } : undefined}
        />
      )}
      
      {showText && (
        <ResponsiveText
          variant="buttonSmall"
          weight="semiBold"
          color={getTextColor()}
          style={textStyle}
        >
          {title}
        </ResponsiveText>
      )}
    </TouchableOpacity>
  );
};

export default BackButton;
