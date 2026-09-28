import { z } from "zod";

export const profileSchema = z
  .object({
    academicField: z
      .enum([
        "COMPUTER_SCIENCE",
        "INFORMATION_TECHNOLOGY",
        "MEDICAL",
        "ELECTRONICS",
        "ELECTRICAL",
        "MECHANICAL",
        "CIVIL",
        "CHEMICAL",
        "AERONAUTICAL",
        "BIOTECHNOLOGY",
        "OTHER",
      ])
      .optional(),

    currentLevel: z
      .enum([
        "BEGINNER",
        "INTERMEDIATE",
        "ADVANCED",
      ])
      .optional(),

    learningGoals: z
      .array(
        z
          .string()
          .trim()
          .min(1, "Learning goal cannot be empty")
          .max(200, "Learning goal must be at most 200 characters")
      )
      .max(10, "You can have at most 10 learning goals")
      .optional(),

    preferredDepth: z
      .enum([
        "CONCISE",
        "BALANCED",
        "DETAILED",
      ])
      .optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "At least one field must be provided",
    }
  );

export type UpdateProfileInput = z.infer<typeof profileSchema>;