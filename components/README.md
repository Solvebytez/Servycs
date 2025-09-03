# Global Components

This directory contains reusable components that can be used across the entire app.

## GlobalStatusBar

A reusable StatusBar component that provides consistent status bar styling across all screens.

### Usage

```tsx
import { GlobalStatusBar } from '@/components';

export default function MyScreen() {
  return (
    <>
      <GlobalStatusBar />
      {/* Your screen content */}
    </>
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `barStyle` | `'default' \| 'light-content' \| 'dark-content'` | `'light-content'` | Status bar text and icon style |
| `backgroundColor` | `string` | `COLORS.primary[300]` | Status bar background color |
| `translucent` | `boolean` | `true` | Whether status bar is translucent |

### Default Configuration

- **barStyle**: `'light-content'` (white text/icons)
- **backgroundColor**: `COLORS.primary[300]` (dark blue)
- **translucent**: `true` (allows content to go behind status bar)

### Customization Examples

```tsx
// Use default styling
<GlobalStatusBar />

// Custom background color
<GlobalStatusBar backgroundColor={COLORS.secondary[500]} />

// Dark content style
<GlobalStatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

// Non-translucent
<GlobalStatusBar translucent={false} />
```

### Benefits

- **Consistency**: Same status bar styling across all screens
- **Maintainability**: Change status bar globally from one place
- **Reusability**: Import once, use everywhere
- **Type Safety**: Full TypeScript support with proper props interface

### Screens Using GlobalStatusBar

- ✅ `(auth)/role-selection.tsx`
- ✅ `(auth)/auth.tsx`
- 🔄 Add to other screens as needed

### Implementation Notes

- Always place `GlobalStatusBar` at the top level of your component
- Wrap your return statement in React Fragment (`<>`) if you have multiple top-level elements
- The component automatically uses centralized color constants from `@/constants`
