// src/types/express.d.ts

import type { JWTPayload } from "../modules/auth/auth.type.ts";

declare global {
  namespace Express {
    interface Request {
      user? : JWTPayload;
    }
  }
}

export {};