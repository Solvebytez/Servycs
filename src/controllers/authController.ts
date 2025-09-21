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
  const { name, email, password, phone, role = "USER" } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new CustomError("User with this email already exists", 400);
  }

  // Hash password
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || "12");
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      phone,
      role: role as UserRole,
      status: UserStatus.PENDING,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  // Generate tokens
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
  });

  // Set refresh token in cookie
  setRefreshTokenCookie(res, refreshToken);

  // Send verification email
  await sendVerificationEmail(user.email, user.id);

  res.status(201).json({
    success: true,
    message:
      "User registered successfully. Please check your email for verification.",
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
  const { email, password } = req.body;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      vendor: true,
      salesman: true,
      admin: true,
    },
  });

  if (!user) {
    throw new CustomError("Invalid credentials", 401);
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password!);
  if (!isPasswordValid) {
    throw new CustomError("Invalid credentials", 401);
  }

  // Check if user is active
  if (user.status !== UserStatus.ACTIVE) {
    throw new CustomError(
      "Account is not active. Please verify your email or contact support.",
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

  // Set refresh token in cookie
  setRefreshTokenCookie(res, refreshToken);

  // Get user's profile picture
  const profilePicture = await getUserProfilePicture(user.id);

  res.json({
    success: true,
    message: "Login successful",
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        profilePicture: profilePicture?.url || null,
        vendor: user.vendor,
        salesman: user.salesman,
        admin: user.admin,
      },
      accessToken,
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
  const { refreshToken: token } = req.cookies;

  if (!token) {
    throw new CustomError("Refresh token required", 401);
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as any;

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
      throw new CustomError("Invalid refresh token", 401);
    }

    // Generate new access token with current session ID
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionId: user.currentSessionId || undefined,
    });

    // Generate new refresh token
    const newRefreshToken = generateRefreshToken({
      userId: user.id,
    });

    // Set new refresh token in cookie
    setRefreshTokenCookie(res, newRefreshToken);

    res.json({
      success: true,
      data: {
        accessToken,
      },
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new CustomError("Refresh token expired. Please login again.", 401);
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new CustomError("Invalid refresh token", 401);
    } else {
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

  if (!token) {
    throw new CustomError("Sign-in token is required", 400);
  }

  // Verify the token
  const tokenData = verifySignInToken(token);
  const { email, name, avatar, provider, providerId, password, phone } =
    tokenData;

  // Find existing user
  const existingUser = await prisma.user.findUnique({
    where: { email },
    include: {
      vendor: true,
      salesman: true,
      admin: true,
    },
  });

  // For LOCAL provider login, ensure password is provided
  if (provider === "LOCAL" && !password) {
    throw new CustomError("Password is required for LOCAL provider login", 400);
  }

  // For LOCAL provider, validate password if user exists
  if (provider === "LOCAL" && existingUser) {
    // Check if user has a password (LOCAL users should have passwords)
    if (!existingUser.password) {
      throw new CustomError("Invalid credentials", 401);
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(
      password!,
      existingUser.password
    );
    if (!isPasswordValid) {
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
      user = await prisma.user.create({
        data: {
          email,
          name,
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
  const { email, name, avatar, provider, providerId, password, phone } =
    tokenData;

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
      status: getUserStatusForProvider(provider),
      isEmailVerified: getEmailVerifiedForProvider(provider),
    };

    // Add phone if provided
    if (phone) {
      userData.phone = phone;
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

  // Set refresh token in cookie
  setRefreshTokenCookie(res, refreshToken);

  // Get user's profile picture
  const profilePicture = await getUserProfilePicture(user.id);

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
