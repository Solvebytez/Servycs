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
    try {
      const userId = req.user!.id;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      // Upload to Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(
        req.file,
        "listro/profile-pictures"
      );

      // Get image dimensions (optional) - multer doesn't provide dimensions
      const imageInfo = {
        width: undefined,
        height: undefined,
      };

      // Delete old profile picture record and file
      const oldProfilePicture = await getUserProfilePicture(userId);
      if (oldProfilePicture) {
        // Delete old image from Cloudinary (only if it's a Cloudinary URL)
        if (oldProfilePicture.url.includes("cloudinary.com")) {
          try {
            const publicId = extractPublicId(oldProfilePicture.url);
            await deleteFromCloudinary(publicId);
            console.log("Successfully deleted old image from Cloudinary");
          } catch (error) {
            console.error("Failed to delete old image from Cloudinary:", error);
            // Continue even if deletion fails
          }
        }

        // Delete the old profile picture record from database
        await prisma.image.delete({
          where: { id: oldProfilePicture.id },
        });
      }

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
      return res.status(200).json({
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
      });
    } catch (error) {
      console.error("Profile picture upload error:", error);
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
    try {
      const userId = req.user!.id;

      const profilePicture = await getUserProfilePicture(userId);

      if (!profilePicture) {
        return res.status(404).json({
          success: false,
          message: "No profile picture found",
        });
      }

      return res.status(200).json({
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
      });
    } catch (error) {
      console.error("Get profile picture error:", error);
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

// Single file upload endpoint
router.post("/single", authenticate, uploadSingle, (req, res) => {
  res.json({ message: "Single file upload route - to be implemented" });
});

// Multiple files upload endpoint
router.post("/multiple", authenticate, uploadMultiple, (req, res) => {
  res.json({ message: "Multiple files upload route - to be implemented" });
});

export default router;
