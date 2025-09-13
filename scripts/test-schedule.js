require("@babel/register");

const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const { connectToDB } = require("../utils/helper-server");

const scheduleController = require("../controllers/scheduleController");

(async () => {
  // Connect to database
  await connectToDB();
  console.log("Database connection successful");

  await scheduleController.scheduleAlerts();

  process.exit();
})();
