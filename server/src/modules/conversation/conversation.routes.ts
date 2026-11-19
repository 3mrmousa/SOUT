import { Router } from "express";
import {
  createConversation,
  getConversationByRecipient,
  getMyConversations,
  getConversationById,
  getMyContacts,
} from "./conversation.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  createConversationSchema,
  getConversationByRecipientSchema,
  getConversationByIdSchema,
} from "./conversation.schema";

const router = Router();

router.use(authenticate);

router.get("/", getMyConversations);
router.get("/contacts", getMyContacts);
router.get(
  "/recipient/:recipientUsername",
  validate(getConversationByRecipientSchema),
  getConversationByRecipient,
);
router.post(
  "/",
  validate(createConversationSchema),
  createConversation,
);
router.get("/:id", validate(getConversationByIdSchema), getConversationById);

export default router;
