import type { Request, Response } from "express";
import { z } from "zod";
import { register, login, refreshAccessToken, logout } from "./auth.service.js";
import { registerSchema, loginSchema } from "./auth.schema.js";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { AppError } from "../../lib/AppError.js";
import { issueTokens } from "./token.service.js";
import type { User } from "../../generated/prisma/client.js";
import { createOAuthCode, consumeOAuthCode } from "./oauth-code.service.js";

const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const setRefreshCookie = (res: Response, token: string) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: REFRESH_COOKIE_MAX_AGE,
  });
};

const exchangeSchema = z.object({
  code: z.string().min(1).max(200),
});

export const registerController = asyncHandler(async (req: Request, res: Response) => {
  const validatedUserData = registerSchema.safeParse(req.body);

  if (!validatedUserData.success) {
    return res.status(400).json({
      message: "Invalid input",
      errors: validatedUserData.error.flatten().fieldErrors,
    });
  }

  const newUser = await register(validatedUserData.data);

  setRefreshCookie(res, newUser.refreshToken);

  return res.status(201).json({
    message: "User created",
    user: newUser.data,
    accessToken: newUser.accessToken,
  });
});

export const loginController = asyncHandler(async (req: Request, res: Response) => {
  const validatedUserData = loginSchema.safeParse(req.body);

  if (!validatedUserData.success) {
    return res.status(400).json({
      message: "Invalid input",
      errors: validatedUserData.error.flatten().fieldErrors,
    });
  }

  const loggedUser = await login(validatedUserData.data);

  setRefreshCookie(res, loggedUser.refreshToken);

  return res.status(200).json({
    message: "User logged-In",
    user: loggedUser.data,
    accessToken: loggedUser.accessToken,
  });
});

export const refreshController = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken: string | undefined = req.cookies?.refreshToken;

  if (!refreshToken) {
    throw new AppError("No refresh token provided", 401);
  }

  const { accessToken, refreshToken: rotatedToken, user } =
    await refreshAccessToken(refreshToken);

  // Rotation: the old cookie is now spent. Replace it with the new one.
  setRefreshCookie(res, rotatedToken);

  return res.status(200).json({ accessToken, user });
});

export const logoutController = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken: string | undefined = req.cookies?.refreshToken;

  if (refreshToken) {
    await logout(refreshToken);
  }

  res.clearCookie("refreshToken");

  return res.status(200).json({ message: "Logged out" });
});

export const googleCallbackController = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as User;

  const tokens = await issueTokens(user.id, user.email);

  setRefreshCookie(res, tokens.refreshToken);

  const code = await createOAuthCode({
    accessToken: tokens.accessToken,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    },
  });

  res.redirect(`${process.env.CLIENT_URL}/auth/callback?code=${encodeURIComponent(code)}`);
});

export const exchangeCodeController = asyncHandler(async (req: Request, res: Response) => {
  const parsed = exchangeSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError("Invalid exchange code", 400);
  }

  const payload = await consumeOAuthCode(parsed.data.code);

  if (!payload) {
    throw new AppError("Code is invalid or expired", 401);
  }

  return res.status(200).json({
    accessToken: payload.accessToken,
    user: payload.user,
  });
});