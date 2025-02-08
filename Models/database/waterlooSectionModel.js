const mongoose = require("mongoose");
const { validateSeatsTaken } = require("../../utils/validators");
const Section = require("./sectionModel");

const waterlooSectionSchema = new mongoose.Schema({
  seatsTaken: {
    type: Number,
    required: [true, "Seats taken is required."],
    default: 0,
    min: [0, "Seats taken cannot be a negative number."],
    validator: {
      validate: validateSeatsTaken,
      message: "Seats taken must be less than or equal to seats available.",
    },
  },
  seatsAvailable: {
    type: Number,
    min: [0, "Seats available cannot be a negative number."],
    required: [true, "Seats available is required."],
    default: 0,
  },
  waitlist: {
    type: Number,
    required: [true, "Waitlist count is required."],
    default: 0,
    min: [0, "Waitlist count cannot be a negative number."],
  },
});

const WaterlooSection = Section.discriminator(
  "WaterlooSection",
  waterlooSectionSchema
);

module.exports = WaterlooSection;
