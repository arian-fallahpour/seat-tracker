const express = require("express");
const morgan = require("morgan");
const path = require("path");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");

const errorHandler = require("./controllers/errorHandler");
const apiRouter = require("./routers/apiRouter");
const webhookController = require("./controllers/webhookController");

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

module.exports = app;
