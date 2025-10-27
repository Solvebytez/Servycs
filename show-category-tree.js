const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function showCategoryTree() {
  try {
    console.log("🌳 Category Tree Structure");
    console.log("=".repeat(50));

    // Get all categories with their relationships
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        parentId: true,
        sortOrder: true,
        createdAt: true,
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true,
            sortOrder: true,
            _count: {
              select: {
                services: true,
                serviceListings: true,
              },
            },
          },
          orderBy: {
            sortOrder: "asc",
          },
        },
        _count: {
          select: {
            services: true,
            serviceListings: true,
          },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    // Separate parent and child categories
    const parentCategories = categories.filter((cat) => !cat.parentId);
    const childCategories = categories.filter((cat) => cat.parentId);

    console.log(`📊 Summary:`);
    console.log(`   Total Categories: ${categories.length}`);
    console.log(`   Parent Categories: ${parentCategories.length}`);
    console.log(`   Child Categories: ${childCategories.length}`);
    console.log("");

    // Display tree structure
    console.log("🌲 Category Hierarchy:");
    console.log("-".repeat(50));

    for (const parent of parentCategories) {
      const status = parent.isActive ? "✅" : "❌";
      console.log(`${status} ${parent.name} (${parent.slug})`);
      console.log(`   📁 Services: ${parent._count.services}`);
      console.log(`   📋 Listings: ${parent._count.serviceListings}`);
      console.log(
        `   📅 Created: ${parent.createdAt.toISOString().split("T")[0]}`
      );

      if (parent.children && parent.children.length > 0) {
        console.log(`   └── Subcategories:`);
        for (const child of parent.children) {
          const childStatus = child.isActive ? "✅" : "❌";
          console.log(`       ${childStatus} ${child.name} (${child.slug})`);
          console.log(`          📁 Services: ${child._count.services}`);
          console.log(`          📋 Listings: ${child._count.serviceListings}`);
        }
      } else {
        console.log(`   └── No subcategories`);
      }
      console.log("");
    }

    // Show orphaned child categories (if any)
    const orphanedChildren = childCategories.filter(
      (child) => !categories.find((cat) => cat.id === child.parentId)
    );

    if (orphanedChildren.length > 0) {
      console.log("⚠️  Orphaned Child Categories:");
      console.log("-".repeat(50));
      for (const orphan of orphanedChildren) {
        const status = orphan.isActive ? "✅" : "❌";
        console.log(
          `${status} ${orphan.name} (${orphan.slug}) - Parent ID: ${orphan.parentId}`
        );
      }
      console.log("");
    }

    // Show inactive categories
    const inactiveCategories = categories.filter((cat) => !cat.isActive);
    if (inactiveCategories.length > 0) {
      console.log("❌ Inactive Categories:");
      console.log("-".repeat(50));
      for (const inactive of inactiveCategories) {
        const type = inactive.parentId ? "Child" : "Parent";
        console.log(`${type}: ${inactive.name} (${inactive.slug})`);
      }
    }
  } catch (error) {
    console.error("❌ Error fetching categories:", error);
  } finally {
    await prisma.$disconnect();
  }
}

showCategoryTree();
