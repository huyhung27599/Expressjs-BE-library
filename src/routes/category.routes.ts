import { Router } from "express";
import asyncHandler from "../helpers/asyncHandler";
import { validate } from "../middleware/validation";
import {
  createCategorySchema,
  updateCategorySchema,
  getCategorySchema,
  deleteCategorySchema,
  getCategoriesSchema,
  activateCategorySchema,
  deactivateCategorySchema,
} from "../schemas/category.schema";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  activateCategory,
  deactivateCategory,
} from "../controllers/category.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { UserRole } from "../enums";

const router = Router();

// All category routes require authentication
router.use(authenticate);

// Get all categories (with filters and pagination)
router.get("/", validate(getCategoriesSchema), asyncHandler(getCategories));

// Get category by ID
router.get("/:id", validate(getCategorySchema), asyncHandler(getCategoryById));

// Create category (Admin only)
router.post(
  "/",
  authorize(UserRole.ADMIN),
  validate(createCategorySchema),
  asyncHandler(createCategory)
);

// Update category (Admin only)
router.put(
  "/:id",
  authorize(UserRole.ADMIN),
  validate(updateCategorySchema),
  asyncHandler(updateCategory)
);

// Activate category (Admin only)
router.patch(
  "/:id/activate",
  authorize(UserRole.ADMIN),
  validate(activateCategorySchema),
  asyncHandler(activateCategory)
);

// Deactivate category (Admin only)
router.patch(
  "/:id/deactivate",
  authorize(UserRole.ADMIN),
  validate(deactivateCategorySchema),
  asyncHandler(deactivateCategory)
);

// Delete category (Admin only)
router.delete(
  "/:id",
  authorize(UserRole.ADMIN),
  validate(deleteCategorySchema),
  asyncHandler(deleteCategory)
);

export default router;
