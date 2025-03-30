import express from "express";
import morgan from "morgan";
import path from "path";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";

import errorHandler from "./controllers/errorHandler.js";
import apiRouter from "./routers/apiRouter.js";
import * as webhookController from "./controllers/webhookController.js";
import { __dirname } from "./utils/helper-server.js";

/**
 * TODO LIST
 * - Determine how to handle failed operations when processing alerts
 * - Determine how to keep course data updated efficiently when no alert is set on it
 */

const app = express();

app.use(cors());

// Serving static files
app.use(express.static(path.join(__dirname, "public")));

// Development Logging
if (process.env.NODE_ENV === "development") {
  const morganOptions = {
    skip: (req) => req.url.startsWith("/_next") || req.url.startsWith("/__next"),
  };
  app.use(morgan("dev", morganOptions));
}

// Webhooks
app.post("/webhooks", express.raw({ type: "application/json" }), webhookController.handleWebhooks);

// Request body parsing
const bodySizeLimit = "10kb";
app.use(express.json({ limit: bodySizeLimit }));
app.use(express.urlencoded({ extended: true, limit: bodySizeLimit }));

// API routes
app.use("/api", apiRouter);

// Next.js proxy
const nextJsOptions = {
  target: `http://localhost:${process.env.NEXT_PUBLIC_PORT}`,
  changeOrigin: true,
};
app.use("/_next", createProxyMiddleware(nextJsOptions));
app.use("*", createProxyMiddleware(nextJsOptions));

// Global error handler
app.use(errorHandler);

export default app;
