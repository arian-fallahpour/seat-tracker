require("@babel/register");

const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const { connectToDB } = require("../utils/helper-server");

const uoftScheduleController = require("../controllers/scheduleControllers/uoftScheduleController");

(async () => {
  await connectToDB();
  console.log("Database connection successful");

  await uoftScheduleController.task();

  await new Promise((resolve) => setTimeout(resolve, 5000));

  process.exit();
})();
