import { z } from "zod";

export const profileSchema = z.object({
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

  learningGoals: z.array(z.string()),

  preferredDepth: z.enum([
    "CONCISE",
    "BALANCED",
    "DETAILED",
  ]),
});