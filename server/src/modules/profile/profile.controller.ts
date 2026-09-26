import type { Request, Response } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { getUserId } from "../../lib/getUserId.js";
import { updateProfile } from "./profile.service.js";
import {profileSchema} from "./profile.schema.js"

export const profileController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId: string = getUserId(req);
    const validatedProfile = profileSchema.safeParse(req.body);

    if (!validatedProfile.success) {
      return res.status(400).json({
        error: validatedProfile.error,
      });
    }

    const updatedProfile = await updateProfile(userId, {
      ...validatedProfile.data,
      academicField: validatedProfile.data.academicField ?? null,
      currentLevel: validatedProfile.data.currentLevel ?? null,
    });

    return res.status(200).json(updatedProfile);
  },
);
