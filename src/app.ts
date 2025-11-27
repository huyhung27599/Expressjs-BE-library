import "reflect-metadata";
import express from "express";
import dotenv from "dotenv";
import routes from "./routes";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", routes);

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

export default app;
