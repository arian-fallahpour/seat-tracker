require("@babel/register"); // Required for importing of react components in nodejs

const dotenv = require("dotenv");
const next = require("next");
const mongoose = require("mongoose");

process.on("uncaughtException", (err) => {
  console.error(`[ERROR] (Uncaught Exception) ${err.stack}`);
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

  // Database initialization
  let dbUri = process.env.DATABASE_CONNECTION;
  dbUri = dbUri.replace("<DATABASE_USER>", process.env.DATABASE_USER);
  dbUri = dbUri.replace("<DATABASE_PASS>", process.env.DATABASE_PASS);
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

process.on("unhandledRejection", (err) => {
  console.error(`[ERROR] (Unhandled Rejection)`);
  console.error(err);
  server.close(() => process.exit(1));
});
