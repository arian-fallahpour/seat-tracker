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
  const app = require("./app");

  server = app.listen(port, async () => {
    Logger.announce(`Running ${process.env.NODE_ENV} server on port ${port}`);

    const scheduleController = require("./controllers/scheduleController");
    const Logger = require("./utils/Logger");

    // Database initialization
    let dbUri = process.env.DATABASE_CONNECTION;
    dbUri = dbUri.replace("<DATABASE_USER>", process.env.DATABASE_USER);
    dbUri = dbUri.replace("<DATABASE_PASS>", process.env.DATABASE_PASS);
    await mongoose.connect(dbUri, { autoIndex: true });
    Logger.announce(`Database connection successful`);
    // .catch((error) => Logger.error(`Could not connect to database: ${error.message}`));

    // Schedule controller intialization
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
  Logger.announce("SIGTERM Received. Shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
  });
});
