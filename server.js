require("@babel/register"); // Required for importing of react components in nodejs

const dotenv = require("dotenv");
const next = require("next");

process.on("uncaughtException", (err) => {
  console.error(`[ERROR] (Uncaught Exception) ${err.stack}`);
  process.exit(1);
});

// Env file initialization
dotenv.config({ path: "./config.env" });

const port = process.env.PORT || 3000;
const nextApp = next({ dev: process.env.NODE_ENV !== "production" });
const nextRequestHandler = nextApp.getRequestHandler();

let server;
nextApp.prepare().then(() => {
  const Logger = require("./utils/Logger");
  const scheduler = require("./controllers/scheduler");
  const { connectToDB } = require("./utils/helper-server");

  const app = require("./app");

  // Custom route
  app.get("/custom", (req, res) => {
    return res.send("This is a custom route");
  });

  server = app.listen(port, async (err) => {
    if (err) throw err;
    Logger.announce(`Running ${process.env.NODE_ENV} server on port ${port}`);

    // Database initialization
    await connectToDB();

    // Scheduler initialization
    await scheduler.init();
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
