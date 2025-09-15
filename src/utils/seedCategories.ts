import { PrismaClient } from "@prisma/client";
import { logger } from "./logger";

const prisma = new PrismaClient();

// Default categories based on the original ServiceCategory enum
const defaultCategories = [
  {
    name: "Health Care",
    slug: "health-care",
    description: "Medical and healthcare services",
    children: [
      {
        name: "Doctors",
        slug: "doctors",
        description: "Medical doctors and specialists",
        children: [
          {
            name: "General Physician",
            slug: "general-physician",
            description: "General medical practitioners",
          },
          {
            name: "Specialist",
            slug: "specialist",
            description: "Medical specialists",
          },
          {
            name: "Dentist",
            slug: "dentist",
            description: "Dental care services",
          },
        ],
      },
      {
        name: "Fitness",
        slug: "fitness",
        description: "Fitness and wellness services",
        children: [
          {
            name: "Gyms",
            slug: "gyms",
            description: "Fitness centers and gyms",
          },
          {
            name: "Personal Training",
            slug: "personal-training",
            description: "Personal fitness training",
          },
          {
            name: "Yoga",
            slug: "yoga",
            description: "Yoga classes and instruction",
          },
        ],
      },
      {
        name: "Beauty",
        slug: "beauty",
        description: "Beauty and cosmetic services",
        children: [
          {
            name: "Hair Services",
            slug: "hair-services",
            description: "Hair cutting, styling, and treatment",
          },
          {
            name: "Nail Services",
            slug: "nail-services",
            description: "Manicure, pedicure, and nail art",
          },
          {
            name: "Facial Treatment",
            slug: "facial-treatment",
            description: "Facial care and treatment",
          },
          {
            name: "Spa Center",
            slug: "spa-center",
            description: "Spa and wellness treatments",
          },
        ],
      },
    ],
  },
  {
    name: "Professional Services",
    slug: "professional-services",
    description: "Business and professional services",
    children: [
      {
        name: "Tech Service",
        slug: "tech-service",
        description: "Technology and IT services",
        children: [
          {
            name: "Computer Repair",
            slug: "computer-repair",
            description: "Computer and laptop repair",
          },
          {
            name: "Software Development",
            slug: "software-development",
            description: "Custom software solutions",
          },
          {
            name: "IT Support",
            slug: "it-support",
            description: "Technical support services",
          },
        ],
      },
      {
        name: "Repairs Services",
        slug: "repairs-services",
        description: "General repair and maintenance services",
        children: [
          {
            name: "Home Repairs",
            slug: "home-repairs",
            description: "Home maintenance and repairs",
          },
          {
            name: "Appliance Repair",
            slug: "appliance-repair",
            description: "Household appliance repair",
          },
          {
            name: "Plumbing",
            slug: "plumbing",
            description: "Plumbing services",
          },
          {
            name: "Electrical",
            slug: "electrical",
            description: "Electrical services",
          },
        ],
      },
      {
        name: "Car Service",
        slug: "car-service",
        description: "Automotive services",
        children: [
          {
            name: "Car Repair",
            slug: "car-repair",
            description: "Automotive repair services",
          },
          {
            name: "Car Wash",
            slug: "car-wash",
            description: "Vehicle cleaning services",
          },
          {
            name: "Car Insurance",
            slug: "car-insurance",
            description: "Automotive insurance services",
          },
        ],
      },
    ],
  },
  {
    name: "Food & Dining",
    slug: "food-dining",
    description: "Food and dining services",
    children: [
      {
        name: "Restaurants",
        slug: "restaurants",
        description: "Dining establishments",
        children: [
          {
            name: "Fine Dining",
            slug: "fine-dining",
            description: "Upscale dining experiences",
          },
          {
            name: "Casual Dining",
            slug: "casual-dining",
            description: "Relaxed dining options",
          },
          {
            name: "Fast Food",
            slug: "fast-food",
            description: "Quick service restaurants",
          },
        ],
      },
      {
        name: "Cafe & Snacks",
        slug: "cafe-snacks",
        description: "Coffee shops and snack services",
        children: [
          {
            name: "Coffee Shops",
            slug: "coffee-shops",
            description: "Coffee and beverage services",
          },
          {
            name: "Bakeries",
            slug: "bakeries",
            description: "Fresh baked goods",
          },
          {
            name: "Snack Bars",
            slug: "snack-bars",
            description: "Light snacks and refreshments",
          },
        ],
      },
    ],
  },
  {
    name: "Travel & Hospitality",
    slug: "travel-hospitality",
    description: "Travel and accommodation services",
    children: [
      {
        name: "Travel",
        slug: "travel",
        description: "Travel planning and booking services",
        children: [
          {
            name: "Travel Agency",
            slug: "travel-agency",
            description: "Travel planning and booking",
          },
          {
            name: "Tour Guide",
            slug: "tour-guide",
            description: "Local tour and guide services",
          },
          {
            name: "Transportation",
            slug: "transportation",
            description: "Transport and logistics",
          },
        ],
      },
      {
        name: "Hotel Service",
        slug: "hotel-service",
        description: "Accommodation and hospitality services",
        children: [
          {
            name: "Hotels",
            slug: "hotels",
            description: "Hotel accommodation",
          },
          {
            name: "Resorts",
            slug: "resorts",
            description: "Resort and vacation rentals",
          },
          {
            name: "Guest Houses",
            slug: "guest-houses",
            description: "Bed and breakfast services",
          },
        ],
      },
    ],
  },
  {
    name: "Financial Services",
    slug: "financial-services",
    description: "Financial and banking services",
    children: [
      {
        name: "Loans",
        slug: "loans",
        description: "Loan and credit services",
        children: [
          {
            name: "Personal Loans",
            slug: "personal-loans",
            description: "Personal loan services",
          },
          {
            name: "Business Loans",
            slug: "business-loans",
            description: "Business financing",
          },
          {
            name: "Home Loans",
            slug: "home-loans",
            description: "Mortgage and home financing",
          },
        ],
      },
    ],
  },
  {
    name: "Retail & Shopping",
    slug: "retail-shopping",
    description: "Retail and shopping services",
    children: [
      {
        name: "Retail",
        slug: "retail",
        description: "General retail services",
        children: [
          {
            name: "Clothing",
            slug: "clothing",
            description: "Fashion and apparel",
          },
          {
            name: "Electronics",
            slug: "electronics",
            description: "Electronic devices and gadgets",
          },
          {
            name: "Home & Garden",
            slug: "home-garden",
            description: "Home improvement and gardening",
          },
        ],
      },
      {
        name: "Wear & Accessories",
        slug: "wear-acc",
        description: "Fashion and accessories",
        children: [
          {
            name: "Jewelry",
            slug: "jewelry",
            description: "Fine jewelry and accessories",
          },
          {
            name: "Watches",
            slug: "watches",
            description: "Timepieces and watches",
          },
          {
            name: "Bags & Luggage",
            slug: "bags-luggage",
            description: "Handbags and travel accessories",
          },
        ],
      },
    ],
  },
];

// Function to create categories recursively
const createCategoryRecursive = async (
  categoryData: any,
  parentId: string | null = null,
  sortOrder: number = 0
): Promise<void> => {
  const { name, slug, description, children } = categoryData;

  // Create the category
  const category = await prisma.category.create({
    data: {
      name,
      slug,
      description,
      parentId,
      sortOrder,
    },
  });

  logger.info(`Created category: ${name} (${category.id})`);

  // Create children if they exist
  if (children && children.length > 0) {
    for (let i = 0; i < children.length; i++) {
      await createCategoryRecursive(children[i], category.id, i);
    }
  }
};

// Main seeding function
export const seedCategories = async (): Promise<void> => {
  try {
    logger.info("Starting category seeding...");

    // Check if categories already exist
    const existingCategories = await prisma.category.count();
    if (existingCategories > 0) {
      logger.info("Categories already exist, skipping seeding");
      return;
    }

    // Create all default categories
    for (let i = 0; i < defaultCategories.length; i++) {
      await createCategoryRecursive(defaultCategories[i], null, i);
    }

    logger.info("Category seeding completed successfully");
  } catch (error) {
    logger.error("Error seeding categories:", error);
    throw error;
  }
};

// Function to clear all categories (for testing)
export const clearCategories = async (): Promise<void> => {
  try {
    logger.info("Clearing all categories...");

    // Delete all categories (cascade will handle children)
    await prisma.category.deleteMany({});

    logger.info("All categories cleared");
  } catch (error) {
    logger.error("Error clearing categories:", error);
    throw error;
  }
};

// Export for use in other files
export default { seedCategories, clearCategories };
