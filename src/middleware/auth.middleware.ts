import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, TokenPayload } from "../utils/jwt.util";
import { BadTokenError, TokenExpiredError } from "../core/ApiError";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Middleware to verify JWT access token
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new BadTokenError("No token provided");
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    try {
      const payload = verifyAccessToken(token);
      req.user = payload;
      next();
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        throw new TokenExpiredError("Token has expired");
      }
      throw new BadTokenError("Invalid token");
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user has required role
 */
export const authorize =
  (...roles: string[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new BadTokenError("Authentication required");
      }

      if (!roles.includes(req.user.role)) {
        throw new BadTokenError("Insufficient permissions");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
