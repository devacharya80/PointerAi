import { AppError } from "../../lib/AppError.js";
import { prisma } from "../../lib/prisma.js";

import type { UpdateUserInput } from "./user.schema.js";


export const getUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    omit: {
  password: true,
  oauthId: true,
  oauthProvider: true,
}
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};


export const updateUser = async (
  userId: string,
  userData: UpdateUserInput
) => {
  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: userData,
    omit: {
  password: true,
  oauthId: true,
  oauthProvider: true,
}
  });

  return updatedUser;
};

// export const deleteUser = async(userId:string) => {
//     const user = await prisma.user.delete({
//         where : {
//             id : userId
//         }
//     })

//     if(!user){
//         throw new AppError("User not found",404)
//     }

//     return user
// }