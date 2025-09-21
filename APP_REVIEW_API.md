# App Review API Documentation

## Overview

The App Review API allows users to submit feedback about the overall app experience, separate from individual service reviews. It includes features for moderation, helpfulness voting, and detailed feedback categorization.

## Base URL

```
http://localhost:5000/api/v1/app-reviews
```

## Authentication

- **Public endpoints**: No authentication required
- **User endpoints**: Require valid JWT token in `Authorization: Bearer <token>` header
- **Admin endpoints**: Require admin role in JWT token

---

## Public Endpoints

### 1. Get All App Reviews

**GET** `/app-reviews`

Get paginated list of public app reviews with filtering and sorting options.

#### Query Parameters

| Parameter   | Type    | Default   | Description                                            |
| ----------- | ------- | --------- | ------------------------------------------------------ |
| `page`      | number  | 1         | Page number for pagination                             |
| `limit`     | number  | 10        | Number of reviews per page (max 50)                    |
| `rating`    | number  | -         | Filter by rating (1-5)                                 |
| `status`    | string  | -         | Filter by status (PENDING, APPROVED, REJECTED, HIDDEN) |
| `isPublic`  | boolean | -         | Filter by public visibility                            |
| `sortBy`    | string  | createdAt | Sort by field (createdAt, rating, helpful)             |
| `sortOrder` | string  | desc      | Sort order (asc, desc)                                 |

#### Response

```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "review_id",
        "rating": 5,
        "title": "Amazing app!",
        "comment": "Great experience...",
        "categories": ["UI/UX", "Features"],
        "ratings": {
          "UI/UX": 5,
          "Performance": 4
        },
        "isAnonymous": false,
        "status": "APPROVED",
        "isPublic": true,
        "helpful": 12,
        "notHelpful": 1,
        "deviceInfo": {
          "platform": "Android",
          "version": "1.2.3"
        },
        "createdAt": "2025-01-19T10:00:00Z",
        "user": {
          "id": "user_id",
          "name": "John Doe",
          "email": "john@example.com"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3,
      "hasNext": true,
      "hasPrev": false
    },
    "statistics": {
      "averageRating": 4.2,
      "totalReviews": 25,
      "ratingDistribution": {
        "5": 10,
        "4": 8,
        "3": 4,
        "2": 2,
        "1": 1
      }
    }
  }
}
```

### 2. Mark Review as Helpful

**POST** `/app-reviews/:reviewId/helpful`

Mark a review as helpful or not helpful.

#### Path Parameters

| Parameter  | Type   | Required | Description      |
| ---------- | ------ | -------- | ---------------- |
| `reviewId` | string | Yes      | ID of the review |

#### Request Body

```json
{
  "isHelpful": true
}
```

#### Response

```json
{
  "success": true,
  "message": "Review marked as helpful",
  "data": {
    "helpful": 13,
    "notHelpful": 1
  }
}
```

---

## User Endpoints (Authentication Required)

### 3. Create App Review

**POST** `/app-reviews`

Create a new app review. Users can only have one review.

#### Request Body

```json
{
  "rating": 5,
  "title": "Great app!",
  "comment": "I love using this app...",
  "categories": ["UI/UX", "Performance", "Features"],
  "ratings": {
    "UI/UX": 5,
    "Performance": 4,
    "Features": 5,
    "Navigation": 4
  },
  "isAnonymous": false,
  "deviceInfo": {
    "platform": "iOS",
    "version": "1.2.3",
    "deviceModel": "iPhone 14",
    "osVersion": "iOS 16.5"
  }
}
```

#### Response

```json
{
  "success": true,
  "message": "App review submitted successfully",
  "data": {
    "id": "review_id",
    "rating": 5,
    "title": "Great app!",
    "comment": "I love using this app...",
    "status": "PENDING",
    "createdAt": "2025-01-19T10:00:00Z",
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

### 4. Get User's Own Review

**GET** `/app-reviews/my-review`

Get the current user's app review.

#### Response

```json
{
  "success": true,
  "data": {
    "id": "review_id",
    "rating": 5,
    "title": "Great app!",
    "comment": "I love using this app...",
    "status": "APPROVED",
    "createdAt": "2025-01-19T10:00:00Z",
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

### 5. Update User's Own Review

**PUT** `/app-reviews/my-review`

Update the current user's app review. All fields are optional.

#### Request Body

```json
{
  "rating": 4,
  "title": "Updated review title",
  "comment": "Updated comment..."
}
```

#### Response

```json
{
  "success": true,
  "message": "App review updated successfully",
  "data": {
    "id": "review_id",
    "rating": 4,
    "title": "Updated review title",
    "comment": "Updated comment...",
    "status": "PENDING",
    "updatedAt": "2025-01-19T11:00:00Z"
  }
}
```

### 6. Delete User's Own Review

**DELETE** `/app-reviews/my-review`

Delete the current user's app review.

#### Response

```json
{
  "success": true,
  "message": "App review deleted successfully"
}
```

---

## Admin Endpoints (Admin Authentication Required)

### 7. Get Reviews for Moderation

**GET** `/app-reviews/admin/moderation`

Get all reviews for admin moderation with filtering options.

#### Query Parameters

| Parameter   | Type   | Default   | Description                                            |
| ----------- | ------ | --------- | ------------------------------------------------------ |
| `page`      | number | 1         | Page number for pagination                             |
| `limit`     | number | 10        | Number of reviews per page (max 50)                    |
| `status`    | string | -         | Filter by status (PENDING, APPROVED, REJECTED, HIDDEN) |
| `sortBy`    | string | createdAt | Sort by field (createdAt, rating, helpful)             |
| `sortOrder` | string | desc      | Sort order (asc, desc)                                 |

#### Response

```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "review_id",
        "rating": 2,
        "title": "Needs work",
        "comment": "The app crashes frequently...",
        "status": "PENDING",
        "createdAt": "2025-01-19T10:00:00Z",
        "user": {
          "id": "user_id",
          "name": "Anonymous",
          "email": "user@example.com"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "pages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

### 8. Update Review Status

**PUT** `/app-reviews/admin/:reviewId/status`

Update the status of a review (approve, reject, hide).

#### Path Parameters

| Parameter  | Type   | Required | Description      |
| ---------- | ------ | -------- | ---------------- |
| `reviewId` | string | Yes      | ID of the review |

#### Request Body

```json
{
  "status": "APPROVED"
}
```

#### Response

```json
{
  "success": true,
  "message": "Review status updated to APPROVED",
  "data": {
    "id": "review_id",
    "rating": 2,
    "title": "Needs work",
    "status": "APPROVED",
    "updatedAt": "2025-01-19T11:00:00Z"
  }
}
```

---

## Error Responses

### Validation Error (400)

```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "rating",
      "message": "Rating must be between 1 and 5"
    }
  ]
}
```

### Authentication Error (401)

```json
{
  "success": false,
  "message": "Authentication required"
}
```

### Not Found Error (404)

```json
{
  "success": false,
  "message": "No review found for this user"
}
```

### Server Error (500)

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Data Models

### AppReview

```typescript
interface AppReview {
  id: string;
  userId: string;
  rating: number; // 1-5
  title?: string;
  comment?: string;
  categories: string[];
  ratings?: Record<string, number>; // Detailed ratings for different aspects
  isAnonymous: boolean;
  status: "PENDING" | "APPROVED" | "REJECTED" | "HIDDEN";
  isPublic: boolean;
  helpful: number;
  notHelpful: number;
  deviceInfo?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
  };
}
```

### Review Categories

Common categories for app reviews:

- UI/UX
- Performance
- Features
- Navigation
- Search
- Booking Process
- Customer Support
- Overall Experience

---

## Usage Examples

### JavaScript/TypeScript

```javascript
// Get all reviews
const response = await fetch("/api/v1/app-reviews?rating=5&limit=10");
const data = await response.json();

// Create a review
const review = await fetch("/api/v1/app-reviews", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer your-jwt-token",
  },
  body: JSON.stringify({
    rating: 5,
    title: "Great app!",
    comment: "I love using this app...",
    categories: ["UI/UX", "Performance"],
  }),
});
```

### cURL

```bash
# Get all reviews
curl -X GET "http://localhost:5000/api/v1/app-reviews?rating=5&limit=10"

# Create a review
curl -X POST "http://localhost:5000/api/v1/app-reviews" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "rating": 5,
    "title": "Great app!",
    "comment": "I love using this app...",
    "categories": ["UI/UX", "Performance"]
  }'
```
