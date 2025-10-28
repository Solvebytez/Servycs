const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkRootCategories() {
  try {
    console.log("=== ROOT CATEGORIES CHECK ===\n");

    // Get root categories
    const rootCategories = await prisma.category.findMany({
      where: {
        parentId: null,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        sortOrder: true,
        _count: {
          select: {
            children: true,
          },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    console.log(`Total Root Categories: ${rootCategories.length}\n`);

    if (rootCategories.length > 0) {
      console.log("Root Categories:");
      rootCategories.forEach((cat, index) => {
        console.log(`${index + 1}. ${cat.name} (${cat.slug})`);
        console.log(`   Children: ${cat._count.children}`);
        console.log(`   Sort Order: ${cat.sortOrder}`);
        console.log("");
      });
    }

    // Get all categories with their parent info
    const allCategories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true,
        sortOrder: true,
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    console.log(`\nTotal All Categories: ${allCategories.length}`);
    console.log(`Root Categories: ${rootCategories.length}`);
    console.log(
      `Child Categories: ${allCategories.length - rootCategories.length}`
    );

    // Check if there are multiple roots expected
    const expectedRoots = [
      "Home Services",
      "Beauty Services",
      "Education Services",
    ];
    console.log("\nExpected multiple root categories?");
    expectedRoots.forEach((expected) => {
      const found = rootCategories.find((c) => c.name.includes(expected));
      console.log(`  - ${expected}: ${found ? "✓ Found" : "✗ Not found"}`);
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRootCategories();


