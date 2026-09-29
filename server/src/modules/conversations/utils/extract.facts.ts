import { prisma } from "../../../lib/prisma.js";
import { generateAiResponse } from "../../ai/ai.service.js";
import { AppError } from "../../../lib/AppError.js"; 

const MAX_FACTS = 20;

type ExtractedFact = {
  content: string;
};

type FactExtractionResponse = {
  facts: ExtractedFact[];
};

export const extractFactsFromConversation = async (
  conversationId: string,
  userId: string
) => {
  // 1. Fetch conversation messages
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      userId,
    },
    select: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
        select: {
          role: true,
          content: true,
          createdAt: true,
        },
      },
    },
  });

  if (!conversation) {
    throw new AppError("Conversation not found",404);
  }

  // 2. Fetch existing facts for deduplication
  const existingFacts = await prisma.fact.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      content: true,
    },
  });

  // 3. Build the prompt
  const systemPrompt = `
You are a user-fact extraction system.

Your task is to identify durable, useful facts about the user from the conversation.

Extract only information that is:
- Explicitly stated by the user.
- Likely to remain useful across future conversations.
- Relevant to understanding the user's preferences, goals, projects, skills, habits, or recurring context.
- Specific enough to be represented as a short standalone fact.

Do NOT extract:
- Temporary or one-time information that is unlikely to matter later.
- Information about the assistant or the conversation itself.
- Guesses, assumptions, interpretations, or inferred information.
- Sensitive personal information unless necessary and appropriate.
- Greetings, jokes, hypothetical statements, or conversational filler.
- Facts already covered by the existing facts.

Compare every potential fact against the existing facts.
Do not return duplicate or substantially equivalent facts.

Prefer concise, atomic facts.

If there are no genuinely new durable facts, return an empty list.

Return ONLY valid JSON:

{
  "facts": [
    {
      "content": "A concise standalone fact about the user."
    }
  ]
}
`;

  const messages = [
    {
      role: "system" as const,
      content: systemPrompt,
    },
    {
      role: "user" as const,
      content: JSON.stringify({
        conversation: conversation.messages,
        existingFacts: existingFacts.map((fact) => fact.content),
      }),
    },
  ];

  // 4. Ask the AI to extract facts
  const response = await generateAiResponse(messages,undefined,{responseFormat: {type: "json_object"}});

  // 5. Parse AI response
  let parsed: FactExtractionResponse;

  try {
    parsed = JSON.parse(response.message);
  } catch {
    throw new AppError("AI returned invalid JSON",500);
  }

  if (!Array.isArray(parsed.facts)) {
    throw new AppError("Invalid fact extraction response",500);
  }

  // 6. Remove empty/duplicate results defensively
  const uniqueFacts = [
    ...new Map(
      parsed.facts
        .filter(
          (fact) =>
            typeof fact.content === "string" &&
            fact.content.trim().length > 0
        )
        .map((fact) => [
          fact.content.trim().toLowerCase(),
          fact.content.trim(),
        ])
    ).values(),
  ];

  if (uniqueFacts.length === 0) {
    // Still mark the conversation as processed
    await prisma.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        summarizedAt: new Date(),
      },
    });

    return [];
  }

  // 7. Save new facts
  await prisma.fact.createMany({
    data: uniqueFacts.map((content) => ({
      userId,
      content,
      sourceConversationId: conversationId,
    })),
  });

  // 8. Enforce maximum of 20 facts
  const factCount = await prisma.fact.count({
    where: {
      userId,
    },
  });

  if (factCount > MAX_FACTS) {
    const factsToDelete = await prisma.fact.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "asc",
      },
      take: factCount - MAX_FACTS,
      select: {
        id: true,
      },
    });

    await prisma.fact.deleteMany({
      where: {
        id: {
          in: factsToDelete.map((fact) => fact.id),
        },
      },
    });
  }

  // 9. Mark conversation as processed
  await prisma.conversation.update({
    where: {
      id: conversationId,
    },
    data: {
      summarizedAt: new Date(),
    },
  });

  return uniqueFacts;
};