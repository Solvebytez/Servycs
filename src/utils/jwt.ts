import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { UserRole } from "@prisma/client";
import { env } from "@/config/env";
import crypto from "crypto";

interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  sessionId?: string;
}

interface RefreshTokenPayload {
  userId: string;
  tokenVersion?: number;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return (jwt.sign as any)(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  });
};

export const generateRefreshToken = (payload: RefreshTokenPayload): string => {
  return (jwt.sign as any)(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return (jwt.verify as any)(token, env.JWT_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return (jwt.verify as any)(
    token,
    env.JWT_REFRESH_SECRET
  ) as RefreshTokenPayload;
};

export const setRefreshTokenCookie = (res: Response, token: string): void => {
  res.cookie("refreshToken", token, {
    httpOnly: process.env.COOKIE_HTTP_ONLY === "true",
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: process.env.COOKIE_SAME_SITE as "lax" | "strict" | "none",
    domain: process.env.COOKIE_DOMAIN,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: "/api/v1/auth/refresh",
  });
};

export const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie("refreshToken", {
    httpOnly: process.env.COOKIE_HTTP_ONLY === "true",
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: process.env.COOKIE_SAME_SITE as "lax" | "strict" | "none",
    domain: process.env.COOKIE_DOMAIN,
    path: "/api/v1/auth/refresh",
  });
};

export const extractTokenFromHeader = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
};

// Generate a unique session ID for single device login
export const generateSessionId = (): string => {
  return crypto.randomBytes(32).toString("hex");
};
