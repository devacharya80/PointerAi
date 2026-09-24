import type { JWTPayload } from "./auth.type.js";
import jwt from "jsonwebtoken";
import { AppError } from "../../lib/AppError.js";

export const generateAccessToken = (payload: JWTPayload): string => {
  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is not configured");
  }

  return jwt.sign(payload, secret, {
    expiresIn: "15m",
  });
};

export const generateRefreshToken = (payload: JWTPayload): string => {
  const secret = process.env.JWT_REFRESH_SECRET;

  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET is not configured");
  }

  return jwt.sign(payload, secret, {
    expiresIn: "7d",
  });
};

const verifyToken = (
  token: string,
  secret: string,
  errorMessage: string,
): JWTPayload => {
  try {
    const decodedPayload = jwt.verify(token, secret);

    if (
      typeof decodedPayload === "string" ||
      typeof decodedPayload.userId !== "string" ||
      typeof decodedPayload.email !== "string"
    ) {
      throw new Error("Invalid token payload");
    }

    return {
      userId: decodedPayload.userId,
      email: decodedPayload.email,
    };
  } catch {
    throw new AppError(errorMessage,401);
  }
};

export const verifyAccessToken = (token: string): JWTPayload => {
  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is not configured");
  }

  return verifyToken(token, secret, "Invalid or expired access token");
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  const secret = process.env.JWT_REFRESH_SECRET;

  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET is not configured");
  }

  return verifyToken(token, secret, "Invalid or expired refresh token");
};