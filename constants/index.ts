// Export all constants from a single file for easy importing
export * from './simple';

// Re-export commonly used constants for convenience
export { COLORS } from './simple';
export { FONT_SIZE, LINE_HEIGHT, FONT_FAMILY, FONT_WEIGHT } from './simple';
export { SPACING, PADDING, MARGIN, BORDER_RADIUS, LAYOUT } from './simple';

// Export responsive utilities
export {
  responsiveScale,
  responsiveFontSize,
  responsiveSpacing,
  getDeviceType,
  getAccessibilityScale,
  isLandscape,
  isPortrait,
  getDeviceOrientation,
  isSmallPhone,
  isMediumPhone,
  isLargePhone,
  isIPad,
  isAndroidTablet,
  getDeviceAdjustment,
  responsiveValue,
  responsiveObject,
  getScreenDimensions,
  addDimensionListener,
  removeDimensionListener,
  DEVICE_INFO
} from './responsive';
