import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/AppError.js";
import { generateAiResponse } from "../ai/ai.service.js";
import type { ChatMessage } from "../ai/ai.types.js";
import { generateTitle } from "./utils/auto.title.generation.js";
import { createConversation } from "./conversation.service.js";
import { shouldSearchWeb } from "./utils/search-classifier.js";
import { searchWeb } from "./providers/tavily.provider.js";
import {classifyForClarification} from "./utils/clarification-classifier.js"

export const sendMessage = async (
  userId: string,
  conversationId: string | undefined,
  content: string,
) => {
  let activeConversationId: string;

  // 1. Get existing conversation or create a new one
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
    const newConversation = await createConversation(userId);
    activeConversationId = newConversation.id;
  }

  // 2. Save user message
  const userMessage = await prisma.message.create({
    data: {
      conversationId: activeConversationId,
      role: "USER",
      content,
    },
  });

  // 3. Get conversation history
  const history = await prisma.message.findMany({
    where: {
      conversationId: activeConversationId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
  });

  // 4. Generate title for first message
  const canAutoTitleGenerate = history.length === 1;

  if (canAutoTitleGenerate) {
    generateTitle(activeConversationId, content).catch((err) => {
      console.error("Title generation failed:", err);
    });
  }

  // 5. Reverse history: oldest → newest
  const orderedHistory = history.reverse();

  // 6. Convert Prisma messages to AI messages
  const mappedHistory: ChatMessage[] = orderedHistory.map((chat) => ({
    role: chat.role === "USER" ? "user" : "assistant",
    content: chat.content,
  }));

  // 17 Needs clarification save ai msg and return with the clarificarion msgs
  const profile = await prisma.profile.findUnique({ where: { userId } });

const clarification = await classifyForClarification(
  mappedHistory,
  content,  // the original user message string, not userMessage.content
  profile
);

if (clarification.needsClarification && clarification.question) {
  const clarificationMessage = await prisma.message.create({
    data: {
      conversationId: activeConversationId,
      role: "ASSISTANT",
      type: "CLARIFICATION_QUESTION",
      content: clarification.question,
      options: clarification.options ?? [],
    },
  });

  return {
    conversationId: activeConversationId,
    userMessage,
    aiMessage: clarificationMessage,
  };
}

  // 7. Check whether web search is needed
  // Exclude current message from history because
  // current message is passed separately.
  const previousMessages = mappedHistory.slice(-6, -1);

  const needsWebSearch = await shouldSearchWeb(previousMessages, content);

  // 8. Search the web if required
  let webResults: Awaited<ReturnType<typeof searchWeb>> = [];

  if (needsWebSearch) {
    webResults = await searchWeb(content);
  }

  // 9. Build system prompt
  let systemContent = "You are a helpful learning assistant.";

  // 10. Add web search context to system prompt
  if (needsWebSearch && webResults.length > 0) {
    const webContext = webResults
      .map(
        (result, index) => `
SOURCE ${index + 1}

Title: ${result.title}
URL: ${result.url}
Content: ${result.content}
`,
      )
      .join("\n");

    systemContent += `

You have access to the following web search results.

Use these sources to answer the user's question.
Do not invent information that is not supported by the sources.
Prefer information from the provided sources when answering questions that require current information.

WEB SEARCH RESULTS:

${webContext}
`;
  }

  // 11. Final messages sent to AI
  const messages: ChatMessage[] = [
    {
      role: "system",
      content: systemContent,
    },
    ...mappedHistory,
  ];

  // 12. Generate AI response
  const aiResponse = await generateAiResponse(messages);

  // 13. Save assistant message + sources
  return await prisma.$transaction(async (tx) => {
    const aiMessage = await tx.message.create({
      data: {
        conversationId: activeConversationId,
        role: "ASSISTANT",
        content: aiResponse.message,
      },
    });

    // 14. Save web sources
    if (needsWebSearch && webResults.length > 0) {
      await tx.source.createMany({
        data: webResults.map((result) => ({
          messageId: aiMessage.id,
          content: result.content,
          url: result.url,
          title: result.title,
          score: result.score,
        })),
      });
    }

    // 15. Update conversation timestamp
    await tx.conversation.update({
      where: {
        id: activeConversationId,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    // 16. Return response
    return {
      conversationId: activeConversationId,
      userMessage,
      aiMessage,
    };
  });
};