import { prisma } from "../../lib/prisma.js";
import { generateAccessToken, generateRefreshToken } from "./token.utils.js";
import crypto from "crypto";

export const issueTokens = async (userId: string, email: string) => {
  const accessToken = generateAccessToken({ userId, email });
  const refreshToken = generateRefreshToken({ userId, email });

  const hashedRefreshToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashedRefreshToken,
      expiresAt,
    },
  });

  return { accessToken, refreshToken };
};