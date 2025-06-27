/**
 * USED DURING PRODUCTION
 *
 * This script fetches all of the uoft courses based on the year and season
 * and upserts them into the database
 *
 * e.g. node scripts/import-uoft-courses.js --season=fall-winter --year=2025 --upsert=100
 *      The only seasons are fall-winter and summer
 *      The year is the year of the fall semester, e.g. 2025 for fall-winter 2025
 *      Upsert is the number of courses to upsert at a time, default is 500
 */

const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const args = require("args-parser")(process.argv);

const SectionModel = require("../models/Section/SectionModel");
const CourseModel = require("../models/Course/CourseModel");
const UoftAdapter = require("../utils/Uoft/UoftAdapter");
const UoftCourseModel = require("../models/Course/UoftCourseModel");
const { connectToDB } = require("../utils/helper-server");

(async () => {
  // Connect to database
  await connectToDB();
  console.log("Database connection successful");

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

  const season = args.season;
  const year = args.year;
  const limit = args.limit || -1;
  const upsert = args.upsert || 500;
  let maxSkips = args.skips || 5;

  let page = 0;
  let skips = 0;
  while (page != limit) {
    if (skips >= maxSkips) {
      console.log(`[INFO] Skipped ${maxSkips} pages, stopping import`);
      break;
    }

    console.log(`[INFO] Requesting UofT API (page: ${++page})`);

    // Fetch courses from school API
    const fetchedCourses = await UoftAdapter.fetchCourses({ page, season, year });
    if (fetchedCourses.length === 0) skips++;
    else skips = 0;

    updatedCourses.push(...fetchedCourses);
  }

  // Upsert courses and sections
  let i = 0;
  while (i < updatedCourses.length) {
    const max = Math.min(i + upsert, updatedCourses.length);

    console.log(`[INFO] Upserting courses ${i + 1} to ${max}`);
    await UoftCourseModel.upsertCoursesAndSections(updatedCourses.slice(i, max));
    i += upsert;
  }
};

const deleteData = async () => {
  try {
    await CourseModel.deleteMany();
    await SectionModel.deleteMany();
    console.log("Deleted all courses and sections");
  } catch (err) {
    console.error(`Deletion failed: ${err.message}`);
  }
};
