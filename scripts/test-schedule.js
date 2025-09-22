require("@babel/register");

const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const { connectToDB } = require("../utils/helper-server");

const uoftScheduleController = require("../controllers/scheduleControllers/uoftScheduleController");

(async () => {
  await connectToDB();
  console.log("Database connection successful");

  await uoftScheduleController.task();

  process.exit();
})();
