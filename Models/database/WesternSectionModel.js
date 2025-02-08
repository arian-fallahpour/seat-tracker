const mongoose = require("mongoose");
const Section = require("./sectionModel");

const westernSectionSchema = new mongoose.Schema({
  class: {
    type: String,
    required: [true, "Please provide a section class number."],
    maxLength: [50, "Section class number cannot exceed 50 characters."],
  },
  isFull: {
    type: Boolean,
    required: [true, "Please indicate if section is full or not."],
    default: false,
  },
  hasWaitlist: {
    type: Boolean,
    required: [true, "Waitlist availabilty is required."],
    default: false,
  },
});

const WesternSection = Section.discriminator(
  "WesternSection",
  westernSectionSchema
);

module.exports = WesternSection;
