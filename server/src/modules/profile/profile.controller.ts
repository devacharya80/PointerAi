import type { Request, Response } from "express";

import { asyncHandler } from "../../lib/asyncHandler.js";
import { getUserId } from "../../lib/getUserId.js";

import {
  updateProfile,
  getProfile,
} from "./profile.service.js";

import { profileSchema } from "./profile.schema.js";


export const updateProfileController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = getUserId(req);

    const validatedProfile = profileSchema.parse(req.body);

    const updatedProfile = await updateProfile(
      userId,
      validatedProfile
    );

    return res.status(200).json({
      message: "Profile updated",
      data: updatedProfile,
    });
  },
);


export const getProfileController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = getUserId(req);

    const profile = await getProfile(userId);

    return res.status(200).json({
      message: "Profile fetched",
      data: profile,
    });
  }
);