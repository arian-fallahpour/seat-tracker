require("@babel/register"); // Required for importing of react components in nodejs

const dotenv = require("dotenv");
const next = require("next");
const mongoose = require("mongoose");
const Logger = require("./utils/Logger");

process.on("uncaughtException", (error) => {
  Logger.error(`Uncaught Exception: ${error.message}`, { error });
  process.exit(1);
});

// Env file initialization
dotenv.config({ path: "./config.env" });

const port = process.env.PORT || 3000;
const nextApp = next({ dev: process.env.NODE_ENV === "development" });
const nextRequestHandler = nextApp.getRequestHandler();

let server;
nextApp.prepare().then(() => {
  const Logger = require("./utils/Logger");

  const app = require("./app");

  app.use("port", port);

  // Database initialization
  const dbUri = process.env.AZURE_COSMOS_CONNECTIONSTRING || process.env.MONGODB_URI;
  mongoose
    .connect(dbUri, { autoIndex: true })
    .then(() => Logger.announce(`Database connection successful`));

  server = app.listen(port, async () => {
    const scheduleController = require("./controllers/scheduleController");

    Logger.announce(`Running ${process.env.NODE_ENV} server on port ${port}`);

    await scheduleController.initialize();
  });

  // Next.js routes
  app.get("*", (req, res) => {
    return nextRequestHandler(req, res);
  });
});

process.on("unhandledRejection", (error) => {
  Logger.error(`Unhandled Rejection: ${error.message}`, { error });
  server.close(() => process.exit(1));
});

process.on("SIGTERM", () => {
  Logger.log("SIGTERM Received. Shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
  });
});
