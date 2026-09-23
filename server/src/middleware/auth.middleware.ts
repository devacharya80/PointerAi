import type { Request, Response, NextFunction } from "express";
import { AppError } from "../lib/AppError.js";
import { verifyAccessToken } from "../modules/auth/token.utils.js";

export const validateUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Not authenticated", 401);
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new AppError("Not authenticated", 401);
    }

    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err) {
    next(err);
  }
};