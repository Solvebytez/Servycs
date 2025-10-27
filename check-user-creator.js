const { PrismaClient } = require("@prisma/client");

/**
 * Usage:
 *   node check-user-creator.js <email>
 */
(async () => {
  const prisma = new PrismaClient();
  const emailArg = process.argv[2];
  if (!emailArg) {
    console.error(
      "Provide a user email. Example: node check-user-creator.js salesvn2@gmail.com"
    );
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: emailArg },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdBy: true,
      },
    });

    if (!user) {
      console.log("User not found");
      process.exit(0);
    }

    let creator = null;
    if (user.createdBy) {
      creator = await prisma.user.findUnique({
        where: { id: user.createdBy },
        select: { id: true, email: true, name: true, role: true },
      });
    }

    console.log(
      JSON.stringify(
        {
          user,
          createdBy: creator,
        },
        null,
        2
      )
    );
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
