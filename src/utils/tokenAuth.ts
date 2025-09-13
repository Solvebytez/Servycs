import jwt from "jsonwebtoken";
import { AuthProvider } from "@prisma/client";
import { env } from "@/config/env";
import { CustomError } from "@/middleware/errorHandler";

export interface SignInTokenPayload {
  email: string;
  name?: string;
  avatar?: string;
  provider: "LOCAL" | "GOOGLE";
  providerId?: string;
  password?: string; // Optional password for LOCAL provider validation
  phone?: string; // Optional phone number
  exp?: number;
  iat?: number;
}

export interface VerifiedSignInToken {
  email: string;
  name: string;
  avatar?: string;
  provider: AuthProvider;
  providerId?: string;
  password?: string; // Optional password for LOCAL provider validation
  phone?: string; // Optional phone number
}

/**
 * Verify the sign-in token sent from frontend
 */
export const verifySignInToken = (token: string): VerifiedSignInToken => {
  try {
    const decoded = jwt.verify(
      token,
      env.SHARED_SIGNIN_SECRET
    ) as SignInTokenPayload;

    // Validate required fields
    if (!decoded.email) {
      throw new CustomError("Email is required in sign-in token", 400);
    }

    if (!decoded.provider) {
      throw new CustomError("Provider is required in sign-in token", 400);
    }

    // Validate provider
    if (!["LOCAL", "GOOGLE"].includes(decoded.provider)) {
      throw new CustomError("Invalid provider in sign-in token", 400);
    }

    return {
      email: decoded.email.toLowerCase().trim(),
      name: decoded.name || extracted_name_from_email(decoded.email),
      avatar: decoded.avatar,
      provider: decoded.provider as AuthProvider,
      providerId: decoded.providerId,
      password: decoded.password, // Include password for validation
      phone: decoded.phone, // Include phone number
    };
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      throw new CustomError("Invalid sign-in token", 401);
    }

    if (error instanceof jwt.TokenExpiredError) {
      throw new CustomError("Sign-in token has expired", 401);
    }

    throw new CustomError("Failed to verify sign-in token", 401);
  }
};

/**
 * Extract name from email if name is not provided
 */
const extracted_name_from_email = (email: string): string => {
  const localPart = email.split("@")[0];
  if (!localPart) {
    return "User";
  }
  return localPart
    .replace(/[._-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
};

/**
 * Determine user status based on provider
 */
export const getUserStatusForProvider = (
  provider: AuthProvider
): "ACTIVE" | "PENDING" => {
  return provider === AuthProvider.GOOGLE ? "ACTIVE" : "PENDING";
};

/**
 * Determine if email should be marked as verified based on provider
 */
export const getEmailVerifiedForProvider = (
  provider: AuthProvider
): boolean => {
  return provider === AuthProvider.GOOGLE;
};
