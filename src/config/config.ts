import dotenv from "dotenv";

dotenv.config();

export const environment = process.env.NODE_ENV || "development";
export const port = process.env.PORT || 3000;
export const corsUrl = process.env.CORS_URL;

// JWT Configuration
export const jwtConfig = {
  accessTokenSecret:
    process.env.JWT_ACCESS_TOKEN_SECRET ||
    "your-access-token-secret-change-in-production",
  refreshTokenSecret:
    process.env.JWT_REFRESH_TOKEN_SECRET ||
    "your-refresh-token-secret-change-in-production",
  accessTokenExpiration: (process.env.JWT_ACCESS_TOKEN_EXPIRATION ||
    "15m") as string, // 15 minutes
  refreshTokenExpiration: (process.env.JWT_REFRESH_TOKEN_EXPIRATION ||
    "7d") as string, // 7 days
};

// Password Configuration
export const passwordConfig = {
  saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || "12", 10),
};
