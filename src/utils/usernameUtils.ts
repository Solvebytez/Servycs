import { prisma } from "@/config/database";
import { CustomError } from "@/middleware/errorHandler";

/**
 * List of reserved usernames that cannot be used
 */
const RESERVED_USERNAMES = [
  "admin",
  "administrator",
  "root",
  "system",
  "support",
  "help",
  "info",
  "contact",
  "api",
  "www",
  "mail",
  "email",
  "user",
  "users",
  "vendor",
  "vendors",
  "salesman",
  "salesmen",
  "listro",
  "official",
  "staff",
  "moderator",
  "mod",
  "owner",
  "webmaster",
  "postmaster",
  "hostmaster",
  "abuse",
  "noreply",
  "no-reply",
  "security",
  "privacy",
  "terms",
  "about",
  "login",
  "signup",
  "register",
  "logout",
  "profile",
  "settings",
  "dashboard",
  "account",
];

/**
 * Username validation regex
 * - Only lowercase letters, numbers, underscores, and hyphens
 * - Must start with a letter
 * - 5-30 characters
 */
const USERNAME_REGEX = /^[a-z][a-z0-9_-]{4,29}$/;

/**
 * Validate username format
 */
export const validateUsernameFormat = (username: string): boolean => {
  return USERNAME_REGEX.test(username);
};

/**
 * Check if username is reserved
 */
export const isUsernameReserved = (username: string): boolean => {
  return RESERVED_USERNAMES.includes(username.toLowerCase());
};

/**
 * Check if username is available (not taken by another user)
 */
export const isUsernameAvailable = async (
  username: string,
  excludeUserId?: string
): Promise<boolean> => {
  const existingUser = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    select: { id: true },
  });

  // If no user found, username is available
  if (!existingUser) {
    return true;
  }

  // If excludeUserId is provided, check if it's the same user (for username updates)
  if (excludeUserId && existingUser.id === excludeUserId) {
    return true;
  }

  return false;
};

/**
 * Validate username completely
 * Throws CustomError if invalid
 */
export const validateUsername = async (
  username: string,
  excludeUserId?: string
): Promise<void> => {
  // Convert to lowercase
  const lowerUsername = username.toLowerCase();

  // Check length
  if (lowerUsername.length < 5) {
    throw new CustomError("Username must be at least 5 characters long", 400);
  }

  if (lowerUsername.length > 30) {
    throw new CustomError("Username must not exceed 30 characters", 400);
  }

  // Check format
  if (!validateUsernameFormat(lowerUsername)) {
    throw new CustomError(
      "Username must start with a letter and contain only lowercase letters, numbers, underscores, and hyphens",
      400
    );
  }

  // Check if reserved
  if (isUsernameReserved(lowerUsername)) {
    throw new CustomError("This username is reserved and cannot be used", 400);
  }

  // Check availability
  const isAvailable = await isUsernameAvailable(lowerUsername, excludeUserId);
  if (!isAvailable) {
    throw new CustomError("This username is already taken", 400);
  }
};

/**
 * Generate username from email
 * Used for auto-generation (Google sign-in)
 */
export const generateUsernameFromEmail = async (
  email: string
): Promise<string> => {
  // Extract local part before @
  const localPart = email.split("@")[0]?.toLowerCase() || "user";

  // Remove special characters and replace with underscores
  let baseUsername = localPart.replace(/[^a-z0-9]/g, "_");

  // Ensure it starts with a letter
  if (!/^[a-z]/.test(baseUsername)) {
    baseUsername = "user_" + baseUsername;
  }

  // Ensure minimum length
  if (baseUsername.length < 5) {
    baseUsername = baseUsername + "_user";
  }

  // Truncate if too long
  if (baseUsername.length > 30) {
    baseUsername = baseUsername.substring(0, 30);
  }

  // Check if available
  let finalUsername = baseUsername;
  let counter = 1;

  while (!(await isUsernameAvailable(finalUsername))) {
    // Append counter if username is taken
    const suffix = `_${counter}`;
    const maxBaseLength = 30 - suffix.length;
    finalUsername = baseUsername.substring(0, maxBaseLength) + suffix;
    counter++;

    // Safety limit to prevent infinite loop
    if (counter > 9999) {
      // Generate random suffix as last resort
      const randomSuffix = Math.floor(Math.random() * 10000);
      finalUsername = baseUsername.substring(0, 25) + `_${randomSuffix}`;
      break;
    }
  }

  return finalUsername;
};

/**
 * Generate username from name
 * Alternative method for auto-generation
 */
export const generateUsernameFromName = async (
  name: string
): Promise<string> => {
  // Convert to lowercase and remove special characters
  let baseUsername = name
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");

  // Ensure it starts with a letter
  if (!/^[a-z]/.test(baseUsername)) {
    baseUsername = "user_" + baseUsername;
  }

  // Ensure minimum length
  if (baseUsername.length < 5) {
    baseUsername = baseUsername + "_user";
  }

  // Truncate if too long
  if (baseUsername.length > 30) {
    baseUsername = baseUsername.substring(0, 30);
  }

  // Check if available and add counter if needed
  let finalUsername = baseUsername;
  let counter = 1;

  while (!(await isUsernameAvailable(finalUsername))) {
    const suffix = `_${counter}`;
    const maxBaseLength = 30 - suffix.length;
    finalUsername = baseUsername.substring(0, maxBaseLength) + suffix;
    counter++;

    if (counter > 9999) {
      const randomSuffix = Math.floor(Math.random() * 10000);
      finalUsername = baseUsername.substring(0, 25) + `_${randomSuffix}`;
      break;
    }
  }

  return finalUsername;
};

/**
 * Normalize username (convert to lowercase and trim)
 */
export const normalizeUsername = (username: string): string => {
  return username.toLowerCase().trim();
};
