import "reflect-metadata";
import express, { ErrorRequestHandler } from "express";
import dotenv from "dotenv";
import routes from "./routes";
import { ApiError, InternalError, NotFoundError } from "./core/ApiError";
import { environment } from "./config/config";

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

// catch 404 and forward to error handler
app.use((req, res, next) => next(new NotFoundError()));

// Middleware Error Handler
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    ApiError.handle(err, res);
  } else {
    if (environment === "development") {
      res.status(500).send(err);
    }
    ApiError.handle(new InternalError(), res);
  }
};

app.use(errorHandler);

export default app;
