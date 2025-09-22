const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

const args = require("args-parser")(process.argv);
const { connectToDB } = require("../utils/helper-server");
const UoftAdapter = require("../utils/Uoft/UoftAdapter");

(async () => {
  // Connect to database
  await connectToDB();
  console.log("Database connection successful");

  // Run script
  await UoftAdapter.fetchCourses({});

  process.exit();
})();
