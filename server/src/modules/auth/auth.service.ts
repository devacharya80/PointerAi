import { prisma } from "../../lib/prisma.js";
import type { RegisterInput, LoginInput } from "./auth.type.js";
import bcrypt from "bcryptjs";
import { issueTokens, hashToken } from "./token.service.js";
import { AppError } from "../../lib/AppError.js";
import { verifyRefreshToken } from "./token.utils.js";

export const register = async (userData: RegisterInput) => {
  const hashedPass = await bcrypt.hash(userData.password, 12);

  const result = await prisma.$transaction(
    async (tx) => {
      const email = userData.email.toLowerCase().trim();

      const existingUser = await tx.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new AppError("User already exists", 409);
      }

      const newUser = await tx.user.create({
        data: {
          ...userData,
          email,
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
    where: { email },
  });

  const invalidCredentials = new AppError("Invalid email or password", 401);

  if (!user || !user.password) {
    throw invalidCredentials;
  }

  const isPasswordValid = await bcrypt.compare(userData.password, user.password);

  if (!isPasswordValid) {
    throw invalidCredentials;
  }

  const { password, ...userWithoutPassword } = user;

  const tokens = await issueTokens(userWithoutPassword.id, userWithoutPassword.email);

  return { data: userWithoutPassword, ...tokens };
};

export const refreshAccessToken = async (token: string) => {
  // 1. Verify signature and expiry. This also gives us the userId.
  const { userId } = verifyRefreshToken(token);

  const tokenHash = hashToken(token);

  // 2. Look up the exact token by hash.
  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      userId: true,
      expiresAt: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  // 3. Reuse detection.
  // The signature is valid, but this token was already rotated away.
  // Someone holds a copy of a spent token, so revoke every session for the user.
  if (!stored) {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });

    throw new AppError("Session expired. Please sign in again.", 401);
  }

  // 4. Expired in the database.
  if (stored.expiresAt.getTime() < Date.now()) {
    await prisma.refreshToken.delete({
      where: { id: stored.id },
    });

    throw new AppError("Refresh token has expired", 401);
  }

  // 5. Rotate: spend this token. Delete by id, after the ownership check above.
  await prisma.refreshToken.delete({
    where: { id: stored.id },
  });

  // 6. Issue a fresh access token and a fresh refresh token.
  const { accessToken, refreshToken } = await issueTokens(
    stored.user.id,
    stored.user.email,
  );

  return {
    accessToken,
    refreshToken,
    user: stored.user,
  };
};

export const logout = async (token: string) => {
  await prisma.refreshToken.deleteMany({
    where: { tokenHash: hashToken(token) },
  });
};