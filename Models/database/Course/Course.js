const mongoose = require("mongoose");
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
 * STATICS
 */

/**
 * METHODS
 */

const Course = mongoose.model("Course", courseSchema);
module.exports = Course;
