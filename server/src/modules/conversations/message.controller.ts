import type { Request, Response } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { getUserId } from "../../lib/getUserId.js";
import { contentSchema } from "./message.schema.js";
import { sendMessage } from "./message.service.js";

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

    return res.status(201).json({
      data: result,
    });
  },
);
