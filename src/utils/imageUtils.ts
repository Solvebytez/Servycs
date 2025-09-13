import { prisma } from "@/config/database";
import { ImageType } from "@prisma/client";

export interface ImageUploadData {
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  type: ImageType;
  entityType: string;
  entityId: string;
  altText?: string;
  uploadedBy: string;
}

export interface ImageQueryOptions {
  entityType?: string;
  entityId?: string;
  type?: ImageType;
  isActive?: boolean;
  uploadedBy?: string;
}

/**
 * Create a new image record
 */
export const createImage = async (imageData: ImageUploadData) => {
  return await prisma.image.create({
    data: imageData,
    include: {
      uploader: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

/**
 * Get images by query options
 */
export const getImages = async (options: ImageQueryOptions = {}) => {
  return await prisma.image.findMany({
    where: {
      ...(options.entityType && { entityType: options.entityType }),
      ...(options.entityId && { entityId: options.entityId }),
      ...(options.type && { type: options.type }),
      ...(options.isActive !== undefined && { isActive: options.isActive }),
      ...(options.uploadedBy && { uploadedBy: options.uploadedBy }),
    },
    include: {
      uploader: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

/**
 * Get a single image by ID
 */
export const getImageById = async (imageId: string) => {
  return await prisma.image.findUnique({
    where: { id: imageId },
    include: {
      uploader: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

/**
 * Update an image record
 */
export const updateImage = async (
  imageId: string,
  updateData: Partial<ImageUploadData>
) => {
  return await prisma.image.update({
    where: { id: imageId },
    data: {
      ...updateData,
      updatedAt: new Date(),
    },
    include: {
      uploader: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

/**
 * Soft delete an image (set isActive to false)
 */
export const deactivateImage = async (imageId: string) => {
  return await prisma.image.update({
    where: { id: imageId },
    data: {
      isActive: false,
      updatedAt: new Date(),
    },
  });
};

/**
 * Hard delete an image
 */
export const deleteImage = async (imageId: string) => {
  return await prisma.image.delete({
    where: { id: imageId },
  });
};

/**
 * Get user's profile picture
 */
export const getUserProfilePicture = async (userId: string) => {
  return await prisma.image.findFirst({
    where: {
      entityType: "User",
      entityId: userId,
      type: ImageType.PROFILE_PICTURE,
      isActive: true,
    },
    include: {
      uploader: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

/**
 * Get all service images
 */
export const getServiceImages = async (serviceId: string) => {
  return await prisma.image.findMany({
    where: {
      entityType: "Service",
      entityId: serviceId,
      type: ImageType.SERVICE_PICTURE,
      isActive: true,
    },
    include: {
      uploader: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
};

/**
 * Get vendor's business logo
 */
export const getVendorBusinessLogo = async (vendorId: string) => {
  return await prisma.image.findFirst({
    where: {
      entityType: "Vendor",
      entityId: vendorId,
      type: ImageType.BUSINESS_LOGO,
      isActive: true,
    },
    include: {
      uploader: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

/**
 * Get vendor's business cover image
 */
export const getVendorBusinessCover = async (vendorId: string) => {
  return await prisma.image.findFirst({
    where: {
      entityType: "Vendor",
      entityId: vendorId,
      type: ImageType.BUSINESS_COVER,
      isActive: true,
    },
    include: {
      uploader: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

/**
 * Get all vendor images (logo, cover, gallery)
 */
export const getVendorImages = async (vendorId: string) => {
  return await prisma.image.findMany({
    where: {
      entityType: "Vendor",
      entityId: vendorId,
      type: {
        in: [
          ImageType.BUSINESS_LOGO,
          ImageType.BUSINESS_COVER,
          ImageType.GALLERY_IMAGE,
        ],
      },
      isActive: true,
    },
    include: {
      uploader: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: [{ type: "asc" }, { createdAt: "asc" }],
  });
};

/**
 * Get promotion images
 */
export const getPromotionImages = async (promotionId: string) => {
  return await prisma.image.findMany({
    where: {
      entityType: "Promotion",
      entityId: promotionId,
      type: ImageType.PROMOTION_PICTURE,
      isActive: true,
    },
    include: {
      uploader: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
};

/**
 * Get images by multiple entity IDs
 */
export const getImagesByEntityIds = async (
  entityType: string,
  entityIds: string[],
  imageType?: ImageType
) => {
  return await prisma.image.findMany({
    where: {
      entityType,
      entityId: { in: entityIds },
      ...(imageType && { type: imageType }),
      isActive: true,
    },
    include: {
      uploader: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

/**
 * Count images by entity
 */
export const countImagesByEntity = async (
  entityType: string,
  entityId: string
) => {
  return await prisma.image.count({
    where: {
      entityType,
      entityId,
      isActive: true,
    },
  });
};

/**
 * Get orphaned images (images without valid entities)
 */
export const getOrphanedImages = async () => {
  // This would need to be implemented based on your specific needs
  // For now, return images that are inactive for more than 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return await prisma.image.findMany({
    where: {
      isActive: false,
      updatedAt: {
        lt: thirtyDaysAgo,
      },
    },
  });
};

/**
 * Clean up orphaned images
 */
export const cleanupOrphanedImages = async () => {
  const orphanedImages = await getOrphanedImages();

  if (orphanedImages.length > 0) {
    const deletedImages = await prisma.image.deleteMany({
      where: {
        id: {
          in: orphanedImages.map((img) => img.id),
        },
      },
    });

    return deletedImages.count;
  }

  return 0;
};

/**
 * Validate image type for entity
 */
export const isValidImageTypeForEntity = (
  entityType: string,
  imageType: ImageType
): boolean => {
  const validCombinations: Record<string, ImageType[]> = {
    User: [ImageType.PROFILE_PICTURE],
    Service: [ImageType.SERVICE_PICTURE, ImageType.COVER_PICTURE],
    Vendor: [
      ImageType.BUSINESS_LOGO,
      ImageType.BUSINESS_COVER,
      ImageType.GALLERY_IMAGE,
    ],
    Promotion: [ImageType.PROMOTION_PICTURE, ImageType.BANNER_IMAGE],
    System: [ImageType.BANNER_IMAGE, ImageType.ICON_IMAGE],
  };

  return validCombinations[entityType]?.includes(imageType) || false;
};

/**
 * Get image statistics
 */
export const getImageStats = async () => {
  const [totalImages, activeImages, imagesByType] = await Promise.all([
    prisma.image.count(),
    prisma.image.count({ where: { isActive: true } }),
    prisma.image.groupBy({
      by: ["type"],
      _count: {
        id: true,
      },
      where: {
        isActive: true,
      },
    }),
  ]);

  return {
    totalImages,
    activeImages,
    inactiveImages: totalImages - activeImages,
    imagesByType: imagesByType.reduce((acc: any, item: any) => {
      acc[item.type] = item._count.id;
      return acc;
    }, {} as Record<string, number>),
  };
};
