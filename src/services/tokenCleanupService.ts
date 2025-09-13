import { cleanupExpiredTokens, getBlacklistedTokenCount } from '@/utils/blacklistToken';
import { logger } from '@/utils/logger';

/**
 * Token cleanup service
 * Handles periodic cleanup of expired blacklisted tokens
 */
export class TokenCleanupService {
  private static instance: TokenCleanupService;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  private constructor() {}

  public static getInstance(): TokenCleanupService {
    if (!TokenCleanupService.instance) {
      TokenCleanupService.instance = new TokenCleanupService();
    }
    return TokenCleanupService.instance;
  }

  /**
   * Start the cleanup service
   * @param intervalHours - How often to run cleanup (in hours), default: 6 hours
   */
  public start(intervalHours: number = 6): void {
    if (this.isRunning) {
      logger.warn('Token cleanup service is already running');
      return;
    }

    const intervalMs = intervalHours * 60 * 60 * 1000; // Convert hours to milliseconds

    // Run initial cleanup
    this.runCleanup();

    // Schedule periodic cleanup
    this.cleanupInterval = setInterval(() => {
      this.runCleanup();
    }, intervalMs);

    this.isRunning = true;
    logger.info(`Token cleanup service started with ${intervalHours} hour intervals`);
  }

  /**
   * Stop the cleanup service
   */
  public stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.isRunning = false;
    logger.info('Token cleanup service stopped');
  }

  /**
   * Run cleanup manually
   */
  public async runCleanup(): Promise<void> {
    try {
      const beforeCount = await getBlacklistedTokenCount();
      const deletedCount = await cleanupExpiredTokens();
      const afterCount = await getBlacklistedTokenCount();

      logger.info('Token cleanup completed', {
        beforeCount,
        deletedCount,
        afterCount,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Token cleanup failed:', error);
    }
  }

  /**
   * Get service status
   */
  public getStatus(): { isRunning: boolean; intervalSet: boolean } {
    return {
      isRunning: this.isRunning,
      intervalSet: this.cleanupInterval !== null
    };
  }
}

// Export singleton instance
export const tokenCleanupService = TokenCleanupService.getInstance();
