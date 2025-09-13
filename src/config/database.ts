import { PrismaClient } from '@prisma/client';
import { env } from './env';
import { logger } from '@/utils/logger';

// Initialize Prisma Client
export const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  errorFormat: 'pretty',
});

// Connect to database
export const connectDB = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info('✅ Connected to MongoDB successfully');
  } catch (error) {
    logger.error('❌ Failed to connect to MongoDB:', error);
    throw error;
  }
};

// Disconnect from database
export const disconnectDB = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info('✅ Disconnected from MongoDB successfully');
  } catch (error) {
    logger.error('❌ Failed to disconnect from MongoDB:', error);
    throw error;
  }
};

// Graceful shutdown
process.on('beforeExit', async () => {
  await disconnectDB();
});

process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDB();
  process.exit(0);
});
