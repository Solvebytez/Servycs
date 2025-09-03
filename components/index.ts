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
  type TextWeight
} from './UI/ResponsiveText';

// ResponsiveCard components
export { 
  default as ResponsiveCard,
  type ResponsiveCardProps,
  type CardVariant,
  type CardSize
} from './UI/ResponsiveCard';

// ResponsiveButton components
export { 
  default as ResponsiveButton,
  type ResponsiveButtonProps,
  type ButtonVariant,
  type ButtonSize,
  type ButtonShape
} from './UI/ResponsiveButton';

// Global StatusBar component
export { default as GlobalStatusBar } from './StatusBar';

// Re-export commonly used components for convenience
export { ResponsiveText as Text } from './UI/ResponsiveText';
export { ResponsiveCard as Card } from './UI/ResponsiveCard';
export { ResponsiveButton as Button } from './UI/ResponsiveButton';
