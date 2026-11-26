import { Router } from "express";
import { getMessages, sendMessage } from "./message.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { getMessagesSchema, sendMessageSchema } from "./message.schema";
import { uploadChatMedia } from "../../middlewares/multer.middleware";

const router = Router();

router.use(authenticate);

router.get("/:conversationId", validate(getMessagesSchema), getMessages);
router.post(
  "/",
  uploadChatMedia.array("files", 5),
  validate(sendMessageSchema),
  sendMessage,
);

export default router;
