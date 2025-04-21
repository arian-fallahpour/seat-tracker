require("@babel/register");

const mongoose = require("mongoose");
const Alert = require("../models/database/Alert");
const Course = require("../models/database/Course/Course");
const Section = require("../models/database/Section/Section");

const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

(async () => {
  // Connect to database
  let dbUri = process.env.DATABASE_CONNECTION;
  dbUri = dbUri.replace("<DATABASE_USER>", process.env.DATABASE_USER);
  dbUri = dbUri.replace("<DATABASE_PASS>", process.env.DATABASE_PASS);
  await mongoose.connect(dbUri, { autoIndex: true });

  const alerts = await Alert.findAlertable();

  const groupedAlertsByCode = Alert.groupByCode(alerts);
  const courseCodes = Object.keys(groupedAlertsByCode);

  const courses = await Course.find({ code: { $in: courseCodes } });
  const courseIds = courses.map((c) => c.id);

  const sections = await Section.find({ course: { $in: courseIds } });

  for (const section of sections) {
    section.seatsTaken = section.seatsAvailable;
    await section.save();
  }

  process.exit();
})();
