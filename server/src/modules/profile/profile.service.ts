import { AppError } from "../../lib/AppError.js";
import { prisma } from "../../lib/prisma.js";

import type { UpdateProfileInput } from "./profile.schema.js";


export const updateProfile = async (
  userId: string,
  userData: UpdateProfileInput,
) => {
  return prisma.profile.upsert({
    where: {
      userId,
    },

    create: {
      userId,
      ...userData,
    },

    update: {
      ...userData,
    },
  });
};



export const getProfile = async (
  userId: string
) => {
  const profile = await prisma.profile.findUnique({
    where: {
      userId,
    },
  });

  if (!profile) {
    throw new AppError("Profile not found", 404);
  }

  return profile;
};