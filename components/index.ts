// Export all responsive components from a single file for easy importing

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
} from "./UI/ResponsiveText";

// ResponsiveCard components
export {
  default as ResponsiveCard,
  type ResponsiveCardProps,
  type CardVariant,
  type CardSize,
} from "./UI/ResponsiveCard";

// ResponsiveButton components
export {
  default as ResponsiveButton,
  type ResponsiveButtonProps,
  type ButtonVariant,
  type ButtonSize,
  type ButtonShape,
} from "./UI/ResponsiveButton";

// UserProfileButton component
export { default as UserProfileButton } from "./UI/UserProfileButton";

// AppHeader component
export { default as AppHeader } from "./UI/AppHeader";

// Global StatusBar component
export { default as GlobalStatusBar } from "./StatusBar";

// Common components (used across multiple roles)
export * from "./common";

// Role-specific components
export * from "./vendor";
export * from "./user";
export * from "./salesman";

// Re-export commonly used components for convenience
export { ResponsiveText as Text } from "./UI/ResponsiveText";
export { ResponsiveCard as Card } from "./UI/ResponsiveCard";
export { ResponsiveButton as Button } from "./UI/ResponsiveButton";
export { BackButton } from "./BackButton";

// Default export to prevent Expo Router warnings
export default function Components() {
  return null; // This component is never rendered, just for export purposes
}
