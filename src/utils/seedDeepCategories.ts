import { PrismaClient } from "@prisma/client";
import { logger } from "./logger";

const prisma = new PrismaClient();

// Enhanced categories with deeper nesting (4-5 levels)
const deepCategories = [
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
            children: [
              {
                name: "Family Medicine",
                slug: "family-medicine",
                description: "Family practice and primary care",
                children: [
                  {
                    name: "Pediatric Care",
                    slug: "pediatric-care",
                    description: "Children's healthcare services",
                  },
                  {
                    name: "Geriatric Care",
                    slug: "geriatric-care",
                    description: "Elderly healthcare services",
                  },
                  {
                    name: "Preventive Care",
                    slug: "preventive-care",
                    description: "Health screenings and prevention",
                  },
                ],
              },
              {
                name: "Internal Medicine",
                slug: "internal-medicine",
                description: "Adult internal medicine",
                children: [
                  {
                    name: "Cardiology",
                    slug: "cardiology",
                    description: "Heart and cardiovascular care",
                  },
                  {
                    name: "Endocrinology",
                    slug: "endocrinology",
                    description: "Hormone and metabolic disorders",
                  },
                ],
              },
            ],
          },
          {
            name: "Specialist",
            slug: "specialist",
            description: "Medical specialists",
            children: [
              {
                name: "Surgery",
                slug: "surgery",
                description: "Surgical procedures",
                children: [
                  {
                    name: "General Surgery",
                    slug: "general-surgery",
                    description: "General surgical procedures",
                  },
                  {
                    name: "Orthopedic Surgery",
                    slug: "orthopedic-surgery",
                    description: "Bone and joint surgery",
                  },
                  {
                    name: "Plastic Surgery",
                    slug: "plastic-surgery",
                    description: "Cosmetic and reconstructive surgery",
                  },
                ],
              },
              {
                name: "Diagnostics",
                slug: "diagnostics",
                description: "Medical diagnostic services",
                children: [
                  {
                    name: "Radiology",
                    slug: "radiology",
                    description: "Medical imaging services",
                  },
                  {
                    name: "Pathology",
                    slug: "pathology",
                    description: "Laboratory and tissue analysis",
                  },
                ],
              },
            ],
          },
          {
            name: "Dentist",
            slug: "dentist",
            description: "Dental care services",
            children: [
              {
                name: "General Dentistry",
                slug: "general-dentistry",
                description: "General dental care",
                children: [
                  {
                    name: "Preventive Care",
                    slug: "dental-preventive",
                    description: "Cleanings and checkups",
                  },
                  {
                    name: "Restorative Care",
                    slug: "restorative-care",
                    description: "Fillings and repairs",
                  },
                ],
              },
              {
                name: "Specialized Dentistry",
                slug: "specialized-dentistry",
                description: "Specialized dental services",
                children: [
                  {
                    name: "Orthodontics",
                    slug: "orthodontics",
                    description: "Braces and teeth alignment",
                  },
                  {
                    name: "Oral Surgery",
                    slug: "oral-surgery",
                    description: "Dental surgery procedures",
                  },
                ],
              },
            ],
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
            children: [
              {
                name: "Commercial Gyms",
                slug: "commercial-gyms",
                description: "Large commercial fitness centers",
                children: [
                  {
                    name: "24/7 Gyms",
                    slug: "24-7-gyms",
                    description: "Round-the-clock fitness access",
                  },
                  {
                    name: "Premium Gyms",
                    slug: "premium-gyms",
                    description: "High-end fitness facilities",
                  },
                ],
              },
              {
                name: "Boutique Gyms",
                slug: "boutique-gyms",
                description: "Specialized fitness studios",
                children: [
                  {
                    name: "CrossFit",
                    slug: "crossfit",
                    description: "CrossFit training facilities",
                  },
                  {
                    name: "Pilates Studios",
                    slug: "pilates-studios",
                    description: "Pilates and core training",
                  },
                ],
              },
            ],
          },
          {
            name: "Personal Training",
            slug: "personal-training",
            description: "Personal fitness training",
            children: [
              {
                name: "Strength Training",
                slug: "strength-training",
                description: "Weight and resistance training",
                children: [
                  {
                    name: "Powerlifting",
                    slug: "powerlifting",
                    description: "Powerlifting coaching",
                  },
                  {
                    name: "Bodybuilding",
                    slug: "bodybuilding",
                    description: "Bodybuilding training",
                  },
                ],
              },
              {
                name: "Cardio Training",
                slug: "cardio-training",
                description: "Cardiovascular fitness training",
                children: [
                  {
                    name: "Running Coaching",
                    slug: "running-coaching",
                    description: "Running technique and training",
                  },
                  {
                    name: "Cycling Training",
                    slug: "cycling-training",
                    description: "Cycling fitness programs",
                  },
                ],
              },
            ],
          },
          {
            name: "Yoga",
            slug: "yoga",
            description: "Yoga classes and instruction",
            children: [
              {
                name: "Hatha Yoga",
                slug: "hatha-yoga",
                description: "Traditional Hatha yoga practice",
                children: [
                  {
                    name: "Beginner Hatha",
                    slug: "beginner-hatha",
                    description: "Hatha yoga for beginners",
                  },
                  {
                    name: "Advanced Hatha",
                    slug: "advanced-hatha",
                    description: "Advanced Hatha yoga practice",
                  },
                ],
              },
              {
                name: "Vinyasa Yoga",
                slug: "vinyasa-yoga",
                description: "Flow-based yoga practice",
                children: [
                  {
                    name: "Power Vinyasa",
                    slug: "power-vinyasa",
                    description: "Intense flow yoga",
                  },
                  {
                    name: "Gentle Vinyasa",
                    slug: "gentle-vinyasa",
                    description: "Gentle flow yoga",
                  },
                ],
              },
            ],
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
            children: [
              {
                name: "Hair Cutting",
                slug: "hair-cutting",
                description: "Professional hair cutting services",
                children: [
                  {
                    name: "Men's Haircuts",
                    slug: "mens-haircuts",
                    description: "Men's professional haircuts",
                  },
                  {
                    name: "Women's Haircuts",
                    slug: "womens-haircuts",
                    description: "Women's professional haircuts",
                  },
                  {
                    name: "Children's Haircuts",
                    slug: "childrens-haircuts",
                    description: "Kids' haircut services",
                  },
                ],
              },
              {
                name: "Hair Styling",
                slug: "hair-styling",
                description: "Hair styling and design",
                children: [
                  {
                    name: "Wedding Styling",
                    slug: "wedding-styling",
                    description: "Special occasion hair styling",
                  },
                  {
                    name: "Event Styling",
                    slug: "event-styling",
                    description: "Party and event hair styling",
                  },
                ],
              },
              {
                name: "Hair Treatment",
                slug: "hair-treatment",
                description: "Hair care and treatment services",
                children: [
                  {
                    name: "Hair Coloring",
                    slug: "hair-coloring",
                    description: "Professional hair coloring",
                  },
                  {
                    name: "Hair Straightening",
                    slug: "hair-straightening",
                    description: "Hair straightening treatments",
                  },
                ],
              },
            ],
          },
          {
            name: "Nail Services",
            slug: "nail-services",
            description: "Manicure, pedicure, and nail art",
            children: [
              {
                name: "Manicures",
                slug: "manicures",
                description: "Hand and nail care",
                children: [
                  {
                    name: "Classic Manicure",
                    slug: "classic-manicure",
                    description: "Traditional manicure service",
                  },
                  {
                    name: "Gel Manicure",
                    slug: "gel-manicure",
                    description: "Long-lasting gel manicure",
                  },
                ],
              },
              {
                name: "Pedicures",
                slug: "pedicures",
                description: "Foot and toenail care",
                children: [
                  {
                    name: "Classic Pedicure",
                    slug: "classic-pedicure",
                    description: "Traditional pedicure service",
                  },
                  {
                    name: "Spa Pedicure",
                    slug: "spa-pedicure",
                    description: "Luxury spa pedicure",
                  },
                ],
              },
              {
                name: "Nail Art",
                slug: "nail-art",
                description: "Creative nail design",
                children: [
                  {
                    name: "Hand-Painted Art",
                    slug: "hand-painted-art",
                    description: "Custom hand-painted designs",
                  },
                  {
                    name: "Nail Stickers",
                    slug: "nail-stickers",
                    description: "Decorative nail stickers",
                  },
                ],
              },
            ],
          },
          {
            name: "Facial Treatment",
            slug: "facial-treatment",
            description: "Facial care and treatment",
            children: [
              {
                name: "Basic Facials",
                slug: "basic-facials",
                description: "Standard facial treatments",
                children: [
                  {
                    name: "Deep Cleansing",
                    slug: "deep-cleansing",
                    description: "Deep pore cleansing facial",
                  },
                  {
                    name: "Hydrating Facial",
                    slug: "hydrating-facial",
                    description: "Moisturizing facial treatment",
                  },
                ],
              },
              {
                name: "Advanced Facials",
                slug: "advanced-facials",
                description: "Specialized facial treatments",
                children: [
                  {
                    name: "Anti-Aging Facial",
                    slug: "anti-aging-facial",
                    description: "Anti-aging facial treatment",
                  },
                  {
                    name: "Acne Treatment",
                    slug: "acne-treatment",
                    description: "Acne-focused facial care",
                  },
                ],
              },
            ],
          },
          {
            name: "Spa Center",
            slug: "spa-center",
            description: "Spa and wellness treatments",
            children: [
              {
                name: "Massage Therapy",
                slug: "massage-therapy",
                description: "Professional massage services",
                children: [
                  {
                    name: "Swedish Massage",
                    slug: "swedish-massage",
                    description: "Classic Swedish massage",
                  },
                  {
                    name: "Deep Tissue Massage",
                    slug: "deep-tissue-massage",
                    description: "Intensive deep tissue massage",
                  },
                  {
                    name: "Hot Stone Massage",
                    slug: "hot-stone-massage",
                    description: "Therapeutic hot stone massage",
                  },
                ],
              },
              {
                name: "Body Treatments",
                slug: "body-treatments",
                description: "Full body wellness treatments",
                children: [
                  {
                    name: "Body Wraps",
                    slug: "body-wraps",
                    description: "Detoxifying body wrap treatments",
                  },
                  {
                    name: "Exfoliation",
                    slug: "exfoliation",
                    description: "Body exfoliation treatments",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Technology",
    slug: "technology",
    description: "Technology and digital services",
    children: [
      {
        name: "Software Development",
        slug: "software-development",
        description: "Custom software solutions",
        children: [
          {
            name: "Web Development",
            slug: "web-development",
            description: "Website and web application development",
            children: [
              {
                name: "Frontend Development",
                slug: "frontend-development",
                description: "User interface development",
                children: [
                  {
                    name: "React Development",
                    slug: "react-development",
                    description: "React.js application development",
                  },
                  {
                    name: "Vue.js Development",
                    slug: "vuejs-development",
                    description: "Vue.js application development",
                  },
                  {
                    name: "Angular Development",
                    slug: "angular-development",
                    description: "Angular application development",
                  },
                ],
              },
              {
                name: "Backend Development",
                slug: "backend-development",
                description: "Server-side development",
                children: [
                  {
                    name: "Node.js Development",
                    slug: "nodejs-development",
                    description: "Node.js backend development",
                  },
                  {
                    name: "Python Development",
                    slug: "python-development",
                    description: "Python backend development",
                  },
                  {
                    name: "PHP Development",
                    slug: "php-development",
                    description: "PHP backend development",
                  },
                ],
              },
            ],
          },
          {
            name: "Mobile Development",
            slug: "mobile-development",
            description: "Mobile application development",
            children: [
              {
                name: "iOS Development",
                slug: "ios-development",
                description: "iPhone and iPad app development",
                children: [
                  {
                    name: "Native iOS",
                    slug: "native-ios",
                    description: "Native iOS app development",
                  },
                  {
                    name: "Swift Development",
                    slug: "swift-development",
                    description: "Swift programming services",
                  },
                ],
              },
              {
                name: "Android Development",
                slug: "android-development",
                description: "Android app development",
                children: [
                  {
                    name: "Native Android",
                    slug: "native-android",
                    description: "Native Android app development",
                  },
                  {
                    name: "Kotlin Development",
                    slug: "kotlin-development",
                    description: "Kotlin programming services",
                  },
                ],
              },
              {
                name: "Cross-Platform",
                slug: "cross-platform",
                description: "Cross-platform mobile development",
                children: [
                  {
                    name: "React Native",
                    slug: "react-native",
                    description: "React Native development",
                  },
                  {
                    name: "Flutter Development",
                    slug: "flutter-development",
                    description: "Flutter app development",
                  },
                ],
              },
            ],
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

// Main seeding function for deep categories
export const seedDeepCategories = async (): Promise<void> => {
  try {
    logger.info("Starting deep category seeding...");

    // Clear existing categories using raw MongoDB operation
    await prisma.$runCommandRaw({
      delete: "categories",
      deletes: [{ q: {}, limit: 0 }],
    });
    logger.info("Cleared existing categories");

    // Create all deep categories
    for (let i = 0; i < deepCategories.length; i++) {
      await createCategoryRecursive(deepCategories[i], null, i);
    }

    logger.info("Deep category seeding completed successfully");
  } catch (error) {
    logger.error("Error seeding deep categories:", error);
    throw error;
  }
};

// Function to get tree depth statistics
export const getTreeDepthStats = async (): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        parentId: true,
      },
    });

    // Build tree and calculate depths
    const categoryMap = new Map<string, any>();
    categories.forEach((cat) => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    const rootNodes: any[] = [];
    categories.forEach((cat) => {
      const node = categoryMap.get(cat.id)!;
      if (cat.parentId) {
        const parent = categoryMap.get(cat.parentId);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        rootNodes.push(node);
      }
    });

    // Calculate max depth
    const getMaxDepth = (nodes: any[]): number => {
      if (nodes.length === 0) return 0;
      return 1 + Math.max(...nodes.map((node) => getMaxDepth(node.children)));
    };

    const maxDepth = getMaxDepth(rootNodes);
    const totalCategories = categories.length;

    logger.info(`Tree Statistics:`);
    logger.info(`- Total Categories: ${totalCategories}`);
    logger.info(`- Max Depth: ${maxDepth} levels`);
    logger.info(`- Root Categories: ${rootNodes.length}`);

    // Count categories at each level
    const levelCounts: number[] = new Array(maxDepth + 1).fill(0);
    const countByLevel = (nodes: any[], level: number): void => {
      nodes.forEach((node) => {
        if (levelCounts[level] !== undefined) {
          levelCounts[level]++;
        }
        countByLevel(node.children, level + 1);
      });
    };
    countByLevel(rootNodes, 0);

    levelCounts.forEach((count, level) => {
      if (count > 0) {
        logger.info(`- Level ${level}: ${count} categories`);
      }
    });
  } catch (error) {
    logger.error("Error getting tree depth stats:", error);
  }
};

export default { seedDeepCategories, getTreeDepthStats };
