import "@babel/register";

import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import { connectToDB } from "../utils/helper-server";
import UoftAlertSchedule from "@/controllers/scheduleControllers/UoftAlertSchedule";

(async () => {
  await connectToDB();

  await UoftAlertSchedule.run();

  process.exit();
})();
