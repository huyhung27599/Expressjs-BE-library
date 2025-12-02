import { Router } from "express";
import asyncHandler from "../helpers/asyncHandler";
import { validate } from "../middleware/validation";
import {
  createUserSchema,
  updateUserSchema,
  getUserSchema,
  deleteUserSchema,
  getUsersSchema,
  activateUserSchema,
} from "../schemas/user.schema";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  activateUser,
} from "../controllers/user.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { UserRole } from "../enums";

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Get all users (with filters and pagination)
router.get("/", validate(getUsersSchema), asyncHandler(getUsers));

// Get user by ID
router.get("/:id", validate(getUserSchema), asyncHandler(getUserById));

// Create user (Admin only)
router.post(
  "/",
  authorize(UserRole.ADMIN),
  validate(createUserSchema),
  asyncHandler(createUser)
);

// Update user (Users can update themselves, Admins can update anyone)
router.put("/:id", validate(updateUserSchema), asyncHandler(updateUser));

// Activate user (Admin only)
router.patch(
  "/:id/activate",
  authorize(UserRole.ADMIN),
  validate(activateUserSchema),
  asyncHandler(activateUser)
);

// Delete user (Admin only)
router.delete(
  "/:id",
  authorize(UserRole.ADMIN),
  validate(deleteUserSchema),
  asyncHandler(deleteUser)
);

export default router;
