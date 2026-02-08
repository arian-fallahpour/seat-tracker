import express from "express";
import morgan from "morgan";
import path from "path";
import rateLimit from "express-rate-limit";

import errorHandler from "./controllers/errorHandler";
import apiRouter from "./routers/apiRouter";
import * as webhookController from "./controllers/webhookController";

const app = express();

// Serving static files
app.use(express.static(path.join(process.cwd(), "public")));

// Development Logging
if (process.env.NODE_ENV === "development") {
  const morganOptions = {
    skip: (req) => req.url.startsWith("/_next") || req.url.startsWith("/__next"),
  };
  app.use(morgan("dev", morganOptions));
}

// Webhooks (Apparently does not need protections)
app.post("/webhooks", express.raw({ type: "application/json" }), webhookController.handleWebhooks);

// Limit requests from same person
const limiter = rateLimit({
  max: 45,
  windowMs: 60 * 1000, // 1 min
  message: { status: 429, message: "Too many requests sent, please try again in a bit!" },
});
app.use("/api", limiter);

// Request body parsing
const bodySizeLimit = "10kb";
app.use(express.json({ limit: bodySizeLimit }));
app.use(express.urlencoded({ extended: true, limit: bodySizeLimit }));

// API routes
app.use("/api/v1", apiRouter);

// Global error handler
app.use(errorHandler);

export default app;
