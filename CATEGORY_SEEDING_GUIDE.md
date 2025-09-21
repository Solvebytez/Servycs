# Category Seeding Guide

This guide explains how to add the comprehensive categories and subcategories to your Listro marketplace.

## Overview

The system includes 18 main categories with 4 subcategories each, covering all major service areas:

1. **Loans** - Personal, Home, Vehicle, Business Loans
2. **Doctors** - General Physicians, Dentists, Pediatricians, Specialists
3. **Travel** - Flight Booking, Hotels & Stays, Holiday Packages, Local Transport
4. **Beauty** - Hair Care, Skin Treatments, Makeup & Styling, Spa & Wellness
5. **Gyms** - Personal Training, Yoga & Meditation, Weight Training, CrossFit & HIIT
6. **Repairs & Services** - Home Appliances, Mobile & Laptop, Plumbing & Electrical, Car/Bike Services
7. **Education & Courses** - Online Learning, Coaching & Tuition, Language Courses, Professional Certifications
8. **Food & Restaurants** - Fast Food, Fine Dining, Cafés & Bakeries, Online Food Delivery
9. **Shopping & Fashion** - Clothing & Apparel, Footwear, Accessories & Jewellery, Electronics & Gadgets
10. **Real Estate & Housing** - Buy Property, Rent/Lease, Commercial Spaces, Interior Design & Renovation
11. **Automobiles & Vehicles** - Car Sales & Showrooms, Bike & Scooters, Vehicle Rentals, Auto Parts & Accessories
12. **Events & Entertainment** - Movie & Theatre Tickets, Concerts & Shows, Party & Wedding Planning, Gaming & E-sports
13. **Technology & Gadgets** - Smartphones, Laptops & PCs, Smart Home Devices, Wearables & Accessories
14. **Home Cleaning** - Deep Cleaning, Carpet & Sofa Cleaning, Pest Control, Laundry Services
15. **Pet Care** - Veterinary Clinics, Pet Grooming, Pet Food & Accessories, Pet Training
16. **Health & Fitness** - Nutritionists & Diet Plans, Meditation & Wellness, Fitness Equipment, Online Health Programs
17. **Legal Services** - Family & Divorce Lawyers, Property & Real Estate Lawyers, Corporate & Business Law, Criminal & Civil Cases
18. **Financial Planning & Investments** - Insurance Plans, Stock Market & Trading, Mutual Funds & SIPs, Tax & Wealth Management

## Methods to Add Categories

### Method 1: Command Line Script (Recommended)

```bash
# Navigate to backend directory
cd backend

# Seed categories (only if none exist)
npm run seed:categories seed

# Clear all existing categories
npm run seed:categories clear

# Reset categories (clear + seed)
npm run seed:categories reset

# Get category statistics
npm run seed:categories stats
```

### Method 2: Admin API Endpoints

If you have admin access, you can use these API endpoints:

```bash
# Seed categories
POST /api/v1/admin/categories/seed
Authorization: Bearer <admin_token>

# Clear all categories
DELETE /api/v1/admin/categories/clear
Authorization: Bearer <admin_token>

# Reset categories (clear + seed)
POST /api/v1/admin/categories/reset
Authorization: Bearer <admin_token>

# Get category statistics
GET /api/v1/admin/categories/stats
Authorization: Bearer <admin_token>
```

### Method 3: Direct Database Access

You can also run the seeding functions directly in your application:

```typescript
import { 
  seedComprehensiveCategories, 
  clearAllCategories, 
  getCategoryStats 
} from './src/utils/seedComprehensiveCategories';

// Seed categories
await seedComprehensiveCategories();

// Clear categories
await clearAllCategories();

// Get statistics
await getCategoryStats();
```

## File Structure

```
backend/src/
├── utils/
│   └── seedComprehensiveCategories.ts    # Main seeding logic
├── scripts/
│   └── seedCategories.ts                 # Command line script
└── routes/
    └── adminCategories.ts                # Admin API endpoints
```

## Features

- **Hierarchical Structure**: Categories support parent-child relationships
- **URL-Friendly Slugs**: Each category has a SEO-friendly slug
- **Descriptions**: Each category includes helpful descriptions
- **Sort Order**: Categories are ordered logically
- **Statistics**: Track total, root, leaf, and intermediate categories
- **Safety Checks**: Prevents duplicate seeding
- **Admin Controls**: Secure admin-only endpoints for management

## Database Schema

The categories are stored in the `categories` table with the following structure:

```sql
- id: ObjectId (Primary Key)
- name: String (Category name)
- slug: String (URL-friendly identifier)
- description: String (Category description)
- parentId: ObjectId? (Parent category ID for hierarchy)
- sortOrder: Int (Display order)
- isActive: Boolean (Active status)
- createdAt: DateTime
- updatedAt: DateTime
```

## Usage Examples

### Frontend Integration

```typescript
// Get root categories
const rootCategories = await fetch('/api/v1/categories/primary');

// Get category children
const children = await fetch(`/api/v1/categories/${categoryId}/children`);

// Get all categories as flat list
const allCategories = await fetch('/api/v1/categories/tree');
```

### Service Listing Creation

```typescript
// When creating a service listing, include the category path
const serviceListing = {
  title: "Professional Haircut",
  description: "Expert hair cutting services",
  categoryId: "hair-care-category-id",
  categoryPath: ["Beauty", "Hair Care"],
  // ... other fields
};
```

## Troubleshooting

### Common Issues

1. **Categories already exist**: Use `clear` command first, then `seed`
2. **Permission denied**: Ensure you have admin role for API endpoints
3. **Database connection**: Make sure MongoDB is running and accessible
4. **Slug conflicts**: The system automatically generates unique slugs

### Logs

Check the application logs for detailed information about the seeding process:

```bash
# View logs
tail -f logs/combined-$(date +%Y-%m-%d).log
```

## Customization

To modify categories, edit the `comprehensiveCategories` array in `seedComprehensiveCategories.ts`:

```typescript
const comprehensiveCategories = [
  {
    name: "Your Category",
    slug: "your-category",
    description: "Your category description",
    children: [
      {
        name: "Subcategory 1",
        slug: "subcategory-1",
        description: "Subcategory description",
      },
      // ... more subcategories
    ],
  },
  // ... more categories
];
```

## Support

For issues or questions about category seeding, check:
1. Application logs
2. Database connection
3. Admin permissions
4. Category statistics endpoint

The system is designed to be robust and handle edge cases gracefully.
