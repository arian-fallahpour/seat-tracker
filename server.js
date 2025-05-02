require("@babel/register"); // Required for importing of react components in nodejs

const dotenv = require("dotenv");
const next = require("next");
const mongoose = require("mongoose");
const Logger = require("./utils/Logger");
const { connectToDB } = require("./utils/helper-server");

// Env file initialization
dotenv.config({ path: "./config.env" });

// Next configuration
const nextApp = next({ dev: process.env.NODE_ENV === "development" });
const nextRequestHandler = nextApp.getRequestHandler();

(async () => {
  try {
    // Database initialization
    const dbUri = process.env.MONGODB_URI || process.env.AZURE_COSMOS_CONNECTIONSTRING;
    await mongoose.connect(dbUri, { autoIndex: true });
    Logger.announce("Database connection successful");

    // Handle uncaught exceptions
    process.on("uncaughtException", (error) => {
      Logger.error(`Uncaught Exception: ${error.message}`, { error });
      process.exit(1);
    });

    // Prepare NextJS app
    await nextApp.prepare();
    Logger.announce("Next app prepared");

    // Setup Express app
    const app = require("./app");
    app.get("/test", (req, res) => {
      console.log("<<ABCD>> LOG <<ABCD>>");
      console.error("<<ABCD>> ERROR <<ABCD>>");
      res.status(200).json("NICE");
    });

    // Server initialization
    const port = process.env.PORT || 8080;
    const server = app.listen(port, async () => {
      Logger.announce(`Running ${process.env.NODE_ENV} server on port ${port}`);

      const scheduleController = require("./controllers/scheduleController");
      await scheduleController.initialize();
    });

    // Handle NextJS routes
    app.get("*", (req, res) => nextRequestHandler(req, res));

    // Handle unhandled rejections
    process.on("unhandledRejection", (error) => {
      console.error(`Unhandled Rejection: ${error.message}`, { error });
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
})();
