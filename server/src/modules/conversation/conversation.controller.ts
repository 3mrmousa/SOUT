import type { Response } from "express";
import asyncHandler from "../../utils/errors/asyncHandler.js";
import { conversationService } from "./conversation.service.js";
import type { AuthRequest } from "../../types/types.js";
import type {
  CreateConversationInput,
  GetConversationByRecipientParams,
  GetConversationByIdParams,
} from "./conversation.schema.js";

export const createConversation = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const body = req.body as CreateConversationInput;
    const conversation =
      await conversationService.createOneToOneConversation(
        req.user.id,
        body,
      );

    res.status(201).json({
      status: "success",
      data: { conversation },
    });
  },
);

export const getConversationByRecipient = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const params = req.params as GetConversationByRecipientParams;
    const conversation =
      await conversationService.getConversationByRecipient(
        req.user.id,
        params.recipientUsername,
      );

    res.status(200).json({
      status: "success",
      data: { conversation },
    });
  },
);

export const getMyConversations = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const conversations = await conversationService.getUserConversations(
      req.user.id,
    );

    res.status(200).json({
      status: "success",
      results: conversations.length,
      data: { conversations },
    });
  },
);

export const getMyContacts = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const contacts = await conversationService.getMyContactsService(
      req.user.id,
    );

    res.status(200).json({
      status: "success",
      data: { contacts },
    });
  },
);

export const getConversationById = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const params = req.params as GetConversationByIdParams;
    const conversation = await conversationService.getConversationById(
      params.id,
      req.user.id,
    );

    res.status(200).json({
      status: "success",
      data: { conversation },
    });
  },
);
