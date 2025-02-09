const dotenv = require("dotenv");
const mongoose = require("mongoose");

process.on("uncaughtException", (err) => {
  console.error(`[ERROR] (Uncaught Exception) ${err.stack}`);
  process.exit(1);
});

// Config initialization
dotenv.config({ path: "./config.env" });

// App initialization
const app = require("./app");

// Database initialization
let dbUri = process.env.DATABASE_CONNECTION;
dbUri = dbUri.replace("<DATABASE_USER>", process.env.DATABASE_USER);
dbUri = dbUri.replace("<DATABASE_PASS>", process.env.DATABASE_PASS);
mongoose
  .connect(dbUri, { autoIndex: true })
  .then(() => console.log("[INFO] Database connection successful"));

// Server initialization
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`[INFO] App running on port ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log(`[ERROR] (Unhandled Rejection) ${err.stack}`);
  server.close(() => process.exit(1));
});
