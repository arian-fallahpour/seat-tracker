import mongoose from "mongoose";
import dotenv from "dotenv";

import args from "args-parser";
args(process.argv);

import Section from "../models/database/Section/Section.js";
import Course from "../models/database/Course/Course.js";
import UoftAdapter from "../models/api-adapters/UoftAdapter.js";
import UoftCourse from "../models/database/Course/UoftCourse.js";

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
  await UoftCourse.upsertCoursesAndSections(updatedCourses);
};

const deleteData = async () => {
  try {
    await Course.deleteMany();
    await Section.deleteMany();
    console.log("Deleted all courses and sections");
  } catch (err) {
    console.error(`Deletion failed: ${err.message}`);
  }
};
