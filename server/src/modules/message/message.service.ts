import { db } from "../../prisma/db";
import AppError from "../../utils/errors/AppError";
import { getIO, isUserOnline } from "../../socket";
import type { SendMessageInput } from "./message.schema";

export class MessageService {
  async getConversationMessages(conversationId: string, userId: string, limit = 50) {
    const isParticipant = await db.orm.public.ConversationParticipant.first({
      conversationId,
      userId,
    });

    if (!isParticipant) {
      throw new AppError("Conversation not found or access denied", 403);
    }

    const messages = await db.orm.public.Message
      .where({ conversationId })
      .orderBy((m) => m.createdAt.desc())
      .limit(limit)
      .all();

    return messages.reverse();
  }

  async sendMessage(senderId: string, input: SendMessageInput) {
    const { conversationId, recipientId, content } = input;

    const isParticipant = await db.orm.public.ConversationParticipant.first({
      conversationId,
      userId: senderId,
    });

    if (!isParticipant) {
      throw new AppError("Not authorized to send messages in this conversation", 403);
    }

    // Check if recipient is online (1 tick SENT vs 2 ticks DELIVERED)
    const recipientOnline = isUserOnline(recipientId);
    const initialStatus = recipientOnline ? "DELIVERED" : "SENT";

    const message = await db.orm.public.Message.create({
      conversationId,
      senderId,
      content,
      status: initialStatus,
    });

    try {
      const io = getIO();
      // Sync all devices of the sender
      io.to(`user:${senderId}`).emit("message_sent", message);

      // Deliver to recipient if online
      if (recipientOnline) {
        io.to(`user:${recipientId}`).emit("new_message", message);
      }
    } catch (err) {
      console.warn("Socket broadcast warning:", err);
    }

    return message;
  }
}

export const messageService = new MessageService();
