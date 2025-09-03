import React from 'react';
import { View, ViewStyle, Platform } from 'react-native';
import { COLORS } from '@/constants';
import { responsiveScale, responsiveSpacing } from '@/constants';

// Card variant types
export type CardVariant = 'elevated' | 'outlined' | 'filled' | 'transparent';

// Card size types
export type CardSize = 'small' | 'medium' | 'large' | 'auto';

// ResponsiveCard props
export interface ResponsiveCardProps {
  variant?: CardVariant;
  size?: CardSize;
  padding?: 'none' | 'small' | 'medium' | 'large';
  margin?: 'none' | 'small' | 'medium' | 'large';
  children: React.ReactNode;
  style?: ViewStyle;
}

// Get cross-platform shadow styles
const getShadowStyles = (variant: CardVariant): ViewStyle => {
  if (variant === 'elevated') {
    if (Platform.OS === 'ios') {
      return {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: responsiveScale(2) },
        shadowOpacity: 0.1,
        shadowRadius: responsiveScale(4),
      };
    } else {
      // Android
      return {
        elevation: responsiveScale(4),
      };
    }
  }
  
  return {};
};

// Get padding based on size
const getPadding = (padding: string): number => {
  switch (padding) {
    case 'none': return 0;
    case 'small': return responsiveSpacing(12);
    case 'medium': return responsiveSpacing(16);
    case 'large': return responsiveSpacing(24);
    default: return responsiveSpacing(16);
  }
};

// Get margin based on size
const getMargin = (margin: string): number => {
  switch (margin) {
    case 'none': return 0;
    case 'small': return responsiveSpacing(8);
    case 'medium': return responsiveSpacing(16);
    case 'large': return responsiveSpacing(24);
    default: return responsiveSpacing(16);
  }
};

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  variant = 'elevated',
  size = 'auto',
  padding = 'medium',
  margin = 'none',
  children,
  style
}) => {
  const baseStyle: ViewStyle = {
    backgroundColor: COLORS.background.primary,
    borderRadius: responsiveScale(12),
    padding: getPadding(padding),
    margin: getMargin(margin),
    ...getShadowStyles(variant),
  };

  // Add border for outlined variant
  if (variant === 'outlined') {
    baseStyle.borderWidth = 1;
    baseStyle.borderColor = COLORS.border.medium;
  }

  // Add background for filled variant
  if (variant === 'filled') {
    baseStyle.backgroundColor = COLORS.background.secondary;
  }

  // Make transparent variant truly transparent
  if (variant === 'transparent') {
    baseStyle.backgroundColor = 'transparent';
  }

  return (
    <View style={[baseStyle, style]}>
      {children}
    </View>
  );
};

export default ResponsiveCard;
