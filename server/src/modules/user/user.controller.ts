import type { Request, Response } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { getUserId } from "../../lib/getUserId.js";
import {getUser} from "./user.service.js"

export const getUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId: string = getUserId(req)
    const user = await getUser(userId);
    return res.status(200).json({
        "message" : "user data fetched",
        "data" : user
    })
  })