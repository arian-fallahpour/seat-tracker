const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Section = require("../Models/database/sectionModel");
const Course = require("../Models/database/courseModel");
const UoftAdapter = require("../Models/api-adapters/UoftAdapter");
const UoftSection = require("../Models/database/uoftSectionModel");

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
  const limit = 1;
  let page = 0;
  while (page !== limit) {
    console.log(`Requestion UofT API page ${++page}`);

    // Fetch courses from school API
    const fetchedCourses = await UoftAdapter.getCourses({ page });
    if (fetchedCourses.length === 0) break;

    const coursesData = [];
    let sectionsData = [];
    for (let i = 0; i < fetchedCourses.length; i++) {
      const fetchedCourse = fetchedCourses[i];

      // Check if campus is valid
      const campus = convertCampus(fetchedCourse.campus);
      if (campus === null) continue;

      console.log(
        `Importing course: ${fetchedCourse.code}, ${fetchedCourse.name}, ${campus}`
      );

      coursesData.push({ ...fetchedCourse, sections: [] });
      sectionsData.push(fetchedCourse.sections);
    }

    try {
      const courses = await Course.insertMany(coursesData);

      // Add id to sections and flatten them
      sectionsData = sectionsData
        .map((ss, i) => ss.map((s) => ({ ...s, course: courses[i]._id })))
        .flat();

      const sections = await UoftSection.insertMany(sectionsData);

      // Add section ids to sections of courses
      sections.forEach((section) => {
        const i = courses.findIndex((c) => c._id === section.course);
        courses[i].sections.push(section._id);
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

function convertCampus(campus) {
  return (
    {
      Scarborough: "Scarborough",
      "University of Toronto at Mississauga": "Mississauga",
      "St. George": "St. George",
    }[campus] || null
  );
}
