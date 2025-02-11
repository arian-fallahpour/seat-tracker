const mongoose = require("mongoose");
const enums = require("../../../data/enums");
const UoftAdapter = require("../../api-adapters/UoftAdapter");
const UoftSection = require("../Section/UoftSection");

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name for this course."],
    maxLength: [500, "Name cannot exceed 500 characters."],
    minLength: [3, "Name must be atleast 3 characters long."],
  },
  sections: {
    type: [mongoose.Schema.ObjectId],
    default: [],
    ref: "Section",
  },
  lastUpdatedAt: {
    type: Date,
    default: new Date(Date.now()),
  },
});

/**
 * INDEXES
 */

courseSchema.index({ code: 1 });

/**
 * STATICS
 */

courseSchema.statics.updateCoursesBulk = async function (updatedCourses) {
  const queries = [];
  for (const updatedCourse of updatedCourses) {
    const updatedSections = updatedCourse.sections;
    const query = UoftSection.updateSectionsBulk(updatedSections);
    queries.push(query);
  }
  await Promise.all(queries);
};

/**
 * METHODS
 */

// TODO: Hardcoded with Uoft API at the moment, may need to create subschemas
courseSchema.methods.getUpdatedCourse = async function (courseCache) {
  // If already cached, return cached course
  const alreadyCachedUpdatedCourse = courseCache instanceof Map && courseCache.has(this.code);
  if (alreadyCachedUpdatedCourse) {
    return courseCache.get(this.code);
  }

  // Fetch updated version of course (as well as other similar results)
  const adapterOptions = { search: this.code };
  const fetchedCourses = await UoftAdapter.getCourses(adapterOptions);

  // Find updated course from fetchedCourses, and add courses to cache
  let updatedCourse = null;
  fetchedCourses.forEach((fetchedCourse) => {
    if (fetchedCourse.code === this.code) {
      updatedCourse = fetchedCourse;
    }

    const notAlreadyFetchedCourse =
      courseCache instanceof Map && !courseCache.has(fetchedCourse.code);
    if (notAlreadyFetchedCourse) {
      courseCache.set(fetchedCourse.code, fetchedCourse);
    }
  });

  return updatedCourse;
};

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
