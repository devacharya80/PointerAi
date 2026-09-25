import type { Request, Response } from "express";
import {
  getUserConversations,
  getConversationById,
  deleteConversationById,
} from "./conversation.service.js";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { getUserId } from "../../lib/getUserId.js";
import { paginationSchema } from "./conversation.schema.js";


export const getConversationsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId: string = getUserId(req);

    const { page, limit } = paginationSchema.parse(req.query);

    const allConversation = await getUserConversations(userId, page, limit);

    return res.status(200).json({
      message: "All conversations",
      data: allConversation,
    });
  },
);

export const getConversationByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const conversationId = req.params.conversationId as string;
    const userId: string = getUserId(req);
    const conversation = await getConversationById(userId, conversationId);

    return res.status(200).json({
      message: "Fetched",
      data: conversation,
    });
  },
);

export const deleteConversationByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const conversationId = req.params.conversationId as string;
    const userId: string = getUserId(req);
    await deleteConversationById(userId,conversationId);
    return res.status(200).json({
      message: "Deleted",
    });
  },
);
