const mongoose = require("mongoose");

const enums = require("../../../data/enums");

const sectionSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.ObjectId,
    ref: "Course",
    required: [true, "Please provide a course associated with the section."],
  },
  type: {
    type: String,
    required: [true, "Please provide a section type."],
    enum: {
      values: enums.section.type,
      message: "Please provide a valid section type.",
    },
  },
  number: {
    type: String,
    required: [true, "Please provide a section number."],
    maxLength: [50, "Section number cannot exceed 50 characters."],
  },
  campus: {
    type: String,
    required: [true, "Please provide a campus."],
    minLength: [3, "Campus must be atleast 3 characters long."],
    maxLength: [200, "Campus cannot exceed 50 characters."],
    validate: {
      validator: campusValidator,
      message: "Provided campus does not belong to school.",
    },
  },
  deliveryMode: {
    type: String,
    require: [true, "Please provide a delivery mode."],
    enum: {
      values: enums.section.deliveryMode,
      message: "Please provide a valid delivery mode.",
    },
  },
  lastUpdatedAt: {
    type: Date,
    default: new Date(Date.now()),
  },
});

function campusValidator(value) {
  return !this.__t || enums.section.campus[this.__t].includes(value);
}

/**
 * STATICS
 */

const Section = mongoose.model("Section", sectionSchema);

module.exports = Section;
