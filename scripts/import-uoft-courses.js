const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Section = require("../models/database/Section/Section");
const Course = require("../models/database/Course/Course");
const UoftAdapter = require("../models/api-adapters/UoftAdapter");
const UoftSection = require("../models/database/Section/UoftSection");

dotenv.config({ path: "./config.env" });

(async () => {
  // Connect to database
  let dbUri = process.env.DATABASE_CONNECTION;
  dbUri = dbUri.replace("<DATABASE_USER>", process.env.DATABASE_USER);
  dbUri = dbUri.replace("<DATABASE_PASS>", process.env.DATABASE_PASS);
  await mongoose.connect(dbUri, { autoIndex: true });

  // Run script
  if (process.argv[2] === "--import") {
    await importData();
  } else if (process.argv[2] === "--delete") {
    await deleteData();
  }
  process.exit();
})();

const importData = async () => {
  const limit = -1;
  let page = 0;
  while (page !== limit) {
    console.log(`Requestion UofT API page ${++page}`);

    // Fetch courses from school API
    const fetchedCourses = await UoftAdapter.getCourses({ page });
    if (fetchedCourses.length === 0) break;

    // Separate course and section data into parallel arrays
    const coursesData = fetchedCourses.map((course) => ({
      ...course,
      sections: [],
    }));
    const sectionsData = fetchedCourses.map((course) => course.sections);

    try {
      // Create new courses in parallel, skip import of courses that cause errors
      const courses = await Course.insertMany(coursesData, { ordered: false });

      // Add id to sections and flatten them
      const flattenedSectionsData = sectionsData
        .map((sections, i) =>
          sections.map((section) => ({
            ...section,
            course: courses[i]._id,
            courseIndex: i,
          }))
        )
        .flat();

      // Create new sections in parallel
      const sections = await UoftSection.insertMany(flattenedSectionsData);

      // Add section ids to sections of courses, and save in parallel
      sections.forEach((section, i) => {
        const index = flattenedSectionsData[i].courseIndex;
        courses[index].sections.push(section._id);
      });
      await Course.bulkSave(courses);
    } catch (err) {
      console.error(`Error: ${err.message}`);
    }
  }
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
