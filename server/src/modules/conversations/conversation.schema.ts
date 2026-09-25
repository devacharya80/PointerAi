import { z } from "zod";

export const paginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  page: z.coerce.number().min(1).max(10).default(1),
});
