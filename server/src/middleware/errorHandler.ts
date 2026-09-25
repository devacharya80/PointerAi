import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

import { AppError } from "../lib/AppError.js";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {

  // Your own application errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
    });
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Invalid request data",
      errors: err.issues,
    });
  }

  // Unknown/unexpected errors
  console.error(err);

  return res.status(500).json({
    message: "Internal server error",
  });
};