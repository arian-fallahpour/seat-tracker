const mongoose = require("mongoose");
const enums = require("../data/enums");

const courseSchema = new mongoose.Schema({
  school: {
    type: String,
    enum: enums.schools,
  },
  name: {
    type: String,
    required: [true, "Please provide a name for this course."],
    maxLength: [250, "Name cannot exceed 250 characters."],
    minLength: [3, "Name must be atleast 3 characters long."],
  },
  code: {
    type: String,
    required: [true, "Please provide a course code."],
    // unique: [true, "Course code must be unique."],
    minLength: [3, "Course code must be atleast 3 characters long."],
    maxLength: [50, "Course code cannot exceed 50 characters."],
  },
  campus: {
    type: String,
    required: [true, "Please provide a campus."],
    minLength: [3, "Campus must be atleast 3 characters long."],
    maxLength: [200, "Campus cannot exceed 50 characters."],
  },
  sections: {
    type: [mongoose.Schema.ObjectId],
  },
});

// Cannot have duplicate course with same code and campus
courseSchema.index({ code: 1, campus: 1 }, { unique: true });

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
