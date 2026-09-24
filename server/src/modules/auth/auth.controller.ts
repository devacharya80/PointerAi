import type { Request, Response } from "express";
import { register, login, refreshAccessToken } from "./auth.service.js";
import { registerSchema, loginSchema } from "./auth.schema.js";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { AppError } from "../../lib/AppError.js";

export const registerController = asyncHandler(async (req: Request, res: Response) => {
  const validatedUserData = registerSchema.safeParse(req.body);
  if (!validatedUserData.success) {
    return res.status(400).json({
      message: "Invalid input",
      errors: validatedUserData.error.flatten().fieldErrors,
    });
  }

  const newUser = await register(validatedUserData.data);

  res.cookie("refreshToken", newUser.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

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

  res.cookie("refreshToken", loggedUser.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    message: "User logged-In",
    user: loggedUser.data,
    accessToken: loggedUser.accessToken,
  });
})

export const refreshController = asyncHandler(async(req: Request, res: Response) => {
  const refreshToken: string = req.cookies.refreshToken;

  if(!refreshToken){
    throw new AppError("No refresh token provided", 401)
  }

  const accessToken: string = await refreshAccessToken(refreshToken);

  return res.status(200).json({ accessToken });
})