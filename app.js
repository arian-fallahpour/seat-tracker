// const next = require("next");
const express = require("express");
const morgan = require("morgan");
const path = require("path");
// const { parse } = require("url");
const { createProxyMiddleware } = require("http-proxy-middleware");
// const next = require("next");

const errorHandler = require("./controllers/errorHandler");
const apiRouter = require("./routers/apiRouter");
const cors = require("cors");

const app = express();

app.use(cors());

// Next app initialization
// const dev = process.env.NODE_ENV !== "production";
// const nextApp = next({ dev });
// const handle = nextApp.getRequestHandler();

// nextApp.prepare().then(() => {
// console.log("[INFO] Next app prepared");

// Serving static files
app.use(express.static(path.join(__dirname, "public")));

// Development Logging
if (process.env.NODE_ENV === "development") {
  const morganOptions = {
    skip: (req) => req.url.startsWith("/_next") || req.url.startsWith("/__next"),
  };
  app.use(morgan("dev", morganOptions));
}

// Request body parsing
const bodySizeLimit = "10kb";
app.use(express.json({ limit: bodySizeLimit }));
app.use(express.urlencoded({ extended: true, limit: bodySizeLimit }));

// API routes
app.use("/api", apiRouter);

// app.use((req, res, next) => handle(req, res, parse(req.url, true)));

// Next.js proxy
const nextJsOptions = { target: "http://localhost:3000", changeOrigin: true };
app.use("/_next", createProxyMiddleware(nextJsOptions));
app.use("*", createProxyMiddleware(nextJsOptions));

// Global error handler
app.use(errorHandler);
// });

module.exports = app;
