import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { UserRole, UserStatus } from "@prisma/client";
import { prisma } from "@/config/database";
import { env } from "@/config/env";
import { CustomError } from "@/middleware/errorHandler";
import {
  generateAccessToken,
  generateRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  extractTokenFromHeader,
  generateSessionId,
} from "@/utils/jwt";
import { blacklistToken, blacklistAllUserTokens } from "@/utils/blacklistToken";
import { sendEmail, emailTemplates } from "@/utils/email";
import {
  verifySignInToken,
  getUserStatusForProvider,
  getEmailVerifiedForProvider,
} from "@/utils/tokenAuth";
import {
  getUserProfilePicture,
  createImage,
  deleteImage,
} from "@/utils/imageUtils";
import { ImageType } from "@prisma/client";
import {
  generateOTPWithExpiration,
  storeOTP,
  verifyOTP,
  clearOTP,
  hasValidOTP,
} from "@/utils/otpUtils";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

interface TokenAuthRequest extends Request {
  body: {
    signInTokn?: string;
    signInToken?: string;
  };
}

// Register new user
export const register = async (req: Request, res: Response): Promise<void> => {
  const {
    name,
    email,
    password,
    phone,
    role = "USER",
    username,
    createdBy,
  } = req.body;

  // Check if user already exists by email
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  let user;
  if (existingUser) {
    // If user exists and is already verified, throw error
    if (existingUser.isEmailVerified) {
      throw new CustomError("User with this email already exists", 409);
    }

    // If user exists but is not verified, update the existing user with latest data
    const updateData: any = {
      name,
      phone,
      role: role as UserRole,
      status: UserStatus.PENDING,
      createdBy: createdBy || null,
      // Clear any existing OTP data to ensure fresh OTP
      otpCode: null,
      otpExpiresAt: null,
      otpAttempts: 0,
    };

    // Update username if provided
    if (username) {
      const { validateUsername, normalizeUsername } = await import(
        "@/utils/usernameUtils"
      );
      await validateUsername(username, existingUser.id); // Pass existing user ID to exclude from validation
      updateData.username = normalizeUsername(username);
    }

    // Update password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || "12");
    updateData.password = await bcrypt.hash(password, saltRounds);

    user = await prisma.user.update({
      where: { id: existingUser.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
  } else {
    // If username provided, validate it BEFORE creating user
    if (username) {
      const { validateUsername } = await import("@/utils/usernameUtils");
      await validateUsername(username);
    }

    // Create new user
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || "12");
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Normalize username if provided
    const { normalizeUsername } = await import("@/utils/usernameUtils");
    const normalizedUsername = username
      ? normalizeUsername(username)
      : undefined;

    user = await prisma.user.create({
      data: {
        name,
        username: normalizedUsername,
        email,
        password: hashedPassword,
        phone,
        role: role as UserRole,
        status: UserStatus.PENDING,
        createdBy: createdBy || null, // Store who created this user (salesman ID)
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
  }

  // Create or update Vendor record if role is VENDOR
  if (role === "VENDOR") {
    const vendorData = {
      userId: user.id,
      businessName: name, // Use name as default business name
      businessEmail: email,
      businessPhone: phone || "",
      businessDescription: null,
      businessLicense: null,
      businessInsurance: null,
      businessCertifications: [],
      businessHours: null,
      verificationStatus: UserStatus.PENDING,
      isVerified: false,
      rating: 0,
      totalReviews: 0,
      totalBookings: 0,
      totalRevenue: 0,
    };

    // Check if Vendor record already exists
    const existingVendor = await prisma.vendor.findUnique({
      where: { userId: user.id },
    });

    if (existingVendor) {
      // Update existing Vendor record
      await prisma.vendor.update({
        where: { userId: user.id },
        data: {
          businessName: name,
          businessEmail: email,
          businessPhone: phone || "",
          verificationStatus: UserStatus.PENDING,
          isVerified: false,
        },
      });
    } else {
      // Create new Vendor record
      await prisma.vendor.create({
        data: vendorData,
      });
    }
  } else if (
    existingUser &&
    existingUser.role === "VENDOR" &&
    role !== "VENDOR"
  ) {
    // If user is switching from VENDOR to another role, delete Vendor record
    await prisma.vendor.deleteMany({
      where: { userId: user.id },
    });
  }

  // If createdBy is provided, validate that the user exists
  if (createdBy) {
    const creatorUser = await prisma.user.findUnique({
      where: { id: createdBy },
    });

    if (!creatorUser) {
      throw new CustomError("Invalid createdBy user ID", 400);
    }
  }

  // Generate tokens
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
  });

  // Update salesman metrics if user was created by a salesman
  if (createdBy) {
    try {
      // Find the salesman who created this user
      const salesman = await prisma.salesman.findUnique({
        where: { userId: createdBy },
      });

      if (salesman) {
        // Update the salesman's metrics based on user role
        const updateData: any = {};

        if (role === "VENDOR") {
          updateData.vendorsOnboarded = { increment: 1 };
        } else if (role === "USER") {
          updateData.usersOnboarded = { increment: 1 };
        }

        if (Object.keys(updateData).length > 0) {
          await prisma.salesman.update({
            where: { userId: createdBy },
            data: updateData,
          });
        }
      }
    } catch (error) {
      console.error("Error updating salesman metrics:", error);
      // Don't fail the registration if metrics update fails
    }
  }

  // Set refresh token in cookie
  setRefreshTokenCookie(res, refreshToken);

  // Send OTP for LOCAL provider (register function is always LOCAL)
  // No need to check provider since register function is always LOCAL
  {
    // Generate and store OTP
    const { generateOTPWithExpiration, storeOTP } = await import(
      "@/utils/otpUtils"
    );

    const { otpCode, expiresAt } = generateOTPWithExpiration();
    await storeOTP(user.id, otpCode, expiresAt);

    // Send OTP email
    const userName = user.name || user.email.split("@")[0] || "User";
    const template = emailTemplates.otpVerification(userName, otpCode);

    await sendEmail({
      to: user.email,
      subject: template.subject,
      html: template.html,
    });
  }

  res.status(201).json({
    success: true,
    message:
      existingUser && !existingUser.isEmailVerified
        ? "Registration updated successfully. Please check your email for verification."
        : "User registered successfully. Please check your email for verification.",
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      accessToken,
    },
  });
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  const { identifier, password } = req.body;

  console.log("🔍 Login request received with identifier:", identifier);
  console.log("📝 Password provided:", !!password);

  // Find user by email or username
  const { findUserByIdentifier } = await import("@/utils/identifierUtils");
  const user = await findUserByIdentifier(identifier);

  if (!user) {
    throw new CustomError("Invalid credentials", 401);
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password!);
  if (!isPasswordValid) {
    throw new CustomError("Invalid credentials", 401);
  }

  // Check if email is verified
  if (!user.isEmailVerified) {
    throw new CustomError("Please verify your email before logging in", 403);
  }

  // Check if user is active
  if (user.status !== UserStatus.ACTIVE) {
    throw new CustomError(
      "Account is not active. Please contact support.",
      401
    );
  }

  // Generate new session ID for single device login
  const newSessionId = generateSessionId();

  // Update user with new session ID and last login
  await prisma.user.update({
    where: { id: user.id },
    data: {
      lastLoginAt: new Date(),
      currentSessionId: newSessionId,
    },
  });

  // Blacklist all existing tokens for this user (single device login)
  await blacklistAllUserTokens(user.id);

  // Generate tokens with session ID
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    sessionId: newSessionId,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
  });

  // Debug: Log refresh token generation
  console.log("🔍 Refresh token generated:", {
    hasRefreshToken: !!refreshToken,
    refreshTokenLength: refreshToken?.length || 0,
    refreshTokenPreview: refreshToken
      ? refreshToken.substring(0, 20) + "..."
      : "undefined",
  });

  // Set refresh token in cookie (for web browsers)
  setRefreshTokenCookie(res, refreshToken);
  console.log("✅ Refresh token set in cookie for web browsers");

  // Get user's profile picture
  const profilePicture = await getUserProfilePicture(user.id);

  console.log("🎉 Login successful, returning tokens");

  // Debug: Log what we're sending in response
  console.log("🔍 Response data being sent:", {
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    refreshTokenInResponse: refreshToken ? "YES" : "NO",
  });

  res.json({
    success: true,
    message: "Login successful",
    data: {
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        profilePicture: profilePicture?.url || null,
        vendor: user.vendor,
        salesman: user.salesman,
        admin: user.admin,
      },
      accessToken,
      refreshToken, // Also return in response body for React Native
    },
  });
};

// Logout user
export const logout = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Get access token from request header
    const accessToken = extractTokenFromHeader(req);

    if (accessToken) {
      // Add access token to blacklist
      await blacklistToken(accessToken);
    }

    // Clear refresh token cookie
    clearRefreshTokenCookie(res);

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    // Even if blacklisting fails, clear the cookie and respond
    clearRefreshTokenCookie(res);

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  }
};

// Refresh access token
export const refreshToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log("=== REFRESH TOKEN ENDPOINT CALLED ===");
  console.log("Request headers:", JSON.stringify(req.headers, null, 2));
  console.log("Request cookies:", JSON.stringify(req.cookies, null, 2));

  // Import the new extractRefreshToken function
  const { extractRefreshToken } = await import("@/utils/jwt");

  // Extract refresh token from both cookie and Bearer header
  const token = extractRefreshToken(req);

  if (!token) {
    console.log("❌ No refresh token found in cookie or header");
    throw new CustomError("Refresh token required", 401);
  }

  console.log("✅ Refresh token found, proceeding with verification");

  try {
    console.log("🔍 Verifying refresh token...");
    // Verify refresh token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as any;
    console.log("✅ Refresh token verified, user ID:", decoded.userId);

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        currentSessionId: true,
      },
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
      console.log(
        "❌ User not found or inactive:",
        user ? user.status : "NOT_FOUND"
      );
      throw new CustomError("Invalid refresh token", 401);
    }

    console.log("✅ User found and active:", user.email, user.role);

    // Generate new access token with current session ID
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionId: user.currentSessionId || undefined,
    });

    console.log("✅ New access token generated");

    // Generate new refresh token
    const newRefreshToken = generateRefreshToken({
      userId: user.id,
    });

    console.log("✅ New refresh token generated");

    // Set new refresh token in cookie
    setRefreshTokenCookie(res, newRefreshToken);
    console.log("✅ New refresh token set in cookie");

    console.log("🎉 Refresh token process completed successfully");
    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken: newRefreshToken, // Include new refresh token in response
      },
    });
  } catch (error: any) {
    console.log("❌ Error in refresh token process:", error?.message || error);
    if (error instanceof jwt.TokenExpiredError) {
      console.log("❌ Refresh token expired");
      throw new CustomError("Refresh token expired. Please login again.", 401);
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.log("❌ Invalid refresh token");
      throw new CustomError("Invalid refresh token", 401);
    } else {
      console.log("❌ Unknown error:", error?.message || error);
      throw new CustomError("Invalid refresh token", 401);
    }
  }
};

// Forgot password
export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    // Don't reveal if user exists or not
    res.json({
      success: true,
      message:
        "If an account with that email exists, a password reset link has been sent.",
    });
    return;
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Store reset token (you might want to create a separate table for this)
  // For now, we'll use a simple approach
  await prisma.user.update({
    where: { id: user.id },
    data: {
      // You might want to add these fields to your User model
      // resetToken,
      // resetTokenExpiry
    },
  });

  // Send reset email
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  await sendEmail({
    to: user.email,
    subject: "Password Reset Request",
    html: `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  });

  res.json({
    success: true,
    message:
      "If an account with that email exists, a password reset link has been sent.",
  });
};

// Reset password
export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { token, password } = req.body;

  // Find user with reset token
  // You'll need to implement this based on your token storage approach
  const user = await prisma.user.findFirst({
    where: {
      // resetToken: token,
      // resetTokenExpiry: { gt: new Date() }
    },
  });

  if (!user) {
    throw new CustomError("Invalid or expired reset token", 400);
  }

  // Hash new password
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || "12");
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Update password and clear reset token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      // resetToken: null,
      // resetTokenExpiry: null
    },
  });

  res.json({
    success: true,
    message: "Password reset successfully",
  });
};

// Verify email
export const verifyEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { token } = req.body;

  // Find user with verification token
  // You'll need to implement this based on your token storage approach
  const user = await prisma.user.findFirst({
    where: {
      // verificationToken: token
    },
  });

  if (!user) {
    throw new CustomError("Invalid verification token", 400);
  }

  // Update user status
  await prisma.user.update({
    where: { id: user.id },
    data: {
      isEmailVerified: true,
      status: UserStatus.ACTIVE,
      // verificationToken: null
    },
  });

  res.json({
    success: true,
    message: "Email verified successfully",
  });
};

// Resend verification email
export const resendVerificationEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new CustomError("User not found", 404);
  }

  if (user.isEmailVerified) {
    throw new CustomError("Email is already verified", 400);
  }

  // Send verification email
  await sendVerificationEmail(user.email, user.id);

  res.json({
    success: true,
    message: "Verification email sent successfully",
  });
};

/**
 * Token-based login endpoint
 * Upserts user and issues tokens
 */
export const tokenLogin = async (
  req: TokenAuthRequest,
  res: Response
): Promise<void> => {
  const { signInTokn, signInToken } = req.body;
  const token = signInTokn || signInToken;

  console.log("🔍 TOKEN LOGIN - Received request");
  console.log("🔍 TOKEN LOGIN - Token:", token?.substring(0, 50) + "...");

  if (!token) {
    throw new CustomError("Sign-in token is required", 400);
  }

  // Verify the token
  const tokenData = verifySignInToken(token);
  const {
    email,
    name,
    username,
    avatar,
    provider,
    providerId,
    password,
    phone,
  } = tokenData;

  console.log("🔍 TOKEN LOGIN - Decoded token data:", {
    email,
    username,
    provider,
    hasPassword: !!password,
  });

  // Find existing user by email OR username (if email looks like a username)
  let existingUser;

  // Check if email field contains @ (actual email) or is a username
  const isEmailFormat = email.includes("@");
  console.log("🔍 TOKEN LOGIN - Is email format:", isEmailFormat);

  if (isEmailFormat) {
    console.log("🔍 TOKEN LOGIN - Searching by email:", email);
    existingUser = await prisma.user.findUnique({
      where: { email },
      include: {
        vendor: true,
        salesman: true,
        admin: true,
      },
    });
  } else {
    console.log("🔍 TOKEN LOGIN - Searching by username:", email);
    // Email field contains username, search by username instead
    const { findUserByIdentifier } = await import("@/utils/identifierUtils");
    existingUser = await findUserByIdentifier(email);
  }

  console.log("🔍 TOKEN LOGIN - User found:", !!existingUser);

  // For LOCAL provider login, ensure password is provided
  if (provider === "LOCAL" && !password) {
    throw new CustomError("Password is required for LOCAL provider login", 400);
  }

  // For LOCAL provider, validate password if user exists
  if (provider === "LOCAL" && existingUser) {
    console.log("🔍 TOKEN LOGIN - Validating password for LOCAL provider");
    // Check if user has a password (LOCAL users should have passwords)
    if (!existingUser.password) {
      console.log("🔍 TOKEN LOGIN - User has no password stored");
      throw new CustomError("Invalid credentials", 401);
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(
      password!,
      existingUser.password
    );
    console.log("🔍 TOKEN LOGIN - Password valid:", isPasswordValid);
    if (!isPasswordValid) {
      console.log("🔍 TOKEN LOGIN - Password validation failed");
      throw new CustomError("Invalid credentials", 401);
    }

    // Check if email is verified
    if (!existingUser.isEmailVerified) {
      throw new CustomError("Please verify your email before logging in", 403);
    }

    // Check if user status is active
    if (existingUser.status !== "ACTIVE") {
      throw new CustomError(
        "Account is not active. Please contact support",
        403
      );
    }
  }

  // For LOCAL provider, if user doesn't exist, this is a login attempt with wrong email
  if (provider === "LOCAL" && !existingUser) {
    throw new CustomError("Invalid credentials", 401);
  }

  let user;
  if (existingUser) {
    // NEW: Prevent provider switching - validate provider consistency
    if (provider === "LOCAL" && existingUser.provider === "GOOGLE") {
      throw new CustomError(
        "This email is already registered with Google. Please use Google Sign-In instead.",
        403
      );
    }

    if (provider === "GOOGLE" && existingUser.provider === "LOCAL") {
      throw new CustomError(
        "This email is already registered with email/password. Please use email login instead.",
        403
      );
    }

    // Generate new session ID for single device login
    const newSessionId = generateSessionId();

    // Update existing user - don't override status/verification for LOCAL provider
    const updateData: any = {
      name: name,
      provider: provider,
      providerId: providerId,
      lastLoginAt: new Date(),
      currentSessionId: newSessionId,
    };

    // Only update status/verification for GOOGLE provider
    if (provider === "GOOGLE") {
      updateData.status = getUserStatusForProvider(provider);
      updateData.isEmailVerified = getEmailVerifiedForProvider(provider);

      // Auto-generate username for existing Google users if they don't have one
      if (!existingUser.username) {
        const { generateUsernameFromEmail } = await import(
          "@/utils/usernameUtils"
        );
        updateData.username = await generateUsernameFromEmail(email);
      }
    }
    // For LOCAL provider, keep existing status and verification status

    user = await prisma.user.update({
      where: { id: existingUser.id },
      data: updateData,
      include: {
        vendor: true,
        salesman: true,
        admin: true,
      },
    });

    // Blacklist all existing tokens for this user (single device login)
    await blacklistAllUserTokens(user.id);
  } else {
    // Only create new user for GOOGLE provider (OAuth)
    // LOCAL provider should never reach here due to validation above
    if (provider === "GOOGLE") {
      // Auto-generate username for Google users
      const { generateUsernameFromEmail } = await import(
        "@/utils/usernameUtils"
      );
      const autoGeneratedUsername = await generateUsernameFromEmail(email);

      user = await prisma.user.create({
        data: {
          email,
          name,
          username: autoGeneratedUsername,
          provider: provider,
          providerId: providerId,
          status: getUserStatusForProvider(provider),
          isEmailVerified: getEmailVerifiedForProvider(provider),
          lastLoginAt: new Date(),
        } as any, // Type assertion to handle Prisma type issues
        include: {
          vendor: true,
          salesman: true,
          admin: true,
        },
      });
    } else {
      // This should never happen for LOCAL provider
      throw new CustomError("Invalid credentials", 401);
    }
  }

  // Handle avatar from token data (if provided)
  if (avatar && avatar.trim() !== "") {
    try {
      // Check if user already has a profile picture
      const existingProfilePic = await getUserProfilePicture(user.id);

      if (existingProfilePic) {
        // Delete old profile picture (hard delete)
        await deleteImage(existingProfilePic.id);
      }

      // Create new profile picture record
      await createImage({
        url: avatar,
        filename: `profile-${user.id}-${Date.now()}.jpg`, // Dynamic filename
        mimeType: "image/jpeg", // Default MIME type for external URLs
        size: 0, // Unknown size for external URLs
        type: ImageType.PROFILE_PICTURE,
        entityType: "User",
        entityId: user.id,
        uploadedBy: user.id,
      });
    } catch (error) {
      // Log error but don't fail the login process
      console.error("Error saving avatar from token:", error);
    }
  }

  // Send OTP for LOCAL provider if not verified
  if (provider === "LOCAL" && !user.isEmailVerified) {
    // Check if user already has a valid OTP
    const hasValid = await hasValidOTP(user.id);
    if (!hasValid) {
      // Generate and store OTP
      const { otpCode, expiresAt } = generateOTPWithExpiration();
      await storeOTP(user.id, otpCode, expiresAt);

      // Send OTP email
      const userName = user.name || email.split("@")[0] || "User";
      const template = emailTemplates.otpVerification(userName, otpCode);

      await sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
      });
    }
  }

  // Generate tokens with session ID
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    sessionId: user.currentSessionId || undefined,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
  });

  // Set refresh token in cookie
  setRefreshTokenCookie(res, refreshToken);

  // Get user's profile picture
  const profilePicture = await getUserProfilePicture(user.id);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        provider: (user as any).provider,
        profilePicture: profilePicture?.url || null,
        isEmailVerified: user.isEmailVerified,
        vendor: user.vendor,
        salesman: user.salesman,
        admin: user.admin,
      },
      accessToken,
      refreshToken, // Add refresh token to response body for React Native
    },
  });
};

/**
 * Token-based register endpoint
 * Creates new user only (fails if user exists)
 */
export const tokenRegister = async (
  req: TokenAuthRequest,
  res: Response
): Promise<void> => {
  const { signInToken } = req.body;
  const token = signInToken;

  if (!token) {
    throw new CustomError("Sign-in token is required", 400);
  }

  // Verify the token
  const tokenData = verifySignInToken(token);
  const {
    email,
    name,
    username,
    avatar,
    provider,
    providerId,
    password,
    phone,
    role,
    createdBy,
  } = tokenData;

  // Validate required fields for LOCAL provider
  if (provider === "LOCAL") {
    if (!password) {
      throw new CustomError(
        "Password is required for LOCAL provider registration",
        400
      );
    }
    if (password.length < 8) {
      throw new CustomError("Password must be at least 8 characters long", 400);
    }
    if (!name || name.trim().length < 2) {
      throw new CustomError("Name must be at least 2 characters long", 400);
    }
    // Username is required for LOCAL provider
    if (!username || username.trim().length < 5) {
      throw new CustomError("Username must be at least 5 characters long", 400);
    }
    // Validate username format and availability
    const { validateUsername } = await import("@/utils/usernameUtils");
    await validateUsername(username);
  }

  // If createdBy is provided, validate that the user exists
  if (createdBy) {
    const creatorUser = await prisma.user.findUnique({
      where: { id: createdBy },
    });

    if (!creatorUser) {
      throw new CustomError("Invalid createdBy user ID", 400);
    }
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  let user;
  if (existingUser) {
    // If user exists and is already verified, throw error
    if (existingUser.isEmailVerified) {
      throw new CustomError("User with this email already exists", 409);
    }

    // If user exists but is not verified, update the existing user with latest data
    const updateData: any = {
      name,
      provider: provider,
      providerId: providerId,
      status: getUserStatusForProvider(provider),
      isEmailVerified: getEmailVerifiedForProvider(provider),
      // Clear any existing OTP data to ensure fresh OTP
      otpCode: null,
      otpExpiresAt: null,
      otpAttempts: 0,
    };

    // Update phone if provided
    if (phone) {
      updateData.phone = phone;
    }

    // Handle username
    if (provider === "LOCAL" && username) {
      const { normalizeUsername } = await import("@/utils/usernameUtils");
      updateData.username = normalizeUsername(username);
    } else if (provider === "GOOGLE" && !existingUser.username) {
      // Auto-generate username for Google users if they don't have one
      const { generateUsernameFromEmail } = await import(
        "@/utils/usernameUtils"
      );
      updateData.username = await generateUsernameFromEmail(email);
    }

    // For LOCAL provider, update password if provided
    if (provider === "LOCAL" && password) {
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || "12");
      updateData.password = await bcrypt.hash(password, saltRounds);
    }

    user = await prisma.user.update({
      where: { id: existingUser.id },
      data: updateData,
      include: {
        vendor: true,
        salesman: true,
        admin: true,
      },
    });
  } else {
    // Prepare user data
    const userData: any = {
      email,
      name,
      provider: provider,
      providerId: providerId,
      role: role === "SALESMAN" ? "SALESMAN" : "USER", // Only SALESMAN gets SALESMAN role, everything else gets USER
      status: getUserStatusForProvider(provider),
      isEmailVerified: getEmailVerifiedForProvider(provider),
      createdBy: createdBy || null, // Store who created this user (salesman ID)
    };

    // Add phone if provided
    if (phone) {
      userData.phone = phone;
    }

    // Handle username
    if (provider === "LOCAL" && username) {
      const { normalizeUsername } = await import("@/utils/usernameUtils");
      userData.username = normalizeUsername(username);
    } else if (provider === "GOOGLE") {
      // Auto-generate username for Google users
      const { generateUsernameFromEmail } = await import(
        "@/utils/usernameUtils"
      );
      userData.username = await generateUsernameFromEmail(email);
    }

    // For LOCAL provider, hash and store password
    if (provider === "LOCAL" && password) {
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || "12");
      userData.password = await bcrypt.hash(password, saltRounds);
    }

    // Create new user
    user = await prisma.user.create({
      data: userData,
      include: {
        vendor: true,
        salesman: true,
        admin: true,
      },
    });
  }

  // Create role-specific profile if needed
  if (user.role === "SALESMAN") {
    try {
      await prisma.salesman.create({
        data: {
          userId: user.id,
          territory: "General", // Default territory
          targetVendors: 0, // Default targets
          targetUsers: 0,
          vendorsOnboarded: 0, // Initialize metrics
          usersOnboarded: 0,
          totalCommission: 0,
        },
      });
      console.log("✅ Created salesman profile for user:", user.id);
    } catch (error) {
      console.error("❌ Error creating salesman profile:", error);
      // Don't fail the registration if salesman profile creation fails
    }
  } else if (user.role === "VENDOR") {
    // TODO: Add vendor profile creation logic if needed
    console.log("📝 Vendor profile creation not implemented yet");
  } else if (user.role === "ADMIN") {
    // TODO: Add admin profile creation logic if needed
    console.log("📝 Admin profile creation not implemented yet");
  }

  // Handle avatar from token data (if provided)
  if (avatar && avatar.trim() !== "") {
    try {
      // Check if user already has a profile picture
      const existingProfilePic = await getUserProfilePicture(user.id);

      if (existingProfilePic) {
        // Delete old profile picture (hard delete)
        await deleteImage(existingProfilePic.id);
      }

      // Create new profile picture record
      await createImage({
        url: avatar,
        filename: `profile-${user.id}-${Date.now()}.jpg`, // Dynamic filename
        mimeType: "image/jpeg", // Default MIME type for external URLs
        size: 0, // Unknown size for external URLs
        type: ImageType.PROFILE_PICTURE,
        entityType: "User",
        entityId: user.id,
        uploadedBy: user.id,
      });
    } catch (error) {
      // Log error but don't fail the registration process
      console.error("Error saving avatar from token:", error);
    }
  }

  // Send OTP for LOCAL provider
  if (provider === "LOCAL") {
    // Generate and store OTP
    const { otpCode, expiresAt } = generateOTPWithExpiration();
    await storeOTP(user.id, otpCode, expiresAt);

    // Send OTP email
    const userName = user.name || email.split("@")[0] || "User";
    const template = emailTemplates.otpVerification(userName, otpCode);

    await sendEmail({
      to: user.email,
      subject: template.subject,
      html: template.html,
    });
  }

  // Generate tokens
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
  });

  // Set refresh token in cookie (for web browsers)
  setRefreshTokenCookie(res, refreshToken);
  console.log("✅ Refresh token set in cookie for web browsers (registration)");

  // Update salesman metrics if user was created by a salesman
  if (createdBy) {
    try {
      // Find the salesman who created this user
      const salesman = await prisma.salesman.findUnique({
        where: { userId: createdBy },
      });

      if (salesman) {
        // Update the salesman's metrics based on user role
        const updateData: any = {};

        if (user.role === "VENDOR") {
          updateData.vendorsOnboarded = { increment: 1 };
        } else if (user.role === "USER") {
          updateData.usersOnboarded = { increment: 1 };
        }

        if (Object.keys(updateData).length > 0) {
          await prisma.salesman.update({
            where: { userId: createdBy },
            data: updateData,
          });
        }
      }
    } catch (error) {
      console.error("Error updating salesman metrics:", error);
      // Don't fail the registration if metrics update fails
    }
  }

  // Get user's profile picture
  const profilePicture = await getUserProfilePicture(user.id);

  console.log("🎉 Registration successful, returning tokens");
  res.status(201).json({
    success: true,
    message:
      provider === "LOCAL"
        ? existingUser && !existingUser.isEmailVerified
          ? "Registration updated successfully. Please check your email for OTP verification."
          : "Registration successful. Please check your email for OTP verification."
        : existingUser && !existingUser.isEmailVerified
        ? "Registration updated successfully."
        : "Registration successful",
    data: {
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        provider: (user as any).provider,
        profilePicture: profilePicture?.url || null,
        isEmailVerified: user.isEmailVerified,
        vendor: user.vendor,
        salesman: user.salesman,
        admin: user.admin,
      },
      accessToken,
      refreshToken, // Also return in response body for React Native
    },
  });
};

// Helper function to send verification email
const sendVerificationEmail = async (
  email: string,
  userId: string
): Promise<void> => {
  const verificationToken = crypto.randomBytes(32).toString("hex");

  // Store verification token (you might want to add this to your User model)
  await prisma.user.update({
    where: { id: userId },
    data: {
      // verificationToken
    },
  });

  const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
  const userName = email.split("@")[0] || "User";
  const template = emailTemplates.welcome(userName, verificationUrl);

  await sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
  });
};

// Send OTP for email verification
export const sendOTP = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  if (!email) {
    throw new CustomError("Email is required", 400);
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new CustomError("User not found", 404);
  }

  // Check if user is already verified
  if (user.isEmailVerified) {
    throw new CustomError("Email is already verified", 400);
  }

  // Check if user already has a valid OTP
  const hasValid = await hasValidOTP(user.id);
  if (hasValid) {
    throw new CustomError(
      "OTP already sent. Please wait before requesting a new one.",
      400
    );
  }

  // Generate and store OTP
  const { otpCode, expiresAt } = generateOTPWithExpiration();
  await storeOTP(user.id, otpCode, expiresAt);

  // Send OTP email
  const userName = user.name || email.split("@")[0] || "User";
  const template = emailTemplates.otpVerification(userName, otpCode);

  await sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
  });

  res.json({
    success: true,
    message: "OTP sent successfully to your email address",
    data: {
      email: user.email,
      expiresAt: expiresAt.toISOString(),
    },
  });
};

// Verify OTP
export const verifyOTPCode = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, otpCode } = req.body;

  if (!email || !otpCode) {
    throw new CustomError("Email and OTP code are required", 400);
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new CustomError("User not found", 404);
  }

  // Verify OTP
  await verifyOTP(user.id, otpCode);

  // Update user status to ACTIVE and mark email as verified
  console.log(
    "Before update - User status:",
    user.status,
    "isEmailVerified:",
    user.isEmailVerified
  );

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      isEmailVerified: true,
      status: UserStatus.ACTIVE,
    },
  });

  console.log(
    "After update - User status:",
    updatedUser.status,
    "isEmailVerified:",
    updatedUser.isEmailVerified
  );

  res.json({
    success: true,
    message: "Email verified successfully. Your account is now active.",
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
      },
    },
  });
};

// Resend OTP
export const resendOTP = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  if (!email) {
    throw new CustomError("Email is required", 400);
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new CustomError("User not found", 404);
  }

  // Check if user is already verified
  if (user.isEmailVerified) {
    throw new CustomError("Email is already verified", 400);
  }

  // Clear existing OTP and generate new one
  await clearOTP(user.id);
  const { otpCode, expiresAt } = generateOTPWithExpiration();
  await storeOTP(user.id, otpCode, expiresAt);

  // Send new OTP email
  const userName = user.name || email.split("@")[0] || "User";
  const template = emailTemplates.otpResend(userName, otpCode);

  await sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
  });

  res.json({
    success: true,
    message: "New OTP sent successfully to your email address",
    data: {
      email: user.email,
      expiresAt: expiresAt.toISOString(),
    },
  });
};

// Check username availability
export const checkUsername = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { username } = req.params;

  if (!username) {
    throw new CustomError("Username is required", 400);
  }

  const { isUsernameAvailable, isUsernameReserved, validateUsernameFormat } =
    await import("@/utils/usernameUtils");

  // Check format
  if (!validateUsernameFormat(username)) {
    res.json({
      success: true,
      data: {
        available: false,
        reason: "invalid_format",
        message:
          "Username must start with a letter and contain only lowercase letters, numbers, underscores, and hyphens (5-30 characters)",
      },
    });
    return;
  }

  // Check if reserved
  if (isUsernameReserved(username)) {
    res.json({
      success: true,
      data: {
        available: false,
        reason: "reserved",
        message: "This username is reserved and cannot be used",
      },
    });
    return;
  }

  // Check availability
  const available = await isUsernameAvailable(username);

  res.json({
    success: true,
    data: {
      available,
      reason: available ? null : "taken",
      message: available
        ? "Username is available"
        : "This username is already taken",
    },
  });
};

// Resend OTP for vendor verification
export const resendVendorOTP = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { vendorId } = req.params;

  try {
    // Find the vendor user
    const user = await prisma.user.findUnique({
      where: { id: vendorId },
      select: {
        id: true,
        name: true,
        email: true,
        isEmailVerified: true,
        status: true,
      },
    });

    if (!user) {
      throw new CustomError("Vendor not found", 404);
    }

    // Check if already verified
    if (user.isEmailVerified) {
      throw new CustomError("Email is already verified", 400);
    }

    // Generate and store new OTP
    const { generateOTPWithExpiration, storeOTP } = await import(
      "@/utils/otpUtils"
    );

    const { otpCode, expiresAt } = generateOTPWithExpiration();
    await storeOTP(user.id, otpCode, expiresAt);

    // Send OTP email
    const userName = user.name || user.email.split("@")[0] || "User";
    const template = emailTemplates.otpVerification(userName, otpCode);

    await sendEmail({
      to: user.email,
      subject: template.subject,
      html: template.html,
    });

    res.json({
      success: true,
      message: "OTP sent successfully to vendor's email",
      data: {
        vendorId: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to resend OTP",
      });
    }
  }
};

// Update username
export const updateUsername = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { username } = req.body;
  const userId = req.user!.id;

  if (!username) {
    throw new CustomError("Username is required", 400);
  }

  // Validate username
  const { validateUsername: validateUsernameUtil, normalizeUsername } =
    await import("@/utils/usernameUtils");
  await validateUsernameUtil(username, userId);

  // Update username
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      username: normalizeUsername(username),
    },
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      role: true,
    },
  });

  res.json({
    success: true,
    message: "Username updated successfully",
    data: {
      user: updatedUser,
    },
  });
};

// Change password
export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user!.id;

  console.log("🔐 Change password request received for user:", userId);
  console.log("📝 Request body:", {
    currentPassword: currentPassword ? "***" : "empty",
    newPassword: newPassword ? "***" : "empty",
  });

  if (!currentPassword || !newPassword) {
    console.log("❌ Missing required fields");
    throw new CustomError(
      "Current password and new password are required",
      400
    );
  }

  // Get user with password
  console.log("🔍 Fetching user from database...");
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      password: true,
      email: true,
      name: true,
    },
  });

  if (!user) {
    console.log("❌ User not found");
    throw new CustomError("User not found", 404);
  }

  if (!user.password) {
    console.log("❌ User does not have a password set");
    throw new CustomError("User does not have a password set", 400);
  }

  console.log("✅ User found, verifying current password...");

  // Verify current password
  const isCurrentPasswordValid = await bcrypt.compare(
    currentPassword,
    user.password
  );
  if (!isCurrentPasswordValid) {
    console.log("❌ Current password is incorrect");
    throw new CustomError("Current password is incorrect", 400);
  }

  console.log(
    "✅ Current password verified, checking if new password is different..."
  );

  // Check if new password is different from current password
  const isSamePassword = await bcrypt.compare(newPassword, user.password);
  if (isSamePassword) {
    console.log("❌ New password is same as current password");
    throw new CustomError(
      "New password must be different from current password",
      400
    );
  }

  console.log("✅ New password is different, hashing new password...");

  // Hash new password
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || "12");
  const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

  console.log("✅ Password hashed, updating user in database...");

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedNewPassword,
    },
  });

  console.log("✅ Password updated successfully");

  res.json({
    success: true,
    message: "Password changed successfully",
  });
};

// Change email - initiate process
export const changeEmail = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { newEmail, password } = req.body;
  const userId = req.user!.id;

  console.log("📧 Change email request received for user:", userId);
  console.log("📝 Request body:", {
    newEmail: newEmail ? "***" : "empty",
    password: password ? "***" : "empty",
  });

  if (!newEmail || !password) {
    console.log("❌ Missing required fields");
    throw new CustomError("New email and current password are required", 400);
  }

  // Get user with password
  console.log("🔍 Fetching user from database...");
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      password: true,
      name: true,
    },
  });

  if (!user) {
    console.log("❌ User not found");
    throw new CustomError("User not found", 404);
  }

  if (!user.password) {
    console.log("❌ User does not have a password set");
    throw new CustomError("User does not have a password set", 400);
  }

  console.log("✅ User found, verifying current password...");

  // Verify current password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    console.log("❌ Current password is incorrect");
    throw new CustomError("Current password is incorrect", 400);
  }

  console.log(
    "✅ Current password verified, checking if new email is different..."
  );

  // Check if new email is different from current email
  if (user.email === newEmail) {
    console.log("❌ New email is same as current email");
    throw new CustomError(
      "New email must be different from current email",
      400
    );
  }

  // Check if new email is already in use
  const existingUser = await prisma.user.findUnique({
    where: { email: newEmail },
    select: { id: true, isEmailVerified: true },
  });

  if (existingUser) {
    console.log("❌ Email already in use");
    throw new CustomError("Email is already in use by another account", 409);
  }

  console.log("✅ New email is available, generating OTP...");

  // Generate and store OTP for email change
  const { otpCode, expiresAt } = generateOTPWithExpiration();
  await storeOTP(user.id, otpCode, expiresAt);

  // Send OTP email to new email address
  const userName = user.name || user.email.split("@")[0] || "User";
  const template = emailTemplates.otpVerification(userName, otpCode);

  await sendEmail({
    to: newEmail,
    subject: `Email Change Verification - ${template.subject}`,
    html: template.html,
  });

  console.log("✅ OTP sent to new email address");

  res.json({
    success: true,
    message:
      "OTP sent to your new email address. Please verify to complete email change.",
    data: {
      newEmail,
      expiresAt: expiresAt.toISOString(),
    },
  });
};

// Verify email change with OTP
export const verifyEmailChange = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { newEmail, otpCode } = req.body;
  const userId = req.user!.id;

  console.log("📧 Verify email change request received for user:", userId);
  console.log("📝 Request body:", {
    newEmail: newEmail ? "***" : "empty",
    otpCode: otpCode ? "***" : "empty",
  });

  if (!newEmail || !otpCode) {
    console.log("❌ Missing required fields");
    throw new CustomError("New email and OTP code are required", 400);
  }

  // Get user
  console.log("🔍 Fetching user from database...");
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  if (!user) {
    console.log("❌ User not found");
    throw new CustomError("User not found", 404);
  }

  console.log("✅ User found, verifying OTP...");

  // Verify OTP
  const isValidOTP = await verifyOTP(user.id, otpCode);
  if (!isValidOTP) {
    console.log("❌ Invalid OTP");
    throw new CustomError("Invalid or expired OTP code", 400);
  }

  console.log("✅ OTP verified, updating email...");

  // Update user email
  await prisma.user.update({
    where: { id: userId },
    data: {
      email: newEmail,
      isEmailVerified: true, // Mark as verified since they verified the OTP
    },
  });

  // Clear OTP after successful verification
  await clearOTP(user.id);

  console.log("✅ Email updated successfully");

  res.json({
    success: true,
    message: "Email changed successfully",
    data: {
      newEmail,
    },
  });
};
