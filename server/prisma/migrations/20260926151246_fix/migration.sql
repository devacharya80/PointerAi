/*
  Warnings:

  - The values [CLARIFYING_QUESTION] on the enum `MessageType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MessageType_new" AS ENUM ('NORMAL', 'CLARIFICATION_QUESTION');
ALTER TABLE "public"."Message" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Message" ALTER COLUMN "type" TYPE "MessageType_new" USING ("type"::text::"MessageType_new");
ALTER TYPE "MessageType" RENAME TO "MessageType_old";
ALTER TYPE "MessageType_new" RENAME TO "MessageType";
DROP TYPE "public"."MessageType_old";
ALTER TABLE "Message" ALTER COLUMN "type" SET DEFAULT 'NORMAL';
COMMIT;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "options" TEXT[];
