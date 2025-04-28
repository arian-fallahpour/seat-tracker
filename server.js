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

// Next configuration
const port = Number(process.env.PORT) || 8080;
const nextApp = next({ dev: process.env.NODE_ENV === "development" });
const nextRequestHandler = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
  const app = require("./app");

  app.get("/test", (req, res) => {
    console.log("<<ABCD>> LOG <<ABCD>>");
    console.error("<<ABCD>> ERROR <<ABCD>>");
    Logger.log("<<ABCD>> LOG 2 <<ABCD>>");
    Logger.info("<<ABCD>> info <<ABCD>>");
    Logger.announce("<<ABCD>> announce <<ABCD>>");
    Logger.error("<<ABCD>> error <<ABCD>>");
    Logger.warn("<<ABCD>> warn <<ABCD>>");
    res.status(200).json("NICE");
  });

  // Database initialization
  const dbUri = process.env.AZURE_COSMOS_CONNECTIONSTRING || process.env.MONGODB_URI;
  console.log(dbUri, process.env.NODE_ENV === "production");
  mongoose
    .connect(dbUri, { autoIndex: true })
    .then(() => Logger.announce(`Database connection successful`))
    .catch((error) => Logger.error(`Database connection unsuccessful: ${error.message}`));

  // Server initialization
  const server = app.listen(port, async () => {
    Logger.announce(`Running ${process.env.NODE_ENV} server on port ${port}`);

    const scheduleController = require("./controllers/scheduleController");
    await scheduleController.initialize();
  });

  // Next.js routes
  app.get("*", (req, res) => nextRequestHandler(req, res));

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
});
