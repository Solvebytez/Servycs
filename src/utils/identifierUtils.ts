import { prisma } from "@/config/database";
import { normalizeUsername } from "./usernameUtils";

/**
 * Check if identifier is an email (contains @)
 */
export const isEmail = (identifier: string): boolean => {
  return identifier.includes("@");
};

/**
 * Find user by identifier (email or username)
 */
export const findUserByIdentifier = async (identifier: string) => {
  const trimmedIdentifier = identifier.trim();

  if (isEmail(trimmedIdentifier)) {
    // Search by email
    return await prisma.user.findUnique({
      where: { email: trimmedIdentifier.toLowerCase() },
      include: {
        vendor: true,
        salesman: true,
        admin: true,
      },
    });
  } else {
    // Search by username
    const normalizedUsername = normalizeUsername(trimmedIdentifier);
    return await prisma.user.findUnique({
      where: { username: normalizedUsername },
      include: {
        vendor: true,
        salesman: true,
        admin: true,
      },
    });
  }
};

/**
 * Get identifier type for logging/debugging
 */
export const getIdentifierType = (identifier: string): "email" | "username" => {
  return isEmail(identifier) ? "email" : "username";
};
