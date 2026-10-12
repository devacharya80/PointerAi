
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/AppError.js";

export const createConversation = async (userId: string) => {
  return prisma.conversation.create({
    data: {
      userId,
      title: "New Conversation",
    },
  });
};

export const getUserConversations = async (
  userId: string,
  page = 1,
  limit = 20,
) => {
  const skip = (page - 1) * limit;

  const [conversations, total] = await Promise.all([
    prisma.conversation.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
      skip,
      take: limit,
    }),

    prisma.conversation.count({
      where: { userId },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    conversations,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  };
};

export const getConversationById = async (
  userId: string,
  conversationId: string,
) => {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      userId,
    },
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      userId: true,

      messages: {
        orderBy: {
          createdAt: "asc",
        },

        include: {
          source: {
            select: {
              id: true,
              title: true,
              url: true,
              score: true,
            },
          },
        },
      },
    },
  });

  if (!conversation) {
    throw new AppError("Chat not found or unauthorized", 404);
  }

  // Expose the relation as "sources" for the frontend.
  // Keep the source content in the database, but return
  // only the fields needed to display the citation links.
  return {
    ...conversation,

    messages: conversation.messages.map(
      ({ source, ...message }) => ({
        ...message,
        sources: source,
      }),
    ),
  };
};

export const deleteConversationById = async (
  userId: string,
  conversationId: string,
) => {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      userId,
    },
  });

  if (!conversation) {
    throw new AppError(
      "Conversation not found or unauthorized",
      404,
    );
  }

  return prisma.conversation.delete({
    where: {
      id: conversationId,
    },
  });
};
