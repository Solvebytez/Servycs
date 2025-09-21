import { Router } from "express";
import { authenticate } from "@/middleware/auth";
import {
  uploadSingle,
  uploadMultiple,
  uploadToCloudinary,
  deleteFromCloudinary,
  extractPublicId,
} from "@/utils/upload";
import {
  createImage,
  deactivateImage,
  getUserProfilePicture,
} from "@/utils/imageUtils";
import { ImageType } from "@prisma/client";
import { Request, Response } from "express";
import { prisma } from "@/config/database";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

const router = Router();

// Profile picture upload endpoint
router.post(
  "/profile-picture",
  authenticate,
  uploadSingle,
  async (req: AuthenticatedRequest, res: Response) => {
    console.log("=== PROFILE PICTURE UPLOAD START ===");
    console.log("Request headers:", JSON.stringify(req.headers, null, 2));
    console.log("Request body keys:", Object.keys(req.body || {}));
    console.log(
      "Request file:",
      req.file
        ? {
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            destination: req.file.destination,
            filename: req.file.filename,
          }
        : "No file"
    );

    try {
      const userId = req.user!.id;
      console.log("User ID:", userId);
      console.log("User data:", req.user);

      if (!req.file) {
        console.log("❌ No file uploaded");
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      console.log("✅ File received, uploading to Cloudinary...");
      // Upload to Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(
        req.file,
        "listro/profile-pictures"
      );
      console.log("✅ Cloudinary upload successful:", cloudinaryUrl);

      // Get image dimensions (optional) - multer doesn't provide dimensions
      const imageInfo = {
        width: undefined,
        height: undefined,
      };

      console.log("Checking for existing profile picture...");
      // Delete old profile picture record and file
      const oldProfilePicture = await getUserProfilePicture(userId);
      if (oldProfilePicture) {
        console.log("Found existing profile picture:", oldProfilePicture.id);
        // Delete old image from Cloudinary (only if it's a Cloudinary URL)
        if (oldProfilePicture.url.includes("cloudinary.com")) {
          try {
            const publicId = extractPublicId(oldProfilePicture.url);
            console.log(
              "Deleting old image from Cloudinary, publicId:",
              publicId
            );
            await deleteFromCloudinary(publicId);
            console.log("✅ Successfully deleted old image from Cloudinary");
          } catch (error) {
            console.error(
              "❌ Failed to delete old image from Cloudinary:",
              error
            );
            // Continue even if deletion fails
          }
        }

        // Delete the old profile picture record from database
        console.log("Deleting old profile picture record from database...");
        await prisma.image.delete({
          where: { id: oldProfilePicture.id },
        });
        console.log("✅ Old profile picture record deleted");
      } else {
        console.log("No existing profile picture found");
      }

      console.log("Creating new image record...");
      // Create new image record
      const newImage = await createImage({
        url: cloudinaryUrl,
        filename: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        width: imageInfo.width,
        height: imageInfo.height,
        type: ImageType.PROFILE_PICTURE,
        entityType: "User",
        entityId: userId,
        altText: `Profile picture for user ${userId}`,
        uploadedBy: userId,
      });
      console.log("✅ New image record created:", newImage.id);

      const responseData = {
        success: true,
        message: "Profile picture uploaded successfully",
        data: {
          imageId: newImage.id,
          url: cloudinaryUrl,
          filename: req.file.originalname,
          size: req.file.size,
          width: imageInfo.width,
          height: imageInfo.height,
        },
      };

      console.log("=== PROFILE PICTURE UPLOAD SUCCESS ===");
      console.log("Response data:", JSON.stringify(responseData, null, 2));

      return res.status(200).json(responseData);
    } catch (error) {
      console.error("=== PROFILE PICTURE UPLOAD ERROR ===");
      console.error("Error details:", error);
      console.error(
        "Error message:",
        error instanceof Error ? error.message : "Unknown error"
      );
      console.error(
        "Error stack:",
        error instanceof Error ? error.stack : "No stack trace"
      );

      return res.status(500).json({
        success: false,
        message: "Failed to upload profile picture",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

// Get current profile picture endpoint
router.get(
  "/profile-picture",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    console.log("=== GET PROFILE PICTURE START ===");
    console.log("User ID:", req.user?.id);
    console.log("User data:", req.user);

    try {
      const userId = req.user!.id;

      console.log("Fetching profile picture for user:", userId);
      const profilePicture = await getUserProfilePicture(userId);

      if (!profilePicture) {
        console.log("❌ No profile picture found for user:", userId);
        return res.status(404).json({
          success: false,
          message: "No profile picture found",
        });
      }

      console.log("✅ Profile picture found:", profilePicture.id);
      const responseData = {
        success: true,
        message: "Profile picture retrieved successfully",
        data: {
          imageId: profilePicture.id,
          url: profilePicture.url,
          filename: profilePicture.filename,
          size: profilePicture.size,
          width: profilePicture.width,
          height: profilePicture.height,
          uploadedAt: profilePicture.createdAt,
        },
      };

      console.log("=== GET PROFILE PICTURE SUCCESS ===");
      console.log("Response data:", JSON.stringify(responseData, null, 2));

      return res.status(200).json(responseData);
    } catch (error) {
      console.error("=== GET PROFILE PICTURE ERROR ===");
      console.error("Error details:", error);
      console.error(
        "Error message:",
        error instanceof Error ? error.message : "Unknown error"
      );
      console.error(
        "Error stack:",
        error instanceof Error ? error.stack : "No stack trace"
      );

      return res.status(500).json({
        success: false,
        message: "Failed to retrieve profile picture",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

// Delete profile picture endpoint
router.delete(
  "/profile-picture",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;

      const profilePicture = await getUserProfilePicture(userId);

      if (!profilePicture) {
        return res.status(404).json({
          success: false,
          message: "No profile picture found to delete",
        });
      }

      // Deactivate the image record
      await deactivateImage(profilePicture.id);

      // Delete from Cloudinary
      try {
        const publicId = extractPublicId(profilePicture.url);
        await deleteFromCloudinary(publicId);
      } catch (error) {
        console.error("Failed to delete image from Cloudinary:", error);
        // Continue even if Cloudinary deletion fails
      }

      return res.status(200).json({
        success: true,
        message: "Profile picture deleted successfully",
      });
    } catch (error) {
      console.error("Delete profile picture error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete profile picture",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

// Promotion banner image upload endpoint
router.post(
  "/promotion-banner",
  authenticate,
  uploadSingle,
  async (req: AuthenticatedRequest, res: Response) => {
    console.log("=== PROMOTION BANNER UPLOAD START ===");
    console.log("Request headers:", JSON.stringify(req.headers, null, 2));
    console.log("Request body keys:", Object.keys(req.body || {}));
    console.log(
      "Request file:",
      req.file
        ? {
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            destination: req.file.destination,
            filename: req.file.filename,
          }
        : "No file"
    );

    try {
      const userId = req.user!.id;
      console.log("User ID:", userId);
      console.log("User data:", req.user);

      if (!req.file) {
        console.log("❌ No file uploaded");
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      console.log("✅ File received, uploading to Cloudinary...");
      // Upload to Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(
        req.file,
        "listro/promotion-banners"
      );
      console.log("✅ Cloudinary upload successful:", cloudinaryUrl);

      // Get image dimensions (optional)
      const imageInfo = {
        width: undefined,
        height: undefined,
      };

      console.log("Creating new image record...");
      // Create new image record
      const newImage = await createImage({
        url: cloudinaryUrl,
        filename: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        width: imageInfo.width,
        height: imageInfo.height,
        type: ImageType.SERVICE_PICTURE, // Using SERVICE_PICTURE type for now
        entityType: "Promotion",
        entityId: userId, // Will be updated when promotion is created
        altText: `Promotion banner uploaded by user ${userId}`,
        uploadedBy: userId,
      });
      console.log("✅ New image record created:", newImage.id);

      const responseData = {
        success: true,
        message: "Promotion banner uploaded successfully",
        data: {
          imageId: newImage.id,
          imageUrl: cloudinaryUrl,
          filename: req.file.originalname,
          size: req.file.size,
          width: imageInfo.width,
          height: imageInfo.height,
        },
      };

      console.log("=== PROMOTION BANNER UPLOAD SUCCESS ===");
      console.log("Response data:", JSON.stringify(responseData, null, 2));

      return res.status(200).json(responseData);
    } catch (error) {
      console.error("=== PROMOTION BANNER UPLOAD ERROR ===");
      console.error("Error details:", error);
      console.error(
        "Error message:",
        error instanceof Error ? error.message : "Unknown error"
      );
      console.error(
        "Error stack:",
        error instanceof Error ? error.stack : "No stack trace"
      );

      return res.status(500).json({
        success: false,
        message: "Failed to upload promotion banner",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

// Service image upload endpoint
router.post(
  "/service-image",
  authenticate,
  uploadSingle,
  async (req: AuthenticatedRequest, res: Response) => {
    console.log("=== SERVICE IMAGE UPLOAD START ===");
    console.log("Request headers:", JSON.stringify(req.headers, null, 2));
    console.log("Request body keys:", Object.keys(req.body || {}));
    console.log(
      "Request file:",
      req.file
        ? {
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            destination: req.file.destination,
            filename: req.file.filename,
          }
        : "No file"
    );

    try {
      const userId = req.user!.id;
      console.log("User ID:", userId);
      console.log("User data:", req.user);

      if (!req.file) {
        console.log("❌ No file uploaded");
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      console.log("✅ File received, uploading to Cloudinary...");
      // Upload to Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(
        req.file,
        "listro/service-images"
      );
      console.log("✅ Cloudinary upload successful:", cloudinaryUrl);

      // Get image dimensions (optional)
      const imageInfo = {
        width: undefined,
        height: undefined,
      };

      console.log("Creating new image record...");
      // Create new image record
      const newImage = await createImage({
        url: cloudinaryUrl,
        filename: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        width: imageInfo.width,
        height: imageInfo.height,
        type: ImageType.SERVICE_PICTURE,
        entityType: "ServiceListing",
        entityId: userId, // Will be updated when service listing is created
        altText: `Service image uploaded by user ${userId}`,
        uploadedBy: userId,
      });
      console.log("✅ New image record created:", newImage.id);

      const responseData = {
        success: true,
        message: "Service image uploaded successfully",
        data: {
          imageId: newImage.id,
          imageUrl: cloudinaryUrl,
          filename: req.file.originalname,
          size: req.file.size,
          width: imageInfo.width,
          height: imageInfo.height,
        },
      };

      console.log("=== SERVICE IMAGE UPLOAD SUCCESS ===");
      console.log("Response data:", JSON.stringify(responseData, null, 2));

      return res.status(200).json(responseData);
    } catch (error) {
      console.error("=== SERVICE IMAGE UPLOAD ERROR ===");
      console.error("Error details:", error);
      console.error(
        "Error message:",
        error instanceof Error ? error.message : "Unknown error"
      );
      console.error(
        "Error stack:",
        error instanceof Error ? error.stack : "No stack trace"
      );

      return res.status(500).json({
        success: false,
        message: "Failed to upload service image",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

// Single file upload endpoint
router.post("/single", authenticate, uploadSingle, (req, res) => {
  res.json({ message: "Single file upload route - to be implemented" });
});

// Multiple files upload endpoint
router.post("/multiple", authenticate, uploadMultiple, (req, res) => {
  res.json({ message: "Multiple files upload route - to be implemented" });
});

export default router;
