const express = require("express");
const morgan = require("morgan");
const path = require("path");
const cors = require("cors");

const errorHandler = require("./controllers/errorHandler");
const apiRouter = require("./routers/apiRouter");
const webhookController = require("./controllers/webhookController");

// TODO
/**
 * TODO LIST
 * - Determine how to handle failed operations when processing alerts
 * - Determine how to run course requests in parallel
 * - Determine how to keep course data updated efficiently when no alert is set on it
 * - Enable/disable creation of alerts based on enrollment timing
 * - Add responsive styling
 * - Authentication
 * - Coupons
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

// Global error handler
app.use(errorHandler);

module.exports = app;
