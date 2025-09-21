import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { CustomError } from "./errorHandler";

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // DEBUG: Log the request data
  console.log("🔍 BACKEND DEBUG - Request received:");
  console.log("URL:", req.url);
  console.log("Method:", req.method);
  console.log("Body:", JSON.stringify(req.body, null, 2));
  console.log("Headers:", req.headers);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log("❌ BACKEND DEBUG - Validation errors:");
    console.log("Errors array:", errors.array());
    const errorMessages = errors.array().map((error) => error.msg);
    console.log("Error messages:", errorMessages);
    throw new CustomError(errorMessages.join(", "), 400);
  }

  console.log("✅ BACKEND DEBUG - Validation passed");
  next();
};
