-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "messageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Source_messageId_idx" ON "Source"("messageId");

-- AddForeignKey
ALTER TABLE "Source" ADD CONSTRAINT "Source_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;
