import { PrismaClient } from "@prisma/client";
import { logger } from "./logger";

const prisma = new PrismaClient();

// Comprehensive categories based on your requirements
const comprehensiveCategories = [
  {
    name: "Loans",
    slug: "loans",
    description: "Financial loan services and credit solutions",
    children: [
      {
        name: "Personal Loans",
        slug: "personal-loans",
        description: "Personal loan services for individuals",
      },
      {
        name: "Home Loans",
        slug: "home-loans",
        description: "Mortgage and home financing services",
      },
      {
        name: "Vehicle Loans",
        slug: "vehicle-loans",
        description: "Auto and vehicle financing services",
      },
      {
        name: "Business Loans",
        slug: "business-loans",
        description: "Business financing and commercial loans",
      },
    ],
  },
  {
    name: "Doctors",
    slug: "doctors",
    description: "Medical professionals and healthcare services",
    children: [
      {
        name: "General Physicians",
        slug: "general-physicians",
        description: "General medical practitioners and family doctors",
      },
      {
        name: "Dentists",
        slug: "dentists",
        description: "Dental care and oral health services",
      },
      {
        name: "Pediatricians",
        slug: "pediatricians",
        description: "Children's healthcare specialists",
      },
      {
        name: "Specialists",
        slug: "specialists",
        description: "Medical specialists (Cardiology, Neurology, etc.)",
      },
    ],
  },
  {
    name: "Travel",
    slug: "travel",
    description: "Travel and tourism services",
    children: [
      {
        name: "Flight Booking",
        slug: "flight-booking",
        description: "Airline ticket booking and travel arrangements",
      },
      {
        name: "Hotels & Stays",
        slug: "hotels-stays",
        description: "Hotel reservations and accommodation services",
      },
      {
        name: "Holiday Packages",
        slug: "holiday-packages",
        description: "Complete holiday and vacation packages",
      },
      {
        name: "Local Transport & Cabs",
        slug: "local-transport-cabs",
        description: "Local transportation and cab services",
      },
    ],
  },
  {
    name: "Beauty",
    slug: "beauty",
    description: "Beauty and cosmetic services",
    children: [
      {
        name: "Hair Care",
        slug: "hair-care",
        description: "Hair cutting, styling, and treatment services",
      },
      {
        name: "Skin Treatments",
        slug: "skin-treatments",
        description: "Facial and skin care treatments",
      },
      {
        name: "Makeup & Styling",
        slug: "makeup-styling",
        description: "Professional makeup and styling services",
      },
      {
        name: "Spa & Wellness",
        slug: "spa-wellness",
        description: "Spa treatments and wellness services",
      },
    ],
  },
  {
    name: "Gyms",
    slug: "gyms",
    description: "Fitness centers and gym services",
    children: [
      {
        name: "Personal Training",
        slug: "personal-training",
        description: "One-on-one fitness training services",
      },
      {
        name: "Yoga & Meditation",
        slug: "yoga-meditation",
        description: "Yoga classes and meditation sessions",
      },
      {
        name: "Weight Training",
        slug: "weight-training",
        description: "Weight lifting and strength training",
      },
      {
        name: "CrossFit & HIIT",
        slug: "crossfit-hiit",
        description: "High-intensity interval training and CrossFit",
      },
    ],
  },
  {
    name: "Repairs & Services",
    slug: "repairs-services",
    description: "Repair and maintenance services",
    children: [
      {
        name: "Home Appliances Repair",
        slug: "home-appliances-repair",
        description: "Household appliance repair services",
      },
      {
        name: "Mobile & Laptop Repair",
        slug: "mobile-laptop-repair",
        description: "Electronic device repair services",
      },
      {
        name: "Plumbing & Electrical",
        slug: "plumbing-electrical",
        description: "Plumbing and electrical repair services",
      },
      {
        name: "Car/Bike Services",
        slug: "car-bike-services",
        description: "Automotive repair and maintenance services",
      },
    ],
  },
  {
    name: "Education & Courses",
    slug: "education-courses",
    description: "Educational services and learning programs",
    children: [
      {
        name: "Online Learning Platforms",
        slug: "online-learning-platforms",
        description: "Digital education and e-learning services",
      },
      {
        name: "Coaching & Tuition",
        slug: "coaching-tuition",
        description: "Personal coaching and tutoring services",
      },
      {
        name: "Language Courses",
        slug: "language-courses",
        description: "Language learning and training programs",
      },
      {
        name: "Professional Certifications",
        slug: "professional-certifications",
        description: "Professional certification and training programs",
      },
    ],
  },
  {
    name: "Food & Restaurants",
    slug: "food-restaurants",
    description: "Food and dining services",
    children: [
      {
        name: "Fast Food",
        slug: "fast-food",
        description: "Quick service restaurants and fast food",
      },
      {
        name: "Fine Dining",
        slug: "fine-dining",
        description: "Upscale dining and gourmet restaurants",
      },
      {
        name: "Cafés & Bakeries",
        slug: "cafes-bakeries",
        description: "Coffee shops, cafes, and bakery services",
      },
      {
        name: "Online Food Delivery",
        slug: "online-food-delivery",
        description: "Food delivery and takeaway services",
      },
    ],
  },
  {
    name: "Shopping & Fashion",
    slug: "shopping-fashion",
    description: "Retail and fashion services",
    children: [
      {
        name: "Clothing & Apparel",
        slug: "clothing-apparel",
        description: "Fashion clothing and apparel stores",
      },
      {
        name: "Footwear",
        slug: "footwear",
        description: "Shoes and footwear stores",
      },
      {
        name: "Accessories & Jewellery",
        slug: "accessories-jewellery",
        description: "Fashion accessories and jewelry stores",
      },
      {
        name: "Electronics & Gadgets",
        slug: "electronics-gadgets",
        description: "Electronic devices and gadget stores",
      },
    ],
  },
  {
    name: "Real Estate & Housing",
    slug: "real-estate-housing",
    description: "Property and real estate services",
    children: [
      {
        name: "Buy Property",
        slug: "buy-property",
        description: "Property purchase and real estate buying services",
      },
      {
        name: "Rent/Lease",
        slug: "rent-lease",
        description: "Property rental and leasing services",
      },
      {
        name: "Commercial Spaces",
        slug: "commercial-spaces",
        description: "Commercial property and office spaces",
      },
      {
        name: "Interior Design & Renovation",
        slug: "interior-design-renovation",
        description: "Home interior design and renovation services",
      },
    ],
  },
  {
    name: "Automobiles & Vehicles",
    slug: "automobiles-vehicles",
    description: "Automotive and vehicle services",
    children: [
      {
        name: "Car Sales & Showrooms",
        slug: "car-sales-showrooms",
        description: "New and used car sales and showrooms",
      },
      {
        name: "Bike & Scooters",
        slug: "bike-scooters",
        description: "Motorcycle and scooter sales and services",
      },
      {
        name: "Vehicle Rentals",
        slug: "vehicle-rentals",
        description: "Car and vehicle rental services",
      },
      {
        name: "Auto Parts & Accessories",
        slug: "auto-parts-accessories",
        description: "Automotive parts and accessories",
      },
    ],
  },
  {
    name: "Events & Entertainment",
    slug: "events-entertainment",
    description: "Event planning and entertainment services",
    children: [
      {
        name: "Movie & Theatre Tickets",
        slug: "movie-theatre-tickets",
        description: "Cinema and theater ticket booking services",
      },
      {
        name: "Concerts & Shows",
        slug: "concerts-shows",
        description: "Concert and live show ticket services",
      },
      {
        name: "Party & Wedding Planning",
        slug: "party-wedding-planning",
        description: "Event planning and wedding services",
      },
      {
        name: "Gaming & E-sports",
        slug: "gaming-esports",
        description: "Gaming services and e-sports events",
      },
    ],
  },
  {
    name: "Technology & Gadgets",
    slug: "technology-gadgets",
    description: "Technology and electronic gadget services",
    children: [
      {
        name: "Smartphones",
        slug: "smartphones",
        description: "Mobile phone sales and services",
      },
      {
        name: "Laptops & PCs",
        slug: "laptops-pcs",
        description: "Computer and laptop sales and services",
      },
      {
        name: "Smart Home Devices",
        slug: "smart-home-devices",
        description: "Smart home technology and automation",
      },
      {
        name: "Wearables & Accessories",
        slug: "wearables-accessories",
        description: "Smart watches and wearable technology",
      },
    ],
  },
  {
    name: "Home Cleaning",
    slug: "home-cleaning",
    description: "Home cleaning and maintenance services",
    children: [
      {
        name: "Deep Cleaning",
        slug: "deep-cleaning",
        description: "Comprehensive deep cleaning services",
      },
      {
        name: "Carpet & Sofa Cleaning",
        slug: "carpet-sofa-cleaning",
        description: "Upholstery and carpet cleaning services",
      },
      {
        name: "Pest Control",
        slug: "pest-control",
        description: "Pest control and extermination services",
      },
      {
        name: "Laundry Services",
        slug: "laundry-services",
        description: "Laundry and dry cleaning services",
      },
    ],
  },
  {
    name: "Pet Care",
    slug: "pet-care",
    description: "Pet care and animal services",
    children: [
      {
        name: "Veterinary Clinics",
        slug: "veterinary-clinics",
        description: "Animal healthcare and veterinary services",
      },
      {
        name: "Pet Grooming",
        slug: "pet-grooming",
        description: "Pet grooming and styling services",
      },
      {
        name: "Pet Food & Accessories",
        slug: "pet-food-accessories",
        description: "Pet supplies and accessories",
      },
      {
        name: "Pet Training",
        slug: "pet-training",
        description: "Pet training and behavioral services",
      },
    ],
  },
  {
    name: "Health & Fitness",
    slug: "health-fitness",
    description: "Health and fitness services",
    children: [
      {
        name: "Nutritionists & Diet Plans",
        slug: "nutritionists-diet-plans",
        description: "Nutrition counseling and diet planning",
      },
      {
        name: "Meditation & Wellness",
        slug: "meditation-wellness",
        description: "Meditation and wellness programs",
      },
      {
        name: "Fitness Equipment",
        slug: "fitness-equipment",
        description: "Fitness equipment sales and services",
      },
      {
        name: "Online Health Programs",
        slug: "online-health-programs",
        description: "Digital health and fitness programs",
      },
    ],
  },
  {
    name: "Legal Services",
    slug: "legal-services",
    description: "Legal and law services",
    children: [
      {
        name: "Family & Divorce Lawyers",
        slug: "family-divorce-lawyers",
        description: "Family law and divorce legal services",
      },
      {
        name: "Property & Real Estate Lawyers",
        slug: "property-real-estate-lawyers",
        description: "Property and real estate legal services",
      },
      {
        name: "Corporate & Business Law",
        slug: "corporate-business-law",
        description: "Business and corporate legal services",
      },
      {
        name: "Criminal & Civil Cases",
        slug: "criminal-civil-cases",
        description: "Criminal and civil law services",
      },
    ],
  },
  {
    name: "Financial Planning & Investments",
    slug: "financial-planning-investments",
    description: "Financial planning and investment services",
    children: [
      {
        name: "Insurance Plans",
        slug: "insurance-plans",
        description: "Insurance and protection services",
      },
      {
        name: "Stock Market & Trading",
        slug: "stock-market-trading",
        description: "Stock trading and investment services",
      },
      {
        name: "Mutual Funds & SIPs",
        slug: "mutual-funds-sips",
        description: "Mutual fund and SIP investment services",
      },
      {
        name: "Tax & Wealth Management",
        slug: "tax-wealth-management",
        description: "Tax planning and wealth management services",
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
export const seedComprehensiveCategories = async (): Promise<void> => {
  try {
    logger.info("Starting comprehensive category seeding...");

    // Check if categories already exist
    const existingCategories = await prisma.category.count();
    if (existingCategories > 0) {
      logger.warn("Categories already exist. Use clearCategories() first if you want to replace them.");
      return;
    }

    // Create all comprehensive categories
    for (let i = 0; i < comprehensiveCategories.length; i++) {
      await createCategoryRecursive(comprehensiveCategories[i], null, i);
    }

    logger.info("Comprehensive category seeding completed successfully");
    
    // Get statistics
    const totalCategories = await prisma.category.count();
    const rootCategories = await prisma.category.count({
      where: { parentId: null }
    });
    
    logger.info(`Created ${totalCategories} total categories with ${rootCategories} root categories`);
  } catch (error) {
    logger.error("Error seeding comprehensive categories:", error);
    throw error;
  }
};

// Function to clear all categories (for testing/resetting)
export const clearAllCategories = async (): Promise<void> => {
  try {
    logger.info("Clearing all categories...");

    // Use a transaction to handle foreign key constraints
    await prisma.$transaction(async (tx) => {
      // First, delete all service listings that reference categories
      await tx.serviceListing.deleteMany({});
      
      // Then delete all services
      await tx.service.deleteMany({});
      
      // Delete categories in the correct order (children first, then parents)
      // First, set all parentId to null to break the hierarchy
      await tx.category.updateMany({
        data: { parentId: null }
      });
      
      // Then delete all categories
      await tx.category.deleteMany({});
    });

    logger.info("All categories cleared successfully");
  } catch (error) {
    logger.error("Error clearing categories:", error);
    throw error;
  }
};

// Function to get category statistics
export const getCategoryStats = async (): Promise<void> => {
  try {
    const totalCategories = await prisma.category.count();
    const rootCategories = await prisma.category.count({
      where: { parentId: null }
    });
    const leafCategories = await prisma.category.count({
      where: {
        children: {
          none: {}
        }
      }
    });

    logger.info("Category Statistics:");
    logger.info(`- Total Categories: ${totalCategories}`);
    logger.info(`- Root Categories: ${rootCategories}`);
    logger.info(`- Leaf Categories: ${leafCategories}`);
    logger.info(`- Intermediate Categories: ${totalCategories - rootCategories - leafCategories}`);
  } catch (error) {
    logger.error("Error getting category stats:", error);
  }
};

// Export for use in other files
export default { 
  seedComprehensiveCategories, 
  clearAllCategories, 
  getCategoryStats 
};
