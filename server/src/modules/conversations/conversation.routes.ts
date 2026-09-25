import express from "express";
const conversationRoute = express.Router();

import {
  createConversationController,
  getConversationsController,
  getConversationByIdController,
  deleteConversationByIdController,
} from "./conversation.controller.js";
import { validateUser } from "../../middleware/auth.middleware.js";
import {sendMessageController} from "./message.controller.js"

// Conversations
conversationRoute.get("/", validateUser, getConversationsController);
conversationRoute.get(
  "/:conversationId",
  validateUser,
  getConversationByIdController,
);
conversationRoute.post("/", validateUser, createConversationController);
conversationRoute.delete("/:conversationId",validateUser,deleteConversationByIdController);

// Messages inside a conversation
// conversationRoute.get("/conversations/:conversationId/messages");
conversationRoute.post("/:conversationId/messages",validateUser,sendMessageController);

export default conversationRoute;
