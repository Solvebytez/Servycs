#!/usr/bin/env ts-node

import { connectDB, disconnectDB } from "../config/database";
import { PrismaClient, UserRole, UserStatus } from "@prisma/client";
import { logger } from "../utils/logger";

const prisma = new PrismaClient();

async function checkSalesmen() {
  try {
    logger.info("🔍 Checking for active salesmen in the database...\n");

    // Check for users with SALESMAN role
    const salesmenUsers = await prisma.user.findMany({
      where: {
        role: UserRole.SALESMAN,
      },
      include: {
        salesman: true,
      },
    });

    logger.info(`📊 Total Salesmen Users: ${salesmenUsers.length}`);

    if (salesmenUsers.length === 0) {
      logger.warn("❌ No salesmen found in the database!");
      logger.info("\n💡 To create sample salesmen, run:");
      logger.info("   npm run seed:users reset");
      return;
    }

    logger.info("\n📋 Salesmen Details:\n");
    logger.info("=".repeat(80));

    for (const user of salesmenUsers) {
      const isActive = user.status === UserStatus.ACTIVE;
      const statusEmoji = isActive ? "✅" : "⚠️";

      logger.info(`${statusEmoji} Name: ${user.name}`);
      logger.info(`   Email: ${user.email}`);
      logger.info(`   Username: ${user.username || "N/A"}`);
      logger.info(`   Status: ${user.status}`);
      logger.info(`   Email Verified: ${user.isEmailVerified ? "Yes" : "No"}`);
      logger.info(`   Phone: ${user.phone || "N/A"}`);

      if (user.salesman) {
        logger.info(`   Territory: ${user.salesman.territory}`);
        logger.info(`   Target Vendors: ${user.salesman.targetVendors}`);
        logger.info(`   Target Users: ${user.salesman.targetUsers}`);
        logger.info(`   Vendors Onboarded: ${user.salesman.vendorsOnboarded}`);
        logger.info(`   Users Onboarded: ${user.salesman.usersOnboarded}`);
        logger.info(`   Total Commission: ₹${user.salesman.totalCommission}`);
      } else {
        logger.info(`   ⚠️ Salesman profile not created!`);
      }

      logger.info(`   Created At: ${user.createdAt.toLocaleString()}`);
      logger.info(
        `   Last Login: ${user.lastLoginAt?.toLocaleString() || "Never"}`
      );
      logger.info("-".repeat(80));
    }

    // Statistics
    const activeSalesmen = salesmenUsers.filter(
      (u) => u.status === UserStatus.ACTIVE
    ).length;
    const verifiedSalesmen = salesmenUsers.filter(
      (u) => u.isEmailVerified
    ).length;
    const salesmenWithProfiles = salesmenUsers.filter(
      (u) => u.salesman !== null
    ).length;

    logger.info("\n📈 Statistics:");
    logger.info(`   Total Salesmen: ${salesmenUsers.length}`);
    logger.info(`   Active Salesmen: ${activeSalesmen}`);
    logger.info(`   Email Verified: ${verifiedSalesmen}`);
    logger.info(`   With Salesman Profile: ${salesmenWithProfiles}`);

    // Show total performance
    if (salesmenWithProfiles > 0) {
      const totalVendorsOnboarded = salesmenUsers.reduce(
        (sum, u) => sum + (u.salesman?.vendorsOnboarded || 0),
        0
      );
      const totalUsersOnboarded = salesmenUsers.reduce(
        (sum, u) => sum + (u.salesman?.usersOnboarded || 0),
        0
      );
      const totalCommission = salesmenUsers.reduce(
        (sum, u) => sum + (u.salesman?.totalCommission || 0),
        0
      );

      logger.info("\n💼 Overall Performance:");
      logger.info(`   Total Vendors Onboarded: ${totalVendorsOnboarded}`);
      logger.info(`   Total Users Onboarded: ${totalUsersOnboarded}`);
      logger.info(`   Total Commission Earned: ₹${totalCommission}`);
    }

    logger.info("\n✅ Check complete!");
  } catch (error) {
    logger.error("❌ Error checking salesmen:", error);
    throw error;
  }
}

async function main() {
  try {
    // Connect to database
    await connectDB();

    // Check for salesmen
    await checkSalesmen();
  } catch (error) {
    logger.error("Script failed:", error);
    process.exit(1);
  } finally {
    // Disconnect from database
    await disconnectDB();
    process.exit(0);
  }
}

// Run the script
main();
