import crypto from "crypto";
import { redis } from "../../lib/redis.js";

const CODE_TTL_SECONDS = 60;

export interface OAuthUser {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
}

export interface OAuthPayload {
  accessToken: string;
  user: OAuthUser;
}

export const createOAuthCode = async (payload: OAuthPayload): Promise<string> => {
  const code = crypto.randomBytes(32).toString("hex");

  // Upstash serializes the object for us. No JSON.stringify.
  await redis.set(`oauth-code:${code}`, payload, { ex: CODE_TTL_SECONDS });

  return code;
};

// GETDEL reads and deletes in one atomic step. A code works only once.
export const consumeOAuthCode = async (
  code: string,
): Promise<OAuthPayload | null> => {
  const payload = await redis.getdel<OAuthPayload>(`oauth-code:${code}`);

  return payload ?? null;
};