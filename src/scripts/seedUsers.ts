#!/usr/bin/env ts-node

import { connectDB, disconnectDB } from "../config/database";
import {
  PrismaClient,
  UserRole,
  UserStatus,
  AuthProvider,
} from "@prisma/client";
import { logger } from "../utils/logger";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Sample users data with different roles and statuses
const sampleUsers = [
  // Regular Users
  {
    username: "john_doe",
    email: "john.doe@example.com",
    password: "password123",
    name: "John Doe",
    phone: "+91-9876543210",
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    provider: AuthProvider.LOCAL,
    isEmailVerified: true,
    isPhoneVerified: true,
    primaryAddress: "123 Main Street",
    primaryCity: "Mumbai",
    primaryState: "Maharashtra",
    primaryZipCode: "400001",
    primaryCountry: "India",
    bio: "Tech enthusiast and service seeker",
  },
  {
    username: "jane_smith",
    email: "jane.smith@example.com",
    password: "password123",
    name: "Jane Smith",
    phone: "+91-9876543211",
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    provider: AuthProvider.LOCAL,
    isEmailVerified: true,
    isPhoneVerified: false,
    primaryAddress: "456 Park Avenue",
    primaryCity: "Delhi",
    primaryState: "Delhi",
    primaryZipCode: "110001",
    primaryCountry: "India",
    bio: "Fitness lover and wellness seeker",
  },
  {
    username: "mike_wilson",
    email: "mike.wilson@example.com",
    password: "password123",
    name: "Mike Wilson",
    phone: "+91-9876543212",
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    provider: AuthProvider.LOCAL,
    isEmailVerified: true,
    isPhoneVerified: true,
    primaryAddress: "789 Business District",
    primaryCity: "Bangalore",
    primaryState: "Karnataka",
    primaryZipCode: "560001",
    primaryCountry: "India",
    bio: "Business professional looking for quality services",
  },
  {
    username: "sarah_jones",
    email: "sarah.jones@example.com",
    password: "password123",
    name: "Sarah Jones",
    phone: "+91-9876543213",
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    provider: AuthProvider.LOCAL,
    isEmailVerified: false,
    isPhoneVerified: true,
    primaryAddress: "321 Garden Street",
    primaryCity: "Chennai",
    primaryState: "Tamil Nadu",
    primaryZipCode: "600001",
    primaryCountry: "India",
    bio: "Home maker and family person",
  },
  {
    username: "alex_brown",
    email: "alex.brown@example.com",
    password: "password123",
    name: "Alex Brown",
    phone: "+91-9876543214",
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    provider: AuthProvider.LOCAL,
    isEmailVerified: true,
    isPhoneVerified: true,
    primaryAddress: "654 Tech Park",
    primaryCity: "Hyderabad",
    primaryState: "Telangana",
    primaryZipCode: "500001",
    primaryCountry: "India",
    bio: "Software developer and tech geek",
  },

  // Vendors
  {
    username: "beauty_parlour_owner",
    email: "owner@beautyparlour.com",
    password: "password123",
    name: "Priya Sharma",
    phone: "+91-9876543215",
    role: UserRole.VENDOR,
    status: UserStatus.ACTIVE,
    provider: AuthProvider.LOCAL,
    isEmailVerified: true,
    isPhoneVerified: true,
    primaryAddress: "987 Beauty Lane",
    primaryCity: "Mumbai",
    primaryState: "Maharashtra",
    primaryZipCode: "400002",
    primaryCountry: "India",
    bio: "Professional beauty services provider",
  },
  {
    username: "fitness_trainer",
    email: "trainer@fitnessgym.com",
    password: "password123",
    name: "Rajesh Kumar",
    phone: "+91-9876543216",
    role: UserRole.VENDOR,
    status: UserStatus.ACTIVE,
    provider: AuthProvider.LOCAL,
    isEmailVerified: true,
    isPhoneVerified: true,
    primaryAddress: "147 Fitness Center",
    primaryCity: "Delhi",
    primaryState: "Delhi",
    primaryZipCode: "110002",
    primaryCountry: "India",
    bio: "Certified fitness trainer and gym owner",
  },
  {
    username: "home_cleaning_service",
    email: "service@homecleaning.com",
    password: "password123",
    name: "Sunita Patel",
    phone: "+91-9876543217",
    role: UserRole.VENDOR,
    status: UserStatus.ACTIVE,
    provider: AuthProvider.LOCAL,
    isEmailVerified: true,
    isPhoneVerified: true,
    primaryAddress: "258 Service Road",
    primaryCity: "Bangalore",
    primaryState: "Karnataka",
    primaryZipCode: "560002",
    primaryCountry: "India",
    bio: "Professional home cleaning and maintenance services",
  },

  // Salesmen
  {
    username: "sales_rep_1",
    email: "sales1@listro.com",
    password: "password123",
    name: "Amit Singh",
    phone: "+91-9876543218",
    role: UserRole.SALESMAN,
    status: UserStatus.ACTIVE,
    provider: AuthProvider.LOCAL,
    isEmailVerified: true,
    isPhoneVerified: true,
    primaryAddress: "369 Sales Office",
    primaryCity: "Mumbai",
    primaryState: "Maharashtra",
    primaryZipCode: "400003",
    primaryCountry: "India",
    bio: "Regional sales representative",
  },
  {
    username: "sales_rep_2",
    email: "sales2@listro.com",
    password: "password123",
    name: "Deepak Verma",
    phone: "+91-9876543219",
    role: UserRole.SALESMAN,
    status: UserStatus.ACTIVE,
    provider: AuthProvider.LOCAL,
    isEmailVerified: true,
    isPhoneVerified: true,
    primaryAddress: "741 Sales Hub",
    primaryCity: "Delhi",
    primaryState: "Delhi",
    primaryZipCode: "110003",
    primaryCountry: "India",
    bio: "Territory sales manager",
  },

  // Admins
  {
    username: "admin_user",
    email: "admin@listro.com",
    password: "admin123",
    name: "Admin User",
    phone: "+91-9876543220",
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    provider: AuthProvider.LOCAL,
    isEmailVerified: true,
    isPhoneVerified: true,
    primaryAddress: "852 Admin Building",
    primaryCity: "Bangalore",
    primaryState: "Karnataka",
    primaryZipCode: "560003",
    primaryCountry: "India",
    bio: "System administrator",
  },
  {
    username: "super_admin",
    email: "superadmin@listro.com",
    password: "superadmin123",
    name: "Super Admin",
    phone: "+91-9876543221",
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    provider: AuthProvider.LOCAL,
    isEmailVerified: true,
    isPhoneVerified: true,
    primaryAddress: "963 Super Admin Office",
    primaryCity: "Mumbai",
    primaryState: "Maharashtra",
    primaryZipCode: "400004",
    primaryCountry: "India",
    bio: "Super administrator with full access",
  },
];

// Vendor business data
const vendorBusinessData = [
  {
    businessName: "Priya's Beauty Parlour",
    businessEmail: "info@priyasbeauty.com",
    businessPhone: "+91-9876543215",
    businessDescription:
      "Professional beauty services including haircuts, styling, facials, and makeup. We provide quality services with experienced staff.",
    businessLicense: "BL123456789",
    businessInsurance: "INS987654321",
    businessCertifications: [
      "Beauty Professional Certification",
      "Hair Styling License",
    ],
    verificationStatus: UserStatus.ACTIVE,
    isVerified: true,
  },
  {
    businessName: "FitLife Gym & Training Center",
    businessEmail: "info@fitlifegym.com",
    businessPhone: "+91-9876543216",
    businessDescription:
      "Complete fitness solutions with personal training, group classes, and modern equipment. Certified trainers and nutrition guidance.",
    businessLicense: "BL234567890",
    businessInsurance: "INS876543210",
    businessCertifications: [
      "Fitness Trainer Certification",
      "Nutrition Consultant License",
    ],
    verificationStatus: UserStatus.ACTIVE,
    isVerified: true,
  },
  {
    businessName: "CleanHome Professional Services",
    businessEmail: "info@cleanhome.com",
    businessPhone: "+91-9876543217",
    businessDescription:
      "Professional home cleaning, deep cleaning, and maintenance services. Eco-friendly products and trained staff.",
    businessLicense: "BL345678901",
    businessInsurance: "INS765432109",
    businessCertifications: [
      "Cleaning Service License",
      "Eco-Friendly Certification",
    ],
    verificationStatus: UserStatus.ACTIVE,
    isVerified: true,
  },
];

// Salesman data
const salesmanData = [
  {
    territory: "Mumbai & Thane",
    targetVendors: 30,
    targetUsers: 150,
    vendorsOnboarded: 5,
    usersOnboarded: 25,
  },
  {
    territory: "Delhi NCR",
    targetVendors: 35,
    targetUsers: 200,
    vendorsOnboarded: 8,
    usersOnboarded: 40,
  },
];

// Admin data
const adminData = [
  {
    permissions: [
      "user_management",
      "vendor_management",
      "content_moderation",
      "analytics",
    ],
    department: "Operations",
    isSuperAdmin: false,
  },
  {
    permissions: [
      "user_management",
      "vendor_management",
      "content_moderation",
      "analytics",
      "system_settings",
      "admin_management",
    ],
    department: "IT",
    isSuperAdmin: true,
  },
];

async function clearAllUsers() {
  try {
    logger.info("🗑️ Clearing all users and related data...");

    // Delete in order to respect foreign key constraints
    await prisma.admin.deleteMany();
    await prisma.salesman.deleteMany();
    await prisma.vendor.deleteMany();
    await prisma.user.deleteMany();

    logger.info("✅ All users and related data cleared");
  } catch (error) {
    logger.error("❌ Error clearing users:", error);
    throw error;
  }
}

async function seedUsers() {
  try {
    logger.info("🌱 Starting to seed users...");

    const createdUsers = [];
    const createdVendors = [];
    const createdSalesmen = [];
    const createdAdmins = [];

    for (let i = 0; i < sampleUsers.length; i++) {
      const userData = sampleUsers[i];

      if (!userData) {
        logger.warn(`⚠️ Skipping user ${i} - missing data`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Create user
      const user = await prisma.user.create({
        data: {
          username: userData.username,
          email: userData.email,
          password: hashedPassword,
          name: userData.name,
          phone: userData.phone,
          role: userData.role,
          status: userData.status,
          provider: userData.provider,
          isEmailVerified: userData.isEmailVerified,
          isPhoneVerified: userData.isPhoneVerified,
          primaryAddress: userData.primaryAddress,
          primaryCity: userData.primaryCity,
          primaryState: userData.primaryState,
          primaryZipCode: userData.primaryZipCode,
          primaryCountry: userData.primaryCountry,
          bio: userData.bio,
          lastLoginAt: new Date(),
        },
      });

      createdUsers.push(user);
      logger.info(`✅ Created user: ${user.name} (${user.role})`);

      // Create role-specific data
      if (user.role === UserRole.VENDOR) {
        const vendorIndex: number = createdVendors.length;
        if (vendorIndex < vendorBusinessData.length) {
          const businessData: (typeof vendorBusinessData)[0] =
            vendorBusinessData[vendorIndex]!;

          const vendor = await prisma.vendor.create({
            data: {
              userId: user.id,
              businessName: businessData.businessName,
              businessEmail: businessData.businessEmail,
              businessPhone: businessData.businessPhone,
              businessDescription: businessData.businessDescription,
              businessLicense: businessData.businessLicense,
              businessInsurance: businessData.businessInsurance,
              businessCertifications: businessData.businessCertifications,
              verificationStatus: businessData.verificationStatus,
              isVerified: businessData.isVerified,
              businessHours: {
                monday: { open: "09:00", close: "18:00", isOpen: true },
                tuesday: { open: "09:00", close: "18:00", isOpen: true },
                wednesday: { open: "09:00", close: "18:00", isOpen: true },
                thursday: { open: "09:00", close: "18:00", isOpen: true },
                friday: { open: "09:00", close: "18:00", isOpen: true },
                saturday: { open: "10:00", close: "16:00", isOpen: true },
                sunday: { open: "10:00", close: "14:00", isOpen: false },
              },
            },
          });

          createdVendors.push(vendor);
          logger.info(
            `✅ Created vendor business: ${businessData.businessName}`
          );
        }
      } else if (user.role === UserRole.SALESMAN) {
        const salesmanIndex: number = createdSalesmen.length;
        if (salesmanIndex < salesmanData.length) {
          const salesData: (typeof salesmanData)[0] =
            salesmanData[salesmanIndex]!;

          const salesman = await prisma.salesman.create({
            data: {
              userId: user.id,
              territory: salesData.territory,
              targetVendors: salesData.targetVendors,
              targetUsers: salesData.targetUsers,
              vendorsOnboarded: salesData.vendorsOnboarded,
              usersOnboarded: salesData.usersOnboarded,
            },
          });

          createdSalesmen.push(salesman);
          logger.info(
            `✅ Created salesman: ${user.name} - ${salesData.territory}`
          );
        }
      } else if (user.role === UserRole.ADMIN) {
        const adminIndex: number = createdAdmins.length;
        if (adminIndex < adminData.length) {
          const adminInfo: (typeof adminData)[0] = adminData[adminIndex]!;

          const admin = await prisma.admin.create({
            data: {
              userId: user.id,
              permissions: adminInfo.permissions,
              department: adminInfo.department,
              isSuperAdmin: adminInfo.isSuperAdmin,
            },
          });

          createdAdmins.push(admin);
          logger.info(
            `✅ Created admin: ${user.name} (${adminInfo.department})`
          );
        }
      }
    }

    // Display statistics
    logger.info("\n📈 User Statistics:");
    logger.info(`   Total Users: ${createdUsers.length}`);
    logger.info(
      `   Regular Users: ${
        createdUsers.filter((u) => u.role === UserRole.USER).length
      }`
    );
    logger.info(
      `   Vendors: ${
        createdUsers.filter((u) => u.role === UserRole.VENDOR).length
      }`
    );
    logger.info(
      `   Salesmen: ${
        createdUsers.filter((u) => u.role === UserRole.SALESMAN).length
      }`
    );
    logger.info(
      `   Admins: ${
        createdUsers.filter((u) => u.role === UserRole.ADMIN).length
      }`
    );
    logger.info(
      `   Active Users: ${
        createdUsers.filter((u) => u.status === UserStatus.ACTIVE).length
      }`
    );
    logger.info(
      `   Email Verified: ${
        createdUsers.filter((u) => u.isEmailVerified).length
      }`
    );
    logger.info(
      `   Phone Verified: ${
        createdUsers.filter((u) => u.isPhoneVerified).length
      }`
    );

    logger.info("\n🎉 Users seeded successfully!");
  } catch (error) {
    logger.error("❌ Error seeding users:", error);
    throw error;
  }
}

async function getUserStats() {
  try {
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({
      where: { status: UserStatus.ACTIVE },
    });
    const usersByRole = await prisma.user.groupBy({
      by: ["role"],
      _count: { role: true },
    });
    const usersByStatus = await prisma.user.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    logger.info("\n📊 Current User Statistics:");
    logger.info(`   Total Users: ${totalUsers}`);
    logger.info(`   Active Users: ${activeUsers}`);

    logger.info("\n   Users by Role:");
    usersByRole.forEach((group) => {
      logger.info(`     ${group.role}: ${group._count.role}`);
    });

    logger.info("\n   Users by Status:");
    usersByStatus.forEach((group) => {
      logger.info(`     ${group.status}: ${group._count.status}`);
    });
  } catch (error) {
    logger.error("❌ Error getting user stats:", error);
    throw error;
  }
}

async function main() {
  try {
    // Connect to database
    await connectDB();

    // Parse command line arguments
    const args = process.argv.slice(2);
    const command = args[0];

    switch (command) {
      case "seed":
        logger.info("🌱 Seeding users...");
        await seedUsers();
        await getUserStats();
        break;

      case "clear":
        logger.info("🗑️ Clearing all users...");
        await clearAllUsers();
        break;

      case "reset":
        logger.info("🔄 Resetting users (clear + seed)...");
        await clearAllUsers();
        await seedUsers();
        await getUserStats();
        break;

      case "stats":
        logger.info("📊 Getting user statistics...");
        await getUserStats();
        break;

      default:
        logger.info("Usage: npm run seed:users [command]");
        logger.info("Commands:");
        logger.info("  seed  - Add sample users with different roles");
        logger.info("  clear - Remove all existing users");
        logger.info("  reset - Clear and re-seed all users");
        logger.info("  stats - Show user statistics");
        break;
    }
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
