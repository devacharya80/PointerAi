import type { Request, Response } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { getUserId } from "../../lib/getUserId.js";
import { contentSchema } from "./message.schema.js";
import { sendMessage, saveStreamedResponse } from "./message.service.js";
import { generateAiResponseStream } from "../ai/ai.service.js";

export const sendMessageController = asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const conversationId: string | undefined = typeof req.params.conversationId === "string"
    ? req.params.conversationId
    : undefined;

  const validatedContent = contentSchema.parse(req.body);

  const result = await sendMessage(userId, conversationId, validatedContent.content);

  if (result.type === "clarification") {
    return res.status(201).json({ data: result });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const abortController = new AbortController();
  let clientDisconnected = false;

  const handleDisconnect = () => {
    if (res.writableFinished) return;

    clientDisconnected = true;

    if (!abortController.signal.aborted) {
      abortController.abort();
    }
  };

  res.once("close", handleDisconnect);

  try {
    const stream = await generateAiResponseStream(result.messages, undefined, abortController.signal);
    let fullResponse = "";

    for await (const chunk of stream) {
      if (clientDisconnected || abortController.signal.aborted) break;

      const text = chunk.choices[0]?.delta?.content || "";
      if (!text) continue;

      fullResponse += text;
      if (!res.writableEnded && !res.destroyed) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
        // console.log(`data: ${JSON.stringify({ text })}`)
      }
    }

    if (clientDisconnected || abortController.signal.aborted) return;

    const savedMessage = await saveStreamedResponse(
      result.conversationId,
      fullResponse,
      result.webResults,
    );

    if (!res.writableEnded && !res.destroyed) {
      res.write(`data: ${JSON.stringify({ done: true, messageId: savedMessage.id })}\n\n`);
      res.end();
    }
  } catch (err) {
    if (clientDisconnected || abortController.signal.aborted) return;

    console.error("AI streaming error:", err);
    if (!res.writableEnded && !res.destroyed) {
      res.write(`event: error\ndata: ${JSON.stringify({ message: "AI response failed" })}\n\n`);
      res.end();
    }
  } finally {
    res.off("close", handleDisconnect);
  }
});