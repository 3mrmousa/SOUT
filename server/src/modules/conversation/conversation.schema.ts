import { z } from "zod";

export const createConversationSchema = z.object({
  body: z.object({
    recipientUsername: z
      .string()
      .min(1, "Recipient username is required")
      .trim(),
  }),
});

export const getConversationByRecipientSchema = z.object({
  params: z.object({
    recipientUsername: z
      .string()
      .min(1, "Recipient username is required")
      .trim(),
  }),
});

export const getConversationByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid conversation ID format"),
  }),
});

export type CreateConversationInput = z.infer<
  typeof createConversationSchema
>["body"];
export type GetConversationByRecipientParams = z.infer<
  typeof getConversationByRecipientSchema
>["params"];
export type GetConversationByIdParams = z.infer<
  typeof getConversationByIdSchema
>["params"];
