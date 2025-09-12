// Export all UI components from a single file

// ResponsiveText components
export {
  default as ResponsiveText,
  DisplayText,
  HeadingText,
  BodyText,
  CaptionText,
  ButtonText,
  InputText,
  type ResponsiveTextProps,
  type TextVariant,
  type TextWeight,
} from "./ResponsiveText";

// ResponsiveCard components
export {
  default as ResponsiveCard,
  type ResponsiveCardProps,
  type CardVariant,
  type CardSize,
} from "./ResponsiveCard";

// ResponsiveButton components
export {
  default as ResponsiveButton,
  type ResponsiveButtonProps,
  type ButtonVariant,
  type ButtonSize,
  type ButtonShape,
} from "./ResponsiveButton";

// UserProfileButton component
export { default as UserProfileButton } from "./UserProfileButton";

// AppHeader component
export { default as AppHeader } from "./AppHeader";

// Re-export commonly used components for convenience
export { ResponsiveText as Text } from "./ResponsiveText";
export { ResponsiveCard as Card } from "./ResponsiveCard";
export { ResponsiveButton as Button } from "./ResponsiveButton";
