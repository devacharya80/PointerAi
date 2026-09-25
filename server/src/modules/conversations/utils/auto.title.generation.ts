import { generateAiResponse } from "../../ai/ai.service.js";
import { prisma } from "../../../lib/prisma.js";

export const generateTitle = async (
  conversationId: string | undefined,
  content: string,
) => {
  const aiTitle = await generateAiResponse([
    {
      role: "system",
      content: `Generate a concise 3 to 4 word title for this user's first message: "${content}"`,
    },
  ]);

  await prisma.conversation.update({
    where: {
      id: conversationId,
    },
    data: {
      title: aiTitle.message,
    },
  });
};
