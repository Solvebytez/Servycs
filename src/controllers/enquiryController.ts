import { Request, Response } from "express";
import { enquiryService, CreateEnquiryData } from "@/services/enquiryService";
import { logger } from "@/utils/logger";
import { validateRequest } from "@/middleware/validateRequest";
import { body, param, query } from "express-validator";

// Validation rules
export const validateCreateEnquiry = [
  body("vendorId").isMongoId().withMessage("Valid vendor ID is required"),
  body("listingId").isMongoId().withMessage("Valid listing ID is required"),
  body("serviceId")
    .optional()
    .isMongoId()
    .withMessage("Valid service ID is required"),
  body("userId").isMongoId().withMessage("Valid user ID is required"),
  body("channel")
    .isIn(["APP", "WHATSAPP", "PHONE", "EMAIL", "OTHER"])
    .withMessage("Valid channel is required"),
  body("message").optional().isString().withMessage("Message must be a string"),
  validateRequest,
];

export const validateGetEnquiries = [
  query("vendorId")
    .optional()
    .isMongoId()
    .withMessage("Valid vendor ID is required"),
  query("userId")
    .optional()
    .isMongoId()
    .withMessage("Valid user ID is required"),
  query("listingId")
    .optional()
    .isMongoId()
    .withMessage("Valid listing ID is required"),
  query("status")
    .optional()
    .isIn(["PENDING", "RESPONDED", "CLOSED"])
    .withMessage("Valid status is required"),
  query("channel")
    .optional()
    .isIn(["APP", "WHATSAPP", "PHONE", "EMAIL", "OTHER"])
    .withMessage("Valid channel is required"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("offset")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Offset must be a non-negative integer"),
  validateRequest,
];

export const validateUpdateEnquiryStatus = [
  param("id").isMongoId().withMessage("Valid enquiry ID is required"),
  body("status")
    .isIn(["PENDING", "RESPONDED", "CLOSED"])
    .withMessage("Valid status is required"),
  validateRequest,
];

export const validateGetEnquiryStats = [
  query("vendorId")
    .optional()
    .isMongoId()
    .withMessage("Valid vendor ID is required"),
  query("userId")
    .optional()
    .isMongoId()
    .withMessage("Valid user ID is required"),
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Valid start date is required"),
  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("Valid end date is required"),
  validateRequest,
];

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

/**
 * Create a new enquiry
 */
export const createEnquiry = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { vendorId, listingId, serviceId, userId, channel, message } =
      req.body;

    // Ensure user can only create enquiries for themselves
    if (req.user && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only create enquiries for yourself",
      });
    }

    const enquiryData: CreateEnquiryData = {
      vendorId,
      listingId,
      serviceId,
      userId,
      channel,
      message,
    };

    const enquiry = await enquiryService.createEnquiry(enquiryData);

    logger.info("Enquiry created successfully", {
      enquiryId: enquiry.id,
      vendorId,
      userId,
      channel,
    });

    return res.status(201).json({
      success: true,
      message: "Enquiry created successfully",
      data: enquiry,
    });
  } catch (error) {
    logger.error("Failed to create enquiry", {
      error: error instanceof Error ? error.message : "Unknown error",
      body: req.body,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to create enquiry",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get enquiries with filtering and pagination
 */
export const getEnquiries = async (req: Request, res: Response) => {
  try {
    const {
      vendorId,
      userId,
      listingId,
      status,
      channel,
      limit = 20,
      offset = 0,
      startDate,
      endDate,
    } = req.query;

    const options = {
      vendorId: vendorId as string,
      userId: userId as string,
      listingId: listingId as string,
      status: status as any,
      channel: channel as any,
      limit: parseInt(limit as string) || 20,
      offset: parseInt(offset as string) || 0,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    };

    const enquiries = await enquiryService.getEnquiries(options);

    res.json({
      success: true,
      message: "Enquiries retrieved successfully",
      data: enquiries,
      meta: {
        count: enquiries.length,
        limit: options.limit,
        offset: options.offset,
      },
    });
  } catch (error) {
    logger.error("Failed to get enquiries", {
      error: error instanceof Error ? error.message : "Unknown error",
      query: req.query,
    });

    res.status(500).json({
      success: false,
      message: "Failed to get enquiries",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get enquiries for a specific vendor
 */
export const getVendorEnquiries = async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;

    if (!vendorId) {
      return res.status(400).json({
        success: false,
        message: "Vendor ID is required",
      });
    }

    const {
      status,
      channel,
      limit = 20,
      offset = 0,
      startDate,
      endDate,
    } = req.query;

    const options = {
      status: status as any,
      channel: channel as any,
      limit: parseInt(limit as string) || 20,
      offset: parseInt(offset as string) || 0,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    };

    const enquiries = await enquiryService.getVendorEnquiries(
      vendorId,
      options
    );

    return res.json({
      success: true,
      message: "Vendor enquiries retrieved successfully",
      data: enquiries,
      meta: {
        count: enquiries.length,
        limit: options.limit,
        offset: options.offset,
      },
    });
  } catch (error) {
    logger.error("Failed to get vendor enquiries", {
      error: error instanceof Error ? error.message : "Unknown error",
      vendorId: req.params.vendorId,
      query: req.query,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to get vendor enquiries",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get enquiries for a specific user
 */
export const getUserEnquiries = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const {
      status,
      channel,
      limit = 20,
      offset = 0,
      startDate,
      endDate,
    } = req.query;

    const options = {
      status: status as any,
      channel: channel as any,
      limit: parseInt(limit as string) || 20,
      offset: parseInt(offset as string) || 0,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    };

    const enquiries = await enquiryService.getUserEnquiries(userId, options);

    return res.json({
      success: true,
      message: "User enquiries retrieved successfully",
      data: enquiries,
      meta: {
        count: enquiries.length,
        limit: options.limit,
        offset: options.offset,
      },
    });
  } catch (error) {
    logger.error("Failed to get user enquiries", {
      error: error instanceof Error ? error.message : "Unknown error",
      userId: req.params.userId,
      query: req.query,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to get user enquiries",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Update enquiry status
 */
export const updateEnquiryStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Enquiry ID is required",
      });
    }

    const enquiry = await enquiryService.updateEnquiryStatus(id, status);

    logger.info("Enquiry status updated", {
      enquiryId: id,
      status,
    });

    return res.json({
      success: true,
      message: "Enquiry status updated successfully",
      data: enquiry,
    });
  } catch (error) {
    logger.error("Failed to update enquiry status", {
      error: error instanceof Error ? error.message : "Unknown error",
      enquiryId: req.params.id,
      body: req.body,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to update enquiry status",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get enquiry statistics
 */
export const getEnquiryStats = async (req: Request, res: Response) => {
  try {
    const { vendorId, userId, startDate, endDate } = req.query;

    const options = {
      vendorId: vendorId as string,
      userId: userId as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    };

    const stats = await enquiryService.getEnquiryStats(options);

    res.json({
      success: true,
      message: "Enquiry statistics retrieved successfully",
      data: stats,
    });
  } catch (error) {
    logger.error("Failed to get enquiry stats", {
      error: error instanceof Error ? error.message : "Unknown error",
      query: req.query,
    });

    res.status(500).json({
      success: false,
      message: "Failed to get enquiry statistics",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
