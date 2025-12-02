import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { User } from "../entities/User.entity";
import { RefreshToken } from "../entities/RefreshToken.entity";
import {
  hashPassword,
  comparePassword,
  validatePasswordStrength,
} from "../utils/password.util";
import {
  generateTokenPair,
  verifyRefreshToken,
  TokenPayload,
} from "../utils/jwt.util";
import {
  AuthFailureError,
  BadRequestError,
  InternalError,
  BadTokenError,
} from "../core/ApiError";
import { SuccessResponse, TokenRefreshResponse } from "../core/ApiResponse";
import { UserStatus, UserRole } from "../enums";
import { jwtConfig } from "../config/config";

const userRepository = AppDataSource.getRepository(User);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);

/**
 * Register a new user
 */
export const register = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { username, email, password, fullName, phoneNumber, role } = req.body;

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

  // Validate password strength
  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.isValid) {
    throw new BadRequestError(passwordValidation.errors.join(", "));
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
    status: UserStatus.ACTIVE,
    isActive: true,
  });

  await userRepository.save(user);

  // Generate tokens
  const tokenPayload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const { accessToken, refreshToken } = generateTokenPair(tokenPayload);

  // Save refresh token
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  const refreshTokenEntity = refreshTokenRepository.create({
    token: refreshToken,
    userId: user.id,
    expiresAt,
    isRevoked: false,
  });

  await refreshTokenRepository.save(refreshTokenEntity);

  // Remove password from response
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

  return new SuccessResponse("User registered successfully", {
    user: userResponse,
    accessToken,
    refreshToken,
  }).send(res);
};

/**
 * Login user
 */
export const login = async (req: Request, res: Response): Promise<Response> => {
  const { email, password } = req.body;

  // Find user with password (select: false by default)
  const user = await userRepository
    .createQueryBuilder("user")
    .addSelect("user.password")
    .where("user.email = :email", { email })
    .getOne();

  if (!user) {
    throw new AuthFailureError("Invalid email or password");
  }

  // Check if user is active
  if (!user.isActive || user.status !== UserStatus.ACTIVE) {
    throw new AuthFailureError("Account is inactive or suspended");
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new AuthFailureError("Invalid email or password");
  }

  // Generate tokens
  const tokenPayload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const { accessToken, refreshToken } = generateTokenPair(tokenPayload);

  // Save refresh token
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  const refreshTokenEntity = refreshTokenRepository.create({
    token: refreshToken,
    userId: user.id,
    expiresAt,
    isRevoked: false,
  });

  await refreshTokenRepository.save(refreshTokenEntity);

  // Remove password from response
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

  return new SuccessResponse("Login successful", {
    user: userResponse,
    accessToken,
    refreshToken,
  }).send(res);
};

/**
 * Refresh access token
 */
export const refreshToken = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { refreshToken: token } = req.body;

  if (!token) {
    throw new BadRequestError("Refresh token is required");
  }

  // Verify refresh token
  let payload: TokenPayload;
  try {
    payload = verifyRefreshToken(token);
  } catch (error) {
    throw new BadTokenError("Invalid or expired refresh token");
  }

  // Check if refresh token exists in database and is not revoked
  const refreshTokenEntity = await refreshTokenRepository.findOne({
    where: { token, userId: payload.userId },
  });

  if (!refreshTokenEntity || refreshTokenEntity.isRevoked) {
    throw new BadTokenError("Refresh token not found or revoked");
  }

  // Check if token is expired
  if (refreshTokenEntity.expiresAt < new Date()) {
    // Mark as revoked
    refreshTokenEntity.isRevoked = true;
    await refreshTokenRepository.save(refreshTokenEntity);
    throw new BadTokenError("Refresh token has expired");
  }

  // Get user to ensure they still exist and are active
  const user = await userRepository.findOne({
    where: { id: payload.userId },
  });

  if (!user || !user.isActive || user.status !== UserStatus.ACTIVE) {
    throw new AuthFailureError("User not found or inactive");
  }

  // Generate new token pair
  const newTokenPayload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const { accessToken, refreshToken: newRefreshToken } =
    generateTokenPair(newTokenPayload);

  // Revoke old refresh token
  refreshTokenEntity.isRevoked = true;
  await refreshTokenRepository.save(refreshTokenEntity);

  // Save new refresh token
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  const newRefreshTokenEntity = refreshTokenRepository.create({
    token: newRefreshToken,
    userId: user.id,
    expiresAt,
    isRevoked: false,
  });

  await refreshTokenRepository.save(newRefreshTokenEntity);

  return new TokenRefreshResponse(
    "Token refreshed successfully",
    accessToken,
    newRefreshToken
  ).send(res);
};

/**
 * Logout user
 */
export const logout = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { refreshToken: token } = req.body;
  const userId = req.user?.userId;

  if (token) {
    // Revoke specific refresh token
    const refreshTokenEntity = await refreshTokenRepository.findOne({
      where: { token },
    });

    if (refreshTokenEntity) {
      refreshTokenEntity.isRevoked = true;
      await refreshTokenRepository.save(refreshTokenEntity);
    }
  } else if (userId) {
    // Revoke all refresh tokens for user
    await refreshTokenRepository.update(
      { userId, isRevoked: false },
      { isRevoked: true }
    );
  }

  return new SuccessResponse("Logout successful", {}).send(res);
};

/**
 * Get current user profile
 */
export const getProfile = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (!req.user) {
    throw new AuthFailureError("Authentication required");
  }

  const user = await userRepository.findOne({
    where: { id: req.user.userId },
  });

  if (!user) {
    throw new AuthFailureError("User not found");
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

  return new SuccessResponse(
    "Profile retrieved successfully",
    userResponse
  ).send(res);
};
