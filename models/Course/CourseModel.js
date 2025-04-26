const mongoose = require("mongoose");
const TermModel = require("./TermModel");

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
  term: {
    type: TermModel.schema,
    required: [true, "Please provide the term for this course."],
  },
  slug: String,
  lastUpdatedAt: {
    type: Date,
    default: new Date(Date.now()),
  },
});

courseSchema.index({ slug: 1 });

courseSchema.pre("save", function (next) {
  this.lastUpdatedAt = new Date(Date.now());
  next();
});

/**
 * STATICS
 */

/**
 * METHODS
 */

const CourseModel = mongoose.models?.Course || mongoose.model("Course", courseSchema);
module.exports = CourseModel;
