import { Request, Response } from "express";

// import "@babel/register"; // Required for importing of react components in nodejs

import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import next from "next";
import { parse } from "url";
import mongoose from "mongoose";

import Logger from "./utils/Logger";
import app from "./app";

import * as scheduleController from "@/controllers/scheduleControllers/scheduleController";

// Next configuration
const nextApp = next({ dev: process.env.NODE_ENV === "development" });
const nextRequestHandler = nextApp.getRequestHandler();

try {
  // Database initialization
  const dbUri = process.env.MONGODB_URI || process.env.AZURE_COSMOS_CONNECTIONSTRING;
  await mongoose.connect(dbUri, { autoIndex: true });
  Logger.info("Database connection successful");

  // Handle uncaught exceptions
  process.on("uncaughtException", (error: Error) => {
    Logger.error(`Uncaught Exception: ${error.message}`, { error });
    process.exit(1);
  });

  // Prepare NextJS app
  await nextApp.prepare();
  Logger.info("Next app prepared");

  // Server initialization
  const port = process.env.PORT || 8080;
  const server = app.listen(port, async () => {
    Logger.info(`Running ${process.env.NODE_ENV} server on port ${port}`);

    await scheduleController.initialize();
  });

  // Handle NextJS routes
  app.get(/.*/, (req: Request, res: Response) =>
    nextRequestHandler(req, res, parse(req.url, true)),
  );

  // Handle unhandled rejections
  process.on("unhandledRejection", (error: Error) => {
    Logger.error(`Unhandled Rejection: ${error.message}`, { error });
    server.close(() => process.exit(1));
  });

  // Handle SIGTERM
  process.on("SIGTERM", () => {
    console.log("SIGTERM Received. Shutting down gracefully");
    server.close(() => {
      console.log("Process terminated");
    });
  });
} catch (error) {
  console.error("Startup failed:", error);
  process.exit(1);
}
