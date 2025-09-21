import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { Request } from "express";
import { CustomError } from "@/middleware/errorHandler";
import { env } from "@/config/env";

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

// Multer configuration for local storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("=== MULTER DESTINATION ===");
    console.log("Setting destination to: uploads/");
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename =
      file.fieldname +
      "-" +
      uniqueSuffix +
      "." +
      file.originalname.split(".").pop();

    console.log("=== MULTER FILENAME ===");
    console.log("Original filename:", file.originalname);
    console.log("Generated filename:", filename);

    cb(null, filename);
  },
});

// File filter
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  console.log("=== MULTER FILE FILTER ===");
  console.log("File details:", {
    fieldname: file.fieldname,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
  });

  // Allowed file types
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    console.log("✅ File type allowed:", file.mimetype);
    cb(null, true);
  } else {
    console.log("❌ File type not allowed:", file.mimetype);
    cb(
      new CustomError(
        "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.",
        400
      )
    );
  }
};

// Multer upload configuration
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

// Upload to Cloudinary
export const uploadToCloudinary = async (
  file: Express.Multer.File,
  folder: string = "listro"
): Promise<string> => {
  console.log("=== CLOUDINARY UPLOAD START ===");
  console.log("File path:", file.path);
  console.log("Folder:", folder);
  console.log("File details:", {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
  });

  // Check if Cloudinary is configured
  if (
    !env.CLOUDINARY_CLOUD_NAME ||
    !env.CLOUDINARY_API_KEY ||
    !env.CLOUDINARY_API_SECRET
  ) {
    console.log("⚠️ Cloudinary not configured, using local file URL");
    // Return a local file URL for development
    const baseUrl =
      process.env.NODE_ENV === "production"
        ? "https://your-domain.com"
        : "http://192.168.0.131:5000";
    const localUrl = `${baseUrl}/uploads/${file.filename}`;
    console.log("✅ Local file URL generated:", localUrl);
    return localUrl;
  }

  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: folder,
      resource_type: "auto",
      transformation: [
        { width: 1000, height: 1000, crop: "limit" },
        { quality: "auto" },
      ],
    });

    console.log("✅ Cloudinary upload successful");
    console.log("Result:", {
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    });

    return result.secure_url;
  } catch (error) {
    console.error("❌ Cloudinary upload failed:", error);
    throw new CustomError("Failed to upload file to Cloudinary", 500);
  }
};

// Upload multiple files to Cloudinary
export const uploadMultipleToCloudinary = async (
  files: Express.Multer.File[],
  folder: string = "listro"
): Promise<string[]> => {
  try {
    const uploadPromises = files.map((file) =>
      uploadToCloudinary(file, folder)
    );
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    throw new CustomError("Failed to upload files to Cloudinary", 500);
  }
};

// Delete file from Cloudinary
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new CustomError("Failed to delete file from Cloudinary", 500);
  }
};

// Extract public ID from Cloudinary URL
export const extractPublicId = (url: string): string => {
  try {
    // Parse the URL to extract the public ID
    // URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/filename.ext
    const urlParts = url.split("/");
    const uploadIndex = urlParts.findIndex((part) => part === "upload");

    if (uploadIndex === -1) {
      throw new Error("Invalid Cloudinary URL: upload segment not found");
    }

    // Get everything after "upload" and before the last segment (filename)
    const pathSegments = urlParts.slice(uploadIndex + 2, -1); // Skip "upload" and version
    const filename = urlParts[urlParts.length - 1];

    if (!filename) {
      throw new Error("Invalid URL: cannot extract filename");
    }

    // Remove file extension from filename
    const filenameWithoutExt = filename.split(".")[0];

    if (!filenameWithoutExt) {
      throw new Error("Invalid URL: cannot extract filename without extension");
    }

    // Construct the public ID with folder path
    const publicId =
      pathSegments.length > 0
        ? `${pathSegments.join("/")}/${filenameWithoutExt}`
        : filenameWithoutExt;

    return publicId;
  } catch (error) {
    throw new Error(
      `Invalid URL: cannot extract public ID - ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

// Upload middleware configurations
const uploadSingleMiddleware = upload.single("image");
const uploadMultipleMiddleware = upload.array("images", 8); // Max 8 images

// Upload middleware configurations
export const uploadSingle = uploadSingleMiddleware;

export const uploadMultiple = uploadMultipleMiddleware;
export const uploadFields = upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "cover", maxCount: 1 },
  { name: "images", maxCount: 8 },
]);

// Memory storage for temporary uploads
const memoryStorage = multer.memoryStorage();

export const uploadToMemory = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

// Upload buffer to Cloudinary
export const uploadBufferToCloudinary = async (
  buffer: Buffer,
  folder: string = "listro",
  filename?: string
): Promise<string> => {
  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: folder,
            resource_type: "auto",
            transformation: [
              { width: 1000, height: 1000, crop: "limit" },
              { quality: "auto" },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    return (result as any).secure_url;
  } catch (error) {
    throw new CustomError("Failed to upload buffer to Cloudinary", 500);
  }
};
