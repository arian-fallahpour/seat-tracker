const mongoose = require("mongoose");
const Course = require("./Course");
const UoftSection = require("../Section/UoftSection");
const UoftAdapter = require("../../api-adapters/UoftAdapter");
const { upsertCoursesAndSections, upsertCourses } = require("../../../utils/schema-utils");

const uoftCourseSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, "Please provide a section code."],
    minLength: [3, "Section code must be at least 3 characters long."],
    maxLength: [100, "Section code cannot be longer than 100 characters."],
  },
  term: {
    type: String,
    required: [true, "Please provide the term for this course."],
  },
});

uoftCourseSchema.index({ code: 1 }, { unique: true });

/**
 * STATICS
 */

uoftCourseSchema.statics.upsertCoursesAndSections = async function (coursesData) {
  return await upsertCoursesAndSections(this, UoftSection)(coursesData);
};

uoftCourseSchema.statics.upsertCourses = async function (coursesData) {
  return await upsertCourses(this)(coursesData);
};

/**
 * METHODS
 */

uoftCourseSchema.methods.getUpdatedCourse = async function (courseCache) {
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

const UoftCourse = Course.discriminator("UoftCourse", uoftCourseSchema);

module.exports = UoftCourse;
