import { prisma } from "../../lib/prisma.js";
import type { Profile } from "./profile.type.js";

export const updateProfile = async (
  userId: string,
  userData: Profile,
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