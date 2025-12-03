import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Author } from "../entities/Author.entity";
import { NotFoundError, BadRequestError } from "../core/ApiError";
import { SuccessResponse } from "../core/ApiResponse";

const authorRepository = AppDataSource.getRepository(Author);

/**
 * Get all authors (with pagination and filters)
 */
export const getAuthors = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { page = 1, limit = 10, search, isActive } = req.query;

  const queryBuilder = authorRepository.createQueryBuilder("author");

  // Apply filters
  if (isActive !== undefined) {
    queryBuilder.andWhere("author.isActive = :isActive", {
      isActive: isActive === "true",
    });
  }

  if (search) {
    queryBuilder.andWhere(
      "(author.name ILIKE :search OR author.bio ILIKE :search OR author.nationality ILIKE :search)",
      { search: `%${search}%` }
    );
  }

  // Pagination
  const skip = (Number(page) - 1) * Number(limit);
  queryBuilder.skip(skip).take(Number(limit));

  // Order by created date
  queryBuilder.orderBy("author.createdAt", "DESC");

  const [authors, total] = await queryBuilder.getManyAndCount();

  return new SuccessResponse("Authors retrieved successfully", {
    authors,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  }).send(res);
};

/**
 * Get author by ID
 */
export const getAuthorById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  const author = await authorRepository.findOne({
    where: { id },
  });

  if (!author) {
    throw new NotFoundError("Author not found");
  }

  return new SuccessResponse("Author retrieved successfully", author).send(res);
};

/**
 * Create new author
 */
export const createAuthor = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { name, bio, birthDate, nationality, isActive } = req.body;

  // Check if author already exists
  const existingAuthor = await authorRepository.findOne({
    where: { name },
  });

  if (existingAuthor) {
    throw new BadRequestError("Author with this name already exists");
  }

  // Create author
  const author = authorRepository.create({
    name,
    bio,
    birthDate: birthDate ? new Date(birthDate) : undefined,
    nationality,
    isActive: isActive !== undefined ? isActive : true,
  });

  await authorRepository.save(author);

  return new SuccessResponse("Author created successfully", author).send(res);
};

/**
 * Update author
 */
export const updateAuthor = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const { name, bio, birthDate, nationality, isActive } = req.body;

  // Check if author exists
  const author = await authorRepository.findOne({
    where: { id },
  });

  if (!author) {
    throw new NotFoundError("Author not found");
  }

  // Check if name is being changed and already exists
  if (name && name !== author.name) {
    const nameExists = await authorRepository.findOne({
      where: { name },
    });
    if (nameExists) {
      throw new BadRequestError("Author with this name already exists");
    }
  }

  // Update author
  if (name) author.name = name;
  if (bio !== undefined) author.bio = bio;
  if (birthDate !== undefined)
    author.birthDate = birthDate ? new Date(birthDate) : undefined;
  if (nationality !== undefined) author.nationality = nationality;
  if (isActive !== undefined) author.isActive = isActive;

  await authorRepository.save(author);

  return new SuccessResponse("Author updated successfully", author).send(res);
};

/**
 * Activate author (Admin only)
 */
export const activateAuthor = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  const author = await authorRepository.findOne({
    where: { id },
  });

  if (!author) {
    throw new NotFoundError("Author not found");
  }

  // Check if author is already active
  if (author.isActive) {
    throw new BadRequestError("Author is already active");
  }

  // Activate author
  author.isActive = true;
  await authorRepository.save(author);

  return new SuccessResponse("Author activated successfully", author).send(res);
};

/**
 * Deactivate author (Admin only)
 */
export const deactivateAuthor = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  const author = await authorRepository.findOne({
    where: { id },
  });

  if (!author) {
    throw new NotFoundError("Author not found");
  }

  // Check if author is already inactive
  if (!author.isActive) {
    throw new BadRequestError("Author is already inactive");
  }

  // Deactivate author
  author.isActive = false;
  await authorRepository.save(author);

  return new SuccessResponse("Author deactivated successfully", author).send(
    res
  );
};

/**
 * Delete author
 */
export const deleteAuthor = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  const author = await authorRepository.findOne({
    where: { id },
  });

  if (!author) {
    throw new NotFoundError("Author not found");
  }

  await authorRepository.remove(author);

  return new SuccessResponse("Author deleted successfully", {}).send(res);
};
