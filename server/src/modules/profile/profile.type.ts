export interface Profile {
  id: string;
  userId: string;
  academicField: string | null;
  currentLevel: string | null;
  learningGoals: string[];
  preferredDepth: string | null;
  createdAt: Date;
  updatedAt: Date;
}