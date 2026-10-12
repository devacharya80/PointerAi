import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "../../lib/redis.js";
const isProduction = process.env.NODE_ENV === "production";

export const aiRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 m"),
  analytics: true,
  prefix: "pointerai:ratelimit:ai",
});

export const appRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  analytics: true,
  prefix: "pointerai:ratelimit:app",
});


export const authRateLimiter = new Ratelimit({
  redis,
  limiter: isProduction
    ? Ratelimit.slidingWindow(5, "1 m")
    : Ratelimit.slidingWindow(100, "1 m"),
  prefix: "auth",
});