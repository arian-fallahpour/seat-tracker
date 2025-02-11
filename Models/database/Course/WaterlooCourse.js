const { default: mongoose } = require("mongoose");
const Course = require("./Course");

const waterlooCourseSchema = new mongoose.Schema({
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
  term: {
    type: String,
    requirec: [true, "Please provide the term for this course."],
  },
});

/**
 * METHODS
 */

waterlooCourseSchema.methods.updateCourse = async function () {};
waterlooCourseSchema.methods.getSearchKey = function () {};

const WaterlooCourse = Course.discriminator("WaterlooCourse", waterlooCourseSchema);

module.exports = WaterlooCourse;
