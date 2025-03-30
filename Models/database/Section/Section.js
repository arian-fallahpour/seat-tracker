import mongoose from "mongoose";

import enums from "../../../data/enums.js";

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
  },
  lastUpdatedAt: {
    type: Date,
    default: new Date(Date.now()),
  },
});

sectionSchema.index({ course: 1, type: 1, number: 1 }, { unique: true });

/**
 * STATICS
 */

const Section = mongoose.model("Section", sectionSchema);

export default Section;
