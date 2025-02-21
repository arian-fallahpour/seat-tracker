const mongoose = require("mongoose");
const Course = require("./Course");

const waterlooCourseSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, "Please provide a section code."],
    minLength: [3, "Section code must be at least 3 characters long."],
    maxLength: [100, "Section code cannot be longer than 100 characters."],
  },
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

waterlooCourseSchema.index({ subject: 1, number: 1, term: 1 }, { unique: true });

/**
 * STATICS
 */

waterlooCourseSchema.statics.search = async function (query) {
  const regex = new RegExp(`^${query}`, "gi");
  return this.find({ $or: [{ code: regex }, { name: regex }] });
};

/**
 * METHODS
 */

waterlooCourseSchema.methods.getSearchKey = function () {};

const WaterlooCourse = Course.discriminator("WaterlooCourse", waterlooCourseSchema);

module.exports = WaterlooCourse;
