const mongoose = require("mongoose");
const enums = require("../../data/enums");

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

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
