import { z } from "zod";

export const createAuthorSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, "Name is required")
      .max(255, "Name must be at most 255 characters"),
    bio: z.string().optional(),
    birthDate: z.string().date("Invalid date format").optional(),
    nationality: z
      .string()
      .max(100, "Nationality must be at most 100 characters")
      .optional(),
    isActive: z.boolean().optional().default(true),
  }),
});

export const updateAuthorSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, "Name is required")
      .max(255, "Name must be at most 255 characters")
      .optional(),
    bio: z.string().optional(),
    birthDate: z.string().date("Invalid date format").optional(),
    nationality: z
      .string()
      .max(100, "Nationality must be at most 100 characters")
      .optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().uuid("Invalid author ID format"),
  }),
});

export const getAuthorSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid author ID format"),
  }),
});

export const deleteAuthorSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid author ID format"),
  }),
});

export const activateAuthorSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid author ID format"),
  }),
});

export const deactivateAuthorSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid author ID format"),
  }),
});

export const getAuthorsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional().default("1"),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default("10"),
    search: z.string().optional(),
    isActive: z.string().optional(),
  }),
});
