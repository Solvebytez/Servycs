import React from 'react';
import { 
  TouchableOpacity, 
  TouchableOpacityProps, 
  ViewStyle, 
  TextStyle, 
  ActivityIndicator,
  View,
  Platform
} from 'react-native';
import { COLORS } from '@/constants';
import { ResponsiveText } from './ResponsiveText';
import { 
  responsiveScale,
  responsiveSpacing,
  getDeviceType, 
  isIPad, 
  isAndroidTablet 
} from '@/constants';

// Button variant types
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning';

// Button size types
export type ButtonSize = 'small' | 'medium' | 'large';

// Button shape types
export type ButtonShape = 'rounded' | 'pill' | 'square';

// ResponsiveButton props
export interface ResponsiveButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  title: string;
  subtitle?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  align?: 'left' | 'center' | 'right';
  onPress?: () => void;
  onLongPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  activeOpacity?: number;
}

// Get button dimensions based on size and device
const getButtonDimensions = (size: ButtonSize): { height: number; paddingHorizontal: number } => {
  const deviceType = getDeviceType();
  let baseHeight = responsiveScale(48); // Base button height
  let basePaddingHorizontal = responsiveSpacing(16); // Base padding
  
  // Apply device-specific adjustments
  if (deviceType === 'tablet') {
    if (isIPad()) {
      baseHeight *= 1.15; // 15% larger on iPad
      basePaddingHorizontal *= 1.2; // 20% larger padding on iPad
    } else if (isAndroidTablet()) {
      baseHeight *= 1.2; // 20% larger on Android tablets
      basePaddingHorizontal *= 1.25; // 25% larger padding on Android tablets
    }
  }
  
  // Apply size-specific adjustments
  switch (size) {
    case 'small':
      return {
        height: baseHeight * 0.8,
        paddingHorizontal: basePaddingHorizontal * 0.8,
      };
    case 'large':
      return {
        height: baseHeight * 1.2,
        paddingHorizontal: basePaddingHorizontal * 1.2,
      };
    case 'medium':
    default:
      return {
        height: baseHeight,
        paddingHorizontal: basePaddingHorizontal,
      };
  }
};

// Get cross-platform shadow styles
const getShadowStyles = (variant: ButtonVariant): ViewStyle => {
  if (variant === 'primary' || variant === 'secondary') {
    if (Platform.OS === 'ios') {
      return {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: responsiveScale(2) },
        shadowOpacity: 0.15,
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

// Get button styles based on variant
const getButtonStyles = (variant: ButtonVariant, disabled: boolean): { 
  container: ViewStyle; 
  text: TextStyle; 
  border: ViewStyle;
} => {
  if (disabled) {
    return {
      container: {
        backgroundColor: COLORS.neutral[300],
        borderColor: COLORS.neutral[400],
      },
      text: {
        color: COLORS.text.disabled,
      },
      border: {
        borderWidth: 1,
        borderColor: COLORS.neutral[400],
      },
    };
  }
  
  switch (variant) {
    case 'primary':
      return {
        container: {
          backgroundColor: COLORS.primary[200],
          borderColor: COLORS.primary[300],
        },
        text: {
          color: COLORS.text.inverse,
        },
        border: {
          borderWidth: 1,
          borderColor: COLORS.primary[300],
        },
      };
    case 'secondary':
      return {
        container: {
          backgroundColor: COLORS.background.secondary,
          borderColor: COLORS.border.medium,
        },
        text: {
          color: COLORS.text.primary,
        },
        border: {
          borderWidth: 1,
          borderColor: COLORS.border.medium,
        },
      };
    case 'outline':
      return {
        container: {
          backgroundColor: 'transparent',
          borderColor: COLORS.primary[200],
        },
        text: {
          color: COLORS.primary[200],
        },
        border: {
          borderWidth: 2,
          borderColor: COLORS.primary[200],
        },
      };
    case 'ghost':
      return {
        container: {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        },
        text: {
          color: COLORS.primary[200],
        },
        border: {
          borderWidth: 0,
          borderColor: 'transparent',
        },
      };
    case 'danger':
      return {
        container: {
          backgroundColor: COLORS.error[500],
          borderColor: COLORS.error[600],
        },
        text: {
          color: COLORS.text.inverse,
        },
        border: {
          borderWidth: 1,
          borderColor: COLORS.error[600],
        },
      };
    case 'success':
      return {
        container: {
          backgroundColor: COLORS.success[500],
          borderColor: COLORS.success[600],
        },
        text: {
          color: COLORS.text.inverse,
        },
        border: {
          borderWidth: 1,
          borderColor: COLORS.success[600],
        },
      };
    case 'warning':
      return {
        container: {
          backgroundColor: COLORS.warning[500],
          borderColor: COLORS.warning[600],
        },
        text: {
          color: COLORS.text.inverse,
        },
        border: {
          borderWidth: 1,
          borderColor: COLORS.warning[600],
        },
      };
    default:
      return {
        container: {
          backgroundColor: COLORS.primary[200],
          borderColor: COLORS.primary[300],
        },
        text: {
          color: COLORS.text.inverse,
        },
        border: {
          borderWidth: 1,
          borderColor: COLORS.primary[300],
        },
      };
  }
};

// Get border radius based on shape and height
const getBorderRadius = (shape: ButtonShape, height: number): number => {
  switch (shape) {
    case 'pill':
      return height / 2;
    case 'square':
      return 0;
    case 'rounded':
    default:
      return responsiveScale(8);
  }
};

export const ResponsiveButton: React.FC<ResponsiveButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  shape = 'rounded',
  title,
  subtitle,
  leftIcon,
  rightIcon,
  loading = false,
  disabled = false,
  fullWidth = false,
  align = 'center',
  onPress,
  onLongPress,
  style,
  textStyle,
  activeOpacity = 0.7,
  ...props
}) => {
  // Get button dimensions
  const { height, paddingHorizontal } = getButtonDimensions(size);
  
  // Get button styles
  const buttonStyles = getButtonStyles(variant, disabled);
  
  // Get border radius
  const borderRadius = getBorderRadius(shape, height);
  
  // Get shadow styles
  const shadowStyles = getShadowStyles(variant);
  
  // Build button style
  const buttonStyle: ViewStyle = {
    height,
    paddingHorizontal,
    borderRadius,
    justifyContent: 'center',
    alignItems: align === 'center' ? 'center' : align === 'left' ? 'flex-start' : 'flex-end',
    flexDirection: 'row',
    minWidth: fullWidth ? '100%' : undefined,
    ...buttonStyles.container,
    ...buttonStyles.border,
    ...shadowStyles,
  };

  // Build text style
  const finalTextStyle: TextStyle = {
    ...buttonStyles.text,
    textAlign: align,
    ...textStyle,
  };

  // Determine if button should be disabled
  const isButtonDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[buttonStyle, style]}
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={isButtonDisabled}
      activeOpacity={activeOpacity}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={buttonStyles.text.color} 
        />
      ) : (
        <>
          {leftIcon && (
            <View style={{ marginRight: responsiveSpacing(4) }}>
              {leftIcon}
            </View>
          )}
          
          <View style={{ alignItems: align === 'center' ? 'center' : align === 'left' ? 'flex-start' : 'flex-end' }}>
            <ResponsiveText variant={size === 'small' ? 'buttonSmall' : 'button'} style={finalTextStyle}>
              {title}
            </ResponsiveText>
            {subtitle && (
              <ResponsiveText 
                variant="caption1" 
                style={[finalTextStyle, { marginTop: responsiveSpacing(4) }]}
              >
                {subtitle}
              </ResponsiveText>
            )}
          </View>
          
          {rightIcon && (
            <View style={{ marginLeft: responsiveSpacing(4) }}>
              {rightIcon}
            </View>
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

export default ResponsiveButton;
