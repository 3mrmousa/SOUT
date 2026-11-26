import type { Response } from "express";
import asyncHandler from "../../utils/errors/asyncHandler.js";
import { messageService } from "./message.service.js";
import type { AuthRequest } from "../../types/types.js";
import type {
  GetMessagesParams,
  GetMessagesQuery,
  SendMessageInput,
} from "./message.schema.js";

export const getMessages = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const params = req.params as GetMessagesParams;
    const query = req.query as GetMessagesQuery;
    const limit = query.limit ? parseInt(query.limit, 10) : 50;

    const messages = await messageService.getConversationMessages(
      params.conversationId,
      req.user.id,
      limit,
    );

    res.status(200).json({
      status: "success",
      results: messages.length,
      data: { messages },
    });
  },
);

export const sendMessage = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    const body = req.body as SendMessageInput;
    const message = await messageService.sendMessage(req.user.id, body, files);

    res.status(201).json({
      status: "success",
      message: "Message sent successfully",
      data: { message },
    });
  },
);
