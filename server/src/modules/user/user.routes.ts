import { Router } from "express";
import {
  searchUsers,
  getUserProfile,
  updateProfile,
  updateProfileImage,
  removeProfileImage,
  checkUsername,
  changeUsername,
  changePassword,
  changeEmailRequest,
  verifyCurrentMail,
  changeEmail,
} from "./user.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { upload } from "../../middlewares/multer.middleware.js";
import {
  searchUserSchema,
  getUserByIdSchema,
  updateProfileSchema,
  checkUsernameSchema,
  changeUsernameSchema,
  changePasswordSchema,
  changeEmailRequestSchema,
  verifyCurrentMailSchema,
  changeEmailSchema,
} from "./user.schema.js";

const router = Router();

router.get("/check-username", validate(checkUsernameSchema), checkUsername);

router.use(authenticate);

router.get("/search", validate(searchUserSchema), searchUsers);

// Profile data updates (name, bio only)
router.patch("/profile", validate(updateProfileSchema), updateProfile);

// Profile image routes
router.patch("/profile/image", upload.single("image"), updateProfileImage);
router.delete("/profile/image", removeProfileImage);

// Username routes
router.patch(
  "/profile/username",
  validate(changeUsernameSchema),
  changeUsername,
);

// Password routes
router.patch(
  "/profile/password",
  validate(changePasswordSchema),
  changePassword,
);

// Email change routes
router.post(
  "/profile/email/request",
  validate(changeEmailRequestSchema),
  changeEmailRequest,
);
router.post(
  "/profile/email/verify-current",
  validate(verifyCurrentMailSchema),
  verifyCurrentMail,
);
router.post(
  "/profile/email/change",
  validate(changeEmailSchema),
  changeEmail,
);

// Get user by id (must be at the end so it doesn't collide with static routes)
router.get("/:id", validate(getUserByIdSchema), getUserProfile);

export default router;

