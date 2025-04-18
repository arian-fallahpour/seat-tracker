const mongoose = require("mongoose");
const dotenv = require("dotenv");
const args = require("args-parser")(process.argv);

const Section = require("../models/database/Section/Section");
const Course = require("../models/database/Course/Course");
const UoftAdapter = require("../models/api-adapters/UoftAdapter");
const UoftCourseModel = require("../models/database/Course/UoftCourseModel");

dotenv.config({ path: "./config.env" });

(async () => {
  // Connect to database
  let dbUri = process.env.DATABASE_CONNECTION;
  dbUri = dbUri.replace("<DATABASE_USER>", process.env.DATABASE_USER);
  dbUri = dbUri.replace("<DATABASE_PASS>", process.env.DATABASE_PASS);
  await mongoose.connect(dbUri, { autoIndex: true });

  // Run script
  if (args.delete === "--delete") {
    await deleteData();
  } else {
    await importData();
  }
  process.exit();
})();

const importData = async () => {
  const updatedCourses = [];

  let page = 0;
  const limit = args.limit || -1;
  while (page != limit) {
    console.log(`[INFO] Requesting UofT API (page: ${++page})`);

    // Fetch courses from school API
    const fetchedCourses = await UoftAdapter.fetchCourses({ page });
    if (fetchedCourses.length === 0) break;

    updatedCourses.push(...fetchedCourses);
  }

  // Upsert courses and sections
  await UoftCourseModel.upsertCoursesAndSections(updatedCourses);
};

const deleteData = async () => {
  try {
    await CourseModel.deleteMany();
    await Section.deleteMany();
    console.log("Deleted all courses and sections");
  } catch (err) {
    console.error(`Deletion failed: ${err.message}`);
  }
};
