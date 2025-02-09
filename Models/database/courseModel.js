const mongoose = require("mongoose");
const enums = require("../../data/enums");
const UoftAdapter = require("../api-adapters/UoftAdapter");

const courseSchema = new mongoose.Schema({
  school: {
    type: String,
    enum: {
      values: enums.schools,
      message: "Please provide a valid school.",
    },
  },
  code: {
    type: String,
    required: [true, "Please provide a course code."],
    unique: [true, "Course code must be unique"],
    maxLength: [50, "Course code cannot exceed 50 characters."],
  },
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

courseSchema.index({ code: 1 });

courseSchema.statics.updateCourses = async function (updatedCourses) {
  updatedCourses.forEach(async (updatedCourse) => {
    console.log(`Updating ${updatedCourse.code}`);
  });
};

// TODO: Hardcoded with Uoft API at the moment, may need to create subschemas
courseSchema.methods.getUpdatedCourse = async function (courseCache) {
  const alreadyCachedUpdatedCourse = courseCache instanceof Map && courseCache.has(this.code);
  if (alreadyCachedUpdatedCourse) {
    return courseCache.get(this.code);
  }

  const adapterOptions = { query: this.code };
  const fetchedCourses = await UoftAdapter.getCourses(adapterOptions);

  let updatedCourse = null;
  fetchedCourses.forEach((fetchedCourse) => {
    if (fetchedCourse.code === this.code) {
      updatedCourse = fetchedCourse;
    }

    const notAlreadyFetchedCourse = courseCache instanceof Map && !courseCache.has(fetchedCourse.code);
    if (notAlreadyFetchedCourse) {
      courseCache.set(fetchedCourse.code, fetchedCourse);
    }
  });

  return updatedCourse;
};

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
