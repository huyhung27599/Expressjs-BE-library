import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import authorRoutes from "./author.routes";
import categoryRoutes from "./category.routes";

const router = Router();

// Health check
router.get("/", (req, res) => {
  res.json({ message: "Welcome to Express.js API" });
});

// API routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/authors", authorRoutes);
router.use("/categories", categoryRoutes);

export default router;
