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
  const email = await new Email()
    .toEmail("arianf2004@gmail.com")
    .withSubject(`Alerts activated for YOU`)
    .withTemplate("alert-notify", { alert });
  await email.send();

  console.log("Done!");
  process.exit();
})();
