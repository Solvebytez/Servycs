const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkUserData() {
  try {
    const user = await prisma.user.findFirst({
      where: { email: "sahinh013@gmail.com" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        primaryAddress: true,
        primaryCity: true,
        primaryState: true,
        primaryZipCode: true,
        primaryCountry: true,
        bio: true,
      },
    });

    console.log("User data:", JSON.stringify(user, null, 2));
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserData();
