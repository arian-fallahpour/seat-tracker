const express = require("express");
const morgan = require("morgan");
const path = require("path");
// const cors = require("cors");

const errorHandler = require("./controllers/errorHandler");
const apiRouter = require("./routers/apiRouter");
const webhookController = require("./controllers/webhookController");

// TODO: App
/**
 * TODO LIST
 * - complete testing of app
 * - Add security packages like helmet, rate limiter, etc...
 * - fix unit testing (removed bc not mocking Email)
 * - fix errors (determine what to do when they occur, when email fails, we don't get a console error)
 *
 * DONE (double check at the end of development):
 * - Use cosmodb database instead of dev database
 * - Add lectures and practicals (or other)
 * - Determine how to handle failed operations when processing alerts (Rehaul logging)
 * - Remove alert paused status (maybe) and create another field instead
 * - Restrict alert creation only for enrollable terms (April 19, 2025 version) --> need to automatically de-activate alerts when enrollment ends
 * - Create start-of-term schedules
 * - Review process.env.production and refactor for test server
 * - Determine how to keep course data updated efficiently when no alert is set on it --> Update coursedata after activation
 * - Authentication? no auth, just use compass
 * - Enable/disable creation of alerts based on enrollment timing
 * - IMPORTANT: Refactor so that most operations are done in the scheduler controller (rn its too messy)
 * - Determine how to run course requests in parallel
 */

const app = express();

// app.use(cors());

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
