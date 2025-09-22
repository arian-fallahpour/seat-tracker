require("@babel/register");

const mongoose = require("mongoose");
const AlertModel = require("../models/AlertModel");
const Email = require("../utils/app/Email");

const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

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
