import { Request, Response, NextFunction } from "express";
import { UserRole } from "@prisma/client";
import jwt from "jsonwebtoken";
import { verifyAccessToken, extractTokenFromHeader } from "@/utils/jwt";
import { prisma } from "@/config/database";
import { CustomError } from "./errorHandler";
import { isTokenBlacklisted } from "@/utils/blacklistToken";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req);

    if (!token) {
      throw new CustomError("Access token required", 401);
    }

    // Check if token is blacklisted
    const isBlacklisted = await isTokenBlacklisted(token);
    if (isBlacklisted) {
      throw new CustomError(
        "Token has been invalidated. Please login again.",
        401
      );
    }

    const decoded = verifyAccessToken(token);

    // Check if user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      throw new CustomError("User not found", 401);
    }

    if (user.status !== "ACTIVE") {
      throw new CustomError("Account is not active", 401);
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error instanceof CustomError) {
      next(error);
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new CustomError("Token expired. Please login again.", 401));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new CustomError("Invalid token", 401));
    } else {
      next(new CustomError("Invalid token", 401));
    }
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      next(new CustomError("Authentication required", 401));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new CustomError("Insufficient permissions", 403));
      return;
    }

    next();
  };
};

export const requireRole = (role: UserRole) => {
  return authorize(role);
};

export const requireAdmin = authorize(UserRole.ADMIN);
export const requireVendor = authorize(UserRole.VENDOR);
export const requireSalesman = authorize(UserRole.SALESMAN);
export const requireUser = authorize(UserRole.USER);

// Optional authentication - doesn't throw error if no token
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req);

    if (!token) {
      return next();
    }

    // Check if token is blacklisted
    const isBlacklisted = await isTokenBlacklisted(token);
    if (isBlacklisted) {
      return next(); // Don't authenticate but don't throw error either
    }

    const decoded = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
      },
    });

    if (user && user.status === "ACTIVE") {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
      };
    }

    next();
  } catch (error) {
    // Don't throw error for optional auth, just continue
    next();
  }
};
