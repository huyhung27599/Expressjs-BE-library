import { Router } from "express";
import asyncHandler from "../helpers/asyncHandler";
import { validate } from "../middleware/validation";
import {
  createAuthorSchema,
  updateAuthorSchema,
  getAuthorSchema,
  deleteAuthorSchema,
  getAuthorsSchema,
  activateAuthorSchema,
  deactivateAuthorSchema,
} from "../schemas/author.schema";
import {
  getAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
  activateAuthor,
  deactivateAuthor,
} from "../controllers/author.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { UserRole } from "../enums";

const router = Router();

// All author routes require authentication
router.use(authenticate);

// Get all authors (with filters and pagination)
router.get("/", validate(getAuthorsSchema), asyncHandler(getAuthors));

// Get author by ID
router.get("/:id", validate(getAuthorSchema), asyncHandler(getAuthorById));

// Create author (Admin only)
router.post(
  "/",
  authorize(UserRole.ADMIN),
  validate(createAuthorSchema),
  asyncHandler(createAuthor)
);

// Update author (Admin only)
router.put(
  "/:id",
  authorize(UserRole.ADMIN),
  validate(updateAuthorSchema),
  asyncHandler(updateAuthor)
);

// Activate author (Admin only)
router.patch(
  "/:id/activate",
  authorize(UserRole.ADMIN),
  validate(activateAuthorSchema),
  asyncHandler(activateAuthor)
);

// Deactivate author (Admin only)
router.patch(
  "/:id/deactivate",
  authorize(UserRole.ADMIN),
  validate(deactivateAuthorSchema),
  asyncHandler(deactivateAuthor)
);

// Delete author (Admin only)
router.delete(
  "/:id",
  authorize(UserRole.ADMIN),
  validate(deleteAuthorSchema),
  asyncHandler(deleteAuthor)
);

export default router;
