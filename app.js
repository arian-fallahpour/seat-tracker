const next = require("next");
const express = require("express");
const morgan = require("morgan");
const path = require("path");

const AppError = require("./utils/AppError");
const errorHandler = require("./controllers/errorHandler");

const alertRouter = require("./routers/alertRouter");
const orderRouter = require("./routers/orderRouter");
const courseRouter = require("./routers/courseRouter");
const sectionRouter = require("./routers/sectionRouter");

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });

nextApp.prepare();
console.log("[INFO] Next app prepared");

const app = express();

// Serving static files
app.use(express.static(path.join(__dirname, "public")));

// Development Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Request body parsing
const bodySizeLimit = "10kb";
app.use(express.json({ limit: bodySizeLimit }));
app.use(express.urlencoded({ extended: true, limit: bodySizeLimit }));

// Schedule controller

// API routes
app.use("/api/alerts", alertRouter);
app.use("/api/orders", orderRouter);
app.use("/api/courses", courseRouter);
app.use("/api/sections", sectionRouter);

// Route not found
app.all("*", (req, res, next) => {
  return next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(errorHandler);

module.exports = app;
