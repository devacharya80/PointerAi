import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/AppError.js";
import { generateAiResponse } from "../ai/ai.service.js";
import type { ChatMessage } from "../ai/ai.types.js";

export const sendMessage = async (
  userId: string,
  conversationId: string,
  content: string,
) => {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      userId,
    },
  });
  if (!conversation) {
    throw new AppError("Conversation not found or unauthorized", 404);
  }

  const currMessages = await prisma.message.create({
    data: {
      conversationId,
      role: "USER",
      content,
    },
  });

  const userMessage = currMessages.content;

  const history = await prisma.message.findMany({
  where: { conversationId },
  orderBy: { createdAt: "desc" },
  take: 20,
});

const orderedHistory = history.reverse();

  const mappedHistory: ChatMessage[] = orderedHistory.map((chat) => ({
    role: chat.role === "USER" ? "user" : "assistant",
    content: chat.content,
  }));

  const messages: ChatMessage[] = [
    {
      role: "system",
      content: "You are a helpful learning assistant.",
    },
    ...mappedHistory,
  ];

  const AiResponse = await generateAiResponse(messages);

  return await prisma.$transaction(async (tx) => {
    const aiMessage = await tx.message.create({
      data: {
        conversationId,
        role: "ASSISTANT",
        content: AiResponse.message,
      },
    });

    await tx.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    return {
        userMessage,
      aiMessage,
    };
  });
};