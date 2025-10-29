import { CorsOptions } from "cors";
import { env } from "./env";

export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    // Allow localhost for development
    if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
      return callback(null, true);
    }

    // Allow React Native Metro bundler
    if (origin.includes("metro") || origin.includes("react-native")) {
      return callback(null, true);
    }

    // Allow specific origins from environment
    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001",
      env.CORS_ORIGIN,
      env.FRONTEND_URL,
    ].filter(Boolean);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // In development, allow all origins
    if (env.NODE_ENV === "development") {
      return callback(null, true);
    }

    callback(new Error("Not allowed by CORS"));
  },
  credentials: true, // Enable credentials for React Native
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "X-API-Key",
    "Cache-Control",
    "Pragma",
  ],
  exposedHeaders: [
    "Set-Cookie",
    "Authorization",
    "X-Total-Count",
    "X-Page-Count",
  ],
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
};
