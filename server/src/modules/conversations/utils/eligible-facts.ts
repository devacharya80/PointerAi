import { prisma } from "../../../lib/prisma.js";

const ONE_HOUR_MS = 60 * 60 * 1000;
const MIN_MESSAGES_FOR_EXTRACTION = 10;

export const findEligibleConversations = async (
  userId: string,
  excludeConversationId: string,
) => {
  const oneHourAgo = new Date(Date.now() - ONE_HOUR_MS);

  const candidates = await prisma.conversation.findMany({
    where: {
      userId,
      id: { not: excludeConversationId },
      updatedAt: { lt: oneHourAgo },
    },
    include: {
      _count: {
        select: {
          messages: true,
        },
      },
    },
  });

  return candidates.filter((conversation) => {
    const hasEnoughMessages =
      conversation._count.messages >= MIN_MESSAGES_FOR_EXTRACTION;

    const needsExtraction =
      conversation.summarizedAt === null ||
      conversation.summarizedAt < conversation.updatedAt;

    return hasEnoughMessages && needsExtraction;
  });
};
