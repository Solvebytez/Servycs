const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const categoryData = {
  name: "Home Services",
  slug: "home-services",
  description: "All types of professional home-related services.",
  isActive: true,
  sortOrder: 1,
  children: [
    {
      name: "Cleaning Services",
      slug: "cleaning-services",
      description: "Residential and commercial cleaning solutions.",
      sortOrder: 1,
      children: [
        {
          name: "Home Cleaning",
          slug: "home-cleaning",
          description: "Regular and deep home cleaning services.",
          sortOrder: 1,
          children: [
            {
              name: "Kitchen Cleaning",
              slug: "kitchen-cleaning",
              description: "Cleaning services for kitchen areas.",
              sortOrder: 1,
              children: [
                {
                  name: "Appliance Cleaning",
                  slug: "appliance-cleaning",
                  description: "Microwave, refrigerator, and oven cleaning.",
                  sortOrder: 1,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "Plumbing Services",
      slug: "plumbing-services",
      description: "Fixes, installations, and water system solutions.",
      sortOrder: 2,
      children: [
        {
          name: "Leak Repairs",
          slug: "leak-repairs",
          description: "Pipe and faucet leak solutions.",
          sortOrder: 1,
          children: [
            {
              name: "Bathroom Leak Repair",
              slug: "bathroom-leak-repair",
              description: "Fixing water leaks in bathroom fittings.",
              sortOrder: 1,
              children: [
                {
                  name: "Shower & Tap Fixing",
                  slug: "shower-tap-fixing",
                  description:
                    "Repair and maintenance for bathroom taps and showers.",
                  sortOrder: 1,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "Electrical Services",
      slug: "electrical-services",
      description: "All types of home and office electrical works.",
      sortOrder: 3,
      children: [
        {
          name: "Lighting Solutions",
          slug: "lighting-solutions",
          description: "Lighting installation and repair.",
          sortOrder: 1,
          children: [
            {
              name: "Smart Lighting Setup",
              slug: "smart-lighting-setup",
              description: "IoT and Alexa-based lighting systems.",
              sortOrder: 1,
              children: [
                {
                  name: "Voice Controlled Lights",
                  slug: "voice-controlled-lights",
                  description:
                    "Lights that can be operated via voice assistants.",
                  sortOrder: 1,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "Painting Services",
      slug: "painting-services",
      description: "Interior and exterior wall painting.",
      sortOrder: 4,
      children: [
        {
          name: "Interior Painting",
          slug: "interior-painting",
          description: "Paint work for home interiors.",
          sortOrder: 1,
          children: [
            {
              name: "Wall Texture Design",
              slug: "wall-texture-design",
              description: "Custom wall textures and finishes.",
              sortOrder: 1,
              children: [
                {
                  name: "Luxury Finish Texture",
                  slug: "luxury-finish-texture",
                  description: "Premium designer wall textures for homes.",
                  sortOrder: 1,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "Appliance Repair",
      slug: "appliance-repair",
      description: "Repair services for various home appliances.",
      sortOrder: 5,
      children: [
        {
          name: "AC Services",
          slug: "ac-services",
          description: "AC repair and maintenance services.",
          sortOrder: 1,
          children: [
            {
              name: "Split AC",
              slug: "split-ac",
              description: "Installation and repair for split ACs.",
              sortOrder: 1,
              children: [
                {
                  name: "Gas Refilling",
                  slug: "ac-gas-refilling",
                  description: "AC gas filling and cooling system maintenance.",
                  sortOrder: 1,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

async function insertCategory(category, parentId = null) {
  try {
    const { children, ...categoryData } = category;

    // Insert the category
    const created = await prisma.category.create({
      data: {
        ...categoryData,
        parentId: parentId,
      },
    });

    console.log(`✅ Created: ${created.name} (ID: ${created.id})`);
    console.log(`   Slug: ${created.slug}`);

    // Recursively insert children
    if (children && children.length > 0) {
      for (const child of children) {
        await insertCategory(child, created.id);
      }
    }

    return created;
  } catch (error) {
    if (error.code === "P2002") {
      console.log(`⚠️ Skipping: ${category.name} already exists`);
      // Fetch existing category and continue with children
      const existing = await prisma.category.findUnique({
        where: { slug: category.slug },
      });

      if (existing && category.children) {
        for (const child of category.children) {
          await insertCategory(child, existing.id);
        }
      }
      return existing;
    } else {
      console.error(`❌ Error creating ${category.name}:`, error.message);
      throw error;
    }
  }
}

async function insertCategories() {
  try {
    console.log("=== INSERTING CATEGORIES ===\n");
    console.log("Starting category insertion...\n");

    await insertCategory(categoryData);

    console.log("\n✅ Category insertion completed!");

    // Display the tree structure
    console.log("\n=== CATEGORY TREE ===");
    const rootCategories = await prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            children: {
              include: {
                children: {
                  include: {
                    children: {
                      include: {
                        children: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    function printTree(category, depth = 0) {
      const indent = "  ".repeat(depth);
      console.log(`${indent}└─ ${category.name} (${category.slug})`);

      if (category.children && category.children.length > 0) {
        category.children.forEach((child) => printTree(child, depth + 1));
      }
    }

    rootCategories.forEach((root) => printTree(root));
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

insertCategories();


