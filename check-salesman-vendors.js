const { PrismaClient } = require("@prisma/client");

/**
 * Usage:
 *   node check-salesman-vendors.js sales2@listro.com
 */
(async () => {
  const prisma = new PrismaClient();
  const emailArg = process.argv[2];
  if (!emailArg) {
    console.error(
      "Provide salesman email. Example: node check-salesman-vendors.js sales2@listro.com"
    );
    process.exit(1);
  }

  try {
    console.log(`🔎 Looking up salesman by email: ${emailArg}`);
    const salesman = await prisma.user.findUnique({
      where: { email: emailArg },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!salesman) {
      console.log("❌ Salesman not found");
      process.exit(0);
    }

    console.log("👤 Salesman:", salesman);

    console.log("\n🔗 Fetching vendor users created by this salesman...");
    const vendorUsers = await prisma.user.findMany({
      where: { createdBy: salesman.id, role: "VENDOR" },
      select: { id: true, name: true, email: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    if (vendorUsers.length === 0) {
      console.log("⚠️  No vendor users created by this salesman.");
      process.exit(0);
    }

    console.log(`✅ Found ${vendorUsers.length} vendor users.`);

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

    console.log("\n📋 Vendors created by salesman:");
    console.log(JSON.stringify(joined, null, 2));
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
