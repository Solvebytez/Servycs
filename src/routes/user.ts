import { Router } from "express";
import { authenticate } from "@/middleware/auth";
import { validateRequest } from "@/middleware/validateRequest";
import { updateProfileValidation } from "@/validators/userValidators";
import { Request, Response } from "express";
import { prisma } from "@/config/database";
import { UserRole } from "@prisma/client";
import { getUserProfilePicture } from "@/utils/imageUtils";
import { body } from "express-validator";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

const router = Router();

// Get user profile data (role-specific)
router.get(
  "/profile",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;

      console.log("=== GET /users/profile DEBUG ===");
      console.log("User ID:", userId);
      console.log("User Role:", userRole);
      console.log("=== END DEBUG ===");

      // Get basic user data with primary address fields
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          isEmailVerified: true,
          primaryAddress: true,
          primaryCity: true,
          primaryState: true,
          primaryZipCode: true,
          primaryCountry: true,
          bio: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Get user's profile picture
      const profilePicture = await getUserProfilePicture(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Return role-specific profile data
      let profileData: any = {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        isEmailVerified: user.isEmailVerified,
        avatar: profilePicture?.url || null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      // Add role-specific fields
      switch (userRole) {
        case UserRole.USER:
          profileData = {
            ...profileData,
            primaryAddress: user.primaryAddress || "",
            primaryCity: user.primaryCity || "",
            primaryState: user.primaryState || "",
            primaryZipCode: user.primaryZipCode || "",
            primaryCountry: user.primaryCountry || "India",
            bio: user.bio || "",
          };
          break;

        case UserRole.VENDOR:
          // Get vendor business data
          const vendor = await prisma.vendor.findUnique({
            where: { userId: userId },
            select: {
              businessName: true,
              businessDescription: true,
            },
          });

          // Get multiple business addresses through vendor relationship
          const vendorRecord = await prisma.vendor.findUnique({
            where: { userId: userId },
            include: {
              businessAddresses: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                  city: true,
                  state: true,
                  zipCode: true,
                  country: true,
                  description: true,
                },
              },
            },
          });

          const vendorBusinessAddresses = vendorRecord?.businessAddresses || [];

          // Use business addresses from the business_addresses table
          const allBusinessAddresses = vendorBusinessAddresses.map(
            (addr: any) => ({
              id: addr.id,
              name: addr.name,
              address: addr.address,
              city: addr.city,
              state: addr.state,
              zipCode: addr.zipCode,
              country: addr.country,
              description: addr.description,
            })
          );

          profileData = {
            ...profileData,
            businessAddresses: allBusinessAddresses,
          };
          break;

        case UserRole.SALESMAN:
          profileData = {
            ...profileData,
            primaryAddress: user.primaryAddress || "",
            primaryCity: user.primaryCity || "",
            primaryState: user.primaryState || "",
            primaryZipCode: user.primaryZipCode || "",
            primaryCountry: user.primaryCountry || "India",
            employeeId: "EMP001", // TODO: Add employeeId field to User model
            bio: user.bio || "",
          };
          break;

        default:
          break;
      }

      return res.json({
        success: true,
        data: profileData,
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch profile data",
      });
    }
  }
);

// Update user profile data (role-specific)
router.put(
  "/profile",
  authenticate,
  validateRequest,
  updateProfileValidation,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const updateData = req.body;

      console.log("=== PUT /users/profile DEBUG ===");
      console.log("User ID:", userId);
      console.log("User Role:", userRole);
      console.log("Update Data:", updateData);
      console.log("=== END DEBUG ===");

      // Validate that user exists and has email
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true, email: true, phone: true },
      });

      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Validate that current email exists
      if (!existingUser.email) {
        return res.status(400).json({
          success: false,
          message: "User email not found",
        });
      }

      // Prepare update data based on role
      let userUpdateData: any = {};
      let roleSpecificData: any = {};

      // Common fields that all roles can update (NO EMAIL UPDATES)
      if (updateData.name !== undefined) userUpdateData.name = updateData.name;
      if (updateData.phone !== undefined)
        userUpdateData.phone = updateData.phone;

      // Role-specific fields
      switch (userRole) {
        case UserRole.USER:
          // For regular users: primary address fields, bio
          if (updateData.primaryAddress !== undefined)
            userUpdateData.primaryAddress = updateData.primaryAddress;
          if (updateData.primaryCity !== undefined)
            userUpdateData.primaryCity = updateData.primaryCity;
          if (updateData.primaryState !== undefined)
            userUpdateData.primaryState = updateData.primaryState;
          if (updateData.primaryZipCode !== undefined)
            userUpdateData.primaryZipCode = updateData.primaryZipCode;
          if (updateData.primaryCountry !== undefined)
            userUpdateData.primaryCountry = updateData.primaryCountry;
          if (updateData.bio !== undefined) userUpdateData.bio = updateData.bio;
          break;

        case UserRole.VENDOR:
          // For vendors: business fields (no address fields - use BusinessAddress table)
          if (updateData.businessName !== undefined)
            roleSpecificData.businessName = updateData.businessName;
          if (updateData.businessDescription !== undefined)
            roleSpecificData.businessDescription =
              updateData.businessDescription;
          break;

        case UserRole.SALESMAN:
          // For salesmen: primary address fields, employeeId, bio
          if (updateData.primaryAddress !== undefined)
            userUpdateData.primaryAddress = updateData.primaryAddress;
          if (updateData.primaryCity !== undefined)
            userUpdateData.primaryCity = updateData.primaryCity;
          if (updateData.primaryState !== undefined)
            userUpdateData.primaryState = updateData.primaryState;
          if (updateData.primaryZipCode !== undefined)
            userUpdateData.primaryZipCode = updateData.primaryZipCode;
          if (updateData.primaryCountry !== undefined)
            userUpdateData.primaryCountry = updateData.primaryCountry;
          if (updateData.employeeId !== undefined)
            roleSpecificData.employeeId = updateData.employeeId;
          if (updateData.bio !== undefined) userUpdateData.bio = updateData.bio;
          break;

        default:
          break;
      }

      // Update user basic data
      if (Object.keys(userUpdateData).length > 0) {
        await prisma.user.update({
          where: { id: userId },
          data: userUpdateData,
        });
      }

      // Handle business addresses for VENDOR (regardless of roleSpecificData)
      if (
        userRole === UserRole.VENDOR &&
        updateData.businessAddresses &&
        Array.isArray(updateData.businessAddresses)
      ) {
        // First, ensure vendor record exists
        const vendorRecord = await prisma.vendor.upsert({
          where: { userId: userId },
          update: {},
          create: {
            userId: userId,
            businessName: "My Business",
            businessEmail: existingUser.email || "",
            businessPhone: existingUser.phone || "",
            businessDescription: "",
          },
        });

        // Add new business addresses (don't delete existing ones)
        if (
          updateData.businessAddresses &&
          Array.isArray(updateData.businessAddresses)
        ) {
          await (prisma as any).businessAddress.createMany({
            data: updateData.businessAddresses.map((addr: any) => ({
              vendorId: vendorRecord.id, // Use vendor's ID, not user's ID
              name: addr.name || "Business Address",
              address: addr.address || "",
              city: addr.city || "",
              state: addr.state || "",
              zipCode: addr.zipCode || "",
              country: addr.country || "India",
              description: addr.description || "",
            })),
          });
        }
      }

      // Update role-specific data
      if (Object.keys(roleSpecificData).length > 0) {
        switch (userRole) {
          case UserRole.VENDOR:
            // Update or create vendor record
            await prisma.vendor.upsert({
              where: { userId: userId },
              update: roleSpecificData,
              create: {
                userId: userId,
                businessName: roleSpecificData.businessName || "My Business",
                businessEmail: existingUser.email || "",
                businessPhone: existingUser.phone || "",
                businessDescription: roleSpecificData.businessDescription || "",
              },
            });
            break;

          case UserRole.SALESMAN:
            // TODO: Update salesman record when employeeId field is added
            console.log("Salesman role-specific data:", roleSpecificData);
            break;

          default:
            break;
        }
      }

      // Get updated user data with primary address fields
      const updatedUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          isEmailVerified: true,
          primaryAddress: true,
          primaryCity: true,
          primaryState: true,
          primaryZipCode: true,
          primaryCountry: true,
          bio: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Get user's profile picture (same as GET endpoint)
      const profilePicture = await getUserProfilePicture(userId);

      // Return updated profile data (same structure as GET endpoint)
      let profileData: any = {
        id: updatedUser!.id,
        name: updatedUser!.name,
        username: updatedUser!.username,
        email: updatedUser!.email,
        phone: updatedUser!.phone,
        role: updatedUser!.role,
        status: updatedUser!.status,
        isEmailVerified: updatedUser!.isEmailVerified,
        avatar: profilePicture?.url || null,
        createdAt: updatedUser!.createdAt,
        updatedAt: updatedUser!.updatedAt,
      };

      // Add role-specific fields (same logic as GET endpoint)
      switch (userRole) {
        case UserRole.USER:
          profileData = {
            ...profileData,
            primaryAddress: updatedUser!.primaryAddress || "",
            primaryCity: updatedUser!.primaryCity || "",
            primaryState: updatedUser!.primaryState || "",
            primaryZipCode: updatedUser!.primaryZipCode || "",
            primaryCountry: updatedUser!.primaryCountry || "India",
            bio: updatedUser!.bio || "",
          };
          break;

        case UserRole.VENDOR:
          // Get updated vendor data
          const updatedVendor = await prisma.vendor.findUnique({
            where: { userId: userId },
            select: {
              businessName: true,
              businessDescription: true,
            },
          });

          // Get multiple business addresses through vendor relationship
          const vendorRecord = await prisma.vendor.findUnique({
            where: { userId: userId },
            include: {
              businessAddresses: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                  city: true,
                  state: true,
                  zipCode: true,
                  country: true,
                  description: true,
                },
              },
            },
          });

          const businessAddresses = vendorRecord?.businessAddresses || [];

          // Use business addresses from the business_addresses table
          const allBusinessAddresses = businessAddresses.map((addr: any) => ({
            id: addr.id,
            name: addr.name,
            address: addr.address,
            city: addr.city,
            state: addr.state,
            zipCode: addr.zipCode,
            country: addr.country,
            description: addr.description,
          }));

          profileData = {
            ...profileData,
            businessAddresses: allBusinessAddresses,
          };
          break;

        case UserRole.SALESMAN:
          profileData = {
            ...profileData,
            primaryAddress: updatedUser!.primaryAddress || "",
            primaryCity: updatedUser!.primaryCity || "",
            primaryState: updatedUser!.primaryState || "",
            primaryZipCode: updatedUser!.primaryZipCode || "",
            primaryCountry: updatedUser!.primaryCountry || "India",
            employeeId: roleSpecificData.employeeId || "EMP001",
            bio: updatedUser!.bio || "",
          };
          break;

        default:
          break;
      }

      return res.json({
        success: true,
        message: "Profile updated successfully",
        data: profileData,
      });
    } catch (error) {
      console.error("Error updating user profile:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update profile data",
      });
    }
  }
);

// Switch user role
router.post(
  "/switch-role",
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const { role } = req.body;
      const userId = (req as any).user.id;

      // Validate role
      if (
        !role ||
        !["USER", "VENDOR", "SALESMAN"].includes(role.toUpperCase())
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid role. Must be USER, VENDOR, or SALESMAN",
        });
      }

      const newRole = role.toUpperCase() as UserRole;

      // Import required utilities
      const { generateSessionId, generateAccessToken } = await import(
        "@/utils/jwt"
      );
      const { blacklistAllUserTokens } = await import("@/utils/blacklistToken");

      // Generate new session ID for role switch (maintains single device login)
      const newSessionId = generateSessionId();

      // Update user role and session ID
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          role: newRole,
          currentSessionId: newSessionId,
        },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          role: true,
          status: true,
          isEmailVerified: true,
          currentSessionId: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Create role-specific records if they don't exist
      if (newRole === "VENDOR") {
        const existingVendor = await prisma.vendor.findUnique({
          where: { userId: userId },
        });

        if (!existingVendor) {
          await prisma.vendor.create({
            data: {
              userId: userId,
              businessName: `${updatedUser.name}'s Business`,
              businessEmail: updatedUser.email,
              businessPhone: "",
              businessDescription: "",
              businessLicense: null,
              businessInsurance: null,
              businessCertifications: [],
            },
          });
          console.log(`Created vendor record for user ${userId}`);
        }
      } else if (newRole === "SALESMAN") {
        const existingSalesman = await prisma.salesman.findUnique({
          where: { userId: userId },
        });

        if (!existingSalesman) {
          await prisma.salesman.create({
            data: {
              userId: userId,
              territory: "General",
            },
          });
          console.log(`Created salesman record for user ${userId}`);
        }
      }

      // Blacklist all existing tokens for this user (single device login)
      await blacklistAllUserTokens(userId);

      // Generate new access token with new session ID
      const newAccessToken = generateAccessToken({
        userId: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        sessionId: newSessionId,
      });

      return res.json({
        success: true,
        message: `Role switched to ${newRole} successfully`,
        data: {
          user: updatedUser,
          accessToken: newAccessToken,
        },
      });
    } catch (error) {
      console.error("Role switch error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to switch role",
      });
    }
  }
);

// GET /users/business-addresses - Get all business addresses for current vendor
router.get(
  "/business-addresses",
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;

      console.log("=== GET BUSINESS ADDRESSES DEBUG ===");
      console.log("User ID:", userId);
      console.log("User Role:", userRole);
      console.log("=== END DEBUG ===");

      // Only vendors can have business addresses
      if (userRole !== "VENDOR") {
        return res.status(403).json({
          success: false,
          message: "Only vendors can have business addresses",
        });
      }

      // Get the vendor record for this user
      const vendor = await prisma.vendor.findUnique({
        where: { userId: userId },
        include: {
          businessAddresses: {
            select: {
              id: true,
              name: true,
              address: true,
              city: true,
              state: true,
              zipCode: true,
              country: true,
              description: true,
              createdAt: true,
              updatedAt: true,
            },
            orderBy: [
              { createdAt: "asc" }, // Order by creation date
            ],
          },
        },
      });

      if (!vendor) {
        return res.status(404).json({
          success: false,
          message: "Vendor record not found",
        });
      }

      const businessAddresses = vendor.businessAddresses || [];

      return res.json({
        success: true,
        data: businessAddresses,
        message: "Business addresses retrieved successfully",
      });
    } catch (error) {
      console.error("Error fetching business addresses:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch business addresses",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      });
    }
  }
);

// POST /users/business-addresses - Create new business address
router.post(
  "/business-addresses",
  authenticate,
  validateRequest,
  [
    body("name")
      .notEmpty()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage(
        "Address type is required and must be between 2 and 50 characters"
      ),
    body("address")
      .notEmpty()
      .trim()
      .isLength({ min: 1, max: 500 })
      .withMessage(
        "Address is required and must be between 1 and 500 characters"
      ),
    body("city")
      .notEmpty()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("City is required and must be between 1 and 100 characters"),
    body("state")
      .notEmpty()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage(
        "State is required and must be between 1 and 100 characters"
      ),
    body("zipCode")
      .optional()
      .trim()
      .custom((value) => {
        if (!value) return true; // Optional field
        // Indian zip codes are 6 digits, starting with 1-9
        const zipCodeRegex = /^[1-9][0-9]{5}$/;
        if (!zipCodeRegex.test(value)) {
          throw new Error("Please enter a valid Indian zip code (6 digits)");
        }
        return true;
      }),
    body("country")
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("Country must be between 1 and 100 characters"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Description must not exceed 1000 characters"),
  ],
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;
      const addressData = req.body;

      console.log("=== CREATE BUSINESS ADDRESS DEBUG ===");
      console.log("User ID:", userId);
      console.log("User Role:", userRole);
      console.log("Address Data:", addressData);
      console.log("=== END DEBUG ===");

      // Only vendors can create business addresses
      if (userRole !== "VENDOR") {
        return res.status(403).json({
          success: false,
          message: "Only vendors can create business addresses",
        });
      }

      // Get the vendor record for this user
      const vendor = await prisma.vendor.findUnique({
        where: { userId: userId },
      });

      if (!vendor) {
        return res.status(404).json({
          success: false,
          message: "Vendor record not found",
        });
      }

      // Create the new business address
      const newAddress = await prisma.businessAddress.create({
        data: {
          vendorId: vendor.id,
          name: addressData.name,
          address: addressData.address,
          city: addressData.city,
          state: addressData.state,
          zipCode: addressData.zipCode || null,
          country: addressData.country || "India",
          description: addressData.description || null,
        },
        select: {
          id: true,
          name: true,
          address: true,
          city: true,
          state: true,
          zipCode: true,
          country: true,
          description: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      console.log("Created address:", newAddress);

      return res.status(201).json({
        success: true,
        message: "Business address created successfully",
        data: newAddress,
      });
    } catch (error) {
      console.error("Error creating business address:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create business address",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      });
    }
  }
);

// PUT /users/business-addresses/:addressId - Update individual business address
router.put(
  "/business-addresses/:addressId",
  authenticate,
  validateRequest,
  [
    body("name")
      .notEmpty()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage(
        "Address type is required and must be between 2 and 50 characters"
      ),
    body("address")
      .optional()
      .trim()
      .isLength({ min: 1, max: 500 })
      .withMessage("Address must be between 1 and 500 characters"),
    body("city")
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("City must be between 1 and 100 characters"),
    body("state")
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("State must be between 1 and 100 characters"),
    body("zipCode")
      .optional()
      .trim()
      .custom((value) => {
        if (!value) return true; // Optional field
        // Indian zip codes are 6 digits, starting with 1-9
        const zipCodeRegex = /^[1-9][0-9]{5}$/;
        if (!zipCodeRegex.test(value)) {
          throw new Error("Please enter a valid Indian zip code (6 digits)");
        }
        return true;
      }),
    body("country")
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("Country must be between 1 and 100 characters"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Description must not exceed 1000 characters"),
  ],
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { addressId } = req.params;
      const updateData = req.body;

      console.log("=== UPDATE BUSINESS ADDRESS DEBUG ===");
      console.log("User ID:", userId);
      console.log("Address ID:", addressId);
      console.log("Update Data:", updateData);
      console.log("=== END DEBUG ===");

      // First, get the vendor record for this user
      const vendor = await prisma.vendor.findUnique({
        where: { userId: userId },
      });

      if (!vendor) {
        return res.status(404).json({
          success: false,
          message: "Vendor record not found",
        });
      }

      // Verify the address belongs to the vendor
      const existingAddress = await prisma.businessAddress.findFirst({
        where: {
          id: addressId,
          vendorId: vendor.id,
        },
      });

      if (!existingAddress) {
        return res.status(404).json({
          success: false,
          message:
            "Address not found or you don't have permission to update it",
        });
      }

      // Update the address (exclude id and other non-updatable fields)
      const { id, createdAt, ...allowedUpdateData } = updateData;
      const updatedAddress = await prisma.businessAddress.update({
        where: {
          id: addressId,
        },
        data: {
          ...allowedUpdateData,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          name: true,
          address: true,
          city: true,
          state: true,
          zipCode: true,
          country: true,
          description: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      console.log("Updated address:", updatedAddress);

      return res.json({
        success: true,
        message: "Address updated successfully",
        data: updatedAddress,
      });
    } catch (error) {
      console.error("Error updating business address:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update address",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      });
    }
  }
);

// DELETE /users/business-addresses/:addressId - Delete individual business address
router.delete(
  "/business-addresses/:addressId",
  authenticate,
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { addressId } = req.params;

      console.log("=== DELETE BUSINESS ADDRESS DEBUG ===");
      console.log("User ID:", userId);
      console.log("Address ID:", addressId);
      console.log("=== END DEBUG ===");

      // First, get the vendor record for this user
      const vendor = await prisma.vendor.findUnique({
        where: { userId: userId },
      });

      if (!vendor) {
        return res.status(404).json({
          success: false,
          message: "Vendor record not found",
        });
      }

      // Verify the address belongs to the vendor
      const existingAddress = await prisma.businessAddress.findFirst({
        where: {
          id: addressId,
          vendorId: vendor.id,
        },
      });

      if (!existingAddress) {
        return res.status(404).json({
          success: false,
          message:
            "Address not found or you don't have permission to delete it",
        });
      }

      // Delete the address
      await prisma.businessAddress.delete({
        where: {
          id: addressId,
        },
      });

      console.log("Address deleted successfully");

      return res.json({
        success: true,
        message: "Address deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting business address:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete address",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      });
    }
  }
);

// Import user favorites controller and validators
import {
  getUserFavorites,
  addToFavorites,
  removeFromFavorites,
  checkFavoriteStatus,
} from "@/controllers/userFavoritesController";
import {
  getUserFavoritesValidation,
  addToFavoritesValidation,
  removeFromFavoritesValidation,
  checkFavoriteStatusValidation,
} from "@/validators/userFavoritesValidators";

// GET /users/:userId/favorites - Get user's favorite service listings
router.get(
  "/:userId/favorites",
  authenticate,
  validateRequest,
  getUserFavoritesValidation,
  async (req: Request, res: Response) => {
    // Check if user is accessing their own favorites or is admin
    const authenticatedUserId = (req as any).user.id;
    const requestedUserId = req.params.userId;
    const userRole = (req as any).user.role;

    if (authenticatedUserId !== requestedUserId && userRole !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "You can only access your own favorites",
      });
    }

    // Call the controller
    return getUserFavorites(req as any, res);
  }
);

// POST /users/:userId/favorites/:serviceId - Add service to favorites
router.post(
  "/:userId/favorites/:serviceId",
  authenticate,
  validateRequest,
  addToFavoritesValidation,
  async (req: Request, res: Response) => {
    // Check if user is adding to their own favorites or is admin
    const authenticatedUserId = (req as any).user.id;
    const requestedUserId = req.params.userId;
    const userRole = (req as any).user.role;

    if (authenticatedUserId !== requestedUserId && userRole !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "You can only add to your own favorites",
      });
    }

    // Call the controller
    return addToFavorites(req as any, res);
  }
);

// DELETE /users/:userId/favorites/:serviceId - Remove service from favorites
router.delete(
  "/:userId/favorites/:serviceId",
  authenticate,
  validateRequest,
  removeFromFavoritesValidation,
  async (req: Request, res: Response) => {
    // Check if user is removing from their own favorites or is admin
    const authenticatedUserId = (req as any).user.id;
    const requestedUserId = req.params.userId;
    const userRole = (req as any).user.role;

    if (authenticatedUserId !== requestedUserId && userRole !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "You can only remove from your own favorites",
      });
    }

    // Call the controller
    return removeFromFavorites(req as any, res);
  }
);

// GET /users/:userId/favorites/:serviceId/status - Check if service is in favorites
router.get(
  "/:userId/favorites/:serviceId/status",
  authenticate,
  validateRequest,
  checkFavoriteStatusValidation,
  async (req: Request, res: Response) => {
    // Check if user is checking their own favorites or is admin
    const authenticatedUserId = (req as any).user.id;
    const requestedUserId = req.params.userId;
    const userRole = (req as any).user.role;

    if (authenticatedUserId !== requestedUserId && userRole !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "You can only check your own favorites",
      });
    }

    // Call the controller
    return checkFavoriteStatus(req as any, res);
  }
);

export default router;
