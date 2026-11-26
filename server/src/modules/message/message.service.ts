import { db } from "../../prisma/db";
import AppError from "../../utils/errors/AppError";
import { getIO, isUserOnline } from "../../socket";
import type { SendMessageInput } from "./message.schema";
import type { ChatMediaItem } from "../../types/types";
import { deleteFromR2, uploadMessageImageToR2 } from "../../utils/r2/r2.util";

export class MessageService {
  async getConversationMessages(
    conversationId: string,
    userId: string,
    limit = 50,
  ) {
    const isParticipant = await db.orm.public.ConversationParticipant.first({
      conversationId,
      userId,
    });

    if (!isParticipant) {
      throw new AppError("Conversation not found or access denied", 403);
    }

    const messages = await db.orm.public.Message.where({ conversationId })
      .orderBy((m) => m.createdAt.desc())
      .limit(limit)
      .all();

    return messages.reverse();
  }

  async sendMessage(
    senderId: string,
    input: SendMessageInput,
    files: Express.Multer.File[] = [],
  ) {
    const { conversationId, recipientId, content } = input;

    const trimmedContent = content?.trim() || null;

    if (!trimmedContent && !files.length) {
      throw new AppError("Message must contain text or media", 400);
    }

    if (files.length > 5) {
      throw new AppError("Maximum 5 media files allowed per message", 400);
    }

    const isParticipant = await db.orm.public.ConversationParticipant.first({
      conversationId,
      userId: senderId,
    });

    if (!isParticipant) {
      throw new AppError(
        "Not authorized to send messages in this conversation",
        403,
      );
    }

    let uploadedMedia: ChatMediaItem[] = [];
    const recipientOnline = isUserOnline(recipientId);
    // Check if recipient is online (1 tick SENT vs 2 ticks DELIVERED)
    const initialStatus = recipientOnline ? "DELIVERED" : "SENT";

    try {
      if (files.length > 0) {
        uploadedMedia = await Promise.all(
          files.map(async (file) => {
            const item = await uploadMessageImageToR2(
              file,
              conversationId,
              senderId,
            );
            uploadedMedia.push(item);
            return item;
          }),
        );
      }

      const message = await db.orm.public.Message.create({
        conversationId,
        senderId,
        content: trimmedContent,
        media: uploadedMedia.length > 0 ? uploadedMedia : null,
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
    } catch (err) {
      if (uploadedMedia.length > 0) {
        await Promise.allSettled(
          uploadedMedia.map((item) => deleteFromR2(item.key)),
        );
      }
      throw err;
    }
  }
}

export const messageService = new MessageService();
