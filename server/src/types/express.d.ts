import type { JWTPayload } from "../modules/auth/auth.type.js";
import type { User } from "../generated/prisma/index.js";

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload | User;
    }
  }
}

export {};