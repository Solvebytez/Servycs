# Service Schema with All Relations

## Overview

The Service system consists of multiple interconnected models that handle vendor listings, individual services, bookings, reviews, and more.

---

## 1. ServiceListing Model

**Main listing created by vendors - contains the shop/service overview**

```typescript
model ServiceListing {
  id             String               @id @default(auto()) @map("_id") @db.ObjectId
  vendorId       String               @db.ObjectId
  title          String               // Shop/Service name
  description    String               // Main description
  categoryId     String?              @db.ObjectId
  categoryPath   String[]             // Full category path for easy filtering
  contactNumber  String
  whatsappNumber String
  image          String?              // Main service image URL
  addressId      String?              @db.ObjectId // Business address ID
  businessHours  Json?                // Business hours for the shop/listing
  status         ServiceListingStatus @default(DRAFT)
  isServiceOn    Boolean              @default(true) // Vendor can turn service on/off
  isFeatured     Boolean              @default(false)
  rating         Float                @default(0)
  totalReviews   Int                  @default(0)
  totalBookings  Int                  @default(0)
  createdAt      DateTime             @default(now())
  updatedAt      DateTime             @updatedAt

  // Relations
  vendor            Vendor                    @relation(...)
  category          Category?                 @relation(...)
  address           BusinessAddress?          @relation(...)
  services          Service[]                 // Individual services within this listing
  bookings          Booking[]
  reviews           Review[]
  promotionListings PromotionServiceListing[]
  favoritedBy       UserFavorite[]
  savedInLists      SavedListItem[]
  Enquiry           Enquiry[]
}
```

### Status Enum

```typescript
enum ServiceListingStatus {
  DRAFT      // Created but not published
  PENDING    // Submitted for approval
  ACTIVE     // Live and available
  REJECTED   // Admin rejected
  OFF_SERVICE // Temporarily disabled
}
```

---

## 2. Service Model

**Individual services within a ServiceListing**

```typescript
model Service {
  id            String               @id @default(auto()) @map("_id") @db.ObjectId
  listingId     String               @db.ObjectId // Reference to ServiceListing
  name          String
  description   String
  price         Float?               // Optional price
  discountPrice Float?               // Optional discount price
  currency      String               @default("INR")
  duration      Int?                 // Duration in minutes
  status        ServiceListingStatus @default(DRAFT)
  isServiceOn   Boolean              @default(true) // Vendor can turn individual service on/off
  rating        Float                @default(0)
  totalReviews  Int                  @default(0)
  totalBookings Int                  @default(0)
  createdAt     DateTime             @default(now())
  updatedAt     DateTime             @updatedAt

  // Relations
  listing       ServiceListing @relation(...)
  bookings      Booking[]
  reviews       Review[]
  categoryIds   String[]       @db.ObjectId // Array of category IDs
  categoryPaths Json?          // Array of category paths for easy filtering
  Category      Category?      @relation(...) // Single primary category
  categoryId    String?        @db.ObjectId
  Vendor        Vendor?        @relation(...)
  vendorId      String?        @db.ObjectId
  Enquiry       Enquiry[]
}
```

---

## 3. Booking Model

**User bookings for services**

```typescript
model Booking {
  id                 String        @id @default(auto()) @map("_id") @db.ObjectId
  userId             String        @db.ObjectId
  listingId          String        @db.ObjectId // Reference to ServiceListing
  serviceId          String?       @db.ObjectId // Optional reference to specific Service
  vendorId           String        @db.ObjectId
  salesmanId         String?       @db.ObjectId
  bookingDate        DateTime
  bookingTime        String        // Time slot
  status             BookingStatus @default(PENDING)
  paymentStatus      PaymentStatus @default(PENDING)
  amount             Float
  currency           String        @default("INR")
  notes              String?
  cancellationReason String?
  createdAt          DateTime      @default(now())
  updatedAt          DateTime      @updatedAt

  // Relations
  user     User           @relation(...)
  listing  ServiceListing @relation(...)
  service  Service?       @relation(...)
  vendor   Vendor         @relation(...)
  salesman Salesman?      @relation(...)
}
```

### Booking Status Enum

```typescript
enum BookingStatus {
  PENDING      // Awaiting confirmation
  CONFIRMED    // Confirmed by vendor
  CANCELLED    // Cancelled by user or vendor
  COMPLETED    // Service completed
  NO_SHOW      // User didn't show up
}
```

### Payment Status Enum

```typescript
enum PaymentStatus {
  PENDING    // Payment pending
  COMPLETED  // Payment completed
  FAILED     // Payment failed
  REFUNDED   // Payment refunded
}
```

---

## 4. Review Model

**User reviews for services/listings**

```typescript
model Review {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  userId     String   @db.ObjectId
  listingId  String   @db.ObjectId // Reference to ServiceListing
  serviceId  String?  @db.ObjectId // Optional reference to specific Service
  vendorId   String   @db.ObjectId
  rating     Int      // 1-5 stars
  comment    String?
  isVerified Boolean  @default(false)
  helpful    Int      @default(0) // Number of users who found this helpful
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  // Relations
  user         User            @relation(...)
  listing      ServiceListing  @relation(...)
  service      Service?        @relation(...)
  vendor       Vendor          @relation(...)
  helpfulVotes ReviewHelpful[] @relation(...)
}
```

---

## 5. ReviewHelpful Model

**Track which users marked reviews as helpful**

```typescript
model ReviewHelpful {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  reviewId  String   @db.ObjectId
  userId    String   @db.ObjectId
  createdAt DateTime @default(now())

  // Relations
  review Review @relation(...)
  user   User   @relation(...)

  // Ensure one vote per user per review
  @@unique([reviewId, userId])
}
```

---

## 6. Enquiry Model

**User enquiries about a vendor's service listing**

```typescript
model Enquiry {
  id        String         @id @default(auto()) @map("_id") @db.ObjectId
  vendorId  String         @db.ObjectId
  listingId String         @db.ObjectId
  serviceId String?        @db.ObjectId
  userId    String         @db.ObjectId
  message   String?
  channel   EnquiryChannel @default(APP)
  status    EnquiryStatus  @default(PENDING)
  createdAt DateTime       @default(now())
  updatedAt DateTime       @updatedAt

  // Relations
  vendor   Vendor
  listing  ServiceListing
  service  Service?
  user     User
}
```

### Enquiry Channel Enum

```typescript
enum EnquiryChannel {
  APP      // Through mobile app
  WHATSAPP // Via WhatsApp
  PHONE    // Phone call
  EMAIL    // Email inquiry
  OTHER    // Other channels
}
```

### Enquiry Status Enum

```typescript
enum EnquiryStatus {
  PENDING   // Awaiting response
  RESPONDED // Vendor responded
  CLOSED    // Enquiry closed
}
```

---

## 7. Related Models

### Vendor Model

```typescript
model Vendor {
  id                     String     @id @default(auto()) @map("_id") @db.ObjectId
  userId                 String     @unique @db.ObjectId
  businessName           String
  businessEmail          String
  businessPhone          String
  businessDescription    String?
  businessLicense        String?
  businessInsurance      String?
  businessCertifications String[]
  businessHours          Json?
  verificationStatus     UserStatus @default(PENDING)
  isVerified             Boolean    @default(false)
  rating                 Float      @default(0)
  totalReviews           Int        @default(0)
  totalBookings          Int        @default(0)
  totalRevenue           Float      @default(0)
  createdAt              DateTime   @default(now())
  updatedAt              DateTime   @updatedAt

  // Relations
  user              User              @relation(...)
  businessAddresses BusinessAddress[]
  serviceListings   ServiceListing[]
  bookings          Booking[]
  reviews           Review[]
  promotions        Promotion[]
  Service           Service[]
  Enquiry           Enquiry[]
  activities        Activity[]
}
```

### Category Model

```typescript
model Category {
  id          String  @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  slug        String  // URL-friendly version of name
  description String?
  isActive    Boolean @default(true)

  // Self-referential relation for parent/child hierarchy
  parentId String?    @db.ObjectId
  parent   Category?  @relation(...)
  children Category[] @relation(...)

  // Metadata
  sortOrder Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  serviceListings ServiceListing[]
  Service         Service[]
}
```

---

## Entity Relationship Diagram

```
┌──────────────┐
│     User     │
└──────┬───────┘
       │
       ├──────────────────────┐
       │                      │
┌──────▼───────┐      ┌───────▼────────┐
│    Vendor    │      │    Salesman    │
└──────┬───────┘      └───────┬────────┘
       │                      │
       │                      │
┌──────▼──────────────────────┴──────────────┐
│         ServiceListing                     │
└──────┬─────────────────────────────────────┘
       │
       ├──────────────┬──────────────────────────┐
       │              │                          │
┌──────▼──────┐ ┌─────▼────────┐      ┌─────────▼────────┐
│   Service   │ │   Booking    │      │     Review       │
└─────────────┘ └──────────────┘      └─────────┬────────┘
                                                 │
                                                 │
                                      ┌──────────▼──────────┐
                                      │   ReviewHelpful     │
                                      └─────────────────────┘
```

---

## Usage Examples

### 1. Get ServiceListing with all services

```typescript
const listing = await prisma.serviceListing.findUnique({
  where: { id: listingId },
  include: {
    vendor: true,
    category: true,
    address: true,
    services: true,
    bookings: true,
    reviews: true,
  },
});
```

### 2. Get Service with all relations

```typescript
const service = await prisma.service.findUnique({
  where: { id: serviceId },
  include: {
    listing: {
      include: {
        vendor: true,
        category: true,
      },
    },
    Category: true,
    Vendor: true,
    bookings: true,
    reviews: {
      include: {
        user: true,
      },
    },
  },
});
```

### 3. Create booking

```typescript
const booking = await prisma.booking.create({
  data: {
    userId: userId,
    listingId: listingId,
    serviceId: serviceId,
    vendorId: vendorId,
    bookingDate: new Date(),
    bookingTime: "10:00 AM",
    status: "PENDING",
    paymentStatus: "PENDING",
    amount: 500,
    currency: "INR",
    notes: "Please come to main entrance",
  },
  include: {
    user: true,
    listing: true,
    service: true,
    vendor: true,
  },
});
```

### 4. Create review

```typescript
const review = await prisma.review.create({
  data: {
    userId: userId,
    listingId: listingId,
    serviceId: serviceId,
    vendorId: vendorId,
    rating: 5,
    comment: "Great service!",
    isVerified: false,
  },
  include: {
    user: true,
    listing: true,
    service: true,
    vendor: true,
  },
});
```

---

## Key Features

1. **Hierarchical Categories**: Services can belong to nested categories
2. **Multi-category Support**: Services can have multiple category IDs
3. **Flexible Pricing**: Services can have regular price and discount price
4. **Individual Control**: Both listings and services can be turned on/off
5. **Rating System**: Ratings and reviews at both listing and service level
6. **Booking Management**: Track bookings with multiple status types
7. **Payment Tracking**: Separate payment status from booking status
8. **Enquiry System**: Multiple channels for user enquiries
9. **Review Helpfulness**: Users can mark reviews as helpful
10. **Vendor Verification**: Verification status and flags for vendors

---

## Indexes

Key indexes for performance:

- `ServiceListing`: `vendorId`, `categoryId`, `status`, `isServiceOn`, `isFeatured`
- `Service`: `listingId`, `status`, `isServiceOn`, `categoryIds`, `categoryId`
- `Booking`: `userId`, `vendorId`, `listingId`, `serviceId`, `status`
- `Review`: `userId`, `vendorId`, `listingId`, `serviceId`


