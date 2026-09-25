import type { Request } from "express";
import { AppError } from "./AppError.js";

export const getUserId = (req: Request):string => {
  if (
    !req.user ||
    !("userId" in req.user) ||
    typeof req.user.userId !== "string"
  ) {
    throw new AppError("Not authenticated", 401);
  }
  return req.user.userId;
};
