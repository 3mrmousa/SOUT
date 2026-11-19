import { Router } from "express";
import {
  register,
  verifyRegister,
  login,
  requestForgotPassword,
  verifyForgotPassword,
  resetPassword,
  refreshAccessToken,
  logout,
  logoutAll,
  getMe,
} from "./auth.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  registerSchema,
  verifyRegisterSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyForgotPasswordSchema,
  resetPasswordSchema,
} from "./auth.schema.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

// Registration routes
router.post("/register/request", validate(registerSchema), register);
router.post(
  "/register/verify",
  validate(verifyRegisterSchema),
  verifyRegister,
);

// Login & Session routes
router.post("/login", validate(loginSchema), login);
router.post("/refresh", refreshAccessToken);
router.post("/logout", logout);
router.post("/logout-all", authenticate, logoutAll);

// Forgot Password routes
router.post(
  "/password/forgot",
  validate(forgotPasswordSchema),
  requestForgotPassword,
);
router.post(
  "/password/forgot/verify",
  validate(verifyForgotPasswordSchema),
  verifyForgotPassword,
);
router.post(
  "/password/reset",
  validate(resetPasswordSchema),
  resetPassword,
);

// Authenticated user route
router.get("/me", authenticate, getMe);

export default router;
