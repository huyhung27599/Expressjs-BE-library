import { Router } from "express";
import asyncHandler from "../helpers/asyncHandler";
import { validate } from "../middleware/validation";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
} from "../schemas/auth.schema";
import {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Public routes
router.post("/register", validate(registerSchema), asyncHandler(register));
router.post("/login", validate(loginSchema), asyncHandler(login));
router.post(
  "/refresh",
  validate(refreshTokenSchema),
  asyncHandler(refreshToken)
);

// Protected routes
router.post(
  "/logout",
  authenticate,
  validate(logoutSchema),
  asyncHandler(logout)
);
router.get("/profile", authenticate, asyncHandler(getProfile));

export default router;
