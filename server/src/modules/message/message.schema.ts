import { z } from "zod";

export const getMessagesSchema = z.object({
  params: z.object({
    conversationId: z.string().uuid("Invalid conversation ID format"),
  }),
  query: z.object({
    limit: z.string().regex(/^\d+$/).optional(),
    before: z.string().optional(),
  }),
});

export const sendMessageSchema = z.object({
  body: z.object({
    conversationId: z.string().uuid("Invalid conversation ID format"),
    recipientId: z.string().uuid("Invalid recipient ID format"),
    content: z.string().trim().optional(),
  }),
});

export type GetMessagesParams = z.infer<typeof getMessagesSchema>["params"];
export type GetMessagesQuery = z.infer<typeof getMessagesSchema>["query"];
export type SendMessageInput = z.infer<typeof sendMessageSchema>["body"];
