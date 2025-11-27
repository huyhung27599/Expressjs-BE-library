import "reflect-metadata";
import express, { ErrorRequestHandler } from "express";
import cors from "cors";
import routes from "./routes";
import { ApiError, InternalError, NotFoundError } from "./core/ApiError";
import { corsUrl, environment } from "./config/config";

const app = express();

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(
  express.urlencoded({ limit: "10mb", extended: true, parameterLimit: 50000 })
);
app.use(cors({ origin: corsUrl, optionsSuccessStatus: 200 }));

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
