import { z } from "zod";

export const contentSchema = z.object({
  content : z.string().min(1).max(1000)
});
