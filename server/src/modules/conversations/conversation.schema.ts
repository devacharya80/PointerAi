import { z } from "zod";

export const paginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  page: z.coerce.number().min(1).max(10).default(1),
});

export const renameConversationSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(100, "Title must be at most 100 characters"),
});