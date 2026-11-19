import { db } from "../../prisma/db";
import AppError from "../../utils/errors/AppError";
import { getIO } from "../../socket";
import type { CreateConversationInput } from "./conversation.schema";
import type { SafeUser } from "../../types/types";

export class ConversationService {
  async createOneToOneConversation(
    currentUserId: string,
    input: CreateConversationInput,
  ) {
    const cleanUsername = input.recipientUsername.replace(/^@/, "").trim();

    if (!cleanUsername) {
      throw new AppError("Recipient username is required", 400);
    }

    const recipient = await db.orm.public.User.first({
      username: cleanUsername,
    });

    if (!recipient) {
      throw new AppError("Recipient user not found", 404);
    }

    const recipientId = recipient.id;

    if (recipientId === currentUserId) {
      throw new AppError("Cannot start a conversation with yourself", 400);
    }

    const myParticipations = await db.orm.public.ConversationParticipant.where({
      userId: currentUserId,
    }).all();

    for (const p of myParticipations) {
      const shared = await db.orm.public.ConversationParticipant.first({
        conversationId: p.conversationId,
        userId: recipientId,
      });

      if (shared) {
        throw new AppError("Conversation with this user already exists", 409);
      }
    }

    // Create new conversation and add both participants in a single transaction
    const newConversation = await db.transaction(async (tx) => {
      const conv = await tx.orm.public.Conversation.create({});

      await tx.orm.public.ConversationParticipant.create({
        conversationId: conv.id,
        userId: currentUserId,
      });

      await tx.orm.public.ConversationParticipant.create({
        conversationId: conv.id,
        userId: recipientId,
      });

      return conv;
    });

    const { password: _p, ...safeRecipient } = recipient;
    const conversationData = {
      ...newConversation,
      recipient: safeRecipient,
    };

    // Real-time notify the recipient of the new conversation
    try {
      const sender = await db.orm.public.User.first({ id: currentUserId });
      const { password: _sp, ...safeSender } = sender!;

      getIO()
        .to(`user:${recipientId}`)
        .emit("new_conversation", {
          ...newConversation,
          recipient: safeSender,
        });
    } catch (err) {
      console.warn("Socket notification warning:", err);
    }

    return conversationData;
  }

  async getConversationByRecipient(
    currentUserId: string,
    recipientUsername: string,
  ) {
    const cleanUsername = recipientUsername.replace(/^@/, "").trim();

    if (!cleanUsername) {
      throw new AppError("Recipient username is required", 400);
    }

    const recipient = await db.orm.public.User.first({
      username: cleanUsername,
    });

    if (!recipient) {
      throw new AppError("Recipient user not found", 404);
    }

    const recipientId = recipient.id;

    if (recipientId === currentUserId) {
      throw new AppError("Cannot converse with yourself", 400);
    }

    const myParticipations = await db.orm.public.ConversationParticipant.where({
      userId: currentUserId,
    }).all();

    for (const p of myParticipations) {
      const shared = await db.orm.public.ConversationParticipant.first({
        conversationId: p.conversationId,
        userId: recipientId,
      });

      if (shared) {
        const existingConv = await db.orm.public.Conversation.first({
          id: p.conversationId,
        });
        if (!existingConv) continue;

        const otherParticipants =
          await db.orm.public.ConversationParticipant.where({
            conversationId: p.conversationId,
          })
            .where((cp) => cp.userId.neq(currentUserId))
            .all();

        const recipients = [];
        for (const op of otherParticipants) {
          const user = await db.orm.public.User.first({ id: op.userId });
          if (user) {
            const { password: _p, ...safe } = user;
            recipients.push(safe);
          }
        }

        const lastMessage = await db.orm.public.Message.where({
          conversationId: p.conversationId,
        })
          .orderBy((m) => m.createdAt.desc())
          .first();

        const { password: _p, ...safeRecipient } = recipient;

        return {
          ...existingConv,
          recipient: safeRecipient,
          participants: recipients,
          lastMessage,
        };
      }
    }

    throw new AppError("Conversation not found", 404);
  }

  async getUserConversations(userId: string) {
    const participations = await db.orm.public.ConversationParticipant.where({
      userId,
    }).all();

    const conversationList = [];

    for (const p of participations) {
      const conversation = await db.orm.public.Conversation.first({
        id: p.conversationId,
      });
      if (!conversation) continue;

      const otherParticipants =
        await db.orm.public.ConversationParticipant.where({
          conversationId: p.conversationId,
        })
          .where((cp) => cp.userId.neq(userId))
          .all();

      const recipients = [];
      for (const op of otherParticipants) {
        const user = await db.orm.public.User.first({ id: op.userId });
        if (user) {
          const { password: _p, ...safe } = user;
          recipients.push(safe);
        }
      }

      const lastMessage = await db.orm.public.Message.where({
        conversationId: p.conversationId,
      })
        .orderBy((m) => m.createdAt.desc())
        .first();

      conversationList.push({
        ...conversation,
        recipient: recipients[0] || null,
        participants: recipients,
        lastMessage,
      });
    }

    return conversationList.sort((a, b) => {
      const timeA = new Date(a.lastMessage?.createdAt || a.updatedAt).getTime();
      const timeB = new Date(b.lastMessage?.createdAt || b.updatedAt).getTime();
      return timeB - timeA;
    });
  }

  async getConversationById(conversationId: string, userId: string) {
    const isParticipant = await db.orm.public.ConversationParticipant.first({
      conversationId,
      userId,
    });

    if (!isParticipant) {
      throw new AppError("Conversation not found or access denied", 404);
    }

    const conversation = await db.orm.public.Conversation.first({
      id: conversationId,
    });
    if (!conversation) {
      throw new AppError("Conversation not found", 404);
    }

    const otherParticipants = await db.orm.public.ConversationParticipant.where(
      { conversationId },
    )
      .where((cp) => cp.userId.neq(userId))
      .all();

    const recipients = [];
    for (const op of otherParticipants) {
      const user = await db.orm.public.User.first({ id: op.userId });
      if (user) {
        const { password: _p, ...safe } = user;
        recipients.push(safe);
      }
    }

    return {
      ...conversation,
      recipient: recipients[0] || null,
      participants: recipients,
    };
  }

  async getMyContactsService(userId: string) {
    const conversations = await this.getUserConversations(userId);

    const contactsMap = new Map<string, SafeUser>();
    for (const c of conversations) {
      for (const participant of c.participants) {
        if (!contactsMap.has(participant.id)) {
          contactsMap.set(participant.id, participant);
        }
      }
    }

    return Array.from(contactsMap.values());
  }
}

export const conversationService = new ConversationService();
