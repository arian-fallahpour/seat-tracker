const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.ObjectId,
    required: [true, "Please provide a course associated with the section."],
  },
  type: {
    type: String,
    required: [true, "Please provide a section type."],
    // enum: {
    //   values: enums.section.type,
    //   message: "Please provide a valid section type.",
    // },
  },
  number: {
    type: String,
    required: [true, "Please provide a section number."],
    maxLength: [50, "Section number cannot exceed 50 characters."],
  },
});

const Section = mongoose.model("Section", sectionSchema);

module.exports = Section;
