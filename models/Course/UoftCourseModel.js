const mongoose = require("mongoose");
const slugify = require("slugify");

const CourseModel = require("./CourseModel");
const UoftSection = require("../Section/UoftSectionModel");
const enums = require("../../data/enums");
const TermModel = require("./TermModel");
const {
  upsertCoursesAndSections,
  upsertCourses,
  setLastUpdatedAt,
} = require("../../utils/app/schema-utils");

const uoftCourseSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Please provide a section code."],
      minLength: [3, "Section code must be at least 3 characters long."],
      maxLength: [100, "Section code cannot be longer than 100 characters."],
    },
    campus: {
      type: String,
      required: [true, "Please provide a campus."],
      enum: {
        values: enums.course.campus.UoftSection,
        message: "Please provide a valid campus",
      },
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

uoftCourseSchema.index({ code: 1 }, { unique: true });

uoftCourseSchema.pre("save", function (next) {
  if (!this.slug || this.isNew || this.isModified("code")) {
    this.slug = slugify(this.code, { lower: true });
  }
  next();
});

uoftCourseSchema.pre("save", setLastUpdatedAt);

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
  const enrollableSeasons = TermModel.getEnrollableSeasons();

  return this.find({
    $or: [{ code: regex }, { name: regex }],
    "term.season": { $in: enrollableSeasons },
  });
};

/**
 * METHODS
 */

uoftCourseSchema.methods.isEnrollable = function () {
  return TermModel.getEnrollableSeasons().includes(this.term.season);
};

const UoftCourseModel =
  mongoose.models?.UoftCourse || CourseModel.discriminator("UoftCourse", uoftCourseSchema);
module.exports = UoftCourseModel;
