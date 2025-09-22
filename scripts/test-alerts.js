require("@babel/register");

const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const { connectToDB } = require("../utils/helper-server");

const AlertModel = require("../models/AlertModel");

(async () => {
  // Connect to database
  await connectToDB();
  console.log("Database connection successful");

  await AlertModel.updateMany(
    { createdAt: { $lt: new Date(Date.now() - 1000 * 60 * 60 * 10) } },
    { status: "active" }
  );

  process.exit();
})();
