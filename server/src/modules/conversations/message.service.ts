import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/AppError.js";
import { generateAiResponse } from "../ai/ai.service.js";
import type { ChatMessage } from "../ai/ai.types.js";
import { generateTitle } from "./utils/auto.title.generation.js";
import {createConversation} from "./conversation.service.js"

export const sendMessage = async (
  userId: string,
  conversationId: string | undefined,
  content: string,
) => {
  let activeConversationId: string;

  if (conversationId) {
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId,
      },
    });

    if (!conversation) {
      throw new AppError("Conversation not found or unauthorized", 404);
    }
    activeConversationId = conversation.id;
  } else {
    const newConversation = await createConversation(userId)
    activeConversationId = newConversation.id;
  }

  const currMessages = await prisma.message.create({
    data: {
      conversationId: activeConversationId,
      role: "USER",
      content,
    },
  });

  const userMessage = currMessages.content;

  const history = await prisma.message.findMany({
    where: { conversationId: activeConversationId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const canAutoTitleGenerate = history.length === 1;

  if (canAutoTitleGenerate) {
    generateTitle(activeConversationId, content).catch((err) => {
      console.error("Title generation failed:", err);
    });
  }

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
        conversationId: activeConversationId,
        role: "ASSISTANT",
        content: AiResponse.message,
      },
    });

    await tx.conversation.update({
      where: {
        id: activeConversationId,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    return {
      conversationId : activeConversationId,
      userMessage,
      aiMessage,
    };
  });
};