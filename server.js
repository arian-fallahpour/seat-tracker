require("@babel/register");

const dotenv = require("dotenv");
const mongoose = require("mongoose");

const Logger = require("./utils/Logger");
const scheduler = require("./controllers/scheduler");

process.on("uncaughtException", (err) => {
  console.error(`[ERROR] (Uncaught Exception) ${err.stack}`);
  process.exit(1);
});

// Config initialization
dotenv.config({ path: "./config.env" });

// App initialization
const app = require("./app");

// Server initialization
const port = process.env.PORT || 8080;
const server = app.listen(port, async () => {
  Logger.announce(`Running ${process.env.NODE_ENV} server on port ${port}`);

  // Database initialization
  let dbUri = process.env.DATABASE_CONNECTION;
  dbUri = dbUri.replace("<DATABASE_USER>", process.env.DATABASE_USER);
  dbUri = dbUri.replace("<DATABASE_PASS>", process.env.DATABASE_PASS);
  await mongoose.connect(dbUri, { autoIndex: true });
  Logger.announce(`Database connection successful`);

  // Scheduler initialization
  await scheduler.init();
});

process.on("unhandledRejection", (err) => {
  console.error(`[ERROR] (Unhandled Rejection)`);
  console.error(err);
  server.close(() => process.exit(1));
});
