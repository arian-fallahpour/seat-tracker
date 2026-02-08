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
 *
 *
 *  If there are inconcsistencies with alert references,
 *  use test-alerts.js to reimport courses and sections from a JSON file
 *  in a rate limited manner to not overflow the database
 */

import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import UoftAdapter from "@/utils/Uoft/UoftAdapter";
import { connectToDB } from "../utils/helper-server";
import CourseModel from "@/models/CourseModel";
import { upsertCoursesAndSections } from "@/utils/app/schema-utils";
import SectionModel from "@/models/SectionModel";

await connectToDB();

const updatedCourses = [];

const maxSkips = 5;
const maxPage = -1;

let currentSkips = 0;
let page = 1;

while (maxPage < 0 || page <= maxPage) {
  const course = await UoftAdapter.fetch({ page, season: "fall-winter", method: "api" }); // TODO: change to lambda
  if (course.length === 0) {
    if (currentSkips >= maxSkips) {
      break;
    } else {
      currentSkips++;
      page++;
      continue;
    }
  }
  console.log(
    `Fetched courses ${updatedCourses.length + 1} to ${updatedCourses.length + course.length}`,
  );

  const nullNumberedSectionCourses = course.filter((c) =>
    c.sections.some((s) => s.number === null || s.number === undefined),
  );
  console.log(nullNumberedSectionCourses);

  updatedCourses.push(...course);

  page++;
  currentSkips = 0;
}

await upsertCoursesAndSections(updatedCourses);
console.log("Finished upserting courses and sections");

process.exit(0);
