# Nested Category System

This document describes the new nested category system that replaces the previous enum-based categories.

## Overview

The new system supports unlimited nesting levels with parent-child relationships, allowing for dynamic category management through the admin interface.

## Database Schema

### Category Model

```prisma
model Category {
  id          String     @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  slug        String     @unique
  description String?
  isActive    Boolean    @default(true)

  // Self-referential relation for parent/child hierarchy
  parentId    String?    @db.ObjectId
  parent      Category?  @relation("CategoryHierarchy", fields: [parentId], references: [id], onDelete: Cascade)
  children    Category[] @relation("CategoryHierarchy")

  // Metadata
  sortOrder   Int        @default(0)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  // Relations
  services    Service[]

  @@index([parentId])
  @@index([isActive])
  @@index([slug])
  @@map("categories")
}
```

### Service Model Changes

```prisma
model Service {
  // ... other fields
  categoryId  String    @db.ObjectId
  category    Category  @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  // ... other fields
}
```

## API Endpoints

### Public Endpoints (No Authentication Required)

#### Get Primary Categories

```
GET /api/categories/primary
```

Returns all top-level categories (categories with no parent).

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Health Care",
      "slug": "health-care",
      "description": "Medical and healthcare services",
      "sortOrder": 0,
      "_count": {
        "children": 3
      }
    }
  ],
  "message": "Primary categories retrieved successfully"
}
```

#### Get Category Children

```
GET /api/categories/:id/children
```

Returns all direct children of a specific category.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "64f1a2b3c4d5e6f7a8b9c0d2",
      "name": "Doctors",
      "slug": "doctors",
      "description": "Medical doctors and specialists",
      "sortOrder": 0,
      "_count": {
        "children": 3
      }
    }
  ],
  "message": "Category children retrieved successfully"
}
```

#### Check if Category Has Children

```
GET /api/categories/:id/has-children
```

Checks if a category has any children.

**Response:**

```json
{
  "success": true,
  "data": {
    "hasChildren": true,
    "childCount": 3
  },
  "message": "Category children check completed"
}
```

#### Get Category by ID

```
GET /api/categories/:id
```

Returns detailed information about a specific category.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "Health Care",
    "slug": "health-care",
    "description": "Medical and healthcare services",
    "isActive": true,
    "parent": null,
    "_count": {
      "children": 3,
      "services": 15
    }
  },
  "message": "Category retrieved successfully"
}
```

### Admin Endpoints (Authentication Required)

#### Get Full Category Tree

```
GET /api/categories/admin/tree
```

Returns the complete category tree structure.

**Query Parameters:**

- `includeInactive` (optional): Include inactive categories
- `maxDepth` (optional): Maximum depth to fetch (1-10)

#### Create Category

```
POST /api/categories/admin
```

**Request Body:**

```json
{
  "name": "New Category",
  "description": "Category description",
  "parentId": "64f1a2b3c4d5e6f7a8b9c0d1", // Optional
  "sortOrder": 0 // Optional
}
```

#### Update Category

```
PUT /api/categories/admin/:id
```

**Request Body:**

```json
{
  "name": "Updated Category Name",
  "description": "Updated description",
  "parentId": "64f1a2b3c4d5e6f7a8b9c0d2", // Optional
  "sortOrder": 1, // Optional
  "isActive": true // Optional
}
```

#### Delete Category

```
DELETE /api/categories/admin/:id
```

**Note:** Categories with children or services cannot be deleted.

## Default Categories

The system comes with pre-seeded categories based on the original enum:

### Main Categories:

1. **Health Care**

   - Doctors
   - Fitness
   - Beauty

2. **Professional Services**

   - Tech Service
   - Repairs Services
   - Car Service

3. **Food & Dining**

   - Restaurants
   - Cafe & Snacks

4. **Travel & Hospitality**

   - Travel
   - Hotel Service

5. **Financial Services**

   - Loans

6. **Retail & Shopping**
   - Retail
   - Wear & Accessories

## Setup Instructions

### 1. Run Database Migration

```bash
npx prisma db push
```

### 2. Seed Default Categories

```bash
npm run setup:categories
# or
npx ts-node src/scripts/setupCategories.ts
```

### 3. Verify Setup

```bash
# Test the API endpoints
curl http://localhost:3000/api/categories/root
```

## Frontend Integration

### Cascading Category Selection

The frontend should implement cascading dropdowns:

1. **Load primary categories** using `GET /api/categories/primary`
2. **When user selects a category**, check if it has children using `GET /api/categories/:id/has-children`
3. **If it has children**, load them using `GET /api/categories/:id/children`
4. **Repeat until no more children** exist
5. **Store the final category ID** in the service

### Example Frontend Flow

```typescript
// 1. Load primary categories
const primaryCategories = await fetch("/api/categories/primary");

// 2. User selects "Health Care"
const hasChildren = await fetch("/api/categories/health-care-id/has-children");

// 3. If has children, load them
if (hasChildren.data.hasChildren) {
  const children = await fetch("/api/categories/health-care-id/children");
  // Show children: ["Doctors", "Fitness", "Beauty"]
}

// 4. User selects "Doctors"
const doctorChildren = await fetch("/api/categories/doctors-id/children");
// Show: ["General Physician", "Specialist", "Dentist"]

// 5. User selects "General Physician" (no more children)
// Final selection: categoryId = "general-physician-id"
```

## Migration from Enum System

The system automatically migrates from the old enum-based categories:

1. **Old enum categories** are converted to the new nested structure
2. **Existing services** will need to be updated to use `categoryId` instead of `category` enum
3. **No data loss** - all original categories are preserved

## Security

- **Public endpoints** are read-only and don't require authentication
- **Admin endpoints** require authentication and admin privileges
- **Input validation** is implemented for all endpoints
- **SQL injection protection** through Prisma ORM
- **Circular reference prevention** in category hierarchy

## Performance Considerations

- **Indexes** are created on frequently queried fields (`parentId`, `isActive`, `slug`)
- **Lazy loading** is used for category children
- **Caching** can be implemented at the application level
- **Pagination** is available for large category trees

## Troubleshooting

### Common Issues

1. **Categories not loading**: Check if the database migration was successful
2. **Circular reference error**: Ensure parent-child relationships don't create loops
3. **Category not found**: Verify the category ID is valid and the category exists
4. **Permission denied**: Ensure proper authentication for admin endpoints

### Debug Commands

```bash
# Check if categories exist
npx prisma studio

# Reset categories (development only)
npx ts-node -e "import('./src/utils/migrateCategories').then(m => m.rollbackCategories())"

# Re-seed categories
npm run setup:categories
```
