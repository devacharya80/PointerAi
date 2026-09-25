import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/AppError.js";

export const createConversation = async (userId: string) => {
  const newConversation = await prisma.conversation.create({
    data: {
      userId: userId,
      title: "New Conversation",
    },
  });
  return newConversation;
};

export const getUserConversations = async (
  userId: string,
  page: number = 1,
  limit: number = 20,
) => {
  const skip = (page - 1) * limit;

  const [conversations, total] = await Promise.all([
    prisma.conversation.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        title: true,
        messages: false,
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
      where: {
        userId,
      },
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
      userId: userId,
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
      },
    },
  });

  if (!conversation) {
    throw new AppError("Chat not found or unauthorized", 404);
  }

  return conversation;
};

export const deleteConversationById = async (
  userId: string,
  conversationId: string,
) => {
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, userId },
  });

  if (!conversation) {
    throw new AppError("Conversation not found or unauthorized", 404);
  }

  return await prisma.conversation.delete({
    where: { id: conversationId },
  });
};