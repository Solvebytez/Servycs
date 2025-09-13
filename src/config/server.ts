import { env } from './env';

export const serverConfig = {
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
  apiVersion: env.API_VERSION,
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test'
};
