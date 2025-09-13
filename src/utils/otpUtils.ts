import crypto from "crypto";
import { prisma } from "@/config/database";
import { CustomError } from "@/middleware/errorHandler";
import { logger } from "@/utils/logger";

export interface OTPResult {
  otpCode: string;
  expiresAt: Date;
}

/**
 * Generate a 6-digit OTP code
 */
export const generateOTP = (): string => {
  // Use crypto.randomBytes for better compatibility
  const randomBytes = crypto.randomBytes(3);
  const randomNumber = randomBytes.readUIntBE(0, 3);
  return (100000 + (randomNumber % 900000)).toString();
};

/**
 * Generate OTP with 15-minute expiration
 */
export const generateOTPWithExpiration = (): OTPResult => {
  const otpCode = generateOTP();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 minutes from now

  return {
    otpCode,
    expiresAt,
  };
};

/**
 * Store OTP for a user
 */
export const storeOTP = async (
  userId: string,
  otpCode: string,
  expiresAt: Date
): Promise<void> => {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        otpCode,
        otpExpiresAt: expiresAt,
        otpAttempts: 0, // Reset attempts when new OTP is generated
      },
    });

    logger.info("OTP stored successfully", {
      userId,
      otpCode: otpCode.substring(0, 2) + "****", // Log partial OTP for security
      expiresAt,
    });
  } catch (error) {
    logger.error("Failed to store OTP:", error);
    throw new CustomError("Failed to store OTP", 500);
  }
};

/**
 * Verify OTP for a user
 */
export const verifyOTP = async (
  userId: string,
  inputOTP: string
): Promise<boolean> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        otpCode: true,
        otpExpiresAt: true,
        otpAttempts: true,
      },
    });

    if (!user) {
      throw new CustomError("User not found", 404);
    }

    // Check if OTP exists
    if (!user.otpCode || !user.otpExpiresAt) {
      throw new CustomError("No OTP found. Please request a new OTP.", 400);
    }

    // Check if OTP has expired
    if (new Date() > user.otpExpiresAt) {
      // Clear expired OTP
      await clearOTP(userId);
      throw new CustomError("OTP has expired. Please request a new OTP.", 400);
    }

    // Check attempt limit (max 5 attempts)
    if (user.otpAttempts >= 5) {
      // Clear OTP after max attempts
      await clearOTP(userId);
      throw new CustomError(
        "Maximum OTP attempts exceeded. Please request a new OTP.",
        400
      );
    }

    // Verify OTP
    if (user.otpCode !== inputOTP) {
      // Increment attempt count
      await prisma.user.update({
        where: { id: userId },
        data: {
          otpAttempts: user.otpAttempts + 1,
        },
      });

      const remainingAttempts = 5 - (user.otpAttempts + 1);
      throw new CustomError(
        `Invalid OTP. ${
          remainingAttempts > 0
            ? `${remainingAttempts} attempts remaining.`
            : "Maximum attempts exceeded."
        }`,
        400
      );
    }

    // OTP is valid, clear it
    await clearOTP(userId);

    logger.info("OTP verified successfully", {
      userId,
      attempts: user.otpAttempts + 1,
    });

    return true;
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    logger.error("Failed to verify OTP:", error);
    throw new CustomError("Failed to verify OTP", 500);
  }
};

/**
 * Clear OTP data for a user
 */
export const clearOTP = async (userId: string): Promise<void> => {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        otpCode: null,
        otpExpiresAt: null,
        otpAttempts: 0,
      },
    });

    logger.info("OTP cleared successfully", { userId });
  } catch (error) {
    logger.error("Failed to clear OTP:", error);
    throw new CustomError("Failed to clear OTP", 500);
  }
};

/**
 * Check if user has a valid OTP
 */
export const hasValidOTP = async (userId: string): Promise<boolean> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        otpCode: true,
        otpExpiresAt: true,
        otpAttempts: true,
      },
    });

    if (!user || !user.otpCode || !user.otpExpiresAt) {
      return false;
    }

    // Check if OTP has expired
    if (new Date() > user.otpExpiresAt) {
      await clearOTP(userId);
      return false;
    }

    // Check if max attempts exceeded
    if (user.otpAttempts >= 5) {
      await clearOTP(userId);
      return false;
    }

    return true;
  } catch (error) {
    logger.error("Failed to check OTP validity:", error);
    return false;
  }
};

/**
 * Get OTP info for a user (for debugging/admin purposes)
 */
export const getOTPInfo = async (userId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        otpCode: true,
        otpExpiresAt: true,
        otpAttempts: true,
      },
    });

    if (!user) {
      throw new CustomError("User not found", 404);
    }

    return {
      email: user.email,
      hasOTP: !!user.otpCode,
      expiresAt: user.otpExpiresAt,
      attempts: user.otpAttempts,
      isExpired: user.otpExpiresAt ? new Date() > user.otpExpiresAt : false,
    };
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    logger.error("Failed to get OTP info:", error);
    throw new CustomError("Failed to get OTP info", 500);
  }
};

/**
 * Clean up expired OTPs (can be called periodically)
 */
export const cleanupExpiredOTPs = async (): Promise<number> => {
  try {
    const result = await prisma.user.updateMany({
      where: {
        otpExpiresAt: {
          lt: new Date(),
        },
        otpCode: {
          not: null,
        },
      },
      data: {
        otpCode: null,
        otpExpiresAt: null,
        otpAttempts: 0,
      },
    });

    logger.info(`Cleaned up ${result.count} expired OTPs`);
    return result.count;
  } catch (error) {
    logger.error("Failed to cleanup expired OTPs:", error);
    throw new CustomError("Failed to cleanup expired OTPs", 500);
  }
};
