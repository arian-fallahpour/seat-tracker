const express = require("express");
const morgan = require("morgan");
const path = require("path");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const { xss } = require("express-xss-sanitizer");
const hpp = require("hpp");

const errorHandler = require("./controllers/errorHandler");
const apiRouter = require("./routers/apiRouter");
const webhookController = require("./controllers/webhookController");

// TODO: App
/**
 * TODO LIST
 * - Add feedback button
 * - complete testing of app
 * - fix unit testing (removed bc not mocking Email)
 * - fix errors (determine what to do when they occur, when email fails, we don't get a console error)
 * - Find a way to reduce artical zip size
 *
 * DONE (double check at the end of development):
 * - Add security packages like helmet, rate limiter, etc...
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

// Serving static files
app.use(express.static(path.join(__dirname, "public")));

// Development Logging
if (process.env.NODE_ENV === "development") {
  const morganOptions = {
    skip: (req) => req.url.startsWith("/_next") || req.url.startsWith("/__next"),
  };
  app.use(morgan("dev", morganOptions));
}

// Webhooks (Apparently does not need protections)
app.post("/webhooks", express.raw({ type: "application/json" }), webhookController.handleWebhooks);

// Set security HTTP headers
// TODO: add back in a way that doesn't throw errors
// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       useDefaults: true,
//       directives: { scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"] },
//     },
//   })
// );

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

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// API routes
app.use("/api", apiRouter);

// Global error handler
app.use(errorHandler);

module.exports = app;
