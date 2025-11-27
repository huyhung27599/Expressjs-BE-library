import { Router } from "express";

const router = Router();

// Example route
router.get("/", (req, res) => {
  res.json({ message: "Welcome to Express.js API" });
});

export default router;
