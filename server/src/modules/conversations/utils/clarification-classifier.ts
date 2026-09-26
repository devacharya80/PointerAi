import type { ChatMessage } from "../../ai/ai.types.js";
import type { Clarifier } from "../types/need.carifier.js";
import type { Profile } from "../../profile/profile.type.js";
import { generateAiResponse } from "../../ai/ai.service.js";

export const classifyForClarification = async (
  recentMessages: ChatMessage[],
  currentMessage: string,
  profile: Profile | null,
): Promise<Clarifier> => {
  const profileHint = profile
    ? `
The user's stated preferences are:
- level: ${profile.preferredDepth ?? "unknown"}
- goal: ${profile.learningGoals.length > 0 ? profile.learningGoals.join(", ") : "unknown"}

These preferences are only hints.
Judge whether clarification is actually needed based primarily on the user's current question and recent conversation.
Do NOT ask for clarification just because the profile is incomplete.
`
    : `
The user does not have a profile.
Judge whether clarification is needed based only on the current question and recent conversation.
`;
  const systemPrompt = `
You are a clarification classifier for an AI assistant.

Your job is to determine whether the user's CURRENT question is sufficiently clear to answer.

You must return ONLY valid JSON.

The JSON must have exactly this shape:

{
    needsClarification : boolean,
    question : string | null,
    options : string[] | null,
}

Rules:

1. Set "needsClarification" to true ONLY when the user's request is genuinely ambiguous,
   missing essential information, or has multiple materially different interpretations.

2. Set "needsClarification" to false when the question can reasonably be answered
   using the available context.

3. If needsClarification is false:
   - "question" MUST be null.

4. If needsClarification is true:
   - "question" MUST contain exactly ONE concise clarification question.
   - Do not ask multiple questions.
   - Ask only for the missing information necessary to answer.

5. Include/return 3-4 options only based on the result and options should be short answer choices the user can click, NOT additional questions

6. Do not ask unnecessary clarification questions.

7. Use recent conversation context when determining what the user means.

8. The user's profile is only a hint. Do not blindly follow it.

${profileHint}

Recent conversation:
${JSON.stringify(recentMessages)}

Current user message:
${currentMessage}

Return ONLY the JSON object.
`;

  try {
    const response = await generateAiResponse(
      [{ role: "system", content: systemPrompt }],
      "openai/gpt-oss-20b", // or whatever lightweight model
      { responseFormat: { type: "json_object" } },
    );
    const parsed = JSON.parse(response.message);
    return {
      needsClarification: parsed.needsClarification === true,

      question:
        parsed.needsClarification === true &&
        typeof parsed.question === "string"
          ? parsed.question
          : null,

      options:
        parsed.needsClarification === true && Array.isArray(parsed.options)
          ? parsed.options
          : [],
    };
  } catch (err: any) {
    console.error("Clarificarion failed: ", err);
    return {
      needsClarification: false,
      question: null,
      options: null,
    };
  }
};
