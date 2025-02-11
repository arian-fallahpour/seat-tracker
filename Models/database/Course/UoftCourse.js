const { default: mongoose } = require("mongoose");
const Course = require("./Course");

const uoftCourseSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, "Please provide a section code."],
    minLength: [3, "Section code must be at least 3 characters long."],
    maxLength: [100, "Section code cannot be longer than 100 characters."],
  },
  term: {
    type: String,
    requirec: [true, "Please provide the term for this course."],
  },
});

/**
 * METHODS
 */

uoftCourseSchema.methods.updateCourse = async function () {};
uoftCourseSchema.methods.getSearchKey = function () {};

const UoftCourse = Course.discriminator("UoftCourse", uoftCourseSchema);

module.exports = UoftCourse;
