import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import { connectToDB } from "../utils/helper-server";
import UoftAdapter from "../utils/Uoft/UoftAdapter";

(async () => {
  // Connect to database
  await connectToDB();
  console.log("Database connection successful");

  // Run script
  await UoftAdapter.fetchCourses({});

  process.exit();
})();
