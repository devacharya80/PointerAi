import type { JWTPayload } from "./auth.type.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { AppError } from "../../lib/AppError.js";

export interface VerifiedRefreshPayload extends JWTPayload {
  jti: string;
}

export const generateAccessToken = (payload: JWTPayload): string => {
  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is not configured");
  }

  return jwt.sign(payload, secret, { expiresIn: "15m" });
};

export const generateRefreshToken = (payload: JWTPayload): string => {
  const secret = process.env.JWT_REFRESH_SECRET;

  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET is not configured");
  }

  // jti makes every refresh token unique, even when issued in the same second.
  return jwt.sign(
    { ...payload, jti: crypto.randomUUID() },
    secret,
    { expiresIn: "7d" },
  );
};

const verifyToken = (
  token: string,
  secret: string,
  errorMessage: string,
): JWTPayload & { jti?: string } => {
  try {
    const decoded = jwt.verify(token, secret);

    if (
      typeof decoded === "string" ||
      typeof decoded.userId !== "string" ||
      typeof decoded.email !== "string"
    ) {
      throw new Error("Invalid token payload");
    }

    return {
      userId: decoded.userId,
      email: decoded.email,
      jti: typeof decoded.jti === "string" ? decoded.jti : undefined,
    };
  } catch {
    throw new AppError(errorMessage, 401);
  }
};

export const verifyAccessToken = (token: string): JWTPayload => {
  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is not configured");
  }

  const { userId, email } = verifyToken(
    token,
    secret,
    "Invalid or expired access token",
  );

  return { userId, email };
};

export const verifyRefreshToken = (token: string): JWTPayload & { jti: string } => {
  const secret = process.env.JWT_REFRESH_SECRET;

  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET is not configured");
  }

  const payload = verifyToken(
    token,
    secret,
    "Invalid or expired refresh token",
  );

  if (!payload.jti) {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  return { userId: payload.userId, email: payload.email, jti: payload.jti };
};