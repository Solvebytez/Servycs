# Components Directory Structure

This directory contains all reusable components organized by role and functionality.

## Directory Structure

```
components/
├── UI/                    # Generic UI components (ResponsiveText, ResponsiveCard, etc.)
├── vendor/               # Vendor-specific components
│   ├── VendorMetricsCards.tsx
│   └── index.ts
├── user/                 # User-specific components
│   └── index.ts
├── salesman/             # Salesman-specific components
│   └── index.ts
├── admin/                # Admin-specific components
│   └── index.ts
├── BackButton.tsx        # Shared components
├── StatusBar.tsx
├── index.ts              # Main export file
└── README.md
```

## Usage

### Importing Components

```typescript
// Import from main components index
import { VendorMetricsCards, ResponsiveText } from "@/components";

// Or import directly from role-specific folder
import { VendorMetricsCards } from "@/components/vendor";
```

### Adding New Components

1. **Role-specific components**: Add to the appropriate role folder (vendor/, user/, salesman/, admin/)
2. **Shared components**: Add to the root components directory
3. **UI components**: Add to the UI/ directory
4. **Update exports**: Make sure to export new components in the appropriate index.ts file

## Component Naming Convention

- Use PascalCase for component names
- Prefix with role name for role-specific components (e.g., `VendorMetricsCards`)
- Use descriptive names that indicate the component's purpose

## Examples

### Vendor Components

- `VendorMetricsCards` - Displays vendor dashboard metrics
- `VendorServiceCard` - Individual service card for vendors
- `VendorBookingCard` - Booking information card for vendors

### User Components

- `UserServiceCard` - Service card for users
- `UserBookingCard` - Booking card for users
- `UserProfileCard` - User profile information

### Salesman Components

- `SalesmanTargetCard` - Sales target information
- `SalesmanPerformanceChart` - Performance visualization
- `SalesmanClientCard` - Client information card

### Admin Components

- `AdminDashboardStats` - Admin dashboard statistics
- `AdminUserManagement` - User management interface
- `AdminAnalyticsChart` - Analytics visualization
