import type { Request, Response } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { getUserId } from "../../lib/getUserId.js";
import { contentSchema } from "./message.schema.js";
import { sendMessage, saveStreamedResponse } from "./message.service.js";
import { generateAiResponseStream } from "../ai/ai.service.js";

export const sendMessageController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = getUserId(req);

    const conversationId: string | undefined =
      typeof req.params.conversationId === "string"
        ? req.params.conversationId
        : undefined;

    const validatedContent = contentSchema.parse(req.body);

    const result = await sendMessage(
      userId,
      conversationId,
      validatedContent.content,
    );

    // Clarification response
    if (result.type === "clarification") {
      return res.status(201).json({
        data: result,
      });
    }

    // SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    res.flushHeaders();

    try {
      const stream = await generateAiResponseStream(result.messages);

      let fullResponse = "";

      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || "";
        if (text) {
          fullResponse += text;
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }

      const savedMessage = await saveStreamedResponse(
        result.conversationId,
        fullResponse,
        result.webResults,
      );

      res.write(
        `data: ${JSON.stringify({ done: true, messageId: savedMessage.id })}\n\n`,
      );
      res.end();
    } catch (err) {
      console.error("AI streaming error:", err);
      res.write(
        `event: error\ndata: ${JSON.stringify({ message: "AI response failed" })}\n\n`,
      );
      res.end();
    }
  },
);
