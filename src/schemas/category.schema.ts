import { z } from "zod";

export const createCategorySchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, "Name is required")
      .max(255, "Name must be at most 255 characters"),
    description: z.string().optional(),
    isActive: z.boolean().optional().default(true),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, "Name is required")
      .max(255, "Name must be at most 255 characters")
      .optional(),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().uuid("Invalid category ID format"),
  }),
});

export const getCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid category ID format"),
  }),
});

export const deleteCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid category ID format"),
  }),
});

export const activateCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid category ID format"),
  }),
});

export const deactivateCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid category ID format"),
  }),
});

export const getCategoriesSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional().default("1"),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default("10"),
    search: z.string().optional(),
    isActive: z.string().optional(),
  }),
});
