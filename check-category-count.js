const { PrismaClient } = require("@prisma/client");

(async () => {
  const prisma = new PrismaClient();
  try {
    const total = await prisma.category.count();
    const active = await prisma.category.count({ where: { isActive: true } });
    console.log(JSON.stringify({ total, active }, null, 2));
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
