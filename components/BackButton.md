# Global BackButton Component

A reusable back button component that can be used across the entire app with consistent styling and behavior.

## 🚀 Features

- **Multiple Variants**: `default`, `transparent`, `outlined`, `filled`
- **Three Sizes**: `small`, `medium`, `large`
- **Customizable**: Icon, text, colors, and styling
- **Responsive**: Automatically scales with device size
- **Accessible**: Proper touch targets and feedback

## 📱 Usage Examples

### Basic Usage
```tsx
import { BackButton } from '@/components';

<BackButton onPress={() => router.back()} />
```

### Custom Variant and Size
```tsx
<BackButton 
  onPress={() => router.back()} 
  variant="outlined" 
  size="large" 
  title="Go Back" 
/>
```

### Icon Only (No Text)
```tsx
<BackButton 
  onPress={() => router.back()} 
  showText={false} 
  size="small" 
/>
```

### Custom Icon
```tsx
<BackButton 
  onPress={() => router.back()} 
  iconName="arrow-back" 
  variant="filled" 
/>
```

### Custom Styling
```tsx
<BackButton 
  onPress={() => router.back()} 
  style={{ marginLeft: 20 }}
  textStyle={{ fontWeight: 'bold' }}
/>
```

## 🎨 Variants

| Variant | Description | Use Case |
|---------|-------------|----------|
| `default` | Semi-transparent white background | Auth screens, overlays |
| `transparent` | No background | On top of images |
| `outlined` | Transparent with white border | Clean, minimal look |
| `filled` | White background with dark text | Dark backgrounds |

## 📏 Sizes

| Size | Height | Padding | Use Case |
|------|--------|---------|----------|
| `small` | 32px | 8px | Compact headers |
| `medium` | 40px | 12px | Standard headers |
| `large` | 48px | 16px | Prominent navigation |

## 🔧 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onPress` | `() => void` | **Required** | Function to call when pressed |
| `title` | `string` | `"Back"` | Button text |
| `variant` | `BackButtonVariant` | `"default"` | Visual style |
| `size` | `BackButtonSize` | `"medium"` | Button size |
| `showIcon` | `boolean` | `true` | Whether to show icon |
| `showText` | `boolean` | `true` | Whether to show text |
| `iconName` | `Ionicons key` | `"chevron-back"` | Icon to display |
| `style` | `ViewStyle` | `undefined` | Additional button styles |
| `textStyle` | `TextStyle` | `undefined` | Additional text styles |
| `disabled` | `boolean` | `false` | Whether button is disabled |

## 🌟 Best Practices

1. **Consistent Usage**: Use the same variant/size across similar screens
2. **Accessibility**: Always provide meaningful `onPress` handlers
3. **Responsive**: The component automatically scales with device size
4. **Customization**: Use `style` and `textStyle` for screen-specific adjustments
5. **Icon Selection**: Choose appropriate icons for your use case

## 📍 Where to Use

- **Auth Screens**: Login, signup, role selection
- **Dashboard Headers**: User, vendor, salesman dashboards
- **Modal Headers**: Settings, profile, forms
- **Navigation Bars**: Custom navigation components
- **Overlays**: On top of images or complex backgrounds

## 🔄 Migration

If you have existing back buttons, replace them with:

```tsx
// Before
<TouchableOpacity onPress={() => router.back()}>
  <Text>Back</Text>
</TouchableOpacity>

// After
<BackButton onPress={() => router.back()} />
```

This ensures consistency and reduces code duplication across your app!
