import { prisma } from "../../lib/prisma.js";
import type { RegisterInput, LoginInput } from "./auth.type.js";
import bcrypt from "bcryptjs";
import { issueTokens } from "./token.service.js";
import { AppError } from "../../lib/AppError.js";
import crypto from "crypto";
import { generateAccessToken, verifyRefreshToken } from "./token.utils.js";


export const register = async (userData: RegisterInput) => {
  const hashedPass = await bcrypt.hash(userData.password, 12);
  const result = await prisma.$transaction(
    async (tx) => {
      const email = userData.email.toLowerCase().trim();

      const existingUser = await tx.user.findUnique({
        where: {
          email,
        },
      });

      if (existingUser) {
        throw new AppError("User already exists", 409);
      }

      const newUser = await tx.user.create({
        data: {
          ...userData,
          email: email,
          password: hashedPass,
        },
        omit: {
          password: true,
        },
      });

      await tx.profile.create({
        data: {
          userId: newUser.id,
          learningGoals: [],
        },
      });
      return newUser;
    },
    {
      maxWait: 5000,
      timeout: 5000,
    },
  );

  const tokens = await issueTokens(result.id, result.email);
  return {
    data: result,
    ...tokens,
  };
};

export const login = async (userData: LoginInput) => {
  const email = userData.email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  const invalidCredentials = new AppError("Invalid email or password", 401);

  if (!user || !user.password) {
    throw invalidCredentials;
  }

  const isPasswordValid = await bcrypt.compare(
    userData.password,
    user.password,
  );

  if (!isPasswordValid) {
    throw invalidCredentials;
  }

  const { password, ...userWithoutPassword } = user;

  const tokens = await issueTokens(
    userWithoutPassword.id,
    userWithoutPassword.email,
  );

  return { data: userWithoutPassword, ...tokens };
};

export const refreshAccessToken = async (token: string) => {
  // 1. Verify JWT signature + expiration
  verifyRefreshToken(token);

  // 2. Hash the raw token
  const hashedRefreshToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  // 3. Find refresh token + its user
  const refreshToken = await prisma.refreshToken.findUnique({
    where: {
      tokenHash: hashedRefreshToken,
    },
    select: {
      expiresAt: true,
      user : {
        select : {
          id : true,
          email : true
        }
      }
    },
  });

  // 4. Token doesn't exist or user doesn't exist
  if (!refreshToken || !refreshToken.user) {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  // 5. Check DB expiration
  if (Date.now() > refreshToken.expiresAt.getTime()) {
    await prisma.refreshToken.delete({
      where: { tokenHash: hashedRefreshToken },
    });
    throw new AppError("Refresh token has expired", 401);
  }

  // 6. Generate a new access token
  return generateAccessToken({
    userId: refreshToken.user.id,
    email: refreshToken.user.email,
  });
};


export const logout = async (token: string) => {
  const hashedRefreshToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  await prisma.refreshToken.deleteMany({
    where: { tokenHash: hashedRefreshToken },
  });
};