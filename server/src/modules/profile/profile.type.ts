import type {
  AcademicField,
  CurrentLevel,
  PreferredDepth,
} from "../../generated/prisma/client.js";

export interface Profile {
  academicField: AcademicField | null;
  currentLevel: CurrentLevel | null;
  learningGoals: string[];
  preferredDepth: PreferredDepth | null;
}