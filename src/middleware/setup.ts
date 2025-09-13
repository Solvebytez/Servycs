import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env, isDevelopment } from '@/config/env';
import { corsConfig } from '@/config/cors';
import { helmetConfig } from '@/config/helmet';
import { rateLimitConfig } from '@/config/rateLimit';
import { logger } from '@/utils/logger';

export const setupMiddleware = (app: express.Application): void => {
  // Security middleware
  app.use(helmet(helmetConfig));

  // CORS configuration
  app.use(cors(corsConfig));

  // Rate limiting
  app.use('/api/', rateLimit(rateLimitConfig));

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Cookie parser
  app.use(cookieParser(env.COOKIE_SECRET));

  // Compression middleware
  app.use(compression());

  // Logging middleware
  if (isDevelopment) {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined', {
      stream: {
        write: (message: string) => logger.info(message.trim())
      }
    }));
  }
};
