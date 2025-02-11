const { default: mongoose } = require("mongoose");
const Course = require("./Course");

const westernCourseSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: [true, "Please provide a subject."],
    minLength: [3, "Subject must be at least 3 characters long."],
    maxLength: [100, "Subject cannot be longer than 100 characters."],
  },
  number: {
    type: String,
    required: [true, "Please provide a subject nnumber."],
    maxLength: [100, "Subject number cannot be longer than 100 characters."],
  },
});

/**
 * METHODS
 */

westernCourseSchema.methods.updateCourse = async function () {};
westernCourseSchema.methods.getSearchKey = function () {};

const WesternCourse = Course.discriminator("WesternCourse", westernCourseSchema);

module.exports = WesternCourse;
