import express from "express";
const conversationRoute = express.Router();

import {
  getConversationsController,
  getConversationByIdController,
  deleteConversationByIdController,
} from "./conversation.controller.js";
import { validateUser } from "../../middleware/auth.middleware.js";
import {sendMessageController} from "./message.controller.js"

import { aiRateLimitMiddleware } from "../../middleware/rateLimit.middleware.js";

// Conversations
conversationRoute.get("/", validateUser, getConversationsController);
conversationRoute.get(
  "/:conversationId",
  validateUser,
  getConversationByIdController,
);
conversationRoute.delete("/:conversationId",validateUser,deleteConversationByIdController);

// Messages inside a conversation
conversationRoute.post("/messages", validateUser, aiRateLimitMiddleware,sendMessageController);
conversationRoute.post("/:conversationId/messages", validateUser, aiRateLimitMiddleware,sendMessageController);


export default conversationRoute;
