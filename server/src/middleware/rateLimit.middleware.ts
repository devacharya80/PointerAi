import type { Request, Response, NextFunction } from "express";
import { getUserId } from "../lib/getUserId.js";
import { aiRateLimiter, appRateLimiter, authRateLimiter } from "./limiter_instance/instances.js";
import { asyncHandler } from "../lib/asyncHandler.js";

export const aiRateLimitMiddleware = asyncHandler( async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = getUserId(req);

  const { success, limit, remaining, reset } =
    await aiRateLimiter.limit(userId);

  res.setHeader("X-RateLimit-Limit", limit);
  res.setHeader("X-RateLimit-Remaining", remaining);
  res.setHeader("X-RateLimit-Reset", reset);

  if (!success) {
    const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));

    res.setHeader("Retry-After", retryAfter);

    return res.status(429).json({
      message: "Too many requests. Please try again later.",
      retryAfter,
    });
  }

  next();
});

export const authRateLimitMiddleware = asyncHandler( async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const ip = req.ip ?? "unknown";

  const { success, limit, remaining, reset } = await authRateLimiter.limit(ip);

  res.setHeader("X-RateLimit-Limit", limit);
  res.setHeader("X-RateLimit-Remaining", remaining);
  res.setHeader("X-RateLimit-Reset", reset);

  if (!success) {
    const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));

    res.setHeader("Retry-After", retryAfter);

    return res.status(429).json({
      message: "Too many authentication attempts. Please try again later.",
      retryAfter,
    });
  }

  next();
});

export const appRateLimitMiddleware = asyncHandler( async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const ip = req.ip ?? "unknown";

  const { success, limit, remaining, reset } =
    await appRateLimiter.limit(ip);

  res.setHeader("X-RateLimit-Limit", limit);
  res.setHeader("X-RateLimit-Remaining", remaining);
  res.setHeader("X-RateLimit-Reset", reset);

  if (!success) {
    const retryAfter = Math.max(
      1,
      Math.ceil((reset - Date.now()) / 1000),
    );

    res.setHeader("Retry-After", retryAfter);

    return res.status(429).json({
      message: "Too many requests. Please try again later.",
      retryAfter,
    });
  }

  next();
});