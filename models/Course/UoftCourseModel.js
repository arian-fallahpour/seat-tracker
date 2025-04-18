const mongoose = require("mongoose");
const slugify = require("slugify");

const CourseModel = require("./CourseModel");
const UoftSection = require("../Section/UoftSectionModel");
const { upsertCoursesAndSections, upsertCourses } = require("../../utils/app/schema-utils");

const uoftCourseSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, "Please provide a section code."],
    minLength: [3, "Section code must be at least 3 characters long."],
    maxLength: [100, "Section code cannot be longer than 100 characters."],
  },
});

uoftCourseSchema.index({ code: 1 }, { unique: true });

uoftCourseSchema.pre("save", function (next) {
  if (!this.slug || this.isNew || this.isModified("code")) {
    this.slug = slugify(this.code, { lower: true });
  }
  next();
});

/**
 * STATICS
 */

uoftCourseSchema.statics.upsertCoursesAndSections = async function (coursesData) {
  return await upsertCoursesAndSections(this, UoftSection)(coursesData);
};

uoftCourseSchema.statics.upsertCourses = async function (coursesData) {
  return await upsertCourses(this)(coursesData);
};

uoftCourseSchema.statics.search = function (query) {
  const regex = new RegExp(`^${query}`, "gi");
  return this.find({ $or: [{ code: regex }, { name: regex }] });
};

/**
 * METHODS
 */

const UoftCourseModel =
  mongoose.models?.UoftCourse || CourseModel.discriminator("UoftCourse", uoftCourseSchema);
module.exports = UoftCourseModel;
