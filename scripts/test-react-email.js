require("@babel/register");

const { default: mongoose } = require("mongoose");
const Alert = require("../models/database/Alert");
const Email = require("../utils/Email");

const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

(async () => {
  // Connect to database
  let dbUri = process.env.DATABASE_CONNECTION;
  dbUri = dbUri.replace("<DATABASE_USER>", process.env.DATABASE_USER);
  dbUri = dbUri.replace("<DATABASE_PASS>", process.env.DATABASE_PASS);
  await mongoose.connect(dbUri, { autoIndex: true });

  // Find alert
  const alert = await Alert.findOne();

  // Send email
  await new Email({
    to: "arianf2004@gmail.com",
    subject: `Alerts activated for YOU`,
    template: "alert-notify",
    data: { alert },
  }).send();

  console.log("Done!");
  process.exit();
})();
