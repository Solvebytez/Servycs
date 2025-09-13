import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';

/**
 * Add a token to the blacklist
 * Token will automatically expire after 24 hours
 */
export const blacklistToken = async (token: string): Promise<void> => {
  try {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours from now

    await prisma.blacklistToken.create({
      data: {
        token,
        expiresAt
      }
    });

    logger.info('Token blacklisted successfully', { tokenLength: token.length });
  } catch (error) {
    // If token already exists, ignore the error (already blacklisted)
    if ((error as any)?.code === 'P2002') {
      logger.debug('Token already blacklisted');
      return;
    }
    
    logger.error('Failed to blacklist token:', error);
    throw error;
  }
};

/**
 * Check if a token is blacklisted
 */
export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  try {
    const blacklistedToken = await prisma.blacklistToken.findUnique({
      where: { token },
      select: { id: true }
    });

    return !!blacklistedToken;
  } catch (error) {
    logger.error('Failed to check blacklisted token:', error);
    // In case of error, allow the request to proceed
    // but log the error for investigation
    return false;
  }
};

/**
 * Clean up expired blacklisted tokens
 * This should be called periodically (e.g., via cron job)
 */
export const cleanupExpiredTokens = async (): Promise<number> => {
  try {
    const result = await prisma.blacklistToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });

    logger.info(`Cleaned up ${result.count} expired blacklisted tokens`);
    return result.count;
  } catch (error) {
    logger.error('Failed to cleanup expired tokens:', error);
    throw error;
  }
};

/**
 * Get count of blacklisted tokens (for monitoring)
 */
export const getBlacklistedTokenCount = async (): Promise<number> => {
  try {
    return await prisma.blacklistToken.count();
  } catch (error) {
    logger.error('Failed to get blacklisted token count:', error);
    return 0;
  }
};

/**
 * Remove a specific token from blacklist (if needed for debugging)
 */
export const removeTokenFromBlacklist = async (token: string): Promise<boolean> => {
  try {
    const result = await prisma.blacklistToken.delete({
      where: { token }
    });

    logger.info('Token removed from blacklist', { tokenLength: token.length });
    return true;
  } catch (error) {
    if ((error as any)?.code === 'P2025') {
      // Token not found in blacklist
      return false;
    }
    
    logger.error('Failed to remove token from blacklist:', error);
    throw error;
  }
};
