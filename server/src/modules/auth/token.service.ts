import { prisma } from "../../lib/prisma.js";
import { generateAccessToken, generateRefreshToken } from "./token.utils.js";
import crypto from "crypto";

export const hashToken = (token: string): string =>
  crypto.createHash("sha256").update(token).digest("hex");

export const issueTokens = async (userId: string, email: string) => {
  const accessToken = generateAccessToken({ userId, email });
  const refreshToken = generateRefreshToken({ userId, email });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(refreshToken),
      expiresAt,
    },
  });

  return { accessToken, refreshToken };
};