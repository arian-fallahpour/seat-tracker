import "@babel/register";

import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import mongoose from "mongoose";
import AlertModel from "../models/AlertModel";
import Email from "../utils/app/Email";

(async () => {
  // Connect to database
  await mongoose.connect(process.env.MONGODB_URI, { autoIndex: true });

  // Find alert
  const alert = await AlertModel.findOne().populate("course");

  // Send email
  await new Email({
    to: "arianf2004@gmail.com",
    subject: "Alerts activated",
    template: "alert-activate",
    data: { course: alert.course, alert },
  }).send();

  console.log("Done!");
  process.exit();
})();
