const { PrismaClient } = require("@prisma/client");

(async () => {
  const prisma = new PrismaClient();
  try {
    console.log("🔎 Listing vendors created by ANY salesman...\n");

    const salesmen = await prisma.user.findMany({
      where: { role: "SALESMAN" },
      select: { id: true, email: true, name: true },
      orderBy: { createdAt: "asc" },
    });

    if (salesmen.length === 0) {
      console.log("⚠️  No salesman users found.");
      process.exit(0);
    }

    console.log(`👥 Found ${salesmen.length} salesmen.`);

    const results = [];
    for (const sm of salesmen) {
      const vendorUsers = await prisma.user.findMany({
        where: { createdBy: sm.id, role: "VENDOR" },
        select: { id: true, name: true, email: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      });

      if (vendorUsers.length === 0) {
        results.push({ salesman: sm, vendors: [] });
        continue;
      }

      const vendorRecords = await prisma.vendor.findMany({
        where: { userId: { in: vendorUsers.map((u) => u.id) } },
        select: {
          id: true,
          userId: true,
          businessName: true,
          isVerified: true,
          verificationStatus: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });

      const userIdToUser = new Map(vendorUsers.map((u) => [u.id, u]));
      const joined = vendorRecords.map((v) => ({
        vendorId: v.id,
        businessName: v.businessName,
        createdAt: v.createdAt,
        isVerified: v.isVerified,
        verificationStatus: v.verificationStatus,
        user: userIdToUser.get(v.userId) || { id: v.userId },
      }));

      results.push({ salesman: sm, vendors: joined });
    }

    // Summary
    const totalVendors = results.reduce((acc, r) => acc + r.vendors.length, 0);
    console.log(
      `\n📊 Summary: ${totalVendors} vendors created by ${salesmen.length} salesmen.`
    );

    console.log("\n📋 Detailed Results:\n");
    console.log(JSON.stringify(results, null, 2));
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
