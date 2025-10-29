import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const appReviewCategories = [
  "UI/UX",
  "Performance",
  "Features",
  "Navigation",
  "Search",
  "Booking Process",
  "Customer Support",
  "Overall Experience",
];

const sampleReviews = [
  {
    rating: 5,
    title: "Amazing app!",
    comment:
      "This app has completely transformed how I find and book services. The interface is clean, booking is seamless, and the service providers are top-notch. Highly recommended!",
    categories: ["UI/UX", "Features", "Overall Experience"],
    ratings: {
      "UI/UX": 5,
      Performance: 5,
      Features: 5,
      Navigation: 4,
      "Booking Process": 5,
    },
    isAnonymous: false,
    status: "APPROVED" as const,
    isPublic: true,
    helpful: 12,
    notHelpful: 1,
    deviceInfo: {
      platform: "Android",
      version: "1.2.3",
      deviceModel: "Samsung Galaxy S21",
      osVersion: "Android 13",
    },
  },
  {
    rating: 4,
    title: "Great concept, minor issues",
    comment:
      "Love the idea and most features work well. The search could be improved and sometimes the app is a bit slow to load. But overall, it's a solid platform for finding services.",
    categories: ["Performance", "Search", "Features"],
    ratings: {
      "UI/UX": 4,
      Performance: 3,
      Features: 4,
      Search: 3,
      "Overall Experience": 4,
    },
    isAnonymous: false,
    status: "APPROVED" as const,
    isPublic: true,
    helpful: 8,
    notHelpful: 2,
    deviceInfo: {
      platform: "iOS",
      version: "1.2.3",
      deviceModel: "iPhone 14",
      osVersion: "iOS 16.5",
    },
  },
  {
    rating: 5,
    title: "Perfect for busy professionals",
    comment:
      "As someone who works long hours, this app is a lifesaver. I can book services quickly and the quality of providers is consistently good. The booking process is intuitive.",
    categories: ["Booking Process", "Features", "Overall Experience"],
    ratings: {
      "UI/UX": 5,
      Performance: 4,
      Features: 5,
      "Booking Process": 5,
      Navigation: 4,
    },
    isAnonymous: false,
    status: "APPROVED" as const,
    isPublic: true,
    helpful: 15,
    notHelpful: 0,
    deviceInfo: {
      platform: "Android",
      version: "1.2.3",
      deviceModel: "Google Pixel 7",
      osVersion: "Android 13",
    },
  },
  {
    rating: 3,
    title: "Good but needs improvement",
    comment:
      "The app works but has some bugs. Sometimes notifications don't come through and the search results could be more relevant. Customer support was helpful when I contacted them.",
    categories: ["Performance", "Search", "Customer Support"],
    ratings: {
      "UI/UX": 3,
      Performance: 2,
      Features: 3,
      Search: 2,
      "Customer Support": 4,
    },
    isAnonymous: true,
    status: "APPROVED" as const,
    isPublic: true,
    helpful: 5,
    notHelpful: 3,
    deviceInfo: {
      platform: "iOS",
      version: "1.2.3",
      deviceModel: "iPhone 13",
      osVersion: "iOS 16.2",
    },
  },
  {
    rating: 5,
    title: "Best service booking app!",
    comment:
      "I've tried many similar apps but this one stands out. The user interface is beautiful, everything loads fast, and I've never had a bad experience with any service provider.",
    categories: ["UI/UX", "Performance", "Overall Experience"],
    ratings: {
      "UI/UX": 5,
      Performance: 5,
      Features: 5,
      Navigation: 5,
      "Overall Experience": 5,
    },
    isAnonymous: false,
    status: "APPROVED" as const,
    isPublic: true,
    helpful: 20,
    notHelpful: 1,
    deviceInfo: {
      platform: "Android",
      version: "1.2.3",
      deviceModel: "OnePlus 11",
      osVersion: "Android 13",
    },
  },
  {
    rating: 4,
    title: "Very useful app",
    comment:
      "Great for finding local services. The map integration is helpful and the reviews from other users are reliable. Would like to see more payment options though.",
    categories: ["Features", "Navigation", "Overall Experience"],
    ratings: {
      "UI/UX": 4,
      Performance: 4,
      Features: 4,
      Navigation: 5,
      "Booking Process": 3,
    },
    isAnonymous: false,
    status: "APPROVED" as const,
    isPublic: true,
    helpful: 7,
    notHelpful: 1,
    deviceInfo: {
      platform: "iOS",
      version: "1.2.3",
      deviceModel: "iPhone 12",
      osVersion: "iOS 16.1",
    },
  },
  {
    rating: 2,
    title: "Needs work",
    comment:
      "The app crashes frequently and the search doesn't work well. I had to uninstall and reinstall multiple times. Customer support was slow to respond.",
    categories: ["Performance", "Search", "Customer Support"],
    ratings: {
      "UI/UX": 2,
      Performance: 1,
      Features: 2,
      Search: 1,
      "Customer Support": 2,
    },
    isAnonymous: true,
    status: "PENDING" as const,
    isPublic: true,
    helpful: 2,
    notHelpful: 8,
    deviceInfo: {
      platform: "Android",
      version: "1.2.3",
      deviceModel: "Samsung Galaxy A52",
      osVersion: "Android 12",
    },
  },
  {
    rating: 5,
    title: "Excellent service quality",
    comment:
      "Every service I've booked through this app has been exceptional. The providers are professional, punctual, and deliver great results. The app makes everything so convenient.",
    categories: ["Features", "Overall Experience", "Booking Process"],
    ratings: {
      "UI/UX": 5,
      Performance: 4,
      Features: 5,
      "Booking Process": 5,
      "Overall Experience": 5,
    },
    isAnonymous: false,
    status: "APPROVED" as const,
    isPublic: true,
    helpful: 18,
    notHelpful: 0,
    deviceInfo: {
      platform: "iOS",
      version: "1.2.3",
      deviceModel: "iPhone 15 Pro",
      osVersion: "iOS 17.0",
    },
  },
];

async function seedAppReviews() {
  try {
    console.log("🌱 Starting to seed app reviews...");

    // Get all users to assign reviews to
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true },
    });

    if (users.length === 0) {
      console.log("❌ No users found. Please seed users first.");
      return;
    }

    console.log(`📊 Found ${users.length} users`);

    // Create app reviews
    const createdReviews = [];

    for (let i = 0; i < sampleReviews.length; i++) {
      const reviewData = sampleReviews[i];
      const user = users[i % users.length]; // Cycle through users

      if (!user || !reviewData) {
        console.log(`⚠️ Skipping review ${i} - missing data`);
        continue;
      }

      const review = await prisma.appReview.create({
        data: {
          userId: user.id,
          rating: reviewData.rating,
          title: reviewData.title,
          comment: reviewData.comment,
          categories: reviewData.categories,
          ratings: reviewData.ratings,
          isAnonymous: reviewData.isAnonymous,
          status: reviewData.status,
          isPublic: reviewData.isPublic,
          helpful: reviewData.helpful,
          notHelpful: reviewData.notHelpful,
          deviceInfo: reviewData.deviceInfo,
        },
      });

      createdReviews.push(review);
      console.log(
        `✅ Created app review: "${reviewData.title}" by ${user.name}`
      );
    }

    // Calculate and display statistics
    const totalReviews = createdReviews.length;
    const avgRating =
      createdReviews.reduce((sum, review) => sum + review.rating, 0) /
      totalReviews;
    const approvedReviews = createdReviews.filter(
      (r) => r.status === "APPROVED"
    ).length;
    const pendingReviews = createdReviews.filter(
      (r) => r.status === "PENDING"
    ).length;

    console.log("\n📈 App Review Statistics:");
    console.log(`   Total Reviews: ${totalReviews}`);
    console.log(`   Average Rating: ${avgRating.toFixed(2)}/5`);
    console.log(`   Approved: ${approvedReviews}`);
    console.log(`   Pending: ${pendingReviews}`);
    console.log(
      `   Anonymous: ${createdReviews.filter((r) => r.isAnonymous).length}`
    );

    console.log("\n🎉 App reviews seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding app reviews:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedAppReviews().catch((error) => {
  console.error("💥 Seeding failed:", error);
  process.exit(1);
});
