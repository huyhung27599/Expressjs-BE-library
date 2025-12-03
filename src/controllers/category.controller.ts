import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Category } from "../entities/Category.entity";
import { NotFoundError, BadRequestError } from "../core/ApiError";
import { SuccessResponse } from "../core/ApiResponse";

const categoryRepository = AppDataSource.getRepository(Category);

/**
 * Get all categories (with pagination and filters)
 */
export const getCategories = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { page = 1, limit = 10, search, isActive } = req.query;

  const queryBuilder = categoryRepository.createQueryBuilder("category");

  // Apply filters
  if (isActive !== undefined) {
    queryBuilder.andWhere("category.isActive = :isActive", {
      isActive: isActive === "true",
    });
  }

  if (search) {
    queryBuilder.andWhere(
      "(category.name ILIKE :search OR category.description ILIKE :search)",
      { search: `%${search}%` }
    );
  }

  // Pagination
  const skip = (Number(page) - 1) * Number(limit);
  queryBuilder.skip(skip).take(Number(limit));

  // Order by created date
  queryBuilder.orderBy("category.createdAt", "DESC");

  const [categories, total] = await queryBuilder.getManyAndCount();

  return new SuccessResponse("Categories retrieved successfully", {
    categories,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  }).send(res);
};

/**
 * Get category by ID
 */
export const getCategoryById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  const category = await categoryRepository.findOne({
    where: { id },
  });

  if (!category) {
    throw new NotFoundError("Category not found");
  }

  return new SuccessResponse("Category retrieved successfully", category).send(
    res
  );
};

/**
 * Create new category
 */
export const createCategory = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { name, description, isActive } = req.body;

  // Check if category already exists
  const existingCategory = await categoryRepository.findOne({
    where: { name },
  });

  if (existingCategory) {
    throw new BadRequestError("Category with this name already exists");
  }

  // Create category
  const category = categoryRepository.create({
    name,
    description,
    isActive: isActive !== undefined ? isActive : true,
  });

  await categoryRepository.save(category);

  return new SuccessResponse("Category created successfully", category).send(
    res
  );
};

/**
 * Update category
 */
export const updateCategory = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const { name, description, isActive } = req.body;

  // Check if category exists
  const category = await categoryRepository.findOne({
    where: { id },
  });

  if (!category) {
    throw new NotFoundError("Category not found");
  }

  // Check if name is being changed and already exists
  if (name && name !== category.name) {
    const nameExists = await categoryRepository.findOne({
      where: { name },
    });
    if (nameExists) {
      throw new BadRequestError("Category with this name already exists");
    }
  }

  // Update category
  if (name) category.name = name;
  if (description !== undefined) category.description = description;
  if (isActive !== undefined) category.isActive = isActive;

  await categoryRepository.save(category);

  return new SuccessResponse("Category updated successfully", category).send(
    res
  );
};

/**
 * Activate category (Admin only)
 */
export const activateCategory = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  const category = await categoryRepository.findOne({
    where: { id },
  });

  if (!category) {
    throw new NotFoundError("Category not found");
  }

  // Check if category is already active
  if (category.isActive) {
    throw new BadRequestError("Category is already active");
  }

  // Activate category
  category.isActive = true;
  await categoryRepository.save(category);

  return new SuccessResponse("Category activated successfully", category).send(
    res
  );
};

/**
 * Deactivate category (Admin only)
 */
export const deactivateCategory = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  const category = await categoryRepository.findOne({
    where: { id },
  });

  if (!category) {
    throw new NotFoundError("Category not found");
  }

  // Check if category is already inactive
  if (!category.isActive) {
    throw new BadRequestError("Category is already inactive");
  }

  // Deactivate category
  category.isActive = false;
  await categoryRepository.save(category);

  return new SuccessResponse(
    "Category deactivated successfully",
    category
  ).send(res);
};

/**
 * Delete category
 */
export const deleteCategory = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  const category = await categoryRepository.findOne({
    where: { id },
  });

  if (!category) {
    throw new NotFoundError("Category not found");
  }

  await categoryRepository.remove(category);

  return new SuccessResponse("Category deleted successfully", {}).send(res);
};
