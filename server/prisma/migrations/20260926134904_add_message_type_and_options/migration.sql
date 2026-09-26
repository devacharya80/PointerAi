-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('NORMAL', 'CLARIFICATION_QUESTION');

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "type" "MessageType" NOT NULL DEFAULT 'NORMAL';
