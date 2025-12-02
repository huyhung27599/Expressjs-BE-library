import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { User } from "../entities/User.entity";
import { hashPassword } from "../utils/password.util";
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from "../core/ApiError";
import { SuccessResponse } from "../core/ApiResponse";
import { UserRole, UserStatus } from "../enums";

const userRepository = AppDataSource.getRepository(User);

/**
 * Get all users (with pagination and filters)
 */
export const getUsers = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { page = 1, limit = 10, role, status, search } = req.query;

  const queryBuilder = userRepository.createQueryBuilder("user");

  // Apply filters
  if (role) {
    queryBuilder.andWhere("user.role = :role", { role });
  }

  if (status) {
    queryBuilder.andWhere("user.status = :status", { status });
  }

  if (search) {
    queryBuilder.andWhere(
      "(user.username ILIKE :search OR user.email ILIKE :search OR user.fullName ILIKE :search)",
      { search: `%${search}%` }
    );
  }

  // Pagination
  const skip = (Number(page) - 1) * Number(limit);
  queryBuilder.skip(skip).take(Number(limit));

  // Order by created date
  queryBuilder.orderBy("user.createdAt", "DESC");

  const [users, total] = await queryBuilder.getManyAndCount();

  // Remove passwords from response
  const usersResponse = users.map((user) => ({
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    phoneNumber: user.phoneNumber,
    role: user.role,
    status: user.status,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }));

  return new SuccessResponse("Users retrieved successfully", {
    users: usersResponse,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  }).send(res);
};

/**
 * Get user by ID
 */
export const getUserById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  const user = await userRepository.findOne({
    where: { id },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const userResponse = {
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    phoneNumber: user.phoneNumber,
    role: user.role,
    status: user.status,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  return new SuccessResponse("User retrieved successfully", userResponse).send(
    res
  );
};

/**
 * Create new user (Admin only)
 */
export const createUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { username, email, password, fullName, phoneNumber, role, status } =
    req.body;

  // Check if user already exists
  const existingUser = await userRepository.findOne({
    where: [{ email }, { username }],
  });

  if (existingUser) {
    if (existingUser.email === email) {
      throw new BadRequestError("Email already registered");
    }
    if (existingUser.username === username) {
      throw new BadRequestError("Username already taken");
    }
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = userRepository.create({
    username,
    email,
    password: hashedPassword,
    fullName,
    phoneNumber,
    role: role || UserRole.USER,
    status: status || UserStatus.PENDING,
    isActive: false,
  });

  await userRepository.save(user);

  const userResponse = {
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    phoneNumber: user.phoneNumber,
    role: user.role,
    status: user.status,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };

  return new SuccessResponse("User created successfully", userResponse).send(
    res
  );
};

/**
 * Update user
 */
export const updateUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const updateData = req.body;
  const currentUser = req.user;

  // Check if user exists
  const user = await userRepository.findOne({
    where: { id },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Check permissions: users can only update themselves, admins can update anyone
  if (currentUser?.role !== UserRole.ADMIN && currentUser?.userId !== id) {
    throw new ForbiddenError("You can only update your own profile");
  }

  // Prevent role changes unless admin
  if (updateData.role && currentUser?.role !== UserRole.ADMIN) {
    delete updateData.role;
  }

  // Check if email/username is being changed and already exists
  if (updateData.email && updateData.email !== user.email) {
    const emailExists = await userRepository.findOne({
      where: { email: updateData.email },
    });
    if (emailExists) {
      throw new BadRequestError("Email already registered");
    }
  }

  if (updateData.username && updateData.username !== user.username) {
    const usernameExists = await userRepository.findOne({
      where: { username: updateData.username },
    });
    if (usernameExists) {
      throw new BadRequestError("Username already taken");
    }
  }

  // Update user
  Object.assign(user, updateData);
  await userRepository.save(user);

  const userResponse = {
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    phoneNumber: user.phoneNumber,
    role: user.role,
    status: user.status,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  return new SuccessResponse("User updated successfully", userResponse).send(
    res
  );
};

/**
 * Activate user (Admin only)
 */
export const activateUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  const user = await userRepository.findOne({
    where: { id },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Check if user is already active
  if (user.isActive && user.status === UserStatus.ACTIVE) {
    throw new BadRequestError("User is already active");
  }

  // Activate user
  user.status = UserStatus.ACTIVE;
  user.isActive = true;
  await userRepository.save(user);

  const userResponse = {
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    phoneNumber: user.phoneNumber,
    role: user.role,
    status: user.status,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  return new SuccessResponse("User activated successfully", userResponse).send(
    res
  );
};

/**
 * Delete user (Admin only)
 */
export const deleteUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const currentUser = req.user;

  // Prevent self-deletion
  if (currentUser?.userId === id) {
    throw new BadRequestError("You cannot delete your own account");
  }

  const user = await userRepository.findOne({
    where: { id },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  await userRepository.remove(user);

  return new SuccessResponse("User deleted successfully", {}).send(res);
};
