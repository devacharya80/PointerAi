import type { Request, Response } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { getUserId } from "../../lib/getUserId.js";
import {getUser, updateUser,} from "./user.service.js"
import {updateUserSchema} from "./user.schema.js"

export const getUserController = asyncHandler(
  async(req: Request, res: Response) => {
    const userId: string = getUserId(req);
    const user = await getUser(userId);
    return res.status(200).json({
      "message": "User fetched",
      "data": user
    })
  }
)

export const updateUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = getUserId(req);

    const validatedUserData = updateUserSchema.parse(req.body);

    const result = await updateUser(
      userId,
      validatedUserData
    );

    return res.status(200).json({
      message: "User updated",
      data: result,
    });
  }
);

// export const deleteUserController = asyncHandler(
//   async (req: Request, res: Response) => {
//     const userId = getUserId(req);

//     await deleteUser(userId);

//     return res.status(200).json({
//       message: "User deleted successfully",
//     });
//   }
// );