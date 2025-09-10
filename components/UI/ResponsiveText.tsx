import React from "react";
import { Text, TextProps, TextStyle } from "react-native";
import {
  COLORS,
  FONT_SIZE,
  LINE_HEIGHT,
  FONT_FAMILY,
  FONT_WEIGHT,
} from "@/constants";
import {
  responsiveFontSize,
  getDeviceType,
  isIPad,
  isAndroidTablet,
} from "@/constants";

// Text variant types
export type TextVariant =
  | "display1"
  | "display2"
  | "display3"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "body1"
  | "body2"
  | "body3"
  | "caption1"
  | "caption2"
  | "caption3"
  | "button"
  | "buttonSmall"
  | "input"
  | "inputLabel"
  | "inputHelper"
  | "navTitle"
  | "navItem"
  | "cardTitle"
  | "cardSubtitle"
  | "cardBody";

// Text weight types
export type TextWeight =
  | "thin"
  | "light"
  | "regular"
  | "medium"
  | "semiBold"
  | "bold"
  | "extraBold"
  | "black";

// ResponsiveText props
export interface ResponsiveTextProps extends TextProps {
  variant?: TextVariant;
  weight?: TextWeight;
  size?: number;
  lineHeight?: number;
  color?: string;
  align?: "auto" | "left" | "right" | "center" | "justify";
  transform?: "none" | "uppercase" | "lowercase" | "capitalize";
  decoration?: "none" | "underline" | "line-through";
  children: React.ReactNode;
}

// Typography styles with responsive font sizes
const TYPOGRAPHY: Record<TextVariant, TextStyle> = {
  display1: {
    fontSize: responsiveFontSize(FONT_SIZE.display1),
    lineHeight: LINE_HEIGHT.display1,
    fontFamily: FONT_FAMILY.bold,
    fontWeight: FONT_WEIGHT.bold as any,
  },
  display2: {
    fontSize: responsiveFontSize(FONT_SIZE.display2),
    lineHeight: LINE_HEIGHT.display2,
    fontFamily: FONT_FAMILY.bold,
    fontWeight: FONT_WEIGHT.bold as any,
  },
  display3: {
    fontSize: responsiveFontSize(FONT_SIZE.display3),
    lineHeight: LINE_HEIGHT.display3,
    fontFamily: FONT_FAMILY.bold,
    fontWeight: FONT_WEIGHT.bold as any,
  },
  h1: {
    fontSize: responsiveFontSize(FONT_SIZE.h1),
    lineHeight: LINE_HEIGHT.h1,
    fontFamily: FONT_FAMILY.bold,
    fontWeight: FONT_WEIGHT.bold as any,
  },
  h2: {
    fontSize: responsiveFontSize(FONT_SIZE.h2),
    lineHeight: LINE_HEIGHT.h2,
    fontFamily: FONT_FAMILY.bold,
    fontWeight: FONT_WEIGHT.bold as any,
  },
  h3: {
    fontSize: responsiveFontSize(FONT_SIZE.h3),
    lineHeight: LINE_HEIGHT.h3,
    fontFamily: FONT_FAMILY.semiBold,
    fontWeight: FONT_WEIGHT.semiBold as any,
  },
  h4: {
    fontSize: responsiveFontSize(FONT_SIZE.h4),
    lineHeight: LINE_HEIGHT.h4,
    fontFamily: FONT_FAMILY.semiBold,
    fontWeight: FONT_WEIGHT.semiBold as any,
  },
  h5: {
    fontSize: responsiveFontSize(FONT_SIZE.h5),
    lineHeight: LINE_HEIGHT.h5,
    fontFamily: FONT_FAMILY.medium,
    fontWeight: FONT_WEIGHT.medium as any,
  },
  h6: {
    fontSize: responsiveFontSize(FONT_SIZE.h6),
    lineHeight: LINE_HEIGHT.h6,
    fontFamily: FONT_FAMILY.medium,
    fontWeight: FONT_WEIGHT.medium as any,
  },
  body1: {
    fontSize: responsiveFontSize(FONT_SIZE.body1),
    lineHeight: LINE_HEIGHT.body1,
    fontFamily: FONT_FAMILY.regular,
    fontWeight: FONT_WEIGHT.regular as any,
  },
  body2: {
    fontSize: responsiveFontSize(FONT_SIZE.body2),
    lineHeight: LINE_HEIGHT.body2,
    fontFamily: FONT_FAMILY.regular,
    fontWeight: FONT_WEIGHT.regular as any,
  },
  body3: {
    fontSize: responsiveFontSize(FONT_SIZE.body3),
    lineHeight: LINE_HEIGHT.body3,
    fontFamily: FONT_FAMILY.regular,
    fontWeight: FONT_WEIGHT.regular as any,
  },
  caption1: {
    fontSize: responsiveFontSize(FONT_SIZE.caption1),
    lineHeight: LINE_HEIGHT.caption1,
    fontFamily: FONT_FAMILY.regular,
    fontWeight: FONT_WEIGHT.regular as any,
  },
  caption2: {
    fontSize: responsiveFontSize(FONT_SIZE.caption2),
    lineHeight: LINE_HEIGHT.caption2,
    fontFamily: FONT_FAMILY.regular,
    fontWeight: FONT_WEIGHT.regular as any,
  },
  caption3: {
    fontSize: responsiveFontSize(FONT_SIZE.caption3),
    lineHeight: LINE_HEIGHT.caption3,
    fontFamily: FONT_FAMILY.regular,
    fontWeight: FONT_WEIGHT.regular as any,
  },
  button: {
    fontSize: responsiveFontSize(FONT_SIZE.button),
    lineHeight: LINE_HEIGHT.button,
    fontFamily: FONT_FAMILY.medium,
    fontWeight: FONT_WEIGHT.medium as any,
  },
  buttonSmall: {
    fontSize: responsiveFontSize(FONT_SIZE.buttonSmall),
    lineHeight: LINE_HEIGHT.buttonSmall,
    fontFamily: FONT_FAMILY.medium,
    fontWeight: FONT_WEIGHT.medium as any,
  },
  input: {
    fontSize: responsiveFontSize(FONT_SIZE.input),
    lineHeight: LINE_HEIGHT.input,
    fontFamily: FONT_FAMILY.regular,
    fontWeight: FONT_WEIGHT.regular as any,
  },
  inputLabel: {
    fontSize: responsiveFontSize(FONT_SIZE.inputLabel),
    lineHeight: LINE_HEIGHT.inputLabel,
    fontFamily: FONT_FAMILY.medium,
    fontWeight: FONT_WEIGHT.medium as any,
  },
  inputHelper: {
    fontSize: responsiveFontSize(FONT_SIZE.inputHelper),
    lineHeight: LINE_HEIGHT.inputHelper,
    fontFamily: FONT_FAMILY.regular,
    fontWeight: FONT_WEIGHT.regular as any,
  },
  navTitle: {
    fontSize: responsiveFontSize(FONT_SIZE.navTitle),
    lineHeight: LINE_HEIGHT.navTitle,
    fontFamily: FONT_FAMILY.semiBold,
    fontWeight: FONT_WEIGHT.semiBold as any,
  },
  navItem: {
    fontSize: responsiveFontSize(FONT_SIZE.navItem),
    lineHeight: LINE_HEIGHT.navItem,
    fontFamily: FONT_FAMILY.regular,
    fontWeight: FONT_WEIGHT.regular as any,
  },
  cardTitle: {
    fontSize: responsiveFontSize(FONT_SIZE.cardTitle),
    lineHeight: LINE_HEIGHT.cardTitle,
    fontFamily: FONT_FAMILY.semiBold,
    fontWeight: FONT_WEIGHT.semiBold as any,
  },
  cardSubtitle: {
    fontSize: responsiveFontSize(FONT_SIZE.cardSubtitle),
    lineHeight: LINE_HEIGHT.cardSubtitle,
    fontFamily: FONT_FAMILY.regular,
    fontWeight: FONT_WEIGHT.regular as any,
  },
  cardBody: {
    fontSize: responsiveFontSize(FONT_SIZE.cardBody),
    lineHeight: LINE_HEIGHT.cardBody,
    fontFamily: FONT_FAMILY.regular,
    fontWeight: FONT_WEIGHT.regular as any,
  },
};

// Get font family based on weight
const getFontFamily = (weight: TextWeight): string => {
  switch (weight) {
    case "thin":
    case "light":
      return FONT_FAMILY.light;
    case "regular":
      return FONT_FAMILY.regular;
    case "medium":
      return FONT_FAMILY.medium;
    case "semiBold":
      return FONT_FAMILY.semiBold;
    case "bold":
    case "extraBold":
    case "black":
      return FONT_FAMILY.bold;
    default:
      return FONT_FAMILY.regular;
  }
};

// Get font weight value
const getFontWeightValue = (weight: TextWeight): string | number => {
  switch (weight) {
    case "thin":
      return FONT_WEIGHT.thin;
    case "light":
      return FONT_WEIGHT.light;
    case "regular":
      return FONT_WEIGHT.regular;
    case "medium":
      return FONT_WEIGHT.medium;
    case "semiBold":
      return FONT_WEIGHT.semiBold;
    case "bold":
      return FONT_WEIGHT.bold;
    case "extraBold":
      return FONT_WEIGHT.extraBold;
    case "black":
      return FONT_WEIGHT.black;
    default:
      return FONT_WEIGHT.regular;
  }
};

// Get typography styles for variant
const getTypographyStyles = (variant: TextVariant): TextStyle => {
  if (TYPOGRAPHY[variant]) {
    return TYPOGRAPHY[variant];
  }

  // Fallback to basic styles
  return {
    fontSize: responsiveFontSize(FONT_SIZE[variant] || FONT_SIZE.body1),
    lineHeight: LINE_HEIGHT[variant] || LINE_HEIGHT.body1,
    fontFamily: FONT_FAMILY.regular,
    fontWeight: FONT_WEIGHT.regular as any,
  };
};

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  variant = "body1",
  weight,
  size,
  lineHeight: customLineHeight,
  color,
  align = "auto",
  transform = "none",
  decoration = "none",
  style,
  children,
  ...props
}) => {
  // Get base typography styles
  const typographyStyles = getTypographyStyles(variant);

  // Determine font family and weight
  const fontFamily = weight
    ? getFontFamily(weight)
    : typographyStyles.fontFamily;
  const fontWeight = weight
    ? getFontWeightValue(weight)
    : typographyStyles.fontWeight;

  // Determine font size
  let fontSize = size || typographyStyles.fontSize || responsiveFontSize(16);

  // Apply device-specific adjustments
  const deviceType = getDeviceType();
  if (deviceType === "tablet") {
    if (isIPad()) {
      fontSize *= 1.1; // 10% larger on iPad
    } else if (isAndroidTablet()) {
      fontSize *= 1.15; // 15% larger on Android tablets
    }
  }

  // Build text style
  const textStyle: TextStyle = {
    fontSize,
    lineHeight: customLineHeight || typographyStyles.lineHeight,
    fontFamily,
    fontWeight: fontWeight as any, // Type assertion to bypass strict typing
    color: color || COLORS.text.primary,
    textAlign: align === "auto" ? "auto" : align,
    textTransform: transform === "none" ? undefined : transform,
    textDecorationLine: decoration === "none" ? undefined : decoration,
  };

  return (
    <Text style={[textStyle, style]} {...props}>
      {children}
    </Text>
  );
};

// Export convenience components for common use cases
export const DisplayText: React.FC<Omit<ResponsiveTextProps, "variant">> = (
  props
) => <ResponsiveText variant="display1" {...props} />;

export const HeadingText: React.FC<
  Omit<ResponsiveTextProps, "variant"> & { level?: 1 | 2 | 3 | 4 | 5 | 6 }
> = ({ level = 1, ...props }) => (
  <ResponsiveText variant={`h${level}` as TextVariant} {...props} />
);

export const BodyText: React.FC<
  Omit<ResponsiveTextProps, "variant"> & { size?: 1 | 2 | 3 }
> = ({ size = 1, ...props }) => (
  <ResponsiveText variant={`body${size}` as TextVariant} {...props} />
);

export const CaptionText: React.FC<
  Omit<ResponsiveTextProps, "variant"> & { size?: 1 | 2 }
> = ({ size = 1, ...props }) => (
  <ResponsiveText variant={`caption${size}` as TextVariant} {...props} />
);

export const ButtonText: React.FC<
  Omit<ResponsiveTextProps, "variant"> & { size?: "normal" | "small" }
> = ({ size = "normal", ...props }) => (
  <ResponsiveText
    variant={size === "small" ? "buttonSmall" : "button"}
    {...props}
  />
);

export const InputText: React.FC<
  Omit<ResponsiveTextProps, "variant"> & { type?: "input" | "label" | "helper" }
> = ({ type = "input", ...props }) => (
  <ResponsiveText
    variant={
      `input${
        type === "label" ? "Label" : type === "helper" ? "Helper" : ""
      }` as TextVariant
    }
    {...props}
  />
);

export default ResponsiveText;
